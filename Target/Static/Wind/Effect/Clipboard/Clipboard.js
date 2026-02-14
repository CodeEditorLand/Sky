import { ClipboardServiceTag, Clipboard } from "./Tag/ClipboardServiceTag.js";
import { LiveBrowserClipboardService } from "./Implementation/BrowserClipboard.js";
import { MockClipboardService } from "./Implementation/MockClipboard.js";
import {
  CreateNotAvailableError,
  CreateReadError,
  CreateWriteError,
  CreatePermissionDeniedError,
  CreateFormatNotSupportedError,
  CreateSizeExceededError
} from "./Implementation/ClipboardHelper.js";
import { default as default2 } from "./Live.js";
import { default as default3 } from "./Mock.js";
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
  default2 as LiveClipboardServiceLayer,
  MockClipboardService,
  default3 as MockClipboardServiceLayer
};
//# sourceMappingURL=Clipboard.js.map
