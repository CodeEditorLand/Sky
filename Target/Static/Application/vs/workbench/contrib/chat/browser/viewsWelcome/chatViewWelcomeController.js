var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import * as dom from "../../../../../base/browser/dom.js";
import { Button } from "../../../../../base/browser/ui/button/button.js";
import { renderIcon } from "../../../../../base/browser/ui/iconLabel/iconLabels.js";
import { Event } from "../../../../../base/common/event.js";
import { Disposable, DisposableStore } from "../../../../../base/common/lifecycle.js";
import { MarkdownRenderer } from "../../../../../editor/browser/widget/markdownRenderer/browser/markdownRenderer.js";
import { localize } from "../../../../../nls.js";
import { IContextKeyService } from "../../../../../platform/contextkey/common/contextkey.js";
import { IInstantiationService } from "../../../../../platform/instantiation/common/instantiation.js";
import { ILogService } from "../../../../../platform/log/common/log.js";
import { IOpenerService } from "../../../../../platform/opener/common/opener.js";
import { defaultButtonStyles } from "../../../../../platform/theme/browser/defaultStyles.js";
import { IChatAgentService } from "../../common/chatAgents.js";
import { chatViewsWelcomeRegistry } from "./chatViewsWelcome.js";
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
const $ = dom.$;
let ChatViewWelcomeController = class ChatViewWelcomeController2 extends Disposable {
  static {
    __name(this, "ChatViewWelcomeController");
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
    let enabledDescriptor;
    for (const descriptor of matchingDescriptors) {
      if (typeof descriptor.content === "function") {
        enabledDescriptor = descriptor;
        break;
      }
    }
    enabledDescriptor = enabledDescriptor ?? matchingDescriptors.at(0);
    if (enabledDescriptor) {
      const content = {
        icon: enabledDescriptor.icon,
        title: enabledDescriptor.title,
        message: enabledDescriptor.content
      };
      const welcomeView = this.renderDisposables.add(this.instantiationService.createInstance(ChatViewWelcomePart, content, { firstLinkToButton: true, location: this.location }));
      this.element.appendChild(welcomeView.element);
      this.container.classList.toggle("chat-view-welcome-visible", true);
    } else {
      this.container.classList.toggle("chat-view-welcome-visible", false);
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
  constructor(content, options, openerService, instantiationService, logService, chatAgentService) {
    super();
    this.content = content;
    this.openerService = openerService;
    this.instantiationService = instantiationService;
    this.logService = logService;
    this.element = dom.$(".chat-welcome-view");
    try {
      const renderer = this.instantiationService.createInstance(MarkdownRenderer, {});
      const icon = dom.append(this.element, $(".chat-welcome-view-icon"));
      if (content.icon) {
        icon.appendChild(renderIcon(content.icon));
      }
      const title = dom.append(this.element, $(".chat-welcome-view-title"));
      title.textContent = content.title;
      if (typeof content.message !== "function" && options?.isWidgetAgentWelcomeViewContent) {
        const container = dom.append(this.element, $(".chat-welcome-view-indicator-container"));
        dom.append(container, $(".chat-welcome-view-subtitle", void 0, localize("agentModeSubtitle", "Agent Mode")));
      }
      const message = dom.append(this.element, $(".chat-welcome-view-message"));
      if (typeof content.message === "function") {
        dom.append(message, content.message(this._register(new DisposableStore())));
      } else {
        const messageResult = this.renderMarkdownMessageContent(renderer, content.message, options);
        dom.append(message, messageResult.element);
      }
      if (typeof content.additionalMessage === "string") {
        const element = $("");
        element.textContent = content.additionalMessage;
        dom.append(message, element);
      } else if (content.additionalMessage) {
        const additionalMessageResult = this.renderMarkdownMessageContent(renderer, content.additionalMessage, options);
        dom.append(message, additionalMessageResult.element);
      }
      if (content.tips) {
        const tips = dom.append(this.element, $(".chat-welcome-view-tips"));
        const tipsResult = this._register(renderer.render(content.tips));
        tips.appendChild(tipsResult.element);
      }
    } catch (err) {
      this.logService.error("Failed to render chat view welcome content", err);
    }
  }
  renderMarkdownMessageContent(renderer, content, options) {
    const messageResult = this._register(renderer.render(content));
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
  __param(3, IInstantiationService),
  __param(4, ILogService),
  __param(5, IChatAgentService)
], ChatViewWelcomePart);
export {
  ChatViewWelcomeController,
  ChatViewWelcomePart
};
//# sourceMappingURL=chatViewWelcomeController.js.map
