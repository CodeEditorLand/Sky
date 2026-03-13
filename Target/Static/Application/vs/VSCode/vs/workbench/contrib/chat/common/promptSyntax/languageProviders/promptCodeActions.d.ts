import { CancellationToken } from '../../../../../../base/common/cancellation.js';
import { Range } from '../../../../../../editor/common/core/range.js';
import { CodeActionContext, CodeActionList, CodeActionProvider } from '../../../../../../editor/common/languages.js';
import { ITextModel } from '../../../../../../editor/common/model.js';
import { ILanguageModelToolsService } from '../../tools/languageModelToolsService.js';
import { IPromptsService } from '../service/promptsService.js';
import { Selection } from '../../../../../../editor/common/core/selection.js';
import { IFileService } from '../../../../../../platform/files/common/files.js';
import { IMarkerService } from '../../../../../../platform/markers/common/markers.js';
export declare class PromptCodeActionProvider implements CodeActionProvider {
    private readonly promptsService;
    private readonly languageModelToolsService;
    private readonly fileService;
    private readonly markerService;
    /**
     * Debug display name for this provider.
     */
    readonly _debugDisplayName: string;
    constructor(promptsService: IPromptsService, languageModelToolsService: ILanguageModelToolsService, fileService: IFileService, markerService: IMarkerService);
    provideCodeActions(model: ITextModel, range: Range | Selection, context: CodeActionContext, token: CancellationToken): Promise<CodeActionList | undefined>;
    private getMarkers;
    private createCodeAction;
    private getUpdateModeCodeActions;
    private getMigrateModeFileCodeActions;
    private getUpdateToolsCodeActions;
}
