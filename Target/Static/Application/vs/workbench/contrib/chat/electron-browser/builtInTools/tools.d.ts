import { Disposable } from '../../../../../base/common/lifecycle.js';
import { IInstantiationService } from '../../../../../platform/instantiation/common/instantiation.js';
import { IWorkbenchContribution } from '../../../../common/contributions.js';
import { ILanguageModelToolsConfirmationService } from '../../common/tools/languageModelToolsConfirmationService.js';
import { ILanguageModelToolsService } from '../../common/tools/languageModelToolsService.js';
export declare class NativeBuiltinToolsContribution extends Disposable implements IWorkbenchContribution {
    static readonly ID = "chat.nativeBuiltinTools";
    constructor(toolsService: ILanguageModelToolsService, instantiationService: IInstantiationService, confirmationService: ILanguageModelToolsConfirmationService);
}
