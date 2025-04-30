var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { PromptStringMetadata } from "./record.js";
import { ChatMode } from "../../../../constants.js";
import { localize } from "../../../../../../../../nls.js";
import { PromptMetadataError } from "../diagnostics.js";
import { FrontMatterRecord } from "../../../../../../../../editor/common/codecs/frontMatterCodec/tokens/index.js";
const RECORD_NAME = "mode";
const VALID_MODES = Object.freeze([
  ChatMode.Ask,
  ChatMode.Edit,
  ChatMode.Agent
]);
class PromptModeMetadata extends PromptStringMetadata {
  static {
    __name(this, "PromptModeMetadata");
  }
  constructor(recordToken, languageId) {
    super(RECORD_NAME, recordToken, languageId);
  }
  get recordName() {
    return RECORD_NAME;
  }
  /**
   * Chat mode value of the metadata record.
   */
  get chatMode() {
    return this.value;
  }
  validate() {
    const result = [
      ...super.validate()
    ];
    if (this.text === void 0) {
      return result;
    }
    const validModes = [...VALID_MODES];
    const index = validModes.indexOf(this.text);
    if (index !== -1) {
      this.value = VALID_MODES[index];
      return result;
    }
    result.push(new PromptMetadataError(this.range, localize("prompt.header.metadata.mode.diagnostics.invalid-value", "Value of the '{0}' metadata must be one of ({1}), got '{2}'.", RECORD_NAME, VALID_MODES.map((modeName) => {
      return `'${modeName}'`;
    }).join(", "), this.text)));
    return result;
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
