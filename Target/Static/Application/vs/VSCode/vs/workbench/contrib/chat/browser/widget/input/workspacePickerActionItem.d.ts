import { IDisposable } from '../../../../../../base/common/lifecycle.js';
import { MenuItemAction } from '../../../../../../platform/actions/common/actions.js';
import { IActionWidgetService } from '../../../../../../platform/actionWidget/browser/actionWidget.js';
import { ICommandService } from '../../../../../../platform/commands/common/commands.js';
import { IContextKeyService } from '../../../../../../platform/contextkey/common/contextkey.js';
import { IKeybindingService } from '../../../../../../platform/keybinding/common/keybinding.js';
import { ITelemetryService } from '../../../../../../platform/telemetry/common/telemetry.js';
import { ChatInputPickerActionViewItem, IChatInputPickerOptions } from './chatInputPickerActionItem.js';
import { IWorkspacePickerDelegate } from '../../chat.js';
/**
 * Action view item for selecting a target workspace in the chat interface.
 * This picker allows selecting a recent workspace to run the chat request in,
 * which is useful for empty window contexts.
 */
export declare class WorkspacePickerActionItem extends ChatInputPickerActionViewItem {
    private readonly delegate;
    private readonly commandService;
    constructor(action: MenuItemAction, delegate: IWorkspacePickerDelegate, pickerOptions: IChatInputPickerOptions, actionWidgetService: IActionWidgetService, keybindingService: IKeybindingService, contextKeyService: IContextKeyService, commandService: ICommandService, telemetryService: ITelemetryService);
    protected renderLabel(element: HTMLElement): IDisposable | null;
}
