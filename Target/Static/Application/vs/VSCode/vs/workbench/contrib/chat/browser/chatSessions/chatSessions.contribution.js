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
import { sep } from "../../../../../base/common/path.js";
import { AsyncIterableProducer, raceCancellationError } from "../../../../../base/common/async.js";
import { CancellationToken, CancellationTokenSource } from "../../../../../base/common/cancellation.js";
import { Codicon } from "../../../../../base/common/codicons.js";
import { AsyncEmitter, Emitter, Event } from "../../../../../base/common/event.js";
import { combinedDisposable, Disposable, DisposableMap, DisposableStore } from "../../../../../base/common/lifecycle.js";
import { ResourceMap, ResourceSet } from "../../../../../base/common/map.js";
import { Schemas } from "../../../../../base/common/network.js";
import * as resources from "../../../../../base/common/resources.js";
import { ThemeIcon } from "../../../../../base/common/themables.js";
import { URI } from "../../../../../base/common/uri.js";
import { generateUuid } from "../../../../../base/common/uuid.js";
import { localize, localize2 } from "../../../../../nls.js";
import { Action2, IMenuService, MenuId, MenuItemAction, MenuRegistry, registerAction2 } from "../../../../../platform/actions/common/actions.js";
import { ContextKeyExpr, IContextKeyService } from "../../../../../platform/contextkey/common/contextkey.js";
import { registerSingleton } from "../../../../../platform/instantiation/common/extensions.js";
import { ILabelService } from "../../../../../platform/label/common/label.js";
import { ILogService } from "../../../../../platform/log/common/log.js";
import { isDark } from "../../../../../platform/theme/common/theme.js";
import { IThemeService } from "../../../../../platform/theme/common/themeService.js";
import { IEditorService } from "../../../../services/editor/common/editorService.js";
import { IExtensionService, isProposedApiEnabled } from "../../../../services/extensions/common/extensions.js";
import { ExtensionsRegistry } from "../../../../services/extensions/common/extensionsRegistry.js";
import { ChatEditorInput } from "../widgetHosts/editor/chatEditorInput.js";
import { IChatAgentService } from "../../common/participants/chatAgents.js";
import { ChatContextKeys } from "../../common/actions/chatContextKeys.js";
import { IChatSessionsService, isSessionInProgressStatus } from "../../common/chatSessionsService.js";
import { ChatAgentLocation, ChatModeKind } from "../../common/constants.js";
import { CHAT_CATEGORY } from "../actions/chatActions.js";
import { IChatService } from "../../common/chatService/chatService.js";
import { autorun, observableFromEvent } from "../../../../../base/common/observable.js";
import { renderAsPlaintext } from "../../../../../base/browser/markdownRenderer.js";
import { IViewsService } from "../../../../services/views/common/viewsService.js";
import { ChatViewId } from "../chat.js";
import { AgentSessionProviders, getAgentSessionProviderName } from "../agentSessions/agentSessions.js";
import { BugIndicatingError, isCancellationError } from "../../../../../base/common/errors.js";
import { IEditorGroupsService } from "../../../../services/editor/common/editorGroupsService.js";
import { getChatSessionType, isUntitledChatSession, LocalChatSessionUri } from "../../common/model/chatUri.js";
import { assertNever } from "../../../../../base/common/assert.js";
import { ICommandService } from "../../../../../platform/commands/common/commands.js";
import { Target } from "../../common/promptSyntax/promptTypes.js";
const extensionPoint = ExtensionsRegistry.registerExtensionPoint({
  extensionPoint: "chatSessions",
  jsonSchema: {
    description: localize("chatSessionsExtPoint", "Contributes chat session integrations to the chat widget."),
    type: "array",
    items: {
      type: "object",
      additionalProperties: false,
      properties: {
        type: {
          description: localize("chatSessionsExtPoint.chatSessionType", "Unique identifier for the type of chat session."),
          type: "string"
        },
        name: {
          description: localize("chatSessionsExtPoint.name", "Name of the dynamically registered chat participant (eg: @agent). Must not contain whitespace."),
          type: "string",
          pattern: "^[\\w-]+$"
        },
        displayName: {
          description: localize("chatSessionsExtPoint.displayName", "A longer name for this item which is used for display in menus."),
          type: "string"
        },
        description: {
          description: localize("chatSessionsExtPoint.description", "Description of the chat session for use in menus and tooltips."),
          type: "string"
        },
        when: {
          description: localize("chatSessionsExtPoint.when", "Condition which must be true to show this item."),
          type: "string"
        },
        icon: {
          description: localize("chatSessionsExtPoint.icon", 'Icon identifier (codicon ID) for the chat session editor tab. For example, "$(github)" or "$(cloud)".'),
          anyOf: [
            {
              type: "string"
            },
            {
              type: "object",
              properties: {
                light: {
                  description: localize("icon.light", "Icon path when a light theme is used"),
                  type: "string"
                },
                dark: {
                  description: localize("icon.dark", "Icon path when a dark theme is used"),
                  type: "string"
                }
              }
            }
          ]
        },
        order: {
          description: localize("chatSessionsExtPoint.order", "Order in which this item should be displayed."),
          type: "integer"
        },
        alternativeIds: {
          description: localize("chatSessionsExtPoint.alternativeIds", "Alternative identifiers for backward compatibility."),
          type: "array",
          items: {
            type: "string"
          }
        },
        welcomeTitle: {
          description: localize("chatSessionsExtPoint.welcomeTitle", "Title text to display in the chat welcome view for this session type."),
          type: "string"
        },
        welcomeMessage: {
          description: localize("chatSessionsExtPoint.welcomeMessage", "Message text (supports markdown) to display in the chat welcome view for this session type."),
          type: "string"
        },
        welcomeTips: {
          description: localize("chatSessionsExtPoint.welcomeTips", "Tips text (supports markdown and theme icons) to display in the chat welcome view for this session type."),
          type: "string"
        },
        inputPlaceholder: {
          description: localize("chatSessionsExtPoint.inputPlaceholder", "Placeholder text to display in the chat input box for this session type."),
          type: "string"
        },
        capabilities: {
          description: localize("chatSessionsExtPoint.capabilities", "Optional capabilities for this chat session."),
          type: "object",
          additionalProperties: false,
          properties: {
            supportsFileAttachments: {
              description: localize("chatSessionsExtPoint.supportsFileAttachments", "Whether this chat session supports attaching files or file references."),
              type: "boolean"
            },
            supportsToolAttachments: {
              description: localize("chatSessionsExtPoint.supportsToolAttachments", "Whether this chat session supports attaching tools or tool references."),
              type: "boolean"
            },
            supportsMCPAttachments: {
              description: localize("chatSessionsExtPoint.supportsMCPAttachments", "Whether this chat session supports attaching MCP resources."),
              type: "boolean"
            },
            supportsImageAttachments: {
              description: localize("chatSessionsExtPoint.supportsImageAttachments", "Whether this chat session supports attaching images."),
              type: "boolean"
            },
            supportsSearchResultAttachments: {
              description: localize("chatSessionsExtPoint.supportsSearchResultAttachments", "Whether this chat session supports attaching search results."),
              type: "boolean"
            },
            supportsInstructionAttachments: {
              description: localize("chatSessionsExtPoint.supportsInstructionAttachments", "Whether this chat session supports attaching instructions."),
              type: "boolean"
            },
            supportsSourceControlAttachments: {
              description: localize("chatSessionsExtPoint.supportsSourceControlAttachments", "Whether this chat session supports attaching source control changes."),
              type: "boolean"
            },
            supportsProblemAttachments: {
              description: localize("chatSessionsExtPoint.supportsProblemAttachments", "Whether this chat session supports attaching problems."),
              type: "boolean"
            },
            supportsSymbolAttachments: {
              description: localize("chatSessionsExtPoint.supportsSymbolAttachments", "Whether this chat session supports attaching symbols."),
              type: "boolean"
            },
            supportsPromptAttachments: {
              description: localize("chatSessionsExtPoint.supportsPromptAttachments", "Whether this chat session supports attaching prompts."),
              type: "boolean"
            },
            supportsHandOffs: {
              description: localize("chatSessionsExtPoint.supportsHandOffs", "Whether this chat session supports hand-off prompts."),
              type: "boolean"
            }
          }
        },
        commands: {
          markdownDescription: localize("chatCommandsDescription", "Commands available for this chat session, which the user can invoke with a `/`."),
          type: "array",
          items: {
            additionalProperties: false,
            type: "object",
            defaultSnippets: [{ body: { name: "", description: "" } }],
            required: ["name"],
            properties: {
              name: {
                description: localize("chatCommand", "A short name by which this command is referred to in the UI, e.g. `fix` or `explain` for commands that fix an issue or explain code. The name should be unique among the commands provided by this participant."),
                type: "string"
              },
              description: {
                description: localize("chatCommandDescription", "A description of this command."),
                type: "string"
              },
              when: {
                description: localize("chatCommandWhen", "A condition which must be true to enable this command."),
                type: "string"
              }
            }
          }
        },
        canDelegate: {
          description: localize("chatSessionsExtPoint.canDelegate", "Whether delegation is supported. Default is false. Note that enabling this is experimental and may not be respected at all times."),
          type: "boolean",
          default: false
        },
        customAgentTarget: {
          description: localize("chatSessionsExtPoint.customAgentTarget", "When set, the chat session will show a filtered mode picker that prefers custom agents whose target property matches this value. Custom agents without a target property are still shown in all session types. This enables the use of standard agent/mode with contributed sessions."),
          type: "string"
        },
        requiresCustomModels: {
          description: localize("chatSessionsExtPoint.requiresCustomModels", "When set, the chat session will show a filtered model picker that prefers custom models. This enables the use of standard model picker with contributed sessions."),
          type: "boolean",
          default: false
        }
      },
      required: ["type", "name", "displayName", "description"]
    }
  },
  activationEventsGenerator: /* @__PURE__ */ __name(function* (contribs) {
    for (const contrib of contribs) {
      yield `onChatSession:${contrib.type}`;
    }
  }, "activationEventsGenerator")
});
class ContributedChatSessionData extends Disposable {
  static {
    __name(this, "ContributedChatSessionData");
  }
  getOption(optionId) {
    return this._optionsCache.get(optionId);
  }
  setOption(optionId, value) {
    this._optionsCache.set(optionId, value);
  }
  constructor(session, chatSessionType, resource, options, onWillDispose) {
    super();
    this.session = session;
    this.chatSessionType = chatSessionType;
    this.resource = resource;
    this.options = options;
    this.onWillDispose = onWillDispose;
    this._optionsCache = /* @__PURE__ */ new Map();
    if (options) {
      for (const [key, value] of Object.entries(options)) {
        this._optionsCache.set(key, value);
      }
    }
    this._register(this.session.onWillDispose(() => {
      this.onWillDispose(this.resource);
    }));
  }
}
let ChatSessionsService = class ChatSessionsService2 extends Disposable {
  static {
    __name(this, "ChatSessionsService");
  }
  get onDidChangeInProgress() {
    return this._onDidChangeInProgress.event;
  }
  get onDidChangeContentProviderSchemes() {
    return this._onDidChangeContentProviderSchemes.event;
  }
  get onDidChangeSessionOptions() {
    return this._onDidChangeSessionOptions.event;
  }
  get onDidChangeOptionGroups() {
    return this._onDidChangeOptionGroups.event;
  }
  get onRequestNotifyExtension() {
    return this._onRequestNotifyExtension.event;
  }
  constructor(_logService, _chatAgentService, _extensionService, _contextKeyService, _menuService, _themeService, _labelService) {
    super();
    this._logService = _logService;
    this._chatAgentService = _chatAgentService;
    this._extensionService = _extensionService;
    this._contextKeyService = _contextKeyService;
    this._menuService = _menuService;
    this._themeService = _themeService;
    this._labelService = _labelService;
    this._itemControllers = /* @__PURE__ */ new Map();
    this._contributions = /* @__PURE__ */ new Map();
    this._contributionDisposables = this._register(new DisposableMap());
    this._contentProviders = /* @__PURE__ */ new Map();
    this._alternativeIdMap = /* @__PURE__ */ new Map();
    this._contextKeys = /* @__PURE__ */ new Set();
    this._onDidChangeItemsProviders = this._register(new Emitter());
    this.onDidChangeItemsProviders = this._onDidChangeItemsProviders.event;
    this._onDidChangeSessionItems = this._register(new Emitter());
    this.onDidChangeSessionItems = this._onDidChangeSessionItems.event;
    this._onDidChangeAvailability = this._register(new Emitter());
    this.onDidChangeAvailability = this._onDidChangeAvailability.event;
    this._onDidChangeInProgress = this._register(new Emitter());
    this._onDidChangeContentProviderSchemes = this._register(new Emitter());
    this._onDidChangeSessionOptions = this._register(new Emitter());
    this._onDidChangeOptionGroups = this._register(new Emitter());
    this._onRequestNotifyExtension = this._register(new AsyncEmitter());
    this.inProgressMap = /* @__PURE__ */ new Map();
    this._sessionTypeOptions = /* @__PURE__ */ new Map();
    this._sessionTypeNewSessionOptions = /* @__PURE__ */ new Map();
    this._sessions = new ResourceMap();
    this._resourceAliases = new ResourceMap();
    this._hasCanDelegateProvidersKey = ChatContextKeys.hasCanDelegateProviders.bindTo(this._contextKeyService);
    this._register(extensionPoint.setHandler((extensions) => {
      for (const ext of extensions) {
        if (!isProposedApiEnabled(ext.description, "chatSessionsProvider")) {
          continue;
        }
        if (!Array.isArray(ext.value)) {
          continue;
        }
        for (const contribution of ext.value) {
          this._register(this.registerContribution(contribution, ext.description));
        }
      }
    }));
    this._register(Event.filter(this._contextKeyService.onDidChangeContext, (e) => e.affectsSome(this._contextKeys))(() => {
      this._evaluateAvailability();
    }));
    const builtinSessionProviders = [AgentSessionProviders.Local];
    const contributedSessionProviders = observableFromEvent(this.onDidChangeAvailability, () => Array.from(this._contributions.keys()).filter((key) => this._contributionDisposables.has(key) && isAgentSessionProviderType(key))).recomputeInitiallyAndOnChange(this._store);
    this._register(autorun((reader) => {
      const activatedProviders = [...builtinSessionProviders, ...contributedSessionProviders.read(reader)];
      for (const provider of Object.values(AgentSessionProviders)) {
        if (activatedProviders.includes(provider)) {
          reader.store.add(registerNewSessionInPlaceAction(provider, getAgentSessionProviderName(provider)));
        }
      }
    }));
    this._register(this.onDidChangeSessionItems((delta) => {
      const changedChatSessionTypes = /* @__PURE__ */ new Set();
      for (const session of delta.addedOrUpdated ?? []) {
        changedChatSessionTypes.add(getChatSessionType(session.resource));
      }
      for (const resource of delta.removed ?? []) {
        changedChatSessionTypes.add(getChatSessionType(resource));
      }
      for (const chatSessionType of changedChatSessionTypes) {
        this.updateInProgressStatus(chatSessionType).catch((error) => {
          this._logService.warn(`Failed to update progress status for '${chatSessionType}':`, error);
        });
      }
    }));
    this._register(this._labelService.registerFormatter({
      scheme: Schemas.copilotPr,
      formatting: {
        label: "${authority}${path}",
        separator: sep,
        stripPathStartingSeparator: true
      }
    }));
  }
  reportInProgress(chatSessionType, count) {
    let displayName;
    if (chatSessionType === AgentSessionProviders.Local) {
      displayName = localize("chat.session.inProgress.local", "Local Agent");
    } else if (chatSessionType === AgentSessionProviders.Background) {
      displayName = localize("chat.session.inProgress.background", "Background Agent");
    } else if (chatSessionType === AgentSessionProviders.Cloud) {
      displayName = localize("chat.session.inProgress.cloud", "Cloud Agent");
    } else {
      displayName = this._contributions.get(chatSessionType)?.contribution.displayName;
    }
    if (displayName) {
      this.inProgressMap.set(displayName, count);
    }
    this._onDidChangeInProgress.fire();
  }
  getInProgress() {
    return Array.from(this.inProgressMap.entries()).map(([displayName, count]) => ({ displayName, count }));
  }
  async updateInProgressStatus(chatSessionType) {
    try {
      const items = [];
      for await (const result of this.getChatSessionItems([chatSessionType], CancellationToken.None)) {
        items.push(...result.items);
      }
      const inProgress = items.filter((item) => item.status && isSessionInProgressStatus(item.status));
      this.reportInProgress(chatSessionType, inProgress.length);
    } catch (error) {
      this._logService.warn(`Failed to update in-progress status for chat session type '${chatSessionType}':`, error);
    }
  }
  registerContribution(contribution, ext) {
    this._logService.info(`[ChatSessionsService] registerContribution called for type='${contribution.type}', canDelegate=${contribution.canDelegate}, when='${contribution.when}', extension='${ext.identifier.value}'`);
    if (this._contributions.has(contribution.type)) {
      this._logService.info(`[ChatSessionsService] registerContribution: type='${contribution.type}' already registered, skipping`);
      return Disposable.None;
    }
    if (contribution.when) {
      const whenExpr = ContextKeyExpr.deserialize(contribution.when);
      if (whenExpr) {
        for (const key of whenExpr.keys()) {
          this._contextKeys.add(key);
        }
      }
    }
    this._contributions.set(contribution.type, { contribution, extension: ext });
    if (contribution.alternativeIds) {
      for (const altId of contribution.alternativeIds) {
        if (this._alternativeIdMap.has(altId)) {
          this._logService.warn(`Alternative ID '${altId}' is already mapped to '${this._alternativeIdMap.get(altId)}'. Remapping to '${contribution.type}'.`);
        }
        this._alternativeIdMap.set(altId, contribution.type);
      }
    }
    this._evaluateAvailability();
    return {
      dispose: /* @__PURE__ */ __name(() => {
        this._contributions.delete(contribution.type);
        if (contribution.alternativeIds) {
          for (const altId of contribution.alternativeIds) {
            if (this._alternativeIdMap.get(altId) === contribution.type) {
              this._alternativeIdMap.delete(altId);
            }
          }
        }
        this._contributionDisposables.deleteAndDispose(contribution.type);
        this._updateHasCanDelegateProvidersContextKey();
      }, "dispose")
    };
  }
  _isContributionAvailable(contribution) {
    if (!contribution.when) {
      return true;
    }
    const whenExpr = ContextKeyExpr.deserialize(contribution.when);
    return !whenExpr || this._contextKeyService.contextMatchesRules(whenExpr);
  }
  /**
   * Resolves a session type to its primary type, checking for alternative IDs.
   * @param sessionType The session type or alternative ID to resolve
   * @returns The primary session type, or undefined if not found or not available
   */
  _resolveToPrimaryType(sessionType) {
    const contribution = this._contributions.get(sessionType)?.contribution;
    if (contribution) {
      if (this._isContributionAvailable(contribution)) {
        return sessionType;
      }
    }
    const primaryType = this._alternativeIdMap.get(sessionType);
    if (primaryType) {
      const altContribution = this._contributions.get(primaryType)?.contribution;
      if (altContribution && this._isContributionAvailable(altContribution)) {
        return primaryType;
      }
    }
    return void 0;
  }
  _registerMenuItems(contribution, extensionDescription) {
    const contextKeyService = this._contextKeyService.createOverlay([
      ["chatSessionType", contribution.type]
    ]);
    const rawMenuActions = this._menuService.getMenuActions(MenuId.AgentSessionsCreateSubMenu, contextKeyService);
    const menuActions = rawMenuActions.map((value) => value[1]).flat();
    const disposables = new DisposableStore();
    for (let i = 0; i < menuActions.length; i++) {
      const action = menuActions[i];
      if (action instanceof MenuItemAction) {
        if (i === 0 && !contribution.canDelegate) {
          disposables.add(registerNewSessionExternalAction(contribution.type, contribution.displayName, action.item.id));
        } else {
          disposables.add(MenuRegistry.appendMenuItem(MenuId.ChatNewMenu, {
            command: action.item,
            group: "4_externally_contributed"
          }));
        }
      }
    }
    return {
      dispose: /* @__PURE__ */ __name(() => disposables.dispose(), "dispose")
    };
  }
  _registerCommands(contribution) {
    const isAvailableInSessionTypePicker = isAgentSessionProviderType(contribution.type);
    return combinedDisposable(
      registerAction2(class OpenChatSessionAction extends Action2 {
        static {
          __name(this, "OpenChatSessionAction");
        }
        constructor() {
          super({
            id: `workbench.action.chat.openSessionWithPrompt.${contribution.type}`,
            title: localize2("interactiveSession.openSessionWithPrompt", "New {0} with Prompt", contribution.displayName),
            category: CHAT_CATEGORY,
            icon: Codicon.plus,
            f1: false,
            precondition: ChatContextKeys.enabled
          });
        }
        async run(accessor, chatOptions) {
          const chatService = accessor.get(IChatService);
          const { type } = contribution;
          if (chatOptions) {
            const resource = URI.revive(chatOptions.resource);
            const ref = await chatService.acquireOrLoadSession(resource, ChatAgentLocation.Chat, CancellationToken.None);
            try {
              const result = await chatService.sendRequest(resource, chatOptions.prompt, { agentIdSilent: type, attachedContext: chatOptions.attachedContext });
              if (result.kind === "queued") {
                await result.deferred;
              } else if (result.kind === "sent") {
                await result.data.responseCompletePromise;
              }
            } finally {
              ref?.dispose();
            }
          }
        }
      }),
      // Creates a chat editor
      registerAction2(class OpenNewChatSessionEditorAction extends Action2 {
        static {
          __name(this, "OpenNewChatSessionEditorAction");
        }
        constructor() {
          super({
            id: `workbench.action.chat.openNewSessionEditor.${contribution.type}`,
            title: localize2("interactiveSession.openNewSessionEditor", "New {0}", contribution.displayName),
            category: CHAT_CATEGORY,
            icon: Codicon.plus,
            f1: true,
            precondition: ChatContextKeys.enabled
          });
        }
        async run(accessor, chatOptions) {
          const { type, displayName } = contribution;
          await openChatSession(accessor, { type, displayName, position: ChatSessionPosition.Editor }, chatOptions);
        }
      }),
      // New chat in sidebar chat (+ button)
      registerAction2(class OpenNewChatSessionSidebarAction extends Action2 {
        static {
          __name(this, "OpenNewChatSessionSidebarAction");
        }
        constructor() {
          super({
            id: `workbench.action.chat.openNewSessionSidebar.${contribution.type}`,
            title: localize2("interactiveSession.openNewSessionSidebar", "New {0}", contribution.displayName),
            category: CHAT_CATEGORY,
            icon: Codicon.plus,
            f1: false,
            // Hide from Command Palette
            precondition: ChatContextKeys.enabled,
            menu: !isAvailableInSessionTypePicker ? {
              id: MenuId.ChatNewMenu,
              group: "3_new_special"
            } : void 0
          });
        }
        async run(accessor, chatOptions) {
          const { type, displayName } = contribution;
          await openChatSession(accessor, { type, displayName, position: ChatSessionPosition.Sidebar }, chatOptions);
        }
      })
    );
  }
  _evaluateAvailability() {
    const newlyEnabledChatSessionTypes = /* @__PURE__ */ new Set();
    const newlyDisabledChatSessionTypes = /* @__PURE__ */ new Set();
    const disposedChatSessions = new ResourceSet();
    for (const { contribution, extension } of this._contributions.values()) {
      const isCurrentlyRegistered = this._contributionDisposables.has(contribution.type);
      const shouldBeRegistered = this._isContributionAvailable(contribution);
      this._logService.trace(`[ChatSessionsService] _evaluateAvailability: type='${contribution.type}', isCurrentlyRegistered=${isCurrentlyRegistered}, shouldBeRegistered=${shouldBeRegistered}, when='${contribution.when}'`);
      if (isCurrentlyRegistered && !shouldBeRegistered) {
        this._contributionDisposables.deleteAndDispose(contribution.type);
        for (const sessionResource of this._disposeSessionsForContribution(contribution.type)) {
          disposedChatSessions.add(sessionResource);
        }
        newlyDisabledChatSessionTypes.add(contribution.type);
      } else if (!isCurrentlyRegistered && shouldBeRegistered) {
        this._enableContribution(contribution, extension);
        newlyEnabledChatSessionTypes.add(contribution.type);
      }
    }
    if (newlyEnabledChatSessionTypes.size > 0 || newlyDisabledChatSessionTypes.size > 0) {
      this._onDidChangeAvailability.fire();
      for (const chatSessionType of [...newlyEnabledChatSessionTypes, ...newlyDisabledChatSessionTypes]) {
        this._onDidChangeItemsProviders.fire({ chatSessionType });
      }
      if (disposedChatSessions.size > 0) {
        this._onDidChangeSessionItems.fire({ removed: Array.from(disposedChatSessions) });
      }
    }
    this._updateHasCanDelegateProvidersContextKey();
  }
  _enableContribution(contribution, ext) {
    this._logService.info(`[ChatSessionsService] _enableContribution: type='${contribution.type}', canDelegate=${contribution.canDelegate}`);
    const disposableStore = new DisposableStore();
    this._contributionDisposables.set(contribution.type, disposableStore);
    if (contribution.canDelegate) {
      disposableStore.add(this._registerAgent(contribution, ext));
      disposableStore.add(this._registerCommands(contribution));
    }
    disposableStore.add(this._registerMenuItems(contribution, ext));
  }
  /**
   * Disposes of all sessions that belong to a contribution
   *
   * @returns List of session resources that were disposed.
   */
  _disposeSessionsForContribution(contributionId) {
    const sessionsToDispose = [];
    for (const [sessionResource, sessionData] of this._sessions) {
      if (sessionData.chatSessionType === contributionId) {
        sessionsToDispose.push(sessionResource);
      }
    }
    if (sessionsToDispose.length > 0) {
      this._logService.info(`Disposing ${sessionsToDispose.length} cached sessions for contribution '${contributionId}' due to when clause change`);
    }
    for (const sessionKey of sessionsToDispose) {
      const sessionData = this._sessions.get(sessionKey);
      if (sessionData) {
        sessionData.dispose();
      }
    }
    return sessionsToDispose;
  }
  _registerAgent(contribution, ext) {
    const storedIcon = this.getContributionIcon(ext, contribution);
    const icons = ThemeIcon.isThemeIcon(storedIcon) ? { themeIcon: storedIcon, icon: void 0, iconDark: void 0 } : storedIcon ? { icon: storedIcon.light, iconDark: storedIcon.dark } : { themeIcon: Codicon.sendToRemoteAgent };
    const id = contribution.type;
    const agentData = {
      id,
      name: contribution.name,
      fullName: contribution.displayName,
      description: contribution.description,
      isDefault: false,
      isCore: false,
      isDynamic: true,
      slashCommands: contribution.commands ?? [],
      locations: [ChatAgentLocation.Chat],
      modes: [ChatModeKind.Agent, ChatModeKind.Ask],
      disambiguation: [],
      metadata: {
        ...icons
      },
      capabilities: contribution.capabilities,
      canAccessPreviousChatHistory: true,
      extensionId: ext.identifier,
      extensionVersion: ext.version,
      extensionDisplayName: ext.displayName || ext.name,
      extensionPublisherId: ext.publisher
    };
    return this._chatAgentService.registerAgent(id, agentData);
  }
  getAllChatSessionContributions() {
    return Array.from(this._contributions.values()).filter((entry) => this._isContributionAvailable(entry.contribution)).map((entry) => this.resolveChatSessionContribution(entry.extension, entry.contribution));
  }
  _updateHasCanDelegateProvidersContextKey() {
    const hasCanDelegate = this.getAllChatSessionContributions().filter((c) => c.canDelegate);
    const canDelegateEnabled = hasCanDelegate.length > 0;
    this._logService.trace(`[ChatSessionsService] hasCanDelegateProvidersAvailable=${canDelegateEnabled} (${hasCanDelegate.map((c) => c.type).join(", ")})`);
    this._hasCanDelegateProvidersKey.set(canDelegateEnabled);
  }
  getChatSessionContribution(chatSessionType) {
    const entry = this._contributions.get(chatSessionType);
    if (!entry) {
      return void 0;
    }
    if (!this._isContributionAvailable(entry.contribution)) {
      return void 0;
    }
    return this.resolveChatSessionContribution(entry.extension, entry.contribution);
  }
  resolveChatSessionContribution(ext, contribution) {
    return {
      ...contribution,
      icon: this.resolveIconForCurrentColorTheme(this.getContributionIcon(ext, contribution))
    };
  }
  getContributionIcon(ext, contribution) {
    if (!contribution.icon) {
      return void 0;
    }
    if (typeof contribution.icon === "string") {
      return contribution.icon.startsWith("$(") && contribution.icon.endsWith(")") ? ThemeIcon.fromString(contribution.icon) : ThemeIcon.fromId(contribution.icon);
    }
    return {
      dark: resources.joinPath(ext.extensionLocation, contribution.icon.dark),
      light: resources.joinPath(ext.extensionLocation, contribution.icon.light)
    };
  }
  resolveIconForCurrentColorTheme(rawIcon) {
    if (!rawIcon) {
      return void 0;
    }
    if (ThemeIcon.isThemeIcon(rawIcon)) {
      return rawIcon;
    } else if (isDark(this._themeService.getColorTheme().type)) {
      return rawIcon.dark;
    } else {
      return rawIcon.light;
    }
  }
  async activateChatSessionItemProvider(chatViewType) {
    await this.doActivateChatSessionItemController(chatViewType);
  }
  async doActivateChatSessionItemController(chatViewType) {
    await this._extensionService.whenInstalledExtensionsRegistered();
    const resolvedType = this._resolveToPrimaryType(chatViewType);
    if (resolvedType) {
      chatViewType = resolvedType;
    }
    const contribution = this._contributions.get(chatViewType)?.contribution;
    if (contribution && !this._isContributionAvailable(contribution)) {
      return false;
    }
    if (this._itemControllers.has(chatViewType)) {
      return true;
    }
    await this._extensionService.activateByEvent(`onChatSession:${chatViewType}`);
    const controller = this._itemControllers.get(chatViewType);
    return !!controller;
  }
  async canResolveChatSession(sessionType) {
    await this._extensionService.whenInstalledExtensionsRegistered();
    const resolvedType = this._resolveToPrimaryType(sessionType) || sessionType;
    const contribution = this._contributions.get(resolvedType)?.contribution;
    if (contribution && !this._isContributionAvailable(contribution)) {
      return false;
    }
    if (this._contentProviders.has(sessionType)) {
      return true;
    }
    await this._extensionService.activateByEvent(`onChatSession:${sessionType}`);
    return this._contentProviders.has(sessionType);
  }
  async tryActivateControllers(providersToResolve) {
    await Promise.all(this.getAllChatSessionContributions().map(async (contrib) => {
      if (providersToResolve && !providersToResolve.includes(contrib.type)) {
        return;
      }
      if (!await this.doActivateChatSessionItemController(contrib.type)) {
        if (providersToResolve?.includes(contrib.type)) {
          this._logService.trace(`[ChatSessionsService] No enabled provider found for chat session type ${contrib.type}`);
        }
      }
    }));
  }
  getChatSessionItems(providersToResolve, token) {
    return new AsyncIterableProducer(async (writer) => {
      await raceCancellationError(this.tryActivateControllers(providersToResolve), token);
      await Promise.all(Array.from(this._itemControllers, async ([chatSessionType, controllerEntry]) => {
        const resolvedType = this._resolveToPrimaryType(chatSessionType) ?? chatSessionType;
        if (providersToResolve && !providersToResolve.includes(resolvedType)) {
          return;
        }
        try {
          await raceCancellationError(controllerEntry.initialRefresh, token);
          const providerSessions = controllerEntry.controller.items;
          this._logService.trace(`[ChatSessionsService] Resolved ${providerSessions.length} sessions for provider ${resolvedType}`);
          writer.emitOne({ chatSessionType: resolvedType, items: providerSessions });
        } catch (err) {
          if (!isCancellationError(err)) {
            this._logService.error(`[ChatSessionsService] Failed to resolve sessions for provider ${resolvedType}`, err);
          }
        }
      }));
    });
  }
  async refreshChatSessionItems(providersToResolve, token) {
    await this.tryActivateControllers(providersToResolve);
    await Promise.all(Array.from(this._itemControllers).map(async ([chatSessionType, controllerEntry]) => {
      try {
        await controllerEntry.controller.refresh(token);
      } catch (err) {
        if (!isCancellationError(err)) {
          this._logService.error(`[ChatSessionsService] Failed to resolve sessions for provider ${chatSessionType}`, err);
        }
      }
    }));
  }
  registerChatSessionItemController(chatSessionType, controller) {
    const disposables = new DisposableStore();
    const initialRefreshCts = disposables.add(new CancellationTokenSource());
    this._itemControllers.set(chatSessionType, { controller, initialRefresh: controller.refresh(initialRefreshCts.token) });
    this._onDidChangeItemsProviders.fire({ chatSessionType });
    disposables.add(controller.onDidChangeChatSessionItems((e) => {
      this._onDidChangeSessionItems.fire(e);
    }));
    this.updateInProgressStatus(chatSessionType).catch((error) => {
      this._logService.warn(`Failed to update initial progress status for '${chatSessionType}':`, error);
    });
    return {
      dispose: /* @__PURE__ */ __name(() => {
        initialRefreshCts.cancel();
        disposables.dispose();
        const controller2 = this._itemControllers.get(chatSessionType);
        if (controller2) {
          this._itemControllers.delete(chatSessionType);
          this._onDidChangeItemsProviders.fire({ chatSessionType });
        }
      }, "dispose")
    };
  }
  registerChatSessionContentProvider(chatSessionType, provider) {
    if (this._contentProviders.has(chatSessionType)) {
      throw new Error(`Content provider for ${chatSessionType} is already registered.`);
    }
    this._contentProviders.set(chatSessionType, provider);
    this._onDidChangeContentProviderSchemes.fire({ added: [chatSessionType], removed: [] });
    return {
      dispose: /* @__PURE__ */ __name(() => {
        this._contentProviders.delete(chatSessionType);
        this._onDidChangeContentProviderSchemes.fire({ added: [], removed: [chatSessionType] });
        for (const [key, session] of this._sessions) {
          if (session.chatSessionType === chatSessionType) {
            session.dispose();
            this._sessions.delete(key);
          }
        }
      }, "dispose")
    };
  }
  getInProgressSessionDescription(chatModel) {
    const requests = chatModel.getRequests();
    if (requests.length === 0) {
      return void 0;
    }
    const lastRequest = requests.at(-1);
    const response = lastRequest?.response;
    if (!response) {
      return void 0;
    }
    if (response.isComplete) {
      return void 0;
    }
    const responseParts = response.response.value;
    let description = "";
    for (let i = responseParts.length - 1; i >= 0; i--) {
      const part = responseParts[i];
      if (description) {
        break;
      }
      if (part.kind === "confirmation" && typeof part.message === "string") {
        description = part.message;
      } else if (part.kind === "toolInvocation") {
        const toolInvocation = part;
        const state = toolInvocation.state.get();
        description = toolInvocation.generatedTitle || toolInvocation.pastTenseMessage || toolInvocation.invocationMessage;
        if (state.type === 1) {
          const confirmationTitle = state.confirmationMessages?.title;
          const titleMessage = confirmationTitle && (typeof confirmationTitle === "string" ? confirmationTitle : confirmationTitle.value);
          const descriptionValue = typeof description === "string" ? description : description.value;
          description = titleMessage ?? localize("chat.sessions.description.waitingForConfirmation", "Waiting for confirmation: {0}", descriptionValue);
        }
      } else if (part.kind === "toolInvocationSerialized") {
        description = part.invocationMessage;
      } else if (part.kind === "progressMessage") {
        description = part.content;
      } else if (part.kind === "thinking") {
        description = localize("chat.sessions.description.thinking", "Thinking...");
      }
    }
    return description ? renderAsPlaintext(description, { useLinkFormatter: true }) : "";
  }
  async createNewChatSessionItem(chatSessionType, request, token) {
    const controllerData = this._itemControllers.get(chatSessionType);
    if (!controllerData) {
      return void 0;
    }
    await controllerData.initialRefresh;
    return controllerData.controller.newChatSessionItem?.(request, token);
  }
  async getOrCreateChatSession(sessionResource, token) {
    {
      const existingSessionData = this._sessions.get(sessionResource);
      if (existingSessionData) {
        return existingSessionData.session;
      }
    }
    if (!await raceCancellationError(this.canResolveChatSession(sessionResource.scheme), token)) {
      throw Error(`Can not find provider for ${sessionResource}`);
    }
    {
      const existingSessionData = this._sessions.get(sessionResource);
      if (existingSessionData) {
        return existingSessionData.session;
      }
    }
    const resolvedType = this._resolveToPrimaryType(sessionResource.scheme) || sessionResource.scheme;
    const provider = this._contentProviders.get(resolvedType);
    if (!provider) {
      throw Error(`Can not find provider for ${sessionResource}`);
    }
    let session;
    const newSessionOptions = this.getNewSessionOptionsForSessionType(resolvedType);
    if (isUntitledChatSession(sessionResource) && newSessionOptions) {
      session = {
        sessionResource,
        onWillDispose: Event.None,
        history: [],
        options: newSessionOptions ?? {},
        dispose: /* @__PURE__ */ __name(() => {
        }, "dispose")
      };
    } else {
      session = await raceCancellationError(provider.provideChatSessionContent(sessionResource, token), token);
    }
    for (const [optionId, value] of Object.entries(session.options ?? {})) {
      this.setSessionOption(sessionResource, optionId, value);
    }
    {
      const existingSessionData = this._sessions.get(sessionResource);
      if (existingSessionData) {
        session.dispose();
        return existingSessionData.session;
      }
    }
    const sessionData = new ContributedChatSessionData(session, sessionResource.scheme, sessionResource, session.options, (resource) => {
      sessionData.dispose();
      this._sessions.delete(resource);
    });
    this._sessions.set(sessionResource, sessionData);
    this._onDidChangeSessionOptions.fire(sessionResource);
    return session;
  }
  hasAnySessionOptions(sessionResource) {
    const session = this._sessions.get(this._resolveResource(sessionResource));
    return !!session && !!session.options && Object.keys(session.options).length > 0;
  }
  getSessionOption(sessionResource, optionId) {
    const session = this._sessions.get(this._resolveResource(sessionResource));
    return session?.getOption(optionId);
  }
  setSessionOption(sessionResource, optionId, value) {
    const session = this._sessions.get(this._resolveResource(sessionResource));
    return !!session?.setOption(optionId, value);
  }
  /**
   * Resolve a resource through the alias map. If the resource is a real
   * resource that has been aliased to an untitled resource, return the
   * untitled resource (the canonical key in {@link _sessions}).
   */
  _resolveResource(resource) {
    return this._resourceAliases.get(resource) ?? resource;
  }
  registerSessionResourceAlias(untitledResource, realResource) {
    this._resourceAliases.set(realResource, untitledResource);
  }
  /**
   * Store option groups for a session type
   */
  setOptionGroupsForSessionType(chatSessionType, handle, optionGroups) {
    if (optionGroups) {
      this._sessionTypeOptions.set(chatSessionType, optionGroups);
    } else {
      this._sessionTypeOptions.delete(chatSessionType);
    }
    this._onDidChangeOptionGroups.fire(chatSessionType);
  }
  /**
   * Get available option groups for a session type
   */
  getOptionGroupsForSessionType(chatSessionType) {
    return this._sessionTypeOptions.get(chatSessionType);
  }
  getNewSessionOptionsForSessionType(chatSessionType) {
    return this._sessionTypeNewSessionOptions.get(chatSessionType);
  }
  setNewSessionOptionsForSessionType(chatSessionType, options) {
    this._sessionTypeNewSessionOptions.set(chatSessionType, options);
  }
  /**
   * Notify extension about option changes for a session
   */
  async notifySessionOptionsChange(sessionResource, updates) {
    if (!updates.length) {
      return;
    }
    this._logService.trace(`[ChatSessionsService] notifySessionOptionsChange: starting for ${sessionResource}, ${updates.length} update(s): [${updates.map((u) => u.optionId).join(", ")}]`);
    await this._onRequestNotifyExtension.fireAsync({ sessionResource, updates }, CancellationToken.None);
    this._logService.trace(`[ChatSessionsService] notifySessionOptionsChange: fireAsync completed for ${sessionResource}`);
    for (const u of updates) {
      this.setSessionOption(sessionResource, u.optionId, u.value);
    }
    this._onDidChangeSessionOptions.fire(this._resolveResource(sessionResource));
    this._logService.trace(`[ChatSessionsService] notifySessionOptionsChange: finished for ${sessionResource}`);
  }
  /**
   * Get the capabilities for a specific session type
   */
  getCapabilitiesForSessionType(chatSessionType) {
    const contribution = this._contributions.get(chatSessionType)?.contribution;
    return contribution?.capabilities;
  }
  /**
   * Get the customAgentTarget for a specific session type.
   * When set, the mode picker should show filtered custom agents matching this target.
   */
  getCustomAgentTargetForSessionType(chatSessionType) {
    const contribution = this._contributions.get(chatSessionType)?.contribution;
    return contribution?.customAgentTarget ?? Target.Undefined;
  }
  requiresCustomModelsForSessionType(chatSessionType) {
    const contribution = this._contributions.get(chatSessionType)?.contribution;
    return !!contribution?.requiresCustomModels;
  }
  getContentProviderSchemes() {
    return Array.from(this._contentProviders.keys());
  }
};
ChatSessionsService = __decorate([
  __param(0, ILogService),
  __param(1, IChatAgentService),
  __param(2, IExtensionService),
  __param(3, IContextKeyService),
  __param(4, IMenuService),
  __param(5, IThemeService),
  __param(6, ILabelService)
], ChatSessionsService);
registerSingleton(
  IChatSessionsService,
  ChatSessionsService,
  1
  /* InstantiationType.Delayed */
);
function registerNewSessionInPlaceAction(type, displayName) {
  return registerAction2(class NewChatSessionInPlaceAction extends Action2 {
    static {
      __name(this, "NewChatSessionInPlaceAction");
    }
    constructor() {
      super({
        id: `workbench.action.chat.openNewChatSessionInPlace.${type}`,
        title: localize2("interactiveSession.openNewChatSessionInPlace", "New {0}", displayName),
        category: CHAT_CATEGORY,
        f1: false,
        precondition: ChatContextKeys.enabled
      });
    }
    // Expected args: [chatSessionPosition: 'sidebar' | 'editor']
    async run(accessor, ...args) {
      if (args.length === 0) {
        throw new BugIndicatingError("Expected chat session position argument");
      }
      const chatSessionPosition = args[0];
      if (chatSessionPosition !== ChatSessionPosition.Sidebar && chatSessionPosition !== ChatSessionPosition.Editor) {
        throw new BugIndicatingError(`Invalid chat session position argument: ${chatSessionPosition}`);
      }
      await openChatSession(accessor, { type, displayName: localize("chat", "Chat"), position: chatSessionPosition, replaceEditor: true });
    }
  });
}
__name(registerNewSessionInPlaceAction, "registerNewSessionInPlaceAction");
function registerNewSessionExternalAction(type, displayName, commandId) {
  return registerAction2(class NewChatSessionExternalAction extends Action2 {
    static {
      __name(this, "NewChatSessionExternalAction");
    }
    constructor() {
      super({
        id: `workbench.action.chat.openNewChatSessionExternal.${type}`,
        title: localize2("interactiveSession.openNewChatSessionExternal", "New {0}", displayName),
        category: CHAT_CATEGORY,
        f1: false,
        precondition: ChatContextKeys.enabled
      });
    }
    async run(accessor) {
      const commandService = accessor.get(ICommandService);
      await commandService.executeCommand(commandId);
    }
  });
}
__name(registerNewSessionExternalAction, "registerNewSessionExternalAction");
var ChatSessionPosition;
(function(ChatSessionPosition2) {
  ChatSessionPosition2["Editor"] = "editor";
  ChatSessionPosition2["Sidebar"] = "sidebar";
})(ChatSessionPosition || (ChatSessionPosition = {}));
async function openChatSession(accessor, openOptions, chatSendOptions) {
  const viewsService = accessor.get(IViewsService);
  const chatService = accessor.get(IChatService);
  const logService = accessor.get(ILogService);
  const editorGroupService = accessor.get(IEditorGroupsService);
  const editorService = accessor.get(IEditorService);
  const resource = getResourceForNewChatSession(openOptions);
  try {
    switch (openOptions.position) {
      case ChatSessionPosition.Sidebar: {
        const view = await viewsService.openView(ChatViewId);
        if (openOptions.type === AgentSessionProviders.Local) {
          await view.widget.clear();
        } else {
          await view.loadSession(resource);
        }
        view.focus();
        break;
      }
      case ChatSessionPosition.Editor: {
        const options = {
          override: ChatEditorInput.EditorID,
          pinned: true,
          title: {
            fallback: localize("chatEditorContributionName", "{0}", openOptions.displayName)
          }
        };
        if (openOptions.replaceEditor) {
          const activeEditor = editorGroupService.activeGroup.activeEditor;
          if (!activeEditor || !(activeEditor instanceof ChatEditorInput)) {
            throw new Error("No active chat editor to replace");
          }
          await editorService.replaceEditors([{ editor: activeEditor, replacement: { resource, options } }], editorGroupService.activeGroup);
        } else {
          await editorService.openEditor({ resource, options });
        }
        break;
      }
      default:
        assertNever(openOptions.position, `Unknown chat session position: ${openOptions.position}`);
    }
  } catch (e) {
    logService.error(`Failed to open '${openOptions.type}' chat session with openOptions: ${JSON.stringify(openOptions)}`, e);
    return;
  }
  if (chatSendOptions) {
    try {
      if (chatSendOptions.initialSessionOptions) {
        const model = chatService.getSession(resource);
        if (model?.contributedChatSession) {
          model.setContributedChatSession({
            ...model.contributedChatSession,
            initialSessionOptions: chatSendOptions.initialSessionOptions
          });
        }
      }
      await chatService.sendRequest(resource, chatSendOptions.prompt, { agentIdSilent: openOptions.type, attachedContext: chatSendOptions.attachedContext });
    } catch (e) {
      logService.error(`Failed to send initial request to '${openOptions.type}' chat session with contextOptions: ${JSON.stringify(chatSendOptions)}`, e);
    }
  }
}
__name(openChatSession, "openChatSession");
function getResourceForNewChatSession(options) {
  const isRemoteSession = options.type !== AgentSessionProviders.Local;
  if (isRemoteSession) {
    return URI.from({
      scheme: options.type,
      path: `/untitled-${generateUuid()}`
    });
  }
  const isEditorPosition = options.position === ChatSessionPosition.Editor;
  if (isEditorPosition) {
    return ChatEditorInput.getNewEditorUri();
  }
  return LocalChatSessionUri.getNewSessionUri();
}
__name(getResourceForNewChatSession, "getResourceForNewChatSession");
function isAgentSessionProviderType(type) {
  return Object.values(AgentSessionProviders).includes(type);
}
__name(isAgentSessionProviderType, "isAgentSessionProviderType");
export {
  ChatSessionPosition,
  ChatSessionsService,
  getResourceForNewChatSession
};
//# sourceMappingURL=chatSessions.contribution.js.map
