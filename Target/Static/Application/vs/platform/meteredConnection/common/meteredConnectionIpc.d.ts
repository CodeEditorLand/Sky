import { Disposable } from '../../../base/common/lifecycle.js';
import { IChannel } from '../../../base/parts/ipc/common/ipc.js';
import { IMeteredConnectionService } from './meteredConnection.js';
export declare const METERED_CONNECTION_CHANNEL = "meteredConnection";
/**
 * Commands supported by the metered connection IPC channel.
 */
export declare enum MeteredConnectionCommand {
    OnDidChangeIsConnectionMetered = "OnDidChangeIsConnectionMetered",
    IsConnectionMetered = "IsConnectionMetered",
    SetIsBrowserConnectionMetered = "SetIsBrowserConnectionMetered"
}
/**
 * IPC channel client for the metered connection service.
 */
export declare class MeteredConnectionChannelClient extends Disposable implements IMeteredConnectionService {
    readonly _serviceBrand: undefined;
    private readonly _onDidChangeIsConnectionMetered;
    readonly onDidChangeIsConnectionMetered: import("../../../base/common/event.js").Event<boolean>;
    private _isConnectionMetered;
    get isConnectionMetered(): boolean;
    constructor(channel: IChannel);
}
