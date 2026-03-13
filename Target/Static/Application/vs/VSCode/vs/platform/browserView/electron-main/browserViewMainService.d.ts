import { Event } from '../../../base/common/event.js';
import { Disposable } from '../../../base/common/lifecycle.js';
import { VSBuffer } from '../../../base/common/buffer.js';
import { IBrowserViewBounds, IBrowserViewKeyDownEvent, IBrowserViewState, IBrowserViewService, BrowserViewStorageScope, IBrowserViewCaptureScreenshotOptions, IBrowserViewFindInPageOptions } from '../common/browserView.js';
import { ICDPTarget, CDPBrowserVersion, CDPWindowBounds, CDPTargetInfo, ICDPConnection, ICDPBrowserTarget } from '../common/cdp/types.js';
import { IEnvironmentMainService } from '../../environment/electron-main/environmentMainService.js';
import { IInstantiationService } from '../../instantiation/common/instantiation.js';
import { BrowserView } from './browserView.js';
import { IWindowsMainService } from '../../windows/electron-main/windows.js';
import { IProductService } from '../../product/common/productService.js';
import { ITelemetryService } from '../../telemetry/common/telemetry.js';
import { INativeHostMainService } from '../../native/electron-main/nativeHostMainService.js';
export declare const IBrowserViewMainService: import("../../instantiation/common/instantiation.js").ServiceIdentifier<IBrowserViewMainService>;
export interface IBrowserViewMainService extends IBrowserViewService, ICDPBrowserTarget {
    readonly _serviceBrand: undefined;
    tryGetBrowserView(id: string): BrowserView | undefined;
}
export declare class BrowserViewMainService extends Disposable implements IBrowserViewMainService {
    private readonly environmentMainService;
    private readonly instantiationService;
    private readonly windowsMainService;
    private readonly productService;
    private readonly telemetryService;
    private readonly nativeHostMainService;
    readonly _serviceBrand: undefined;
    /**
     * Check if a webContents belongs to an integrated browser view.
     * Delegates to {@link BrowserSession.isBrowserViewWebContents}.
     */
    static isBrowserViewWebContents(contents: Electron.WebContents): boolean;
    private readonly browserViews;
    private _keybindings;
    private readonly _onTargetCreated;
    readonly onTargetCreated: Event<BrowserView>;
    private readonly _onTargetDestroyed;
    readonly onTargetDestroyed: Event<BrowserView>;
    constructor(environmentMainService: IEnvironmentMainService, instantiationService: IInstantiationService, windowsMainService: IWindowsMainService, productService: IProductService, telemetryService: ITelemetryService, nativeHostMainService: INativeHostMainService);
    getOrCreateBrowserView(id: string, scope: BrowserViewStorageScope, workspaceId?: string): Promise<IBrowserViewState>;
    tryGetBrowserView(id: string): BrowserView | undefined;
    getVersion(): CDPBrowserVersion;
    getWindowForTarget(target: ICDPTarget): {
        windowId: number;
        bounds: CDPWindowBounds;
    };
    attach(): Promise<ICDPConnection>;
    getTargetInfo(): Promise<CDPTargetInfo>;
    getTargets(): IterableIterator<BrowserView>;
    createTarget(url: string, browserContextId?: string, windowId?: number): Promise<ICDPTarget>;
    activateTarget(target: ICDPTarget): Promise<void>;
    closeTarget(target: ICDPTarget): Promise<boolean>;
    getBrowserContexts(): string[];
    createBrowserContext(): Promise<string>;
    disposeBrowserContext(browserContextId: string): Promise<void>;
    /**
     * Get a browser view or throw if not found
     */
    private _getBrowserView;
    onDynamicDidNavigate(id: string): Event<import("../common/browserView.js").IBrowserViewNavigationEvent>;
    onDynamicDidChangeLoadingState(id: string): Event<import("../common/browserView.js").IBrowserViewLoadingEvent>;
    onDynamicDidChangeFocus(id: string): Event<import("../common/browserView.js").IBrowserViewFocusEvent>;
    onDynamicDidChangeVisibility(id: string): Event<import("../common/browserView.js").IBrowserViewVisibilityEvent>;
    onDynamicDidChangeDevToolsState(id: string): Event<import("../common/browserView.js").IBrowserViewDevToolsStateEvent>;
    onDynamicDidKeyCommand(id: string): Event<IBrowserViewKeyDownEvent>;
    onDynamicDidChangeTitle(id: string): Event<import("../common/browserView.js").IBrowserViewTitleChangeEvent>;
    onDynamicDidChangeFavicon(id: string): Event<import("../common/browserView.js").IBrowserViewFaviconChangeEvent>;
    onDynamicDidRequestNewPage(id: string): Event<import("../common/browserView.js").IBrowserViewNewPageRequest>;
    onDynamicDidFindInPage(id: string): Event<import("../common/browserView.js").IBrowserViewFindInPageResult>;
    onDynamicDidClose(id: string): Event<void>;
    getState(id: string): Promise<IBrowserViewState>;
    destroyBrowserView(id: string): Promise<void>;
    layout(id: string, bounds: IBrowserViewBounds): Promise<void>;
    setVisible(id: string, visible: boolean): Promise<void>;
    loadURL(id: string, url: string): Promise<void>;
    getURL(id: string): Promise<string>;
    goBack(id: string): Promise<void>;
    goForward(id: string): Promise<void>;
    reload(id: string, hard?: boolean): Promise<void>;
    toggleDevTools(id: string): Promise<void>;
    canGoBack(id: string): Promise<boolean>;
    canGoForward(id: string): Promise<boolean>;
    captureScreenshot(id: string, options?: IBrowserViewCaptureScreenshotOptions): Promise<VSBuffer>;
    dispatchKeyEvent(id: string, keyEvent: IBrowserViewKeyDownEvent): Promise<void>;
    focus(id: string): Promise<void>;
    findInPage(id: string, text: string, options?: IBrowserViewFindInPageOptions): Promise<void>;
    stopFindInPage(id: string, keepSelection?: boolean): Promise<void>;
    getSelectedText(id: string): Promise<string>;
    clearStorage(id: string): Promise<void>;
    setBrowserZoomIndex(id: string, zoomIndex: number): Promise<void>;
    clearGlobalStorage(): Promise<void>;
    clearWorkspaceStorage(workspaceId: string): Promise<void>;
    updateKeybindings(keybindings: {
        [commandId: string]: string;
    }): Promise<void>;
    /**
     * Create a browser view backed by the given {@link BrowserSession}.
     */
    private createBrowserView;
    private openNew;
    private showContextMenu;
}
