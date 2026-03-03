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
import { RunOnceScheduler } from "../../../../../../base/common/async.js";
import { Codicon } from "../../../../../../base/common/codicons.js";
import { escapeMarkdownSyntaxTokens, createMarkdownCommandLink, MarkdownString } from "../../../../../../base/common/htmlContent.js";
import { Lazy } from "../../../../../../base/common/lazy.js";
import { Disposable, MutableDisposable } from "../../../../../../base/common/lifecycle.js";
import { autorun } from "../../../../../../base/common/observable.js";
import { ThemeIcon } from "../../../../../../base/common/themables.js";
import { IMarkdownRendererService, openLinkFromMarkdown } from "../../../../../../platform/markdown/browser/markdownRenderer.js";
import { localize } from "../../../../../../nls.js";
import { IInstantiationService } from "../../../../../../platform/instantiation/common/instantiation.js";
import { IOpenerService } from "../../../../../../platform/opener/common/opener.js";
import { IMcpService } from "../../../../mcp/common/mcpTypes.js";
import { startServerAndWaitForLiveTools } from "../../../../mcp/common/mcpTypesUtils.js";
import { isResponseVM } from "../../../common/model/chatViewModel.js";
import { ChatProgressContentPart } from "./chatProgressContentPart.js";
import "./media/chatMcpServersInteractionContent.css";
let ChatMcpServersInteractionContentPart = class ChatMcpServersInteractionContentPart2 extends Disposable {
  static {
    __name(this, "ChatMcpServersInteractionContentPart");
  }
  constructor(data, context, mcpService, instantiationService, _openerService, _markdownRendererService) {
    super();
    this.data = data;
    this.context = context;
    this.mcpService = mcpService;
    this.instantiationService = instantiationService;
    this._openerService = _openerService;
    this._markdownRendererService = _markdownRendererService;
    this.interactionMd = this._register(new MutableDisposable());
    this.showSpecificServersScheduler = this._register(new RunOnceScheduler(() => this.updateDetailedProgress(this.data.state.get()), 2500));
    this.previousParts = new Lazy(() => {
      if (!isResponseVM(this.context.element)) {
        return [];
      }
      return this.context.element.session.getItems().filter((r, i) => isResponseVM(r) && i < this.context.elementIndex).flatMap((i) => i.response.value.filter((c) => c.kind === "mcpServersStarting")).map((p) => p.state?.get());
    });
    this.domNode = dom.$(".chat-mcp-servers-interaction");
    if (data.state) {
      this._register(autorun((reader) => {
        const state = data.state.read(reader);
        this.updateForState(state);
      }));
    }
  }
  updateForState(state) {
    if (!state.working) {
      this.workingProgressPart?.domNode.remove();
      this.workingProgressPart = void 0;
      this.showSpecificServersScheduler.cancel();
    } else if (!this.workingProgressPart) {
      if (!this.showSpecificServersScheduler.isScheduled()) {
        this.showSpecificServersScheduler.schedule();
      }
    } else if (this.workingProgressPart) {
      this.updateDetailedProgress(state);
    }
    const requiringInteraction = state.serversRequiringInteraction.filter((s) => {
      if (this.data.didStartServerIds?.includes(s.id)) {
        return false;
      }
      if (this.previousParts.value.some((p) => p?.serversRequiringInteraction.some((s2) => s.id === s2.id))) {
        return false;
      }
      return true;
    });
    if (requiringInteraction.length > 0) {
      if (!this.interactionMd.value) {
        this.renderInteractionRequired(requiringInteraction);
      } else {
        this.updateInteractionRequired(this.interactionMd.value.element, requiringInteraction);
      }
    } else if (requiringInteraction.length === 0 && this.interactionContainer) {
      this.interactionContainer.remove();
      this.interactionContainer = void 0;
    }
  }
  createServerCommandLinks(servers) {
    return servers.map((s) => createMarkdownCommandLink({
      title: "`" + escapeMarkdownSyntaxTokens(s.label) + "`",
      id: "workbench.mcp.serverOptions",
      arguments: [s.id]
    }, false)).join(", ");
  }
  updateDetailedProgress(state) {
    const skipText = createMarkdownCommandLink({
      title: localize("mcp.skip.link", "Skip?"),
      id: "workbench.mcp.skipAutostart"
    });
    let content;
    if (state.starting.length === 0) {
      content = new MarkdownString(void 0, { isTrusted: true }).appendText(localize("mcp.working.mcp", "Activating MCP extensions...") + " ").appendMarkdown(skipText);
    } else {
      const serverLinks = this.createServerCommandLinks(state.starting);
      content = new MarkdownString(void 0, { isTrusted: true }).appendMarkdown(localize("mcp.starting.servers", "Starting MCP servers {0}...", serverLinks) + " ").appendMarkdown(skipText);
    }
    if (this.workingProgressPart) {
      this.workingProgressPart.updateMessage(content);
    } else {
      this.workingProgressPart = this._register(this.instantiationService.createInstance(
        ChatProgressContentPart,
        { kind: "progressMessage", content },
        this._markdownRendererService,
        this.context,
        true,
        // forceShowSpinner
        true,
        // forceShowMessage
        void 0,
        // icon
        void 0,
        // toolInvocation
        false
      ));
      this.domNode.appendChild(this.workingProgressPart.domNode);
    }
  }
  renderInteractionRequired(serversRequiringInteraction) {
    this.interactionContainer = dom.$(".chat-mcp-servers-interaction-hint");
    const messageContainer = dom.$(".chat-mcp-servers-message");
    const icon = dom.$(".chat-mcp-servers-icon");
    icon.classList.add(...ThemeIcon.asClassNameArray(Codicon.mcp));
    const { messageMd } = this.createInteractionMessage(serversRequiringInteraction);
    messageContainer.appendChild(icon);
    messageContainer.appendChild(messageMd.element);
    this.interactionContainer.appendChild(messageContainer);
    this.domNode.prepend(this.interactionContainer);
  }
  updateInteractionRequired(oldElement, serversRequiringInteraction) {
    const { messageMd } = this.createInteractionMessage(serversRequiringInteraction);
    oldElement.replaceWith(messageMd.element);
  }
  createInteractionMessage(serversRequiringInteraction) {
    const count = serversRequiringInteraction.length;
    const links = this.createServerCommandLinks(serversRequiringInteraction);
    const content = count === 1 ? localize("mcp.start.single", "The MCP server {0} may have new tools and requires interaction to start. [Start it now?]({1})", links, "#start") : localize("mcp.start.multiple", "The MCP servers {0} may have new tools and require interaction to start. [Start them now?]({1})", links, "#start");
    const str = new MarkdownString(content, { isTrusted: true });
    const messageMd = this.interactionMd.value = this._markdownRendererService.render(str, {
      actionHandler: /* @__PURE__ */ __name((content2) => {
        if (!content2.startsWith("command:")) {
          this._start(startLink);
          return Promise.resolve(true);
        }
        return openLinkFromMarkdown(this._openerService, content2, true);
      }, "actionHandler")
    });
    const startLink = [...messageMd.element.querySelectorAll("a")].find((a) => !a.getAttribute("data-href")?.startsWith("command:"));
    if (!startLink) {
      return { messageMd, startLink: void 0 };
    }
    startLink.setAttribute("role", "button");
    startLink.href = "";
    return { messageMd, startLink };
  }
  async _start(startLink) {
    startLink.style.pointerEvents = "none";
    startLink.style.opacity = "0.7";
    try {
      if (!this.data.state) {
        return;
      }
      const state = this.data.state.get();
      const serversToStart = state.serversRequiringInteraction;
      for (let i = 0; i < serversToStart.length; i++) {
        const serverInfo = serversToStart[i];
        startLink.textContent = localize("mcp.starting", "Starting {0}...", serverInfo.label);
        const server = this.mcpService.servers.get().find((s) => s.definition.id === serverInfo.id);
        if (server) {
          await startServerAndWaitForLiveTools(server, { promptType: "all-untrusted" });
          this.data.didStartServerIds ??= [];
          this.data.didStartServerIds.push(serverInfo.id);
        }
      }
      if (this.interactionContainer) {
        this.interactionContainer.remove();
        this.interactionContainer = void 0;
      }
    } catch (error) {
      startLink.style.pointerEvents = "";
      startLink.style.opacity = "";
      startLink.textContent = "Start now?";
    }
  }
  hasSameContent(other) {
    return other.kind === "mcpServersStarting";
  }
  addDisposable(disposable) {
    this._register(disposable);
  }
};
ChatMcpServersInteractionContentPart = __decorate([
  __param(2, IMcpService),
  __param(3, IInstantiationService),
  __param(4, IOpenerService),
  __param(5, IMarkdownRendererService)
], ChatMcpServersInteractionContentPart);
export {
  ChatMcpServersInteractionContentPart
};
//# sourceMappingURL=chatMcpServersInteractionContentPart.js.map
