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
import { Action } from "../../../../../../base/common/actions.js";
import { Emitter } from "../../../../../../base/common/event.js";
import { Disposable, DisposableStore } from "../../../../../../base/common/lifecycle.js";
import { ThemeIcon } from "../../../../../../base/common/themables.js";
import { localize } from "../../../../../../nls.js";
import { IConfigurationService } from "../../../../../../platform/configuration/common/configuration.js";
import { IContextKeyService } from "../../../../../../platform/contextkey/common/contextkey.js";
import { IContextMenuService } from "../../../../../../platform/contextview/browser/contextView.js";
import { ChatContextKeys } from "../../../common/actions/chatContextKeys.js";
import { ChatConfiguration } from "../../../common/constants.js";
import { IChatSessionsService } from "../../../common/chatSessionsService.js";
import { getAgentCanContinueIn, getAgentSessionProvider, getAgentSessionProviderIcon, getAgentSessionProviderName } from "../../agentSessions/agentSessions.js";
let ChatSuggestNextWidget = class ChatSuggestNextWidget2 extends Disposable {
  static {
    __name(this, "ChatSuggestNextWidget");
  }
  constructor(configurationService, contextMenuService, chatSessionsService, contextKeyService) {
    super();
    this.configurationService = configurationService;
    this.contextMenuService = contextMenuService;
    this.chatSessionsService = chatSessionsService;
    this.contextKeyService = contextKeyService;
    this._onDidChangeHeight = this._register(new Emitter());
    this.onDidChangeHeight = this._onDidChangeHeight.event;
    this._onDidSelectPrompt = this._register(new Emitter());
    this.onDidSelectPrompt = this._onDidSelectPrompt.event;
    this.buttonDisposables = /* @__PURE__ */ new Map();
    this.domNode = this.createSuggestNextWidget();
  }
  get height() {
    return this.domNode.style.display === "none" ? 0 : this.domNode.offsetHeight;
  }
  getCurrentMode() {
    return this._currentMode;
  }
  createSuggestNextWidget() {
    const container = dom.$(".chat-suggest-next-widget.chat-welcome-view-suggested-prompts");
    container.style.display = "none";
    this.titleElement = dom.append(container, dom.$(".chat-welcome-view-suggested-prompts-title"));
    this.promptsContainer = container;
    return container;
  }
  render(mode) {
    const handoffs = mode.handOffs?.get();
    if (!handoffs || handoffs.length === 0) {
      this.hide();
      return;
    }
    this._currentMode = mode;
    const modeName = mode.name.get() || mode.label.get() || localize("chat.currentMode", "current mode");
    this.titleElement.textContent = localize("chat.proceedFrom", "Proceed from {0}", modeName);
    const childrenToRemove = [];
    for (let i = 1; i < this.promptsContainer.children.length; i++) {
      childrenToRemove.push(this.promptsContainer.children[i]);
    }
    for (const child of childrenToRemove) {
      const disposables = this.buttonDisposables.get(child);
      if (disposables) {
        disposables.dispose();
        this.buttonDisposables.delete(child);
      }
      this.promptsContainer.removeChild(child);
    }
    const isAutopilotEnabled = this.configurationService.getValue(ChatConfiguration.AutopilotEnabled) !== false;
    const firstAutoSendHandoff = isAutopilotEnabled ? handoffs.find((h) => h.send) : void 0;
    for (const handoff of handoffs) {
      const promptButton = this.createPromptButton(handoff);
      this.promptsContainer.appendChild(promptButton);
      if (handoff === firstAutoSendHandoff) {
        const autopilotButton = this.createAutopilotButton(handoff);
        this.promptsContainer.appendChild(autopilotButton);
      }
    }
    this.domNode.style.display = "flex";
    this._onDidChangeHeight.fire();
  }
  createPromptButton(handoff) {
    const disposables = new DisposableStore();
    const handoffLabel = handoff.label;
    const getCurrentHandoff = /* @__PURE__ */ __name(() => {
      const currentHandoffs = this._currentMode?.handOffs?.get();
      return currentHandoffs?.find((h) => h.label === handoffLabel) ?? handoff;
    }, "getCurrentHandoff");
    const button = dom.$(".chat-welcome-view-suggested-prompt");
    button.setAttribute("tabindex", "0");
    button.setAttribute("role", "button");
    button.setAttribute("aria-label", localize("chat.suggestNext.item", "{0}", handoff.label));
    const titleElement = dom.append(button, dom.$(".chat-welcome-view-suggested-prompt-title"));
    titleElement.textContent = handoff.label;
    const showContinueOn = handoff.showContinueOn ?? true;
    const currentSessionType = this.contextKeyService.getContextKeyValue(ChatContextKeys.chatSessionType.key);
    const contributions = this.chatSessionsService.getAllChatSessionContributions();
    const availableContributions = contributions.filter((c) => {
      if (!c.canDelegate) {
        return false;
      }
      if (c.type === currentSessionType) {
        return false;
      }
      const provider = getAgentSessionProvider(c.type);
      return provider !== void 0 && getAgentCanContinueIn(provider);
    });
    if (showContinueOn && availableContributions.length > 0) {
      button.classList.add("chat-suggest-next-has-dropdown");
      const dropdownContainer = dom.append(button, dom.$(".chat-suggest-next-dropdown"));
      dropdownContainer.setAttribute("tabindex", "0");
      dropdownContainer.setAttribute("role", "button");
      dropdownContainer.setAttribute("aria-label", localize("chat.suggestNext.moreOptions", "More options for {0}", handoff.label));
      dropdownContainer.setAttribute("aria-haspopup", "true");
      const separator = dom.append(dropdownContainer, dom.$(".chat-suggest-next-separator"));
      separator.setAttribute("aria-hidden", "true");
      const chevron = dom.append(dropdownContainer, dom.$(".codicon.codicon-chevron-down.dropdown-chevron"));
      chevron.setAttribute("aria-hidden", "true");
      const showContextMenu = /* @__PURE__ */ __name((e, anchor) => {
        e.preventDefault();
        e.stopPropagation();
        const actions = availableContributions.map((contrib) => {
          const provider = getAgentSessionProvider(contrib.type);
          const icon = getAgentSessionProviderIcon(provider);
          const name = getAgentSessionProviderName(provider);
          return new Action(contrib.type, localize("continueIn", "Continue in {0}", name), ThemeIcon.isThemeIcon(icon) ? ThemeIcon.asClassName(icon) : void 0, true, () => {
            const currentHandoff = getCurrentHandoff();
            if (currentHandoff) {
              this._onDidSelectPrompt.fire({ handoff: currentHandoff, agentId: contrib.name });
            }
          });
        });
        this.contextMenuService.showContextMenu({
          getAnchor: /* @__PURE__ */ __name(() => anchor || dropdownContainer, "getAnchor"),
          getActions: /* @__PURE__ */ __name(() => actions, "getActions"),
          autoSelectFirstItem: true
        });
      }, "showContextMenu");
      disposables.add(dom.addDisposableListener(dropdownContainer, "click", (e) => {
        showContextMenu(e, dropdownContainer);
      }));
      disposables.add(dom.addDisposableListener(dropdownContainer, "keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          showContextMenu(e, dropdownContainer);
        }
      }));
      disposables.add(dom.addDisposableListener(button, "click", (e) => {
        if (dom.isHTMLElement(e.target) && e.target.closest(".chat-suggest-next-dropdown")) {
          return;
        }
        const currentHandoff = getCurrentHandoff();
        if (currentHandoff) {
          this._onDidSelectPrompt.fire({ handoff: currentHandoff });
        }
      }));
    } else {
      disposables.add(dom.addDisposableListener(button, "click", () => {
        const currentHandoff = getCurrentHandoff();
        if (currentHandoff) {
          this._onDidSelectPrompt.fire({ handoff: currentHandoff });
        }
      }));
    }
    disposables.add(dom.addDisposableListener(button, "keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        const currentHandoff = getCurrentHandoff();
        if (currentHandoff) {
          this._onDidSelectPrompt.fire({ handoff: currentHandoff });
        }
      }
    }));
    this.buttonDisposables.set(button, disposables);
    return button;
  }
  createAutopilotButton(handoff) {
    const disposables = new DisposableStore();
    const handoffLabel = handoff.label;
    const getCurrentHandoff = /* @__PURE__ */ __name(() => {
      const currentHandoffs = this._currentMode?.handOffs?.get();
      return currentHandoffs?.find((h) => h.label === handoffLabel) ?? handoff;
    }, "getCurrentHandoff");
    const label = localize("chat.suggestNext.startWithAutopilot", "Start with Autopilot");
    const button = dom.$(".chat-welcome-view-suggested-prompt");
    button.setAttribute("tabindex", "0");
    button.setAttribute("role", "button");
    button.setAttribute("aria-label", label);
    const titleElement = dom.append(button, dom.$(".chat-welcome-view-suggested-prompt-title"));
    titleElement.textContent = label;
    disposables.add(dom.addDisposableListener(button, "click", () => {
      const currentHandoff = getCurrentHandoff();
      if (currentHandoff) {
        this._onDidSelectPrompt.fire({ handoff: currentHandoff, withAutopilot: true });
      }
    }));
    disposables.add(dom.addDisposableListener(button, "keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        const currentHandoff = getCurrentHandoff();
        if (currentHandoff) {
          this._onDidSelectPrompt.fire({ handoff: currentHandoff, withAutopilot: true });
        }
      }
    }));
    this.buttonDisposables.set(button, disposables);
    return button;
  }
  hide() {
    if (this.domNode.style.display !== "none") {
      this._currentMode = void 0;
      this.domNode.style.display = "none";
      this._onDidChangeHeight.fire();
    }
  }
  dispose() {
    for (const disposables of this.buttonDisposables.values()) {
      disposables.dispose();
    }
    this.buttonDisposables.clear();
    super.dispose();
  }
};
ChatSuggestNextWidget = __decorate([
  __param(0, IConfigurationService),
  __param(1, IContextMenuService),
  __param(2, IChatSessionsService),
  __param(3, IContextKeyService)
], ChatSuggestNextWidget);
export {
  ChatSuggestNextWidget
};
//# sourceMappingURL=chatSuggestNextWidget.js.map
