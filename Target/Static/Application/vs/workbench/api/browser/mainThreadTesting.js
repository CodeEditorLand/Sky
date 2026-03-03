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
import { Event } from "../../../base/common/event.js";
import { Disposable, DisposableStore, MutableDisposable, toDisposable } from "../../../base/common/lifecycle.js";
import { observableValue, transaction } from "../../../base/common/observable.js";
import { WellDefinedPrefixTree } from "../../../base/common/prefixTree.js";
import { URI } from "../../../base/common/uri.js";
import { Range } from "../../../editor/common/core/range.js";
import { IUriIdentityService } from "../../../platform/uriIdentity/common/uriIdentity.js";
import { TestCoverage } from "../../contrib/testing/common/testCoverage.js";
import { TestId } from "../../contrib/testing/common/testId.js";
import { ITestProfileService } from "../../contrib/testing/common/testProfileService.js";
import { LiveTestResult } from "../../contrib/testing/common/testResult.js";
import { ITestResultService } from "../../contrib/testing/common/testResultService.js";
import { ITestService } from "../../contrib/testing/common/testService.js";
import { CoverageDetails, IFileCoverage, ITestItem, ITestMessage, TestsDiffOp } from "../../contrib/testing/common/testTypes.js";
import { extHostNamedCustomer } from "../../services/extensions/common/extHostCustomers.js";
import { ExtHostContext, MainContext } from "../common/extHost.protocol.js";
let MainThreadTesting = class MainThreadTesting2 extends Disposable {
  static {
    __name(this, "MainThreadTesting");
  }
  constructor(extHostContext, uriIdentityService, testService, testProfiles, resultService) {
    super();
    this.uriIdentityService = uriIdentityService;
    this.testService = testService;
    this.testProfiles = testProfiles;
    this.resultService = resultService;
    this.diffListener = this._register(new MutableDisposable());
    this.testProviderRegistrations = /* @__PURE__ */ new Map();
    this.proxy = extHostContext.getProxy(ExtHostContext.ExtHostTesting);
    this._register(this.testService.registerExtHost({
      provideTestFollowups: /* @__PURE__ */ __name((req, token) => this.proxy.$provideTestFollowups(req, token), "provideTestFollowups"),
      executeTestFollowup: /* @__PURE__ */ __name((id) => this.proxy.$executeTestFollowup(id), "executeTestFollowup"),
      disposeTestFollowups: /* @__PURE__ */ __name((ids) => this.proxy.$disposeTestFollowups(ids), "disposeTestFollowups"),
      getTestsRelatedToCode: /* @__PURE__ */ __name((uri, position, token) => this.proxy.$getTestsRelatedToCode(uri, position, token), "getTestsRelatedToCode")
    }));
    this._register(this.testService.onDidCancelTestRun(({ runId, taskId }) => {
      this.proxy.$cancelExtensionTestRun(runId, taskId);
    }));
    this._register(Event.debounce(testProfiles.onDidChange, (_last, e) => e)(() => {
      const obj = {};
      for (const group of [
        2,
        4,
        8
        /* TestRunProfileBitset.Coverage */
      ]) {
        for (const profile of this.testProfiles.getGroupDefaultProfiles(group)) {
          obj[profile.controllerId] ??= [];
          obj[profile.controllerId].push(profile.profileId);
        }
      }
      this.proxy.$setDefaultRunProfiles(obj);
    }));
    this._register(resultService.onResultsChanged((evt) => {
      if ("completed" in evt) {
        const serialized = evt.completed.toJSONWithMessages();
        if (serialized) {
          this.proxy.$publishTestResults([serialized]);
        }
      } else if ("removed" in evt) {
        evt.removed.forEach((r) => {
          if (r instanceof LiveTestResult) {
            this.proxy.$disposeRun(r.id);
          }
        });
      }
    }));
  }
  /**
   * @inheritdoc
   */
  $markTestRetired(testIds) {
    let tree;
    if (testIds) {
      tree = new WellDefinedPrefixTree();
      for (const id of testIds) {
        tree.insert(TestId.fromString(id).path, void 0);
      }
    }
    for (const result of this.resultService.results) {
      if (result instanceof LiveTestResult) {
        result.markRetired(tree);
      }
    }
  }
  /**
   * @inheritdoc
   */
  $publishTestRunProfile(profile) {
    const controller = this.testProviderRegistrations.get(profile.controllerId);
    if (controller) {
      this.testProfiles.addProfile(controller.instance, profile);
    }
  }
  /**
   * @inheritdoc
   */
  $updateTestRunConfig(controllerId, profileId, update) {
    this.testProfiles.updateProfile(controllerId, profileId, update);
  }
  /**
   * @inheritdoc
   */
  $removeTestProfile(controllerId, profileId) {
    this.testProfiles.removeProfile(controllerId, profileId);
  }
  /**
   * @inheritdoc
   */
  $addTestsToRun(controllerId, runId, tests) {
    this.withLiveRun(runId, (r) => r.addTestChainToRun(controllerId, tests.map((t) => ITestItem.deserialize(this.uriIdentityService, t))));
  }
  /**
   * @inheritdoc
   */
  $appendCoverage(runId, taskId, coverage) {
    this.withLiveRun(runId, (run) => {
      const task = run.tasks.find((t) => t.id === taskId);
      if (!task) {
        return;
      }
      const deserialized = IFileCoverage.deserialize(this.uriIdentityService, coverage);
      transaction((tx) => {
        let value = task.coverage.read(void 0);
        if (!value) {
          value = new TestCoverage(run, taskId, this.uriIdentityService, {
            getCoverageDetails: /* @__PURE__ */ __name((id, testId, token) => this.proxy.$getCoverageDetails(id, testId, token).then((r) => r.map(CoverageDetails.deserialize)), "getCoverageDetails")
          });
          value.append(deserialized, tx);
          task.coverage.set(value, tx);
        } else {
          value.append(deserialized, tx);
        }
      });
    });
  }
  /**
   * @inheritdoc
   */
  $startedExtensionTestRun(req) {
    this.resultService.createLiveResult(req);
  }
  /**
   * @inheritdoc
   */
  $startedTestRunTask(runId, task) {
    this.withLiveRun(runId, (r) => r.addTask(task));
  }
  /**
   * @inheritdoc
   */
  $finishedTestRunTask(runId, taskId) {
    this.withLiveRun(runId, (r) => r.markTaskComplete(taskId));
  }
  /**
   * @inheritdoc
   */
  $finishedExtensionTestRun(runId) {
    this.withLiveRun(runId, (r) => r.markComplete());
  }
  /**
   * @inheritdoc
   */
  $updateTestStateInRun(runId, taskId, testId, state, duration) {
    this.withLiveRun(runId, (r) => r.updateState(testId, taskId, state, duration));
  }
  /**
   * @inheritdoc
   */
  $appendOutputToRun(runId, taskId, output, locationDto, testId) {
    const location = locationDto && {
      uri: URI.revive(locationDto.uri),
      range: Range.lift(locationDto.range)
    };
    this.withLiveRun(runId, (r) => r.appendOutput(output, taskId, location, testId));
  }
  /**
   * @inheritdoc
   */
  $appendTestMessagesInRun(runId, taskId, testId, messages) {
    const r = this.resultService.getResult(runId);
    if (r && r instanceof LiveTestResult) {
      for (const message of messages) {
        r.appendMessage(testId, taskId, ITestMessage.deserialize(this.uriIdentityService, message));
      }
    }
  }
  /**
   * @inheritdoc
   */
  $registerTestController(controllerId, _label, _capabilities) {
    const disposable = new DisposableStore();
    const label = observableValue(`${controllerId}.label`, _label);
    const capabilities = observableValue(`${controllerId}.cap`, _capabilities);
    const controller = {
      id: controllerId,
      label,
      capabilities,
      syncTests: /* @__PURE__ */ __name(() => this.proxy.$syncTests(), "syncTests"),
      refreshTests: /* @__PURE__ */ __name((token) => this.proxy.$refreshTests(controllerId, token), "refreshTests"),
      configureRunProfile: /* @__PURE__ */ __name((id) => this.proxy.$configureRunProfile(controllerId, id), "configureRunProfile"),
      runTests: /* @__PURE__ */ __name((reqs, token) => this.proxy.$runControllerTests(reqs, token), "runTests"),
      startContinuousRun: /* @__PURE__ */ __name((reqs, token) => this.proxy.$startContinuousRun(reqs, token), "startContinuousRun"),
      expandTest: /* @__PURE__ */ __name((testId, levels) => this.proxy.$expandTest(testId, isFinite(levels) ? levels : -1), "expandTest"),
      getRelatedCode: /* @__PURE__ */ __name((testId, token) => this.proxy.$getCodeRelatedToTest(testId, token).then((locations) => locations.map((l) => ({
        uri: URI.revive(l.uri),
        range: Range.lift(l.range)
      }))), "getRelatedCode")
    };
    disposable.add(toDisposable(() => this.testProfiles.removeProfile(controllerId)));
    disposable.add(this.testService.registerTestController(controllerId, controller));
    this.testProviderRegistrations.set(controllerId, {
      instance: controller,
      label,
      capabilities,
      disposable
    });
  }
  /**
   * @inheritdoc
   */
  $updateController(controllerId, patch) {
    const controller = this.testProviderRegistrations.get(controllerId);
    if (!controller) {
      return;
    }
    transaction((tx) => {
      if (patch.label !== void 0) {
        controller.label.set(patch.label, tx);
      }
      if (patch.capabilities !== void 0) {
        controller.capabilities.set(patch.capabilities, tx);
      }
    });
  }
  /**
   * @inheritdoc
   */
  $unregisterTestController(controllerId) {
    this.testProviderRegistrations.get(controllerId)?.disposable.dispose();
    this.testProviderRegistrations.delete(controllerId);
  }
  /**
   * @inheritdoc
   */
  $subscribeToDiffs() {
    this.proxy.$acceptDiff(this.testService.collection.getReviverDiff().map(TestsDiffOp.serialize));
    this.diffListener.value = this.testService.onDidProcessDiff(this.proxy.$acceptDiff, this.proxy);
  }
  /**
   * @inheritdoc
   */
  $unsubscribeFromDiffs() {
    this.diffListener.clear();
  }
  /**
   * @inheritdoc
   */
  $publishDiff(controllerId, diff) {
    this.testService.publishDiff(controllerId, diff.map((d) => TestsDiffOp.deserialize(this.uriIdentityService, d)));
  }
  /**
   * @inheritdoc
   */
  async $runTests(req, token) {
    const result = await this.testService.runResolvedTests(req, token);
    return result.id;
  }
  /**
   * @inheritdoc
   */
  async $getCoverageDetails(resultId, taskIndex, uri, token) {
    const details = await this.resultService.getResult(resultId)?.tasks[taskIndex]?.coverage.get()?.getUri(URI.from(uri))?.details(token);
    return details || [];
  }
  dispose() {
    super.dispose();
    for (const subscription of this.testProviderRegistrations.values()) {
      subscription.disposable.dispose();
    }
    this.testProviderRegistrations.clear();
  }
  withLiveRun(runId, fn) {
    const r = this.resultService.getResult(runId);
    return r && r instanceof LiveTestResult ? fn(r) : void 0;
  }
};
MainThreadTesting = __decorate([
  extHostNamedCustomer(MainContext.MainThreadTesting),
  __param(1, IUriIdentityService),
  __param(2, ITestService),
  __param(3, ITestProfileService),
  __param(4, ITestResultService)
], MainThreadTesting);
export {
  MainThreadTesting
};
//# sourceMappingURL=mainThreadTesting.js.map
