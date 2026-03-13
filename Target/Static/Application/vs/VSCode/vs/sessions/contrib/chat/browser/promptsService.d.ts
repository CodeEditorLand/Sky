import { PromptsService } from '../../../../workbench/contrib/chat/common/promptSyntax/service/promptsServiceImpl.js';
import { PromptFilesLocator } from '../../../../workbench/contrib/chat/common/promptSyntax/utils/promptFilesLocator.js';
import { URI } from '../../../../base/common/uri.js';
import { CancellationToken } from '../../../../base/common/cancellation.js';
import { PromptsType } from '../../../../workbench/contrib/chat/common/promptSyntax/promptTypes.js';
import { IPromptPath, PromptsStorage } from '../../../../workbench/contrib/chat/common/promptSyntax/service/promptsService.js';
/** URI root for built-in prompts bundled with the Sessions app. */
export declare const BUILTIN_PROMPTS_URI: URI;
export declare class AgenticPromptsService extends PromptsService {
    private _copilotRoot;
    private _builtinPromptsCache;
    protected createPromptFilesLocator(): PromptFilesLocator;
    private getCopilotRoot;
    /**
     * Returns built-in prompt files bundled with the Sessions app.
     */
    private getBuiltinPromptFiles;
    private discoverBuiltinPrompts;
    /**
     * Override to include built-in prompts and filter out those overridden
     * by user or workspace prompts with the same name.
     */
    listPromptFiles(type: PromptsType, token: CancellationToken): Promise<readonly IPromptPath[]>;
    listPromptFilesForStorage(type: PromptsType, storage: PromptsStorage, token: CancellationToken): Promise<readonly IPromptPath[]>;
    /**
     * Override to use ~/.copilot as the user-level source folder for creation,
     * instead of the VS Code profile's promptsHome.
     */
    getSourceFolders(type: PromptsType): Promise<readonly IPromptPath[]>;
}
