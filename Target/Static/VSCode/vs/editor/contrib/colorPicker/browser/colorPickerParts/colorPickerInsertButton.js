var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import "../colorPicker.css";
import * as dom from "../../../../../base/browser/dom.js";
import { Emitter } from "../../../../../base/common/event.js";
import { Disposable } from "../../../../../base/common/lifecycle.js";
class InsertButton extends Disposable {
  static {
    __name(this, "InsertButton");
  }
  _button;
  _onClicked = this._register(new Emitter());
  onClicked = this._onClicked.event;
  constructor(container) {
    super();
    this._button = dom.append(container, document.createElement("button"));
    this._button.classList.add("insert-button");
    this._button.textContent = "Insert";
    this._register(dom.addDisposableListener(this._button, dom.EventType.CLICK, () => {
      this._onClicked.fire();
    }));
  }
  get button() {
    return this._button;
  }
}
export {
  InsertButton
};
//# sourceMappingURL=colorPickerInsertButton.js.map
