/**
 * Storage keys used by ChatTipService for persisting tip state.
 */
export declare const ChatTipStorageKeys: {
    /** IDs of tips that have been permanently dismissed by the user. */
    DismissedTips: string;
    /** The ID of the last tip that was shown, for round-robin selection. */
    LastTipId: string;
    /** Whether the user has ever enabled global auto-approve (yolo mode). */
    YoloModeEverEnabled: string;
    /** Whether the user has ever modified the thinking phrases setting. */
    ThinkingPhrasesEverModified: string;
};
/**
 * Storage keys used by TipEligibilityTracker for tracking user signals.
 */
export declare const TipEligibilityStorageKeys: {
    /** Command IDs that have been executed (for excludeWhenCommandsExecuted). */
    ExecutedCommands: string;
    /** Chat modes that have been used (for excludeWhenModesUsed). */
    UsedModes: string;
    /** Tool IDs that have been invoked (for excludeWhenToolsInvoked). */
    InvokedTools: string;
};
/**
 * Synthetic command IDs used to track user actions that don't have real commands.
 * These are recorded when the user performs the action, allowing tips to be excluded
 * via excludeWhenCommandsExecuted.
 */
export declare const TipTrackingCommands: {
    /** Tracked when user attaches a file/folder reference with #. */
    readonly AttachFilesReferenceUsed: "chat.tips.attachFiles.referenceUsed";
    /** Tracked when user executes /create-instructions. */
    readonly CreateAgentInstructionsUsed: "chat.tips.createAgentInstructions.commandUsed";
    /** Tracked when user executes /create-prompt. */
    readonly CreatePromptUsed: "chat.tips.createPrompt.commandUsed";
    /** Tracked when user executes /create-agent. */
    readonly CreateAgentUsed: "chat.tips.createAgent.commandUsed";
    /** Tracked when user executes /create-skill. */
    readonly CreateSkillUsed: "chat.tips.createSkill.commandUsed";
};
