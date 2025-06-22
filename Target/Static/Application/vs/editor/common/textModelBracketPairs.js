var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
class BracketInfo {
  static {
    __name(this, "BracketInfo");
  }
  constructor(range, nestingLevel, nestingLevelOfEqualBracketType, isInvalid) {
    this.range = range;
    this.nestingLevel = nestingLevel;
    this.nestingLevelOfEqualBracketType = nestingLevelOfEqualBracketType;
    this.isInvalid = isInvalid;
  }
}
class BracketPairInfo {
  static {
    __name(this, "BracketPairInfo");
  }
  constructor(range, openingBracketRange, closingBracketRange, nestingLevel, nestingLevelOfEqualBracketType, bracketPairNode) {
    this.range = range;
    this.openingBracketRange = openingBracketRange;
    this.closingBracketRange = closingBracketRange;
    this.nestingLevel = nestingLevel;
    this.nestingLevelOfEqualBracketType = nestingLevelOfEqualBracketType;
    this.bracketPairNode = bracketPairNode;
  }
  get openingBracketInfo() {
    return this.bracketPairNode.openingBracket.bracketInfo;
  }
  get closingBracketInfo() {
    return this.bracketPairNode.closingBracket?.bracketInfo;
  }
}
class BracketPairWithMinIndentationInfo extends BracketPairInfo {
  static {
    __name(this, "BracketPairWithMinIndentationInfo");
  }
  constructor(range, openingBracketRange, closingBracketRange, nestingLevel, nestingLevelOfEqualBracketType, bracketPairNode, minVisibleColumnIndentation) {
    super(range, openingBracketRange, closingBracketRange, nestingLevel, nestingLevelOfEqualBracketType, bracketPairNode);
    this.minVisibleColumnIndentation = minVisibleColumnIndentation;
  }
}
export {
  BracketInfo,
  BracketPairInfo,
  BracketPairWithMinIndentationInfo
};
//# sourceMappingURL=textModelBracketPairs.js.map
