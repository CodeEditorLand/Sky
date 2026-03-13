import { Disposable } from '../../../../base/common/lifecycle.js';
import { CodeEditorWidget } from '../../../../editor/browser/widget/codeEditor/codeEditorWidget.js';
import { ICodeEditorService } from '../../../../editor/browser/services/codeEditorService.js';
import { ILanguageFeaturesService } from '../../../../editor/common/services/languageFeatures.js';
import { ICommandService } from '../../../../platform/commands/common/commands.js';
import { IThemeService } from '../../../../platform/theme/common/themeService.js';
import { IAICustomizationWorkspaceService } from '../../../../workbench/contrib/chat/common/aiCustomizationWorkspaceService.js';
import { IPromptsService } from '../../../../workbench/contrib/chat/common/promptSyntax/service/promptsService.js';
/**
 * Static command ID used by completion items to trigger immediate slash command execution,
 * mirroring the pattern of core's `ChatSubmitAction` for `executeImmediately` commands.
 */
export declare const SESSIONS_EXECUTE_SLASH_COMMAND_ID = "sessions.chat.executeSlashCommand";
/**
 * Manages slash commands for the sessions new-chat input widget — registration,
 * autocompletion, decorations (syntax highlighting + placeholder text), and execution.
 */
export declare class SlashCommandHandler extends Disposable {
    private readonly _editor;
    private readonly commandService;
    private readonly codeEditorService;
    private readonly languageFeaturesService;
    private readonly themeService;
    private readonly aiCustomizationWorkspaceService;
    private readonly promptsService;
    private static readonly _slashDecoType;
    private static readonly _slashPlaceholderDecoType;
    private static _slashDecosRegistered;
    private readonly _slashCommands;
    private _cachedPromptCommands;
    constructor(_editor: CodeEditorWidget, commandService: ICommandService, codeEditorService: ICodeEditorService, languageFeaturesService: ILanguageFeaturesService, themeService: IThemeService, aiCustomizationWorkspaceService: IAICustomizationWorkspaceService, promptsService: IPromptsService);
    clearInput(): void;
    private _refreshPromptCommands;
    /**
     * Attempts to parse and execute a slash command from the input.
     * Returns `true` if a command was handled.
     */
    tryExecuteSlashCommand(query: string): boolean;
    /**
     * If the query starts with a prompt/skill slash command (e.g. `/my-prompt args`),
     * expands it into a CLI-friendly markdown reference so the agent can locate the
     * file. Returns `undefined` when the query is not a prompt slash command.
     */
    tryExpandPromptSlashCommand(query: string): string | undefined;
    private _registerSlashCommands;
    private _registerDecorations;
    private _updateDecorations;
    private _getPlaceholderColor;
    private _registerCompletions;
    private _computeCompletionRanges;
}
