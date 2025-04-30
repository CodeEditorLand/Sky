var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import * as fs from "fs";
import * as os from "os";
import * as cp from "child_process";
import * as path from "path";
let hasWSLFeaturePromise;
async function hasWSLFeatureInstalled(refresh = false) {
  if (hasWSLFeaturePromise === void 0 || refresh) {
    hasWSLFeaturePromise = testWSLFeatureInstalled();
  }
  return hasWSLFeaturePromise;
}
__name(hasWSLFeatureInstalled, "hasWSLFeatureInstalled");
async function testWSLFeatureInstalled() {
  const windowsBuildNumber = getWindowsBuildNumber();
  if (windowsBuildNumber === void 0) {
    return false;
  }
  if (windowsBuildNumber >= 22e3) {
    const wslExePath = getWSLExecutablePath();
    if (wslExePath) {
      return new Promise((s) => {
        try {
          cp.execFile(wslExePath, ["--status"], (err) => s(!err));
        } catch (e) {
          s(false);
        }
      });
    }
  } else {
    const dllPath = getLxssManagerDllPath();
    if (dllPath) {
      try {
        if ((await fs.promises.stat(dllPath)).isFile()) {
          return true;
        }
      } catch (e) {
      }
    }
  }
  return false;
}
__name(testWSLFeatureInstalled, "testWSLFeatureInstalled");
function getWindowsBuildNumber() {
  const osVersion = /(\d+)\.(\d+)\.(\d+)/g.exec(os.release());
  if (osVersion) {
    return parseInt(osVersion[3]);
  }
  return void 0;
}
__name(getWindowsBuildNumber, "getWindowsBuildNumber");
function getSystem32Path(subPath) {
  const systemRoot = process.env["SystemRoot"];
  if (systemRoot) {
    const is32ProcessOn64Windows = process.env.hasOwnProperty("PROCESSOR_ARCHITEW6432");
    return path.join(systemRoot, is32ProcessOn64Windows ? "Sysnative" : "System32", subPath);
  }
  return void 0;
}
__name(getSystem32Path, "getSystem32Path");
function getWSLExecutablePath() {
  return getSystem32Path("wsl.exe");
}
__name(getWSLExecutablePath, "getWSLExecutablePath");
function getLxssManagerDllPath() {
  return getSystem32Path("lxss\\LxssManager.dll");
}
__name(getLxssManagerDllPath, "getLxssManagerDllPath");
export {
  hasWSLFeatureInstalled
};
//# sourceMappingURL=wsl.js.map
