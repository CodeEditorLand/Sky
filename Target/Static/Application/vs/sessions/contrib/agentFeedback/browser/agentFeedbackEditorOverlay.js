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
import "./media/agentFeedbackEditorOverlay.css";
import { Disposable, DisposableMap, DisposableStore, combinedDisposable, toDisposable } from "../../../../base/common/lifecycle.js";
import { autorun, observableFromEvent, observableSignalFromEvent, observableValue } from "../../../../base/common/observable.js";
import { ActionViewItem } from "../../../../base/browser/ui/actionbar/actionViewItems.js";
import { Event } from "../../../../base/common/event.js";
import { MenuWorkbenchToolBar } from "../../../../platform/actions/browser/toolbar.js";
import { IContextKeyService } from "../../../../platform/contextkey/common/contextkey.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { ServiceCollection } from "../../../../platform/instantiation/common/serviceCollection.js";
import { IKeybindingService } from "../../../../platform/keybinding/common/keybinding.js";
import { EditorGroupView } from "../../../../workbench/browser/parts/editor/editorGroupView.js";
import { IEditorGroupsService } from "../../../../workbench/services/editor/common/editorGroupsService.js";
import { IAgentFeedbackService } from "./agentFeedbackService.js";
import { navigateNextFeedbackActionId, navigatePreviousFeedbackActionId, navigationBearingFakeActionId, submitFeedbackActionId } from "./agentFeedbackEditorActions.js";
import { assertType } from "../../../../base/common/types.js";
import { localize } from "../../../../nls.js";
import { getActiveResourceCandidates, getSessionForResource } from "./agentFeedbackEditorUtils.js";
import { Menus } from "../../../browser/menus.js";
import { IChatEditingService } from "../../../../workbench/contrib/chat/common/editing/chatEditingService.js";
import { IAgentSessionsService } from "../../../../workbench/contrib/chat/browser/agentSessions/agentSessionsService.js";
class AgentFeedbackActionViewItem extends ActionViewItem {
  static {
    __name(this, "AgentFeedbackActionViewItem");
  }
  constructor(action, options, _keybindingService, _primaryActionIds = [submitFeedbackActionId]) {
    const isIconOnly = action.id === navigatePreviousFeedbackActionId || action.id === navigateNextFeedbackActionId;
    super(void 0, action, { ...options, icon: isIconOnly, label: !isIconOnly, keybindingNotRenderedWithLabel: true });
    this._keybindingService = _keybindingService;
    this._primaryActionIds = _primaryActionIds;
  }
  render(container) {
    super.render(container);
    if (this._primaryActionIds.includes(this._action.id)) {
      this.element?.classList.add("primary");
    }
  }
  getTooltip() {
    const value = super.getTooltip();
    if (!value || this.options.keybinding) {
      return value;
    }
    return this._keybindingService.appendKeybinding(value, this._action.id);
  }
}
let AgentFeedbackOverlayWidget = class AgentFeedbackOverlayWidget2 extends Disposable {
  static {
    __name(this, "AgentFeedbackOverlayWidget");
  }
  constructor(_instaService, _keybindingService) {
    super();
    this._instaService = _instaService;
    this._keybindingService = _keybindingService;
    this._showStore = this._store.add(new DisposableStore());
    this._navigationBearings = observableValue(this, { activeIdx: -1, totalCount: 0 });
    this._domNode = document.createElement("div");
    this._domNode.classList.add("agent-feedback-editor-overlay-widget");
    this._toolbarNode = document.createElement("div");
    this._toolbarNode.classList.add("agent-feedback-editor-overlay-toolbar");
  }
  getDomNode() {
    return this._domNode;
  }
  show(navigationBearings) {
    this._showStore.clear();
    this._navigationBearings.set(navigationBearings, void 0);
    if (!this._domNode.contains(this._toolbarNode)) {
      this._domNode.appendChild(this._toolbarNode);
    }
    this._showStore.add(this._instaService.createInstance(MenuWorkbenchToolBar, this._toolbarNode, Menus.AgentFeedbackEditorContent, {
      telemetrySource: "agentFeedback.overlayToolbar",
      hiddenItemStrategy: 0,
      toolbarOptions: {
        primaryGroup: /* @__PURE__ */ __name(() => true, "primaryGroup"),
        useSeparatorsInPrimaryActions: true
      },
      menuOptions: { renderShortTitle: true },
      actionViewItemProvider: /* @__PURE__ */ __name((action, options) => {
        if (action.id === navigationBearingFakeActionId) {
          const that = this;
          return new class extends ActionViewItem {
            constructor() {
              super(void 0, action, { ...options, icon: false, label: true, keybindingNotRenderedWithLabel: true });
            }
            render(container) {
              super.render(container);
              container.classList.add("label-item");
              this._store.add(autorun((r) => {
                assertType(this.label);
                const { activeIdx, totalCount } = that._navigationBearings.read(r);
                if (totalCount > 0) {
                  const current = activeIdx === -1 ? 1 : activeIdx + 1;
                  this.label.innerText = localize("nOfM", "{0}/{1}", current, totalCount);
                } else {
                  this.label.innerText = localize("zero", "0/0");
                }
              }));
            }
          }();
        }
        return new AgentFeedbackActionViewItem(action, options, this._keybindingService);
      }, "actionViewItemProvider")
    }));
    this._showStore.add(toDisposable(() => this._toolbarNode.remove()));
  }
  hide() {
    this._showStore.clear();
    this._navigationBearings.set({ activeIdx: -1, totalCount: 0 }, void 0);
    this._toolbarNode.remove();
  }
};
AgentFeedbackOverlayWidget = __decorate([
  __param(0, IInstantiationService),
  __param(1, IKeybindingService)
], AgentFeedbackOverlayWidget);
let AgentFeedbackOverlayController = class AgentFeedbackOverlayController2 {
  static {
    __name(this, "AgentFeedbackOverlayController");
  }
  constructor(container, group, agentFeedbackService, agentSessionsService, instaService, chatEditingService) {
    this._store = new DisposableStore();
    this._domNode = document.createElement("div");
    this._domNode.classList.add("agent-feedback-editor-overlay");
    this._domNode.style.position = "absolute";
    this._domNode.style.bottom = "24px";
    this._domNode.style.right = "24px";
    this._domNode.style.zIndex = "100";
    const widget = this._store.add(instaService.createInstance(AgentFeedbackOverlayWidget));
    this._domNode.appendChild(widget.getDomNode());
    this._store.add(toDisposable(() => this._domNode.remove()));
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
    const activeSignal = observableSignalFromEvent(this, Event.any(group.onDidActiveEditorChange, group.onDidModelChange, agentFeedbackService.onDidChangeFeedback, agentFeedbackService.onDidChangeNavigation));
    this._store.add(autorun((r) => {
      activeSignal.read(r);
      const candidates = getActiveResourceCandidates(group.activeEditorPane?.input);
      let navigationBearings = void 0;
      for (const candidate of candidates) {
        const sessionResource = getSessionForResource(candidate, chatEditingService, agentSessionsService);
        if (sessionResource && agentFeedbackService.getFeedback(sessionResource).length > 0) {
          navigationBearings = agentFeedbackService.getNavigationBearing(sessionResource);
          break;
        }
      }
      if (!navigationBearings) {
        hide();
        return;
      }
      widget.show(navigationBearings);
      show();
    }));
  }
  dispose() {
    this._store.dispose();
  }
};
AgentFeedbackOverlayController = __decorate([
  __param(2, IAgentFeedbackService),
  __param(3, IAgentSessionsService),
  __param(4, IInstantiationService),
  __param(5, IChatEditingService)
], AgentFeedbackOverlayController);
let AgentFeedbackEditorOverlay = class AgentFeedbackEditorOverlay2 {
  static {
    __name(this, "AgentFeedbackEditorOverlay");
  }
  static {
    this.ID = "chat.agentFeedback.editorOverlay";
  }
  constructor(editorGroupsService, instantiationService) {
    this._store = new DisposableStore();
    const editorGroups = observableFromEvent(this, Event.any(editorGroupsService.onDidAddGroup, editorGroupsService.onDidRemoveGroup), () => editorGroupsService.groups);
    const overlayWidgets = this._store.add(new DisposableMap());
    this._store.add(autorun((r) => {
      const groups = editorGroups.read(r);
      const toDelete = new Set(overlayWidgets.keys());
      for (const group of groups) {
        if (!(group instanceof EditorGroupView)) {
          continue;
        }
        toDelete.delete(group);
        if (!overlayWidgets.has(group)) {
          const scopedInstaService = instantiationService.createChild(new ServiceCollection([IContextKeyService, group.scopedContextKeyService]));
          const ctrl = scopedInstaService.createInstance(AgentFeedbackOverlayController, group.element, group);
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
AgentFeedbackEditorOverlay = __decorate([
  __param(0, IEditorGroupsService),
  __param(1, IInstantiationService)
], AgentFeedbackEditorOverlay);
export {
  AgentFeedbackEditorOverlay
};
//# sourceMappingURL=agentFeedbackEditorOverlay.js.map
