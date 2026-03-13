import { Disposable } from '../../../base/common/lifecycle.js';
import { IMeteredConnectionService } from '../../../platform/meteredConnection/common/meteredConnection.js';
import { IExtHostContext } from '../../services/extensions/common/extHostCustomers.js';
import { MainThreadMeteredConnectionShape } from '../common/extHost.protocol.js';
export declare class MainThreadMeteredConnection extends Disposable implements MainThreadMeteredConnectionShape {
    private readonly meteredConnectionService;
    private readonly _proxy;
    constructor(extHostContext: IExtHostContext, meteredConnectionService: IMeteredConnectionService);
}
