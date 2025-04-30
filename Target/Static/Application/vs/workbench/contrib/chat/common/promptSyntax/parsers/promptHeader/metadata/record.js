var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { localize } from "../../../../../../../../nls.js";
import { assert } from "../../../../../../../../base/common/assert.js";
import { PromptMetadataError, PromptMetadataWarning } from "../diagnostics.js";
import { FrontMatterString } from "../../../../../../../../editor/common/codecs/frontMatterCodec/tokens/index.js";
class PromptMetadataRecord {
  static {
    __name(this, "PromptMetadataRecord");
  }
  /**
   * Full range of the metadata's record text in the prompt header.
   */
  get range() {
    return this.recordToken.range;
  }
  constructor(recordToken, languageId) {
    this.recordToken = recordToken;
    this.languageId = languageId;
    this.issues = [];
    this.issues.push(...this.validate());
  }
  /**
   * List of all diagnostic issues related to this metadata record.
   */
  get diagnostics() {
    return this.issues;
  }
  /**
   * List of all `error` issue diagnostics.
   */
  get errorDiagnostics() {
    return this.diagnostics.filter((diagnostic) => {
      return diagnostic instanceof PromptMetadataError;
    });
  }
  /**
   * List of all `warning` issue diagnostics.
   */
  get warningDiagnostics() {
    return this.diagnostics.filter((diagnostic) => {
      return diagnostic instanceof PromptMetadataWarning;
    });
  }
}
class PromptStringMetadata extends PromptMetadataRecord {
  static {
    __name(this, "PromptStringMetadata");
  }
  /**
   * Clean text value of the record.
   */
  get text() {
    return this.valueToken?.cleanText;
  }
  constructor(expectedRecordName, recordToken, languageId) {
    const recordName = recordToken.nameToken.text;
    assert(recordName === expectedRecordName, `Record token must be '${expectedRecordName}', got '${recordName}'.`);
    super(recordToken, languageId);
  }
  /**
   * Validate the metadata record has a 'string' value.
   */
  validate() {
    const { valueToken } = this.recordToken;
    const result = [];
    if (valueToken instanceof FrontMatterString === false) {
      result.push(new PromptMetadataError(valueToken.range, localize("prompt.header.metadata.string.diagnostics.invalid-value-type", "Value of the '{0}' metadata must be '{1}', got '{2}'.", this.recordName, "string", valueToken.valueTypeName)));
      return result;
    }
    this.valueToken = valueToken;
    return result;
  }
}
export {
  PromptMetadataRecord,
  PromptStringMetadata
};
//# sourceMappingURL=record.js.map
