import { Disposable } from '../../../../base/common/lifecycle.js';
import { IDataChannelService, CoreDataChannel, IDataChannelEvent } from '../../../../platform/dataChannel/common/dataChannel.js';
export declare class DataChannelService extends Disposable implements IDataChannelService {
    readonly _serviceBrand: undefined;
    private readonly _onDidSendData;
    readonly onDidSendData: import("../../../../base/common/event.js").Event<IDataChannelEvent<unknown>>;
    constructor();
    getDataChannel<T>(channelId: string): CoreDataChannel<T>;
}
