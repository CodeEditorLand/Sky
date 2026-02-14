import { ClipboardServiceTag, Clipboard } from "./Clipboard/Tag/ClipboardServiceTag.js";
import { LiveBrowserClipboardService } from "./Clipboard/Implementation/BrowserClipboard.js";
import { MockClipboardService } from "./Clipboard/Implementation/MockClipboard.js";
import { LiveClipboardServiceLayer as LiveLayer } from "./Clipboard/Live.js";
import { MockClipboardServiceLayer as MockLayer } from "./Clipboard/Mock.js";
const LiveClipboardServiceLayer = LiveLayer;
const MockClipboardServiceLayer = MockLayer;
const LiveClipboard = LiveLayer;
const MockClipboard = MockLayer;
import {
  CreateNotAvailableError,
  CreateReadError,
  CreateWriteError,
  CreatePermissionDeniedError,
  CreateFormatNotSupportedError,
  CreateSizeExceededError
} from "./Clipboard/Implementation/ClipboardHelper.js";
export {
  Clipboard,
  ClipboardServiceTag,
  CreateFormatNotSupportedError,
  CreateNotAvailableError,
  CreatePermissionDeniedError,
  CreateReadError,
  CreateSizeExceededError,
  CreateWriteError,
  LiveBrowserClipboardService,
  LiveClipboard,
  LiveClipboardServiceLayer,
  LiveLayer,
  MockClipboard,
  MockClipboardService,
  MockClipboardServiceLayer,
  MockLayer
};
//# sourceMappingURL=Clipboard.js.map
