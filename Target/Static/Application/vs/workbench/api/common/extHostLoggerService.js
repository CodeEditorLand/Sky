var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { AbstractMessageLogger, AbstractLoggerService } from "../../../platform/log/common/log.js";
import { MainContext } from "./extHost.protocol.js";
import { IExtHostInitDataService } from "./extHostInitDataService.js";
import { IExtHostRpcService } from "./extHostRpcService.js";
import { URI } from "../../../base/common/uri.js";
import { revive } from "../../../base/common/marshalling.js";
var __decorate = function(decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
  else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = function(paramIndex, decorator) {
  return function(target, key) {
    decorator(target, key, paramIndex);
  };
};
let ExtHostLoggerService = class ExtHostLoggerService2 extends AbstractLoggerService {
  static {
    __name(this, "ExtHostLoggerService");
  }
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
ExtHostLoggerService = __decorate([
  __param(0, IExtHostRpcService),
  __param(1, IExtHostInitDataService)
], ExtHostLoggerService);
class Logger extends AbstractMessageLogger {
  static {
    __name(this, "Logger");
  }
  constructor(proxy, file, logLevel, loggerOptions) {
    super(loggerOptions?.logLevel === "always");
    this.proxy = proxy;
    this.file = file;
    this.isLoggerCreated = false;
    this.buffer = [];
    this.setLevel(logLevel);
    this.proxy.$createLogger(file, loggerOptions).then(() => {
      this.doLog(this.buffer);
      this.isLoggerCreated = true;
    });
  }
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
