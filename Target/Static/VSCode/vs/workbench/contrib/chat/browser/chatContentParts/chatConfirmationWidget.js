var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp(target, key, result);
  return result;
};
var __decorateParam = (index, decorator) => (target, key) => decorator(target, key, index);
import * as dom from "../../../../../base/browser/dom.js";
import "./media/chatConfirmationWidget.css";
import { Button, ButtonWithDropdown, IButton, IButtonOptions } from "../../../../../base/browser/ui/button/button.js";
import { Emitter, Event } from "../../../../../base/common/event.js";
import { IMarkdownString, MarkdownString } from "../../../../../base/common/htmlContent.js";
import { Disposable } from "../../../../../base/common/lifecycle.js";
import { MarkdownRenderer } from "../../../../../editor/browser/widget/markdownRenderer/browser/markdownRenderer.js";
import { IInstantiationService } from "../../../../../platform/instantiation/common/instantiation.js";
import { defaultButtonStyles } from "../../../../../platform/theme/browser/defaultStyles.js";
import { autorun, observableValue } from "../../../../../base/common/observable.js";
import { Codicon } from "../../../../../base/common/codicons.js";
import { Action } from "../../../../../base/common/actions.js";
import { IContextMenuService } from "../../../../../platform/contextview/browser/contextView.js";
import { IConfigurationService } from "../../../../../platform/configuration/common/configuration.js";
import { IHostService } from "../../../../services/host/browser/host.js";
let BaseChatConfirmationWidget = class extends Disposable {
  constructor(title, buttons, expandableMessage, instantiationService, contextMenuService, _configurationService, _hostService) {
    super();
    this.instantiationService = instantiationService;
    this._configurationService = _configurationService;
    this._hostService = _hostService;
    const elements = dom.h(".chat-confirmation-widget@root", [
      dom.h(".chat-confirmation-widget-expando@expando"),
      dom.h(".chat-confirmation-widget-title@title"),
      dom.h(".chat-confirmation-widget-message@message"),
      dom.h(".chat-confirmation-buttons-container@buttonsContainer")
    ]);
    this._domNode = elements.root;
    this.markdownRenderer = this.instantiationService.createInstance(MarkdownRenderer, {});
    if (expandableMessage) {
      const expanded = observableValue(this, false);
      const btn = this._register(new Button(elements.expando, {}));
      this._register(autorun((r) => {
        const value = expanded.read(r);
        btn.icon = value ? Codicon.chevronDown : Codicon.chevronRight;
        elements.message.classList.toggle("hidden", !value);
        this._onDidChangeHeight.fire();
      }));
      this._register(btn.onDidClick(() => {
        const value = expanded.get();
        expanded.set(!value, void 0);
      }));
    }
    const renderedTitle = this._register(this.markdownRenderer.render(new MarkdownString(title, { supportThemeIcons: true }), {
      asyncRenderCallback: /* @__PURE__ */ __name(() => this._onDidChangeHeight.fire(), "asyncRenderCallback")
    }));
    elements.title.append(renderedTitle.element);
    this.messageElement = elements.message;
    buttons.forEach((buttonData) => {
      const buttonOptions = { ...defaultButtonStyles, secondary: buttonData.isSecondary, title: buttonData.tooltip };
      let button;
      if (buttonData.moreActions) {
        button = new ButtonWithDropdown(elements.buttonsContainer, {
          ...buttonOptions,
          contextMenuProvider: contextMenuService,
          addPrimaryActionToDropdown: false,
          actions: buttonData.moreActions.map((action) => this._register(new Action(
            action.label,
            action.label,
            void 0,
            true,
            () => {
              this._onDidClick.fire(action);
              return Promise.resolve();
            }
          )))
        });
      } else {
        button = new Button(elements.buttonsContainer, buttonOptions);
      }
      this._register(button);
      button.label = buttonData.label;
      this._register(button.onDidClick(() => this._onDidClick.fire(buttonData)));
    });
  }
  static {
    __name(this, "BaseChatConfirmationWidget");
  }
  _onDidClick = this._register(new Emitter());
  get onDidClick() {
    return this._onDidClick.event;
  }
  _onDidChangeHeight = this._register(new Emitter());
  get onDidChangeHeight() {
    return this._onDidChangeHeight.event;
  }
  _domNode;
  get domNode() {
    return this._domNode;
  }
  setShowButtons(showButton) {
    this.domNode.classList.toggle("hideButtons", !showButton);
  }
  messageElement;
  markdownRenderer;
  renderMessage(element) {
    this.messageElement.append(element);
    if (this._configurationService.getValue("chat.focusWindowOnConfirmation")) {
      const targetWindow = dom.getWindow(element);
      if (!targetWindow.document.hasFocus()) {
        this._hostService.focus(targetWindow, {
          force: true
          /* Application may not be active */
        });
      }
    }
  }
};
BaseChatConfirmationWidget = __decorateClass([
  __decorateParam(3, IInstantiationService),
  __decorateParam(4, IContextMenuService),
  __decorateParam(5, IConfigurationService),
  __decorateParam(6, IHostService)
], BaseChatConfirmationWidget);
let ChatConfirmationWidget = class extends BaseChatConfirmationWidget {
  constructor(title, message, buttons, instantiationService, contextMenuService, configurationService, hostService) {
    super(title, buttons, false, instantiationService, contextMenuService, configurationService, hostService);
    this.message = message;
    const renderedMessage = this._register(this.markdownRenderer.render(
      typeof this.message === "string" ? new MarkdownString(this.message) : this.message,
      { asyncRenderCallback: /* @__PURE__ */ __name(() => this._onDidChangeHeight.fire(), "asyncRenderCallback") }
    ));
    this.renderMessage(renderedMessage.element);
  }
  static {
    __name(this, "ChatConfirmationWidget");
  }
};
ChatConfirmationWidget = __decorateClass([
  __decorateParam(3, IInstantiationService),
  __decorateParam(4, IContextMenuService),
  __decorateParam(5, IConfigurationService),
  __decorateParam(6, IHostService)
], ChatConfirmationWidget);
let ChatCustomConfirmationWidget = class extends BaseChatConfirmationWidget {
  static {
    __name(this, "ChatCustomConfirmationWidget");
  }
  constructor(title, messageElement, messageElementIsExpandable, buttons, instantiationService, contextMenuService, configurationService, hostService) {
    super(title, buttons, messageElementIsExpandable, instantiationService, contextMenuService, configurationService, hostService);
    this.renderMessage(messageElement);
  }
};
ChatCustomConfirmationWidget = __decorateClass([
  __decorateParam(4, IInstantiationService),
  __decorateParam(5, IContextMenuService),
  __decorateParam(6, IConfigurationService),
  __decorateParam(7, IHostService)
], ChatCustomConfirmationWidget);
export {
  ChatConfirmationWidget,
  ChatCustomConfirmationWidget
};
//# sourceMappingURL=chatConfirmationWidget.js.map
