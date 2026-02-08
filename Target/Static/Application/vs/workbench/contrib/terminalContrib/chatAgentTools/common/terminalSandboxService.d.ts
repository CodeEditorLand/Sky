import { Disposable } from '../../../../../base/common/lifecycle.js';
import { URI } from '../../../../../base/common/uri.js';
import { IConfigurationService } from '../../../../../platform/configuration/common/configuration.js';
import { IEnvironmentService } from '../../../../../platform/environment/common/environment.js';
import { IFileService } from '../../../../../platform/files/common/files.js';
import { ILogService } from '../../../../../platform/log/common/log.js';
import { IRemoteAgentService } from '../../../../services/remote/common/remoteAgentService.js';
export declare const ITerminalSandboxService: import("../../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<ITerminalSandboxService>;
export interface ITerminalSandboxService {
    readonly _serviceBrand: undefined;
    isEnabled(): Promise<boolean>;
    wrapCommand(command: string): string;
    getSandboxConfigPath(forceRefresh?: boolean): Promise<string | undefined>;
    getTempDir(): URI | undefined;
    setNeedsForceUpdateConfigFile(): void;
}
export declare class TerminalSandboxService extends Disposable implements ITerminalSandboxService {
    private readonly _configurationService;
    private readonly _fileService;
    private readonly _environmentService;
    private readonly _logService;
    private readonly _remoteAgentService;
    readonly _serviceBrand: undefined;
    private _srtPath;
    private _srtPathResolved;
    private _execPath?;
    private _sandboxConfigPath;
    private _needsForceUpdateConfigFile;
    private _tempDir;
    private _sandboxSettingsId;
    private _remoteEnvDetailsPromise;
    private _remoteEnvDetails;
    private _appRoot;
    private _os;
    constructor(_configurationService: IConfigurationService, _fileService: IFileService, _environmentService: IEnvironmentService, _logService: ILogService, _remoteAgentService: IRemoteAgentService);
    isEnabled(): Promise<boolean>;
    wrapCommand(command: string): string;
    getTempDir(): URI | undefined;
    setNeedsForceUpdateConfigFile(): void;
    getSandboxConfigPath(forceRefresh?: boolean): Promise<string | undefined>;
    private _resolveSrtPath;
    private _createSandboxConfig;
    private _pathJoin;
    private _initTempDir;
}
