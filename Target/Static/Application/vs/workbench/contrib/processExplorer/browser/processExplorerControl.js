var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
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
import "./media/processExplorer.css";
import { localize } from "../../../../nls.js";
import { $, append, getDocument } from "../../../../base/browser/dom.js";
import { StandardKeyboardEvent } from "../../../../base/browser/keyboardEvent.js";
import { isRemoteDiagnosticError } from "../../../../platform/diagnostics/common/diagnostics.js";
import { ByteSize } from "../../../../platform/files/common/files.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
import { WorkbenchDataTree } from "../../../../platform/list/browser/listService.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { IProductService } from "../../../../platform/product/common/productService.js";
import { Separator, toAction } from "../../../../base/common/actions.js";
import { IContextMenuService } from "../../../../platform/contextview/browser/contextView.js";
import { coalesce } from "../../../../base/common/arrays.js";
import { ICommandService } from "../../../../platform/commands/common/commands.js";
import { RenderIndentGuides } from "../../../../base/browser/ui/tree/abstractTree.js";
import { Delayer } from "../../../../base/common/async.js";
import { IHoverService } from "../../../../platform/hover/browser/hover.js";
import { getDefaultHoverDelegate } from "../../../../base/browser/ui/hover/hoverDelegateFactory.js";
import { IClipboardService } from "../../../../platform/clipboard/common/clipboardService.js";
import { IRemoteAgentService } from "../../../services/remote/common/remoteAgentService.js";
import { ILabelService } from "../../../../platform/label/common/label.js";
import { Schemas } from "../../../../base/common/network.js";
import { isWeb } from "../../../../base/common/platform.js";
const DEBUG_FLAGS_PATTERN = /\s--inspect(?:-brk|port)?=(?<port>\d+)?/;
const DEBUG_PORT_PATTERN = /\s--inspect-port=(?<port>\d+)/;
function isMachineProcessInformation(item) {
  const candidate = item;
  return !!candidate?.name && !!candidate?.rootProcess;
}
__name(isMachineProcessInformation, "isMachineProcessInformation");
function isProcessInformation(item) {
  const candidate = item;
  return !!candidate?.processRoots;
}
__name(isProcessInformation, "isProcessInformation");
function isProcessItem(item) {
  const candidate = item;
  return typeof candidate?.pid === "number";
}
__name(isProcessItem, "isProcessItem");
class ProcessListDelegate {
  static {
    __name(this, "ProcessListDelegate");
  }
  getHeight() {
    return 22;
  }
  getTemplateId(element) {
    if (isProcessItem(element)) {
      return "process";
    }
    if (isMachineProcessInformation(element)) {
      return "machine";
    }
    if (isRemoteDiagnosticError(element)) {
      return "error";
    }
    if (isProcessInformation(element)) {
      return "header";
    }
    return "";
  }
}
class ProcessTreeDataSource {
  static {
    __name(this, "ProcessTreeDataSource");
  }
  hasChildren(element) {
    if (isRemoteDiagnosticError(element)) {
      return false;
    }
    if (isProcessItem(element)) {
      return !!element.children?.length;
    }
    return true;
  }
  getChildren(element) {
    if (isProcessItem(element)) {
      return element.children ?? [];
    }
    if (isRemoteDiagnosticError(element)) {
      return [];
    }
    if (isProcessInformation(element)) {
      if (element.processRoots.length > 1) {
        return element.processRoots;
      }
      if (element.processRoots.length > 0) {
        return [element.processRoots[0].rootProcess];
      }
      return [];
    }
    if (isMachineProcessInformation(element)) {
      return [element.rootProcess];
    }
    return element.processes ? [element.processes] : [];
  }
}
function createRow(container, extraClass) {
  const row = append(container, $(".row"));
  if (extraClass) {
    row.classList.add(extraClass);
  }
  const name = append(row, $(".cell.name"));
  const cpu = append(row, $(".cell.cpu"));
  const memory = append(row, $(".cell.memory"));
  const pid = append(row, $(".cell.pid"));
  return { name, cpu, memory, pid };
}
__name(createRow, "createRow");
class ProcessHeaderTreeRenderer {
  static {
    __name(this, "ProcessHeaderTreeRenderer");
  }
  constructor() {
    this.templateId = "header";
  }
  renderTemplate(container) {
    container.previousElementSibling?.classList.add("force-no-twistie");
    return createRow(container, "header");
  }
  renderElement(node, index, templateData) {
    templateData.name.textContent = localize("processName", "Process Name");
    templateData.cpu.textContent = localize("processCpu", "CPU (%)");
    templateData.pid.textContent = localize("processPid", "PID");
    templateData.memory.textContent = localize("processMemory", "Memory (MB)");
  }
  disposeTemplate(templateData) {
  }
}
class MachineRenderer {
  static {
    __name(this, "MachineRenderer");
  }
  constructor() {
    this.templateId = "machine";
  }
  renderTemplate(container) {
    return createRow(container);
  }
  renderElement(node, index, templateData) {
    templateData.name.textContent = node.element.name;
  }
  disposeTemplate(templateData) {
  }
}
class ErrorRenderer {
  static {
    __name(this, "ErrorRenderer");
  }
  constructor() {
    this.templateId = "error";
  }
  renderTemplate(container) {
    return createRow(container);
  }
  renderElement(node, index, templateData) {
    templateData.name.textContent = node.element.errorMessage;
  }
  disposeTemplate(templateData) {
  }
}
let ProcessItemHover = class ProcessItemHover2 extends Disposable {
  static {
    __name(this, "ProcessItemHover");
  }
  constructor(container, hoverService) {
    super();
    this.content = "";
    this.hover = this._register(hoverService.setupManagedHover(getDefaultHoverDelegate("mouse"), container, this.content));
  }
  update(content) {
    if (this.content !== content) {
      this.content = content;
      this.hover.update(content);
    }
  }
};
ProcessItemHover = __decorate([
  __param(1, IHoverService)
], ProcessItemHover);
let ProcessRenderer = class ProcessRenderer2 {
  static {
    __name(this, "ProcessRenderer");
  }
  constructor(model, hoverService) {
    this.model = model;
    this.hoverService = hoverService;
    this.templateId = "process";
  }
  renderTemplate(container) {
    const row = createRow(container);
    return {
      name: row.name,
      cpu: row.cpu,
      memory: row.memory,
      pid: row.pid,
      hover: new ProcessItemHover(row.name, this.hoverService)
    };
  }
  renderElement(node, index, templateData) {
    const { element } = node;
    const pid = element.pid.toFixed(0);
    templateData.name.textContent = this.model.getName(element.pid, element.name);
    templateData.cpu.textContent = element.load.toFixed(0);
    templateData.memory.textContent = (element.mem / ByteSize.MB).toFixed(0);
    templateData.pid.textContent = pid;
    templateData.pid.parentElement.id = `pid-${pid}`;
    templateData.hover?.update(element.cmd);
  }
  disposeTemplate(templateData) {
    templateData.hover?.dispose();
  }
};
ProcessRenderer = __decorate([
  __param(1, IHoverService)
], ProcessRenderer);
class ProcessAccessibilityProvider {
  static {
    __name(this, "ProcessAccessibilityProvider");
  }
  getWidgetAriaLabel() {
    return localize("processExplorer", "Process Explorer");
  }
  getAriaLabel(element) {
    if (isProcessItem(element) || isMachineProcessInformation(element)) {
      return element.name;
    }
    if (isRemoteDiagnosticError(element)) {
      return element.hostName;
    }
    return null;
  }
}
class ProcessIdentityProvider {
  static {
    __name(this, "ProcessIdentityProvider");
  }
  getId(element) {
    if (isProcessItem(element)) {
      return element.pid.toString();
    }
    if (isRemoteDiagnosticError(element)) {
      return element.hostName;
    }
    if (isProcessInformation(element)) {
      return "processes";
    }
    if (isMachineProcessInformation(element)) {
      return element.name;
    }
    return "header";
  }
}
let ProcessExplorerControl = class ProcessExplorerControl2 extends Disposable {
  static {
    __name(this, "ProcessExplorerControl");
  }
  constructor(instantiationService, productService, contextMenuService, commandService, clipboardService) {
    super();
    this.instantiationService = instantiationService;
    this.productService = productService;
    this.contextMenuService = contextMenuService;
    this.commandService = commandService;
    this.clipboardService = clipboardService;
    this.dimensions = void 0;
    this.delayer = this._register(new Delayer(1e3));
    this.model = new ProcessExplorerModel(this.productService);
  }
  create(container) {
    this.createProcessTree(container);
    this.update();
  }
  createProcessTree(container) {
    container.classList.add("process-explorer");
    container.id = "process-explorer";
    const renderers = [
      this.instantiationService.createInstance(ProcessRenderer, this.model),
      new ProcessHeaderTreeRenderer(),
      new MachineRenderer(),
      new ErrorRenderer()
    ];
    this.tree = this._register(this.instantiationService.createInstance(WorkbenchDataTree, "processExplorer", container, new ProcessListDelegate(), renderers, new ProcessTreeDataSource(), {
      accessibilityProvider: new ProcessAccessibilityProvider(),
      identityProvider: new ProcessIdentityProvider(),
      expandOnlyOnTwistieClick: true,
      renderIndentGuides: RenderIndentGuides.OnHover
    }));
    this._register(this.tree.onKeyDown((e) => this.onTreeKeyDown(e)));
    this._register(this.tree.onContextMenu((e) => this.onTreeContextMenu(container, e)));
    this.tree.setInput(this.model);
    this.layoutTree();
  }
  async onTreeKeyDown(e) {
    const event = new StandardKeyboardEvent(e);
    if (event.keyCode === 35 && event.altKey) {
      const selectionPids = this.getSelectedPids();
      await Promise.all(selectionPids.map((pid) => this.killProcess?.(pid, "SIGTERM")));
    }
  }
  onTreeContextMenu(container, e) {
    if (!isProcessItem(e.element)) {
      return;
    }
    const item = e.element;
    const pid = Number(item.pid);
    const actions = [];
    if (typeof this.killProcess === "function") {
      actions.push(toAction({ id: "killProcess", label: localize("killProcess", "Kill Process"), run: /* @__PURE__ */ __name(() => this.killProcess?.(pid, "SIGTERM"), "run") }));
      actions.push(toAction({ id: "forceKillProcess", label: localize("forceKillProcess", "Force Kill Process"), run: /* @__PURE__ */ __name(() => this.killProcess?.(pid, "SIGKILL"), "run") }));
      actions.push(new Separator());
    }
    actions.push(toAction({
      id: "copy",
      label: localize("copy", "Copy"),
      run: /* @__PURE__ */ __name(() => {
        const selectionPids = this.getSelectedPids();
        if (!selectionPids?.includes(pid)) {
          selectionPids.length = 0;
          selectionPids.push(pid);
        }
        const rows = selectionPids?.map((e2) => getDocument(container).getElementById(`pid-${e2}`)).filter((e2) => !!e2);
        if (rows) {
          const text = rows.map((e2) => e2.innerText).filter((e2) => !!e2);
          this.clipboardService.writeText(text.join("\n"));
        }
      }, "run")
    }));
    actions.push(toAction({
      id: "copyAll",
      label: localize("copyAll", "Copy All"),
      run: /* @__PURE__ */ __name(() => {
        const processList = getDocument(container).getElementById("process-explorer");
        if (processList) {
          this.clipboardService.writeText(processList.innerText);
        }
      }, "run")
    }));
    if (this.isDebuggable(item.cmd)) {
      actions.push(new Separator());
      actions.push(toAction({ id: "debug", label: localize("debug", "Debug"), run: /* @__PURE__ */ __name(() => this.attachTo(item), "run") }));
    }
    this.contextMenuService.showContextMenu({
      getAnchor: /* @__PURE__ */ __name(() => e.anchor, "getAnchor"),
      getActions: /* @__PURE__ */ __name(() => actions, "getActions")
    });
  }
  isDebuggable(cmd) {
    if (isWeb) {
      return false;
    }
    const matches = DEBUG_FLAGS_PATTERN.exec(cmd);
    return matches && matches.groups.port !== "0" || cmd.indexOf("node ") >= 0 || cmd.indexOf("node.exe") >= 0;
  }
  attachTo(item) {
    const config = {
      type: "node",
      request: "attach",
      name: `process ${item.pid}`
    };
    let matches = DEBUG_FLAGS_PATTERN.exec(item.cmd);
    if (matches) {
      config.port = Number(matches.groups.port);
    } else {
      config.processId = String(item.pid);
    }
    matches = DEBUG_PORT_PATTERN.exec(item.cmd);
    if (matches) {
      config.port = Number(matches.groups.port);
    }
    this.commandService.executeCommand("debug.startFromConfig", config);
  }
  getSelectedPids() {
    return coalesce(this.tree?.getSelection()?.map((e) => {
      if (!isProcessItem(e)) {
        return void 0;
      }
      return e.pid;
    }) ?? []);
  }
  async update() {
    const { processes, pidToNames } = await this.resolveProcesses();
    this.model.update(processes, pidToNames);
    this.tree?.updateChildren();
    this.layoutTree();
    this.delayer.trigger(() => this.update());
  }
  focus() {
    this.tree?.domFocus();
  }
  layout(dimension) {
    this.dimensions = dimension;
    this.layoutTree();
  }
  layoutTree() {
    if (this.dimensions && this.tree) {
      this.tree.layout(this.dimensions.height, this.dimensions.width);
    }
  }
};
ProcessExplorerControl = __decorate([
  __param(0, IInstantiationService),
  __param(1, IProductService),
  __param(2, IContextMenuService),
  __param(3, ICommandService),
  __param(4, IClipboardService)
], ProcessExplorerControl);
let ProcessExplorerModel = class ProcessExplorerModel2 {
  static {
    __name(this, "ProcessExplorerModel");
  }
  constructor(productService) {
    this.productService = productService;
    this.processes = { processRoots: [] };
    this.mapPidToName = /* @__PURE__ */ new Map();
  }
  update(processRoots, pidToNames) {
    this.mapPidToName.clear();
    for (const [pid, name] of pidToNames) {
      this.mapPidToName.set(pid, name);
    }
    processRoots.forEach((info, index) => {
      if (isProcessItem(info.rootProcess)) {
        info.rootProcess.name = index === 0 ? this.productService.applicationName : "remote-server";
      }
    });
    this.processes = { processRoots };
  }
  getName(pid, fallback) {
    return this.mapPidToName.get(pid) ?? fallback;
  }
};
ProcessExplorerModel = __decorate([
  __param(0, IProductService)
], ProcessExplorerModel);
let BrowserProcessExplorerControl = class BrowserProcessExplorerControl2 extends ProcessExplorerControl {
  static {
    __name(this, "BrowserProcessExplorerControl");
  }
  constructor(container, instantiationService, productService, contextMenuService, commandService, clipboardService, remoteAgentService, labelService) {
    super(instantiationService, productService, contextMenuService, commandService, clipboardService);
    this.remoteAgentService = remoteAgentService;
    this.labelService = labelService;
    this.create(container);
  }
  async resolveProcesses() {
    const connection = this.remoteAgentService.getConnection();
    if (!connection) {
      return { pidToNames: [], processes: [] };
    }
    const processes = [];
    const hostName = this.labelService.getHostLabel(Schemas.vscodeRemote, connection.remoteAuthority);
    const result = await this.remoteAgentService.getDiagnosticInfo({ includeProcesses: true });
    if (result) {
      if (isRemoteDiagnosticError(result)) {
        processes.push({ name: result.hostName, rootProcess: result });
      } else if (result.processes) {
        processes.push({ name: hostName, rootProcess: result.processes });
      }
    }
    return { pidToNames: [], processes };
  }
};
BrowserProcessExplorerControl = __decorate([
  __param(1, IInstantiationService),
  __param(2, IProductService),
  __param(3, IContextMenuService),
  __param(4, ICommandService),
  __param(5, IClipboardService),
  __param(6, IRemoteAgentService),
  __param(7, ILabelService)
], BrowserProcessExplorerControl);
export {
  BrowserProcessExplorerControl,
  ProcessExplorerControl
};
//# sourceMappingURL=processExplorerControl.js.map
