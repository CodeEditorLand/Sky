import { SimpleFindWidget } from '../../codeEditor/browser/find/simpleFindWidget.js';
import { IContextViewService } from '../../../../platform/contextview/browser/contextView.js';
import { IContextKeyService, RawContextKey } from '../../../../platform/contextkey/common/contextkey.js';
import { IHoverService } from '../../../../platform/hover/browser/hover.js';
import { IKeybindingService } from '../../../../platform/keybinding/common/keybinding.js';
import { IBrowserViewModel } from '../common/browserView.js';
export declare const CONTEXT_BROWSER_FIND_WIDGET_VISIBLE: RawContextKey<boolean>;
export declare const CONTEXT_BROWSER_FIND_WIDGET_FOCUSED: RawContextKey<boolean>;
/**
 * Find widget for the integrated browser view.
 * Uses the SimpleFindWidget base class and communicates with the browser view model
 * to perform find operations in the rendered web page.
 */
export declare class BrowserFindWidget extends SimpleFindWidget {
    private readonly container;
    private _model;
    private readonly _modelDisposables;
    private readonly _findWidgetVisible;
    private readonly _findWidgetFocused;
    private _lastFindResult;
    private _hasFoundMatch;
    constructor(container: HTMLElement, contextViewService: IContextViewService, contextKeyService: IContextKeyService, hoverService: IHoverService, keybindingService: IKeybindingService);
    /**
     * Set the browser view model to use for find operations.
     * This should be called whenever the editor input changes.
     */
    setModel(model: IBrowserViewModel | undefined): void;
    reveal(initialInput?: string): void;
    hide(): void;
    find(previous: boolean): void;
    findFirst(): void;
    clear(): void;
    protected _onInputChanged(): boolean;
    protected _getResultCount(): Promise<{
        resultIndex: number;
        resultCount: number;
    } | undefined>;
    protected _onFocusTrackerFocus(): void;
    protected _onFocusTrackerBlur(): void;
    protected _onFindInputFocusTrackerFocus(): void;
    protected _onFindInputFocusTrackerBlur(): void;
}
