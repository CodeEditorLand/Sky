var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
class LineHeightChangingDecoration {
  static {
    __name(this, "LineHeightChangingDecoration");
  }
  static toKey(obj) {
    return `${obj.ownerId};${obj.decorationId};${obj.lineNumber}`;
  }
  constructor(ownerId, decorationId, lineNumber, lineHeight) {
    this.ownerId = ownerId;
    this.decorationId = decorationId;
    this.lineNumber = lineNumber;
    this.lineHeight = lineHeight;
  }
}
class LineFontChangingDecoration {
  static {
    __name(this, "LineFontChangingDecoration");
  }
  static toKey(obj) {
    return `${obj.ownerId};${obj.decorationId};${obj.lineNumber}`;
  }
  constructor(ownerId, decorationId, lineNumber) {
    this.ownerId = ownerId;
    this.decorationId = decorationId;
    this.lineNumber = lineNumber;
  }
}
export {
  LineFontChangingDecoration,
  LineHeightChangingDecoration
};
//# sourceMappingURL=decorationProvider.js.map
