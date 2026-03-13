var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __decorate = function(decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
  else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = function(paramIndex, decorator) {
  return function(target, key) {
    decorator(target, key, paramIndex);
  };
};
var EditorMarkdownCodeBlockRenderer_1;
import { isHTMLElement } from "../../../../../base/browser/dom.js";
import { createTrustedTypesPolicy } from "../../../../../base/browser/trustedTypes.js";
import { IConfigurationService } from "../../../../../platform/configuration/common/configuration.js";
import { createBareFontInfoFromRawSettings } from "../../../../common/config/fontInfoFromSettings.js";
import { ILanguageService } from "../../../../common/languages/language.js";
import { PLAINTEXT_LANGUAGE_ID } from "../../../../common/languages/modesRegistry.js";
import { tokenizeToString } from "../../../../common/languages/textToHtmlTokenizer.js";
import { applyFontInfo } from "../../../config/domFontInfo.js";
import { isCodeEditor } from "../../../editorBrowser.js";
import "./renderedMarkdown.css";
let EditorMarkdownCodeBlockRenderer = class EditorMarkdownCodeBlockRenderer2 {
  static {
    __name(this, "EditorMarkdownCodeBlockRenderer");
  }
  static {
    EditorMarkdownCodeBlockRenderer_1 = this;
  }
  static {
    this._ttpTokenizer = createTrustedTypesPolicy("tokenizeToString", {
      createHTML(html) {
        return html;
      }
    });
  }
  constructor(_configurationService, _languageService) {
    this._configurationService = _configurationService;
    this._languageService = _languageService;
  }
  async renderCodeBlock(languageAlias, value, options) {
    const editor = isCodeEditor(options.context) ? options.context : void 0;
    let languageId;
    if (languageAlias) {
      languageId = this._languageService.getLanguageIdByLanguageName(languageAlias);
    } else if (editor) {
      languageId = editor.getModel()?.getLanguageId();
    }
    if (!languageId) {
      languageId = PLAINTEXT_LANGUAGE_ID;
    }
    const html = await tokenizeToString(this._languageService, value, languageId);
    const content = EditorMarkdownCodeBlockRenderer_1._ttpTokenizer ? EditorMarkdownCodeBlockRenderer_1._ttpTokenizer.createHTML(html) ?? html : html;
    const root = document.createElement("span");
    root.innerHTML = content;
    const codeElement = root.querySelector(".monaco-tokenized-source");
    if (!isHTMLElement(codeElement)) {
      return document.createElement("span");
    }
    applyFontInfo(codeElement, this.getFontInfo(editor));
    return root;
  }
  getFontInfo(editor) {
    if (editor) {
      return editor.getOption(
        59
        /* EditorOption.fontInfo */
      );
    } else {
      return createBareFontInfoFromRawSettings({
        fontFamily: this._configurationService.getValue("editor").fontFamily
      }, 1);
    }
  }
};
EditorMarkdownCodeBlockRenderer = EditorMarkdownCodeBlockRenderer_1 = __decorate([
  __param(0, IConfigurationService),
  __param(1, ILanguageService)
], EditorMarkdownCodeBlockRenderer);
export {
  EditorMarkdownCodeBlockRenderer
};
//# sourceMappingURL=editorMarkdownCodeBlockRenderer.js.map
