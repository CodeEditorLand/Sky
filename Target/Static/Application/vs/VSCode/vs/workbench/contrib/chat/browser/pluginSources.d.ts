import { URI } from '../../../../base/common/uri.js';
import { ICommandService } from '../../../../platform/commands/common/commands.js';
import { IDialogService } from '../../../../platform/dialogs/common/dialogs.js';
import { IFileService } from '../../../../platform/files/common/files.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { INotificationService } from '../../../../platform/notification/common/notification.js';
import { IProgressService } from '../../../../platform/progress/common/progress.js';
import { ITerminalService } from '../../terminal/browser/terminal.js';
import { IEnsureRepositoryOptions, IPullRepositoryOptions } from '../common/plugins/agentPluginRepositoryService.js';
import { IMarketplacePlugin, IPluginSourceDescriptor, PluginSourceKind } from '../common/plugins/pluginMarketplaceService.js';
import { IPluginSource } from '../common/plugins/pluginSource.js';
declare abstract class AbstractGitPluginSource implements IPluginSource {
    protected readonly _commandService: ICommandService;
    protected readonly _fileService: IFileService;
    protected readonly _logService: ILogService;
    protected readonly _notificationService: INotificationService;
    protected readonly _progressService: IProgressService;
    abstract readonly kind: PluginSourceKind;
    constructor(_commandService: ICommandService, _fileService: IFileService, _logService: ILogService, _notificationService: INotificationService, _progressService: IProgressService);
    abstract getInstallUri(cacheRoot: URI, descriptor: IPluginSourceDescriptor): URI;
    abstract getLabel(descriptor: IPluginSourceDescriptor): string;
    protected abstract _cloneUrl(descriptor: IPluginSourceDescriptor): string;
    protected abstract _displayLabel(descriptor: IPluginSourceDescriptor): string;
    getCleanupTarget(cacheRoot: URI, descriptor: IPluginSourceDescriptor): URI | undefined;
    ensure(cacheRoot: URI, plugin: IMarketplacePlugin, options?: IEnsureRepositoryOptions): Promise<URI>;
    update(cacheRoot: URI, plugin: IMarketplacePlugin, options?: IPullRepositoryOptions): Promise<boolean>;
    private _cloneRepository;
    private _checkoutRevision;
}
export declare class RelativePathPluginSource implements IPluginSource {
    readonly kind = PluginSourceKind.RelativePath;
    getInstallUri(_cacheRoot: URI, _descriptor: IPluginSourceDescriptor): URI;
    ensure(_cacheRoot: URI, _plugin: IMarketplacePlugin, _options?: IEnsureRepositoryOptions): Promise<URI>;
    update(_cacheRoot: URI, _plugin: IMarketplacePlugin, _options?: IPullRepositoryOptions): Promise<boolean>;
    getCleanupTarget(_cacheRoot: URI, _descriptor: IPluginSourceDescriptor): URI | undefined;
    getLabel(descriptor: IPluginSourceDescriptor): string;
}
export declare class GitHubPluginSource extends AbstractGitPluginSource {
    readonly kind = PluginSourceKind.GitHub;
    getInstallUri(cacheRoot: URI, descriptor: IPluginSourceDescriptor): URI;
    getLabel(descriptor: IPluginSourceDescriptor): string;
    protected _cloneUrl(descriptor: IPluginSourceDescriptor): string;
    protected _displayLabel(descriptor: IPluginSourceDescriptor): string;
}
export declare class GitUrlPluginSource extends AbstractGitPluginSource {
    readonly kind = PluginSourceKind.GitUrl;
    getInstallUri(cacheRoot: URI, descriptor: IPluginSourceDescriptor): URI;
    getLabel(descriptor: IPluginSourceDescriptor): string;
    protected _cloneUrl(descriptor: IPluginSourceDescriptor): string;
    protected _displayLabel(descriptor: IPluginSourceDescriptor): string;
    private _gitUrlCacheSegments;
}
export declare abstract class AbstractPackagePluginSource implements IPluginSource {
    protected readonly _dialogService: IDialogService;
    protected readonly _fileService: IFileService;
    protected readonly _logService: ILogService;
    protected readonly _notificationService: INotificationService;
    protected readonly _progressService: IProgressService;
    protected readonly _terminalService: ITerminalService;
    abstract readonly kind: PluginSourceKind;
    constructor(_dialogService: IDialogService, _fileService: IFileService, _logService: ILogService, _notificationService: INotificationService, _progressService: IProgressService, _terminalService: ITerminalService);
    abstract getInstallUri(cacheRoot: URI, descriptor: IPluginSourceDescriptor): URI;
    abstract getLabel(descriptor: IPluginSourceDescriptor): string;
    getCleanupTarget(cacheRoot: URI, descriptor: IPluginSourceDescriptor): URI | undefined;
    /**
     * Return the parent directory (prefix / target) where the package
     * manager installs into. This is above the actual plugin content dir.
     */
    protected abstract _getCacheDir(cacheRoot: URI, descriptor: IPluginSourceDescriptor): URI;
    /** Build the terminal command args for install. */
    protected abstract _buildInstallArgs(installDir: URI, plugin: IMarketplacePlugin): string[];
    /** Human-readable package manager name for messages. */
    protected abstract get _managerName(): string;
    ensure(cacheRoot: URI, plugin: IMarketplacePlugin, _options?: IEnsureRepositoryOptions): Promise<URI>;
    update(cacheRoot: URI, plugin: IMarketplacePlugin, _options?: IPullRepositoryOptions): Promise<boolean>;
    runInstall(installDir: URI, pluginDir: URI, plugin: IMarketplacePlugin, options?: {
        silent?: boolean;
    }): Promise<{
        pluginDir: URI;
    } | undefined>;
    private _confirmTerminalCommand;
    private _runTerminalCommand;
    private _waitForTerminalCommandCompletion;
}
export declare class NpmPluginSource extends AbstractPackagePluginSource {
    readonly kind = PluginSourceKind.Npm;
    protected readonly _managerName = "npm";
    getInstallUri(cacheRoot: URI, descriptor: IPluginSourceDescriptor): URI;
    getLabel(descriptor: IPluginSourceDescriptor): string;
    protected _getCacheDir(cacheRoot: URI, descriptor: IPluginSourceDescriptor): URI;
    protected _buildInstallArgs(installDir: URI, plugin: IMarketplacePlugin): string[];
}
export declare class PipPluginSource extends AbstractPackagePluginSource {
    readonly kind = PluginSourceKind.Pip;
    protected readonly _managerName = "pip";
    getInstallUri(cacheRoot: URI, descriptor: IPluginSourceDescriptor): URI;
    getLabel(descriptor: IPluginSourceDescriptor): string;
    protected _getCacheDir(cacheRoot: URI, descriptor: IPluginSourceDescriptor): URI;
    protected _buildInstallArgs(installDir: URI, plugin: IMarketplacePlugin): string[];
}
export {};
