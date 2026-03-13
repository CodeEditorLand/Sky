import { GitHubCIOverallStatus, IGitHubCICheck } from '../../common/types.js';
import { GitHubApiClient } from '../githubApiClient.js';
/**
 * Stateless fetcher for GitHub CI check data (check runs, check suites).
 * All methods return raw typed data with no caching or state.
 */
export declare class GitHubPRCIFetcher {
    private readonly _apiClient;
    constructor(_apiClient: GitHubApiClient);
    getCheckRuns(owner: string, repo: string, ref: string): Promise<IGitHubCICheck[]>;
    /**
     * Get logs/output for a specific check run.
     *
     * Tries multiple sources in order:
     * 1. The check run's own output fields (title, summary, text) — set by the
     *    check run creator via the Checks API.
     * 2. Annotations attached to the check run.
     * 3. GitHub Actions job logs (only works for GitHub Actions workflows).
     */
    getCheckRunAnnotations(owner: string, repo: string, checkRunId: number): Promise<string>;
}
/**
 * Compute an overall CI status from a list of check runs.
 */
export declare function computeOverallCIStatus(checks: readonly IGitHubCICheck[]): GitHubCIOverallStatus;
