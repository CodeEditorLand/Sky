var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { PromptMetadataRecord } from "./record.js";
import { localize } from "../../../../../../../../nls.js";
import { assert } from "../../../../../../../../base/common/assert.js";
import { PromptMetadataError, PromptMetadataWarning } from "../diagnostics.js";
import { FrontMatterArray, FrontMatterRecord, FrontMatterString } from "../../../../../../../../editor/common/codecs/frontMatterCodec/tokens/index.js";
const RECORD_NAME = "tools";
class PromptToolsMetadata extends PromptMetadataRecord {
  static {
    __name(this, "PromptToolsMetadata");
  }
  get recordName() {
    return RECORD_NAME;
  }
  /**
   * List of all valid tool names that were found in
   * this metadata record.
   */
  get toolNames() {
    if (this.validToolNames === void 0) {
      return [];
    }
    return [...this.validToolNames.values()];
  }
  constructor(recordToken, languageId) {
    assert(PromptToolsMetadata.isToolsRecord(recordToken), `Record token must be a tools token, got '${recordToken.nameToken.text}'.`);
    super(recordToken, languageId);
  }
  /**
   * Validate the metadata record and collect all issues
   * related to its content.
   */
  validate() {
    const result = [];
    const { valueToken } = this.recordToken;
    if (valueToken instanceof FrontMatterArray === false) {
      result.push(new PromptMetadataError(valueToken.range, localize("prompt.header.metadata.tools.diagnostics.invalid-value-type", "Value of the '{0}' metadata must be '{1}', got '{2}'.", RECORD_NAME, "array", valueToken.valueTypeName)));
      return result;
    }
    this.valueToken = valueToken;
    this.validToolNames = /* @__PURE__ */ new Set();
    for (const item of this.valueToken.items) {
      result.push(...this.validateToolName(item, this.validToolNames));
    }
    return result;
  }
  /**
   * Validate an individual provided value token that
   * is used for a tool name.
   */
  validateToolName(valueToken, validToolNames) {
    const issues = [];
    if (valueToken instanceof FrontMatterString === false) {
      issues.push(new PromptMetadataWarning(valueToken.range, localize("prompt.header.metadata.tools.diagnostics.invalid-tool-name-type", "Expected a tool name ({0}), got '{1}'.", "string", valueToken.text)));
      return issues;
    }
    const cleanToolName = valueToken.cleanText.trim();
    if (cleanToolName.length === 0) {
      issues.push(new PromptMetadataWarning(valueToken.range, localize("prompt.header.metadata.tools.diagnostics.empty-tool-name", "Tool name cannot be empty.")));
      return issues;
    }
    if (validToolNames.has(cleanToolName)) {
      issues.push(new PromptMetadataWarning(valueToken.range, localize("prompt.header.metadata.tools.diagnostics.duplicate-tool-name", "Duplicate tool name '{0}'.", cleanToolName)));
      return issues;
    }
    validToolNames.add(cleanToolName);
    return issues;
  }
  /**
   * Check if a provided front matter token is a metadata record
   * with name equal to `tools`.
   */
  static isToolsRecord(token) {
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
  PromptToolsMetadata
};
//# sourceMappingURL=tools.js.map
