import '../widget/chatContentParts/media/chatInlineAnchorWidget.css';
import { DisposableStore } from '../../../../../base/common/lifecycle.js';
import { ILanguageService } from '../../../../../editor/common/languages/language.js';
import { IModelService } from '../../../../../editor/common/services/model.js';
import { IHoverService } from '../../../../../platform/hover/browser/hover.js';
import { ILabelService } from '../../../../../platform/label/common/label.js';
import { IOpenerService } from '../../../../../platform/opener/common/opener.js';
import { IChatDebugEventFileListContent } from '../../common/chatDebugService.js';
/**
 * Render a file list resolved content as a rich HTML element.
 */
export declare function renderCustomizationDiscoveryContent(content: IChatDebugEventFileListContent, openerService: IOpenerService, modelService: IModelService, languageService: ILanguageService, hoverService: IHoverService, labelService: ILabelService): {
    element: HTMLElement;
    disposables: DisposableStore;
};
/**
 * Convert a file list content to plain text for clipboard / editor output.
 */
export declare function fileListToPlainText(content: IChatDebugEventFileListContent): string;
