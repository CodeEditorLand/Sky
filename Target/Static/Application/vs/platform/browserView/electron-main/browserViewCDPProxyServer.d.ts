import { Disposable } from '../../../base/common/lifecycle.js';
import { ILogService } from '../../log/common/log.js';
import { ICDPBrowserTarget } from '../common/cdp/types.js';
export declare const IBrowserViewCDPProxyServer: import("../../instantiation/common/instantiation.js").ServiceIdentifier<IBrowserViewCDPProxyServer>;
export interface IBrowserViewCDPProxyServer {
    readonly _serviceBrand: undefined;
    /**
     * Returns a debug endpoint with a short-lived, single-use token for a specific browser target.
     */
    getWebSocketEndpointForTarget(target: ICDPBrowserTarget): Promise<string>;
    /**
     * Unregister a previously registered browser target.
     */
    removeTarget(target: ICDPBrowserTarget): Promise<void>;
}
/**
 * WebSocket server that provides CDP debugging for browser views.
 *
 * Manages a registry of {@link ICDPBrowserTarget} instances, each reachable
 * at its own `/devtools/browser/{id}` WebSocket endpoint.
 */
export declare class BrowserViewCDPProxyServer extends Disposable implements IBrowserViewCDPProxyServer {
    private readonly logService;
    readonly _serviceBrand: undefined;
    private server;
    private port;
    private readonly tokens;
    private readonly targets;
    constructor(logService: ILogService);
    /**
     * Register a browser target and return a WebSocket endpoint URL for it.
     * The target is reachable at `/devtools/browser/{targetId}`.
     */
    getWebSocketEndpointForTarget(target: ICDPBrowserTarget): Promise<string>;
    /**
     * Unregister a previously registered browser target.
     */
    removeTarget(target: ICDPBrowserTarget): Promise<void>;
    private ensureServerStarted;
    private handleHttpRequest;
    private handleWebSocketUpgrade;
    /**
     * Wire a WebSocket (ISocket) to an ICDPConnection bidirectionally.
     * Returns a DisposableStore that cleans up all subscriptions.
     */
    private wireWebSocket;
    dispose(): void;
}
