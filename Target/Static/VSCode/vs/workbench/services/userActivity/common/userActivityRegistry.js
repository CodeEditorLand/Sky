var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { IUserActivityService } from "./userActivityService.js";
class UserActivityRegistry {
  static {
    __name(this, "UserActivityRegistry");
  }
  todo = [];
  add = /* @__PURE__ */ __name((ctor) => {
    this.todo.push(ctor);
  }, "add");
  take(userActivityService, instantiation) {
    this.add = (ctor) => instantiation.createInstance(ctor, userActivityService);
    this.todo.forEach(this.add);
    this.todo = [];
  }
}
const userActivityRegistry = new UserActivityRegistry();
export {
  userActivityRegistry
};
//# sourceMappingURL=userActivityRegistry.js.map
