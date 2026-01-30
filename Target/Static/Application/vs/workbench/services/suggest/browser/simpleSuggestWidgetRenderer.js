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
import { $, append, show } from "../../../../base/browser/dom.js";
import { IconLabel } from "../../../../base/browser/ui/iconLabel/iconLabel.js";
import { Codicon } from "../../../../base/common/codicons.js";
import { Emitter } from "../../../../base/common/event.js";
import { createMatches } from "../../../../base/common/filters.js";
import { DisposableStore } from "../../../../base/common/lifecycle.js";
import { ThemeIcon } from "../../../../base/common/themables.js";
import { IThemeService } from "../../../../platform/theme/common/themeService.js";
import { IModelService } from "../../../../editor/common/services/model.js";
import { ILanguageService } from "../../../../editor/common/languages/language.js";
import { getIconClasses } from "../../../../editor/common/services/getIconClasses.js";
import { URI } from "../../../../base/common/uri.js";
import { FileKind } from "../../../../platform/files/common/files.js";
function getAriaId(index) {
  return `simple-suggest-aria-id-${index}`;
}
__name(getAriaId, "getAriaId");
let SimpleSuggestWidgetItemRenderer = class SimpleSuggestWidgetItemRenderer2 {
  static {
    __name(this, "SimpleSuggestWidgetItemRenderer");
  }
  constructor(_getFontInfo, _onDidFontConfigurationChange, _themeService, _modelService, _languageService) {
    this._getFontInfo = _getFontInfo;
    this._onDidFontConfigurationChange = _onDidFontConfigurationChange;
    this._themeService = _themeService;
    this._modelService = _modelService;
    this._languageService = _languageService;
    this._onDidToggleDetails = new Emitter();
    this.onDidToggleDetails = this._onDidToggleDetails.event;
    this._disposables = new DisposableStore();
    this.templateId = "suggestion";
  }
  dispose() {
    this._onDidToggleDetails.dispose();
    this._disposables.dispose();
  }
  renderTemplate(container) {
    const disposables = new DisposableStore();
    const root = container;
    root.classList.add("show-file-icons");
    const icon = append(container, $(".icon"));
    const colorspan = append(icon, $("span.colorspan"));
    const text = append(container, $(".contents"));
    const main = append(text, $(".main"));
    const iconContainer = append(main, $(".icon-label.codicon"));
    const left = append(main, $("span.left"));
    const right = append(main, $("span.right"));
    const iconLabel = new IconLabel(left, { supportHighlights: true, supportIcons: true });
    disposables.add(iconLabel);
    const parametersLabel = append(left, $("span.signature-label"));
    const qualifierLabel = append(left, $("span.qualifier-label"));
    const detailsLabel = append(right, $("span.details-label"));
    const configureFont = /* @__PURE__ */ __name(() => {
      const fontFeatureSettings = "";
      const { fontFamily, fontSize, lineHeight, fontWeight, letterSpacing } = this._getFontInfo();
      const fontSizePx = `${fontSize}px`;
      const lineHeightPx = `${lineHeight}px`;
      const letterSpacingPx = `${letterSpacing}px`;
      root.style.fontSize = fontSizePx;
      root.style.fontWeight = fontWeight;
      root.style.letterSpacing = letterSpacingPx;
      main.style.fontFamily = fontFamily;
      main.style.fontFeatureSettings = fontFeatureSettings;
      main.style.lineHeight = lineHeightPx;
      icon.style.height = lineHeightPx;
      icon.style.width = lineHeightPx;
    }, "configureFont");
    configureFont();
    this._disposables.add(this._onDidFontConfigurationChange(() => configureFont()));
    return { root, left, right, icon, colorspan, iconLabel, iconContainer, parametersLabel, qualifierLabel, detailsLabel, disposables };
  }
  renderElement(element, index, data) {
    const { completion } = element;
    data.root.id = getAriaId(index);
    data.colorspan.style.backgroundColor = "";
    const labelOptions = {
      labelEscapeNewLines: true,
      matches: createMatches(element.score)
    };
    if (completion.kindLabel === "File" && this._themeService.getFileIconTheme().hasFileIcons) {
      data.icon.className = "icon hide";
      data.iconContainer.className = "icon hide";
      const labelClasses = getIconClasses(this._modelService, this._languageService, URI.from({ scheme: "fake", path: element.textLabel }), FileKind.FILE);
      const detailClasses = getIconClasses(this._modelService, this._languageService, URI.from({ scheme: "fake", path: completion.detail }), FileKind.FILE);
      labelOptions.extraClasses = labelClasses.length > detailClasses.length ? labelClasses : detailClasses;
    } else if (completion.kindLabel === "Folder" && this._themeService.getFileIconTheme().hasFolderIcons) {
      data.icon.className = "icon hide";
      data.iconContainer.className = "icon hide";
      labelOptions.extraClasses = [
        getIconClasses(this._modelService, this._languageService, URI.from({ scheme: "fake", path: element.textLabel }), FileKind.FOLDER),
        getIconClasses(this._modelService, this._languageService, URI.from({ scheme: "fake", path: completion.detail }), FileKind.FOLDER)
      ].flat();
    } else {
      data.icon.className = "icon hide";
      data.iconContainer.className = "";
      data.iconContainer.classList.add("suggest-icon", ...ThemeIcon.asClassNameArray(completion.icon || Codicon.symbolText));
    }
    data.iconLabel.setLabel(element.textLabel, void 0, labelOptions);
    if (typeof completion.label === "string") {
      data.parametersLabel.textContent = "";
      data.detailsLabel.textContent = stripNewLines(completion.detail || "");
      data.root.classList.add("string-label");
    } else {
      const labelDetail = stripNewLines(completion.label.detail || "");
      data.parametersLabel.textContent = normalizeLabelDetail(labelDetail);
      data.detailsLabel.textContent = stripNewLines(completion.label.description || "");
      data.root.classList.remove("string-label");
    }
    show(data.detailsLabel);
    data.right.classList.remove("can-expand-details");
  }
  disposeTemplate(templateData) {
    templateData.disposables.dispose();
  }
};
SimpleSuggestWidgetItemRenderer = __decorate([
  __param(2, IThemeService),
  __param(3, IModelService),
  __param(4, ILanguageService)
], SimpleSuggestWidgetItemRenderer);
function stripNewLines(str) {
  return str.replace(/\r\n|\r|\n/g, "");
}
__name(stripNewLines, "stripNewLines");
const LEADING_PUNCTUATION_OR_SPACE = /^[\s()[\]{}<>"'`~!@#$%^&*+=,.:;?/\\|-]/;
function normalizeLabelDetail(detail) {
  if (!detail) {
    return "";
  }
  return LEADING_PUNCTUATION_OR_SPACE.test(detail) ? detail : ` ${detail}`;
}
__name(normalizeLabelDetail, "normalizeLabelDetail");
export {
  SimpleSuggestWidgetItemRenderer,
  getAriaId
};
//# sourceMappingURL=simpleSuggestWidgetRenderer.js.map
