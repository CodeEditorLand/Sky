import './media/mcpServersView.css';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { IPagedModel } from '../../../../base/common/paging.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { IContextMenuService } from '../../../../platform/contextview/browser/contextView.js';
import { IDialogService } from '../../../../platform/dialogs/common/dialogs.js';
import { IHoverService } from '../../../../platform/hover/browser/hover.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { IKeybindingService } from '../../../../platform/keybinding/common/keybinding.js';
import { IOpenerService } from '../../../../platform/opener/common/opener.js';
import { IThemeService } from '../../../../platform/theme/common/themeService.js';
import { IViewletViewOptions } from '../../../browser/parts/views/viewsViewlet.js';
import { IViewDescriptorService } from '../../../common/views.js';
import { IMcpWorkbenchService, IWorkbenchMcpServer } from '../common/mcpTypes.js';
import { IWorkbenchContribution } from '../../../common/contributions.js';
import { AbstractExtensionsListView } from '../../extensions/browser/extensionsViews.js';
import { IWorkbenchLayoutService } from '../../../services/layout/browser/layoutService.js';
import { IMcpGalleryManifestService } from '../../../../platform/mcp/common/mcpGalleryManifest.js';
import { IMarkdownRendererService } from '../../../../platform/markdown/browser/markdownRenderer.js';
import { ILogService } from '../../../../platform/log/common/log.js';
export interface McpServerListViewOptions {
    showWelcome?: boolean;
}
export declare class McpServersListView extends AbstractExtensionsListView<IWorkbenchMcpServer> {
    private readonly mpcViewOptions;
    private readonly dialogService;
    private readonly mcpWorkbenchService;
    protected readonly mcpGalleryManifestService: IMcpGalleryManifestService;
    private readonly layoutService;
    protected readonly markdownRendererService: IMarkdownRendererService;
    private readonly logService;
    private list;
    private listContainer;
    private welcomeContainer;
    private bodyTemplate;
    private readonly contextMenuActionRunner;
    private readonly modalNavigationDisposable;
    private input;
    constructor(mpcViewOptions: McpServerListViewOptions, options: IViewletViewOptions, keybindingService: IKeybindingService, contextMenuService: IContextMenuService, instantiationService: IInstantiationService, themeService: IThemeService, hoverService: IHoverService, configurationService: IConfigurationService, contextKeyService: IContextKeyService, viewDescriptorService: IViewDescriptorService, openerService: IOpenerService, dialogService: IDialogService, mcpWorkbenchService: IMcpWorkbenchService, mcpGalleryManifestService: IMcpGalleryManifestService, layoutService: IWorkbenchLayoutService, markdownRendererService: IMarkdownRendererService, logService: ILogService);
    protected renderBody(container: HTMLElement): void;
    private onContextMenu;
    protected layoutBody(height: number, width: number): void;
    show(query: string): Promise<IPagedModel<IWorkbenchMcpServer>>;
    private renderInput;
    private showWelcomeContent;
    private createWelcomeContent;
    private updateBody;
    private query;
    private mergeChangedMcpServers;
}
export declare class DefaultBrowseMcpServersView extends McpServersListView {
    protected renderBody(container: HTMLElement): void;
    show(): Promise<IPagedModel<IWorkbenchMcpServer>>;
}
export declare class McpServersViewsContribution extends Disposable implements IWorkbenchContribution {
    static ID: string;
    constructor();
}
