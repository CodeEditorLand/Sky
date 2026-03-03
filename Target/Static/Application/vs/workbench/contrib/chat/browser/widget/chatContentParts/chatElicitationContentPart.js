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
import { isMarkdownString, MarkdownString } from "../../../../../../base/common/htmlContent.js";
import { Disposable, toDisposable } from "../../../../../../base/common/lifecycle.js";
import { autorun } from "../../../../../../base/common/observable.js";
import { IInstantiationService } from "../../../../../../platform/instantiation/common/instantiation.js";
import { IContextKeyService } from "../../../../../../platform/contextkey/common/contextkey.js";
import { IKeybindingService } from "../../../../../../platform/keybinding/common/keybinding.js";
import { ChatContextKeys } from "../../../common/actions/chatContextKeys.js";
import { IChatAccessibilityService } from "../../chat.js";
import { AcceptElicitationRequestActionId } from "../../actions/chatElicitationActions.js";
import { ChatConfirmationWidget } from "./chatConfirmationWidget.js";
let ChatElicitationContentPart = class ChatElicitationContentPart2 extends Disposable {
  static {
    __name(this, "ChatElicitationContentPart");
  }
  get codeblocks() {
    return this._confirmWidget.codeblocks;
  }
  get codeblocksPartId() {
    return this._confirmWidget.codeblocksPartId;
  }
  constructor(elicitation, context, instantiationService, chatAccessibilityService, contextKeyService, keybindingService) {
    super();
    this.elicitation = elicitation;
    this.instantiationService = instantiationService;
    this.chatAccessibilityService = chatAccessibilityService;
    this.contextKeyService = contextKeyService;
    this.keybindingService = keybindingService;
    const buttons = [];
    if (elicitation.kind === "elicitation2") {
      const acceptTooltip = this.keybindingService.appendKeybinding(elicitation.acceptButtonLabel, AcceptElicitationRequestActionId);
      buttons.push({
        label: elicitation.acceptButtonLabel,
        tooltip: acceptTooltip,
        data: true,
        moreActions: elicitation.moreActions?.map((action) => ({
          label: action.label,
          data: action,
          run: action.run
        }))
      });
      if (elicitation.rejectButtonLabel && elicitation.reject) {
        buttons.push({ label: elicitation.rejectButtonLabel, data: false, isSecondary: true });
      }
      this._register(autorun((reader) => {
        if (elicitation.isHidden?.read(reader)) {
          this.domNode.remove();
        }
      }));
      const hasElicitationKey = ChatContextKeys.Editing.hasElicitationRequest.bindTo(this.contextKeyService);
      this._register(autorun((reader) => {
        hasElicitationKey.set(
          elicitation.state.read(reader) === "pending"
          /* ElicitationState.Pending */
        );
      }));
      this._register(toDisposable(() => hasElicitationKey.reset()));
      this.chatAccessibilityService.acceptElicitation(elicitation);
    }
    const confirmationWidget = this._register(this.instantiationService.createInstance(ChatConfirmationWidget, context, {
      title: elicitation.title,
      subtitle: elicitation.subtitle,
      buttons,
      message: this.getMessageToRender(elicitation),
      toolbarData: { partType: "elicitation", partSource: elicitation.source?.type, arg: elicitation }
    }));
    this._confirmWidget = confirmationWidget;
    confirmationWidget.setShowButtons(
      elicitation.kind === "elicitation2" && elicitation.state.get() === "pending"
      /* ElicitationState.Pending */
    );
    this._register(confirmationWidget.onDidClick(async (e) => {
      if (elicitation.kind !== "elicitation2") {
        return;
      }
      let result;
      if (typeof e.data === "boolean" && e.data === true) {
        result = e.data;
      } else if (e.data && typeof e.data === "object" && "run" in e.data && "label" in e.data) {
        result = e.data;
      } else {
        result = void 0;
      }
      if (result !== void 0) {
        await elicitation.accept(result);
      } else if (elicitation.reject) {
        await elicitation.reject();
      }
      confirmationWidget.setShowButtons(false);
      confirmationWidget.updateMessage(this.getMessageToRender(elicitation));
    }));
    this.domNode = confirmationWidget.domNode;
    this.domNode.tabIndex = 0;
    const messageToRender = this.getMessageToRender(elicitation);
    this.domNode.ariaLabel = elicitation.title + " " + (typeof messageToRender === "string" ? messageToRender : messageToRender.value || "");
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
    return other === this.elicitation;
  }
  addDisposable(disposable) {
    this._register(disposable);
  }
};
ChatElicitationContentPart = __decorate([
  __param(2, IInstantiationService),
  __param(3, IChatAccessibilityService),
  __param(4, IContextKeyService),
  __param(5, IKeybindingService)
], ChatElicitationContentPart);
export {
  ChatElicitationContentPart
};
//# sourceMappingURL=chatElicitationContentPart.js.map
