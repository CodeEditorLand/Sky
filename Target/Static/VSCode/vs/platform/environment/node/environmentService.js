var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { homedir, tmpdir } from "os";
import { NativeParsedArgs } from "../common/argv.js";
import { IDebugParams } from "../common/environment.js";
import { AbstractNativeEnvironmentService, parseDebugParams } from "../common/environmentService.js";
import { getUserDataPath } from "./userDataPath.js";
import { IProductService } from "../../product/common/productService.js";
class NativeEnvironmentService extends AbstractNativeEnvironmentService {
  static {
    __name(this, "NativeEnvironmentService");
  }
  constructor(args, productService) {
    super(args, {
      homeDir: homedir(),
      tmpDir: tmpdir(),
      userDataDir: getUserDataPath(args, productService.nameShort)
    }, productService);
  }
}
function parsePtyHostDebugPort(args, isBuilt) {
  return parseDebugParams(args["inspect-ptyhost"], args["inspect-brk-ptyhost"], 5877, isBuilt, args.extensionEnvironment);
}
__name(parsePtyHostDebugPort, "parsePtyHostDebugPort");
function parseSharedProcessDebugPort(args, isBuilt) {
  return parseDebugParams(args["inspect-sharedprocess"], args["inspect-brk-sharedprocess"], 5879, isBuilt, args.extensionEnvironment);
}
__name(parseSharedProcessDebugPort, "parseSharedProcessDebugPort");
export {
  NativeEnvironmentService,
  parsePtyHostDebugPort,
  parseSharedProcessDebugPort
};
//# sourceMappingURL=environmentService.js.map
