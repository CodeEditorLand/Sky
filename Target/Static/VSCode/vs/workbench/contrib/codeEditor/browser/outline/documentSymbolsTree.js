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
import { IDragAndDropData } from "../../../../../base/browser/dnd.js";
import * as dom from "../../../../../base/browser/dom.js";
import { HighlightedLabel } from "../../../../../base/browser/ui/highlightedlabel/highlightedLabel.js";
import { IconLabel, IIconLabelValueOptions } from "../../../../../base/browser/ui/iconLabel/iconLabel.js";
import { IIdentityProvider, IKeyboardNavigationLabelProvider, IListVirtualDelegate } from "../../../../../base/browser/ui/list/list.js";
import { ElementsDragAndDropData } from "../../../../../base/browser/ui/list/listView.js";
import { IListAccessibilityProvider } from "../../../../../base/browser/ui/list/listWidget.js";
import { ITreeDragAndDrop, ITreeDragOverReaction, ITreeFilter, ITreeNode, ITreeRenderer } from "../../../../../base/browser/ui/tree/tree.js";
import { mainWindow } from "../../../../../base/browser/window.js";
import { createMatches, FuzzyScore } from "../../../../../base/common/filters.js";
import { ThemeIcon } from "../../../../../base/common/themables.js";
import { URI } from "../../../../../base/common/uri.js";
import { Range } from "../../../../../editor/common/core/range.js";
import { DocumentSymbol, getAriaLabelForSymbol, SymbolKind, symbolKindNames, SymbolKinds, SymbolTag } from "../../../../../editor/common/languages.js";
import { ITextResourceConfigurationService } from "../../../../../editor/common/services/textResourceConfiguration.js";
import { OutlineElement, OutlineGroup, OutlineModel } from "../../../../../editor/contrib/documentSymbols/browser/outlineModel.js";
import "../../../../../editor/contrib/symbolIcons/browser/symbolIcons.js";
import { localize } from "../../../../../nls.js";
import { IConfigurationService } from "../../../../../platform/configuration/common/configuration.js";
import { fillInSymbolsDragData, IResourceStat } from "../../../../../platform/dnd/browser/dnd.js";
import { IInstantiationService } from "../../../../../platform/instantiation/common/instantiation.js";
import { MarkerSeverity } from "../../../../../platform/markers/common/markers.js";
import { withSelection } from "../../../../../platform/opener/common/opener.js";
import { listErrorForeground, listWarningForeground } from "../../../../../platform/theme/common/colorRegistry.js";
import { IThemeService } from "../../../../../platform/theme/common/themeService.js";
import { fillEditorsDragData } from "../../../../browser/dnd.js";
import { IOutlineComparator, OutlineConfigKeys, OutlineTarget } from "../../../../services/outline/browser/outline.js";
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
  constructor(_ariaLabel) {
    this._ariaLabel = _ariaLabel;
  }
  static {
    __name(this, "DocumentSymbolAccessibilityProvider");
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
let DocumentSymbolDragAndDrop = class {
  constructor(_instantiationService) {
    this._instantiationService = _instantiationService;
  }
  static {
    __name(this, "DocumentSymbolDragAndDrop");
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
DocumentSymbolDragAndDrop = __decorateClass([
  __decorateParam(0, IInstantiationService)
], DocumentSymbolDragAndDrop);
function symbolRangeUri(resource, symbol) {
  return withSelection(resource, symbol.range);
}
__name(symbolRangeUri, "symbolRangeUri");
class DocumentSymbolGroupTemplate {
  constructor(labelContainer, label) {
    this.labelContainer = labelContainer;
    this.label = label;
  }
  static {
    __name(this, "DocumentSymbolGroupTemplate");
  }
  static id = "DocumentSymbolGroupTemplate";
  dispose() {
    this.label.dispose();
  }
}
class DocumentSymbolTemplate {
  constructor(container, iconLabel, iconClass, decoration) {
    this.container = container;
    this.iconLabel = iconLabel;
    this.iconClass = iconClass;
    this.decoration = decoration;
  }
  static {
    __name(this, "DocumentSymbolTemplate");
  }
  static id = "DocumentSymbolTemplate";
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
  templateId = DocumentSymbolGroupTemplate.id;
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
let DocumentSymbolRenderer = class {
  constructor(_renderMarker, target, _configurationService, _themeService) {
    this._renderMarker = _renderMarker;
    this._configurationService = _configurationService;
    this._themeService = _themeService;
  }
  static {
    __name(this, "DocumentSymbolRenderer");
  }
  templateId = DocumentSymbolTemplate.id;
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
    if (this._configurationService.getValue(OutlineConfigKeys.icons)) {
      template.iconClass.className = "";
      template.iconClass.classList.add("outline-element-icon", "inline", ...ThemeIcon.asClassNameArray(SymbolKinds.toIcon(element.symbol.kind)));
    }
    if (element.symbol.tags.indexOf(SymbolTag.Deprecated) >= 0) {
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
    const configProblems = this._configurationService.getValue(OutlineConfigKeys.problemsColors);
    if (!problem || !configProblems) {
      template.container.style.removeProperty("--outline-element-color");
    } else {
      template.container.style.setProperty("--outline-element-color", cssColor);
    }
    if (problem === void 0) {
      return;
    }
    const configBadges = this._configurationService.getValue(OutlineConfigKeys.problemsBadges);
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
DocumentSymbolRenderer = __decorateClass([
  __decorateParam(2, IConfigurationService),
  __decorateParam(3, IThemeService)
], DocumentSymbolRenderer);
let DocumentSymbolFilter = class {
  constructor(_prefix, _textResourceConfigService) {
    this._prefix = _prefix;
    this._textResourceConfigService = _textResourceConfigService;
  }
  static {
    __name(this, "DocumentSymbolFilter");
  }
  static kindToConfigName = Object.freeze({
    [SymbolKind.File]: "showFiles",
    [SymbolKind.Module]: "showModules",
    [SymbolKind.Namespace]: "showNamespaces",
    [SymbolKind.Package]: "showPackages",
    [SymbolKind.Class]: "showClasses",
    [SymbolKind.Method]: "showMethods",
    [SymbolKind.Property]: "showProperties",
    [SymbolKind.Field]: "showFields",
    [SymbolKind.Constructor]: "showConstructors",
    [SymbolKind.Enum]: "showEnums",
    [SymbolKind.Interface]: "showInterfaces",
    [SymbolKind.Function]: "showFunctions",
    [SymbolKind.Variable]: "showVariables",
    [SymbolKind.Constant]: "showConstants",
    [SymbolKind.String]: "showStrings",
    [SymbolKind.Number]: "showNumbers",
    [SymbolKind.Boolean]: "showBooleans",
    [SymbolKind.Array]: "showArrays",
    [SymbolKind.Object]: "showObjects",
    [SymbolKind.Key]: "showKeys",
    [SymbolKind.Null]: "showNull",
    [SymbolKind.EnumMember]: "showEnumMembers",
    [SymbolKind.Struct]: "showStructs",
    [SymbolKind.Event]: "showEvents",
    [SymbolKind.Operator]: "showOperators",
    [SymbolKind.TypeParameter]: "showTypeParameters"
  });
  filter(element) {
    const outline = OutlineModel.get(element);
    if (!(element instanceof OutlineElement)) {
      return true;
    }
    const configName = DocumentSymbolFilter.kindToConfigName[element.symbol.kind];
    const configKey = `${this._prefix}.${configName}`;
    return this._textResourceConfigService.getValue(outline?.uri, configKey);
  }
};
DocumentSymbolFilter = __decorateClass([
  __decorateParam(1, ITextResourceConfigurationService)
], DocumentSymbolFilter);
class DocumentSymbolComparator {
  static {
    __name(this, "DocumentSymbolComparator");
  }
  _collator = new dom.WindowIdleValue(mainWindow, () => new Intl.Collator(void 0, { numeric: true }));
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
