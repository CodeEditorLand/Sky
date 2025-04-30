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
import { FileAccess } from "../../../base/common/network.js";
import { Client as TelemetryClient } from "../../../base/parts/ipc/node/ipc.cp.js";
import { IConfigurationService } from "../../configuration/common/configuration.js";
import { IEnvironmentService } from "../../environment/common/environment.js";
import { ILoggerService } from "../../log/common/log.js";
import { IProductService } from "../../product/common/productService.js";
import { ITelemetryService } from "../common/telemetry.js";
import { TelemetryAppenderClient } from "../common/telemetryIpc.js";
import { TelemetryLogAppender } from "../common/telemetryLogAppender.js";
import { TelemetryService } from "../common/telemetryService.js";
let CustomEndpointTelemetryService = class CustomEndpointTelemetryService2 {
  static {
    __name(this, "CustomEndpointTelemetryService");
  }
  constructor(configurationService, telemetryService, loggerService, environmentService, productService) {
    this.configurationService = configurationService;
    this.telemetryService = telemetryService;
    this.loggerService = loggerService;
    this.environmentService = environmentService;
    this.productService = productService;
    this.customTelemetryServices = /* @__PURE__ */ new Map();
  }
  getCustomTelemetryService(endpoint) {
    if (!this.customTelemetryServices.has(endpoint.id)) {
      const telemetryInfo = /* @__PURE__ */ Object.create(null);
      telemetryInfo["common.vscodemachineid"] = this.telemetryService.machineId;
      telemetryInfo["common.vscodesessionid"] = this.telemetryService.sessionId;
      const args = [endpoint.id, JSON.stringify(telemetryInfo), endpoint.aiKey];
      const client = new TelemetryClient(FileAccess.asFileUri("bootstrap-fork").fsPath, {
        serverName: "Debug Telemetry",
        timeout: 1e3 * 60 * 5,
        args,
        env: {
          ELECTRON_RUN_AS_NODE: 1,
          VSCODE_PIPE_LOGGING: "true",
          VSCODE_ESM_ENTRYPOINT: "vs/workbench/contrib/debug/node/telemetryApp"
        }
      });
      const channel = client.getChannel("telemetryAppender");
      const appenders = [
        new TelemetryAppenderClient(channel),
        new TelemetryLogAppender(`[${endpoint.id}] `, false, this.loggerService, this.environmentService, this.productService)
      ];
      this.customTelemetryServices.set(endpoint.id, new TelemetryService({
        appenders,
        sendErrorTelemetry: endpoint.sendErrorTelemetry
      }, this.configurationService, this.productService));
    }
    return this.customTelemetryServices.get(endpoint.id);
  }
  publicLog(telemetryEndpoint, eventName, data) {
    const customTelemetryService = this.getCustomTelemetryService(telemetryEndpoint);
    customTelemetryService.publicLog(eventName, data);
  }
  publicLogError(telemetryEndpoint, errorEventName, data) {
    const customTelemetryService = this.getCustomTelemetryService(telemetryEndpoint);
    customTelemetryService.publicLogError(errorEventName, data);
  }
};
CustomEndpointTelemetryService = __decorate([
  __param(0, IConfigurationService),
  __param(1, ITelemetryService),
  __param(2, ILoggerService),
  __param(3, IEnvironmentService),
  __param(4, IProductService)
], CustomEndpointTelemetryService);
export {
  CustomEndpointTelemetryService
};
//# sourceMappingURL=customEndpointTelemetryService.js.map
