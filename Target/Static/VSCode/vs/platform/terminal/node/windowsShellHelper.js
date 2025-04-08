var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp(target, key, result);
  return result;
};
import { timeout } from "../../../base/common/async.js";
import { debounce } from "../../../base/common/decorators.js";
import { Emitter, Event } from "../../../base/common/event.js";
import { Disposable, IDisposable } from "../../../base/common/lifecycle.js";
import { isWindows, platform } from "../../../base/common/platform.js";
import { GeneralShellType, TerminalShellType, WindowsShellType } from "../common/terminal.js";
const SHELL_EXECUTABLES = [
  "cmd.exe",
  "powershell.exe",
  "pwsh.exe",
  "bash.exe",
  "git-cmd.exe",
  "wsl.exe",
  "ubuntu.exe",
  "ubuntu1804.exe",
  "kali.exe",
  "debian.exe",
  "opensuse-42.exe",
  "sles-12.exe",
  "julia.exe",
  "nu.exe",
  "node.exe"
];
const SHELL_EXECUTABLE_REGEXES = [
  /^python(\d(\.\d{0,2})?)?\.exe$/
];
let windowsProcessTree;
class WindowsShellHelper extends Disposable {
  constructor(_rootProcessId) {
    super();
    this._rootProcessId = _rootProcessId;
    if (!isWindows) {
      throw new Error(`WindowsShellHelper cannot be instantiated on ${platform}`);
    }
    this._startMonitoringShell();
  }
  static {
    __name(this, "WindowsShellHelper");
  }
  _currentRequest;
  _shellType;
  get shellType() {
    return this._shellType;
  }
  _shellTitle = "";
  get shellTitle() {
    return this._shellTitle;
  }
  _onShellNameChanged = new Emitter();
  get onShellNameChanged() {
    return this._onShellNameChanged.event;
  }
  _onShellTypeChanged = new Emitter();
  get onShellTypeChanged() {
    return this._onShellTypeChanged.event;
  }
  async _startMonitoringShell() {
    if (this._store.isDisposed) {
      return;
    }
    this.checkShell();
  }
  async checkShell() {
    if (isWindows) {
      await timeout(300);
      this.getShellName().then((title) => {
        const type = this.getShellType(title);
        if (type !== this._shellType) {
          this._onShellTypeChanged.fire(type);
          this._onShellNameChanged.fire(title);
          this._shellType = type;
          this._shellTitle = title;
        }
      });
    }
  }
  traverseTree(tree) {
    if (!tree) {
      return "";
    }
    if (SHELL_EXECUTABLES.indexOf(tree.name) === -1) {
      return tree.name;
    }
    for (const regex of SHELL_EXECUTABLE_REGEXES) {
      if (tree.name.match(regex)) {
        return tree.name;
      }
    }
    if (!tree.children || tree.children.length === 0) {
      return tree.name;
    }
    let favouriteChild = 0;
    for (; favouriteChild < tree.children.length; favouriteChild++) {
      const child = tree.children[favouriteChild];
      if (!child.children || child.children.length === 0) {
        break;
      }
      if (child.children[0].name !== "conhost.exe") {
        break;
      }
    }
    if (favouriteChild >= tree.children.length) {
      return tree.name;
    }
    return this.traverseTree(tree.children[favouriteChild]);
  }
  /**
   * Returns the innermost shell executable running in the terminal
   */
  async getShellName() {
    if (this._store.isDisposed) {
      return Promise.resolve("");
    }
    if (this._currentRequest) {
      return this._currentRequest;
    }
    if (!windowsProcessTree) {
      windowsProcessTree = await import("@vscode/windows-process-tree");
    }
    this._currentRequest = new Promise((resolve) => {
      windowsProcessTree.getProcessTree(this._rootProcessId, (tree) => {
        const name = this.traverseTree(tree);
        this._currentRequest = void 0;
        resolve(name);
      });
    });
    return this._currentRequest;
  }
  getShellType(executable) {
    switch (executable.toLowerCase()) {
      case "cmd.exe":
        return WindowsShellType.CommandPrompt;
      case "powershell.exe":
      case "pwsh.exe":
        return GeneralShellType.PowerShell;
      case "bash.exe":
      case "git-cmd.exe":
        return WindowsShellType.GitBash;
      case "julia.exe":
        return GeneralShellType.Julia;
      case "node.exe":
        return GeneralShellType.Node;
      case "nu.exe":
        return GeneralShellType.NuShell;
      case "wsl.exe":
      case "ubuntu.exe":
      case "ubuntu1804.exe":
      case "kali.exe":
      case "debian.exe":
      case "opensuse-42.exe":
      case "sles-12.exe":
        return WindowsShellType.Wsl;
      default:
        if (executable.match(/python(\d(\.\d{0,2})?)?\.exe/)) {
          return GeneralShellType.Python;
        }
        return void 0;
    }
  }
}
__decorateClass([
  debounce(500)
], WindowsShellHelper.prototype, "checkShell", 1);
export {
  WindowsShellHelper
};
//# sourceMappingURL=windowsShellHelper.js.map
