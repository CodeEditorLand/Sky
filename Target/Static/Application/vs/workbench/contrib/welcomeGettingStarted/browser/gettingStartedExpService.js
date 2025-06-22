var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Disposable } from "../../../../base/common/lifecycle.js";
import { IStorageService } from "../../../../platform/storage/common/storage.js";
import { ITelemetryService } from "../../../../platform/telemetry/common/telemetry.js";
import { registerSingleton } from "../../../../platform/instantiation/common/extensions.js";
import { createDecorator } from "../../../../platform/instantiation/common/instantiation.js";
import { IProductService } from "../../../../platform/product/common/productService.js";
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
const IGettingStartedExperimentService = createDecorator("gettingStartedExperimentService");
const EXPERIMENT_STORAGE_KEY = "gettingStartedExperiment";
var GettingStartedExperimentGroup;
(function(GettingStartedExperimentGroup2) {
  GettingStartedExperimentGroup2["New"] = "newExp";
  GettingStartedExperimentGroup2["Control"] = "controlExp";
  GettingStartedExperimentGroup2["Default"] = "defaultExp";
})(GettingStartedExperimentGroup || (GettingStartedExperimentGroup = {}));
const STABLE_EXPERIMENT_GROUPS = [
  // Bump the iteration each time we change group allocations
  { name: GettingStartedExperimentGroup.New, min: 0, max: 0.2, iteration: 1, walkthroughId: "NewWelcomeExperience" },
  { name: GettingStartedExperimentGroup.Control, min: 0.2, max: 0.4, iteration: 1, walkthroughId: "Setup" },
  { name: GettingStartedExperimentGroup.Default, min: 0.4, max: 1, iteration: 1, walkthroughId: "Setup" }
];
const INSIDERS_EXPERIMENT_GROUPS = [
  // Bump the iteration each time we change group allocations
  { name: GettingStartedExperimentGroup.New, min: 0, max: 0.3, iteration: 1, walkthroughId: "NewWelcomeExperience" },
  { name: GettingStartedExperimentGroup.Control, min: 0.3, max: 0.6, iteration: 1, walkthroughId: "Setup" },
  { name: GettingStartedExperimentGroup.Default, min: 0.6, max: 1, iteration: 1, walkthroughId: "Setup" }
];
let GettingStartedExperimentService = class GettingStartedExperimentService2 extends Disposable {
  static {
    __name(this, "GettingStartedExperimentService");
  }
  constructor(storageService, telemetryService, productService) {
    super();
    this.storageService = storageService;
    this.telemetryService = telemetryService;
    this.productService = productService;
    this.experiment = this.getOrCreateExperiment();
    this.sendExperimentTelemetry();
  }
  getExperimentAllocation() {
    const quality = this.productService.quality;
    if (quality === "stable") {
      return STABLE_EXPERIMENT_GROUPS;
    } else if (quality === "insider") {
      return INSIDERS_EXPERIMENT_GROUPS;
    }
    return;
  }
  getOrCreateExperiment() {
    const storedExperiment = this.storageService.get(
      EXPERIMENT_STORAGE_KEY,
      -1
      /* StorageScope.APPLICATION */
    );
    if (storedExperiment) {
      try {
        return JSON.parse(storedExperiment);
      } catch (e) {
        this.storageService.remove(
          EXPERIMENT_STORAGE_KEY,
          -1
          /* StorageScope.APPLICATION */
        );
      }
    }
    const newExperiment = this.createNewExperiment();
    if (!newExperiment) {
      return;
    }
    this.storageService.store(
      EXPERIMENT_STORAGE_KEY,
      JSON.stringify(newExperiment),
      -1,
      1
      /* StorageTarget.MACHINE */
    );
    return newExperiment;
  }
  createNewExperiment() {
    const cohort = Math.random();
    const experimentGroups = this.getExperimentAllocation();
    if (!experimentGroups) {
      return;
    }
    for (const group of experimentGroups) {
      if (cohort >= group.min && cohort < group.max) {
        return { cohort, experimentGroup: group.name, walkthroughId: group.walkthroughId, iteration: group.iteration };
      }
    }
    return;
  }
  sendExperimentTelemetry() {
    if (!this.experiment) {
      return;
    }
    this.telemetryService.publicLog2("gettingStarted.experimentCohort", {
      cohort: this.experiment.cohort,
      experimentGroup: this.experiment.experimentGroup,
      iteration: this.experiment.iteration,
      walkthroughId: this.experiment.walkthroughId
    });
  }
  getCurrentExperiment() {
    return this.experiment;
  }
};
GettingStartedExperimentService = __decorate([
  __param(0, IStorageService),
  __param(1, ITelemetryService),
  __param(2, IProductService)
], GettingStartedExperimentService);
registerSingleton(
  IGettingStartedExperimentService,
  GettingStartedExperimentService,
  1
  /* InstantiationType.Delayed */
);
export {
  GettingStartedExperimentGroup,
  GettingStartedExperimentService,
  IGettingStartedExperimentService
};
//# sourceMappingURL=gettingStartedExpService.js.map
