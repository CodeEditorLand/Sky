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
import { AccessibleViewProviderId, AccessibleViewType, IAccessibleViewContentProvider, IAccessibleViewService } from "../../../../platform/accessibility/browser/accessibleView.js";
import { AccessibilityVerbositySettingId } from "../../accessibility/browser/accessibilityConfiguration.js";
import { IReplElement } from "../common/debug.js";
import { IAccessibleViewImplementation } from "../../../../platform/accessibility/browser/accessibleViewRegistry.js";
import { ServicesAccessor } from "../../../../platform/instantiation/common/instantiation.js";
import { getReplView, Repl } from "./repl.js";
import { IViewsService } from "../../../services/views/common/viewsService.js";
import { ContextKeyExpr } from "../../../../platform/contextkey/common/contextkey.js";
import { Emitter, Event } from "../../../../base/common/event.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
import { Position } from "../../../../editor/common/core/position.js";
class ReplAccessibleView {
  static {
    __name(this, "ReplAccessibleView");
  }
  priority = 70;
  name = "debugConsole";
  when = ContextKeyExpr.equals("focusedView", "workbench.panel.repl.view");
  type = AccessibleViewType.View;
  getProvider(accessor) {
    const viewsService = accessor.get(IViewsService);
    const accessibleViewService = accessor.get(IAccessibleViewService);
    const replView = getReplView(viewsService);
    if (!replView) {
      return void 0;
    }
    const focusedElement = replView.getFocusedElement();
    return new ReplOutputAccessibleViewProvider(replView, focusedElement, accessibleViewService);
  }
}
let ReplOutputAccessibleViewProvider = class extends Disposable {
  constructor(_replView, _focusedElement, _accessibleViewService) {
    super();
    this._replView = _replView;
    this._focusedElement = _focusedElement;
    this._accessibleViewService = _accessibleViewService;
    this._treeHadFocus = !!_focusedElement;
  }
  static {
    __name(this, "ReplOutputAccessibleViewProvider");
  }
  id = AccessibleViewProviderId.Repl;
  _content;
  _onDidChangeContent = this._register(new Emitter());
  onDidChangeContent = this._onDidChangeContent.event;
  _onDidResolveChildren = this._register(new Emitter());
  onDidResolveChildren = this._onDidResolveChildren.event;
  verbositySettingKey = AccessibilityVerbositySettingId.Debug;
  options = {
    type: AccessibleViewType.View
  };
  _elementPositionMap = /* @__PURE__ */ new Map();
  _treeHadFocus = false;
  provideContent() {
    const debugSession = this._replView.getDebugSession();
    if (!debugSession) {
      return "No debug session available.";
    }
    const elements = debugSession.getReplElements();
    if (!elements.length) {
      return "No output in the debug console.";
    }
    if (!this._content) {
      this._updateContent(elements);
    }
    return this._content ?? elements.map((e) => e.toString(true)).join("\n");
  }
  onClose() {
    this._content = void 0;
    this._elementPositionMap.clear();
    if (this._treeHadFocus) {
      return this._replView.focusTree();
    }
    this._replView.getReplInput().focus();
  }
  onOpen() {
    this._register(this.onDidResolveChildren(() => {
      this._onDidChangeContent.fire();
      queueMicrotask(() => {
        if (this._focusedElement) {
          const position = this._elementPositionMap.get(this._focusedElement.getId());
          if (position) {
            this._accessibleViewService.setPosition(position, true);
          }
        }
      });
    }));
  }
  async _updateContent(elements) {
    const dataSource = this._replView.getReplDataSource();
    if (!dataSource) {
      return;
    }
    let line = 1;
    const content = [];
    for (const e of elements) {
      content.push(e.toString().replace(/\n/g, ""));
      this._elementPositionMap.set(e.getId(), new Position(line, 1));
      line++;
      if (dataSource.hasChildren(e)) {
        const childContent = [];
        const children = await dataSource.getChildren(e);
        for (const child of children) {
          const id = child.getId();
          if (!this._elementPositionMap.has(id)) {
            this._elementPositionMap.set(id, new Position(line, 1));
          }
          childContent.push("  " + child.toString());
          line++;
        }
        content.push(childContent.join("\n"));
      }
    }
    this._content = content.join("\n");
    this._onDidResolveChildren.fire();
  }
};
ReplOutputAccessibleViewProvider = __decorateClass([
  __decorateParam(2, IAccessibleViewService)
], ReplOutputAccessibleViewProvider);
export {
  ReplAccessibleView
};
//# sourceMappingURL=replAccessibleView.js.map
