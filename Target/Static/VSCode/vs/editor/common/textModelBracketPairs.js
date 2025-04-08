var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { CallbackIterable } from "../../base/common/arrays.js";
import { Event } from "../../base/common/event.js";
import { IPosition } from "./core/position.js";
import { IRange, Range } from "./core/range.js";
import { ClosingBracketKind, OpeningBracketKind } from "./languages/supports/languageBracketsConfiguration.js";
import { PairAstNode } from "./model/bracketPairsTextModelPart/bracketPairsTree/ast.js";
class BracketInfo {
  constructor(range, nestingLevel, nestingLevelOfEqualBracketType, isInvalid) {
    this.range = range;
    this.nestingLevel = nestingLevel;
    this.nestingLevelOfEqualBracketType = nestingLevelOfEqualBracketType;
    this.isInvalid = isInvalid;
  }
  static {
    __name(this, "BracketInfo");
  }
}
class BracketPairInfo {
  constructor(range, openingBracketRange, closingBracketRange, nestingLevel, nestingLevelOfEqualBracketType, bracketPairNode) {
    this.range = range;
    this.openingBracketRange = openingBracketRange;
    this.closingBracketRange = closingBracketRange;
    this.nestingLevel = nestingLevel;
    this.nestingLevelOfEqualBracketType = nestingLevelOfEqualBracketType;
    this.bracketPairNode = bracketPairNode;
  }
  static {
    __name(this, "BracketPairInfo");
  }
  get openingBracketInfo() {
    return this.bracketPairNode.openingBracket.bracketInfo;
  }
  get closingBracketInfo() {
    return this.bracketPairNode.closingBracket?.bracketInfo;
  }
}
class BracketPairWithMinIndentationInfo extends BracketPairInfo {
  constructor(range, openingBracketRange, closingBracketRange, nestingLevel, nestingLevelOfEqualBracketType, bracketPairNode, minVisibleColumnIndentation) {
    super(range, openingBracketRange, closingBracketRange, nestingLevel, nestingLevelOfEqualBracketType, bracketPairNode);
    this.minVisibleColumnIndentation = minVisibleColumnIndentation;
  }
  static {
    __name(this, "BracketPairWithMinIndentationInfo");
  }
}
export {
  BracketInfo,
  BracketPairInfo,
  BracketPairWithMinIndentationInfo
};
//# sourceMappingURL=textModelBracketPairs.js.map
