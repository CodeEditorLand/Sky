import { Event } from '../../../../base/common/event.js';
import { Disposable, IDisposable } from '../../../../base/common/lifecycle.js';
import { VSBuffer } from '../../../../base/common/buffer.js';
import { IPlaywrightService } from '../../../../platform/browserView/common/playwrightService.js';
import { IDialogService } from '../../../../platform/dialogs/common/dialogs.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { IBrowserViewBounds, IBrowserViewNavigationEvent, IBrowserViewLoadingEvent, IBrowserViewLoadError, IBrowserViewFocusEvent, IBrowserViewKeyDownEvent, IBrowserViewTitleChangeEvent, IBrowserViewFaviconChangeEvent, IBrowserViewNewPageRequest, IBrowserViewDevToolsStateEvent, IBrowserViewService, BrowserViewStorageScope, IBrowserViewCaptureScreenshotOptions, IBrowserViewFindInPageOptions, IBrowserViewFindInPageResult, IBrowserViewVisibilityEvent } from '../../../../platform/browserView/common/browserView.js';
import { IWorkspaceContextService } from '../../../../platform/workspace/common/workspace.js';
import { ITelemetryService } from '../../../../platform/telemetry/common/telemetry.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IWorkspaceTrustManagementService } from '../../../../platform/workspace/common/workspaceTrust.js';
export declare const IBrowserViewWorkbenchService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IBrowserViewWorkbenchService>;
/**
 * Workbench-level service for browser views that provides model-based access to browser views.
 * This service manages browser view models that proxy to the main process browser view service.
 */
export interface IBrowserViewWorkbenchService {
    readonly _serviceBrand: undefined;
    /**
     * Get or create a browser view model for the given ID
     * @param id The browser view identifier
     * @returns A browser view model that proxies to the main process
     */
    getOrCreateBrowserViewModel(id: string): Promise<IBrowserViewModel>;
    /**
     * Clear all storage data for the global browser session
     */
    clearGlobalStorage(): Promise<void>;
    /**
     * Clear all storage data for the current workspace browser session
     */
    clearWorkspaceStorage(): Promise<void>;
}
/**
 * A browser view model that represents a single browser view instance in the workbench.
 * This model proxies calls to the main process browser view service using its unique ID.
 */
export interface IBrowserViewModel extends IDisposable {
    readonly id: string;
    readonly url: string;
    readonly title: string;
    readonly favicon: string | undefined;
    readonly screenshot: VSBuffer | undefined;
    readonly loading: boolean;
    readonly focused: boolean;
    readonly visible: boolean;
    readonly canGoBack: boolean;
    readonly isDevToolsOpen: boolean;
    readonly canGoForward: boolean;
    readonly error: IBrowserViewLoadError | undefined;
    readonly storageScope: BrowserViewStorageScope;
    readonly sharedWithAgent: boolean;
    readonly onDidChangeSharedWithAgent: Event<boolean>;
    readonly onDidNavigate: Event<IBrowserViewNavigationEvent>;
    readonly onDidChangeLoadingState: Event<IBrowserViewLoadingEvent>;
    readonly onDidChangeFocus: Event<IBrowserViewFocusEvent>;
    readonly onDidChangeDevToolsState: Event<IBrowserViewDevToolsStateEvent>;
    readonly onDidKeyCommand: Event<IBrowserViewKeyDownEvent>;
    readonly onDidChangeTitle: Event<IBrowserViewTitleChangeEvent>;
    readonly onDidChangeFavicon: Event<IBrowserViewFaviconChangeEvent>;
    readonly onDidRequestNewPage: Event<IBrowserViewNewPageRequest>;
    readonly onDidFindInPage: Event<IBrowserViewFindInPageResult>;
    readonly onDidChangeVisibility: Event<IBrowserViewVisibilityEvent>;
    readonly onDidClose: Event<void>;
    readonly onWillDispose: Event<void>;
    initialize(): Promise<void>;
    layout(bounds: IBrowserViewBounds): Promise<void>;
    setVisible(visible: boolean): Promise<void>;
    loadURL(url: string): Promise<void>;
    goBack(): Promise<void>;
    goForward(): Promise<void>;
    reload(): Promise<void>;
    toggleDevTools(): Promise<void>;
    captureScreenshot(options?: IBrowserViewCaptureScreenshotOptions): Promise<VSBuffer>;
    dispatchKeyEvent(keyEvent: IBrowserViewKeyDownEvent): Promise<void>;
    focus(): Promise<void>;
    findInPage(text: string, options?: IBrowserViewFindInPageOptions): Promise<void>;
    stopFindInPage(keepSelection?: boolean): Promise<void>;
    getSelectedText(): Promise<string>;
    clearStorage(): Promise<void>;
    setSharedWithAgent(shared: boolean): Promise<void>;
}
export declare class BrowserViewModel extends Disposable implements IBrowserViewModel {
    readonly id: string;
    private readonly browserViewService;
    private readonly workspaceContextService;
    private readonly workspaceTrustManagementService;
    private readonly telemetryService;
    private readonly configurationService;
    private readonly playwrightService;
    private readonly dialogService;
    private readonly storageService;
    private _url;
    private _title;
    private _favicon;
    private _screenshot;
    private _loading;
    private _focused;
    private _visible;
    private _isDevToolsOpen;
    private _canGoBack;
    private _canGoForward;
    private _error;
    private _storageScope;
    private _sharedWithAgent;
    private readonly _onDidChangeSharedWithAgent;
    readonly onDidChangeSharedWithAgent: Event<boolean>;
    private readonly _onWillDispose;
    readonly onWillDispose: Event<void>;
    constructor(id: string, browserViewService: IBrowserViewService, workspaceContextService: IWorkspaceContextService, workspaceTrustManagementService: IWorkspaceTrustManagementService, telemetryService: ITelemetryService, configurationService: IConfigurationService, playwrightService: IPlaywrightService, dialogService: IDialogService, storageService: IStorageService);
    get url(): string;
    get title(): string;
    get favicon(): string | undefined;
    get loading(): boolean;
    get focused(): boolean;
    get visible(): boolean;
    get isDevToolsOpen(): boolean;
    get canGoBack(): boolean;
    get canGoForward(): boolean;
    get screenshot(): VSBuffer | undefined;
    get error(): IBrowserViewLoadError | undefined;
    get storageScope(): BrowserViewStorageScope;
    get sharedWithAgent(): boolean;
    get onDidNavigate(): Event<IBrowserViewNavigationEvent>;
    get onDidChangeLoadingState(): Event<IBrowserViewLoadingEvent>;
    get onDidChangeFocus(): Event<IBrowserViewFocusEvent>;
    get onDidChangeDevToolsState(): Event<IBrowserViewDevToolsStateEvent>;
    get onDidKeyCommand(): Event<IBrowserViewKeyDownEvent>;
    get onDidChangeTitle(): Event<IBrowserViewTitleChangeEvent>;
    get onDidChangeFavicon(): Event<IBrowserViewFaviconChangeEvent>;
    get onDidRequestNewPage(): Event<IBrowserViewNewPageRequest>;
    get onDidFindInPage(): Event<IBrowserViewFindInPageResult>;
    get onDidChangeVisibility(): Event<IBrowserViewVisibilityEvent>;
    get onDidClose(): Event<void>;
    /**
     * Initialize the model with the current state from the main process
     */
    initialize(): Promise<void>;
    layout(bounds: IBrowserViewBounds): Promise<void>;
    setVisible(visible: boolean): Promise<void>;
    loadURL(url: string): Promise<void>;
    goBack(): Promise<void>;
    goForward(): Promise<void>;
    reload(): Promise<void>;
    toggleDevTools(): Promise<void>;
    captureScreenshot(options?: IBrowserViewCaptureScreenshotOptions): Promise<VSBuffer>;
    dispatchKeyEvent(keyEvent: IBrowserViewKeyDownEvent): Promise<void>;
    focus(): Promise<void>;
    findInPage(text: string, options?: IBrowserViewFindInPageOptions): Promise<void>;
    stopFindInPage(keepSelection?: boolean): Promise<void>;
    getSelectedText(): Promise<string>;
    clearStorage(): Promise<void>;
    private static readonly SHARE_DONT_ASK_KEY;
    setSharedWithAgent(shared: boolean): Promise<void>;
    private _setSharedWithAgent;
    /**
     * Log navigation telemetry event
     */
    private logNavigationTelemetry;
    dispose(): void;
}
