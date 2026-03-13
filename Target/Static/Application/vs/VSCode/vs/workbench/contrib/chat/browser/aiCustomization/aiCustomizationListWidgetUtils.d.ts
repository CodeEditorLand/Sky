import { PromptsType } from '../../common/promptSyntax/promptTypes.js';
/**
 * Truncates a description string to the first sentence, with a maximum character fallback.
 */
export declare function truncateToFirstSentence(text: string, maxChars?: number): string;
/**
 * Returns the secondary text shown for a customization item.
 */
export declare function getCustomizationSecondaryText(description: string | undefined, filename: string, promptType: PromptsType): string;
