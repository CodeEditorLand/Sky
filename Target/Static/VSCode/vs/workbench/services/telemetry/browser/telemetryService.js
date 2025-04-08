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
import { Disposable } from "../../../../base/common/lifecycle.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { InstantiationType, registerSingleton } from "../../../../platform/instantiation/common/extensions.js";
import { ILogService, ILoggerService } from "../../../../platform/log/common/log.js";
import { IProductService } from "../../../../platform/product/common/productService.js";
import { IStorageService } from "../../../../platform/storage/common/storage.js";
import { OneDataSystemWebAppender } from "../../../../platform/telemetry/browser/1dsAppender.js";
import { ClassifiedEvent, IGDPRProperty, OmitMetadata, StrictPropertyCheck } from "../../../../platform/telemetry/common/gdprTypings.js";
import { ITelemetryData, ITelemetryService, TelemetryLevel, TELEMETRY_SETTING_ID } from "../../../../platform/telemetry/common/telemetry.js";
import { TelemetryLogAppender } from "../../../../platform/telemetry/common/telemetryLogAppender.js";
import { ITelemetryServiceConfig, TelemetryService as BaseTelemetryService } from "../../../../platform/telemetry/common/telemetryService.js";
import { getTelemetryLevel, isInternalTelemetry, isLoggingOnly, ITelemetryAppender, NullTelemetryService, supportsTelemetry } from "../../../../platform/telemetry/common/telemetryUtils.js";
import { IBrowserWorkbenchEnvironmentService } from "../../environment/browser/environmentService.js";
import { IRemoteAgentService } from "../../remote/common/remoteAgentService.js";
import { resolveWorkbenchCommonProperties } from "./workbenchCommonProperties.js";
let TelemetryService = class extends Disposable {
  static {
    __name(this, "TelemetryService");
  }
  impl = NullTelemetryService;
  sendErrorTelemetry = true;
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
  constructor(environmentService, logService, loggerService, configurationService, storageService, productService, remoteAgentService) {
    super();
    this.impl = this.initializeService(environmentService, logService, loggerService, configurationService, storageService, productService, remoteAgentService);
    this._register(configurationService.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration(TELEMETRY_SETTING_ID)) {
        this.impl = this.initializeService(environmentService, logService, loggerService, configurationService, storageService, productService, remoteAgentService);
      }
    }));
  }
  /**
   * Initializes the telemetry service to be a full fledged service.
   * This is only done once and only when telemetry is enabled as this will also ping the endpoint to
   * ensure its not adblocked and we can send telemetry
   */
  initializeService(environmentService, logService, loggerService, configurationService, storageService, productService, remoteAgentService) {
    const telemetrySupported = supportsTelemetry(productService, environmentService) && productService.aiConfig?.ariaKey;
    if (telemetrySupported && getTelemetryLevel(configurationService) !== TelemetryLevel.NONE && this.impl === NullTelemetryService) {
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
        commonProperties: resolveWorkbenchCommonProperties(storageService, productService.commit, productService.version, isInternal, environmentService.remoteAuthority, productService.embedderIdentifier, productService.removeTelemetryMachineId, environmentService.options && environmentService.options.resolveCommonTelemetryProperties),
        sendErrorTelemetry: this.sendErrorTelemetry
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
TelemetryService = __decorateClass([
  __decorateParam(0, IBrowserWorkbenchEnvironmentService),
  __decorateParam(1, ILogService),
  __decorateParam(2, ILoggerService),
  __decorateParam(3, IConfigurationService),
  __decorateParam(4, IStorageService),
  __decorateParam(5, IProductService),
  __decorateParam(6, IRemoteAgentService)
], TelemetryService);
registerSingleton(ITelemetryService, TelemetryService, InstantiationType.Delayed);
export {
  TelemetryService
};
//# sourceMappingURL=telemetryService.js.map
