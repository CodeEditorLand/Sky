import { Event } from '../../../base/common/event.js';
import { Disposable } from '../../../base/common/lifecycle.js';
import { IPCServer, IServerChannel } from '../../../base/parts/ipc/common/ipc.js';
import { IMainProcessService } from '../../ipc/common/mainProcessService.js';
import { ILogService } from '../../log/common/log.js';
/**
 * IPC channel for the Playwright service.
 *
 * Each connected window gets its own {@link PlaywrightService},
 * keyed by the opaque IPC connection context. The client sends an
 * `__initialize` call with its numeric window ID before any other
 * method calls, which eagerly creates the instance. When a window
 * disconnects the instance is automatically disposed.
 */
export declare class PlaywrightChannel extends Disposable implements IServerChannel<string> {
    private readonly logService;
    private readonly _instances;
    private readonly browserViewGroupRemoteService;
    constructor(ipcServer: IPCServer<string>, mainProcessService: IMainProcessService, logService: ILogService);
    listen<T>(ctx: string, event: string): Event<T>;
    call<T>(ctx: string, command: string, arg?: unknown): Promise<T>;
}
