import { Disposable, IDisposable } from '../../../../../base/common/lifecycle.js';
import { IObservable, IObservableWithChange } from '../../../../../base/common/observable.js';
import { URI } from '../../../../../base/common/uri.js';
import { StringText } from '../../../../../editor/common/core/text/abstractText.js';
import { ITextModel } from '../../../../../editor/common/model.js';
import { IModelService } from '../../../../../editor/common/services/model.js';
import { IObservableDocument, ObservableWorkspace, StringEditWithReason } from './observableWorkspace.js';
export declare class VSCodeWorkspace extends ObservableWorkspace implements IDisposable {
    private readonly _textModelService;
    private readonly _documents;
    get documents(): IObservable<VSCodeDocument[]>;
    private readonly _store;
    constructor(_textModelService: IModelService);
    dispose(): void;
}
export declare class VSCodeDocument extends Disposable implements IObservableDocument {
    readonly textModel: ITextModel;
    get uri(): URI;
    private readonly _value;
    private readonly _version;
    private readonly _languageId;
    get value(): IObservableWithChange<StringText, StringEditWithReason>;
    get version(): IObservable<number>;
    get languageId(): IObservable<string>;
    constructor(textModel: ITextModel);
}
