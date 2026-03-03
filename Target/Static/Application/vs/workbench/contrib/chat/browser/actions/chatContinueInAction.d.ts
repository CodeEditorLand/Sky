import { Disposable, IDisposable } from '../../../../../base/common/lifecycle.js';
import { ServicesAccessor } from '../../../../../editor/browser/editorExtensions.js';
import { ActionWidgetDropdownActionViewItem } from '../../../../../platform/actions/browser/actionWidgetDropdownActionViewItem.js';
import { IActionViewItemService } from '../../../../../platform/actions/browser/actionViewItemService.js';
import { Action2, MenuItemAction } from '../../../../../platform/actions/common/actions.js';
import { IActionWidgetService } from '../../../../../platform/actionWidget/browser/actionWidget.js';
import { IContextKeyService } from '../../../../../platform/contextkey/common/contextkey.js';
import { IInstantiationService } from '../../../../../platform/instantiation/common/instantiation.js';
import { IKeybindingService } from '../../../../../platform/keybinding/common/keybinding.js';
import { ITelemetryService } from '../../../../../platform/telemetry/common/telemetry.js';
import { IOpenerService } from '../../../../../platform/opener/common/opener.js';
import { IWorkbenchContribution } from '../../../../common/contributions.js';
import { IChatSessionsExtensionPoint, IChatSessionsService } from '../../common/chatSessionsService.js';
import { IChatWidget } from '../chat.js';
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
    constructor(action: MenuItemAction, location: ActionLocation, actionWidgetService: IActionWidgetService, contextKeyService: IContextKeyService, keybindingService: IKeybindingService, chatSessionsService: IChatSessionsService, instantiationService: IInstantiationService, openerService: IOpenerService, telemetryService: ITelemetryService);
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
export declare class CreateRemoteAgentJobAction {
    constructor();
    private openUntitledEditor;
    /**
     * Extracts the GitHub "owner/repo" NWO from the source session by checking
     * multiple data sources: chat model repoData, session metadata, and session options.
     */
    private extractRepoNwoFromSession;
    run(accessor: ServicesAccessor, continuationTarget: IChatSessionsExtensionPoint, _widget?: IChatWidget): Promise<void>;
}
export declare class ContinueChatInSessionActionRendering extends Disposable implements IWorkbenchContribution {
    static readonly ID = "chat.continueChatInSessionActionRendering";
    constructor(actionViewItemService: IActionViewItemService, instantiationService: IInstantiationService);
}
