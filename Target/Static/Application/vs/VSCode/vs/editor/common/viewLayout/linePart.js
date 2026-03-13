var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var LinePartMetadata;
(function(LinePartMetadata2) {
  LinePartMetadata2[LinePartMetadata2["IS_WHITESPACE"] = 1] = "IS_WHITESPACE";
  LinePartMetadata2[LinePartMetadata2["PSEUDO_BEFORE"] = 2] = "PSEUDO_BEFORE";
  LinePartMetadata2[LinePartMetadata2["PSEUDO_AFTER"] = 4] = "PSEUDO_AFTER";
  LinePartMetadata2[LinePartMetadata2["IS_WHITESPACE_MASK"] = 1] = "IS_WHITESPACE_MASK";
  LinePartMetadata2[LinePartMetadata2["PSEUDO_BEFORE_MASK"] = 2] = "PSEUDO_BEFORE_MASK";
  LinePartMetadata2[LinePartMetadata2["PSEUDO_AFTER_MASK"] = 4] = "PSEUDO_AFTER_MASK";
})(LinePartMetadata || (LinePartMetadata = {}));
class LinePart {
  static {
    __name(this, "LinePart");
  }
  constructor(endIndex, type, metadata, containsRTL) {
    this.endIndex = endIndex;
    this.type = type;
    this.metadata = metadata;
    this.containsRTL = containsRTL;
    this._linePartBrand = void 0;
  }
  isWhitespace() {
    return this.metadata & 1 ? true : false;
  }
  isPseudoAfter() {
    return this.metadata & 4 ? true : false;
  }
}
export {
  LinePart,
  LinePartMetadata
};
//# sourceMappingURL=linePart.js.map
