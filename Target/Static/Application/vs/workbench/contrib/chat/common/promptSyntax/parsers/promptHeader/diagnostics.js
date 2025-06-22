var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
class PromptMetadataDiagnostic {
  static {
    __name(this, "PromptMetadataDiagnostic");
  }
  constructor(range, message) {
    this.range = range;
    this.message = message;
  }
}
class PromptMetadataWarning extends PromptMetadataDiagnostic {
  static {
    __name(this, "PromptMetadataWarning");
  }
  toString() {
    return `warning(${this.message})${this.range}`;
  }
}
class PromptMetadataError extends PromptMetadataDiagnostic {
  static {
    __name(this, "PromptMetadataError");
  }
  toString() {
    return `error(${this.message})${this.range}`;
  }
}
export {
  PromptMetadataDiagnostic,
  PromptMetadataError,
  PromptMetadataWarning
};
//# sourceMappingURL=diagnostics.js.map
