import './media/terminalResizeDimensionsOverlay.css';
import { Disposable } from '../../../../../base/common/lifecycle.js';
import type { IXtermTerminal } from '../../../terminal/browser/terminal.js';
export declare class TerminalResizeDimensionsOverlay extends Disposable {
    private readonly _container;
    private _resizeOverlay;
    private readonly _resizeOverlayHideTimeout;
    constructor(_container: HTMLElement, xterm: IXtermTerminal);
    private _handleDimensionsChanged;
    private _ensureResizeOverlay;
}
