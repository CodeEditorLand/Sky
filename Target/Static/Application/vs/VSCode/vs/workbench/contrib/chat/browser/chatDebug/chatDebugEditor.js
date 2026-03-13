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
var ChatDebugEditor_1;
import "./media/chatDebug.css";
import * as DOM from "../../../../../base/browser/dom.js";
import { DisposableMap, MutableDisposable } from "../../../../../base/common/lifecycle.js";
import { IContextKeyService } from "../../../../../platform/contextkey/common/contextkey.js";
import { IInstantiationService } from "../../../../../platform/instantiation/common/instantiation.js";
import { IStorageService } from "../../../../../platform/storage/common/storage.js";
import { ITelemetryService } from "../../../../../platform/telemetry/common/telemetry.js";
import { IThemeService } from "../../../../../platform/theme/common/themeService.js";
import { EditorPane } from "../../../../browser/parts/editor/editorPane.js";
import { IChatDebugService } from "../../common/chatDebugService.js";
import { IChatService } from "../../common/chatService/chatService.js";
import { IChatWidgetService } from "../chat.js";
import { ChatDebugFilterState, registerFilterMenuItems } from "./chatDebugFilters.js";
import { ChatDebugHomeView } from "./chatDebugHomeView.js";
import { ChatDebugOverviewView } from "./chatDebugOverviewView.js";
import { ChatDebugLogsView } from "./chatDebugLogsView.js";
import { ChatDebugFlowChartView } from "./chatDebugFlowChartView.js";
const $ = DOM.$;
let ChatDebugEditor = class ChatDebugEditor2 extends EditorPane {
  static {
    __name(this, "ChatDebugEditor");
  }
  static {
    ChatDebugEditor_1 = this;
  }
  static {
    this.ID = "workbench.editor.chatDebug";
  }
  /**
   * Stops the streaming pipeline and clears cached events for the
   * active session. Called when navigating away from a session or
   * when the editor becomes hidden.
   */
  endActiveSession() {
    const sessionResource = this.chatDebugService.activeSessionResource;
    if (sessionResource) {
      this.chatDebugService.endSession(sessionResource);
    }
    this.chatDebugService.activeSessionResource = void 0;
  }
  constructor(group, telemetryService, themeService, storageService, instantiationService, chatDebugService, chatWidgetService, chatService, contextKeyService) {
    super(ChatDebugEditor_1.ID, group, telemetryService, themeService, storageService);
    this.instantiationService = instantiationService;
    this.chatDebugService = chatDebugService;
    this.chatWidgetService = chatWidgetService;
    this.chatService = chatService;
    this.contextKeyService = contextKeyService;
    this.viewState = "home";
    this.sessionModelListener = this._register(new MutableDisposable());
    this.modelChangeListeners = this._register(new DisposableMap());
  }
  createEditor(parent) {
    this.container = DOM.append(parent, $(".chat-debug-editor"));
    this.filterState = this._register(new ChatDebugFilterState());
    const scopedContextKeyService = this._register(this.contextKeyService.createScoped(this.container));
    this._register(registerFilterMenuItems(this.filterState, scopedContextKeyService));
    this.homeView = this._register(this.instantiationService.createInstance(ChatDebugHomeView, this.container));
    this._register(this.homeView.onNavigateToSession((sessionResource) => {
      this.navigateToSession(sessionResource);
    }));
    this.overviewView = this._register(this.instantiationService.createInstance(ChatDebugOverviewView, this.container));
    this._register(this.overviewView.onNavigate((nav) => {
      switch (nav) {
        case "home":
          this.endActiveSession();
          this.showView(
            "home"
            /* ViewState.Home */
          );
          break;
        case "logs":
          this.showView(
            "logs"
            /* ViewState.Logs */
          );
          break;
        case "flowchart":
          this.showView(
            "flowchart"
            /* ViewState.FlowChart */
          );
          break;
      }
    }));
    this.logsView = this._register(this.instantiationService.createInstance(ChatDebugLogsView, this.container, this.filterState));
    this._register(this.logsView.onNavigate((nav) => {
      switch (nav) {
        case "home":
          this.endActiveSession();
          this.showView(
            "home"
            /* ViewState.Home */
          );
          break;
        case "overview":
          this.showView(
            "overview"
            /* ViewState.Overview */
          );
          break;
      }
    }));
    this.flowChartView = this._register(this.instantiationService.createInstance(ChatDebugFlowChartView, this.container, this.filterState));
    this._register(this.flowChartView.onNavigate((nav) => {
      switch (nav) {
        case "home":
          this.endActiveSession();
          this.showView(
            "home"
            /* ViewState.Home */
          );
          break;
        case "overview":
          this.showView(
            "overview"
            /* ViewState.Overview */
          );
          break;
      }
    }));
    this._register(this.chatDebugService.onDidAddEvent((event) => {
      if (this.viewState === "home") {
        this.homeView?.render();
      } else if (this.chatDebugService.activeSessionResource && event.sessionResource.toString() === this.chatDebugService.activeSessionResource.toString()) {
        if (this.viewState === "overview") {
          this.overviewView?.refresh();
        } else if (this.viewState === "logs") {
          this.logsView?.refreshList();
        } else if (this.viewState === "flowchart") {
          this.flowChartView?.refresh();
        }
      }
    }));
    this._register(this.chatWidgetService.onDidChangeFocusedSession(() => {
      if (this.viewState === "home") {
        this.homeView?.render();
      }
    }));
    this._register(this.chatService.onDidCreateModel((model) => {
      if (this.viewState === "home") {
        this.navigateToSession(model.sessionResource);
      }
      const key = model.sessionResource.toString();
      this.modelChangeListeners.set(key, model.onDidChange((e) => {
        if (e.kind === "setCustomTitle") {
          if (this.viewState === "home") {
            this.homeView?.render();
          } else if (this.viewState === "overview" || this.viewState === "logs" || this.viewState === "flowchart") {
            this.overviewView?.updateBreadcrumb();
            this.logsView?.updateBreadcrumb();
            this.flowChartView?.updateBreadcrumb();
          }
        }
      }));
    }));
    this._register(this.chatService.onDidDisposeSession(() => {
      if (this.viewState === "home") {
        this.homeView?.render();
      }
    }));
    this.showView(
      "home"
      /* ViewState.Home */
    );
  }
  // =====================================================================
  // View switching
  // =====================================================================
  showView(state) {
    this.viewState = state;
    this.telemetryService.publicLog2("chatDebugViewSwitched", {
      viewState: state
    });
    if (state === "home") {
      this.homeView?.show();
    } else {
      this.homeView?.hide();
    }
    if (state === "overview") {
      this.overviewView?.show();
    } else {
      this.overviewView?.hide();
    }
    if (state === "logs") {
      this.logsView?.show();
      this.doLayout();
      this.logsView?.focus();
    } else {
      this.logsView?.hide();
    }
    if (state === "flowchart") {
      this.flowChartView?.show();
    } else {
      this.flowChartView?.hide();
    }
  }
  navigateToSession(sessionResource, view) {
    const previousSessionResource = this.chatDebugService.activeSessionResource;
    if (previousSessionResource && previousSessionResource.toString() !== sessionResource.toString()) {
      this.chatDebugService.endSession(previousSessionResource);
    }
    this.chatDebugService.activeSessionResource = sessionResource;
    if (!this.chatDebugService.hasInvokedProviders(sessionResource)) {
      this.chatDebugService.invokeProviders(sessionResource);
    }
    this.trackSessionModelChanges(sessionResource);
    this.overviewView?.setSession(sessionResource);
    this.logsView?.setSession(sessionResource);
    this.flowChartView?.setSession(sessionResource);
    this.showView(
      view === "logs" ? "logs" : view === "flowchart" ? "flowchart" : "overview"
      /* ViewState.Overview */
    );
  }
  trackSessionModelChanges(sessionResource) {
    const model = this.chatService.getSession(sessionResource);
    if (!model) {
      this.sessionModelListener.clear();
      return;
    }
    this.sessionModelListener.value = model.onDidChange((e) => {
      if (e.kind === "addRequest" || e.kind === "completedRequest") {
        if (this.viewState === "overview") {
          this.overviewView?.refresh();
        }
      }
    });
  }
  // =====================================================================
  // EditorPane overrides
  // =====================================================================
  focus() {
    if (this.viewState === "logs") {
      this.logsView?.focus();
    } else {
      this.container?.focus();
    }
  }
  async setInput(input, options, context, token) {
    await super.setInput(input, options, context, token);
    if (options) {
      this._applyNavigationOptions(options);
    }
  }
  setOptions(options) {
    super.setOptions(options);
    if (options) {
      this._applyNavigationOptions(options);
    }
  }
  setEditorVisible(visible) {
    super.setEditorVisible(visible);
    if (visible) {
      this.telemetryService.publicLog2("chatDebugPanelOpened");
      this.showView(this.viewState);
    }
  }
  _applyNavigationOptions(options) {
    const { sessionResource, viewHint, filter } = options;
    if (viewHint === "logs" && sessionResource) {
      this.navigateToSession(sessionResource, "logs");
    } else if (viewHint === "flowchart" && sessionResource) {
      this.navigateToSession(sessionResource, "flowchart");
    } else if (viewHint === "overview" && sessionResource) {
      this.navigateToSession(sessionResource, "overview");
    } else if (viewHint === "home") {
      this.endActiveSession();
      this.showView(
        "home"
        /* ViewState.Home */
      );
    } else if (sessionResource) {
      this.navigateToSession(sessionResource, "overview");
    } else if (this.viewState === "home") {
      this.showView(
        "home"
        /* ViewState.Home */
      );
    }
    if (filter !== void 0 && this.filterState) {
      this.filterState.setTextFilter(filter);
      this.logsView?.setFilterText(filter);
    }
  }
  layout(dimension) {
    this.currentDimension = dimension;
    if (this.container) {
      this.container.style.width = `${dimension.width}px`;
      this.container.style.height = `${dimension.height}px`;
    }
    this.doLayout();
  }
  doLayout() {
    if (!this.currentDimension || this.viewState !== "logs") {
      return;
    }
    this.logsView?.layout(this.currentDimension);
  }
};
ChatDebugEditor = ChatDebugEditor_1 = __decorate([
  __param(1, ITelemetryService),
  __param(2, IThemeService),
  __param(3, IStorageService),
  __param(4, IInstantiationService),
  __param(5, IChatDebugService),
  __param(6, IChatWidgetService),
  __param(7, IChatService),
  __param(8, IContextKeyService)
], ChatDebugEditor);
export {
  ChatDebugEditor
};
//# sourceMappingURL=chatDebugEditor.js.map
