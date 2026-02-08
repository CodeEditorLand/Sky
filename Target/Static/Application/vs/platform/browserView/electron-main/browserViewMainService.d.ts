import { Disposable } from '../../../base/common/lifecycle.js';
import { VSBuffer } from '../../../base/common/buffer.js';
import { IBrowserViewBounds, IBrowserViewKeyDownEvent, IBrowserViewState, IBrowserViewService, BrowserViewStorageScope, IBrowserViewCaptureScreenshotOptions, IBrowserViewFindInPageOptions } from '../common/browserView.js';
import { IEnvironmentMainService } from '../../environment/electron-main/environmentMainService.js';
import { IInstantiationService } from '../../instantiation/common/instantiation.js';
import { BrowserView } from './browserView.js';
export declare const IBrowserViewMainService: import("../../instantiation/common/instantiation.js").ServiceIdentifier<IBrowserViewMainService>;
export interface IBrowserViewMainService extends IBrowserViewService {
    tryGetBrowserView(id: string): BrowserView | undefined;
}
export declare class BrowserViewMainService extends Disposable implements IBrowserViewMainService {
    private readonly environmentMainService;
    private readonly instantiationService;
    readonly _serviceBrand: undefined;
    /**
     * Check if a webContents belongs to an integrated browser view
    */
    private static readonly knownSessions;
    static isBrowserViewWebContents(contents: Electron.WebContents): boolean;
    private readonly browserViews;
    constructor(environmentMainService: IEnvironmentMainService, instantiationService: IInstantiationService);
    /**
     * Get the session for a browser view based on data storage setting and workspace
     */
    private getSession;
    private configureSession;
    /**
     * Create a child browser view (used by window.open handler)
     */
    private createBrowserView;
    getOrCreateBrowserView(id: string, scope: BrowserViewStorageScope, workspaceId?: string): Promise<IBrowserViewState>;
    tryGetBrowserView(id: string): BrowserView | undefined;
    /**
     * Get a browser view or throw if not found
     */
    private _getBrowserView;
    onDynamicDidNavigate(id: string): import("../../../workbench/workbench.web.main.internal.ts").Event<import("../common/browserView.js").IBrowserViewNavigationEvent>;
    onDynamicDidChangeLoadingState(id: string): import("../../../workbench/workbench.web.main.internal.ts").Event<import("../common/browserView.js").IBrowserViewLoadingEvent>;
    onDynamicDidChangeFocus(id: string): import("../../../workbench/workbench.web.main.internal.ts").Event<import("../common/browserView.js").IBrowserViewFocusEvent>;
    onDynamicDidChangeVisibility(id: string): import("../../../workbench/workbench.web.main.internal.ts").Event<import("../common/browserView.js").IBrowserViewVisibilityEvent>;
    onDynamicDidChangeDevToolsState(id: string): import("../../../workbench/workbench.web.main.internal.ts").Event<import("../common/browserView.js").IBrowserViewDevToolsStateEvent>;
    onDynamicDidKeyCommand(id: string): import("../../../workbench/workbench.web.main.internal.ts").Event<IBrowserViewKeyDownEvent>;
    onDynamicDidChangeTitle(id: string): import("../../../workbench/workbench.web.main.internal.ts").Event<import("../common/browserView.js").IBrowserViewTitleChangeEvent>;
    onDynamicDidChangeFavicon(id: string): import("../../../workbench/workbench.web.main.internal.ts").Event<import("../common/browserView.js").IBrowserViewFaviconChangeEvent>;
    onDynamicDidRequestNewPage(id: string): import("../../../workbench/workbench.web.main.internal.ts").Event<import("../common/browserView.js").IBrowserViewNewPageRequest>;
    onDynamicDidFindInPage(id: string): import("../../../workbench/workbench.web.main.internal.ts").Event<import("../common/browserView.js").IBrowserViewFindInPageResult>;
    onDynamicDidClose(id: string): import("../../../workbench/workbench.web.main.internal.ts").Event<void>;
    destroyBrowserView(id: string): Promise<void>;
    layout(id: string, bounds: IBrowserViewBounds): Promise<void>;
    setVisible(id: string, visible: boolean): Promise<void>;
    loadURL(id: string, url: string): Promise<void>;
    getURL(id: string): Promise<string>;
    goBack(id: string): Promise<void>;
    goForward(id: string): Promise<void>;
    reload(id: string): Promise<void>;
    toggleDevTools(id: string): Promise<void>;
    canGoBack(id: string): Promise<boolean>;
    canGoForward(id: string): Promise<boolean>;
    captureScreenshot(id: string, options?: IBrowserViewCaptureScreenshotOptions): Promise<VSBuffer>;
    dispatchKeyEvent(id: string, keyEvent: IBrowserViewKeyDownEvent): Promise<void>;
    setZoomFactor(id: string, zoomFactor: number): Promise<void>;
    focus(id: string): Promise<void>;
    findInPage(id: string, text: string, options?: IBrowserViewFindInPageOptions): Promise<void>;
    stopFindInPage(id: string, keepSelection?: boolean): Promise<void>;
    getSelectedText(id: string): Promise<string>;
    clearStorage(id: string): Promise<void>;
    clearGlobalStorage(): Promise<void>;
    clearWorkspaceStorage(workspaceId: string): Promise<void>;
}
