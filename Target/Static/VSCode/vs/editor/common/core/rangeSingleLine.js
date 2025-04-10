/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { ColumnRange } from './columnRange.js';
import { Range } from './range.js';
export class RangeSingleLine {
    static fromRange(range) {
        if (range.endLineNumber !== range.startLineNumber) {
            return undefined;
        }
        return new RangeSingleLine(range.startLineNumber, new ColumnRange(range.startColumn, range.endColumn));
    }
    constructor(
    /** 1-based */
    lineNumber, columnRange) {
        this.lineNumber = lineNumber;
        this.columnRange = columnRange;
    }
    toRange() {
        return new Range(this.lineNumber, this.columnRange.startColumn, this.lineNumber, this.columnRange.endColumnExclusive);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmFuZ2VTaW5nbGVMaW5lLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vRDovRGV2ZWxvcGVyL0FwcGxpY2F0aW9uL0NvZGVFZGl0b3JMYW5kL0xhbmQvRGVwZW5kZW5jeS9NaWNyb3NvZnQvRGVwZW5kZW5jeS9FZGl0b3Ivc3JjLyIsInNvdXJjZXMiOlsidnMvZWRpdG9yL2NvbW1vbi9jb3JlL3JhbmdlU2luZ2xlTGluZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRztBQUVoRyxPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0sa0JBQWtCLENBQUM7QUFDL0MsT0FBTyxFQUFFLEtBQUssRUFBRSxNQUFNLFlBQVksQ0FBQztBQUVuQyxNQUFNLE9BQU8sZUFBZTtJQUNwQixNQUFNLENBQUMsU0FBUyxDQUFDLEtBQVk7UUFDbkMsSUFBSSxLQUFLLENBQUMsYUFBYSxLQUFLLEtBQUssQ0FBQyxlQUFlLEVBQUUsQ0FBQztZQUNuRCxPQUFPLFNBQVMsQ0FBQztRQUNsQixDQUFDO1FBQ0QsT0FBTyxJQUFJLGVBQWUsQ0FBQyxLQUFLLENBQUMsZUFBZSxFQUFFLElBQUksV0FBVyxDQUFDLEtBQUssQ0FBQyxXQUFXLEVBQUUsS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7SUFDeEcsQ0FBQztJQUVEO0lBQ0MsY0FBYztJQUNFLFVBQWtCLEVBQ2xCLFdBQXdCO1FBRHhCLGVBQVUsR0FBVixVQUFVLENBQVE7UUFDbEIsZ0JBQVcsR0FBWCxXQUFXLENBQWE7SUFDckMsQ0FBQztJQUVMLE9BQU87UUFDTixPQUFPLElBQUksS0FBSyxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxXQUFXLEVBQUUsSUFBSSxDQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMsV0FBVyxDQUFDLGtCQUFrQixDQUFDLENBQUM7SUFDdkgsQ0FBQztDQUNEIn0=