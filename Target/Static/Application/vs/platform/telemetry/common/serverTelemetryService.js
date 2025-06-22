var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { IConfigurationService } from "../../configuration/common/configuration.js";
import { refineServiceDecorator } from "../../instantiation/common/instantiation.js";
import { IProductService } from "../../product/common/productService.js";
import { ITelemetryService } from "./telemetry.js";
import { TelemetryService } from "./telemetryService.js";
import { NullTelemetryServiceShape } from "./telemetryUtils.js";
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
let ServerTelemetryService = class ServerTelemetryService2 extends TelemetryService {
  static {
    __name(this, "ServerTelemetryService");
  }
  constructor(config, injectedTelemetryLevel, _configurationService, _productService) {
    super(config, _configurationService, _productService);
    this._injectedTelemetryLevel = injectedTelemetryLevel;
  }
  publicLog(eventName, data) {
    if (this._injectedTelemetryLevel < 3) {
      return;
    }
    return super.publicLog(eventName, data);
  }
  publicLog2(eventName, data) {
    return this.publicLog(eventName, data);
  }
  publicLogError(errorEventName, data) {
    if (this._injectedTelemetryLevel < 2) {
      return Promise.resolve(void 0);
    }
    return super.publicLogError(errorEventName, data);
  }
  publicLogError2(eventName, data) {
    return this.publicLogError(eventName, data);
  }
  async updateInjectedTelemetryLevel(telemetryLevel) {
    if (telemetryLevel === void 0) {
      this._injectedTelemetryLevel = 0;
      throw new Error("Telemetry level cannot be undefined. This will cause infinite looping!");
    }
    this._injectedTelemetryLevel = this._injectedTelemetryLevel ? Math.min(this._injectedTelemetryLevel, telemetryLevel) : telemetryLevel;
    if (this._injectedTelemetryLevel === 0) {
      this.dispose();
    }
  }
};
ServerTelemetryService = __decorate([
  __param(2, IConfigurationService),
  __param(3, IProductService)
], ServerTelemetryService);
const ServerNullTelemetryService = new class extends NullTelemetryServiceShape {
  async updateInjectedTelemetryLevel() {
    return;
  }
  // No-op, telemetry is already disabled
}();
const IServerTelemetryService = refineServiceDecorator(ITelemetryService);
export {
  IServerTelemetryService,
  ServerNullTelemetryService,
  ServerTelemetryService
};
//# sourceMappingURL=serverTelemetryService.js.map
