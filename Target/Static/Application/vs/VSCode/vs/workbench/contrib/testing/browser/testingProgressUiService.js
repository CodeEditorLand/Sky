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
import { Disposable, DisposableStore } from "../../../../base/common/lifecycle.js";
import { autorun } from "../../../../base/common/observable.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { IViewsService } from "../../../services/views/common/viewsService.js";
import { getTestingConfiguration } from "../common/configuration.js";
import { ITestCoverageService } from "../common/testCoverageService.js";
import { isFailedState } from "../common/testingStates.js";
import { ITestResultService } from "../common/testResultService.js";
import { ExplorerTestCoverageBars } from "./testCoverageBars.js";
let TestingProgressTrigger = class TestingProgressTrigger2 extends Disposable {
  static {
    __name(this, "TestingProgressTrigger");
  }
  static {
    this.ID = "workbench.contrib.testing.progressTrigger";
  }
  constructor(resultService, testCoverageService, configurationService, viewsService) {
    super();
    this.configurationService = configurationService;
    this.viewsService = viewsService;
    this._register(resultService.onResultsChanged((e) => {
      if ("started" in e) {
        this.attachAutoOpenForNewResults(e.started);
      }
    }));
    const barContributionRegistration = autorun((reader) => {
      const hasCoverage = !!testCoverageService.selected.read(reader);
      if (!hasCoverage) {
        return;
      }
      barContributionRegistration.dispose();
      ExplorerTestCoverageBars.register();
    });
    this._register(barContributionRegistration);
  }
  attachAutoOpenForNewResults(result) {
    if (result.request.preserveFocus === true) {
      return;
    }
    const cfg = getTestingConfiguration(
      this.configurationService,
      "testing.automaticallyOpenTestResults"
      /* TestingConfigKeys.OpenResults */
    );
    if (cfg === "neverOpen") {
      return;
    }
    if (cfg === "openExplorerOnTestStart") {
      return this.openExplorerView();
    }
    if (cfg === "openOnTestStart") {
      return this.openResultsView();
    }
    const disposable = new DisposableStore();
    disposable.add(result.onComplete(() => disposable.dispose()));
    disposable.add(result.onChange((e) => {
      if (e.reason === 1 && isFailedState(e.item.ownComputedState)) {
        this.openResultsView();
        disposable.dispose();
      }
    }));
  }
  openExplorerView() {
    this.viewsService.openView("workbench.view.testing", false);
  }
  openResultsView() {
    this.viewsService.openView("workbench.panel.testResults.view", false);
  }
};
TestingProgressTrigger = __decorate([
  __param(0, ITestResultService),
  __param(1, ITestCoverageService),
  __param(2, IConfigurationService),
  __param(3, IViewsService)
], TestingProgressTrigger);
export {
  TestingProgressTrigger
};
//# sourceMappingURL=testingProgressUiService.js.map
