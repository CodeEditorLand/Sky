var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { mainWindow } from "../../../base/browser/window.js";
import { relativePath } from "../../../base/common/resources.js";
import { URI } from "../../../base/common/uri.js";
import { IEnvironmentService } from "../../environment/common/environment.js";
import { IFileService } from "../../files/common/files.js";
import { AdapterLogger, DEFAULT_LOG_LEVEL, ILogger, LogLevel } from "../common/log.js";
async function getLogs(fileService, environmentService) {
  const result = [];
  await doGetLogs(fileService, result, environmentService.logsHome, environmentService.logsHome);
  return result;
}
__name(getLogs, "getLogs");
async function doGetLogs(fileService, logs, curFolder, logsHome) {
  const stat = await fileService.resolve(curFolder);
  for (const { resource, isDirectory } of stat.children || []) {
    if (isDirectory) {
      await doGetLogs(fileService, logs, resource, logsHome);
    } else {
      const contents = (await fileService.readFile(resource)).value.toString();
      if (contents) {
        const path = relativePath(logsHome, resource);
        if (path) {
          logs.push({ relativePath: path, contents });
        }
      }
    }
  }
}
__name(doGetLogs, "doGetLogs");
function logLevelToString(level) {
  switch (level) {
    case LogLevel.Trace:
      return "trace";
    case LogLevel.Debug:
      return "debug";
    case LogLevel.Info:
      return "info";
    case LogLevel.Warning:
      return "warn";
    case LogLevel.Error:
      return "error";
  }
  return "info";
}
__name(logLevelToString, "logLevelToString");
class ConsoleLogInAutomationLogger extends AdapterLogger {
  static {
    __name(this, "ConsoleLogInAutomationLogger");
  }
  constructor(logLevel = DEFAULT_LOG_LEVEL) {
    super({ log: /* @__PURE__ */ __name((level, args) => this.consoleLog(logLevelToString(level), args), "log") }, logLevel);
  }
  consoleLog(type, args) {
    const automatedWindow = mainWindow;
    if (typeof automatedWindow.codeAutomationLog === "function") {
      try {
        automatedWindow.codeAutomationLog(type, args);
      } catch (err) {
        console.error("Problems writing to codeAutomationLog", err);
      }
    }
  }
}
export {
  ConsoleLogInAutomationLogger,
  getLogs
};
//# sourceMappingURL=log.js.map
