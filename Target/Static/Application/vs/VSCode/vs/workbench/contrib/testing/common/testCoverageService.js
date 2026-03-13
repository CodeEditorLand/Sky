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
import { CancellationTokenSource } from "../../../../base/common/cancellation.js";
import { Iterable } from "../../../../base/common/iterator.js";
import { Disposable, MutableDisposable } from "../../../../base/common/lifecycle.js";
import { observableValue, transaction } from "../../../../base/common/observable.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { IContextKeyService } from "../../../../platform/contextkey/common/contextkey.js";
import { createDecorator } from "../../../../platform/instantiation/common/instantiation.js";
import { bindContextKey, observableConfigValue } from "../../../../platform/observable/common/platformObservableUtils.js";
import { ITestResultService } from "./testResultService.js";
import { TestingContextKeys } from "./testingContextKeys.js";
import { IViewsService } from "../../../services/views/common/viewsService.js";
const ITestCoverageService = createDecorator("testCoverageService");
let TestCoverageService = class TestCoverageService2 extends Disposable {
  static {
    __name(this, "TestCoverageService");
  }
  constructor(contextKeyService, resultService, configService, viewsService) {
    super();
    this.viewsService = viewsService;
    this.lastOpenCts = this._register(new MutableDisposable());
    this.selected = observableValue("testCoverage", void 0);
    this.filterToTest = observableValue("filterToTest", void 0);
    this.showInline = observableValue("inlineCoverage", false);
    const toolbarConfig = observableConfigValue("testing.coverageToolbarEnabled", true, configService);
    this._register(bindContextKey(TestingContextKeys.coverageToolbarEnabled, contextKeyService, (reader) => toolbarConfig.read(reader)));
    this._register(bindContextKey(TestingContextKeys.inlineCoverageEnabled, contextKeyService, (reader) => this.showInline.read(reader)));
    this._register(bindContextKey(TestingContextKeys.isTestCoverageOpen, contextKeyService, (reader) => !!this.selected.read(reader)));
    this._register(bindContextKey(TestingContextKeys.hasPerTestCoverage, contextKeyService, (reader) => !Iterable.isEmpty(this.selected.read(reader)?.allPerTestIDs())));
    this._register(bindContextKey(TestingContextKeys.isCoverageFilteredToTest, contextKeyService, (reader) => !!this.filterToTest.read(reader)));
    this._register(resultService.onResultsChanged((evt) => {
      if ("completed" in evt) {
        const coverage = evt.completed.tasks.find((t) => t.coverage.get());
        if (coverage) {
          this.openCoverage(coverage, false);
        } else {
          this.closeCoverage();
        }
      } else if ("removed" in evt && this.selected.get()) {
        const taskId = this.selected.get()?.fromTaskId;
        if (evt.removed.some((e) => e.tasks.some((t) => t.id === taskId))) {
          this.closeCoverage();
        }
      }
    }));
  }
  /** @inheritdoc */
  async openCoverage(task, focus = true) {
    this.lastOpenCts.value?.cancel();
    const cts = this.lastOpenCts.value = new CancellationTokenSource();
    const coverage = task.coverage.get();
    if (!coverage) {
      return;
    }
    transaction((tx) => {
      this.filterToTest.set(void 0, tx);
      this.selected.set(coverage, tx);
    });
    if (focus && !cts.token.isCancellationRequested) {
      this.viewsService.openView("workbench.view.testCoverage", true);
    }
  }
  /** @inheritdoc */
  closeCoverage() {
    this.selected.set(void 0, void 0);
  }
};
TestCoverageService = __decorate([
  __param(0, IContextKeyService),
  __param(1, ITestResultService),
  __param(2, IConfigurationService),
  __param(3, IViewsService)
], TestCoverageService);
export {
  ITestCoverageService,
  TestCoverageService
};
//# sourceMappingURL=testCoverageService.js.map
