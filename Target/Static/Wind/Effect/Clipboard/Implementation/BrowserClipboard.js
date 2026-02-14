var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Effect } from "effect";
import {
  CreateNotAvailableError,
  CreateReadError,
  CreateWriteError,
  CreateFormatNotSupportedError
} from "./ClipboardHelper.js";
const LiveBrowserClipboardService = {
  readText: /* @__PURE__ */ __name(() => Effect.tryPromise({
    try: /* @__PURE__ */ __name(async () => {
      if (typeof navigator === "undefined" || !navigator.clipboard) {
        throw CreateNotAvailableError("Clipboard API not available in this environment");
      }
      return await navigator.clipboard.readText();
    }, "try"),
    catch: /* @__PURE__ */ __name((error) => CreateReadError(error), "catch")
  }), "readText"),
  writeText: /* @__PURE__ */ __name((text) => Effect.tryPromise({
    try: /* @__PURE__ */ __name(async () => {
      if (typeof navigator === "undefined" || !navigator.clipboard) {
        throw CreateNotAvailableError("Clipboard API not available in this environment");
      }
      await navigator.clipboard.writeText(text);
    }, "try"),
    catch: /* @__PURE__ */ __name((error) => CreateWriteError(error), "catch")
  }), "writeText"),
  // Placeholder implementations for remaining methods
  readHTML: /* @__PURE__ */ __name(() => Effect.fail(CreateFormatNotSupportedError("HTML")), "readHTML"),
  writeHTML: /* @__PURE__ */ __name(() => Effect.fail(CreateFormatNotSupportedError("HTML")), "writeHTML"),
  readImage: /* @__PURE__ */ __name(() => Effect.fail(CreateFormatNotSupportedError("Image")), "readImage"),
  writeImage: /* @__PURE__ */ __name(() => Effect.fail(CreateFormatNotSupportedError("Image")), "writeImage"),
  hasText: /* @__PURE__ */ __name(() => Effect.succeed(false), "hasText"),
  clear: /* @__PURE__ */ __name(() => Effect.void, "clear")
};
var BrowserClipboard_default = LiveBrowserClipboardService;
export {
  LiveBrowserClipboardService,
  BrowserClipboard_default as default
};
//# sourceMappingURL=BrowserClipboard.js.map
