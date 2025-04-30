var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __decorate = function(decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
  else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import * as cp from "child_process";
import { memoize } from "../../../base/common/decorators.js";
import { FileAccess } from "../../../base/common/network.js";
import * as path from "../../../base/common/path.js";
import * as env from "../../../base/common/platform.js";
import { sanitizeProcessEnvironment } from "../../../base/common/processes.js";
import * as pfs from "../../../base/node/pfs.js";
import * as processes from "../../../base/node/processes.js";
import * as nls from "../../../nls.js";
import { DEFAULT_TERMINAL_OSX } from "../common/externalTerminal.js";
const TERMINAL_TITLE = nls.localize("console.title", "VS Code Console");
class ExternalTerminalService {
  static {
    __name(this, "ExternalTerminalService");
  }
  async getDefaultTerminalForPlatforms() {
    return {
      windows: WindowsExternalTerminalService.getDefaultTerminalWindows(),
      linux: await LinuxExternalTerminalService.getDefaultTerminalLinuxReady(),
      osx: "xterm"
    };
  }
}
class WindowsExternalTerminalService extends ExternalTerminalService {
  static {
    __name(this, "WindowsExternalTerminalService");
  }
  static {
    this.CMD = "cmd.exe";
  }
  openTerminal(configuration, cwd) {
    return this.spawnTerminal(cp, configuration, processes.getWindowsShell(), cwd);
  }
  spawnTerminal(spawner, configuration, command, cwd) {
    const exec = configuration.windowsExec || WindowsExternalTerminalService.getDefaultTerminalWindows();
    if (cwd && cwd[1] === ":") {
      cwd = cwd[0].toUpperCase() + cwd.substr(1);
    }
    const basename = path.basename(exec, ".exe").toLowerCase();
    if (basename === "cmder") {
      spawner.spawn(exec, cwd ? [cwd] : void 0);
      return Promise.resolve(void 0);
    }
    const cmdArgs = ["/c", "start", "/wait"];
    if (exec.indexOf(" ") >= 0) {
      cmdArgs.push(exec);
    }
    cmdArgs.push(exec);
    if (basename === "wt") {
      cmdArgs.push("-d .");
    }
    return new Promise((c, e) => {
      const env2 = getSanitizedEnvironment(process);
      const child = spawner.spawn(command, cmdArgs, { cwd, env: env2, detached: true });
      child.on("error", e);
      child.on("exit", () => c());
    });
  }
  async runInTerminal(title, dir, args, envVars, settings) {
    const exec = "windowsExec" in settings && settings.windowsExec ? settings.windowsExec : WindowsExternalTerminalService.getDefaultTerminalWindows();
    const wt = await WindowsExternalTerminalService.getWtExePath();
    return new Promise((resolve, reject) => {
      const title2 = `"${dir} - ${TERMINAL_TITLE}"`;
      const command = `"${args.join('" "')}" & pause`;
      const env2 = Object.assign({}, getSanitizedEnvironment(process), envVars);
      Object.keys(env2).filter((v) => env2[v] === null).forEach((key) => delete env2[key]);
      const options = {
        cwd: dir,
        env: env2,
        windowsVerbatimArguments: true
      };
      let spawnExec;
      let cmdArgs;
      if (path.basename(exec, ".exe") === "wt") {
        spawnExec = exec;
        cmdArgs = ["-d", ".", WindowsExternalTerminalService.CMD, "/c", command];
      } else if (wt) {
        spawnExec = wt;
        cmdArgs = ["-d", ".", exec, "/c", command];
      } else {
        spawnExec = WindowsExternalTerminalService.CMD;
        cmdArgs = ["/c", "start", title2, "/wait", exec, "/c", `"${command}"`];
      }
      const cmd = cp.spawn(spawnExec, cmdArgs, options);
      cmd.on("error", (err) => {
        reject(improveError(err));
      });
      resolve(void 0);
    });
  }
  static getDefaultTerminalWindows() {
    if (!WindowsExternalTerminalService._DEFAULT_TERMINAL_WINDOWS) {
      const isWoW64 = !!process.env.hasOwnProperty("PROCESSOR_ARCHITEW6432");
      WindowsExternalTerminalService._DEFAULT_TERMINAL_WINDOWS = `${process.env.windir ? process.env.windir : "C:\\Windows"}\\${isWoW64 ? "Sysnative" : "System32"}\\cmd.exe`;
    }
    return WindowsExternalTerminalService._DEFAULT_TERMINAL_WINDOWS;
  }
  static async getWtExePath() {
    try {
      return await processes.findExecutable("wt");
    } catch {
      return void 0;
    }
  }
}
__decorate([
  memoize
], WindowsExternalTerminalService, "getWtExePath", null);
class MacExternalTerminalService extends ExternalTerminalService {
  static {
    __name(this, "MacExternalTerminalService");
  }
  static {
    this.OSASCRIPT = "/usr/bin/osascript";
  }
  // osascript is the AppleScript interpreter on OS X
  openTerminal(configuration, cwd) {
    return this.spawnTerminal(cp, configuration, cwd);
  }
  runInTerminal(title, dir, args, envVars, settings) {
    const terminalApp = settings.osxExec || DEFAULT_TERMINAL_OSX;
    return new Promise((resolve, reject) => {
      if (terminalApp === DEFAULT_TERMINAL_OSX || terminalApp === "iTerm.app") {
        const script = terminalApp === DEFAULT_TERMINAL_OSX ? "TerminalHelper" : "iTermHelper";
        const scriptpath = FileAccess.asFileUri(`vs/workbench/contrib/externalTerminal/node/${script}.scpt`).fsPath;
        const osaArgs = [
          scriptpath,
          "-t",
          title || TERMINAL_TITLE,
          "-w",
          dir
        ];
        for (const a of args) {
          osaArgs.push("-a");
          osaArgs.push(a);
        }
        if (envVars) {
          const env2 = Object.assign({}, getSanitizedEnvironment(process), envVars);
          for (const key in env2) {
            const value = env2[key];
            if (value === null) {
              osaArgs.push("-u");
              osaArgs.push(key);
            } else {
              osaArgs.push("-e");
              osaArgs.push(`${key}=${value}`);
            }
          }
        }
        let stderr = "";
        const osa = cp.spawn(MacExternalTerminalService.OSASCRIPT, osaArgs);
        osa.on("error", (err) => {
          reject(improveError(err));
        });
        osa.stderr.on("data", (data) => {
          stderr += data.toString();
        });
        osa.on("exit", (code) => {
          if (code === 0) {
            resolve(void 0);
          } else {
            if (stderr) {
              const lines = stderr.split("\n", 1);
              reject(new Error(lines[0]));
            } else {
              reject(new Error(nls.localize("mac.terminal.script.failed", "Script '{0}' failed with exit code {1}", script, code)));
            }
          }
        });
      } else {
        reject(new Error(nls.localize("mac.terminal.type.not.supported", "'{0}' not supported", terminalApp)));
      }
    });
  }
  spawnTerminal(spawner, configuration, cwd) {
    const terminalApp = configuration.osxExec || DEFAULT_TERMINAL_OSX;
    return new Promise((c, e) => {
      const args = ["-a", terminalApp];
      if (cwd) {
        args.push(cwd);
      }
      const env2 = getSanitizedEnvironment(process);
      const child = spawner.spawn("/usr/bin/open", args, { cwd, env: env2 });
      child.on("error", e);
      child.on("exit", () => c());
    });
  }
}
class LinuxExternalTerminalService extends ExternalTerminalService {
  static {
    __name(this, "LinuxExternalTerminalService");
  }
  static {
    this.WAIT_MESSAGE = nls.localize("press.any.key", "Press any key to continue...");
  }
  openTerminal(configuration, cwd) {
    return this.spawnTerminal(cp, configuration, cwd);
  }
  runInTerminal(title, dir, args, envVars, settings) {
    const execPromise = settings.linuxExec ? Promise.resolve(settings.linuxExec) : LinuxExternalTerminalService.getDefaultTerminalLinuxReady();
    return new Promise((resolve, reject) => {
      const termArgs = [];
      execPromise.then((exec) => {
        if (exec.indexOf("gnome-terminal") >= 0) {
          termArgs.push("-x");
        } else {
          termArgs.push("-e");
        }
        termArgs.push("bash");
        termArgs.push("-c");
        const bashCommand = `${quote(args)}; echo; read -p "${LinuxExternalTerminalService.WAIT_MESSAGE}" -n1;`;
        termArgs.push(`''${bashCommand}''`);
        const env2 = Object.assign({}, getSanitizedEnvironment(process), envVars);
        Object.keys(env2).filter((v) => env2[v] === null).forEach((key) => delete env2[key]);
        const options = {
          cwd: dir,
          env: env2
        };
        let stderr = "";
        const cmd = cp.spawn(exec, termArgs, options);
        cmd.on("error", (err) => {
          reject(improveError(err));
        });
        cmd.stderr.on("data", (data) => {
          stderr += data.toString();
        });
        cmd.on("exit", (code) => {
          if (code === 0) {
            resolve(void 0);
          } else {
            if (stderr) {
              const lines = stderr.split("\n", 1);
              reject(new Error(lines[0]));
            } else {
              reject(new Error(nls.localize("linux.term.failed", "'{0}' failed with exit code {1}", exec, code)));
            }
          }
        });
      });
    });
  }
  static async getDefaultTerminalLinuxReady() {
    if (!LinuxExternalTerminalService._DEFAULT_TERMINAL_LINUX_READY) {
      if (!env.isLinux) {
        LinuxExternalTerminalService._DEFAULT_TERMINAL_LINUX_READY = Promise.resolve("xterm");
      } else {
        const isDebian = await pfs.Promises.exists("/etc/debian_version");
        LinuxExternalTerminalService._DEFAULT_TERMINAL_LINUX_READY = new Promise((r) => {
          if (isDebian) {
            r("x-terminal-emulator");
          } else if (process.env.DESKTOP_SESSION === "gnome" || process.env.DESKTOP_SESSION === "gnome-classic") {
            r("gnome-terminal");
          } else if (process.env.DESKTOP_SESSION === "kde-plasma") {
            r("konsole");
          } else if (process.env.COLORTERM) {
            r(process.env.COLORTERM);
          } else if (process.env.TERM) {
            r(process.env.TERM);
          } else {
            r("xterm");
          }
        });
      }
    }
    return LinuxExternalTerminalService._DEFAULT_TERMINAL_LINUX_READY;
  }
  spawnTerminal(spawner, configuration, cwd) {
    const execPromise = configuration.linuxExec ? Promise.resolve(configuration.linuxExec) : LinuxExternalTerminalService.getDefaultTerminalLinuxReady();
    return new Promise((c, e) => {
      execPromise.then((exec) => {
        const env2 = getSanitizedEnvironment(process);
        const child = spawner.spawn(exec, [], { cwd, env: env2 });
        child.on("error", e);
        child.on("exit", () => c());
      });
    });
  }
}
function getSanitizedEnvironment(process2) {
  const env2 = { ...process2.env };
  sanitizeProcessEnvironment(env2);
  return env2;
}
__name(getSanitizedEnvironment, "getSanitizedEnvironment");
function improveError(err) {
  if ("errno" in err && err["errno"] === "ENOENT" && "path" in err && typeof err["path"] === "string") {
    return new Error(nls.localize("ext.term.app.not.found", "can't find terminal application '{0}'", err["path"]));
  }
  return err;
}
__name(improveError, "improveError");
function quote(args) {
  let r = "";
  for (const a of args) {
    if (a.indexOf(" ") >= 0) {
      r += '"' + a + '"';
    } else {
      r += a;
    }
    r += " ";
  }
  return r;
}
__name(quote, "quote");
export {
  LinuxExternalTerminalService,
  MacExternalTerminalService,
  WindowsExternalTerminalService
};
//# sourceMappingURL=externalTerminalService.js.map
