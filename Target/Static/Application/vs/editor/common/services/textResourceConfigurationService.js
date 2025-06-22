var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Emitter } from "../../../base/common/event.js";
import { Disposable } from "../../../base/common/lifecycle.js";
import { Position } from "../core/position.js";
import { ILanguageService } from "../languages/language.js";
import { IModelService } from "./model.js";
import { IConfigurationService } from "../../../platform/configuration/common/configuration.js";
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
let TextResourceConfigurationService = class TextResourceConfigurationService2 extends Disposable {
  static {
    __name(this, "TextResourceConfigurationService");
  }
  constructor(configurationService, modelService, languageService) {
    super();
    this.configurationService = configurationService;
    this.modelService = modelService;
    this.languageService = languageService;
    this._onDidChangeConfiguration = this._register(new Emitter());
    this.onDidChangeConfiguration = this._onDidChangeConfiguration.event;
    this._register(this.configurationService.onDidChangeConfiguration((e) => this._onDidChangeConfiguration.fire(this.toResourceConfigurationChangeEvent(e))));
  }
  getValue(resource, arg2, arg3) {
    if (typeof arg3 === "string") {
      return this._getValue(resource, Position.isIPosition(arg2) ? arg2 : null, arg3);
    }
    return this._getValue(resource, null, typeof arg2 === "string" ? arg2 : void 0);
  }
  updateValue(resource, key, value, configurationTarget) {
    const language = resource ? this.getLanguage(resource, null) : null;
    const configurationValue = this.configurationService.inspect(key, { resource, overrideIdentifier: language });
    if (configurationTarget === void 0) {
      configurationTarget = this.deriveConfigurationTarget(configurationValue, language);
    }
    const overrideIdentifier = language && configurationValue.overrideIdentifiers?.includes(language) ? language : void 0;
    return this.configurationService.updateValue(key, value, { resource, overrideIdentifier }, configurationTarget);
  }
  deriveConfigurationTarget(configurationValue, language) {
    if (language) {
      if (configurationValue.memory?.override !== void 0) {
        return 8;
      }
      if (configurationValue.workspaceFolder?.override !== void 0) {
        return 6;
      }
      if (configurationValue.workspace?.override !== void 0) {
        return 5;
      }
      if (configurationValue.userRemote?.override !== void 0) {
        return 4;
      }
      if (configurationValue.userLocal?.override !== void 0) {
        return 3;
      }
    }
    if (configurationValue.memory?.value !== void 0) {
      return 8;
    }
    if (configurationValue.workspaceFolder?.value !== void 0) {
      return 6;
    }
    if (configurationValue.workspace?.value !== void 0) {
      return 5;
    }
    if (configurationValue.userRemote?.value !== void 0) {
      return 4;
    }
    return 3;
  }
  _getValue(resource, position, section) {
    const language = resource ? this.getLanguage(resource, position) : void 0;
    if (typeof section === "undefined") {
      return this.configurationService.getValue({ resource, overrideIdentifier: language });
    }
    return this.configurationService.getValue(section, { resource, overrideIdentifier: language });
  }
  inspect(resource, position, section) {
    const language = resource ? this.getLanguage(resource, position) : void 0;
    return this.configurationService.inspect(section, { resource, overrideIdentifier: language });
  }
  getLanguage(resource, position) {
    const model = this.modelService.getModel(resource);
    if (model) {
      return position ? model.getLanguageIdAtPosition(position.lineNumber, position.column) : model.getLanguageId();
    }
    return this.languageService.guessLanguageIdByFilepathOrFirstLine(resource);
  }
  toResourceConfigurationChangeEvent(configurationChangeEvent) {
    return {
      affectedKeys: configurationChangeEvent.affectedKeys,
      affectsConfiguration: /* @__PURE__ */ __name((resource, configuration) => {
        const overrideIdentifier = resource ? this.getLanguage(resource, null) : void 0;
        if (configurationChangeEvent.affectsConfiguration(configuration, { resource, overrideIdentifier })) {
          return true;
        }
        if (overrideIdentifier) {
          return configurationChangeEvent.affectedKeys.has(`[${overrideIdentifier}]`);
        }
        return false;
      }, "affectsConfiguration")
    };
  }
};
TextResourceConfigurationService = __decorate([
  __param(0, IConfigurationService),
  __param(1, IModelService),
  __param(2, ILanguageService)
], TextResourceConfigurationService);
export {
  TextResourceConfigurationService
};
//# sourceMappingURL=textResourceConfigurationService.js.map
