import './media/browser.css';
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
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
export declare const CONTEXT_BROWSER_CAN_GO_BACK: RawContextKey<boolean>;
export declare const CONTEXT_BROWSER_CAN_GO_FORWARD: RawContextKey<boolean>;
export declare const CONTEXT_BROWSER_FOCUSED: RawContextKey<boolean>;
export declare const CONTEXT_BROWSER_STORAGE_SCOPE: RawContextKey<string>;
export declare const CONTEXT_BROWSER_DEVTOOLS_OPEN: RawContextKey<boolean>;
export declare const CONTEXT_BROWSER_ELEMENT_SELECTION_ACTIVE: RawContextKey<boolean>;
export declare class BrowserEditor extends EditorPane {
    private readonly keybindingService;
    private readonly logService;
    private readonly instantiationService;
    private readonly contextKeyService;
    private readonly editorService;
    private readonly browserElementsService;
    private readonly chatWidgetService;
    private readonly configurationService;
    static readonly ID = "workbench.editor.browser";
    private _overlayVisible;
    private _editorVisible;
    private _currentKeyDownEvent;
    private _navigationBar;
    private _browserContainer;
    private _placeholderScreenshot;
    private _errorContainer;
    private _welcomeContainer;
    private _canGoBackContext;
    private _canGoForwardContext;
    private _storageScopeContext;
    private _devToolsOpenContext;
    private _elementSelectionActiveContext;
    private _model;
    private readonly _inputDisposables;
    private overlayManager;
    private _elementSelectionCts;
    constructor(group: IEditorGroup, telemetryService: ITelemetryService, themeService: IThemeService, storageService: IStorageService, keybindingService: IKeybindingService, logService: ILogService, instantiationService: IInstantiationService, contextKeyService: IContextKeyService, editorService: IEditorService, browserElementsService: IBrowserElementsService, chatWidgetService: IChatWidgetService, configurationService: IConfigurationService);
    protected createEditor(parent: HTMLElement): void;
    setInput(input: BrowserEditorInput, options: IEditorOptions | undefined, context: IEditorOpenContext, token: CancellationToken): Promise<void>;
    protected setEditorVisible(visible: boolean): void;
    private updateVisibility;
    private get shouldShowView();
    private checkOverlays;
    private updateErrorDisplay;
    getUrl(): string | undefined;
    navigateToUrl(url: string): Promise<void>;
    goBack(): Promise<void>;
    goForward(): Promise<void>;
    reload(): Promise<void>;
    toggleDevTools(): Promise<void>;
    /**
     * Start element selection in the browser view, wait for a user selection, and add it to chat.
     */
    addElementToChat(): Promise<void>;
    /**
     * Update navigation state and context keys
     */
    private updateNavigationState;
    /**
     * Create the welcome container shown when no URL is loaded
     */
    private createWelcomeContainer;
    private setBackgroundImage;
    /**
     * Capture a screenshot of the current browser view to use as placeholder background
     */
    private capturePlaceholderSnapshot;
    forwardCurrentEvent(): boolean;
    private handleKeyEventFromBrowserView;
    layout(): void;
    clearInput(): void;
}
