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
import { IPickOptions, IInputOptions, IQuickInputService, IQuickInput, IQuickPick, IQuickPickItem } from "../../../platform/quickinput/common/quickInput.js";
import { ExtHostContext, MainThreadQuickOpenShape, ExtHostQuickOpenShape, TransferQuickPickItem, MainContext, TransferQuickInput, TransferQuickInputButton, IInputBoxOptions, TransferQuickPickItemOrSeparator } from "../common/extHost.protocol.js";
import { extHostNamedCustomer, IExtHostContext } from "../../services/extensions/common/extHostCustomers.js";
import { URI } from "../../../base/common/uri.js";
import { CancellationToken } from "../../../base/common/cancellation.js";
import { DisposableStore } from "../../../base/common/lifecycle.js";
function reviveIconPathUris(iconPath) {
  iconPath.dark = URI.revive(iconPath.dark);
  if (iconPath.light) {
    iconPath.light = URI.revive(iconPath.light);
  }
}
__name(reviveIconPathUris, "reviveIconPathUris");
let MainThreadQuickOpen = class {
  _proxy;
  _quickInputService;
  _items = {};
  constructor(extHostContext, quickInputService) {
    this._proxy = extHostContext.getProxy(ExtHostContext.ExtHostQuickOpen);
    this._quickInputService = quickInputService;
  }
  dispose() {
    for (const [_id, session] of this.sessions) {
      session.store.dispose();
    }
  }
  $show(instance, options, token) {
    const contents = new Promise((resolve, reject) => {
      this._items[instance] = { resolve, reject };
    });
    options = {
      ...options,
      onDidFocus: /* @__PURE__ */ __name((el) => {
        if (el) {
          this._proxy.$onItemSelected(el.handle);
        }
      }, "onDidFocus")
    };
    if (options.canPickMany) {
      return this._quickInputService.pick(contents, options, token).then((items) => {
        if (items) {
          return items.map((item) => item.handle);
        }
        return void 0;
      });
    } else {
      return this._quickInputService.pick(contents, options, token).then((item) => {
        if (item) {
          return item.handle;
        }
        return void 0;
      });
    }
  }
  $setItems(instance, items) {
    if (this._items[instance]) {
      this._items[instance].resolve(items);
      delete this._items[instance];
    }
    return Promise.resolve();
  }
  $setError(instance, error) {
    if (this._items[instance]) {
      this._items[instance].reject(error);
      delete this._items[instance];
    }
    return Promise.resolve();
  }
  // ---- input
  $input(options, validateInput, token) {
    const inputOptions = /* @__PURE__ */ Object.create(null);
    if (options) {
      inputOptions.title = options.title;
      inputOptions.password = options.password;
      inputOptions.placeHolder = options.placeHolder;
      inputOptions.valueSelection = options.valueSelection;
      inputOptions.prompt = options.prompt;
      inputOptions.value = options.value;
      inputOptions.ignoreFocusLost = options.ignoreFocusOut;
    }
    if (validateInput) {
      inputOptions.validateInput = (value) => {
        return this._proxy.$validateInput(value);
      };
    }
    return this._quickInputService.input(inputOptions, token);
  }
  // ---- QuickInput
  sessions = /* @__PURE__ */ new Map();
  $createOrUpdate(params) {
    const sessionId = params.id;
    let session = this.sessions.get(sessionId);
    if (!session) {
      const store = new DisposableStore();
      const input2 = params.type === "quickPick" ? this._quickInputService.createQuickPick() : this._quickInputService.createInputBox();
      store.add(input2);
      store.add(input2.onDidAccept(() => {
        this._proxy.$onDidAccept(sessionId);
      }));
      store.add(input2.onDidTriggerButton((button) => {
        this._proxy.$onDidTriggerButton(sessionId, button.handle);
      }));
      store.add(input2.onDidChangeValue((value) => {
        this._proxy.$onDidChangeValue(sessionId, value);
      }));
      store.add(input2.onDidHide(() => {
        this._proxy.$onDidHide(sessionId);
      }));
      if (params.type === "quickPick") {
        const quickpick = input2;
        store.add(quickpick.onDidChangeActive((items) => {
          this._proxy.$onDidChangeActive(sessionId, items.map((item) => item.handle));
        }));
        store.add(quickpick.onDidChangeSelection((items) => {
          this._proxy.$onDidChangeSelection(sessionId, items.map((item) => item.handle));
        }));
        store.add(quickpick.onDidTriggerItemButton((e) => {
          this._proxy.$onDidTriggerItemButton(sessionId, e.item.handle, e.button.handle);
        }));
      }
      session = {
        input: input2,
        handlesToItems: /* @__PURE__ */ new Map(),
        store
      };
      this.sessions.set(sessionId, session);
    }
    const { input, handlesToItems } = session;
    for (const param in params) {
      if (param === "id" || param === "type") {
        continue;
      }
      if (param === "visible") {
        if (params.visible) {
          input.show();
        } else {
          input.hide();
        }
      } else if (param === "items") {
        handlesToItems.clear();
        params[param].forEach((item) => {
          if (item.type === "separator") {
            return;
          }
          if (item.buttons) {
            item.buttons = item.buttons.map((button) => {
              if (button.iconPath) {
                reviveIconPathUris(button.iconPath);
              }
              return button;
            });
          }
          handlesToItems.set(item.handle, item);
        });
        input[param] = params[param];
      } else if (param === "activeItems" || param === "selectedItems") {
        input[param] = params[param].filter((handle) => handlesToItems.has(handle)).map((handle) => handlesToItems.get(handle));
      } else if (param === "buttons") {
        input[param] = params.buttons.map((button) => {
          if (button.handle === -1) {
            return this._quickInputService.backButton;
          }
          if (button.iconPath) {
            reviveIconPathUris(button.iconPath);
          }
          return button;
        });
      } else {
        input[param] = params[param];
      }
    }
    return Promise.resolve(void 0);
  }
  $dispose(sessionId) {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.store.dispose();
      this.sessions.delete(sessionId);
    }
    return Promise.resolve(void 0);
  }
};
__name(MainThreadQuickOpen, "MainThreadQuickOpen");
MainThreadQuickOpen = __decorateClass([
  extHostNamedCustomer(MainContext.MainThreadQuickOpen),
  __decorateParam(1, IQuickInputService)
], MainThreadQuickOpen);
export {
  MainThreadQuickOpen
};
//# sourceMappingURL=mainThreadQuickOpen.js.map
