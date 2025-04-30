var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { createDecorator } from "../../../platform/instantiation/common/instantiation.js";
import { importAMDNodeModule } from "../../../amdX.js";
const EDITOR_EXPERIMENTAL_PREFER_TREESITTER = "editor.experimental.preferTreeSitter";
const TREESITTER_ALLOWED_SUPPORT = ["css", "typescript", "ini", "regex"];
const ITreeSitterParserService = createDecorator("treeSitterParserService");
const ITreeSitterImporter = createDecorator("treeSitterImporter");
class TreeSitterImporter {
  static {
    __name(this, "TreeSitterImporter");
  }
  constructor() {
  }
  async _getTreeSitterImport() {
    if (!this._treeSitterImport) {
      this._treeSitterImport = await importAMDNodeModule("@vscode/tree-sitter-wasm", "wasm/tree-sitter.js");
    }
    return this._treeSitterImport;
  }
  get parserClass() {
    return this._parserClass;
  }
  async getParserClass() {
    if (!this._parserClass) {
      this._parserClass = (await this._getTreeSitterImport()).Parser;
    }
    return this._parserClass;
  }
  async getLanguageClass() {
    if (!this._languageClass) {
      this._languageClass = (await this._getTreeSitterImport()).Language;
    }
    return this._languageClass;
  }
  async getQueryClass() {
    if (!this._queryClass) {
      this._queryClass = (await this._getTreeSitterImport()).Query;
    }
    return this._queryClass;
  }
}
export {
  EDITOR_EXPERIMENTAL_PREFER_TREESITTER,
  ITreeSitterImporter,
  ITreeSitterParserService,
  TREESITTER_ALLOWED_SUPPORT,
  TreeSitterImporter
};
//# sourceMappingURL=treeSitterParserService.js.map
