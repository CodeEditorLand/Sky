import { PromptsService } from '../../../../workbench/contrib/chat/common/promptSyntax/service/promptsServiceImpl.js';
import { PromptFilesLocator } from '../../../../workbench/contrib/chat/common/promptSyntax/utils/promptFilesLocator.js';
import { PromptsType } from '../../../../workbench/contrib/chat/common/promptSyntax/promptTypes.js';
import { IPromptPath } from '../../../../workbench/contrib/chat/common/promptSyntax/service/promptsService.js';
export declare class AgenticPromptsService extends PromptsService {
    private _copilotRoot;
    protected createPromptFilesLocator(): PromptFilesLocator;
    private getCopilotRoot;
    /**
     * Override to use ~/.copilot as the user-level source folder for creation,
     * instead of the VS Code profile's promptsHome.
     */
    getSourceFolders(type: PromptsType): Promise<readonly IPromptPath[]>;
}
