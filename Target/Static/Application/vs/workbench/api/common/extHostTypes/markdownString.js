var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __decorate = function(decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
  else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var MarkdownString_1;
import { MarkdownString as BaseMarkdownString } from "../../../../base/common/htmlContent.js";
import { es5ClassCompat } from "./es5ClassCompat.js";
let MarkdownString = MarkdownString_1 = class MarkdownString2 {
  static {
    __name(this, "MarkdownString");
  }
  #delegate;
  static isMarkdownString(thing) {
    if (thing instanceof MarkdownString_1) {
      return true;
    }
    if (!thing || typeof thing !== "object") {
      return false;
    }
    return thing.appendCodeblock && thing.appendMarkdown && thing.appendText && thing.value !== void 0;
  }
  constructor(value, supportThemeIcons = false) {
    this.#delegate = new BaseMarkdownString(value, { supportThemeIcons });
  }
  get value() {
    return this.#delegate.value;
  }
  set value(value) {
    this.#delegate.value = value;
  }
  get isTrusted() {
    return this.#delegate.isTrusted;
  }
  set isTrusted(value) {
    this.#delegate.isTrusted = value;
  }
  get supportThemeIcons() {
    return this.#delegate.supportThemeIcons;
  }
  set supportThemeIcons(value) {
    this.#delegate.supportThemeIcons = value;
  }
  get supportHtml() {
    return this.#delegate.supportHtml;
  }
  set supportHtml(value) {
    this.#delegate.supportHtml = value;
  }
  get supportAlertSyntax() {
    return this.#delegate.supportAlertSyntax;
  }
  set supportAlertSyntax(value) {
    this.#delegate.supportAlertSyntax = value;
  }
  get baseUri() {
    return this.#delegate.baseUri;
  }
  set baseUri(value) {
    this.#delegate.baseUri = value;
  }
  appendText(value) {
    this.#delegate.appendText(value);
    return this;
  }
  appendMarkdown(value) {
    this.#delegate.appendMarkdown(value);
    return this;
  }
  appendCodeblock(value, language) {
    this.#delegate.appendCodeblock(language ?? "", value);
    return this;
  }
};
MarkdownString = MarkdownString_1 = __decorate([
  es5ClassCompat
], MarkdownString);
export {
  MarkdownString
};
//# sourceMappingURL=markdownString.js.map
