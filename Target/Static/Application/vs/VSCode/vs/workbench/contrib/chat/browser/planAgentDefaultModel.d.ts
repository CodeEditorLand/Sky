import { ILogService } from '../../../../platform/log/common/log.js';
import { ILanguageModelsService } from '../common/languageModels.js';
import { DefaultModelContribution } from './defaultModelContribution.js';
export declare class PlanAgentDefaultModel extends DefaultModelContribution {
    static readonly ID = "workbench.contrib.planAgentDefaultModel";
    static readonly modelIds: string[];
    static readonly modelLabels: string[];
    static readonly modelDescriptions: string[];
    constructor(languageModelsService: ILanguageModelsService, logService: ILogService);
}
