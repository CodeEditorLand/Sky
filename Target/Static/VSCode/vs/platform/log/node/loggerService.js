var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { URI } from "../../../base/common/uri.js";
import { generateUuid } from "../../../base/common/uuid.js";
import { AbstractLoggerService, ILogger, ILoggerOptions, ILoggerService, LogLevel } from "../common/log.js";
import { SpdLogLogger } from "./spdlogLog.js";
class LoggerService extends AbstractLoggerService {
  static {
    __name(this, "LoggerService");
  }
  doCreateLogger(resource, logLevel, options) {
    return new SpdLogLogger(generateUuid(), resource.fsPath, !options?.donotRotate, !!options?.donotUseFormatters, logLevel);
  }
}
export {
  LoggerService
};
//# sourceMappingURL=loggerService.js.map
