import { URI } from '../../../../../base/common/uri.js';
import { IRange } from '../../../../../editor/common/core/range.js';
import { IChatProgressRenderableResponseContent, IChatProgressResponseContent } from '../model/chatModel.js';
export declare const contentRefUrl = "http://_vscodecontentref_";
export declare function annotateSpecialMarkdownContent(response: Iterable<IChatProgressResponseContent>): IChatProgressRenderableResponseContent[];
/**
 * Checks whether the end of a markdown string is inside a code context
 * (fenced code block or inline code span) where markdown link syntax
 * would be rendered as literal text.
 */
export declare function isInsideCodeContext(text: string): boolean;
export interface IMarkdownVulnerability {
    readonly title: string;
    readonly description: string;
    readonly range: IRange;
}
export declare function extractCodeblockUrisFromText(text: string): {
    uri: URI;
    isEdit?: boolean;
    subAgentInvocationId?: string;
    textWithoutResult: string;
} | undefined;
export declare function extractSubAgentInvocationIdFromText(text: string): string | undefined;
export declare function hasCodeblockUriTag(text: string): boolean;
export declare function hasEditCodeblockUriTag(text: string): boolean;
export declare function extractVulnerabilitiesFromText(text: string): {
    newText: string;
    vulnerabilities: IMarkdownVulnerability[];
};
