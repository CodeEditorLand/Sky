import { Disposable } from '../../../../../base/common/lifecycle.js';
import { IObservable } from '../../../../../base/common/observable.js';
import { URI } from '../../../../../base/common/uri.js';
import { IChatService } from '../../common/chatService/chatService.js';
import { ILanguageService } from '../../../../../editor/common/languages/language.js';
export interface IAgentSessionApprovalInfo {
    readonly label: string;
    readonly languageId: string | undefined;
    confirm(): void;
}
/**
 * Tracks approval state for all live chat sessions. For each session,
 * exposes an observable that emits {@link IAgentSessionApprovalInfo}
 * when a tool invocation is waiting for user confirmation, or `undefined`
 * when no approval is needed.
 */
export declare class AgentSessionApprovalModel extends Disposable {
    private readonly _chatService;
    private readonly _languageService;
    private readonly _approvals;
    private readonly _modelTrackers;
    constructor(_chatService: IChatService, _languageService: ILanguageService);
    getApproval(sessionResource: URI): IObservable<IAgentSessionApprovalInfo | undefined>;
    private _getOrCreateApproval;
    private _trackModel;
}
