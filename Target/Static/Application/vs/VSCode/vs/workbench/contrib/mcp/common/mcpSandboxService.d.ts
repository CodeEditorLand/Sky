import { Disposable } from '../../../../base/common/lifecycle.js';
import { URI } from '../../../../base/common/uri.js';
import { ConfigurationTarget } from '../../../../platform/configuration/common/configuration.js';
import { IEnvironmentService } from '../../../../platform/environment/common/environment.js';
import { IFileService } from '../../../../platform/files/common/files.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { IMcpResourceScannerService } from '../../../../platform/mcp/common/mcpResourceScannerService.js';
import { IRemoteAgentService } from '../../../services/remote/common/remoteAgentService.js';
import { IMcpSandboxConfiguration } from '../../../../platform/mcp/common/mcpPlatformTypes.js';
import { IMcpPotentialSandboxBlock, McpServerDefinition, McpServerLaunch } from './mcpTypes.js';
export declare const IMcpSandboxService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IMcpSandboxService>;
export interface IMcpSandboxService {
    readonly _serviceBrand: undefined;
    launchInSandboxIfEnabled(serverDef: McpServerDefinition, launch: McpServerLaunch, remoteAuthority: string | undefined, configTarget: ConfigurationTarget): Promise<McpServerLaunch>;
    isEnabled(serverDef: McpServerDefinition, serverLabel?: string): Promise<boolean>;
    getSandboxConfigSuggestionMessage(serverLabel: string, potentialBlocks: readonly IMcpPotentialSandboxBlock[], existingSandboxConfig?: IMcpSandboxConfiguration): SandboxConfigSuggestionResult | undefined;
    applySandboxConfigSuggestion(serverDef: McpServerDefinition, mcpResource: URI, configTarget: ConfigurationTarget, potentialBlocks: readonly IMcpPotentialSandboxBlock[], suggestedSandboxConfig?: IMcpSandboxConfiguration): Promise<boolean>;
}
type SandboxConfigSuggestionResult = {
    message: string;
    sandboxConfig: IMcpSandboxConfiguration;
};
export declare class McpSandboxService extends Disposable implements IMcpSandboxService {
    private readonly _fileService;
    private readonly _environmentService;
    private readonly _logService;
    private readonly _mcpResourceScannerService;
    private readonly _remoteAgentService;
    readonly _serviceBrand: undefined;
    private _sandboxSettingsId;
    private _remoteEnvDetailsPromise;
    private readonly _defaultAllowedDomains;
    private _defaultAllowWritePaths;
    private _sandboxConfigPerConfigurationTarget;
    constructor(_fileService: IFileService, _environmentService: IEnvironmentService, _logService: ILogService, _mcpResourceScannerService: IMcpResourceScannerService, _remoteAgentService: IRemoteAgentService);
    isEnabled(serverDef: McpServerDefinition, remoteAuthority?: string): Promise<boolean>;
    launchInSandboxIfEnabled(serverDef: McpServerDefinition, launch: McpServerLaunch, remoteAuthority: string | undefined, configTarget: ConfigurationTarget): Promise<McpServerLaunch>;
    getSandboxConfigSuggestionMessage(serverLabel: string, potentialBlocks: readonly IMcpPotentialSandboxBlock[], existingSandboxConfig?: IMcpSandboxConfiguration): SandboxConfigSuggestionResult | undefined;
    applySandboxConfigSuggestion(serverDef: McpServerDefinition, mcpResource: URI, configTarget: ConfigurationTarget, potentialBlocks: readonly IMcpPotentialSandboxBlock[], suggestedSandboxConfig?: IMcpSandboxConfiguration): Promise<boolean>;
    private _getSandboxConfigSuggestions;
    private _toMcpResourceTarget;
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
    private _getPathDelimiter;
    private _quoteShellArgument;
}
export {};
