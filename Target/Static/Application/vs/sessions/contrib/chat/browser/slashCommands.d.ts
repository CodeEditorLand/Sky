import { Disposable } from '../../../../base/common/lifecycle.js';
import { CodeEditorWidget } from '../../../../editor/browser/widget/codeEditor/codeEditorWidget.js';
import { ICodeEditorService } from '../../../../editor/browser/services/codeEditorService.js';
import { ILanguageFeaturesService } from '../../../../editor/common/services/languageFeatures.js';
import { ICommandService } from '../../../../platform/commands/common/commands.js';
import { IThemeService } from '../../../../platform/theme/common/themeService.js';
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
    private static readonly _slashDecoType;
    private static readonly _slashPlaceholderDecoType;
    private static _slashDecosRegistered;
    private readonly _slashCommands;
    constructor(_editor: CodeEditorWidget, commandService: ICommandService, codeEditorService: ICodeEditorService, languageFeaturesService: ILanguageFeaturesService, themeService: IThemeService);
    clearInput(): void;
    /**
     * Attempts to parse and execute a slash command from the input.
     * Returns `true` if a command was handled.
     */
    tryExecuteSlashCommand(query: string): boolean;
    private _registerSlashCommands;
    private _registerDecorations;
    private _updateDecorations;
    private _getPlaceholderColor;
    private _registerCompletions;
    private _computeCompletionRanges;
}
