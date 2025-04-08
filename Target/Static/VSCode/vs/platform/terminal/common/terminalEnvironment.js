var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { OperatingSystem, OS } from "../../../base/common/platform.js";
function escapeNonWindowsPath(path) {
  let newPath = path;
  if (newPath.includes("\\")) {
    newPath = newPath.replace(/\\/g, "\\\\");
  }
  const bannedChars = /[\`\$\|\&\>\~\#\!\^\*\;\<\"\']/g;
  newPath = newPath.replace(bannedChars, "");
  return `'${newPath}'`;
}
__name(escapeNonWindowsPath, "escapeNonWindowsPath");
function collapseTildePath(path, userHome, separator) {
  if (!path) {
    return "";
  }
  if (!userHome) {
    return path;
  }
  if (userHome.match(/[\/\\]$/)) {
    userHome = userHome.slice(0, userHome.length - 1);
  }
  const normalizedPath = path.replace(/\\/g, "/").toLowerCase();
  const normalizedUserHome = userHome.replace(/\\/g, "/").toLowerCase();
  if (!normalizedPath.includes(normalizedUserHome)) {
    return path;
  }
  return `~${separator}${path.slice(userHome.length + 1)}`;
}
__name(collapseTildePath, "collapseTildePath");
function sanitizeCwd(cwd) {
  if (cwd.match(/^['"].*['"]$/)) {
    cwd = cwd.substring(1, cwd.length - 1);
  }
  if (OS === OperatingSystem.Windows && cwd && cwd[1] === ":") {
    return cwd[0].toUpperCase() + cwd.substring(1);
  }
  return cwd;
}
__name(sanitizeCwd, "sanitizeCwd");
function shouldUseEnvironmentVariableCollection(slc) {
  return !slc.strictEnv;
}
__name(shouldUseEnvironmentVariableCollection, "shouldUseEnvironmentVariableCollection");
export {
  collapseTildePath,
  escapeNonWindowsPath,
  sanitizeCwd,
  shouldUseEnvironmentVariableCollection
};
//# sourceMappingURL=terminalEnvironment.js.map
