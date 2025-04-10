/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { BugIndicatingError } from '../../../base/common/errors.js';
import { OffsetRange } from './offsetRange.js';
import { Range } from './range.js';
/**
 * Represents a 1-based range of columns.
 * Use {@lik OffsetRange} to represent a 0-based range.
*/
export class ColumnRange {
    static fromOffsetRange(offsetRange) {
        return new ColumnRange(offsetRange.start + 1, offsetRange.endExclusive + 1);
    }
    constructor(
    /** 1-based */
    startColumn, endColumnExclusive) {
        this.startColumn = startColumn;
        this.endColumnExclusive = endColumnExclusive;
        if (startColumn > endColumnExclusive) {
            throw new BugIndicatingError(`startColumn ${startColumn} cannot be after endColumnExclusive ${endColumnExclusive}`);
        }
    }
    toRange(lineNumber) {
        return new Range(lineNumber, this.startColumn, lineNumber, this.endColumnExclusive);
    }
    equals(other) {
        return this.startColumn === other.startColumn
            && this.endColumnExclusive === other.endColumnExclusive;
    }
    toZeroBasedOffsetRange() {
        return new OffsetRange(this.startColumn - 1, this.endColumnExclusive - 1);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29sdW1uUmFuZ2UuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9EOi9EZXZlbG9wZXIvQXBwbGljYXRpb24vQ29kZUVkaXRvckxhbmQvTGFuZC9EZXBlbmRlbmN5L01pY3Jvc29mdC9EZXBlbmRlbmN5L0VkaXRvci9zcmMvIiwic291cmNlcyI6WyJ2cy9lZGl0b3IvY29tbW9uL2NvcmUvY29sdW1uUmFuZ2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7QUFFaEcsT0FBTyxFQUFFLGtCQUFrQixFQUFFLE1BQU0sZ0NBQWdDLENBQUM7QUFDcEUsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLGtCQUFrQixDQUFDO0FBQy9DLE9BQU8sRUFBRSxLQUFLLEVBQUUsTUFBTSxZQUFZLENBQUM7QUFFbkM7OztFQUdFO0FBQ0YsTUFBTSxPQUFPLFdBQVc7SUFDaEIsTUFBTSxDQUFDLGVBQWUsQ0FBQyxXQUF3QjtRQUNyRCxPQUFPLElBQUksV0FBVyxDQUFDLFdBQVcsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxFQUFFLFdBQVcsQ0FBQyxZQUFZLEdBQUcsQ0FBQyxDQUFDLENBQUM7SUFDN0UsQ0FBQztJQUVEO0lBQ0MsY0FBYztJQUNFLFdBQW1CLEVBQ25CLGtCQUEwQjtRQUQxQixnQkFBVyxHQUFYLFdBQVcsQ0FBUTtRQUNuQix1QkFBa0IsR0FBbEIsa0JBQWtCLENBQVE7UUFFMUMsSUFBSSxXQUFXLEdBQUcsa0JBQWtCLEVBQUUsQ0FBQztZQUN0QyxNQUFNLElBQUksa0JBQWtCLENBQUMsZUFBZSxXQUFXLHVDQUF1QyxrQkFBa0IsRUFBRSxDQUFDLENBQUM7UUFDckgsQ0FBQztJQUNGLENBQUM7SUFFRCxPQUFPLENBQUMsVUFBa0I7UUFDekIsT0FBTyxJQUFJLEtBQUssQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLFdBQVcsRUFBRSxVQUFVLEVBQUUsSUFBSSxDQUFDLGtCQUFrQixDQUFDLENBQUM7SUFDckYsQ0FBQztJQUVELE1BQU0sQ0FBQyxLQUFrQjtRQUN4QixPQUFPLElBQUksQ0FBQyxXQUFXLEtBQUssS0FBSyxDQUFDLFdBQVc7ZUFDekMsSUFBSSxDQUFDLGtCQUFrQixLQUFLLEtBQUssQ0FBQyxrQkFBa0IsQ0FBQztJQUMxRCxDQUFDO0lBRUQsc0JBQXNCO1FBQ3JCLE9BQU8sSUFBSSxXQUFXLENBQUMsSUFBSSxDQUFDLFdBQVcsR0FBRyxDQUFDLEVBQUUsSUFBSSxDQUFDLGtCQUFrQixHQUFHLENBQUMsQ0FBQyxDQUFDO0lBQzNFLENBQUM7Q0FDRCJ9