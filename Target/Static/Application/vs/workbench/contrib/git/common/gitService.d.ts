import { CancellationToken } from '../../../../base/common/cancellation.js';
import { IDisposable } from '../../../../base/common/lifecycle.js';
import { IObservable } from '../../../../base/common/observable.js';
import { URI } from '../../../../base/common/uri.js';
export declare enum GitRefType {
    Head = 0,
    RemoteHead = 1,
    Tag = 2
}
export interface GitRef {
    readonly type: GitRefType;
    readonly name?: string;
    readonly commit?: string;
    readonly remote?: string;
}
export interface GitRefQuery {
    readonly contains?: string;
    readonly count?: number;
    readonly pattern?: string | string[];
    readonly sort?: 'alphabetically' | 'committerdate' | 'creatordate';
}
export interface GitRepositoryState {
    readonly HEAD?: GitBranch;
}
export interface GitBranch extends GitRef {
    readonly upstream?: GitUpstreamRef;
    readonly ahead?: number;
    readonly behind?: number;
}
export interface GitUpstreamRef {
    readonly remote: string;
    readonly name: string;
    readonly commit?: string;
}
export interface IGitRepository {
    readonly rootUri: URI;
    readonly state: IObservable<GitRepositoryState>;
    updateState(state: GitRepositoryState): void;
    getRefs(query: GitRefQuery, token?: CancellationToken): Promise<GitRef[]>;
}
export interface IGitExtensionDelegate {
    readonly repositories: Iterable<IGitRepository>;
    openRepository(uri: URI): Promise<IGitRepository | undefined>;
    getRefs(root: URI, query?: GitRefQuery, token?: CancellationToken): Promise<GitRef[]>;
}
export declare const IGitService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IGitService>;
export interface IGitService {
    readonly _serviceBrand: undefined;
    readonly repositories: Iterable<IGitRepository>;
    setDelegate(delegate: IGitExtensionDelegate): IDisposable;
    openRepository(uri: URI): Promise<IGitRepository | undefined>;
}
