import { Event } from '../../../base/common/event.js';
import { IChannelServer } from '../../../base/parts/ipc/common/ipc.js';
import { IProductService } from '../../product/common/productService.js';
import { IExtensionGalleryManifest, IExtensionGalleryManifestService, ExtensionGalleryManifestStatus } from './extensionGalleryManifest.js';
import { ExtensionGalleryManifestService } from './extensionGalleryManifestService.js';
export declare class ExtensionGalleryManifestIPCService extends ExtensionGalleryManifestService implements IExtensionGalleryManifestService {
    readonly _serviceBrand: undefined;
    private _onDidChangeExtensionGalleryManifest;
    readonly onDidChangeExtensionGalleryManifest: Event<IExtensionGalleryManifest | null>;
    private _onDidChangeExtensionGalleryManifestStatus;
    readonly onDidChangeExtensionGalleryManifestStatus: Event<ExtensionGalleryManifestStatus>;
    private _extensionGalleryManifest;
    private readonly barrier;
    get extensionGalleryManifestStatus(): ExtensionGalleryManifestStatus;
    constructor(server: IChannelServer<unknown>, productService: IProductService);
    getExtensionGalleryManifest(): Promise<IExtensionGalleryManifest | null>;
    private setExtensionGalleryManifest;
}
