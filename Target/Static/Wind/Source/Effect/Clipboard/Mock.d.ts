/**
 * @module Effect/Clipboard/Mock
 * @description
 * Mock layer for the Clipboard service for testing purposes.
 * Uses in-memory clipboard state without accessing the system clipboard.
 * @see {@link Effect/Clipboard/Implementation/MockClipboard} Implementation
 * @category Layer
 */
import { Layer } from "effect";
import { ClipboardServiceTag } from "./Tag/ClipboardServiceTag.js";
/**
 * Mock clipboard service layer for testing
 */
export declare const MockClipboardServiceLayer: Layer.Layer<ClipboardServiceTag, never, never>;
export default MockClipboardServiceLayer;
//# sourceMappingURL=Mock.d.ts.map