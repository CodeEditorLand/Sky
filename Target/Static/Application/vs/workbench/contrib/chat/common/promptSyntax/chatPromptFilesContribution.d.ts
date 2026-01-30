import { UriComponents } from '../../../../../base/common/uri.js';
import { IWorkbenchContribution } from '../../../../common/contributions.js';
import { IPromptsService } from './service/promptsService.js';
import { PromptsType } from './promptTypes.js';
export declare class ChatPromptFilesExtensionPointHandler implements IWorkbenchContribution {
    private readonly promptsService;
    static readonly ID = "workbench.contrib.chatPromptFilesExtensionPointHandler";
    private readonly registrations;
    constructor(promptsService: IPromptsService);
    private handle;
}
/**
 * Result type for the extension prompt file provider command.
 */
export interface IExtensionPromptFileResult {
    readonly uri: UriComponents;
    readonly type: PromptsType;
}
