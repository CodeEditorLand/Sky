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
import { URI } from "../../../../../../base/common/uri.js";
import { assert } from "../../../../../../base/common/assert.js";
import { assertDefined } from "../../../../../../base/common/types.js";
import { CancellationError } from "../../../../../../base/common/errors.js";
import { PromptContentsProviderBase } from "./promptContentsProviderBase.js";
import { VSBufferReadableStream } from "../../../../../../base/common/buffer.js";
import { CancellationToken } from "../../../../../../base/common/cancellation.js";
import { isPromptFile } from "../../../../../../platform/prompts/common/constants.js";
import { OpenFailed, NotPromptFile, ResolveError, FolderReference } from "../../promptFileReferenceErrors.js";
import { FileChangesEvent, FileChangeType, IFileService } from "../../../../../../platform/files/common/files.js";
let FilePromptContentProvider = class extends PromptContentsProviderBase {
  constructor(uri, fileService) {
    super();
    this.uri = uri;
    this.fileService = fileService;
    this._register(
      this.fileService.onDidFilesChange((event) => {
        if (event.contains(this.uri, FileChangeType.ADDED, FileChangeType.UPDATED)) {
          return this.onChangeEmitter.fire("full");
        }
        if (event.contains(this.uri, FileChangeType.DELETED)) {
          return this.onChangeEmitter.fire(event);
        }
      })
    );
  }
  static {
    __name(this, "FilePromptContentProvider");
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
    assert(
      !cancellationToken?.isCancellationRequested,
      new CancellationError()
    );
    let fileStream;
    try {
      const info = await this.fileService.resolve(this.uri);
      assert(
        !cancellationToken?.isCancellationRequested,
        new CancellationError()
      );
      assert(
        info.isFile,
        new FolderReference(this.uri)
      );
      fileStream = await this.fileService.readFileStream(this.uri);
    } catch (error) {
      if (error instanceof ResolveError) {
        throw error;
      }
      throw new OpenFailed(this.uri, error);
    }
    assertDefined(
      fileStream,
      new OpenFailed(this.uri, "Failed to open file stream.")
    );
    if (this.disposed || cancellationToken?.isCancellationRequested) {
      fileStream.value.destroy();
      throw new CancellationError();
    }
    if (isPromptFile(this.uri) === false) {
      throw new NotPromptFile(this.uri);
    }
    return fileStream.value;
  }
  createNew(promptContentsSource) {
    return new FilePromptContentProvider(
      promptContentsSource.uri,
      this.fileService
    );
  }
  /**
   * String representation of this object.
   */
  toString() {
    return `file-prompt-contents-provider:${this.uri.path}`;
  }
};
FilePromptContentProvider = __decorateClass([
  __decorateParam(1, IFileService)
], FilePromptContentProvider);
export {
  FilePromptContentProvider
};
//# sourceMappingURL=filePromptContentsProvider.js.map
