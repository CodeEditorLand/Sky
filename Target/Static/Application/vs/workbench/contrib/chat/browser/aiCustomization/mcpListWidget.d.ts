import './media/aiCustomizationManagement.css';
import { Disposable } from '../../../../../base/common/lifecycle.js';
import { IInstantiationService } from '../../../../../platform/instantiation/common/instantiation.js';
import { ICommandService } from '../../../../../platform/commands/common/commands.js';
import { IMcpWorkbenchService, IWorkbenchMcpServer, IMcpService } from '../../../../contrib/mcp/common/mcpTypes.js';
import { IOpenerService } from '../../../../../platform/opener/common/opener.js';
import { IContextMenuService, IContextViewService } from '../../../../../platform/contextview/browser/contextView.js';
import { IHoverService } from '../../../../../platform/hover/browser/hover.js';
/**
 * Widget that displays a list of MCP servers with marketplace browsing.
 */
export declare class McpListWidget extends Disposable {
    private readonly instantiationService;
    private readonly mcpWorkbenchService;
    private readonly mcpService;
    private readonly commandService;
    private readonly openerService;
    private readonly contextViewService;
    private readonly contextMenuService;
    private readonly hoverService;
    readonly element: HTMLElement;
    private readonly _onDidSelectServer;
    readonly onDidSelectServer: import("../../../../../base/common/event.js").Event<IWorkbenchMcpServer>;
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
    private addButton;
    private backLink;
    private filteredServers;
    private displayEntries;
    private galleryServers;
    private searchQuery;
    private browseMode;
    private readonly collapsedGroups;
    private galleryCts;
    private readonly delayedFilter;
    private readonly delayedGallerySearch;
    constructor(instantiationService: IInstantiationService, mcpWorkbenchService: IMcpWorkbenchService, mcpService: IMcpService, commandService: ICommandService, openerService: IOpenerService, contextViewService: IContextViewService, contextMenuService: IContextMenuService, hoverService: IHoverService);
    private create;
    private refresh;
    private toggleBrowseMode;
    private queryGallery;
    private updateGalleryList;
    private filterServers;
    /**
     * Toggles the collapsed state of a group.
     */
    private toggleGroup;
    /**
     * Layouts the widget.
     */
    layout(height: number, width: number): void;
    /**
     * Focuses the search input.
     */
    focusSearch(): void;
    /**
     * Focuses the list.
     */
    focus(): void;
    /**
     * Handles context menu for MCP server items.
     */
    private onContextMenu;
}
