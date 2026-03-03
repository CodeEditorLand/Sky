import { ILogService } from '../../../../platform/log/common/log.js';
import { ILanguageModelsService } from '../../chat/common/languageModels.js';
import { DefaultModelContribution } from '../../chat/browser/defaultModelContribution.js';
export declare class InlineChatDefaultModel extends DefaultModelContribution {
    static readonly ID = "workbench.contrib.inlineChatDefaultModel";
    static readonly modelIds: string[];
    static readonly modelLabels: string[];
    static readonly modelDescriptions: string[];
    constructor(languageModelsService: ILanguageModelsService, logService: ILogService);
}
