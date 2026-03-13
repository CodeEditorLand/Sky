import { WebContentsView } from 'electron';
import { Disposable } from '../../../base/common/lifecycle.js';
import { Event } from '../../../base/common/event.js';
import { VSBuffer } from '../../../base/common/buffer.js';
import { IBrowserViewBounds, IBrowserViewDevToolsStateEvent, IBrowserViewFocusEvent, IBrowserViewKeyDownEvent, IBrowserViewState, IBrowserViewNavigationEvent, IBrowserViewLoadingEvent, IBrowserViewTitleChangeEvent, IBrowserViewFaviconChangeEvent, IBrowserViewNewPageRequest, IBrowserViewCaptureScreenshotOptions, IBrowserViewFindInPageOptions, IBrowserViewFindInPageResult, IBrowserViewVisibilityEvent } from '../common/browserView.js';
import { IWindowsMainService } from '../../windows/electron-main/windows.js';
import { ICodeWindow } from '../../window/electron-main/window.js';
import { IAuxiliaryWindowsMainService } from '../../auxiliaryWindow/electron-main/auxiliaryWindows.js';
import { ILogService } from '../../log/common/log.js';
import { ICDPTarget, ICDPConnection, CDPTargetInfo } from '../common/cdp/types.js';
import { BrowserSession } from './browserSession.js';
/**
 * Represents a single browser view instance with its WebContentsView and all associated logic.
 * This class encapsulates all operations and events for a single browser view.
 */
export declare class BrowserView extends Disposable implements ICDPTarget {
    readonly id: string;
    readonly session: BrowserSession;
    private readonly windowsMainService;
    private readonly auxiliaryWindowsMainService;
    private readonly logService;
    private readonly _view;
    private readonly _faviconRequestCache;
    private _lastScreenshot;
    private _lastFavicon;
    private _lastError;
    private _lastUserGestureTimestamp;
    private _browserZoomIndex;
    private _debugger;
    private _window;
    private _isSendingKeyEvent;
    private _isDisposed;
    private readonly _onDidNavigate;
    readonly onDidNavigate: Event<IBrowserViewNavigationEvent>;
    private readonly _onDidChangeLoadingState;
    readonly onDidChangeLoadingState: Event<IBrowserViewLoadingEvent>;
    private readonly _onDidChangeFocus;
    readonly onDidChangeFocus: Event<IBrowserViewFocusEvent>;
    private readonly _onDidChangeVisibility;
    readonly onDidChangeVisibility: Event<IBrowserViewVisibilityEvent>;
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
    private readonly _onDidFindInPage;
    readonly onDidFindInPage: Event<IBrowserViewFindInPageResult>;
    private readonly _onDidClose;
    readonly onDidClose: Event<void>;
    constructor(id: string, session: BrowserSession, createChildView: (options?: Electron.WebContentsViewConstructorOptions) => BrowserView, openContextMenu: (view: BrowserView, params: Electron.ContextMenuParams) => void, options: Electron.WebContentsViewConstructorOptions | undefined, windowsMainService: IWindowsMainService, auxiliaryWindowsMainService: IAuxiliaryWindowsMainService, logService: ILogService);
    private setupEventListeners;
    private consumePopupPermission;
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
    setBrowserZoomIndex(zoomIndex: number): void;
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
    reload(hard?: boolean): void;
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
     * Focus this view
     */
    focus(): Promise<void>;
    /**
     * Find text in the page
     */
    findInPage(text: string, options?: IBrowserViewFindInPageOptions): Promise<void>;
    /**
     * Stop finding in page
     */
    stopFindInPage(keepSelection?: boolean): Promise<void>;
    /**
     * Get the currently selected text in the browser view.
     * Returns immediately with empty string if the page is still loading.
     */
    getSelectedText(): Promise<string>;
    /**
     * Clear all storage data for this browser view's session
     */
    clearStorage(): Promise<void>;
    /**
     * Get the underlying WebContentsView
     */
    getWebContentsView(): WebContentsView;
    /**
     * Get the hosting Electron window for this view, if any.
     * This can be an auxiliary window, depending on where the view is currently hosted.
     */
    getElectronWindow(): Electron.BrowserWindow | undefined;
    /**
     * Get the main code window hosting this browser view, if any. This is used for routing commands from the browser view to the correct window.
     * If the browser view is hosted in an auxiliary window, this will return the parent code window of that auxiliary window.
     */
    getTopCodeWindow(): ICodeWindow | undefined;
    /**
     * Get CDP target info using Electron's real targetId.
     */
    getTargetInfo(): Promise<CDPTargetInfo>;
    /**
     * Attach to receive debugger events.
     * @returns A connection that can be disposed to detach
     */
    attach(): Promise<ICDPConnection>;
    dispose(): void;
    /**
     * Potentially handle an input event as a VS Code command.
     * Returns `true` if the event was forwarded to VS Code and should not be handled natively.
     */
    private tryHandleCommand;
    private _windowById;
    private _codeWindowById;
    private _auxiliaryWindowById;
}
