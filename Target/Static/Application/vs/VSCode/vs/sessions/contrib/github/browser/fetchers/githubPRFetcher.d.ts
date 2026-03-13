import { IGitHubPRComment, IGitHubPRReviewThread, IGitHubPullRequest, IGitHubPullRequestMergeability } from '../../common/types.js';
import { GitHubApiClient } from '../githubApiClient.js';
/**
 * Stateless fetcher for GitHub pull request data.
 * Handles all PR-related REST API calls including reviews, comments, and mergeability.
 */
export declare class GitHubPRFetcher {
    private readonly _apiClient;
    constructor(_apiClient: GitHubApiClient);
    getPullRequest(owner: string, repo: string, prNumber: number): Promise<IGitHubPullRequest>;
    getMergeability(owner: string, repo: string, prNumber: number): Promise<IGitHubPullRequestMergeability>;
    getReviewThreads(owner: string, repo: string, prNumber: number): Promise<IGitHubPRReviewThread[]>;
    postReviewComment(owner: string, repo: string, prNumber: number, body: string, inReplyTo: number): Promise<IGitHubPRComment>;
    postIssueComment(owner: string, repo: string, prNumber: number, body: string): Promise<IGitHubPRComment>;
    resolveThread(_owner: string, _repo: string, threadId: string): Promise<void>;
}
