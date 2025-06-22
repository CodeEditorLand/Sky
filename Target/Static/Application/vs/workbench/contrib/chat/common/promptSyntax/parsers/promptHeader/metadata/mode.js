var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { ChatMode } from "../../../../constants.js";
import { PromptEnumMetadata } from "./base/enum.js";
import { FrontMatterRecord } from "../../../codecs/base/frontMatterCodec/tokens/index.js";
const RECORD_NAME = "mode";
class PromptModeMetadata extends PromptEnumMetadata {
  static {
    __name(this, "PromptModeMetadata");
  }
  constructor(recordToken, languageId) {
    super([ChatMode.Ask, ChatMode.Edit, ChatMode.Agent], RECORD_NAME, recordToken, languageId);
  }
  /**
   * Check if a provided front matter token is a metadata record
   * with name equal to `mode`.
   */
  static isModeRecord(token) {
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
  PromptModeMetadata
};
//# sourceMappingURL=mode.js.map
