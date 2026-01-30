import './media/chatSessionPickerActionItem.css';
import { IAction } from '../../../../../base/common/actions.js';
import { IActionWidgetService } from '../../../../../platform/actionWidget/browser/actionWidget.js';
import { IActionWidgetDropdownAction } from '../../../../../platform/actionWidget/browser/actionWidgetDropdown.js';
import { IContextKeyService } from '../../../../../platform/contextkey/common/contextkey.js';
import { IKeybindingService } from '../../../../../platform/keybinding/common/keybinding.js';
import { IChatSessionProviderOptionGroup, IChatSessionProviderOptionItem } from '../../common/chatSessionsService.js';
import { IDisposable } from '../../../../../base/common/lifecycle.js';
import { IQuickInputService } from '../../../../../platform/quickinput/common/quickInput.js';
import { ChatSessionPickerActionItem, IChatSessionPickerDelegate } from './chatSessionPickerActionItem.js';
import { ILogService } from '../../../../../platform/log/common/log.js';
/**
 * Action view item for searchable option groups with QuickPick.
 * Used when an option group has `searchable: true` (e.g., repository selection).
 * Shows an inline dropdown with items + "See more..." option that opens a searchable QuickPick.
 */
export declare class SearchableOptionPickerActionItem extends ChatSessionPickerActionItem {
    private readonly quickInputService;
    private readonly logService;
    private static readonly SEE_MORE_ID;
    constructor(action: IAction, initialState: {
        group: IChatSessionProviderOptionGroup;
        item: IChatSessionProviderOptionItem | undefined;
    }, delegate: IChatSessionPickerDelegate, actionWidgetService: IActionWidgetService, contextKeyService: IContextKeyService, keybindingService: IKeybindingService, quickInputService: IQuickInputService, logService: ILogService);
    protected getDropdownActions(): IActionWidgetDropdownAction[];
    protected renderLabel(element: HTMLElement): IDisposable | null;
    protected getContainerClass(): string;
    /**
     * Shows the full searchable QuickPick with all items (initial + search results)
     * Called when user clicks "See more..." from the dropdown
     */
    private showSearchableQuickPick;
    private createQuickPickItem;
    /**
     * Opens the picker programmatically.
     */
    show(): void;
}
