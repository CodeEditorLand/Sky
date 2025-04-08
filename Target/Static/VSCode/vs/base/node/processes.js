var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import * as cp from "child_process";
import { Stats, promises } from "fs";
import { getCaseInsensitive } from "../common/objects.js";
import * as path from "../common/path.js";
import * as Platform from "../common/platform.js";
import * as process from "../common/process.js";
import { CommandOptions, ForkOptions, Source, SuccessData, TerminateResponse, TerminateResponseCode } from "../common/processes.js";
import * as Types from "../common/types.js";
import * as pfs from "./pfs.js";
function getWindowsShell(env = process.env) {
  return env["comspec"] || "cmd.exe";
}
__name(getWindowsShell, "getWindowsShell");
function createQueuedSender(childProcess) {
  let msgQueue = [];
  let useQueue = false;
  const send = /* @__PURE__ */ __name(function(msg) {
    if (useQueue) {
      msgQueue.push(msg);
      return;
    }
    const result = childProcess.send(msg, (error) => {
      if (error) {
        console.error(error);
      }
      useQueue = false;
      if (msgQueue.length > 0) {
        const msgQueueCopy = msgQueue.slice(0);
        msgQueue = [];
        msgQueueCopy.forEach((entry) => send(entry));
      }
    });
    if (!result || Platform.isWindows) {
      useQueue = true;
    }
  }, "send");
  return { send };
}
__name(createQueuedSender, "createQueuedSender");
async function fileExistsDefault(path2) {
  if (await pfs.Promises.exists(path2)) {
    let statValue;
    try {
      statValue = await promises.stat(path2);
    } catch (e) {
      if (e.message.startsWith("EACCES")) {
        statValue = await promises.lstat(path2);
      }
    }
    return statValue ? !statValue.isDirectory() : false;
  }
  return false;
}
__name(fileExistsDefault, "fileExistsDefault");
async function findExecutable(command, cwd, paths, env = process.env, fileExists = fileExistsDefault) {
  if (path.isAbsolute(command)) {
    return await fileExists(command) ? command : void 0;
  }
  if (cwd === void 0) {
    cwd = process.cwd();
  }
  const dir = path.dirname(command);
  if (dir !== ".") {
    const fullPath2 = path.join(cwd, command);
    return await fileExists(fullPath2) ? fullPath2 : void 0;
  }
  const envPath = getCaseInsensitive(env, "PATH");
  if (paths === void 0 && Types.isString(envPath)) {
    paths = envPath.split(path.delimiter);
  }
  if (paths === void 0 || paths.length === 0) {
    const fullPath2 = path.join(cwd, command);
    return await fileExists(fullPath2) ? fullPath2 : void 0;
  }
  for (const pathEntry of paths) {
    let fullPath2;
    if (path.isAbsolute(pathEntry)) {
      fullPath2 = path.join(pathEntry, command);
    } else {
      fullPath2 = path.join(cwd, pathEntry, command);
    }
    if (Platform.isWindows) {
      const pathExt = getCaseInsensitive(env, "PATHEXT") || ".COM;.EXE;.BAT;.CMD";
      const pathExtsFound = pathExt.split(";").map(async (ext) => {
        const withExtension = fullPath2 + ext;
        return await fileExists(withExtension) ? withExtension : void 0;
      });
      for (const foundPromise of pathExtsFound) {
        const found = await foundPromise;
        if (found) {
          return found;
        }
      }
    }
    if (await fileExists(fullPath2)) {
      return fullPath2;
    }
  }
  const fullPath = path.join(cwd, command);
  return await fileExists(fullPath) ? fullPath : void 0;
}
__name(findExecutable, "findExecutable");
export {
  Source,
  TerminateResponseCode,
  createQueuedSender,
  findExecutable,
  getWindowsShell
};
//# sourceMappingURL=processes.js.map
