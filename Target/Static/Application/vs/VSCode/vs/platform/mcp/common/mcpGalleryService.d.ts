import { CancellationToken } from '../../../base/common/cancellation.js';
import { Disposable } from '../../../base/common/lifecycle.js';
import { IFileService } from '../../files/common/files.js';
import { ILogService } from '../../log/common/log.js';
import { IRequestService } from '../../request/common/request.js';
import { IGalleryMcpServer, IMcpGalleryService, IQueryOptions } from './mcpManagement.js';
import { IMcpGalleryManifestService, IMcpGalleryManifest } from './mcpGalleryManifest.js';
import { IIterativePager } from '../../../base/common/paging.js';
export declare class McpGalleryService extends Disposable implements IMcpGalleryService {
    private readonly requestService;
    private readonly fileService;
    private readonly logService;
    private readonly mcpGalleryManifestService;
    _serviceBrand: undefined;
    private galleryMcpServerDataSerializers;
    constructor(requestService: IRequestService, fileService: IFileService, logService: ILogService, mcpGalleryManifestService: IMcpGalleryManifestService);
    isEnabled(): boolean;
    query(options?: IQueryOptions, token?: CancellationToken): Promise<IIterativePager<IGalleryMcpServer>>;
    getMcpServersFromGallery(infos: {
        name: string;
        id?: string;
    }[]): Promise<IGalleryMcpServer[]>;
    private getMcpServerByName;
    getReadme(gallery: IGalleryMcpServer, token: CancellationToken): Promise<string>;
    private toGalleryMcpServer;
    private queryGalleryMcpServers;
    private queryRawGalleryMcpServers;
    getMcpServer(mcpServerUrl: string, mcpGalleryManifest?: IMcpGalleryManifest | null): Promise<IGalleryMcpServer | undefined>;
    private serializeMcpServer;
    private serializeMcpServersResult;
    private getSerializer;
    private getNamedServerUrl;
    private getServerIdUrl;
    private getLatestServerVersionUrl;
    private getWebUrl;
    private getPublisherUrl;
    private getMcpGalleryUrl;
}
