var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import * as dom from "../../../../../../base/browser/dom.js";
import { MarkdownString } from "../../../../../../base/common/htmlContent.js";
import { thenIfNotDisposed } from "../../../../../../base/common/lifecycle.js";
import { ILanguageService } from "../../../../../../editor/common/languages/language.js";
import { IModelService } from "../../../../../../editor/common/services/model.js";
import { localize } from "../../../../../../nls.js";
import { IContextKeyService } from "../../../../../../platform/contextkey/common/contextkey.js";
import { IInstantiationService } from "../../../../../../platform/instantiation/common/instantiation.js";
import { IKeybindingService } from "../../../../../../platform/keybinding/common/keybinding.js";
import { ChatContextKeys } from "../../../common/chatContextKeys.js";
import { CancelChatActionId } from "../../actions/chatExecuteActions.js";
import { AcceptToolConfirmationActionId } from "../../actions/chatToolActions.js";
import { IChatWidgetService } from "../../chat.js";
import { ChatCustomConfirmationWidget } from "../chatConfirmationWidget.js";
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
let TerminalConfirmationWidgetSubPart = class TerminalConfirmationWidgetSubPart2 extends BaseChatToolInvocationSubPart {
  static {
    __name(this, "TerminalConfirmationWidgetSubPart");
  }
  constructor(toolInvocation, terminalData, context, renderer, editorPool, currentWidthDelegate, codeBlockStartIndex, instantiationService, keybindingService, modelService, languageService, contextKeyService, chatWidgetService) {
    super(toolInvocation);
    this.context = context;
    this.renderer = renderer;
    this.editorPool = editorPool;
    this.currentWidthDelegate = currentWidthDelegate;
    this.codeBlockStartIndex = codeBlockStartIndex;
    this.instantiationService = instantiationService;
    this.modelService = modelService;
    this.languageService = languageService;
    this.contextKeyService = contextKeyService;
    this.chatWidgetService = chatWidgetService;
    this.codeblocks = [];
    if (!toolInvocation.confirmationMessages) {
      throw new Error("Confirmation messages are missing");
    }
    const title = toolInvocation.confirmationMessages.title;
    const message = toolInvocation.confirmationMessages.message;
    const continueLabel = localize("continue", "Continue");
    const continueKeybinding = keybindingService.lookupKeybinding(AcceptToolConfirmationActionId)?.getLabel();
    const continueTooltip = continueKeybinding ? `${continueLabel} (${continueKeybinding})` : continueLabel;
    const cancelLabel = localize("cancel", "Cancel");
    const cancelKeybinding = keybindingService.lookupKeybinding(CancelChatActionId)?.getLabel();
    const cancelTooltip = cancelKeybinding ? `${cancelLabel} (${cancelKeybinding})` : cancelLabel;
    const buttons = [
      {
        label: continueLabel,
        data: true,
        tooltip: continueTooltip
      },
      {
        label: cancelLabel,
        data: false,
        isSecondary: true,
        tooltip: cancelTooltip
      }
    ];
    const renderedMessage = this._register(this.renderer.render(typeof message === "string" ? new MarkdownString(message) : message, { asyncRenderCallback: /* @__PURE__ */ __name(() => this._onDidChangeHeight.fire(), "asyncRenderCallback") }));
    const codeBlockRenderOptions = {
      hideToolbar: true,
      reserveWidth: 19,
      verticalPadding: 5,
      editorOptions: {
        wordWrap: "on",
        readOnly: false,
        tabFocusMode: true,
        ariaLabel: typeof title === "string" ? title : title.value
      }
    };
    const langId = this.languageService.getLanguageIdByLanguageName(terminalData.language ?? "sh") ?? "shellscript";
    const model = this.modelService.createModel(terminalData.command, this.languageService.createById(langId), void 0, true);
    const editor = this._register(this.editorPool.get());
    const renderPromise = editor.object.render({
      codeBlockIndex: this.codeBlockStartIndex,
      codeBlockPartIndex: 0,
      element: this.context.element,
      languageId: langId,
      renderOptions: codeBlockRenderOptions,
      textModel: Promise.resolve(model),
      chatSessionId: this.context.element.sessionId
    }, this.currentWidthDelegate());
    this._register(thenIfNotDisposed(renderPromise, () => this._onDidChangeHeight.fire()));
    this.codeblocks.push({
      codeBlockIndex: this.codeBlockStartIndex,
      codemapperUri: void 0,
      elementId: this.context.element.id,
      focus: /* @__PURE__ */ __name(() => editor.object.focus(), "focus"),
      isStreaming: false,
      ownerMarkdownPartId: this.codeblocksPartId,
      uri: model.uri,
      uriPromise: Promise.resolve(model.uri),
      chatSessionId: this.context.element.sessionId
    });
    this._register(editor.object.onDidChangeContentHeight(() => {
      editor.object.layout(this.currentWidthDelegate());
      this._onDidChangeHeight.fire();
    }));
    this._register(model.onDidChangeContent((e) => {
      terminalData.command = model.getValue();
    }));
    const element = dom.$("");
    dom.append(element, editor.object.element);
    dom.append(element, renderedMessage.element);
    const confirmWidget = this._register(this.instantiationService.createInstance(ChatCustomConfirmationWidget, title, void 0, element, buttons, this.context.container));
    ChatContextKeys.Editing.hasToolConfirmation.bindTo(this.contextKeyService).set(true);
    this._register(confirmWidget.onDidClick((button) => {
      toolInvocation.confirmed.complete(button.data);
      this.chatWidgetService.getWidgetBySessionId(this.context.element.sessionId)?.focusInput();
    }));
    this._register(confirmWidget.onDidChangeHeight(() => this._onDidChangeHeight.fire()));
    toolInvocation.confirmed.p.then(() => {
      ChatContextKeys.Editing.hasToolConfirmation.bindTo(this.contextKeyService).set(false);
      this._onNeedsRerender.fire();
    });
    this.domNode = confirmWidget.domNode;
  }
};
TerminalConfirmationWidgetSubPart = __decorate([
  __param(7, IInstantiationService),
  __param(8, IKeybindingService),
  __param(9, IModelService),
  __param(10, ILanguageService),
  __param(11, IContextKeyService),
  __param(12, IChatWidgetService)
], TerminalConfirmationWidgetSubPart);
export {
  TerminalConfirmationWidgetSubPart
};
//# sourceMappingURL=chatTerminalToolSubPart.js.map
