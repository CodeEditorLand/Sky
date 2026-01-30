var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
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
import { isSigPipeError, onUnexpectedError, setUnexpectedErrorHandler } from "../../../base/common/errors.js";
import BaseErrorTelemetry from "../common/errorTelemetry.js";
import { ITelemetryService } from "../common/telemetry.js";
let ErrorTelemetry = class ErrorTelemetry2 extends BaseErrorTelemetry {
  static {
    __name(this, "ErrorTelemetry");
  }
  constructor(logService, telemetryService) {
    super(telemetryService);
    this.logService = logService;
  }
  installErrorListeners() {
    setUnexpectedErrorHandler((error) => this.onUnexpectedError(error));
    process.on("uncaughtException", (error) => {
      if (!isSigPipeError(error)) {
        onUnexpectedError(error);
      }
    });
    process.on("unhandledRejection", (reason) => onUnexpectedError(reason));
  }
  onUnexpectedError(error) {
    this.logService.error(`[uncaught exception in main]: ${error}`);
    if (error.stack) {
      this.logService.error(error.stack);
    }
  }
};
ErrorTelemetry = __decorate([
  __param(1, ITelemetryService)
], ErrorTelemetry);
var errorTelemetry_default = ErrorTelemetry;
export {
  errorTelemetry_default as default
};
//# sourceMappingURL=errorTelemetry.js.map
