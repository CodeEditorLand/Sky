import { Disposable, IDisposable } from '../../../../../base/common/lifecycle.js';
import { ActionWidgetDropdownActionViewItem } from '../../../../../platform/actions/browser/actionWidgetDropdownActionViewItem.js';
import { IActionViewItemService } from '../../../../../platform/actions/browser/actionViewItemService.js';
import { Action2, MenuItemAction } from '../../../../../platform/actions/common/actions.js';
import { IActionWidgetService } from '../../../../../platform/actionWidget/browser/actionWidget.js';
import { IContextKeyService } from '../../../../../platform/contextkey/common/contextkey.js';
import { IInstantiationService } from '../../../../../platform/instantiation/common/instantiation.js';
import { IKeybindingService } from '../../../../../platform/keybinding/common/keybinding.js';
import { IOpenerService } from '../../../../../platform/opener/common/opener.js';
import { IWorkbenchContribution } from '../../../../common/contributions.js';
import { IChatSessionsService } from '../../common/chatSessionsService.js';
export declare const enum ActionLocation {
    ChatWidget = "chatWidget",
    Editor = "editor"
}
export declare class ContinueChatInSessionAction extends Action2 {
    static readonly ID = "workbench.action.chat.continueChatInSession";
    constructor();
    run(): Promise<void>;
}
export declare class ChatContinueInSessionActionItem extends ActionWidgetDropdownActionViewItem {
    private readonly location;
    private readonly contextKeyService;
    constructor(action: MenuItemAction, location: ActionLocation, actionWidgetService: IActionWidgetService, contextKeyService: IContextKeyService, keybindingService: IKeybindingService, chatSessionsService: IChatSessionsService, instantiationService: IInstantiationService, openerService: IOpenerService);
    protected static getActionBarActions(openerService: IOpenerService): {
        id: string;
        label: string;
        tooltip: string;
        class: undefined;
        enabled: boolean;
        run: () => Promise<void>;
    }[];
    private static actionProvider;
    private static toAction;
    private static toSetupAction;
    protected renderLabel(element: HTMLElement): IDisposable | null;
}
export declare class ContinueChatInSessionActionRendering extends Disposable implements IWorkbenchContribution {
    static readonly ID = "chat.continueChatInSessionActionRendering";
    constructor(actionViewItemService: IActionViewItemService, instantiationService: IInstantiationService);
}
