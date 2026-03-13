import { IConfigurationService } from '../../../platform/configuration/common/configuration.js';
import { IContextKeyService } from '../../../platform/contextkey/common/contextkey.js';
import { IContextMenuService } from '../../../platform/contextview/browser/contextView.js';
import { IInstantiationService } from '../../../platform/instantiation/common/instantiation.js';
import { INativeHostService } from '../../../platform/native/common/native.js';
import { IStorageService } from '../../../platform/storage/common/storage.js';
import { IThemeService } from '../../../platform/theme/common/themeService.js';
import { IHostService } from '../../../workbench/services/host/browser/host.js';
import { IWorkbenchLayoutService } from '../../../workbench/services/layout/browser/layoutService.js';
import { IAuxiliaryTitlebarPart } from '../../../workbench/browser/parts/titlebar/titlebarPart.js';
import { IEditorGroupsContainer } from '../../../workbench/services/editor/common/editorGroupsService.js';
import { CodeWindow } from '../../../base/browser/window.js';
import { TitlebarPart, TitleService } from '../../browser/parts/titlebarPart.js';
export declare class NativeTitlebarPart extends TitlebarPart {
    private readonly nativeHostService;
    private cachedWindowControlStyles;
    private cachedWindowControlHeight;
    constructor(id: string, targetWindow: CodeWindow, contextMenuService: IContextMenuService, configurationService: IConfigurationService, instantiationService: IInstantiationService, themeService: IThemeService, storageService: IStorageService, layoutService: IWorkbenchLayoutService, contextKeyService: IContextKeyService, hostService: IHostService, nativeHostService: INativeHostService);
    private handleWindowsAlwaysOnTop;
    updateStyles(): void;
    layout(width: number, height: number): void;
}
declare class MainNativeTitlebarPart extends NativeTitlebarPart {
    constructor(contextMenuService: IContextMenuService, configurationService: IConfigurationService, instantiationService: IInstantiationService, themeService: IThemeService, storageService: IStorageService, layoutService: IWorkbenchLayoutService, contextKeyService: IContextKeyService, hostService: IHostService, nativeHostService: INativeHostService);
}
declare class AuxiliaryNativeTitlebarPart extends NativeTitlebarPart implements IAuxiliaryTitlebarPart {
    readonly container: HTMLElement;
    private readonly mainTitlebar;
    private static COUNTER;
    get height(): number;
    constructor(container: HTMLElement, mainTitlebar: TitlebarPart, contextMenuService: IContextMenuService, configurationService: IConfigurationService, instantiationService: IInstantiationService, themeService: IThemeService, storageService: IStorageService, layoutService: IWorkbenchLayoutService, contextKeyService: IContextKeyService, hostService: IHostService, nativeHostService: INativeHostService);
    get preventZoom(): boolean;
}
export declare class NativeTitleService extends TitleService {
    protected createMainTitlebarPart(): MainNativeTitlebarPart;
    protected doCreateAuxiliaryTitlebarPart(container: HTMLElement, _editorGroupsContainer: IEditorGroupsContainer, instantiationService: IInstantiationService): AuxiliaryNativeTitlebarPart;
}
export {};
