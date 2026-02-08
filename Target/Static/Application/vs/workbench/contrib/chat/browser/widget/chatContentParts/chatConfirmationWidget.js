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
import { Button, ButtonWithDropdown } from "../../../../../../base/browser/ui/button/button.js";
import { Action, Separator } from "../../../../../../base/common/actions.js";
import { Emitter } from "../../../../../../base/common/event.js";
import { MarkdownString } from "../../../../../../base/common/htmlContent.js";
import { Disposable, MutableDisposable } from "../../../../../../base/common/lifecycle.js";
import { localize } from "../../../../../../nls.js";
import { MenuWorkbenchToolBar } from "../../../../../../platform/actions/browser/toolbar.js";
import { MenuId } from "../../../../../../platform/actions/common/actions.js";
import { IContextKeyService } from "../../../../../../platform/contextkey/common/contextkey.js";
import { IContextMenuService } from "../../../../../../platform/contextview/browser/contextView.js";
import { IInstantiationService } from "../../../../../../platform/instantiation/common/instantiation.js";
import { ServiceCollection } from "../../../../../../platform/instantiation/common/serviceCollection.js";
import { IMarkdownRendererService } from "../../../../../../platform/markdown/browser/markdownRenderer.js";
import { defaultButtonStyles } from "../../../../../../platform/theme/browser/defaultStyles.js";
import { renderFileWidgets } from "./chatInlineAnchorWidget.js";
import { IChatMarkdownAnchorService } from "./chatMarkdownAnchorService.js";
import { ChatMarkdownContentPart } from "./chatMarkdownContentPart.js";
import "./media/chatConfirmationWidget.css";
let ChatQueryTitlePart = class ChatQueryTitlePart2 extends Disposable {
  static {
    __name(this, "ChatQueryTitlePart");
  }
  get title() {
    return this._title;
  }
  set title(value) {
    this._title = value;
    const next = this._renderer.render(this.toMdString(value), {
      asyncRenderCallback: /* @__PURE__ */ __name(() => this._onDidChangeHeight.fire(), "asyncRenderCallback")
    });
    const previousEl = this._renderedTitle.value?.element;
    if (previousEl?.parentElement) {
      previousEl.replaceWith(next.element);
    } else {
      this.element.appendChild(next.element);
    }
    this._renderedTitle.value = next;
  }
  constructor(element, _title, subtitle, _renderer) {
    super();
    this.element = element;
    this._title = _title;
    this._renderer = _renderer;
    this._onDidChangeHeight = this._register(new Emitter());
    this.onDidChangeHeight = this._onDidChangeHeight.event;
    this._renderedTitle = this._register(new MutableDisposable());
    element.classList.add("chat-query-title-part");
    this._renderedTitle.value = _renderer.render(this.toMdString(_title), {
      asyncRenderCallback: /* @__PURE__ */ __name(() => this._onDidChangeHeight.fire(), "asyncRenderCallback")
    });
    element.append(this._renderedTitle.value.element);
    if (subtitle) {
      const str = this.toMdString(subtitle);
      const renderedTitle = this._register(_renderer.render(str, {
        asyncRenderCallback: /* @__PURE__ */ __name(() => this._onDidChangeHeight.fire(), "asyncRenderCallback")
      }));
      const wrapper = document.createElement("small");
      wrapper.appendChild(renderedTitle.element);
      element.append(wrapper);
    }
  }
  toMdString(value) {
    if (typeof value === "string") {
      return new MarkdownString("", { supportThemeIcons: true }).appendText(value);
    } else {
      return new MarkdownString(value.value, { supportThemeIcons: true, isTrusted: value.isTrusted });
    }
  }
};
ChatQueryTitlePart = __decorate([
  __param(3, IMarkdownRendererService)
], ChatQueryTitlePart);
let BaseSimpleChatConfirmationWidget = class BaseSimpleChatConfirmationWidget2 extends Disposable {
  static {
    __name(this, "BaseSimpleChatConfirmationWidget");
  }
  get onDidClick() {
    return this._onDidClick.event;
  }
  get domNode() {
    return this._domNode;
  }
  setShowButtons(showButton) {
    this.domNode.classList.toggle("hideButtons", !showButton);
  }
  constructor(context, options, instantiationService, _markdownRendererService, contextMenuService, contextKeyService) {
    super();
    this.context = context;
    this.instantiationService = instantiationService;
    this._markdownRendererService = _markdownRendererService;
    this._onDidClick = this._register(new Emitter());
    const { title, subtitle, message, buttons } = options;
    const elements = dom.h(".chat-confirmation-widget-container@container", [
      dom.h(".chat-confirmation-widget@root", [
        dom.h(".chat-confirmation-widget-title@title"),
        dom.h(".chat-confirmation-widget-message-container", [
          dom.h(".chat-confirmation-widget-message@message"),
          dom.h(".chat-buttons-container@buttonsContainer", [
            dom.h(".chat-buttons@buttons"),
            dom.h(".chat-toolbar@toolbar")
          ])
        ])
      ])
    ]);
    configureAccessibilityContainer(elements.container, title, message);
    this._domNode = elements.root;
    this._register(instantiationService.createInstance(ChatQueryTitlePart, elements.title, title, subtitle));
    this.messageElement = elements.message;
    buttons.forEach((buttonData) => {
      const buttonOptions = { ...defaultButtonStyles, small: true, secondary: buttonData.isSecondary, title: buttonData.tooltip, disabled: buttonData.disabled };
      let button;
      if (buttonData.moreActions) {
        button = new ButtonWithDropdown(elements.buttons, {
          ...buttonOptions,
          contextMenuProvider: contextMenuService,
          addPrimaryActionToDropdown: false,
          actions: buttonData.moreActions.map((action) => {
            if (action instanceof Separator) {
              return action;
            }
            return this._register(new Action(action.label, action.label, void 0, !action.disabled, () => {
              this._onDidClick.fire(action);
              return Promise.resolve();
            }));
          })
        });
      } else {
        button = new Button(elements.buttons, buttonOptions);
      }
      this._register(button);
      button.label = buttonData.label;
      this._register(button.onDidClick(() => this._onDidClick.fire(buttonData)));
      if (buttonData.onDidChangeDisablement) {
        this._register(buttonData.onDidChangeDisablement((disabled) => button.enabled = !disabled));
      }
    });
    if (options?.toolbarData) {
      const overlay = contextKeyService.createOverlay([
        ["chatConfirmationPartType", options.toolbarData.partType],
        ["chatConfirmationPartSource", options.toolbarData.partSource]
      ]);
      const nestedInsta = this._register(instantiationService.createChild(new ServiceCollection([IContextKeyService, overlay])));
      this._register(nestedInsta.createInstance(MenuWorkbenchToolBar, elements.toolbar, MenuId.ChatConfirmationMenu, {
        // buttonConfigProvider: () => ({ showLabel: false, showIcon: true }),
        menuOptions: {
          arg: options.toolbarData.arg,
          shouldForwardArgs: true
        }
      }));
    }
  }
  renderMessage(element) {
    this.messageElement.append(element);
  }
};
BaseSimpleChatConfirmationWidget = __decorate([
  __param(2, IInstantiationService),
  __param(3, IMarkdownRendererService),
  __param(4, IContextMenuService),
  __param(5, IContextKeyService)
], BaseSimpleChatConfirmationWidget);
let SimpleChatConfirmationWidget = class SimpleChatConfirmationWidget2 extends BaseSimpleChatConfirmationWidget {
  static {
    __name(this, "SimpleChatConfirmationWidget");
  }
  constructor(context, options, instantiationService, markdownRendererService, contextMenuService, contextKeyService) {
    super(context, options, instantiationService, markdownRendererService, contextMenuService, contextKeyService);
    this.updateMessage(options.message);
  }
  updateMessage(message) {
    this._renderedMessage?.remove();
    const renderedMessage = this._register(this._markdownRendererService.render(typeof message === "string" ? new MarkdownString(message) : message));
    this.renderMessage(renderedMessage.element);
    this._renderedMessage = renderedMessage.element;
  }
};
SimpleChatConfirmationWidget = __decorate([
  __param(2, IInstantiationService),
  __param(3, IMarkdownRendererService),
  __param(4, IContextMenuService),
  __param(5, IContextKeyService)
], SimpleChatConfirmationWidget);
let BaseChatConfirmationWidget = class BaseChatConfirmationWidget2 extends Disposable {
  static {
    __name(this, "BaseChatConfirmationWidget");
  }
  get onDidClick() {
    return this._onDidClick.event;
  }
  get domNode() {
    return this._domNode;
  }
  setShowButtons(showButton) {
    this.domNode.classList.toggle("hideButtons", !showButton);
  }
  get codeblocksPartId() {
    return this.markdownContentPart.value?.codeblocksPartId;
  }
  get codeblocks() {
    return this.markdownContentPart.value?.codeblocks;
  }
  constructor(_context, options, instantiationService, markdownRendererService, contextMenuService, contextKeyService, chatMarkdownAnchorService) {
    super();
    this._context = _context;
    this.instantiationService = instantiationService;
    this.markdownRendererService = markdownRendererService;
    this.contextMenuService = contextMenuService;
    this.chatMarkdownAnchorService = chatMarkdownAnchorService;
    this._onDidClick = this._register(new Emitter());
    this.markdownContentPart = this._register(new MutableDisposable());
    const { title, subtitle, message, buttons, icon } = options;
    const elements = dom.h(".chat-confirmation-widget-container@container", [
      dom.h(".chat-confirmation-widget2@root", [
        dom.h(".chat-confirmation-widget-title", [
          dom.h(".chat-title@title"),
          dom.h(".chat-toolbar-container@buttonsContainer", [
            dom.h(".chat-toolbar@toolbar")
          ])
        ]),
        dom.h(".chat-confirmation-widget-message@message"),
        dom.h(".chat-confirmation-widget-buttons", [
          dom.h(".chat-buttons@buttons")
        ])
      ])
    ]);
    configureAccessibilityContainer(elements.container, title, message);
    this._domNode = elements.root;
    this._buttonsDomNode = elements.buttons;
    this._register(instantiationService.createInstance(ChatQueryTitlePart, elements.title, new MarkdownString(icon ? `$(${icon.id}) ${typeof title === "string" ? title : title.value}` : typeof title === "string" ? title : title.value), subtitle));
    this.messageElement = elements.message;
    this.updateButtons(buttons);
    if (options?.toolbarData) {
      const overlay = contextKeyService.createOverlay([
        ["chatConfirmationPartType", options.toolbarData.partType],
        ["chatConfirmationPartSource", options.toolbarData.partSource]
      ]);
      const nestedInsta = this._register(instantiationService.createChild(new ServiceCollection([IContextKeyService, overlay])));
      this._register(nestedInsta.createInstance(MenuWorkbenchToolBar, elements.toolbar, MenuId.ChatConfirmationMenu, {
        // buttonConfigProvider: () => ({ showLabel: false, showIcon: true }),
        menuOptions: {
          arg: options.toolbarData.arg,
          shouldForwardArgs: true
        }
      }));
    }
  }
  updateButtons(buttons) {
    while (this._buttonsDomNode.children.length > 0) {
      this._buttonsDomNode.children[0].remove();
    }
    for (const buttonData of buttons) {
      const buttonOptions = { ...defaultButtonStyles, small: true, secondary: buttonData.isSecondary, title: buttonData.tooltip, disabled: buttonData.disabled };
      let button;
      if (buttonData.moreActions) {
        button = new ButtonWithDropdown(this._buttonsDomNode, {
          ...buttonOptions,
          contextMenuProvider: this.contextMenuService,
          addPrimaryActionToDropdown: false,
          actions: buttonData.moreActions.map((action) => {
            if (action instanceof Separator) {
              return action;
            }
            return this._register(new Action(action.label, action.label, void 0, !action.disabled, () => {
              this._onDidClick.fire(action);
              return Promise.resolve();
            }));
          })
        });
      } else {
        button = new Button(this._buttonsDomNode, buttonOptions);
      }
      this._register(button);
      button.label = buttonData.label;
      this._register(button.onDidClick(() => this._onDidClick.fire(buttonData)));
      if (buttonData.onDidChangeDisablement) {
        this._register(buttonData.onDidChangeDisablement((disabled) => button.enabled = !disabled));
      }
    }
  }
  renderMessage(element) {
    this.markdownContentPart.clear();
    if (!dom.isHTMLElement(element)) {
      const part = this._register(this.instantiationService.createInstance(ChatMarkdownContentPart, {
        kind: "markdownContent",
        content: typeof element === "string" ? new MarkdownString().appendMarkdown(element) : element
      }, this._context, this._context.editorPool, false, this._context.codeBlockStartIndex, this.markdownRendererService, void 0, this._context.currentWidth.get(), this._context.codeBlockModelCollection, {
        allowInlineDiffs: true,
        horizontalPadding: 6
      }));
      renderFileWidgets(part.domNode, this.instantiationService, this.chatMarkdownAnchorService, this._store);
      this.markdownContentPart.value = part;
      element = part.domNode;
    }
    for (const child of this.messageElement.children) {
      child.remove();
    }
    this.messageElement.append(element);
  }
};
BaseChatConfirmationWidget = __decorate([
  __param(2, IInstantiationService),
  __param(3, IMarkdownRendererService),
  __param(4, IContextMenuService),
  __param(5, IContextKeyService),
  __param(6, IChatMarkdownAnchorService)
], BaseChatConfirmationWidget);
let ChatConfirmationWidget = class ChatConfirmationWidget2 extends BaseChatConfirmationWidget {
  static {
    __name(this, "ChatConfirmationWidget");
  }
  constructor(context, options, instantiationService, markdownRendererService, contextMenuService, contextKeyService, chatMarkdownAnchorService) {
    super(context, options, instantiationService, markdownRendererService, contextMenuService, contextKeyService, chatMarkdownAnchorService);
    this.renderMessage(options.message);
  }
  updateMessage(message) {
    this._renderedMessage?.remove();
    const renderedMessage = this._register(this.markdownRendererService.render(typeof message === "string" ? new MarkdownString(message) : message));
    this.renderMessage(renderedMessage.element);
    this._renderedMessage = renderedMessage.element;
  }
};
ChatConfirmationWidget = __decorate([
  __param(2, IInstantiationService),
  __param(3, IMarkdownRendererService),
  __param(4, IContextMenuService),
  __param(5, IContextKeyService),
  __param(6, IChatMarkdownAnchorService)
], ChatConfirmationWidget);
let ChatCustomConfirmationWidget = class ChatCustomConfirmationWidget2 extends BaseChatConfirmationWidget {
  static {
    __name(this, "ChatCustomConfirmationWidget");
  }
  constructor(context, options, instantiationService, markdownRendererService, contextMenuService, contextKeyService, chatMarkdownAnchorService) {
    super(context, options, instantiationService, markdownRendererService, contextMenuService, contextKeyService, chatMarkdownAnchorService);
    this.renderMessage(options.message);
  }
};
ChatCustomConfirmationWidget = __decorate([
  __param(2, IInstantiationService),
  __param(3, IMarkdownRendererService),
  __param(4, IContextMenuService),
  __param(5, IContextKeyService),
  __param(6, IChatMarkdownAnchorService)
], ChatCustomConfirmationWidget);
function configureAccessibilityContainer(container, title, message) {
  container.tabIndex = 0;
  const titleAsString = typeof title === "string" ? title : title.value;
  const messageAsString = typeof message === "string" ? message : message && "value" in message ? message.value : message && "textContent" in message ? message.textContent : "";
  container.setAttribute("aria-label", localize("chat.confirmationWidget.ariaLabel", "Chat Confirmation Dialog {0} {1}", titleAsString, messageAsString));
  container.classList.add("chat-confirmation-widget-container");
}
__name(configureAccessibilityContainer, "configureAccessibilityContainer");
export {
  ChatConfirmationWidget,
  ChatCustomConfirmationWidget,
  ChatQueryTitlePart,
  SimpleChatConfirmationWidget
};
//# sourceMappingURL=chatConfirmationWidget.js.map
