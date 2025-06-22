var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { groupBy } from "../../../../base/common/arrays.js";
import { CancellationToken, CancellationTokenSource } from "../../../../base/common/cancellation.js";
import { Emitter } from "../../../../base/common/event.js";
import { Iterable } from "../../../../base/common/iterator.js";
import { Disposable, toDisposable } from "../../../../base/common/lifecycle.js";
import { observableValue } from "../../../../base/common/observable.js";
import { isDefined } from "../../../../base/common/types.js";
import { localize } from "../../../../nls.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { IContextKeyService } from "../../../../platform/contextkey/common/contextkey.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { INotificationService } from "../../../../platform/notification/common/notification.js";
import { bindContextKey } from "../../../../platform/observable/common/platformObservableUtils.js";
import { IStorageService } from "../../../../platform/storage/common/storage.js";
import { IUriIdentityService } from "../../../../platform/uriIdentity/common/uriIdentity.js";
import { IWorkspaceTrustRequestService } from "../../../../platform/workspace/common/workspaceTrust.js";
import { getTestingConfiguration } from "./configuration.js";
import { MainThreadTestCollection } from "./mainThreadTestCollection.js";
import { MutableObservableValue } from "./observableValue.js";
import { StoredValue } from "./storedValue.js";
import { TestExclusions } from "./testExclusions.js";
import { TestId } from "./testId.js";
import { TestingContextKeys } from "./testingContextKeys.js";
import { canUseProfileWithTest, ITestProfileService } from "./testProfileService.js";
import { ITestResultService } from "./testResultService.js";
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
let TestService = class TestService2 extends Disposable {
  static {
    __name(this, "TestService");
  }
  constructor(contextKeyService, instantiationService, uriIdentityService, storage, editorService, testProfiles, notificationService, configurationService, testResults, workspaceTrustRequestService) {
    super();
    this.editorService = editorService;
    this.testProfiles = testProfiles;
    this.notificationService = notificationService;
    this.configurationService = configurationService;
    this.testResults = testResults;
    this.workspaceTrustRequestService = workspaceTrustRequestService;
    this.testControllers = observableValue("testControllers", /* @__PURE__ */ new Map());
    this.testExtHosts = /* @__PURE__ */ new Set();
    this.cancelExtensionTestRunEmitter = new Emitter();
    this.willProcessDiffEmitter = new Emitter();
    this.didProcessDiffEmitter = new Emitter();
    this.testRefreshCancellations = /* @__PURE__ */ new Set();
    this.uiRunningTests = /* @__PURE__ */ new Map();
    this.onWillProcessDiff = this.willProcessDiffEmitter.event;
    this.onDidProcessDiff = this.didProcessDiffEmitter.event;
    this.onDidCancelTestRun = this.cancelExtensionTestRunEmitter.event;
    this.collection = new MainThreadTestCollection(uriIdentityService, this.expandTest.bind(this));
    this.showInlineOutput = this._register(MutableObservableValue.stored(new StoredValue({
      key: "inlineTestOutputVisible",
      scope: 1,
      target: 0
      /* StorageTarget.USER */
    }, storage), true));
    this.excluded = instantiationService.createInstance(TestExclusions);
    this.isRefreshingTests = TestingContextKeys.isRefreshingTests.bindTo(contextKeyService);
    this.activeEditorHasTests = TestingContextKeys.activeEditorHasTests.bindTo(contextKeyService);
    this._register(bindContextKey(TestingContextKeys.providerCount, contextKeyService, (reader) => this.testControllers.read(reader).size));
    const bindCapability = /* @__PURE__ */ __name((key, capability) => this._register(bindContextKey(key, contextKeyService, (reader) => Iterable.some(this.testControllers.read(reader).values(), (ctrl) => !!(ctrl.capabilities.read(reader) & capability)))), "bindCapability");
    bindCapability(
      TestingContextKeys.canRefreshTests,
      2
      /* TestControllerCapability.Refresh */
    );
    bindCapability(
      TestingContextKeys.canGoToRelatedCode,
      4
      /* TestControllerCapability.CodeRelatedToTest */
    );
    bindCapability(
      TestingContextKeys.canGoToRelatedTest,
      8
      /* TestControllerCapability.TestRelatedToCode */
    );
    this._register(editorService.onDidActiveEditorChange(() => this.updateEditorContextKeys()));
  }
  /**
   * @inheritdoc
   */
  async expandTest(id, levels) {
    await this.testControllers.get().get(TestId.fromString(id).controllerId)?.expandTest(id, levels);
  }
  /**
   * @inheritdoc
   */
  cancelTestRun(runId, taskId) {
    this.cancelExtensionTestRunEmitter.fire({ runId, taskId });
    if (runId === void 0) {
      for (const runCts of this.uiRunningTests.values()) {
        runCts.cancel();
      }
    } else if (!taskId) {
      this.uiRunningTests.get(runId)?.cancel();
    }
  }
  /**
   * @inheritdoc
   */
  async runTests(req, token = CancellationToken.None) {
    const byProfile = [];
    for (const test of req.tests) {
      const existing = byProfile.find((p) => canUseProfileWithTest(p.profile, test));
      if (existing) {
        existing.tests.push(test);
        continue;
      }
      const bestProfile = this.testProfiles.getDefaultProfileForTest(req.group, test);
      if (!bestProfile) {
        continue;
      }
      byProfile.push({ profile: bestProfile, tests: [test] });
    }
    const resolved = {
      targets: byProfile.map(({ profile, tests }) => ({
        profileId: profile.profileId,
        controllerId: tests[0].controllerId,
        testIds: tests.map((t) => t.item.extId)
      })),
      group: req.group,
      exclude: req.exclude?.map((t) => t.item.extId),
      continuous: req.continuous
    };
    if (resolved.targets.length === 0) {
      for (const byController of groupBy(req.tests, (a, b) => a.controllerId === b.controllerId ? 0 : 1)) {
        const profiles = this.testProfiles.getControllerProfiles(byController[0].controllerId);
        const withControllers = byController.map((test) => ({
          profile: profiles.find((p) => p.group === req.group && canUseProfileWithTest(p, test)),
          test
        }));
        for (const byProfile2 of groupBy(withControllers, (a, b) => a.profile === b.profile ? 0 : 1)) {
          const profile = byProfile2[0].profile;
          if (profile) {
            resolved.targets.push({
              testIds: byProfile2.map((t) => t.test.item.extId),
              profileId: profile.profileId,
              controllerId: profile.controllerId
            });
          }
        }
      }
    }
    return this.runResolvedTests(resolved, token);
  }
  /** @inheritdoc */
  async startContinuousRun(req, token) {
    if (!req.exclude) {
      req.exclude = [...this.excluded.all];
    }
    const trust = await this.workspaceTrustRequestService.requestWorkspaceTrust({
      message: localize("testTrust", "Running tests may execute code in your workspace.")
    });
    if (!trust) {
      return;
    }
    const byController = groupBy(req.targets, (a, b) => a.controllerId.localeCompare(b.controllerId));
    const requests = byController.map((group) => this.getTestController(group[0].controllerId)?.startContinuousRun(group.map((controlReq) => ({
      excludeExtIds: req.exclude.filter((t) => !controlReq.testIds.includes(t)),
      profileId: controlReq.profileId,
      controllerId: controlReq.controllerId,
      testIds: controlReq.testIds
    })), token).then((result) => {
      const errs = result.map((r) => r.error).filter(isDefined);
      if (errs.length) {
        this.notificationService.error(localize("testError", "An error occurred attempting to run tests: {0}", errs.join(" ")));
      }
    }));
    await Promise.all(requests);
  }
  /**
   * @inheritdoc
   */
  async runResolvedTests(req, token = CancellationToken.None) {
    if (!req.exclude) {
      req.exclude = [...this.excluded.all];
    }
    const result = this.testResults.createLiveResult(req);
    const trust = await this.workspaceTrustRequestService.requestWorkspaceTrust({
      message: localize("testTrust", "Running tests may execute code in your workspace.")
    });
    if (!trust) {
      result.markComplete();
      return result;
    }
    try {
      const cancelSource = new CancellationTokenSource(token);
      this.uiRunningTests.set(result.id, cancelSource);
      const byController = groupBy(req.targets, (a, b) => a.controllerId.localeCompare(b.controllerId));
      const requests = byController.map((group) => this.getTestController(group[0].controllerId)?.runTests(group.map((controlReq) => ({
        runId: result.id,
        excludeExtIds: req.exclude.filter((t) => !controlReq.testIds.includes(t)),
        profileId: controlReq.profileId,
        controllerId: controlReq.controllerId,
        testIds: controlReq.testIds
      })), cancelSource.token).then((result2) => {
        const errs = result2.map((r) => r.error).filter(isDefined);
        if (errs.length) {
          this.notificationService.error(localize("testError", "An error occurred attempting to run tests: {0}", errs.join(" ")));
        }
      }));
      await this.saveAllBeforeTest(req);
      await Promise.all(requests);
      return result;
    } finally {
      this.uiRunningTests.delete(result.id);
      result.markComplete();
    }
  }
  /**
   * @inheritdoc
   */
  async provideTestFollowups(req, token) {
    const reqs = await Promise.all([...this.testExtHosts].map(async (ctrl) => ({ ctrl, followups: await ctrl.provideTestFollowups(req, token) })));
    const followups = {
      followups: reqs.flatMap(({ ctrl, followups: followups2 }) => followups2.map((f) => ({
        message: f.title,
        execute: /* @__PURE__ */ __name(() => ctrl.executeTestFollowup(f.id), "execute")
      }))),
      dispose: /* @__PURE__ */ __name(() => {
        for (const { ctrl, followups: followups2 } of reqs) {
          ctrl.disposeTestFollowups(followups2.map((f) => f.id));
        }
      }, "dispose")
    };
    if (token.isCancellationRequested) {
      followups.dispose();
    }
    return followups;
  }
  /**
   * @inheritdoc
   */
  publishDiff(_controllerId, diff) {
    this.willProcessDiffEmitter.fire(diff);
    this.collection.apply(diff);
    this.updateEditorContextKeys();
    this.didProcessDiffEmitter.fire(diff);
  }
  /**
   * @inheritdoc
   */
  getTestController(id) {
    return this.testControllers.get().get(id);
  }
  /**
   * @inheritdoc
   */
  async syncTests() {
    const cts = new CancellationTokenSource();
    try {
      await Promise.all([...this.testControllers.get().values()].map((c) => c.syncTests(cts.token)));
    } finally {
      cts.dispose(true);
    }
  }
  /**
   * @inheritdoc
   */
  async refreshTests(controllerId) {
    const cts = new CancellationTokenSource();
    this.testRefreshCancellations.add(cts);
    this.isRefreshingTests.set(true);
    try {
      if (controllerId) {
        await this.getTestController(controllerId)?.refreshTests(cts.token);
      } else {
        await Promise.all([...this.testControllers.get().values()].map((c) => c.refreshTests(cts.token)));
      }
    } finally {
      this.testRefreshCancellations.delete(cts);
      this.isRefreshingTests.set(this.testRefreshCancellations.size > 0);
      cts.dispose(true);
    }
  }
  /**
   * @inheritdoc
   */
  cancelRefreshTests() {
    for (const cts of this.testRefreshCancellations) {
      cts.cancel();
    }
    this.testRefreshCancellations.clear();
    this.isRefreshingTests.set(false);
  }
  /**
   * @inheritdoc
   */
  registerExtHost(controller) {
    this.testExtHosts.add(controller);
    return toDisposable(() => this.testExtHosts.delete(controller));
  }
  /**
   * @inheritdoc
   */
  async getTestsRelatedToCode(uri, position, token = CancellationToken.None) {
    const testIds = await Promise.all([...this.testExtHosts.values()].map((v) => v.getTestsRelatedToCode(uri, position, token)));
    return testIds.flatMap((ids) => ids.map((id) => this.collection.getNodeById(id))).filter(isDefined);
  }
  /**
   * @inheritdoc
   */
  registerTestController(id, controller) {
    this.testControllers.set(new Map(this.testControllers.get()).set(id, controller), void 0);
    return toDisposable(() => {
      const diff = [];
      for (const root of this.collection.rootItems) {
        if (root.controllerId === id) {
          diff.push({ op: 3, itemId: root.item.extId });
        }
      }
      this.publishDiff(id, diff);
      const next = new Map(this.testControllers.get());
      next.delete(id);
      this.testControllers.set(next, void 0);
    });
  }
  /**
   * @inheritdoc
   */
  async getCodeRelatedToTest(test, token = CancellationToken.None) {
    return await this.testControllers.get().get(test.controllerId)?.getRelatedCode(test.item.extId, token) || [];
  }
  updateEditorContextKeys() {
    const uri = this.editorService.activeEditor?.resource;
    if (uri) {
      this.activeEditorHasTests.set(!Iterable.isEmpty(this.collection.getNodeByUrl(uri)));
    } else {
      this.activeEditorHasTests.set(false);
    }
  }
  async saveAllBeforeTest(req, configurationService = this.configurationService, editorService = this.editorService) {
    if (req.preserveFocus === true) {
      return;
    }
    const saveBeforeTest = getTestingConfiguration(
      this.configurationService,
      "testing.saveBeforeTest"
      /* TestingConfigKeys.SaveBeforeTest */
    );
    if (saveBeforeTest) {
      await editorService.saveAll();
    }
    return;
  }
};
TestService = __decorate([
  __param(0, IContextKeyService),
  __param(1, IInstantiationService),
  __param(2, IUriIdentityService),
  __param(3, IStorageService),
  __param(4, IEditorService),
  __param(5, ITestProfileService),
  __param(6, INotificationService),
  __param(7, IConfigurationService),
  __param(8, ITestResultService),
  __param(9, IWorkspaceTrustRequestService)
], TestService);
export {
  TestService
};
//# sourceMappingURL=testServiceImpl.js.map
