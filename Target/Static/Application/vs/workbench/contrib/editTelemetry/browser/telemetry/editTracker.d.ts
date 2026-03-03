import { Disposable } from '../../../../../base/common/lifecycle.js';
import { IReader } from '../../../../../base/common/observable.js';
import { OffsetRange } from '../../../../../editor/common/core/ranges/offsetRange.js';
import { TextModelEditSource } from '../../../../../editor/common/textModelEditSource.js';
import { IDocumentWithAnnotatedEdits, EditSource } from '../helpers/documentWithAnnotatedEdits.js';
/**
 * Tracks a single document.
*/
export declare class DocumentEditSourceTracker<T = void> extends Disposable {
    private readonly _doc;
    readonly data: T;
    private _edits;
    private _pendingExternalEdits;
    private readonly _update;
    private readonly _representativePerKey;
    private readonly _sumAddedCharactersPerKey;
    constructor(_doc: IDocumentWithAnnotatedEdits, data: T);
    private _applyEdit;
    waitForQueue(): Promise<void>;
    getTotalInsertedCharactersCount(key: string): number;
    getAllKeys(): string[];
    getRepresentative(key: string): TextModelEditSource | undefined;
    getTrackedRanges(reader?: IReader): TrackedEdit[];
    isEmpty(): boolean;
    _getDebugVisualization(): {
        value: string;
        decorations: {
            range: number[];
            color: string;
        }[];
        $fileExtension: string;
    };
}
export declare class TrackedEdit {
    readonly originalRange: OffsetRange;
    readonly range: OffsetRange;
    readonly sourceKey: string;
    readonly source: EditSource;
    readonly sourceRepresentative: TextModelEditSource;
    constructor(originalRange: OffsetRange, range: OffsetRange, sourceKey: string, source: EditSource, sourceRepresentative: TextModelEditSource);
}
