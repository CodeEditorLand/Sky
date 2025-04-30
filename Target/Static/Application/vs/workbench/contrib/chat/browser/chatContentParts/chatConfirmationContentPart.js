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
import { Emitter } from "../../../../../base/common/event.js";
import { Disposable } from "../../../../../base/common/lifecycle.js";
import { localize } from "../../../../../nls.js";
import { IInstantiationService } from "../../../../../platform/instantiation/common/instantiation.js";
import { IChatService } from "../../common/chatService.js";
import { isResponseVM } from "../../common/chatViewModel.js";
import { IChatWidgetService } from "../chat.js";
import { ChatConfirmationWidget } from "./chatConfirmationWidget.js";
let ChatConfirmationContentPart = class ChatConfirmationContentPart2 extends Disposable {
  static {
    __name(this, "ChatConfirmationContentPart");
  }
  constructor(confirmation, context, instantiationService, chatService, chatWidgetService) {
    super();
    this.instantiationService = instantiationService;
    this.chatService = chatService;
    this._onDidChangeHeight = this._register(new Emitter());
    this.onDidChangeHeight = this._onDidChangeHeight.event;
    const element = context.element;
    const buttons = confirmation.buttons ? confirmation.buttons.map((button) => ({
      label: button,
      data: confirmation.data
    })) : [
      { label: localize("accept", "Accept"), data: confirmation.data },
      { label: localize("dismiss", "Dismiss"), data: confirmation.data, isSecondary: true }
    ];
    const confirmationWidget = this._register(this.instantiationService.createInstance(ChatConfirmationWidget, confirmation.title, void 0, confirmation.message, buttons));
    confirmationWidget.setShowButtons(!confirmation.isUsed);
    this._register(confirmationWidget.onDidChangeHeight(() => this._onDidChangeHeight.fire()));
    this._register(confirmationWidget.onDidClick(async (e) => {
      if (isResponseVM(element)) {
        const prompt = `${e.label}: "${confirmation.title}"`;
        const options = e.isSecondary ? { rejectedConfirmationData: [e.data] } : { acceptedConfirmationData: [e.data] };
        options.agentId = element.agent?.id;
        options.slashCommand = element.slashCommand?.name;
        options.confirmation = e.label;
        const widget = chatWidgetService.getWidgetBySessionId(element.sessionId);
        options.userSelectedModelId = widget?.input.currentLanguageModel;
        options.mode = widget?.input.currentMode;
        if (await this.chatService.sendRequest(element.sessionId, prompt, options)) {
          confirmation.isUsed = true;
          confirmationWidget.setShowButtons(false);
          this._onDidChangeHeight.fire();
        }
      }
    }));
    this.domNode = confirmationWidget.domNode;
  }
  hasSameContent(other) {
    return other.kind === "confirmation";
  }
  addDisposable(disposable) {
    this._register(disposable);
  }
};
ChatConfirmationContentPart = __decorate([
  __param(2, IInstantiationService),
  __param(3, IChatService),
  __param(4, IChatWidgetService)
], ChatConfirmationContentPart);
export {
  ChatConfirmationContentPart
};
//# sourceMappingURL=chatConfirmationContentPart.js.map
