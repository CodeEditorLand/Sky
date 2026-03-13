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
import { Disposable } from "../../../../base/common/lifecycle.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { registerSingleton } from "../../../../platform/instantiation/common/extensions.js";
import { ILoggerService } from "../../../../platform/log/common/log.js";
import { IProductService } from "../../../../platform/product/common/productService.js";
import { IStorageService } from "../../../../platform/storage/common/storage.js";
import { OneDataSystemWebAppender } from "../../../../platform/telemetry/browser/1dsAppender.js";
import { ITelemetryService, TELEMETRY_SETTING_ID } from "../../../../platform/telemetry/common/telemetry.js";
import { TelemetryLogAppender } from "../../../../platform/telemetry/common/telemetryLogAppender.js";
import { TelemetryService as BaseTelemetryService } from "../../../../platform/telemetry/common/telemetryService.js";
import { getTelemetryLevel, isInternalTelemetry, isLoggingOnly, NullTelemetryService, supportsTelemetry } from "../../../../platform/telemetry/common/telemetryUtils.js";
import { IBrowserWorkbenchEnvironmentService } from "../../environment/browser/environmentService.js";
import { IRemoteAgentService } from "../../remote/common/remoteAgentService.js";
import { IMeteredConnectionService } from "../../../../platform/meteredConnection/common/meteredConnection.js";
import { resolveWorkbenchCommonProperties } from "./workbenchCommonProperties.js";
import { experimentsEnabled } from "../common/workbenchTelemetryUtils.js";
import { IRequestService, NO_FETCH_TELEMETRY } from "../../../../platform/request/common/request.js";
let TelemetryService = class TelemetryService2 extends Disposable {
  static {
    __name(this, "TelemetryService");
  }
  get sessionId() {
    return this.impl.sessionId;
  }
  get machineId() {
    return this.impl.machineId;
  }
  get sqmId() {
    return this.impl.sqmId;
  }
  get devDeviceId() {
    return this.impl.devDeviceId;
  }
  get firstSessionDate() {
    return this.impl.firstSessionDate;
  }
  get msftInternal() {
    return this.impl.msftInternal;
  }
  constructor(environmentService, loggerService, configurationService, storageService, productService, remoteAgentService, meteredConnectionService, requestService) {
    super();
    this.impl = NullTelemetryService;
    this.sendErrorTelemetry = true;
    this.impl = this.initializeService(environmentService, loggerService, configurationService, storageService, productService, remoteAgentService, meteredConnectionService);
    this._register(configurationService.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration(TELEMETRY_SETTING_ID)) {
        this.impl = this.initializeService(environmentService, loggerService, configurationService, storageService, productService, remoteAgentService, meteredConnectionService);
      }
    }));
    this._register(requestService.onDidCompleteRequest((e) => {
      if (e.callSite === NO_FETCH_TELEMETRY) {
        return;
      }
      this.publicLog2("fetchCall", {
        callSite: e.callSite,
        latency: e.latency,
        statusCode: e.statusCode
      });
    }));
  }
  /**
   * Initializes the telemetry service to be a full fledged service.
   * This is only done once and only when telemetry is enabled as this will also ping the endpoint to
   * ensure its not adblocked and we can send telemetry
   */
  initializeService(environmentService, loggerService, configurationService, storageService, productService, remoteAgentService, meteredConnectionService) {
    const telemetrySupported = supportsTelemetry(productService, environmentService) && productService.aiConfig?.ariaKey;
    if (telemetrySupported && getTelemetryLevel(configurationService) !== 0 && this.impl === NullTelemetryService) {
      const appenders = [];
      const isInternal = isInternalTelemetry(productService, configurationService);
      if (!isLoggingOnly(productService, environmentService)) {
        if (remoteAgentService.getConnection() !== null) {
          const remoteTelemetryProvider = {
            log: remoteAgentService.logTelemetry.bind(remoteAgentService),
            flush: remoteAgentService.flushTelemetry.bind(remoteAgentService)
          };
          appenders.push(remoteTelemetryProvider);
        } else {
          appenders.push(new OneDataSystemWebAppender(isInternal, "monacoworkbench", null, productService.aiConfig?.ariaKey));
        }
      }
      appenders.push(new TelemetryLogAppender("", false, loggerService, environmentService, productService));
      const config = {
        appenders,
        commonProperties: resolveWorkbenchCommonProperties(storageService, productService, isInternal, environmentService.remoteAuthority, environmentService.options && environmentService.options.resolveCommonTelemetryProperties),
        sendErrorTelemetry: this.sendErrorTelemetry,
        waitForExperimentProperties: experimentsEnabled(configurationService, productService, environmentService),
        meteredConnectionService
      };
      return this._register(new BaseTelemetryService(config, configurationService, productService));
    }
    return this.impl;
  }
  setExperimentProperty(name, value) {
    return this.impl.setExperimentProperty(name, value);
  }
  get telemetryLevel() {
    return this.impl.telemetryLevel;
  }
  publicLog(eventName, data) {
    this.impl.publicLog(eventName, data);
  }
  publicLog2(eventName, data) {
    this.publicLog(eventName, data);
  }
  publicLogError(errorEventName, data) {
    this.impl.publicLog(errorEventName, data);
  }
  publicLogError2(eventName, data) {
    this.publicLogError(eventName, data);
  }
};
TelemetryService = __decorate([
  __param(0, IBrowserWorkbenchEnvironmentService),
  __param(1, ILoggerService),
  __param(2, IConfigurationService),
  __param(3, IStorageService),
  __param(4, IProductService),
  __param(5, IRemoteAgentService),
  __param(6, IMeteredConnectionService),
  __param(7, IRequestService)
], TelemetryService);
registerSingleton(
  ITelemetryService,
  TelemetryService,
  1
  /* InstantiationType.Delayed */
);
export {
  TelemetryService
};
//# sourceMappingURL=telemetryService.js.map
