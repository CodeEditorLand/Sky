import { IAgentSession, IAgentSessionSection, IMarshalledAgentSessionContext } from './agentSessionsModel.js';
import { Action2 } from '../../../../../platform/actions/common/actions.js';
import { ServicesAccessor } from '../../../../../editor/browser/editorExtensions.js';
import { AgentSessionsViewerOrientation, IAgentSessionsControl } from './agentSessions.js';
import { IChatEditorOptions } from '../widgetHosts/editor/chatEditor.js';
import { PreferredGroup } from '../../../../services/editor/common/editorService.js';
export declare class ShowAllAgentSessionsAction extends Action2 {
    constructor();
    run(accessor: ServicesAccessor): Promise<void>;
}
export declare class ShowRecentAgentSessionsAction extends Action2 {
    constructor();
    run(accessor: ServicesAccessor): Promise<void>;
}
export declare class HideAgentSessionsAction extends Action2 {
    constructor();
    run(accessor: ServicesAccessor): Promise<void>;
}
export declare class SetAgentSessionsOrientationStackedAction extends Action2 {
    constructor();
    run(accessor: ServicesAccessor): Promise<void>;
}
export declare class SetAgentSessionsOrientationSideBySideAction extends Action2 {
    constructor();
    run(accessor: ServicesAccessor): Promise<void>;
}
export declare class PickAgentSessionAction extends Action2 {
    constructor();
    run(accessor: ServicesAccessor): Promise<void>;
}
export declare class ArchiveAllAgentSessionsAction extends Action2 {
    constructor();
    run(accessor: ServicesAccessor): Promise<void>;
}
export declare class ArchiveAgentSessionSectionAction extends Action2 {
    constructor();
    run(accessor: ServicesAccessor, context?: IAgentSessionSection): Promise<void>;
}
export declare class UnarchiveAgentSessionSectionAction extends Action2 {
    constructor();
    run(accessor: ServicesAccessor, context?: IAgentSessionSection): Promise<void>;
}
export declare class MarkAgentSessionSectionReadAction extends Action2 {
    constructor();
    run(accessor: ServicesAccessor, context?: IAgentSessionSection): Promise<void>;
}
declare abstract class BaseAgentSessionAction extends Action2 {
    run(accessor: ServicesAccessor, context?: IAgentSession | IMarshalledAgentSessionContext): Promise<void>;
    abstract runWithSession(session: IAgentSession, accessor: ServicesAccessor): Promise<void> | void;
}
export declare class MarkAgentSessionUnreadAction extends BaseAgentSessionAction {
    constructor();
    runWithSession(session: IAgentSession): void;
}
export declare class MarkAgentSessionReadAction extends BaseAgentSessionAction {
    constructor();
    runWithSession(session: IAgentSession): void;
}
export declare class ArchiveAgentSessionAction extends BaseAgentSessionAction {
    constructor();
    runWithSession(session: IAgentSession, accessor: ServicesAccessor): Promise<void>;
}
export declare class UnarchiveAgentSessionAction extends BaseAgentSessionAction {
    constructor();
    runWithSession(session: IAgentSession): void;
}
export declare class RenameAgentSessionAction extends BaseAgentSessionAction {
    constructor();
    runWithSession(session: IAgentSession, accessor: ServicesAccessor): Promise<void>;
}
export declare class DeleteAgentSessionAction extends BaseAgentSessionAction {
    constructor();
    runWithSession(session: IAgentSession, accessor: ServicesAccessor): Promise<void>;
}
export declare class DeleteAllLocalSessionsAction extends Action2 {
    constructor();
    run(accessor: ServicesAccessor, ...args: unknown[]): Promise<void>;
}
declare abstract class BaseOpenAgentSessionAction extends BaseAgentSessionAction {
    runWithSession(session: IAgentSession, accessor: ServicesAccessor): Promise<void>;
    protected abstract getTargetGroup(): PreferredGroup;
    protected abstract getOptions(): IChatEditorOptions;
}
export declare class OpenAgentSessionInEditorGroupAction extends BaseOpenAgentSessionAction {
    static readonly id = "workbench.action.chat.openSessionInEditorGroup";
    constructor();
    protected getTargetGroup(): PreferredGroup;
    protected getOptions(): IChatEditorOptions;
}
export declare class OpenAgentSessionInNewEditorGroupAction extends BaseOpenAgentSessionAction {
    static readonly id = "workbench.action.chat.openSessionInNewEditorGroup";
    constructor();
    protected getTargetGroup(): PreferredGroup;
    protected getOptions(): IChatEditorOptions;
}
export declare class OpenAgentSessionInNewWindowAction extends BaseOpenAgentSessionAction {
    static readonly id = "workbench.action.chat.openSessionInNewWindow";
    constructor();
    protected getTargetGroup(): PreferredGroup;
    protected getOptions(): IChatEditorOptions;
}
export declare class RefreshAgentSessionsViewerAction extends Action2 {
    constructor();
    run(accessor: ServicesAccessor, agentSessionsControl: IAgentSessionsControl): void;
}
export declare class FindAgentSessionInViewerAction extends Action2 {
    constructor();
    run(accessor: ServicesAccessor, agentSessionsControl: IAgentSessionsControl): void;
}
declare abstract class UpdateChatViewWidthAction extends Action2 {
    run(accessor: ServicesAccessor): Promise<void>;
    abstract getOrientation(): AgentSessionsViewerOrientation;
}
export declare class ShowAgentSessionsSidebar extends UpdateChatViewWidthAction {
    static readonly ID = "agentSessions.showAgentSessionsSidebar";
    static readonly TITLE: import("../../../../../nls.js").ILocalizedString;
    constructor();
    getOrientation(): AgentSessionsViewerOrientation;
}
export declare class HideAgentSessionsSidebar extends UpdateChatViewWidthAction {
    static readonly ID = "agentSessions.hideAgentSessionsSidebar";
    static readonly TITLE: import("../../../../../nls.js").ILocalizedString;
    constructor();
    getOrientation(): AgentSessionsViewerOrientation;
}
export declare class ToggleAgentSessionsSidebar extends Action2 {
    static readonly ID = "agentSessions.toggleAgentSessionsSidebar";
    static readonly TITLE: import("../../../../../nls.js").ILocalizedString;
    constructor();
    run(accessor: ServicesAccessor): Promise<void>;
}
export declare class FocusAgentSessionsAction extends Action2 {
    static readonly id = "workbench.action.chat.focusAgentSessionsViewer";
    constructor();
    run(accessor: ServicesAccessor): Promise<void>;
}
export {};
