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
import { asCSSUrl } from "../../../../../base/browser/cssValue.js";
import * as dom from "../../../../../base/browser/dom.js";
import { createCSSRule } from "../../../../../base/browser/domStylesheets.js";
import { StandardKeyboardEvent } from "../../../../../base/browser/keyboardEvent.js";
import { Button } from "../../../../../base/browser/ui/button/button.js";
import { renderIcon } from "../../../../../base/browser/ui/iconLabel/iconLabels.js";
import { Action } from "../../../../../base/common/actions.js";
import { Codicon } from "../../../../../base/common/codicons.js";
import { Event } from "../../../../../base/common/event.js";
import { StringSHA1 } from "../../../../../base/common/hash.js";
import { Disposable, DisposableStore } from "../../../../../base/common/lifecycle.js";
import { observableValue } from "../../../../../base/common/observable.js";
import { ThemeIcon } from "../../../../../base/common/themables.js";
import { URI } from "../../../../../base/common/uri.js";
import { localize } from "../../../../../nls.js";
import { IContextKeyService } from "../../../../../platform/contextkey/common/contextkey.js";
import { IContextMenuService } from "../../../../../platform/contextview/browser/contextView.js";
import { IInstantiationService } from "../../../../../platform/instantiation/common/instantiation.js";
import { ILogService } from "../../../../../platform/log/common/log.js";
import { IMarkdownRendererService } from "../../../../../platform/markdown/browser/markdownRenderer.js";
import { IOpenerService } from "../../../../../platform/opener/common/opener.js";
import { ITelemetryService } from "../../../../../platform/telemetry/common/telemetry.js";
import { defaultButtonStyles } from "../../../../../platform/theme/browser/defaultStyles.js";
import { ChatAgentLocation } from "../../common/constants.js";
import { IChatWidgetService } from "../chat.js";
import { chatViewsWelcomeRegistry } from "./chatViewsWelcome.js";
const $ = dom.$;
let ChatViewWelcomeController = class ChatViewWelcomeController2 extends Disposable {
  static {
    __name(this, "ChatViewWelcomeController");
  }
  get isShowingWelcome() {
    return this._isShowingWelcome;
  }
  constructor(container, delegate, location, contextKeyService, instantiationService) {
    super();
    this.container = container;
    this.delegate = delegate;
    this.location = location;
    this.contextKeyService = contextKeyService;
    this.instantiationService = instantiationService;
    this.enabled = false;
    this.enabledDisposables = this._register(new DisposableStore());
    this.renderDisposables = this._register(new DisposableStore());
    this._isShowingWelcome = observableValue(this, false);
    this.element = dom.append(this.container, dom.$(".chat-view-welcome"));
    this._register(Event.runAndSubscribe(delegate.onDidChangeViewWelcomeState, () => this.update()));
    this._register(chatViewsWelcomeRegistry.onDidChange(() => this.update(true)));
  }
  update(force) {
    const enabled = this.delegate.shouldShowWelcome();
    if (this.enabled === enabled && !force) {
      return;
    }
    this.enabled = enabled;
    this.enabledDisposables.clear();
    if (!enabled) {
      this.container.classList.toggle("chat-view-welcome-visible", false);
      this.renderDisposables.clear();
      this._isShowingWelcome.set(false, void 0);
      return;
    }
    const descriptors = chatViewsWelcomeRegistry.get();
    if (descriptors.length) {
      this.render(descriptors);
      const descriptorKeys = new Set(descriptors.flatMap((d) => d.when.keys()));
      this.enabledDisposables.add(this.contextKeyService.onDidChangeContext((e) => {
        if (e.affectsSome(descriptorKeys)) {
          this.render(descriptors);
        }
      }));
    }
  }
  render(descriptors) {
    this.renderDisposables.clear();
    dom.clearNode(this.element);
    const matchingDescriptors = descriptors.filter((descriptor) => this.contextKeyService.contextMatchesRules(descriptor.when));
    const enabledDescriptor = matchingDescriptors.at(0);
    if (enabledDescriptor) {
      const content = {
        icon: enabledDescriptor.icon,
        title: enabledDescriptor.title,
        message: enabledDescriptor.content
      };
      const welcomeView = this.renderDisposables.add(this.instantiationService.createInstance(ChatViewWelcomePart, content, { firstLinkToButton: true, location: this.location }));
      this.element.appendChild(welcomeView.element);
      this.container.classList.toggle("chat-view-welcome-visible", true);
      this._isShowingWelcome.set(true, void 0);
    } else {
      this.container.classList.toggle("chat-view-welcome-visible", false);
      this._isShowingWelcome.set(false, void 0);
    }
  }
};
ChatViewWelcomeController = __decorate([
  __param(3, IContextKeyService),
  __param(4, IInstantiationService)
], ChatViewWelcomeController);
let ChatViewWelcomePart = class ChatViewWelcomePart2 extends Disposable {
  static {
    __name(this, "ChatViewWelcomePart");
  }
  constructor(content, options, openerService, logService, chatWidgetService, telemetryService, markdownRendererService, contextMenuService) {
    super();
    this.content = content;
    this.openerService = openerService;
    this.logService = logService;
    this.chatWidgetService = chatWidgetService;
    this.telemetryService = telemetryService;
    this.markdownRendererService = markdownRendererService;
    this.contextMenuService = contextMenuService;
    this.element = dom.$(".chat-welcome-view");
    try {
      const icon = dom.append(this.element, $(".chat-welcome-view-icon"));
      if (content.useLargeIcon) {
        icon.classList.add("large-icon");
      }
      if (content.icon) {
        if (ThemeIcon.isThemeIcon(content.icon)) {
          const iconElement = renderIcon(content.icon);
          icon.appendChild(iconElement);
        } else if (URI.isUri(content.icon)) {
          const cssUrl = asCSSUrl(content.icon);
          const hash = new StringSHA1();
          hash.update(cssUrl);
          const iconId = `chat-welcome-icon-${hash.digest()}`;
          const iconClass = `.chat-welcome-view-icon.${iconId}`;
          createCSSRule(iconClass, `
					mask: ${cssUrl} no-repeat 50% 50%;
					-webkit-mask: ${cssUrl} no-repeat 50% 50%;
					background-color: var(--vscode-icon-foreground);
				`);
          icon.classList.add(iconId, "custom-icon");
        }
      }
      const title = dom.append(this.element, $(".chat-welcome-view-title"));
      title.textContent = content.title;
      const message = dom.append(this.element, $(".chat-welcome-view-message"));
      const messageResult = this.renderMarkdownMessageContent(content.message, options);
      dom.append(message, messageResult.element);
      if (content.additionalMessage) {
        const disclaimers = dom.append(this.element, $(".chat-welcome-view-disclaimer"));
        if (typeof content.additionalMessage === "string") {
          disclaimers.textContent = content.additionalMessage;
        } else {
          const additionalMessageResult = this.renderMarkdownMessageContent(content.additionalMessage, options);
          disclaimers.appendChild(additionalMessageResult.element);
        }
      }
      if (content.suggestedPrompts && content.suggestedPrompts.length) {
        const suggestedPromptsContainer = dom.append(this.element, $(".chat-welcome-view-suggested-prompts"));
        const titleElement = dom.append(suggestedPromptsContainer, $(".chat-welcome-view-suggested-prompts-title"));
        titleElement.textContent = localize("chatWidget.suggestedActions", "Suggested Actions");
        for (const prompt of content.suggestedPrompts) {
          const promptElement = dom.append(suggestedPromptsContainer, $(".chat-welcome-view-suggested-prompt"));
          promptElement.setAttribute("role", "button");
          promptElement.setAttribute("tabindex", "0");
          const promptAriaLabel = prompt.description ? localize("suggestedPromptAriaLabelWithDescription", "Suggested prompt: {0}, {1}", prompt.label, prompt.description) : localize("suggestedPromptAriaLabel", "Suggested prompt: {0}", prompt.label);
          promptElement.setAttribute("aria-label", promptAriaLabel);
          const titleElement2 = dom.append(promptElement, $(".chat-welcome-view-suggested-prompt-title"));
          titleElement2.textContent = prompt.label;
          const tooltip = localize("runPromptTitle", "Suggested prompt: {0}", prompt.prompt);
          promptElement.title = tooltip;
          titleElement2.title = tooltip;
          if (prompt.description) {
            const descriptionElement = dom.append(promptElement, $(".chat-welcome-view-suggested-prompt-description"));
            descriptionElement.textContent = prompt.description;
            descriptionElement.title = prompt.description;
          }
          const executePrompt = /* @__PURE__ */ __name(() => {
            this.telemetryService.publicLog2("chat.clickedSuggestedPrompt", {
              suggestedPrompt: prompt.prompt
            });
            if (!this.chatWidgetService.lastFocusedWidget) {
              const widgets = this.chatWidgetService.getWidgetsByLocations(ChatAgentLocation.Chat);
              if (widgets.length) {
                widgets[0].setInput(prompt.prompt);
              }
            } else {
              this.chatWidgetService.lastFocusedWidget.setInput(prompt.prompt);
            }
          }, "executePrompt");
          this._register(dom.addDisposableListener(promptElement, dom.EventType.CONTEXT_MENU, (e) => {
            e.preventDefault();
            e.stopImmediatePropagation();
            const actions = this.getPromptContextMenuActions(prompt);
            this.contextMenuService.showContextMenu({
              getAnchor: /* @__PURE__ */ __name(() => ({ x: e.clientX, y: e.clientY }), "getAnchor"),
              getActions: /* @__PURE__ */ __name(() => actions, "getActions")
            });
          }));
          this._register(dom.addDisposableListener(promptElement, dom.EventType.CLICK, executePrompt));
          this._register(dom.addDisposableListener(promptElement, dom.EventType.KEY_DOWN, (e) => {
            const event = new StandardKeyboardEvent(e);
            if (event.equals(
              3
              /* KeyCode.Enter */
            ) || event.equals(
              10
              /* KeyCode.Space */
            )) {
              e.preventDefault();
              e.stopPropagation();
              executePrompt();
            } else if (event.equals(
              68
              /* KeyCode.F10 */
            ) && event.shiftKey) {
              e.preventDefault();
              e.stopPropagation();
              const actions = this.getPromptContextMenuActions(prompt);
              this.contextMenuService.showContextMenu({
                getAnchor: /* @__PURE__ */ __name(() => promptElement, "getAnchor"),
                getActions: /* @__PURE__ */ __name(() => actions, "getActions")
              });
            }
          }));
        }
      }
      if (content.tips) {
        const tips = dom.append(this.element, $(".chat-welcome-view-tips"));
        const tipsResult = this._register(this.markdownRendererService.render(content.tips));
        tips.appendChild(tipsResult.element);
      }
    } catch (err) {
      this.logService.error("Failed to render chat view welcome content", err);
    }
  }
  getPromptContextMenuActions(prompt) {
    const actions = [];
    if (prompt.uri) {
      const uri = prompt.uri;
      actions.push(new Action("chat.editPromptFile", localize("editPromptFile", "Edit Prompt File"), ThemeIcon.asClassName(Codicon.goToFile), true, async () => {
        try {
          await this.openerService.open(uri);
        } catch (error) {
          this.logService.error("Failed to open prompt file:", error);
        }
      }));
    }
    return actions;
  }
  needsRerender(content) {
    return !!(this.content.title !== content.title || this.content.message.value !== content.message.value || this.content.additionalMessage !== content.additionalMessage || this.content.tips?.value !== content.tips?.value || this.content.suggestedPrompts?.length !== content.suggestedPrompts?.length || this.content.suggestedPrompts?.some((prompt, index) => {
      const incoming = content.suggestedPrompts?.[index];
      return incoming?.label !== prompt.label || incoming?.description !== prompt.description;
    }));
  }
  renderMarkdownMessageContent(content, options) {
    const messageResult = this._register(this.markdownRendererService.render(content));
    const firstLink = options?.firstLinkToButton ? messageResult.element.querySelector("a") : void 0;
    if (firstLink) {
      const target = firstLink.getAttribute("data-href");
      const button = this._register(new Button(firstLink.parentElement, defaultButtonStyles));
      button.label = firstLink.textContent ?? "";
      if (target) {
        this._register(button.onDidClick(() => {
          this.openerService.open(target, { allowCommands: true });
        }));
      }
      firstLink.replaceWith(button.element);
    }
    return messageResult;
  }
};
ChatViewWelcomePart = __decorate([
  __param(2, IOpenerService),
  __param(3, ILogService),
  __param(4, IChatWidgetService),
  __param(5, ITelemetryService),
  __param(6, IMarkdownRendererService),
  __param(7, IContextMenuService)
], ChatViewWelcomePart);
export {
  ChatViewWelcomeController,
  ChatViewWelcomePart
};
//# sourceMappingURL=chatViewWelcomeController.js.map
