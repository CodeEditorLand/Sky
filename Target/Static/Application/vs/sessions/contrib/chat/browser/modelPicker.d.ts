import { Event } from '../../../../base/common/event.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { IActionWidgetService } from '../../../../platform/actionWidget/browser/actionWidget.js';
import { IChatSessionProviderOptionItem } from '../../../../workbench/contrib/chat/common/chatSessionsService.js';
import { RemoteNewSession } from './newSession.js';
interface IModelItem {
    readonly id: string;
    readonly name: string;
    readonly description?: string;
}
/**
 * A self-contained widget for selecting a model in cloud sessions.
 * Reads the model option group from the {@link RemoteNewSession} and
 * renders an action list dropdown with the available models.
 */
export declare class CloudModelPicker extends Disposable {
    private readonly actionWidgetService;
    private readonly _onDidChange;
    readonly onDidChange: Event<IChatSessionProviderOptionItem>;
    private _triggerElement;
    private _slotElement;
    private readonly _renderDisposables;
    private readonly _sessionDisposables;
    private _session;
    private _selectedModel;
    private _models;
    get selectedModel(): IModelItem | undefined;
    constructor(actionWidgetService: IActionWidgetService);
    /**
     * Sets the remote session and loads the available models from it.
     */
    setSession(session: RemoteNewSession): void;
    /**
     * Renders the model picker trigger button into the given container.
     */
    render(container: HTMLElement): HTMLElement;
    /**
     * Shows or hides the picker.
     */
    setVisible(visible: boolean): void;
    private _loadModels;
    private _showPicker;
    private _buildItems;
    private _selectModel;
    private _updateTriggerLabel;
}
export {};
