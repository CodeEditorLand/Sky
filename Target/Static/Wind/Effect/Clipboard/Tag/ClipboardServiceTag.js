var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Context } from "effect";
class ClipboardServiceTag extends Context.Tag(
  "Application/ClipboardService"
)() {
  static {
    __name(this, "ClipboardServiceTag");
  }
}
const Clipboard = ClipboardServiceTag;
var ClipboardServiceTag_default = ClipboardServiceTag;
export {
  Clipboard,
  ClipboardServiceTag,
  ClipboardServiceTag_default as default
};
//# sourceMappingURL=ClipboardServiceTag.js.map
