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
var TerminalChatController_1;
import { Lazy } from "../../../../../base/common/lazy.js";
import { Disposable } from "../../../../../base/common/lifecycle.js";
import { IContextKeyService } from "../../../../../platform/contextkey/common/contextkey.js";
import { IInstantiationService } from "../../../../../platform/instantiation/common/instantiation.js";
import { IChatCodeBlockContextProviderService, IChatWidgetService } from "../../../chat/browser/chat.js";
import { IChatService } from "../../../chat/common/chatService/chatService.js";
import { isDetachedTerminalInstance, ITerminalService } from "../../../terminal/browser/terminal.js";
import { TerminalChatWidget } from "./terminalChatWidget.js";
import { IChatEntitlementService } from "../../../../services/chat/common/chatEntitlementService.js";
let TerminalChatController = class TerminalChatController2 extends Disposable {
  static {
    __name(this, "TerminalChatController");
  }
  static {
    TerminalChatController_1 = this;
  }
  static {
    this.ID = "terminal.chat";
  }
  static get(instance) {
    return instance.getContribution(TerminalChatController_1.ID);
  }
  /**
   * The terminal chat widget for the controller, this will be undefined if xterm is not ready yet (ie. the
   * terminal is still initializing). This wraps the inline chat widget.
   */
  get terminalChatWidget() {
    return this._terminalChatWidget?.value;
  }
  get lastResponseContent() {
    return this._lastResponseContent;
  }
  get scopedContextKeyService() {
    return this._terminalChatWidget?.value.inlineChatWidget.scopedContextKeyService ?? this._contextKeyService;
  }
  constructor(_ctx, chatCodeBlockContextProviderService, chatEntitlementService, _contextKeyService, _instantiationService, _terminalService) {
    super();
    this._ctx = _ctx;
    this._contextKeyService = _contextKeyService;
    this._instantiationService = _instantiationService;
    this._terminalService = _terminalService;
    this._forcedPlaceholder = void 0;
    this._register(chatEntitlementService.onDidChangeSentiment(() => {
      if (chatEntitlementService.sentiment.hidden) {
        this._terminalChatWidget?.value.clear();
      }
    }));
    this._register(chatCodeBlockContextProviderService.registerProvider({
      getCodeBlockContext: /* @__PURE__ */ __name((editor) => {
        if (!editor || !this._terminalChatWidget?.hasValue || !this.hasFocus()) {
          return;
        }
        return {
          element: editor,
          code: editor.getValue(),
          codeBlockIndex: 0,
          languageId: editor.getModel().getLanguageId(),
          chatSessionResource: this._terminalChatWidget.value.inlineChatWidget.chatWidget.viewModel?.sessionResource
        };
      }, "getCodeBlockContext")
    }, "terminal"));
  }
  xtermReady(xterm) {
    this._terminalChatWidget = new Lazy(() => {
      const chatWidget = this._register(this._instantiationService.createInstance(TerminalChatWidget, this._ctx.instance.domElement, this._ctx.instance, xterm));
      this._register(chatWidget.focusTracker.onDidFocus(() => {
        TerminalChatController_1.activeChatController = this;
        if (!isDetachedTerminalInstance(this._ctx.instance)) {
          this._terminalService.setActiveInstance(this._ctx.instance);
        }
      }));
      this._register(chatWidget.focusTracker.onDidBlur(() => {
        TerminalChatController_1.activeChatController = void 0;
        this._ctx.instance.resetScrollbarVisibility();
      }));
      if (!this._ctx.instance.domElement) {
        throw new Error("FindWidget expected terminal DOM to be initialized");
      }
      return chatWidget;
    });
  }
  _updatePlaceholder() {
    const inlineChatWidget = this._terminalChatWidget?.value.inlineChatWidget;
    if (inlineChatWidget) {
      inlineChatWidget.placeholder = this._getPlaceholderText();
    }
  }
  _getPlaceholderText() {
    return this._forcedPlaceholder ?? "";
  }
  setPlaceholder(text) {
    this._forcedPlaceholder = text;
    this._updatePlaceholder();
  }
  resetPlaceholder() {
    this._forcedPlaceholder = void 0;
    this._updatePlaceholder();
  }
  updateInput(text, selectAll = true) {
    const widget = this._terminalChatWidget?.value.inlineChatWidget;
    if (widget) {
      widget.value = text;
      if (selectAll) {
        widget.selectAll();
      }
    }
  }
  focus() {
    this._terminalChatWidget?.value.focus();
  }
  hasFocus() {
    return this._terminalChatWidget?.rawValue?.hasFocus() ?? false;
  }
  async viewInChat() {
    const chatModel = this.terminalChatWidget?.inlineChatWidget.chatWidget.viewModel?.model;
    if (chatModel) {
      await this._instantiationService.invokeFunction(moveToPanelChat, chatModel);
    }
    this._terminalChatWidget?.rawValue?.hide();
  }
};
TerminalChatController = TerminalChatController_1 = __decorate([
  __param(1, IChatCodeBlockContextProviderService),
  __param(2, IChatEntitlementService),
  __param(3, IContextKeyService),
  __param(4, IInstantiationService),
  __param(5, ITerminalService)
], TerminalChatController);
async function moveToPanelChat(accessor, model) {
  const chatService = accessor.get(IChatService);
  const chatWidgetService = accessor.get(IChatWidgetService);
  const widget = await chatWidgetService.revealWidget();
  if (widget && widget.viewModel && model) {
    for (const request of model.getRequests().slice()) {
      await chatService.adoptRequest(widget.viewModel.model.sessionResource, request);
    }
    widget.focusResponseItem();
  }
}
__name(moveToPanelChat, "moveToPanelChat");
export {
  TerminalChatController
};
//# sourceMappingURL=terminalChatController.js.map
