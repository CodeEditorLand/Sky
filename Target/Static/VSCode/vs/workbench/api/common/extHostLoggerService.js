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
import { ILogger, ILoggerOptions, AbstractMessageLogger, LogLevel, AbstractLoggerService } from "../../../platform/log/common/log.js";
import { MainThreadLoggerShape, MainContext, ExtHostLogLevelServiceShape } from "./extHost.protocol.js";
import { IExtHostInitDataService } from "./extHostInitDataService.js";
import { IExtHostRpcService } from "./extHostRpcService.js";
import { URI, UriComponents } from "../../../base/common/uri.js";
import { revive } from "../../../base/common/marshalling.js";
let ExtHostLoggerService = class extends AbstractLoggerService {
  static {
    __name(this, "ExtHostLoggerService");
  }
  _proxy;
  constructor(rpc, initData) {
    super(initData.logLevel, initData.logsLocation, initData.loggers.map((logger) => revive(logger)));
    this._proxy = rpc.getProxy(MainContext.MainThreadLogger);
  }
  $setLogLevel(logLevel, resource) {
    if (resource) {
      this.setLogLevel(URI.revive(resource), logLevel);
    } else {
      this.setLogLevel(logLevel);
    }
  }
  setVisibility(resource, visibility) {
    super.setVisibility(resource, visibility);
    this._proxy.$setVisibility(resource, visibility);
  }
  doCreateLogger(resource, logLevel, options) {
    return new Logger(this._proxy, resource, logLevel, options);
  }
};
ExtHostLoggerService = __decorateClass([
  __decorateParam(0, IExtHostRpcService),
  __decorateParam(1, IExtHostInitDataService)
], ExtHostLoggerService);
class Logger extends AbstractMessageLogger {
  constructor(proxy, file, logLevel, loggerOptions) {
    super(loggerOptions?.logLevel === "always");
    this.proxy = proxy;
    this.file = file;
    this.setLevel(logLevel);
    this.proxy.$createLogger(file, loggerOptions).then(() => {
      this.doLog(this.buffer);
      this.isLoggerCreated = true;
    });
  }
  static {
    __name(this, "Logger");
  }
  isLoggerCreated = false;
  buffer = [];
  log(level, message) {
    const messages = [[level, message]];
    if (this.isLoggerCreated) {
      this.doLog(messages);
    } else {
      this.buffer.push(...messages);
    }
  }
  doLog(messages) {
    this.proxy.$log(this.file, messages);
  }
  flush() {
    this.proxy.$flush(this.file);
  }
}
export {
  ExtHostLoggerService
};
//# sourceMappingURL=extHostLoggerService.js.map
