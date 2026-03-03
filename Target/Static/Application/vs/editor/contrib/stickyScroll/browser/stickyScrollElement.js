var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
class StickyRange {
  static {
    __name(this, "StickyRange");
  }
  constructor(startLineNumber, endLineNumber) {
    this.startLineNumber = startLineNumber;
    this.endLineNumber = endLineNumber;
  }
}
class StickyElement {
  static {
    __name(this, "StickyElement");
  }
  constructor(range, children, parent) {
    this.range = range;
    this.children = children;
    this.parent = parent;
  }
}
class StickyModel {
  static {
    __name(this, "StickyModel");
  }
  constructor(uri, version, element, outlineProviderId) {
    this.uri = uri;
    this.version = version;
    this.element = element;
    this.outlineProviderId = outlineProviderId;
  }
}
export {
  StickyElement,
  StickyModel,
  StickyRange
};
//# sourceMappingURL=stickyScrollElement.js.map
