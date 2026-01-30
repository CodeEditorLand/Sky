var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
class TriggerInlineEditCommandsRegistry {
  static {
    __name(this, "TriggerInlineEditCommandsRegistry");
  }
  static {
    this.REGISTERED_COMMANDS = /* @__PURE__ */ new Set();
  }
  static getRegisteredCommands() {
    return [...TriggerInlineEditCommandsRegistry.REGISTERED_COMMANDS];
  }
  static registerCommand(commandId) {
    TriggerInlineEditCommandsRegistry.REGISTERED_COMMANDS.add(commandId);
  }
}
export {
  TriggerInlineEditCommandsRegistry
};
//# sourceMappingURL=triggerInlineEditCommandsRegistry.js.map
