var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { isNonEmptyArray } from "../../../base/common/arrays.js";
import { Disposable, MutableDisposable } from "../../../base/common/lifecycle.js";
import { joinPath } from "../../../base/common/resources.js";
import { URI } from "../../../base/common/uri.js";
import { IFileService } from "../../files/common/files.js";
import { IProductService } from "../../product/common/productService.js";
import { disposableTimeout } from "../../../base/common/async.js";
import { Event } from "../../../base/common/event.js";
import { join } from "../../../base/common/path.js";
import { isWindows } from "../../../base/common/platform.js";
import { env } from "../../../base/common/process.js";
import { areSameExtensions } from "./extensionManagementUtil.js";
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
let ExtensionTipsService = class ExtensionTipsService2 extends Disposable {
  static {
    __name(this, "ExtensionTipsService");
  }
  constructor(fileService, productService) {
    super();
    this.fileService = fileService;
    this.productService = productService;
    this.allConfigBasedTips = /* @__PURE__ */ new Map();
    if (this.productService.configBasedExtensionTips) {
      Object.entries(this.productService.configBasedExtensionTips).forEach(([, value]) => this.allConfigBasedTips.set(value.configPath, value));
    }
  }
  getConfigBasedTips(folder) {
    return this.getValidConfigBasedTips(folder);
  }
  async getImportantExecutableBasedTips() {
    return [];
  }
  async getOtherExecutableBasedTips() {
    return [];
  }
  async getValidConfigBasedTips(folder) {
    const result = [];
    for (const [configPath, tip] of this.allConfigBasedTips) {
      if (tip.configScheme && tip.configScheme !== folder.scheme) {
        continue;
      }
      try {
        const content = (await this.fileService.readFile(joinPath(folder, configPath))).value.toString();
        for (const [key, value] of Object.entries(tip.recommendations)) {
          if (!value.contentPattern || new RegExp(value.contentPattern, "mig").test(content)) {
            result.push({
              extensionId: key,
              extensionName: value.name,
              configName: tip.configName,
              important: !!value.important,
              isExtensionPack: !!value.isExtensionPack,
              whenNotInstalled: value.whenNotInstalled
            });
          }
        }
      } catch (error) {
      }
    }
    return result;
  }
};
ExtensionTipsService = __decorate([
  __param(0, IFileService),
  __param(1, IProductService)
], ExtensionTipsService);
const promptedExecutableTipsStorageKey = "extensionTips/promptedExecutableTips";
const lastPromptedMediumImpExeTimeStorageKey = "extensionTips/lastPromptedMediumImpExeTime";
class AbstractNativeExtensionTipsService extends ExtensionTipsService {
  static {
    __name(this, "AbstractNativeExtensionTipsService");
  }
  constructor(userHome, windowEvents, telemetryService, extensionManagementService, storageService, extensionRecommendationNotificationService, fileService, productService) {
    super(fileService, productService);
    this.userHome = userHome;
    this.windowEvents = windowEvents;
    this.telemetryService = telemetryService;
    this.extensionManagementService = extensionManagementService;
    this.storageService = storageService;
    this.extensionRecommendationNotificationService = extensionRecommendationNotificationService;
    this.highImportanceExecutableTips = /* @__PURE__ */ new Map();
    this.mediumImportanceExecutableTips = /* @__PURE__ */ new Map();
    this.allOtherExecutableTips = /* @__PURE__ */ new Map();
    this.highImportanceTipsByExe = /* @__PURE__ */ new Map();
    this.mediumImportanceTipsByExe = /* @__PURE__ */ new Map();
    if (productService.exeBasedExtensionTips) {
      Object.entries(productService.exeBasedExtensionTips).forEach(([key, exeBasedExtensionTip]) => {
        const highImportanceRecommendations = [];
        const mediumImportanceRecommendations = [];
        const otherRecommendations = [];
        Object.entries(exeBasedExtensionTip.recommendations).forEach(([extensionId, value]) => {
          if (value.important) {
            if (exeBasedExtensionTip.important) {
              highImportanceRecommendations.push({ extensionId, extensionName: value.name, isExtensionPack: !!value.isExtensionPack });
            } else {
              mediumImportanceRecommendations.push({ extensionId, extensionName: value.name, isExtensionPack: !!value.isExtensionPack });
            }
          } else {
            otherRecommendations.push({ extensionId, extensionName: value.name, isExtensionPack: !!value.isExtensionPack });
          }
        });
        if (highImportanceRecommendations.length) {
          this.highImportanceExecutableTips.set(key, { exeFriendlyName: exeBasedExtensionTip.friendlyName, windowsPath: exeBasedExtensionTip.windowsPath, recommendations: highImportanceRecommendations });
        }
        if (mediumImportanceRecommendations.length) {
          this.mediumImportanceExecutableTips.set(key, { exeFriendlyName: exeBasedExtensionTip.friendlyName, windowsPath: exeBasedExtensionTip.windowsPath, recommendations: mediumImportanceRecommendations });
        }
        if (otherRecommendations.length) {
          this.allOtherExecutableTips.set(key, { exeFriendlyName: exeBasedExtensionTip.friendlyName, windowsPath: exeBasedExtensionTip.windowsPath, recommendations: otherRecommendations });
        }
      });
    }
    disposableTimeout(async () => {
      await this.collectTips();
      this.promptHighImportanceExeBasedTip();
      this.promptMediumImportanceExeBasedTip();
    }, 3e3, this._store);
  }
  async getImportantExecutableBasedTips() {
    const highImportanceExeTips = await this.getValidExecutableBasedExtensionTips(this.highImportanceExecutableTips);
    const mediumImportanceExeTips = await this.getValidExecutableBasedExtensionTips(this.mediumImportanceExecutableTips);
    return [...highImportanceExeTips, ...mediumImportanceExeTips];
  }
  getOtherExecutableBasedTips() {
    return this.getValidExecutableBasedExtensionTips(this.allOtherExecutableTips);
  }
  async collectTips() {
    const highImportanceExeTips = await this.getValidExecutableBasedExtensionTips(this.highImportanceExecutableTips);
    const mediumImportanceExeTips = await this.getValidExecutableBasedExtensionTips(this.mediumImportanceExecutableTips);
    const local = await this.extensionManagementService.getInstalled();
    this.highImportanceTipsByExe = this.groupImportantTipsByExe(highImportanceExeTips, local);
    this.mediumImportanceTipsByExe = this.groupImportantTipsByExe(mediumImportanceExeTips, local);
  }
  groupImportantTipsByExe(importantExeBasedTips, local) {
    const importantExeBasedRecommendations = /* @__PURE__ */ new Map();
    importantExeBasedTips.forEach((tip) => importantExeBasedRecommendations.set(tip.extensionId.toLowerCase(), tip));
    const { installed, uninstalled: recommendations } = this.groupByInstalled([...importantExeBasedRecommendations.keys()], local);
    for (const extensionId of installed) {
      const tip = importantExeBasedRecommendations.get(extensionId);
      if (tip) {
        this.telemetryService.publicLog2("exeExtensionRecommendations:alreadyInstalled", { extensionId, exeName: tip.exeName });
      }
    }
    for (const extensionId of recommendations) {
      const tip = importantExeBasedRecommendations.get(extensionId);
      if (tip) {
        this.telemetryService.publicLog2("exeExtensionRecommendations:notInstalled", { extensionId, exeName: tip.exeName });
      }
    }
    const promptedExecutableTips = this.getPromptedExecutableTips();
    const tipsByExe = /* @__PURE__ */ new Map();
    for (const extensionId of recommendations) {
      const tip = importantExeBasedRecommendations.get(extensionId);
      if (tip && (!promptedExecutableTips[tip.exeName] || !promptedExecutableTips[tip.exeName].includes(tip.extensionId))) {
        let tips = tipsByExe.get(tip.exeName);
        if (!tips) {
          tips = [];
          tipsByExe.set(tip.exeName, tips);
        }
        tips.push(tip);
      }
    }
    return tipsByExe;
  }
  /**
   * High importance tips are prompted once per restart session
   */
  promptHighImportanceExeBasedTip() {
    if (this.highImportanceTipsByExe.size === 0) {
      return;
    }
    const [exeName, tips] = [...this.highImportanceTipsByExe.entries()][0];
    this.promptExeRecommendations(tips).then((result) => {
      switch (result) {
        case "reacted":
          this.addToRecommendedExecutables(tips[0].exeName, tips);
          break;
        case "ignored":
          this.highImportanceTipsByExe.delete(exeName);
          break;
        case "incompatibleWindow": {
          const onActiveWindowChange = Event.once(Event.latch(Event.any(this.windowEvents.onDidOpenMainWindow, this.windowEvents.onDidFocusMainWindow)));
          this._register(onActiveWindowChange(() => this.promptHighImportanceExeBasedTip()));
          break;
        }
        case "toomany": {
          const disposable = this._register(new MutableDisposable());
          disposable.value = disposableTimeout(
            () => {
              disposable.dispose();
              this.promptHighImportanceExeBasedTip();
            },
            60 * 60 * 1e3
            /* 1 hour */
          );
          break;
        }
      }
    });
  }
  /**
   * Medium importance tips are prompted once per 7 days
   */
  promptMediumImportanceExeBasedTip() {
    if (this.mediumImportanceTipsByExe.size === 0) {
      return;
    }
    const lastPromptedMediumExeTime = this.getLastPromptedMediumExeTime();
    const timeSinceLastPrompt = Date.now() - lastPromptedMediumExeTime;
    const promptInterval = 7 * 24 * 60 * 60 * 1e3;
    if (timeSinceLastPrompt < promptInterval) {
      const disposable = this._register(new MutableDisposable());
      disposable.value = disposableTimeout(() => {
        disposable.dispose();
        this.promptMediumImportanceExeBasedTip();
      }, promptInterval - timeSinceLastPrompt);
      return;
    }
    const [exeName, tips] = [...this.mediumImportanceTipsByExe.entries()][0];
    this.promptExeRecommendations(tips).then((result) => {
      switch (result) {
        case "reacted": {
          this.updateLastPromptedMediumExeTime(Date.now());
          this.mediumImportanceTipsByExe.delete(exeName);
          this.addToRecommendedExecutables(tips[0].exeName, tips);
          const disposable1 = this._register(new MutableDisposable());
          disposable1.value = disposableTimeout(() => {
            disposable1.dispose();
            this.promptMediumImportanceExeBasedTip();
          }, promptInterval);
          break;
        }
        case "ignored":
          this.mediumImportanceTipsByExe.delete(exeName);
          this.promptMediumImportanceExeBasedTip();
          break;
        case "incompatibleWindow": {
          const onActiveWindowChange = Event.once(Event.latch(Event.any(this.windowEvents.onDidOpenMainWindow, this.windowEvents.onDidFocusMainWindow)));
          this._register(onActiveWindowChange(() => this.promptMediumImportanceExeBasedTip()));
          break;
        }
        case "toomany": {
          const disposable2 = this._register(new MutableDisposable());
          disposable2.value = disposableTimeout(
            () => {
              disposable2.dispose();
              this.promptMediumImportanceExeBasedTip();
            },
            60 * 60 * 1e3
            /* 1 hour */
          );
          break;
        }
      }
    });
  }
  async promptExeRecommendations(tips) {
    const installed = await this.extensionManagementService.getInstalled(
      1
      /* ExtensionType.User */
    );
    const extensions = tips.filter((tip) => !tip.whenNotInstalled || tip.whenNotInstalled.every((id) => installed.every((local) => !areSameExtensions(local.identifier, { id })))).map(({ extensionId }) => extensionId.toLowerCase());
    return this.extensionRecommendationNotificationService.promptImportantExtensionsInstallNotification({ extensions, source: 3, name: tips[0].exeFriendlyName, searchValue: `@exe:"${tips[0].exeName}"` });
  }
  getLastPromptedMediumExeTime() {
    let value = this.storageService.getNumber(
      lastPromptedMediumImpExeTimeStorageKey,
      -1
      /* StorageScope.APPLICATION */
    );
    if (!value) {
      value = Date.now();
      this.updateLastPromptedMediumExeTime(value);
    }
    return value;
  }
  updateLastPromptedMediumExeTime(value) {
    this.storageService.store(
      lastPromptedMediumImpExeTimeStorageKey,
      value,
      -1,
      1
      /* StorageTarget.MACHINE */
    );
  }
  getPromptedExecutableTips() {
    return JSON.parse(this.storageService.get(promptedExecutableTipsStorageKey, -1, "{}"));
  }
  addToRecommendedExecutables(exeName, tips) {
    const promptedExecutableTips = this.getPromptedExecutableTips();
    promptedExecutableTips[exeName] = tips.map(({ extensionId }) => extensionId.toLowerCase());
    this.storageService.store(
      promptedExecutableTipsStorageKey,
      JSON.stringify(promptedExecutableTips),
      -1,
      0
      /* StorageTarget.USER */
    );
  }
  groupByInstalled(recommendationsToSuggest, local) {
    const installed = [], uninstalled = [];
    const installedExtensionsIds = local.reduce((result, i) => {
      result.add(i.identifier.id.toLowerCase());
      return result;
    }, /* @__PURE__ */ new Set());
    recommendationsToSuggest.forEach((id) => {
      if (installedExtensionsIds.has(id.toLowerCase())) {
        installed.push(id);
      } else {
        uninstalled.push(id);
      }
    });
    return { installed, uninstalled };
  }
  async getValidExecutableBasedExtensionTips(executableTips) {
    const result = [];
    const checkedExecutables = /* @__PURE__ */ new Map();
    for (const exeName of executableTips.keys()) {
      const extensionTip = executableTips.get(exeName);
      if (!extensionTip || !isNonEmptyArray(extensionTip.recommendations)) {
        continue;
      }
      const exePaths = [];
      if (isWindows) {
        if (extensionTip.windowsPath) {
          exePaths.push(extensionTip.windowsPath.replace("%USERPROFILE%", () => env["USERPROFILE"]).replace("%ProgramFiles(x86)%", () => env["ProgramFiles(x86)"]).replace("%ProgramFiles%", () => env["ProgramFiles"]).replace("%APPDATA%", () => env["APPDATA"]).replace("%WINDIR%", () => env["WINDIR"]));
        }
      } else {
        exePaths.push(join("/usr/local/bin", exeName));
        exePaths.push(join("/usr/bin", exeName));
        exePaths.push(join(this.userHome.fsPath, exeName));
      }
      for (const exePath of exePaths) {
        let exists = checkedExecutables.get(exePath);
        if (exists === void 0) {
          exists = await this.fileService.exists(URI.file(exePath));
          checkedExecutables.set(exePath, exists);
        }
        if (exists) {
          for (const { extensionId, extensionName, isExtensionPack, whenNotInstalled } of extensionTip.recommendations) {
            result.push({
              extensionId,
              extensionName,
              isExtensionPack,
              exeName,
              exeFriendlyName: extensionTip.exeFriendlyName,
              windowsPath: extensionTip.windowsPath,
              whenNotInstalled
            });
          }
        }
      }
    }
    return result;
  }
}
export {
  AbstractNativeExtensionTipsService,
  ExtensionTipsService
};
//# sourceMappingURL=extensionTipsService.js.map
