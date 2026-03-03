import '../../../workbench/browser/parts/auxiliarybar/media/auxiliaryBarPart.css';
import { IContextKeyService } from '../../../platform/contextkey/common/contextkey.js';
import { IContextMenuService } from '../../../platform/contextview/browser/contextView.js';
import { IInstantiationService } from '../../../platform/instantiation/common/instantiation.js';
import { IKeybindingService } from '../../../platform/keybinding/common/keybinding.js';
import { INotificationService } from '../../../platform/notification/common/notification.js';
import { IStorageService } from '../../../platform/storage/common/storage.js';
import { IThemeService } from '../../../platform/theme/common/themeService.js';
import { IViewDescriptorService } from '../../../workbench/common/views.js';
import { IExtensionService } from '../../../workbench/services/extensions/common/extensions.js';
import { IWorkbenchLayoutService } from '../../../workbench/services/layout/browser/layoutService.js';
import { IAction } from '../../../base/common/actions.js';
import { LayoutPriority } from '../../../base/browser/ui/splitview/splitview.js';
import { AbstractPaneCompositePart, CompositeBarPosition } from '../../../workbench/browser/parts/paneCompositePart.js';
import { IActionViewItem } from '../../../base/browser/ui/actionbar/actionbar.js';
import { IPaneCompositeBarOptions } from '../../../workbench/browser/parts/paneCompositeBar.js';
import { IMenuService } from '../../../platform/actions/common/actions.js';
import { IHoverService } from '../../../platform/hover/browser/hover.js';
import { IBaseActionViewItemOptions } from '../../../base/browser/ui/actionbar/actionViewItems.js';
/**
 * Auxiliary bar part specifically for agent sessions workbench.
 * This is a simplified version of the AuxiliaryBarPart for agent session contexts.
 */
export declare class AuxiliaryBarPart extends AbstractPaneCompositePart {
    static readonly activeViewSettingsKey = "workbench.agentsession.auxiliarybar.activepanelid";
    static readonly pinnedViewsKey = "workbench.agentsession.auxiliarybar.pinnedPanels";
    static readonly placeholderViewContainersKey = "workbench.agentsession.auxiliarybar.placeholderPanels";
    static readonly viewContainersWorkspaceStateKey = "workbench.agentsession.auxiliarybar.viewContainersWorkspaceState";
    /** Visual margin values for the card-like appearance */
    static readonly MARGIN_TOP = 8;
    static readonly MARGIN_BOTTOM = 8;
    static readonly MARGIN_RIGHT = 8;
    private static readonly RUN_SCRIPT_ACTION_ID;
    private static readonly RUN_SCRIPT_DROPDOWN_MENU_ID;
    private readonly _runScriptDropdown;
    private readonly _runScriptMenu;
    private readonly _runScriptMenuListener;
    readonly minimumWidth: number;
    readonly maximumWidth: number;
    readonly minimumHeight: number;
    readonly maximumHeight: number;
    get preferredHeight(): number | undefined;
    get preferredWidth(): number | undefined;
    readonly priority = LayoutPriority.Low;
    constructor(notificationService: INotificationService, storageService: IStorageService, contextMenuService: IContextMenuService, layoutService: IWorkbenchLayoutService, keybindingService: IKeybindingService, hoverService: IHoverService, instantiationService: IInstantiationService, themeService: IThemeService, viewDescriptorService: IViewDescriptorService, contextKeyService: IContextKeyService, extensionService: IExtensionService, menuService: IMenuService);
    updateStyles(): void;
    protected getCompositeBarOptions(): IPaneCompositeBarOptions;
    protected actionViewItemProvider(action: IAction, options: IBaseActionViewItemOptions): IActionViewItem | undefined;
    private _getRunScriptDropdownActions;
    private _updateRunScriptDropdown;
    private fillExtraContextMenuActions;
    protected shouldShowCompositeBar(): boolean;
    protected getCompositeBarPosition(): CompositeBarPosition;
    layout(width: number, height: number, top: number, left: number): void;
    toJSON(): object;
}
