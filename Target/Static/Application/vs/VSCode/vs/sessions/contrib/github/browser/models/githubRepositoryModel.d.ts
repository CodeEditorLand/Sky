import { Disposable } from '../../../../../base/common/lifecycle.js';
import { IObservable } from '../../../../../base/common/observable.js';
import { ILogService } from '../../../../../platform/log/common/log.js';
import { IGitHubRepository } from '../../common/types.js';
import { GitHubRepositoryFetcher } from '../fetchers/githubRepositoryFetcher.js';
/**
 * Reactive model for a GitHub repository. Wraps fetcher data
 * in observables and supports on-demand refresh.
 */
export declare class GitHubRepositoryModel extends Disposable {
    readonly owner: string;
    readonly repo: string;
    private readonly _fetcher;
    private readonly _logService;
    private readonly _repository;
    readonly repository: IObservable<IGitHubRepository | undefined>;
    constructor(owner: string, repo: string, _fetcher: GitHubRepositoryFetcher, _logService: ILogService);
    refresh(): Promise<void>;
}
