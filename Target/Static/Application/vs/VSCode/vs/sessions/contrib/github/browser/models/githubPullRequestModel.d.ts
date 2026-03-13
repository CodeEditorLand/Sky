import { Disposable } from '../../../../../base/common/lifecycle.js';
import { IObservable } from '../../../../../base/common/observable.js';
import { ILogService } from '../../../../../platform/log/common/log.js';
import { IGitHubPRComment, IGitHubPRReviewThread, IGitHubPullRequest, IGitHubPullRequestMergeability } from '../../common/types.js';
import { GitHubPRFetcher } from '../fetchers/githubPRFetcher.js';
/**
 * Reactive model for a GitHub pull request. Wraps fetcher data in
 * observables, supports on-demand refresh, and can poll periodically.
 */
export declare class GitHubPullRequestModel extends Disposable {
    readonly owner: string;
    readonly repo: string;
    readonly prNumber: number;
    private readonly _fetcher;
    private readonly _logService;
    private readonly _pullRequest;
    readonly pullRequest: IObservable<IGitHubPullRequest | undefined>;
    private readonly _mergeability;
    readonly mergeability: IObservable<IGitHubPullRequestMergeability | undefined>;
    private readonly _reviewThreads;
    readonly reviewThreads: IObservable<readonly IGitHubPRReviewThread[]>;
    private readonly _pollScheduler;
    private _disposed;
    constructor(owner: string, repo: string, prNumber: number, _fetcher: GitHubPRFetcher, _logService: ILogService);
    /**
     * Refresh all PR data: pull request info, mergeability, and review threads.
     */
    refresh(): Promise<void>;
    /**
     * Refresh only the review threads.
     */
    refreshThreads(): Promise<void>;
    /**
     * Post a reply to an existing review thread and refresh threads.
     */
    postReviewComment(body: string, inReplyTo: number): Promise<IGitHubPRComment>;
    /**
     * Post a top-level issue comment on the PR.
     */
    postIssueComment(body: string): Promise<IGitHubPRComment>;
    /**
     * Resolve a review thread and refresh the thread list.
     */
    resolveThread(threadId: string): Promise<void>;
    /**
     * Start periodic polling. Each cycle refreshes all PR data.
     */
    startPolling(intervalMs?: number): void;
    /**
     * Stop periodic polling.
     */
    stopPolling(): void;
    private _poll;
    dispose(): void;
    private _refreshPullRequest;
    private _refreshMergeability;
    private _refreshThreads;
}
