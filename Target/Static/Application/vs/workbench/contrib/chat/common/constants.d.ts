import { ServicesAccessor } from '../../../../platform/instantiation/common/instantiation.js';
import { RawContextKey } from '../../../../platform/contextkey/common/contextkey.js';
export declare enum ChatConfiguration {
    AIDisabled = "chat.disableAIFeatures",
    PluginsEnabled = "chat.plugins.enabled",
    PluginPaths = "chat.plugins.paths",
    PluginMarketplaces = "chat.plugins.marketplaces",
    AgentEnabled = "chat.agent.enabled",
    PlanAgentDefaultModel = "chat.planAgent.defaultModel",
    ExploreAgentDefaultModel = "chat.exploreAgent.defaultModel",
    RequestQueueingDefaultAction = "chat.requestQueuing.defaultAction",
    AgentStatusEnabled = "chat.agentsControl.enabled",
    EditorAssociations = "chat.editorAssociations",
    UnifiedAgentsBar = "chat.unifiedAgentsBar.enabled",
    AgentSessionProjectionEnabled = "chat.agentSessionProjection.enabled",
    EditModeHidden = "chat.editMode.hidden",
    Edits2Enabled = "chat.edits2.enabled",
    ExtensionToolsEnabled = "chat.extensionTools.enabled",
    RepoInfoEnabled = "chat.repoInfo.enabled",
    EditRequests = "chat.editRequests",
    InlineReferencesStyle = "chat.inlineReferences.style",
    AutoReply = "chat.autoReply",
    GlobalAutoApprove = "chat.tools.global.autoApprove",
    AutoApproveEdits = "chat.tools.edits.autoApprove",
    AutoApprovedUrls = "chat.tools.urls.autoApprove",
    EligibleForAutoApproval = "chat.tools.eligibleForAutoApproval",
    EnableMath = "chat.math.enabled",
    CheckpointsEnabled = "chat.checkpoints.enabled",
    ThinkingStyle = "chat.agent.thinkingStyle",
    ThinkingGenerateTitles = "chat.agent.thinking.generateTitles",
    TerminalToolsInThinking = "chat.agent.thinking.terminalTools",
    SimpleTerminalCollapsible = "chat.tools.terminal.simpleCollapsible",
    ThinkingPhrases = "chat.agent.thinking.phrases",
    AutoExpandToolFailures = "chat.tools.autoExpandFailures",
    TodosShowWidget = "chat.tools.todos.showWidget",
    NotifyWindowOnConfirmation = "chat.notifyWindowOnConfirmation",
    NotifyWindowOnResponseReceived = "chat.notifyWindowOnResponseReceived",
    ChatViewSessionsEnabled = "chat.viewSessions.enabled",
    ChatViewSessionsGrouping = "chat.viewSessions.grouping",
    ChatViewSessionsOrientation = "chat.viewSessions.orientation",
    ChatViewProgressBadgeEnabled = "chat.viewProgressBadge.enabled",
    ChatContextUsageEnabled = "chat.contextUsage.enabled",
    SubagentToolCustomAgents = "chat.customAgentInSubagent.enabled",
    ShowCodeBlockProgressAnimation = "chat.agent.codeBlockProgress",
    RestoreLastPanelSession = "chat.restoreLastPanelSession",
    ExitAfterDelegation = "chat.exitAfterDelegation",
    AgentsControlClickBehavior = "chat.agentsControl.clickBehavior",
    ExplainChangesEnabled = "chat.editing.explainChanges.enabled",
    GrowthNotificationEnabled = "chat.growthNotification.enabled",
    ChatCustomizationMenuEnabled = "chat.customizationsMenu.enabled"
}
/**
 * The "kind" of agents for custom agents.
 */
export declare enum ChatModeKind {
    Ask = "ask",
    Edit = "edit",
    Agent = "agent"
}
export declare function validateChatMode(mode: unknown): ChatModeKind | undefined;
export declare function isChatMode(mode: unknown): mode is ChatModeKind;
export declare enum ThinkingDisplayMode {
    Collapsed = "collapsed",
    CollapsedPreview = "collapsedPreview",
    FixedScrolling = "fixedScrolling"
}
export declare enum CollapsedToolsDisplayMode {
    Off = "off",
    WithThinking = "withThinking",
    Always = "always"
}
export declare enum ChatNotificationMode {
    Off = "off",
    WindowNotFocused = "windowNotFocused",
    Always = "always"
}
export declare enum AgentsControlClickBehavior {
    Default = "default",
    Cycle = "cycle"
}
export type RawChatParticipantLocation = 'panel' | 'terminal' | 'notebook' | 'editing-session';
export declare enum ChatAgentLocation {
    /**
     * This is chat, whether it's in the sidebar, a chat editor, or quick chat.
     * Leaving the values alone as they are in stored data so we don't have to normalize them.
     */
    Chat = "panel",
    Terminal = "terminal",
    Notebook = "notebook",
    /**
     * EditorInline means inline chat in a text editor.
     */
    EditorInline = "editor"
}
export declare namespace ChatAgentLocation {
    function fromRaw(value: RawChatParticipantLocation | string): ChatAgentLocation;
}
export declare function isSupportedChatFileScheme(accessor: ServicesAccessor, scheme: string): boolean;
export declare const MANAGE_CHAT_COMMAND_ID = "workbench.action.chat.manage";
export declare const ChatEditorTitleMaxLength = 30;
export declare const CHAT_TERMINAL_OUTPUT_MAX_PREVIEW_LINES = 1000;
export declare const CONTEXT_MODELS_EDITOR: RawContextKey<boolean>;
export declare const CONTEXT_MODELS_SEARCH_FOCUS: RawContextKey<boolean>;
