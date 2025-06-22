var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Context, Effect, Layer, Runtime } from "../../effect";
import {
  _util
} from "vs/platform/instantiation/common/instantiation.js";
import { LayerMap } from "./Register.js";
class InstantiationServiceImpl {
  constructor(AppRuntime, AppContext) {
    this.AppRuntime = AppRuntime;
    this.AppContext = AppContext;
  }
  static {
    __name(this, "InstantiationServiceImpl");
  }
  _serviceBrand;
  /**
   * Creates an instance of a class, satisfying its dependencies.
   * This is the core of the compatibility bridge.
   */
  createInstance = /* @__PURE__ */ __name((ctorOrDescriptor, ...args) => {
    const Constructor = ctorOrDescriptor.ctor ?? ctorOrDescriptor;
    const StaticArgument = ctorOrDescriptor.staticArgument ?? [];
    const ServiceLayer = LayerMap.get(Constructor);
    if (ServiceLayer) {
      const InstanceLayer = Layer.provide(
        ServiceLayer,
        this.AppContext
      );
      const InstanceRuntime = Runtime.runSync(
        Effect.scoped(Layer.toRuntime(InstanceLayer))
      );
      const InstanceContext = Runtime.context(InstanceRuntime);
      const Dependencies2 = Array.from(InstanceContext.tags).map(
        (tag) => InstanceContext.get(tag)
      );
      return new Constructor(...StaticArgument, ...args, ...Dependencies2);
    }
    const Dependencies = Constructor[_util.DI_DEPENDENCIES]?.map((dep) => this.AppContext.get(dep.id)).filter(Boolean) ?? [];
    return new Constructor(...StaticArgument, ...args, ...Dependencies);
  }, "createInstance");
  /**
   * Invokes a function with a `ServicesAccessor`, allowing it to access services
   * from our main application context.
   */
  invokeFunction = /* @__PURE__ */ __name((fn, ...args) => {
    const accessor = {
      get: /* @__PURE__ */ __name((id) => this.AppContext.get(id), "get")
    };
    return fn(accessor, ...args);
  }, "invokeFunction");
  /**
   * Creates a child instantiation service with additional services.
   */
  createChild = /* @__PURE__ */ __name((services) => {
    let ChildContext = this.AppContext;
    for (const [id, service] of services) {
      ChildContext = Context.add(
        ChildContext,
        id,
        service
      );
    }
    const ChildRuntime = Runtime.make(ChildContext);
    return new InstantiationServiceImpl(ChildRuntime, ChildContext);
  }, "createChild");
  /**
   * Disposes of the instantiation service by shutting down the entire Effect runtime.
   */
  dispose = /* @__PURE__ */ __name(() => {
    Runtime.runFork(this.AppRuntime.shutdown);
  }, "dispose");
}
const Definition = /* @__PURE__ */ __name((AppRuntime) => Effect.sync(
  () => new InstantiationServiceImpl(
    AppRuntime,
    Runtime.context(AppRuntime)
  )
), "Definition");
var Definition_default = Definition;
export {
  Definition_default as default
};
//# sourceMappingURL=Definition.js.map
