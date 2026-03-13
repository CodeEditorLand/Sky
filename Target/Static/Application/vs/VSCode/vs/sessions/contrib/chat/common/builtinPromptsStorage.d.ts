import { URI } from '../../../../base/common/uri.js';
import { PromptsStorage } from '../../../../workbench/contrib/chat/common/promptSyntax/service/promptsService.js';
import { PromptsType } from '../../../../workbench/contrib/chat/common/promptSyntax/promptTypes.js';
/**
 * Extended storage type for AI Customization that includes built-in prompts
 * shipped with the application, alongside the core `PromptsStorage` values.
 */
export type AICustomizationPromptsStorage = PromptsStorage | 'builtin';
/**
 * Storage type discriminator for built-in prompts shipped with the application.
 */
export declare const BUILTIN_STORAGE: AICustomizationPromptsStorage;
/**
 * Prompt path for built-in prompts bundled with the Sessions app.
 */
export interface IBuiltinPromptPath {
    readonly uri: URI;
    readonly storage: AICustomizationPromptsStorage;
    readonly type: PromptsType;
}
