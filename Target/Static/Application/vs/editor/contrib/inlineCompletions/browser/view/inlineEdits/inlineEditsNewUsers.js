var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { timeout } from "../../../../../../base/common/async.js";
import { BugIndicatingError } from "../../../../../../base/common/errors.js";
import { Disposable, DisposableStore, MutableDisposable } from "../../../../../../base/common/lifecycle.js";
import { autorun, autorunWithStore, derived, observableValue, runOnChange, runOnChangeWithCancellationToken } from "../../../../../../base/common/observable.js";
import { IConfigurationService } from "../../../../../../platform/configuration/common/configuration.js";
import { IStorageService } from "../../../../../../platform/storage/common/storage.js";
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
var UserKind;
(function(UserKind2) {
  UserKind2["FirstTime"] = "firstTime";
  UserKind2["SecondTime"] = "secondTime";
  UserKind2["Active"] = "active";
})(UserKind || (UserKind = {}));
let InlineEditsOnboardingExperience = class InlineEditsOnboardingExperience2 extends Disposable {
  static {
    __name(this, "InlineEditsOnboardingExperience");
  }
  constructor(_host, _model, _indicator, _collapsedView, _storageService, _configurationService) {
    super();
    this._host = _host;
    this._model = _model;
    this._indicator = _indicator;
    this._collapsedView = _collapsedView;
    this._storageService = _storageService;
    this._configurationService = _configurationService;
    this._disposables = this._register(new MutableDisposable());
    this._setupDone = observableValue({ name: "setupDone" }, false);
    this._activeCompletionId = derived((reader) => {
      const model = this._model.read(reader);
      if (!model) {
        return void 0;
      }
      if (!this._setupDone.read(reader)) {
        return void 0;
      }
      const indicator = this._indicator.read(reader);
      if (!indicator || !indicator.isVisible.read(reader)) {
        return void 0;
      }
      return model.inlineEdit.inlineCompletion.identity.id;
    });
    this._register(this._initializeDebugSetting());
    this._disposables.value = this.setupNewUserExperience();
    this._setupDone.set(true, void 0);
  }
  setupNewUserExperience() {
    if (this.getNewUserType() === UserKind.Active) {
      return void 0;
    }
    const disposableStore = new DisposableStore();
    let userHasHoveredOverIcon = false;
    let inlineEditHasBeenAccepted = false;
    let firstTimeUserAnimationCount = 0;
    let secondTimeUserAnimationCount = 0;
    disposableStore.add(runOnChangeWithCancellationToken(this._activeCompletionId, async (id, _, __, token) => {
      if (id === void 0) {
        return;
      }
      let userType = this.getNewUserType();
      switch (userType) {
        case UserKind.FirstTime: {
          if (firstTimeUserAnimationCount++ >= 5 || userHasHoveredOverIcon) {
            userType = UserKind.SecondTime;
            this.setNewUserType(userType);
          }
          break;
        }
        case UserKind.SecondTime: {
          if (secondTimeUserAnimationCount++ >= 3 && inlineEditHasBeenAccepted) {
            userType = UserKind.Active;
            this.setNewUserType(userType);
          }
          break;
        }
      }
      switch (userType) {
        case UserKind.FirstTime: {
          for (let i = 0; i < 3 && !token.isCancellationRequested; i++) {
            await this._indicator.get()?.triggerAnimation();
            await timeout(500);
          }
          break;
        }
        case UserKind.SecondTime: {
          this._indicator.get()?.triggerAnimation();
          break;
        }
      }
    }));
    disposableStore.add(autorun((reader) => {
      if (this._collapsedView.isVisible.read(reader)) {
        if (this.getNewUserType() !== UserKind.Active) {
          this._collapsedView.triggerAnimation();
        }
      }
    }));
    disposableStore.add(autorunWithStore((reader, store) => {
      const indicator = this._indicator.read(reader);
      if (!indicator) {
        return;
      }
      store.add(runOnChange(indicator.isHoveredOverIcon, async (isHovered) => {
        if (isHovered) {
          userHasHoveredOverIcon = true;
        }
      }));
    }));
    disposableStore.add(autorunWithStore((reader, store) => {
      const host = this._host.read(reader);
      if (!host) {
        return;
      }
      store.add(host.onDidAccept(() => {
        inlineEditHasBeenAccepted = true;
      }));
    }));
    return disposableStore;
  }
  getNewUserType() {
    return this._storageService.get("inlineEditsGutterIndicatorUserKind", -1, UserKind.FirstTime);
  }
  setNewUserType(value) {
    switch (value) {
      case UserKind.FirstTime:
        throw new BugIndicatingError("UserKind should not be set to first time");
      case UserKind.SecondTime:
        break;
      case UserKind.Active:
        this._disposables.clear();
        break;
    }
    this._storageService.store(
      "inlineEditsGutterIndicatorUserKind",
      value,
      -1,
      0
      /* StorageTarget.USER */
    );
  }
  _initializeDebugSetting() {
    const hiddenDebugSetting = "editor.inlineSuggest.edits.resetNewUserExperience";
    if (this._configurationService.getValue(hiddenDebugSetting)) {
      this._storageService.remove(
        "inlineEditsGutterIndicatorUserKind",
        -1
        /* StorageScope.APPLICATION */
      );
    }
    const disposable = this._configurationService.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration(hiddenDebugSetting) && this._configurationService.getValue(hiddenDebugSetting)) {
        this._storageService.remove(
          "inlineEditsGutterIndicatorUserKind",
          -1
          /* StorageScope.APPLICATION */
        );
        this._disposables.value = this.setupNewUserExperience();
      }
    });
    return disposable;
  }
};
InlineEditsOnboardingExperience = __decorate([
  __param(4, IStorageService),
  __param(5, IConfigurationService)
], InlineEditsOnboardingExperience);
export {
  InlineEditsOnboardingExperience
};
//# sourceMappingURL=inlineEditsNewUsers.js.map
