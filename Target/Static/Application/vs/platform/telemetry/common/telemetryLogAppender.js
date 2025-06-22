var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Disposable } from "../../../base/common/lifecycle.js";
import { localize } from "../../../nls.js";
import { IEnvironmentService } from "../../environment/common/environment.js";
import { ILoggerService } from "../../log/common/log.js";
import { IProductService } from "../../product/common/productService.js";
import { TelemetryLogGroup, isLoggingOnly, telemetryLogId, validateTelemetryData } from "./telemetryUtils.js";
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
let TelemetryLogAppender = class TelemetryLogAppender2 extends Disposable {
  static {
    __name(this, "TelemetryLogAppender");
  }
  constructor(prefix, remote, loggerService, environmentService, productService) {
    super();
    this.prefix = prefix;
    const id = remote ? "remoteTelemetry" : telemetryLogId;
    const logger = loggerService.getLogger(id);
    if (logger) {
      this.logger = this._register(logger);
    } else {
      const justLoggingAndNotSending = isLoggingOnly(productService, environmentService);
      const logSuffix = justLoggingAndNotSending ? " (Not Sent)" : "";
      this.logger = this._register(loggerService.createLogger(id, {
        name: localize("telemetryLog", "Telemetry{0}", logSuffix),
        group: TelemetryLogGroup,
        hidden: true
      }));
    }
  }
  flush() {
    return Promise.resolve();
  }
  log(eventName, data) {
    this.logger.trace(`${this.prefix}telemetry/${eventName}`, validateTelemetryData(data));
  }
};
TelemetryLogAppender = __decorate([
  __param(2, ILoggerService),
  __param(3, IEnvironmentService),
  __param(4, IProductService)
], TelemetryLogAppender);
export {
  TelemetryLogAppender
};
//# sourceMappingURL=telemetryLogAppender.js.map
