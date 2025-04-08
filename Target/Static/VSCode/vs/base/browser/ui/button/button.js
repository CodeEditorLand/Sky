var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { IContextMenuProvider } from "../../contextmenu.js";
import { addDisposableListener, EventHelper, EventType, IFocusTracker, isActiveElement, reset, trackFocus, $ } from "../../dom.js";
import dompurify from "../../dompurify/dompurify.js";
import { StandardKeyboardEvent } from "../../keyboardEvent.js";
import { renderMarkdown, renderStringAsPlaintext } from "../../markdownRenderer.js";
import { Gesture, EventType as TouchEventType } from "../../touch.js";
import { createInstantHoverDelegate, getDefaultHoverDelegate } from "../hover/hoverDelegateFactory.js";
import { IHoverDelegate } from "../hover/hoverDelegate.js";
import { renderLabelWithIcons } from "../iconLabel/iconLabels.js";
import { Action, IAction, IActionRunner } from "../../../common/actions.js";
import { Codicon } from "../../../common/codicons.js";
import { Color } from "../../../common/color.js";
import { Event as BaseEvent, Emitter } from "../../../common/event.js";
import { IMarkdownString, isMarkdownString, markdownStringEqual } from "../../../common/htmlContent.js";
import { KeyCode } from "../../../common/keyCodes.js";
import { Disposable, DisposableStore, IDisposable } from "../../../common/lifecycle.js";
import { ThemeIcon } from "../../../common/themables.js";
import "./button.css";
import { localize } from "../../../../nls.js";
import { getBaseLayerHoverDelegate } from "../hover/hoverDelegate2.js";
import { IActionProvider } from "../dropdown/dropdown.js";
const unthemedButtonStyles = {
  buttonBackground: "#0E639C",
  buttonHoverBackground: "#006BB3",
  buttonSeparator: Color.white.toString(),
  buttonForeground: Color.white.toString(),
  buttonBorder: void 0,
  buttonSecondaryBackground: void 0,
  buttonSecondaryForeground: void 0,
  buttonSecondaryHoverBackground: void 0
};
class Button extends Disposable {
  static {
    __name(this, "Button");
  }
  options;
  _element;
  _label = "";
  _labelElement;
  _labelShortElement;
  _hover;
  _onDidClick = this._register(new Emitter());
  get onDidClick() {
    return this._onDidClick.event;
  }
  _onDidEscape = this._register(new Emitter());
  get onDidEscape() {
    return this._onDidEscape.event;
  }
  focusTracker;
  constructor(container, options) {
    super();
    this.options = options;
    this._element = document.createElement("a");
    this._element.classList.add("monaco-button");
    this._element.tabIndex = 0;
    this._element.setAttribute("role", "button");
    this._element.classList.toggle("secondary", !!options.secondary);
    const background = options.secondary ? options.buttonSecondaryBackground : options.buttonBackground;
    const foreground = options.secondary ? options.buttonSecondaryForeground : options.buttonForeground;
    this._element.style.color = foreground || "";
    this._element.style.backgroundColor = background || "";
    if (options.supportShortLabel) {
      this._labelShortElement = document.createElement("div");
      this._labelShortElement.classList.add("monaco-button-label-short");
      this._element.appendChild(this._labelShortElement);
      this._labelElement = document.createElement("div");
      this._labelElement.classList.add("monaco-button-label");
      this._element.appendChild(this._labelElement);
      this._element.classList.add("monaco-text-button-with-short-label");
    }
    if (typeof options.title === "string") {
      this.setTitle(options.title);
    }
    if (typeof options.ariaLabel === "string") {
      this._element.setAttribute("aria-label", options.ariaLabel);
    }
    container.appendChild(this._element);
    this._register(Gesture.addTarget(this._element));
    [EventType.CLICK, TouchEventType.Tap].forEach((eventType) => {
      this._register(addDisposableListener(this._element, eventType, (e) => {
        if (!this.enabled) {
          EventHelper.stop(e);
          return;
        }
        this._onDidClick.fire(e);
      }));
    });
    this._register(addDisposableListener(this._element, EventType.KEY_DOWN, (e) => {
      const event = new StandardKeyboardEvent(e);
      let eventHandled = false;
      if (this.enabled && (event.equals(KeyCode.Enter) || event.equals(KeyCode.Space))) {
        this._onDidClick.fire(e);
        eventHandled = true;
      } else if (event.equals(KeyCode.Escape)) {
        this._onDidEscape.fire(e);
        this._element.blur();
        eventHandled = true;
      }
      if (eventHandled) {
        EventHelper.stop(event, true);
      }
    }));
    this._register(addDisposableListener(this._element, EventType.MOUSE_OVER, (e) => {
      if (!this._element.classList.contains("disabled")) {
        this.updateBackground(true);
      }
    }));
    this._register(addDisposableListener(this._element, EventType.MOUSE_OUT, (e) => {
      this.updateBackground(false);
    }));
    this.focusTracker = this._register(trackFocus(this._element));
    this._register(this.focusTracker.onDidFocus(() => {
      if (this.enabled) {
        this.updateBackground(true);
      }
    }));
    this._register(this.focusTracker.onDidBlur(() => {
      if (this.enabled) {
        this.updateBackground(false);
      }
    }));
  }
  dispose() {
    super.dispose();
    this._element.remove();
  }
  getContentElements(content) {
    const elements = [];
    for (let segment of renderLabelWithIcons(content)) {
      if (typeof segment === "string") {
        segment = segment.trim();
        if (segment === "") {
          continue;
        }
        const node = document.createElement("span");
        node.textContent = segment;
        elements.push(node);
      } else {
        elements.push(segment);
      }
    }
    return elements;
  }
  updateBackground(hover) {
    let background;
    if (this.options.secondary) {
      background = hover ? this.options.buttonSecondaryHoverBackground : this.options.buttonSecondaryBackground;
    } else {
      background = hover ? this.options.buttonHoverBackground : this.options.buttonBackground;
    }
    if (background) {
      this._element.style.backgroundColor = background;
    }
  }
  get element() {
    return this._element;
  }
  set label(value) {
    if (this._label === value) {
      return;
    }
    if (isMarkdownString(this._label) && isMarkdownString(value) && markdownStringEqual(this._label, value)) {
      return;
    }
    this._element.classList.add("monaco-text-button");
    const labelElement = this.options.supportShortLabel ? this._labelElement : this._element;
    if (isMarkdownString(value)) {
      const rendered = renderMarkdown(value, { inline: true });
      rendered.dispose();
      const root = rendered.element.querySelector("p")?.innerHTML;
      if (root) {
        const sanitized = dompurify.sanitize(root, { ADD_TAGS: ["b", "i", "u", "code", "span"], ALLOWED_ATTR: ["class"], RETURN_TRUSTED_TYPE: true });
        labelElement.innerHTML = sanitized;
      } else {
        reset(labelElement);
      }
    } else {
      if (this.options.supportIcons) {
        reset(labelElement, ...this.getContentElements(value));
      } else {
        labelElement.textContent = value;
      }
    }
    let title = "";
    if (typeof this.options.title === "string") {
      title = this.options.title;
    } else if (this.options.title) {
      title = renderStringAsPlaintext(value);
    }
    this.setTitle(title);
    this._setAriaLabel();
    this._label = value;
  }
  get label() {
    return this._label;
  }
  set labelShort(value) {
    if (!this.options.supportShortLabel || !this._labelShortElement) {
      return;
    }
    if (this.options.supportIcons) {
      reset(this._labelShortElement, ...this.getContentElements(value));
    } else {
      this._labelShortElement.textContent = value;
    }
  }
  _setAriaLabel() {
    if (typeof this.options.ariaLabel === "string") {
      this._element.setAttribute("aria-label", this.options.ariaLabel);
    } else if (typeof this.options.title === "string") {
      this._element.setAttribute("aria-label", this.options.title);
    }
  }
  set icon(icon) {
    this._setAriaLabel();
    const oldIcons = Array.from(this._element.classList).filter((item) => item.startsWith("codicon-"));
    this._element.classList.remove(...oldIcons);
    this._element.classList.add(...ThemeIcon.asClassNameArray(icon));
  }
  set enabled(value) {
    if (value) {
      this._element.classList.remove("disabled");
      this._element.setAttribute("aria-disabled", String(false));
      this._element.tabIndex = 0;
    } else {
      this._element.classList.add("disabled");
      this._element.setAttribute("aria-disabled", String(true));
    }
  }
  get enabled() {
    return !this._element.classList.contains("disabled");
  }
  set checked(value) {
    if (value) {
      this._element.classList.add("checked");
      this._element.setAttribute("aria-checked", "true");
    } else {
      this._element.classList.remove("checked");
      this._element.setAttribute("aria-checked", "false");
    }
  }
  get checked() {
    return this._element.classList.contains("checked");
  }
  setTitle(title) {
    if (!this._hover && title !== "") {
      this._hover = this._register(getBaseLayerHoverDelegate().setupManagedHover(this.options.hoverDelegate ?? getDefaultHoverDelegate("element"), this._element, title));
    } else if (this._hover) {
      this._hover.update(title);
    }
  }
  focus() {
    this._element.focus();
  }
  hasFocus() {
    return isActiveElement(this._element);
  }
}
class ButtonWithDropdown extends Disposable {
  static {
    __name(this, "ButtonWithDropdown");
  }
  primaryButton;
  action;
  dropdownButton;
  separatorContainer;
  separator;
  element;
  _onDidClick = this._register(new Emitter());
  onDidClick = this._onDidClick.event;
  constructor(container, options) {
    super();
    this.element = document.createElement("div");
    this.element.classList.add("monaco-button-dropdown");
    container.appendChild(this.element);
    if (!options.hoverDelegate) {
      options = { ...options, hoverDelegate: this._register(createInstantHoverDelegate()) };
    }
    this.primaryButton = this._register(new Button(this.element, options));
    this._register(this.primaryButton.onDidClick((e) => this._onDidClick.fire(e)));
    this.action = this._register(new Action("primaryAction", renderStringAsPlaintext(this.primaryButton.label), void 0, true, async () => this._onDidClick.fire(void 0)));
    this.separatorContainer = document.createElement("div");
    this.separatorContainer.classList.add("monaco-button-dropdown-separator");
    this.separator = document.createElement("div");
    this.separatorContainer.appendChild(this.separator);
    this.element.appendChild(this.separatorContainer);
    const border = options.buttonBorder;
    if (border) {
      this.separatorContainer.style.borderTop = "1px solid " + border;
      this.separatorContainer.style.borderBottom = "1px solid " + border;
    }
    const buttonBackground = options.secondary ? options.buttonSecondaryBackground : options.buttonBackground;
    this.separatorContainer.style.backgroundColor = buttonBackground ?? "";
    this.separator.style.backgroundColor = options.buttonSeparator ?? "";
    this.dropdownButton = this._register(new Button(this.element, { ...options, title: localize("button dropdown more actions", "More Actions..."), supportIcons: true }));
    this.dropdownButton.element.setAttribute("aria-haspopup", "true");
    this.dropdownButton.element.setAttribute("aria-expanded", "false");
    this.dropdownButton.element.classList.add("monaco-dropdown-button");
    this.dropdownButton.icon = Codicon.dropDownButton;
    this._register(this.dropdownButton.onDidClick((e) => {
      const actions = Array.isArray(options.actions) ? options.actions : options.actions.getActions();
      options.contextMenuProvider.showContextMenu({
        getAnchor: /* @__PURE__ */ __name(() => this.dropdownButton.element, "getAnchor"),
        getActions: /* @__PURE__ */ __name(() => options.addPrimaryActionToDropdown === false ? [...actions] : [this.action, ...actions], "getActions"),
        actionRunner: options.actionRunner,
        onHide: /* @__PURE__ */ __name(() => this.dropdownButton.element.setAttribute("aria-expanded", "false"), "onHide"),
        layer: options.dropdownLayer
      });
      this.dropdownButton.element.setAttribute("aria-expanded", "true");
    }));
  }
  dispose() {
    super.dispose();
    this.element.remove();
  }
  set label(value) {
    this.primaryButton.label = value;
    this.action.label = value;
  }
  set icon(icon) {
    this.primaryButton.icon = icon;
  }
  set enabled(enabled) {
    this.primaryButton.enabled = enabled;
    this.dropdownButton.enabled = enabled;
    this.element.classList.toggle("disabled", !enabled);
  }
  get enabled() {
    return this.primaryButton.enabled;
  }
  set checked(value) {
    this.primaryButton.checked = value;
  }
  get checked() {
    return this.primaryButton.checked;
  }
  focus() {
    this.primaryButton.focus();
  }
  hasFocus() {
    return this.primaryButton.hasFocus() || this.dropdownButton.hasFocus();
  }
}
class ButtonWithDescription {
  constructor(container, options) {
    this.options = options;
    this._element = document.createElement("div");
    this._element.classList.add("monaco-description-button");
    this._button = new Button(this._element, options);
    this._descriptionElement = document.createElement("div");
    this._descriptionElement.classList.add("monaco-button-description");
    this._element.appendChild(this._descriptionElement);
    container.appendChild(this._element);
  }
  static {
    __name(this, "ButtonWithDescription");
  }
  _button;
  _element;
  _descriptionElement;
  get onDidClick() {
    return this._button.onDidClick;
  }
  get element() {
    return this._element;
  }
  set label(value) {
    this._button.label = value;
  }
  set icon(icon) {
    this._button.icon = icon;
  }
  get enabled() {
    return this._button.enabled;
  }
  set enabled(enabled) {
    this._button.enabled = enabled;
  }
  set checked(value) {
    this._button.checked = value;
  }
  get checked() {
    return this._button.checked;
  }
  focus() {
    this._button.focus();
  }
  hasFocus() {
    return this._button.hasFocus();
  }
  dispose() {
    this._button.dispose();
  }
  set description(value) {
    if (this.options.supportIcons) {
      reset(this._descriptionElement, ...renderLabelWithIcons(value));
    } else {
      this._descriptionElement.textContent = value;
    }
  }
}
class ButtonBar {
  constructor(container) {
    this.container = container;
  }
  static {
    __name(this, "ButtonBar");
  }
  _buttons = [];
  _buttonStore = new DisposableStore();
  dispose() {
    this._buttonStore.dispose();
  }
  get buttons() {
    return this._buttons;
  }
  clear() {
    this._buttonStore.clear();
    this._buttons.length = 0;
  }
  addButton(options) {
    const button = this._buttonStore.add(new Button(this.container, options));
    this.pushButton(button);
    return button;
  }
  addButtonWithDescription(options) {
    const button = this._buttonStore.add(new ButtonWithDescription(this.container, options));
    this.pushButton(button);
    return button;
  }
  addButtonWithDropdown(options) {
    const button = this._buttonStore.add(new ButtonWithDropdown(this.container, options));
    this.pushButton(button);
    return button;
  }
  pushButton(button) {
    this._buttons.push(button);
    const index = this._buttons.length - 1;
    this._buttonStore.add(addDisposableListener(button.element, EventType.KEY_DOWN, (e) => {
      const event = new StandardKeyboardEvent(e);
      let eventHandled = true;
      let buttonIndexToFocus;
      if (event.equals(KeyCode.LeftArrow)) {
        buttonIndexToFocus = index > 0 ? index - 1 : this._buttons.length - 1;
      } else if (event.equals(KeyCode.RightArrow)) {
        buttonIndexToFocus = index === this._buttons.length - 1 ? 0 : index + 1;
      } else {
        eventHandled = false;
      }
      if (eventHandled && typeof buttonIndexToFocus === "number") {
        this._buttons[buttonIndexToFocus].focus();
        EventHelper.stop(e, true);
      }
    }));
  }
}
class ButtonWithIcon extends Button {
  static {
    __name(this, "ButtonWithIcon");
  }
  _iconElement;
  _mdlabelElement;
  constructor(container, options) {
    super(container, options);
    if (options.supportShortLabel) {
      throw new Error("ButtonWithIcon does not support short labels");
    }
    this._element.classList.add("monaco-icon-button");
    this._iconElement = $("");
    this._mdlabelElement = $(".monaco-button-mdlabel");
    this._element.append(this._iconElement, this._mdlabelElement);
  }
  set label(value) {
    if (this._label === value) {
      return;
    }
    if (isMarkdownString(this._label) && isMarkdownString(value) && markdownStringEqual(this._label, value)) {
      return;
    }
    this._element.classList.add("monaco-text-button");
    if (isMarkdownString(value)) {
      const rendered = renderMarkdown(value, { inline: true });
      rendered.dispose();
      const root = rendered.element.querySelector("p")?.innerHTML;
      if (root) {
        const sanitized = dompurify.sanitize(root, { ADD_TAGS: ["b", "i", "u", "code", "span"], ALLOWED_ATTR: ["class"], RETURN_TRUSTED_TYPE: true });
        this._mdlabelElement.innerHTML = sanitized;
      } else {
        reset(this._mdlabelElement);
      }
    } else {
      if (this.options.supportIcons) {
        reset(this._mdlabelElement, ...this.getContentElements(value));
      } else {
        this._mdlabelElement.textContent = value;
      }
    }
    let title = "";
    if (typeof this.options.title === "string") {
      title = this.options.title;
    } else if (this.options.title) {
      title = renderStringAsPlaintext(value);
    }
    this.setTitle(title);
    this._setAriaLabel();
    this._label = value;
  }
  set icon(icon) {
    this._iconElement.classList.value = "";
    this._iconElement.classList.add(...ThemeIcon.asClassNameArray(icon));
    this._setAriaLabel();
  }
}
export {
  Button,
  ButtonBar,
  ButtonWithDescription,
  ButtonWithDropdown,
  ButtonWithIcon,
  unthemedButtonStyles
};
//# sourceMappingURL=button.js.map
