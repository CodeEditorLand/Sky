import { Disposable } from '../../../base/common/lifecycle.js';
import { IDataChannelService } from '../../../platform/dataChannel/common/dataChannel.js';
import { IExtHostContext } from '../../services/extensions/common/extHostCustomers.js';
import { MainThreadDataChannelsShape } from '../common/extHost.protocol.js';
export declare class MainThreadDataChannels extends Disposable implements MainThreadDataChannelsShape {
    private readonly _dataChannelService;
    private readonly _proxy;
    constructor(extHostContext: IExtHostContext, _dataChannelService: IDataChannelService);
}
