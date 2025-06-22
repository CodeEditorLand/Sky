var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { PROMPT_LANGUAGE_ID } from "../promptTypes.js";
import { assert } from "../../../../../../base/common/assert.js";
import { CancellationError } from "../../../../../../base/common/errors.js";
import { IModelService } from "../../../../../../editor/common/services/model.js";
import { ILanguageService } from "../../../../../../editor/common/languages/language.js";
import { isPromptOrInstructionsFile } from "../config/promptFileLocations.js";
import { PromptContentsProviderBase } from "./promptContentsProviderBase.js";
import { OpenFailed, NotPromptFile, ResolveError, FolderReference } from "../../promptFileReferenceErrors.js";
import { IFileService } from "../../../../../../platform/files/common/files.js";
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
var FilePromptContentProvider_1;
let FilePromptContentProvider = FilePromptContentProvider_1 = class FilePromptContentProvider2 extends PromptContentsProviderBase {
  static {
    __name(this, "FilePromptContentProvider");
  }
  get sourceName() {
    return "file";
  }
  get languageId() {
    const model = this.modelService.getModel(this.uri);
    if (model !== null) {
      return model.getLanguageId();
    }
    const inferredId = this.languageService.guessLanguageIdByFilepathOrFirstLine(this.uri);
    if (inferredId !== null) {
      return inferredId;
    }
    return PROMPT_LANGUAGE_ID;
  }
  constructor(uri, options, fileService, modelService, languageService) {
    super(options);
    this.uri = uri;
    this.fileService = fileService;
    this.modelService = modelService;
    this.languageService = languageService;
    this._register(this.fileService.onDidFilesChange((event) => {
      if (event.contains(
        this.uri,
        1,
        0
        /* FileChangeType.UPDATED */
      )) {
        this.onChangeEmitter.fire("full");
        return;
      }
      if (event.contains(
        this.uri,
        2
        /* FileChangeType.DELETED */
      )) {
        this.onChangeEmitter.fire(event);
        return;
      }
    }));
  }
  /**
   * Creates a stream of lines from the file based on the changes listed in
   * the provided event.
   *
   * @param event - event that describes the changes in the file; `'full'` is
   * 				  the special value that means that all contents have changed
   * @param cancellationToken - token that cancels this operation
   */
  async getContentsStream(_event, cancellationToken) {
    assert(!cancellationToken?.isCancellationRequested, new CancellationError());
    let fileStream;
    try {
      const info = await this.fileService.resolve(this.uri);
      assert(!cancellationToken?.isCancellationRequested, new CancellationError());
      assert(info.isFile, new FolderReference(this.uri));
      const { allowNonPromptFiles } = this.options;
      if (allowNonPromptFiles !== true && isPromptOrInstructionsFile(this.uri) === false) {
        throw new NotPromptFile(this.uri);
      }
      fileStream = await this.fileService.readFileStream(this.uri);
      if (this.isDisposed || cancellationToken?.isCancellationRequested) {
        fileStream.value.destroy();
        throw new CancellationError();
      }
      return fileStream.value;
    } catch (error) {
      if (error instanceof ResolveError || error instanceof CancellationError) {
        throw error;
      }
      throw new OpenFailed(this.uri, error);
    }
  }
  createNew(promptContentsSource, options = {}) {
    return new FilePromptContentProvider_1(promptContentsSource.uri, options, this.fileService, this.modelService, this.languageService);
  }
  /**
   * String representation of this object.
   */
  toString() {
    return `file-prompt-contents-provider:${this.uri.path}`;
  }
};
FilePromptContentProvider = FilePromptContentProvider_1 = __decorate([
  __param(2, IFileService),
  __param(3, IModelService),
  __param(4, ILanguageService)
], FilePromptContentProvider);
export {
  FilePromptContentProvider
};
//# sourceMappingURL=filePromptContentsProvider.js.map
