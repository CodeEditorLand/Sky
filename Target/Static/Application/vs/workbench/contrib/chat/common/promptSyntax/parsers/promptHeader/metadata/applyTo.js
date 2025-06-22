var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { PromptStringMetadata } from "./base/string.js";
import { localize } from "../../../../../../../../nls.js";
import { INSTRUCTIONS_LANGUAGE_ID } from "../../../promptTypes.js";
import { isEmptyPattern, parse, splitGlobAware } from "../../../../../../../../base/common/glob.js";
import { PromptMetadataError, PromptMetadataWarning } from "../diagnostics.js";
import { FrontMatterRecord } from "../../../codecs/base/frontMatterCodec/tokens/index.js";
const RECORD_NAME = "applyTo";
class PromptApplyToMetadata extends PromptStringMetadata {
  static {
    __name(this, "PromptApplyToMetadata");
  }
  constructor(recordToken, languageId) {
    super(RECORD_NAME, recordToken, languageId);
  }
  get recordName() {
    return RECORD_NAME;
  }
  validate() {
    super.validate();
    if (this.valueToken === void 0) {
      return this.issues;
    }
    if (this.languageId !== INSTRUCTIONS_LANGUAGE_ID) {
      this.issues.push(new PromptMetadataError(this.range, localize("prompt.header.metadata.string.diagnostics.invalid-language", "The '{0}' metadata record is only valid in instruction files.", this.recordName)));
      delete this.valueToken;
      return this.issues;
    }
    const { cleanText } = this.valueToken;
    if (this.isValidGlob(cleanText) === false) {
      this.issues.push(new PromptMetadataWarning(this.valueToken.range, localize("prompt.header.metadata.applyTo.diagnostics.non-valid-glob", "Invalid glob pattern '{0}'.", cleanText)));
      delete this.valueToken;
      return this.issues;
    }
    return this.issues;
  }
  /**
   * Check if a provided string contains a valid glob pattern.
   */
  isValidGlob(pattern) {
    try {
      const patterns = splitGlobAware(pattern, ",");
      if (patterns.length === 0) {
        return false;
      }
      for (const pattern2 of patterns) {
        const globPattern = parse(pattern2);
        if (isEmptyPattern(globPattern)) {
          return false;
        }
      }
      return true;
    } catch (_error) {
      return false;
    }
  }
  /**
   * Check if a provided front matter token is a metadata record
   * with name equal to `applyTo`.
   */
  static isApplyToRecord(token) {
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
  PromptApplyToMetadata
};
//# sourceMappingURL=applyTo.js.map
