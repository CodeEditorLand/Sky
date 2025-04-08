var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Disposable } from "../../../base/common/lifecycle.js";
import { Event } from "../../../base/common/event.js";
import { ILogger, ILogService, LogLevel, MultiplexLogger } from "./log.js";
class LogService extends Disposable {
  static {
    __name(this, "LogService");
  }
  logger;
  constructor(primaryLogger, otherLoggers = []) {
    super();
    this.logger = new MultiplexLogger([primaryLogger, ...otherLoggers]);
    this._register(primaryLogger.onDidChangeLogLevel((level) => this.setLevel(level)));
  }
  get onDidChangeLogLevel() {
    return this.logger.onDidChangeLogLevel;
  }
  setLevel(level) {
    this.logger.setLevel(level);
  }
  getLevel() {
    return this.logger.getLevel();
  }
  trace(message, ...args) {
    this.logger.trace(message, ...args);
  }
  debug(message, ...args) {
    this.logger.debug(message, ...args);
  }
  info(message, ...args) {
    this.logger.info(message, ...args);
  }
  warn(message, ...args) {
    this.logger.warn(message, ...args);
  }
  error(message, ...args) {
    this.logger.error(message, ...args);
  }
  flush() {
    this.logger.flush();
  }
}
export {
  LogService
};
//# sourceMappingURL=logService.js.map
