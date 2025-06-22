var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { DEFAULT_EDITOR_ASSOCIATION, isResourceEditorInput } from "../editor.js";
import { AbstractResourceEditorInput } from "./resourceEditorInput.js";
import { ITextFileService } from "../../services/textfile/common/textfiles.js";
import { IEditorService } from "../../services/editor/common/editorService.js";
import { IFileService } from "../../../platform/files/common/files.js";
import { ILabelService } from "../../../platform/label/common/label.js";
import { Schemas } from "../../../base/common/network.js";
import { isEqual } from "../../../base/common/resources.js";
import { ITextModelService } from "../../../editor/common/services/resolverService.js";
import { TextResourceEditorModel } from "./textResourceEditorModel.js";
import { createTextBufferFactory } from "../../../editor/common/model/textModel.js";
import { IFilesConfigurationService } from "../../services/filesConfiguration/common/filesConfigurationService.js";
import { ITextResourceConfigurationService } from "../../../editor/common/services/textResourceConfiguration.js";
import { ICustomEditorLabelService } from "../../services/editor/common/customEditorLabelService.js";
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
var TextResourceEditorInput_1;
let AbstractTextResourceEditorInput = class AbstractTextResourceEditorInput2 extends AbstractResourceEditorInput {
  static {
    __name(this, "AbstractTextResourceEditorInput");
  }
  constructor(resource, preferredResource, editorService, textFileService, labelService, fileService, filesConfigurationService, textResourceConfigurationService, customEditorLabelService) {
    super(resource, preferredResource, labelService, fileService, filesConfigurationService, textResourceConfigurationService, customEditorLabelService);
    this.editorService = editorService;
    this.textFileService = textFileService;
  }
  save(group, options) {
    if (this.resource.scheme !== Schemas.untitled && !this.fileService.hasProvider(this.resource)) {
      return this.saveAs(group, options);
    }
    return this.doSave(options, false, group);
  }
  saveAs(group, options) {
    return this.doSave(options, true, group);
  }
  async doSave(options, saveAs, group) {
    let target;
    if (saveAs) {
      target = await this.textFileService.saveAs(this.resource, void 0, { ...options, suggestedTarget: this.preferredResource });
    } else {
      target = await this.textFileService.save(this.resource, options);
    }
    if (!target) {
      return void 0;
    }
    return { resource: target };
  }
  async revert(group, options) {
    await this.textFileService.revert(this.resource, options);
  }
};
AbstractTextResourceEditorInput = __decorate([
  __param(2, IEditorService),
  __param(3, ITextFileService),
  __param(4, ILabelService),
  __param(5, IFileService),
  __param(6, IFilesConfigurationService),
  __param(7, ITextResourceConfigurationService),
  __param(8, ICustomEditorLabelService)
], AbstractTextResourceEditorInput);
let TextResourceEditorInput = class TextResourceEditorInput2 extends AbstractTextResourceEditorInput {
  static {
    __name(this, "TextResourceEditorInput");
  }
  static {
    TextResourceEditorInput_1 = this;
  }
  static {
    this.ID = "workbench.editors.resourceEditorInput";
  }
  get typeId() {
    return TextResourceEditorInput_1.ID;
  }
  get editorId() {
    return DEFAULT_EDITOR_ASSOCIATION.id;
  }
  constructor(resource, name, description, preferredLanguageId, preferredContents, textModelService, textFileService, editorService, fileService, labelService, filesConfigurationService, textResourceConfigurationService, customEditorLabelService) {
    super(resource, void 0, editorService, textFileService, labelService, fileService, filesConfigurationService, textResourceConfigurationService, customEditorLabelService);
    this.name = name;
    this.description = description;
    this.preferredLanguageId = preferredLanguageId;
    this.preferredContents = preferredContents;
    this.textModelService = textModelService;
    this.cachedModel = void 0;
    this.modelReference = void 0;
  }
  getName() {
    return this.name || super.getName();
  }
  setName(name) {
    if (this.name !== name) {
      this.name = name;
      this._onDidChangeLabel.fire();
    }
  }
  getDescription() {
    return this.description;
  }
  setDescription(description) {
    if (this.description !== description) {
      this.description = description;
      this._onDidChangeLabel.fire();
    }
  }
  setLanguageId(languageId, source) {
    this.setPreferredLanguageId(languageId);
    this.cachedModel?.setLanguageId(languageId, source);
  }
  setPreferredLanguageId(languageId) {
    this.preferredLanguageId = languageId;
  }
  setPreferredContents(contents) {
    this.preferredContents = contents;
  }
  async resolve() {
    const preferredContents = this.preferredContents;
    const preferredLanguageId = this.preferredLanguageId;
    this.preferredContents = void 0;
    this.preferredLanguageId = void 0;
    if (!this.modelReference) {
      this.modelReference = this.textModelService.createModelReference(this.resource);
    }
    const ref = await this.modelReference;
    const model = ref.object;
    if (!(model instanceof TextResourceEditorModel)) {
      ref.dispose();
      this.modelReference = void 0;
      throw new Error(`Unexpected model for TextResourceEditorInput: ${this.resource}`);
    }
    this.cachedModel = model;
    if (typeof preferredContents === "string" || typeof preferredLanguageId === "string") {
      model.updateTextEditorModel(typeof preferredContents === "string" ? createTextBufferFactory(preferredContents) : void 0, preferredLanguageId);
    }
    return model;
  }
  matches(otherInput) {
    if (this === otherInput) {
      return true;
    }
    if (otherInput instanceof TextResourceEditorInput_1) {
      return isEqual(otherInput.resource, this.resource);
    }
    if (isResourceEditorInput(otherInput)) {
      return super.matches(otherInput);
    }
    return false;
  }
  dispose() {
    if (this.modelReference) {
      this.modelReference.then((ref) => ref.dispose());
      this.modelReference = void 0;
    }
    this.cachedModel = void 0;
    super.dispose();
  }
};
TextResourceEditorInput = TextResourceEditorInput_1 = __decorate([
  __param(5, ITextModelService),
  __param(6, ITextFileService),
  __param(7, IEditorService),
  __param(8, IFileService),
  __param(9, ILabelService),
  __param(10, IFilesConfigurationService),
  __param(11, ITextResourceConfigurationService),
  __param(12, ICustomEditorLabelService)
], TextResourceEditorInput);
export {
  AbstractTextResourceEditorInput,
  TextResourceEditorInput
};
//# sourceMappingURL=textResourceEditorInput.js.map
