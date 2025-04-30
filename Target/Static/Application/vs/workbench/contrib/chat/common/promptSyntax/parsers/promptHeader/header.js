var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { ChatMode } from "../../../constants.js";
import { localize } from "../../../../../../../nls.js";
import { PromptApplyToMetadata } from "./metadata/applyTo.js";
import { assert } from "../../../../../../../base/common/assert.js";
import { assertDefined } from "../../../../../../../base/common/types.js";
import { Disposable } from "../../../../../../../base/common/lifecycle.js";
import { PromptMetadataError, PromptMetadataWarning } from "./diagnostics.js";
import { TokenStream } from "../../../../../../../editor/common/codecs/utils/tokenStream.js";
import { SimpleToken } from "../../../../../../../editor/common/codecs/simpleCodec/tokens/index.js";
import { PromptToolsMetadata, PromptModeMetadata, PromptDescriptionMetadata } from "./metadata/index.js";
import { FrontMatterRecord } from "../../../../../../../editor/common/codecs/frontMatterCodec/tokens/index.js";
import { FrontMatterDecoder } from "../../../../../../../editor/common/codecs/frontMatterCodec/frontMatterDecoder.js";
class PromptHeader extends Disposable {
  static {
    __name(this, "PromptHeader");
  }
  /**
   * Metadata records.
   */
  get metadata() {
    return Object.freeze({
      ...this.meta
    });
  }
  /**
   * List of all diagnostic issues found while parsing
   * the prompt header.
   */
  get diagnostics() {
    return this.issues;
  }
  constructor(contentsToken, languageId) {
    super();
    this.contentsToken = contentsToken;
    this.languageId = languageId;
    this.issues = [];
    this.meta = {};
    this.recordNames = /* @__PURE__ */ new Set();
    this.stream = this._register(new FrontMatterDecoder(new TokenStream(contentsToken.tokens)));
    this.stream.onData(this.onData.bind(this));
    this.stream.onError(this.onError.bind(this));
  }
  /**
   * Process front matter tokens, converting them into
   * well-known prompt metadata records.
   */
  onData(token) {
    if (token instanceof FrontMatterRecord === false) {
      if (token instanceof SimpleToken) {
        return;
      }
      this.issues.push(new PromptMetadataError(token.range, localize("prompt.header.diagnostics.unexpected-token", "Unexpected token '{0}'.", token.text)));
      return;
    }
    const recordName = token.nameToken.text;
    if (this.recordNames.has(recordName)) {
      this.issues.push(new PromptMetadataWarning(token.range, localize("prompt.header.metadata.diagnostics.duplicate-record", "Duplicate metadata record '{0}' will be ignored.", recordName)));
      return;
    }
    if (PromptDescriptionMetadata.isDescriptionRecord(token)) {
      const descriptionMetadata = new PromptDescriptionMetadata(token, this.languageId);
      const { diagnostics } = descriptionMetadata;
      this.issues.push(...diagnostics);
      this.meta.description = descriptionMetadata;
      this.recordNames.add(recordName);
      return;
    }
    if (PromptToolsMetadata.isToolsRecord(token)) {
      const toolsMetadata = new PromptToolsMetadata(token, this.languageId);
      const { diagnostics } = toolsMetadata;
      this.issues.push(...diagnostics);
      this.meta.tools = toolsMetadata;
      this.recordNames.add(recordName);
      return this.validateToolsAndModeCompatibility();
    }
    if (PromptModeMetadata.isModeRecord(token)) {
      const modeMetadata = new PromptModeMetadata(token, this.languageId);
      const { diagnostics } = modeMetadata;
      this.issues.push(...diagnostics);
      this.meta.mode = modeMetadata;
      this.recordNames.add(recordName);
      return this.validateToolsAndModeCompatibility();
    }
    if (PromptApplyToMetadata.isApplyToRecord(token)) {
      const applyToMetadata = new PromptApplyToMetadata(token, this.languageId);
      const { diagnostics } = applyToMetadata;
      this.issues.push(...diagnostics);
      this.meta.applyTo = applyToMetadata;
      this.recordNames.add(recordName);
      return;
    }
    this.issues.push(new PromptMetadataWarning(token.range, localize("prompt.header.metadata.diagnostics.unknown-record", "Unknown metadata record '{0}' will be ignored.", recordName)));
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
    if (mode === void 0 || mode.chatMode === ChatMode.Agent) {
      return true;
    }
    return false;
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
    assert(mode.chatMode !== ChatMode.Agent, "Mode metadata must not be agent mode.");
    this.issues.push(new PromptMetadataWarning(mode.range, localize("prompt.header.metadata.mode.diagnostics.incompatible-with-tools", "Record '{0}' is implied to have the '{1}' value if '{2}' record is present so the specified value will be ignored.", mode.recordName, ChatMode.Agent, tools.recordName)));
  }
  /**
   * Process errors from the underlying front matter decoder.
   */
  onError(error) {
    this.issues.push(new PromptMetadataError(this.contentsToken.range, localize("prompt.header.diagnostics.parsing-error", "Failed to parse prompt header: {0}", error.message)));
  }
  /**
   * Promise that resolves when parsing process of
   * the prompt header completes.
   */
  get settled() {
    return this.stream.settled;
  }
  /**
   * Starts the parsing process of the prompt header.
   */
  start() {
    this.stream.start();
    return this;
  }
}
export {
  PromptHeader
};
//# sourceMappingURL=header.js.map
