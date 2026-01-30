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
import { reverseOrder, compareBy, numberComparator, sumBy } from "../../../../../base/common/arrays.js";
import { IntervalTimer, TimeoutTimer } from "../../../../../base/common/async.js";
import { toDisposable, Disposable } from "../../../../../base/common/lifecycle.js";
import { mapObservableArrayCached, derived, observableSignal, runOnChange, autorun } from "../../../../../base/common/observable.js";
import { IInstantiationService } from "../../../../../platform/instantiation/common/instantiation.js";
import { ITelemetryService } from "../../../../../platform/telemetry/common/telemetry.js";
import { IUserAttentionService } from "../../../../services/userAttention/common/userAttentionService.js";
import { CreateSuggestionIdForChatOrInlineChatCaller, EditTelemetryReportEditArcForChatOrInlineChatSender, EditTelemetryReportInlineEditArcSender } from "./arcTelemetrySender.js";
import { createDocWithJustReason } from "../helpers/documentWithAnnotatedEdits.js";
import { DocumentEditSourceTracker } from "./editTracker.js";
import { sumByCategory } from "../helpers/utils.js";
import { ScmAdapter } from "./scmAdapter.js";
import { IRandomService } from "../randomService.js";
let EditSourceTrackingImpl = class EditSourceTrackingImpl2 extends Disposable {
  static {
    __name(this, "EditSourceTrackingImpl");
  }
  constructor(_statsEnabled, _annotatedDocuments, _instantiationService) {
    super();
    this._statsEnabled = _statsEnabled;
    this._annotatedDocuments = _annotatedDocuments;
    this._instantiationService = _instantiationService;
    const scmBridge = this._instantiationService.createInstance(ScmAdapter);
    this._states = mapObservableArrayCached(this, this._annotatedDocuments.documents, (doc, store) => {
      return [doc.document, store.add(this._instantiationService.createInstance(TrackedDocumentInfo, doc, scmBridge, this._statsEnabled))];
    });
    this.docsState = this._states.map((entries) => new Map(entries));
    this.docsState.recomputeInitiallyAndOnChange(this._store);
  }
};
EditSourceTrackingImpl = __decorate([
  __param(2, IInstantiationService)
], EditSourceTrackingImpl);
let TrackedDocumentInfo = class TrackedDocumentInfo2 extends Disposable {
  static {
    __name(this, "TrackedDocumentInfo");
  }
  constructor(_doc, _scm, _statsEnabled, _instantiationService, _telemetryService, _randomService, _userAttentionService) {
    super();
    this._doc = _doc;
    this._scm = _scm;
    this._statsEnabled = _statsEnabled;
    this._instantiationService = _instantiationService;
    this._telemetryService = _telemetryService;
    this._randomService = _randomService;
    this._userAttentionService = _userAttentionService;
    this._repo = derived(this, (reader) => this._scm.getRepo(_doc.document.uri, reader));
    const docWithJustReason = createDocWithJustReason(_doc.documentWithAnnotations, this._store);
    const longtermResetSignal = observableSignal("resetSignal");
    let longtermReason = "closed";
    this.longtermTracker = derived((reader) => {
      if (!this._statsEnabled.read(reader)) {
        return void 0;
      }
      longtermResetSignal.read(reader);
      const t = reader.store.add(new DocumentEditSourceTracker(docWithJustReason, void 0));
      const startFocusTime = this._userAttentionService.totalFocusTimeMs;
      const startTime = Date.now();
      reader.store.add(toDisposable(() => {
        if (!t.isEmpty()) {
          this.sendTelemetry("longterm", longtermReason, t, this._userAttentionService.totalFocusTimeMs - startFocusTime, Date.now() - startTime);
        }
        t.dispose();
      }));
      return t;
    }).recomputeInitiallyAndOnChange(this._store);
    this._store.add(new IntervalTimer()).cancelAndSet(() => {
      longtermReason = "10hours";
      longtermResetSignal.trigger(void 0);
      longtermReason = "closed";
    }, 10 * 60 * 60 * 1e3);
    this._store.add(autorun((reader) => {
      const repo = this._repo.read(reader);
      if (repo) {
        reader.store.add(runOnChange(repo.headCommitHashObs, () => {
          longtermReason = "hashChange";
          longtermResetSignal.trigger(void 0);
          longtermReason = "closed";
        }));
        reader.store.add(runOnChange(repo.headBranchNameObs, () => {
          longtermReason = "branchChange";
          longtermResetSignal.trigger(void 0);
          longtermReason = "closed";
        }));
      }
    }));
    this._store.add(this._instantiationService.createInstance(EditTelemetryReportInlineEditArcSender, _doc.documentWithAnnotations, this._repo));
    this._store.add(this._instantiationService.createInstance(EditTelemetryReportEditArcForChatOrInlineChatSender, _doc.documentWithAnnotations, this._repo));
    this._store.add(this._instantiationService.createInstance(CreateSuggestionIdForChatOrInlineChatCaller, _doc.documentWithAnnotations));
    const resetSignal = observableSignal("resetSignal");
    this.windowedTracker = derived((reader) => {
      if (!this._statsEnabled.read(reader)) {
        return void 0;
      }
      if (!this._doc.isVisible.read(reader)) {
        return void 0;
      }
      resetSignal.read(reader);
      reader.store.add(new TimeoutTimer(() => {
        resetSignal.trigger(void 0);
      }, 5 * 60 * 1e3));
      const t = reader.store.add(new DocumentEditSourceTracker(docWithJustReason, void 0));
      const startFocusTime = this._userAttentionService.totalFocusTimeMs;
      const startTime = Date.now();
      reader.store.add(toDisposable(async () => {
        this.sendTelemetry("5minWindow", "time", t, this._userAttentionService.totalFocusTimeMs - startFocusTime, Date.now() - startTime);
        t.dispose();
      }));
      return t;
    }).recomputeInitiallyAndOnChange(this._store);
    const focusResetSignal = observableSignal("focusResetSignal");
    this.windowedFocusTracker = derived((reader) => {
      if (!this._statsEnabled.read(reader)) {
        return void 0;
      }
      if (!this._doc.isVisible.read(reader)) {
        return void 0;
      }
      focusResetSignal.read(reader);
      reader.store.add(this._userAttentionService.fireAfterGivenFocusTimePassed(10 * 60 * 1e3, () => {
        focusResetSignal.trigger(void 0);
      }));
      const t = reader.store.add(new DocumentEditSourceTracker(docWithJustReason, void 0));
      const startFocusTime = this._userAttentionService.totalFocusTimeMs;
      const startTime = Date.now();
      reader.store.add(toDisposable(async () => {
        this.sendTelemetry("10minFocusWindow", "time", t, this._userAttentionService.totalFocusTimeMs - startFocusTime, Date.now() - startTime);
        t.dispose();
      }));
      return t;
    }).recomputeInitiallyAndOnChange(this._store);
  }
  async sendTelemetry(mode, trigger, t, focusTime, actualTime) {
    const ranges = t.getTrackedRanges();
    const keys = t.getAllKeys();
    if (keys.length === 0) {
      return;
    }
    const data = this.getTelemetryData(ranges);
    const statsUuid = this._randomService.generateUuid();
    const sums = sumByCategory(ranges, (r) => r.range.length, (r) => r.sourceKey);
    const entries = Object.entries(sums).filter(([key, value]) => value !== void 0);
    entries.sort(reverseOrder(compareBy(([key, value]) => value, numberComparator)));
    entries.length = mode === "longterm" ? 30 : 10;
    for (const key of keys) {
      if (!sums[key]) {
        sums[key] = 0;
      }
    }
    for (const [key, value] of Object.entries(sums)) {
      if (value === void 0) {
        continue;
      }
      const repr = t.getRepresentative(key);
      const deltaModifiedCount = t.getTotalInsertedCharactersCount(key);
      this._telemetryService.publicLog2("editTelemetry.editSources.details", {
        mode,
        sourceKey: key,
        sourceKeyCleaned: repr.toKey(1, { $extensionId: false, $extensionVersion: false, $modelId: false }),
        extensionId: repr.props.$extensionId,
        extensionVersion: repr.props.$extensionVersion,
        modelId: repr.props.$modelId,
        trigger,
        languageId: this._doc.document.languageId.get(),
        statsUuid,
        modifiedCount: value,
        deltaModifiedCount,
        totalModifiedCount: data.totalModifiedCharactersInFinalState
      });
    }
    const isTrackedByGit = await data.isTrackedByGit;
    this._telemetryService.publicLog2("editTelemetry.editSources.stats", {
      mode,
      languageId: this._doc.document.languageId.get(),
      statsUuid,
      nesModifiedCount: data.nesModifiedCount,
      inlineCompletionsCopilotModifiedCount: data.inlineCompletionsCopilotModifiedCount,
      inlineCompletionsNESModifiedCount: data.inlineCompletionsNESModifiedCount,
      otherAIModifiedCount: data.otherAIModifiedCount,
      unknownModifiedCount: data.unknownModifiedCount,
      userModifiedCount: data.userModifiedCount,
      ideModifiedCount: data.ideModifiedCount,
      totalModifiedCharacters: data.totalModifiedCharactersInFinalState,
      externalModifiedCount: data.externalModifiedCount,
      isTrackedByGit: isTrackedByGit ? 1 : 0,
      focusTime,
      actualTime,
      trigger
    });
  }
  getTelemetryData(ranges) {
    const getEditCategory = /* @__PURE__ */ __name((source) => {
      if (source.category === "ai" && source.kind === "nes") {
        return "nes";
      }
      if (source.category === "ai" && source.kind === "completion" && source.extensionId === "github.copilot") {
        return "inlineCompletionsCopilot";
      }
      if (source.category === "ai" && source.kind === "completion" && source.extensionId === "github.copilot-chat" && source.providerId === "completions") {
        return "inlineCompletionsCopilot";
      }
      if (source.category === "ai" && source.kind === "completion" && source.extensionId === "github.copilot-chat" && source.providerId === "nes") {
        return "inlineCompletionsNES";
      }
      if (source.category === "ai" && source.kind === "completion") {
        return "inlineCompletionsOther";
      }
      if (source.category === "ai") {
        return "otherAI";
      }
      if (source.category === "user") {
        return "user";
      }
      if (source.category === "ide") {
        return "ide";
      }
      if (source.category === "external") {
        return "external";
      }
      if (source.category === "unknown") {
        return "unknown";
      }
      return "unknown";
    }, "getEditCategory");
    const sums = sumByCategory(ranges, (r) => r.range.length, (r) => getEditCategory(r.source));
    const totalModifiedCharactersInFinalState = sumBy(ranges, (r) => r.range.length);
    return {
      nesModifiedCount: sums.nes ?? 0,
      inlineCompletionsCopilotModifiedCount: sums.inlineCompletionsCopilot ?? 0,
      inlineCompletionsNESModifiedCount: sums.inlineCompletionsNES ?? 0,
      otherAIModifiedCount: sums.otherAI ?? 0,
      userModifiedCount: sums.user ?? 0,
      ideModifiedCount: sums.ide ?? 0,
      unknownModifiedCount: sums.unknown ?? 0,
      externalModifiedCount: sums.external ?? 0,
      totalModifiedCharactersInFinalState,
      languageId: this._doc.document.languageId.get(),
      isTrackedByGit: this._repo.get()?.isIgnored(this._doc.document.uri)
    };
  }
};
TrackedDocumentInfo = __decorate([
  __param(3, IInstantiationService),
  __param(4, ITelemetryService),
  __param(5, IRandomService),
  __param(6, IUserAttentionService)
], TrackedDocumentInfo);
export {
  EditSourceTrackingImpl
};
//# sourceMappingURL=editSourceTrackingImpl.js.map
