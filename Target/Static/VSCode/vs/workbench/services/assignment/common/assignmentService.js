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
import { createDecorator } from "../../../../platform/instantiation/common/instantiation.js";
import { MementoObject, Memento } from "../../../common/memento.js";
import { ITelemetryService } from "../../../../platform/telemetry/common/telemetry.js";
import { IStorageService, StorageScope, StorageTarget } from "../../../../platform/storage/common/storage.js";
import { ITelemetryData } from "../../../../base/common/actions.js";
import { InstantiationType, registerSingleton } from "../../../../platform/instantiation/common/extensions.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { IProductService } from "../../../../platform/product/common/productService.js";
import { IAssignmentService } from "../../../../platform/assignment/common/assignment.js";
import { Registry } from "../../../../platform/registry/common/platform.js";
import { BaseAssignmentService } from "../../../../platform/assignment/common/assignmentService.js";
import { workbenchConfigurationNodeBase } from "../../../common/configuration.js";
import { IConfigurationRegistry, Extensions as ConfigurationExtensions, ConfigurationScope } from "../../../../platform/configuration/common/configurationRegistry.js";
import { IEnvironmentService } from "../../../../platform/environment/common/environment.js";
const IWorkbenchAssignmentService = createDecorator("WorkbenchAssignmentService");
class MementoKeyValueStorage {
  constructor(memento) {
    this.memento = memento;
    this.mementoObj = memento.getMemento(StorageScope.APPLICATION, StorageTarget.MACHINE);
  }
  static {
    __name(this, "MementoKeyValueStorage");
  }
  mementoObj;
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
  constructor(telemetryService, productService) {
    this.telemetryService = telemetryService;
    this.productService = productService;
  }
  static {
    __name(this, "WorkbenchAssignmentServiceTelemetry");
  }
  _lastAssignmentContext;
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
let WorkbenchAssignmentService = class extends BaseAssignmentService {
  constructor(telemetryService, storageService, configurationService, productService, environmentService) {
    super(
      telemetryService.machineId,
      configurationService,
      productService,
      environmentService,
      new WorkbenchAssignmentServiceTelemetry(telemetryService, productService),
      new MementoKeyValueStorage(new Memento("experiment.service.memento", storageService))
    );
    this.telemetryService = telemetryService;
  }
  static {
    __name(this, "WorkbenchAssignmentService");
  }
  get experimentsEnabled() {
    return this.configurationService.getValue("workbench.enableExperiments") === true;
  }
  async getTreatment(name) {
    const result = await super.getTreatment(name);
    this.telemetryService.publicLog2(
      "tasClientReadTreatmentComplete",
      { treatmentName: name, treatmentValue: JSON.stringify(result) }
    );
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
WorkbenchAssignmentService = __decorateClass([
  __decorateParam(0, ITelemetryService),
  __decorateParam(1, IStorageService),
  __decorateParam(2, IConfigurationService),
  __decorateParam(3, IProductService),
  __decorateParam(4, IEnvironmentService)
], WorkbenchAssignmentService);
registerSingleton(IWorkbenchAssignmentService, WorkbenchAssignmentService, InstantiationType.Delayed);
const registry = Registry.as(ConfigurationExtensions.Configuration);
registry.registerConfiguration({
  ...workbenchConfigurationNodeBase,
  "properties": {
    "workbench.enableExperiments": {
      "type": "boolean",
      "description": localize("workbench.enableExperiments", "Fetches experiments to run from a Microsoft online service."),
      "default": true,
      "scope": ConfigurationScope.APPLICATION,
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
