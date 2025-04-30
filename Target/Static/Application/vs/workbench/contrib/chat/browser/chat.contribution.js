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
import { timeout } from "../../../../base/common/async.js";
import { Event } from "../../../../base/common/event.js";
import { MarkdownString, isMarkdownString } from "../../../../base/common/htmlContent.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
import { Schemas } from "../../../../base/common/network.js";
import { isMacintosh } from "../../../../base/common/platform.js";
import { assertDefined } from "../../../../base/common/types.js";
import { registerEditorFeature } from "../../../../editor/common/editorFeatures.js";
import * as nls from "../../../../nls.js";
import { AccessibleViewRegistry } from "../../../../platform/accessibility/browser/accessibleViewRegistry.js";
import { ICommandService } from "../../../../platform/commands/common/commands.js";
import { Extensions as ConfigurationExtensions } from "../../../../platform/configuration/common/configurationRegistry.js";
import { SyncDescriptor } from "../../../../platform/instantiation/common/descriptors.js";
import { registerSingleton } from "../../../../platform/instantiation/common/extensions.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { PromptsConfig } from "../../../../platform/prompts/common/config.js";
import { INSTRUCTIONS_DEFAULT_SOURCE_FOLDER, INSTRUCTION_FILE_EXTENSION, PROMPT_DEFAULT_SOURCE_FOLDER, PROMPT_FILE_EXTENSION } from "../../../../platform/prompts/common/constants.js";
import { Registry } from "../../../../platform/registry/common/platform.js";
import { EditorPaneDescriptor } from "../../../browser/editor.js";
import { Extensions } from "../../../common/configuration.js";
import { registerWorkbenchContribution2 } from "../../../common/contributions.js";
import { EditorExtensions } from "../../../common/editor.js";
import { IWorkbenchAssignmentService } from "../../../services/assignment/common/assignmentService.js";
import { mcpSchemaId } from "../../../services/configuration/common/configuration.js";
import { IEditorResolverService, RegisteredEditorPriority } from "../../../services/editor/common/editorResolverService.js";
import { allDiscoverySources, discoverySourceLabel, mcpConfigurationSection, mcpDiscoverySection, mcpEnabledSection, mcpSchemaExampleServers } from "../../mcp/common/mcpConfiguration.js";
import { ChatAgentNameService, ChatAgentService, IChatAgentNameService, IChatAgentService } from "../common/chatAgents.js";
import { CodeMapperService, ICodeMapperService } from "../common/chatCodeMapperService.js";
import "../common/chatColors.js";
import { IChatEditingService } from "../common/chatEditingService.js";
import { ChatEntitlement, ChatEntitlementService, IChatEntitlementService } from "../common/chatEntitlementService.js";
import { chatVariableLeader } from "../common/chatParserTypes.js";
import { IChatService } from "../common/chatService.js";
import { ChatService } from "../common/chatServiceImpl.js";
import { ChatSlashCommandService, IChatSlashCommandService } from "../common/chatSlashCommands.js";
import { ChatTransferService, IChatTransferService } from "../common/chatTransferService.js";
import { IChatVariablesService } from "../common/chatVariables.js";
import { ChatWidgetHistoryService, IChatWidgetHistoryService } from "../common/chatWidgetHistoryService.js";
import { ChatAgentLocation, ChatConfiguration, ChatMode } from "../common/constants.js";
import { ILanguageModelIgnoredFilesService, LanguageModelIgnoredFilesService } from "../common/ignoredFiles.js";
import { ILanguageModelsService, LanguageModelsService } from "../common/languageModels.js";
import { ILanguageModelStatsService, LanguageModelStatsService } from "../common/languageModelStats.js";
import { ILanguageModelToolsService } from "../common/languageModelToolsService.js";
import { INSTRUCTIONS_DOCUMENTATION_URL, PROMPT_DOCUMENTATION_URL } from "../common/promptSyntax/constants.js";
import { registerPromptFileContributions } from "../common/promptSyntax/contributions/index.js";
import { PromptsService } from "../common/promptSyntax/service/promptsService.js";
import { IPromptsService } from "../common/promptSyntax/service/types.js";
import { LanguageModelToolsExtensionPointHandler } from "../common/tools/languageModelToolsContribution.js";
import { BuiltinToolsContribution } from "../common/tools/tools.js";
import { IVoiceChatService, VoiceChatService } from "../common/voiceChatService.js";
import { AgentChatAccessibilityHelp, EditsChatAccessibilityHelp, PanelChatAccessibilityHelp, QuickChatAccessibilityHelp } from "./actions/chatAccessibilityHelp.js";
import { CopilotTitleBarMenuRendering, registerChatActions } from "./actions/chatActions.js";
import { ACTION_ID_NEW_CHAT, registerNewChatActions } from "./actions/chatClearActions.js";
import { CodeBlockActionRendering, registerChatCodeBlockActions, registerChatCodeCompareBlockActions } from "./actions/chatCodeblockActions.js";
import { registerChatContextActions } from "./actions/chatContextActions.js";
import { registerChatCopyActions } from "./actions/chatCopyActions.js";
import { registerChatDeveloperActions } from "./actions/chatDeveloperActions.js";
import { ChatSubmitAction, registerChatExecuteActions } from "./actions/chatExecuteActions.js";
import { registerChatFileTreeActions } from "./actions/chatFileTreeActions.js";
import { ChatGettingStartedContribution } from "./actions/chatGettingStarted.js";
import { registerChatExportActions } from "./actions/chatImportExport.js";
import { registerMoveActions } from "./actions/chatMoveActions.js";
import { registerQuickChatActions } from "./actions/chatQuickInputActions.js";
import { registerChatTitleActions } from "./actions/chatTitleActions.js";
import { registerChatToolActions } from "./actions/chatToolActions.js";
import { ChatTransferContribution } from "./actions/chatTransfer.js";
import { SAVE_TO_PROMPT_SLASH_COMMAND_NAME, runSaveToPromptAction } from "./actions/promptActions/chatSaveToPromptAction.js";
import { IChatAccessibilityService, IChatCodeBlockContextProviderService, IChatWidgetService, IQuickChatService } from "./chat.js";
import { ChatAccessibilityService } from "./chatAccessibilityService.js";
import "./chatAttachmentModel.js";
import { ChatMarkdownAnchorService, IChatMarkdownAnchorService } from "./chatContentParts/chatMarkdownAnchorService.js";
import { ChatInputBoxContentProvider } from "./chatEdinputInputContentProvider.js";
import { ChatEditingEditorAccessibility } from "./chatEditing/chatEditingEditorAccessibility.js";
import { registerChatEditorActions } from "./chatEditing/chatEditingEditorActions.js";
import { ChatEditingEditorContextKeys } from "./chatEditing/chatEditingEditorContextKeys.js";
import { ChatEditingEditorOverlay } from "./chatEditing/chatEditingEditorOverlay.js";
import { ChatEditingService } from "./chatEditing/chatEditingServiceImpl.js";
import { ChatEditingNotebookFileSystemProviderContrib } from "./chatEditing/notebook/chatEditingNotebookFileSystemProvider.js";
import { SimpleBrowserOverlay } from "./chatEditing/simpleBrowserEditorOverlay.js";
import { ChatEditor } from "./chatEditor.js";
import { ChatEditorInput, ChatEditorInputSerializer } from "./chatEditorInput.js";
import { agentSlashCommandToMarkdown, agentToMarkdown } from "./chatMarkdownDecorationsRenderer.js";
import { ChatCompatibilityNotifier, ChatExtensionPointHandler } from "./chatParticipant.contribution.js";
import { ChatPasteProvidersFeature } from "./chatPasteProviders.js";
import { QuickChatService } from "./chatQuick.js";
import { ChatResponseAccessibleView } from "./chatResponseAccessibleView.js";
import { ChatSetupContribution } from "./chatSetup.js";
import { ChatStatusBarEntry } from "./chatStatus.js";
import { ChatVariablesService } from "./chatVariables.js";
import { ChatWidgetService } from "./chatWidget.js";
import { ChatCodeBlockContextProviderService } from "./codeBlockContextProviderService.js";
import { ChatImplicitContextContribution } from "./contrib/chatImplicitContext.js";
import "./contrib/chatInputCompletions.js";
import "./contrib/chatInputEditorContrib.js";
import "./contrib/chatInputEditorHover.js";
import { ChatRelatedFilesContribution } from "./contrib/chatInputRelatedFilesContrib.js";
import { LanguageModelToolsService } from "./languageModelToolsService.js";
import "./promptSyntax/contributions/attachInstructionsCommand.js";
import "./promptSyntax/contributions/createPromptCommand/createPromptCommand.js";
import { ChatViewsWelcomeHandler } from "./viewsWelcome/chatViewsWelcomeHandler.js";
const configurationRegistry = Registry.as(ConfigurationExtensions.Configuration);
configurationRegistry.registerConfiguration({
  id: "chatSidebar",
  title: nls.localize("interactiveSessionConfigurationTitle", "Chat"),
  type: "object",
  properties: {
    "chat.editor.fontSize": {
      type: "number",
      description: nls.localize("interactiveSession.editor.fontSize", "Controls the font size in pixels in chat codeblocks."),
      default: isMacintosh ? 12 : 14
    },
    "chat.editor.fontFamily": {
      type: "string",
      description: nls.localize("interactiveSession.editor.fontFamily", "Controls the font family in chat codeblocks."),
      default: "default"
    },
    "chat.editor.fontWeight": {
      type: "string",
      description: nls.localize("interactiveSession.editor.fontWeight", "Controls the font weight in chat codeblocks."),
      default: "default"
    },
    "chat.editor.wordWrap": {
      type: "string",
      description: nls.localize("interactiveSession.editor.wordWrap", "Controls whether lines should wrap in chat codeblocks."),
      default: "off",
      enum: ["on", "off"]
    },
    "chat.editor.lineHeight": {
      type: "number",
      description: nls.localize("interactiveSession.editor.lineHeight", "Controls the line height in pixels in chat codeblocks. Use 0 to compute the line height from the font size."),
      default: 0
    },
    "chat.commandCenter.enabled": {
      type: "boolean",
      markdownDescription: nls.localize("chat.commandCenter.enabled", "Controls whether the command center shows a menu for actions to control Copilot (requires {0}).", "`#window.commandCenter#`"),
      default: true
    },
    "chat.implicitContext.enabled": {
      type: "object",
      tags: ["experimental"],
      description: nls.localize("chat.implicitContext.enabled.1", "Enables automatically using the active editor as chat context for specified chat locations."),
      additionalProperties: {
        type: "string",
        enum: ["never", "first", "always"],
        description: nls.localize("chat.implicitContext.value", "The value for the implicit context."),
        enumDescriptions: [
          nls.localize("chat.implicitContext.value.never", "Implicit context is never enabled."),
          nls.localize("chat.implicitContext.value.first", "Implicit context is enabled for the first interaction."),
          nls.localize("chat.implicitContext.value.always", "Implicit context is always enabled.")
        ]
      },
      default: {
        "panel": "always"
      }
    },
    "chat.editing.autoAcceptDelay": {
      type: "number",
      markdownDescription: nls.localize("chat.editing.autoAcceptDelay", "Delay after which changes made by chat are automatically accepted. Values are in seconds, `0` means disabled and `100` seconds is the maximum."),
      default: 0,
      minimum: 0,
      maximum: 100
    },
    "chat.editing.confirmEditRequestRemoval": {
      type: "boolean",
      scope: 1,
      markdownDescription: nls.localize("chat.editing.confirmEditRequestRemoval", "Whether to show a confirmation before removing a request and its associated edits."),
      default: true
    },
    "chat.editing.confirmEditRequestRetry": {
      type: "boolean",
      scope: 1,
      markdownDescription: nls.localize("chat.editing.confirmEditRequestRetry", "Whether to show a confirmation before retrying a request and its associated edits."),
      default: true
    },
    "chat.experimental.detectParticipant.enabled": {
      type: "boolean",
      deprecationMessage: nls.localize("chat.experimental.detectParticipant.enabled.deprecated", "This setting is deprecated. Please use `chat.detectParticipant.enabled` instead."),
      description: nls.localize("chat.experimental.detectParticipant.enabled", "Enables chat participant autodetection for panel chat."),
      default: null
    },
    "chat.detectParticipant.enabled": {
      type: "boolean",
      description: nls.localize("chat.detectParticipant.enabled", "Enables chat participant autodetection for panel chat."),
      default: true
    },
    "chat.renderRelatedFiles": {
      type: "boolean",
      description: nls.localize("chat.renderRelatedFiles", "Controls whether related files should be rendered in the chat input."),
      default: false
    },
    "chat.focusWindowOnConfirmation": {
      type: "boolean",
      description: nls.localize("chat.focusWindowOnConfirmation", "Controls whether the Copilot window should be focused when a confirmation is needed."),
      default: true
    },
    "chat.tools.autoApprove": {
      default: false,
      description: nls.localize("chat.tools.autoApprove", "Controls whether tool use should be automatically approved."),
      type: "boolean",
      tags: ["experimental"],
      policy: {
        name: "ChatToolsAutoApprove",
        minimumVersion: "1.99",
        previewFeature: true,
        defaultValue: false
      }
    },
    "chat.sendElementsToChat.enabled": {
      default: true,
      description: nls.localize("chat.sendElementsToChat.enabled", "Controls whether elements can be sent to chat from the Simple Browser."),
      type: "boolean",
      tags: ["experimental"]
    },
    "chat.sendElementsToChat.attachCSS": {
      default: true,
      markdownDescription: nls.localize("chat.sendElementsToChat.attachCSS", "Controls whether CSS of the selected element will be added to the chat. {0} must be enabled.", "`#chat.sendElementsToChat.enabled#`"),
      type: "boolean",
      tags: ["experimental"]
    },
    "chat.sendElementsToChat.attachImages": {
      default: true,
      markdownDescription: nls.localize("chat.sendElementsToChat.attachImages", "Controls whether a screenshot of the selected element will be added to the chat. {0} must be enabled.", "`#chat.sendElementsToChat.enabled#`"),
      type: "boolean",
      tags: ["experimental"]
    },
    [mcpEnabledSection]: {
      type: "boolean",
      description: nls.localize("chat.mcp.enabled", "Enables integration with Model Context Protocol servers to provide additional tools and functionality."),
      default: true,
      tags: ["preview"],
      policy: {
        name: "ChatMCP",
        minimumVersion: "1.99",
        previewFeature: true,
        defaultValue: false
      }
    },
    [mcpConfigurationSection]: {
      type: "object",
      default: {
        inputs: [],
        servers: mcpSchemaExampleServers
      },
      description: nls.localize("workspaceConfig.mcp.description", "Model Context Protocol server configurations"),
      $ref: mcpSchemaId
    },
    [ChatConfiguration.UseFileStorage]: {
      type: "boolean",
      description: nls.localize("chat.useFileStorage", "Enables storing chat sessions on disk instead of in the storage service. Enabling this does a one-time per-workspace migration of existing sessions to the new format."),
      default: true,
      tags: ["experimental"]
    },
    [ChatConfiguration.Edits2Enabled]: {
      type: "boolean",
      description: nls.localize("chat.edits2Enabled", "Enable the new Edits mode that is based on tool-calling. When this is enabled, models that don't support tool-calling are unavailable for Edits mode."),
      default: true,
      tags: ["onExp"]
    },
    [ChatConfiguration.ExtensionToolsEnabled]: {
      type: "boolean",
      description: nls.localize("chat.extensionToolsEnabled", "Enable using tools contributed by third-party extensions."),
      default: true,
      policy: {
        name: "ChatAgentExtensionTools",
        minimumVersion: "1.99",
        description: nls.localize("chat.extensionToolsPolicy", "Enable using tools contributed by third-party extensions."),
        previewFeature: true,
        defaultValue: false
      }
    },
    [ChatConfiguration.AgentEnabled]: {
      type: "boolean",
      description: nls.localize("chat.agent.enabled.description", "Enable agent mode for {0}. When this is enabled, a dropdown appears in the view to toggle agent mode.", "Copilot Chat"),
      default: true,
      tags: ["onExp"],
      policy: {
        name: "ChatAgentMode",
        minimumVersion: "1.99",
        previewFeature: false,
        defaultValue: false
      }
    },
    [mcpDiscoverySection]: {
      oneOf: [
        { type: "boolean" },
        {
          type: "object",
          default: Object.fromEntries(allDiscoverySources.map((k) => [k, true])),
          properties: Object.fromEntries(allDiscoverySources.map((k) => [
            k,
            { type: "boolean", description: nls.localize("mcp.discovery.source", "Enables discovery of {0} servers", discoverySourceLabel[k]) }
          ]))
        }
      ],
      default: true,
      markdownDescription: nls.localize("mpc.discovery.enabled", "Configures discovery of Model Context Protocol servers on the machine. It may be set to `true` or `false` to disable or enable all sources, and an mapping sources you wish to enable.")
    },
    [PromptsConfig.KEY]: {
      type: "boolean",
      title: nls.localize("chat.reusablePrompts.config.enabled.title", "Prompt Files"),
      markdownDescription: nls.localize("chat.reusablePrompts.config.enabled.description", "Enable reusable prompt (`*{0}`) and instruction files in Chat, Edits, and Inline Chat sessions. [Learn More]({1}).", PROMPT_FILE_EXTENSION, INSTRUCTION_FILE_EXTENSION, PROMPT_DOCUMENTATION_URL),
      default: true,
      restricted: true,
      disallowConfigurationDefault: true,
      tags: ["experimental", "prompts", "reusable prompts", "prompt snippets", "instructions"],
      policy: {
        name: "ChatPromptFiles",
        minimumVersion: "1.99",
        description: nls.localize("chat.promptFiles.policy", "Enables reusable prompt and instruction files in Chat, Edits, and Inline Chat sessions."),
        previewFeature: true,
        defaultValue: false
      }
    },
    [PromptsConfig.INSTRUCTIONS_LOCATION_KEY]: {
      type: "object",
      title: nls.localize("chat.instructions.config.locations.title", "Instructions File Locations"),
      markdownDescription: nls.localize("chat.instructions.config.locations.description", "Specify location(s) of instructions files (`*{0}`) that can be attached in Chat, Edits, and Inline Chat sessions. [Learn More]({1}).\n\nRelative paths are resolved from the root folder(s) of your workspace.", INSTRUCTION_FILE_EXTENSION, INSTRUCTIONS_DOCUMENTATION_URL),
      default: {
        [INSTRUCTIONS_DEFAULT_SOURCE_FOLDER]: true
      },
      additionalProperties: { type: "boolean" },
      restricted: true,
      tags: ["experimental", "prompts", "reusable prompts", "prompt snippets", "instructions"],
      examples: [
        {
          [INSTRUCTIONS_DEFAULT_SOURCE_FOLDER]: true
        },
        {
          [INSTRUCTIONS_DEFAULT_SOURCE_FOLDER]: true,
          "/Users/vscode/repos/instructions": true
        }
      ]
    },
    [PromptsConfig.PROMPT_LOCATIONS_KEY]: {
      type: "object",
      title: nls.localize("chat.reusablePrompts.config.locations.title", "Prompt File Locations"),
      markdownDescription: nls.localize("chat.reusablePrompts.config.locations.description", "Specify location(s) of reusable prompt files (`*{0}`) that can be run in Chat, Edits, and Inline Chat sessions. [Learn More]({1}).\n\nRelative paths are resolved from the root folder(s) of your workspace.", PROMPT_FILE_EXTENSION, PROMPT_DOCUMENTATION_URL),
      default: {
        [PROMPT_DEFAULT_SOURCE_FOLDER]: true
      },
      additionalProperties: { type: "boolean" },
      unevaluatedProperties: { type: "boolean" },
      restricted: true,
      tags: ["experimental", "prompts", "reusable prompts", "prompt snippets", "instructions"],
      examples: [
        {
          [PROMPT_DEFAULT_SOURCE_FOLDER]: true
        },
        {
          [PROMPT_DEFAULT_SOURCE_FOLDER]: true,
          "/Users/vscode/repos/prompts": true
        }
      ]
    }
  }
});
Registry.as(EditorExtensions.EditorPane).registerEditorPane(EditorPaneDescriptor.create(ChatEditor, ChatEditorInput.EditorID, nls.localize("chat", "Chat")), [
  new SyncDescriptor(ChatEditorInput)
]);
Registry.as(Extensions.ConfigurationMigration).registerConfigurationMigrations([
  {
    key: "chat.experimental.detectParticipant.enabled",
    migrateFn: /* @__PURE__ */ __name((value, _accessor) => [
      ["chat.experimental.detectParticipant.enabled", { value: void 0 }],
      ["chat.detectParticipant.enabled", { value: value !== false }]
    ], "migrateFn")
  }
]);
let ChatResolverContribution = class ChatResolverContribution2 extends Disposable {
  static {
    __name(this, "ChatResolverContribution");
  }
  static {
    this.ID = "workbench.contrib.chatResolver";
  }
  constructor(editorResolverService, instantiationService) {
    super();
    this._register(editorResolverService.registerEditor(`${Schemas.vscodeChatSesssion}:**/**`, {
      id: ChatEditorInput.EditorID,
      label: nls.localize("chat", "Chat"),
      priority: RegisteredEditorPriority.builtin
    }, {
      singlePerResource: true,
      canSupportResource: /* @__PURE__ */ __name((resource) => resource.scheme === Schemas.vscodeChatSesssion, "canSupportResource")
    }, {
      createEditorInput: /* @__PURE__ */ __name(({ resource, options }) => {
        return { editor: instantiationService.createInstance(ChatEditorInput, resource, options), options };
      }, "createEditorInput")
    }));
  }
};
ChatResolverContribution = __decorate([
  __param(0, IEditorResolverService),
  __param(1, IInstantiationService)
], ChatResolverContribution);
let ChatAgentSettingContribution = class ChatAgentSettingContribution2 extends Disposable {
  static {
    __name(this, "ChatAgentSettingContribution");
  }
  static {
    this.ID = "workbench.contrib.chatAgentSetting";
  }
  constructor(experimentService, entitlementService) {
    super();
    this.experimentService = experimentService;
    this.entitlementService = entitlementService;
    this.registerMaxRequestsSetting();
  }
  registerMaxRequestsSetting() {
    let lastNode;
    const registerMaxRequestsSetting = /* @__PURE__ */ __name(() => {
      const treatmentId = this.entitlementService.entitlement === ChatEntitlement.Limited ? "chatAgentMaxRequestsFree" : "chatAgentMaxRequestsPro";
      this.experimentService.getTreatment(treatmentId).then((value) => {
        const defaultValue = value ?? (this.entitlementService.entitlement === ChatEntitlement.Limited ? 5 : 15);
        const node = {
          id: "chatSidebar",
          title: nls.localize("interactiveSessionConfigurationTitle", "Chat"),
          type: "object",
          properties: {
            "chat.agent.maxRequests": {
              type: "number",
              markdownDescription: nls.localize("chat.agent.maxRequests", "The maximum number of requests to allow Copilot Edits to use per-turn in agent mode. When the limit is reached, Copilot will ask the user to confirm that it should keep working. \n\n> **Note**: For users on the Copilot Free plan, note that each agent mode request currently uses one chat request."),
              default: defaultValue
            }
          }
        };
        configurationRegistry.updateConfigurations({ remove: lastNode ? [lastNode] : [], add: [node] });
        lastNode = node;
      });
    }, "registerMaxRequestsSetting");
    this._register(Event.runAndSubscribe(Event.debounce(this.entitlementService.onDidChangeEntitlement, () => {
    }, 1e3), () => registerMaxRequestsSetting()));
  }
};
ChatAgentSettingContribution = __decorate([
  __param(0, IWorkbenchAssignmentService),
  __param(1, IChatEntitlementService)
], ChatAgentSettingContribution);
AccessibleViewRegistry.register(new ChatResponseAccessibleView());
AccessibleViewRegistry.register(new PanelChatAccessibilityHelp());
AccessibleViewRegistry.register(new QuickChatAccessibilityHelp());
AccessibleViewRegistry.register(new EditsChatAccessibilityHelp());
AccessibleViewRegistry.register(new AgentChatAccessibilityHelp());
registerEditorFeature(ChatInputBoxContentProvider);
let ChatSlashStaticSlashCommandsContribution = class ChatSlashStaticSlashCommandsContribution2 extends Disposable {
  static {
    __name(this, "ChatSlashStaticSlashCommandsContribution");
  }
  static {
    this.ID = "workbench.contrib.chatSlashStaticSlashCommands";
  }
  constructor(slashCommandService, commandService, chatAgentService, chatWidgetService, instantiationService) {
    super();
    this._store.add(slashCommandService.registerSlashCommand({
      command: "clear",
      detail: nls.localize("clear", "Start a new chat"),
      sortText: "z2_clear",
      executeImmediately: true,
      locations: [ChatAgentLocation.Panel]
    }, async () => {
      commandService.executeCommand(ACTION_ID_NEW_CHAT);
    }));
    this._store.add(slashCommandService.registerSlashCommand({
      command: SAVE_TO_PROMPT_SLASH_COMMAND_NAME,
      detail: nls.localize("save-chat-to-prompt-file", "Save chat to a prompt file"),
      sortText: `z3_${SAVE_TO_PROMPT_SLASH_COMMAND_NAME}`,
      executeImmediately: true,
      silent: true,
      locations: [ChatAgentLocation.Panel]
    }, async () => {
      const { lastFocusedWidget } = chatWidgetService;
      assertDefined(lastFocusedWidget, "No currently active chat widget found.");
      runSaveToPromptAction({ chat: lastFocusedWidget }, commandService);
    }));
    this._store.add(slashCommandService.registerSlashCommand({
      command: "help",
      detail: "",
      sortText: "z1_help",
      executeImmediately: true,
      locations: [ChatAgentLocation.Panel],
      modes: [ChatMode.Ask]
    }, async (prompt, progress) => {
      const defaultAgent = chatAgentService.getDefaultAgent(ChatAgentLocation.Panel);
      const agents = chatAgentService.getAgents();
      if (defaultAgent?.metadata.helpTextPrefix) {
        if (isMarkdownString(defaultAgent.metadata.helpTextPrefix)) {
          progress.report({ content: defaultAgent.metadata.helpTextPrefix, kind: "markdownContent" });
        } else {
          progress.report({ content: new MarkdownString(defaultAgent.metadata.helpTextPrefix), kind: "markdownContent" });
        }
        progress.report({ content: new MarkdownString("\n\n"), kind: "markdownContent" });
      }
      const agentText = (await Promise.all(agents.filter((a) => a.id !== defaultAgent?.id && !a.isCore).filter((a) => a.locations.includes(ChatAgentLocation.Panel)).map(async (a) => {
        const description = a.description ? `- ${a.description}` : "";
        const agentMarkdown = instantiationService.invokeFunction((accessor) => agentToMarkdown(a, true, accessor));
        const agentLine = `- ${agentMarkdown} ${description}`;
        const commandText = a.slashCommands.map((c) => {
          const description2 = c.description ? `- ${c.description}` : "";
          return `	* ${agentSlashCommandToMarkdown(a, c)} ${description2}`;
        }).join("\n");
        return (agentLine + "\n" + commandText).trim();
      }))).join("\n");
      progress.report({ content: new MarkdownString(agentText, { isTrusted: { enabledCommands: [ChatSubmitAction.ID] } }), kind: "markdownContent" });
      if (defaultAgent?.metadata.helpTextVariablesPrefix) {
        progress.report({ content: new MarkdownString("\n\n"), kind: "markdownContent" });
        if (isMarkdownString(defaultAgent.metadata.helpTextVariablesPrefix)) {
          progress.report({ content: defaultAgent.metadata.helpTextVariablesPrefix, kind: "markdownContent" });
        } else {
          progress.report({ content: new MarkdownString(defaultAgent.metadata.helpTextVariablesPrefix), kind: "markdownContent" });
        }
        const variables = [
          { name: "file", description: nls.localize("file", "Choose a file in the workspace") }
        ];
        const variableText = variables.map((v) => `* \`${chatVariableLeader}${v.name}\` - ${v.description}`).join("\n");
        progress.report({ content: new MarkdownString("\n" + variableText), kind: "markdownContent" });
      }
      if (defaultAgent?.metadata.helpTextPostfix) {
        progress.report({ content: new MarkdownString("\n\n"), kind: "markdownContent" });
        if (isMarkdownString(defaultAgent.metadata.helpTextPostfix)) {
          progress.report({ content: defaultAgent.metadata.helpTextPostfix, kind: "markdownContent" });
        } else {
          progress.report({ content: new MarkdownString(defaultAgent.metadata.helpTextPostfix), kind: "markdownContent" });
        }
      }
      await timeout(200);
    }));
  }
};
ChatSlashStaticSlashCommandsContribution = __decorate([
  __param(0, IChatSlashCommandService),
  __param(1, ICommandService),
  __param(2, IChatAgentService),
  __param(3, IChatWidgetService),
  __param(4, IInstantiationService)
], ChatSlashStaticSlashCommandsContribution);
Registry.as(EditorExtensions.EditorFactory).registerEditorSerializer(ChatEditorInput.TypeID, ChatEditorInputSerializer);
registerWorkbenchContribution2(
  ChatResolverContribution.ID,
  ChatResolverContribution,
  1
  /* WorkbenchPhase.BlockStartup */
);
registerWorkbenchContribution2(
  ChatSlashStaticSlashCommandsContribution.ID,
  ChatSlashStaticSlashCommandsContribution,
  4
  /* WorkbenchPhase.Eventually */
);
registerWorkbenchContribution2(
  ChatExtensionPointHandler.ID,
  ChatExtensionPointHandler,
  1
  /* WorkbenchPhase.BlockStartup */
);
registerWorkbenchContribution2(
  LanguageModelToolsExtensionPointHandler.ID,
  LanguageModelToolsExtensionPointHandler,
  2
  /* WorkbenchPhase.BlockRestore */
);
registerWorkbenchContribution2(
  ChatCompatibilityNotifier.ID,
  ChatCompatibilityNotifier,
  4
  /* WorkbenchPhase.Eventually */
);
registerWorkbenchContribution2(
  CopilotTitleBarMenuRendering.ID,
  CopilotTitleBarMenuRendering,
  2
  /* WorkbenchPhase.BlockRestore */
);
registerWorkbenchContribution2(
  CodeBlockActionRendering.ID,
  CodeBlockActionRendering,
  2
  /* WorkbenchPhase.BlockRestore */
);
registerWorkbenchContribution2(
  ChatImplicitContextContribution.ID,
  ChatImplicitContextContribution,
  4
  /* WorkbenchPhase.Eventually */
);
registerWorkbenchContribution2(
  ChatRelatedFilesContribution.ID,
  ChatRelatedFilesContribution,
  4
  /* WorkbenchPhase.Eventually */
);
registerWorkbenchContribution2(
  ChatViewsWelcomeHandler.ID,
  ChatViewsWelcomeHandler,
  1
  /* WorkbenchPhase.BlockStartup */
);
registerWorkbenchContribution2(
  ChatGettingStartedContribution.ID,
  ChatGettingStartedContribution,
  4
  /* WorkbenchPhase.Eventually */
);
registerWorkbenchContribution2(
  ChatSetupContribution.ID,
  ChatSetupContribution,
  2
  /* WorkbenchPhase.BlockRestore */
);
registerWorkbenchContribution2(
  ChatStatusBarEntry.ID,
  ChatStatusBarEntry,
  2
  /* WorkbenchPhase.BlockRestore */
);
registerWorkbenchContribution2(
  BuiltinToolsContribution.ID,
  BuiltinToolsContribution,
  4
  /* WorkbenchPhase.Eventually */
);
registerWorkbenchContribution2(
  ChatAgentSettingContribution.ID,
  ChatAgentSettingContribution,
  3
  /* WorkbenchPhase.AfterRestored */
);
registerWorkbenchContribution2(
  ChatEditingEditorAccessibility.ID,
  ChatEditingEditorAccessibility,
  3
  /* WorkbenchPhase.AfterRestored */
);
registerWorkbenchContribution2(
  ChatEditingEditorOverlay.ID,
  ChatEditingEditorOverlay,
  3
  /* WorkbenchPhase.AfterRestored */
);
registerWorkbenchContribution2(
  SimpleBrowserOverlay.ID,
  SimpleBrowserOverlay,
  3
  /* WorkbenchPhase.AfterRestored */
);
registerWorkbenchContribution2(
  ChatEditingEditorContextKeys.ID,
  ChatEditingEditorContextKeys,
  3
  /* WorkbenchPhase.AfterRestored */
);
registerWorkbenchContribution2(
  ChatTransferContribution.ID,
  ChatTransferContribution,
  2
  /* WorkbenchPhase.BlockRestore */
);
registerChatActions();
registerChatCopyActions();
registerChatCodeBlockActions();
registerChatCodeCompareBlockActions();
registerChatFileTreeActions();
registerChatTitleActions();
registerChatExecuteActions();
registerQuickChatActions();
registerChatExportActions();
registerMoveActions();
registerNewChatActions();
registerChatContextActions();
registerChatDeveloperActions();
registerChatEditorActions();
registerChatToolActions();
registerEditorFeature(ChatPasteProvidersFeature);
registerSingleton(
  IChatTransferService,
  ChatTransferService,
  1
  /* InstantiationType.Delayed */
);
registerSingleton(
  IChatService,
  ChatService,
  1
  /* InstantiationType.Delayed */
);
registerSingleton(
  IChatWidgetService,
  ChatWidgetService,
  1
  /* InstantiationType.Delayed */
);
registerSingleton(
  IQuickChatService,
  QuickChatService,
  1
  /* InstantiationType.Delayed */
);
registerSingleton(
  IChatAccessibilityService,
  ChatAccessibilityService,
  1
  /* InstantiationType.Delayed */
);
registerSingleton(
  IChatWidgetHistoryService,
  ChatWidgetHistoryService,
  1
  /* InstantiationType.Delayed */
);
registerSingleton(
  ILanguageModelsService,
  LanguageModelsService,
  1
  /* InstantiationType.Delayed */
);
registerSingleton(
  ILanguageModelStatsService,
  LanguageModelStatsService,
  1
  /* InstantiationType.Delayed */
);
registerSingleton(
  IChatSlashCommandService,
  ChatSlashCommandService,
  1
  /* InstantiationType.Delayed */
);
registerSingleton(
  IChatAgentService,
  ChatAgentService,
  1
  /* InstantiationType.Delayed */
);
registerSingleton(
  IChatAgentNameService,
  ChatAgentNameService,
  1
  /* InstantiationType.Delayed */
);
registerSingleton(
  IChatVariablesService,
  ChatVariablesService,
  1
  /* InstantiationType.Delayed */
);
registerSingleton(
  ILanguageModelToolsService,
  LanguageModelToolsService,
  1
  /* InstantiationType.Delayed */
);
registerSingleton(
  IVoiceChatService,
  VoiceChatService,
  1
  /* InstantiationType.Delayed */
);
registerSingleton(
  IChatCodeBlockContextProviderService,
  ChatCodeBlockContextProviderService,
  1
  /* InstantiationType.Delayed */
);
registerSingleton(
  ICodeMapperService,
  CodeMapperService,
  1
  /* InstantiationType.Delayed */
);
registerSingleton(
  IChatEditingService,
  ChatEditingService,
  1
  /* InstantiationType.Delayed */
);
registerSingleton(
  IChatMarkdownAnchorService,
  ChatMarkdownAnchorService,
  1
  /* InstantiationType.Delayed */
);
registerSingleton(
  ILanguageModelIgnoredFilesService,
  LanguageModelIgnoredFilesService,
  1
  /* InstantiationType.Delayed */
);
registerSingleton(
  IChatEntitlementService,
  ChatEntitlementService,
  1
  /* InstantiationType.Delayed */
);
registerSingleton(
  IPromptsService,
  PromptsService,
  1
  /* InstantiationType.Delayed */
);
registerWorkbenchContribution2(
  ChatEditingNotebookFileSystemProviderContrib.ID,
  ChatEditingNotebookFileSystemProviderContrib,
  1
  /* WorkbenchPhase.BlockStartup */
);
registerPromptFileContributions();
//# sourceMappingURL=chat.contribution.js.map
