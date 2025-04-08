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
import { spawn } from "child_process";
import { relative } from "path";
import { FileAccess } from "../../../base/common/network.js";
import { StopWatch } from "../../../base/common/stopwatch.js";
import { IEnvironmentService } from "../../environment/common/environment.js";
import { createDecorator } from "../../instantiation/common/instantiation.js";
import { ILogService } from "../../log/common/log.js";
const ICSSDevelopmentService = createDecorator("ICSSDevelopmentService");
let CSSDevelopmentService = class {
  constructor(envService, logService) {
    this.envService = envService;
    this.logService = logService;
  }
  static {
    __name(this, "CSSDevelopmentService");
  }
  _cssModules;
  get isEnabled() {
    return !this.envService.isBuilt;
  }
  getCssModules() {
    this._cssModules ??= this.computeCssModules();
    return this._cssModules;
  }
  async computeCssModules() {
    if (!this.isEnabled) {
      return [];
    }
    const rg = await import("@vscode/ripgrep");
    return await new Promise((resolve) => {
      const sw = StopWatch.create();
      const chunks = [];
      const decoder = new TextDecoder();
      const basePath = FileAccess.asFileUri("").fsPath;
      const process = spawn(rg.rgPath, ["-g", "**/*.css", "--files", "--no-ignore", basePath], {});
      process.stdout.on("data", (data) => {
        const chunk = decoder.decode(data, { stream: true });
        chunks.push(chunk.split("\n").filter(Boolean));
      });
      process.on("error", (err) => {
        this.logService.error("[CSS_DEV] FAILED to compute CSS data", err);
        resolve([]);
      });
      process.on("close", () => {
        const result = chunks.flat().map((path) => relative(basePath, path).replace(/\\/g, "/")).filter(Boolean).sort();
        resolve(result);
        this.logService.info(`[CSS_DEV] DONE, ${result.length} css modules (${Math.round(sw.elapsed())}ms)`);
      });
    });
  }
};
CSSDevelopmentService = __decorateClass([
  __decorateParam(0, IEnvironmentService),
  __decorateParam(1, ILogService)
], CSSDevelopmentService);
export {
  CSSDevelopmentService,
  ICSSDevelopmentService
};
//# sourceMappingURL=cssDevService.js.map
