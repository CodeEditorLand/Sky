import { CancellationToken } from '../../../../../../base/common/cancellation.js';
import { Position } from '../../../../../../editor/common/core/position.js';
import { Hover, HoverContext, HoverProvider } from '../../../../../../editor/common/languages.js';
import { ITextModel } from '../../../../../../editor/common/model.js';
import { ILanguageModelsService } from '../../languageModels.js';
import { ILanguageModelToolsService } from '../../tools/languageModelToolsService.js';
import { IChatModeService } from '../../chatModes.js';
import { IPromptsService } from '../service/promptsService.js';
import { IConfigurationService } from '../../../../../../platform/configuration/common/configuration.js';
export declare class PromptHoverProvider implements HoverProvider {
    private readonly promptsService;
    private readonly languageModelToolsService;
    private readonly languageModelsService;
    private readonly chatModeService;
    private readonly configurationService;
    /**
     * Debug display name for this provider.
     */
    readonly _debugDisplayName: string;
    constructor(promptsService: IPromptsService, languageModelToolsService: ILanguageModelToolsService, languageModelsService: ILanguageModelsService, chatModeService: IChatModeService, configurationService: IConfigurationService);
    private createHover;
    provideHover(model: ITextModel, position: Position, token: CancellationToken, _context?: HoverContext): Promise<Hover | undefined>;
    private provideBodyHover;
    private provideHeaderHover;
    private getToolHover;
    private getToolHoverByName;
    private getToolsetHover;
    private getModelHover;
    private getAgentHover;
    private getHooksHover;
    /**
     * Recursively searches hook command items for hover information.
     * Handles both direct command objects and nested matcher format
     * (e.g., `{ matcher: "...", hooks: [{ type: command, ... }] }`).
     */
    private getHookCommandItemHover;
    private getHandsOffHover;
}
