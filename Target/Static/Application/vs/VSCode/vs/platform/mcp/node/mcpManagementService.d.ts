import { URI } from '../../../base/common/uri.js';
import { IEnvironmentService } from '../../environment/common/environment.js';
import { IFileService } from '../../files/common/files.js';
import { ILogService } from '../../log/common/log.js';
import { IUriIdentityService } from '../../uriIdentity/common/uriIdentity.js';
import { IGalleryMcpServer, IMcpGalleryService, IMcpManagementService, InstallOptions, ILocalMcpServer } from '../common/mcpManagement.js';
import { McpUserResourceManagementService as CommonMcpUserResourceManagementService, McpManagementService as CommonMcpManagementService } from '../common/mcpManagementService.js';
import { IMcpResourceScannerService } from '../common/mcpResourceScannerService.js';
export declare class McpUserResourceManagementService extends CommonMcpUserResourceManagementService {
    constructor(mcpResource: URI, mcpGalleryService: IMcpGalleryService, fileService: IFileService, uriIdentityService: IUriIdentityService, logService: ILogService, mcpResourceScannerService: IMcpResourceScannerService, environmentService: IEnvironmentService);
    installFromGallery(server: IGalleryMcpServer, options?: InstallOptions): Promise<ILocalMcpServer>;
}
export declare class McpManagementService extends CommonMcpManagementService implements IMcpManagementService {
    protected createMcpResourceManagementService(mcpResource: URI): McpUserResourceManagementService;
}
