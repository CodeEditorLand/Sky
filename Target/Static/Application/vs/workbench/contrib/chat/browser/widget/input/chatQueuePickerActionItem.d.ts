import { BaseActionViewItem, IActionViewItemOptions } from '../../../../../../base/browser/ui/actionbar/actionViewItems.js';
import { IAction } from '../../../../../../base/common/actions.js';
import { Disposable } from '../../../../../../base/common/lifecycle.js';
import { IActionViewItemService } from '../../../../../../platform/actions/browser/actionViewItemService.js';
import { IActionWidgetService } from '../../../../../../platform/actionWidget/browser/actionWidget.js';
import { ICommandService } from '../../../../../../platform/commands/common/commands.js';
import { IConfigurationService } from '../../../../../../platform/configuration/common/configuration.js';
import { IContextKeyService } from '../../../../../../platform/contextkey/common/contextkey.js';
import { IKeybindingService } from '../../../../../../platform/keybinding/common/keybinding.js';
import { ITelemetryService } from '../../../../../../platform/telemetry/common/telemetry.js';
import { IWorkbenchContribution } from '../../../../../common/contributions.js';
/**
 * Split-button action view item for the queue/steer picker in the chat execute toolbar.
 * The primary button runs the current default action (queue or steer).
 * The dropdown arrow opens a custom action widget with hover descriptions.
 *
 * Follows the same split-button pattern as {@link DropdownWithDefaultActionViewItem},
 * but uses {@link ActionWidgetDropdownActionViewItem} for the dropdown to show
 * an action widget with hover descriptions instead of a standard context menu.
 */
export declare class ChatQueuePickerActionItem extends BaseActionViewItem {
    private readonly commandService;
    private readonly configurationService;
    private readonly _primaryActionAction;
    private readonly _primaryAction;
    private readonly _dropdown;
    constructor(action: IAction, _options: IActionViewItemOptions, commandService: ICommandService, configurationService: IConfigurationService, actionWidgetService: IActionWidgetService, keybindingService: IKeybindingService, contextKeyService: IContextKeyService, telemetryService: ITelemetryService);
    private _isSteerDefault;
    private _updatePrimaryAction;
    private _runDefaultAction;
    render(container: HTMLElement): void;
    focus(fromRight?: boolean): void;
    blur(): void;
    setFocusable(focusable: boolean): void;
    private _getDropdownActions;
}
/**
 * Workbench contribution that registers a custom action view item for the
 * queue/steer picker in the execute toolbar. This replaces the default split
 * button with a custom dropdown similar to the model switcher.
 */
export declare class ChatQueuePickerRendering extends Disposable implements IWorkbenchContribution {
    static readonly ID = "chat.queuePickerRendering";
    constructor(actionViewItemService: IActionViewItemService);
}
