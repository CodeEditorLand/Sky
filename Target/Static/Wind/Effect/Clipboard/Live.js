import { Layer } from "effect";
import { ClipboardServiceTag } from "./Tag/ClipboardServiceTag.js";
import { LiveBrowserClipboardService } from "./Implementation/BrowserClipboard.js";
const LiveClipboardServiceLayer = Layer.succeed(
  ClipboardServiceTag,
  LiveBrowserClipboardService
);
var Live_default = LiveClipboardServiceLayer;
export {
  LiveClipboardServiceLayer,
  Live_default as default
};
//# sourceMappingURL=Live.js.map
