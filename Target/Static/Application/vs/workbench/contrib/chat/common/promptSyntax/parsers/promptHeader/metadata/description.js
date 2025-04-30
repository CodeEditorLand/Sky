var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { PromptStringMetadata } from "./record.js";
import { FrontMatterRecord } from "../../../../../../../../editor/common/codecs/frontMatterCodec/tokens/index.js";
const RECORD_NAME = "description";
class PromptDescriptionMetadata extends PromptStringMetadata {
  static {
    __name(this, "PromptDescriptionMetadata");
  }
  get recordName() {
    return RECORD_NAME;
  }
  constructor(recordToken, languageId) {
    super(RECORD_NAME, recordToken, languageId);
  }
  /**
   * Check if a provided front matter token is a metadata record
   * with name equal to `description`.
   */
  static isDescriptionRecord(token) {
    if (token instanceof FrontMatterRecord === false) {
      return false;
    }
    if (token.nameToken.text === RECORD_NAME) {
      return true;
    }
    return false;
  }
}
export {
  PromptDescriptionMetadata
};
//# sourceMappingURL=description.js.map
