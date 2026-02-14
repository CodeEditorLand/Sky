import { Layer } from "effect";
import { ClipboardServiceTag } from "./Tag/ClipboardServiceTag.js";
import { MockClipboardService } from "./Implementation/MockClipboard.js";
const MockClipboardServiceLayer = Layer.succeed(
  ClipboardServiceTag,
  MockClipboardService
);
var Mock_default = MockClipboardServiceLayer;
export {
  MockClipboardServiceLayer,
  Mock_default as default
};
//# sourceMappingURL=Mock.js.map
