var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { PromptMetadataRecord } from "./record.js";
import { localize } from "../../../../../../../../../nls.js";
import { PromptMetadataError } from "../../diagnostics.js";
import { FrontMatterSequence } from "../../../../codecs/base/frontMatterCodec/tokens/frontMatterSequence.js";
import { FrontMatterString } from "../../../../codecs/base/frontMatterCodec/tokens/index.js";
class PromptStringMetadata extends PromptMetadataRecord {
  static {
    __name(this, "PromptStringMetadata");
  }
  /**
   * String value of a metadata record.
   */
  get value() {
    return this.valueToken?.cleanText;
  }
  constructor(expectedRecordName, recordToken, languageId) {
    super(expectedRecordName, recordToken, languageId);
  }
  /**
   * Validate the metadata record has a 'string' value.
   */
  validate() {
    const { valueToken } = this.recordToken;
    const isString = valueToken instanceof FrontMatterString;
    const isSequence = valueToken instanceof FrontMatterSequence;
    if (isString || isSequence) {
      this.valueToken = valueToken;
      return this.issues;
    }
    this.issues.push(new PromptMetadataError(valueToken.range, localize("prompt.header.metadata.string.diagnostics.invalid-value-type", "The '{0}' metadata must be a '{1}', got '{2}'.", this.recordName, "string", valueToken.valueTypeName.toString())));
    delete this.valueToken;
    return this.issues;
  }
}
export {
  PromptStringMetadata
};
//# sourceMappingURL=string.js.map
