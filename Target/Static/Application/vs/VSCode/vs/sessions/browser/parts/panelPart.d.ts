import '../../../workbench/browser/parts/panel/media/panelpart.css';
import './media/panelPart.css';
import { IWorkbenchLayoutService } from '../../../workbench/services/layout/browser/layoutService.js';
import { IStorageService } from '../../../platform/storage/common/storage.js';
import { IContextMenuService } from '../../../platform/contextview/browser/contextView.js';
import { IKeybindingService } from '../../../platform/keybinding/common/keybinding.js';
import { IInstantiationService } from '../../../platform/instantiation/common/instantiation.js';
import { IThemeService } from '../../../platform/theme/common/themeService.js';
import { INotificationService } from '../../../platform/notification/common/notification.js';
import { IContextKeyService } from '../../../platform/contextkey/common/contextkey.js';
import { IExtensionService } from '../../../workbench/services/extensions/common/extensions.js';
import { IViewDescriptorService } from '../../../workbench/common/views.js';
import { IMenuService } from '../../../platform/actions/common/actions.js';
import { AbstractPaneCompositePart, CompositeBarPosition } from '../../../workbench/browser/parts/paneCompositePart.js';
import { IPaneCompositeBarOptions } from '../../../workbench/browser/parts/paneCompositeBar.js';
import { IHoverService } from '../../../platform/hover/browser/hover.js';
import { IConfigurationService } from '../../../platform/configuration/common/configuration.js';
/**
 * Panel part specifically for agent sessions workbench.
 * This is a simplified version of the PanelPart for agent session contexts.
 */
export declare class PanelPart extends AbstractPaneCompositePart {
    private readonly configurationService;
    readonly minimumWidth: number;
    readonly maximumWidth: number;
    readonly minimumHeight: number;
    readonly maximumHeight: number;
    get preferredHeight(): number | undefined;
    get preferredWidth(): number | undefined;
    static readonly activePanelSettingsKey = "workbench.agentsession.panelpart.activepanelid";
    /** Visual margin values for the card-like appearance */
    static readonly MARGIN_BOTTOM = 8;
    static readonly MARGIN_LEFT = 8;
    static readonly MARGIN_RIGHT = 8;
    constructor(notificationService: INotificationService, storageService: IStorageService, contextMenuService: IContextMenuService, layoutService: IWorkbenchLayoutService, keybindingService: IKeybindingService, hoverService: IHoverService, instantiationService: IInstantiationService, themeService: IThemeService, viewDescriptorService: IViewDescriptorService, contextKeyService: IContextKeyService, extensionService: IExtensionService, menuService: IMenuService, configurationService: IConfigurationService);
    updateStyles(): void;
    protected getCompositeBarOptions(): IPaneCompositeBarOptions;
    private fillExtraContextMenuActions;
    layout(width: number, height: number, top: number, left: number): void;
    protected shouldShowCompositeBar(): boolean;
    protected getCompositeBarPosition(): CompositeBarPosition;
    toJSON(): object;
}
