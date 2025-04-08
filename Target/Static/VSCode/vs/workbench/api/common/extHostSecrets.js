var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { ExtHostSecretState } from "./extHostSecretState.js";
import { ExtensionIdentifier, IExtensionDescription } from "../../../platform/extensions/common/extensions.js";
import { Event } from "../../../base/common/event.js";
import { DisposableStore } from "../../../base/common/lifecycle.js";
class ExtensionSecrets {
  static {
    __name(this, "ExtensionSecrets");
  }
  _id;
  #secretState;
  onDidChange;
  disposables = new DisposableStore();
  constructor(extensionDescription, secretState) {
    this._id = ExtensionIdentifier.toKey(extensionDescription.identifier);
    this.#secretState = secretState;
    this.onDidChange = Event.map(
      Event.filter(this.#secretState.onDidChangePassword, (e) => e.extensionId === this._id),
      (e) => ({ key: e.key }),
      this.disposables
    );
  }
  dispose() {
    this.disposables.dispose();
  }
  get(key) {
    return this.#secretState.get(this._id, key);
  }
  store(key, value) {
    return this.#secretState.store(this._id, key, value);
  }
  delete(key) {
    return this.#secretState.delete(this._id, key);
  }
}
export {
  ExtensionSecrets
};
//# sourceMappingURL=extHostSecrets.js.map
