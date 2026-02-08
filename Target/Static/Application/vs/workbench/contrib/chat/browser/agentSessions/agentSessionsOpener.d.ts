import { IDisposable } from '../../../../../base/common/lifecycle.js';
import { IAgentSession } from './agentSessionsModel.js';
import { ServicesAccessor } from '../../../../../editor/browser/editorExtensions.js';
import { IChatWidget } from '../chat.js';
import { IEditorOptions } from '../../../../../platform/editor/common/editor.js';
export interface ISessionOpenerParticipant {
    handleOpenSession(accessor: ServicesAccessor, session: IAgentSession, openOptions?: ISessionOpenOptions): Promise<boolean>;
}
export interface ISessionOpenOptions {
    readonly sideBySide?: boolean;
    readonly editorOptions?: IEditorOptions;
}
declare class SessionOpenerRegistry {
    private readonly participants;
    registerParticipant(participant: ISessionOpenerParticipant): IDisposable;
    getParticipants(): readonly ISessionOpenerParticipant[];
}
export declare const sessionOpenerRegistry: SessionOpenerRegistry;
export declare function openSession(accessor: ServicesAccessor, session: IAgentSession, openOptions?: ISessionOpenOptions): Promise<IChatWidget | undefined>;
export {};
