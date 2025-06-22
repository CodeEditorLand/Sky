var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Emitter } from "../../../../base/common/event.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
import { emptyProgressRunner } from "../../../../platform/progress/common/progress.js";
class EditorProgressIndicator extends Disposable {
  static {
    __name(this, "EditorProgressIndicator");
  }
  constructor(progressBar, group) {
    super();
    this.progressBar = progressBar;
    this.group = group;
    this.registerListeners();
  }
  registerListeners() {
    this._register(this.group.onDidModelChange((e) => {
      if (e.kind === 8 || e.kind === 6 && this.group.isEmpty) {
        this.progressBar.stop().hide();
      }
    }));
  }
  show(infiniteOrTotal, delay) {
    if (this.group.isEmpty) {
      return emptyProgressRunner;
    }
    if (infiniteOrTotal === true) {
      return this.doShow(true, delay);
    }
    return this.doShow(infiniteOrTotal, delay);
  }
  doShow(infiniteOrTotal, delay) {
    if (typeof infiniteOrTotal === "boolean") {
      this.progressBar.infinite().show(delay);
    } else {
      this.progressBar.total(infiniteOrTotal).show(delay);
    }
    return {
      total: /* @__PURE__ */ __name((total) => {
        this.progressBar.total(total);
      }, "total"),
      worked: /* @__PURE__ */ __name((worked) => {
        if (this.progressBar.hasTotal()) {
          this.progressBar.worked(worked);
        } else {
          this.progressBar.infinite().show();
        }
      }, "worked"),
      done: /* @__PURE__ */ __name(() => {
        this.progressBar.stop().hide();
      }, "done")
    };
  }
  async showWhile(promise, delay) {
    if (this.group.isEmpty) {
      try {
        await promise;
      } catch (error) {
      }
    }
    return this.doShowWhile(promise, delay);
  }
  async doShowWhile(promise, delay) {
    try {
      this.progressBar.infinite().show(delay);
      await promise;
    } catch (error) {
    } finally {
      this.progressBar.stop().hide();
    }
  }
}
var ProgressIndicatorState;
(function(ProgressIndicatorState2) {
  let Type;
  (function(Type2) {
    Type2[Type2["None"] = 0] = "None";
    Type2[Type2["Done"] = 1] = "Done";
    Type2[Type2["Infinite"] = 2] = "Infinite";
    Type2[Type2["While"] = 3] = "While";
    Type2[Type2["Work"] = 4] = "Work";
  })(Type = ProgressIndicatorState2.Type || (ProgressIndicatorState2.Type = {}));
  ProgressIndicatorState2.None = {
    type: 0
    /* Type.None */
  };
  ProgressIndicatorState2.Done = {
    type: 1
    /* Type.Done */
  };
  ProgressIndicatorState2.Infinite = {
    type: 2
    /* Type.Infinite */
  };
  class While {
    static {
      __name(this, "While");
    }
    constructor(whilePromise, whileStart, whileDelay) {
      this.whilePromise = whilePromise;
      this.whileStart = whileStart;
      this.whileDelay = whileDelay;
      this.type = 3;
    }
  }
  ProgressIndicatorState2.While = While;
  class Work {
    static {
      __name(this, "Work");
    }
    constructor(total, worked) {
      this.total = total;
      this.worked = worked;
      this.type = 4;
    }
  }
  ProgressIndicatorState2.Work = Work;
})(ProgressIndicatorState || (ProgressIndicatorState = {}));
class ScopedProgressIndicator extends Disposable {
  static {
    __name(this, "ScopedProgressIndicator");
  }
  constructor(progressBar, scope) {
    super();
    this.progressBar = progressBar;
    this.scope = scope;
    this.progressState = ProgressIndicatorState.None;
    this.registerListeners();
  }
  registerListeners() {
    this._register(this.scope.onDidChangeActive(() => {
      if (this.scope.isActive) {
        this.onDidScopeActivate();
      } else {
        this.onDidScopeDeactivate();
      }
    }));
  }
  onDidScopeActivate() {
    if (this.progressState.type === ProgressIndicatorState.Done.type) {
      return;
    }
    if (this.progressState.type === 3) {
      let delay;
      if (this.progressState.whileDelay > 0) {
        const remainingDelay = this.progressState.whileDelay - (Date.now() - this.progressState.whileStart);
        if (remainingDelay > 0) {
          delay = remainingDelay;
        }
      }
      this.doShowWhile(delay);
    } else if (this.progressState.type === 2) {
      this.progressBar.infinite().show();
    } else if (this.progressState.type === 4) {
      if (this.progressState.total) {
        this.progressBar.total(this.progressState.total).show();
      }
      if (this.progressState.worked) {
        this.progressBar.worked(this.progressState.worked).show();
      }
    }
  }
  onDidScopeDeactivate() {
    this.progressBar.stop().hide();
  }
  show(infiniteOrTotal, delay) {
    if (typeof infiniteOrTotal === "boolean") {
      this.progressState = ProgressIndicatorState.Infinite;
    } else {
      this.progressState = new ProgressIndicatorState.Work(infiniteOrTotal, void 0);
    }
    if (this.scope.isActive) {
      if (this.progressState.type === 2) {
        this.progressBar.infinite().show(delay);
      } else if (this.progressState.type === 4 && typeof this.progressState.total === "number") {
        this.progressBar.total(this.progressState.total).show(delay);
      }
    }
    return {
      total: /* @__PURE__ */ __name((total) => {
        this.progressState = new ProgressIndicatorState.Work(total, this.progressState.type === 4 ? this.progressState.worked : void 0);
        if (this.scope.isActive) {
          this.progressBar.total(total);
        }
      }, "total"),
      worked: /* @__PURE__ */ __name((worked) => {
        if (!this.scope.isActive || this.progressBar.hasTotal()) {
          this.progressState = new ProgressIndicatorState.Work(this.progressState.type === 4 ? this.progressState.total : void 0, this.progressState.type === 4 && typeof this.progressState.worked === "number" ? this.progressState.worked + worked : worked);
          if (this.scope.isActive) {
            this.progressBar.worked(worked);
          }
        } else {
          this.progressState = ProgressIndicatorState.Infinite;
          this.progressBar.infinite().show();
        }
      }, "worked"),
      done: /* @__PURE__ */ __name(() => {
        this.progressState = ProgressIndicatorState.Done;
        if (this.scope.isActive) {
          this.progressBar.stop().hide();
        }
      }, "done")
    };
  }
  async showWhile(promise, delay) {
    if (this.progressState.type === 3) {
      promise = Promise.allSettled([promise, this.progressState.whilePromise]);
    }
    this.progressState = new ProgressIndicatorState.While(promise, delay || 0, Date.now());
    try {
      this.doShowWhile(delay);
      await promise;
    } catch (error) {
    } finally {
      if (this.progressState.type !== 3 || this.progressState.whilePromise === promise) {
        this.progressState = ProgressIndicatorState.None;
        if (this.scope.isActive) {
          this.progressBar.stop().hide();
        }
      }
    }
  }
  doShowWhile(delay) {
    if (this.scope.isActive) {
      this.progressBar.infinite().show(delay);
    }
  }
}
class AbstractProgressScope extends Disposable {
  static {
    __name(this, "AbstractProgressScope");
  }
  get isActive() {
    return this._isActive;
  }
  constructor(scopeId, _isActive) {
    super();
    this.scopeId = scopeId;
    this._isActive = _isActive;
    this._onDidChangeActive = this._register(new Emitter());
    this.onDidChangeActive = this._onDidChangeActive.event;
  }
  onScopeOpened(scopeId) {
    if (scopeId === this.scopeId) {
      if (!this._isActive) {
        this._isActive = true;
        this._onDidChangeActive.fire();
      }
    }
  }
  onScopeClosed(scopeId) {
    if (scopeId === this.scopeId) {
      if (this._isActive) {
        this._isActive = false;
        this._onDidChangeActive.fire();
      }
    }
  }
}
export {
  AbstractProgressScope,
  EditorProgressIndicator,
  ScopedProgressIndicator
};
//# sourceMappingURL=progressIndicator.js.map
