import { IManagedHoverContent } from '../../../../../../base/browser/ui/hover/hover.js';
import { IAction } from '../../../../../../base/common/actions.js';
import { IDisposable } from '../../../../../../base/common/lifecycle.js';
import { IObservable } from '../../../../../../base/common/observable.js';
import { IActionWidgetService } from '../../../../../../platform/actionWidget/browser/actionWidget.js';
import { IActionWidgetDropdownOptions } from '../../../../../../platform/actionWidget/browser/actionWidgetDropdown.js';
import { ICommandService } from '../../../../../../platform/commands/common/commands.js';
import { IContextKeyService } from '../../../../../../platform/contextkey/common/contextkey.js';
import { IKeybindingService } from '../../../../../../platform/keybinding/common/keybinding.js';
import { IProductService } from '../../../../../../platform/product/common/productService.js';
import { ITelemetryService } from '../../../../../../platform/telemetry/common/telemetry.js';
import { IChatEntitlementService } from '../../../../../services/chat/common/chatEntitlementService.js';
import { ILanguageModelChatMetadataAndIdentifier } from '../../../common/languageModels.js';
import { ChatInputPickerActionViewItem, IChatInputPickerOptions } from './chatInputPickerActionItem.js';
export interface IModelPickerDelegate {
    readonly currentModel: IObservable<ILanguageModelChatMetadataAndIdentifier | undefined>;
    setModel(model: ILanguageModelChatMetadataAndIdentifier): void;
    getModels(): ILanguageModelChatMetadataAndIdentifier[];
}
/**
 * Action view item for selecting a language model in the chat interface.
 */
export declare class ModelPickerActionItem extends ChatInputPickerActionViewItem {
    protected currentModel: ILanguageModelChatMetadataAndIdentifier | undefined;
    constructor(action: IAction, widgetOptions: Omit<IActionWidgetDropdownOptions, 'label' | 'labelRenderer'> | undefined, delegate: IModelPickerDelegate, pickerOptions: IChatInputPickerOptions, actionWidgetService: IActionWidgetService, contextKeyService: IContextKeyService, commandService: ICommandService, chatEntitlementService: IChatEntitlementService, keybindingService: IKeybindingService, telemetryService: ITelemetryService, productService: IProductService);
    protected getHoverContents(): IManagedHoverContent | undefined;
    protected setAriaLabelAttributes(element: HTMLElement): void;
    protected renderLabel(element: HTMLElement): IDisposable | null;
}
