import './media/chatSessionPickerActionItem.css';
import { IAction } from '../../../../../base/common/actions.js';
import { Event } from '../../../../../base/common/event.js';
import { IActionWidgetService } from '../../../../../platform/actionWidget/browser/actionWidget.js';
import { IActionWidgetDropdownAction } from '../../../../../platform/actionWidget/browser/actionWidgetDropdown.js';
import { IContextKeyService } from '../../../../../platform/contextkey/common/contextkey.js';
import { IKeybindingService } from '../../../../../platform/keybinding/common/keybinding.js';
import { ActionWidgetDropdownActionViewItem } from '../../../../../platform/actions/browser/actionWidgetDropdownActionViewItem.js';
import { IChatSessionProviderOptionGroup, IChatSessionProviderOptionItem } from '../../common/chatSessionsService.js';
import { ICommandService } from '../../../../../platform/commands/common/commands.js';
import { ITelemetryService } from '../../../../../platform/telemetry/common/telemetry.js';
import { IDisposable } from '../../../../../base/common/lifecycle.js';
import { URI } from '../../../../../base/common/uri.js';
export interface IChatSessionPickerDelegate {
    readonly onDidChangeOption: Event<IChatSessionProviderOptionItem>;
    getCurrentOption(): IChatSessionProviderOptionItem | undefined;
    setOption(option: IChatSessionProviderOptionItem): void;
    getOptionGroup(): IChatSessionProviderOptionGroup | undefined;
    getSessionResource: () => URI | undefined;
}
/**
 * Action view item for making an option selection for a contributed chat session
 * These options are provided by the relevant ChatSession Provider
 */
export declare class ChatSessionPickerActionItem extends ActionWidgetDropdownActionViewItem {
    protected readonly delegate: IChatSessionPickerDelegate;
    protected readonly commandService: ICommandService;
    protected currentOption: IChatSessionProviderOptionItem | undefined;
    protected container: HTMLElement | undefined;
    constructor(action: IAction, initialState: {
        group: IChatSessionProviderOptionGroup;
        item: IChatSessionProviderOptionItem | undefined;
    }, delegate: IChatSessionPickerDelegate, actionWidgetService: IActionWidgetService, contextKeyService: IContextKeyService, keybindingService: IKeybindingService, commandService: ICommandService, telemetryService: ITelemetryService);
    /**
     * Returns the actions to show in the dropdown. Can be overridden by subclasses.
     */
    protected getDropdownActions(): IActionWidgetDropdownAction[];
    /**
     * Creates a disabled action for a locked option.
     */
    protected createLockedOptionAction(option: IChatSessionProviderOptionItem): IActionWidgetDropdownAction;
    protected renderLabel(element: HTMLElement): IDisposable | null;
    render(container: HTMLElement): void;
    /**
     * Returns the CSS class to add to the container. Can be overridden by subclasses.
     */
    protected getContainerClass(): string;
    protected updateEnabled(): void;
}
