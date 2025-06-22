var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { IClipboardService } from "../../../../platform/clipboard/common/clipboardService.js";
import { ICommandService } from "../../../../platform/commands/common/commands.js";
import { IContextMenuService } from "../../../../platform/contextview/browser/contextView.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { INativeHostService } from "../../../../platform/native/common/native.js";
import { IProcessService } from "../../../../platform/process/common/process.js";
import { IProductService } from "../../../../platform/product/common/productService.js";
import { ProcessExplorerControl } from "../browser/processExplorerControl.js";
var __decorate = function(decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
  else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = function(paramIndex, decorator) {
  return function(target, key) {
    decorator(target, key, paramIndex);
  };
};
let NativeProcessExplorerControl = class NativeProcessExplorerControl2 extends ProcessExplorerControl {
  static {
    __name(this, "NativeProcessExplorerControl");
  }
  constructor(container, instantiationService, productService, contextMenuService, nativeHostService, commandService, processService, clipboardService) {
    super(instantiationService, productService, contextMenuService, commandService, clipboardService);
    this.nativeHostService = nativeHostService;
    this.processService = processService;
    this.create(container);
  }
  killProcess(pid, signal) {
    return this.nativeHostService.killProcess(pid, signal);
  }
  resolveProcesses() {
    return this.processService.resolveProcesses();
  }
};
NativeProcessExplorerControl = __decorate([
  __param(1, IInstantiationService),
  __param(2, IProductService),
  __param(3, IContextMenuService),
  __param(4, INativeHostService),
  __param(5, ICommandService),
  __param(6, IProcessService),
  __param(7, IClipboardService)
], NativeProcessExplorerControl);
export {
  NativeProcessExplorerControl
};
//# sourceMappingURL=processExplorerControl.js.map
