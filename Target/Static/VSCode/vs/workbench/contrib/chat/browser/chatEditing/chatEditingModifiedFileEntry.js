var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp(target, key, result);
  return result;
};
var __decorateParam = (index, decorator) => (target, key) => decorator(target, key, index);
import { Emitter } from "../../../../../base/common/event.js";
import { Disposable, DisposableMap, MutableDisposable } from "../../../../../base/common/lifecycle.js";
import { Schemas } from "../../../../../base/common/network.js";
import { clamp } from "../../../../../base/common/numbers.js";
import { autorun, derived, IObservable, ITransaction, observableValue } from "../../../../../base/common/observable.js";
import { URI } from "../../../../../base/common/uri.js";
import { OffsetEdit } from "../../../../../editor/common/core/offsetEdit.js";
import { TextEdit } from "../../../../../editor/common/languages.js";
import { localize } from "../../../../../nls.js";
import { IConfigurationService } from "../../../../../platform/configuration/common/configuration.js";
import { IFileService } from "../../../../../platform/files/common/files.js";
import { IInstantiationService } from "../../../../../platform/instantiation/common/instantiation.js";
import { observableConfigValue } from "../../../../../platform/observable/common/platformObservableUtils.js";
import { editorBackground, registerColor, transparent } from "../../../../../platform/theme/common/colorRegistry.js";
import { IUndoRedoElement, IUndoRedoService } from "../../../../../platform/undoRedo/common/undoRedo.js";
import { IEditorPane } from "../../../../common/editor.js";
import { IFilesConfigurationService } from "../../../../services/filesConfiguration/common/filesConfigurationService.js";
import { ICellEditOperation } from "../../../notebook/common/notebookCommon.js";
import { IChatAgentResult } from "../../common/chatAgents.js";
import { ChatEditKind, IModifiedFileEntry, IModifiedFileEntryEditorIntegration, ModifiedFileEntryState } from "../../common/chatEditingService.js";
import { IChatResponseModel } from "../../common/chatModel.js";
import { IChatService } from "../../common/chatService.js";
class AutoAcceptControl {
  constructor(total, remaining, cancel) {
    this.total = total;
    this.remaining = remaining;
    this.cancel = cancel;
  }
  static {
    __name(this, "AutoAcceptControl");
  }
}
const pendingRewriteMinimap = registerColor(
  "minimap.chatEditHighlight",
  transparent(editorBackground, 0.6),
  localize("editorSelectionBackground", "Color of pending edit regions in the minimap")
);
let AbstractChatEditingModifiedFileEntry = class extends Disposable {
  constructor(modifiedURI, _telemetryInfo, kind, configService, _fileConfigService, _chatService, _fileService, _undoRedoService, _instantiationService) {
    super();
    this.modifiedURI = modifiedURI;
    this._telemetryInfo = _telemetryInfo;
    this._fileConfigService = _fileConfigService;
    this._chatService = _chatService;
    this._fileService = _fileService;
    this._undoRedoService = _undoRedoService;
    this._instantiationService = _instantiationService;
    if (kind === ChatEditKind.Created) {
      this.createdInRequestId = this._telemetryInfo.requestId;
    }
    if (this.modifiedURI.scheme !== Schemas.untitled && this.modifiedURI.scheme !== Schemas.vscodeNotebookCell) {
      this._register(this._fileService.watch(this.modifiedURI));
      this._register(this._fileService.onDidFilesChange((e) => {
        if (e.affects(this.modifiedURI) && kind === ChatEditKind.Created && e.gotDeleted()) {
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
    const autoSaveOff = this._store.add(new MutableDisposable());
    this._store.add(autorun((r) => {
      if (this.isCurrentlyBeingModifiedBy.read(r)) {
        autoSaveOff.value = _fileConfigService.disableAutoSave(this.modifiedURI);
      } else {
        autoSaveOff.clear();
      }
    }));
  }
  static {
    __name(this, "AbstractChatEditingModifiedFileEntry");
  }
  static scheme = "modified-file-entry";
  static lastEntryId = 0;
  entryId = `${AbstractChatEditingModifiedFileEntry.scheme}::${++AbstractChatEditingModifiedFileEntry.lastEntryId}`;
  _onDidDelete = this._register(new Emitter());
  onDidDelete = this._onDidDelete.event;
  _stateObs = observableValue(this, ModifiedFileEntryState.Modified);
  state = this._stateObs;
  _isCurrentlyBeingModifiedByObs = observableValue(this, void 0);
  isCurrentlyBeingModifiedBy = this._isCurrentlyBeingModifiedByObs;
  _rewriteRatioObs = observableValue(this, 0);
  rewriteRatio = this._rewriteRatioObs;
  _reviewModeTempObs = observableValue(this, void 0);
  reviewMode;
  _autoAcceptCtrl = observableValue(this, void 0);
  autoAcceptController = this._autoAcceptCtrl;
  _autoAcceptTimeout;
  get telemetryInfo() {
    return this._telemetryInfo;
  }
  createdInRequestId;
  get lastModifyingRequestId() {
    return this._telemetryInfo.requestId;
  }
  _refCounter = 1;
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
      const resetConfig = this.state.read(r) !== ModifiedFileEntryState.Modified;
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
    if (this._stateObs.get() !== ModifiedFileEntryState.Modified) {
      return;
    }
    await this._doAccept(tx);
    this._stateObs.set(ModifiedFileEntryState.Accepted, tx);
    this._autoAcceptCtrl.set(void 0, tx);
    this._notifyAction("accepted");
  }
  async reject(tx) {
    if (this._stateObs.get() !== ModifiedFileEntryState.Modified) {
      return;
    }
    await this._doReject(tx);
    this._stateObs.set(ModifiedFileEntryState.Rejected, tx);
    this._autoAcceptCtrl.set(void 0, tx);
    this._notifyAction("rejected");
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
  _editorIntegrations = this._register(new DisposableMap());
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
    } else if (!this.reviewMode.get() && !this._autoAcceptCtrl.get()) {
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
  }
  _resetEditsState(tx) {
    this._isCurrentlyBeingModifiedByObs.set(void 0, tx);
    this._rewriteRatioObs.set(0, tx);
  }
};
AbstractChatEditingModifiedFileEntry = __decorateClass([
  __decorateParam(3, IConfigurationService),
  __decorateParam(4, IFilesConfigurationService),
  __decorateParam(5, IChatService),
  __decorateParam(6, IFileService),
  __decorateParam(7, IUndoRedoService),
  __decorateParam(8, IInstantiationService)
], AbstractChatEditingModifiedFileEntry);
export {
  AbstractChatEditingModifiedFileEntry,
  pendingRewriteMinimap
};
//# sourceMappingURL=chatEditingModifiedFileEntry.js.map
