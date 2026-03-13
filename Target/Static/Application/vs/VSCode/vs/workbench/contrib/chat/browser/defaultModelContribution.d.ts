import { Disposable } from '../../../../base/common/lifecycle.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { ILanguageModelChatMetadata, ILanguageModelsService } from '../common/languageModels.js';
export interface DefaultModelArrays {
    readonly modelIds: string[];
    readonly modelLabels: string[];
    readonly modelDescriptions: string[];
}
export interface DefaultModelContributionOptions {
    /** Configuration key for the setting (used in schema notification). */
    readonly configKey: string;
    /** Configuration section id for `notifyConfigurationSchemaUpdated`, or `undefined` to skip notification. */
    readonly configSectionId: string | undefined;
    /** Log prefix, e.g. `'[PlanAgentDefaultModel]'`. */
    readonly logPrefix: string;
    /** Additional filter beyond `isUserSelectable`. Return `true` to include the model. */
    readonly filter?: (metadata: ILanguageModelChatMetadata) => boolean;
}
/**
 * Creates the initial static arrays used by configuration registration code.
 * The returned arrays are mutated in-place by {@link DefaultModelContribution}.
 */
export declare function createDefaultModelArrays(): DefaultModelArrays;
/**
 * Shared base class for workbench contributions that populate a dynamic enum
 * of language models for a settings picker.
 */
export declare abstract class DefaultModelContribution extends Disposable {
    private readonly _arrays;
    private readonly _options;
    private readonly _languageModelsService;
    private readonly _logService;
    constructor(_arrays: DefaultModelArrays, _options: DefaultModelContributionOptions, _languageModelsService: ILanguageModelsService, _logService: ILogService);
    private _updateModelValues;
}
