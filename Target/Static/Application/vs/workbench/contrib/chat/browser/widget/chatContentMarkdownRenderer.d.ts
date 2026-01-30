import { IRenderedMarkdown, MarkdownRenderOptions } from '../../../../../base/browser/markdownRenderer.js';
import { IMarkdownString } from '../../../../../base/common/htmlContent.js';
import { IMarkdownRenderer, IMarkdownRendererService } from '../../../../../platform/markdown/browser/markdownRenderer.js';
import { ILanguageService } from '../../../../../editor/common/languages/language.js';
import { IConfigurationService } from '../../../../../platform/configuration/common/configuration.js';
import { IHoverService } from '../../../../../platform/hover/browser/hover.js';
import { IOpenerService } from '../../../../../platform/opener/common/opener.js';
export declare const allowedChatMarkdownHtmlTags: readonly string[];
/**
 * This wraps the MarkdownRenderer and applies sanitizer options needed for chat content.
 */
export declare class ChatContentMarkdownRenderer implements IMarkdownRenderer {
    private readonly hoverService;
    private readonly markdownRendererService;
    constructor(languageService: ILanguageService, openerService: IOpenerService, configurationService: IConfigurationService, hoverService: IHoverService, markdownRendererService: IMarkdownRendererService);
    render(markdown: IMarkdownString, options?: MarkdownRenderOptions, outElement?: HTMLElement): IRenderedMarkdown;
    private attachCustomHover;
}
