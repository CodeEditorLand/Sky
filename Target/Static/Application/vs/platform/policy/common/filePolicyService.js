var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { ThrottledDelayer } from "../../../base/common/async.js";
import { Event } from "../../../base/common/event.js";
import { Iterable } from "../../../base/common/iterator.js";
import { isObject } from "../../../base/common/types.js";
import { IFileService } from "../../files/common/files.js";
import { ILogService } from "../../log/common/log.js";
import { AbstractPolicyService } from "./policy.js";
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
function keysDiff(a, b) {
  const result = [];
  for (const key of new Set(Iterable.concat(a.keys(), b.keys()))) {
    if (a.get(key) !== b.get(key)) {
      result.push(key);
    }
  }
  return result;
}
__name(keysDiff, "keysDiff");
let FilePolicyService = class FilePolicyService2 extends AbstractPolicyService {
  static {
    __name(this, "FilePolicyService");
  }
  constructor(file, fileService, logService) {
    super();
    this.file = file;
    this.fileService = fileService;
    this.logService = logService;
    this.throttledDelayer = this._register(new ThrottledDelayer(500));
    const onDidChangePolicyFile = Event.filter(fileService.onDidFilesChange, (e) => e.affects(file));
    this._register(fileService.watch(file));
    this._register(onDidChangePolicyFile(() => this.throttledDelayer.trigger(() => this.refresh())));
  }
  async _updatePolicyDefinitions() {
    await this.refresh();
  }
  async read() {
    const policies = /* @__PURE__ */ new Map();
    try {
      const content = await this.fileService.readFile(this.file);
      const raw = JSON.parse(content.value.toString());
      if (!isObject(raw)) {
        throw new Error("Policy file isn't a JSON object");
      }
      for (const key of Object.keys(raw)) {
        if (this.policyDefinitions[key]) {
          policies.set(key, raw[key]);
        }
      }
    } catch (error) {
      if (error.fileOperationResult !== 1) {
        this.logService.error(`[FilePolicyService] Failed to read policies`, error);
      }
    }
    return policies;
  }
  async refresh() {
    const policies = await this.read();
    const diff = keysDiff(this.policies, policies);
    this.policies = policies;
    if (diff.length > 0) {
      this._onDidChange.fire(diff);
    }
  }
};
FilePolicyService = __decorate([
  __param(1, IFileService),
  __param(2, ILogService)
], FilePolicyService);
export {
  FilePolicyService
};
//# sourceMappingURL=filePolicyService.js.map
