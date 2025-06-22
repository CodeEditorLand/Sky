var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import * as dom from "../../../../../base/browser/dom.js";
import { Button } from "../../../../../base/browser/ui/button/button.js";
import { Codicon } from "../../../../../base/common/codicons.js";
import { Emitter } from "../../../../../base/common/event.js";
import { MarkdownString } from "../../../../../base/common/htmlContent.js";
import { Disposable } from "../../../../../base/common/lifecycle.js";
import { ThemeIcon } from "../../../../../base/common/themables.js";
import { assertType } from "../../../../../base/common/types.js";
import { localize } from "../../../../../nls.js";
import { ICommandService } from "../../../../../platform/commands/common/commands.js";
import { ITelemetryService } from "../../../../../platform/telemetry/common/telemetry.js";
import { defaultButtonStyles } from "../../../../../platform/theme/browser/defaultStyles.js";
import { asCssVariable, textLinkForeground } from "../../../../../platform/theme/common/colorRegistry.js";
import { ChatEntitlement, IChatEntitlementService } from "../../common/chatEntitlementService.js";
import { IChatWidgetService } from "../chat.js";
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
const $ = dom.$;
let shouldShowRetryButton = false;
let shouldShowWaitWarning = false;
let ChatQuotaExceededPart = class ChatQuotaExceededPart2 extends Disposable {
  static {
    __name(this, "ChatQuotaExceededPart");
  }
  constructor(element, content, renderer, chatWidgetService, commandService, telemetryService, chatEntitlementService) {
    super();
    this.content = content;
    this._onDidChangeHeight = this._register(new Emitter());
    this.onDidChangeHeight = this._onDidChangeHeight.event;
    const errorDetails = element.errorDetails;
    assertType(!!errorDetails, "errorDetails");
    this.domNode = $(".chat-quota-error-widget");
    const icon = dom.append(this.domNode, $("span"));
    icon.classList.add(...ThemeIcon.asClassNameArray(Codicon.warning));
    const messageContainer = dom.append(this.domNode, $(".chat-quota-error-message"));
    const markdownContent = renderer.render(new MarkdownString(errorDetails.message));
    dom.append(messageContainer, markdownContent.element);
    let button1Label = "";
    switch (chatEntitlementService.entitlement) {
      case ChatEntitlement.Pro:
      case ChatEntitlement.ProPlus:
        button1Label = localize("enableAdditionalUsage", "Manage paid premium requests");
        break;
      case ChatEntitlement.Free:
        button1Label = localize("upgradeToCopilotPro", "Upgrade to Copilot Pro");
        break;
      default:
        button1Label = "";
    }
    let hasAddedWaitWarning = false;
    const addWaitWarningIfNeeded = /* @__PURE__ */ __name(() => {
      if (!shouldShowWaitWarning || hasAddedWaitWarning) {
        return;
      }
      hasAddedWaitWarning = true;
      dom.append(messageContainer, $(".chat-quota-wait-warning", void 0, localize("waitWarning", "Changes may take a few minutes to take effect.")));
    }, "addWaitWarningIfNeeded");
    let hasAddedRetryButton = false;
    const addRetryButtonIfNeeded = /* @__PURE__ */ __name(() => {
      if (!shouldShowRetryButton || hasAddedRetryButton) {
        return;
      }
      hasAddedRetryButton = true;
      const button2 = this._register(new Button(messageContainer, {
        buttonBackground: void 0,
        buttonForeground: asCssVariable(textLinkForeground)
      }));
      button2.element.classList.add("chat-quota-error-secondary-button");
      button2.label = localize("clickToContinue", "Click to retry.");
      this._onDidChangeHeight.fire();
      this._register(button2.onDidClick(() => {
        const widget = chatWidgetService.getWidgetBySessionId(element.sessionId);
        if (!widget) {
          return;
        }
        widget.rerunLastRequest();
        shouldShowWaitWarning = true;
        addWaitWarningIfNeeded();
      }));
    }, "addRetryButtonIfNeeded");
    if (button1Label) {
      const button1 = this._register(new Button(messageContainer, { ...defaultButtonStyles, supportIcons: true }));
      button1.label = button1Label;
      button1.element.classList.add("chat-quota-error-button");
      this._register(button1.onDidClick(async () => {
        const commandId = chatEntitlementService.entitlement === ChatEntitlement.Free ? "workbench.action.chat.upgradePlan" : "workbench.action.chat.manageOverages";
        telemetryService.publicLog2("workbenchActionExecuted", { id: commandId, from: "chat-response" });
        await commandService.executeCommand(commandId);
        shouldShowRetryButton = true;
        addRetryButtonIfNeeded();
      }));
    }
    addRetryButtonIfNeeded();
    addWaitWarningIfNeeded();
  }
  hasSameContent(other) {
    return other.kind === this.content.kind && !!other.errorDetails.isQuotaExceeded;
  }
  addDisposable(disposable) {
    this._register(disposable);
  }
};
ChatQuotaExceededPart = __decorate([
  __param(3, IChatWidgetService),
  __param(4, ICommandService),
  __param(5, ITelemetryService),
  __param(6, IChatEntitlementService)
], ChatQuotaExceededPart);
export {
  ChatQuotaExceededPart
};
//# sourceMappingURL=chatQuotaExceededPart.js.map
