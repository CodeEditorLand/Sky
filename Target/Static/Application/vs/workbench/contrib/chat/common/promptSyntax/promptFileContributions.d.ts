import { IWorkbenchContribution } from '../../../../common/contributions.js';
import { ILanguageFeaturesService } from '../../../../../editor/common/services/languageFeatures.js';
import { Disposable } from '../../../../../base/common/lifecycle.js';
import { IInstantiationService } from '../../../../../platform/instantiation/common/instantiation.js';
export declare class PromptLanguageFeaturesProvider extends Disposable implements IWorkbenchContribution {
    static readonly ID = "chat.promptLanguageFeatures";
    constructor(languageService: ILanguageFeaturesService, instantiationService: IInstantiationService);
}
