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
import * as dom from "../../../../base/browser/dom.js";
import { Button } from "../../../../base/browser/ui/button/button.js";
import { getDefaultHoverDelegate } from "../../../../base/browser/ui/hover/hoverDelegateFactory.js";
import { toErrorMessage } from "../../../../base/common/errorMessage.js";
import { Lazy } from "../../../../base/common/lazy.js";
import { DisposableStore, IDisposable } from "../../../../base/common/lifecycle.js";
import { URI } from "../../../../base/common/uri.js";
import { ICommandService } from "../../../../platform/commands/common/commands.js";
import { IHoverService } from "../../../../platform/hover/browser/hover.js";
import { IInstantiationService, ServicesAccessor } from "../../../../platform/instantiation/common/instantiation.js";
import { IKeybindingService } from "../../../../platform/keybinding/common/keybinding.js";
import { ILabelService } from "../../../../platform/label/common/label.js";
import { ILogService } from "../../../../platform/log/common/log.js";
import { asCssVariable } from "../../../../platform/theme/common/colorUtils.js";
import { contentRefUrl } from "../common/annotations.js";
import { getFullyQualifiedId, IChatAgentCommand, IChatAgentData, IChatAgentNameService, IChatAgentService } from "../common/chatAgents.js";
import { chatSlashCommandBackground, chatSlashCommandForeground } from "../common/chatColors.js";
import { chatAgentLeader, ChatRequestAgentPart, ChatRequestAgentSubcommandPart, ChatRequestDynamicVariablePart, ChatRequestSlashCommandPart, ChatRequestTextPart, ChatRequestToolPart, chatSubcommandLeader, IParsedChatRequest, IParsedChatRequestPart } from "../common/chatParserTypes.js";
import { IChatMarkdownContent, IChatService } from "../common/chatService.js";
import { ILanguageModelToolsService } from "../common/languageModelToolsService.js";
import { IChatWidgetService } from "./chat.js";
import { ChatAgentHover, getChatAgentHoverOptions } from "./chatAgentHover.js";
import { IChatMarkdownAnchorService } from "./chatContentParts/chatMarkdownAnchorService.js";
import { InlineAnchorWidget } from "./chatInlineAnchorWidget.js";
import "./media/chatInlineAnchorWidget.css";
const decorationRefUrl = `http://_vscodedecoration_`;
const agentRefUrl = `http://_chatagent_`;
const agentSlashRefUrl = `http://_chatslash_`;
function agentToMarkdown(agent, isClickable, accessor) {
  const chatAgentNameService = accessor.get(IChatAgentNameService);
  const chatAgentService = accessor.get(IChatAgentService);
  const isAllowed = chatAgentNameService.getAgentNameRestriction(agent);
  let name = `${isAllowed ? agent.name : getFullyQualifiedId(agent)}`;
  const isDupe = isAllowed && chatAgentService.agentHasDupeName(agent.id);
  if (isDupe) {
    name += ` (${agent.publisherDisplayName})`;
  }
  const args = { agentId: agent.id, name, isClickable };
  return `[${agent.name}](${agentRefUrl}?${encodeURIComponent(JSON.stringify(args))})`;
}
__name(agentToMarkdown, "agentToMarkdown");
function agentSlashCommandToMarkdown(agent, command) {
  const text = `${chatSubcommandLeader}${command.name}`;
  const args = { agentId: agent.id, command: command.name };
  return `[${text}](${agentSlashRefUrl}?${encodeURIComponent(JSON.stringify(args))})`;
}
__name(agentSlashCommandToMarkdown, "agentSlashCommandToMarkdown");
let ChatMarkdownDecorationsRenderer = class {
  constructor(keybindingService, logService, chatAgentService, instantiationService, hoverService, chatService, chatWidgetService, commandService, labelService, toolsService, chatMarkdownAnchorService) {
    this.keybindingService = keybindingService;
    this.logService = logService;
    this.chatAgentService = chatAgentService;
    this.instantiationService = instantiationService;
    this.hoverService = hoverService;
    this.chatService = chatService;
    this.chatWidgetService = chatWidgetService;
    this.commandService = commandService;
    this.labelService = labelService;
    this.toolsService = toolsService;
    this.chatMarkdownAnchorService = chatMarkdownAnchorService;
  }
  static {
    __name(this, "ChatMarkdownDecorationsRenderer");
  }
  convertParsedRequestToMarkdown(parsedRequest) {
    let result = "";
    for (const part of parsedRequest.parts) {
      if (part instanceof ChatRequestTextPart) {
        result += part.text;
      } else if (part instanceof ChatRequestAgentPart) {
        result += this.instantiationService.invokeFunction((accessor) => agentToMarkdown(part.agent, false, accessor));
      } else {
        result += this.genericDecorationToMarkdown(part);
      }
    }
    return result;
  }
  genericDecorationToMarkdown(part) {
    const uri = part instanceof ChatRequestDynamicVariablePart && part.data instanceof URI ? part.data : void 0;
    const title = uri ? this.labelService.getUriLabel(uri, { relative: true }) : part instanceof ChatRequestSlashCommandPart ? part.slashCommand.detail : part instanceof ChatRequestAgentSubcommandPart ? part.command.description : part instanceof ChatRequestToolPart ? this.toolsService.getTool(part.toolId)?.userDescription : "";
    const args = { title };
    const text = part.text;
    return `[${text}](${decorationRefUrl}?${encodeURIComponent(JSON.stringify(args))})`;
  }
  walkTreeAndAnnotateReferenceLinks(content, element) {
    const store = new DisposableStore();
    element.querySelectorAll("a").forEach((a) => {
      const href = a.getAttribute("data-href");
      if (href) {
        if (href.startsWith(agentRefUrl)) {
          let args;
          try {
            args = JSON.parse(decodeURIComponent(href.slice(agentRefUrl.length + 1)));
          } catch (e) {
            this.logService.error("Invalid chat widget render data JSON", toErrorMessage(e));
          }
          if (args) {
            a.parentElement.replaceChild(
              this.renderAgentWidget(args, store),
              a
            );
          }
        } else if (href.startsWith(agentSlashRefUrl)) {
          let args;
          try {
            args = JSON.parse(decodeURIComponent(href.slice(agentRefUrl.length + 1)));
          } catch (e) {
            this.logService.error("Invalid chat slash command render data JSON", toErrorMessage(e));
          }
          if (args) {
            a.parentElement.replaceChild(
              this.renderSlashCommandWidget(a.textContent, args, store),
              a
            );
          }
        } else if (href.startsWith(decorationRefUrl)) {
          let args;
          try {
            args = JSON.parse(decodeURIComponent(href.slice(decorationRefUrl.length + 1)));
          } catch (e) {
          }
          a.parentElement.replaceChild(
            this.renderResourceWidget(a.textContent, args, store),
            a
          );
        } else if (href.startsWith(contentRefUrl)) {
          this.renderFileWidget(content, href, a, store);
        } else if (href.startsWith("command:")) {
          this.injectKeybindingHint(a, href, this.keybindingService);
        }
      }
    });
    return store;
  }
  renderAgentWidget(args, store) {
    const nameWithLeader = `${chatAgentLeader}${args.name}`;
    let container;
    if (args.isClickable) {
      container = dom.$("span.chat-agent-widget");
      const button = store.add(new Button(container, {
        buttonBackground: asCssVariable(chatSlashCommandBackground),
        buttonForeground: asCssVariable(chatSlashCommandForeground),
        buttonHoverBackground: void 0
      }));
      button.label = nameWithLeader;
      store.add(button.onDidClick(() => {
        const agent2 = this.chatAgentService.getAgent(args.agentId);
        const widget = this.chatWidgetService.lastFocusedWidget;
        if (!widget || !agent2) {
          return;
        }
        this.chatService.sendRequest(
          widget.viewModel.sessionId,
          agent2.metadata.sampleRequest ?? "",
          {
            location: widget.location,
            agentId: agent2.id,
            userSelectedModelId: widget.input.currentLanguageModel,
            mode: widget.input.currentMode
          }
        );
      }));
    } else {
      container = this.renderResourceWidget(nameWithLeader, void 0, store);
    }
    const agent = this.chatAgentService.getAgent(args.agentId);
    const hover = new Lazy(() => store.add(this.instantiationService.createInstance(ChatAgentHover)));
    store.add(this.hoverService.setupManagedHover(getDefaultHoverDelegate("element"), container, () => {
      hover.value.setAgent(args.agentId);
      return hover.value.domNode;
    }, agent && getChatAgentHoverOptions(() => agent, this.commandService)));
    return container;
  }
  renderSlashCommandWidget(name, args, store) {
    const container = dom.$("span.chat-agent-widget.chat-command-widget");
    const agent = this.chatAgentService.getAgent(args.agentId);
    const button = store.add(new Button(container, {
      buttonBackground: asCssVariable(chatSlashCommandBackground),
      buttonForeground: asCssVariable(chatSlashCommandForeground),
      buttonHoverBackground: void 0
    }));
    button.label = name;
    store.add(button.onDidClick(() => {
      const widget = this.chatWidgetService.lastFocusedWidget;
      if (!widget || !agent) {
        return;
      }
      const command = agent.slashCommands.find((c) => c.name === args.command);
      this.chatService.sendRequest(widget.viewModel.sessionId, command?.sampleRequest ?? "", {
        location: widget.location,
        agentId: agent.id,
        slashCommand: args.command,
        userSelectedModelId: widget.input.currentLanguageModel,
        mode: widget.input.currentMode
      });
    }));
    return container;
  }
  renderFileWidget(content, href, a, store) {
    const fullUri = URI.parse(href);
    const data = content.inlineReferences?.[fullUri.path.slice(1)];
    if (!data) {
      this.logService.error("Invalid chat widget render data JSON");
      return;
    }
    const inlineAnchor = store.add(this.instantiationService.createInstance(InlineAnchorWidget, a, data));
    store.add(this.chatMarkdownAnchorService.register(inlineAnchor));
  }
  renderResourceWidget(name, args, store) {
    const container = dom.$("span.chat-resource-widget");
    const alias = dom.$("span", void 0, name);
    if (args?.title) {
      store.add(this.hoverService.setupManagedHover(getDefaultHoverDelegate("element"), container, args.title));
    }
    container.appendChild(alias);
    return container;
  }
  injectKeybindingHint(a, href, keybindingService) {
    const command = href.match(/command:([^\)]+)/)?.[1];
    if (command) {
      const kb = keybindingService.lookupKeybinding(command);
      if (kb) {
        const keybinding = kb.getLabel();
        if (keybinding) {
          a.textContent = `${a.textContent} (${keybinding})`;
        }
      }
    }
  }
};
ChatMarkdownDecorationsRenderer = __decorateClass([
  __decorateParam(0, IKeybindingService),
  __decorateParam(1, ILogService),
  __decorateParam(2, IChatAgentService),
  __decorateParam(3, IInstantiationService),
  __decorateParam(4, IHoverService),
  __decorateParam(5, IChatService),
  __decorateParam(6, IChatWidgetService),
  __decorateParam(7, ICommandService),
  __decorateParam(8, ILabelService),
  __decorateParam(9, ILanguageModelToolsService),
  __decorateParam(10, IChatMarkdownAnchorService)
], ChatMarkdownDecorationsRenderer);
export {
  ChatMarkdownDecorationsRenderer,
  agentSlashCommandToMarkdown,
  agentToMarkdown
};
//# sourceMappingURL=chatMarkdownDecorationsRenderer.js.map
