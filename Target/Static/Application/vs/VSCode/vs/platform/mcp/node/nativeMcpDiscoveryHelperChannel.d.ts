import { Event } from '../../../base/common/event.js';
import { IURITransformer } from '../../../base/common/uriIpc.js';
import { IServerChannel } from '../../../base/parts/ipc/common/ipc.js';
import { RemoteAgentConnectionContext } from '../../remote/common/remoteAgentEnvironment.js';
import { INativeMcpDiscoveryHelperService } from '../common/nativeMcpDiscoveryHelper.js';
export declare class NativeMcpDiscoveryHelperChannel implements IServerChannel<RemoteAgentConnectionContext> {
    private readonly getUriTransformer;
    private nativeMcpDiscoveryHelperService;
    constructor(getUriTransformer: undefined | ((requestContext: RemoteAgentConnectionContext) => IURITransformer), nativeMcpDiscoveryHelperService: INativeMcpDiscoveryHelperService);
    listen<T>(context: RemoteAgentConnectionContext, event: string): Event<T>;
    call<T>(context: RemoteAgentConnectionContext, command: string, args?: unknown): Promise<T>;
}
