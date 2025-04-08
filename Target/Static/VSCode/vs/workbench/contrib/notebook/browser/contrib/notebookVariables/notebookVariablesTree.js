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
import * as dom from "../../../../../../base/browser/dom.js";
import { IListVirtualDelegate } from "../../../../../../base/browser/ui/list/list.js";
import { IListAccessibilityProvider } from "../../../../../../base/browser/ui/list/listWidget.js";
import { ITreeNode, ITreeRenderer } from "../../../../../../base/browser/ui/tree/tree.js";
import { FuzzyScore } from "../../../../../../base/common/filters.js";
import { DisposableStore } from "../../../../../../base/common/lifecycle.js";
import { localize } from "../../../../../../nls.js";
import { IInstantiationService } from "../../../../../../platform/instantiation/common/instantiation.js";
import { WorkbenchObjectTree } from "../../../../../../platform/list/browser/listService.js";
import { DebugExpressionRenderer } from "../../../../debug/browser/debugExpressionRenderer.js";
import { INotebookVariableElement } from "./notebookVariablesDataSource.js";
const $ = dom.$;
const MAX_VALUE_RENDER_LENGTH_IN_VIEWLET = 1024;
class NotebookVariablesTree extends WorkbenchObjectTree {
  static {
    __name(this, "NotebookVariablesTree");
  }
}
class NotebookVariablesDelegate {
  static {
    __name(this, "NotebookVariablesDelegate");
  }
  getHeight(element) {
    return 22;
  }
  getTemplateId(element) {
    return NotebookVariableRenderer.ID;
  }
}
let NotebookVariableRenderer = class {
  static {
    __name(this, "NotebookVariableRenderer");
  }
  expressionRenderer;
  static ID = "variableElement";
  get templateId() {
    return NotebookVariableRenderer.ID;
  }
  constructor(instantiationService) {
    this.expressionRenderer = instantiationService.createInstance(DebugExpressionRenderer);
  }
  renderTemplate(container) {
    const expression = dom.append(container, $(".expression"));
    const name = dom.append(expression, $("span.name"));
    const value = dom.append(expression, $("span.value"));
    const template = { expression, name, value, elementDisposables: new DisposableStore() };
    return template;
  }
  renderElement(element, _index, data) {
    const text = element.element.value.trim() !== "" ? `${element.element.name}:` : element.element.name;
    data.name.textContent = text;
    data.name.title = element.element.type ?? "";
    data.elementDisposables.add(this.expressionRenderer.renderValue(data.value, element.element, {
      colorize: true,
      maxValueLength: MAX_VALUE_RENDER_LENGTH_IN_VIEWLET,
      session: void 0
    }));
  }
  disposeElement(element, index, templateData, height) {
    templateData.elementDisposables.clear();
  }
  disposeTemplate(templateData) {
    templateData.elementDisposables.dispose();
  }
};
NotebookVariableRenderer = __decorateClass([
  __decorateParam(0, IInstantiationService)
], NotebookVariableRenderer);
class NotebookVariableAccessibilityProvider {
  static {
    __name(this, "NotebookVariableAccessibilityProvider");
  }
  getWidgetAriaLabel() {
    return localize("debugConsole", "Notebook Variables");
  }
  getAriaLabel(element) {
    return localize("notebookVariableAriaLabel", "Variable {0}, value {1}", element.name, element.value);
  }
}
export {
  NotebookVariableAccessibilityProvider,
  NotebookVariableRenderer,
  NotebookVariablesDelegate,
  NotebookVariablesTree
};
//# sourceMappingURL=notebookVariablesTree.js.map
