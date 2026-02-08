import './media/inlineChatOverlayWidget.css';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { IObservable } from '../../../../base/common/observable.js';
import { IOverlayWidgetPosition } from '../../../../editor/browser/editorBrowser.js';
import { ObservableCodeEditor } from '../../../../editor/browser/observableCodeEditor.js';
import { IModelService } from '../../../../editor/common/services/model.js';
import { IMenuService } from '../../../../platform/actions/common/actions.js';
import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { IKeybindingService } from '../../../../platform/keybinding/common/keybinding.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IInlineChatSession2 } from './inlineChatSessionService.js';
/**
 * Overlay widget that displays a vertical action bar menu.
 */
export declare class InlineChatInputWidget extends Disposable {
    private readonly _editorObs;
    private readonly _keybindingService;
    private readonly _menuService;
    private readonly _contextKeyService;
    private readonly _domNode;
    private readonly _inputContainer;
    private readonly _actionBar;
    private readonly _input;
    private readonly _position;
    readonly position: IObservable<IOverlayWidgetPosition | null>;
    private readonly _showStore;
    private readonly _stickyScrollHeight;
    private _inlineStartAction;
    private _anchorLineNumber;
    private _anchorLeft;
    private _anchorAbove;
    constructor(_editorObs: ObservableCodeEditor, _keybindingService: IKeybindingService, _menuService: IMenuService, _contextKeyService: IContextKeyService, instantiationService: IInstantiationService, modelService: IModelService, configurationService: IConfigurationService);
    /**
     * Show the widget at the specified line.
     * @param lineNumber The line number to anchor the widget to
     * @param left Left offset relative to editor
     * @param anchorAbove Whether to anchor above the position (widget grows upward)
     */
    show(lineNumber: number, left: number, anchorAbove: boolean): void;
    private _updatePosition;
    /**
     * Hide the widget (removes from editor but does not dispose).
     */
    private _hide;
    private _refreshActions;
    private _updateInputHeight;
}
/**
 * Overlay widget that displays progress messages during inline chat requests.
 */
export declare class InlineChatSessionOverlayWidget extends Disposable {
    private readonly _editorObs;
    private readonly _instaService;
    private readonly _keybindingService;
    private readonly _domNode;
    private readonly _container;
    private readonly _statusNode;
    private readonly _icon;
    private readonly _message;
    private readonly _toolbarNode;
    private readonly _showStore;
    private readonly _position;
    private readonly _minContentWidthInPx;
    private readonly _stickyScrollHeight;
    constructor(_editorObs: ObservableCodeEditor, _instaService: IInstantiationService, _keybindingService: IKeybindingService);
    show(session: IInlineChatSession2): void;
    hide(): void;
}
