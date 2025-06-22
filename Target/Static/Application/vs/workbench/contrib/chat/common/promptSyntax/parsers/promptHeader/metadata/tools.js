var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { PromptMetadataRecord } from "./base/record.js";
import { localize } from "../../../../../../../../nls.js";
import { PromptMetadataError, PromptMetadataWarning } from "../diagnostics.js";
import { FrontMatterSequence } from "../../../codecs/base/frontMatterCodec/tokens/frontMatterSequence.js";
import { FrontMatterArray, FrontMatterRecord, FrontMatterString } from "../../../codecs/base/frontMatterCodec/tokens/index.js";
const RECORD_NAME = "tools";
class PromptToolsMetadata extends PromptMetadataRecord {
  static {
    __name(this, "PromptToolsMetadata");
  }
  /**
   * List of all valid tool names that were found in
   * this metadata record.
   */
  get value() {
    if (this.validToolNames === void 0) {
      return [];
    }
    return [...this.validToolNames.values()];
  }
  get recordName() {
    return RECORD_NAME;
  }
  constructor(recordToken, languageId) {
    super(RECORD_NAME, recordToken, languageId);
  }
  /**
   * Validate the metadata record and collect all issues
   * related to its content.
   */
  validate() {
    const { valueToken } = this.recordToken;
    if (valueToken instanceof FrontMatterArray === false) {
      this.issues.push(new PromptMetadataError(valueToken.range, localize("prompt.header.metadata.tools.diagnostics.invalid-value-type", "The '{0}' metadata must be an array of tool names, got '{2}'.", RECORD_NAME, valueToken.valueTypeName.toString())));
      delete this.valueToken;
      return this.issues;
    }
    this.valueToken = valueToken;
    this.validToolNames = /* @__PURE__ */ new Set();
    for (const item of this.valueToken.items) {
      this.issues.push(...this.validateToolName(item, this.validToolNames));
    }
    return this.issues;
  }
  /**
   * Validate an individual provided value token that is used
   * for a tool name.
   */
  validateToolName(valueToken, validToolNames) {
    const issues = [];
    if (valueToken instanceof FrontMatterString === false && valueToken instanceof FrontMatterSequence === false) {
      issues.push(new PromptMetadataWarning(valueToken.range, localize("prompt.header.metadata.tools.diagnostics.invalid-tool-name-type", "Unexpected tool name '{0}', expected '{1}'.", valueToken.text, "string")));
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
