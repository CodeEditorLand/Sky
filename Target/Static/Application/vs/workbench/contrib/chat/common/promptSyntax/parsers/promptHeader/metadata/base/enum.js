var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { PromptStringMetadata } from "./string.js";
import { localize } from "../../../../../../../../../nls.js";
import { assert } from "../../../../../../../../../base/common/assert.js";
import { isOneOf } from "../../../../../../../../../base/common/types.js";
import { PromptMetadataError } from "../../diagnostics.js";
import { FrontMatterSequence } from "../../../../codecs/base/frontMatterCodec/tokens/frontMatterSequence.js";
import { FrontMatterString } from "../../../../codecs/base/frontMatterCodec/tokens/index.js";
class PromptEnumMetadata extends PromptStringMetadata {
  static {
    __name(this, "PromptEnumMetadata");
  }
  constructor(validValues, expectedRecordName, recordToken, languageId) {
    super(expectedRecordName, recordToken, languageId);
    this.validValues = validValues;
  }
  /**
   * Valid enum value or 'undefined'.
   */
  get value() {
    return this.enumValue;
  }
  /**
   * Validate the metadata record has an allowed value.
   */
  validate() {
    super.validate();
    if (this.valueToken === void 0) {
      return this.issues;
    }
    assert(this.valueToken instanceof FrontMatterString || this.valueToken instanceof FrontMatterSequence, `Record token must be 'string', got '${this.valueToken}'.`);
    const { cleanText } = this.valueToken;
    if (isOneOf(cleanText, this.validValues)) {
      this.enumValue = cleanText;
      return this.issues;
    }
    this.issues.push(new PromptMetadataError(this.valueToken.range, localize("prompt.header.metadata.enum.diagnostics.invalid-value", "The '{0}' metadata must be one of {1}, got '{2}'.", this.recordName, this.validValues.map((value) => {
      return `'${value}'`;
    }).join(" | "), cleanText)));
    delete this.valueToken;
    return this.issues;
  }
}
export {
  PromptEnumMetadata
};
//# sourceMappingURL=enum.js.map
