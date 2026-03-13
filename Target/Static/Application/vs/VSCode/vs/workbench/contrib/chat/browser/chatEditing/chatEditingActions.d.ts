import { URI } from '../../../../../base/common/uri.js';
import { ServicesAccessor } from '../../../../../editor/browser/editorExtensions.js';
import { Action2, IAction2Options } from '../../../../../platform/actions/common/actions.js';
import { IChatEditingSession } from '../../common/editing/chatEditingService.js';
import { IChatWidget } from '../chat.js';
import { IAgentSession } from '../agentSessions/agentSessionsModel.js';
export declare abstract class EditingSessionAction extends Action2 {
    constructor(opts: Readonly<IAction2Options>);
    run(accessor: ServicesAccessor, ...args: unknown[]): any;
    abstract runEditingSessionAction(accessor: ServicesAccessor, editingSession: IChatEditingSession, chatWidget: IChatWidget, ...args: unknown[]): any;
}
export type EditingSessionActionContext = {
    editingSession?: IChatEditingSession;
    chatWidget: IChatWidget;
};
/**
 * Resolve view title toolbar context. If none, return context from the lastFocusedWidget.
 */
export declare function getEditingSessionContext(accessor: ServicesAccessor, args: any[]): EditingSessionActionContext | undefined;
export declare class ChatEditingAcceptAllAction extends EditingSessionAction {
    constructor();
    runEditingSessionAction(accessor: ServicesAccessor, editingSession: IChatEditingSession, chatWidget: IChatWidget, ...args: unknown[]): Promise<void>;
}
export declare class ChatEditingDiscardAllAction extends EditingSessionAction {
    constructor();
    runEditingSessionAction(accessor: ServicesAccessor, editingSession: IChatEditingSession, chatWidget: IChatWidget, ...args: unknown[]): Promise<void>;
}
export declare class ToggleExplanationWidgetAction extends EditingSessionAction {
    static readonly ID = "chatEditing.toggleExplanationWidget";
    constructor();
    runEditingSessionAction(accessor: ServicesAccessor, editingSession: IChatEditingSession, chatWidget: IChatWidget, ...args: unknown[]): Promise<void>;
}
export declare function discardAllEditsWithConfirmation(accessor: ServicesAccessor, currentEditingSession: IChatEditingSession): Promise<boolean>;
export declare class ChatEditingShowChangesAction extends EditingSessionAction {
    static readonly ID = "chatEditing.viewChanges";
    static readonly LABEL: string;
    constructor();
    runEditingSessionAction(accessor: ServicesAccessor, editingSession: IChatEditingSession, chatWidget: IChatWidget, ...args: unknown[]): Promise<void>;
}
export declare class ViewAllSessionChangesAction extends Action2 {
    static readonly ID = "chatEditing.viewAllSessionChanges";
    constructor();
    run(accessor: ServicesAccessor, sessionOrSessionResource?: URI | IAgentSession): Promise<void>;
}
export interface ChatEditingActionContext {
    readonly sessionResource: URI;
    readonly requestId: string;
    readonly uri: URI;
    readonly stopId: string | undefined;
}
export declare class ViewPreviousEditsAction extends EditingSessionAction {
    static readonly Id = "chatEditing.viewPreviousEdits";
    static readonly Label: string;
    constructor();
    runEditingSessionAction(accessor: ServicesAccessor, editingSession: IChatEditingSession, chatWidget: IChatWidget, ...args: unknown[]): Promise<void>;
}
