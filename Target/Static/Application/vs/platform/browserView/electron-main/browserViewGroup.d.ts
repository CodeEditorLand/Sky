import { Disposable } from '../../../base/common/lifecycle.js';
import { Event } from '../../../base/common/event.js';
import { BrowserView } from './browserView.js';
import { ICDPTarget, CDPBrowserVersion, CDPWindowBounds, CDPTargetInfo, ICDPConnection, ICDPBrowserTarget } from '../common/cdp/types.js';
import { IBrowserViewGroup, IBrowserViewGroupViewEvent } from '../common/browserViewGroup.js';
import { IBrowserViewCDPProxyServer } from './browserViewCDPProxyServer.js';
import { IBrowserViewMainService } from './browserViewMainService.js';
/**
 * An isolated group of {@link BrowserView} instances exposed as CDP targets.
 *
 * Each group represents an independent CDP "browser" endpoint
 * (`/devtools/browser/{id}`). Different groups can expose different
 * subsets of browser views, enabling selective target visibility across
 * CDP sessions.
 *
 * Created via {@link BrowserViewGroupMainService.createGroup}.
 */
export declare class BrowserViewGroup extends Disposable implements ICDPBrowserTarget, IBrowserViewGroup {
    readonly id: string;
    private readonly browserViewMainService;
    private readonly cdpProxyServer;
    private readonly views;
    private readonly viewListeners;
    /** All context IDs known to this group, including those from views added to it. */
    private readonly knownContextIds;
    /** Browser context IDs created by this group via {@link createBrowserContext}. */
    private readonly ownedContextIds;
    private readonly _onTargetCreated;
    readonly onTargetCreated: Event<BrowserView>;
    private readonly _onTargetDestroyed;
    readonly onTargetDestroyed: Event<BrowserView>;
    private readonly _onDidAddView;
    readonly onDidAddView: Event<IBrowserViewGroupViewEvent>;
    private readonly _onDidRemoveView;
    readonly onDidRemoveView: Event<IBrowserViewGroupViewEvent>;
    private readonly _onDidDestroy;
    readonly onDidDestroy: Event<void>;
    constructor(id: string, browserViewMainService: IBrowserViewMainService, cdpProxyServer: IBrowserViewCDPProxyServer);
    /**
     * Add a {@link BrowserView} to this group.
     * Fires {@link onDidAddView} and {@link onTargetCreated}.
     * Automatically removes the view when it closes.
     */
    addView(viewId: string): Promise<void>;
    /**
     * Remove a {@link BrowserView} from this group.
     * Fires {@link onDidRemoveView} and {@link onTargetDestroyed} if the view was tracked.
     */
    removeView(viewId: string): Promise<void>;
    getVersion(): CDPBrowserVersion;
    getWindowForTarget(target: ICDPTarget): {
        windowId: number;
        bounds: CDPWindowBounds;
    };
    attach(): Promise<ICDPConnection>;
    getTargetInfo(): Promise<CDPTargetInfo>;
    getTargets(): IterableIterator<BrowserView>;
    createTarget(url: string, browserContextId?: string): Promise<ICDPTarget>;
    activateTarget(target: ICDPTarget): Promise<void>;
    closeTarget(target: ICDPTarget): Promise<boolean>;
    /**
     * Returns only the browser context IDs that are visible to this group,
     * i.e. contexts used by views currently in the group.
     */
    getBrowserContexts(): string[];
    createBrowserContext(): Promise<string>;
    disposeBrowserContext(browserContextId: string): Promise<void>;
    /**
     * Get a WebSocket endpoint URL for connecting to this group's CDP
     * session. The URL contains a short-lived, single-use token.
     */
    getDebugWebSocketEndpoint(): Promise<string>;
    dispose(): void;
}
