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
import * as dom from "../../../../../base/browser/dom.js";
import { IKeyboardEvent } from "../../../../../base/browser/keyboardEvent.js";
import { CountBadge } from "../../../../../base/browser/ui/countBadge/countBadge.js";
import { HighlightedLabel } from "../../../../../base/browser/ui/highlightedlabel/highlightedLabel.js";
import { IconLabel } from "../../../../../base/browser/ui/iconLabel/iconLabel.js";
import { IIdentityProvider, IKeyboardNavigationLabelProvider, IListVirtualDelegate } from "../../../../../base/browser/ui/list/list.js";
import { IListAccessibilityProvider } from "../../../../../base/browser/ui/list/listWidget.js";
import { IAsyncDataSource, ITreeNode, ITreeRenderer } from "../../../../../base/browser/ui/tree/tree.js";
import { createMatches, FuzzyScore, IMatch } from "../../../../../base/common/filters.js";
import { Disposable } from "../../../../../base/common/lifecycle.js";
import { basename, dirname } from "../../../../../base/common/resources.js";
import { ITextModelService } from "../../../../common/services/resolverService.js";
import { localize } from "../../../../../nls.js";
import { IInstantiationService } from "../../../../../platform/instantiation/common/instantiation.js";
import { IKeybindingService } from "../../../../../platform/keybinding/common/keybinding.js";
import { ILabelService } from "../../../../../platform/label/common/label.js";
import { defaultCountBadgeStyles } from "../../../../../platform/theme/browser/defaultStyles.js";
import { FileReferences, OneReference, ReferencesModel } from "../referencesModel.js";
let DataSource = class {
  constructor(_resolverService) {
    this._resolverService = _resolverService;
  }
  static {
    __name(this, "DataSource");
  }
  hasChildren(element) {
    if (element instanceof ReferencesModel) {
      return true;
    }
    if (element instanceof FileReferences) {
      return true;
    }
    return false;
  }
  getChildren(element) {
    if (element instanceof ReferencesModel) {
      return element.groups;
    }
    if (element instanceof FileReferences) {
      return element.resolve(this._resolverService).then((val) => {
        return val.children;
      });
    }
    throw new Error("bad tree");
  }
};
DataSource = __decorateClass([
  __decorateParam(0, ITextModelService)
], DataSource);
class Delegate {
  static {
    __name(this, "Delegate");
  }
  getHeight() {
    return 23;
  }
  getTemplateId(element) {
    if (element instanceof FileReferences) {
      return FileReferencesRenderer.id;
    } else {
      return OneReferenceRenderer.id;
    }
  }
}
let StringRepresentationProvider = class {
  constructor(_keybindingService) {
    this._keybindingService = _keybindingService;
  }
  static {
    __name(this, "StringRepresentationProvider");
  }
  getKeyboardNavigationLabel(element) {
    if (element instanceof OneReference) {
      const parts = element.parent.getPreview(element)?.preview(element.range);
      if (parts) {
        return parts.value;
      }
    }
    return basename(element.uri);
  }
  mightProducePrintableCharacter(event) {
    return this._keybindingService.mightProducePrintableCharacter(event);
  }
};
StringRepresentationProvider = __decorateClass([
  __decorateParam(0, IKeybindingService)
], StringRepresentationProvider);
class IdentityProvider {
  static {
    __name(this, "IdentityProvider");
  }
  getId(element) {
    return element instanceof OneReference ? element.id : element.uri;
  }
}
let FileReferencesTemplate = class extends Disposable {
  constructor(container, _labelService) {
    super();
    this._labelService = _labelService;
    const parent = document.createElement("div");
    parent.classList.add("reference-file");
    this.file = this._register(new IconLabel(parent, { supportHighlights: true }));
    this.badge = this._register(new CountBadge(dom.append(parent, dom.$(".count")), {}, defaultCountBadgeStyles));
    container.appendChild(parent);
  }
  static {
    __name(this, "FileReferencesTemplate");
  }
  file;
  badge;
  set(element, matches) {
    const parent = dirname(element.uri);
    this.file.setLabel(
      this._labelService.getUriBasenameLabel(element.uri),
      this._labelService.getUriLabel(parent, { relative: true }),
      { title: this._labelService.getUriLabel(element.uri), matches }
    );
    const len = element.children.length;
    this.badge.setCount(len);
    if (len > 1) {
      this.badge.setTitleFormat(localize("referencesCount", "{0} references", len));
    } else {
      this.badge.setTitleFormat(localize("referenceCount", "{0} reference", len));
    }
  }
};
FileReferencesTemplate = __decorateClass([
  __decorateParam(1, ILabelService)
], FileReferencesTemplate);
let FileReferencesRenderer = class {
  constructor(_instantiationService) {
    this._instantiationService = _instantiationService;
  }
  static {
    __name(this, "FileReferencesRenderer");
  }
  static id = "FileReferencesRenderer";
  templateId = FileReferencesRenderer.id;
  renderTemplate(container) {
    return this._instantiationService.createInstance(FileReferencesTemplate, container);
  }
  renderElement(node, index, template) {
    template.set(node.element, createMatches(node.filterData));
  }
  disposeTemplate(templateData) {
    templateData.dispose();
  }
};
FileReferencesRenderer = __decorateClass([
  __decorateParam(0, IInstantiationService)
], FileReferencesRenderer);
class OneReferenceTemplate extends Disposable {
  static {
    __name(this, "OneReferenceTemplate");
  }
  label;
  constructor(container) {
    super();
    this.label = this._register(new HighlightedLabel(container));
  }
  set(element, score) {
    const preview = element.parent.getPreview(element)?.preview(element.range);
    if (!preview || !preview.value) {
      this.label.set(`${basename(element.uri)}:${element.range.startLineNumber + 1}:${element.range.startColumn + 1}`);
    } else {
      const { value, highlight } = preview;
      if (score && !FuzzyScore.isDefault(score)) {
        this.label.element.classList.toggle("referenceMatch", false);
        this.label.set(value, createMatches(score));
      } else {
        this.label.element.classList.toggle("referenceMatch", true);
        this.label.set(value, [highlight]);
      }
    }
  }
}
class OneReferenceRenderer {
  static {
    __name(this, "OneReferenceRenderer");
  }
  static id = "OneReferenceRenderer";
  templateId = OneReferenceRenderer.id;
  renderTemplate(container) {
    return new OneReferenceTemplate(container);
  }
  renderElement(node, index, templateData) {
    templateData.set(node.element, node.filterData);
  }
  disposeTemplate(templateData) {
    templateData.dispose();
  }
}
class AccessibilityProvider {
  static {
    __name(this, "AccessibilityProvider");
  }
  getWidgetAriaLabel() {
    return localize("treeAriaLabel", "References");
  }
  getAriaLabel(element) {
    return element.ariaMessage;
  }
}
export {
  AccessibilityProvider,
  DataSource,
  Delegate,
  FileReferencesRenderer,
  IdentityProvider,
  OneReferenceRenderer,
  StringRepresentationProvider
};
//# sourceMappingURL=referencesTree.js.map
