var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
class UserActivityRegistry {
  static {
    __name(this, "UserActivityRegistry");
  }
  constructor() {
    this.todo = [];
    this.add = (ctor) => {
      this.todo.push(ctor);
    };
  }
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
