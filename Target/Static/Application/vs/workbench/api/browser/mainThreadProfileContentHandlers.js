var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __decorate = function(decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
  else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = function(paramIndex, decorator) {
  return function(target, key) {
    decorator(target, key, paramIndex);
  };
};
import { Disposable, DisposableMap } from "../../../base/common/lifecycle.js";
import { revive } from "../../../base/common/marshalling.js";
import { ExtHostContext, MainContext } from "../common/extHost.protocol.js";
import { extHostNamedCustomer } from "../../services/extensions/common/extHostCustomers.js";
import { IUserDataProfileImportExportService } from "../../services/userDataProfile/common/userDataProfile.js";
let MainThreadProfileContentHandlers = class MainThreadProfileContentHandlers2 extends Disposable {
  static {
    __name(this, "MainThreadProfileContentHandlers");
  }
  constructor(context, userDataProfileImportExportService) {
    super();
    this.userDataProfileImportExportService = userDataProfileImportExportService;
    this.registeredHandlers = this._register(new DisposableMap());
    this.proxy = context.getProxy(ExtHostContext.ExtHostProfileContentHandlers);
  }
  async $registerProfileContentHandler(id, name, description, extensionId) {
    this.registeredHandlers.set(id, this.userDataProfileImportExportService.registerProfileContentHandler(id, {
      name,
      description,
      extensionId,
      saveProfile: /* @__PURE__ */ __name(async (name2, content, token) => {
        const result = await this.proxy.$saveProfile(id, name2, content, token);
        return result ? revive(result) : null;
      }, "saveProfile"),
      readProfile: /* @__PURE__ */ __name(async (uri, token) => {
        return this.proxy.$readProfile(id, uri, token);
      }, "readProfile")
    }));
  }
  async $unregisterProfileContentHandler(id) {
    this.registeredHandlers.deleteAndDispose(id);
  }
};
MainThreadProfileContentHandlers = __decorate([
  extHostNamedCustomer(MainContext.MainThreadProfileContentHandlers),
  __param(1, IUserDataProfileImportExportService)
], MainThreadProfileContentHandlers);
export {
  MainThreadProfileContentHandlers
};
//# sourceMappingURL=mainThreadProfileContentHandlers.js.map
