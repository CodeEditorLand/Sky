var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { localize } from "../../../../../../../nls.js";
import { PromptDescriptionMetadata } from "./metadata/index.js";
import { Disposable } from "../../../../../../../base/common/lifecycle.js";
import { ObjectStream } from "../../codecs/base/utils/objectStream.js";
import { PromptMetadataError, PromptMetadataWarning } from "./diagnostics.js";
import { SimpleToken } from "../../codecs/base/simpleCodec/tokens/tokens.js";
import { FrontMatterRecord } from "../../codecs/base/frontMatterCodec/tokens/index.js";
import { FrontMatterDecoder } from "../../codecs/base/frontMatterCodec/frontMatterDecoder.js";
class HeaderBase extends Disposable {
  static {
    __name(this, "HeaderBase");
  }
  /**
   * Data object with all header's metadata records.
   */
  get metadata() {
    const result = {};
    for (const [entryName, entryValue] of Object.entries(this.meta)) {
      if (entryValue?.value === void 0) {
        continue;
      }
      Object.assign(result, {
        [entryName]: entryValue.value
      });
    }
    return result;
  }
  /**
   * A copy of metadata object with utility classes as values
   * for each of prompt header's record.
   *
   * Please use {@link metadata} instead if all you need to read is
   * the plain "data" object representation of valid metadata records.
   */
  get metadataUtility() {
    return { ...this.meta };
  }
  /**
   * List of all diagnostic issues found while parsing
   * the prompt header.
   */
  get diagnostics() {
    return this.issues;
  }
  /**
   * Full range of the header in the original document.
   */
  get range() {
    return this.token.range;
  }
  constructor(token, languageId) {
    super();
    this.token = token;
    this.languageId = languageId;
    this.issues = [];
    this.meta = {};
    this.recordNames = /* @__PURE__ */ new Set();
    this.stream = this._register(new FrontMatterDecoder(ObjectStream.fromArray([...token.contentToken.children])));
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
      this.issues.push(new PromptMetadataWarning(token.range, localize("prompt.header.metadata.diagnostics.duplicate-record", "Duplicate metadata '{0}' will be ignored.", recordName)));
      return;
    }
    this.recordNames.add(recordName);
    if (PromptDescriptionMetadata.isDescriptionRecord(token)) {
      const metadata = new PromptDescriptionMetadata(token, this.languageId);
      this.issues.push(...metadata.validate());
      this.meta.description = metadata;
      this.recordNames.add(recordName);
      return;
    }
    if (this.handleToken(token)) {
      return;
    }
    this.issues.push(new PromptMetadataWarning(token.range, localize("prompt.header.metadata.diagnostics.unknown-record", "Unknown metadata '{0}' will be ignored.", recordName)));
  }
  /**
   * Process errors from the underlying front matter decoder.
   */
  onError(error) {
    this.issues.push(new PromptMetadataError(this.token.range, localize("prompt.header.diagnostics.parsing-error", "Failed to parse prompt header: {0}", error.message)));
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
  HeaderBase
};
//# sourceMappingURL=headerBase.js.map
