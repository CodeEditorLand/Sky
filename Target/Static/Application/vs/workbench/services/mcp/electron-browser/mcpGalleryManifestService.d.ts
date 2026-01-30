import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { ISharedProcessService } from '../../../../platform/ipc/electron-browser/services.js';
import { IProductService } from '../../../../platform/product/common/productService.js';
import { IRemoteAgentService } from '../../remote/common/remoteAgentService.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { IRequestService } from '../../../../platform/request/common/request.js';
import { IMcpGalleryManifestService } from '../../../../platform/mcp/common/mcpGalleryManifest.js';
import { WorkbenchMcpGalleryManifestService } from '../browser/mcpGalleryManifestService.js';
export declare class McpGalleryManifestService extends WorkbenchMcpGalleryManifestService implements IMcpGalleryManifestService {
    constructor(productService: IProductService, remoteAgentService: IRemoteAgentService, requestService: IRequestService, logService: ILogService, sharedProcessService: ISharedProcessService, configurationService: IConfigurationService);
}
