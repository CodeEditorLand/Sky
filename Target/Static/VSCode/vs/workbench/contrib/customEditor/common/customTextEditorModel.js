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
import { Emitter, Event } from "../../../../base/common/event.js";
import { IMarkdownString } from "../../../../base/common/htmlContent.js";
import { Disposable, IReference } from "../../../../base/common/lifecycle.js";
import { basename } from "../../../../base/common/path.js";
import { isEqual } from "../../../../base/common/resources.js";
import { URI } from "../../../../base/common/uri.js";
import { IResolvedTextEditorModel, ITextModelService } from "../../../../editor/common/services/resolverService.js";
import { localize } from "../../../../nls.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { ILabelService } from "../../../../platform/label/common/label.js";
import { IRevertOptions, ISaveOptions } from "../../../common/editor.js";
import { ICustomEditorModel } from "./customEditor.js";
import { IExtensionService } from "../../../../workbench/services/extensions/common/extensions.js";
import { ITextFileEditorModel, ITextFileService, TextFileEditorModelState } from "../../../services/textfile/common/textfiles.js";
let CustomTextEditorModel = class extends Disposable {
  constructor(viewType, _resource, _model, textFileService, _labelService, extensionService) {
    super();
    this.viewType = viewType;
    this._resource = _resource;
    this._model = _model;
    this.textFileService = textFileService;
    this._labelService = _labelService;
    this._register(_model);
    this._textFileModel = this.textFileService.files.get(_resource);
    if (this._textFileModel) {
      this._register(this._textFileModel.onDidChangeOrphaned(() => this._onDidChangeOrphaned.fire()));
      this._register(this._textFileModel.onDidChangeReadonly(() => this._onDidChangeReadonly.fire()));
    }
    this._register(this.textFileService.files.onDidChangeDirty((e) => {
      if (isEqual(this.resource, e.resource)) {
        this._onDidChangeDirty.fire();
        this._onDidChangeContent.fire();
      }
    }));
    this._register(extensionService.onWillStop((e) => {
      e.veto(true, localize("vetoExtHostRestart", "An extension provided text editor for '{0}' is still open that would close otherwise.", this.name));
    }));
  }
  static {
    __name(this, "CustomTextEditorModel");
  }
  static async create(instantiationService, viewType, resource) {
    return instantiationService.invokeFunction(async (accessor) => {
      const textModelResolverService = accessor.get(ITextModelService);
      const model = await textModelResolverService.createModelReference(resource);
      return instantiationService.createInstance(CustomTextEditorModel, viewType, resource, model);
    });
  }
  _textFileModel;
  _onDidChangeOrphaned = this._register(new Emitter());
  onDidChangeOrphaned = this._onDidChangeOrphaned.event;
  _onDidChangeReadonly = this._register(new Emitter());
  onDidChangeReadonly = this._onDidChangeReadonly.event;
  get resource() {
    return this._resource;
  }
  get name() {
    return basename(this._labelService.getUriLabel(this._resource));
  }
  isReadonly() {
    return this._model.object.isReadonly();
  }
  get backupId() {
    return void 0;
  }
  get canHotExit() {
    return true;
  }
  isDirty() {
    return this.textFileService.isDirty(this.resource);
  }
  isOrphaned() {
    return !!this._textFileModel?.hasState(TextFileEditorModelState.ORPHAN);
  }
  _onDidChangeDirty = this._register(new Emitter());
  onDidChangeDirty = this._onDidChangeDirty.event;
  _onDidChangeContent = this._register(new Emitter());
  onDidChangeContent = this._onDidChangeContent.event;
  async revert(options) {
    return this.textFileService.revert(this.resource, options);
  }
  saveCustomEditor(options) {
    return this.textFileService.save(this.resource, options);
  }
  async saveCustomEditorAs(resource, targetResource, options) {
    return !!await this.textFileService.saveAs(resource, targetResource, options);
  }
};
CustomTextEditorModel = __decorateClass([
  __decorateParam(3, ITextFileService),
  __decorateParam(4, ILabelService),
  __decorateParam(5, IExtensionService)
], CustomTextEditorModel);
export {
  CustomTextEditorModel
};
//# sourceMappingURL=customTextEditorModel.js.map
