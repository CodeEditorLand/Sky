import { WebContentsView } from 'electron';
import { Disposable } from '../../../base/common/lifecycle.js';
import { Event } from '../../../base/common/event.js';
import { VSBuffer } from '../../../base/common/buffer.js';
import { IBrowserViewBounds, IBrowserViewDevToolsStateEvent, IBrowserViewFocusEvent, IBrowserViewKeyDownEvent, IBrowserViewState, IBrowserViewNavigationEvent, IBrowserViewLoadingEvent, IBrowserViewTitleChangeEvent, IBrowserViewFaviconChangeEvent, IBrowserViewNewPageRequest, BrowserViewStorageScope, IBrowserViewCaptureScreenshotOptions } from '../common/browserView.js';
import { IWindowsMainService } from '../../windows/electron-main/windows.js';
import { IAuxiliaryWindowsMainService } from '../../auxiliaryWindow/electron-main/auxiliaryWindows.js';
/**
 * Represents a single browser view instance with its WebContentsView and all associated logic.
 * This class encapsulates all operations and events for a single browser view.
 */
export declare class BrowserView extends Disposable {
    private readonly storageScope;
    private readonly windowsMainService;
    private readonly auxiliaryWindowsMainService;
    private readonly _view;
    private readonly _faviconRequestCache;
    private _lastScreenshot;
    private _lastFavicon;
    private _lastError;
    private _window;
    private _isSendingKeyEvent;
    private readonly _onDidNavigate;
    readonly onDidNavigate: Event<IBrowserViewNavigationEvent>;
    private readonly _onDidChangeLoadingState;
    readonly onDidChangeLoadingState: Event<IBrowserViewLoadingEvent>;
    private readonly _onDidChangeFocus;
    readonly onDidChangeFocus: Event<IBrowserViewFocusEvent>;
    private readonly _onDidChangeDevToolsState;
    readonly onDidChangeDevToolsState: Event<IBrowserViewDevToolsStateEvent>;
    private readonly _onDidKeyCommand;
    readonly onDidKeyCommand: Event<IBrowserViewKeyDownEvent>;
    private readonly _onDidChangeTitle;
    readonly onDidChangeTitle: Event<IBrowserViewTitleChangeEvent>;
    private readonly _onDidChangeFavicon;
    readonly onDidChangeFavicon: Event<IBrowserViewFaviconChangeEvent>;
    private readonly _onDidRequestNewPage;
    readonly onDidRequestNewPage: Event<IBrowserViewNewPageRequest>;
    private readonly _onDidClose;
    readonly onDidClose: Event<void>;
    constructor(viewSession: Electron.Session, storageScope: BrowserViewStorageScope, windowsMainService: IWindowsMainService, auxiliaryWindowsMainService: IAuxiliaryWindowsMainService);
    private setupEventListeners;
    get webContents(): Electron.WebContents;
    /**
     * Get the current state of this browser view
     */
    getState(): IBrowserViewState;
    /**
     * Toggle developer tools for this browser view.
     */
    toggleDevTools(): void;
    /**
     * Update the layout bounds of this view
     */
    layout(bounds: IBrowserViewBounds): void;
    /**
     * Set the visibility of this view
     */
    setVisible(visible: boolean): void;
    /**
     * Load a URL in this view
     */
    loadURL(url: string): Promise<void>;
    /**
     * Get the current URL
     */
    getURL(): string;
    /**
     * Navigate back in history
     */
    goBack(): void;
    /**
     * Navigate forward in history
     */
    goForward(): void;
    /**
     * Reload the current page
     */
    reload(): void;
    /**
     * Check if the view can navigate back
     */
    canGoBack(): boolean;
    /**
     * Check if the view can navigate forward
     */
    canGoForward(): boolean;
    /**
     * Capture a screenshot of this view
     */
    captureScreenshot(options?: IBrowserViewCaptureScreenshotOptions): Promise<VSBuffer>;
    /**
     * Dispatch a keyboard event to this view
     */
    dispatchKeyEvent(keyEvent: IBrowserViewKeyDownEvent): Promise<void>;
    /**
     * Set the zoom factor of this view
     */
    setZoomFactor(zoomFactor: number): Promise<void>;
    /**
     * Focus this view
     */
    focus(): Promise<void>;
    /**
     * Get the underlying WebContentsView
     */
    getWebContentsView(): WebContentsView;
    dispose(): void;
    /**
     * Potentially handle an input event as a VS Code command.
     * Returns `true` if the event was forwarded to VS Code and should not be handled natively.
     */
    private tryHandleCommand;
    private windowById;
    private codeWindowById;
    private auxiliaryWindowById;
}
