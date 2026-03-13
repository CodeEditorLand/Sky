import { IStringDictionary } from '../../../../../../base/common/collections.js';
import { Event } from '../../../../../../base/common/event.js';
import { Disposable } from '../../../../../../base/common/lifecycle.js';
import { IObservable } from '../../../../../../base/common/observable.js';
import { IActionListItem } from '../../../../../../platform/actionWidget/browser/actionList.js';
import { IHoverPositionOptions } from '../../../../../../base/browser/ui/hover/hover.js';
import { IActionWidgetService } from '../../../../../../platform/actionWidget/browser/actionWidget.js';
import { IActionWidgetDropdownAction } from '../../../../../../platform/actionWidget/browser/actionWidgetDropdown.js';
import { ICommandService } from '../../../../../../platform/commands/common/commands.js';
import { IProductService } from '../../../../../../platform/product/common/productService.js';
import { ITelemetryService } from '../../../../../../platform/telemetry/common/telemetry.js';
import { IModelControlEntry, ILanguageModelChatMetadataAndIdentifier, ILanguageModelsService } from '../../../common/languageModels.js';
import { IChatEntitlementService } from '../../../../../services/chat/common/chatEntitlementService.js';
import { IModelPickerDelegate } from './modelPickerActionItem.js';
import { IUpdateService, StateType } from '../../../../../../platform/update/common/update.js';
/**
 * Builds the grouped items for the model picker dropdown.
 *
 * Layout:
 * 1. Auto (always first)
 * 2. Promoted section (selected + recently used + featured models from control manifest)
 *    - Available models sorted alphabetically, followed by unavailable models
 *    - Unavailable models show upgrade/update/admin status
 * 3. Other Models (collapsible toggle, available first, then sorted by vendor then name)
 * 4. Optional "Manage Models..." action shown in Other Models after a separator
 */
export declare function buildModelPickerItems(models: ILanguageModelChatMetadataAndIdentifier[], selectedModelId: string | undefined, recentModelIds: string[], controlModels: IStringDictionary<IModelControlEntry>, currentVSCodeVersion: string, updateStateType: StateType, onSelect: (model: ILanguageModelChatMetadataAndIdentifier) => void, manageSettingsUrl: string | undefined, useGroupedModelPicker: boolean, manageModelsAction: IActionWidgetDropdownAction | undefined, chatEntitlementService: IChatEntitlementService, showUnavailableFeatured: boolean, showFeatured: boolean, hoverPosition?: IHoverPositionOptions): IActionListItem<IActionWidgetDropdownAction>[];
export declare function getModelPickerAccessibilityProvider(): {
    readonly isChecked: (element: IActionListItem<IActionWidgetDropdownAction>) => boolean | undefined;
    readonly getRole: (element: IActionListItem<IActionWidgetDropdownAction>) => "separator" | "menuitemradio";
    readonly getWidgetRole: () => string;
};
export type ModelPickerBadge = 'info' | 'warning';
/**
 * A model selection dropdown widget.
 *
 * Renders a button showing the currently selected model name.
 * On click, opens a grouped picker popup with:
 * Auto → Promoted (recently used + curated) → Other Models (collapsed with search).
 *
 * The widget owns its state - set models, selection, and curated IDs via setters.
 * Listen for selection changes via `onDidChangeSelection`.
 */
export declare class ModelPickerWidget extends Disposable {
    private readonly _delegate;
    private readonly _hoverPosition;
    private readonly _actionWidgetService;
    private readonly _commandService;
    private readonly _telemetryService;
    private readonly _languageModelsService;
    private readonly _productService;
    private readonly _entitlementService;
    private readonly _updateService;
    private readonly _onDidChangeSelection;
    readonly onDidChangeSelection: Event<ILanguageModelChatMetadataAndIdentifier>;
    private _selectedModel;
    private _badge;
    private _hideChevrons;
    private _domNode;
    private _badgeIcon;
    get selectedModel(): ILanguageModelChatMetadataAndIdentifier | undefined;
    get domNode(): HTMLElement | undefined;
    constructor(_delegate: IModelPickerDelegate, _hoverPosition: IHoverPositionOptions | undefined, _actionWidgetService: IActionWidgetService, _commandService: ICommandService, _telemetryService: ITelemetryService, _languageModelsService: ILanguageModelsService, _productService: IProductService, _entitlementService: IChatEntitlementService, _updateService: IUpdateService);
    setHideChevrons(hideChevrons: IObservable<boolean>): void;
    setSelectedModel(model: ILanguageModelChatMetadataAndIdentifier | undefined): void;
    setBadge(badge: ModelPickerBadge | undefined): void;
    render(container: HTMLElement): void;
    show(anchor?: HTMLElement): void;
    private _updateBadge;
    private _renderLabel;
}
