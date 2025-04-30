var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import * as path from "path";
import * as fs from "fs";
import { fileURLToPath } from "url";
import { createRequire } from "node:module";
const require2 = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isWindows = process.platform === "win32";
Error.stackTraceLimit = 100;
if (!process.env["VSCODE_HANDLES_SIGPIPE"]) {
  let didLogAboutSIGPIPE = false;
  process.on("SIGPIPE", () => {
    if (!didLogAboutSIGPIPE) {
      didLogAboutSIGPIPE = true;
      console.error(new Error(`Unexpected SIGPIPE`));
    }
  });
}
function setupCurrentWorkingDirectory() {
  try {
    if (typeof process.env["VSCODE_CWD"] !== "string") {
      process.env["VSCODE_CWD"] = process.cwd();
    }
    if (process.platform === "win32") {
      process.chdir(path.dirname(process.execPath));
    }
  } catch (err) {
    console.error(err);
  }
}
__name(setupCurrentWorkingDirectory, "setupCurrentWorkingDirectory");
setupCurrentWorkingDirectory();
function devInjectNodeModuleLookupPath(injectPath) {
  if (!process.env["VSCODE_DEV"]) {
    return;
  }
  if (!injectPath) {
    throw new Error("Missing injectPath");
  }
  const Module = require2("node:module");
  Module.register("./bootstrap-import.js", { parentURL: import.meta.url, data: injectPath });
}
__name(devInjectNodeModuleLookupPath, "devInjectNodeModuleLookupPath");
function removeGlobalNodeJsModuleLookupPaths() {
  if (typeof process?.versions?.electron === "string") {
    return;
  }
  const Module = require2("module");
  const globalPaths = Module.globalPaths;
  const originalResolveLookupPaths = Module._resolveLookupPaths;
  Module._resolveLookupPaths = function(moduleName, parent) {
    const paths = originalResolveLookupPaths(moduleName, parent);
    if (Array.isArray(paths)) {
      let commonSuffixLength = 0;
      while (commonSuffixLength < paths.length && paths[paths.length - 1 - commonSuffixLength] === globalPaths[globalPaths.length - 1 - commonSuffixLength]) {
        commonSuffixLength++;
      }
      return paths.slice(0, paths.length - commonSuffixLength);
    }
    return paths;
  };
  const originalNodeModulePaths = Module._nodeModulePaths;
  Module._nodeModulePaths = function(from) {
    let paths = originalNodeModulePaths(from);
    if (!isWindows) {
      return paths;
    }
    const isDrive = /* @__PURE__ */ __name((p) => p.length >= 3 && p.endsWith(":\\"), "isDrive");
    if (!isDrive(from)) {
      paths = paths.filter((p) => !isDrive(path.dirname(p)));
    }
    if (process.env.HOMEDRIVE && process.env.HOMEPATH) {
      const userDir = path.dirname(path.join(process.env.HOMEDRIVE, process.env.HOMEPATH));
      const isUsersDir = /* @__PURE__ */ __name((p) => path.relative(p, userDir).length === 0, "isUsersDir");
      if (!isUsersDir(from)) {
        paths = paths.filter((p) => !isUsersDir(path.dirname(p)));
      }
    }
    return paths;
  };
}
__name(removeGlobalNodeJsModuleLookupPaths, "removeGlobalNodeJsModuleLookupPaths");
function configurePortable(product) {
  const appRoot = path.dirname(__dirname);
  function getApplicationPath() {
    if (process.env["VSCODE_DEV"]) {
      return appRoot;
    }
    if (process.platform === "darwin") {
      return path.dirname(path.dirname(path.dirname(appRoot)));
    }
    return path.dirname(path.dirname(appRoot));
  }
  __name(getApplicationPath, "getApplicationPath");
  function getPortableDataPath() {
    if (process.env["VSCODE_PORTABLE"]) {
      return process.env["VSCODE_PORTABLE"];
    }
    if (process.platform === "win32" || process.platform === "linux") {
      return path.join(getApplicationPath(), "data");
    }
    const portableDataName = product.portable || `${product.applicationName}-portable-data`;
    return path.join(path.dirname(getApplicationPath()), portableDataName);
  }
  __name(getPortableDataPath, "getPortableDataPath");
  const portableDataPath = getPortableDataPath();
  const isPortable = !("target" in product) && fs.existsSync(portableDataPath);
  const portableTempPath = path.join(portableDataPath, "tmp");
  const isTempPortable = isPortable && fs.existsSync(portableTempPath);
  if (isPortable) {
    process.env["VSCODE_PORTABLE"] = portableDataPath;
  } else {
    delete process.env["VSCODE_PORTABLE"];
  }
  if (isTempPortable) {
    if (process.platform === "win32") {
      process.env["TMP"] = portableTempPath;
      process.env["TEMP"] = portableTempPath;
    } else {
      process.env["TMPDIR"] = portableTempPath;
    }
  }
  return {
    portableDataPath,
    isPortable
  };
}
__name(configurePortable, "configurePortable");
export {
  configurePortable,
  devInjectNodeModuleLookupPath,
  removeGlobalNodeJsModuleLookupPaths
};
//# sourceMappingURL=bootstrap-node.js.map
