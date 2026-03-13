import { Event } from '../../../../base/common/event.js';
import { Disposable, IDisposable } from '../../../../base/common/lifecycle.js';
import { URI } from '../../../../base/common/uri.js';
import { FileSystemProviderCapabilities, FileType, IFileDeleteOptions, IFileOverwriteOptions, IFileSystemProviderWithFileReadWriteCapability, IFileWriteOptions, IStat, IFileChange } from '../../../../platform/files/common/files.js';
import { IRequestService } from '../../../../platform/request/common/request.js';
import { IAuthenticationService } from '../../../../workbench/services/authentication/common/authentication.js';
import { ILogService } from '../../../../platform/log/common/log.js';
export declare const GITHUB_REMOTE_FILE_SCHEME = "github-remote-file";
/**
 * Derives a display name from a github-remote-file URI.
 * Returns "repo (branch)" or just "repo" when on HEAD.
 */
export declare function getGitHubRemoteFileDisplayName(uri: URI): string | undefined;
/**
 * A readonly virtual filesystem provider backed by the GitHub REST API.
 *
 * URI format: github-remote-file://github/{owner}/{repo}/{ref}/{path...}
 *
 * For example: github-remote-file://github/microsoft/vscode/main/src/vs/base/common/uri.ts
 *
 * This provider fetches the full recursive tree from the GitHub Trees API on first
 * access and caches it. Individual file contents are fetched on demand via the
 * Blobs API.
 */
export declare class GitHubFileSystemProvider extends Disposable implements IFileSystemProviderWithFileReadWriteCapability {
    private readonly requestService;
    private readonly authenticationService;
    private readonly logService;
    private readonly _onDidChangeCapabilities;
    readonly onDidChangeCapabilities: Event<void>;
    readonly capabilities: FileSystemProviderCapabilities;
    private readonly _onDidChangeFile;
    readonly onDidChangeFile: Event<readonly IFileChange[]>;
    /** Cache keyed by "owner/repo/ref" */
    private readonly treeCache;
    /** Negative cache for refs that returned 404, keyed by "owner/repo/ref" */
    private readonly notFoundCache;
    /** In-flight fetch promises keyed by "owner/repo/ref" to deduplicate concurrent requests */
    private readonly pendingFetches;
    /** Cache TTL - 5 minutes */
    private static readonly CACHE_TTL_MS;
    /** Negative cache TTL - 1 minute */
    private static readonly NOT_FOUND_CACHE_TTL_MS;
    constructor(requestService: IRequestService, authenticationService: IAuthenticationService, logService: ILogService);
    /**
     * Parse a github-remote-file URI into its components.
     * Format: github-remote-file://github/{owner}/{repo}/{ref}/{path...}
     */
    private parseUri;
    private getCacheKey;
    private getAuthToken;
    private fetchTree;
    private doFetchTree;
    stat(resource: URI): Promise<IStat>;
    readdir(resource: URI): Promise<[string, FileType][]>;
    readFile(resource: URI): Promise<Uint8Array>;
    watch(): IDisposable;
    writeFile(_resource: URI, _content: Uint8Array, _opts: IFileWriteOptions): Promise<void>;
    mkdir(_resource: URI): Promise<void>;
    delete(_resource: URI, _opts: IFileDeleteOptions): Promise<void>;
    rename(_from: URI, _to: URI, _opts: IFileOverwriteOptions): Promise<void>;
    invalidateCache(owner: string, repo: string, ref: string): void;
    dispose(): void;
}
