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
import { assert } from "../../../../../../../../base/common/assert.js";
import { assertDefined } from "../../../../../../../../base/common/types.js";
import { Disposable } from "../../../../../../../../base/common/lifecycle.js";
import { ObjectCache } from "../../../../../../../../base/common/objectCache.js";
import { INSTRUCTIONS_LANGUAGE_ID, PROMPT_LANGUAGE_ID } from "../../../constants.js";
import { IModelService } from "../../../../../../../../editor/common/services/model.js";
import { PromptsConfig } from "../../../../../../../../platform/prompts/common/config.js";
import { IEditorService } from "../../../../../../../services/editor/common/editorService.js";
import { IInstantiationService } from "../../../../../../../../platform/instantiation/common/instantiation.js";
import { IConfigurationService } from "../../../../../../../../platform/configuration/common/configuration.js";
let ProviderInstanceManagerBase = class ProviderInstanceManagerBase2 extends Disposable {
  static {
    __name(this, "ProviderInstanceManagerBase");
  }
  constructor(modelService, editorService, initService, configService) {
    super();
    this.instances = this._register(new ObjectCache((model) => {
      assert(model.isDisposed() === false, "Text model must not be disposed.");
      assertDefined(this.InstanceClass, "Instance class field must be defined.");
      const instance = initService.createInstance(this.InstanceClass, model);
      instance.assertNotDisposed("Created instance must not be disposed.");
      return instance;
    }));
    if (PromptsConfig.enabled(configService) === false) {
      return;
    }
    this._register(editorService.onDidActiveEditorChange(() => {
      const { activeTextEditorControl } = editorService;
      if (activeTextEditorControl === void 0) {
        return;
      }
      this.handleNewEditor(activeTextEditorControl);
    }));
    editorService.visibleTextEditorControls.forEach(this.handleNewEditor.bind(this));
    this._register(modelService.onModelLanguageChanged((event) => {
      const { model, oldLanguageId } = event;
      if (isPromptFileModel(model)) {
        this.instances.get(model);
        return;
      }
      if (isPromptOrInstructionsFile(oldLanguageId)) {
        this.instances.remove(model, true);
        return;
      }
    }));
  }
  /**
   * Initialize a new {@link TInstance} for the given editor.
   */
  handleNewEditor(editor) {
    const model = editor.getModel();
    if (model === null) {
      return this;
    }
    if (isPromptFileModel(model) === false) {
      return this;
    }
    this.instances.get(model);
    return this;
  }
};
ProviderInstanceManagerBase = __decorate([
  __param(0, IModelService),
  __param(1, IEditorService),
  __param(2, IInstantiationService),
  __param(3, IConfigurationService)
], ProviderInstanceManagerBase);
const isPromptOrInstructionsFile = /* @__PURE__ */ __name((languageId) => {
  return languageId === PROMPT_LANGUAGE_ID || languageId === INSTRUCTIONS_LANGUAGE_ID;
}, "isPromptOrInstructionsFile");
const isPromptFileModel = /* @__PURE__ */ __name((model) => {
  if ("modified" in model || "model" in model) {
    return false;
  }
  if (model.isDisposed()) {
    return false;
  }
  if (isPromptOrInstructionsFile(model.getLanguageId()) === false) {
    return false;
  }
  return true;
}, "isPromptFileModel");
export {
  ProviderInstanceManagerBase
};
//# sourceMappingURL=providerInstanceManagerBase.js.map
