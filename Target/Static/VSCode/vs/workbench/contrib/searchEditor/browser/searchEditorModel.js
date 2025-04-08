var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { URI } from "../../../../base/common/uri.js";
import { ITextModel } from "../../../../editor/common/model.js";
import { IModelService } from "../../../../editor/common/services/model.js";
import { ILanguageService } from "../../../../editor/common/languages/language.js";
import { IInstantiationService, ServicesAccessor } from "../../../../platform/instantiation/common/instantiation.js";
import { parseSavedSearchEditor, parseSerializedSearchEditor } from "./searchEditorSerialization.js";
import { IWorkingCopyBackupService } from "../../../services/workingCopy/common/workingCopyBackup.js";
import { SearchConfiguration, SearchEditorWorkingCopyTypeId } from "./constants.js";
import { assertIsDefined } from "../../../../base/common/types.js";
import { createTextBufferFactoryFromStream } from "../../../../editor/common/model/textModel.js";
import { Emitter } from "../../../../base/common/event.js";
import { ResourceMap } from "../../../../base/common/map.js";
import { SEARCH_RESULT_LANGUAGE_ID } from "../../../services/search/common/search.js";
class SearchConfigurationModel {
  constructor(config) {
    this.config = config;
  }
  static {
    __name(this, "SearchConfigurationModel");
  }
  _onConfigDidUpdate = new Emitter();
  onConfigDidUpdate = this._onConfigDidUpdate.event;
  updateConfig(config) {
    this.config = config;
    this._onConfigDidUpdate.fire(config);
  }
}
class SearchEditorModel {
  constructor(resource) {
    this.resource = resource;
  }
  static {
    __name(this, "SearchEditorModel");
  }
  async resolve() {
    return assertIsDefined(searchEditorModelFactory.models.get(this.resource)).resolve();
  }
}
class SearchEditorModelFactory {
  static {
    __name(this, "SearchEditorModelFactory");
  }
  models = new ResourceMap();
  constructor() {
  }
  initializeModelFromExistingModel(accessor, resource, config) {
    if (this.models.has(resource)) {
      throw Error("Unable to contruct model for resource that already exists");
    }
    const languageService = accessor.get(ILanguageService);
    const modelService = accessor.get(IModelService);
    const instantiationService = accessor.get(IInstantiationService);
    const workingCopyBackupService = accessor.get(IWorkingCopyBackupService);
    let ongoingResolve;
    this.models.set(resource, {
      resolve: /* @__PURE__ */ __name(() => {
        if (!ongoingResolve) {
          ongoingResolve = (async () => {
            const backup = await this.tryFetchModelFromBackupService(resource, languageService, modelService, workingCopyBackupService, instantiationService);
            if (backup) {
              return backup;
            }
            return Promise.resolve({
              resultsModel: modelService.getModel(resource) ?? modelService.createModel("", languageService.createById(SEARCH_RESULT_LANGUAGE_ID), resource),
              configurationModel: new SearchConfigurationModel(config)
            });
          })();
        }
        return ongoingResolve;
      }, "resolve")
    });
  }
  initializeModelFromRawData(accessor, resource, config, contents) {
    if (this.models.has(resource)) {
      throw Error("Unable to contruct model for resource that already exists");
    }
    const languageService = accessor.get(ILanguageService);
    const modelService = accessor.get(IModelService);
    const instantiationService = accessor.get(IInstantiationService);
    const workingCopyBackupService = accessor.get(IWorkingCopyBackupService);
    let ongoingResolve;
    this.models.set(resource, {
      resolve: /* @__PURE__ */ __name(() => {
        if (!ongoingResolve) {
          ongoingResolve = (async () => {
            const backup = await this.tryFetchModelFromBackupService(resource, languageService, modelService, workingCopyBackupService, instantiationService);
            if (backup) {
              return backup;
            }
            return Promise.resolve({
              resultsModel: modelService.createModel(contents ?? "", languageService.createById(SEARCH_RESULT_LANGUAGE_ID), resource),
              configurationModel: new SearchConfigurationModel(config)
            });
          })();
        }
        return ongoingResolve;
      }, "resolve")
    });
  }
  initializeModelFromExistingFile(accessor, resource, existingFile) {
    if (this.models.has(resource)) {
      throw Error("Unable to contruct model for resource that already exists");
    }
    const languageService = accessor.get(ILanguageService);
    const modelService = accessor.get(IModelService);
    const instantiationService = accessor.get(IInstantiationService);
    const workingCopyBackupService = accessor.get(IWorkingCopyBackupService);
    let ongoingResolve;
    this.models.set(resource, {
      resolve: /* @__PURE__ */ __name(async () => {
        if (!ongoingResolve) {
          ongoingResolve = (async () => {
            const backup = await this.tryFetchModelFromBackupService(resource, languageService, modelService, workingCopyBackupService, instantiationService);
            if (backup) {
              return backup;
            }
            const { text, config } = await instantiationService.invokeFunction(parseSavedSearchEditor, existingFile);
            return {
              resultsModel: modelService.createModel(text ?? "", languageService.createById(SEARCH_RESULT_LANGUAGE_ID), resource),
              configurationModel: new SearchConfigurationModel(config)
            };
          })();
        }
        return ongoingResolve;
      }, "resolve")
    });
  }
  async tryFetchModelFromBackupService(resource, languageService, modelService, workingCopyBackupService, instantiationService) {
    const backup = await workingCopyBackupService.resolve({ resource, typeId: SearchEditorWorkingCopyTypeId });
    let model = modelService.getModel(resource);
    if (!model && backup) {
      const factory = await createTextBufferFactoryFromStream(backup.value);
      model = modelService.createModel(factory, languageService.createById(SEARCH_RESULT_LANGUAGE_ID), resource);
    }
    if (model) {
      const existingFile = model.getValue();
      const { text, config } = parseSerializedSearchEditor(existingFile);
      modelService.destroyModel(resource);
      return {
        resultsModel: modelService.createModel(text ?? "", languageService.createById(SEARCH_RESULT_LANGUAGE_ID), resource),
        configurationModel: new SearchConfigurationModel(config)
      };
    } else {
      return void 0;
    }
  }
}
const searchEditorModelFactory = new SearchEditorModelFactory();
export {
  SearchConfigurationModel,
  SearchEditorModel,
  searchEditorModelFactory
};
//# sourceMappingURL=searchEditorModel.js.map
