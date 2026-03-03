import { Disposable } from '../../../../base/common/lifecycle.js';
import { IClipboardService } from '../../../../platform/clipboard/common/clipboardService.js';
import { IHoverService } from '../../../../platform/hover/browser/hover.js';
/**
 * A button that appears in hover parts to copy their content to the clipboard.
 */
export declare class HoverCopyButton extends Disposable {
    private readonly _container;
    private readonly _getContent;
    private readonly _clipboardService;
    private readonly _hoverService;
    private readonly _button;
    constructor(_container: HTMLElement, _getContent: () => string, _clipboardService: IClipboardService, _hoverService: IHoverService);
    private _copyContent;
}
