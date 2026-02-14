var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
class SandboxNotReadyError extends Error {
  static {
    __name(this, "SandboxNotReadyError");
  }
  _tag = "SandboxNotReadyError";
  constructor() {
    super("window.vscode is not initialized. Preload script not executed.");
  }
}
export {
  SandboxNotReadyError
};
//# sourceMappingURL=SandboxNotReadyError.js.map
