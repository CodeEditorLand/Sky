var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { URI } from "../../../../base/common/uri.js";
class StickyRange {
  constructor(startLineNumber, endLineNumber) {
    this.startLineNumber = startLineNumber;
    this.endLineNumber = endLineNumber;
  }
  static {
    __name(this, "StickyRange");
  }
}
class StickyElement {
  constructor(range, children, parent) {
    this.range = range;
    this.children = children;
    this.parent = parent;
  }
  static {
    __name(this, "StickyElement");
  }
}
class StickyModel {
  constructor(uri, version, element, outlineProviderId) {
    this.uri = uri;
    this.version = version;
    this.element = element;
    this.outlineProviderId = outlineProviderId;
  }
  static {
    __name(this, "StickyModel");
  }
}
export {
  StickyElement,
  StickyModel,
  StickyRange
};
//# sourceMappingURL=stickyScrollElement.js.map
