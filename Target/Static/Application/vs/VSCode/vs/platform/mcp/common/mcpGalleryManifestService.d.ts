import { Event } from '../../../base/common/event.js';
import { Disposable } from '../../../base/common/lifecycle.js';
import { ILogService } from '../../log/common/log.js';
import { IProductService } from '../../product/common/productService.js';
import { IRequestService } from '../../request/common/request.js';
import { IMcpGalleryManifest, IMcpGalleryManifestService, McpGalleryManifestStatus } from './mcpGalleryManifest.js';
export declare class McpGalleryManifestService extends Disposable implements IMcpGalleryManifestService {
    private readonly productService;
    private readonly requestService;
    protected readonly logService: ILogService;
    readonly _serviceBrand: undefined;
    readonly onDidChangeMcpGalleryManifest: Event<any>;
    readonly onDidChangeMcpGalleryManifestStatus: Event<any>;
    private readonly versionByUrl;
    get mcpGalleryManifestStatus(): McpGalleryManifestStatus;
    constructor(productService: IProductService, requestService: IRequestService, logService: ILogService);
    getMcpGalleryManifest(): Promise<IMcpGalleryManifest | null>;
    protected createMcpGalleryManifest(url: string, version?: string): Promise<IMcpGalleryManifest>;
    private getVersion;
    private checkVersion;
}
