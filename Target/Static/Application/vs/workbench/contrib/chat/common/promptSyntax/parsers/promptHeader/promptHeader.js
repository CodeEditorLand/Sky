var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { ChatMode } from "../../../constants.js";
import { localize } from "../../../../../../../nls.js";
import { PromptMetadataWarning } from "./diagnostics.js";
import { assert } from "../../../../../../../base/common/assert.js";
import { assertDefined } from "../../../../../../../base/common/types.js";
import { PromptToolsMetadata, PromptModeMetadata } from "./metadata/index.js";
import { HeaderBase } from "./headerBase.js";
class PromptHeader extends HeaderBase {
  static {
    __name(this, "PromptHeader");
  }
  handleToken(token) {
    if (PromptToolsMetadata.isToolsRecord(token)) {
      const metadata = new PromptToolsMetadata(token, this.languageId);
      this.issues.push(...metadata.validate());
      this.meta.tools = metadata;
      this.validateToolsAndModeCompatibility();
      return true;
    }
    if (PromptModeMetadata.isModeRecord(token)) {
      const metadata = new PromptModeMetadata(token, this.languageId);
      this.issues.push(...metadata.validate());
      this.meta.mode = metadata;
      this.validateToolsAndModeCompatibility();
      return true;
    }
    return false;
  }
  /**
   * Check if value of `tools` and `mode` metadata
   * are compatible with each other.
   */
  get toolsAndModeCompatible() {
    const { tools, mode } = this.meta;
    if (tools === void 0) {
      return true;
    }
    if (mode?.value === void 0) {
      return true;
    }
    return mode.value === ChatMode.Agent;
  }
  /**
   * Validate that the `tools` and `mode` metadata are compatible
   * with each other. If not, add a warning diagnostic.
   */
  validateToolsAndModeCompatibility() {
    if (this.toolsAndModeCompatible === true) {
      return;
    }
    const { tools, mode } = this.meta;
    assertDefined(tools, "Tools metadata must have been present.");
    assertDefined(mode, "Mode metadata must have been present.");
    assert(mode.value !== ChatMode.Agent, "Mode metadata must not be agent mode.");
    this.issues.push(new PromptMetadataWarning(mode.range, localize("prompt.header.metadata.mode.diagnostics.incompatible-with-tools", "Record '{0}' is implied to have the '{1}' value if '{2}' record is present so the specified value will be ignored.", mode.recordName, ChatMode.Agent, tools.recordName)));
  }
}
export {
  PromptHeader
};
//# sourceMappingURL=promptHeader.js.map
