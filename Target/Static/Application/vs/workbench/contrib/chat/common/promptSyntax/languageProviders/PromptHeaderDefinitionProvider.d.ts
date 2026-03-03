import { CancellationToken } from '../../../../../../base/common/cancellation.js';
import { Position } from '../../../../../../editor/common/core/position.js';
import { Definition, DefinitionProvider } from '../../../../../../editor/common/languages.js';
import { ITextModel } from '../../../../../../editor/common/model.js';
import { IChatModeService } from '../../chatModes.js';
import { IPromptsService } from '../service/promptsService.js';
export declare class PromptHeaderDefinitionProvider implements DefinitionProvider {
    private readonly promptsService;
    private readonly chatModeService;
    /**
     * Debug display name for this provider.
     */
    readonly _debugDisplayName: string;
    constructor(promptsService: IPromptsService, chatModeService: IChatModeService);
    provideDefinition(model: ITextModel, position: Position, token: CancellationToken): Promise<Definition | undefined>;
}
