var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { coalesce } from "../../../../../base/common/arrays.js";
import { raceTimeout } from "../../../../../base/common/async.js";
import { decodeBase64 } from "../../../../../base/common/buffer.js";
import { CancellationTokenSource } from "../../../../../base/common/cancellation.js";
import { Codicon } from "../../../../../base/common/codicons.js";
import { isPatternInWord } from "../../../../../base/common/filters.js";
import { Disposable, DisposableStore, toDisposable } from "../../../../../base/common/lifecycle.js";
import { ResourceSet } from "../../../../../base/common/map.js";
import { Schemas } from "../../../../../base/common/network.js";
import { basename } from "../../../../../base/common/resources.js";
import { ThemeIcon } from "../../../../../base/common/themables.js";
import { URI } from "../../../../../base/common/uri.js";
import { generateUuid } from "../../../../../base/common/uuid.js";
import { getCodeEditor, isCodeEditor } from "../../../../../editor/browser/editorBrowser.js";
import { ICodeEditorService } from "../../../../../editor/browser/services/codeEditorService.js";
import { Range } from "../../../../../editor/common/core/range.js";
import { getWordAtText } from "../../../../../editor/common/core/wordHelper.js";
import { SymbolKinds } from "../../../../../editor/common/languages.js";
import { ILanguageFeaturesService } from "../../../../../editor/common/services/languageFeatures.js";
import { IOutlineModelService } from "../../../../../editor/contrib/documentSymbols/browser/outlineModel.js";
import { localize } from "../../../../../nls.js";
import { Action2, registerAction2 } from "../../../../../platform/actions/common/actions.js";
import { CommandsRegistry } from "../../../../../platform/commands/common/commands.js";
import { IConfigurationService } from "../../../../../platform/configuration/common/configuration.js";
import { FileKind, IFileService } from "../../../../../platform/files/common/files.js";
import { IInstantiationService } from "../../../../../platform/instantiation/common/instantiation.js";
import { ILabelService } from "../../../../../platform/label/common/label.js";
import { INotificationService } from "../../../../../platform/notification/common/notification.js";
import { Registry } from "../../../../../platform/registry/common/platform.js";
import { IWorkspaceContextService } from "../../../../../platform/workspace/common/workspace.js";
import { Extensions as WorkbenchExtensions } from "../../../../common/contributions.js";
import { IEditorService } from "../../../../services/editor/common/editorService.js";
import { IHistoryService } from "../../../../services/history/common/history.js";
import { ISearchService } from "../../../../services/search/common/search.js";
import { McpPromptArgumentPick } from "../../../mcp/browser/mcpPromptArgumentPick.js";
import { IMcpService, McpResourceURI } from "../../../mcp/common/mcpTypes.js";
import { searchFilesAndFolders } from "../../../search/browser/chatContributions.js";
import { IChatAgentNameService, IChatAgentService, getFullyQualifiedId } from "../../common/chatAgents.js";
import { IChatEditingService } from "../../common/chatEditingService.js";
import { getAttachableImageExtension } from "../../common/chatModel.js";
import { ChatRequestAgentPart, ChatRequestAgentSubcommandPart, ChatRequestSlashPromptPart, ChatRequestTextPart, ChatRequestToolPart, ChatRequestToolSetPart, chatAgentLeader, chatSubcommandLeader, chatVariableLeader } from "../../common/chatParserTypes.js";
import { IChatSlashCommandService } from "../../common/chatSlashCommands.js";
import { ChatAgentLocation, ChatMode } from "../../common/constants.js";
import { ToolSet } from "../../common/languageModelToolsService.js";
import { IPromptsService } from "../../common/promptSyntax/service/promptsService.js";
import { ChatSubmitAction } from "../actions/chatExecuteActions.js";
import { IChatWidgetService } from "../chat.js";
import { ChatDynamicVariableModel } from "./chatDynamicVariables.js";
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
var BuiltinDynamicCompletions_1;
var ToolCompletions_1;
let SlashCommandCompletions = class SlashCommandCompletions2 extends Disposable {
  static {
    __name(this, "SlashCommandCompletions");
  }
  constructor(languageFeaturesService, chatWidgetService, chatSlashCommandService, promptsService, mcpService) {
    super();
    this.languageFeaturesService = languageFeaturesService;
    this.chatWidgetService = chatWidgetService;
    this.chatSlashCommandService = chatSlashCommandService;
    this.promptsService = promptsService;
    this._register(this.languageFeaturesService.completionProvider.register({ scheme: Schemas.vscodeChatInput, hasAccessToAllModels: true }, {
      _debugDisplayName: "globalSlashCommands",
      triggerCharacters: ["/"],
      provideCompletionItems: /* @__PURE__ */ __name(async (model, position, _context, _token) => {
        const widget = this.chatWidgetService.getWidgetByInputUri(model.uri);
        if (!widget || !widget.viewModel) {
          return null;
        }
        const range = computeCompletionRanges(model, position, /\/\w*/g);
        if (!range) {
          return null;
        }
        if (!isEmptyUpToCompletionWord(model, range)) {
          return;
        }
        const parsedRequest = widget.parsedInput.parts;
        const usedAgent = parsedRequest.find((p) => p instanceof ChatRequestAgentPart);
        if (usedAgent) {
          return;
        }
        const slashCommands = this.chatSlashCommandService.getCommands(widget.location, widget.input.currentMode);
        if (!slashCommands) {
          return null;
        }
        return {
          suggestions: slashCommands.map((c, i) => {
            const withSlash = `/${c.command}`;
            return {
              label: withSlash,
              insertText: c.executeImmediately ? "" : `${withSlash} `,
              documentation: c.detail,
              range,
              sortText: c.sortText ?? "a".repeat(i + 1),
              kind: 18,
              // The icons are disabled here anyway,
              command: c.executeImmediately ? { id: ChatSubmitAction.ID, title: withSlash, arguments: [{ widget, inputValue: `${withSlash} ` }] } : void 0
            };
          })
        };
      }, "provideCompletionItems")
    }));
    this._register(this.languageFeaturesService.completionProvider.register({ scheme: Schemas.vscodeChatInput, hasAccessToAllModels: true }, {
      _debugDisplayName: "globalSlashCommandsAt",
      triggerCharacters: [chatAgentLeader],
      provideCompletionItems: /* @__PURE__ */ __name(async (model, position, _context, _token) => {
        const widget = this.chatWidgetService.getWidgetByInputUri(model.uri);
        if (!widget || !widget.viewModel) {
          return null;
        }
        const range = computeCompletionRanges(model, position, /@\w*/g);
        if (!range) {
          return null;
        }
        if (!isEmptyUpToCompletionWord(model, range)) {
          return;
        }
        const slashCommands = this.chatSlashCommandService.getCommands(widget.location, widget.input.currentMode);
        if (!slashCommands) {
          return null;
        }
        return {
          suggestions: slashCommands.map((c, i) => {
            const withSlash = `${chatSubcommandLeader}${c.command}`;
            return {
              label: withSlash,
              insertText: c.executeImmediately ? "" : `${withSlash} `,
              documentation: c.detail,
              range,
              filterText: `${chatAgentLeader}${c.command}`,
              sortText: c.sortText ?? "z".repeat(i + 1),
              kind: 18,
              // The icons are disabled here anyway,
              command: c.executeImmediately ? { id: ChatSubmitAction.ID, title: withSlash, arguments: [{ widget, inputValue: `${withSlash} ` }] } : void 0
            };
          })
        };
      }, "provideCompletionItems")
    }));
    this._register(this.languageFeaturesService.completionProvider.register({ scheme: Schemas.vscodeChatInput, hasAccessToAllModels: true }, {
      _debugDisplayName: "promptSlashCommands",
      triggerCharacters: ["/"],
      provideCompletionItems: /* @__PURE__ */ __name(async (model, position, _context, _token) => {
        const widget = this.chatWidgetService.getWidgetByInputUri(model.uri);
        if (!widget || !widget.viewModel) {
          return null;
        }
        const range = computeCompletionRanges(model, position, /\/\w*/g);
        if (!range) {
          return null;
        }
        if (!isEmptyUpToCompletionWord(model, range)) {
          return;
        }
        const parsedRequest = widget.parsedInput.parts;
        const usedAgent = parsedRequest.find((p) => p instanceof ChatRequestAgentPart);
        if (usedAgent) {
          return;
        }
        const promptCommands = await this.promptsService.findPromptSlashCommands();
        if (promptCommands.length === 0) {
          return null;
        }
        return {
          suggestions: promptCommands.map((c, i) => {
            const label = `/${c.command}`;
            const description = c.promptPath?.storage === "user" ? localize("promptFileDescription", "User Prompt File") : localize("promptFileDescriptionWorkspace", "Workspace Prompt File");
            return {
              label: { label, description },
              insertText: `${label} `,
              documentation: c.detail,
              range,
              sortText: "a".repeat(i + 1),
              kind: 18
              // The icons are disabled here anyway,
            };
          })
        };
      }, "provideCompletionItems")
    }));
    this._register(this.languageFeaturesService.completionProvider.register({ scheme: Schemas.vscodeChatInput, hasAccessToAllModels: true }, {
      _debugDisplayName: "mcpPromptSlashCommands",
      triggerCharacters: ["/"],
      provideCompletionItems: /* @__PURE__ */ __name(async (model, position, _context, _token) => {
        const widget = this.chatWidgetService.getWidgetByInputUri(model.uri);
        if (!widget || !widget.viewModel) {
          return null;
        }
        const range = computeCompletionRanges(model, position, /\/[a-z0-9_.-]*/g);
        if (!range) {
          return null;
        }
        if (!isEmptyUpToCompletionWord(model, range)) {
          return;
        }
        return {
          suggestions: mcpService.servers.get().flatMap((server) => server.prompts.get().map((prompt) => {
            const label = `/mcp.${prompt.id}`;
            return {
              label: { label, description: prompt.description },
              command: {
                id: StartParameterizedPromptAction.ID,
                title: prompt.name,
                arguments: [model, server, prompt, `${label} `]
              },
              insertText: `${label} `,
              range,
              kind: 18
            };
          }))
        };
      }, "provideCompletionItems")
    }));
  }
};
SlashCommandCompletions = __decorate([
  __param(0, ILanguageFeaturesService),
  __param(1, IChatWidgetService),
  __param(2, IChatSlashCommandService),
  __param(3, IPromptsService),
  __param(4, IMcpService)
], SlashCommandCompletions);
Registry.as(WorkbenchExtensions.Workbench).registerWorkbenchContribution(
  SlashCommandCompletions,
  4
  /* LifecyclePhase.Eventually */
);
let AgentCompletions = class AgentCompletions2 extends Disposable {
  static {
    __name(this, "AgentCompletions");
  }
  constructor(languageFeaturesService, chatWidgetService, chatAgentService, chatAgentNameService) {
    super();
    this.languageFeaturesService = languageFeaturesService;
    this.chatWidgetService = chatWidgetService;
    this.chatAgentService = chatAgentService;
    this.chatAgentNameService = chatAgentNameService;
    const subCommandProvider = {
      _debugDisplayName: "chatAgentSubcommand",
      triggerCharacters: ["/"],
      provideCompletionItems: /* @__PURE__ */ __name(async (model, position, _context, token) => {
        const widget = this.chatWidgetService.getWidgetByInputUri(model.uri);
        if (!widget || !widget.viewModel) {
          return;
        }
        const range = computeCompletionRanges(model, position, /\/\w*/g);
        if (!range) {
          return null;
        }
        const parsedRequest = widget.parsedInput.parts;
        const usedAgentIdx = parsedRequest.findIndex((p) => p instanceof ChatRequestAgentPart);
        if (usedAgentIdx < 0) {
          return;
        }
        const usedOtherCommand = parsedRequest.find((p) => p instanceof ChatRequestAgentSubcommandPart || p instanceof ChatRequestSlashPromptPart);
        if (usedOtherCommand) {
          return;
        }
        for (const partAfterAgent of parsedRequest.slice(usedAgentIdx + 1)) {
          if (!(partAfterAgent instanceof ChatRequestTextPart) || !partAfterAgent.text.trim().match(/^(\/\w*)?$/)) {
            return;
          }
        }
        const usedAgent = parsedRequest[usedAgentIdx];
        return {
          suggestions: usedAgent.agent.slashCommands.map((c, i) => {
            const withSlash = `/${c.name}`;
            return {
              label: withSlash,
              insertText: `${withSlash} `,
              documentation: c.description,
              range,
              kind: 18
              // The icons are disabled here anyway
            };
          })
        };
      }, "provideCompletionItems")
    };
    this._register(this.languageFeaturesService.completionProvider.register({ scheme: Schemas.vscodeChatInput, hasAccessToAllModels: true }, subCommandProvider));
    this._register(this.languageFeaturesService.completionProvider.register({ scheme: Schemas.vscodeChatInput, hasAccessToAllModels: true }, {
      _debugDisplayName: "chatAgentAndSubcommand",
      triggerCharacters: [chatAgentLeader],
      provideCompletionItems: /* @__PURE__ */ __name(async (model, position, _context, token) => {
        const widget = this.chatWidgetService.getWidgetByInputUri(model.uri);
        const viewModel = widget?.viewModel;
        if (!widget || !viewModel) {
          return;
        }
        const range = computeCompletionRanges(model, position, /(@|\/)\w*/g);
        if (!range) {
          return null;
        }
        if (!isEmptyUpToCompletionWord(model, range)) {
          return;
        }
        const agents = this.chatAgentService.getAgents().filter((a) => a.locations.includes(widget.location) && a.modes.includes(widget.input.currentMode));
        const getFilterText = /* @__PURE__ */ __name((agent, command) => {
          const dummyPrefix = agent.id === "github.copilot.terminalPanel" ? `0000` : ``;
          return `${chatAgentLeader}${dummyPrefix}${agent.name}.${command}`;
        }, "getFilterText");
        const justAgents = agents.filter((a) => !a.isDefault).map((agent) => {
          const { label: agentLabel, isDupe } = this.getAgentCompletionDetails(agent);
          const detail = agent.description;
          return {
            label: isDupe ? { label: agentLabel, description: agent.description, detail: ` (${agent.publisherDisplayName})` } : agentLabel,
            documentation: detail,
            filterText: `${chatAgentLeader}${agent.name}`,
            insertText: `${agentLabel} `,
            range,
            kind: 18,
            sortText: `${chatAgentLeader}${agent.name}`,
            command: { id: AssignSelectedAgentAction.ID, title: AssignSelectedAgentAction.ID, arguments: [{ agent, widget }] }
          };
        });
        return {
          suggestions: justAgents.concat(coalesce(agents.flatMap((agent) => agent.slashCommands.map((c, i) => {
            if (agent.isDefault && this.chatAgentService.getDefaultAgent(widget.location, widget.input.currentMode)?.id !== agent.id) {
              return;
            }
            const { label: agentLabel, isDupe } = this.getAgentCompletionDetails(agent);
            const label = `${agentLabel} ${chatSubcommandLeader}${c.name}`;
            const item = {
              label: isDupe ? { label, description: c.description, detail: isDupe ? ` (${agent.publisherDisplayName})` : void 0 } : label,
              documentation: c.description,
              filterText: getFilterText(agent, c.name),
              commitCharacters: [" "],
              insertText: label + " ",
              range,
              kind: 18,
              // The icons are disabled here anyway
              sortText: `x${chatAgentLeader}${agent.name}${c.name}`,
              command: { id: AssignSelectedAgentAction.ID, title: AssignSelectedAgentAction.ID, arguments: [{ agent, widget }] }
            };
            if (agent.isDefault) {
              const label2 = `${chatSubcommandLeader}${c.name}`;
              item.label = label2;
              item.insertText = `${label2} `;
              item.documentation = c.description;
            }
            return item;
          }))))
        };
      }, "provideCompletionItems")
    }));
    this._register(this.languageFeaturesService.completionProvider.register({ scheme: Schemas.vscodeChatInput, hasAccessToAllModels: true }, {
      _debugDisplayName: "chatAgentAndSubcommand",
      triggerCharacters: [chatSubcommandLeader],
      provideCompletionItems: /* @__PURE__ */ __name(async (model, position, _context, token) => {
        const widget = this.chatWidgetService.getWidgetByInputUri(model.uri);
        const viewModel = widget?.viewModel;
        if (!widget || !viewModel) {
          return;
        }
        const range = computeCompletionRanges(model, position, /(@|\/)\w*/g);
        if (!range) {
          return null;
        }
        if (!isEmptyUpToCompletionWord(model, range)) {
          return;
        }
        const agents = this.chatAgentService.getAgents().filter((a) => a.locations.includes(widget.location) && a.modes.includes(widget.input.currentMode));
        return {
          suggestions: coalesce(agents.flatMap((agent) => agent.slashCommands.map((c, i) => {
            if (agent.isDefault && this.chatAgentService.getDefaultAgent(widget.location, widget.input.currentMode)?.id !== agent.id) {
              return;
            }
            const { label: agentLabel, isDupe } = this.getAgentCompletionDetails(agent);
            const withSlash = `${chatSubcommandLeader}${c.name}`;
            const extraSortText = agent.id === "github.copilot.terminalPanel" ? `z` : ``;
            const sortText = `${chatSubcommandLeader}${extraSortText}${agent.name}${c.name}`;
            const item = {
              label: { label: withSlash, description: agentLabel, detail: isDupe ? ` (${agent.publisherDisplayName})` : void 0 },
              commitCharacters: [" "],
              insertText: `${agentLabel} ${withSlash} `,
              documentation: `(${agentLabel}) ${c.description ?? ""}`,
              range,
              kind: 18,
              // The icons are disabled here anyway
              sortText,
              command: { id: AssignSelectedAgentAction.ID, title: AssignSelectedAgentAction.ID, arguments: [{ agent, widget }] }
            };
            if (agent.isDefault) {
              const label = `${chatSubcommandLeader}${c.name}`;
              item.label = label;
              item.insertText = `${label} `;
              item.documentation = c.description;
            }
            return item;
          })))
        };
      }, "provideCompletionItems")
    }));
    this._register(this.languageFeaturesService.completionProvider.register({ scheme: Schemas.vscodeChatInput, hasAccessToAllModels: true }, {
      _debugDisplayName: "installChatExtensions",
      triggerCharacters: [chatAgentLeader],
      provideCompletionItems: /* @__PURE__ */ __name(async (model, position, _context, token) => {
        if (!model.getLineContent(1).startsWith(chatAgentLeader)) {
          return;
        }
        const widget = this.chatWidgetService.getWidgetByInputUri(model.uri);
        if (widget?.location !== ChatAgentLocation.Panel || widget.input.currentMode !== ChatMode.Ask) {
          return;
        }
        const range = computeCompletionRanges(model, position, /(@|\/)\w*/g);
        if (!range) {
          return;
        }
        if (!isEmptyUpToCompletionWord(model, range)) {
          return;
        }
        const label = localize("installLabel", "Install Chat Extensions...");
        const item = {
          label,
          insertText: "",
          range,
          kind: 18,
          // The icons are disabled here anyway
          command: { id: "workbench.extensions.search", title: "", arguments: ["@tag:chat-participant"] },
          filterText: chatAgentLeader + label,
          sortText: "zzz"
        };
        return {
          suggestions: [item]
        };
      }, "provideCompletionItems")
    }));
  }
  getAgentCompletionDetails(agent) {
    const isAllowed = this.chatAgentNameService.getAgentNameRestriction(agent);
    const agentLabel = `${chatAgentLeader}${isAllowed ? agent.name : getFullyQualifiedId(agent)}`;
    const isDupe = isAllowed && this.chatAgentService.agentHasDupeName(agent.id);
    return { label: agentLabel, isDupe };
  }
};
AgentCompletions = __decorate([
  __param(0, ILanguageFeaturesService),
  __param(1, IChatWidgetService),
  __param(2, IChatAgentService),
  __param(3, IChatAgentNameService)
], AgentCompletions);
Registry.as(WorkbenchExtensions.Workbench).registerWorkbenchContribution(
  AgentCompletions,
  4
  /* LifecyclePhase.Eventually */
);
class AssignSelectedAgentAction extends Action2 {
  static {
    __name(this, "AssignSelectedAgentAction");
  }
  static {
    this.ID = "workbench.action.chat.assignSelectedAgent";
  }
  constructor() {
    super({
      id: AssignSelectedAgentAction.ID,
      title: ""
      // not displayed
    });
  }
  async run(accessor, ...args) {
    const arg = args[0];
    if (!arg || !arg.widget || !arg.agent) {
      return;
    }
    arg.widget.lastSelectedAgent = arg.agent;
  }
}
registerAction2(AssignSelectedAgentAction);
class StartParameterizedPromptAction extends Action2 {
  static {
    __name(this, "StartParameterizedPromptAction");
  }
  static {
    this.ID = "workbench.action.chat.startParameterizedPrompt";
  }
  constructor() {
    super({
      id: StartParameterizedPromptAction.ID,
      title: ""
      // not displayed
    });
  }
  async run(accessor, model, server, prompt, textToReplace) {
    if (!model || !prompt) {
      return;
    }
    const instantiationService = accessor.get(IInstantiationService);
    const notificationService = accessor.get(INotificationService);
    const widgetService = accessor.get(IChatWidgetService);
    const fileService = accessor.get(IFileService);
    const chatWidget = widgetService.lastFocusedWidget;
    if (!chatWidget) {
      return;
    }
    const lastPosition = model.getFullModelRange().collapseToEnd();
    const getPromptIndex = /* @__PURE__ */ __name(() => model.findMatches(textToReplace, true, false, true, null, false)[0], "getPromptIndex");
    const replaceTextWith = /* @__PURE__ */ __name((value) => model.applyEdits([{
      range: getPromptIndex()?.range || lastPosition,
      text: value
    }]), "replaceTextWith");
    const store = new DisposableStore();
    const cts = store.add(new CancellationTokenSource());
    store.add(chatWidget.input.startGenerating());
    store.add(model.onDidChangeContent(() => {
      if (getPromptIndex()) {
        cts.cancel();
      }
    }));
    model.changeDecorations((accessor2) => {
      const id = accessor2.addDecoration(lastPosition, {
        description: "mcp-prompt-spinner",
        showIfCollapsed: true,
        after: {
          content: " ",
          inlineClassNameAffectsLetterSpacing: true,
          inlineClassName: ThemeIcon.asClassName(ThemeIcon.modify(Codicon.loading, "spin")) + " chat-prompt-spinner"
        }
      });
      store.add(toDisposable(() => {
        model.changeDecorations((a) => a.removeDecoration(id));
      }));
    });
    const pick = store.add(instantiationService.createInstance(McpPromptArgumentPick, prompt));
    try {
      server.start();
      const args = await pick.createArgs();
      if (!args) {
        replaceTextWith("");
        return;
      }
      let messages;
      try {
        messages = await prompt.resolve(args, cts.token);
      } catch (e) {
        if (!cts.token.isCancellationRequested) {
          notificationService.error(localize("mcp.prompt.error", "Error resolving prompt: {0}", String(e)));
        }
        replaceTextWith("");
        return;
      }
      const toAttach = [];
      const attachBlob = /* @__PURE__ */ __name(async (mimeType, contents, uriStr, isText = false) => {
        let validURI;
        if (uriStr) {
          for (const uri of [URI.parse(uriStr), McpResourceURI.fromServer(server.definition, uriStr)]) {
            try {
              validURI ||= await fileService.exists(uri) ? uri : void 0;
            } catch {
            }
          }
        }
        if (isText) {
          if (validURI) {
            toAttach.push({
              id: generateUuid(),
              kind: "file",
              value: validURI,
              name: basename(validURI)
            });
          } else {
            toAttach.push({
              id: generateUuid(),
              kind: "generic",
              value: contents,
              name: localize("mcp.prompt.resource", "Prompt Resource")
            });
          }
        } else if (mimeType && getAttachableImageExtension(mimeType)) {
          chatWidget.attachmentModel.addContext({
            id: generateUuid(),
            name: localize("mcp.prompt.image", "Prompt Image"),
            fullName: localize("mcp.prompt.image", "Prompt Image"),
            value: decodeBase64(contents).buffer,
            kind: "image",
            references: validURI && [{ reference: validURI, kind: "reference" }]
          });
        } else if (validURI) {
          toAttach.push({
            id: generateUuid(),
            kind: "file",
            value: validURI,
            name: basename(validURI)
          });
        } else {
        }
      }, "attachBlob");
      const hasMultipleRoles = messages.some((m) => m.role !== messages[0].role);
      let input = "";
      for (const message of messages) {
        switch (message.content.type) {
          case "text":
            if (input) {
              input += "\n\n";
            }
            if (hasMultipleRoles) {
              input += `--${message.role.toUpperCase()}
`;
            }
            input += message.content.text;
            break;
          case "resource":
            if ("text" in message.content.resource) {
              await attachBlob(message.content.resource.mimeType, message.content.resource.text, message.content.resource.uri, true);
            } else {
              await attachBlob(message.content.resource.mimeType, message.content.resource.blob, message.content.resource.uri);
            }
            break;
          case "image":
          case "audio":
            await attachBlob(message.content.mimeType, message.content.data);
            break;
        }
      }
      if (toAttach.length) {
        chatWidget.attachmentModel.addContext(...toAttach);
      }
      replaceTextWith(input);
    } finally {
      store.dispose();
    }
  }
}
registerAction2(StartParameterizedPromptAction);
class ReferenceArgument {
  static {
    __name(this, "ReferenceArgument");
  }
  constructor(widget, variable) {
    this.widget = widget;
    this.variable = variable;
  }
}
let BuiltinDynamicCompletions = class BuiltinDynamicCompletions2 extends Disposable {
  static {
    __name(this, "BuiltinDynamicCompletions");
  }
  static {
    BuiltinDynamicCompletions_1 = this;
  }
  static {
    this.addReferenceCommand = "_addReferenceCmd";
  }
  static {
    this.VariableNameDef = new RegExp(`${chatVariableLeader}[\\w:-]*`, "g");
  }
  // MUST be using `g`-flag
  constructor(historyService, workspaceContextService, searchService, labelService, languageFeaturesService, chatWidgetService, _chatEditingService, outlineService, editorService, configurationService, codeEditorService) {
    super();
    this.historyService = historyService;
    this.workspaceContextService = workspaceContextService;
    this.searchService = searchService;
    this.labelService = labelService;
    this.languageFeaturesService = languageFeaturesService;
    this.chatWidgetService = chatWidgetService;
    this._chatEditingService = _chatEditingService;
    this.outlineService = outlineService;
    this.editorService = editorService;
    this.configurationService = configurationService;
    this.codeEditorService = codeEditorService;
    const fileWordPattern = new RegExp(`${chatVariableLeader}[^\\s]*`, "g");
    this.registerVariableCompletions("fileAndFolder", async ({ widget, range }, token) => {
      if (!widget.supportsFileReferences) {
        return;
      }
      const result = { suggestions: [] };
      await this.addFileAndFolderEntries(widget, result, range, token);
      return result;
    }, fileWordPattern);
    this.registerVariableCompletions("selection", ({ widget, range }, token) => {
      if (!widget.supportsFileReferences) {
        return;
      }
      if (widget.location === ChatAgentLocation.Editor) {
        return;
      }
      const active = this.findActiveCodeEditor();
      if (!isCodeEditor(active)) {
        return;
      }
      const currentResource = active.getModel()?.uri;
      const currentSelection = active.getSelection();
      if (!currentSelection || !currentResource || currentSelection.isEmpty()) {
        return;
      }
      const basename2 = this.labelService.getUriBasenameLabel(currentResource);
      const text = `${chatVariableLeader}file:${basename2}:${currentSelection.startLineNumber}-${currentSelection.endLineNumber}`;
      const fullRangeText = `:${currentSelection.startLineNumber}:${currentSelection.startColumn}-${currentSelection.endLineNumber}:${currentSelection.endColumn}`;
      const description = this.labelService.getUriLabel(currentResource, { relative: true }) + fullRangeText;
      const result = { suggestions: [] };
      result.suggestions.push({
        label: { label: `${chatVariableLeader}selection`, description },
        filterText: `${chatVariableLeader}selection`,
        insertText: range.varWord?.endColumn === range.replace.endColumn ? `${text} ` : text,
        range,
        kind: 18,
        sortText: "z",
        command: {
          id: BuiltinDynamicCompletions_1.addReferenceCommand,
          title: "",
          arguments: [new ReferenceArgument(widget, {
            id: "vscode.selection",
            isFile: true,
            range: { startLineNumber: range.replace.startLineNumber, startColumn: range.replace.startColumn, endLineNumber: range.replace.endLineNumber, endColumn: range.replace.startColumn + text.length },
            data: { range: currentSelection, uri: currentResource }
          })]
        }
      });
      return result;
    });
    this.registerVariableCompletions("symbol", ({ widget, range, position, model }, token) => {
      if (!widget.supportsFileReferences) {
        return null;
      }
      const result = { suggestions: [] };
      const range2 = computeCompletionRanges(model, position, new RegExp(`${chatVariableLeader}[^\\s]*`, "g"), true);
      if (range2) {
        this.addSymbolEntries(widget, result, range2, token);
      }
      return result;
    });
    this._register(CommandsRegistry.registerCommand(BuiltinDynamicCompletions_1.addReferenceCommand, (_services, arg) => this.cmdAddReference(arg)));
  }
  findActiveCodeEditor() {
    const codeEditor = this.codeEditorService.getActiveCodeEditor();
    if (codeEditor) {
      const model = codeEditor.getModel();
      if (model?.uri.scheme === Schemas.vscodeNotebookCell) {
        return void 0;
      }
      if (model) {
        return codeEditor;
      }
    }
    for (const codeOrDiffEditor of this.editorService.getVisibleTextEditorControls(
      0
      /* EditorsOrder.MOST_RECENTLY_ACTIVE */
    )) {
      const codeEditor2 = getCodeEditor(codeOrDiffEditor);
      if (!codeEditor2) {
        continue;
      }
      const model = codeEditor2.getModel();
      if (model) {
        return codeEditor2;
      }
    }
    return void 0;
  }
  registerVariableCompletions(debugName, provider, wordPattern = BuiltinDynamicCompletions_1.VariableNameDef) {
    this._register(this.languageFeaturesService.completionProvider.register({ scheme: Schemas.vscodeChatInput, hasAccessToAllModels: true }, {
      _debugDisplayName: `chatVarCompletions-${debugName}`,
      triggerCharacters: [chatVariableLeader],
      provideCompletionItems: /* @__PURE__ */ __name(async (model, position, context, token) => {
        const widget = this.chatWidgetService.getWidgetByInputUri(model.uri);
        if (!widget) {
          return;
        }
        const range = computeCompletionRanges(model, position, wordPattern, true);
        if (range) {
          return provider({ model, position, widget, range, context }, token);
        }
        return;
      }, "provideCompletionItems")
    }));
  }
  async addFileAndFolderEntries(widget, result, info, token) {
    const makeCompletionItem = /* @__PURE__ */ __name((resource, kind, description) => {
      const basename2 = this.labelService.getUriBasenameLabel(resource);
      const text = `${chatVariableLeader}file:${basename2}`;
      const uriLabel = this.labelService.getUriLabel(resource, { relative: true });
      const labelDescription = description ? localize("fileEntryDescription", "{0} ({1})", uriLabel, description) : uriLabel;
      const sortText = description ? "z" : "{";
      return {
        label: { label: basename2, description: labelDescription },
        filterText: `${chatVariableLeader}${basename2}`,
        insertText: info.varWord?.endColumn === info.replace.endColumn ? `${text} ` : text,
        range: info,
        kind: kind === FileKind.FILE ? 20 : 23,
        sortText,
        command: {
          id: BuiltinDynamicCompletions_1.addReferenceCommand,
          title: "",
          arguments: [new ReferenceArgument(widget, {
            id: resource.toString(),
            isFile: kind === FileKind.FILE,
            isDirectory: kind === FileKind.FOLDER,
            range: { startLineNumber: info.replace.startLineNumber, startColumn: info.replace.startColumn, endLineNumber: info.replace.endLineNumber, endColumn: info.replace.startColumn + text.length },
            data: resource
          })]
        }
      };
    }, "makeCompletionItem");
    let pattern;
    if (info.varWord?.word && info.varWord.word.startsWith(chatVariableLeader)) {
      pattern = info.varWord.word.toLowerCase().slice(1);
    }
    const seen = new ResourceSet();
    const len = result.suggestions.length;
    if (widget.input.currentMode !== ChatMode.Ask && widget.viewModel && widget.viewModel.model.editingSession) {
      const relatedFiles = await raceTimeout(this._chatEditingService.getRelatedFiles(widget.viewModel.sessionId, widget.getInput(), widget.attachmentModel.fileAttachments, token), 200) ?? [];
      for (const relatedFileGroup of relatedFiles) {
        for (const relatedFile of relatedFileGroup.files) {
          if (!seen.has(relatedFile.uri)) {
            seen.add(relatedFile.uri);
            result.suggestions.push(makeCompletionItem(relatedFile.uri, FileKind.FILE, relatedFile.description));
          }
        }
      }
    }
    for (const item of this.historyService.getHistory()) {
      if (!item.resource || seen.has(item.resource)) {
        continue;
      }
      if (pattern) {
        const basename2 = this.labelService.getUriBasenameLabel(item.resource).toLowerCase();
        if (!isPatternInWord(pattern, 0, pattern.length, basename2, 0, basename2.length)) {
          continue;
        }
      }
      seen.add(item.resource);
      const newLen = result.suggestions.push(makeCompletionItem(item.resource, FileKind.FILE));
      if (newLen - len >= 5) {
        break;
      }
    }
    if (pattern) {
      const cacheKey = this.updateCacheKey();
      const workspaces = this.workspaceContextService.getWorkspace().folders.map((folder) => folder.uri);
      for (const workspace of workspaces) {
        const { folders, files } = await searchFilesAndFolders(workspace, pattern, true, token, cacheKey.key, this.configurationService, this.searchService);
        for (const file of files) {
          if (!seen.has(file)) {
            result.suggestions.push(makeCompletionItem(file, FileKind.FILE));
            seen.add(file);
          }
        }
        for (const folder of folders) {
          if (!seen.has(folder)) {
            result.suggestions.push(makeCompletionItem(folder, FileKind.FOLDER));
            seen.add(folder);
          }
        }
      }
    }
    result.incomplete = true;
  }
  addSymbolEntries(widget, result, info, token) {
    const makeSymbolCompletionItem = /* @__PURE__ */ __name((symbolItem, pattern2) => {
      const text = `${chatVariableLeader}sym:${symbolItem.name}`;
      const resource = symbolItem.location.uri;
      const uriLabel = this.labelService.getUriLabel(resource, { relative: true });
      const sortText = pattern2 ? "{" : "|";
      return {
        label: { label: symbolItem.name, description: uriLabel },
        filterText: `${chatVariableLeader}${symbolItem.name}`,
        insertText: info.varWord?.endColumn === info.replace.endColumn ? `${text} ` : text,
        range: info,
        kind: SymbolKinds.toCompletionKind(symbolItem.kind),
        sortText,
        command: {
          id: BuiltinDynamicCompletions_1.addReferenceCommand,
          title: "",
          arguments: [new ReferenceArgument(widget, {
            id: `vscode.symbol/${JSON.stringify(symbolItem.location)}`,
            fullName: symbolItem.name,
            range: { startLineNumber: info.replace.startLineNumber, startColumn: info.replace.startColumn, endLineNumber: info.replace.endLineNumber, endColumn: info.replace.startColumn + text.length },
            data: symbolItem.location,
            icon: SymbolKinds.toIcon(symbolItem.kind)
          })]
        }
      };
    }, "makeSymbolCompletionItem");
    let pattern;
    if (info.varWord?.word && info.varWord.word.startsWith(chatVariableLeader)) {
      pattern = info.varWord.word.toLowerCase().slice(1);
    }
    const symbolsToAdd = [];
    for (const outlineModel of this.outlineService.getCachedModels()) {
      const symbols = outlineModel.asListOfDocumentSymbols();
      for (const symbol of symbols) {
        symbolsToAdd.push({ symbol, uri: outlineModel.uri });
      }
    }
    for (const symbol of symbolsToAdd) {
      result.suggestions.push(makeSymbolCompletionItem({ ...symbol.symbol, location: { uri: symbol.uri, range: symbol.symbol.range } }, pattern ?? ""));
    }
    result.incomplete = !!pattern;
  }
  updateCacheKey() {
    if (this.cacheKey && Date.now() - this.cacheKey.time > 6e4) {
      this.searchService.clearCache(this.cacheKey.key);
      this.cacheKey = void 0;
    }
    if (!this.cacheKey) {
      this.cacheKey = {
        key: generateUuid(),
        time: Date.now()
      };
    }
    this.cacheKey.time = Date.now();
    return this.cacheKey;
  }
  cmdAddReference(arg) {
    arg.widget.getContrib(ChatDynamicVariableModel.ID)?.addReference(arg.variable);
  }
};
BuiltinDynamicCompletions = BuiltinDynamicCompletions_1 = __decorate([
  __param(0, IHistoryService),
  __param(1, IWorkspaceContextService),
  __param(2, ISearchService),
  __param(3, ILabelService),
  __param(4, ILanguageFeaturesService),
  __param(5, IChatWidgetService),
  __param(6, IChatEditingService),
  __param(7, IOutlineModelService),
  __param(8, IEditorService),
  __param(9, IConfigurationService),
  __param(10, ICodeEditorService)
], BuiltinDynamicCompletions);
Registry.as(WorkbenchExtensions.Workbench).registerWorkbenchContribution(
  BuiltinDynamicCompletions,
  4
  /* LifecyclePhase.Eventually */
);
function computeCompletionRanges(model, position, reg, onlyOnWordStart = false) {
  const varWord = getWordAtText(position.column, reg, model.getLineContent(position.lineNumber), 0);
  if (!varWord && model.getWordUntilPosition(position).word) {
    return;
  }
  if (!varWord && position.column > 1) {
    const textBefore = model.getValueInRange(new Range(position.lineNumber, position.column - 1, position.lineNumber, position.column));
    if (textBefore !== " ") {
      return;
    }
  }
  if (varWord && onlyOnWordStart) {
    const wordBefore = model.getWordUntilPosition({ lineNumber: position.lineNumber, column: varWord.startColumn });
    if (wordBefore.word) {
      return;
    }
  }
  let insert;
  let replace;
  if (!varWord) {
    insert = replace = Range.fromPositions(position);
  } else {
    insert = new Range(position.lineNumber, varWord.startColumn, position.lineNumber, position.column);
    replace = new Range(position.lineNumber, varWord.startColumn, position.lineNumber, varWord.endColumn);
  }
  return { insert, replace, varWord };
}
__name(computeCompletionRanges, "computeCompletionRanges");
function isEmptyUpToCompletionWord(model, rangeResult) {
  const startToCompletionWordStart = new Range(1, 1, rangeResult.replace.startLineNumber, rangeResult.replace.startColumn);
  return !!model.getValueInRange(startToCompletionWordStart).match(/^\s*$/);
}
__name(isEmptyUpToCompletionWord, "isEmptyUpToCompletionWord");
let ToolCompletions = class ToolCompletions2 extends Disposable {
  static {
    __name(this, "ToolCompletions");
  }
  static {
    ToolCompletions_1 = this;
  }
  static {
    this.VariableNameDef = new RegExp(`(?<=^|\\s)${chatVariableLeader}\\w*`, "g");
  }
  // MUST be using `g`-flag
  constructor(languageFeaturesService, chatWidgetService) {
    super();
    this.languageFeaturesService = languageFeaturesService;
    this.chatWidgetService = chatWidgetService;
    this._register(this.languageFeaturesService.completionProvider.register({ scheme: Schemas.vscodeChatInput, hasAccessToAllModels: true }, {
      _debugDisplayName: "chatVariables",
      triggerCharacters: [chatVariableLeader],
      provideCompletionItems: /* @__PURE__ */ __name(async (model, position, _context, _token) => {
        const widget = this.chatWidgetService.getWidgetByInputUri(model.uri);
        if (!widget) {
          return null;
        }
        const range = computeCompletionRanges(model, position, ToolCompletions_1.VariableNameDef, true);
        if (!range) {
          return null;
        }
        const usedNames = /* @__PURE__ */ new Set();
        for (const part of widget.parsedInput.parts) {
          if (part instanceof ChatRequestToolPart) {
            usedNames.add(part.toolName);
          } else if (part instanceof ChatRequestToolSetPart) {
            usedNames.add(part.name);
          }
        }
        const suggestions = [];
        const iter = widget.input.selectedToolsModel.entries.get();
        for (const item of iter) {
          let detail;
          let name;
          if (item instanceof ToolSet) {
            detail = item.description;
            name = item.referenceName;
          } else {
            const source = item.source;
            detail = localize("tool_source_completion", "{0}: {1}", source.label, item.displayName);
            name = item.toolReferenceName ?? item.displayName;
          }
          if (usedNames.has(name)) {
            continue;
          }
          const withLeader = `${chatVariableLeader}${name}`;
          suggestions.push({
            label: withLeader,
            range,
            detail,
            insertText: withLeader + " ",
            kind: 27,
            sortText: "z"
          });
        }
        return { suggestions };
      }, "provideCompletionItems")
    }));
  }
};
ToolCompletions = ToolCompletions_1 = __decorate([
  __param(0, ILanguageFeaturesService),
  __param(1, IChatWidgetService)
], ToolCompletions);
Registry.as(WorkbenchExtensions.Workbench).registerWorkbenchContribution(
  ToolCompletions,
  4
  /* LifecyclePhase.Eventually */
);
export {
  computeCompletionRanges
};
//# sourceMappingURL=chatInputCompletions.js.map
