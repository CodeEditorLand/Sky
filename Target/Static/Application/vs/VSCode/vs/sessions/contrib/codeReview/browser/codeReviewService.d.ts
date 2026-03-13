import { Disposable } from '../../../../base/common/lifecycle.js';
import { IObservable } from '../../../../base/common/observable.js';
import { URI } from '../../../../base/common/uri.js';
import { IRange } from '../../../../editor/common/core/range.js';
import { ICommandService } from '../../../../platform/commands/common/commands.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { IChatSessionFileChange, IChatSessionFileChange2 } from '../../../../workbench/contrib/chat/common/chatSessionsService.js';
import { IAgentSessionsService } from '../../../../workbench/contrib/chat/browser/agentSessions/agentSessionsService.js';
import { IGitHubService } from '../../github/browser/githubService.js';
import { ISessionsManagementService } from '../../sessions/browser/sessionsManagementService.js';
export interface ICodeReviewComment {
    readonly id: string;
    readonly uri: URI;
    readonly range: IRange;
    readonly body: string;
    readonly kind: string;
    readonly severity: string;
    readonly suggestion?: ICodeReviewSuggestion;
}
export interface ICodeReviewSuggestion {
    readonly edits: readonly ICodeReviewSuggestionChange[];
}
export interface ICodeReviewSuggestionChange {
    readonly range: IRange;
    readonly newText: string;
    readonly oldText: string;
}
export interface ICodeReviewFile {
    readonly currentUri: URI;
    readonly baseUri?: URI;
}
export declare function getCodeReviewFilesFromSessionChanges(changes: readonly (IChatSessionFileChange | IChatSessionFileChange2)[]): readonly ICodeReviewFile[];
export declare function getCodeReviewVersion(files: readonly ICodeReviewFile[]): string;
export declare const enum CodeReviewStateKind {
    Idle = "idle",
    Loading = "loading",
    Result = "result",
    Error = "error"
}
export type ICodeReviewState = {
    readonly kind: CodeReviewStateKind.Idle;
} | {
    readonly kind: CodeReviewStateKind.Loading;
    readonly version: string;
} | {
    readonly kind: CodeReviewStateKind.Result;
    readonly version: string;
    readonly comments: readonly ICodeReviewComment[];
} | {
    readonly kind: CodeReviewStateKind.Error;
    readonly version: string;
    readonly reason: string;
};
export declare const enum PRReviewStateKind {
    None = "none",
    Loading = "loading",
    Loaded = "loaded",
    Error = "error"
}
export type IPRReviewState = {
    readonly kind: PRReviewStateKind.None;
} | {
    readonly kind: PRReviewStateKind.Loading;
} | {
    readonly kind: PRReviewStateKind.Loaded;
    readonly comments: readonly IPRReviewComment[];
} | {
    readonly kind: PRReviewStateKind.Error;
    readonly reason: string;
};
export interface IPRReviewComment {
    readonly id: string;
    readonly uri: URI;
    readonly range: IRange;
    readonly body: string;
    readonly author: string;
}
export declare const ICodeReviewService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<ICodeReviewService>;
export interface ICodeReviewService {
    readonly _serviceBrand: undefined;
    /**
     * Get the observable review state for a session.
     */
    getReviewState(sessionResource: URI): IObservable<ICodeReviewState>;
    /**
     * Synchronously check if a completed review exists for the given session+version.
     */
    hasReview(sessionResource: URI, version: string): boolean;
    /**
     * Request a code review for the given session. The review is associated with
     * a version string (fingerprint of changed files). If a review is already in
     * progress or completed for this version, this is a no-op.
     */
    requestReview(sessionResource: URI, version: string, files: readonly {
        readonly currentUri: URI;
        readonly baseUri?: URI;
    }[]): void;
    /**
     * Remove a single comment from the review results.
     */
    removeComment(sessionResource: URI, commentId: string): void;
    /**
     * Dismiss/clear the review for a session entirely.
     */
    dismissReview(sessionResource: URI): void;
    /**
     * Get the observable PR review state for a session.
     * Returns unresolved review comments from the PR associated with the session.
     */
    getPRReviewState(sessionResource: URI): IObservable<IPRReviewState>;
    /**
     * Resolve a PR review thread on GitHub and remove it from local state.
     */
    resolvePRReviewThread(sessionResource: URI, threadId: string): Promise<void>;
}
export declare class CodeReviewService extends Disposable implements ICodeReviewService {
    private readonly _commandService;
    private readonly _logService;
    private readonly _storageService;
    private readonly _gitHubService;
    private readonly _sessionsManagementService;
    private readonly _agentSessionsService;
    readonly _serviceBrand: undefined;
    private static readonly _STORAGE_KEY;
    private readonly _reviewsBySession;
    private readonly _prReviewBySession;
    constructor(_commandService: ICommandService, _logService: ILogService, _storageService: IStorageService, _gitHubService: IGitHubService, _sessionsManagementService: ISessionsManagementService, _agentSessionsService: IAgentSessionsService);
    getReviewState(sessionResource: URI): IObservable<ICodeReviewState>;
    hasReview(sessionResource: URI, version: string): boolean;
    requestReview(sessionResource: URI, version: string, files: readonly {
        readonly currentUri: URI;
        readonly baseUri?: URI;
    }[]): void;
    removeComment(sessionResource: URI, commentId: string): void;
    dismissReview(sessionResource: URI): void;
    private _getOrCreateData;
    private _executeReview;
    private _loadFromStorage;
    private _saveToStorage;
    private _registerSessionListeners;
    getPRReviewState(sessionResource: URI): IObservable<IPRReviewState>;
    resolvePRReviewThread(sessionResource: URI, threadId: string): Promise<void>;
    private _getOrCreatePRReviewData;
    private _ensurePRReviewInitialized;
    private _disposePRReview;
    dispose(): void;
}
