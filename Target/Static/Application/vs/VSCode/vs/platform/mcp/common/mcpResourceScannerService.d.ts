import { IStringDictionary } from '../../../base/common/collections.js';
import { Disposable } from '../../../base/common/lifecycle.js';
import { Mutable } from '../../../base/common/types.js';
import { URI } from '../../../base/common/uri.js';
import { ConfigurationTarget } from '../../configuration/common/configuration.js';
import { IFileService } from '../../files/common/files.js';
import { IUriIdentityService } from '../../uriIdentity/common/uriIdentity.js';
import { IInstallableMcpServer } from './mcpManagement.js';
import { IMcpSandboxConfiguration, IMcpServerConfiguration, IMcpServerVariable } from './mcpPlatformTypes.js';
interface IScannedMcpServers {
    servers?: IStringDictionary<Mutable<IMcpServerConfiguration>>;
    inputs?: IMcpServerVariable[];
    sandbox?: IMcpSandboxConfiguration;
}
export type McpResourceTarget = ConfigurationTarget.USER | ConfigurationTarget.WORKSPACE | ConfigurationTarget.WORKSPACE_FOLDER;
export declare const IMcpResourceScannerService: import("../../instantiation/common/instantiation.js").ServiceIdentifier<IMcpResourceScannerService>;
export interface IMcpResourceScannerService {
    readonly _serviceBrand: undefined;
    scanMcpServers(mcpResource: URI, target?: McpResourceTarget): Promise<IScannedMcpServers>;
    addMcpServers(servers: IInstallableMcpServer[], mcpResource: URI, target?: McpResourceTarget): Promise<void>;
    updateSandboxConfig(updateFn: (data: IScannedMcpServers) => IScannedMcpServers, mcpResource: URI, target?: McpResourceTarget): Promise<void>;
    removeMcpServers(serverNames: string[], mcpResource: URI, target?: McpResourceTarget): Promise<void>;
}
export declare class McpResourceScannerService extends Disposable implements IMcpResourceScannerService {
    private readonly fileService;
    protected readonly uriIdentityService: IUriIdentityService;
    readonly _serviceBrand: undefined;
    private readonly resourcesAccessQueueMap;
    constructor(fileService: IFileService, uriIdentityService: IUriIdentityService);
    scanMcpServers(mcpResource: URI, target?: McpResourceTarget): Promise<IScannedMcpServers>;
    addMcpServers(servers: IInstallableMcpServer[], mcpResource: URI, target?: McpResourceTarget): Promise<void>;
    updateSandboxConfig(updateFn: (data: IScannedMcpServers) => IScannedMcpServers, mcpResource: URI, target?: McpResourceTarget): Promise<void>;
    removeMcpServers(serverNames: string[], mcpResource: URI, target?: McpResourceTarget): Promise<void>;
    private withProfileMcpServers;
    private writeScannedMcpServers;
    private writeScannedMcpServersToWorkspaceFolder;
    private writeScannedMcpServersToWorkspace;
    private fromUserMcpServers;
    private fromWorkspaceFolderMcpServers;
    private sanitizeServer;
    private getResourceAccessQueue;
}
export {};
