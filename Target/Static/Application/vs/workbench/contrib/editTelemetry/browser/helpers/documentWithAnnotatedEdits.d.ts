import { Disposable, DisposableStore } from '../../../../../base/common/lifecycle.js';
import { IObservableWithChange } from '../../../../../base/common/observable.js';
import { AnnotatedStringEdit, IEditData, StringEdit } from '../../../../../editor/common/core/edits/stringEdit.js';
import { StringText } from '../../../../../editor/common/core/text/abstractText.js';
import { IEditorWorkerService } from '../../../../../editor/common/services/editorWorker.js';
import { TextModelEditSource } from '../../../../../editor/common/textModelEditSource.js';
import { IInstantiationService } from '../../../../../platform/instantiation/common/instantiation.js';
import { IObservableDocument } from './observableWorkspace.js';
export interface IDocumentWithAnnotatedEdits<TEditData extends IEditData<TEditData> = EditKeySourceData> {
    readonly value: IObservableWithChange<StringText, {
        edit: AnnotatedStringEdit<TEditData>;
    }>;
    waitForQueue(): Promise<void>;
}
/**
 * Creates a document that is a delayed copy of the original document,
 * but with edits annotated with the source of the edit.
*/
export declare class DocumentWithSourceAnnotatedEdits extends Disposable implements IDocumentWithAnnotatedEdits<EditSourceData> {
    private readonly _originalDoc;
    readonly value: IObservableWithChange<StringText, {
        edit: AnnotatedStringEdit<EditSourceData>;
    }>;
    constructor(_originalDoc: IObservableDocument);
    waitForQueue(): Promise<void>;
}
/**
 * Only joins touching edits if the source and the metadata is the same (e.g. requestUuids must be equal).
*/
export declare class EditSourceData implements IEditData<EditSourceData> {
    readonly editSource: TextModelEditSource;
    readonly source: EditSource;
    readonly key: string;
    constructor(editSource: TextModelEditSource);
    join(data: EditSourceData): EditSourceData | undefined;
    toEditSourceData(): EditKeySourceData;
}
export declare class EditKeySourceData implements IEditData<EditKeySourceData> {
    readonly key: string;
    readonly source: EditSource;
    readonly representative: TextModelEditSource;
    constructor(key: string, source: EditSource, representative: TextModelEditSource);
    join(data: EditKeySourceData): EditKeySourceData | undefined;
}
export declare abstract class EditSourceBase {
    private static _cache;
    static create(reason: TextModelEditSource): EditSource;
    abstract getColor(): string;
}
export type EditSource = InlineSuggestEditSource | ChatEditSource | IdeEditSource | UserEditSource | UnknownEditSource | ExternalEditSource;
export declare class InlineSuggestEditSource extends EditSourceBase {
    readonly kind: 'completion' | 'nes';
    readonly extensionId: string;
    readonly providerId: string;
    readonly type: 'word' | 'line' | undefined;
    readonly category = "ai";
    readonly feature = "inlineSuggest";
    constructor(kind: 'completion' | 'nes', extensionId: string, providerId: string, type: 'word' | 'line' | undefined);
    toString(): string;
    getColor(): string;
}
declare class ChatEditSource extends EditSourceBase {
    readonly kind: 'sidebar' | 'inline';
    readonly category = "ai";
    readonly feature = "chat";
    constructor(kind: 'sidebar' | 'inline');
    toString(): string;
    getColor(): string;
}
declare class IdeEditSource extends EditSourceBase {
    readonly feature: 'suggest' | 'format' | string;
    readonly category = "ide";
    constructor(feature: 'suggest' | 'format' | string);
    toString(): string;
    getColor(): string;
}
declare class UserEditSource extends EditSourceBase {
    readonly category = "user";
    constructor();
    toString(): string;
    getColor(): string;
}
/** Caused by external tools that trigger a reload from disk */
declare class ExternalEditSource extends EditSourceBase {
    readonly category = "external";
    constructor();
    toString(): string;
    getColor(): string;
}
declare class UnknownEditSource extends EditSourceBase {
    readonly category = "unknown";
    constructor();
    toString(): string;
    getColor(): string;
}
export declare class CombineStreamedChanges<TEditData extends (EditKeySourceData | EditSourceData) & IEditData<TEditData>> extends Disposable implements IDocumentWithAnnotatedEdits<TEditData> {
    private readonly _originalDoc;
    private readonly _instantiationService;
    private readonly _value;
    readonly value: IObservableWithChange<StringText, {
        edit: AnnotatedStringEdit<TEditData>;
    }>;
    private readonly _runStore;
    private _runQueue;
    private readonly _diffService;
    constructor(_originalDoc: IDocumentWithAnnotatedEdits<TEditData>, _instantiationService: IInstantiationService);
    _restart(): Promise<void>;
    private _run;
    waitForQueue(): Promise<void>;
}
export declare class DiffService {
    private readonly _editorWorkerService;
    constructor(_editorWorkerService: IEditorWorkerService);
    computeDiff(original: string, modified: string): Promise<StringEdit>;
}
export declare class MinimizeEditsProcessor<TEditData extends IEditData<TEditData>> extends Disposable implements IDocumentWithAnnotatedEdits<TEditData> {
    private readonly _originalDoc;
    readonly value: IObservableWithChange<StringText, {
        edit: AnnotatedStringEdit<TEditData>;
    }>;
    constructor(_originalDoc: IDocumentWithAnnotatedEdits<TEditData>);
    waitForQueue(): Promise<void>;
}
/**
 * Removing the metadata allows touching edits from the same source to merged, even if they were caused by different actions (e.g. two user edits).
 */
export declare function createDocWithJustReason(docWithAnnotatedEdits: IDocumentWithAnnotatedEdits<EditSourceData>, store: DisposableStore): IDocumentWithAnnotatedEdits<EditKeySourceData>;
export {};
