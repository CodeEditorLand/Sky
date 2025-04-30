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
import "../media/chatEditingEditorOverlay.css";
import { combinedDisposable, Disposable, DisposableMap, DisposableStore, MutableDisposable, toDisposable } from "../../../../../base/common/lifecycle.js";
import { autorun, derived, derivedOpts, observableFromEvent, observableFromEventOpts, observableSignalFromEvent, observableValue, transaction } from "../../../../../base/common/observable.js";
import { MenuWorkbenchToolBar } from "../../../../../platform/actions/browser/toolbar.js";
import { IInstantiationService } from "../../../../../platform/instantiation/common/instantiation.js";
import { IChatEditingService } from "../../common/chatEditingService.js";
import { MenuId } from "../../../../../platform/actions/common/actions.js";
import { ActionViewItem } from "../../../../../base/browser/ui/actionbar/actionViewItems.js";
import { $, addDisposableGenericMouseMoveListener, append } from "../../../../../base/browser/dom.js";
import { assertType } from "../../../../../base/common/types.js";
import { localize } from "../../../../../nls.js";
import { AcceptAction, navigationBearingFakeActionId, RejectAction } from "./chatEditingEditorActions.js";
import { IChatService } from "../../common/chatService.js";
import { IEditorGroupsService } from "../../../../services/editor/common/editorGroupsService.js";
import { EditorGroupView } from "../../../../browser/parts/editor/editorGroupView.js";
import { Event } from "../../../../../base/common/event.js";
import { ServiceCollection } from "../../../../../platform/instantiation/common/serviceCollection.js";
import { IContextKeyService } from "../../../../../platform/contextkey/common/contextkey.js";
import { EditorResourceAccessor, SideBySideEditor } from "../../../../common/editor.js";
import { IInlineChatSessionService } from "../../../inlineChat/browser/inlineChatSessionService.js";
import { isEqual } from "../../../../../base/common/resources.js";
import { ObservableEditorSession } from "./chatEditingEditorContextKeys.js";
import { Codicon } from "../../../../../base/common/codicons.js";
import { renderIcon } from "../../../../../base/browser/ui/iconLabel/iconLabels.js";
import { ThemeIcon } from "../../../../../base/common/themables.js";
import * as arrays from "../../../../../base/common/arrays.js";
import { renderStringAsPlaintext } from "../../../../../base/browser/markdownRenderer.js";
let ChatEditorOverlayWidget = class ChatEditorOverlayWidget2 extends Disposable {
  static {
    __name(this, "ChatEditorOverlayWidget");
  }
  constructor(_editor, _chatService, _instaService) {
    super();
    this._editor = _editor;
    this._chatService = _chatService;
    this._instaService = _instaService;
    this._showStore = this._store.add(new DisposableStore());
    this._session = observableValue(this, void 0);
    this._entry = observableValue(this, void 0);
    this._navigationBearings = observableValue(this, { changeCount: -1, activeIdx: -1, entriesCount: -1 });
    this._domNode = document.createElement("div");
    this._domNode.classList.add("chat-editor-overlay-widget");
    this._isBusy = derived((r) => {
      const session = this._session.read(r);
      const chatModel = session && _chatService.getSession(session?.chatSessionId);
      return chatModel && observableFromEvent(this, chatModel.onDidChange, () => chatModel.requestInProgress).read(r);
    });
    const requestMessage = derived((r) => {
      const session = this._session.read(r);
      const chatModel = this._chatService.getSession(session?.chatSessionId ?? "");
      if (!session || !chatModel) {
        return void 0;
      }
      const response = this._entry.read(r)?.lastModifyingResponse.read(r);
      if (!response) {
        return { message: localize("working", "Working...") };
      }
      if (response.isPaused.read(r)) {
        return { message: localize("paused", "Paused"), paused: true };
      }
      const lastPart = observableFromEventOpts({ equalsFn: arrays.equals }, response.onDidChange, () => response.response.value).read(r).filter((part) => part.kind === "progressMessage" || part.kind === "toolInvocation").at(-1);
      if (lastPart?.kind === "toolInvocation") {
        return { message: lastPart.invocationMessage };
      } else if (lastPart?.kind === "progressMessage") {
        return { message: lastPart.content };
      } else {
        return { message: localize("working", "Working...") };
      }
    });
    const progressNode = document.createElement("div");
    progressNode.classList.add("chat-editor-overlay-progress");
    append(progressNode, renderIcon(ThemeIcon.modify(Codicon.loading, "spin")));
    const textProgress = append(progressNode, $("span.progress-message"));
    this._domNode.appendChild(progressNode);
    this._store.add(autorun((r) => {
      const value = requestMessage.read(r);
      const busy = this._isBusy.read(r) && !value?.paused;
      this._domNode.classList.toggle("busy", busy);
      if (!busy || !value || this._session.read(r)?.isGlobalEditingSession) {
        textProgress.innerText = "";
      } else if (value) {
        textProgress.innerText = renderStringAsPlaintext(value.message);
      }
    }));
    this._toolbarNode = document.createElement("div");
    this._toolbarNode.classList.add("chat-editor-overlay-toolbar");
  }
  dispose() {
    this.hide();
    super.dispose();
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
    this._domNode.appendChild(this._toolbarNode);
    this._showStore.add(toDisposable(() => this._toolbarNode.remove()));
    this._showStore.add(this._instaService.createInstance(MenuWorkbenchToolBar, this._toolbarNode, MenuId.ChatEditingEditorContent, {
      telemetrySource: "chatEditor.overlayToolbar",
      hiddenItemStrategy: 0,
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
                  this.label.innerText = localize("0Of0", "\u2014");
                }
                this.updateTooltip();
              }));
            }
            getTooltip() {
              const { changeCount, entriesCount } = that._navigationBearings.get();
              if (changeCount === -1 || entriesCount === -1) {
                return void 0;
              }
              let result;
              if (changeCount === 1 && entriesCount === 1) {
                result = localize("tooltip_11", "1 change in 1 file");
              } else if (changeCount === 1) {
                result = localize("tooltip_1n", "1 change in {0} files", entriesCount);
              } else if (entriesCount === 1) {
                result = localize("tooltip_n1", "{0} changes in 1 file", changeCount);
              } else {
                result = localize("tooltip_nm", "{0} changes in {1} files", changeCount, entriesCount);
              }
              if (!that._isBusy.get()) {
                return result;
              }
              return localize("tooltip_busy", "{0} - Working...", result);
            }
          }();
        }
        if (action.id === AcceptAction.ID || action.id === RejectAction.ID) {
          return new class extends ActionViewItem {
            constructor() {
              super(void 0, action, { ...options, icon: false, label: true, keybindingNotRenderedWithLabel: true });
              this._reveal = this._store.add(new MutableDisposable());
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
        return void 0;
      }, "actionViewItemProvider")
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
ChatEditorOverlayWidget = __decorate([
  __param(1, IChatService),
  __param(2, IInstantiationService)
], ChatEditorOverlayWidget);
let ChatEditingOverlayController = class ChatEditingOverlayController2 {
  static {
    __name(this, "ChatEditingOverlayController");
  }
  constructor(container, group, instaService, chatService, chatEditingService, inlineChatService) {
    this._store = new DisposableStore();
    this._domNode = document.createElement("div");
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
      if (!session.isGlobalEditingSession && !inlineChatService.hideOnRequest.read(r)) {
        hide();
        return;
      }
      if (entry?.state.read(r) === 0 || !session.isGlobalEditingSession && isInProgress.read(r)) {
        const editorPane = group.activeEditorPane;
        assertType(editorPane);
        const changeIndex = derived((r2) => entry ? entry.getEditorIntegration(editorPane).currentIndex.read(r2) : 0);
        const entryIndex = derived((r2) => entry ? session.entries.read(r2).indexOf(entry) : 0);
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
ChatEditingOverlayController = __decorate([
  __param(2, IInstantiationService),
  __param(3, IChatService),
  __param(4, IChatEditingService),
  __param(5, IInlineChatSessionService)
], ChatEditingOverlayController);
let ChatEditingEditorOverlay = class ChatEditingEditorOverlay2 {
  static {
    __name(this, "ChatEditingEditorOverlay");
  }
  static {
    this.ID = "chat.edits.editorOverlay";
  }
  constructor(editorGroupsService, instantiationService) {
    this._store = new DisposableStore();
    const editorGroups = observableFromEvent(this, Event.any(editorGroupsService.onDidAddGroup, editorGroupsService.onDidRemoveGroup), () => editorGroupsService.groups);
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
          const scopedInstaService = instantiationService.createChild(new ServiceCollection([IContextKeyService, group.scopedContextKeyService]));
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
ChatEditingEditorOverlay = __decorate([
  __param(0, IEditorGroupsService),
  __param(1, IInstantiationService)
], ChatEditingEditorOverlay);
export {
  ChatEditingEditorOverlay
};
//# sourceMappingURL=chatEditingEditorOverlay.js.map
