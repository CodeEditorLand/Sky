import { ILocalMcpServer, IMcpManagementService, IGalleryMcpServer, InstallOptions, InstallMcpServerEvent, UninstallMcpServerEvent, DidUninstallMcpServerEvent, InstallMcpServerResult, IInstallableMcpServer, IAllowedMcpServersService } from '../../../../platform/mcp/common/mcpManagement.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { IUserDataProfileService } from '../../../services/userDataProfile/common/userDataProfile.js';
import { Event } from '../../../../base/common/event.js';
import { IWorkspaceContextService, IWorkspaceFolder } from '../../../../platform/workspace/common/workspace.js';
import { IUriIdentityService } from '../../../../platform/uriIdentity/common/uriIdentity.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { IRemoteAgentService } from '../../remote/common/remoteAgentService.js';
import { URI } from '../../../../base/common/uri.js';
import { ConfigurationTarget } from '../../../../platform/configuration/common/configuration.js';
import { IUserDataProfilesService } from '../../../../platform/userDataProfile/common/userDataProfile.js';
import { IRemoteUserDataProfilesService } from '../../userDataProfile/common/remoteUserDataProfiles.js';
import { AbstractMcpManagementService } from '../../../../platform/mcp/common/mcpManagementService.js';
export declare const USER_CONFIG_ID = "usrlocal";
export declare const REMOTE_USER_CONFIG_ID = "usrremote";
export declare const WORKSPACE_CONFIG_ID = "workspace";
export declare const WORKSPACE_FOLDER_CONFIG_ID_PREFIX = "ws";
export interface IWorkbencMcpServerInstallOptions extends InstallOptions {
    target?: ConfigurationTarget | IWorkspaceFolder;
}
export declare const enum LocalMcpServerScope {
    User = "user",
    RemoteUser = "remoteUser",
    Workspace = "workspace"
}
export interface IWorkbenchLocalMcpServer extends ILocalMcpServer {
    readonly id: string;
    readonly scope: LocalMcpServerScope;
}
export interface InstallWorkbenchMcpServerEvent extends InstallMcpServerEvent {
    readonly scope: LocalMcpServerScope;
}
export interface IWorkbenchMcpServerInstallResult extends InstallMcpServerResult {
    readonly local?: IWorkbenchLocalMcpServer;
}
export interface UninstallWorkbenchMcpServerEvent extends UninstallMcpServerEvent {
    readonly scope: LocalMcpServerScope;
}
export interface DidUninstallWorkbenchMcpServerEvent extends DidUninstallMcpServerEvent {
    readonly scope: LocalMcpServerScope;
}
export declare const IWorkbenchMcpManagementService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IWorkbenchMcpManagementService>;
export interface IWorkbenchMcpManagementService extends IMcpManagementService {
    readonly _serviceBrand: undefined;
    readonly onInstallMcpServerInCurrentProfile: Event<InstallWorkbenchMcpServerEvent>;
    readonly onDidInstallMcpServersInCurrentProfile: Event<readonly IWorkbenchMcpServerInstallResult[]>;
    readonly onDidUpdateMcpServersInCurrentProfile: Event<readonly IWorkbenchMcpServerInstallResult[]>;
    readonly onUninstallMcpServerInCurrentProfile: Event<UninstallWorkbenchMcpServerEvent>;
    readonly onDidUninstallMcpServerInCurrentProfile: Event<DidUninstallWorkbenchMcpServerEvent>;
    readonly onDidChangeProfile: Event<void>;
    getInstalled(): Promise<IWorkbenchLocalMcpServer[]>;
    install(server: IInstallableMcpServer | URI, options?: IWorkbencMcpServerInstallOptions): Promise<IWorkbenchLocalMcpServer>;
    installFromGallery(server: IGalleryMcpServer, options?: InstallOptions): Promise<IWorkbenchLocalMcpServer>;
    updateMetadata(local: ILocalMcpServer, server: IGalleryMcpServer, profileLocation?: URI): Promise<IWorkbenchLocalMcpServer>;
}
export declare class WorkbenchMcpManagementService extends AbstractMcpManagementService implements IWorkbenchMcpManagementService {
    private readonly mcpManagementService;
    private readonly userDataProfileService;
    private readonly uriIdentityService;
    private readonly workspaceContextService;
    private readonly userDataProfilesService;
    private readonly remoteUserDataProfilesService;
    private _onInstallMcpServer;
    readonly onInstallMcpServer: Event<InstallMcpServerEvent>;
    private _onDidInstallMcpServers;
    readonly onDidInstallMcpServers: Event<readonly InstallMcpServerResult[]>;
    private _onDidUpdateMcpServers;
    readonly onDidUpdateMcpServers: Event<readonly InstallMcpServerResult[]>;
    private _onUninstallMcpServer;
    readonly onUninstallMcpServer: Event<UninstallMcpServerEvent>;
    private _onDidUninstallMcpServer;
    readonly onDidUninstallMcpServer: Event<DidUninstallMcpServerEvent>;
    private readonly _onInstallMcpServerInCurrentProfile;
    readonly onInstallMcpServerInCurrentProfile: Event<InstallWorkbenchMcpServerEvent>;
    private readonly _onDidInstallMcpServersInCurrentProfile;
    readonly onDidInstallMcpServersInCurrentProfile: Event<readonly IWorkbenchMcpServerInstallResult[]>;
    private readonly _onDidUpdateMcpServersInCurrentProfile;
    readonly onDidUpdateMcpServersInCurrentProfile: Event<readonly IWorkbenchMcpServerInstallResult[]>;
    private readonly _onUninstallMcpServerInCurrentProfile;
    readonly onUninstallMcpServerInCurrentProfile: Event<UninstallWorkbenchMcpServerEvent>;
    private readonly _onDidUninstallMcpServerInCurrentProfile;
    readonly onDidUninstallMcpServerInCurrentProfile: Event<DidUninstallWorkbenchMcpServerEvent>;
    private readonly _onDidChangeProfile;
    readonly onDidChangeProfile: Event<void>;
    private readonly workspaceMcpManagementService;
    private readonly remoteMcpManagementService;
    constructor(mcpManagementService: IMcpManagementService, allowedMcpServersService: IAllowedMcpServersService, logService: ILogService, userDataProfileService: IUserDataProfileService, uriIdentityService: IUriIdentityService, workspaceContextService: IWorkspaceContextService, remoteAgentService: IRemoteAgentService, userDataProfilesService: IUserDataProfilesService, remoteUserDataProfilesService: IRemoteUserDataProfilesService, instantiationService: IInstantiationService);
    private createInstallMcpServerResultsFromEvent;
    private handleRemoteInstallMcpServerResultsFromEvent;
    getInstalled(): Promise<IWorkbenchLocalMcpServer[]>;
    private toWorkspaceMcpServer;
    private getConfigId;
    install(server: IInstallableMcpServer, options?: IWorkbencMcpServerInstallOptions): Promise<IWorkbenchLocalMcpServer>;
    installFromGallery(server: IGalleryMcpServer, options?: IWorkbencMcpServerInstallOptions): Promise<IWorkbenchLocalMcpServer>;
    updateMetadata(local: IWorkbenchLocalMcpServer, server: IGalleryMcpServer, profileLocation: URI): Promise<IWorkbenchLocalMcpServer>;
    uninstall(server: IWorkbenchLocalMcpServer): Promise<void>;
    private getRemoteMcpResource;
}
