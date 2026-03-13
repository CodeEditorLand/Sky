import { Lazy } from '../../../../../../base/common/lazy.js';
import { DisposableStore } from '../../../../../../base/common/lifecycle.js';
/**
 * Finds all tables in `domNode` and wraps each in a {@link DomScrollableElement}
 * so they scroll horizontally with the custom VS Code scrollbar instead of the
 * native one. Each wrapped table is pushed onto `orderedDisposablesList` and a
 * `scanDomNode` callback is registered on `layoutParticipants` so the scrollbar
 * re-measures whenever the container is resized.
 *
 * Each column's `min-width` is also set to the maximum character count across
 * all cells in that column (in `ch` units), preventing short-content columns
 * like "001" from being squeezed to one character wide. Single-character columns
 * are left unchanged. This is layout-free: only `textContent` lengths are read.
 */
export declare function wrapTablesWithScrollable(domNode: HTMLElement, layoutParticipants: Lazy<Set<() => void>>): DisposableStore;
