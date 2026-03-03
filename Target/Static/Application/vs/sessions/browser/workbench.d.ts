import '../../workbench/browser/style.js';
import './media/style.css';
import { Disposable, DisposableStore, IDisposable } from '../../base/common/lifecycle.js';
import { Event } from '../../base/common/event.js';
import { IDimension } from '../../base/browser/dom.js';
import { Parts, Position, PanelAlignment, IWorkbenchLayoutService, SINGLE_WINDOW_PARTS, MULTI_WINDOW_PARTS, IPartVisibilityChangeEvent } from '../../workbench/services/layout/browser/layoutService.js';
import { ILayoutOffsetInfo } from '../../platform/layout/browser/layoutService.js';
import { Part } from '../../workbench/browser/part.js';
import { Direction, IViewSize } from '../../base/browser/ui/grid/grid.js';
import { ILogService } from '../../platform/log/common/log.js';
import { IInstantiationService, ServicesAccessor } from '../../platform/instantiation/common/instantiation.js';
import { CodeWindow } from '../../base/browser/window.js';
import { ServiceCollection } from '../../platform/instantiation/common/serviceCollection.js';
import { WillShutdownEvent } from '../../workbench/services/lifecycle/common/lifecycle.js';
export interface IWorkbenchOptions {
    /**
     * Extra classes to be added to the workbench container.
     */
    extraClasses?: string[];
}
export declare class Workbench extends Disposable implements IWorkbenchLayoutService {
    protected readonly parent: HTMLElement;
    private readonly options;
    private readonly serviceCollection;
    private readonly logService;
    readonly _serviceBrand: undefined;
    private readonly _onWillShutdown;
    readonly onWillShutdown: Event<WillShutdownEvent>;
    private readonly _onDidShutdown;
    readonly onDidShutdown: Event<void>;
    private readonly _onDidChangeZenMode;
    readonly onDidChangeZenMode: Event<boolean>;
    private readonly _onDidChangeMainEditorCenteredLayout;
    readonly onDidChangeMainEditorCenteredLayout: Event<boolean>;
    private readonly _onDidChangePanelAlignment;
    readonly onDidChangePanelAlignment: Event<PanelAlignment>;
    private readonly _onDidChangeWindowMaximized;
    readonly onDidChangeWindowMaximized: Event<{
        windowId: number;
        maximized: boolean;
    }>;
    private readonly _onDidChangePanelPosition;
    readonly onDidChangePanelPosition: Event<string>;
    private readonly _onDidChangePartVisibility;
    readonly onDidChangePartVisibility: Event<IPartVisibilityChangeEvent>;
    private readonly _onDidChangeNotificationsVisibility;
    readonly onDidChangeNotificationsVisibility: Event<boolean>;
    private readonly _onDidChangeAuxiliaryBarMaximized;
    readonly onDidChangeAuxiliaryBarMaximized: Event<void>;
    private readonly _onDidLayoutMainContainer;
    readonly onDidLayoutMainContainer: Event<IDimension>;
    private readonly _onDidLayoutActiveContainer;
    readonly onDidLayoutActiveContainer: Event<IDimension>;
    private readonly _onDidLayoutContainer;
    readonly onDidLayoutContainer: Event<{
        container: HTMLElement;
        dimension: IDimension;
    }>;
    private readonly _onDidAddContainer;
    readonly onDidAddContainer: Event<{
        container: HTMLElement;
        disposables: DisposableStore;
    }>;
    private readonly _onDidChangeActiveContainer;
    readonly onDidChangeActiveContainer: Event<void>;
    readonly mainContainer: HTMLDivElement;
    get activeContainer(): HTMLElement;
    get containers(): Iterable<HTMLElement>;
    private getContainerFromDocument;
    private _mainContainerDimension;
    get mainContainerDimension(): IDimension;
    get activeContainerDimension(): IDimension;
    private getContainerDimension;
    get mainContainerOffset(): ILayoutOffsetInfo;
    get activeContainerOffset(): ILayoutOffsetInfo;
    private computeContainerOffset;
    private readonly parts;
    private workbenchGrid;
    private titleBarPartView;
    private sideBarPartView;
    private panelPartView;
    private auxiliaryBarPartView;
    private chatBarPartView;
    private readonly partVisibility;
    private mainWindowFullscreen;
    private readonly maximized;
    private readonly restoredPromise;
    readonly whenRestored: Promise<void>;
    private restored;
    readonly openedDefaultEditors = false;
    private editorGroupService;
    private editorService;
    private paneCompositeService;
    private viewDescriptorService;
    constructor(parent: HTMLElement, options: IWorkbenchOptions | undefined, serviceCollection: ServiceCollection, logService: ILogService);
    private registerErrorHandler;
    private previousUnexpectedError;
    private handleUnexpectedError;
    startup(): IInstantiationService;
    private initServices;
    private registerListeners;
    private fontAliasing;
    private updateFontAliasing;
    private restoreFontInfo;
    private storeFontInfo;
    private renderWorkbench;
    private createNotificationsHandlers;
    private createPartContainer;
    private createHiddenEditorPart;
    private restore;
    private restoreParts;
    initLayout(accessor: ServicesAccessor): void;
    private areAllGroupsEmpty;
    private registerLayoutListeners;
    private updateFullscreenClass;
    createWorkbenchLayout(): void;
    createWorkbenchManagement(_instantiationService: IInstantiationService): void;
    /**
     * Creates the grid descriptor for the Agent Sessions layout.
     * Editor is NOT included - it's rendered as a modal overlay.
     *
     * Structure (horizontal orientation):
     * - Sidebar (left, spans full height from top to bottom)
     * - Right section (vertical):
     *   - Titlebar (top of right section)
     *   - Top right (horizontal): Chat Bar | Auxiliary Bar
     *   - Panel (below chat and auxiliary bar only)
     */
    private createGridDescriptor;
    layout(): void;
    private handleContainerDidLayout;
    getLayoutClasses(): string[];
    registerPart(part: Part): IDisposable;
    getPart(key: Parts): Part;
    hasFocus(part: Parts): boolean;
    focusPart(part: MULTI_WINDOW_PARTS, targetWindow: Window): void;
    focusPart(part: SINGLE_WINDOW_PARTS): void;
    focus(): void;
    getContainer(targetWindow: Window): HTMLElement;
    getContainer(targetWindow: Window, part: Parts): HTMLElement | undefined;
    whenContainerStylesLoaded(_window: CodeWindow): Promise<void> | undefined;
    isActivityBarHidden(): boolean;
    isVisible(part: SINGLE_WINDOW_PARTS): boolean;
    isVisible(part: MULTI_WINDOW_PARTS, targetWindow: Window): boolean;
    setPartHidden(hidden: boolean, part: Parts): void;
    private setSideBarHidden;
    private setAuxiliaryBarHidden;
    private setEditorHidden;
    private setPanelHidden;
    private setChatBarHidden;
    getSideBarPosition(): Position;
    getPanelPosition(): Position;
    setPanelPosition(_position: Position): void;
    getPanelAlignment(): PanelAlignment;
    setPanelAlignment(_alignment: PanelAlignment): void;
    getSize(part: Parts): IViewSize;
    setSize(part: Parts, size: IViewSize): void;
    resizePart(part: Parts, sizeChangeWidth: number, sizeChangeHeight: number): void;
    private getPartView;
    getMaximumEditorDimensions(_container: HTMLElement): IDimension;
    toggleMaximizedPanel(): void;
    isPanelMaximized(): boolean;
    toggleMaximizedAuxiliaryBar(): void;
    setAuxiliaryBarMaximized(_maximized: boolean): boolean;
    isAuxiliaryBarMaximized(): boolean;
    toggleZenMode(): void;
    toggleMenuBar(): void;
    isMainEditorLayoutCentered(): boolean;
    centerMainEditorLayout(_active: boolean): void;
    hasMainWindowBorder(): boolean;
    getMainWindowBorderRadius(): string | undefined;
    isWindowMaximized(targetWindow: Window): boolean;
    updateWindowMaximizedState(targetWindow: Window, maximized: boolean): void;
    getVisibleNeighborPart(part: Parts, direction: Direction): Parts | undefined;
    isRestored(): boolean;
    setRestored(): void;
    registerNotifications(delegate: {
        onDidChangeNotificationsVisibility: Event<boolean>;
    }): void;
}
