import './media/browser.css';
import { Dimension, IDomPosition } from '../../../../base/browser/dom.js';
import { CancellationToken } from '../../../../base/common/cancellation.js';
import { RawContextKey, IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { IEditorService } from '../../../services/editor/common/editorService.js';
import { EditorPane } from '../../../browser/parts/editor/editorPane.js';
import { IEditorOpenContext } from '../../../common/editor.js';
import { BrowserEditorInput } from './browserEditorInput.js';
import { IThemeService } from '../../../../platform/theme/common/themeService.js';
import { ITelemetryService } from '../../../../platform/telemetry/common/telemetry.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { IEditorGroup } from '../../../services/editor/common/editorGroupsService.js';
import { IEditorOptions } from '../../../../platform/editor/common/editor.js';
import { IKeybindingService } from '../../../../platform/keybinding/common/keybinding.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { IBrowserElementsService } from '../../../services/browserElements/browser/browserElementsService.js';
import { IChatWidgetService } from '../../chat/browser/chat.js';
import { CONTEXT_BROWSER_FIND_WIDGET_FOCUSED, CONTEXT_BROWSER_FIND_WIDGET_VISIBLE } from './browserFindWidget.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { ILayoutService } from '../../../../platform/layout/browser/layoutService.js';
export declare const CONTEXT_BROWSER_CAN_GO_BACK: RawContextKey<boolean>;
export declare const CONTEXT_BROWSER_CAN_GO_FORWARD: RawContextKey<boolean>;
export declare const CONTEXT_BROWSER_FOCUSED: RawContextKey<boolean>;
export declare const CONTEXT_BROWSER_STORAGE_SCOPE: RawContextKey<string>;
export declare const CONTEXT_BROWSER_HAS_URL: RawContextKey<boolean>;
export declare const CONTEXT_BROWSER_HAS_ERROR: RawContextKey<boolean>;
export declare const CONTEXT_BROWSER_DEVTOOLS_OPEN: RawContextKey<boolean>;
export declare const CONTEXT_BROWSER_ELEMENT_SELECTION_ACTIVE: RawContextKey<boolean>;
export declare const CONTEXT_BROWSER_CAN_ZOOM_IN: RawContextKey<boolean>;
export declare const CONTEXT_BROWSER_CAN_ZOOM_OUT: RawContextKey<boolean>;
export { CONTEXT_BROWSER_FIND_WIDGET_FOCUSED, CONTEXT_BROWSER_FIND_WIDGET_VISIBLE };
export declare class BrowserEditor extends EditorPane {
    private readonly keybindingService;
    private readonly logService;
    private readonly instantiationService;
    private readonly contextKeyService;
    private readonly editorService;
    private readonly browserElementsService;
    private readonly chatWidgetService;
    private readonly configurationService;
    private readonly layoutService;
    static readonly ID = "workbench.editor.browser";
    private _overlayVisible;
    private _editorVisible;
    private _currentKeyDownEvent;
    private _navigationBar;
    private _browserContainerWrapper;
    private _browserContainer;
    private _placeholderScreenshot;
    private _overlayPauseContainer;
    private _overlayPauseHeading;
    private _overlayPauseDetail;
    private _errorContainer;
    private _welcomeContainer;
    private _findWidgetContainer;
    private _findWidget;
    private _canGoBackContext;
    private _canGoForwardContext;
    private _storageScopeContext;
    private _hasUrlContext;
    private _hasErrorContext;
    private _devToolsOpenContext;
    private _elementSelectionActiveContext;
    private _canZoomInContext;
    private _canZoomOutContext;
    private _model;
    private readonly _inputDisposables;
    private overlayManager;
    private _elementSelectionCts;
    private _consoleSessionCts;
    private _screenshotTimeout;
    constructor(group: IEditorGroup, telemetryService: ITelemetryService, themeService: IThemeService, storageService: IStorageService, keybindingService: IKeybindingService, logService: ILogService, instantiationService: IInstantiationService, contextKeyService: IContextKeyService, editorService: IEditorService, browserElementsService: IBrowserElementsService, chatWidgetService: IChatWidgetService, configurationService: IConfigurationService, layoutService: ILayoutService);
    protected createEditor(parent: HTMLElement): void;
    setInput(input: BrowserEditorInput, options: IEditorOptions | undefined, context: IEditorOpenContext, token: CancellationToken): Promise<void>;
    protected setEditorVisible(visible: boolean): void;
    /**
     * Make the browser container the active element without moving focus from the browser view.
     */
    private ensureBrowserFocus;
    private updateVisibility;
    private get shouldShowView();
    private checkOverlays;
    private updateOverlayPauseMessage;
    private updateErrorDisplay;
    getUrl(): string | undefined;
    private _updateSharingState;
    toggleShareWithAgent(): void;
    navigateToUrl(url: string): Promise<void>;
    focusUrlInput(): void;
    goBack(): Promise<void>;
    goForward(): Promise<void>;
    reload(hard?: boolean): Promise<void>;
    toggleDevTools(): Promise<void>;
    clearStorage(): Promise<void>;
    zoomIn(): Promise<void>;
    zoomOut(): Promise<void>;
    resetZoom(): Promise<void>;
    private updateZoomContext;
    /**
     * Show the find widget, optionally pre-populated with selected text from the browser view
     */
    showFind(): Promise<void>;
    /**
     * Hide the find widget
     */
    hideFind(): void;
    /**
     * Find the next match
     */
    findNext(): void;
    /**
     * Find the previous match
     */
    findPrevious(): void;
    /**
     * Start element selection in the browser view, wait for a user selection, and add it to chat.
     */
    addElementToChat(): Promise<void>;
    /**
     * Grab the current console logs from the active console session and attach them to chat.
     */
    addConsoleLogsToChat(): Promise<void>;
    /**
     * Start a console session to capture logs from the browser view.
     */
    private startConsoleSession;
    /**
     * Stop the active console session.
     */
    private stopConsoleSession;
    private createElementContextValue;
    private attachElementDataToChat;
    private formatElementPath;
    private formatElementMap;
    private createBoxShorthand;
    /**
     * Update navigation state and context keys
     */
    private updateNavigationState;
    /**
     * Create the welcome container shown when no URL is loaded
     */
    private createWelcomeContainer;
    private setBackgroundImage;
    private doScreenshot;
    private cancelScheduledScreenshot;
    forwardCurrentEvent(): boolean;
    private handleKeyEventFromBrowserView;
    layout(dimension?: Dimension, _position?: IDomPosition): void;
    /**
     * Recompute the layout of the browser container and update the model with the new bounds.
     * This should generally only be called via layout() to ensure that the container is ready and all necessary styles are loaded.
     */
    private layoutBrowserContainer;
    clearInput(): void;
}
