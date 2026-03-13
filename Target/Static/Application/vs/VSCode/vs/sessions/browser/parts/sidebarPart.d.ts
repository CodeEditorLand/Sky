import '../../../workbench/browser/parts/sidebar/media/sidebarpart.css';
import './media/sidebarPart.css';
import { IWorkbenchLayoutService } from '../../../workbench/services/layout/browser/layoutService.js';
import { IStorageService } from '../../../platform/storage/common/storage.js';
import { IContextMenuService } from '../../../platform/contextview/browser/contextView.js';
import { IKeybindingService } from '../../../platform/keybinding/common/keybinding.js';
import { IInstantiationService } from '../../../platform/instantiation/common/instantiation.js';
import { IThemeService } from '../../../platform/theme/common/themeService.js';
import { INotificationService } from '../../../platform/notification/common/notification.js';
import { IContextKeyService } from '../../../platform/contextkey/common/contextkey.js';
import { AnchorAlignment } from '../../../base/browser/ui/contextview/contextview.js';
import { IExtensionService } from '../../../workbench/services/extensions/common/extensions.js';
import { LayoutPriority } from '../../../base/browser/ui/grid/grid.js';
import { IViewDescriptorService } from '../../../workbench/common/views.js';
import { AbstractPaneCompositePart, CompositeBarPosition } from '../../../workbench/browser/parts/paneCompositePart.js';
import { ICompositeTitleLabel } from '../../../workbench/browser/parts/compositePart.js';
import { IPaneCompositeBarOptions } from '../../../workbench/browser/parts/paneCompositeBar.js';
import { IMenuService } from '../../../platform/actions/common/actions.js';
import { IHoverService } from '../../../platform/hover/browser/hover.js';
import { IConfigurationService } from '../../../platform/configuration/common/configuration.js';
/**
 * Sidebar part specifically for agent sessions workbench.
 * This is a simplified version of the SidebarPart for agent session contexts.
 */
export declare class SidebarPart extends AbstractPaneCompositePart {
    private readonly configurationService;
    static readonly activeViewletSettingsKey = "workbench.agentsession.sidebar.activeviewletid";
    static readonly pinnedViewContainersKey = "workbench.agentsession.pinnedViewlets2";
    static readonly placeholderViewContainersKey = "workbench.agentsession.placeholderViewlets";
    static readonly viewContainersWorkspaceStateKey = "workbench.agentsession.viewletsWorkspaceState";
    /** Visual margin values - sidebar is flush (no card appearance) */
    static readonly MARGIN_TOP = 0;
    static readonly MARGIN_BOTTOM = 0;
    static readonly MARGIN_LEFT = 0;
    private static readonly FOOTER_ITEM_HEIGHT;
    private static readonly FOOTER_ITEM_GAP;
    private static readonly FOOTER_VERTICAL_PADDING;
    private footerContainer;
    private sideBarTitleArea;
    private footerToolbar;
    private previousLayoutDimensions;
    readonly minimumWidth: number;
    readonly maximumWidth: number;
    readonly minimumHeight: number;
    readonly maximumHeight: number;
    get snap(): boolean;
    readonly priority: LayoutPriority;
    get preferredWidth(): number | undefined;
    constructor(notificationService: INotificationService, storageService: IStorageService, contextMenuService: IContextMenuService, layoutService: IWorkbenchLayoutService, keybindingService: IKeybindingService, hoverService: IHoverService, instantiationService: IInstantiationService, themeService: IThemeService, viewDescriptorService: IViewDescriptorService, contextKeyService: IContextKeyService, extensionService: IExtensionService, menuService: IMenuService, configurationService: IConfigurationService);
    create(parent: HTMLElement): void;
    protected createTitleArea(parent: HTMLElement): HTMLElement | undefined;
    private createFooter;
    private getFooterHeight;
    private updateFooterVisibility;
    updateStyles(): void;
    layout(width: number, height: number, top: number, left: number): void;
    protected getTitleAreaDropDownAnchorAlignment(): AnchorAlignment;
    protected createTitleLabel(_parent: HTMLElement): ICompositeTitleLabel;
    protected getCompositeBarOptions(): IPaneCompositeBarOptions;
    protected shouldShowCompositeBar(): boolean;
    protected getCompositeBarPosition(): CompositeBarPosition;
    focusActivityBar(): Promise<void>;
    toJSON(): object;
}
