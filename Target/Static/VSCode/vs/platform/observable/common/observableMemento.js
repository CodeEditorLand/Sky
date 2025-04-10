/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { strictEquals } from '../../../base/common/equals.js';
import { DisposableStore } from '../../../base/common/lifecycle.js';
// eslint-disable-next-line local/code-no-deep-import-of-internal
import { ObservableValue } from '../../../base/common/observableInternal/base.js';
// eslint-disable-next-line local/code-no-deep-import-of-internal
import { DebugNameData } from '../../../base/common/observableInternal/debugName.js';
import { IStorageService } from '../../storage/common/storage.js';
/**
 * Defines an observable memento. Returns a function that can be called with
 * the specific storage scope, target, and service to use in a class.
 *
 * Note that the returned Observable is a disposable, because it interacts
 * with storage service events, and must be tracked appropriately.
 */
export function observableMemento(opts) {
    return (scope, target, storageService) => {
        return new ObservableMemento(opts, scope, target, storageService);
    };
}
/**
 * A value that is stored, and is also observable. Note: T should be readonly.
 */
let ObservableMemento = class ObservableMemento extends ObservableValue {
    constructor(opts, storageScope, storageTarget, storageService) {
        if (opts.defaultValue && typeof opts.defaultValue === 'object') {
            opts.toStorage ??= (value) => JSON.stringify(value);
            opts.fromStorage ??= (value) => JSON.parse(value);
        }
        let initialValue = opts.defaultValue;
        const fromStorage = storageService.get(opts.key, storageScope);
        if (fromStorage !== undefined) {
            if (opts.fromStorage) {
                try {
                    initialValue = opts.fromStorage(fromStorage);
                }
                catch {
                    initialValue = opts.defaultValue;
                }
            }
        }
        super(new DebugNameData(undefined, `storage/${opts.key}`, undefined), initialValue, strictEquals);
        this._store = new DisposableStore();
        this._didChange = false;
        const didChange = storageService.onDidChangeValue(storageScope, opts.key, this._store);
        // only take external changes if there aren't local changes we've made
        this._store.add(didChange((e) => {
            if (e.external && e.key === opts.key && !this._didChange) {
                this.set(opts.defaultValue, undefined);
            }
        }));
        this._store.add(storageService.onWillSaveState(() => {
            if (this._didChange) {
                this._didChange = false;
                const value = this.get();
                if (opts.toStorage) {
                    storageService.store(opts.key, opts.toStorage(value), storageScope, storageTarget);
                }
                else {
                    storageService.store(opts.key, String(value), storageScope, storageTarget);
                }
            }
        }));
    }
    _setValue(newValue) {
        super._setValue(newValue);
        this._didChange = true;
    }
    dispose() {
        this._store.dispose();
    }
};
ObservableMemento = __decorate([
    __param(3, IStorageService)
], ObservableMemento);
export { ObservableMemento };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib2JzZXJ2YWJsZU1lbWVudG8uanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9EOi9EZXZlbG9wZXIvQXBwbGljYXRpb24vQ29kZUVkaXRvckxhbmQvTGFuZC9EZXBlbmRlbmN5L01pY3Jvc29mdC9EZXBlbmRlbmN5L0VkaXRvci9zcmMvIiwic291cmNlcyI6WyJ2cy9wbGF0Zm9ybS9vYnNlcnZhYmxlL2NvbW1vbi9vYnNlcnZhYmxlTWVtZW50by50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7OztBQUVoRyxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sZ0NBQWdDLENBQUM7QUFDOUQsT0FBTyxFQUFFLGVBQWUsRUFBZSxNQUFNLG1DQUFtQyxDQUFDO0FBQ2pGLGlFQUFpRTtBQUNqRSxPQUFPLEVBQUUsZUFBZSxFQUFFLE1BQU0saURBQWlELENBQUM7QUFDbEYsaUVBQWlFO0FBQ2pFLE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSxzREFBc0QsQ0FBQztBQUNyRixPQUFPLEVBQUUsZUFBZSxFQUErQixNQUFNLGlDQUFpQyxDQUFDO0FBVS9GOzs7Ozs7R0FNRztBQUNILE1BQU0sVUFBVSxpQkFBaUIsQ0FBSSxJQUErQjtJQUNuRSxPQUFPLENBQUMsS0FBbUIsRUFBRSxNQUFxQixFQUFFLGNBQStCLEVBQXdCLEVBQUU7UUFDNUcsT0FBTyxJQUFJLGlCQUFpQixDQUFJLElBQUksRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLGNBQWMsQ0FBQyxDQUFDO0lBQ3RFLENBQUMsQ0FBQztBQUNILENBQUM7QUFFRDs7R0FFRztBQUNJLElBQU0saUJBQWlCLEdBQXZCLE1BQU0saUJBQXFCLFNBQVEsZUFBa0I7SUFJM0QsWUFDQyxJQUErQixFQUMvQixZQUEwQixFQUMxQixhQUE0QixFQUNYLGNBQStCO1FBRWhELElBQUksSUFBSSxDQUFDLFlBQVksSUFBSSxPQUFPLElBQUksQ0FBQyxZQUFZLEtBQUssUUFBUSxFQUFFLENBQUM7WUFDaEUsSUFB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