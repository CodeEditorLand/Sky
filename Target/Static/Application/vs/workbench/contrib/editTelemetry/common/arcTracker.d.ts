import { BaseStringEdit, IEditData } from '../../../../editor/common/core/edits/stringEdit.js';
import { AbstractText } from '../../../../editor/common/core/text/abstractText.js';
/**
 * The ARC (accepted and retained characters) counts how many characters inserted by the initial suggestion (trackedEdit)
 * stay unmodified after a certain amount of time after acceptance.
*/
export declare class ArcTracker {
    private readonly _valueBeforeTrackedEdit;
    private _updatedTrackedEdit;
    private _trackedEdit;
    constructor(_valueBeforeTrackedEdit: AbstractText, trackedEdit: BaseStringEdit);
    getOriginalCharacterCount(): number;
    /**
     * edit must apply to _updatedTrackedEdit.apply(_valueBeforeTrackedEdit)
    */
    handleEdits(edit: BaseStringEdit): void;
    getAcceptedRestrainedCharactersCount(): number;
    getDebugState(): unknown;
    getLineCountInfo(): {
        deletedLineCounts: number;
        insertedLineCounts: number;
    };
    getValues(): unknown;
}
export declare class IsTrackedEditData implements IEditData<IsTrackedEditData> {
    readonly isTrackedEdit: boolean;
    constructor(isTrackedEdit: boolean);
    join(data: IsTrackedEditData): IsTrackedEditData | undefined;
}
