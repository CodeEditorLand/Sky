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
import { basename, dirname, join } from "../../../../base/common/path.js";
import { Promises } from "../../../../base/node/pfs.js";
import { ILogService } from "../../../../platform/log/common/log.js";
import { IProductService } from "../../../../platform/product/common/productService.js";
let CodeCacheCleaner = class CodeCacheCleaner2 extends Disposable {
  static {
    __name(this, "CodeCacheCleaner");
  }
  constructor(currentCodeCachePath, productService, logService) {
    super();
    this.logService = logService;
    this.dataMaxAge = productService.quality !== "stable" ? 1e3 * 60 * 60 * 24 * 7 : 1e3 * 60 * 60 * 24 * 30 * 3;
    if (currentCodeCachePath) {
      const scheduler = this._register(new RunOnceScheduler(
        () => {
          this.cleanUpCodeCaches(currentCodeCachePath);
        },
        30 * 1e3
        /* after 30s */
      ));
      scheduler.schedule();
    }
  }
  async cleanUpCodeCaches(currentCodeCachePath) {
    this.logService.trace("[code cache cleanup]: Starting to clean up old code cache folders.");
    try {
      const now = Date.now();
      const codeCacheRootPath = dirname(currentCodeCachePath);
      const currentCodeCache = basename(currentCodeCachePath);
      const codeCaches = await Promises.readdir(codeCacheRootPath);
      await Promise.all(codeCaches.map(async (codeCache) => {
        if (codeCache === currentCodeCache) {
          return;
        }
        const codeCacheEntryPath = join(codeCacheRootPath, codeCache);
        const codeCacheEntryStat = await promises.stat(codeCacheEntryPath);
        if (codeCacheEntryStat.isDirectory() && now - codeCacheEntryStat.mtime.getTime() > this.dataMaxAge) {
          this.logService.trace(`[code cache cleanup]: Removing code cache folder ${codeCache}.`);
          return Promises.rm(codeCacheEntryPath);
        }
      }));
    } catch (error) {
      onUnexpectedError(error);
    }
  }
};
CodeCacheCleaner = __decorate([
  __param(1, IProductService),
  __param(2, ILogService)
], CodeCacheCleaner);
export {
  CodeCacheCleaner
};
//# sourceMappingURL=codeCacheCleaner.js.map
