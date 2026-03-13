import { IObservable } from '../../../../../base/common/observable.js';
import { URI } from '../../../../../base/common/uri.js';
import type { IAgentPlugin } from '../../common/plugins/agentPluginService.js';
import type { IMarketplacePlugin, IMarketplaceReference, IPluginSourceDescriptor, MarketplaceType } from '../../common/plugins/pluginMarketplaceService.js';
export declare const enum AgentPluginItemKind {
    Installed = "installed",
    Marketplace = "marketplace"
}
export interface IInstalledPluginItem {
    readonly kind: AgentPluginItemKind.Installed;
    readonly name: string;
    readonly description: string;
    readonly marketplace?: string;
    readonly plugin: IAgentPlugin;
    /** When set, indicates the plugin has a newer version in the marketplace. */
    readonly outdated?: IObservable<IMarketplacePlugin | undefined>;
}
export interface IMarketplacePluginItem {
    readonly kind: AgentPluginItemKind.Marketplace;
    readonly name: string;
    readonly description: string;
    readonly source: string;
    readonly sourceDescriptor: IPluginSourceDescriptor;
    readonly marketplace: string;
    readonly marketplaceReference: IMarketplaceReference;
    readonly marketplaceType: MarketplaceType;
    readonly readmeUri?: URI;
}
export type IAgentPluginItem = IInstalledPluginItem | IMarketplacePluginItem;
