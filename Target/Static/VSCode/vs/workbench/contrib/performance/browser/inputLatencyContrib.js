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
import { inputLatency } from "../../../../base/browser/performance.js";
import { RunOnceScheduler } from "../../../../base/common/async.js";
import { Event } from "../../../../base/common/event.js";
import { Disposable, MutableDisposable } from "../../../../base/common/lifecycle.js";
import { ITelemetryService } from "../../../../platform/telemetry/common/telemetry.js";
import { IWorkbenchContribution } from "../../../common/contributions.js";
import { IEditorService } from "../../../services/editor/common/editorService.js";
let InputLatencyContrib = class extends Disposable {
  constructor(_editorService, _telemetryService) {
    super();
    this._editorService = _editorService;
    this._telemetryService = _telemetryService;
    this._scheduler = this._register(new RunOnceScheduler(() => {
      this._logSamples();
      this._setupListener();
    }, 6e4));
    if (Math.random() <= 0.01) {
      this._setupListener();
    }
  }
  static {
    __name(this, "InputLatencyContrib");
  }
  _listener = this._register(new MutableDisposable());
  _scheduler;
  _setupListener() {
    this._listener.value = Event.once(this._editorService.onDidActiveEditorChange)(() => this._scheduler.schedule());
  }
  _logSamples() {
    const measurements = inputLatency.getAndClearMeasurements();
    if (!measurements) {
      return;
    }
    this._telemetryService.publicLog2("performance.inputLatency", {
      keydown: measurements.keydown,
      input: measurements.input,
      render: measurements.render,
      total: measurements.total,
      sampleCount: measurements.sampleCount
    });
  }
};
InputLatencyContrib = __decorateClass([
  __decorateParam(0, IEditorService),
  __decorateParam(1, ITelemetryService)
], InputLatencyContrib);
export {
  InputLatencyContrib
};
//# sourceMappingURL=inputLatencyContrib.js.map
