var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Context } from "effect";
class IPCTag extends Context.Tag("IPC")() {
  static {
    __name(this, "IPCTag");
  }
}
const IPC = IPCTag;
var IPCTag_default = IPCTag;
export {
  IPC,
  IPCTag,
  IPCTag_default as default
};
//# sourceMappingURL=IPCTag.js.map
