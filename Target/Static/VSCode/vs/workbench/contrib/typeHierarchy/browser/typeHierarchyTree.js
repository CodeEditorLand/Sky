var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { IAsyncDataSource, ITreeRenderer, ITreeNode, ITreeSorter } from "../../../../base/browser/ui/tree/tree.js";
import { TypeHierarchyDirection, TypeHierarchyItem, TypeHierarchyModel } from "../common/typeHierarchy.js";
import { CancellationToken } from "../../../../base/common/cancellation.js";
import { IIdentityProvider, IListVirtualDelegate } from "../../../../base/browser/ui/list/list.js";
import { FuzzyScore, createMatches } from "../../../../base/common/filters.js";
import { IconLabel } from "../../../../base/browser/ui/iconLabel/iconLabel.js";
import { SymbolKinds, SymbolTag } from "../../../../editor/common/languages.js";
import { compare } from "../../../../base/common/strings.js";
import { Range } from "../../../../editor/common/core/range.js";
import { IListAccessibilityProvider } from "../../../../base/browser/ui/list/listWidget.js";
import { localize } from "../../../../nls.js";
import { ThemeIcon } from "../../../../base/common/themables.js";
class Type {
  constructor(item, model, parent) {
    this.item = item;
    this.model = model;
    this.parent = parent;
  }
  static {
    __name(this, "Type");
  }
  static compare(a, b) {
    let res = compare(a.item.uri.toString(), b.item.uri.toString());
    if (res === 0) {
      res = Range.compareRangesUsingStarts(a.item.range, b.item.range);
    }
    return res;
  }
}
class DataSource {
  constructor(getDirection) {
    this.getDirection = getDirection;
  }
  static {
    __name(this, "DataSource");
  }
  hasChildren() {
    return true;
  }
  async getChildren(element) {
    if (element instanceof TypeHierarchyModel) {
      return element.roots.map((root) => new Type(root, element, void 0));
    }
    const { model, item } = element;
    if (this.getDirection() === TypeHierarchyDirection.Supertypes) {
      return (await model.provideSupertypes(item, CancellationToken.None)).map((item2) => {
        return new Type(
          item2,
          model,
          element
        );
      });
    } else {
      return (await model.provideSubtypes(item, CancellationToken.None)).map((item2) => {
        return new Type(
          item2,
          model,
          element
        );
      });
    }
  }
}
class Sorter {
  static {
    __name(this, "Sorter");
  }
  compare(element, otherElement) {
    return Type.compare(element, otherElement);
  }
}
class IdentityProvider {
  constructor(getDirection) {
    this.getDirection = getDirection;
  }
  static {
    __name(this, "IdentityProvider");
  }
  getId(element) {
    let res = this.getDirection() + JSON.stringify(element.item.uri) + JSON.stringify(element.item.range);
    if (element.parent) {
      res += this.getId(element.parent);
    }
    return res;
  }
}
class TypeRenderingTemplate {
  constructor(icon, label) {
    this.icon = icon;
    this.label = label;
  }
  static {
    __name(this, "TypeRenderingTemplate");
  }
}
class TypeRenderer {
  static {
    __name(this, "TypeRenderer");
  }
  static id = "TypeRenderer";
  templateId = TypeRenderer.id;
  renderTemplate(container) {
    container.classList.add("typehierarchy-element");
    const icon = document.createElement("div");
    container.appendChild(icon);
    const label = new IconLabel(container, { supportHighlights: true });
    return new TypeRenderingTemplate(icon, label);
  }
  renderElement(node, _index, template) {
    const { element, filterData } = node;
    const deprecated = element.item.tags?.includes(SymbolTag.Deprecated);
    template.icon.classList.add("inline", ...ThemeIcon.asClassNameArray(SymbolKinds.toIcon(element.item.kind)));
    template.label.setLabel(
      element.item.name,
      element.item.detail,
      { labelEscapeNewLines: true, matches: createMatches(filterData), strikethrough: deprecated }
    );
  }
  disposeTemplate(template) {
    template.label.dispose();
  }
}
class VirtualDelegate {
  static {
    __name(this, "VirtualDelegate");
  }
  getHeight(_element) {
    return 22;
  }
  getTemplateId(_element) {
    return TypeRenderer.id;
  }
}
class AccessibilityProvider {
  constructor(getDirection) {
    this.getDirection = getDirection;
  }
  static {
    __name(this, "AccessibilityProvider");
  }
  getWidgetAriaLabel() {
    return localize("tree.aria", "Type Hierarchy");
  }
  getAriaLabel(element) {
    if (this.getDirection() === TypeHierarchyDirection.Supertypes) {
      return localize("supertypes", "supertypes of {0}", element.item.name);
    } else {
      return localize("subtypes", "subtypes of {0}", element.item.name);
    }
  }
}
export {
  AccessibilityProvider,
  DataSource,
  IdentityProvider,
  Sorter,
  Type,
  TypeRenderer,
  VirtualDelegate
};
//# sourceMappingURL=typeHierarchyTree.js.map
