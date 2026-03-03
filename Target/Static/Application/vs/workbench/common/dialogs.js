var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { DeferredPromise } from "../../base/common/async.js";
import { Emitter } from "../../base/common/event.js";
import { Disposable } from "../../base/common/lifecycle.js";
class DialogsModel extends Disposable {
  static {
    __name(this, "DialogsModel");
  }
  constructor() {
    super(...arguments);
    this.dialogs = [];
    this._onWillShowDialog = this._register(new Emitter());
    this.onWillShowDialog = this._onWillShowDialog.event;
    this._onDidShowDialog = this._register(new Emitter());
    this.onDidShowDialog = this._onDidShowDialog.event;
  }
  show(dialog) {
    const promise = new DeferredPromise();
    const item = {
      args: dialog,
      close: /* @__PURE__ */ __name((result) => {
        this.dialogs.splice(0, 1);
        if (result instanceof Error) {
          promise.error(result);
        } else {
          promise.complete(result);
        }
        this._onDidShowDialog.fire();
      }, "close")
    };
    this.dialogs.push(item);
    this._onWillShowDialog.fire();
    return {
      item,
      result: promise.p
    };
  }
}
export {
  DialogsModel
};
//# sourceMappingURL=dialogs.js.map
