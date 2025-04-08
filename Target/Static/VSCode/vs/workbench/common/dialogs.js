var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { DeferredPromise } from "../../base/common/async.js";
import { Event, Emitter } from "../../base/common/event.js";
import { Disposable } from "../../base/common/lifecycle.js";
import { IDialogArgs, IDialogResult } from "../../platform/dialogs/common/dialogs.js";
class DialogsModel extends Disposable {
  static {
    __name(this, "DialogsModel");
  }
  dialogs = [];
  _onWillShowDialog = this._register(new Emitter());
  onWillShowDialog = this._onWillShowDialog.event;
  _onDidShowDialog = this._register(new Emitter());
  onDidShowDialog = this._onDidShowDialog.event;
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
