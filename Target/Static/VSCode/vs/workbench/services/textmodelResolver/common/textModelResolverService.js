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
import { URI } from "../../../../base/common/uri.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { ITextModel } from "../../../../editor/common/model.js";
import { IDisposable, toDisposable, IReference, ReferenceCollection, Disposable, AsyncReferenceCollection } from "../../../../base/common/lifecycle.js";
import { IModelService } from "../../../../editor/common/services/model.js";
import { TextResourceEditorModel } from "../../../common/editor/textResourceEditorModel.js";
import { ITextFileService, TextFileResolveReason } from "../../textfile/common/textfiles.js";
import { Schemas } from "../../../../base/common/network.js";
import { ITextModelService, ITextModelContentProvider, ITextEditorModel, IResolvedTextEditorModel, isResolvedTextEditorModel } from "../../../../editor/common/services/resolverService.js";
import { TextFileEditorModel } from "../../textfile/common/textFileEditorModel.js";
import { IFileService } from "../../../../platform/files/common/files.js";
import { InstantiationType, registerSingleton } from "../../../../platform/instantiation/common/extensions.js";
import { IUndoRedoService } from "../../../../platform/undoRedo/common/undoRedo.js";
import { ModelUndoRedoParticipant } from "../../../../editor/common/services/modelUndoRedoParticipant.js";
import { IUriIdentityService } from "../../../../platform/uriIdentity/common/uriIdentity.js";
import { UntitledTextEditorModel } from "../../untitled/common/untitledTextEditorModel.js";
let ResourceModelCollection = class extends ReferenceCollection {
  constructor(instantiationService, textFileService, fileService, modelService) {
    super();
    this.instantiationService = instantiationService;
    this.textFileService = textFileService;
    this.fileService = fileService;
    this.modelService = modelService;
  }
  static {
    __name(this, "ResourceModelCollection");
  }
  providers = /* @__PURE__ */ new Map();
  modelsToDispose = /* @__PURE__ */ new Set();
  createReferencedObject(key) {
    return this.doCreateReferencedObject(key);
  }
  async doCreateReferencedObject(key, skipActivateProvider) {
    this.modelsToDispose.delete(key);
    const resource = URI.parse(key);
    if (resource.scheme === Schemas.inMemory) {
      const cachedModel = this.modelService.getModel(resource);
      if (!cachedModel) {
        throw new Error(`Unable to resolve inMemory resource ${key}`);
      }
      const model = this.instantiationService.createInstance(TextResourceEditorModel, resource);
      if (this.ensureResolvedModel(model, key)) {
        return model;
      }
    }
    if (resource.scheme === Schemas.untitled) {
      const model = await this.textFileService.untitled.resolve({ untitledResource: resource });
      if (this.ensureResolvedModel(model, key)) {
        return model;
      }
    }
    if (this.fileService.hasProvider(resource)) {
      const model = await this.textFileService.files.resolve(resource, { reason: TextFileResolveReason.REFERENCE });
      if (this.ensureResolvedModel(model, key)) {
        return model;
      }
    }
    if (this.providers.has(resource.scheme)) {
      await this.resolveTextModelContent(key);
      const model = this.instantiationService.createInstance(TextResourceEditorModel, resource);
      if (this.ensureResolvedModel(model, key)) {
        return model;
      }
    }
    if (!skipActivateProvider) {
      await this.fileService.activateProvider(resource.scheme);
      return this.doCreateReferencedObject(key, true);
    }
    throw new Error(`Unable to resolve resource ${key}`);
  }
  ensureResolvedModel(model, key) {
    if (isResolvedTextEditorModel(model)) {
      return true;
    }
    throw new Error(`Unable to resolve resource ${key}`);
  }
  destroyReferencedObject(key, modelPromise) {
    const resource = URI.parse(key);
    if (resource.scheme === Schemas.inMemory) {
      return;
    }
    this.modelsToDispose.add(key);
    (async () => {
      try {
        const model = await modelPromise;
        if (!this.modelsToDispose.has(key)) {
          return;
        }
        if (model instanceof TextFileEditorModel) {
          await this.textFileService.files.canDispose(model);
        } else if (model instanceof UntitledTextEditorModel) {
          await this.textFileService.untitled.canDispose(model);
        }
        if (!this.modelsToDispose.has(key)) {
          return;
        }
        model.dispose();
      } catch (error) {
      } finally {
        this.modelsToDispose.delete(key);
      }
    })();
  }
  registerTextModelContentProvider(scheme, provider) {
    let providers = this.providers.get(scheme);
    if (!providers) {
      providers = [];
      this.providers.set(scheme, providers);
    }
    providers.unshift(provider);
    return toDisposable(() => {
      const providersForScheme = this.providers.get(scheme);
      if (!providersForScheme) {
        return;
      }
      const index = providersForScheme.indexOf(provider);
      if (index === -1) {
        return;
      }
      providersForScheme.splice(index, 1);
      if (providersForScheme.length === 0) {
        this.providers.delete(scheme);
      }
    });
  }
  hasTextModelContentProvider(scheme) {
    return this.providers.get(scheme) !== void 0;
  }
  async resolveTextModelContent(key) {
    const resource = URI.parse(key);
    const providersForScheme = this.providers.get(resource.scheme) || [];
    for (const provider of providersForScheme) {
      const value = await provider.provideTextContent(resource);
      if (value) {
        return value;
      }
    }
    throw new Error(`Unable to resolve text model content for resource ${key}`);
  }
};
ResourceModelCollection = __decorateClass([
  __decorateParam(0, IInstantiationService),
  __decorateParam(1, ITextFileService),
  __decorateParam(2, IFileService),
  __decorateParam(3, IModelService)
], ResourceModelCollection);
let TextModelResolverService = class extends Disposable {
  constructor(instantiationService, fileService, undoRedoService, modelService, uriIdentityService) {
    super();
    this.instantiationService = instantiationService;
    this.fileService = fileService;
    this.undoRedoService = undoRedoService;
    this.modelService = modelService;
    this.uriIdentityService = uriIdentityService;
    this._register(new ModelUndoRedoParticipant(this.modelService, this, this.undoRedoService));
  }
  static {
    __name(this, "TextModelResolverService");
  }
  _resourceModelCollection = void 0;
  get resourceModelCollection() {
    if (!this._resourceModelCollection) {
      this._resourceModelCollection = this.instantiationService.createInstance(ResourceModelCollection);
    }
    return this._resourceModelCollection;
  }
  _asyncModelCollection = void 0;
  get asyncModelCollection() {
    if (!this._asyncModelCollection) {
      this._asyncModelCollection = new AsyncReferenceCollection(this.resourceModelCollection);
    }
    return this._asyncModelCollection;
  }
  async createModelReference(resource) {
    resource = this.uriIdentityService.asCanonicalUri(resource);
    return await this.asyncModelCollection.acquire(resource.toString());
  }
  registerTextModelContentProvider(scheme, provider) {
    return this.resourceModelCollection.registerTextModelContentProvider(scheme, provider);
  }
  canHandleResource(resource) {
    if (this.fileService.hasProvider(resource) || resource.scheme === Schemas.untitled || resource.scheme === Schemas.inMemory) {
      return true;
    }
    return this.resourceModelCollection.hasTextModelContentProvider(resource.scheme);
  }
};
TextModelResolverService = __decorateClass([
  __decorateParam(0, IInstantiationService),
  __decorateParam(1, IFileService),
  __decorateParam(2, IUndoRedoService),
  __decorateParam(3, IModelService),
  __decorateParam(4, IUriIdentityService)
], TextModelResolverService);
registerSingleton(ITextModelService, TextModelResolverService, InstantiationType.Delayed);
export {
  TextModelResolverService
};
//# sourceMappingURL=textModelResolverService.js.map
