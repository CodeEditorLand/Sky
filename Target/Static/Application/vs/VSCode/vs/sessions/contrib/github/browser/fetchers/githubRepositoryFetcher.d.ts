import { IGitHubRepository } from '../../common/types.js';
import { GitHubApiClient } from '../githubApiClient.js';
/**
 * Stateless fetcher for GitHub repository data.
 * All methods return raw typed data with no caching or state.
 */
export declare class GitHubRepositoryFetcher {
    private readonly _apiClient;
    constructor(_apiClient: GitHubApiClient);
    getRepository(owner: string, repo: string): Promise<IGitHubRepository>;
}
