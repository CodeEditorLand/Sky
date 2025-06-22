var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { PartialFrontMatterArray } from "./frontMatterArray.js";
import { PartialFrontMatterRecord } from "./frontMatterRecord/frontMatterRecord.js";
import { PartialFrontMatterRecordName } from "./frontMatterRecord/frontMatterRecordName.js";
import { PartialFrontMatterRecordNameWithDelimiter } from "./frontMatterRecord/frontMatterRecordNameWithDelimiter.js";
import { PartialFrontMatterSequence } from "./frontMatterSequence.js";
import { PartialFrontMatterString } from "./frontMatterString.js";
import { PartialFrontMatterValue } from "./frontMatterValue.js";
class FrontMatterParserFactory {
  static {
    __name(this, "FrontMatterParserFactory");
  }
  createRecord(tokens) {
    return new PartialFrontMatterRecord(this, tokens);
  }
  createRecordName(startToken) {
    return new PartialFrontMatterRecordName(this, startToken);
  }
  createRecordNameWithDelimiter(tokens) {
    return new PartialFrontMatterRecordNameWithDelimiter(this, tokens);
  }
  createArray(startToken) {
    return new PartialFrontMatterArray(this, startToken);
  }
  createValue(shouldStop) {
    return new PartialFrontMatterValue(this, shouldStop);
  }
  createString(startToken) {
    return new PartialFrontMatterString(startToken);
  }
  createSequence(shouldStop) {
    return new PartialFrontMatterSequence(shouldStop);
  }
}
export {
  FrontMatterParserFactory
};
//# sourceMappingURL=frontMatterParserFactory.js.map
