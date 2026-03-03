import { Disposable } from '../../../../../base/common/lifecycle.js';
import { IInstantiationService } from '../../../../../platform/instantiation/common/instantiation.js';
import { IStorageService } from '../../../../../platform/storage/common/storage.js';
import { AnnotatedDocuments } from '../helpers/annotatedDocuments.js';
export declare class AiStatsFeature extends Disposable {
    private readonly _storageService;
    private readonly _instantiationService;
    private readonly _data;
    private readonly _dataVersion;
    constructor(annotatedDocuments: AnnotatedDocuments, _storageService: IStorageService, _instantiationService: IInstantiationService);
    readonly aiRate: import("../../../../../base/common/observable.js").IObservable<number>;
    readonly sessionCount: import("../../../../../base/common/observable.js").IObservableWithChange<number, void>;
    readonly sessions: import("../../../../../base/common/observable.js").IObservableWithChange<ISession[], void>;
    readonly acceptedInlineSuggestionsToday: import("../../../../../base/common/observable.js").IObservableWithChange<number, void>;
    private _getDataAndSession;
}
interface ISession {
    startTime: number;
    typedCharacters: number;
    aiCharacters: number;
    acceptedInlineSuggestions: number | undefined;
    chatEditCount: number | undefined;
}
export {};
