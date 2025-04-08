var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Widget } from "../widget.js";
import { ThemeIcon } from "../../../common/themables.js";
import { Emitter } from "../../../common/event.js";
import "./radio.css";
import { $ } from "../../dom.js";
import { IHoverDelegate } from "../hover/hoverDelegate.js";
import { Button } from "../button/button.js";
import { DisposableMap, DisposableStore } from "../../../common/lifecycle.js";
import { createInstantHoverDelegate } from "../hover/hoverDelegateFactory.js";
class Radio extends Widget {
  static {
    __name(this, "Radio");
  }
  _onDidSelect = this._register(new Emitter());
  onDidSelect = this._onDidSelect.event;
  domNode;
  hoverDelegate;
  items = [];
  activeItem;
  buttons = this._register(new DisposableMap());
  constructor(opts) {
    super();
    this.hoverDelegate = opts.hoverDelegate ?? this._register(createInstantHoverDelegate());
    this.domNode = $(".monaco-custom-radio");
    this.domNode.setAttribute("role", "radio");
    this.setItems(opts.items);
  }
  setItems(items) {
    this.buttons.clearAndDisposeAll();
    this.items = items;
    this.activeItem = this.items.find((item) => item.isActive) ?? this.items[0];
    for (let index = 0; index < this.items.length; index++) {
      const item = this.items[index];
      const disposables = new DisposableStore();
      const button = disposables.add(new Button(this.domNode, {
        hoverDelegate: this.hoverDelegate,
        title: item.tooltip,
        supportIcons: true
      }));
      button.enabled = !item.disabled;
      disposables.add(button.onDidClick(() => {
        if (this.activeItem !== item) {
          this.activeItem = item;
          this.updateButtons();
          this._onDidSelect.fire(index);
        }
      }));
      this.buttons.set(button, { item, dispose: /* @__PURE__ */ __name(() => disposables.dispose(), "dispose") });
    }
    this.updateButtons();
  }
  setActiveItem(index) {
    if (index < 0 || index >= this.items.length) {
      throw new Error("Invalid Index");
    }
    this.activeItem = this.items[index];
    this.updateButtons();
  }
  setEnabled(enabled) {
    for (const [button] of this.buttons) {
      button.enabled = enabled;
    }
  }
  updateButtons() {
    let isActive = false;
    for (const [button, { item }] of this.buttons) {
      const isPreviousActive = isActive;
      isActive = item === this.activeItem;
      button.element.classList.toggle("active", isActive);
      button.element.classList.toggle("previous-active", isPreviousActive);
      button.label = item.text;
    }
  }
}
export {
  Radio
};
//# sourceMappingURL=radio.js.map
