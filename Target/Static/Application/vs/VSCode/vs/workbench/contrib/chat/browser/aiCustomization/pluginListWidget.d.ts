import './media/aiCustomizationManagement.css';
import { Disposable } from '../../../../../base/common/lifecycle.js';
import { IInstantiationService } from '../../../../../platform/instantiation/common/instantiation.js';
import { IOpenerService } from '../../../../../platform/opener/common/opener.js';
import { IContextMenuService, IContextViewService } from '../../../../../platform/contextview/browser/contextView.js';
import { ICommandService } from '../../../../../platform/commands/common/commands.js';
import { IHoverService } from '../../../../../platform/hover/browser/hover.js';
import { IAgentPluginService } from '../../common/plugins/agentPluginService.js';
import { IPluginMarketplaceService } from '../../common/plugins/pluginMarketplaceService.js';
import { IPluginInstallService } from '../../common/plugins/pluginInstallService.js';
import { IAgentPluginItem } from '../agentPluginEditor/agentPluginItems.js';
import { ILabelService } from '../../../../../platform/label/common/label.js';
/**
 * Widget that displays a list of agent plugins with marketplace browsing.
 * Follows the same patterns as {@link McpListWidget}.
 */
export declare class PluginListWidget extends Disposable {
    private readonly instantiationService;
    private readonly agentPluginService;
    private readonly pluginMarketplaceService;
    private readonly pluginInstallService;
    private readonly openerService;
    private readonly contextViewService;
    private readonly contextMenuService;
    private readonly hoverService;
    private readonly labelService;
    private readonly commandService;
    readonly element: HTMLElement;
    private readonly _onDidSelectPlugin;
    readonly onDidSelectPlugin: import("../../../../../base/common/event.js").Event<IAgentPluginItem>;
    private sectionHeader;
    private sectionDescription;
    private sectionLink;
    private searchAndButtonContainer;
    private searchInput;
    private listContainer;
    private list;
    private emptyContainer;
    private emptyText;
    private emptySubtext;
    private browseButton;
    private backLink;
    private installedItems;
    private displayEntries;
    private marketplaceItems;
    private searchQuery;
    private browseMode;
    private readonly collapsedGroups;
    private marketplaceCts;
    private readonly delayedFilter;
    private readonly delayedMarketplaceSearch;
    constructor(instantiationService: IInstantiationService, agentPluginService: IAgentPluginService, pluginMarketplaceService: IPluginMarketplaceService, pluginInstallService: IPluginInstallService, openerService: IOpenerService, contextViewService: IContextViewService, contextMenuService: IContextMenuService, hoverService: IHoverService, labelService: ILabelService, commandService: ICommandService);
    private create;
    private refresh;
    private toggleBrowseMode;
    private queryMarketplace;
    private updateMarketplaceList;
    private filterPlugins;
    private toggleGroup;
    layout(height: number, width: number): void;
    focusSearch(): void;
    focus(): void;
    private onContextMenu;
}
