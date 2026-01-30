import { ServicesAccessor } from '../../../../../editor/browser/editorExtensions.js';
import { Action2, IAction2Options } from '../../../../../platform/actions/common/actions.js';
import { IChatEditingSession, IModifiedFileEntry, IModifiedFileEntryEditorIntegration } from '../../common/editing/chatEditingService.js';
declare abstract class ChatEditingEditorAction extends Action2 {
    constructor(desc: Readonly<IAction2Options>);
    run(accessor: ServicesAccessor, ...args: unknown[]): Promise<void>;
    abstract runChatEditingCommand(accessor: ServicesAccessor, session: IChatEditingSession, entry: IModifiedFileEntry, integration: IModifiedFileEntryEditorIntegration, ...args: unknown[]): Promise<void> | void;
}
declare abstract class KeepOrUndoAction extends ChatEditingEditorAction {
    private _keep;
    constructor(id: string, _keep: boolean);
    runChatEditingCommand(accessor: ServicesAccessor, session: IChatEditingSession, entry: IModifiedFileEntry, _integration: IModifiedFileEntryEditorIntegration): Promise<void>;
}
export declare class AcceptAction extends KeepOrUndoAction {
    static readonly ID = "chatEditor.action.accept";
    constructor();
}
export declare class RejectAction extends KeepOrUndoAction {
    static readonly ID = "chatEditor.action.reject";
    constructor();
}
declare abstract class AcceptRejectHunkAction extends ChatEditingEditorAction {
    private readonly _accept;
    constructor(_accept: boolean);
    runChatEditingCommand(accessor: ServicesAccessor, session: IChatEditingSession, entry: IModifiedFileEntry, ctrl: IModifiedFileEntryEditorIntegration, ...args: unknown[]): Promise<void>;
}
export declare class AcceptHunkAction extends AcceptRejectHunkAction {
    static readonly ID = "chatEditor.action.acceptHunk";
    constructor();
}
export declare class RejectHunkAction extends AcceptRejectHunkAction {
    static readonly ID = "chatEditor.action.undoHunk";
    constructor();
}
export declare class ReviewChangesAction extends ChatEditingEditorAction {
    constructor();
    runChatEditingCommand(_accessor: ServicesAccessor, _session: IChatEditingSession, entry: IModifiedFileEntry, _integration: IModifiedFileEntryEditorIntegration, ..._args: unknown[]): void;
}
export declare class AcceptAllEditsAction extends ChatEditingEditorAction {
    static readonly ID = "chatEditor.action.acceptAllEdits";
    constructor();
    runChatEditingCommand(_accessor: ServicesAccessor, session: IChatEditingSession, _entry: IModifiedFileEntry, _integration: IModifiedFileEntryEditorIntegration, ..._args: unknown[]): Promise<void>;
}
export declare function registerChatEditorActions(): void;
export declare const navigationBearingFakeActionId = "chatEditor.navigation.bearings";
export {};
