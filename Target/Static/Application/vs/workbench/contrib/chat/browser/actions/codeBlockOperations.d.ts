import { IBulkEditService } from '../../../../../editor/browser/services/bulkEditService.js';
import { ICodeEditorService } from '../../../../../editor/browser/services/codeEditorService.js';
import { ILanguageService } from '../../../../../editor/common/languages/language.js';
import { IDialogService } from '../../../../../platform/dialogs/common/dialogs.js';
import { IFileService } from '../../../../../platform/files/common/files.js';
import { IInstantiationService } from '../../../../../platform/instantiation/common/instantiation.js';
import { ILabelService } from '../../../../../platform/label/common/label.js';
import { ILogService } from '../../../../../platform/log/common/log.js';
import { IProgressService } from '../../../../../platform/progress/common/progress.js';
import { IQuickInputService } from '../../../../../platform/quickinput/common/quickInput.js';
import { IEditorService } from '../../../../services/editor/common/editorService.js';
import { ITextFileService } from '../../../../services/textfile/common/textfiles.js';
import { IAiEditTelemetryService } from '../../../editTelemetry/browser/telemetry/aiEditTelemetry/aiEditTelemetryService.js';
import { INotebookService } from '../../../notebook/common/notebookService.js';
import { ICodeMapperService } from '../../common/editing/chatCodeMapperService.js';
import { IChatService } from '../../common/chatService/chatService.js';
import { ICodeBlockActionContext } from '../widget/chatContentParts/codeBlockPart.js';
export declare class InsertCodeBlockOperation {
    private readonly editorService;
    private readonly textFileService;
    private readonly bulkEditService;
    private readonly codeEditorService;
    private readonly chatService;
    private readonly languageService;
    private readonly dialogService;
    private readonly aiEditTelemetryService;
    constructor(editorService: IEditorService, textFileService: ITextFileService, bulkEditService: IBulkEditService, codeEditorService: ICodeEditorService, chatService: IChatService, languageService: ILanguageService, dialogService: IDialogService, aiEditTelemetryService: IAiEditTelemetryService);
    run(context: ICodeBlockActionContext): Promise<void>;
    private handleNotebookEditor;
    private handleTextEditor;
    private notify;
}
export declare class ApplyCodeBlockOperation {
    private readonly editorService;
    private readonly textFileService;
    private readonly chatService;
    private readonly fileService;
    private readonly dialogService;
    private readonly logService;
    private readonly codeMapperService;
    private readonly progressService;
    private readonly quickInputService;
    private readonly labelService;
    private readonly instantiationService;
    private readonly notebookService;
    constructor(editorService: IEditorService, textFileService: ITextFileService, chatService: IChatService, fileService: IFileService, dialogService: IDialogService, logService: ILogService, codeMapperService: ICodeMapperService, progressService: IProgressService, quickInputService: IQuickInputService, labelService: ILabelService, instantiationService: IInstantiationService, notebookService: INotebookService);
    run(context: ICodeBlockActionContext): Promise<void>;
    private evaluateURIToUse;
    private handleNotebookEditor;
    private handleTextEditor;
    private getTextEdits;
    private getNotebookEdits;
    private waitForFirstElement;
    private applyWithInlinePreview;
    private applyNotebookEditsWithInlinePreview;
    private tryToRevealCodeBlock;
    private notify;
}
/**
 * Returns:
 *  - level: the line's the ident level in tabs
 *  - length: the number of characters of the leading whitespace
 */
export declare function computeIndentation(line: string, tabSize: number): {
    level: number;
    length: number;
};
