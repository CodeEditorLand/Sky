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
var UntitledTextEditorService_1;
import { URI } from "../../../../base/common/uri.js";
import { createDecorator, IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { UntitledTextEditorModel } from "./untitledTextEditorModel.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { Event, Emitter } from "../../../../base/common/event.js";
import { ResourceMap } from "../../../../base/common/map.js";
import { Schemas } from "../../../../base/common/network.js";
import { Disposable, DisposableStore } from "../../../../base/common/lifecycle.js";
import { registerSingleton } from "../../../../platform/instantiation/common/extensions.js";
const IUntitledTextEditorService = createDecorator("untitledTextEditorService");
let UntitledTextEditorService = class UntitledTextEditorService2 extends Disposable {
  static {
    __name(this, "UntitledTextEditorService");
  }
  static {
    UntitledTextEditorService_1 = this;
  }
  static {
    this.UNTITLED_WITHOUT_ASSOCIATED_RESOURCE_REGEX = /Untitled-\d+/;
  }
  constructor(instantiationService, configurationService) {
    super();
    this.instantiationService = instantiationService;
    this.configurationService = configurationService;
    this._onDidSave = this._register(new Emitter());
    this.onDidSave = this._onDidSave.event;
    this._onDidChangeDirty = this._register(new Emitter());
    this.onDidChangeDirty = this._onDidChangeDirty.event;
    this._onDidChangeEncoding = this._register(new Emitter());
    this.onDidChangeEncoding = this._onDidChangeEncoding.event;
    this._onDidCreate = this._register(new Emitter());
    this.onDidCreate = this._onDidCreate.event;
    this._onWillDispose = this._register(new Emitter());
    this.onWillDispose = this._onWillDispose.event;
    this._onDidChangeLabel = this._register(new Emitter());
    this.onDidChangeLabel = this._onDidChangeLabel.event;
    this.mapResourceToModel = new ResourceMap();
  }
  get(resource) {
    return this.mapResourceToModel.get(resource);
  }
  getValue(resource) {
    return this.get(resource)?.textEditorModel?.getValue();
  }
  async resolve(options) {
    const model = this.doCreateOrGet(options);
    await model.resolve();
    return model;
  }
  create(options) {
    return this.doCreateOrGet(options);
  }
  doCreateOrGet(options = /* @__PURE__ */ Object.create(null)) {
    const massagedOptions = this.massageOptions(options);
    if (massagedOptions.untitledResource && this.mapResourceToModel.has(massagedOptions.untitledResource)) {
      return this.mapResourceToModel.get(massagedOptions.untitledResource);
    }
    return this.doCreate(massagedOptions);
  }
  massageOptions(options) {
    const massagedOptions = /* @__PURE__ */ Object.create(null);
    if (options.associatedResource) {
      massagedOptions.untitledResource = URI.from({
        scheme: Schemas.untitled,
        authority: options.associatedResource.authority,
        fragment: options.associatedResource.fragment,
        path: options.associatedResource.path,
        query: options.associatedResource.query
      });
      massagedOptions.associatedResource = options.associatedResource;
    } else {
      if (options.untitledResource?.scheme === Schemas.untitled) {
        massagedOptions.untitledResource = options.untitledResource;
      }
    }
    if (options.languageId) {
      massagedOptions.languageId = options.languageId;
    } else if (!massagedOptions.associatedResource) {
      const configuration = this.configurationService.getValue();
      if (configuration.files?.defaultLanguage) {
        massagedOptions.languageId = configuration.files.defaultLanguage;
      }
    }
    massagedOptions.encoding = options.encoding;
    massagedOptions.initialValue = options.initialValue;
    return massagedOptions;
  }
  doCreate(options) {
    let untitledResource = options.untitledResource;
    if (!untitledResource) {
      let counter = 1;
      do {
        untitledResource = URI.from({ scheme: Schemas.untitled, path: `Untitled-${counter}` });
        counter++;
      } while (this.mapResourceToModel.has(untitledResource));
    }
    const model = this._register(this.instantiationService.createInstance(UntitledTextEditorModel, untitledResource, !!options.associatedResource, options.initialValue, options.languageId, options.encoding));
    this.registerModel(model);
    return model;
  }
  registerModel(model) {
    const modelListeners = new DisposableStore();
    modelListeners.add(model.onDidChangeDirty(() => this._onDidChangeDirty.fire(model)));
    modelListeners.add(model.onDidChangeName(() => this._onDidChangeLabel.fire(model)));
    modelListeners.add(model.onDidChangeEncoding(() => this._onDidChangeEncoding.fire(model)));
    modelListeners.add(model.onWillDispose(() => this._onWillDispose.fire(model)));
    Event.once(model.onWillDispose)(() => {
      this.mapResourceToModel.delete(model.resource);
      modelListeners.dispose();
    });
    this.mapResourceToModel.set(model.resource, model);
    this._onDidCreate.fire(model);
    if (model.isDirty()) {
      this._onDidChangeDirty.fire(model);
    }
  }
  isUntitledWithAssociatedResource(resource) {
    return resource.scheme === Schemas.untitled && resource.path.length > 1 && !UntitledTextEditorService_1.UNTITLED_WITHOUT_ASSOCIATED_RESOURCE_REGEX.test(resource.path);
  }
  canDispose(model) {
    if (model.isDisposed()) {
      return true;
    }
    return this.doCanDispose(model);
  }
  async doCanDispose(model) {
    if (model.isDirty()) {
      await Event.toPromise(model.onDidChangeDirty);
      return this.canDispose(model);
    }
    return true;
  }
  notifyDidSave(source, target) {
    this._onDidSave.fire({ source, target });
  }
};
UntitledTextEditorService = UntitledTextEditorService_1 = __decorate([
  __param(0, IInstantiationService),
  __param(1, IConfigurationService)
], UntitledTextEditorService);
registerSingleton(
  IUntitledTextEditorService,
  UntitledTextEditorService,
  1
  /* InstantiationType.Delayed */
);
export {
  IUntitledTextEditorService,
  UntitledTextEditorService
};
//# sourceMappingURL=untitledTextEditorService.js.map
