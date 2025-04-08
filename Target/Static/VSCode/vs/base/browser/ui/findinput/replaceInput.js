var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import * as dom from "../../dom.js";
import { IKeyboardEvent } from "../../keyboardEvent.js";
import { IMouseEvent } from "../../mouseEvent.js";
import { IToggleStyles, Toggle } from "../toggle/toggle.js";
import { IContextViewProvider } from "../contextview/contextview.js";
import { IFindInputToggleOpts } from "./findInputToggles.js";
import { HistoryInputBox, IInputBoxStyles, IInputValidator, IMessage as InputBoxMessage } from "../inputbox/inputBox.js";
import { Widget } from "../widget.js";
import { Codicon } from "../../../common/codicons.js";
import { Emitter, Event } from "../../../common/event.js";
import { KeyCode } from "../../../common/keyCodes.js";
import "./findInput.css";
import * as nls from "../../../../nls.js";
import { getDefaultHoverDelegate } from "../hover/hoverDelegateFactory.js";
import { IHistory } from "../../../common/history.js";
const NLS_DEFAULT_LABEL = nls.localize("defaultLabel", "input");
const NLS_PRESERVE_CASE_LABEL = nls.localize("label.preserveCaseToggle", "Preserve Case");
class PreserveCaseToggle extends Toggle {
  static {
    __name(this, "PreserveCaseToggle");
  }
  constructor(opts) {
    super({
      // TODO: does this need its own icon?
      icon: Codicon.preserveCase,
      title: NLS_PRESERVE_CASE_LABEL + opts.appendTitle,
      isChecked: opts.isChecked,
      hoverDelegate: opts.hoverDelegate ?? getDefaultHoverDelegate("element"),
      inputActiveOptionBorder: opts.inputActiveOptionBorder,
      inputActiveOptionForeground: opts.inputActiveOptionForeground,
      inputActiveOptionBackground: opts.inputActiveOptionBackground
    });
  }
}
class ReplaceInput extends Widget {
  constructor(parent, contextViewProvider, _showOptionButtons, options) {
    super();
    this._showOptionButtons = _showOptionButtons;
    this.contextViewProvider = contextViewProvider;
    this.placeholder = options.placeholder || "";
    this.validation = options.validation;
    this.label = options.label || NLS_DEFAULT_LABEL;
    const appendPreserveCaseLabel = options.appendPreserveCaseLabel || "";
    const history = options.history || /* @__PURE__ */ new Set([]);
    const flexibleHeight = !!options.flexibleHeight;
    const flexibleWidth = !!options.flexibleWidth;
    const flexibleMaxHeight = options.flexibleMaxHeight;
    this.domNode = document.createElement("div");
    this.domNode.classList.add("monaco-findInput");
    this.inputBox = this._register(new HistoryInputBox(this.domNode, this.contextViewProvider, {
      ariaLabel: this.label || "",
      placeholder: this.placeholder || "",
      validationOptions: {
        validation: this.validation
      },
      history,
      showHistoryHint: options.showHistoryHint,
      flexibleHeight,
      flexibleWidth,
      flexibleMaxHeight,
      inputBoxStyles: options.inputBoxStyles
    }));
    this.preserveCase = this._register(new PreserveCaseToggle({
      appendTitle: appendPreserveCaseLabel,
      isChecked: false,
      ...options.toggleStyles
    }));
    this._register(this.preserveCase.onChange((viaKeyboard) => {
      this._onDidOptionChange.fire(viaKeyboard);
      if (!viaKeyboard && this.fixFocusOnOptionClickEnabled) {
        this.inputBox.focus();
      }
      this.validate();
    }));
    this._register(this.preserveCase.onKeyDown((e) => {
      this._onPreserveCaseKeyDown.fire(e);
    }));
    if (this._showOptionButtons) {
      this.cachedOptionsWidth = this.preserveCase.width();
    } else {
      this.cachedOptionsWidth = 0;
    }
    const indexes = [this.preserveCase.domNode];
    this.onkeydown(this.domNode, (event) => {
      if (event.equals(KeyCode.LeftArrow) || event.equals(KeyCode.RightArrow) || event.equals(KeyCode.Escape)) {
        const index = indexes.indexOf(this.domNode.ownerDocument.activeElement);
        if (index >= 0) {
          let newIndex = -1;
          if (event.equals(KeyCode.RightArrow)) {
            newIndex = (index + 1) % indexes.length;
          } else if (event.equals(KeyCode.LeftArrow)) {
            if (index === 0) {
              newIndex = indexes.length - 1;
            } else {
              newIndex = index - 1;
            }
          }
          if (event.equals(KeyCode.Escape)) {
            indexes[index].blur();
            this.inputBox.focus();
          } else if (newIndex >= 0) {
            indexes[newIndex].focus();
          }
          dom.EventHelper.stop(event, true);
        }
      }
    });
    const controls = document.createElement("div");
    controls.className = "controls";
    controls.style.display = this._showOptionButtons ? "block" : "none";
    controls.appendChild(this.preserveCase.domNode);
    this.domNode.appendChild(controls);
    parent?.appendChild(this.domNode);
    this.onkeydown(this.inputBox.inputElement, (e) => this._onKeyDown.fire(e));
    this.onkeyup(this.inputBox.inputElement, (e) => this._onKeyUp.fire(e));
    this.oninput(this.inputBox.inputElement, (e) => this._onInput.fire());
    this.onmousedown(this.inputBox.inputElement, (e) => this._onMouseDown.fire(e));
  }
  static {
    __name(this, "ReplaceInput");
  }
  static OPTION_CHANGE = "optionChange";
  contextViewProvider;
  placeholder;
  validation;
  label;
  fixFocusOnOptionClickEnabled = true;
  preserveCase;
  cachedOptionsWidth = 0;
  domNode;
  inputBox;
  _onDidOptionChange = this._register(new Emitter());
  onDidOptionChange = this._onDidOptionChange.event;
  _onKeyDown = this._register(new Emitter());
  onKeyDown = this._onKeyDown.event;
  _onMouseDown = this._register(new Emitter());
  onMouseDown = this._onMouseDown.event;
  _onInput = this._register(new Emitter());
  onInput = this._onInput.event;
  _onKeyUp = this._register(new Emitter());
  onKeyUp = this._onKeyUp.event;
  _onPreserveCaseKeyDown = this._register(new Emitter());
  onPreserveCaseKeyDown = this._onPreserveCaseKeyDown.event;
  enable() {
    this.domNode.classList.remove("disabled");
    this.inputBox.enable();
    this.preserveCase.enable();
  }
  disable() {
    this.domNode.classList.add("disabled");
    this.inputBox.disable();
    this.preserveCase.disable();
  }
  setFocusInputOnOptionClick(value) {
    this.fixFocusOnOptionClickEnabled = value;
  }
  setEnabled(enabled) {
    if (enabled) {
      this.enable();
    } else {
      this.disable();
    }
  }
  clear() {
    this.clearValidation();
    this.setValue("");
    this.focus();
  }
  getValue() {
    return this.inputBox.value;
  }
  setValue(value) {
    if (this.inputBox.value !== value) {
      this.inputBox.value = value;
    }
  }
  onSearchSubmit() {
    this.inputBox.addToHistory();
  }
  applyStyles() {
  }
  select() {
    this.inputBox.select();
  }
  focus() {
    this.inputBox.focus();
  }
  getPreserveCase() {
    return this.preserveCase.checked;
  }
  setPreserveCase(value) {
    this.preserveCase.checked = value;
  }
  focusOnPreserve() {
    this.preserveCase.focus();
  }
  _lastHighlightFindOptions = 0;
  highlightFindOptions() {
    this.domNode.classList.remove("highlight-" + this._lastHighlightFindOptions);
    this._lastHighlightFindOptions = 1 - this._lastHighlightFindOptions;
    this.domNode.classList.add("highlight-" + this._lastHighlightFindOptions);
  }
  validate() {
    this.inputBox?.validate();
  }
  showMessage(message) {
    this.inputBox?.showMessage(message);
  }
  clearMessage() {
    this.inputBox?.hideMessage();
  }
  clearValidation() {
    this.inputBox?.hideMessage();
  }
  set width(newWidth) {
    this.inputBox.paddingRight = this.cachedOptionsWidth;
    this.domNode.style.width = newWidth + "px";
  }
  dispose() {
    super.dispose();
  }
}
export {
  ReplaceInput
};
//# sourceMappingURL=replaceInput.js.map
