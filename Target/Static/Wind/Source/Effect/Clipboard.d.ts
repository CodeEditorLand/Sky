/**
 * @module Application/Clipboard
 * @description
 * Clipboard service implementation for Wind project.
 * Provides read/write operations for clipboard functionality.
 *
 * ARCHITECTURE OVERVIEW:
 * This module provides a comprehensive clipboard service that abstracts the browser's
 * Clipboard API and integrates with Tauri's native clipboard capabilities when available.
 * The service follows Effect-TS patterns for type-safe, composable operations.
 *
 * RESPONSIBILITIES:
 * - Read text from clipboard with permission handling
 * - Write text to clipboard with error recovery
 * - Graceful degradation when clipboard API is unavailable
 * - Integration with Tauri's native clipboard for desktop applications
 * - Comprehensive error handling and categorization
 * - Performance monitoring for clipboard operations
 * - Clipboard history tracking (optional feature)
 *
 * CONNECTIONS:
 * - Tauri: Native clipboard integration via @tauri-apps/plugin-clipboard-manager
 * - Sky: UI integration for clipboard operations
 * - Cocoon: Extension host clipboard access
 *
 * Microsoft VSCode Source References:
 * - vs/platform/clipboard/common/clipboardService.ts - IClipboardService interface
 * - vs/platform/clipboard/common/clipboardService.ts - Clipboard operations
 * - vs/platform/clipboard/browser/clipboardService.ts - Web clipboard implementation
 *
 * @see {@link Effect/Clipboard/Interface/ClipboardService} Service interface
 * @see {@link Effect/Clipboard/Live} Live implementation
 * @see {@link Effect/Clipboard/Tag/ClipboardServiceTag} Service tag
 * @category Service
 * @example
 * ```typescript
 * import Clipboard from "./Effect/Clipboard.js";
 * import { Effect } from "effect";
 *
 * const program = Effect.gen(function* () {
 *   const clipboardService = yield* Clipboard.ClipboardServiceTag;
 *   yield* clipboardService.writeText("Hello, World!");
 *   const text = yield* clipboardService.readText();
 *   return text;
 * });
 *
 * Effect.runPromise(program.pipe(Effect.provide(Clipboard)));
 * ```
 */
export type { ClipboardProblem } from "./Clipboard/Type/ClipboardProblem.js";
export type { ClipboardService } from "./Clipboard/Interface/ClipboardService.js";
export { ClipboardServiceTag, Clipboard } from "./Clipboard/Tag/ClipboardServiceTag.js";
export { LiveBrowserClipboardService } from "./Clipboard/Implementation/BrowserClipboard.js";
export { MockClipboardService } from "./Clipboard/Implementation/MockClipboard.js";
import { LiveClipboardServiceLayer as LiveLayer } from "./Clipboard/Live.js";
import { MockClipboardServiceLayer as MockLayer } from "./Clipboard/Mock.js";
export { LiveLayer, MockLayer };
export declare const LiveClipboardServiceLayer: import("effect/Layer").Layer<import("./Clipboard.js").ClipboardServiceTag, never, never>;
export declare const MockClipboardServiceLayer: import("effect/Layer").Layer<import("./Clipboard.js").ClipboardServiceTag, never, never>;
export declare const LiveClipboard: import("effect/Layer").Layer<import("./Clipboard.js").ClipboardServiceTag, never, never>;
export declare const MockClipboard: import("effect/Layer").Layer<import("./Clipboard.js").ClipboardServiceTag, never, never>;
export { CreateNotAvailableError, CreateReadError, CreateWriteError, CreatePermissionDeniedError, CreateFormatNotSupportedError, CreateSizeExceededError, } from "./Clipboard/Implementation/ClipboardHelper.js";
//# sourceMappingURL=Clipboard.d.ts.map