import { CancellationToken } from '../../../../base/common/cancellation.js';
import { Event } from '../../../../base/common/event.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { IServerChannel } from '../../../../base/parts/ipc/common/ipc.js';
import { IMcpService } from './mcpTypes.js';
export declare class McpGatewayToolBrokerChannel extends Disposable implements IServerChannel<unknown> {
    private readonly _mcpService;
    private readonly _onDidChangeTools;
    private readonly _onDidChangeResources;
    private readonly _serverIdMap;
    private _nextServerIndex;
    constructor(_mcpService: IMcpService);
    private _getServerIndex;
    private _getServerByIndex;
    listen<T>(_ctx: unknown, event: string): Event<T>;
    call<T>(_ctx: unknown, command: string, arg?: unknown, cancellationToken?: CancellationToken): Promise<T>;
    private _listTools;
    private _callTool;
    private _listResources;
    private _readResource;
    private _listResourceTemplates;
    private _ensureServerReady;
}
