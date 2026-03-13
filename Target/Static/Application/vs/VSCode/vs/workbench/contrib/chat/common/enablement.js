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
import { Disposable } from "../../../../base/common/lifecycle.js";
import { observableMemento } from "../../../../platform/observable/common/observableMemento.js";
import { IStorageService } from "../../../../platform/storage/common/storage.js";
var ContributionEnablementState;
(function(ContributionEnablementState2) {
  ContributionEnablementState2[ContributionEnablementState2["DisabledProfile"] = 0] = "DisabledProfile";
  ContributionEnablementState2[ContributionEnablementState2["DisabledWorkspace"] = 1] = "DisabledWorkspace";
  ContributionEnablementState2[ContributionEnablementState2["EnabledProfile"] = 2] = "EnabledProfile";
  ContributionEnablementState2[ContributionEnablementState2["EnabledWorkspace"] = 3] = "EnabledWorkspace";
})(ContributionEnablementState || (ContributionEnablementState = {}));
function isContributionEnabled(state) {
  return state === 2 || state === 3;
}
__name(isContributionEnabled, "isContributionEnabled");
function isContributionDisabled(state) {
  return !isContributionEnabled(state);
}
__name(isContributionDisabled, "isContributionDisabled");
function mapToStorage(value) {
  return JSON.stringify([...value]);
}
__name(mapToStorage, "mapToStorage");
function mapFromStorage(value) {
  const parsed = JSON.parse(value);
  return new Map(Array.isArray(parsed) ? parsed : []);
}
__name(mapFromStorage, "mapFromStorage");
let EnablementModel = class EnablementModel2 extends Disposable {
  static {
    __name(this, "EnablementModel");
  }
  constructor(storageKey, storageService) {
    super();
    const mapMemento = observableMemento({
      key: storageKey,
      defaultValue: /* @__PURE__ */ new Map(),
      toStorage: mapToStorage,
      fromStorage: mapFromStorage
    });
    this._profileState = this._register(mapMemento(0, 1, storageService));
    this._workspaceState = this._register(mapMemento(1, 1, storageService));
  }
  readEnabled(key, reader) {
    const wsMap = this._workspaceState.read(reader);
    if (wsMap.has(key)) {
      return wsMap.get(key) ? 3 : 1;
    }
    const profileMap = this._profileState.read(reader);
    if (profileMap.has(key)) {
      return profileMap.get(key) ? 2 : 0;
    }
    return 2;
  }
  setEnabled(key, state) {
    switch (state) {
      case 2: {
        this._deleteFromMap(this._profileState, key);
        this._deleteFromMap(this._workspaceState, key);
        break;
      }
      case 0: {
        this._setInMap(this._profileState, key, false);
        this._deleteFromMap(this._workspaceState, key);
        break;
      }
      case 3: {
        this._setInMap(this._workspaceState, key, true);
        break;
      }
      case 1: {
        this._setInMap(this._workspaceState, key, false);
        break;
      }
    }
  }
  _setInMap(memento, key, value) {
    const current = memento.get();
    if (current.get(key) === value) {
      return;
    }
    const next = new Map(current);
    next.set(key, value);
    memento.set(next, void 0);
  }
  _deleteFromMap(memento, key) {
    const current = memento.get();
    if (!current.has(key)) {
      return;
    }
    const next = new Map(current);
    next.delete(key);
    memento.set(next, void 0);
  }
};
EnablementModel = __decorate([
  __param(1, IStorageService)
], EnablementModel);
export {
  ContributionEnablementState,
  EnablementModel,
  isContributionDisabled,
  isContributionEnabled
};
//# sourceMappingURL=enablement.js.map
