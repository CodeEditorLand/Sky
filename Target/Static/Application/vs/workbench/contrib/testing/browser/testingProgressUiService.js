var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Disposable, DisposableStore } from "../../../../base/common/lifecycle.js";
import { autorun } from "../../../../base/common/observable.js";
import { localize } from "../../../../nls.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { ExplorerTestCoverageBars } from "./testCoverageBars.js";
import { getTestingConfiguration } from "../common/configuration.js";
import { ITestCoverageService } from "../common/testCoverageService.js";
import { isFailedState } from "../common/testingStates.js";
import { ITestResultService } from "../common/testResultService.js";
import { IViewsService } from "../../../services/views/common/viewsService.js";
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
let TestingProgressTrigger = class TestingProgressTrigger2 extends Disposable {
  static {
    __name(this, "TestingProgressTrigger");
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
const collectTestStateCounts = /* @__PURE__ */ __name((isRunning, results) => {
  let passed = 0;
  let failed = 0;
  let skipped = 0;
  let running = 0;
  let queued = 0;
  for (const result of results) {
    const count = result.counts;
    failed += count[
      6
      /* TestResultState.Errored */
    ] + count[
      4
      /* TestResultState.Failed */
    ];
    passed += count[
      3
      /* TestResultState.Passed */
    ];
    skipped += count[
      5
      /* TestResultState.Skipped */
    ];
    running += count[
      2
      /* TestResultState.Running */
    ];
    queued += count[
      1
      /* TestResultState.Queued */
    ];
  }
  return {
    isRunning,
    passed,
    failed,
    runSoFar: passed + failed,
    totalWillBeRun: passed + failed + queued + running,
    skipped
  };
}, "collectTestStateCounts");
const getTestProgressText = /* @__PURE__ */ __name(({ isRunning, passed, runSoFar, totalWillBeRun, skipped, failed }) => {
  let percent = passed / runSoFar * 100;
  if (failed > 0) {
    percent = Math.min(percent, 99.9);
  } else if (runSoFar === 0) {
    percent = 0;
  }
  if (isRunning) {
    if (runSoFar === 0) {
      return localize("testProgress.runningInitial", "Running tests...");
    } else if (skipped === 0) {
      return localize("testProgress.running", "Running tests, {0}/{1} passed ({2}%)", passed, totalWillBeRun, percent.toPrecision(3));
    } else {
      return localize("testProgressWithSkip.running", "Running tests, {0}/{1} tests passed ({2}%, {3} skipped)", passed, totalWillBeRun, percent.toPrecision(3), skipped);
    }
  } else {
    if (skipped === 0) {
      return localize("testProgress.completed", "{0}/{1} tests passed ({2}%)", passed, runSoFar, percent.toPrecision(3));
    } else {
      return localize("testProgressWithSkip.completed", "{0}/{1} tests passed ({2}%, {3} skipped)", passed, runSoFar, percent.toPrecision(3), skipped);
    }
  }
}, "getTestProgressText");
export {
  TestingProgressTrigger,
  collectTestStateCounts,
  getTestProgressText
};
//# sourceMappingURL=testingProgressUiService.js.map
