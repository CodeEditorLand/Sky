import { Disposable } from '../../../../../base/common/lifecycle.js';
import { IFileDialogService } from '../../../../../platform/dialogs/common/dialogs.js';
import { IFileService } from '../../../../../platform/files/common/files.js';
import { IInstantiationService } from '../../../../../platform/instantiation/common/instantiation.js';
import { ILabelService } from '../../../../../platform/label/common/label.js';
import { IStorageService } from '../../../../../platform/storage/common/storage.js';
import { IWorkbenchContribution } from '../../../../common/contributions.js';
import { ILanguageModelToolsConfirmationService } from '../../common/tools/languageModelToolsConfirmationService.js';
import { ILanguageModelToolsService } from '../../common/tools/languageModelToolsService.js';
export declare class NativeBuiltinToolsContribution extends Disposable implements IWorkbenchContribution {
    static readonly ID = "chat.nativeBuiltinTools";
    constructor(toolsService: ILanguageModelToolsService, instantiationService: IInstantiationService, confirmationService: ILanguageModelToolsConfirmationService, fileService: IFileService, storageService: IStorageService, fileDialogService: IFileDialogService, labelService: ILabelService);
}
