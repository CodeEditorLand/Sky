var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { assert } from "../../../../../../../../../base/common/assert.js";
import { PromptMetadataError, PromptMetadataWarning } from "../../diagnostics.js";
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
  constructor(expectedRecordName, recordToken, languageId) {
    this.expectedRecordName = expectedRecordName;
    this.recordToken = recordToken;
    this.languageId = languageId;
    const recordName = recordToken.nameToken.text;
    assert(recordName === expectedRecordName, `Record name must be '${expectedRecordName}', got '${recordName}'.`);
    this.issues = [];
  }
  /**
   * Name of the metadata record.
   */
  get recordName() {
    return this.recordToken.nameToken.text;
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
export {
  PromptMetadataRecord
};
//# sourceMappingURL=record.js.map
