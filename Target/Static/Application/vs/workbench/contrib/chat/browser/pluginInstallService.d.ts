import { URI } from '../../../../base/common/uri.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IFileService } from '../../../../platform/files/common/files.js';
import { INotificationService } from '../../../../platform/notification/common/notification.js';
import { IAgentPluginRepositoryService } from '../common/plugins/agentPluginRepositoryService.js';
import { IPluginInstallService } from '../common/plugins/pluginInstallService.js';
import { IMarketplacePlugin } from '../common/plugins/pluginMarketplaceService.js';
export declare class PluginInstallService implements IPluginInstallService {
    private readonly _pluginRepositoryService;
    private readonly _configurationService;
    private readonly _fileService;
    private readonly _notificationService;
    readonly _serviceBrand: undefined;
    constructor(_pluginRepositoryService: IAgentPluginRepositoryService, _configurationService: IConfigurationService, _fileService: IFileService, _notificationService: INotificationService);
    installPlugin(plugin: IMarketplacePlugin): Promise<void>;
    updatePlugin(plugin: IMarketplacePlugin): Promise<void>;
    uninstallPlugin(pluginUri: URI): Promise<void>;
    getPluginInstallUri(plugin: IMarketplacePlugin): URI;
    /**
     * Adds the given file-system path to `chat.plugins.paths` in user-local config.
     */
    private _addPluginPath;
    /**
     * Removes the given file-system path from `chat.plugins.paths` in user-local config.
     */
    private _removePluginPath;
}
