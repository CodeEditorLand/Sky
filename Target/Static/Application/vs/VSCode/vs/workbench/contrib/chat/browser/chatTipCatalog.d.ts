import { MarkdownString } from '../../../../base/common/htmlContent.js';
import { ContextKeyExpression } from '../../../../platform/contextkey/common/contextkey.js';
import { IKeybindingService } from '../../../../platform/keybinding/common/keybinding.js';
import { ITipExclusionConfig } from './chatTipEligibilityTracker.js';
export declare const enum ChatTipTier {
    Foundational = "foundational",
    Qol = "qol"
}
/**
 * Context provided to tip builders for dynamic message construction.
 */
export interface ITipBuildContext {
    /**
     * Keybinding service for looking up keyboard shortcuts.
     */
    readonly keybindingService: IKeybindingService;
}
/**
 * Gets the display label for a command, looking it up from MenuRegistry.
 * Falls back to extracting a readable name from the command ID.
 */
export declare function getCommandLabel(commandId: string): string;
/**
 * Extracts command IDs from command: links in a markdown string.
 * Used to automatically populate enabledCommands for trusted markdown.
 */
export declare function extractCommandIds(markdown: string): string[];
/**
 * Interface for tip definitions in the catalog.
 */
export interface ITipDefinition extends ITipExclusionConfig {
    readonly id: string;
    readonly tier: ChatTipTier;
    /**
     * Optional priority for ordering tips within the same tier.
     * Lower values are shown first.
     */
    readonly priority?: number;
    /**
     * Builds the tip message dynamically at runtime.
     * This enables keybindings and command labels to be looked up fresh.
     * The returned MarkdownString should NOT include the "Tip:" prefix.
     */
    buildMessage(ctx: ITipBuildContext): MarkdownString;
    /**
     * When clause expression that determines if this tip is eligible to be shown.
     */
    readonly when?: ContextKeyExpression;
    /**
     * Chat model IDs for which this tip is eligible (lowercase).
     */
    readonly onlyWhenModelIds?: readonly string[];
    /**
     * Setting keys that, if changed from default, make this tip ineligible.
     */
    readonly excludeWhenSettingsChanged?: readonly string[];
    /**
     * Command IDs that dismiss this tip when clicked from the tip markdown.
     */
    readonly dismissWhenCommandsClicked?: readonly string[];
}
/**
 * Static catalog of tips. Tips are built dynamically at runtime to enable
 * keybindings and command labels to be resolved fresh.
 */
export declare const TIP_CATALOG: readonly ITipDefinition[];
