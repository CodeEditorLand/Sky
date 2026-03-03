import { Event } from '../../../base/common/event.js';
import { Disposable } from '../../../base/common/lifecycle.js';
import { IPCServer, IServerChannel } from '../../../base/parts/ipc/common/ipc.js';
import { IMcpGatewayService } from '../common/mcpGateway.js';
/**
 * IPC channel for the MCP Gateway service, used by the remote server.
 *
 * This channel tracks which client (identified by reconnectionToken) creates gateways,
 * enabling cleanup when a client disconnects.
 */
export declare class McpGatewayChannel<TContext> extends Disposable implements IServerChannel<TContext> {
    private readonly _ipcServer;
    private readonly mcpGatewayService;
    constructor(_ipcServer: IPCServer<TContext>, mcpGatewayService: IMcpGatewayService);
    listen<T>(_ctx: TContext, _event: string): Event<T>;
    call<T>(ctx: TContext, command: string, args?: unknown): Promise<T>;
}
