import { Disposable } from '../../../../base/common/lifecycle.js';
import { IPagedModel } from '../../../../base/common/paging.js';
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
import { IEditorService } from '../../../services/editor/common/editorService.js';
import { AbstractExtensionsListView } from '../../extensions/browser/extensionsViews.js';
import { IAgentPluginService } from '../common/plugins/agentPluginService.js';
import { IPluginInstallService } from '../common/plugins/pluginInstallService.js';
import { IPluginMarketplaceService } from '../common/plugins/pluginMarketplaceService.js';
import { IAgentPluginItem } from './agentPluginEditor/agentPluginItems.js';
export declare const HasInstalledAgentPluginsContext: RawContextKey<boolean>;
export declare const InstalledAgentPluginsViewId = "workbench.views.agentPlugins.installed";
interface IAgentPluginsListViewOptions {
    installedOnly?: boolean;
}
export declare class AgentPluginsListView extends AbstractExtensionsListView<IAgentPluginItem> {
    private readonly listOptions;
    private readonly agentPluginService;
    private readonly pluginMarketplaceService;
    private readonly pluginInstallService;
    private readonly labelService;
    private readonly editorService;
    private readonly actionStore;
    private readonly queryCts;
    private list;
    private listContainer;
    private currentQuery;
    private readonly refreshOnPluginsChangedScheduler;
    private bodyTemplate;
    constructor(listOptions: IAgentPluginsListViewOptions, options: IViewletViewOptions, keybindingService: IKeybindingService, contextMenuService: IContextMenuService, instantiationService: IInstantiationService, themeService: IThemeService, hoverService: IHoverService, configurationService: IConfigurationService, contextKeyService: IContextKeyService, viewDescriptorService: IViewDescriptorService, openerService: IOpenerService, agentPluginService: IAgentPluginService, pluginMarketplaceService: IPluginMarketplaceService, pluginInstallService: IPluginInstallService, labelService: ILabelService, editorService: IEditorService);
    protected renderBody(container: HTMLElement): void;
    private onContextMenu;
    private getContextMenuActions;
    protected layoutBody(height: number, width: number): void;
    show(query: string): Promise<IPagedModel<IAgentPluginItem>>;
    /**
     * Builds the installed plugin list using only cached marketplace data
     * (no IO). The cached data is populated by {@link fetchMarketplacePlugins}
     * and exposed via the {@link IPluginMarketplaceService.lastFetchedPlugins}
     * observable, which the view's autorun subscribes to for reactivity.
     */
    private queryInstalled;
    private queryMarketplacePlugins;
    private updateBody;
}
export declare class AgentPluginsViewsContribution extends Disposable implements IWorkbenchContribution {
    static ID: string;
    constructor(contextKeyService: IContextKeyService, agentPluginService: IAgentPluginService);
}
export {};
