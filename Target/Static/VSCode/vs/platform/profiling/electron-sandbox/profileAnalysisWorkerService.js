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
import { createWebWorker } from "../../../base/browser/webWorkerFactory.js";
import { URI } from "../../../base/common/uri.js";
import { Proxied } from "../../../base/common/worker/webWorker.js";
import { InstantiationType, registerSingleton } from "../../instantiation/common/extensions.js";
import { createDecorator } from "../../instantiation/common/instantiation.js";
import { ILogService } from "../../log/common/log.js";
import { IV8Profile } from "../common/profiling.js";
import { BottomUpSample } from "../common/profilingModel.js";
import { reportSample } from "../common/profilingTelemetrySpec.js";
import { ITelemetryService } from "../../telemetry/common/telemetry.js";
import { FileAccess } from "../../../base/common/network.js";
var ProfilingOutput = /* @__PURE__ */ ((ProfilingOutput2) => {
  ProfilingOutput2[ProfilingOutput2["Failure"] = 0] = "Failure";
  ProfilingOutput2[ProfilingOutput2["Irrelevant"] = 1] = "Irrelevant";
  ProfilingOutput2[ProfilingOutput2["Interesting"] = 2] = "Interesting";
  return ProfilingOutput2;
})(ProfilingOutput || {});
const IProfileAnalysisWorkerService = createDecorator("IProfileAnalysisWorkerService");
let ProfileAnalysisWorkerService = class {
  constructor(_telemetryService, _logService) {
    this._telemetryService = _telemetryService;
    this._logService = _logService;
  }
  static {
    __name(this, "ProfileAnalysisWorkerService");
  }
  async _withWorker(callback) {
    const worker = createWebWorker(
      FileAccess.asBrowserUri("vs/platform/profiling/electron-sandbox/profileAnalysisWorkerMain.js"),
      "CpuProfileAnalysisWorker"
    );
    try {
      const r = await callback(worker.proxy);
      return r;
    } finally {
      worker.dispose();
    }
  }
  async analyseBottomUp(profile, callFrameClassifier, perfBaseline, sendAsErrorTelemtry) {
    return this._withWorker(async (worker) => {
      const result = await worker.$analyseBottomUp(profile);
      if (result.kind === 2 /* Interesting */) {
        for (const sample of result.samples) {
          reportSample({
            sample,
            perfBaseline,
            source: callFrameClassifier(sample.url)
          }, this._telemetryService, this._logService, sendAsErrorTelemtry);
        }
      }
      return result.kind;
    });
  }
  async analyseByLocation(profile, locations) {
    return this._withWorker(async (worker) => {
      const result = await worker.$analyseByUrlCategory(profile, locations);
      return result;
    });
  }
};
ProfileAnalysisWorkerService = __decorateClass([
  __decorateParam(0, ITelemetryService),
  __decorateParam(1, ILogService)
], ProfileAnalysisWorkerService);
registerSingleton(IProfileAnalysisWorkerService, ProfileAnalysisWorkerService, InstantiationType.Delayed);
export {
  IProfileAnalysisWorkerService,
  ProfilingOutput
};
//# sourceMappingURL=profileAnalysisWorkerService.js.map
