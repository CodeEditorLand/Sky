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
import { localize } from "../../../../nls.js";
import { createDecorator } from "../../../../platform/instantiation/common/instantiation.js";
import { Memento } from "../../../common/memento.js";
import { ITelemetryService } from "../../../../platform/telemetry/common/telemetry.js";
import { IStorageService } from "../../../../platform/storage/common/storage.js";
import { registerSingleton } from "../../../../platform/instantiation/common/extensions.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { IProductService } from "../../../../platform/product/common/productService.js";
import { Registry } from "../../../../platform/registry/common/platform.js";
import { BaseAssignmentService } from "../../../../platform/assignment/common/assignmentService.js";
import { workbenchConfigurationNodeBase } from "../../../common/configuration.js";
import { Extensions as ConfigurationExtensions } from "../../../../platform/configuration/common/configurationRegistry.js";
import { IEnvironmentService } from "../../../../platform/environment/common/environment.js";
const IWorkbenchAssignmentService = createDecorator("WorkbenchAssignmentService");
class MementoKeyValueStorage {
  static {
    __name(this, "MementoKeyValueStorage");
  }
  constructor(memento) {
    this.memento = memento;
    this.mementoObj = memento.getMemento(
      -1,
      1
      /* StorageTarget.MACHINE */
    );
  }
  async getValue(key, defaultValue) {
    const value = await this.mementoObj[key];
    return value || defaultValue;
  }
  setValue(key, value) {
    this.mementoObj[key] = value;
    this.memento.saveMemento();
  }
}
class WorkbenchAssignmentServiceTelemetry {
  static {
    __name(this, "WorkbenchAssignmentServiceTelemetry");
  }
  constructor(telemetryService, productService) {
    this.telemetryService = telemetryService;
    this.productService = productService;
  }
  get assignmentContext() {
    return this._lastAssignmentContext?.split(";");
  }
  // __GDPR__COMMON__ "abexp.assignmentcontext" : { "classification": "SystemMetaData", "purpose": "FeatureInsight" }
  setSharedProperty(name, value) {
    if (name === this.productService.tasConfig?.assignmentContextTelemetryPropertyName) {
      this._lastAssignmentContext = value;
    }
    this.telemetryService.setExperimentProperty(name, value);
  }
  postEvent(eventName, props) {
    const data = {};
    for (const [key, value] of props.entries()) {
      data[key] = value;
    }
    this.telemetryService.publicLog(eventName, data);
  }
}
let WorkbenchAssignmentService = class WorkbenchAssignmentService2 extends BaseAssignmentService {
  static {
    __name(this, "WorkbenchAssignmentService");
  }
  constructor(telemetryService, storageService, configurationService, productService, environmentService) {
    super(telemetryService.machineId, configurationService, productService, environmentService, new WorkbenchAssignmentServiceTelemetry(telemetryService, productService), new MementoKeyValueStorage(new Memento("experiment.service.memento", storageService)));
    this.telemetryService = telemetryService;
  }
  get experimentsEnabled() {
    return this.configurationService.getValue("workbench.enableExperiments") === true;
  }
  async getTreatment(name) {
    const result = await super.getTreatment(name);
    this.telemetryService.publicLog2("tasClientReadTreatmentComplete", { treatmentName: name, treatmentValue: JSON.stringify(result) });
    return result;
  }
  async getCurrentExperiments() {
    if (!this.tasClient) {
      return void 0;
    }
    if (!this.experimentsEnabled) {
      return void 0;
    }
    await this.tasClient;
    return this.telemetry?.assignmentContext;
  }
};
WorkbenchAssignmentService = __decorate([
  __param(0, ITelemetryService),
  __param(1, IStorageService),
  __param(2, IConfigurationService),
  __param(3, IProductService),
  __param(4, IEnvironmentService)
], WorkbenchAssignmentService);
registerSingleton(
  IWorkbenchAssignmentService,
  WorkbenchAssignmentService,
  1
  /* InstantiationType.Delayed */
);
const registry = Registry.as(ConfigurationExtensions.Configuration);
registry.registerConfiguration({
  ...workbenchConfigurationNodeBase,
  "properties": {
    "workbench.enableExperiments": {
      "type": "boolean",
      "description": localize("workbench.enableExperiments", "Fetches experiments to run from a Microsoft online service."),
      "default": true,
      "scope": 1,
      "restricted": true,
      "tags": ["usesOnlineServices"]
    }
  }
});
export {
  IWorkbenchAssignmentService,
  WorkbenchAssignmentService
};
//# sourceMappingURL=assignmentService.js.map
