import { CancellationToken } from '../../../base/common/cancellation.js';
import { Disposable } from '../../../base/common/lifecycle.js';
import { URI } from '../../../base/common/uri.js';
import { IGitExtensionDelegate, IGitService, GitRef, GitRefQuery, GitDiffChange, IGitRepository } from '../../contrib/git/common/gitService.js';
import { IExtHostContext } from '../../services/extensions/common/extHostCustomers.js';
import { MainThreadGitExtensionShape } from '../common/extHost.protocol.js';
export declare class MainThreadGitExtensionService extends Disposable implements MainThreadGitExtensionShape, IGitExtensionDelegate {
    private readonly gitService;
    private readonly _proxy;
    private readonly _openRepositorySequencer;
    private _repositoryHandles;
    private _repositories;
    get repositories(): Iterable<IGitRepository>;
    constructor(extHostContext: IExtHostContext, gitService: IGitService);
    private _initializeDelegate;
    private _getRepositoryByUri;
    openRepository(uri: URI): Promise<IGitRepository | undefined>;
    getRefs(root: URI, query: GitRefQuery, token?: CancellationToken): Promise<GitRef[]>;
    diffBetweenWithStats(root: URI, ref1: string, ref2: string, path?: string): Promise<GitDiffChange[]>;
    $onDidChangeRepository(handle: number): Promise<void>;
}
