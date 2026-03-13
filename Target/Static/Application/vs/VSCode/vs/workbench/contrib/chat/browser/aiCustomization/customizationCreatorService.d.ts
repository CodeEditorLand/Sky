import { IAICustomizationWorkspaceService } from '../../common/aiCustomizationWorkspaceService.js';
import { IChatWidgetService } from '../chat.js';
import { IChatService } from '../../common/chatService/chatService.js';
import { PromptsType } from '../../common/promptSyntax/promptTypes.js';
import { IPromptsService } from '../../common/promptSyntax/service/promptsService.js';
import { URI } from '../../../../../base/common/uri.js';
import { ICommandService } from '../../../../../platform/commands/common/commands.js';
import { IQuickInputService } from '../../../../../platform/quickinput/common/quickInput.js';
/**
 * Service that opens an AI-guided chat session to help the user create
 * a new customization (agent, skill, instructions, prompt, hook).
 *
 * Opens a new chat in agent mode, then sends a request with hidden
 * system instructions (modeInstructions) that guide the AI through
 * the creation process. The user sees only their message.
 */
export declare class CustomizationCreatorService {
    private readonly commandService;
    private readonly chatService;
    private readonly chatWidgetService;
    private readonly workspaceService;
    private readonly promptsService;
    private readonly quickInputService;
    constructor(commandService: ICommandService, chatService: IChatService, chatWidgetService: IChatWidgetService, workspaceService: IAICustomizationWorkspaceService, promptsService: IPromptsService, quickInputService: IQuickInputService);
    createWithAI(type: PromptsType): Promise<void>;
    /**
     * Resolves the workspace directory for a new customization file based on the
     * active project root.
     */
    resolveTargetDirectory(type: PromptsType): URI | undefined;
    /**
     * Resolves the user-level directory for a new customization file.
     */
    resolveUserDirectory(type: PromptsType): Promise<URI | undefined>;
}
/**
 * Resolves the workspace directory for a new customization file based on the active project root.
 */
export declare function resolveWorkspaceTargetDirectory(workspaceService: IAICustomizationWorkspaceService, type: PromptsType): URI | undefined;
/**
 * Resolves the user-level directory for a new customization file.
 * Delegates to IPromptsService.getSourceFolders() which returns the appropriate
 * user root (VS Code profile in core, ~/.copilot in sessions).
 */
export declare function resolveUserTargetDirectory(promptsService: IPromptsService, type: PromptsType): Promise<URI | undefined>;
