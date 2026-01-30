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
import "./media/chatStatus.css";
import { Disposable, DisposableStore, MutableDisposable } from "../../../../../base/common/lifecycle.js";
import { localize } from "../../../../../nls.js";
import { IStatusbarService, ShowTooltipCommand } from "../../../../services/statusbar/browser/statusbar.js";
import { ChatEntitlement, IChatEntitlementService, isProUser } from "../../../../services/chat/common/chatEntitlementService.js";
import { IConfigurationService } from "../../../../../platform/configuration/common/configuration.js";
import { IEditorService } from "../../../../services/editor/common/editorService.js";
import { IInstantiationService } from "../../../../../platform/instantiation/common/instantiation.js";
import { getCodeEditor } from "../../../../../editor/browser/editorBrowser.js";
import { IInlineCompletionsService } from "../../../../../editor/browser/services/inlineCompletionsService.js";
import { IChatSessionsService } from "../../common/chatSessionsService.js";
import { ChatStatusDashboard } from "./chatStatusDashboard.js";
import { mainWindow } from "../../../../../base/browser/window.js";
import { disposableWindowInterval } from "../../../../../base/browser/dom.js";
import { isNewUser, isCompletionsEnabled } from "./chatStatus.js";
import product from "../../../../../platform/product/common/product.js";
let ChatStatusBarEntry = class ChatStatusBarEntry2 extends Disposable {
  static {
    __name(this, "ChatStatusBarEntry");
  }
  static {
    this.ID = "workbench.contrib.chatStatusBarEntry";
  }
  constructor(chatEntitlementService, instantiationService, statusbarService, editorService, configurationService, completionsService, chatSessionsService) {
    super();
    this.chatEntitlementService = chatEntitlementService;
    this.instantiationService = instantiationService;
    this.statusbarService = statusbarService;
    this.editorService = editorService;
    this.configurationService = configurationService;
    this.completionsService = completionsService;
    this.chatSessionsService = chatSessionsService;
    this.entry = void 0;
    this.activeCodeEditorListener = this._register(new MutableDisposable());
    this.runningSessionsCount = this.chatSessionsService.getInProgress().reduce((total, item) => total + item.count, 0);
    this.update();
    this.registerListeners();
  }
  update() {
    const sentiment = this.chatEntitlementService.sentiment;
    if (!sentiment.hidden) {
      const props = this.getEntryProps();
      if (this.entry) {
        this.entry.update(props);
      } else {
        this.entry = this.statusbarService.addEntry(props, "chat.statusBarEntry", 1, {
          location: { id: "status.editor.mode", priority: 100.1 },
          alignment: 1
          /* StatusbarAlignment.RIGHT */
        });
      }
    } else {
      this.entry?.dispose();
      this.entry = void 0;
    }
  }
  registerListeners() {
    this._register(this.chatEntitlementService.onDidChangeQuotaExceeded(() => this.update()));
    this._register(this.chatEntitlementService.onDidChangeSentiment(() => this.update()));
    this._register(this.chatEntitlementService.onDidChangeEntitlement(() => this.update()));
    this._register(this.completionsService.onDidChangeIsSnoozing(() => this.update()));
    this._register(this.chatSessionsService.onDidChangeInProgress(() => {
      const oldSessionsCount = this.runningSessionsCount;
      this.runningSessionsCount = this.chatSessionsService.getInProgress().reduce((total, item) => total + item.count, 0);
      if (this.runningSessionsCount !== oldSessionsCount) {
        this.update();
      }
    }));
    this._register(this.editorService.onDidActiveEditorChange(() => this.onDidActiveEditorChange()));
    this._register(this.configurationService.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration(product.defaultChatAgent?.completionsEnablementSetting)) {
        this.update();
      }
    }));
  }
  onDidActiveEditorChange() {
    this.update();
    this.activeCodeEditorListener.clear();
    const activeCodeEditor = getCodeEditor(this.editorService.activeTextEditorControl);
    if (activeCodeEditor) {
      this.activeCodeEditorListener.value = activeCodeEditor.onDidChangeModelLanguage(() => {
        this.update();
      });
    }
  }
  getEntryProps() {
    let text = "$(copilot)";
    let ariaLabel = localize("chatStatusAria", "Copilot status");
    let kind;
    if (isNewUser(this.chatEntitlementService)) {
      const entitlement = this.chatEntitlementService.entitlement;
      if (this.chatEntitlementService.sentiment.later || // user skipped setup
      entitlement === ChatEntitlement.Available || // user is entitled
      isProUser(entitlement) || // user is already pro
      entitlement === ChatEntitlement.Free) {
        const finishSetup = localize("finishSetup", "Finish Setup");
        text = `$(copilot) ${finishSetup}`;
        ariaLabel = finishSetup;
        kind = "prominent";
      }
    } else {
      const chatQuotaExceeded = this.chatEntitlementService.quotas.chat?.percentRemaining === 0;
      const completionsQuotaExceeded = this.chatEntitlementService.quotas.completions?.percentRemaining === 0;
      if (this.chatEntitlementService.sentiment.disabled || this.chatEntitlementService.sentiment.untrusted) {
        text = "$(copilot-unavailable)";
        ariaLabel = localize("copilotDisabledStatus", "Copilot disabled");
      } else if (this.runningSessionsCount > 0) {
        text = "$(copilot-in-progress)";
        if (this.runningSessionsCount > 1) {
          ariaLabel = localize("chatSessionsInProgressStatus", "{0} agent sessions in progress", this.runningSessionsCount);
        } else {
          ariaLabel = localize("chatSessionInProgressStatus", "1 agent session in progress");
        }
      } else if (this.chatEntitlementService.entitlement === ChatEntitlement.Unknown) {
        const signedOutWarning = localize("notSignedIn", "Signed out");
        text = `${this.chatEntitlementService.anonymous ? "$(copilot)" : "$(copilot-not-connected)"} ${signedOutWarning}`;
        ariaLabel = signedOutWarning;
        kind = "prominent";
      } else if (this.chatEntitlementService.entitlement === ChatEntitlement.Free && (chatQuotaExceeded || completionsQuotaExceeded)) {
        let quotaWarning;
        if (chatQuotaExceeded && !completionsQuotaExceeded) {
          quotaWarning = localize("chatQuotaExceededStatus", "Chat quota reached");
        } else if (completionsQuotaExceeded && !chatQuotaExceeded) {
          quotaWarning = localize("completionsQuotaExceededStatus", "Inline suggestions quota reached");
        } else {
          quotaWarning = localize("chatAndCompletionsQuotaExceededStatus", "Quota reached");
        }
        text = `$(copilot-warning) ${quotaWarning}`;
        ariaLabel = quotaWarning;
        kind = "prominent";
      } else if (this.editorService.activeTextEditorLanguageId && !isCompletionsEnabled(this.configurationService, this.editorService.activeTextEditorLanguageId)) {
        text = "$(copilot-unavailable)";
        ariaLabel = localize("completionsDisabledStatus", "Inline suggestions disabled");
      } else if (this.completionsService.isSnoozing()) {
        text = "$(copilot-snooze)";
        ariaLabel = localize("completionsSnoozedStatus", "Inline suggestions snoozed");
      }
    }
    const baseResult = {
      name: localize("chatStatus", "Copilot Status"),
      text,
      ariaLabel,
      command: ShowTooltipCommand,
      showInAllWindows: true,
      kind,
      tooltip: {
        element: /* @__PURE__ */ __name((token) => {
          const store = new DisposableStore();
          store.add(token.onCancellationRequested(() => {
            store.dispose();
          }));
          const elem = ChatStatusDashboard.instantiateInContents(this.instantiationService, store);
          store.add(disposableWindowInterval(mainWindow, () => {
            if (!elem.isConnected) {
              store.dispose();
            }
          }, 2e3));
          return elem;
        }, "element")
      }
    };
    return baseResult;
  }
  dispose() {
    super.dispose();
    this.entry?.dispose();
    this.entry = void 0;
  }
};
ChatStatusBarEntry = __decorate([
  __param(0, IChatEntitlementService),
  __param(1, IInstantiationService),
  __param(2, IStatusbarService),
  __param(3, IEditorService),
  __param(4, IConfigurationService),
  __param(5, IInlineCompletionsService),
  __param(6, IChatSessionsService)
], ChatStatusBarEntry);
export {
  ChatStatusBarEntry
};
//# sourceMappingURL=chatStatusEntry.js.map
