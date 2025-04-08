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
import "../media/chatEditingEditorOverlay.css";
import { combinedDisposable, DisposableMap, DisposableStore, MutableDisposable, toDisposable } from "../../../../../base/common/lifecycle.js";
import { autorun, derived, derivedOpts, IObservable, observableFromEvent, observableSignalFromEvent, observableValue, transaction } from "../../../../../base/common/observable.js";
import { HiddenItemStrategy, MenuWorkbenchToolBar, WorkbenchToolBar } from "../../../../../platform/actions/browser/toolbar.js";
import { IInstantiationService } from "../../../../../platform/instantiation/common/instantiation.js";
import { IChatEditingService, IChatEditingSession, IModifiedFileEntry, ModifiedFileEntryState } from "../../common/chatEditingService.js";
import { MenuId } from "../../../../../platform/actions/common/actions.js";
import { ActionViewItem } from "../../../../../base/browser/ui/actionbar/actionViewItems.js";
import { IActionRunner } from "../../../../../base/common/actions.js";
import { addDisposableGenericMouseMoveListener, append, reset } from "../../../../../base/browser/dom.js";
import { renderIcon } from "../../../../../base/browser/ui/iconLabel/iconLabels.js";
import { ThemeIcon } from "../../../../../base/common/themables.js";
import { Codicon } from "../../../../../base/common/codicons.js";
import { assertType } from "../../../../../base/common/types.js";
import { localize } from "../../../../../nls.js";
import { AcceptAction, navigationBearingFakeActionId, RejectAction } from "./chatEditingEditorActions.js";
import { IChatService } from "../../common/chatService.js";
import { IWorkbenchContribution } from "../../../../common/contributions.js";
import { IEditorGroup, IEditorGroupsService } from "../../../../services/editor/common/editorGroupsService.js";
import { EditorGroupView } from "../../../../browser/parts/editor/editorGroupView.js";
import { Event } from "../../../../../base/common/event.js";
import { ServiceCollection } from "../../../../../platform/instantiation/common/serviceCollection.js";
import { IContextKeyService } from "../../../../../platform/contextkey/common/contextkey.js";
import { EditorResourceAccessor, SideBySideEditor } from "../../../../common/editor.js";
import { IInlineChatSessionService } from "../../../inlineChat/browser/inlineChatSessionService.js";
import { isEqual } from "../../../../../base/common/resources.js";
import { ObservableEditorSession } from "./chatEditingEditorContextKeys.js";
import { rcut } from "../../../../../base/common/strings.js";
let ChatEditorOverlayWidget = class {
  constructor(_editor, _chatService, instaService) {
    this._editor = _editor;
    this._chatService = _chatService;
    this._domNode = document.createElement("div");
    this._domNode.classList.add("chat-editor-overlay-widget");
    const progressNode = document.createElement("div");
    progressNode.classList.add("chat-editor-overlay-progress");
    append(progressNode, renderIcon(ThemeIcon.modify(Codicon.loading, "spin")));
    this._domNode.appendChild(progressNode);
    const toolbarNode = document.createElement("div");
    toolbarNode.classList.add("chat-editor-overlay-toolbar");
    this._domNode.appendChild(toolbarNode);
    this._toolbar = instaService.createInstance(MenuWorkbenchToolBar, toolbarNode, MenuId.ChatEditingEditorContent, {
      telemetrySource: "chatEditor.overlayToolbar",
      hiddenItemStrategy: HiddenItemStrategy.Ignore,
      toolbarOptions: {
        primaryGroup: /* @__PURE__ */ __name(() => true, "primaryGroup"),
        useSeparatorsInPrimaryActions: true
      },
      menuOptions: { renderShortTitle: true },
      actionViewItemProvider: /* @__PURE__ */ __name((action, options) => {
        const that = this;
        if (action.id === navigationBearingFakeActionId) {
          return new class extends ActionViewItem {
            constructor() {
              super(void 0, action, { ...options, icon: false, label: true, keybindingNotRenderedWithLabel: true });
            }
            render(container) {
              super.render(container);
              container.classList.add("label-item");
              this._store.add(autorun((r) => {
                assertType(this.label);
                const { changeCount, activeIdx } = that._navigationBearings.read(r);
                if (changeCount > 0) {
                  const n = activeIdx === -1 ? "1" : `${activeIdx + 1}`;
                  this.label.innerText = localize("nOfM", "{0} of {1}", n, changeCount);
                } else {
                  this.label.innerText = localize("0Of0", "0 of 0");
                }
                this.updateTooltip();
              }));
            }
            getTooltip() {
              const { changeCount, entriesCount } = that._navigationBearings.get();
              if (changeCount === -1 || entriesCount === -1) {
                return void 0;
              } else if (changeCount === 1 && entriesCount === 1) {
                return localize("tooltip_11", "1 change in 1 file");
              } else if (changeCount === 1) {
                return localize("tooltip_1n", "1 change in {0} files", entriesCount);
              } else if (entriesCount === 1) {
                return localize("tooltip_n1", "{0} changes in 1 file", changeCount);
              } else {
                return localize("tooltip_nm", "{0} changes in {1} files", changeCount, entriesCount);
              }
            }
          }();
        }
        if (action.id === AcceptAction.ID || action.id === RejectAction.ID) {
          return new class extends ActionViewItem {
            _reveal = this._store.add(new MutableDisposable());
            constructor() {
              super(void 0, action, { ...options, icon: false, label: true, keybindingNotRenderedWithLabel: true });
            }
            render(container) {
              super.render(container);
              if (action.id === AcceptAction.ID) {
                const listener = this._store.add(new MutableDisposable());
                this._store.add(autorun((r) => {
                  assertType(this.label);
                  assertType(this.element);
                  const ctrl = that._entry.read(r)?.autoAcceptController.read(r);
                  if (ctrl) {
                    const r2 = -100 * (ctrl.remaining / ctrl.total);
                    this.element.style.setProperty("--vscode-action-item-auto-timeout", `${r2}%`);
                    this.element.classList.toggle("auto", true);
                    listener.value = addDisposableGenericMouseMoveListener(this.element, () => ctrl.cancel());
                  } else {
                    this.element.classList.toggle("auto", false);
                    listener.clear();
                  }
                }));
              }
            }
            set actionRunner(actionRunner) {
              super.actionRunner = actionRunner;
              this._reveal.value = actionRunner.onWillRun((_e) => {
                that._editor.focus();
              });
            }
            get actionRunner() {
              return super.actionRunner;
            }
          }();
        }
        if (action.id === "inlineChat2.reveal" || action.id === "workbench.action.chat.openEditSession") {
          return new class extends ActionViewItem {
            _requestMessage;
            constructor() {
              super(void 0, action, options);
              this._requestMessage = derived((r) => {
                const session = that._session.read(r);
                const chatModel = that._chatService.getSession(session?.chatSessionId ?? "");
                if (!session || !chatModel) {
                  return void 0;
                }
                const response = that._entry.read(r)?.isCurrentlyBeingModifiedBy.read(r);
                if (response) {
                  if (response?.isPaused.read(r)) {
                    return { message: localize("paused", "Edits Paused"), paused: true };
                  }
                  const entry = that._entry.read(r);
                  if (entry) {
                    const progress = entry?.rewriteRatio.read(r);
                    const message = progress === 0 ? localize("generating", "Generating edits") : localize("applyingPercentage", "{0}% Applying edits", Math.round(progress * 100));
                    return { message };
                  }
                }
                if (session.isGlobalEditingSession) {
                  return void 0;
                }
                const request = observableFromEvent(this, chatModel.onDidChange, () => chatModel.getRequests().at(-1)).read(r);
                if (!request || request.response?.isComplete) {
                  return void 0;
                }
                return { message: request.message.text };
              });
            }
            render(container) {
              super.render(container);
              container.classList.add("label-item");
              this._store.add(autorun((r) => {
                assertType(this.label);
                const value = this._requestMessage.read(r);
                if (!value) {
                  this.options.icon = true;
                  this.options.label = false;
                  reset(this.label);
                  this.updateClass();
                  this.updateLabel();
                  this.updateTooltip();
                } else {
                  this.options.icon = false;
                  this.options.label = true;
                  this.updateClass();
                  this.updateTooltip();
                  const message = rcut(value.message, 47);
                  reset(this.label, message);
                }
                const busy = Boolean(value && !value.paused);
                that._domNode.classList.toggle("busy", busy);
                this.label.classList.toggle("busy", busy);
              }));
            }
            getTooltip() {
              return this._requestMessage.get()?.message || super.getTooltip();
            }
          }();
        }
        return void 0;
      }, "actionViewItemProvider")
    });
  }
  static {
    __name(this, "ChatEditorOverlayWidget");
  }
  _domNode;
  // private readonly _progressNode: HTMLElement;
  _toolbar;
  _showStore = new DisposableStore();
  _session = observableValue(this, void 0);
  _entry = observableValue(this, void 0);
  _navigationBearings = observableValue(this, { changeCount: -1, activeIdx: -1, entriesCount: -1 });
  dispose() {
    this.hide();
    this._showStore.dispose();
    this._toolbar.dispose();
  }
  getDomNode() {
    return this._domNode;
  }
  show(session, entry, indicies) {
    this._showStore.clear();
    transaction((tx) => {
      this._session.set(session, tx);
      this._entry.set(entry, tx);
    });
    this._showStore.add(autorun((r) => {
      const entryIndex = indicies.entryIndex.read(r);
      const changeIndex = indicies.changeIndex.read(r);
      const entries = session.entries.read(r);
      let activeIdx = entryIndex !== void 0 && changeIndex !== void 0 ? changeIndex : -1;
      let totalChangesCount = 0;
      for (let i = 0; i < entries.length; i++) {
        const changesCount = entries[i].changesCount.read(r);
        totalChangesCount += changesCount;
        if (entryIndex !== void 0 && i < entryIndex) {
          activeIdx += changesCount;
        }
      }
      this._navigationBearings.set({ changeCount: totalChangesCount, activeIdx, entriesCount: entries.length }, void 0);
    }));
  }
  hide() {
    transaction((tx) => {
      this._session.set(void 0, tx);
      this._entry.set(void 0, tx);
      this._navigationBearings.set({ changeCount: -1, activeIdx: -1, entriesCount: -1 }, tx);
    });
    this._showStore.clear();
  }
};
ChatEditorOverlayWidget = __decorateClass([
  __decorateParam(1, IChatService),
  __decorateParam(2, IInstantiationService)
], ChatEditorOverlayWidget);
let ChatEditingOverlayController = class {
  static {
    __name(this, "ChatEditingOverlayController");
  }
  _store = new DisposableStore();
  _domNode = document.createElement("div");
  constructor(container, group, instaService, chatService, chatEditingService, inlineChatService) {
    this._domNode.classList.add("chat-editing-editor-overlay");
    this._domNode.style.position = "absolute";
    this._domNode.style.bottom = `24px`;
    this._domNode.style.right = `24px`;
    this._domNode.style.zIndex = `100`;
    const widget = instaService.createInstance(ChatEditorOverlayWidget, group);
    this._domNode.appendChild(widget.getDomNode());
    this._store.add(toDisposable(() => this._domNode.remove()));
    this._store.add(widget);
    const show = /* @__PURE__ */ __name(() => {
      if (!container.contains(this._domNode)) {
        container.appendChild(this._domNode);
      }
    }, "show");
    const hide = /* @__PURE__ */ __name(() => {
      if (container.contains(this._domNode)) {
        widget.hide();
        this._domNode.remove();
      }
    }, "hide");
    const activeEditorSignal = observableSignalFromEvent(this, Event.any(group.onDidActiveEditorChange, group.onDidModelChange));
    const activeUriObs = derivedOpts({ equalsFn: isEqual }, (r) => {
      activeEditorSignal.read(r);
      const editor = group.activeEditorPane;
      const uri = EditorResourceAccessor.getOriginalUri(editor?.input, { supportSideBySide: SideBySideEditor.PRIMARY });
      return uri;
    });
    const sessionAndEntry = derived((r) => {
      activeEditorSignal.read(r);
      const uri = activeUriObs.read(r);
      if (!uri) {
        return void 0;
      }
      return new ObservableEditorSession(uri, chatEditingService, inlineChatService).value.read(r);
    });
    const isInProgress = derived((r) => {
      const session = sessionAndEntry.read(r)?.session;
      if (!session) {
        return false;
      }
      const chatModel = chatService.getSession(session.chatSessionId);
      const lastResponse = observableFromEvent(this, chatModel.onDidChange, () => chatModel.getRequests().at(-1)?.response);
      const response = lastResponse.read(r);
      if (!response) {
        return false;
      }
      return observableFromEvent(this, response.onDidChange, () => !response.isComplete).read(r);
    });
    this._store.add(autorun((r) => {
      const data = sessionAndEntry.read(r);
      if (!data) {
        hide();
        return;
      }
      const { session, entry } = data;
      if (entry?.state.read(r) === ModifiedFileEntryState.Modified || !session.isGlobalEditingSession && isInProgress.read(r)) {
        const editorPane = group.activeEditorPane;
        assertType(editorPane);
        const changeIndex = derived((r2) => entry ? entry.getEditorIntegration(editorPane).currentIndex.read(r2) : 0);
        const entryIndex = derived(
          (r2) => entry ? session.entries.read(r2).indexOf(entry) : 0
        );
        widget.show(session, entry, { entryIndex, changeIndex });
        show();
      } else {
        hide();
      }
    }));
  }
  dispose() {
    this._store.dispose();
  }
};
ChatEditingOverlayController = __decorateClass([
  __decorateParam(2, IInstantiationService),
  __decorateParam(3, IChatService),
  __decorateParam(4, IChatEditingService),
  __decorateParam(5, IInlineChatSessionService)
], ChatEditingOverlayController);
let ChatEditingEditorOverlay = class {
  static {
    __name(this, "ChatEditingEditorOverlay");
  }
  static ID = "chat.edits.editorOverlay";
  _store = new DisposableStore();
  constructor(editorGroupsService, instantiationService) {
    const editorGroups = observableFromEvent(
      this,
      Event.any(editorGroupsService.onDidAddGroup, editorGroupsService.onDidRemoveGroup),
      () => editorGroupsService.groups
    );
    const overlayWidgets = new DisposableMap();
    this._store.add(autorun((r) => {
      const toDelete = new Set(overlayWidgets.keys());
      const groups = editorGroups.read(r);
      for (const group of groups) {
        if (!(group instanceof EditorGroupView)) {
          continue;
        }
        toDelete.delete(group);
        if (!overlayWidgets.has(group)) {
          const scopedInstaService = instantiationService.createChild(
            new ServiceCollection([IContextKeyService, group.scopedContextKeyService])
          );
          const container = group.element;
          const ctrl = scopedInstaService.createInstance(ChatEditingOverlayController, container, group);
          overlayWidgets.set(group, combinedDisposable(ctrl, scopedInstaService));
        }
      }
      for (const group of toDelete) {
        overlayWidgets.deleteAndDispose(group);
      }
    }));
  }
  dispose() {
    this._store.dispose();
  }
};
ChatEditingEditorOverlay = __decorateClass([
  __decorateParam(0, IEditorGroupsService),
  __decorateParam(1, IInstantiationService)
], ChatEditingEditorOverlay);
export {
  ChatEditingEditorOverlay
};
//# sourceMappingURL=chatEditingEditorOverlay.js.map
