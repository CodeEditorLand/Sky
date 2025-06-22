var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import * as dom from "../../../../../base/browser/dom.js";
import { Button, ButtonWithDropdown } from "../../../../../base/browser/ui/button/button.js";
import { Action } from "../../../../../base/common/actions.js";
import { Emitter } from "../../../../../base/common/event.js";
import { MarkdownString } from "../../../../../base/common/htmlContent.js";
import { Disposable, MutableDisposable } from "../../../../../base/common/lifecycle.js";
import { MarkdownRenderer, openLinkFromMarkdown } from "../../../../../editor/browser/widget/markdownRenderer/browser/markdownRenderer.js";
import { IConfigurationService } from "../../../../../platform/configuration/common/configuration.js";
import { IContextMenuService } from "../../../../../platform/contextview/browser/contextView.js";
import { IInstantiationService } from "../../../../../platform/instantiation/common/instantiation.js";
import { IOpenerService } from "../../../../../platform/opener/common/opener.js";
import { defaultButtonStyles } from "../../../../../platform/theme/browser/defaultStyles.js";
import { IHostService } from "../../../../services/host/browser/host.js";
import "./media/chatConfirmationWidget.css";
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
      previousEl.parentElement.replaceChild(next.element, previousEl);
    } else {
      this.element.appendChild(next.element);
    }
    this._renderedTitle.value = next;
  }
  constructor(element, _title, subtitle, _renderer, _openerService) {
    super();
    this.element = element;
    this._title = _title;
    this._renderer = _renderer;
    this._openerService = _openerService;
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
        asyncRenderCallback: /* @__PURE__ */ __name(() => this._onDidChangeHeight.fire(), "asyncRenderCallback"),
        actionHandler: { callback: /* @__PURE__ */ __name((link) => openLinkFromMarkdown(this._openerService, link, str.isTrusted), "callback"), disposables: this._store }
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
  __param(4, IOpenerService)
], ChatQueryTitlePart);
let BaseChatConfirmationWidget = class BaseChatConfirmationWidget2 extends Disposable {
  static {
    __name(this, "BaseChatConfirmationWidget");
  }
  get onDidClick() {
    return this._onDidClick.event;
  }
  get onDidChangeHeight() {
    return this._onDidChangeHeight.event;
  }
  get domNode() {
    return this._domNode;
  }
  get showingButtons() {
    return !this.domNode.classList.contains("hideButtons");
  }
  setShowButtons(showButton) {
    this.domNode.classList.toggle("hideButtons", !showButton);
  }
  constructor(title, subtitle, buttons, instantiationService, contextMenuService, _configurationService, _hostService) {
    super();
    this.instantiationService = instantiationService;
    this._configurationService = _configurationService;
    this._hostService = _hostService;
    this._onDidClick = this._register(new Emitter());
    this._onDidChangeHeight = this._register(new Emitter());
    const elements = dom.h(".chat-confirmation-widget@root", [
      dom.h(".chat-confirmation-widget-title@title"),
      dom.h(".chat-confirmation-widget-message@message"),
      dom.h(".chat-buttons-container@buttonsContainer")
    ]);
    this._domNode = elements.root;
    this.markdownRenderer = this.instantiationService.createInstance(MarkdownRenderer, {});
    const titlePart = this._register(instantiationService.createInstance(ChatQueryTitlePart, elements.title, title, subtitle, this.markdownRenderer));
    this._register(titlePart.onDidChangeHeight(() => this._onDidChangeHeight.fire()));
    this.messageElement = elements.message;
    buttons.forEach((buttonData) => {
      const buttonOptions = { ...defaultButtonStyles, secondary: buttonData.isSecondary, title: buttonData.tooltip, disabled: buttonData.disabled };
      let button;
      if (buttonData.moreActions) {
        button = new ButtonWithDropdown(elements.buttonsContainer, {
          ...buttonOptions,
          contextMenuProvider: contextMenuService,
          addPrimaryActionToDropdown: false,
          actions: buttonData.moreActions.map((action) => this._register(new Action(action.label, action.label, void 0, !action.disabled, () => {
            this._onDidClick.fire(action);
            return Promise.resolve();
          })))
        });
      } else {
        button = new Button(elements.buttonsContainer, buttonOptions);
      }
      this._register(button);
      button.label = buttonData.label;
      this._register(button.onDidClick(() => this._onDidClick.fire(buttonData)));
      if (buttonData.onDidChangeDisablement) {
        this._register(buttonData.onDidChangeDisablement((disabled) => button.enabled = !disabled));
      }
    });
  }
  renderMessage(element, listContainer) {
    this.messageElement.append(element);
    if (this.showingButtons && this._configurationService.getValue("chat.notifyWindowOnConfirmation")) {
      const targetWindow = dom.getWindow(listContainer);
      if (!targetWindow.document.hasFocus()) {
        this._hostService.focus(targetWindow, {
          mode: 1
          /* FocusMode.Notify */
        });
      }
    }
  }
};
BaseChatConfirmationWidget = __decorate([
  __param(3, IInstantiationService),
  __param(4, IContextMenuService),
  __param(5, IConfigurationService),
  __param(6, IHostService)
], BaseChatConfirmationWidget);
let ChatConfirmationWidget = class ChatConfirmationWidget2 extends BaseChatConfirmationWidget {
  static {
    __name(this, "ChatConfirmationWidget");
  }
  constructor(title, subtitle, message, buttons, _container, instantiationService, contextMenuService, configurationService, hostService) {
    super(title, subtitle, buttons, instantiationService, contextMenuService, configurationService, hostService);
    this._container = _container;
    this.updateMessage(message);
  }
  updateMessage(message) {
    this._renderedMessage?.remove();
    const renderedMessage = this._register(this.markdownRenderer.render(typeof message === "string" ? new MarkdownString(message) : message, { asyncRenderCallback: /* @__PURE__ */ __name(() => this._onDidChangeHeight.fire(), "asyncRenderCallback") }));
    this.renderMessage(renderedMessage.element, this._container);
    this._renderedMessage = renderedMessage.element;
  }
};
ChatConfirmationWidget = __decorate([
  __param(5, IInstantiationService),
  __param(6, IContextMenuService),
  __param(7, IConfigurationService),
  __param(8, IHostService)
], ChatConfirmationWidget);
let ChatCustomConfirmationWidget = class ChatCustomConfirmationWidget2 extends BaseChatConfirmationWidget {
  static {
    __name(this, "ChatCustomConfirmationWidget");
  }
  constructor(title, subtitle, messageElement, buttons, container, instantiationService, contextMenuService, configurationService, hostService) {
    super(title, subtitle, buttons, instantiationService, contextMenuService, configurationService, hostService);
    this.renderMessage(messageElement, container);
  }
};
ChatCustomConfirmationWidget = __decorate([
  __param(5, IInstantiationService),
  __param(6, IContextMenuService),
  __param(7, IConfigurationService),
  __param(8, IHostService)
], ChatCustomConfirmationWidget);
export {
  ChatConfirmationWidget,
  ChatCustomConfirmationWidget,
  ChatQueryTitlePart
};
//# sourceMappingURL=chatConfirmationWidget.js.map
