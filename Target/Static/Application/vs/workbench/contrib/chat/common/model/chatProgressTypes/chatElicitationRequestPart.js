var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { observableValue } from "../../../../../../base/common/observable.js";
class ChatElicitationRequestPart {
  static {
    __name(this, "ChatElicitationRequestPart");
  }
  constructor(title, message, subtitle, acceptButtonLabel, rejectButtonLabel, _accept, reject, source, moreActions, onHide) {
    this.title = title;
    this.message = message;
    this.subtitle = subtitle;
    this.acceptButtonLabel = acceptButtonLabel;
    this.rejectButtonLabel = rejectButtonLabel;
    this._accept = _accept;
    this.source = source;
    this.moreActions = moreActions;
    this.onHide = onHide;
    this.kind = "elicitation2";
    this.state = observableValue(
      "state",
      "pending"
      /* ElicitationState.Pending */
    );
    this._isHiddenValue = observableValue("isHidden", false);
    this.isHidden = this._isHiddenValue;
    if (reject) {
      this.reject = async () => {
        const state = await reject();
        this.state.set(state, void 0);
      };
    }
  }
  accept(value) {
    return this._accept(value).then((state) => {
      this.state.set(state, void 0);
    });
  }
  hide() {
    if (this._isHiddenValue.get()) {
      return;
    }
    this._isHiddenValue.set(true, void 0, void 0);
    this.onHide?.();
    if (this.state.get() === "pending") {
      this.state.set("rejected", void 0);
    }
  }
  toJSON() {
    const state = this.state.get();
    return {
      kind: "elicitationSerialized",
      title: this.title,
      message: this.message,
      state: state === "pending" ? "rejected" : state,
      acceptedResult: this.acceptedResult,
      subtitle: this.subtitle,
      source: this.source,
      isHidden: this._isHiddenValue.get()
    };
  }
}
export {
  ChatElicitationRequestPart
};
//# sourceMappingURL=chatElicitationRequestPart.js.map
