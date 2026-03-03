import { Disposable } from '../../../../base/common/lifecycle.js';
import { Event } from '../../../../base/common/event.js';
import { CDPEvent, ICDPConnection, ICDPBrowserTarget } from './types.js';
/**
 * CDP protocol handler for browser-level connections.
 * Manages Browser.* and Target.* domains, routes page-level commands
 * to the appropriate attached session by sessionId.
 */
export declare class CDPBrowserProxy extends Disposable implements ICDPConnection {
    private readonly browserTarget;
    readonly sessionId: string;
    private _isAttachedToBrowserTarget;
    private _autoAttach;
    private _discover;
    private readonly _targets;
    private readonly _sessions;
    private readonly _sessionTargetIds;
    private readonly _autoAttachments;
    private readonly _handlers;
    constructor(browserTarget: ICDPBrowserTarget);
    private readonly _onEvent;
    readonly onEvent: Event<CDPEvent>;
    private readonly _onClose;
    readonly onClose: Event<void>;
    /**
     * Send a CDP message and await the result.
     * Browser-level handlers (Browser.*, Target.*) are checked first.
     * Other commands are routed to the page session identified by sessionId.
     */
    sendMessage(method: string, params?: unknown, sessionId?: string): Promise<unknown>;
    private handleBrowserGetWindowForTarget;
    private handleTargetGetBrowserContexts;
    private handleTargetCreateBrowserContext;
    private handleTargetDisposeBrowserContext;
    private handleTargetAttachToBrowserTarget;
    private handleTargetActivateTarget;
    private handleTargetSetAutoAttach;
    private handleTargetSetDiscoverTargets;
    private handleTargetGetTargets;
    private handleTargetGetTargetInfo;
    private handleTargetAttachToTarget;
    private handleTargetDetachFromTarget;
    private handleTargetCreateTarget;
    private handleTargetCloseTarget;
    /** Find the targetId for a given sessionId */
    private findTargetIdForSession;
    /** Send a browser-level event to the client */
    private sendBrowserEvent;
    /** Attach to a target, creating a named session */
    private attachToTarget;
}
