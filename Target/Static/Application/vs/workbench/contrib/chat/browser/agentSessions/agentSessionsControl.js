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
import { IContextKeyService } from "../../../../../platform/contextkey/common/contextkey.js";
import { ChatContextKeys } from "../../common/actions/chatContextKeys.js";
import { IContextMenuService } from "../../../../../platform/contextview/browser/contextView.js";
import { IInstantiationService } from "../../../../../platform/instantiation/common/instantiation.js";
import { WorkbenchCompressibleAsyncDataTree } from "../../../../../platform/list/browser/listService.js";
import { $, append, EventHelper } from "../../../../../base/browser/dom.js";
import { isAgentSession, isAgentSessionSection } from "./agentSessionsModel.js";
import { AgentSessionRenderer, AgentSessionsAccessibilityProvider, AgentSessionsCompressionDelegate, AgentSessionsDataSource, AgentSessionsDragAndDrop, AgentSessionsIdentityProvider, AgentSessionsKeyboardNavigationLabelProvider, AgentSessionsListDelegate, AgentSessionSectionRenderer, AgentSessionsSorter } from "./agentSessionsViewer.js";
import { IMenuService, MenuId } from "../../../../../platform/actions/common/actions.js";
import { IChatSessionsService } from "../../common/chatSessionsService.js";
import { ICommandService } from "../../../../../platform/commands/common/commands.js";
import { ACTION_ID_NEW_CHAT } from "../actions/chatActions.js";
import { Emitter, Event } from "../../../../../base/common/event.js";
import { Disposable } from "../../../../../base/common/lifecycle.js";
import { Throttler } from "../../../../../base/common/async.js";
import { Separator } from "../../../../../base/common/actions.js";
import { RenderIndentGuides, TreeFindMode } from "../../../../../base/browser/ui/tree/abstractTree.js";
import { IAgentSessionsService } from "./agentSessionsService.js";
import { ITelemetryService } from "../../../../../platform/telemetry/common/telemetry.js";
import { getAgentSessionTime } from "./agentSessions.js";
import { openSession } from "./agentSessionsOpener.js";
import { IEditorService } from "../../../../services/editor/common/editorService.js";
import { ChatEditorInput } from "../widgetHosts/editor/chatEditorInput.js";
let AgentSessionsControl = class AgentSessionsControl2 extends Disposable {
  static {
    __name(this, "AgentSessionsControl");
  }
  get element() {
    return this.sessionsContainer;
  }
  constructor(container, options, contextMenuService, contextKeyService, instantiationService, chatSessionsService, commandService, menuService, agentSessionsService, telemetryService, editorService) {
    super();
    this.container = container;
    this.options = options;
    this.contextMenuService = contextMenuService;
    this.contextKeyService = contextKeyService;
    this.instantiationService = instantiationService;
    this.chatSessionsService = chatSessionsService;
    this.commandService = commandService;
    this.menuService = menuService;
    this.agentSessionsService = agentSessionsService;
    this.telemetryService = telemetryService;
    this.editorService = editorService;
    this.sessionsListFindIsOpen = false;
    this.updateSessionsListThrottler = this._register(new Throttler());
    this._onDidUpdate = this._register(new Emitter());
    this.onDidUpdate = this._onDidUpdate.event;
    this.visible = true;
    this.focusedAgentSessionArchivedContextKey = ChatContextKeys.isArchivedAgentSession.bindTo(this.contextKeyService);
    this.focusedAgentSessionReadContextKey = ChatContextKeys.isReadAgentSession.bindTo(this.contextKeyService);
    this.focusedAgentSessionTypeContextKey = ChatContextKeys.agentSessionType.bindTo(this.contextKeyService);
    this.hasMultipleAgentSessionsSelectedContextKey = ChatContextKeys.hasMultipleAgentSessionsSelected.bindTo(this.contextKeyService);
    this.createList(this.container);
    this.registerListeners();
  }
  registerListeners() {
    this._register(this.editorService.onDidActiveEditorChange(() => this.revealAndFocusActiveEditorSession()));
  }
  revealAndFocusActiveEditorSession() {
    if (!this.options.trackActiveEditorSession() || !this.visible) {
      return;
    }
    const input = this.editorService.activeEditor;
    const resource = input instanceof ChatEditorInput ? input.sessionResource : input?.resource;
    if (!resource) {
      return;
    }
    const matchingSession = this.agentSessionsService.model.getSession(resource);
    if (matchingSession && this.sessionsList?.hasNode(matchingSession)) {
      if (this.sessionsList.getRelativeTop(matchingSession) === null) {
        this.sessionsList.reveal(matchingSession, 0.5);
      }
      this.sessionsList.setFocus([matchingSession]);
      this.sessionsList.setSelection([matchingSession]);
    }
  }
  createList(container) {
    this.sessionsContainer = append(container, $(".agent-sessions-viewer"));
    const collapseByDefault = /* @__PURE__ */ __name((element) => {
      if (isAgentSessionSection(element)) {
        if (element.section === "more" && !this.options.filter.getExcludes().read) {
          return true;
        }
        if (element.section === "archived" && this.options.filter.getExcludes().archived) {
          return true;
        }
        if (this.options.collapseOlderSections?.()) {
          const olderSections = [
            "week",
            "older",
            "archived"
            /* AgentSessionSection.Archived */
          ];
          if (olderSections.includes(element.section)) {
            return true;
          }
          if (element.section === "yesterday" && this.hasTodaySessions()) {
            return true;
          }
        }
      }
      return false;
    }, "collapseByDefault");
    const sorter = new AgentSessionsSorter(this.options);
    const list = this.sessionsList = this._register(this.instantiationService.createInstance(WorkbenchCompressibleAsyncDataTree, "AgentSessionsView", this.sessionsContainer, new AgentSessionsListDelegate(), new AgentSessionsCompressionDelegate(), [
      this._register(this.instantiationService.createInstance(AgentSessionRenderer, this.options)),
      this.instantiationService.createInstance(AgentSessionSectionRenderer)
    ], new AgentSessionsDataSource(this.options.filter, sorter), {
      accessibilityProvider: new AgentSessionsAccessibilityProvider(),
      dnd: this.instantiationService.createInstance(AgentSessionsDragAndDrop),
      identityProvider: new AgentSessionsIdentityProvider(),
      horizontalScrolling: false,
      multipleSelectionSupport: true,
      findWidgetEnabled: true,
      defaultFindMode: TreeFindMode.Filter,
      keyboardNavigationLabelProvider: new AgentSessionsKeyboardNavigationLabelProvider(),
      overrideStyles: this.options.overrideStyles,
      twistieAdditionalCssClass: /* @__PURE__ */ __name(() => "force-no-twistie", "twistieAdditionalCssClass"),
      collapseByDefault: /* @__PURE__ */ __name((element) => collapseByDefault(element), "collapseByDefault"),
      renderIndentGuides: RenderIndentGuides.None
    }));
    ChatContextKeys.agentSessionsViewerFocused.bindTo(list.contextKeyService);
    const model = this.agentSessionsService.model;
    this._register(this.options.filter.onDidChange(async () => {
      if (this.visible) {
        this.updateSectionCollapseStates();
        this.update();
      }
    }));
    this._register(model.onDidChangeSessions(() => {
      if (this.visible) {
        this.update();
      }
    }));
    list.setInput(model);
    this._register(list.onDidOpen((e) => this.openAgentSession(e)));
    this._register(list.onContextMenu((e) => this.showContextMenu(e)));
    this._register(list.onMouseDblClick(({ element }) => {
      if (element === null) {
        this.commandService.executeCommand(ACTION_ID_NEW_CHAT);
      }
    }));
    this._register(Event.any(list.onDidChangeFocus, list.onDidChangeSelection, model.onDidChangeSessions)(() => {
      const focused = list.getFocus().at(0);
      if (focused && isAgentSession(focused)) {
        this.focusedAgentSessionArchivedContextKey.set(focused.isArchived());
        this.focusedAgentSessionReadContextKey.set(focused.isRead());
        this.focusedAgentSessionTypeContextKey.set(focused.providerType);
      } else {
        this.focusedAgentSessionArchivedContextKey.reset();
        this.focusedAgentSessionReadContextKey.reset();
        this.focusedAgentSessionTypeContextKey.reset();
      }
      const selection = list.getSelection().filter(isAgentSession);
      this.hasMultipleAgentSessionsSelectedContextKey.set(selection.length > 1);
    }));
    this._register(list.onDidChangeFindOpenState((open) => {
      this.sessionsListFindIsOpen = open;
      this.updateSectionCollapseStates();
    }));
  }
  hasTodaySessions() {
    const startOfToday = (/* @__PURE__ */ new Date()).setHours(0, 0, 0, 0);
    return this.agentSessionsService.model.sessions.some((session) => !session.isArchived() && getAgentSessionTime(session.timing) >= startOfToday);
  }
  async openAgentSession(e) {
    const element = e.element;
    if (!element || isAgentSessionSection(element)) {
      return;
    }
    this.telemetryService.publicLog2("agentSessionOpened", {
      providerType: element.providerType,
      source: this.options.source
    });
    const options = this.options.overrideSessionOpenOptions?.(e) ?? e;
    if (this.options.overrideSessionOpen) {
      await this.options.overrideSessionOpen(element.resource, options);
    } else {
      const widget = await this.instantiationService.invokeFunction(openSession, element, options);
      if (widget) {
        this.options.notifySessionOpened?.(element.resource, widget);
      }
    }
  }
  async showContextMenu({ element, anchor, browserEvent }) {
    if (!element) {
      return;
    }
    EventHelper.stop(browserEvent, true);
    if (isAgentSessionSection(element)) {
      this.showAgentSessionSectionContextMenu(element, anchor);
    } else {
      this.showAgentSessionContextMenu(element, anchor);
    }
  }
  async showAgentSessionSectionContextMenu(section, anchor) {
    const contextOverlay = [];
    contextOverlay.push([ChatContextKeys.agentSessionSection.key, section.section]);
    const menu = this.menuService.createMenu(MenuId.AgentSessionSectionContext, this.contextKeyService.createOverlay(contextOverlay));
    this.contextMenuService.showContextMenu({
      getActions: /* @__PURE__ */ __name(() => Separator.join(...menu.getActions({ arg: section, shouldForwardArgs: true }).map(([, actions]) => actions)), "getActions"),
      getAnchor: /* @__PURE__ */ __name(() => anchor, "getAnchor"),
      getActionsContext: /* @__PURE__ */ __name(() => section, "getActionsContext")
    });
    menu.dispose();
  }
  async showAgentSessionContextMenu(session, anchor) {
    this.chatSessionsService.activateChatSessionItemProvider(session.providerType);
    const contextOverlay = [];
    contextOverlay.push([ChatContextKeys.isArchivedAgentSession.key, session.isArchived()]);
    contextOverlay.push([ChatContextKeys.isReadAgentSession.key, session.isRead()]);
    contextOverlay.push([ChatContextKeys.agentSessionType.key, session.providerType]);
    const menu = this.menuService.createMenu(MenuId.AgentSessionsContext, this.contextKeyService.createOverlay(contextOverlay));
    const selection = this.sessionsList?.getSelection().filter(isAgentSession) ?? [];
    const marshalledContext = {
      session,
      sessions: selection.length > 1 && selection.includes(session) ? selection : [session],
      $mid: 25
      /* MarshalledId.AgentSessionContext */
    };
    this.contextMenuService.showContextMenu({
      getActions: /* @__PURE__ */ __name(() => Separator.join(...menu.getActions({ arg: marshalledContext, shouldForwardArgs: true }).map(([, actions]) => actions)), "getActions"),
      getAnchor: /* @__PURE__ */ __name(() => anchor, "getAnchor"),
      getActionsContext: /* @__PURE__ */ __name(() => marshalledContext, "getActionsContext")
    });
    menu.dispose();
  }
  openFind() {
    this.sessionsList?.openFind();
  }
  updateSectionCollapseStates() {
    if (!this.sessionsList) {
      return;
    }
    const model = this.agentSessionsService.model;
    for (const child of this.sessionsList.getNode(model).children) {
      if (!isAgentSessionSection(child.element)) {
        continue;
      }
      switch (child.element.section) {
        case "archived": {
          const shouldCollapseArchived = !this.sessionsListFindIsOpen && // always expand when find is open
          this.options.filter.getExcludes().archived;
          if (shouldCollapseArchived && !child.collapsed) {
            this.sessionsList.collapse(child.element);
          } else if (!shouldCollapseArchived && child.collapsed) {
            this.sessionsList.expand(child.element);
          }
          break;
        }
        case "more": {
          if (child.collapsed && this.sessionsListFindIsOpen) {
            this.sessionsList.expand(child.element);
          }
          break;
        }
      }
    }
  }
  refresh() {
    return this.agentSessionsService.model.resolve(void 0);
  }
  async update() {
    return this.updateSessionsListThrottler.queue(async () => {
      await this.sessionsList?.updateChildren();
      this._onDidUpdate.fire();
    });
  }
  setVisible(visible) {
    if (this.visible === visible) {
      return;
    }
    this.visible = visible;
    if (this.visible) {
      this.update();
    }
  }
  layout(height, width) {
    this.sessionsList?.layout(height, width);
  }
  focus() {
    this.sessionsList?.domFocus();
  }
  clearFocus() {
    this.sessionsList?.setFocus([]);
    this.sessionsList?.setSelection([]);
  }
  hasFocusOrSelection() {
    return (this.sessionsList?.getFocus().length ?? 0) > 0 || (this.sessionsList?.getSelection().length ?? 0) > 0;
  }
  scrollToTop() {
    if (this.sessionsList) {
      this.sessionsList.scrollTop = 0;
    }
  }
  getFocus() {
    const focused = this.sessionsList?.getFocus() ?? [];
    return focused.filter((e) => isAgentSession(e));
  }
  reveal(sessionResource) {
    if (!this.sessionsList) {
      return false;
    }
    const session = this.agentSessionsService.model.getSession(sessionResource);
    if (!session || !this.sessionsList.hasNode(session)) {
      return false;
    }
    if (this.sessionsList.getRelativeTop(session) === null) {
      this.sessionsList.reveal(session, 0.5);
    }
    this.sessionsList.setFocus([session]);
    this.sessionsList.setSelection([session]);
    return true;
  }
};
AgentSessionsControl = __decorate([
  __param(2, IContextMenuService),
  __param(3, IContextKeyService),
  __param(4, IInstantiationService),
  __param(5, IChatSessionsService),
  __param(6, ICommandService),
  __param(7, IMenuService),
  __param(8, IAgentSessionsService),
  __param(9, ITelemetryService),
  __param(10, IEditorService)
], AgentSessionsControl);
export {
  AgentSessionsControl
};
//# sourceMappingURL=agentSessionsControl.js.map
