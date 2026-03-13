import { URI } from '../../../../../base/common/uri.js';
import { ICodeEditor } from '../../../../../editor/browser/editorBrowser.js';
import { PromptsStorage } from '../../common/promptSyntax/service/promptsService.js';
/**
 * Options to override the default folder-picker and editor-open behaviour
 * of the new-prompt-file actions. The agentic editor passes these to open
 * files in the embedded editor and pre-resolve the target folder.
 */
export interface INewPromptOptions {
    readonly targetFolder?: URI;
    readonly targetStorage?: PromptsStorage;
    readonly openFile?: (uri: URI) => Promise<ICodeEditor | undefined>;
}
export declare const NEW_PROMPT_COMMAND_ID = "workbench.command.new.prompt";
export declare const NEW_INSTRUCTIONS_COMMAND_ID = "workbench.command.new.instructions";
export declare const NEW_AGENT_COMMAND_ID = "workbench.command.new.agent";
export declare const NEW_SKILL_COMMAND_ID = "workbench.command.new.skill";
export declare function registerNewPromptFileActions(): void;
