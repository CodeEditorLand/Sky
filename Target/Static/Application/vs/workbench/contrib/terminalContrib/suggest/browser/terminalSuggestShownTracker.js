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
import { TimeoutTimer } from "../../../../../base/common/async.js";
import { Disposable } from "../../../../../base/common/lifecycle.js";
import { IStorageService } from "../../../../../platform/storage/common/storage.js";
import { IExtensionService } from "../../../../services/extensions/common/extensions.js";
const TERMINAL_SUGGEST_DISCOVERABILITY_KEY = "terminal.suggest.increasedDiscoverability";
const TERMINAL_SUGGEST_DISCOVERABILITY_COUNT_KEY = "terminal.suggest.increasedDiscoverabilityCount";
const TERMINAL_SUGGEST_DISCOVERABILITY_MAX_COUNT = 10;
const TERMINAL_SUGGEST_DISCOVERABILITY_MIN_MS = 1e4;
let TerminalSuggestShownTracker = class TerminalSuggestShownTracker2 extends Disposable {
  static {
    __name(this, "TerminalSuggestShownTracker");
  }
  constructor(_shellType, _storageService, _extensionService) {
    super();
    this._shellType = _shellType;
    this._storageService = _storageService;
    this._extensionService = _extensionService;
    this._firstShownTracker = void 0;
    this._done = this._storageService.getBoolean(TERMINAL_SUGGEST_DISCOVERABILITY_KEY, -1, false);
    this._count = this._storageService.getNumber(TERMINAL_SUGGEST_DISCOVERABILITY_COUNT_KEY, -1, 0);
    this._register(this._extensionService.onWillStop(() => this._firstShownTracker = void 0));
  }
  get done() {
    return this._done;
  }
  resetState() {
    this._done = false;
    this._count = 0;
    this._start = void 0;
    this._firstShownTracker = void 0;
  }
  resetTimer() {
    if (this._timeout) {
      this._timeout.cancel();
      this._timeout = void 0;
    }
    this._start = void 0;
  }
  update(widgetElt) {
    if (this._done) {
      return;
    }
    this._count++;
    this._storageService.store(
      TERMINAL_SUGGEST_DISCOVERABILITY_COUNT_KEY,
      this._count,
      -1,
      0
      /* StorageTarget.USER */
    );
    if (widgetElt && !widgetElt.classList.contains("increased-discoverability")) {
      widgetElt.classList.add("increased-discoverability");
    }
    if (this._count >= TERMINAL_SUGGEST_DISCOVERABILITY_MAX_COUNT) {
      this._setDone(widgetElt);
    } else if (!this._start) {
      this.resetTimer();
      this._start = Date.now();
      this._timeout = this._register(new TimeoutTimer(() => {
        this._setDone(widgetElt);
      }, TERMINAL_SUGGEST_DISCOVERABILITY_MIN_MS));
    }
  }
  _setDone(widgetElt) {
    this._done = true;
    this._storageService.store(
      TERMINAL_SUGGEST_DISCOVERABILITY_KEY,
      true,
      -1,
      0
      /* StorageTarget.USER */
    );
    if (widgetElt) {
      widgetElt.classList.remove("increased-discoverability");
    }
    if (this._timeout) {
      this._timeout.cancel();
      this._timeout = void 0;
    }
    this._start = void 0;
  }
  getFirstShown(shellType) {
    if (!this._firstShownTracker) {
      this._firstShownTracker = {
        window: true,
        shell: /* @__PURE__ */ new Set([shellType])
      };
      return { window: true, shell: true };
    }
    const isFirstForWindow = this._firstShownTracker.window;
    const isFirstForShell = !this._firstShownTracker.shell.has(shellType);
    if (isFirstForWindow || isFirstForShell) {
      this.updateShown();
    }
    return {
      window: isFirstForWindow,
      shell: isFirstForShell
    };
  }
  updateShown() {
    if (!this._shellType || !this._firstShownTracker) {
      return;
    }
    this._firstShownTracker.window = false;
    this._firstShownTracker.shell.add(this._shellType);
  }
};
TerminalSuggestShownTracker = __decorate([
  __param(1, IStorageService),
  __param(2, IExtensionService)
], TerminalSuggestShownTracker);
export {
  TERMINAL_SUGGEST_DISCOVERABILITY_COUNT_KEY,
  TERMINAL_SUGGEST_DISCOVERABILITY_KEY,
  TerminalSuggestShownTracker
};
//# sourceMappingURL=terminalSuggestShownTracker.js.map
