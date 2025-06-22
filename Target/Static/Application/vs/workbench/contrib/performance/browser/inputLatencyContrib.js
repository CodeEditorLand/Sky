var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { inputLatency } from "../../../../base/browser/performance.js";
import { RunOnceScheduler } from "../../../../base/common/async.js";
import { Event } from "../../../../base/common/event.js";
import { Disposable, MutableDisposable } from "../../../../base/common/lifecycle.js";
import { ITelemetryService } from "../../../../platform/telemetry/common/telemetry.js";
import { IEditorService } from "../../../services/editor/common/editorService.js";
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
let InputLatencyContrib = class InputLatencyContrib2 extends Disposable {
  static {
    __name(this, "InputLatencyContrib");
  }
  constructor(_editorService, _telemetryService) {
    super();
    this._editorService = _editorService;
    this._telemetryService = _telemetryService;
    this._listener = this._register(new MutableDisposable());
    this._scheduler = this._register(new RunOnceScheduler(() => {
      this._logSamples();
      this._setupListener();
    }, 6e4));
    if (Math.random() <= 0.01) {
      this._setupListener();
    }
  }
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
InputLatencyContrib = __decorate([
  __param(0, IEditorService),
  __param(1, ITelemetryService)
], InputLatencyContrib);
export {
  InputLatencyContrib
};
//# sourceMappingURL=inputLatencyContrib.js.map
