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
import * as dom from "../../../../base/browser/dom.js";
import { Delayer } from "../../../../base/common/async.js";
import { onUnexpectedError } from "../../../../base/common/errors.js";
import { Disposable, DisposableStore, MutableDisposable } from "../../../../base/common/lifecycle.js";
import { MicrotaskDelay } from "../../../../base/common/symbols.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { TerminalCapabilityStore } from "../../../../platform/terminal/common/capabilities/terminalCapabilityStore.js";
import { TerminalExtensionsRegistry } from "./terminalExtensions.js";
import { TerminalWidgetManager } from "./widgets/widgetManager.js";
let DetachedTerminal = class DetachedTerminal2 extends Disposable {
  static {
    __name(this, "DetachedTerminal");
  }
  get xterm() {
    return this._xterm;
  }
  constructor(_xterm, options, instantiationService) {
    super();
    this._xterm = _xterm;
    this._widgets = this._register(new TerminalWidgetManager());
    this._contributions = /* @__PURE__ */ new Map();
    this._attachDisposables = this._register(new MutableDisposable());
    this.onData = this._xterm.raw.onData;
    const capabilities = options.capabilities ?? new TerminalCapabilityStore();
    this._register(capabilities);
    this.capabilities = capabilities;
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
    const attachStore = new DisposableStore();
    const scheduleFocus = /* @__PURE__ */ __name(() => {
      setTimeout(() => this.focus(true), 0);
    }, "scheduleFocus");
    attachStore.add(dom.addDisposableListener(container, dom.EventType.MOUSE_DOWN, scheduleFocus));
    this._attachDisposables.value = attachStore;
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
DetachedTerminal = __decorate([
  __param(2, IInstantiationService)
], DetachedTerminal);
class DetachedProcessInfo extends Disposable {
  static {
    __name(this, "DetachedProcessInfo");
  }
  constructor(initialValues) {
    super();
    this.processState = 3;
    this.ptyProcessReady = Promise.resolve();
    this.initialCwd = "";
    this.shouldPersist = false;
    this.hasWrittenData = false;
    this.hasChildProcesses = false;
    this.shellIntegrationNonce = "";
    Object.assign(this, initialValues);
    this.capabilities = this._register(new TerminalCapabilityStore());
  }
}
export {
  DetachedProcessInfo,
  DetachedTerminal
};
//# sourceMappingURL=detachedTerminal.js.map
