import { createDecorator } from "../../../../platform/instantiation/common/instantiation.js";
const variablePageSize = 100;
var ProxyKernelState;
(function(ProxyKernelState2) {
  ProxyKernelState2[ProxyKernelState2["Disconnected"] = 1] = "Disconnected";
  ProxyKernelState2[ProxyKernelState2["Connected"] = 2] = "Connected";
  ProxyKernelState2[ProxyKernelState2["Initializing"] = 3] = "Initializing";
})(ProxyKernelState || (ProxyKernelState = {}));
const INotebookKernelService = createDecorator("INotebookKernelService");
const INotebookKernelHistoryService = createDecorator("INotebookKernelHistoryService");
export {
  INotebookKernelHistoryService,
  INotebookKernelService,
  ProxyKernelState,
  variablePageSize
};
//# sourceMappingURL=notebookKernelService.js.map
