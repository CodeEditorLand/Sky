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
var ChatContinueInSessionActionItem_1;
import { Codicon } from "../../../../../base/common/codicons.js";
import { h } from "../../../../../base/browser/dom.js";
import { Disposable, markAsSingleton } from "../../../../../base/common/lifecycle.js";
import { Schemas } from "../../../../../base/common/network.js";
import { isAbsolute } from "../../../../../base/common/path.js";
import { basename } from "../../../../../base/common/resources.js";
import { ThemeIcon } from "../../../../../base/common/themables.js";
import { URI } from "../../../../../base/common/uri.js";
import { isITextModel } from "../../../../../editor/common/model.js";
import { localize, localize2 } from "../../../../../nls.js";
import { ActionWidgetDropdownActionViewItem } from "../../../../../platform/actions/browser/actionWidgetDropdownActionViewItem.js";
import { IActionViewItemService } from "../../../../../platform/actions/browser/actionViewItemService.js";
import { Action2, MenuId, MenuItemAction } from "../../../../../platform/actions/common/actions.js";
import { IActionWidgetService } from "../../../../../platform/actionWidget/browser/actionWidget.js";
import { ICommandService } from "../../../../../platform/commands/common/commands.js";
import { ContextKeyExpr, IContextKeyService } from "../../../../../platform/contextkey/common/contextkey.js";
import { IInstantiationService } from "../../../../../platform/instantiation/common/instantiation.js";
import { IKeybindingService } from "../../../../../platform/keybinding/common/keybinding.js";
import { ITelemetryService } from "../../../../../platform/telemetry/common/telemetry.js";
import { IOpenerService } from "../../../../../platform/opener/common/opener.js";
import { IsSessionsWindowContext, ResourceContextKey } from "../../../../common/contextkeys.js";
import { IEditorService } from "../../../../services/editor/common/editorService.js";
import { IFileService } from "../../../../../platform/files/common/files.js";
import { IChatAgentService } from "../../common/participants/chatAgents.js";
import { ChatContextKeys } from "../../common/actions/chatContextKeys.js";
import { chatEditingWidgetFileStateContextKey } from "../../common/editing/chatEditingService.js";
import { ChatRequestParser } from "../../common/requestParser/chatRequestParser.js";
import { getDynamicVariablesForWidget, getSelectedToolAndToolSetsForWidget } from "../attachments/chatVariables.js";
import { ChatSendResult, IChatService } from "../../common/chatService/chatService.js";
import { IChatSessionsService } from "../../common/chatSessionsService.js";
import { ChatAgentLocation } from "../../common/constants.js";
import { PROMPT_LANGUAGE_ID } from "../../common/promptSyntax/promptTypes.js";
import { AgentSessionProviders, getAgentSessionProvider, getAgentSessionProviderIcon, getAgentSessionProviderName } from "../agentSessions/agentSessions.js";
import { IAgentSessionsService } from "../agentSessions/agentSessionsService.js";
import { IChatWidgetService, isIChatViewViewContext } from "../chat.js";
import { ctxHasEditorModification } from "../chatEditing/chatEditingEditorContextKeys.js";
import { CHAT_SETUP_ACTION_ID } from "./chatActions.js";
import { PromptFileVariableKind, toPromptFileVariableEntry } from "../../common/attachments/chatVariableEntries.js";
function extractNwoFromRemoteUrl(remoteUrl) {
  const match = remoteUrl.match(/(?:github\.com)[/:](?<owner>[^/]+)\/(?<repo>[^/.]+)/);
  if (match?.groups) {
    return `${match.groups.owner}/${match.groups.repo}`;
  }
  return void 0;
}
__name(extractNwoFromRemoteUrl, "extractNwoFromRemoteUrl");
async function resolveGitRemoteNwo(repoPath, fileService) {
  try {
    const gitPath = `${repoPath}/.git`;
    const gitUri = URI.file(gitPath);
    let configUri;
    try {
      const stat = await fileService.stat(gitUri);
      if (stat.isDirectory) {
        configUri = URI.file(`${gitPath}/config`);
      } else {
        const gitFile = await fileService.readFile(gitUri);
        const gitDir = gitFile.value.toString().trim().replace(/^gitdir:\s*/, "");
        const resolvedGitDir = gitDir.startsWith("/") ? gitDir : `${repoPath}/${gitDir}`;
        const commonDir = resolvedGitDir.replace(/\/worktrees\/[^/]+$/, "");
        configUri = URI.file(`${commonDir}/config`);
      }
    } catch {
      return void 0;
    }
    const content = await fileService.readFile(configUri);
    const configText = content.value.toString();
    const remoteMatch = configText.match(/\[remote\s+"origin"\][^[]*url\s*=\s*(.+)/m);
    if (remoteMatch?.[1]) {
      return extractNwoFromRemoteUrl(remoteMatch[1].trim());
    }
  } catch {
  }
  return void 0;
}
__name(resolveGitRemoteNwo, "resolveGitRemoteNwo");
var ActionLocation;
(function(ActionLocation2) {
  ActionLocation2["ChatWidget"] = "chatWidget";
  ActionLocation2["Editor"] = "editor";
})(ActionLocation || (ActionLocation = {}));
class ContinueChatInSessionAction extends Action2 {
  static {
    __name(this, "ContinueChatInSessionAction");
  }
  static {
    this.ID = "workbench.action.chat.continueChatInSession";
  }
  constructor() {
    super({
      id: ContinueChatInSessionAction.ID,
      title: localize2("continueChatInSession", "Continue Chat in..."),
      tooltip: localize("continueChatInSession", "Continue Chat in..."),
      precondition: ContextKeyExpr.and(ChatContextKeys.enabled, ChatContextKeys.requestInProgress.negate(), ChatContextKeys.remoteJobCreating.negate(), ChatContextKeys.hasCanDelegateProviders),
      menu: [
        {
          id: MenuId.ChatExecute,
          group: "navigation",
          order: 3.4,
          when: ContextKeyExpr.and(ChatContextKeys.lockedToCodingAgent.negate(), ChatContextKeys.hasCanDelegateProviders)
        },
        {
          id: MenuId.EditorContent,
          group: "continueIn",
          when: ContextKeyExpr.and(ContextKeyExpr.equals(ResourceContextKey.Scheme.key, Schemas.untitled), ContextKeyExpr.equals(ResourceContextKey.LangId.key, PROMPT_LANGUAGE_ID), ContextKeyExpr.notEquals(
            chatEditingWidgetFileStateContextKey.key,
            0
            /* ModifiedFileEntryState.Modified */
          ), ctxHasEditorModification.negate(), ChatContextKeys.hasCanDelegateProviders)
        }
      ]
    });
  }
  async run() {
  }
}
let ChatContinueInSessionActionItem = ChatContinueInSessionActionItem_1 = class ChatContinueInSessionActionItem2 extends ActionWidgetDropdownActionViewItem {
  static {
    __name(this, "ChatContinueInSessionActionItem");
  }
  constructor(action, location, actionWidgetService, contextKeyService, keybindingService, chatSessionsService, instantiationService, openerService, telemetryService) {
    super(action, {
      actionProvider: ChatContinueInSessionActionItem_1.actionProvider(chatSessionsService, instantiationService, location),
      actionBarActions: ChatContinueInSessionActionItem_1.getActionBarActions(openerService),
      reporter: { id: "ChatContinueInSession", name: "ChatContinueInSession", includeOptions: true }
    }, actionWidgetService, keybindingService, contextKeyService, telemetryService);
    this.location = location;
    this.contextKeyService = contextKeyService;
  }
  static getActionBarActions(openerService) {
    const learnMoreUrl = "https://aka.ms/vscode-continue-chat-in";
    return [{
      id: "workbench.action.chat.continueChatInSession.learnMore",
      label: localize("chat.learnMore", "Learn More"),
      tooltip: localize("chat.learnMore", "Learn More"),
      class: void 0,
      enabled: true,
      run: /* @__PURE__ */ __name(async () => {
        await openerService.open(URI.parse(learnMoreUrl));
      }, "run")
    }];
  }
  static actionProvider(chatSessionsService, instantiationService, location) {
    return {
      getActions: /* @__PURE__ */ __name(() => {
        const actions = [];
        const contributions = chatSessionsService.getAllChatSessionContributions();
        const backgroundContrib = contributions.find((contrib) => contrib.type === AgentSessionProviders.Background);
        if (backgroundContrib && backgroundContrib.canDelegate) {
          actions.push(this.toAction(AgentSessionProviders.Background, backgroundContrib, instantiationService, location));
        }
        const cloudContrib = contributions.find((contrib) => contrib.type === AgentSessionProviders.Cloud);
        if (cloudContrib && cloudContrib.canDelegate) {
          actions.push(this.toAction(AgentSessionProviders.Cloud, cloudContrib, instantiationService, location));
        }
        if (actions.length === 0) {
          actions.push(this.toSetupAction(AgentSessionProviders.Background, instantiationService));
          actions.push(this.toSetupAction(AgentSessionProviders.Cloud, instantiationService));
        }
        return actions;
      }, "getActions")
    };
  }
  static toAction(provider, contrib, instantiationService, location) {
    return {
      id: contrib.type,
      enabled: true,
      icon: getAgentSessionProviderIcon(provider),
      class: void 0,
      description: `@${contrib.name}`,
      label: getAgentSessionProviderName(provider),
      tooltip: localize("continueSessionIn", "Continue in {0}", getAgentSessionProviderName(provider)),
      category: { label: localize("continueIn", "Continue In"), order: 0, showHeader: true },
      run: /* @__PURE__ */ __name(() => instantiationService.invokeFunction((accessor) => {
        if (location === "editor") {
          return new CreateRemoteAgentJobFromEditorAction().run(accessor, contrib);
        }
        return new CreateRemoteAgentJobAction().run(accessor, contrib);
      }), "run")
    };
  }
  static toSetupAction(provider, instantiationService) {
    return {
      id: provider,
      enabled: true,
      icon: getAgentSessionProviderIcon(provider),
      class: void 0,
      label: getAgentSessionProviderName(provider),
      tooltip: localize("continueSessionIn", "Continue in {0}", getAgentSessionProviderName(provider)),
      category: { label: localize("continueIn", "Continue In"), order: 0, showHeader: true },
      run: /* @__PURE__ */ __name(() => instantiationService.invokeFunction((accessor) => {
        const commandService = accessor.get(ICommandService);
        return commandService.executeCommand(CHAT_SETUP_ACTION_ID);
      }), "run")
    };
  }
  renderLabel(element) {
    if (this.location === "editor") {
      const view = h("span.action-widget-delegate-label", [
        h("span", { className: ThemeIcon.asClassName(Codicon.forward) }),
        h("span", [localize("continueInEllipsis", "Continue in...")])
      ]);
      element.appendChild(view.root);
      return null;
    } else {
      const icon = this.contextKeyService.contextMatchesRules(ChatContextKeys.remoteJobCreating) ? Codicon.sync : Codicon.forward;
      element.classList.add(...ThemeIcon.asClassNameArray(icon));
      return super.renderLabel(element);
    }
  }
};
ChatContinueInSessionActionItem = ChatContinueInSessionActionItem_1 = __decorate([
  __param(2, IActionWidgetService),
  __param(3, IContextKeyService),
  __param(4, IKeybindingService),
  __param(5, IChatSessionsService),
  __param(6, IInstantiationService),
  __param(7, IOpenerService),
  __param(8, ITelemetryService)
], ChatContinueInSessionActionItem);
const NEW_CHAT_SESSION_ACTION_ID = "workbench.action.chat.openNewSessionEditor";
class CreateRemoteAgentJobAction {
  static {
    __name(this, "CreateRemoteAgentJobAction");
  }
  constructor() {
  }
  openUntitledEditor(commandService, continuationTarget) {
    commandService.executeCommand(`${NEW_CHAT_SESSION_ACTION_ID}.${continuationTarget.type}`);
  }
  /**
   * Extracts the GitHub "owner/repo" NWO from the source session by checking
   * multiple data sources: chat model repoData, session metadata, and session options.
   */
  async extractRepoNwoFromSession(agentSessionsService, chatSessionsService, fileService, sessionResource, chatModel) {
    const repoData = chatModel.repoData;
    if (repoData?.remoteUrl) {
      const nwo = extractNwoFromRemoteUrl(repoData.remoteUrl);
      if (nwo) {
        return nwo;
      }
    }
    const agentSession = agentSessionsService.getSession(sessionResource);
    if (agentSession?.metadata) {
      const metadata = agentSession.metadata;
      const owner = metadata.owner;
      const name = metadata.name;
      if (owner && name) {
        return `${owner}/${name}`;
      }
      const repositoryNwo = metadata.repositoryNwo;
      if (repositoryNwo?.includes("/")) {
        return repositoryNwo;
      }
      const repositoryUrl = metadata.repositoryUrl;
      if (repositoryUrl) {
        const nwo = extractNwoFromRemoteUrl(repositoryUrl);
        if (nwo) {
          return nwo;
        }
      }
      const workingDir = metadata.workingDirectoryPath ?? metadata.repositoryPath ?? metadata.worktreePath;
      if (workingDir) {
        const nwo = await resolveGitRemoteNwo(workingDir, fileService);
        if (nwo) {
          return nwo;
        }
      }
    }
    for (const optionId of ["repositories", "repository"]) {
      const repoOption = chatSessionsService.getSessionOption(sessionResource, optionId);
      if (repoOption) {
        const optionValue = typeof repoOption === "string" ? repoOption : repoOption.id;
        if (optionValue) {
          const segments = optionValue.split("/").filter(Boolean);
          if (segments.length === 2) {
            return optionValue;
          }
          const nwo = extractNwoFromRemoteUrl(optionValue);
          if (nwo) {
            return nwo;
          }
          try {
            const uri = URI.parse(optionValue);
            if (uri.authority === "github") {
              const parts = uri.path.split("/").filter(Boolean);
              if (parts.length >= 2) {
                return `${parts[0]}/${parts[1]}`;
              }
            }
          } catch {
          }
          if (isAbsolute(optionValue)) {
            const nwoFromGit = await resolveGitRemoteNwo(optionValue, fileService);
            if (nwoFromGit) {
              return nwoFromGit;
            }
          }
        }
      }
    }
    return void 0;
  }
  async run(accessor, continuationTarget, _widget) {
    const contextKeyService = accessor.get(IContextKeyService);
    const commandService = accessor.get(ICommandService);
    const widgetService = accessor.get(IChatWidgetService);
    const chatAgentService = accessor.get(IChatAgentService);
    const chatService = accessor.get(IChatService);
    const editorService = accessor.get(IEditorService);
    const agentSessionsService = accessor.get(IAgentSessionsService);
    const chatSessionsService = accessor.get(IChatSessionsService);
    const fileService = accessor.get(IFileService);
    const remoteJobCreatingKey = ChatContextKeys.remoteJobCreating.bindTo(contextKeyService);
    try {
      remoteJobCreatingKey.set(true);
      const widget = _widget ?? widgetService.lastFocusedWidget;
      if (!widget || !widget.viewModel) {
        return this.openUntitledEditor(commandService, continuationTarget);
      }
      const chatModel = widget.viewModel.model;
      if (!chatModel) {
        return;
      }
      const sessionResource = widget.viewModel.sessionResource;
      const chatRequests = chatModel.getRequests();
      let userPrompt = widget.getInput();
      if (!userPrompt) {
        if (!chatRequests.length) {
          return this.openUntitledEditor(commandService, continuationTarget);
        }
        userPrompt = "implement this.";
      }
      const attachedContext = widget.input.getAttachedAndImplicitContext();
      widget.input.acceptInput(true);
      if (widget.location === ChatAgentLocation.EditorInline) {
        const activeEditor = editorService.activeTextEditorControl;
        if (activeEditor) {
          const model = activeEditor.getModel();
          let activeEditorUri = void 0;
          if (model && isITextModel(model)) {
            activeEditorUri = model.uri;
          }
          const selection = activeEditor.getSelection();
          if (activeEditorUri && selection) {
            attachedContext.add({
              kind: "file",
              id: "vscode.implicit.selection",
              name: basename(activeEditorUri),
              value: {
                uri: activeEditorUri,
                range: selection
              }
            });
          }
        }
      }
      const continuationTargetType = continuationTarget.type;
      const isSessionsWindow = IsSessionsWindowContext.getValue(contextKeyService);
      const sourceProvider = getAgentSessionProvider(sessionResource);
      if (isSessionsWindow && sourceProvider && sourceProvider !== continuationTargetType) {
        const isSidebar = isIChatViewViewContext(widget.viewContext);
        const actionId = isSidebar ? `workbench.action.chat.openNewSessionSidebar.${continuationTargetType}` : `${NEW_CHAT_SESSION_ACTION_ID}.${continuationTargetType}`;
        const maxTranscriptLength = 2e4;
        let transcript = chatRequests.map((req) => {
          const userMsg = `User: ${req.message.text}`;
          const respMsg = req.response?.response ? `Assistant: ${req.response.response.getMarkdown()}` : "";
          return respMsg ? `${userMsg}
${respMsg}` : userMsg;
        }).join("\n\n");
        if (transcript.length > maxTranscriptLength) {
          transcript = transcript.substring(transcript.length - maxTranscriptLength);
        }
        const delegationPrompt = transcript ? `The following is the conversation history from a previous ${getAgentSessionProviderName(sourceProvider)} session. Continue working on it.

${transcript}

User: ${userPrompt}` : userPrompt;
        const initialSessionOptions = [];
        const repoNwo = await this.extractRepoNwoFromSession(agentSessionsService, chatSessionsService, fileService, sessionResource, chatModel);
        if (repoNwo) {
          initialSessionOptions.push({ optionId: "repositories", value: repoNwo });
        }
        await commandService.executeCommand(actionId, {
          prompt: delegationPrompt,
          attachedContext: attachedContext.asArray(),
          initialSessionOptions: initialSessionOptions.length > 0 ? initialSessionOptions : void 0
        });
        return;
      }
      const defaultAgent = chatAgentService.getDefaultAgent(ChatAgentLocation.Chat);
      const instantiationService = accessor.get(IInstantiationService);
      const requestParser = instantiationService.createInstance(ChatRequestParser);
      const parsedRequest = requestParser.parseChatRequestWithReferences(getDynamicVariablesForWidget(widget), getSelectedToolAndToolSetsForWidget(widget), userPrompt, ChatAgentLocation.Chat);
      const addedRequest = chatModel.addRequest(parsedRequest, { variables: attachedContext.asArray() }, 0, void 0, defaultAgent);
      await chatService.removeRequest(sessionResource, addedRequest.id);
      const sendResult = await chatService.sendRequest(sessionResource, userPrompt, {
        agentIdSilent: continuationTargetType,
        attachedContext: attachedContext.asArray(),
        userSelectedModelId: widget.input.currentLanguageModel,
        ...widget.getModeRequestOptions()
      });
      if (ChatSendResult.isSent(sendResult)) {
        await widget.handleDelegationExitIfNeeded(defaultAgent, sendResult.data.agent);
      }
    } catch (e) {
      console.error("[Delegation] Error creating remote coding agent job", e);
      throw e;
    } finally {
      remoteJobCreatingKey.set(false);
    }
  }
}
class CreateRemoteAgentJobFromEditorAction {
  static {
    __name(this, "CreateRemoteAgentJobFromEditorAction");
  }
  constructor() {
  }
  async run(accessor, continuationTarget) {
    try {
      const editorService = accessor.get(IEditorService);
      const activeEditor = editorService.activeTextEditorControl;
      const commandService = accessor.get(ICommandService);
      if (!activeEditor) {
        return;
      }
      const model = activeEditor.getModel();
      if (!model || !isITextModel(model)) {
        return;
      }
      const uri = model.uri;
      const attachedContext = [toPromptFileVariableEntry(uri, PromptFileVariableKind.PromptFile, void 0, false, [])];
      const prompt = `Follow instructions in [${basename(uri)}](${uri.toString()}).`;
      await commandService.executeCommand(`${NEW_CHAT_SESSION_ACTION_ID}.${continuationTarget.type}`, { prompt, attachedContext });
    } catch (e) {
      console.error("Error creating remote agent job from editor", e);
      throw e;
    }
  }
}
let ContinueChatInSessionActionRendering = class ContinueChatInSessionActionRendering2 extends Disposable {
  static {
    __name(this, "ContinueChatInSessionActionRendering");
  }
  static {
    this.ID = "chat.continueChatInSessionActionRendering";
  }
  constructor(actionViewItemService, instantiationService) {
    super();
    const disposable = actionViewItemService.register(MenuId.EditorContent, ContinueChatInSessionAction.ID, (action, options, instantiationService2) => {
      if (!(action instanceof MenuItemAction)) {
        return void 0;
      }
      return instantiationService.createInstance(
        ChatContinueInSessionActionItem,
        action,
        "editor"
        /* ActionLocation.Editor */
      );
    });
    markAsSingleton(disposable);
  }
};
ContinueChatInSessionActionRendering = __decorate([
  __param(0, IActionViewItemService),
  __param(1, IInstantiationService)
], ContinueChatInSessionActionRendering);
export {
  ActionLocation,
  ChatContinueInSessionActionItem,
  ContinueChatInSessionAction,
  ContinueChatInSessionActionRendering,
  CreateRemoteAgentJobAction
};
//# sourceMappingURL=chatContinueInAction.js.map
