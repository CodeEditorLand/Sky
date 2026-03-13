import { Event } from '../../../../base/common/event.js';
import { IMarkdownString } from '../../../../base/common/htmlContent.js';
import { IObservable } from '../../../../base/common/observable.js';
import { URI } from '../../../../base/common/uri.js';
import { IActiveCodeEditor, ICodeEditor } from '../../../../editor/browser/editorBrowser.js';
import { Position } from '../../../../editor/common/core/position.js';
import { Selection } from '../../../../editor/common/core/selection.js';
import { ServicesAccessor } from '../../../../platform/instantiation/common/instantiation.js';
import { IChatEditingSession } from '../../chat/common/editing/chatEditingService.js';
import { IChatModel, IChatModelInputState, IChatRequestModel } from '../../chat/common/model/chatModel.js';
export declare const IInlineChatSessionService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IInlineChatSessionService>;
export type InlineChatSessionTerminationState = string | IMarkdownString;
export interface IInlineChatSession2 {
    readonly initialPosition: Position;
    readonly initialSelection: Selection;
    readonly uri: URI;
    readonly chatModel: IChatModel;
    readonly editingSession: IChatEditingSession;
    readonly terminationState: IObservable<InlineChatSessionTerminationState | undefined>;
    setTerminationState(state: InlineChatSessionTerminationState | undefined): void;
    dispose(): void;
}
export interface IInlineChatSessionService {
    _serviceBrand: undefined;
    readonly onWillStartSession: Event<IActiveCodeEditor>;
    readonly onDidChangeSessions: Event<this>;
    dispose(): void;
    createSession(editor: ICodeEditor): IInlineChatSession2;
    getSessionByTextModel(uri: URI): IInlineChatSession2 | undefined;
    getSessionBySessionUri(uri: URI): IInlineChatSession2 | undefined;
}
export declare function moveToPanelChat(accessor: ServicesAccessor, model: IChatModel | undefined, resend: boolean): Promise<void>;
export declare function askInPanelChat(accessor: ServicesAccessor, request: IChatRequestModel, state: IChatModelInputState | undefined): Promise<void>;
export declare function continueInPanelChat(accessor: ServicesAccessor, session: IInlineChatSession2): Promise<void>;
export declare function rephraseInlineChat(accessor: ServicesAccessor, session: IInlineChatSession2): string | undefined;
