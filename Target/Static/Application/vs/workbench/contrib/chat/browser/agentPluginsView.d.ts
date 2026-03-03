import { Disposable } from '../../../../base/common/lifecycle.js';
import { IPagedModel } from '../../../../base/common/paging.js';
import { URI } from '../../../../base/common/uri.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IContextKeyService, RawContextKey } from '../../../../platform/contextkey/common/contextkey.js';
import { IContextMenuService } from '../../../../platform/contextview/browser/contextView.js';
import { IHoverService } from '../../../../platform/hover/browser/hover.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { IKeybindingService } from '../../../../platform/keybinding/common/keybinding.js';
import { ILabelService } from '../../../../platform/label/common/label.js';
import { IOpenerService } from '../../../../platform/opener/common/opener.js';
import { IThemeService } from '../../../../platform/theme/common/themeService.js';
import { IViewletViewOptions } from '../../../browser/parts/views/viewsViewlet.js';
import { IWorkbenchContribution } from '../../../common/contributions.js';
import { IViewDescriptorService } from '../../../common/views.js';
import { AbstractExtensionsListView } from '../../extensions/browser/extensionsViews.js';
import { IAgentPlugin, IAgentPluginService } from '../common/plugins/agentPluginService.js';
import { IPluginInstallService } from '../common/plugins/pluginInstallService.js';
import { IMarketplaceReference, IPluginMarketplaceService, MarketplaceType } from '../common/plugins/pluginMarketplaceService.js';
export declare const HasInstalledAgentPluginsContext: RawContextKey<boolean>;
export declare const InstalledAgentPluginsViewId = "workbench.views.agentPlugins.installed";
declare const enum AgentPluginItemKind {
    Installed = "installed",
    Marketplace = "marketplace"
}
interface IInstalledPluginItem {
    readonly kind: AgentPluginItemKind.Installed;
    readonly name: string;
    readonly description: string;
    readonly marketplace?: string;
    readonly plugin: IAgentPlugin;
}
interface IMarketplacePluginItem {
    readonly kind: AgentPluginItemKind.Marketplace;
    readonly name: string;
    readonly description: string;
    readonly source: string;
    readonly marketplace: string;
    readonly marketplaceReference: IMarketplaceReference;
    readonly marketplaceType: MarketplaceType;
    readonly readmeUri?: URI;
}
type IAgentPluginItem = IInstalledPluginItem | IMarketplacePluginItem;
interface IAgentPluginsListViewOptions {
    installedOnly?: boolean;
}
export declare class AgentPluginsListView extends AbstractExtensionsListView<IAgentPluginItem> {
    private readonly listOptions;
    private readonly agentPluginService;
    private readonly pluginMarketplaceService;
    private readonly pluginInstallService;
    private readonly labelService;
    private readonly actionStore;
    private readonly queryCts;
    private list;
    private listContainer;
    private currentQuery;
    private readonly refreshOnPluginsChangedScheduler;
    private bodyTemplate;
    constructor(listOptions: IAgentPluginsListViewOptions, options: IViewletViewOptions, keybindingService: IKeybindingService, contextMenuService: IContextMenuService, instantiationService: IInstantiationService, themeService: IThemeService, hoverService: IHoverService, configurationService: IConfigurationService, contextKeyService: IContextKeyService, viewDescriptorService: IViewDescriptorService, openerService: IOpenerService, agentPluginService: IAgentPluginService, pluginMarketplaceService: IPluginMarketplaceService, pluginInstallService: IPluginInstallService, labelService: ILabelService);
    protected renderBody(container: HTMLElement): void;
    private onContextMenu;
    private getContextMenuActions;
    protected layoutBody(height: number, width: number): void;
    show(query: string): Promise<IPagedModel<IAgentPluginItem>>;
    private queryInstalled;
    private queryMarketplace;
    private updateBody;
}
export declare class AgentPluginsViewsContribution extends Disposable implements IWorkbenchContribution {
    static ID: string;
    constructor(contextKeyService: IContextKeyService, agentPluginService: IAgentPluginService);
}
export {};
