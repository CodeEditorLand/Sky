import { CancellationToken } from '../../../../base/common/cancellation.js';
import { Event } from '../../../../base/common/event.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { IServerChannel } from '../../../../base/parts/ipc/common/ipc.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { IMcpService } from './mcpTypes.js';
export declare class McpGatewayToolBrokerChannel extends Disposable implements IServerChannel<unknown> {
    private readonly _mcpService;
    private readonly _logService;
    private readonly _startupGracePeriodMs;
    private readonly _onDidChangeTools;
    private readonly _onDidChangeResources;
    private readonly _serverIdMap;
    private _nextServerIndex;
    /**
     * Per-server promise that races server startup against the grace period timeout.
     * Once set for a server, subsequent list calls await the already-resolved promise
     * and return immediately instead of waiting again.
     *
     * The `resolved` flag tracks whether the promise has settled. If a server's
     * cacheState regresses to Unknown/Outdated after the promise resolved (e.g.
     * after a cache reset), `_waitForStartup` discards the stale entry and creates
     * a fresh race so the server gets another chance to start.
     */
    private readonly _startupGrace;
    constructor(_mcpService: IMcpService, _logService: ILogService, _startupGracePeriodMs?: number);
    private _getServerIndex;
    private _getServerByIndex;
    private _waitForStartup;
    private _shouldUseCachedData;
    listen<T>(_ctx: unknown, event: string): Event<T>;
    call<T>(_ctx: unknown, command: string, arg?: unknown, cancellationToken?: CancellationToken): Promise<T>;
    private _listTools;
    private _callTool;
    private _listResources;
    private _readResource;
    private _listResourceTemplates;
    private _ensureServerReady;
}
