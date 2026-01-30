import { IReader, IObservable } from '../../../../../base/common/observable.js';
import { URI } from '../../../../../base/common/uri.js';
import { ISCMRepository, ISCMService } from '../../../scm/common/scm.js';
export declare class ScmAdapter {
    private readonly _scmService;
    private readonly _repos;
    private readonly _reposChangedSignal;
    constructor(_scmService: ISCMService);
    getRepo(uri: URI, reader: IReader | undefined): ScmRepoAdapter | undefined;
}
export declare class ScmRepoAdapter {
    private readonly _repo;
    readonly headBranchNameObs: IObservable<string | undefined>;
    readonly headCommitHashObs: IObservable<string | undefined>;
    constructor(_repo: ISCMRepository);
    isIgnored(uri: URI): Promise<boolean>;
}
