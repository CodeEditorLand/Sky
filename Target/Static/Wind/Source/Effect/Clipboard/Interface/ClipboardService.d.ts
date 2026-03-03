/**
 * @module Effect/Clipboard/Interface/ClipboardService
 * @description
 * Service interface for clipboard operations. Provides read/write operations
 * for clipboard functionality with comprehensive error handling.
 * @see {@link Effect/Clipboard/Implementation/ClipboardImplementation} Implementation
 * @see {@link Effect/Clipboard/Tag/ClipboardServiceTag} Service tag
 * @category Interface
 */
import { Effect } from "effect";
import type { ClipboardProblem } from "../Type/ClipboardProblem.js";
/**
 * Clipboard service interface
 * Microsoft VSCode Reference: IClipboardService from vs/platform/clipboard/common/clipboardService.ts
 */
export interface ClipboardService {
    readonly readText: () => Effect.Effect<string, ClipboardProblem>;
    readonly writeText: (text: string) => Effect.Effect<void, ClipboardProblem>;
    readonly readHTML: () => Effect.Effect<string, ClipboardProblem>;
    readonly writeHTML: (html: string, text: string) => Effect.Effect<void, ClipboardProblem>;
    readonly readImage: () => Effect.Effect<Blob, ClipboardProblem>;
    readonly writeImage: (blob: Blob) => Effect.Effect<void, ClipboardProblem>;
    readonly hasText: () => Effect.Effect<boolean, ClipboardProblem>;
    readonly clear: () => Effect.Effect<void, ClipboardProblem>;
}
//# sourceMappingURL=ClipboardService.d.ts.map