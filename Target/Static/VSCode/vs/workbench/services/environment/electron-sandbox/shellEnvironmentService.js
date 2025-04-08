var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { createDecorator } from "../../../../platform/instantiation/common/instantiation.js";
import { IProcessEnvironment } from "../../../../base/common/platform.js";
import { process } from "../../../../base/parts/sandbox/electron-sandbox/globals.js";
import { InstantiationType, registerSingleton } from "../../../../platform/instantiation/common/extensions.js";
const IShellEnvironmentService = createDecorator("shellEnvironmentService");
class ShellEnvironmentService {
  static {
    __name(this, "ShellEnvironmentService");
  }
  getShellEnv() {
    return process.shellEnv();
  }
}
registerSingleton(IShellEnvironmentService, ShellEnvironmentService, InstantiationType.Delayed);
export {
  IShellEnvironmentService,
  ShellEnvironmentService
};
//# sourceMappingURL=shellEnvironmentService.js.map
