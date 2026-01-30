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
import * as dom from "../../../../../base/browser/dom.js";
import { renderAsPlaintext } from "../../../../../base/browser/markdownRenderer.js";
import { alert, status } from "../../../../../base/browser/ui/aria/aria.js";
import { Event } from "../../../../../base/common/event.js";
import { MarkdownString } from "../../../../../base/common/htmlContent.js";
import { Disposable, DisposableMap, DisposableStore } from "../../../../../base/common/lifecycle.js";
import { localize } from "../../../../../nls.js";
import { AccessibilitySignal, IAccessibilitySignalService } from "../../../../../platform/accessibilitySignal/browser/accessibilitySignalService.js";
import { AccessibilityProgressSignalScheduler } from "../../../../../platform/accessibilitySignal/browser/progressAccessibilitySignalScheduler.js";
import { IConfigurationService } from "../../../../../platform/configuration/common/configuration.js";
import { IInstantiationService } from "../../../../../platform/instantiation/common/instantiation.js";
import { IHostService } from "../../../../services/host/browser/host.js";
import { IChatService } from "../../common/chatService/chatService.js";
import { ChatConfiguration } from "../../common/constants.js";
import { IChatWidgetService } from "../chat.js";
const CHAT_RESPONSE_PENDING_ALLOWANCE_MS = 4e3;
let ChatAccessibilityService = class ChatAccessibilityService2 extends Disposable {
  static {
    __name(this, "ChatAccessibilityService");
  }
  constructor(_accessibilitySignalService, _instantiationService, _configurationService, _hostService, _widgetService, _chatService) {
    super();
    this._accessibilitySignalService = _accessibilitySignalService;
    this._instantiationService = _instantiationService;
    this._configurationService = _configurationService;
    this._hostService = _hostService;
    this._widgetService = _widgetService;
    this._chatService = _chatService;
    this._pendingSignalMap = this._register(new DisposableMap());
    this.notifications = /* @__PURE__ */ new Set();
    this._register(this._widgetService.onDidBackgroundSession((e) => {
      const session = this._chatService.getSession(e);
      if (!session) {
        return;
      }
      const requestInProgress = session.requestInProgress.get();
      if (!requestInProgress) {
        return;
      }
      this.disposeRequest(e);
    }));
  }
  dispose() {
    for (const ds of Array.from(this.notifications)) {
      ds.dispose();
    }
    this.notifications.clear();
    super.dispose();
  }
  acceptRequest(uri, skipRequestSignal) {
    if (!skipRequestSignal) {
      this._accessibilitySignalService.playSignal(AccessibilitySignal.chatRequestSent, { allowManyInParallel: true });
    }
    this._pendingSignalMap.set(uri, this._instantiationService.createInstance(AccessibilityProgressSignalScheduler, CHAT_RESPONSE_PENDING_ALLOWANCE_MS, void 0));
  }
  disposeRequest(requestId) {
    this._pendingSignalMap.deleteAndDispose(requestId);
  }
  acceptResponse(widget, container, response, requestId, isVoiceInput) {
    this._pendingSignalMap.deleteAndDispose(requestId);
    const isPanelChat = typeof response !== "string";
    const responseContent = typeof response === "string" ? response : response?.response.toString();
    this._accessibilitySignalService.playSignal(AccessibilitySignal.chatResponseReceived, { allowManyInParallel: true });
    if (!response || !responseContent) {
      return;
    }
    const plainTextResponse = renderAsPlaintext(new MarkdownString(responseContent));
    const errorDetails = isPanelChat && response.errorDetails ? ` ${response.errorDetails.message}` : "";
    this._showOSNotification(widget, container, plainTextResponse + errorDetails);
    if (!isVoiceInput || this._configurationService.getValue(
      "accessibility.voice.autoSynthesize"
      /* AccessibilityVoiceSettingId.AutoSynthesize */
    ) !== "on") {
      status(plainTextResponse + errorDetails);
    }
  }
  acceptElicitation(elicitation) {
    if (elicitation.state.get() !== "pending") {
      return;
    }
    const title = typeof elicitation.title === "string" ? elicitation.title : elicitation.title.value;
    const message = typeof elicitation.message === "string" ? elicitation.message : elicitation.message.value;
    alert(title + " " + message);
    this._accessibilitySignalService.playSignal(AccessibilitySignal.chatUserActionRequired, { allowManyInParallel: true });
  }
  async _showOSNotification(widget, container, responseContent) {
    if (!this._configurationService.getValue(ChatConfiguration.NotifyWindowOnResponseReceived)) {
      return;
    }
    const targetWindow = dom.getWindow(container);
    if (!targetWindow) {
      return;
    }
    if (targetWindow.document.hasFocus()) {
      return;
    }
    if (!responseContent || !responseContent.trim()) {
      return;
    }
    await this._hostService.focus(targetWindow, {
      mode: 1
      /* FocusMode.Notify */
    });
    for (const ds of Array.from(this.notifications)) {
      ds.dispose();
      this.notifications.delete(ds);
    }
    const title = widget?.viewModel?.model.title ? localize("chatTitle", "Chat: {0}", widget.viewModel.model.title) : localize("chat.untitledChat", "Untitled Chat");
    const notification = await dom.triggerNotification(title, {
      detail: localize("notificationDetail", "New chat response.")
    });
    if (!notification) {
      return;
    }
    const disposables = new DisposableStore();
    disposables.add(notification);
    this.notifications.add(disposables);
    disposables.add(Event.once(notification.onClick)(async () => {
      await this._hostService.focus(targetWindow, {
        mode: 2
        /* FocusMode.Force */
      });
      await this._widgetService.reveal(widget);
      widget.focusInput();
      disposables.dispose();
      this.notifications.delete(disposables);
    }));
    disposables.add(this._hostService.onDidChangeFocus((focus) => {
      if (focus) {
        disposables.dispose();
        this.notifications.delete(disposables);
      }
    }));
  }
};
ChatAccessibilityService = __decorate([
  __param(0, IAccessibilitySignalService),
  __param(1, IInstantiationService),
  __param(2, IConfigurationService),
  __param(3, IHostService),
  __param(4, IChatWidgetService),
  __param(5, IChatService)
], ChatAccessibilityService);
export {
  ChatAccessibilityService
};
//# sourceMappingURL=chatAccessibilityService.js.map
