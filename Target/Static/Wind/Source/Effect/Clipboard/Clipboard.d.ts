/**
 * @module Effect/Clipboard
 * @description
 * Clipboard service implementation for Wind project.
 * Provides read/write operations for clipboard functionality with typed effects.
 *
 * @see {@link Effect/Clipboard/Interface/ClipboardService} Service interface
 * @see {@link Effect/Clipboard/Implementation/BrowserClipboard} Live implementation
 * @see {@link Effect/Clipboard/Tag/ClipboardServiceTag} Service tag
 * @category Service
 * @example
 * ```typescript
 * import LiveClipboard from "./Effect/Clipboard/Live.js";
 * import { Clipboard } from "./Effect/Clipboard/Clipboard.ts";
 * import { Effect } from "effect";
 *
 * const program = Effect.gen(function* () {
 *   const clipboard = yield* Clipboard;
 *   yield* clipboard.writeText("Hello, World!");
 *   const text = yield* clipboard.readText();
 *   return text;
 * });
 *
 * Effect.runPromise(program.pipe(Effect.provide(LiveClipboard)));
 * ```
 */
export type { ClipboardProblem } from "./Type/ClipboardProblem.js";
export type { ClipboardService } from "./Interface/ClipboardService.js";
export { ClipboardServiceTag, Clipboard } from "./Tag/ClipboardServiceTag.js";
export { LiveBrowserClipboardService } from "./Implementation/BrowserClipboard.js";
export { MockClipboardService } from "./Implementation/MockClipboard.js";
export { CreateNotAvailableError, CreateReadError, CreateWriteError, CreatePermissionDeniedError, CreateFormatNotSupportedError, CreateSizeExceededError, } from "./Implementation/ClipboardHelper.js";
export { default as LiveClipboardServiceLayer } from "./Live.js";
export { default as MockClipboardServiceLayer } from "./Mock.js";
//# sourceMappingURL=Clipboard.d.ts.map