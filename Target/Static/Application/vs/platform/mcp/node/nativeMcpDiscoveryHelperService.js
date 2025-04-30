var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { homedir } from "os";
import { platform } from "../../../base/common/platform.js";
import { URI } from "../../../base/common/uri.js";
class NativeMcpDiscoveryHelperService {
  static {
    __name(this, "NativeMcpDiscoveryHelperService");
  }
  constructor() {
  }
  load() {
    return Promise.resolve({
      platform,
      homedir: URI.file(homedir()),
      winAppData: this.uriFromEnvVariable("APPDATA"),
      xdgHome: this.uriFromEnvVariable("XDG_CONFIG_HOME")
    });
  }
  uriFromEnvVariable(varName) {
    const envVar = process.env[varName];
    if (!envVar) {
      return void 0;
    }
    return URI.file(envVar);
  }
}
export {
  NativeMcpDiscoveryHelperService
};
//# sourceMappingURL=nativeMcpDiscoveryHelperService.js.map
