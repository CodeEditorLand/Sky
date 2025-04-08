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
import * as dom from "../../../base/browser/dom.js";
import { KeybindingLabel } from "../../../base/browser/ui/keybindingLabel/keybindingLabel.js";
import { IListEvent, IListMouseEvent, IListRenderer, IListVirtualDelegate } from "../../../base/browser/ui/list/list.js";
import { List } from "../../../base/browser/ui/list/listWidget.js";
import { CancellationToken, CancellationTokenSource } from "../../../base/common/cancellation.js";
import { Codicon } from "../../../base/common/codicons.js";
import { ResolvedKeybinding } from "../../../base/common/keybindings.js";
import { Disposable } from "../../../base/common/lifecycle.js";
import { OS } from "../../../base/common/platform.js";
import { ThemeIcon } from "../../../base/common/themables.js";
import "./actionWidget.css";
import { localize } from "../../../nls.js";
import { IContextViewService } from "../../contextview/browser/contextView.js";
import { IKeybindingService } from "../../keybinding/common/keybinding.js";
import { defaultListStyles } from "../../theme/browser/defaultStyles.js";
import { asCssVariable } from "../../theme/common/colorRegistry.js";
import { ILayoutService } from "../../layout/browser/layoutService.js";
const acceptSelectedActionCommand = "acceptSelectedCodeAction";
const previewSelectedActionCommand = "previewSelectedCodeAction";
var ActionListItemKind = /* @__PURE__ */ ((ActionListItemKind2) => {
  ActionListItemKind2["Action"] = "action";
  ActionListItemKind2["Header"] = "header";
  return ActionListItemKind2;
})(ActionListItemKind || {});
class HeaderRenderer {
  static {
    __name(this, "HeaderRenderer");
  }
  get templateId() {
    return "header" /* Header */;
  }
  renderTemplate(container) {
    container.classList.add("group-header");
    const text = document.createElement("span");
    container.append(text);
    return { container, text };
  }
  renderElement(element, _index, templateData) {
    templateData.text.textContent = element.group?.title ?? "";
  }
  disposeTemplate(_templateData) {
  }
}
let ActionItemRenderer = class {
  constructor(_supportsPreview, _keybindingService) {
    this._supportsPreview = _supportsPreview;
    this._keybindingService = _keybindingService;
  }
  static {
    __name(this, "ActionItemRenderer");
  }
  get templateId() {
    return "action" /* Action */;
  }
  renderTemplate(container) {
    container.classList.add(this.templateId);
    const icon = document.createElement("div");
    icon.className = "icon";
    container.append(icon);
    const text = document.createElement("span");
    text.className = "title";
    container.append(text);
    const keybinding = new KeybindingLabel(container, OS);
    return { container, icon, text, keybinding };
  }
  renderElement(element, _index, data) {
    if (element.group?.icon) {
      data.icon.className = ThemeIcon.asClassName(element.group.icon);
      if (element.group.icon.color) {
        data.icon.style.color = asCssVariable(element.group.icon.color.id);
      }
    } else {
      data.icon.className = ThemeIcon.asClassName(Codicon.lightBulb);
      data.icon.style.color = "var(--vscode-editorLightBulb-foreground)";
    }
    if (!element.item || !element.label) {
      return;
    }
    dom.setVisibility(!element.hideIcon, data.icon);
    data.text.textContent = stripNewlines(element.label);
    data.keybinding.set(element.keybinding);
    dom.setVisibility(!!element.keybinding, data.keybinding.element);
    const actionTitle = this._keybindingService.lookupKeybinding(acceptSelectedActionCommand)?.getLabel();
    const previewTitle = this._keybindingService.lookupKeybinding(previewSelectedActionCommand)?.getLabel();
    data.container.classList.toggle("option-disabled", element.disabled);
    if (element.disabled) {
      data.container.title = element.label;
    } else if (actionTitle && previewTitle) {
      if (this._supportsPreview && element.canPreview) {
        data.container.title = localize({ key: "label-preview", comment: ['placeholders are keybindings, e.g "F2 to Apply, Shift+F2 to Preview"'] }, "{0} to Apply, {1} to Preview", actionTitle, previewTitle);
      } else {
        data.container.title = localize({ key: "label", comment: ['placeholder is a keybinding, e.g "F2 to Apply"'] }, "{0} to Apply", actionTitle);
      }
    } else {
      data.container.title = "";
    }
  }
  disposeTemplate(templateData) {
    templateData.keybinding.dispose();
  }
};
ActionItemRenderer = __decorateClass([
  __decorateParam(1, IKeybindingService)
], ActionItemRenderer);
class AcceptSelectedEvent extends UIEvent {
  static {
    __name(this, "AcceptSelectedEvent");
  }
  constructor() {
    super("acceptSelectedAction");
  }
}
class PreviewSelectedEvent extends UIEvent {
  static {
    __name(this, "PreviewSelectedEvent");
  }
  constructor() {
    super("previewSelectedAction");
  }
}
function getKeyboardNavigationLabel(item) {
  if (item.kind === "action") {
    return item.label;
  }
  return void 0;
}
__name(getKeyboardNavigationLabel, "getKeyboardNavigationLabel");
let ActionList = class extends Disposable {
  constructor(user, preview, items, _delegate, _contextViewService, _keybindingService, _layoutService) {
    super();
    this._delegate = _delegate;
    this._contextViewService = _contextViewService;
    this._keybindingService = _keybindingService;
    this._layoutService = _layoutService;
    this.domNode = document.createElement("div");
    this.domNode.classList.add("actionList");
    const virtualDelegate = {
      getHeight: /* @__PURE__ */ __name((element) => element.kind === "header" /* Header */ ? this._headerLineHeight : this._actionLineHeight, "getHeight"),
      getTemplateId: /* @__PURE__ */ __name((element) => element.kind, "getTemplateId")
    };
    this._list = this._register(new List(user, this.domNode, virtualDelegate, [
      new ActionItemRenderer(preview, this._keybindingService),
      new HeaderRenderer()
    ], {
      keyboardSupport: false,
      typeNavigationEnabled: true,
      keyboardNavigationLabelProvider: { getKeyboardNavigationLabel },
      accessibilityProvider: {
        getAriaLabel: /* @__PURE__ */ __name((element) => {
          if (element.kind === "action" /* Action */) {
            let label = element.label ? stripNewlines(element?.label) : "";
            if (element.disabled) {
              label = localize({ key: "customQuickFixWidget.labels", comment: [`Action widget labels for accessibility.`] }, "{0}, Disabled Reason: {1}", label, element.disabled);
            }
            return label;
          }
          return null;
        }, "getAriaLabel"),
        getWidgetAriaLabel: /* @__PURE__ */ __name(() => localize({ key: "customQuickFixWidget", comment: [`An action widget option`] }, "Action Widget"), "getWidgetAriaLabel"),
        getRole: /* @__PURE__ */ __name((e) => e.kind === "action" /* Action */ ? "option" : "separator", "getRole"),
        getWidgetRole: /* @__PURE__ */ __name(() => "listbox", "getWidgetRole")
      }
    }));
    this._list.style(defaultListStyles);
    this._register(this._list.onMouseClick((e) => this.onListClick(e)));
    this._register(this._list.onMouseOver((e) => this.onListHover(e)));
    this._register(this._list.onDidChangeFocus(() => this.onFocus()));
    this._register(this._list.onDidChangeSelection((e) => this.onListSelection(e)));
    this._allMenuItems = items;
    this._list.splice(0, this._list.length, this._allMenuItems);
    if (this._list.length) {
      this.focusNext();
    }
  }
  static {
    __name(this, "ActionList");
  }
  domNode;
  _list;
  _actionLineHeight = 24;
  _headerLineHeight = 26;
  _allMenuItems;
  cts = this._register(new CancellationTokenSource());
  focusCondition(element) {
    return !element.disabled && element.kind === "action" /* Action */;
  }
  hide(didCancel) {
    this._delegate.onHide(didCancel);
    this.cts.cancel();
    this._contextViewService.hideContextView();
  }
  layout(minWidth) {
    const numHeaders = this._allMenuItems.filter((item) => item.kind === "header").length;
    const itemsHeight = this._allMenuItems.length * this._actionLineHeight;
    const heightWithHeaders = itemsHeight + numHeaders * this._headerLineHeight - numHeaders * this._actionLineHeight;
    this._list.layout(heightWithHeaders);
    let maxWidth = minWidth;
    if (this._allMenuItems.length >= 50) {
      maxWidth = 380;
    } else {
      const itemWidths = this._allMenuItems.map((_, index) => {
        const element = this.domNode.ownerDocument.getElementById(this._list.getElementID(index));
        if (element) {
          element.style.width = "auto";
          const width = element.getBoundingClientRect().width;
          element.style.width = "";
          return width;
        }
        return 0;
      });
      maxWidth = Math.max(...itemWidths, minWidth);
    }
    const maxVhPrecentage = 0.7;
    const height = Math.min(heightWithHeaders, this._layoutService.getContainer(dom.getWindow(this.domNode)).clientHeight * maxVhPrecentage);
    this._list.layout(height, maxWidth);
    this.domNode.style.height = `${height}px`;
    this._list.domFocus();
    return maxWidth;
  }
  focusPrevious() {
    this._list.focusPrevious(1, true, void 0, this.focusCondition);
  }
  focusNext() {
    this._list.focusNext(1, true, void 0, this.focusCondition);
  }
  acceptSelected(preview) {
    const focused = this._list.getFocus();
    if (focused.length === 0) {
      return;
    }
    const focusIndex = focused[0];
    const element = this._list.element(focusIndex);
    if (!this.focusCondition(element)) {
      return;
    }
    const event = preview ? new PreviewSelectedEvent() : new AcceptSelectedEvent();
    this._list.setSelection([focusIndex], event);
  }
  onListSelection(e) {
    if (!e.elements.length) {
      return;
    }
    const element = e.elements[0];
    if (element.item && this.focusCondition(element)) {
      this._delegate.onSelect(element.item, e.browserEvent instanceof PreviewSelectedEvent);
    } else {
      this._list.setSelection([]);
    }
  }
  onFocus() {
    const focused = this._list.getFocus();
    if (focused.length === 0) {
      return;
    }
    const focusIndex = focused[0];
    const element = this._list.element(focusIndex);
    this._delegate.onFocus?.(element.item);
  }
  async onListHover(e) {
    const element = e.element;
    if (element && element.item && this.focusCondition(element)) {
      if (this._delegate.onHover && !element.disabled && element.kind === "action" /* Action */) {
        const result = await this._delegate.onHover(element.item, this.cts.token);
        element.canPreview = result ? result.canPreview : void 0;
      }
      if (e.index) {
        this._list.splice(e.index, 1, [element]);
      }
    }
    this._list.setFocus(typeof e.index === "number" ? [e.index] : []);
  }
  onListClick(e) {
    if (e.element && this.focusCondition(e.element)) {
      this._list.setFocus([]);
    }
  }
};
ActionList = __decorateClass([
  __decorateParam(4, IContextViewService),
  __decorateParam(5, IKeybindingService),
  __decorateParam(6, ILayoutService)
], ActionList);
function stripNewlines(str) {
  return str.replace(/\r\n|\r|\n/g, " ");
}
__name(stripNewlines, "stripNewlines");
export {
  ActionList,
  ActionListItemKind,
  acceptSelectedActionCommand,
  previewSelectedActionCommand
};
//# sourceMappingURL=actionList.js.map
