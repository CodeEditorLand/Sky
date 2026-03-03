var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
function gitBashToWindowsPath(path, driveLetter) {
  const systemDrive = (driveLetter || "C:").toUpperCase();
  if (path === "/") {
    return `${systemDrive}\\`;
  }
  const match = path.match(/^\/([a-zA-Z])(\/.*)?$/);
  if (match) {
    const drive = match[1].toUpperCase();
    const rest = match[2] ? match[2].replace(/\//g, "\\") : "\\";
    return `${drive}:${rest}`;
  }
  return path.replace(/\//g, "\\");
}
__name(gitBashToWindowsPath, "gitBashToWindowsPath");
function windowsToGitBashPath(path) {
  return path.replace(/^[a-zA-Z]:\\/, (match) => `/${match[0].toLowerCase()}/`).replace(/\\/g, "/");
}
__name(windowsToGitBashPath, "windowsToGitBashPath");
export {
  gitBashToWindowsPath,
  windowsToGitBashPath
};
//# sourceMappingURL=terminalGitBashHelpers.js.map
