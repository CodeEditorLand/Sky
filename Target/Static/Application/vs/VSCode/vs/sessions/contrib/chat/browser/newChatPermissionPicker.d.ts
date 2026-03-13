import { Event } from '../../../../base/common/event.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { IActionWidgetService } from '../../../../platform/actionWidget/browser/actionWidget.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IDialogService } from '../../../../platform/dialogs/common/dialogs.js';
import { ChatPermissionLevel } from '../../../../workbench/contrib/chat/common/constants.js';
/**
 * A permission picker for the new-session welcome view.
 * Shows Default Approvals, Bypass Approvals, and Autopilot options.
 */
export declare class NewChatPermissionPicker extends Disposable {
    private readonly actionWidgetService;
    private readonly configurationService;
    private readonly dialogService;
    private readonly _onDidChangeLevel;
    readonly onDidChangeLevel: Event<ChatPermissionLevel>;
    private _currentLevel;
    private _triggerElement;
    private _container;
    private readonly _renderDisposables;
    get permissionLevel(): ChatPermissionLevel;
    constructor(actionWidgetService: IActionWidgetService, configurationService: IConfigurationService, dialogService: IDialogService);
    render(container: HTMLElement): HTMLElement;
    setVisible(visible: boolean): void;
    showPicker(): void;
    private _selectLevel;
    private _updateTriggerLabel;
}
