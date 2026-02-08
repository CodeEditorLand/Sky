import { URI } from '../../../../../base/common/uri.js';
import { IRange } from '../../../../../editor/common/core/range.js';
import { IChatProgressRenderableResponseContent, IChatProgressResponseContent } from '../model/chatModel.js';
export declare const contentRefUrl = "http://_vscodecontentref_";
export declare function annotateSpecialMarkdownContent(response: Iterable<IChatProgressResponseContent>): IChatProgressRenderableResponseContent[];
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
export declare function extractVulnerabilitiesFromText(text: string): {
    newText: string;
    vulnerabilities: IMarkdownVulnerability[];
};
