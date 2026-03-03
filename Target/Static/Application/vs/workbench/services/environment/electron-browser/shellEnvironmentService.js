var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { createDecorator } from "../../../../platform/instantiation/common/instantiation.js";
import { process } from "../../../../base/parts/sandbox/electron-browser/globals.js";
import { registerSingleton } from "../../../../platform/instantiation/common/extensions.js";
const IShellEnvironmentService = createDecorator("shellEnvironmentService");
class ShellEnvironmentService {
  static {
    __name(this, "ShellEnvironmentService");
  }
  getShellEnv() {
    return process.shellEnv();
  }
}
registerSingleton(
  IShellEnvironmentService,
  ShellEnvironmentService,
  1
  /* InstantiationType.Delayed */
);
export {
  IShellEnvironmentService,
  ShellEnvironmentService
};
//# sourceMappingURL=shellEnvironmentService.js.map
