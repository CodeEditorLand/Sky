/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { strictEquals } from '../equals.js';
import { BugIndicatingError } from '../errors.js';
import { subtransaction } from './base.js';
import { DebugNameData } from './debugName.js';
import { DerivedWithSetter } from './derived.js';
/**
 * Creates an observable value that is based on values and changes from other observables.
 * Additionally, a reducer can report how that state changed.
*/
export function observableReducer(owner, options) {
    return observableReducerSettable(owner, options);
}
/**
 * Creates an observable value that is based on values and changes from other observables.
 * Additionally, a reducer can report how that state changed.
*/
export function observableReducerSettable(owner, options) {
    let prevValue = undefined;
    let hasValue = false;
    const d = new DerivedWithSetter(new DebugNameData(owner, undefined, options.update), (reader, changeSummary) => {
        if (!hasValue) {
            prevValue = options.initial instanceof Function ? options.initial() : options.initial;
            hasValue = true;
        }
        const newValue = options.update(reader, prevValue, changeSummary);
        prevValue = newValue;
        return newValue;
    }, options.changeTracker, () => {
        if (hasValue) {
            options.disposeFinal?.(prevValue);
            hasValue = false;
        }
    }, options.equalityComparer ?? strictEquals, (value, tx, change) => {
        if (!hasValue) {
            throw new BugIndicatingError('Can only set when there is a listener! This is to prevent leaks.');
        }
        subtransaction(tx, tx => {
            prevValue = value;
            d.setValue(value, tx, change);
        });
    });
    return d;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVkdWNlci5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL0Q6L0RldmVsb3Blci9BcHBsaWNhdGlvbi9Db2RlRWRpdG9yTGFuZC9MYW5kL0RlcGVuZGVuY3kvTWljcm9zb2Z0L0RlcGVuZGVuY3kvRWRpdG9yL3NyYy8iLCJzb3VyY2VzIjpbInZzL2Jhc2UvY29tbW9uL29ic2VydmFibGVJbnRlcm5hbC9yZWR1Y2VyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHO0FBRWhHLE9BQU8sRUFBb0IsWUFBWSxFQUFFLE1BQU0sY0FBYyxDQUFDO0FBQzlELE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxNQUFNLGNBQWMsQ0FBQztBQUNsRCxPQUFPLEVBQTJELGNBQWMsRUFBRSxNQUFNLFdBQVcsQ0FBQztBQUVwRyxPQUFPLEVBQUUsYUFBYSxFQUFjLE1BQU0sZ0JBQWdCLENBQUM7QUFDM0QsT0FBTyxFQUFFLGlCQUFpQixFQUFrQixNQUFNLGNBQWMsQ0FBQztBQW9CakU7OztFQUdFO0FBQ0YsTUFBTSxVQUFVLGlCQUFpQixDQUFtQyxLQUFpQixFQUFFLE9BQW1EO0lBQ3pJLE9BQU8seUJBQXlCLENBQTRCLEtBQUssRUFBRSxPQUFPLENBQVEsQ0FBQztBQUNwRixDQUFDO0FBRUQ7OztFQUdFO0FBQ0YsTUFBTSxVQUFVLHlCQUF5QixDQUFtQyxLQUFpQixFQUFFLE9BQW1EO0lBQ2pKLElBQUksU0FBUyxHQUFrQixTQUFTLENBQUM7SUFDekMsSUFBSSxRQUFRLEdBQUcsS0FBSyxDQUFDO0lBRXJCLE1BQU0sQ0FBQyxHQUFHLElBQUksaUJBQWlCLENBQzlCLElBQUksYUFBYSxDQUFDLEtBQUssRUFBRSxTQUFTLEVBQUUsT0FBTyxDQUFDLE1BQU0sQ0FBQyxFQUNuRCxDQUFDLE1BQWtDLEVBQUUsYUFBYSxFQUFFLEVBQUU7UUFDckQsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO1lBQ2YsU0FBUyxHQUFHLE9BQU8sQ0FBQyxPQUFPLFlBQVksUUFBUSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUM7WUFDdEYsUUFBUSxHQUFHLElBQUksQ0FBQztRQUNqQixDQUFDO1FBQ0QsTUFBTSxRQUFRLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUUsU0FBVSxFQUFFLGFBQWEsQ0FBQyxDQUFDO1FBQ25FLFNBQVMsR0FBRyxRQUFRLENBQUM7UUFDckIsT0FBTyxRQUFRLENBQUM7SUFDakIsQ0FBQyxFQUNELE9BQU8sQ0FBQyxhQUFhLEVBQ3JCLEdBQUcsRUFBRTtRQUNKLElBQUksUUFBUSxFQUFFLENBQUM7WUFDZCxPQUFPLENBQUMsWUFBWSxFQUFFLENBQUMsU0FBVSxDQUFDLENBQUM7WUFDbkMsUUFBUSxHQUFHLEtBQUssQ0FBQztRQUNsQixDQUFDO0lBQ0YsQ0FBQyxFQUNELE9BQU8sQ0FBQyxnQkFBZ0IsSUFBSSxZQUFZLEVBQ3hDLENBQUMsS0FBSyxFQUFFLEVBQUUsRUFBRSxNQUFNLEVBQUUsRUFBRTtRQUNyQixJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7WUFDZixNQUFNLElBQUksa0JBQWtCLENBQUMsa0VBQWtFLENBQUMsQ0FBQztRQUNsRyxDQUFDO1FBQ0QsY0FBYyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRTtZQUN2QixTQUFTLEdBQUcsS0FBSyxDQUFDO1lBQ2xCLENBQUMsQ0FBQyxRQUFRLENBQUMsS0FBSyxFQUFFLEVBQUUsRUFBRSxNQUFNLENBQUMsQ0FBQztRQUMvQixDQUFDLENBQUMsQ0FBQztJQUNKLENBQUMsQ0FDRCxDQUFDO0lBRUYsT0FBTyxDQUFDLENBQUM7QUFDVixDQUFDIn0=