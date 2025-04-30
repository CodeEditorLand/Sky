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
var AbstractChatEditingModifiedFileEntry_1;
import { RunOnceScheduler } from "../../../../../base/common/async.js";
import { Emitter } from "../../../../../base/common/event.js";
import { Disposable, DisposableMap, MutableDisposable, toDisposable } from "../../../../../base/common/lifecycle.js";
import { Schemas } from "../../../../../base/common/network.js";
import { clamp } from "../../../../../base/common/numbers.js";
import { autorun, derived, observableFromEvent, observableValue, observableValueOpts } from "../../../../../base/common/observable.js";
import { localize } from "../../../../../nls.js";
import { IConfigurationService } from "../../../../../platform/configuration/common/configuration.js";
import { IFileService } from "../../../../../platform/files/common/files.js";
import { IInstantiationService } from "../../../../../platform/instantiation/common/instantiation.js";
import { observableConfigValue } from "../../../../../platform/observable/common/platformObservableUtils.js";
import { editorBackground, registerColor, transparent } from "../../../../../platform/theme/common/colorRegistry.js";
import { IUndoRedoService } from "../../../../../platform/undoRedo/common/undoRedo.js";
import { IFilesConfigurationService } from "../../../../services/filesConfiguration/common/filesConfigurationService.js";
import { IChatService } from "../../common/chatService.js";
class AutoAcceptControl {
  static {
    __name(this, "AutoAcceptControl");
  }
  constructor(total, remaining, cancel) {
    this.total = total;
    this.remaining = remaining;
    this.cancel = cancel;
  }
}
const pendingRewriteMinimap = registerColor("minimap.chatEditHighlight", transparent(editorBackground, 0.6), localize("editorSelectionBackground", "Color of pending edit regions in the minimap"));
let AbstractChatEditingModifiedFileEntry = class AbstractChatEditingModifiedFileEntry2 extends Disposable {
  static {
    __name(this, "AbstractChatEditingModifiedFileEntry");
  }
  static {
    AbstractChatEditingModifiedFileEntry_1 = this;
  }
  static {
    this.scheme = "modified-file-entry";
  }
  static {
    this.lastEntryId = 0;
  }
  get telemetryInfo() {
    return this._telemetryInfo;
  }
  get lastModifyingRequestId() {
    return this._telemetryInfo.requestId;
  }
  constructor(modifiedURI, _telemetryInfo, kind, configService, _fileConfigService, _chatService, _fileService, _undoRedoService, _instantiationService) {
    super();
    this.modifiedURI = modifiedURI;
    this._telemetryInfo = _telemetryInfo;
    this._fileConfigService = _fileConfigService;
    this._chatService = _chatService;
    this._fileService = _fileService;
    this._undoRedoService = _undoRedoService;
    this._instantiationService = _instantiationService;
    this.entryId = `${AbstractChatEditingModifiedFileEntry_1.scheme}::${++AbstractChatEditingModifiedFileEntry_1.lastEntryId}`;
    this._onDidDelete = this._register(new Emitter());
    this.onDidDelete = this._onDidDelete.event;
    this._stateObs = observableValue(
      this,
      0
      /* ModifiedFileEntryState.Modified */
    );
    this.state = this._stateObs;
    this._isCurrentlyBeingModifiedByObs = observableValue(this, void 0);
    this.isCurrentlyBeingModifiedBy = this._isCurrentlyBeingModifiedByObs;
    this._lastModifyingResponseObs = observableValueOpts({ equalsFn: /* @__PURE__ */ __name((a, b) => a?.requestId === b?.requestId, "equalsFn") }, void 0);
    this.lastModifyingResponse = this._lastModifyingResponseObs;
    this._lastModifyingResponseInProgressObs = this._lastModifyingResponseObs.map((value, r) => {
      return value && observableFromEvent(this, value.onDidChange, () => !value.isComplete && !value.isPendingConfirmation).read(r);
    });
    this._rewriteRatioObs = observableValue(this, 0);
    this.rewriteRatio = this._rewriteRatioObs;
    this._reviewModeTempObs = observableValue(this, void 0);
    this._autoAcceptCtrl = observableValue(this, void 0);
    this.autoAcceptController = this._autoAcceptCtrl;
    this._refCounter = 1;
    this._userEditScheduler = this._register(new RunOnceScheduler(() => this._notifyAction("userModified"), 1e3));
    this._editorIntegrations = this._register(new DisposableMap());
    if (kind === 0) {
      this.createdInRequestId = this._telemetryInfo.requestId;
    }
    if (this.modifiedURI.scheme !== Schemas.untitled && this.modifiedURI.scheme !== Schemas.vscodeNotebookCell) {
      this._register(this._fileService.watch(this.modifiedURI));
      this._register(this._fileService.onDidFilesChange((e) => {
        if (e.affects(this.modifiedURI) && kind === 0 && e.gotDeleted()) {
          this._onDidDelete.fire();
        }
      }));
    }
    const autoAcceptRaw = observableConfigValue("chat.editing.autoAcceptDelay", 0, configService);
    this._autoAcceptTimeout = derived((r) => {
      const value = autoAcceptRaw.read(r);
      return clamp(value, 0, 100);
    });
    this.reviewMode = derived((r) => {
      const configuredValue = this._autoAcceptTimeout.read(r);
      const tempValue = this._reviewModeTempObs.read(r);
      return tempValue ?? configuredValue === 0;
    });
    this._store.add(toDisposable(() => this._lastModifyingResponseObs.set(void 0, void 0)));
    const autoSaveOff = this._store.add(new MutableDisposable());
    this._store.add(autorun((r) => {
      if (this._lastModifyingResponseInProgressObs.read(r)) {
        autoSaveOff.value = _fileConfigService.disableAutoSave(this.modifiedURI);
      } else {
        autoSaveOff.clear();
      }
    }));
    this._store.add(autorun((r) => {
      const inProgress = this._lastModifyingResponseInProgressObs.read(r);
      if (inProgress === false && !this.reviewMode.read(r)) {
        const acceptTimeout = this._autoAcceptTimeout.get() * 1e3;
        const future = Date.now() + acceptTimeout;
        const update = /* @__PURE__ */ __name(() => {
          const reviewMode = this.reviewMode.get();
          if (reviewMode) {
            this._autoAcceptCtrl.set(void 0, void 0);
            return;
          }
          const remain = Math.round(future - Date.now());
          if (remain <= 0) {
            this.accept(void 0);
          } else {
            const handle = setTimeout(update, 100);
            this._autoAcceptCtrl.set(new AutoAcceptControl(acceptTimeout, remain, () => {
              clearTimeout(handle);
              this._autoAcceptCtrl.set(void 0, void 0);
            }), void 0);
          }
        }, "update");
        update();
      }
    }));
  }
  dispose() {
    if (--this._refCounter === 0) {
      super.dispose();
    }
  }
  acquire() {
    this._refCounter++;
    return this;
  }
  enableReviewModeUntilSettled() {
    this._reviewModeTempObs.set(true, void 0);
    const cleanup = autorun((r) => {
      const resetConfig = this.state.read(r) !== 0;
      if (resetConfig) {
        this._store.delete(cleanup);
        this._reviewModeTempObs.set(void 0, void 0);
      }
    });
    this._store.add(cleanup);
  }
  updateTelemetryInfo(telemetryInfo) {
    this._telemetryInfo = telemetryInfo;
  }
  async accept(tx) {
    if (this._stateObs.get() !== 0) {
      return;
    }
    await this._doAccept(tx);
    this._stateObs.set(1, tx);
    this._autoAcceptCtrl.set(void 0, tx);
    this._notifyAction("accepted");
  }
  async reject(tx) {
    if (this._stateObs.get() !== 0) {
      return;
    }
    this._notifyAction("rejected");
    await this._doReject(tx);
    this._stateObs.set(2, tx);
    this._autoAcceptCtrl.set(void 0, tx);
  }
  _notifyAction(outcome) {
    this._chatService.notifyUserAction({
      action: { kind: "chatEditingSessionAction", uri: this.modifiedURI, hasRemainingEdits: false, outcome },
      agentId: this._telemetryInfo.agentId,
      command: this._telemetryInfo.command,
      sessionId: this._telemetryInfo.sessionId,
      requestId: this._telemetryInfo.requestId,
      result: this._telemetryInfo.result
    });
  }
  getEditorIntegration(pane) {
    let value = this._editorIntegrations.get(pane);
    if (!value) {
      value = this._createEditorIntegration(pane);
      this._editorIntegrations.set(pane, value);
    }
    return value;
  }
  acceptStreamingEditsStart(responseModel, tx) {
    this._resetEditsState(tx);
    this._isCurrentlyBeingModifiedByObs.set(responseModel, tx);
    this._lastModifyingResponseObs.set(responseModel, tx);
    this._autoAcceptCtrl.get()?.cancel();
    const undoRedoElement = this._createUndoRedoElement(responseModel);
    if (undoRedoElement) {
      this._undoRedoService.pushElement(undoRedoElement);
    }
  }
  async acceptStreamingEditsEnd(tx) {
    this._resetEditsState(tx);
    if (await this._areOriginalAndModifiedIdentical()) {
      this.accept(tx);
    }
  }
  _resetEditsState(tx) {
    this._isCurrentlyBeingModifiedByObs.set(void 0, tx);
    this._rewriteRatioObs.set(0, tx);
  }
};
AbstractChatEditingModifiedFileEntry = AbstractChatEditingModifiedFileEntry_1 = __decorate([
  __param(3, IConfigurationService),
  __param(4, IFilesConfigurationService),
  __param(5, IChatService),
  __param(6, IFileService),
  __param(7, IUndoRedoService),
  __param(8, IInstantiationService)
], AbstractChatEditingModifiedFileEntry);
export {
  AbstractChatEditingModifiedFileEntry,
  pendingRewriteMinimap
};
//# sourceMappingURL=chatEditingModifiedFileEntry.js.map
