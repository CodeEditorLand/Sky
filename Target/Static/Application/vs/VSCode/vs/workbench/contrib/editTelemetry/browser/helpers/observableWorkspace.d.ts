import { IObservableWithChange, IObservable } from '../../../../../base/common/observable.js';
import { URI } from '../../../../../base/common/uri.js';
import { StringEdit } from '../../../../../editor/common/core/edits/stringEdit.js';
import { OffsetRange } from '../../../../../editor/common/core/ranges/offsetRange.js';
import { StringText } from '../../../../../editor/common/core/text/abstractText.js';
import { TextModelEditSource } from '../../../../../editor/common/textModelEditSource.js';
export declare abstract class ObservableWorkspace {
    abstract get documents(): IObservable<readonly IObservableDocument[]>;
    getFirstOpenDocument(): IObservableDocument | undefined;
    getDocument(documentId: URI): IObservableDocument | undefined;
    private _version;
    /**
     * Is fired when any open document changes.
    */
    readonly onDidOpenDocumentChange: IObservableWithChange<number, unknown>;
    readonly lastActiveDocument: IObservable<IObservableDocument | undefined>;
}
export interface IObservableDocument {
    readonly uri: URI;
    readonly value: IObservableWithChange<StringText, StringEditWithReason>;
    /**
     * Increases whenever the value changes. Is also used to reference document states from the past.
    */
    readonly version: IObservable<number>;
    readonly languageId: IObservable<string>;
}
export declare class StringEditWithReason extends StringEdit {
    readonly reason: TextModelEditSource;
    static replace(range: OffsetRange, newText: string, source?: TextModelEditSource): StringEditWithReason;
    constructor(replacements: StringEdit['replacements'], reason: TextModelEditSource);
}
