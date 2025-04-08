import { IAction } from "../../../../base/common/actions.js";
import { AsyncIterableObject } from "../../../../base/common/async.js";
import { CancellationToken } from "../../../../base/common/cancellation.js";
import { Event } from "../../../../base/common/event.js";
import { IDisposable } from "../../../../base/common/lifecycle.js";
import { URI } from "../../../../base/common/uri.js";
import { IContextKeyService } from "../../../../platform/contextkey/common/contextkey.js";
import { ExtensionIdentifier } from "../../../../platform/extensions/common/extensions.js";
import { createDecorator } from "../../../../platform/instantiation/common/instantiation.js";
import { INotebookKernelSourceAction } from "./notebookCommon.js";
const variablePageSize = 100;
var ProxyKernelState = /* @__PURE__ */ ((ProxyKernelState2) => {
  ProxyKernelState2[ProxyKernelState2["Disconnected"] = 1] = "Disconnected";
  ProxyKernelState2[ProxyKernelState2["Connected"] = 2] = "Connected";
  ProxyKernelState2[ProxyKernelState2["Initializing"] = 3] = "Initializing";
  return ProxyKernelState2;
})(ProxyKernelState || {});
const INotebookKernelService = createDecorator("INotebookKernelService");
const INotebookKernelHistoryService = createDecorator("INotebookKernelHistoryService");
export {
  INotebookKernelHistoryService,
  INotebookKernelService,
  ProxyKernelState,
  variablePageSize
};
//# sourceMappingURL=notebookKernelService.js.map
