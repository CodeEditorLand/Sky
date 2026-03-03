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
import { promises } from "fs";
import { RunOnceScheduler } from "../../../../base/common/async.js";
import { onUnexpectedError } from "../../../../base/common/errors.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
import { join } from "../../../../base/common/path.js";
import { Promises } from "../../../../base/node/pfs.js";
import { INativeEnvironmentService } from "../../../../platform/environment/common/environment.js";
import { ILogService } from "../../../../platform/log/common/log.js";
import { IProductService } from "../../../../platform/product/common/productService.js";
let LanguagePackCachedDataCleaner = class LanguagePackCachedDataCleaner2 extends Disposable {
  static {
    __name(this, "LanguagePackCachedDataCleaner");
  }
  constructor(environmentService, logService, productService) {
    super();
    this.environmentService = environmentService;
    this.logService = logService;
    this.dataMaxAge = productService.quality !== "stable" ? 1e3 * 60 * 60 * 24 * 7 : 1e3 * 60 * 60 * 24 * 30 * 3;
    if (this.environmentService.isBuilt) {
      const scheduler = this._register(new RunOnceScheduler(
        () => {
          this.cleanUpLanguagePackCache();
        },
        40 * 1e3
        /* after 40s */
      ));
      scheduler.schedule();
    }
  }
  async cleanUpLanguagePackCache() {
    this.logService.trace("[language pack cache cleanup]: Starting to clean up unused language packs.");
    try {
      const installed = /* @__PURE__ */ Object.create(null);
      const metaData = JSON.parse(await promises.readFile(join(this.environmentService.userDataPath, "languagepacks.json"), "utf8"));
      for (const locale of Object.keys(metaData)) {
        const entry = metaData[locale];
        installed[`${entry.hash}.${locale}`] = true;
      }
      const cacheDir = join(this.environmentService.userDataPath, "clp");
      const cacheDirExists = await Promises.exists(cacheDir);
      if (!cacheDirExists) {
        return;
      }
      const entries = await Promises.readdir(cacheDir);
      for (const entry of entries) {
        if (installed[entry]) {
          this.logService.trace(`[language pack cache cleanup]: Skipping folder ${entry}. Language pack still in use.`);
          continue;
        }
        this.logService.trace(`[language pack cache cleanup]: Removing unused language pack: ${entry}`);
        await Promises.rm(join(cacheDir, entry));
      }
      const now = Date.now();
      for (const packEntry of Object.keys(installed)) {
        const folder = join(cacheDir, packEntry);
        const entries2 = await Promises.readdir(folder);
        for (const entry of entries2) {
          if (entry === "tcf.json") {
            continue;
          }
          const candidate = join(folder, entry);
          const stat = await promises.stat(candidate);
          if (stat.isDirectory() && now - stat.mtime.getTime() > this.dataMaxAge) {
            this.logService.trace(`[language pack cache cleanup]: Removing language pack cache folder: ${join(packEntry, entry)}`);
            await Promises.rm(candidate);
          }
        }
      }
    } catch (error) {
      onUnexpectedError(error);
    }
  }
};
LanguagePackCachedDataCleaner = __decorate([
  __param(0, INativeEnvironmentService),
  __param(1, ILogService),
  __param(2, IProductService)
], LanguagePackCachedDataCleaner);
export {
  LanguagePackCachedDataCleaner
};
//# sourceMappingURL=languagePackCachedDataCleaner.js.map
