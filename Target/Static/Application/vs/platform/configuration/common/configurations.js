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
import { coalesce } from "../../../base/common/arrays.js";
import { Emitter, Event } from "../../../base/common/event.js";
import { Disposable } from "../../../base/common/lifecycle.js";
import { deepClone, equals } from "../../../base/common/objects.js";
import { isEmptyObject, isString } from "../../../base/common/types.js";
import { ConfigurationModel } from "./configurationModels.js";
import { Extensions } from "./configurationRegistry.js";
import { ILogService, NullLogService } from "../../log/common/log.js";
import { IPolicyService } from "../../policy/common/policy.js";
import { Registry } from "../../registry/common/platform.js";
import { getErrorMessage } from "../../../base/common/errors.js";
import * as json from "../../../base/common/json.js";
class DefaultConfiguration extends Disposable {
  static {
    __name(this, "DefaultConfiguration");
  }
  get configurationModel() {
    return this._configurationModel;
  }
  constructor(logService) {
    super();
    this.logService = logService;
    this._onDidChangeConfiguration = this._register(new Emitter());
    this.onDidChangeConfiguration = this._onDidChangeConfiguration.event;
    this._configurationModel = ConfigurationModel.createEmptyModel(logService);
  }
  async initialize() {
    this.resetConfigurationModel();
    this._register(Registry.as(Extensions.Configuration).onDidUpdateConfiguration(({ properties, defaultsOverrides }) => this.onDidUpdateConfiguration(Array.from(properties), defaultsOverrides)));
    return this.configurationModel;
  }
  reload() {
    this.resetConfigurationModel();
    return this.configurationModel;
  }
  onDidUpdateConfiguration(properties, defaultsOverrides) {
    this.updateConfigurationModel(properties, Registry.as(Extensions.Configuration).getConfigurationProperties());
    this._onDidChangeConfiguration.fire({ defaults: this.configurationModel, properties });
  }
  getConfigurationDefaultOverrides() {
    return {};
  }
  resetConfigurationModel() {
    this._configurationModel = ConfigurationModel.createEmptyModel(this.logService);
    const properties = Registry.as(Extensions.Configuration).getConfigurationProperties();
    this.updateConfigurationModel(Object.keys(properties), properties);
  }
  updateConfigurationModel(properties, configurationProperties) {
    const configurationDefaultsOverrides = this.getConfigurationDefaultOverrides();
    for (const key of properties) {
      const defaultOverrideValue = configurationDefaultsOverrides[key];
      const propertySchema = configurationProperties[key];
      if (defaultOverrideValue !== void 0) {
        this._configurationModel.setValue(key, defaultOverrideValue);
      } else if (propertySchema) {
        this._configurationModel.setValue(key, deepClone(propertySchema.default));
      } else {
        this._configurationModel.removeValue(key);
      }
    }
  }
}
class NullPolicyConfiguration {
  static {
    __name(this, "NullPolicyConfiguration");
  }
  constructor() {
    this.onDidChangeConfiguration = Event.None;
    this.configurationModel = ConfigurationModel.createEmptyModel(new NullLogService());
  }
  async initialize() {
    return this.configurationModel;
  }
}
let PolicyConfiguration = class PolicyConfiguration2 extends Disposable {
  static {
    __name(this, "PolicyConfiguration");
  }
  get configurationModel() {
    return this._configurationModel;
  }
  constructor(defaultConfiguration, policyService, logService) {
    super();
    this.defaultConfiguration = defaultConfiguration;
    this.policyService = policyService;
    this.logService = logService;
    this._onDidChangeConfiguration = this._register(new Emitter());
    this.onDidChangeConfiguration = this._onDidChangeConfiguration.event;
    this._configurationModel = ConfigurationModel.createEmptyModel(this.logService);
    this.configurationRegistry = Registry.as(Extensions.Configuration);
  }
  async initialize() {
    this.logService.trace("PolicyConfiguration#initialize");
    this.update(await this.updatePolicyDefinitions(this.defaultConfiguration.configurationModel.keys), false);
    this.update(await this.updatePolicyDefinitions(Object.keys(this.configurationRegistry.getExcludedConfigurationProperties())), false);
    this._register(this.policyService.onDidChange((policyNames) => this.onDidChangePolicies(policyNames)));
    this._register(this.defaultConfiguration.onDidChangeConfiguration(async ({ properties }) => this.update(await this.updatePolicyDefinitions(properties), true)));
    return this._configurationModel;
  }
  async updatePolicyDefinitions(properties) {
    this.logService.trace("PolicyConfiguration#updatePolicyDefinitions", properties);
    const policyDefinitions = {};
    const keys = [];
    const configurationProperties = this.configurationRegistry.getConfigurationProperties();
    const excludedConfigurationProperties = this.configurationRegistry.getExcludedConfigurationProperties();
    for (const key of properties) {
      const config = configurationProperties[key] ?? excludedConfigurationProperties[key];
      if (!config) {
        keys.push(key);
        continue;
      }
      if (config.policy) {
        if (config.type !== "string" && config.type !== "number" && config.type !== "array" && config.type !== "object" && config.type !== "boolean") {
          this.logService.warn(`Policy ${config.policy.name} has unsupported type ${config.type}`);
          continue;
        }
        const { defaultValue, previewFeature } = config.policy;
        keys.push(key);
        policyDefinitions[config.policy.name] = {
          type: config.type === "number" ? "number" : config.type === "boolean" ? "boolean" : "string",
          previewFeature,
          defaultValue
        };
      }
    }
    if (!isEmptyObject(policyDefinitions)) {
      await this.policyService.updatePolicyDefinitions(policyDefinitions);
    }
    return keys;
  }
  onDidChangePolicies(policyNames) {
    this.logService.trace("PolicyConfiguration#onDidChangePolicies", policyNames);
    const policyConfigurations = this.configurationRegistry.getPolicyConfigurations();
    const keys = coalesce(policyNames.map((policyName) => policyConfigurations.get(policyName)));
    this.update(keys, true);
  }
  update(keys, trigger) {
    this.logService.trace("PolicyConfiguration#update", keys);
    const configurationProperties = this.configurationRegistry.getConfigurationProperties();
    const excludedConfigurationProperties = this.configurationRegistry.getExcludedConfigurationProperties();
    const changed = [];
    const wasEmpty = this._configurationModel.isEmpty();
    for (const key of keys) {
      const proprety = configurationProperties[key] ?? excludedConfigurationProperties[key];
      const policyName = proprety?.policy?.name;
      if (policyName) {
        let policyValue = this.policyService.getPolicyValue(policyName);
        if (isString(policyValue) && proprety.type !== "string") {
          try {
            policyValue = this.parse(policyValue);
          } catch (e) {
            this.logService.error(`Error parsing policy value ${policyName}:`, getErrorMessage(e));
            continue;
          }
        }
        if (wasEmpty ? policyValue !== void 0 : !equals(this._configurationModel.getValue(key), policyValue)) {
          changed.push([key, policyValue]);
        }
      } else {
        if (this._configurationModel.getValue(key) !== void 0) {
          changed.push([key, void 0]);
        }
      }
    }
    if (changed.length) {
      this.logService.trace("PolicyConfiguration#changed", changed);
      const old = this._configurationModel;
      this._configurationModel = ConfigurationModel.createEmptyModel(this.logService);
      for (const key of old.keys) {
        this._configurationModel.setValue(key, old.getValue(key));
      }
      for (const [key, policyValue] of changed) {
        if (policyValue === void 0) {
          this._configurationModel.removeValue(key);
        } else {
          this._configurationModel.setValue(key, policyValue);
        }
      }
      if (trigger) {
        this._onDidChangeConfiguration.fire(this._configurationModel);
      }
    }
  }
  parse(content) {
    let raw = {};
    let currentProperty = null;
    let currentParent = [];
    const previousParents = [];
    const parseErrors = [];
    function onValue(value) {
      if (Array.isArray(currentParent)) {
        currentParent.push(value);
      } else if (currentProperty !== null) {
        if (currentParent[currentProperty] !== void 0) {
          throw new Error(`Duplicate property found: ${currentProperty}`);
        }
        currentParent[currentProperty] = value;
      }
    }
    __name(onValue, "onValue");
    const visitor = {
      onObjectBegin: /* @__PURE__ */ __name(() => {
        const object = {};
        onValue(object);
        previousParents.push(currentParent);
        currentParent = object;
        currentProperty = null;
      }, "onObjectBegin"),
      onObjectProperty: /* @__PURE__ */ __name((name) => {
        currentProperty = name;
      }, "onObjectProperty"),
      onObjectEnd: /* @__PURE__ */ __name(() => {
        currentParent = previousParents.pop();
      }, "onObjectEnd"),
      onArrayBegin: /* @__PURE__ */ __name(() => {
        const array = [];
        onValue(array);
        previousParents.push(currentParent);
        currentParent = array;
        currentProperty = null;
      }, "onArrayBegin"),
      onArrayEnd: /* @__PURE__ */ __name(() => {
        currentParent = previousParents.pop();
      }, "onArrayEnd"),
      onLiteralValue: onValue,
      onError: /* @__PURE__ */ __name((error, offset, length) => {
        parseErrors.push({ error, offset, length });
      }, "onError")
    };
    if (content) {
      json.visit(content, visitor);
      raw = currentParent[0] || {};
    }
    if (parseErrors.length > 0) {
      throw new Error(parseErrors.map((e) => getErrorMessage(e.error)).join("\n"));
    }
    return raw;
  }
};
PolicyConfiguration = __decorate([
  __param(1, IPolicyService),
  __param(2, ILogService)
], PolicyConfiguration);
export {
  DefaultConfiguration,
  NullPolicyConfiguration,
  PolicyConfiguration
};
//# sourceMappingURL=configurations.js.map
