var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import * as dom from "../../../../../../base/browser/dom.js";
import { Emitter } from "../../../../../../base/common/event.js";
import { localize } from "../../../../../../nls.js";
import { IContextKeyService } from "../../../../../../platform/contextkey/common/contextkey.js";
import { IExtensionManagementService } from "../../../../../../platform/extensionManagement/common/extensionManagement.js";
import { areSameExtensions } from "../../../../../../platform/extensionManagement/common/extensionManagementUtil.js";
import { IInstantiationService } from "../../../../../../platform/instantiation/common/instantiation.js";
import { IKeybindingService } from "../../../../../../platform/keybinding/common/keybinding.js";
import { ChatContextKeys } from "../../../common/chatContextKeys.js";
import { CancelChatActionId } from "../../actions/chatExecuteActions.js";
import { AcceptToolConfirmationActionId } from "../../actions/chatToolActions.js";
import { IChatWidgetService } from "../../chat.js";
import { ChatConfirmationWidget } from "../chatConfirmationWidget.js";
import { ChatExtensionsContentPart } from "../chatExtensionsContentPart.js";
import { BaseChatToolInvocationSubPart } from "./chatToolInvocationSubPart.js";
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
let ExtensionsInstallConfirmationWidgetSubPart = class ExtensionsInstallConfirmationWidgetSubPart2 extends BaseChatToolInvocationSubPart {
  static {
    __name(this, "ExtensionsInstallConfirmationWidgetSubPart");
  }
  constructor(toolInvocation, context, keybindingService, contextKeyService, chatWidgetService, extensionManagementService, instantiationService) {
    super(toolInvocation);
    this.codeblocks = [];
    if (toolInvocation.toolSpecificData?.kind !== "extensions") {
      throw new Error("Tool specific data is missing or not of kind extensions");
    }
    const extensionsContent = toolInvocation.toolSpecificData;
    this.domNode = dom.$("");
    const chatExtensionsContentPart = this._register(instantiationService.createInstance(ChatExtensionsContentPart, extensionsContent));
    this._register(chatExtensionsContentPart.onDidChangeHeight(() => this._onDidChangeHeight.fire()));
    dom.append(this.domNode, chatExtensionsContentPart.domNode);
    if (toolInvocation.isConfirmed === void 0) {
      const continueLabel = localize("continue", "Continue");
      const continueKeybinding = keybindingService.lookupKeybinding(AcceptToolConfirmationActionId)?.getLabel();
      const continueTooltip = continueKeybinding ? `${continueLabel} (${continueKeybinding})` : continueLabel;
      const cancelLabel = localize("cancel", "Cancel");
      const cancelKeybinding = keybindingService.lookupKeybinding(CancelChatActionId)?.getLabel();
      const cancelTooltip = cancelKeybinding ? `${cancelLabel} (${cancelKeybinding})` : cancelLabel;
      const enableContinueButtonEvent = this._register(new Emitter());
      const buttons = [
        {
          label: continueLabel,
          data: true,
          tooltip: continueTooltip,
          disabled: true,
          onDidChangeDisablement: enableContinueButtonEvent.event
        },
        {
          label: cancelLabel,
          data: false,
          isSecondary: true,
          tooltip: cancelTooltip
        }
      ];
      const confirmWidget = this._register(instantiationService.createInstance(ChatConfirmationWidget, toolInvocation.confirmationMessages?.title ?? localize("installExtensions", "Install Extensions"), void 0, toolInvocation.confirmationMessages?.message ?? localize("installExtensionsConfirmation", "Click the Install button on the extension and then press Continue when finished."), buttons, context.container));
      this._register(confirmWidget.onDidChangeHeight(() => this._onDidChangeHeight.fire()));
      dom.append(this.domNode, confirmWidget.domNode);
      this._register(confirmWidget.onDidClick((button) => {
        toolInvocation.confirmed.complete(button.data);
        chatWidgetService.getWidgetBySessionId(context.element.sessionId)?.focusInput();
      }));
      toolInvocation.confirmed.p.then(() => {
        ChatContextKeys.Editing.hasToolConfirmation.bindTo(contextKeyService).set(false);
        this._onNeedsRerender.fire();
      });
      const disposable = this._register(extensionManagementService.onInstallExtension((e) => {
        if (extensionsContent.extensions.some((id) => areSameExtensions({ id }, e.identifier))) {
          disposable.dispose();
          enableContinueButtonEvent.fire(false);
        }
      }));
    }
  }
};
ExtensionsInstallConfirmationWidgetSubPart = __decorate([
  __param(2, IKeybindingService),
  __param(3, IContextKeyService),
  __param(4, IChatWidgetService),
  __param(5, IExtensionManagementService),
  __param(6, IInstantiationService)
], ExtensionsInstallConfirmationWidgetSubPart);
export {
  ExtensionsInstallConfirmationWidgetSubPart
};
//# sourceMappingURL=chatExtensionsInstallToolSubPart.js.map
