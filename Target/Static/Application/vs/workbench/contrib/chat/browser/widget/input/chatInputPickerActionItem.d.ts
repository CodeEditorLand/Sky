import { IAction } from '../../../../../../base/common/actions.js';
import { ActionWidgetDropdownActionViewItem } from '../../../../../../platform/actions/browser/actionWidgetDropdownActionViewItem.js';
import { IActionWidgetService } from '../../../../../../platform/actionWidget/browser/actionWidget.js';
import { IActionWidgetDropdownOptions } from '../../../../../../platform/actionWidget/browser/actionWidgetDropdown.js';
import { IContextKeyService } from '../../../../../../platform/contextkey/common/contextkey.js';
import { IKeybindingService } from '../../../../../../platform/keybinding/common/keybinding.js';
export interface IChatInputPickerOptions {
    /**
     * Provides a fallback anchor element when the picker's own element
     * is not available in the DOM (e.g., when inside an overflow menu).
     */
    readonly getOverflowAnchor?: () => HTMLElement | undefined;
}
/**
 * Base class for chat input picker action items (model picker, mode picker, session target picker).
 * Provides common anchor resolution logic for dropdown positioning.
 */
export declare abstract class ChatInputPickerActionViewItem extends ActionWidgetDropdownActionViewItem {
    private readonly pickerOptions;
    constructor(action: IAction, actionWidgetOptions: Omit<IActionWidgetDropdownOptions, 'label' | 'labelRenderer'>, pickerOptions: IChatInputPickerOptions, actionWidgetService: IActionWidgetService, keybindingService: IKeybindingService, contextKeyService: IContextKeyService);
    /**
     * Returns the anchor element for the dropdown.
     * Falls back to the overflow anchor if this element is not in the DOM.
     */
    protected getAnchorElement(): HTMLElement;
    render(container: HTMLElement): void;
}
