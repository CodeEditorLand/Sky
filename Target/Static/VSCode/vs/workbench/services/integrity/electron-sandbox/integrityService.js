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
import { localize } from "../../../../nls.js";
import Severity from "../../../../base/common/severity.js";
import { URI } from "../../../../base/common/uri.js";
import { ChecksumPair, IIntegrityService, IntegrityTestResult } from "../common/integrity.js";
import { ILifecycleService, LifecyclePhase } from "../../lifecycle/common/lifecycle.js";
import { IProductService } from "../../../../platform/product/common/productService.js";
import { INotificationService, NotificationPriority } from "../../../../platform/notification/common/notification.js";
import { IStorageService, StorageScope, StorageTarget } from "../../../../platform/storage/common/storage.js";
import { InstantiationType, registerSingleton } from "../../../../platform/instantiation/common/extensions.js";
import { IOpenerService } from "../../../../platform/opener/common/opener.js";
import { FileAccess, AppResourcePath } from "../../../../base/common/network.js";
import { IChecksumService } from "../../../../platform/checksum/common/checksumService.js";
import { ILogService } from "../../../../platform/log/common/log.js";
class IntegrityStorage {
  constructor(storageService) {
    this.storageService = storageService;
    this.value = this._read();
  }
  static {
    __name(this, "IntegrityStorage");
  }
  static KEY = "integrityService";
  value;
  _read() {
    const jsonValue = this.storageService.get(IntegrityStorage.KEY, StorageScope.APPLICATION);
    if (!jsonValue) {
      return null;
    }
    try {
      return JSON.parse(jsonValue);
    } catch (err) {
      return null;
    }
  }
  get() {
    return this.value;
  }
  set(data) {
    this.value = data;
    this.storageService.store(IntegrityStorage.KEY, JSON.stringify(this.value), StorageScope.APPLICATION, StorageTarget.MACHINE);
  }
}
let IntegrityService = class {
  constructor(notificationService, storageService, lifecycleService, openerService, productService, checksumService, logService) {
    this.notificationService = notificationService;
    this.lifecycleService = lifecycleService;
    this.openerService = openerService;
    this.productService = productService;
    this.checksumService = checksumService;
    this.logService = logService;
    this.storage = new IntegrityStorage(storageService);
    this.isPurePromise = this._isPure();
    this._compute();
  }
  static {
    __name(this, "IntegrityService");
  }
  storage;
  isPurePromise;
  isPure() {
    return this.isPurePromise;
  }
  async _compute() {
    const { isPure } = await this.isPure();
    if (isPure) {
      return;
    }
    this.logService.warn(`

----------------------------------------------
***	Installation has been modified on disk ***
----------------------------------------------

`);
    const storedData = this.storage.get();
    if (storedData?.dontShowPrompt && storedData.commit === this.productService.commit) {
      return;
    }
    this._showNotification();
  }
  async _isPure() {
    const expectedChecksums = this.productService.checksums || {};
    await this.lifecycleService.when(LifecyclePhase.Eventually);
    const allResults = await Promise.all(Object.keys(expectedChecksums).map((filename) => this._resolve(filename, expectedChecksums[filename])));
    let isPure = true;
    for (let i = 0, len = allResults.length; i < len; i++) {
      if (!allResults[i].isPure) {
        isPure = false;
        break;
      }
    }
    return {
      isPure,
      proof: allResults
    };
  }
  async _resolve(filename, expected) {
    const fileUri = FileAccess.asFileUri(filename);
    try {
      const checksum = await this.checksumService.checksum(fileUri);
      return IntegrityService._createChecksumPair(fileUri, checksum, expected);
    } catch (error) {
      return IntegrityService._createChecksumPair(fileUri, "", expected);
    }
  }
  static _createChecksumPair(uri, actual, expected) {
    return {
      uri,
      actual,
      expected,
      isPure: actual === expected
    };
  }
  _showNotification() {
    const checksumFailMoreInfoUrl = this.productService.checksumFailMoreInfoUrl;
    const message = localize("integrity.prompt", "Your {0} installation appears to be corrupt. Please reinstall.", this.productService.nameShort);
    if (checksumFailMoreInfoUrl) {
      this.notificationService.prompt(
        Severity.Warning,
        message,
        [
          {
            label: localize("integrity.moreInformation", "More Information"),
            run: /* @__PURE__ */ __name(() => this.openerService.open(URI.parse(checksumFailMoreInfoUrl)), "run")
          },
          {
            label: localize("integrity.dontShowAgain", "Don't Show Again"),
            isSecondary: true,
            run: /* @__PURE__ */ __name(() => this.storage.set({ dontShowPrompt: true, commit: this.productService.commit }), "run")
          }
        ],
        {
          sticky: true,
          priority: NotificationPriority.URGENT
        }
      );
    } else {
      this.notificationService.notify({
        severity: Severity.Warning,
        message,
        sticky: true,
        priority: NotificationPriority.URGENT
      });
    }
  }
};
IntegrityService = __decorateClass([
  __decorateParam(0, INotificationService),
  __decorateParam(1, IStorageService),
  __decorateParam(2, ILifecycleService),
  __decorateParam(3, IOpenerService),
  __decorateParam(4, IProductService),
  __decorateParam(5, IChecksumService),
  __decorateParam(6, ILogService)
], IntegrityService);
registerSingleton(IIntegrityService, IntegrityService, InstantiationType.Delayed);
export {
  IntegrityService
};
//# sourceMappingURL=integrityService.js.map
