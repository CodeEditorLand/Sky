import { DisposableStore, MutableDisposable, type IDisposable } from '../../../../../../base/common/lifecycle.js';
import type { IMarker as IXtermMarker } from '@xterm/xterm';
/**
 * Sets up a recreating start marker which is resilient to prompts that clear/re-render (eg. transient
 * or powerlevel10k style prompts). The marker is recreated at the cursor position whenever the
 * existing marker is disposed. The caller is responsible for adding the startMarker to the store.
 */
export declare function setupRecreatingStartMarker(xterm: {
    raw: {
        registerMarker(): IXtermMarker | undefined;
    };
}, startMarker: MutableDisposable<IXtermMarker>, fire: (marker: IXtermMarker | undefined) => void, store: DisposableStore, log?: (message: string) => void): void;
export declare function createAltBufferPromise(xterm: {
    raw: {
        buffer: {
            active: unknown;
            alternate: unknown;
            onBufferChange: (callback: () => void) => IDisposable;
        };
    };
}, store: DisposableStore, log?: (message: string) => void): Promise<void>;
