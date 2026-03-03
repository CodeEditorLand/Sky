import { Disposable } from '../../../../base/common/lifecycle.js';
import { ConfigurationTarget } from '../../../../platform/configuration/common/configuration.js';
import { IEnvironmentService } from '../../../../platform/environment/common/environment.js';
import { IFileService } from '../../../../platform/files/common/files.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { IRemoteAgentService } from '../../../services/remote/common/remoteAgentService.js';
import { McpServerDefinition, McpServerLaunch } from './mcpTypes.js';
export declare const IMcpSandboxService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IMcpSandboxService>;
export interface IMcpSandboxService {
    readonly _serviceBrand: undefined;
    launchInSandboxIfEnabled(serverDef: McpServerDefinition, launch: McpServerLaunch, remoteAuthority: string | undefined, configTarget: ConfigurationTarget): Promise<McpServerLaunch>;
    isEnabled(serverDef: McpServerDefinition, serverLabel?: string): Promise<boolean>;
}
export declare class McpSandboxService extends Disposable implements IMcpSandboxService {
    private readonly _fileService;
    private readonly _environmentService;
    private readonly _logService;
    private readonly _remoteAgentService;
    readonly _serviceBrand: undefined;
    private _sandboxSettingsId;
    private _remoteEnvDetailsPromise;
    private readonly _defaultAllowedDomains;
    private _sandboxConfigPerConfigurationTarget;
    constructor(_fileService: IFileService, _environmentService: IEnvironmentService, _logService: ILogService, _remoteAgentService: IRemoteAgentService);
    isEnabled(serverDef: McpServerDefinition, remoteAuthority?: string): Promise<boolean>;
    launchInSandboxIfEnabled(serverDef: McpServerDefinition, launch: McpServerLaunch, remoteAuthority: string | undefined, configTarget: ConfigurationTarget): Promise<McpServerLaunch>;
    private _resolveSandboxLaunchDetails;
    private _getExecPath;
    private _getSandboxEnvVariables;
    private _getSandboxCommandArgs;
    private _getRemoteEnv;
    private _getOperatingSystem;
    private _getAppRoot;
    private _getTempDir;
    private _updateSandboxConfig;
    private _withDefaultSandboxConfig;
    private _getDefaultAllowWrite;
    private _pathJoin;
}
