import './media/chatInlineAnchorWidget.css';
import { Disposable, DisposableStore } from '../../../../../../base/common/lifecycle.js';
import { URI } from '../../../../../../base/common/uri.js';
import { IRange } from '../../../../../../editor/common/core/range.js';
import { ILanguageService } from '../../../../../../editor/common/languages/language.js';
import { IModelService } from '../../../../../../editor/common/services/model.js';
import { IMenuService } from '../../../../../../platform/actions/common/actions.js';
import { IContextKeyService } from '../../../../../../platform/contextkey/common/contextkey.js';
import { IContextMenuService } from '../../../../../../platform/contextview/browser/contextView.js';
import { IFileService } from '../../../../../../platform/files/common/files.js';
import { IHoverService } from '../../../../../../platform/hover/browser/hover.js';
import { IInstantiationService } from '../../../../../../platform/instantiation/common/instantiation.js';
import { ILabelService } from '../../../../../../platform/label/common/label.js';
import { IOpenerService } from '../../../../../../platform/opener/common/opener.js';
import { ITelemetryService } from '../../../../../../platform/telemetry/common/telemetry.js';
import { IThemeService } from '../../../../../../platform/theme/common/themeService.js';
import { INotebookDocumentService } from '../../../../../services/notebook/common/notebookDocumentService.js';
import { IWorkspaceSymbol } from '../../../../search/common/search.js';
import { IChatContentInlineReference } from '../../../common/chatService/chatService.js';
import { IChatMarkdownAnchorService } from './chatMarkdownAnchorService.js';
import { IConfigurationService } from '../../../../../../platform/configuration/common/configuration.js';
type ContentRefData = {
    readonly kind: 'symbol';
    readonly symbol: IWorkspaceSymbol;
} | {
    readonly kind?: undefined;
    readonly uri: URI;
    readonly range?: IRange;
};
type InlineAnchorWidgetMetadata = {
    vscodeLinkType: string;
    linkText?: string;
};
export declare function renderFileWidgets(element: HTMLElement, instantiationService: IInstantiationService, chatMarkdownAnchorService: IChatMarkdownAnchorService, disposables: DisposableStore): void;
export declare class InlineAnchorWidget extends Disposable {
    private readonly element;
    readonly inlineReference: IChatContentInlineReference;
    private readonly metadata;
    private readonly configurationService;
    private readonly notebookDocumentService;
    private readonly openerService;
    static readonly className = "chat-inline-anchor-widget";
    private readonly _chatResourceContext;
    readonly data: ContentRefData;
    constructor(element: HTMLAnchorElement | HTMLElement, inlineReference: IChatContentInlineReference, metadata: InlineAnchorWidgetMetadata | undefined, configurationService: IConfigurationService, originalContextKeyService: IContextKeyService, contextMenuService: IContextMenuService, fileService: IFileService, hoverService: IHoverService, instantiationService: IInstantiationService, labelService: ILabelService, languageService: ILanguageService, menuService: IMenuService, modelService: IModelService, telemetryService: ITelemetryService, themeService: IThemeService, notebookDocumentService: INotebookDocumentService, openerService: IOpenerService);
    getHTMLElement(): HTMLElement;
    private updateAppearance;
    private getCellIndex;
}
export {};
