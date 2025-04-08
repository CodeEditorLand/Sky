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
import { IDebugModel, IDebugSession, AdapterEndEvent } from "./debug.js";
import { ITelemetryService } from "../../../../platform/telemetry/common/telemetry.js";
import { Debugger } from "./debugger.js";
let DebugTelemetry = class {
  constructor(model, telemetryService) {
    this.model = model;
    this.telemetryService = telemetryService;
  }
  static {
    __name(this, "DebugTelemetry");
  }
  logDebugSessionStart(dbgr, launchJsonExists) {
    const extension = dbgr.getMainExtensionDescriptor();
    this.telemetryService.publicLog("debugSessionStart", {
      type: dbgr.type,
      breakpointCount: this.model.getBreakpoints().length,
      exceptionBreakpoints: this.model.getExceptionBreakpoints(),
      watchExpressionsCount: this.model.getWatchExpressions().length,
      extensionName: extension.identifier.value,
      isBuiltin: extension.isBuiltin,
      launchJsonExists
    });
  }
  logDebugSessionStop(session, adapterExitEvent) {
    const breakpoints = this.model.getBreakpoints();
    this.telemetryService.publicLog("debugSessionStop", {
      type: session && session.configuration.type,
      success: adapterExitEvent.emittedStopped || breakpoints.length === 0,
      sessionLengthInSeconds: adapterExitEvent.sessionLengthInSeconds,
      breakpointCount: breakpoints.length,
      watchExpressionsCount: this.model.getWatchExpressions().length
    });
  }
};
DebugTelemetry = __decorateClass([
  __decorateParam(1, ITelemetryService)
], DebugTelemetry);
export {
  DebugTelemetry
};
//# sourceMappingURL=debugTelemetry.js.map
