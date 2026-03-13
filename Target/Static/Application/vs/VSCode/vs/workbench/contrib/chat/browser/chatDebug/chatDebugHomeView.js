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
import * as DOM from "../../../../../base/browser/dom.js";
import { Codicon } from "../../../../../base/common/codicons.js";
import { Emitter } from "../../../../../base/common/event.js";
import { Disposable, DisposableStore } from "../../../../../base/common/lifecycle.js";
import { ThemeIcon } from "../../../../../base/common/themables.js";
import { isUUID } from "../../../../../base/common/uuid.js";
import { localize } from "../../../../../nls.js";
import { IChatDebugService } from "../../common/chatDebugService.js";
import { IChatService } from "../../common/chatService/chatService.js";
import { LocalChatSessionUri } from "../../common/model/chatUri.js";
import { IChatWidgetService } from "../chat.js";
const $ = DOM.$;
let ChatDebugHomeView = class ChatDebugHomeView2 extends Disposable {
  static {
    __name(this, "ChatDebugHomeView");
  }
  constructor(parent, chatService, chatDebugService, chatWidgetService) {
    super();
    this.chatService = chatService;
    this.chatDebugService = chatDebugService;
    this.chatWidgetService = chatWidgetService;
    this._onNavigateToSession = this._register(new Emitter());
    this.onNavigateToSession = this._onNavigateToSession.event;
    this.renderDisposables = this._register(new DisposableStore());
    this.container = DOM.append(parent, $(".chat-debug-home"));
    this.scrollContent = DOM.append(this.container, $("div.chat-debug-home-content"));
  }
  show() {
    this.container.style.display = "";
    this.render();
  }
  hide() {
    this.container.style.display = "none";
  }
  render() {
    DOM.clearNode(this.scrollContent);
    this.renderDisposables.clear();
    DOM.append(this.scrollContent, $("h2.chat-debug-home-title", void 0, localize("chatDebug.title", "Agent Debug Panel")));
    const activeWidget = this.chatWidgetService.lastFocusedWidget;
    const activeSessionResource = activeWidget?.viewModel?.sessionResource;
    const sessionResources = [...this.chatDebugService.getSessionResources()].reverse();
    if (activeSessionResource) {
      const activeIndex = sessionResources.findIndex((r) => r.toString() === activeSessionResource.toString());
      if (activeIndex > 0) {
        sessionResources.splice(activeIndex, 1);
        sessionResources.unshift(activeSessionResource);
      }
    }
    DOM.append(this.scrollContent, $("p.chat-debug-home-subtitle", void 0, sessionResources.length > 0 ? localize("chatDebug.homeSubtitle", "Select a chat session to debug") : localize("chatDebug.noSessions", "Send a chat message to get started")));
    if (sessionResources.length > 0) {
      const sessionList = DOM.append(this.scrollContent, $(".chat-debug-home-session-list"));
      sessionList.setAttribute("role", "list");
      sessionList.setAttribute("aria-label", localize("chatDebug.sessionList", "Chat sessions"));
      const items = [];
      for (const sessionResource of sessionResources) {
        const rawTitle = this.chatService.getSessionTitle(sessionResource);
        let sessionTitle;
        if (rawTitle && !isUUID(rawTitle)) {
          sessionTitle = rawTitle;
        } else if (LocalChatSessionUri.isLocalSession(sessionResource)) {
          sessionTitle = localize("chatDebug.newSession", "New Chat");
        } else {
          const importedTitle = this.chatDebugService.getImportedSessionTitle(sessionResource);
          if (importedTitle) {
            sessionTitle = localize("chatDebug.importedSession", "Imported: {0}", importedTitle);
          } else {
            const uriLabel = sessionResource.path || sessionResource.fragment || sessionResource.toString();
            const segment = uriLabel.replace(/^\/+/, "").split("/").pop() || uriLabel;
            sessionTitle = localize("chatDebug.importedSession", "Imported: {0}", segment);
          }
        }
        const isActive = activeSessionResource !== void 0 && sessionResource.toString() === activeSessionResource.toString();
        const item = DOM.append(sessionList, $("button.chat-debug-home-session-item"));
        item.setAttribute("role", "listitem");
        if (isActive) {
          item.classList.add("chat-debug-home-session-item-active");
          item.setAttribute("aria-current", "true");
        }
        DOM.append(item, $(`span${ThemeIcon.asCSSSelector(Codicon.comment)}`));
        const titleSpan = DOM.append(item, $("span.chat-debug-home-session-item-title"));
        titleSpan.textContent = sessionTitle;
        const ariaLabel = isActive ? localize("chatDebug.sessionItemActive", "{0} (active)", sessionTitle) : sessionTitle;
        item.setAttribute("aria-label", ariaLabel);
        if (isActive) {
          DOM.append(item, $("span.chat-debug-home-session-badge", void 0, localize("chatDebug.active", "Active")));
        }
        this.renderDisposables.add(DOM.addDisposableListener(item, DOM.EventType.CLICK, () => {
          this._onNavigateToSession.fire(sessionResource);
        }));
        items.push(item);
      }
      this.renderDisposables.add(DOM.addDisposableListener(sessionList, DOM.EventType.KEY_DOWN, (e) => {
        if (items.length === 0) {
          return;
        }
        const focused = DOM.getActiveElement();
        const idx = items.indexOf(focused);
        if (idx === -1) {
          return;
        }
        let nextIdx;
        switch (e.key) {
          case "ArrowDown":
            nextIdx = idx + 1 < items.length ? idx + 1 : idx;
            break;
          case "ArrowUp":
            nextIdx = idx - 1 >= 0 ? idx - 1 : idx;
            break;
          case "Home":
            nextIdx = 0;
            break;
          case "End":
            nextIdx = items.length - 1;
            break;
        }
        if (nextIdx !== void 0) {
          e.preventDefault();
          items[nextIdx].focus();
        }
      }));
    }
  }
};
ChatDebugHomeView = __decorate([
  __param(1, IChatService),
  __param(2, IChatDebugService),
  __param(3, IChatWidgetService)
], ChatDebugHomeView);
export {
  ChatDebugHomeView
};
//# sourceMappingURL=chatDebugHomeView.js.map
