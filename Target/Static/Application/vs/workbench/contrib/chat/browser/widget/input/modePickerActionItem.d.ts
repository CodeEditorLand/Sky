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
import { IChatAgentService } from '../../../common/participants/chatAgents.js';
import { IChatMode, IChatModeService } from '../../../common/chatModes.js';
import { ChatInputPickerActionViewItem, IChatInputPickerOptions } from './chatInputPickerActionItem.js';
export interface IModePickerDelegate {
    readonly currentMode: IObservable<IChatMode>;
    readonly sessionResource: () => URI | undefined;
}
export declare class ModePickerActionItem extends ChatInputPickerActionViewItem {
    private readonly delegate;
    private readonly contextKeyService;
    private readonly menuService;
    private readonly _productService;
    constructor(action: MenuItemAction, delegate: IModePickerDelegate, pickerOptions: IChatInputPickerOptions, actionWidgetService: IActionWidgetService, chatAgentService: IChatAgentService, keybindingService: IKeybindingService, configurationService: IConfigurationService, contextKeyService: IContextKeyService, chatModeService: IChatModeService, menuService: IMenuService, commandService: ICommandService, _productService: IProductService);
    private getModePickerActionBarActions;
    protected renderLabel(element: HTMLElement): IDisposable | null;
}
