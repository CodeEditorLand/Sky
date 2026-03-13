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
import { ITelemetryService } from "../../telemetry/common/telemetry.js";
import { IDataChannelService } from "../common/dataChannel.js";
class InterceptingTelemetryService {
  static {
    __name(this, "InterceptingTelemetryService");
  }
  constructor(_baseService, _intercept) {
    this._baseService = _baseService;
    this._intercept = _intercept;
  }
  get telemetryLevel() {
    return this._baseService.telemetryLevel;
  }
  get sessionId() {
    return this._baseService.sessionId;
  }
  get machineId() {
    return this._baseService.machineId;
  }
  get sqmId() {
    return this._baseService.sqmId;
  }
  get devDeviceId() {
    return this._baseService.devDeviceId;
  }
  get firstSessionDate() {
    return this._baseService.firstSessionDate;
  }
  get msftInternal() {
    return this._baseService.msftInternal;
  }
  get sendErrorTelemetry() {
    return this._baseService.sendErrorTelemetry;
  }
  publicLog(eventName, data) {
    this._intercept(eventName, data);
    this._baseService.publicLog(eventName, data);
  }
  publicLog2(eventName, data) {
    this._intercept(eventName, data);
    this._baseService.publicLog2(eventName, data);
  }
  publicLogError(errorEventName, data) {
    this._intercept(errorEventName, data);
    this._baseService.publicLogError(errorEventName, data);
  }
  publicLogError2(eventName, data) {
    this._intercept(eventName, data);
    this._baseService.publicLogError2(eventName, data);
  }
  setExperimentProperty(name, value) {
    this._baseService.setExperimentProperty(name, value);
  }
}
let DataChannelForwardingTelemetryService = class DataChannelForwardingTelemetryService2 extends InterceptingTelemetryService {
  static {
    __name(this, "DataChannelForwardingTelemetryService");
  }
  constructor(telemetryService, dataChannelService) {
    super(telemetryService, (eventName, data) => {
      let forward = true;
      if (data && shouldForwardToChannel in data) {
        forward = Boolean(data[shouldForwardToChannel]);
      }
      if (forward) {
        dataChannelService.getDataChannel("editTelemetry").sendData({ eventName, data: data ?? {} });
      }
    });
  }
};
DataChannelForwardingTelemetryService = __decorate([
  __param(0, ITelemetryService),
  __param(1, IDataChannelService)
], DataChannelForwardingTelemetryService);
const shouldForwardToChannel = /* @__PURE__ */ Symbol("shouldForwardToChannel");
function forwardToChannelIf(value) {
  return {
    // This will not be sent via telemetry, it is just a marker
    [shouldForwardToChannel]: value
  };
}
__name(forwardToChannelIf, "forwardToChannelIf");
function isCopilotLikeExtension(extensionId) {
  if (!extensionId) {
    return false;
  }
  const extIdLowerCase = extensionId.toLowerCase();
  return extIdLowerCase === "github.copilot" || extIdLowerCase === "github.copilot-chat";
}
__name(isCopilotLikeExtension, "isCopilotLikeExtension");
export {
  DataChannelForwardingTelemetryService,
  InterceptingTelemetryService,
  forwardToChannelIf,
  isCopilotLikeExtension
};
//# sourceMappingURL=forwardingTelemetryService.js.map
