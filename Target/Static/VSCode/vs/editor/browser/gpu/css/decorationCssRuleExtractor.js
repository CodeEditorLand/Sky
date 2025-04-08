var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { $, getActiveDocument } from "../../../../base/browser/dom.js";
import { Disposable, toDisposable } from "../../../../base/common/lifecycle.js";
import "./media/decorationCssRuleExtractor.css";
class DecorationCssRuleExtractor extends Disposable {
  static {
    __name(this, "DecorationCssRuleExtractor");
  }
  _container;
  _dummyElement;
  _ruleCache = /* @__PURE__ */ new Map();
  constructor() {
    super();
    this._container = $("div.monaco-decoration-css-rule-extractor");
    this._dummyElement = $("span");
    this._container.appendChild(this._dummyElement);
    this._register(toDisposable(() => this._container.remove()));
  }
  getStyleRules(canvas, decorationClassName) {
    const existing = this._ruleCache.get(decorationClassName);
    if (existing) {
      return existing;
    }
    this._dummyElement.className = decorationClassName;
    canvas.appendChild(this._container);
    const rules = this._getStyleRules(decorationClassName);
    this._ruleCache.set(decorationClassName, rules);
    canvas.removeChild(this._container);
    return rules;
  }
  _getStyleRules(className) {
    const rules = [];
    const doc = getActiveDocument();
    const stylesheets = [...doc.styleSheets];
    for (let i = 0; i < stylesheets.length; i++) {
      const stylesheet = stylesheets[i];
      for (const rule of stylesheet.cssRules) {
        if (rule instanceof CSSImportRule) {
          if (rule.styleSheet) {
            stylesheets.push(rule.styleSheet);
          }
        } else if (rule instanceof CSSStyleRule) {
          const searchTerm = `.${className}`;
          const index = rule.selectorText.indexOf(searchTerm);
          if (index !== -1) {
            const endOfResult = index + searchTerm.length;
            if (rule.selectorText.length === endOfResult || rule.selectorText.substring(endOfResult, endOfResult + 1).match(/[ :]/)) {
              rules.push(rule);
            }
          }
        }
      }
    }
    return rules;
  }
}
export {
  DecorationCssRuleExtractor
};
//# sourceMappingURL=decorationCssRuleExtractor.js.map
