import { ServicesAccessor } from '../../../../../editor/browser/editorExtensions.js';
import { Action2, IAction2Options } from '../../../../../platform/actions/common/actions.js';
import { PromptsType } from '../../common/promptSyntax/promptTypes.js';
declare class BaseSaveAsPromptFileAction extends Action2 {
    private readonly promptType;
    constructor(opts: Readonly<IAction2Options>, promptType: PromptsType);
    run(accessor: ServicesAccessor, configUri?: string): Promise<void>;
}
export declare const SAVE_AS_PROMPT_FILE_ACTION_ID = "workbench.action.chat.save-as-prompt";
export declare class SaveAsPromptFileAction extends BaseSaveAsPromptFileAction {
    constructor();
}
export declare const SAVE_AS_AGENT_FILE_ACTION_ID = "workbench.action.chat.save-as-agent";
export declare class SaveAsAgentFileAction extends BaseSaveAsPromptFileAction {
    constructor();
}
export declare const SAVE_AS_INSTRUCTIONS_FILE_ACTION_ID = "workbench.action.chat.save-as-instructions";
export declare class SaveAsInstructionsFileAction extends BaseSaveAsPromptFileAction {
    constructor();
}
export {};
