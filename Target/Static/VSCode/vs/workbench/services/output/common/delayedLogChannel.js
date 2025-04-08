var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp(target, key, result);
  return result;
};
var __decorateParam = (index, decorator) => (target, key) => decorator(target, key, index);
import { ILogger, ILoggerService, log, LogLevel } from "../../../../platform/log/common/log.js";
import { URI } from "../../../../base/common/uri.js";
let DelayedLogChannel = class {
  constructor(id, name, file, loggerService) {
    this.file = file;
    this.loggerService = loggerService;
    this.logger = loggerService.createLogger(file, { name, id, hidden: true });
  }
  static {
    __name(this, "DelayedLogChannel");
  }
  logger;
  log(level, message) {
    this.loggerService.setVisibility(this.file, true);
    log(this.logger, level, message);
  }
};
DelayedLogChannel = __decorateClass([
  __decorateParam(3, ILoggerService)
], DelayedLogChannel);
export {
  DelayedLogChannel
};
//# sourceMappingURL=delayedLogChannel.js.map
