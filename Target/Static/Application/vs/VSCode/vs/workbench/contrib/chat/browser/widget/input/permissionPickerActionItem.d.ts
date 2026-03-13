import { IDisposable } from '../../../../../../base/common/lifecycle.js';
import { IObservable } from '../../../../../../base/common/observable.js';
import { IActionWidgetService } from '../../../../../../platform/actionWidget/browser/actionWidget.js';
import { IContextKeyService } from '../../../../../../platform/contextkey/common/contextkey.js';
import { IKeybindingService } from '../../../../../../platform/keybinding/common/keybinding.js';
import { ITelemetryService } from '../../../../../../platform/telemetry/common/telemetry.js';
import { ChatPermissionLevel } from '../../../common/constants.js';
import { MenuItemAction } from '../../../../../../platform/actions/common/actions.js';
import { IConfigurationService } from '../../../../../../platform/configuration/common/configuration.js';
import { IDialogService } from '../../../../../../platform/dialogs/common/dialogs.js';
import { ChatInputPickerActionViewItem, IChatInputPickerOptions } from './chatInputPickerActionItem.js';
export interface IPermissionPickerDelegate {
    readonly currentPermissionLevel: IObservable<ChatPermissionLevel>;
    readonly setPermissionLevel: (level: ChatPermissionLevel) => void;
}
export declare class PermissionPickerActionItem extends ChatInputPickerActionViewItem {
    private readonly delegate;
    private readonly dialogService;
    constructor(action: MenuItemAction, delegate: IPermissionPickerDelegate, pickerOptions: IChatInputPickerOptions, actionWidgetService: IActionWidgetService, keybindingService: IKeybindingService, contextKeyService: IContextKeyService, telemetryService: ITelemetryService, configurationService: IConfigurationService, dialogService: IDialogService);
    protected renderLabel(element: HTMLElement): IDisposable | null;
    refresh(): void;
}
