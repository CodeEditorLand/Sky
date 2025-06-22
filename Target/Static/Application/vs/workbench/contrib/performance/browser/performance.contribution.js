var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { localize2 } from "../../../../nls.js";
import { registerAction2, Action2 } from "../../../../platform/actions/common/actions.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { Registry } from "../../../../platform/registry/common/platform.js";
import { Categories } from "../../../../platform/action/common/actionCommonCategories.js";
import { Extensions, registerWorkbenchContribution2 } from "../../../common/contributions.js";
import { EditorExtensions } from "../../../common/editor.js";
import { PerfviewContrib, PerfviewInput } from "./perfviewEditor.js";
import { IEditorService } from "../../../services/editor/common/editorService.js";
import { InstantiationService, Trace } from "../../../../platform/instantiation/common/instantiationService.js";
import { EventProfiling } from "../../../../base/common/event.js";
import { InputLatencyContrib } from "./inputLatencyContrib.js";
import { IEnvironmentService } from "../../../../platform/environment/common/environment.js";
import { GCBasedDisposableTracker, setDisposableTracker } from "../../../../base/common/lifecycle.js";
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
registerWorkbenchContribution2(PerfviewContrib.ID, PerfviewContrib, { lazy: true });
Registry.as(EditorExtensions.EditorFactory).registerEditorSerializer(PerfviewInput.Id, class {
  canSerialize() {
    return true;
  }
  serialize() {
    return "";
  }
  deserialize(instantiationService) {
    return instantiationService.createInstance(PerfviewInput);
  }
});
registerAction2(class extends Action2 {
  constructor() {
    super({
      id: "perfview.show",
      title: localize2("show.label", "Startup Performance"),
      category: Categories.Developer,
      f1: true
    });
  }
  run(accessor) {
    const editorService = accessor.get(IEditorService);
    const contrib = PerfviewContrib.get();
    return editorService.openEditor(contrib.getEditorInput(), { pinned: true });
  }
});
registerAction2(class PrintServiceCycles extends Action2 {
  static {
    __name(this, "PrintServiceCycles");
  }
  constructor() {
    super({
      id: "perf.insta.printAsyncCycles",
      title: localize2("cycles", "Print Service Cycles"),
      category: Categories.Developer,
      f1: true
    });
  }
  run(accessor) {
    const instaService = accessor.get(IInstantiationService);
    if (instaService instanceof InstantiationService) {
      const cycle = instaService._globalGraph?.findCycleSlow();
      if (cycle) {
        console.warn(`CYCLE`, cycle);
      } else {
        console.warn(`YEAH, no more cycles`);
      }
    }
  }
});
registerAction2(class PrintServiceTraces extends Action2 {
  static {
    __name(this, "PrintServiceTraces");
  }
  constructor() {
    super({
      id: "perf.insta.printTraces",
      title: localize2("insta.trace", "Print Service Traces"),
      category: Categories.Developer,
      f1: true
    });
  }
  run() {
    if (Trace.all.size === 0) {
      console.log("Enable via `instantiationService.ts#_enableAllTracing`");
      return;
    }
    for (const item of Trace.all) {
      console.log(item);
    }
  }
});
registerAction2(class PrintEventProfiling extends Action2 {
  static {
    __name(this, "PrintEventProfiling");
  }
  constructor() {
    super({
      id: "perf.event.profiling",
      title: localize2("emitter", "Print Emitter Profiles"),
      category: Categories.Developer,
      f1: true
    });
  }
  run() {
    if (EventProfiling.all.size === 0) {
      console.log("USE `EmitterOptions._profName` to enable profiling");
      return;
    }
    for (const item of EventProfiling.all) {
      console.log(`${item.name}: ${item.invocationCount} invocations COST ${item.elapsedOverall}ms, ${item.listenerCount} listeners, avg cost is ${item.durations.reduce((a, b) => a + b, 0) / item.durations.length}ms`);
    }
  }
});
Registry.as(Extensions.Workbench).registerWorkbenchContribution(
  InputLatencyContrib,
  4
  /* LifecyclePhase.Eventually */
);
let DisposableTracking = class DisposableTracking2 {
  static {
    __name(this, "DisposableTracking");
  }
  static {
    this.Id = "perf.disposableTracking";
  }
  constructor(envService) {
    if (!envService.isBuilt && !envService.extensionTestsLocationURI) {
      setDisposableTracker(new GCBasedDisposableTracker());
    }
  }
};
DisposableTracking = __decorate([
  __param(0, IEnvironmentService)
], DisposableTracking);
registerWorkbenchContribution2(
  DisposableTracking.Id,
  DisposableTracking,
  4
  /* WorkbenchPhase.Eventually */
);
//# sourceMappingURL=performance.contribution.js.map
