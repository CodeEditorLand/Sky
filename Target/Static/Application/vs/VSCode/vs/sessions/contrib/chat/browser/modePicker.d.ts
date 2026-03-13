import { Event } from '../../../../base/common/event.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { IActionWidgetService } from '../../../../platform/actionWidget/browser/actionWidget.js';
import { IChatMode, IChatModeService } from '../../../../workbench/contrib/chat/common/chatModes.js';
import { IGitRepository } from '../../../../workbench/contrib/git/common/gitService.js';
import { IChatSessionsService } from '../../../../workbench/contrib/chat/common/chatSessionsService.js';
import { ICommandService } from '../../../../platform/commands/common/commands.js';
/**
 * A self-contained widget for selecting a chat mode (Agent, custom agents)
 * for local/Background sessions. Shows only modes whose target matches
 * the Background session type's customAgentTarget.
 */
export declare class ModePicker extends Disposable {
    private readonly actionWidgetService;
    private readonly chatModeService;
    private readonly chatSessionsService;
    private readonly commandService;
    private readonly _onDidChange;
    readonly onDidChange: Event<IChatMode>;
    private _triggerElement;
    private _slotElement;
    private readonly _renderDisposables;
    private _selectedMode;
    get selectedMode(): IChatMode;
    constructor(actionWidgetService: IActionWidgetService, chatModeService: IChatModeService, chatSessionsService: IChatSessionsService, commandService: ICommandService);
    /**
     * Sets the git repository. When the repository changes, resets the selected mode
     * back to the default Agent mode.
     */
    setRepository(repository: IGitRepository | undefined): void;
    /**
     * Renders the mode picker trigger button into the given container.
     */
    render(container: HTMLElement): HTMLElement;
    /**
     * Shows or hides the picker.
     */
    setVisible(visible: boolean): void;
    private _getAvailableModes;
    private _showPicker;
    private _buildItems;
    private _selectMode;
    private _updateTriggerLabel;
}
