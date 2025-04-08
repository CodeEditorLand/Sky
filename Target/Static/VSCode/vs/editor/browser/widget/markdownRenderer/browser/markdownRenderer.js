var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp(target, key, result);
  return result;
};
var __decorateParam = (index, decorator) => (target, key) => decorator(target, key, index);
import { MarkdownRenderOptions, MarkedOptions, renderMarkdown } from "../../../../../base/browser/markdownRenderer.js";
import { createTrustedTypesPolicy } from "../../../../../base/browser/trustedTypes.js";
import { onUnexpectedError } from "../../../../../base/common/errors.js";
import { IMarkdownString, MarkdownStringTrustedOptions } from "../../../../../base/common/htmlContent.js";
import { DisposableStore, IDisposable } from "../../../../../base/common/lifecycle.js";
import { IOpenerService } from "../../../../../platform/opener/common/opener.js";
import { EditorOption } from "../../../../common/config/editorOptions.js";
import { ILanguageService } from "../../../../common/languages/language.js";
import { PLAINTEXT_LANGUAGE_ID } from "../../../../common/languages/modesRegistry.js";
import { tokenizeToString } from "../../../../common/languages/textToHtmlTokenizer.js";
import { applyFontInfo } from "../../../config/domFontInfo.js";
import { ICodeEditor } from "../../../editorBrowser.js";
import "./renderedMarkdown.css";
let MarkdownRenderer = class {
  constructor(_options, _languageService, _openerService) {
    this._options = _options;
    this._languageService = _languageService;
    this._openerService = _openerService;
  }
  static {
    __name(this, "MarkdownRenderer");
  }
  static _ttpTokenizer = createTrustedTypesPolicy("tokenizeToString", {
    createHTML(html) {
      return html;
    }
  });
  render(markdown, options, markedOptions) {
    if (!markdown) {
      const element = document.createElement("span");
      return { element, dispose: /* @__PURE__ */ __name(() => {
      }, "dispose") };
    }
    const disposables = new DisposableStore();
    const rendered = disposables.add(renderMarkdown(markdown, { ...this._getRenderOptions(markdown, disposables), ...options }, markedOptions));
    rendered.element.classList.add("rendered-markdown");
    return {
      element: rendered.element,
      dispose: /* @__PURE__ */ __name(() => disposables.dispose(), "dispose")
    };
  }
  _getRenderOptions(markdown, disposables) {
    return {
      codeBlockRenderer: /* @__PURE__ */ __name(async (languageAlias, value) => {
        let languageId;
        if (languageAlias) {
          languageId = this._languageService.getLanguageIdByLanguageName(languageAlias);
        } else if (this._options.editor) {
          languageId = this._options.editor.getModel()?.getLanguageId();
        }
        if (!languageId) {
          languageId = PLAINTEXT_LANGUAGE_ID;
        }
        const html = await tokenizeToString(this._languageService, value, languageId);
        const element = document.createElement("span");
        element.innerHTML = MarkdownRenderer._ttpTokenizer?.createHTML(html) ?? html;
        if (this._options.editor) {
          const fontInfo = this._options.editor.getOption(EditorOption.fontInfo);
          applyFontInfo(element, fontInfo);
        } else if (this._options.codeBlockFontFamily) {
          element.style.fontFamily = this._options.codeBlockFontFamily;
        }
        if (this._options.codeBlockFontSize !== void 0) {
          element.style.fontSize = this._options.codeBlockFontSize;
        }
        return element;
      }, "codeBlockRenderer"),
      actionHandler: {
        callback: /* @__PURE__ */ __name((link) => this.openMarkdownLink(link, markdown), "callback"),
        disposables
      }
    };
  }
  async openMarkdownLink(link, markdown) {
    await openLinkFromMarkdown(this._openerService, link, markdown.isTrusted);
  }
};
MarkdownRenderer = __decorateClass([
  __decorateParam(1, ILanguageService),
  __decorateParam(2, IOpenerService)
], MarkdownRenderer);
async function openLinkFromMarkdown(openerService, link, isTrusted, skipValidation) {
  try {
    return await openerService.open(link, {
      fromUserGesture: true,
      allowContributedOpeners: true,
      allowCommands: toAllowCommandsOption(isTrusted),
      skipValidation
    });
  } catch (e) {
    onUnexpectedError(e);
    return false;
  }
}
__name(openLinkFromMarkdown, "openLinkFromMarkdown");
function toAllowCommandsOption(isTrusted) {
  if (isTrusted === true) {
    return true;
  }
  if (isTrusted && Array.isArray(isTrusted.enabledCommands)) {
    return isTrusted.enabledCommands;
  }
  return false;
}
__name(toAllowCommandsOption, "toAllowCommandsOption");
export {
  MarkdownRenderer,
  openLinkFromMarkdown
};
//# sourceMappingURL=markdownRenderer.js.map
