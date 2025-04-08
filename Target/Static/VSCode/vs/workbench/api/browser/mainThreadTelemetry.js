var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
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
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
import { Disposable } from "../../../base/common/lifecycle.js";
import { IConfigurationService } from "../../../platform/configuration/common/configuration.js";
import { IEnvironmentService } from "../../../platform/environment/common/environment.js";
import { IProductService } from "../../../platform/product/common/productService.js";
import { ClassifiedEvent, IGDPRProperty, OmitMetadata, StrictPropertyCheck } from "../../../platform/telemetry/common/gdprTypings.js";
import { ITelemetryService, TelemetryLevel, TELEMETRY_OLD_SETTING_ID, TELEMETRY_SETTING_ID } from "../../../platform/telemetry/common/telemetry.js";
import { supportsTelemetry } from "../../../platform/telemetry/common/telemetryUtils.js";
import { extHostNamedCustomer, IExtHostContext } from "../../services/extensions/common/extHostCustomers.js";
import { ExtHostContext, ExtHostTelemetryShape, MainContext, MainThreadTelemetryShape } from "../common/extHost.protocol.js";
let MainThreadTelemetry = class extends Disposable {
  constructor(extHostContext, _telemetryService, _configurationService, _environmentService, _productService) {
    super();
    this._telemetryService = _telemetryService;
    this._configurationService = _configurationService;
    this._environmentService = _environmentService;
    this._productService = _productService;
    this._proxy = extHostContext.getProxy(ExtHostContext.ExtHostTelemetry);
    if (supportsTelemetry(this._productService, this._environmentService)) {
      this._register(this._configurationService.onDidChangeConfiguration((e) => {
        if (e.affectsConfiguration(TELEMETRY_SETTING_ID) || e.affectsConfiguration(TELEMETRY_OLD_SETTING_ID)) {
          this._proxy.$onDidChangeTelemetryLevel(this.telemetryLevel);
        }
      }));
    }
    this._proxy.$initializeTelemetryLevel(this.telemetryLevel, supportsTelemetry(this._productService, this._environmentService), this._productService.enabledTelemetryLevels);
  }
  _proxy;
  get telemetryLevel() {
    if (!supportsTelemetry(this._productService, this._environmentService)) {
      return TelemetryLevel.NONE;
    }
    return this._telemetryService.telemetryLevel;
  }
  $publicLog(eventName, data = /* @__PURE__ */ Object.create(null)) {
    data[MainThreadTelemetry._name] = true;
    this._telemetryService.publicLog(eventName, data);
  }
  $publicLog2(eventName, data) {
    this.$publicLog(eventName, data);
  }
};
__name(MainThreadTelemetry, "MainThreadTelemetry");
__publicField(MainThreadTelemetry, "_name", "pluginHostTelemetry");
MainThreadTelemetry = __decorateClass([
  extHostNamedCustomer(MainContext.MainThreadTelemetry),
  __decorateParam(1, ITelemetryService),
  __decorateParam(2, IConfigurationService),
  __decorateParam(3, IEnvironmentService),
  __decorateParam(4, IProductService)
], MainThreadTelemetry);
export {
  MainThreadTelemetry
};
//# sourceMappingURL=mainThreadTelemetry.js.map
