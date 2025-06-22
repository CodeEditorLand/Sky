var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
class TextModelEditReason {
  static {
    __name(this, "TextModelEditReason");
  }
  static {
    this._nextMetadataId = 0;
  }
  static {
    this._metaDataMap = /* @__PURE__ */ new Map();
  }
  /**
   * Sets the reason for all text model edits done in the callback.
  */
  static editWithReason(reason, runner) {
    const id = this._nextMetadataId++;
    this._metaDataMap.set(id, reason.metadata);
    try {
      const result = runner();
      return result;
    } finally {
      this._metaDataMap.delete(id);
    }
  }
  static _getCurrentMetadata() {
    const result = {};
    for (const metadata of this._metaDataMap.values()) {
      Object.assign(result, metadata);
    }
    return result;
  }
  constructor(metadata) {
    this.metadata = metadata;
  }
}
export {
  TextModelEditReason
};
//# sourceMappingURL=textModelEditReason.js.map
