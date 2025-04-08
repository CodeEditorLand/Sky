var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { DisposableStore } from "../../../base/common/lifecycle.js";
import * as descriptors from "./descriptors.js";
import { ServiceCollection } from "./serviceCollection.js";
var _util;
((_util2) => {
  _util2.serviceIds = /* @__PURE__ */ new Map();
  _util2.DI_TARGET = "$di$target";
  _util2.DI_DEPENDENCIES = "$di$dependencies";
  function getServiceDependencies(ctor) {
    return ctor[_util2.DI_DEPENDENCIES] || [];
  }
  _util2.getServiceDependencies = getServiceDependencies;
  __name(getServiceDependencies, "getServiceDependencies");
})(_util || (_util = {}));
const IInstantiationService = createDecorator("instantiationService");
function storeServiceDependency(id, target, index) {
  if (target[_util.DI_TARGET] === target) {
    target[_util.DI_DEPENDENCIES].push({ id, index });
  } else {
    target[_util.DI_DEPENDENCIES] = [{ id, index }];
    target[_util.DI_TARGET] = target;
  }
}
__name(storeServiceDependency, "storeServiceDependency");
function createDecorator(serviceId) {
  if (_util.serviceIds.has(serviceId)) {
    return _util.serviceIds.get(serviceId);
  }
  const id = /* @__PURE__ */ __name(function(target, key, index) {
    if (arguments.length !== 3) {
      throw new Error("@IServiceName-decorator can only be used to decorate a parameter");
    }
    storeServiceDependency(id, target, index);
  }, "id");
  id.toString = () => serviceId;
  _util.serviceIds.set(serviceId, id);
  return id;
}
__name(createDecorator, "createDecorator");
function refineServiceDecorator(serviceIdentifier) {
  return serviceIdentifier;
}
__name(refineServiceDecorator, "refineServiceDecorator");
export {
  IInstantiationService,
  _util,
  createDecorator,
  refineServiceDecorator
};
//# sourceMappingURL=instantiation.js.map
