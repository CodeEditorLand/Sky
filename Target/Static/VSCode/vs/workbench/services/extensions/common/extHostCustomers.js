var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { IDisposable } from "../../../../base/common/lifecycle.js";
import { BrandedService, IConstructorSignature } from "../../../../platform/instantiation/common/instantiation.js";
import { ExtensionHostKind } from "./extensionHostKind.js";
import { IExtensionHostProxy } from "./extensionHostProxy.js";
import { IInternalExtensionService } from "./extensions.js";
import { IRPCProtocol, ProxyIdentifier } from "./proxyIdentifier.js";
function extHostNamedCustomer(id) {
  return function(ctor) {
    ExtHostCustomersRegistryImpl.INSTANCE.registerNamedCustomer(id, ctor);
  };
}
__name(extHostNamedCustomer, "extHostNamedCustomer");
function extHostCustomer(ctor) {
  ExtHostCustomersRegistryImpl.INSTANCE.registerCustomer(ctor);
}
__name(extHostCustomer, "extHostCustomer");
var ExtHostCustomersRegistry;
((ExtHostCustomersRegistry2) => {
  function getNamedCustomers() {
    return ExtHostCustomersRegistryImpl.INSTANCE.getNamedCustomers();
  }
  ExtHostCustomersRegistry2.getNamedCustomers = getNamedCustomers;
  __name(getNamedCustomers, "getNamedCustomers");
  function getCustomers() {
    return ExtHostCustomersRegistryImpl.INSTANCE.getCustomers();
  }
  ExtHostCustomersRegistry2.getCustomers = getCustomers;
  __name(getCustomers, "getCustomers");
})(ExtHostCustomersRegistry || (ExtHostCustomersRegistry = {}));
class ExtHostCustomersRegistryImpl {
  static {
    __name(this, "ExtHostCustomersRegistryImpl");
  }
  static INSTANCE = new ExtHostCustomersRegistryImpl();
  _namedCustomers;
  _customers;
  constructor() {
    this._namedCustomers = [];
    this._customers = [];
  }
  registerNamedCustomer(id, ctor) {
    const entry = [id, ctor];
    this._namedCustomers.push(entry);
  }
  getNamedCustomers() {
    return this._namedCustomers;
  }
  registerCustomer(ctor) {
    this._customers.push(ctor);
  }
  getCustomers() {
    return this._customers;
  }
}
export {
  ExtHostCustomersRegistry,
  extHostCustomer,
  extHostNamedCustomer
};
//# sourceMappingURL=extHostCustomers.js.map
