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
import { $, append, clearNode } from "../../../base/browser/dom.js";
import { Widget } from "../../../base/browser/ui/widget.js";
import { IAction } from "../../../base/common/actions.js";
import { Emitter } from "../../../base/common/event.js";
import { Disposable, DisposableStore, toDisposable } from "../../../base/common/lifecycle.js";
import { getFlatActionBarActions } from "./menuEntryActionViewItem.js";
import { IMenu, IMenuService, MenuId } from "../common/actions.js";
import { IContextKeyService } from "../../contextkey/common/contextkey.js";
import { IInstantiationService } from "../../instantiation/common/instantiation.js";
import { asCssVariable, asCssVariableWithDefault, buttonBackground, buttonForeground, contrastBorder, editorBackground, editorForeground } from "../../theme/common/colorRegistry.js";
class FloatingClickWidget extends Widget {
  constructor(label) {
    super();
    this.label = label;
    this._domNode = $(".floating-click-widget");
    this._domNode.style.padding = "6px 11px";
    this._domNode.style.borderRadius = "2px";
    this._domNode.style.cursor = "pointer";
    this._domNode.style.zIndex = "1";
  }
  static {
    __name(this, "FloatingClickWidget");
  }
  _onClick = this._register(new Emitter());
  onClick = this._onClick.event;
  _domNode;
  getDomNode() {
    return this._domNode;
  }
  render() {
    clearNode(this._domNode);
    this._domNode.style.backgroundColor = asCssVariableWithDefault(buttonBackground, asCssVariable(editorBackground));
    this._domNode.style.color = asCssVariableWithDefault(buttonForeground, asCssVariable(editorForeground));
    this._domNode.style.border = `1px solid ${asCssVariable(contrastBorder)}`;
    append(this._domNode, $("")).textContent = this.label;
    this.onclick(this._domNode, () => this._onClick.fire());
  }
}
let AbstractFloatingClickMenu = class extends Disposable {
  static {
    __name(this, "AbstractFloatingClickMenu");
  }
  renderEmitter = new Emitter();
  onDidRender = this.renderEmitter.event;
  menu;
  constructor(menuId, menuService, contextKeyService) {
    super();
    this.menu = this._register(menuService.createMenu(menuId, contextKeyService));
  }
  /** Should be called in implementation constructors after they initialized */
  render() {
    const menuDisposables = this._register(new DisposableStore());
    const renderMenuAsFloatingClickBtn = /* @__PURE__ */ __name(() => {
      menuDisposables.clear();
      if (!this.isVisible()) {
        return;
      }
      const actions = getFlatActionBarActions(this.menu.getActions({ renderShortTitle: true, shouldForwardArgs: true }));
      if (actions.length === 0) {
        return;
      }
      const [first] = actions;
      const widget = this.createWidget(first, menuDisposables);
      menuDisposables.add(widget);
      menuDisposables.add(widget.onClick(() => first.run(this.getActionArg())));
      widget.render();
    }, "renderMenuAsFloatingClickBtn");
    this._register(this.menu.onDidChange(renderMenuAsFloatingClickBtn));
    renderMenuAsFloatingClickBtn();
  }
  getActionArg() {
    return void 0;
  }
  isVisible() {
    return true;
  }
};
AbstractFloatingClickMenu = __decorateClass([
  __decorateParam(1, IMenuService),
  __decorateParam(2, IContextKeyService)
], AbstractFloatingClickMenu);
let FloatingClickMenu = class extends AbstractFloatingClickMenu {
  constructor(options, instantiationService, menuService, contextKeyService) {
    super(options.menuId, menuService, contextKeyService);
    this.options = options;
    this.instantiationService = instantiationService;
    this.render();
  }
  static {
    __name(this, "FloatingClickMenu");
  }
  createWidget(action, disposable) {
    const w = this.instantiationService.createInstance(FloatingClickWidget, action.label);
    const node = w.getDomNode();
    this.options.container.appendChild(node);
    disposable.add(toDisposable(() => node.remove()));
    return w;
  }
  getActionArg() {
    return this.options.getActionArg();
  }
};
FloatingClickMenu = __decorateClass([
  __decorateParam(1, IInstantiationService),
  __decorateParam(2, IMenuService),
  __decorateParam(3, IContextKeyService)
], FloatingClickMenu);
export {
  AbstractFloatingClickMenu,
  FloatingClickMenu,
  FloatingClickWidget
};
//# sourceMappingURL=floatingMenu.js.map
