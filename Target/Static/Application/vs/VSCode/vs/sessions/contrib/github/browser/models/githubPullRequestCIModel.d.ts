import { Disposable } from '../../../../../base/common/lifecycle.js';
import { IObservable } from '../../../../../base/common/observable.js';
import { ILogService } from '../../../../../platform/log/common/log.js';
import { GitHubCIOverallStatus, IGitHubCICheck } from '../../common/types.js';
import { GitHubPRCIFetcher } from '../fetchers/githubPRCIFetcher.js';
/**
 * Reactive model for CI check status on a pull request head ref.
 * Wraps fetcher data in observables and supports periodic polling.
 */
export declare class GitHubPullRequestCIModel extends Disposable {
    readonly owner: string;
    readonly repo: string;
    readonly headRef: string;
    private readonly _fetcher;
    private readonly _logService;
    private readonly _checks;
    readonly checks: IObservable<readonly IGitHubCICheck[]>;
    private readonly _overallStatus;
    readonly overallStatus: IObservable<GitHubCIOverallStatus>;
    private readonly _pollScheduler;
    private _disposed;
    constructor(owner: string, repo: string, headRef: string, _fetcher: GitHubPRCIFetcher, _logService: ILogService);
    /**
     * Refresh all CI check data.
     */
    refresh(): Promise<void>;
    /**
     * Get annotations (structured logs) for a specific check run.
     */
    getCheckRunAnnotations(checkRunId: number): Promise<string>;
    /**
     * Start periodic polling. Each cycle refreshes CI check data.
     */
    startPolling(intervalMs?: number): void;
    /**
     * Stop periodic polling.
     */
    stopPolling(): void;
    private _poll;
    dispose(): void;
}
