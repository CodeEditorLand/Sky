var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Disposable, DisposableStore } from "../../../../../../../base/common/lifecycle.js";
import { Emitter } from "../../../../../../../base/common/event.js";
import { disposableTimeout } from "../../../../../../../base/common/async.js";
var TerminalToolAutoExpandTimeout;
(function(TerminalToolAutoExpandTimeout2) {
  TerminalToolAutoExpandTimeout2[TerminalToolAutoExpandTimeout2["NoData"] = 500] = "NoData";
  TerminalToolAutoExpandTimeout2[TerminalToolAutoExpandTimeout2["DataEvent"] = 50] = "DataEvent";
})(TerminalToolAutoExpandTimeout || (TerminalToolAutoExpandTimeout = {}));
class TerminalToolAutoExpand extends Disposable {
  static {
    __name(this, "TerminalToolAutoExpand");
  }
  constructor(_options) {
    super();
    this._options = _options;
    this._commandFinished = false;
    this._receivedData = false;
    this._onDidRequestExpand = this._register(new Emitter());
    this.onDidRequestExpand = this._onDidRequestExpand.event;
    this._setupListeners();
  }
  _setupListeners() {
    const store = this._register(new DisposableStore());
    const commandDetection = this._options.commandDetection;
    store.add(commandDetection.onCommandExecuted(() => {
      if (this._options.shouldAutoExpand() && !this._noDataTimeout) {
        this._noDataTimeout = disposableTimeout(() => {
          this._noDataTimeout = void 0;
          if (!this._receivedData && this._options.shouldAutoExpand() && this._options.hasRealOutput()) {
            this._onDidRequestExpand.fire();
          }
        }, 500, store);
      }
    }));
    store.add(this._options.onWillData(() => {
      if (this._receivedData) {
        return;
      }
      this._receivedData = true;
      this._noDataTimeout?.dispose();
      this._noDataTimeout = void 0;
      if (this._options.shouldAutoExpand() && !this._dataEventTimeout) {
        this._dataEventTimeout = disposableTimeout(() => {
          this._dataEventTimeout = void 0;
          if (!this._commandFinished && this._options.shouldAutoExpand() && this._options.hasRealOutput()) {
            this._onDidRequestExpand.fire();
          }
        }, 50, store);
      }
    }));
    store.add(commandDetection.onCommandFinished(() => {
      this._commandFinished = true;
      this._clearAutoExpandTimeouts();
    }));
  }
  _clearAutoExpandTimeouts() {
    this._dataEventTimeout?.dispose();
    this._dataEventTimeout = void 0;
    this._noDataTimeout?.dispose();
    this._noDataTimeout = void 0;
  }
}
export {
  TerminalToolAutoExpand,
  TerminalToolAutoExpandTimeout
};
//# sourceMappingURL=terminalToolAutoExpand.js.map
