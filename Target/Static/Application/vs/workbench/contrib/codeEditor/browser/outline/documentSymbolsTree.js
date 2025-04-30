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
var DocumentSymbolFilter_1;
import * as dom from "../../../../../base/browser/dom.js";
import { HighlightedLabel } from "../../../../../base/browser/ui/highlightedlabel/highlightedLabel.js";
import { IconLabel } from "../../../../../base/browser/ui/iconLabel/iconLabel.js";
import { mainWindow } from "../../../../../base/browser/window.js";
import { createMatches } from "../../../../../base/common/filters.js";
import { ThemeIcon } from "../../../../../base/common/themables.js";
import { Range } from "../../../../../editor/common/core/range.js";
import { getAriaLabelForSymbol, symbolKindNames, SymbolKinds } from "../../../../../editor/common/languages.js";
import { ITextResourceConfigurationService } from "../../../../../editor/common/services/textResourceConfiguration.js";
import { OutlineElement, OutlineGroup, OutlineModel } from "../../../../../editor/contrib/documentSymbols/browser/outlineModel.js";
import "../../../../../editor/contrib/symbolIcons/browser/symbolIcons.js";
import { localize } from "../../../../../nls.js";
import { IConfigurationService } from "../../../../../platform/configuration/common/configuration.js";
import { fillInSymbolsDragData } from "../../../../../platform/dnd/browser/dnd.js";
import { IInstantiationService } from "../../../../../platform/instantiation/common/instantiation.js";
import { MarkerSeverity } from "../../../../../platform/markers/common/markers.js";
import { withSelection } from "../../../../../platform/opener/common/opener.js";
import { listErrorForeground, listWarningForeground } from "../../../../../platform/theme/common/colorRegistry.js";
import { IThemeService } from "../../../../../platform/theme/common/themeService.js";
import { fillEditorsDragData } from "../../../../browser/dnd.js";
import "./documentSymbolsTree.css";
class DocumentSymbolNavigationLabelProvider {
  static {
    __name(this, "DocumentSymbolNavigationLabelProvider");
  }
  getKeyboardNavigationLabel(element) {
    if (element instanceof OutlineGroup) {
      return element.label;
    } else {
      return element.symbol.name;
    }
  }
}
class DocumentSymbolAccessibilityProvider {
  static {
    __name(this, "DocumentSymbolAccessibilityProvider");
  }
  constructor(_ariaLabel) {
    this._ariaLabel = _ariaLabel;
  }
  getWidgetAriaLabel() {
    return this._ariaLabel;
  }
  getAriaLabel(element) {
    if (element instanceof OutlineGroup) {
      return element.label;
    } else {
      return getAriaLabelForSymbol(element.symbol.name, element.symbol.kind);
    }
  }
}
class DocumentSymbolIdentityProvider {
  static {
    __name(this, "DocumentSymbolIdentityProvider");
  }
  getId(element) {
    return element.id;
  }
}
let DocumentSymbolDragAndDrop = class DocumentSymbolDragAndDrop2 {
  static {
    __name(this, "DocumentSymbolDragAndDrop");
  }
  constructor(_instantiationService) {
    this._instantiationService = _instantiationService;
  }
  getDragURI(element) {
    const resource = OutlineModel.get(element)?.uri;
    if (!resource) {
      return null;
    }
    if (element instanceof OutlineElement) {
      const symbolUri = symbolRangeUri(resource, element.symbol);
      return symbolUri.fsPath + (symbolUri.fragment ? "#" + symbolUri.fragment : "");
    } else {
      return resource.fsPath;
    }
  }
  getDragLabel(elements, originalEvent) {
    if (elements.length !== 1) {
      return void 0;
    }
    const element = elements[0];
    return element instanceof OutlineElement ? element.symbol.name : element.label;
  }
  onDragStart(data, originalEvent) {
    const elements = data.elements;
    const item = elements[0];
    if (!item || !originalEvent.dataTransfer) {
      return;
    }
    const resource = OutlineModel.get(item)?.uri;
    if (!resource) {
      return;
    }
    const outlineElements = item instanceof OutlineElement ? [item] : Array.from(item.children.values());
    fillInSymbolsDragData(outlineElements.map((oe) => ({
      name: oe.symbol.name,
      fsPath: resource.fsPath,
      range: oe.symbol.range,
      kind: oe.symbol.kind
    })), originalEvent);
    this._instantiationService.invokeFunction((accessor) => fillEditorsDragData(accessor, outlineElements.map((oe) => ({
      resource,
      selection: oe.symbol.range
    })), originalEvent));
  }
  onDragOver() {
    return false;
  }
  drop() {
  }
  dispose() {
  }
};
DocumentSymbolDragAndDrop = __decorate([
  __param(0, IInstantiationService)
], DocumentSymbolDragAndDrop);
function symbolRangeUri(resource, symbol) {
  return withSelection(resource, symbol.range);
}
__name(symbolRangeUri, "symbolRangeUri");
class DocumentSymbolGroupTemplate {
  static {
    __name(this, "DocumentSymbolGroupTemplate");
  }
  static {
    this.id = "DocumentSymbolGroupTemplate";
  }
  constructor(labelContainer, label) {
    this.labelContainer = labelContainer;
    this.label = label;
  }
  dispose() {
    this.label.dispose();
  }
}
class DocumentSymbolTemplate {
  static {
    __name(this, "DocumentSymbolTemplate");
  }
  static {
    this.id = "DocumentSymbolTemplate";
  }
  constructor(container, iconLabel, iconClass, decoration) {
    this.container = container;
    this.iconLabel = iconLabel;
    this.iconClass = iconClass;
    this.decoration = decoration;
  }
}
class DocumentSymbolVirtualDelegate {
  static {
    __name(this, "DocumentSymbolVirtualDelegate");
  }
  getHeight(_element) {
    return 22;
  }
  getTemplateId(element) {
    return element instanceof OutlineGroup ? DocumentSymbolGroupTemplate.id : DocumentSymbolTemplate.id;
  }
}
class DocumentSymbolGroupRenderer {
  static {
    __name(this, "DocumentSymbolGroupRenderer");
  }
  constructor() {
    this.templateId = DocumentSymbolGroupTemplate.id;
  }
  renderTemplate(container) {
    const labelContainer = dom.$(".outline-element-label");
    container.classList.add("outline-element");
    dom.append(container, labelContainer);
    return new DocumentSymbolGroupTemplate(labelContainer, new HighlightedLabel(labelContainer));
  }
  renderElement(node, _index, template) {
    template.label.set(node.element.label, createMatches(node.filterData));
  }
  disposeTemplate(_template) {
    _template.dispose();
  }
}
let DocumentSymbolRenderer = class DocumentSymbolRenderer2 {
  static {
    __name(this, "DocumentSymbolRenderer");
  }
  constructor(_renderMarker, target, _configurationService, _themeService) {
    this._renderMarker = _renderMarker;
    this._configurationService = _configurationService;
    this._themeService = _themeService;
    this.templateId = DocumentSymbolTemplate.id;
  }
  renderTemplate(container) {
    container.classList.add("outline-element");
    const iconLabel = new IconLabel(container, { supportHighlights: true });
    const iconClass = dom.$(".outline-element-icon");
    const decoration = dom.$(".outline-element-decoration");
    container.prepend(iconClass);
    container.appendChild(decoration);
    return new DocumentSymbolTemplate(container, iconLabel, iconClass, decoration);
  }
  renderElement(node, _index, template) {
    const { element } = node;
    const extraClasses = ["nowrap"];
    const options = {
      matches: createMatches(node.filterData),
      labelEscapeNewLines: true,
      extraClasses,
      title: localize("title.template", "{0} ({1})", element.symbol.name, symbolKindNames[element.symbol.kind])
    };
    if (this._configurationService.getValue(
      "outline.icons"
      /* OutlineConfigKeys.icons */
    )) {
      template.iconClass.className = "";
      template.iconClass.classList.add("outline-element-icon", "inline", ...ThemeIcon.asClassNameArray(SymbolKinds.toIcon(element.symbol.kind)));
    }
    if (element.symbol.tags.indexOf(
      1
      /* SymbolTag.Deprecated */
    ) >= 0) {
      extraClasses.push(`deprecated`);
      options.matches = [];
    }
    template.iconLabel.setLabel(element.symbol.name, element.symbol.detail, options);
    if (this._renderMarker) {
      this._renderMarkerInfo(element, template);
    }
  }
  _renderMarkerInfo(element, template) {
    if (!element.marker) {
      dom.hide(template.decoration);
      template.container.style.removeProperty("--outline-element-color");
      return;
    }
    const { count, topSev } = element.marker;
    const color = this._themeService.getColorTheme().getColor(topSev === MarkerSeverity.Error ? listErrorForeground : listWarningForeground);
    const cssColor = color ? color.toString() : "inherit";
    const problem = this._configurationService.getValue("problems.visibility");
    const configProblems = this._configurationService.getValue(
      "outline.problems.colors"
      /* OutlineConfigKeys.problemsColors */
    );
    if (!problem || !configProblems) {
      template.container.style.removeProperty("--outline-element-color");
    } else {
      template.container.style.setProperty("--outline-element-color", cssColor);
    }
    if (problem === void 0) {
      return;
    }
    const configBadges = this._configurationService.getValue(
      "outline.problems.badges"
      /* OutlineConfigKeys.problemsBadges */
    );
    if (!configBadges || !problem) {
      dom.hide(template.decoration);
    } else if (count > 0) {
      dom.show(template.decoration);
      template.decoration.classList.remove("bubble");
      template.decoration.innerText = count < 10 ? count.toString() : "+9";
      template.decoration.title = count === 1 ? localize("1.problem", "1 problem in this element") : localize("N.problem", "{0} problems in this element", count);
      template.decoration.style.setProperty("--outline-element-color", cssColor);
    } else {
      dom.show(template.decoration);
      template.decoration.classList.add("bubble");
      template.decoration.innerText = "\uEA71";
      template.decoration.title = localize("deep.problem", "Contains elements with problems");
      template.decoration.style.setProperty("--outline-element-color", cssColor);
    }
  }
  disposeTemplate(_template) {
    _template.iconLabel.dispose();
  }
};
DocumentSymbolRenderer = __decorate([
  __param(2, IConfigurationService),
  __param(3, IThemeService)
], DocumentSymbolRenderer);
let DocumentSymbolFilter = class DocumentSymbolFilter2 {
  static {
    __name(this, "DocumentSymbolFilter");
  }
  static {
    DocumentSymbolFilter_1 = this;
  }
  static {
    this.kindToConfigName = Object.freeze({
      [
        0
        /* SymbolKind.File */
      ]: "showFiles",
      [
        1
        /* SymbolKind.Module */
      ]: "showModules",
      [
        2
        /* SymbolKind.Namespace */
      ]: "showNamespaces",
      [
        3
        /* SymbolKind.Package */
      ]: "showPackages",
      [
        4
        /* SymbolKind.Class */
      ]: "showClasses",
      [
        5
        /* SymbolKind.Method */
      ]: "showMethods",
      [
        6
        /* SymbolKind.Property */
      ]: "showProperties",
      [
        7
        /* SymbolKind.Field */
      ]: "showFields",
      [
        8
        /* SymbolKind.Constructor */
      ]: "showConstructors",
      [
        9
        /* SymbolKind.Enum */
      ]: "showEnums",
      [
        10
        /* SymbolKind.Interface */
      ]: "showInterfaces",
      [
        11
        /* SymbolKind.Function */
      ]: "showFunctions",
      [
        12
        /* SymbolKind.Variable */
      ]: "showVariables",
      [
        13
        /* SymbolKind.Constant */
      ]: "showConstants",
      [
        14
        /* SymbolKind.String */
      ]: "showStrings",
      [
        15
        /* SymbolKind.Number */
      ]: "showNumbers",
      [
        16
        /* SymbolKind.Boolean */
      ]: "showBooleans",
      [
        17
        /* SymbolKind.Array */
      ]: "showArrays",
      [
        18
        /* SymbolKind.Object */
      ]: "showObjects",
      [
        19
        /* SymbolKind.Key */
      ]: "showKeys",
      [
        20
        /* SymbolKind.Null */
      ]: "showNull",
      [
        21
        /* SymbolKind.EnumMember */
      ]: "showEnumMembers",
      [
        22
        /* SymbolKind.Struct */
      ]: "showStructs",
      [
        23
        /* SymbolKind.Event */
      ]: "showEvents",
      [
        24
        /* SymbolKind.Operator */
      ]: "showOperators",
      [
        25
        /* SymbolKind.TypeParameter */
      ]: "showTypeParameters"
    });
  }
  constructor(_prefix, _textResourceConfigService) {
    this._prefix = _prefix;
    this._textResourceConfigService = _textResourceConfigService;
  }
  filter(element) {
    const outline = OutlineModel.get(element);
    if (!(element instanceof OutlineElement)) {
      return true;
    }
    const configName = DocumentSymbolFilter_1.kindToConfigName[element.symbol.kind];
    const configKey = `${this._prefix}.${configName}`;
    return this._textResourceConfigService.getValue(outline?.uri, configKey);
  }
};
DocumentSymbolFilter = DocumentSymbolFilter_1 = __decorate([
  __param(1, ITextResourceConfigurationService)
], DocumentSymbolFilter);
class DocumentSymbolComparator {
  static {
    __name(this, "DocumentSymbolComparator");
  }
  constructor() {
    this._collator = new dom.WindowIdleValue(mainWindow, () => new Intl.Collator(void 0, { numeric: true }));
  }
  compareByPosition(a, b) {
    if (a instanceof OutlineGroup && b instanceof OutlineGroup) {
      return a.order - b.order;
    } else if (a instanceof OutlineElement && b instanceof OutlineElement) {
      return Range.compareRangesUsingStarts(a.symbol.range, b.symbol.range) || this._collator.value.compare(a.symbol.name, b.symbol.name);
    }
    return 0;
  }
  compareByType(a, b) {
    if (a instanceof OutlineGroup && b instanceof OutlineGroup) {
      return a.order - b.order;
    } else if (a instanceof OutlineElement && b instanceof OutlineElement) {
      return a.symbol.kind - b.symbol.kind || this._collator.value.compare(a.symbol.name, b.symbol.name);
    }
    return 0;
  }
  compareByName(a, b) {
    if (a instanceof OutlineGroup && b instanceof OutlineGroup) {
      return a.order - b.order;
    } else if (a instanceof OutlineElement && b instanceof OutlineElement) {
      return this._collator.value.compare(a.symbol.name, b.symbol.name) || Range.compareRangesUsingStarts(a.symbol.range, b.symbol.range);
    }
    return 0;
  }
}
export {
  DocumentSymbolAccessibilityProvider,
  DocumentSymbolComparator,
  DocumentSymbolDragAndDrop,
  DocumentSymbolFilter,
  DocumentSymbolGroupRenderer,
  DocumentSymbolIdentityProvider,
  DocumentSymbolNavigationLabelProvider,
  DocumentSymbolRenderer,
  DocumentSymbolVirtualDelegate
};
//# sourceMappingURL=documentSymbolsTree.js.map
