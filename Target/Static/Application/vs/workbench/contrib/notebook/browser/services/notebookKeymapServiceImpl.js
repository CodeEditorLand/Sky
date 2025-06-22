var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { onUnexpectedError } from "../../../../../base/common/errors.js";
import { Event } from "../../../../../base/common/event.js";
import { Disposable } from "../../../../../base/common/lifecycle.js";
import { localize } from "../../../../../nls.js";
import { IInstantiationService } from "../../../../../platform/instantiation/common/instantiation.js";
import { INotificationService, Severity } from "../../../../../platform/notification/common/notification.js";
import { getInstalledExtensions } from "../../../extensions/common/extensionsUtils.js";
import { IWorkbenchExtensionEnablementService } from "../../../../services/extensionManagement/common/extensionManagement.js";
import { ILifecycleService } from "../../../../services/lifecycle/common/lifecycle.js";
import { IExtensionManagementService } from "../../../../../platform/extensionManagement/common/extensionManagement.js";
import { areSameExtensions } from "../../../../../platform/extensionManagement/common/extensionManagementUtil.js";
import { IStorageService } from "../../../../../platform/storage/common/storage.js";
import { Memento } from "../../../../common/memento.js";
import { distinct } from "../../../../../base/common/arrays.js";
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
function onExtensionChanged(accessor) {
  const extensionService = accessor.get(IExtensionManagementService);
  const extensionEnablementService = accessor.get(IWorkbenchExtensionEnablementService);
  const onDidInstallExtensions = Event.chain(extensionService.onDidInstallExtensions, ($) => $.filter((e) => e.some(
    ({ operation }) => operation === 2
    /* InstallOperation.Install */
  )).map((e) => e.map(({ identifier }) => identifier)));
  return Event.debounce(Event.any(Event.any(onDidInstallExtensions, Event.map(extensionService.onDidUninstallExtension, (e) => [e.identifier])), Event.map(extensionEnablementService.onEnablementChanged, (extensions) => extensions.map((e) => e.identifier))), (result, identifiers) => {
    result = result || (identifiers.length ? [identifiers[0]] : []);
    for (const identifier of identifiers) {
      if (result.some((l) => !areSameExtensions(l, identifier))) {
        result.push(identifier);
      }
    }
    return result;
  });
}
__name(onExtensionChanged, "onExtensionChanged");
const hasRecommendedKeymapKey = "hasRecommendedKeymap";
let NotebookKeymapService = class NotebookKeymapService2 extends Disposable {
  static {
    __name(this, "NotebookKeymapService");
  }
  constructor(instantiationService, extensionEnablementService, notificationService, storageService, lifecycleService) {
    super();
    this.instantiationService = instantiationService;
    this.extensionEnablementService = extensionEnablementService;
    this.notificationService = notificationService;
    this.notebookKeymapMemento = new Memento("notebookKeymap", storageService);
    this.notebookKeymap = this.notebookKeymapMemento.getMemento(
      0,
      0
      /* StorageTarget.USER */
    );
    this._register(lifecycleService.onDidShutdown(() => this.dispose()));
    this._register(this.instantiationService.invokeFunction(onExtensionChanged)((identifiers) => {
      Promise.all(identifiers.map((identifier) => this.checkForOtherKeymaps(identifier))).then(void 0, onUnexpectedError);
    }));
  }
  checkForOtherKeymaps(extensionIdentifier) {
    return this.instantiationService.invokeFunction(getInstalledExtensions).then((extensions) => {
      const keymaps = extensions.filter((extension2) => isNotebookKeymapExtension(extension2));
      const extension = keymaps.find((extension2) => areSameExtensions(extension2.identifier, extensionIdentifier));
      if (extension && extension.globallyEnabled) {
        this.notebookKeymap[hasRecommendedKeymapKey] = true;
        this.notebookKeymapMemento.saveMemento();
        const otherKeymaps = keymaps.filter((extension2) => !areSameExtensions(extension2.identifier, extensionIdentifier) && extension2.globallyEnabled);
        if (otherKeymaps.length) {
          return this.promptForDisablingOtherKeymaps(extension, otherKeymaps);
        }
      }
      return void 0;
    });
  }
  promptForDisablingOtherKeymaps(newKeymap, oldKeymaps) {
    const onPrompt = /* @__PURE__ */ __name((confirmed) => {
      if (confirmed) {
        this.extensionEnablementService.setEnablement(
          oldKeymaps.map((keymap) => keymap.local),
          9
          /* EnablementState.DisabledGlobally */
        );
      }
    }, "onPrompt");
    this.notificationService.prompt(Severity.Info, localize("disableOtherKeymapsConfirmation", "Disable other keymaps ({0}) to avoid conflicts between keybindings?", distinct(oldKeymaps.map((k) => k.local.manifest.displayName)).map((name) => `'${name}'`).join(", ")), [{
      label: localize("yes", "Yes"),
      run: /* @__PURE__ */ __name(() => onPrompt(true), "run")
    }, {
      label: localize("no", "No"),
      run: /* @__PURE__ */ __name(() => onPrompt(false), "run")
    }]);
  }
};
NotebookKeymapService = __decorate([
  __param(0, IInstantiationService),
  __param(1, IWorkbenchExtensionEnablementService),
  __param(2, INotificationService),
  __param(3, IStorageService),
  __param(4, ILifecycleService)
], NotebookKeymapService);
function isNotebookKeymapExtension(extension) {
  if (extension.local.manifest.extensionPack) {
    return false;
  }
  const keywords = extension.local.manifest.keywords;
  if (!keywords) {
    return false;
  }
  return keywords.indexOf("notebook-keymap") !== -1;
}
__name(isNotebookKeymapExtension, "isNotebookKeymapExtension");
export {
  NotebookKeymapService,
  isNotebookKeymapExtension
};
//# sourceMappingURL=notebookKeymapServiceImpl.js.map
