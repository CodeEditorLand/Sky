import * as domSanitize from '../../../../base/browser/domSanitize.js';
import { MarkdownSanitizerConfig } from '../../../../base/browser/markdownRenderer.js';
import { CodeWindow } from '../../../../base/browser/window.js';
import type * as marked from '../../../../base/common/marked/marked.js';
import { MarkedKatexExtension } from '../common/markedKatexExtension.js';
export declare class MarkedKatexSupport {
    static getSanitizerOptions(baseConfig: {
        readonly allowedTags: readonly string[];
        readonly allowedAttributes: ReadonlyArray<string | domSanitize.SanitizeAttributeRule>;
    }): MarkdownSanitizerConfig;
    private static tempSanitizerRule;
    private static sanitizeStyles;
    private static sanitizeKatexStyles;
    private static _katex?;
    private static _katexPromise;
    static getExtension(window: CodeWindow, options?: MarkedKatexExtension.MarkedKatexOptions): marked.MarkedExtension | undefined;
    static loadExtension(window: CodeWindow, options?: MarkedKatexExtension.MarkedKatexOptions): Promise<marked.MarkedExtension>;
    static ensureKatexStyles(window: CodeWindow): void;
}
