var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Disposable } from "../../../../base/common/lifecycle.js";
import { observableValue } from "../../../../base/common/observable.js";
import { URI } from "../../../../base/common/uri.js";
import { ILogService } from "../../../../platform/log/common/log.js";
import { IStorageService } from "../../../../platform/storage/common/storage.js";
import { IUriIdentityService } from "../../../../platform/uriIdentity/common/uriIdentity.js";
import { Breakpoint, DataBreakpoint, ExceptionBreakpoint, Expression, FunctionBreakpoint } from "./debugModel.js";
import { ITextFileService } from "../../../services/textfile/common/textfiles.js";
import { mapValues } from "../../../../base/common/objects.js";
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
const DEBUG_BREAKPOINTS_KEY = "debug.breakpoint";
const DEBUG_FUNCTION_BREAKPOINTS_KEY = "debug.functionbreakpoint";
const DEBUG_DATA_BREAKPOINTS_KEY = "debug.databreakpoint";
const DEBUG_EXCEPTION_BREAKPOINTS_KEY = "debug.exceptionbreakpoint";
const DEBUG_WATCH_EXPRESSIONS_KEY = "debug.watchexpressions";
const DEBUG_CHOSEN_ENVIRONMENTS_KEY = "debug.chosenenvironment";
const DEBUG_UX_STATE_KEY = "debug.uxstate";
let DebugStorage = class DebugStorage2 extends Disposable {
  static {
    __name(this, "DebugStorage");
  }
  constructor(storageService, textFileService, uriIdentityService, logService) {
    super();
    this.storageService = storageService;
    this.textFileService = textFileService;
    this.uriIdentityService = uriIdentityService;
    this.logService = logService;
    this.breakpoints = observableValue(this, this.loadBreakpoints());
    this.functionBreakpoints = observableValue(this, this.loadFunctionBreakpoints());
    this.exceptionBreakpoints = observableValue(this, this.loadExceptionBreakpoints());
    this.dataBreakpoints = observableValue(this, this.loadDataBreakpoints());
    this.watchExpressions = observableValue(this, this.loadWatchExpressions());
    this._register(storageService.onDidChangeValue(1, void 0, this._store)((e) => {
      if (e.external) {
        switch (e.key) {
          case DEBUG_BREAKPOINTS_KEY:
            return this.breakpoints.set(this.loadBreakpoints(), void 0);
          case DEBUG_FUNCTION_BREAKPOINTS_KEY:
            return this.functionBreakpoints.set(this.loadFunctionBreakpoints(), void 0);
          case DEBUG_EXCEPTION_BREAKPOINTS_KEY:
            return this.exceptionBreakpoints.set(this.loadExceptionBreakpoints(), void 0);
          case DEBUG_DATA_BREAKPOINTS_KEY:
            return this.dataBreakpoints.set(this.loadDataBreakpoints(), void 0);
          case DEBUG_WATCH_EXPRESSIONS_KEY:
            return this.watchExpressions.set(this.loadWatchExpressions(), void 0);
        }
      }
    }));
  }
  loadDebugUxState() {
    return this.storageService.get(DEBUG_UX_STATE_KEY, 1, "default");
  }
  storeDebugUxState(value) {
    this.storageService.store(
      DEBUG_UX_STATE_KEY,
      value,
      1,
      1
      /* StorageTarget.MACHINE */
    );
  }
  loadBreakpoints() {
    let result;
    try {
      result = JSON.parse(this.storageService.get(DEBUG_BREAKPOINTS_KEY, 1, "[]")).map((breakpoint) => {
        breakpoint.uri = URI.revive(breakpoint.uri);
        return new Breakpoint(breakpoint, this.textFileService, this.uriIdentityService, this.logService, breakpoint.id);
      });
    } catch (e) {
    }
    return result || [];
  }
  loadFunctionBreakpoints() {
    let result;
    try {
      result = JSON.parse(this.storageService.get(DEBUG_FUNCTION_BREAKPOINTS_KEY, 1, "[]")).map((fb) => {
        return new FunctionBreakpoint(fb, fb.id);
      });
    } catch (e) {
    }
    return result || [];
  }
  loadExceptionBreakpoints() {
    let result;
    try {
      result = JSON.parse(this.storageService.get(DEBUG_EXCEPTION_BREAKPOINTS_KEY, 1, "[]")).map((exBreakpoint) => {
        return new ExceptionBreakpoint(exBreakpoint, exBreakpoint.id);
      });
    } catch (e) {
    }
    return result || [];
  }
  loadDataBreakpoints() {
    let result;
    try {
      result = JSON.parse(this.storageService.get(DEBUG_DATA_BREAKPOINTS_KEY, 1, "[]")).map((dbp) => {
        return new DataBreakpoint(dbp, dbp.id);
      });
    } catch (e) {
    }
    return result || [];
  }
  loadWatchExpressions() {
    let result;
    try {
      result = JSON.parse(this.storageService.get(DEBUG_WATCH_EXPRESSIONS_KEY, 1, "[]")).map((watchStoredData) => {
        return new Expression(watchStoredData.name, watchStoredData.id);
      });
    } catch (e) {
    }
    return result || [];
  }
  loadChosenEnvironments() {
    const obj = JSON.parse(this.storageService.get(DEBUG_CHOSEN_ENVIRONMENTS_KEY, 1, "{}"));
    return mapValues(obj, (value) => typeof value === "string" ? { type: value } : value);
  }
  storeChosenEnvironments(environments) {
    this.storageService.store(
      DEBUG_CHOSEN_ENVIRONMENTS_KEY,
      JSON.stringify(environments),
      1,
      1
      /* StorageTarget.MACHINE */
    );
  }
  storeWatchExpressions(watchExpressions) {
    if (watchExpressions.length) {
      this.storageService.store(
        DEBUG_WATCH_EXPRESSIONS_KEY,
        JSON.stringify(watchExpressions.map((we) => ({ name: we.name, id: we.getId() }))),
        1,
        1
        /* StorageTarget.MACHINE */
      );
    } else {
      this.storageService.remove(
        DEBUG_WATCH_EXPRESSIONS_KEY,
        1
        /* StorageScope.WORKSPACE */
      );
    }
  }
  storeBreakpoints(debugModel) {
    const breakpoints = debugModel.getBreakpoints();
    if (breakpoints.length) {
      this.storageService.store(
        DEBUG_BREAKPOINTS_KEY,
        JSON.stringify(breakpoints),
        1,
        1
        /* StorageTarget.MACHINE */
      );
    } else {
      this.storageService.remove(
        DEBUG_BREAKPOINTS_KEY,
        1
        /* StorageScope.WORKSPACE */
      );
    }
    const functionBreakpoints = debugModel.getFunctionBreakpoints();
    if (functionBreakpoints.length) {
      this.storageService.store(
        DEBUG_FUNCTION_BREAKPOINTS_KEY,
        JSON.stringify(functionBreakpoints),
        1,
        1
        /* StorageTarget.MACHINE */
      );
    } else {
      this.storageService.remove(
        DEBUG_FUNCTION_BREAKPOINTS_KEY,
        1
        /* StorageScope.WORKSPACE */
      );
    }
    const dataBreakpoints = debugModel.getDataBreakpoints().filter((dbp) => dbp.canPersist);
    if (dataBreakpoints.length) {
      this.storageService.store(
        DEBUG_DATA_BREAKPOINTS_KEY,
        JSON.stringify(dataBreakpoints),
        1,
        1
        /* StorageTarget.MACHINE */
      );
    } else {
      this.storageService.remove(
        DEBUG_DATA_BREAKPOINTS_KEY,
        1
        /* StorageScope.WORKSPACE */
      );
    }
    const exceptionBreakpoints = debugModel.getExceptionBreakpoints();
    if (exceptionBreakpoints.length) {
      this.storageService.store(
        DEBUG_EXCEPTION_BREAKPOINTS_KEY,
        JSON.stringify(exceptionBreakpoints),
        1,
        1
        /* StorageTarget.MACHINE */
      );
    } else {
      this.storageService.remove(
        DEBUG_EXCEPTION_BREAKPOINTS_KEY,
        1
        /* StorageScope.WORKSPACE */
      );
    }
  }
};
DebugStorage = __decorate([
  __param(0, IStorageService),
  __param(1, ITextFileService),
  __param(2, IUriIdentityService),
  __param(3, ILogService)
], DebugStorage);
export {
  DebugStorage
};
//# sourceMappingURL=debugStorage.js.map
