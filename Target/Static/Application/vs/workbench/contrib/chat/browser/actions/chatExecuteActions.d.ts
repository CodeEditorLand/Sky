import { URI } from '../../../../../base/common/uri.js';
import { ServicesAccessor } from '../../../../../editor/browser/editorExtensions.js';
import { Action2 } from '../../../../../platform/actions/common/actions.js';
import { ChatModeKind } from '../../common/constants.js';
import { IChatWidget } from '../chat.js';
export interface IVoiceChatExecuteActionContext {
    readonly disableTimeout?: boolean;
}
export interface IChatExecuteActionContext {
    widget?: IChatWidget;
    inputValue?: string;
    voice?: IVoiceChatExecuteActionContext;
}
declare abstract class SubmitAction extends Action2 {
    run(accessor: ServicesAccessor, ...args: unknown[]): Promise<void>;
}
export declare class ChatSubmitAction extends SubmitAction {
    static readonly ID = "workbench.action.chat.submit";
    constructor();
}
export declare const ToggleAgentModeActionId = "workbench.action.chat.toggleAgentMode";
export interface IToggleChatModeArgs {
    modeId: ChatModeKind | string;
    sessionResource: URI | undefined;
}
export declare class OpenModelPickerAction extends Action2 {
    static readonly ID = "workbench.action.chat.openModelPicker";
    constructor();
    run(accessor: ServicesAccessor, ...args: unknown[]): Promise<void>;
}
export declare class OpenModePickerAction extends Action2 {
    static readonly ID = "workbench.action.chat.openModePicker";
    constructor();
    run(accessor: ServicesAccessor, ...args: unknown[]): Promise<void>;
}
export declare class OpenSessionTargetPickerAction extends Action2 {
    static readonly ID = "workbench.action.chat.openSessionTargetPicker";
    constructor();
    run(accessor: ServicesAccessor, ...args: unknown[]): Promise<void>;
}
export declare class ChatSessionPrimaryPickerAction extends Action2 {
    static readonly ID = "workbench.action.chat.chatSessionPrimaryPicker";
    constructor();
    run(accessor: ServicesAccessor, ...args: unknown[]): Promise<void>;
}
export declare const ChangeChatModelActionId = "workbench.action.chat.changeModel";
export declare class ChatEditingSessionSubmitAction extends SubmitAction {
    static readonly ID = "workbench.action.edits.submit";
    constructor();
}
export declare class ChatSubmitWithCodebaseAction extends Action2 {
    static readonly ID = "workbench.action.chat.submitWithCodebase";
    constructor();
    run(accessor: ServicesAccessor, ...args: unknown[]): void;
}
export declare const CancelChatActionId = "workbench.action.chat.cancel";
export declare class CancelAction extends Action2 {
    static readonly ID = "workbench.action.chat.cancel";
    constructor();
    run(accessor: ServicesAccessor, ...args: unknown[]): void;
}
export declare const CancelChatEditId = "workbench.edit.chat.cancel";
export declare class CancelEdit extends Action2 {
    static readonly ID = "workbench.edit.chat.cancel";
    constructor();
    run(accessor: ServicesAccessor, ...args: unknown[]): void;
}
export declare function registerChatExecuteActions(): void;
export {};
