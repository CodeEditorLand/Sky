import { Disposable } from '../../../base/common/lifecycle.js';
import { ILogService } from '../../log/common/log.js';
import { CDPTargetInfo, ICDPConnection, ICDPTarget } from '../common/cdp/types.js';
import { BrowserView } from './browserView.js';
/**
 * Wraps a browser view's Electron debugger with per-client session management.
 *
 * Each client gets their own Electron debugger session, providing true isolation
 * just like connecting multiple DevTools clients to a real Chrome instance.
 */
export declare class BrowserViewDebugger extends Disposable implements ICDPTarget {
    private readonly view;
    private readonly logService;
    /** Map from CDP sessionId to the per-connection event emitter */
    private readonly _sessions;
    /**
     * The real CDP targetId discovered from Target.getTargets().
     * Ideally this could be fetched synchronously from the WebContents,
     * but in practice we need to query Electron's debugger API asynchronously to find it.
     */
    private _realTargetId;
    private _initializePromise;
    private readonly _messageHandler;
    private readonly _electronDebugger;
    constructor(view: BrowserView, logService: ILogService);
    /**
     * Attach to this debugger.
     * Creates a dedicated CDP session and returns a connection.
     * Dispose the returned connection to detach.
     */
    attach(): Promise<ICDPConnection>;
    /**
     * Get CDP target info.
     * Initializes the debugger if not already done.
     */
    getTargetInfo(): Promise<CDPTargetInfo>;
    /**
     * Initialize the debugger early to discover the real targetId.
     */
    private initialize;
    /**
     * Discover the real targetId for this WebContents
     */
    private discoverRealTargetId;
    /**
     * Attach to the Electron debugger
     */
    private attachElectronDebugger;
    /**
     * Route a CDP event to the correct connection by sessionId.
     * Fires on the per-connection session for the proxy to handle.
     */
    private routeCDPEvent;
    /**
     * Detach from the Electron debugger
     */
    private detachElectronDebugger;
    dispose(): void;
}
