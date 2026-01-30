var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
class CommandCenterControlRegistryImpl {
  static {
    __name(this, "CommandCenterControlRegistryImpl");
  }
  constructor() {
    this.registrations = [];
  }
  /**
   * Register a custom command center control.
   */
  register(registration) {
    this.registrations.push(registration);
    this.registrations.sort((a, b) => b.priority - a.priority);
    return {
      dispose: /* @__PURE__ */ __name(() => {
        const index = this.registrations.indexOf(registration);
        if (index >= 0) {
          this.registrations.splice(index, 1);
        }
      }, "dispose")
    };
  }
  /**
   * Get all registered command center controls.
   */
  getRegistrations() {
    return this.registrations;
  }
}
const CommandCenterControlRegistry = new CommandCenterControlRegistryImpl();
export {
  CommandCenterControlRegistry
};
//# sourceMappingURL=commandCenterControlRegistry.js.map
