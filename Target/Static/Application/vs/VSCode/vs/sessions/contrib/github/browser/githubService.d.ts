import { Disposable } from '../../../../base/common/lifecycle.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { GitHubRepositoryModel } from './models/githubRepositoryModel.js';
import { GitHubPullRequestModel } from './models/githubPullRequestModel.js';
import { GitHubPullRequestCIModel } from './models/githubPullRequestCIModel.js';
export interface IGitHubService {
    readonly _serviceBrand: undefined;
    /**
     * Get or create a reactive model for a GitHub repository.
     * The model is cached by owner/repo key and disposed when the service is disposed.
     */
    getRepository(owner: string, repo: string): GitHubRepositoryModel;
    /**
     * Get or create a reactive model for a GitHub pull request.
     * The model is cached by owner/repo/prNumber key and disposed when the service is disposed.
     */
    getPullRequest(owner: string, repo: string, prNumber: number): GitHubPullRequestModel;
    /**
     * Get or create a reactive model for CI checks on a pull request head ref.
     * The model is cached by owner/repo/headRef key and disposed when the service is disposed.
     */
    getPullRequestCI(owner: string, repo: string, headRef: string): GitHubPullRequestCIModel;
}
export declare const IGitHubService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IGitHubService>;
export declare class GitHubService extends Disposable implements IGitHubService {
    private readonly _logService;
    readonly _serviceBrand: undefined;
    private readonly _apiClient;
    private readonly _repoFetcher;
    private readonly _prFetcher;
    private readonly _ciFetcher;
    private readonly _repositories;
    private readonly _pullRequests;
    private readonly _ciModels;
    constructor(instantiationService: IInstantiationService, _logService: ILogService);
    getRepository(owner: string, repo: string): GitHubRepositoryModel;
    getPullRequest(owner: string, repo: string, prNumber: number): GitHubPullRequestModel;
    getPullRequestCI(owner: string, repo: string, headRef: string): GitHubPullRequestCIModel;
}
