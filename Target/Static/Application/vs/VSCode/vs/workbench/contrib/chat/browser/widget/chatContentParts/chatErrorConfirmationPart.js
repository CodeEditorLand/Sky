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
import * as dom from "../../../../../../base/browser/dom.js";
import { Button } from "../../../../../../base/browser/ui/button/button.js";
import { Disposable } from "../../../../../../base/common/lifecycle.js";
import { IInstantiationService } from "../../../../../../platform/instantiation/common/instantiation.js";
import { defaultButtonStyles } from "../../../../../../platform/theme/browser/defaultStyles.js";
import { IChatService } from "../../../common/chatService/chatService.js";
import { assertIsResponseVM } from "../../../common/model/chatViewModel.js";
import { IChatAccessibilityService, IChatWidgetService } from "../../chat.js";
import { ChatErrorWidget } from "./chatErrorContentPart.js";
const $ = dom.$;
let ChatErrorConfirmationContentPart = class ChatErrorConfirmationContentPart2 extends Disposable {
  static {
    __name(this, "ChatErrorConfirmationContentPart");
  }
  constructor(kind, content, errorDetails, confirmationButtons, renderer, context, instantiationService, chatWidgetService, chatService, chatAccessibilityService) {
    super();
    this.errorDetails = errorDetails;
    this.chatAccessibilityService = chatAccessibilityService;
    const element = context.element;
    assertIsResponseVM(element);
    this.domNode = $(".chat-error-confirmation");
    this.domNode.append(this._register(new ChatErrorWidget(kind, content, renderer)).domNode);
    const buttonOptions = { ...defaultButtonStyles };
    const buttonContainer = dom.append(this.domNode, $(".chat-buttons-container"));
    confirmationButtons.forEach((buttonData) => {
      const button = this._register(new Button(buttonContainer, buttonOptions));
      button.label = buttonData.label;
      this._register(button.onDidClick(async () => {
        const prompt = buttonData.label;
        const options = buttonData.isSecondary ? { rejectedConfirmationData: [buttonData.data] } : { acceptedConfirmationData: [buttonData.data] };
        options.agentId = element.agent?.id;
        options.slashCommand = element.slashCommand?.name;
        options.confirmation = buttonData.label;
        const widget = chatWidgetService.getWidgetBySessionResource(element.sessionResource);
        options.userSelectedModelId = widget?.input.currentLanguageModel;
        Object.assign(options, widget?.getModeRequestOptions());
        this.chatAccessibilityService.acceptRequest(element.sessionResource);
        await chatService.sendRequest(element.sessionResource, prompt, options);
      }));
    });
  }
  hasSameContent(other) {
    return other.kind === this.errorDetails.kind && other.isLast === this.errorDetails.isLast;
  }
  addDisposable(disposable) {
    this._register(disposable);
  }
};
ChatErrorConfirmationContentPart = __decorate([
  __param(6, IInstantiationService),
  __param(7, IChatWidgetService),
  __param(8, IChatService),
  __param(9, IChatAccessibilityService)
], ChatErrorConfirmationContentPart);
export {
  ChatErrorConfirmationContentPart
};
//# sourceMappingURL=chatErrorConfirmationPart.js.map
