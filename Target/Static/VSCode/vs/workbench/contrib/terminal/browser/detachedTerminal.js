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
var __decorateParam = (index, decorator) => (target, key) => decorator(target, key, index);
import * as dom from "../../../../base/browser/dom.js";
import { Delayer } from "../../../../base/common/async.js";
import { onUnexpectedError } from "../../../../base/common/errors.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
import { OperatingSystem } from "../../../../base/common/platform.js";
import { MicrotaskDelay } from "../../../../base/common/symbols.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { TerminalCapabilityStore } from "../../../../platform/terminal/common/capabilities/terminalCapabilityStore.js";
import { IMergedEnvironmentVariableCollection } from "../../../../platform/terminal/common/environmentVariable.js";
import { ITerminalBackend } from "../../../../platform/terminal/common/terminal.js";
import { IDetachedTerminalInstance, IDetachedXTermOptions, IDetachedXtermTerminal, ITerminalContribution, IXtermAttachToElementOptions } from "./terminal.js";
import { TerminalExtensionsRegistry } from "./terminalExtensions.js";
import { TerminalWidgetManager } from "./widgets/widgetManager.js";
import { XtermTerminal } from "./xterm/xtermTerminal.js";
import { IEnvironmentVariableInfo } from "../common/environmentVariable.js";
import { ITerminalProcessInfo, ProcessState } from "../common/terminal.js";
let DetachedTerminal = class extends Disposable {
  constructor(_xterm, options, instantiationService) {
    super();
    this._xterm = _xterm;
    this._register(_xterm);
    const contributionDescs = TerminalExtensionsRegistry.getTerminalContributions();
    for (const desc of contributionDescs) {
      if (this._contributions.has(desc.id)) {
        onUnexpectedError(new Error(`Cannot have two terminal contributions with the same id ${desc.id}`));
        continue;
      }
      if (desc.canRunInDetachedTerminals === false) {
        continue;
      }
      let contribution;
      try {
        contribution = instantiationService.createInstance(desc.ctor, {
          instance: this,
          processManager: options.processInfo,
          widgetManager: this._widgets
        });
        this._contributions.set(desc.id, contribution);
        this._register(contribution);
      } catch (err) {
        onUnexpectedError(err);
      }
    }
    this._register(new Delayer(MicrotaskDelay)).trigger(() => {
      for (const contr of this._contributions.values()) {
        contr.xtermReady?.(this._xterm);
      }
    });
  }
  static {
    __name(this, "DetachedTerminal");
  }
  _widgets = this._register(new TerminalWidgetManager());
  capabilities = new TerminalCapabilityStore();
  _contributions = /* @__PURE__ */ new Map();
  domElement;
  get xterm() {
    return this._xterm;
  }
  get selection() {
    return this._xterm && this.hasSelection() ? this._xterm.raw.getSelection() : void 0;
  }
  hasSelection() {
    return this._xterm.hasSelection();
  }
  clearSelection() {
    this._xterm.clearSelection();
  }
  focus(force) {
    if (force || !dom.getActiveWindow().getSelection()?.toString()) {
      this.xterm.focus();
    }
  }
  attachToElement(container, options) {
    this.domElement = container;
    const screenElement = this._xterm.attachToElement(container, options);
    this._widgets.attachToElement(screenElement);
  }
  forceScrollbarVisibility() {
    this.domElement?.classList.add("force-scrollbar");
  }
  resetScrollbarVisibility() {
    this.domElement?.classList.remove("force-scrollbar");
  }
  getContribution(id) {
    return this._contributions.get(id);
  }
};
DetachedTerminal = __decorateClass([
  __decorateParam(2, IInstantiationService)
], DetachedTerminal);
class DetachedProcessInfo {
  static {
    __name(this, "DetachedProcessInfo");
  }
  processState = ProcessState.Running;
  ptyProcessReady = Promise.resolve();
  shellProcessId;
  remoteAuthority;
  os;
  userHome;
  initialCwd = "";
  environmentVariableInfo;
  persistentProcessId;
  shouldPersist = false;
  hasWrittenData = false;
  hasChildProcesses = false;
  backend;
  capabilities = new TerminalCapabilityStore();
  shellIntegrationNonce = "";
  extEnvironmentVariableCollection;
  constructor(initialValues) {
    Object.assign(this, initialValues);
  }
}
export {
  DetachedProcessInfo,
  DetachedTerminal
};
//# sourceMappingURL=detachedTerminal.js.map
