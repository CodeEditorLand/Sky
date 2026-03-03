/**
 * @module Effect/Clipboard/Live
 * @description
 * Live layer for the Clipboard service using the browser's Clipboard API.
 * @see {@link Effect/Clipboard/Implementation/BrowserClipboard} Implementation
 * @category Layer
 */
import { Layer } from "effect";
import { ClipboardServiceTag } from "./Tag/ClipboardServiceTag.js";
/**
 * Live clipboard service layer
 * Uses the browser's Clipboard API
 */
export declare const LiveClipboardServiceLayer: Layer.Layer<ClipboardServiceTag, never, never>;
export default LiveClipboardServiceLayer;
//# sourceMappingURL=Live.d.ts.map