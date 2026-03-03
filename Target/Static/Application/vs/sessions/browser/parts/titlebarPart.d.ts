import '../../../workbench/browser/parts/titlebar/media/titlebarpart.css';
import './media/titlebarpart.css';
import { MultiWindowParts, Part } from '../../../workbench/browser/part.js';
import { ITitleService } from '../../../workbench/services/title/browser/titleService.js';
import { IContextMenuService } from '../../../platform/contextview/browser/contextView.js';
import { IConfigurationService } from '../../../platform/configuration/common/configuration.js';
import { IThemeService } from '../../../platform/theme/common/themeService.js';
import { IInstantiationService } from '../../../platform/instantiation/common/instantiation.js';
import { Event } from '../../../base/common/event.js';
import { IStorageService } from '../../../platform/storage/common/storage.js';
import { IWorkbenchLayoutService } from '../../../workbench/services/layout/browser/layoutService.js';
import { IContextKeyService } from '../../../platform/contextkey/common/contextkey.js';
import { IHostService } from '../../../workbench/services/host/browser/host.js';
import { IEditorGroupsContainer } from '../../../workbench/services/editor/common/editorGroupsService.js';
import { CodeWindow } from '../../../base/browser/window.js';
import { ITitlebarPart, ITitleProperties, ITitleVariable, IAuxiliaryTitlebarPart } from '../../../workbench/browser/parts/titlebar/titlebarPart.js';
/**
 * Simplified agent sessions titlebar part.
 *
 * Three sections driven entirely by menus:
 * - **Left**: `Menus.TitleBarLeft` toolbar
 * - **Center**: `Menus.CommandCenter` toolbar (renders session picker via IActionViewItemService)
 * - **Right**: `Menus.TitleBarRight` toolbar (includes account submenu)
 *
 * No menubar, no editor actions, no layout controls, no WindowTitle dependency.
 */
export declare class TitlebarPart extends Part implements ITitlebarPart {
    private readonly contextMenuService;
    protected readonly configurationService: IConfigurationService;
    protected readonly instantiationService: IInstantiationService;
    private readonly contextKeyService;
    private readonly hostService;
    readonly minimumWidth: number;
    readonly maximumWidth: number;
    get minimumHeight(): number;
    get maximumHeight(): number;
    private readonly _onMenubarVisibilityChange;
    readonly onMenubarVisibilityChange: Event<boolean>;
    private readonly _onWillDispose;
    readonly onWillDispose: Event<void>;
    private rootContainer;
    private windowControlsContainer;
    private leftContent;
    private centerContent;
    private rightContent;
    private readonly titleBarStyle;
    private isInactive;
    constructor(id: string, targetWindow: CodeWindow, contextMenuService: IContextMenuService, configurationService: IConfigurationService, instantiationService: IInstantiationService, themeService: IThemeService, storageService: IStorageService, layoutService: IWorkbenchLayoutService, contextKeyService: IContextKeyService, hostService: IHostService);
    private registerListeners;
    private onBlur;
    private onFocus;
    updateProperties(_properties: ITitleProperties): void;
    registerVariables(_variables: ITitleVariable[]): void;
    updateOptions(_options: {
        compact: boolean;
    }): void;
    protected createContentArea(parent: HTMLElement): HTMLElement;
    updateStyles(): void;
    private onContextMenu;
    get hasZoomableElements(): boolean;
    get preventZoom(): boolean;
    layout(width: number, height: number): void;
    private updateLayout;
    focus(): void;
    toJSON(): object;
    dispose(): void;
}
/**
 * Main agent sessions titlebar part (for the main window).
 */
export declare class MainTitlebarPart extends TitlebarPart {
    constructor(contextMenuService: IContextMenuService, configurationService: IConfigurationService, instantiationService: IInstantiationService, themeService: IThemeService, storageService: IStorageService, layoutService: IWorkbenchLayoutService, contextKeyService: IContextKeyService, hostService: IHostService);
}
/**
 * Auxiliary agent sessions titlebar part (for auxiliary windows).
 */
export declare class AuxiliaryTitlebarPart extends TitlebarPart implements IAuxiliaryTitlebarPart {
    readonly container: HTMLElement;
    private readonly mainTitlebar;
    private static COUNTER;
    get height(): number;
    constructor(container: HTMLElement, mainTitlebar: TitlebarPart, contextMenuService: IContextMenuService, configurationService: IConfigurationService, instantiationService: IInstantiationService, themeService: IThemeService, storageService: IStorageService, layoutService: IWorkbenchLayoutService, contextKeyService: IContextKeyService, hostService: IHostService);
    get preventZoom(): boolean;
}
/**
 * Agent Sessions title service - manages the titlebar parts.
 */
export declare class TitleService extends MultiWindowParts<TitlebarPart> implements ITitleService {
    protected readonly instantiationService: IInstantiationService;
    _serviceBrand: undefined;
    readonly mainPart: TitlebarPart;
    constructor(instantiationService: IInstantiationService, storageService: IStorageService, themeService: IThemeService);
    protected createMainTitlebarPart(): TitlebarPart;
    createAuxiliaryTitlebarPart(container: HTMLElement, editorGroupsContainer: IEditorGroupsContainer, instantiationService: IInstantiationService): IAuxiliaryTitlebarPart;
    protected doCreateAuxiliaryTitlebarPart(container: HTMLElement, _editorGroupsContainer: IEditorGroupsContainer, instantiationService: IInstantiationService): TitlebarPart & IAuxiliaryTitlebarPart;
    readonly onMenubarVisibilityChange: Event<boolean>;
    updateProperties(properties: ITitleProperties): void;
    registerVariables(variables: ITitleVariable[]): void;
}
