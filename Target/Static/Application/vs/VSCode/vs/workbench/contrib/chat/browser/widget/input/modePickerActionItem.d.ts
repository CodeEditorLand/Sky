import { IDisposable } from '../../../../../../base/common/lifecycle.js';
import { IObservable } from '../../../../../../base/common/observable.js';
import { URI } from '../../../../../../base/common/uri.js';
import { IMenuService, MenuItemAction } from '../../../../../../platform/actions/common/actions.js';
import { IActionWidgetService } from '../../../../../../platform/actionWidget/browser/actionWidget.js';
import { ICommandService } from '../../../../../../platform/commands/common/commands.js';
import { IConfigurationService } from '../../../../../../platform/configuration/common/configuration.js';
import { IContextKeyService } from '../../../../../../platform/contextkey/common/contextkey.js';
import { IKeybindingService } from '../../../../../../platform/keybinding/common/keybinding.js';
import { IProductService } from '../../../../../../platform/product/common/productService.js';
import { ITelemetryService } from '../../../../../../platform/telemetry/common/telemetry.js';
import { IChatAgentService } from '../../../common/participants/chatAgents.js';
import { IChatMode, IChatModeService } from '../../../common/chatModes.js';
import { Target } from '../../../common/promptSyntax/promptTypes.js';
import { ChatInputPickerActionViewItem, IChatInputPickerOptions } from './chatInputPickerActionItem.js';
import { IOpenerService } from '../../../../../../platform/opener/common/opener.js';
import { IWorkbenchAssignmentService } from '../../../../../services/assignment/common/assignmentService.js';
export interface IModePickerDelegate {
    readonly currentMode: IObservable<IChatMode>;
    readonly sessionResource: () => URI | undefined;
    /**
     * When set, the mode picker will show custom agents whose target matches this value.
     * Custom agents without a target are always shown in all session types. If no agents match the target, shows a default "Agent" option.
     */
    readonly customAgentTarget?: () => Target;
}
export declare class ModePickerActionItem extends ChatInputPickerActionViewItem {
    private readonly delegate;
    private readonly contextKeyService;
    private readonly menuService;
    private readonly _productService;
    constructor(action: MenuItemAction, delegate: IModePickerDelegate, pickerOptions: IChatInputPickerOptions, actionWidgetService: IActionWidgetService, chatAgentService: IChatAgentService, keybindingService: IKeybindingService, configurationService: IConfigurationService, contextKeyService: IContextKeyService, chatModeService: IChatModeService, menuService: IMenuService, commandService: ICommandService, _productService: IProductService, telemetryService: ITelemetryService, openerService: IOpenerService, assignmentService: IWorkbenchAssignmentService);
    private getModePickerActionBarActions;
    render(container: HTMLElement): void;
    protected renderLabel(element: HTMLElement): IDisposable | null;
}
