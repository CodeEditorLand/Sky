import { Event } from '../../../base/common/event.js';
import { Disposable } from '../../../base/common/lifecycle.js';
import { IChannelServer } from '../../../base/parts/ipc/common/ipc.js';
import { IMcpGalleryManifest, IMcpGalleryManifestService, McpGalleryManifestStatus } from './mcpGalleryManifest.js';
export declare class McpGalleryManifestIPCService extends Disposable implements IMcpGalleryManifestService {
    readonly _serviceBrand: undefined;
    private _onDidChangeMcpGalleryManifest;
    readonly onDidChangeMcpGalleryManifest: Event<IMcpGalleryManifest | null>;
    private _onDidChangeMcpGalleryManifestStatus;
    readonly onDidChangeMcpGalleryManifestStatus: Event<McpGalleryManifestStatus>;
    private _mcpGalleryManifest;
    private readonly barrier;
    get mcpGalleryManifestStatus(): McpGalleryManifestStatus;
    constructor(server: IChannelServer<unknown>);
    getMcpGalleryManifest(): Promise<IMcpGalleryManifest | null>;
    private setMcpGalleryManifest;
}
