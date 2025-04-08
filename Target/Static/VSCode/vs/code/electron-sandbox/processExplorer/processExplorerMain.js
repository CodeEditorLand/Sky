var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import "./media/processExplorer.css";
import "../../../base/browser/ui/codicons/codiconStyles.js";
import { localize } from "../../../nls.js";
import { $, append } from "../../../base/browser/dom.js";
import { createStyleSheet } from "../../../base/browser/domStylesheets.js";
import { IListVirtualDelegate } from "../../../base/browser/ui/list/list.js";
import { DataTree } from "../../../base/browser/ui/tree/dataTree.js";
import { IDataSource, ITreeNode, ITreeRenderer } from "../../../base/browser/ui/tree/tree.js";
import { RunOnceScheduler } from "../../../base/common/async.js";
import { ProcessItem } from "../../../base/common/processes.js";
import { IContextMenuItem } from "../../../base/parts/contextmenu/common/contextmenu.js";
import { popup } from "../../../base/parts/contextmenu/electron-sandbox/contextmenu.js";
import { ipcRenderer } from "../../../base/parts/sandbox/electron-sandbox/globals.js";
import { IRemoteDiagnosticError, isRemoteDiagnosticError } from "../../../platform/diagnostics/common/diagnostics.js";
import { ByteSize } from "../../../platform/files/common/files.js";
import { ElectronIPCMainProcessService } from "../../../platform/ipc/electron-sandbox/mainProcessService.js";
import { ProcessExplorerData, ProcessExplorerStyles, ProcessExplorerWindowConfiguration } from "../../../platform/process/common/process.js";
import { INativeHostService } from "../../../platform/native/common/native.js";
import { NativeHostService } from "../../../platform/native/common/nativeHostService.js";
import { getIconsStyleSheet } from "../../../platform/theme/browser/iconsStyleSheet.js";
import { applyZoom, zoomIn, zoomOut } from "../../../platform/window/electron-sandbox/window.js";
import { StandardKeyboardEvent } from "../../../base/browser/keyboardEvent.js";
import { KeyCode } from "../../../base/common/keyCodes.js";
import { mainWindow } from "../../../base/browser/window.js";
const DEBUG_FLAGS_PATTERN = /\s--inspect(?:-brk|port)?=(?<port>\d+)?/;
const DEBUG_PORT_PATTERN = /\s--inspect-port=(?<port>\d+)/;
class ProcessListDelegate {
  static {
    __name(this, "ProcessListDelegate");
  }
  getHeight(element) {
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
    } else {
      return true;
    }
  }
  getChildren(element) {
    if (isProcessItem(element)) {
      return element.children ? element.children : [];
    }
    if (isRemoteDiagnosticError(element)) {
      return [];
    }
    if (isProcessInformation(element)) {
      if (element.processRoots.length > 1) {
        return element.processRoots;
      } else {
        return [element.processRoots[0].rootProcess];
      }
    }
    if (isMachineProcessInformation(element)) {
      return [element.rootProcess];
    }
    return [element.processes];
  }
}
class ProcessHeaderTreeRenderer {
  static {
    __name(this, "ProcessHeaderTreeRenderer");
  }
  templateId = "header";
  renderTemplate(container) {
    const row = append(container, $(".row"));
    const name = append(row, $(".nameLabel"));
    const CPU = append(row, $(".cpu"));
    const memory = append(row, $(".memory"));
    const PID = append(row, $(".pid"));
    return { name, CPU, memory, PID };
  }
  renderElement(node, index, templateData, height) {
    templateData.name.textContent = localize("name", "Process Name");
    templateData.CPU.textContent = localize("cpu", "CPU (%)");
    templateData.PID.textContent = localize("pid", "PID");
    templateData.memory.textContent = localize("memory", "Memory (MB)");
  }
  disposeTemplate(templateData) {
  }
}
class MachineRenderer {
  static {
    __name(this, "MachineRenderer");
  }
  templateId = "machine";
  renderTemplate(container) {
    const data = /* @__PURE__ */ Object.create(null);
    const row = append(container, $(".row"));
    data.name = append(row, $(".nameLabel"));
    return data;
  }
  renderElement(node, index, templateData, height) {
    templateData.name.textContent = node.element.name;
  }
  disposeTemplate(templateData) {
  }
}
class ErrorRenderer {
  static {
    __name(this, "ErrorRenderer");
  }
  templateId = "error";
  renderTemplate(container) {
    const data = /* @__PURE__ */ Object.create(null);
    const row = append(container, $(".row"));
    data.name = append(row, $(".nameLabel"));
    return data;
  }
  renderElement(node, index, templateData, height) {
    templateData.name.textContent = node.element.errorMessage;
  }
  disposeTemplate(templateData) {
  }
}
class ProcessRenderer {
  constructor(platform, totalMem, mapPidToName) {
    this.platform = platform;
    this.totalMem = totalMem;
    this.mapPidToName = mapPidToName;
  }
  static {
    __name(this, "ProcessRenderer");
  }
  templateId = "process";
  renderTemplate(container) {
    const row = append(container, $(".row"));
    const name = append(row, $(".nameLabel"));
    const CPU = append(row, $(".cpu"));
    const memory = append(row, $(".memory"));
    const PID = append(row, $(".pid"));
    return { name, CPU, PID, memory };
  }
  renderElement(node, index, templateData, height) {
    const { element } = node;
    const pid = element.pid.toFixed(0);
    let name = element.name;
    if (this.mapPidToName.has(element.pid)) {
      name = this.mapPidToName.get(element.pid);
    }
    templateData.name.textContent = name;
    templateData.name.title = element.cmd;
    templateData.CPU.textContent = element.load.toFixed(0);
    templateData.PID.textContent = pid;
    templateData.PID.parentElement.id = `pid-${pid}`;
    const memory = this.platform === "win32" ? element.mem : this.totalMem * (element.mem / 100);
    templateData.memory.textContent = (memory / ByteSize.MB).toFixed(0);
  }
  disposeTemplate(templateData) {
  }
}
function isMachineProcessInformation(item) {
  return !!item.name && !!item.rootProcess;
}
__name(isMachineProcessInformation, "isMachineProcessInformation");
function isProcessInformation(item) {
  return !!item.processRoots;
}
__name(isProcessInformation, "isProcessInformation");
function isProcessItem(item) {
  return !!item.pid;
}
__name(isProcessItem, "isProcessItem");
class ProcessExplorer {
  constructor(windowId, data) {
    this.data = data;
    const mainProcessService = new ElectronIPCMainProcessService(windowId);
    this.nativeHostService = new NativeHostService(windowId, mainProcessService);
    this.applyStyles(data.styles);
    this.setEventHandlers(data);
    ipcRenderer.on("vscode:pidToNameResponse", (event, pidToNames) => {
      this.mapPidToName.clear();
      for (const [pid, name] of pidToNames) {
        this.mapPidToName.set(pid, name);
      }
    });
    ipcRenderer.on("vscode:listProcessesResponse", async (event, processRoots) => {
      processRoots.forEach((info, index) => {
        if (isProcessItem(info.rootProcess)) {
          info.rootProcess.name = index === 0 ? `${this.data.applicationName} main` : "remote agent";
        }
      });
      if (!this.tree) {
        await this.createProcessTree(processRoots);
      } else {
        this.tree.setInput({ processes: { processRoots } });
        this.tree.layout(mainWindow.innerHeight, mainWindow.innerWidth);
      }
      this.requestProcessList(0);
    });
    this.lastRequestTime = Date.now();
    ipcRenderer.send("vscode:pidToNameRequest");
    ipcRenderer.send("vscode:listProcesses");
  }
  static {
    __name(this, "ProcessExplorer");
  }
  lastRequestTime;
  mapPidToName = /* @__PURE__ */ new Map();
  nativeHostService;
  tree;
  setEventHandlers(data) {
    mainWindow.document.onkeydown = (e) => {
      const cmdOrCtrlKey = data.platform === "darwin" ? e.metaKey : e.ctrlKey;
      if (cmdOrCtrlKey && e.keyCode === 87) {
        e.stopPropagation();
        e.preventDefault();
        ipcRenderer.send("vscode:closeProcessExplorer");
      }
      if (cmdOrCtrlKey && e.keyCode === 187) {
        zoomIn(mainWindow);
      }
      if (cmdOrCtrlKey && e.keyCode === 189) {
        zoomOut(mainWindow);
      }
    };
  }
  async createProcessTree(processRoots) {
    const container = mainWindow.document.getElementById("process-list");
    if (!container) {
      return;
    }
    const { totalmem } = await this.nativeHostService.getOSStatistics();
    const renderers = [
      new ProcessRenderer(this.data.platform, totalmem, this.mapPidToName),
      new ProcessHeaderTreeRenderer(),
      new MachineRenderer(),
      new ErrorRenderer()
    ];
    this.tree = new DataTree(
      "processExplorer",
      container,
      new ProcessListDelegate(),
      renderers,
      new ProcessTreeDataSource(),
      {
        identityProvider: {
          getId: /* @__PURE__ */ __name((element) => {
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
          }, "getId")
        }
      }
    );
    this.tree.setInput({ processes: { processRoots } });
    this.tree.layout(mainWindow.innerHeight, mainWindow.innerWidth);
    this.tree.onKeyDown((e) => {
      const event = new StandardKeyboardEvent(e);
      if (event.keyCode === KeyCode.KeyE && event.altKey) {
        const selectionPids = this.getSelectedPids();
        void Promise.all(selectionPids.map((pid) => this.nativeHostService.killProcess(pid, "SIGTERM"))).then(() => this.tree?.refresh());
      }
    });
    this.tree.onContextMenu((e) => {
      if (isProcessItem(e.element)) {
        this.showContextMenu(e.element, true);
      }
    });
    container.style.height = `${mainWindow.innerHeight}px`;
    mainWindow.addEventListener("resize", () => {
      container.style.height = `${mainWindow.innerHeight}px`;
      this.tree?.layout(mainWindow.innerHeight, mainWindow.innerWidth);
    });
  }
  isDebuggable(cmd) {
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
    ipcRenderer.send("vscode:workbenchCommand", { id: "debug.startFromConfig", from: "processExplorer", args: [config] });
  }
  applyStyles(styles) {
    const styleElement = createStyleSheet();
    const content = [];
    if (styles.listFocusBackground) {
      content.push(`.monaco-list:focus .monaco-list-row.focused { background-color: ${styles.listFocusBackground}; }`);
      content.push(`.monaco-list:focus .monaco-list-row.focused:hover { background-color: ${styles.listFocusBackground}; }`);
    }
    if (styles.listFocusForeground) {
      content.push(`.monaco-list:focus .monaco-list-row.focused { color: ${styles.listFocusForeground}; }`);
    }
    if (styles.listActiveSelectionBackground) {
      content.push(`.monaco-list:focus .monaco-list-row.selected { background-color: ${styles.listActiveSelectionBackground}; }`);
      content.push(`.monaco-list:focus .monaco-list-row.selected:hover { background-color: ${styles.listActiveSelectionBackground}; }`);
    }
    if (styles.listActiveSelectionForeground) {
      content.push(`.monaco-list:focus .monaco-list-row.selected { color: ${styles.listActiveSelectionForeground}; }`);
    }
    if (styles.listHoverBackground) {
      content.push(`.monaco-list-row:hover:not(.selected):not(.focused) { background-color: ${styles.listHoverBackground}; }`);
    }
    if (styles.listHoverForeground) {
      content.push(`.monaco-list-row:hover:not(.selected):not(.focused) { color: ${styles.listHoverForeground}; }`);
    }
    if (styles.listFocusOutline) {
      content.push(`.monaco-list:focus .monaco-list-row.focused { outline: 1px solid ${styles.listFocusOutline}; outline-offset: -1px; }`);
    }
    if (styles.listHoverOutline) {
      content.push(`.monaco-list-row:hover { outline: 1px dashed ${styles.listHoverOutline}; outline-offset: -1px; }`);
    }
    if (styles.scrollbarShadowColor) {
      content.push(`
				.monaco-scrollable-element > .shadow.top {
					box-shadow: ${styles.scrollbarShadowColor} 0 6px 6px -6px inset;
				}

				.monaco-scrollable-element > .shadow.left {
					box-shadow: ${styles.scrollbarShadowColor} 6px 0 6px -6px inset;
				}

				.monaco-scrollable-element > .shadow.top.left {
					box-shadow: ${styles.scrollbarShadowColor} 6px 6px 6px -6px inset;
				}
			`);
    }
    if (styles.scrollbarSliderBackgroundColor) {
      content.push(`
				.monaco-scrollable-element > .scrollbar > .slider {
					background: ${styles.scrollbarSliderBackgroundColor};
				}
			`);
    }
    if (styles.scrollbarSliderHoverBackgroundColor) {
      content.push(`
				.monaco-scrollable-element > .scrollbar > .slider:hover {
					background: ${styles.scrollbarSliderHoverBackgroundColor};
				}
			`);
    }
    if (styles.scrollbarSliderActiveBackgroundColor) {
      content.push(`
				.monaco-scrollable-element > .scrollbar > .slider.active {
					background: ${styles.scrollbarSliderActiveBackgroundColor};
				}
			`);
    }
    styleElement.textContent = content.join("\n");
    if (styles.color) {
      mainWindow.document.body.style.color = styles.color;
    }
  }
  showContextMenu(item, isLocal) {
    const items = [];
    const pid = Number(item.pid);
    if (isLocal) {
      items.push({
        accelerator: "Alt+E",
        label: localize("killProcess", "Kill Process"),
        click: /* @__PURE__ */ __name(() => {
          this.nativeHostService.killProcess(pid, "SIGTERM");
        }, "click")
      });
      items.push({
        label: localize("forceKillProcess", "Force Kill Process"),
        click: /* @__PURE__ */ __name(() => {
          this.nativeHostService.killProcess(pid, "SIGKILL");
        }, "click")
      });
      items.push({
        type: "separator"
      });
    }
    items.push({
      label: localize("copy", "Copy"),
      click: /* @__PURE__ */ __name(() => {
        const selectionPids = this.getSelectedPids();
        if (!selectionPids?.includes(pid)) {
          selectionPids.length = 0;
          selectionPids.push(pid);
        }
        const rows = selectionPids?.map((e) => mainWindow.document.getElementById(`pid-${e}`)).filter((e) => !!e);
        if (rows) {
          const text = rows.map((e) => e.innerText).filter((e) => !!e);
          this.nativeHostService.writeClipboardText(text.join("\n"));
        }
      }, "click")
    });
    items.push({
      label: localize("copyAll", "Copy All"),
      click: /* @__PURE__ */ __name(() => {
        const processList = mainWindow.document.getElementById("process-list");
        if (processList) {
          this.nativeHostService.writeClipboardText(processList.innerText);
        }
      }, "click")
    });
    if (item && isLocal && this.isDebuggable(item.cmd)) {
      items.push({
        type: "separator"
      });
      items.push({
        label: localize("debug", "Debug"),
        click: /* @__PURE__ */ __name(() => {
          this.attachTo(item);
        }, "click")
      });
    }
    popup(items);
  }
  requestProcessList(totalWaitTime) {
    setTimeout(() => {
      const nextRequestTime = Date.now();
      const waited = totalWaitTime + nextRequestTime - this.lastRequestTime;
      this.lastRequestTime = nextRequestTime;
      if (waited > 1e3) {
        ipcRenderer.send("vscode:pidToNameRequest");
        ipcRenderer.send("vscode:listProcesses");
      } else {
        this.requestProcessList(waited);
      }
    }, 200);
  }
  getSelectedPids() {
    return this.tree?.getSelection()?.map((e) => {
      if (!e || !("pid" in e)) {
        return void 0;
      }
      return e.pid;
    }).filter((e) => !!e);
  }
}
function createCodiconStyleSheet() {
  const codiconStyleSheet = createStyleSheet();
  codiconStyleSheet.id = "codiconStyles";
  const iconsStyleSheet = getIconsStyleSheet(void 0);
  function updateAll() {
    codiconStyleSheet.textContent = iconsStyleSheet.getCSS();
  }
  __name(updateAll, "updateAll");
  const delayer = new RunOnceScheduler(updateAll, 0);
  iconsStyleSheet.onDidChange(() => delayer.schedule());
  delayer.schedule();
}
__name(createCodiconStyleSheet, "createCodiconStyleSheet");
function startup(configuration) {
  const platformClass = configuration.data.platform === "win32" ? "windows" : configuration.data.platform === "linux" ? "linux" : "mac";
  mainWindow.document.body.classList.add(platformClass);
  createCodiconStyleSheet();
  applyZoom(configuration.data.zoomLevel, mainWindow);
  new ProcessExplorer(configuration.windowId, configuration.data);
}
__name(startup, "startup");
export {
  startup
};
//# sourceMappingURL=processExplorerMain.js.map
