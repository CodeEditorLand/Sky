import { IActionWidgetService } from './actionWidget.js';
import { IAction } from '../../../base/common/actions.js';
import { BaseDropdown, IActionProvider, IBaseDropdownOptions } from '../../../base/browser/ui/dropdown/dropdown.js';
import { IActionListItemHover } from './actionList.js';
import { ThemeIcon } from '../../../base/common/themables.js';
import { IKeybindingService } from '../../keybinding/common/keybinding.js';
import { ITelemetryService } from '../../telemetry/common/telemetry.js';
export interface IActionWidgetDropdownAction extends IAction {
    category?: {
        label: string;
        order: number;
        showHeader?: boolean;
    };
    icon?: ThemeIcon;
    description?: string;
    /**
     * Optional flyout hover configuration shown when focusing/hovering over the action.
     */
    hover?: IActionListItemHover;
    /**
     * Optional toolbar actions shown when the item is focused or hovered.
     */
    toolbarActions?: IAction[];
}
export interface IActionWidgetDropdownActionProvider {
    getActions(): IActionWidgetDropdownAction[];
}
export interface IActionWidgetDropdownOptions extends IBaseDropdownOptions {
    readonly actions?: IActionWidgetDropdownAction[];
    readonly actionProvider?: IActionWidgetDropdownActionProvider;
    readonly actionBarActions?: IAction[];
    readonly actionBarActionProvider?: IActionProvider;
    readonly showItemKeybindings?: boolean;
    getAnchor?: () => HTMLElement;
    /**
     * Telemetry reporter configuration used when the dropdown closes. The `id` field is required
     * and is used as the telemetry identifier; `name` is optional additional context. If not
     * provided, no telemetry will be sent.
     */
    readonly reporter?: {
        id: string;
        name?: string;
        includeOptions?: boolean;
    };
}
/**
 * Action widget dropdown is a dropdown that uses the action widget under the hood to simulate a native dropdown menu
 * The benefits of this include non native features such as headers, descriptions, icons, and button bar
 */
export declare class ActionWidgetDropdown extends BaseDropdown {
    private readonly _options;
    private readonly actionWidgetService;
    private readonly keybindingService;
    private readonly telemetryService;
    private _enabled;
    constructor(container: HTMLElement, _options: IActionWidgetDropdownOptions, actionWidgetService: IActionWidgetService, keybindingService: IKeybindingService, telemetryService: ITelemetryService);
    show(): void;
    setEnabled(enabled: boolean): void;
    private _emitCloseEvent;
}
