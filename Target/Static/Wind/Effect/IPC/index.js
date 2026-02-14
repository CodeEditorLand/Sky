import { IPCTag, IPC } from "./Tag/IPCTag.js";
import { TauriIPCLive } from "./Implementation/TauriIPC.js";
import { IPCTauriLive } from "./Live.js";
import { MockIPCLive } from "./Mock.js";
import {
  CreateIPCInvokeError,
  CreateIPCSendError,
  CreateIPCSubscriptionError
} from "./Error/IPCError.js";
export {
  CreateIPCInvokeError,
  CreateIPCSendError,
  CreateIPCSubscriptionError,
  IPC,
  IPCTag,
  MockIPCLive,
  TauriIPCLive,
  IPCTauriLive as default
};
//# sourceMappingURL=index.js.map
