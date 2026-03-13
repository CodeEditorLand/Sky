import { Disposable } from '../../../../base/common/lifecycle.js';
import { ILanguageFeaturesService } from '../../../../editor/common/services/languageFeatures.js';
import { IWorkbenchContribution } from '../../../common/contributions.js';
export declare class InlineCompletionSchemaContribution extends Disposable implements IWorkbenchContribution {
    private readonly _languageFeaturesService;
    static Id: string;
    constructor(_languageFeaturesService: ILanguageFeaturesService);
}
