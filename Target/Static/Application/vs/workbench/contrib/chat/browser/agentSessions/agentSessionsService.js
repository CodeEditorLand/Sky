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
import { Disposable } from "../../../../../base/common/lifecycle.js";
import { createDecorator, IInstantiationService } from "../../../../../platform/instantiation/common/instantiation.js";
import { AgentSessionsModel } from "./agentSessionsModel.js";
let AgentSessionsService = class AgentSessionsService2 extends Disposable {
  static {
    __name(this, "AgentSessionsService");
  }
  get model() {
    if (!this._model) {
      this._model = this._register(this.instantiationService.createInstance(AgentSessionsModel));
      this._model.resolve(
        void 0
        /* all providers */
      );
    }
    return this._model;
  }
  constructor(instantiationService) {
    super();
    this.instantiationService = instantiationService;
  }
  getSession(resource) {
    return this.model.getSession(resource);
  }
};
AgentSessionsService = __decorate([
  __param(0, IInstantiationService)
], AgentSessionsService);
const IAgentSessionsService = createDecorator("agentSessions");
export {
  AgentSessionsService,
  IAgentSessionsService
};
//# sourceMappingURL=agentSessionsService.js.map
