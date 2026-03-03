import { ICodeEditor } from '../../../../editor/browser/editorBrowser.js';
import { EditorAction2 } from '../../../../editor/browser/editorExtensions.js';
import { InlineChatController } from './inlineChatController.js';
import { Action2, IAction2Options } from '../../../../platform/actions/common/actions.js';
import { ServicesAccessor } from '../../../../platform/instantiation/common/instantiation.js';
export declare const START_INLINE_CHAT: import("../../../../base/common/themables.ts").ThemeIcon;
export interface IHoldForSpeech {
    (accessor: ServicesAccessor, controller: InlineChatController, source: Action2): void;
}
export declare function setHoldForSpeech(holdForSpeech: IHoldForSpeech): void;
export declare class StartSessionAction extends Action2 {
    constructor();
    run(accessor: ServicesAccessor, ...args: unknown[]): any;
    private _runEditorCommand;
}
export declare class FocusInlineChat extends EditorAction2 {
    constructor();
    runEditorCommand(_accessor: ServicesAccessor, editor: ICodeEditor, ..._args: unknown[]): void;
}
export declare abstract class AbstractInlineChatAction extends EditorAction2 {
    static readonly category: import("../../../../nls.js").ILocalizedString;
    constructor(desc: IAction2Options);
    runEditorCommand(accessor: ServicesAccessor, editor: ICodeEditor, ..._args: unknown[]): void;
    abstract runInlineChatCommand(accessor: ServicesAccessor, ctrl: InlineChatController, editor: ICodeEditor, ...args: unknown[]): void;
}
export declare class FixDiagnosticsAction extends AbstractInlineChatAction {
    constructor();
    runInlineChatCommand(_accessor: ServicesAccessor, ctrl: InlineChatController, _editor: ICodeEditor, ..._args: unknown[]): void;
}
declare class KeepOrUndoSessionAction extends AbstractInlineChatAction {
    private readonly _keep;
    constructor(_keep: boolean, desc: IAction2Options);
    runInlineChatCommand(_accessor: ServicesAccessor, ctrl: InlineChatController, editor: ICodeEditor, ..._args: unknown[]): Promise<void>;
}
export declare class KeepSessionAction2 extends KeepOrUndoSessionAction {
    constructor();
}
export declare class UndoSessionAction2 extends KeepOrUndoSessionAction {
    constructor();
}
export declare class UndoAndCloseSessionAction2 extends KeepOrUndoSessionAction {
    constructor();
}
export declare class CancelSessionAction extends KeepOrUndoSessionAction {
    constructor();
}
export declare class SubmitInlineChatInputAction extends AbstractInlineChatAction {
    constructor();
    runInlineChatCommand(_accessor: ServicesAccessor, ctrl: InlineChatController, _editor: ICodeEditor, ..._args: unknown[]): void;
}
export declare class HideInlineChatInputAction extends AbstractInlineChatAction {
    constructor();
    runInlineChatCommand(_accessor: ServicesAccessor, ctrl: InlineChatController, _editor: ICodeEditor, ..._args: unknown[]): void;
}
export declare class AskInChatAction extends EditorAction2 {
    constructor();
    runEditorCommand(accessor: ServicesAccessor, editor: ICodeEditor): Promise<void>;
}
export declare class QueueInChatAction extends AbstractInlineChatAction {
    constructor();
    runInlineChatCommand(accessor: ServicesAccessor, ctrl: InlineChatController, editor: ICodeEditor): Promise<void>;
}
export {};
