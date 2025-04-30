var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import * as dom from "../../dom.js";
import { StandardKeyboardEvent } from "../../keyboardEvent.js";
import { DomScrollableElement } from "../scrollbar/scrollableElement.js";
import { Disposable } from "../../../common/lifecycle.js";
import "./hoverWidget.css";
import { localize } from "../../../../nls.js";
const $ = dom.$;
var HoverPosition;
(function(HoverPosition2) {
  HoverPosition2[HoverPosition2["LEFT"] = 0] = "LEFT";
  HoverPosition2[HoverPosition2["RIGHT"] = 1] = "RIGHT";
  HoverPosition2[HoverPosition2["BELOW"] = 2] = "BELOW";
  HoverPosition2[HoverPosition2["ABOVE"] = 3] = "ABOVE";
})(HoverPosition || (HoverPosition = {}));
class HoverWidget extends Disposable {
  static {
    __name(this, "HoverWidget");
  }
  constructor(fadeIn) {
    super();
    this.containerDomNode = document.createElement("div");
    this.containerDomNode.className = "monaco-hover";
    this.containerDomNode.classList.toggle("fade-in", !!fadeIn);
    this.containerDomNode.tabIndex = 0;
    this.containerDomNode.setAttribute("role", "tooltip");
    this.contentsDomNode = document.createElement("div");
    this.contentsDomNode.className = "monaco-hover-content";
    this.scrollbar = this._register(new DomScrollableElement(this.contentsDomNode, {
      consumeMouseWheelIfScrollbarIsNeeded: true
    }));
    this.containerDomNode.appendChild(this.scrollbar.getDomNode());
  }
  onContentsChanged() {
    this.scrollbar.scanDomNode();
  }
}
class HoverAction extends Disposable {
  static {
    __name(this, "HoverAction");
  }
  static render(parent, actionOptions, keybindingLabel) {
    return new HoverAction(parent, actionOptions, keybindingLabel);
  }
  constructor(parent, actionOptions, keybindingLabel) {
    super();
    this.actionLabel = actionOptions.label;
    this.actionKeybindingLabel = keybindingLabel;
    this.actionContainer = dom.append(parent, $("div.action-container"));
    this.actionContainer.setAttribute("tabindex", "0");
    this.action = dom.append(this.actionContainer, $("a.action"));
    this.action.setAttribute("role", "button");
    if (actionOptions.iconClass) {
      dom.append(this.action, $(`span.icon.${actionOptions.iconClass}`));
    }
    this.actionRenderedLabel = keybindingLabel ? `${actionOptions.label} (${keybindingLabel})` : actionOptions.label;
    const label = dom.append(this.action, $("span"));
    label.textContent = this.actionRenderedLabel;
    this._store.add(new ClickAction(this.actionContainer, actionOptions.run));
    this._store.add(new KeyDownAction(this.actionContainer, actionOptions.run, [
      3,
      10
      /* KeyCode.Space */
    ]));
    this.setEnabled(true);
  }
  setEnabled(enabled) {
    if (enabled) {
      this.actionContainer.classList.remove("disabled");
      this.actionContainer.removeAttribute("aria-disabled");
    } else {
      this.actionContainer.classList.add("disabled");
      this.actionContainer.setAttribute("aria-disabled", "true");
    }
  }
}
function getHoverAccessibleViewHint(shouldHaveHint, keybinding) {
  return shouldHaveHint && keybinding ? localize("acessibleViewHint", "Inspect this in the accessible view with {0}.", keybinding) : shouldHaveHint ? localize("acessibleViewHintNoKbOpen", "Inspect this in the accessible view via the command Open Accessible View which is currently not triggerable via keybinding.") : "";
}
__name(getHoverAccessibleViewHint, "getHoverAccessibleViewHint");
class ClickAction extends Disposable {
  static {
    __name(this, "ClickAction");
  }
  constructor(container, run) {
    super();
    this._register(dom.addDisposableListener(container, dom.EventType.CLICK, (e) => {
      e.stopPropagation();
      e.preventDefault();
      run(container);
    }));
  }
}
class KeyDownAction extends Disposable {
  static {
    __name(this, "KeyDownAction");
  }
  constructor(container, run, keyCodes) {
    super();
    this._register(dom.addDisposableListener(container, dom.EventType.KEY_DOWN, (e) => {
      const event = new StandardKeyboardEvent(e);
      if (keyCodes.some((keyCode) => event.equals(keyCode))) {
        e.stopPropagation();
        e.preventDefault();
        run(container);
      }
    }));
  }
}
export {
  ClickAction,
  HoverAction,
  HoverPosition,
  HoverWidget,
  KeyDownAction,
  getHoverAccessibleViewHint
};
//# sourceMappingURL=hoverWidget.js.map
