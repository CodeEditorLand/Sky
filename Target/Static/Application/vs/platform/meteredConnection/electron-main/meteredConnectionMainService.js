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
import { IConfigurationService } from "../../configuration/common/configuration.js";
import { AbstractMeteredConnectionService } from "../common/meteredConnection.js";
let MeteredConnectionMainService = class MeteredConnectionMainService2 extends AbstractMeteredConnectionService {
  static {
    __name(this, "MeteredConnectionMainService");
  }
  constructor(configurationService) {
    super(configurationService, false);
  }
  setTelemetryService(telemetryService) {
    this.telemetryService = telemetryService;
  }
  onChangeBrowserConnection() {
    const fireAfter = this.isBrowserConnectionMetered;
    if (!fireAfter) {
      super.onChangeBrowserConnection();
    }
    this.telemetryService?.publicLog2("meteredConnectionStateChange", {
      connectionState: this.isBrowserConnectionMetered
    });
    if (fireAfter) {
      super.onChangeBrowserConnection();
    }
  }
};
MeteredConnectionMainService = __decorate([
  __param(0, IConfigurationService)
], MeteredConnectionMainService);
export {
  MeteredConnectionMainService
};
//# sourceMappingURL=meteredConnectionMainService.js.map
