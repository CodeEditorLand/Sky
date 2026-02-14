import { Layer } from "effect";
import { IPCTag } from "./Tag/IPCTag.js";
import { TauriIPCLive } from "./Implementation/TauriIPC.js";
const IPCTauriLive = Layer.effect(IPCTag, TauriIPCLive);
var Live_default = IPCTauriLive;
export {
  IPCTauriLive,
  Live_default as default
};
//# sourceMappingURL=Live.js.map
