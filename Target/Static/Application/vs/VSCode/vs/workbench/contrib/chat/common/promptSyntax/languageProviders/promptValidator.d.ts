import { IModelService } from '../../../../../../editor/common/services/model.js';
import { IInstantiationService } from '../../../../../../platform/instantiation/common/instantiation.js';
import { IMarkerData, IMarkerService } from '../../../../../../platform/markers/common/markers.js';
import { IChatModeService } from '../../chatModes.js';
import { ILanguageModelsService } from '../../languageModels.js';
import { ILanguageModelToolsService } from '../../tools/languageModelToolsService.js';
import { PromptsType, Target } from '../promptTypes.js';
import { ParsedPromptFile, PromptHeader } from '../promptFileParser.js';
import { Disposable } from '../../../../../../base/common/lifecycle.js';
import { IFileService } from '../../../../../../platform/files/common/files.js';
import { IConfigurationService } from '../../../../../../platform/configuration/common/configuration.js';
import { IPromptsService } from '../service/promptsService.js';
import { ILabelService } from '../../../../../../platform/label/common/label.js';
import { URI } from '../../../../../../base/common/uri.js';
export declare const MARKERS_OWNER_ID = "prompts-diagnostics-provider";
export declare class PromptValidator {
    private readonly languageModelsService;
    private readonly languageModelToolsService;
    private readonly chatModeService;
    private readonly fileService;
    private readonly labelService;
    private readonly promptsService;
    private readonly configurationService;
    constructor(languageModelsService: ILanguageModelsService, languageModelToolsService: ILanguageModelToolsService, chatModeService: IChatModeService, fileService: IFileService, labelService: ILabelService, promptsService: IPromptsService, configurationService: IConfigurationService);
    validate(promptAST: ParsedPromptFile, promptType: PromptsType, report: (markers: IMarkerData) => void): Promise<void>;
    private validateFileName;
    private validateSkillFolderName;
    private validateBody;
    private validateHeader;
    private checkForInvalidArguments;
    private validateName;
    private validateDescription;
    private validateArgumentHint;
    private validateModel;
    private validateClaudeAttributes;
    private findModelByName;
    private validateAgent;
    private validateAgentValue;
    private validateTools;
    private validateVSCodeTools;
    private validateApplyTo;
    private validatePaths;
    private validateExcludeAgent;
    private validateHooks;
    private validateHookCommand;
    private validateHandoffs;
    private validateInfer;
    private validateTarget;
    private validateUserInvocable;
    private validateUserInvokable;
    private validateDisableModelInvocation;
    private validateAgentsAttribute;
    private validateGithubPermissions;
}
export declare const githubPermissionScopes: Record<string, {
    allowedValues: string[];
    description: string;
}>;
export declare function getValidAttributeNames(promptType: PromptsType, includeNonRecommended: boolean, target: Target): string[];
export declare function isNonRecommendedAttribute(attributeName: string): boolean;
export declare function getAttributeDescription(attributeName: string, promptType: PromptsType, target: Target): string | undefined;
export declare const knownGithubCopilotTools: {
    name: string;
    description: string;
}[];
export interface IValueEntry {
    readonly name: string;
    readonly description?: string;
}
export declare const knownClaudeTools: {
    name: string;
    description: string;
    toolEquivalent: string[];
}[];
export declare const knownClaudeModels: ({
    name: string;
    description: string;
    modelEquivalent: string;
} | {
    name: string;
    description: string;
    modelEquivalent: undefined;
})[];
export declare function mapClaudeModels(claudeModelNames: readonly string[]): readonly string[];
/**
 * Maps Claude tool names to their VS Code tool equivalents.
 */
export declare function mapClaudeTools(claudeToolNames: readonly string[]): string[];
export declare const claudeAgentAttributes: Record<string, {
    type: string;
    description: string;
    defaults?: string[];
    items?: IValueEntry[];
    enums?: IValueEntry[];
}>;
/**
 * Attributes supported in Claude rules files (`.claude/rules/*.md`).
 * Claude rules use `paths` instead of `applyTo` for glob patterns.
 */
export declare const claudeRulesAttributes: Record<string, {
    type: string;
    description: string;
    defaults?: string[];
    items?: IValueEntry[];
    enums?: IValueEntry[];
}>;
export declare function isVSCodeOrDefaultTarget(target: Target): boolean;
export declare function getTarget(promptType: PromptsType, header: PromptHeader | URI): Target;
export declare class PromptValidatorContribution extends Disposable {
    private modelService;
    private readonly markerService;
    private readonly promptsService;
    private readonly languageModelsService;
    private readonly languageModelToolsService;
    private readonly chatModeService;
    private readonly validator;
    private readonly localDisposables;
    constructor(modelService: IModelService, instantiationService: IInstantiationService, markerService: IMarkerService, promptsService: IPromptsService, languageModelsService: ILanguageModelsService, languageModelToolsService: ILanguageModelToolsService, chatModeService: IChatModeService);
    updateRegistration(): void;
}
