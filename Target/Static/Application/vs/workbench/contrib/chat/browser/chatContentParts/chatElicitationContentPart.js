var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Emitter } from "../../../../../base/common/event.js";
import { isMarkdownString, MarkdownString } from "../../../../../base/common/htmlContent.js";
import { Disposable } from "../../../../../base/common/lifecycle.js";
import { localize } from "../../../../../nls.js";
import { IInstantiationService } from "../../../../../platform/instantiation/common/instantiation.js";
import { ChatConfirmationWidget } from "./chatConfirmationWidget.js";
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
let ChatElicitationContentPart = class ChatElicitationContentPart2 extends Disposable {
  static {
    __name(this, "ChatElicitationContentPart");
  }
  constructor(elicitation, context, instantiationService) {
    super();
    this.instantiationService = instantiationService;
    this._onDidChangeHeight = this._register(new Emitter());
    this.onDidChangeHeight = this._onDidChangeHeight.event;
    const buttons = [
      { label: localize("accept", "Respond"), data: true },
      { label: localize("dismiss", "Cancel"), data: false, isSecondary: true }
    ];
    const confirmationWidget = this._register(this.instantiationService.createInstance(ChatConfirmationWidget, elicitation.title, elicitation.originMessage, this.getMessageToRender(elicitation), buttons, context.container));
    confirmationWidget.setShowButtons(elicitation.state === "pending");
    this._register(confirmationWidget.onDidChangeHeight(() => this._onDidChangeHeight.fire()));
    this._register(confirmationWidget.onDidClick(async (e) => {
      if (e.data) {
        await elicitation.accept();
      } else {
        await elicitation.reject();
      }
      confirmationWidget.setShowButtons(false);
      confirmationWidget.updateMessage(this.getMessageToRender(elicitation));
      this._onDidChangeHeight.fire();
    }));
    this.domNode = confirmationWidget.domNode;
  }
  getMessageToRender(elicitation) {
    if (!elicitation.acceptedResult) {
      return elicitation.message;
    }
    const messageMd = isMarkdownString(elicitation.message) ? MarkdownString.lift(elicitation.message) : new MarkdownString(elicitation.message);
    messageMd.appendCodeblock("json", JSON.stringify(elicitation.acceptedResult, null, 2));
    return messageMd;
  }
  hasSameContent(other) {
    return other.kind === "elicitation";
  }
  addDisposable(disposable) {
    this._register(disposable);
  }
};
ChatElicitationContentPart = __decorate([
  __param(2, IInstantiationService)
], ChatElicitationContentPart);
export {
  ChatElicitationContentPart
};
//# sourceMappingURL=chatElicitationContentPart.js.map
