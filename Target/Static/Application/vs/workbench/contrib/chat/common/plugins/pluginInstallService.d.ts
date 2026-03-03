import { URI } from '../../../../../base/common/uri.js';
import { IMarketplacePlugin } from './pluginMarketplaceService.js';
export declare const IPluginInstallService: import("../../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IPluginInstallService>;
export interface IPluginInstallService {
    readonly _serviceBrand: undefined;
    /**
     * Clones the marketplace repository (if not already cached) and registers
     * the plugin's source directory in the user's `chat.plugins.paths` config.
     */
    installPlugin(plugin: IMarketplacePlugin): Promise<void>;
    /**
     * Removes the plugin from `chat.plugins.paths` config.
     */
    uninstallPlugin(pluginUri: URI): Promise<void>;
    /**
     * Pulls the latest changes for an already-cloned marketplace repository.
     */
    updatePlugin(plugin: IMarketplacePlugin): Promise<void>;
    /**
     * Returns the URI where a marketplace plugin would be installed on disk.
     * Used to determine whether a marketplace plugin is already installed.
     */
    getPluginInstallUri(plugin: IMarketplacePlugin): URI;
}
