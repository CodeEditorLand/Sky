import { IMcpGalleryManifest, IMcpGalleryManifestService, McpGalleryManifestStatus } from '../../../../platform/mcp/common/mcpGalleryManifest.js';
import { McpGalleryManifestService as McpGalleryManifestService } from '../../../../platform/mcp/common/mcpGalleryManifestService.js';
import { IProductService } from '../../../../platform/product/common/productService.js';
import { IRemoteAgentService } from '../../remote/common/remoteAgentService.js';
import { IRequestService } from '../../../../platform/request/common/request.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
export declare class WorkbenchMcpGalleryManifestService extends McpGalleryManifestService implements IMcpGalleryManifestService {
    private readonly configurationService;
    private mcpGalleryManifest;
    private _onDidChangeMcpGalleryManifest;
    readonly onDidChangeMcpGalleryManifest: import("../../../../base/common/event.js").Event<IMcpGalleryManifest | null>;
    private currentStatus;
    get mcpGalleryManifestStatus(): McpGalleryManifestStatus;
    private _onDidChangeMcpGalleryManifestStatus;
    readonly onDidChangeMcpGalleryManifestStatus: import("../../../../base/common/event.js").Event<McpGalleryManifestStatus>;
    constructor(productService: IProductService, remoteAgentService: IRemoteAgentService, requestService: IRequestService, logService: ILogService, configurationService: IConfigurationService);
    private initPromise;
    getMcpGalleryManifest(): Promise<IMcpGalleryManifest | null>;
    private doGetMcpGalleryManifest;
    private getAndUpdateMcpGalleryManifest;
    private update;
}
