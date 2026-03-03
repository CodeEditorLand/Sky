import { Event } from '../../../base/common/event.js';
import { IServerChannel } from '../../../base/parts/ipc/common/ipc.js';
import { MeteredConnectionMainService } from './meteredConnectionMainService.js';
/**
 * IPC channel implementation for the metered connection service.
 */
export declare class MeteredConnectionChannel implements IServerChannel {
    private readonly service;
    constructor(service: MeteredConnectionMainService);
    listen(_: unknown, event: any): Event<any>;
    call(_: unknown, command: string, arg?: any): Promise<any>;
}
