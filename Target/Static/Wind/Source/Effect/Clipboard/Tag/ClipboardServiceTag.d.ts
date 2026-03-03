/**
 * @module Effect/Clipboard/Tag/ClipboardServiceTag
 * @description
 * Service tag for dependency injection of the Clipboard service.
 * @see {@link Effect/Clipboard/Interface/ClipboardService} Service interface
 * @see {@link Effect/Clipboard/Implementation/ClipboardImplementation} Implementation
 * @category Tag
 */
import { Context } from "effect";
import type { ClipboardService } from "../Interface/ClipboardService.js";
declare const ClipboardServiceTag_base: Context.TagClass<ClipboardServiceTag, "Application/ClipboardService", ClipboardService>;
/**
 * Clipboard service tag for dependency injection
 */
export declare class ClipboardServiceTag extends ClipboardServiceTag_base {
}
/**
 * Alias for the Clipboard service tag
 */
export declare const Clipboard: typeof ClipboardServiceTag;
export default ClipboardServiceTag;
//# sourceMappingURL=ClipboardServiceTag.d.ts.map