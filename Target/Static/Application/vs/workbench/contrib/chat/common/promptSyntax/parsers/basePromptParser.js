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
import { TopError } from "./topError.js";
import { ChatMode } from "../../constants.js";
import { PromptHeader } from "./promptHeader/header.js";
import { URI } from "../../../../../../base/common/uri.js";
import { PromptToken } from "../codecs/tokens/promptToken.js";
import * as path from "../../../../../../base/common/path.js";
import { ChatPromptCodec } from "../codecs/chatPromptCodec.js";
import { Emitter } from "../../../../../../base/common/event.js";
import { FileReference } from "../codecs/tokens/fileReference.js";
import { assertDefined } from "../../../../../../base/common/types.js";
import { DeferredPromise } from "../../../../../../base/common/async.js";
import { ILogService } from "../../../../../../platform/log/common/log.js";
import { PromptVariableWithData } from "../codecs/tokens/promptVariable.js";
import { assert, assertNever } from "../../../../../../base/common/assert.js";
import { basename, dirname } from "../../../../../../base/common/resources.js";
import { ObservableDisposable } from "../../../../../../base/common/observableDisposable.js";
import { IWorkspaceContextService } from "../../../../../../platform/workspace/common/workspace.js";
import { isPromptOrInstructionsFile } from "../../../../../../platform/prompts/common/constants.js";
import { IInstantiationService } from "../../../../../../platform/instantiation/common/instantiation.js";
import { MarkdownLink } from "../../../../../../editor/common/codecs/markdownCodec/tokens/markdownLink.js";
import { MarkdownToken } from "../../../../../../editor/common/codecs/markdownCodec/tokens/markdownToken.js";
import { FrontMatterHeader } from "../../../../../../editor/common/codecs/markdownExtensionsCodec/tokens/frontMatterHeader.js";
import { NotPromptFile, RecursiveReference, FolderReference, ResolveError } from "../../promptFileReferenceErrors.js";
import { DEFAULT_OPTIONS as CONTENTS_PROVIDER_DEFAULT_OPTIONS } from "../contentProviders/promptContentsProviderBase.js";
const DEFAULT_OPTIONS = {
  ...CONTENTS_PROVIDER_DEFAULT_OPTIONS,
  seenReferences: []
};
let BasePromptParser = class BasePromptParser2 extends ObservableDisposable {
  static {
    __name(this, "BasePromptParser");
  }
  /**
   * List of all tokens that were parsed from the prompt contents so far.
   */
  get tokens() {
    return [...this.receivedTokens];
  }
  /**
   * Reference to the prompt header object that holds metadata associated
   * with the prompt.
   */
  get header() {
    return this.promptHeader;
  }
  /**
   * Subscribe to the `onUpdate` event that is fired when prompt tokens are updated.
   * @param callback The callback function to be called on updates.
   */
  onUpdate(callback) {
    this._register(this._onUpdate.event(callback));
    return this;
  }
  /**
   * If file reference resolution fails, this attribute will be set
   * to an error instance that describes the error condition.
   */
  get errorCondition() {
    return this._errorCondition;
  }
  /**
   * Whether file references resolution failed.
   * Set to `undefined` if the `resolve` method hasn't been ever called yet.
   */
  get resolveFailed() {
    if (!this.firstParseResult.gotFirstResult) {
      return void 0;
    }
    return !!this._errorCondition;
  }
  /**
   * Returned promise is resolved when the parser process is settled.
   * The settled state means that the prompt parser stream exists and
   * has ended, or an error condition has been set in case of failure.
   *
   * Furthermore, this function can be called multiple times and will
   * block until the latest prompt contents parsing logic is settled
   * (e.g., for every `onContentChanged` event of the prompt source).
   */
  async settled() {
    assert(this.started, "Cannot wait on the parser that did not start yet.");
    await this.firstParseResult.promise;
    if (this.errorCondition) {
      return this;
    }
    if (this.disposed) {
      return this;
    }
    assertDefined(this.stream, "No stream reference found.");
    await this.stream.settled;
    if (this.promptHeader) {
      await this.promptHeader.settled;
    }
    return this;
  }
  /**
   * Same as {@link settled} but also waits for all possible
   * nested child prompt references and their children to be settled.
   */
  async allSettled() {
    await this.settled();
    await Promise.allSettled(this.references.map((reference) => {
      return reference.allSettled();
    }));
    return this;
  }
  constructor(promptContentsProvider, options, instantiationService, workspaceService, logService) {
    super();
    this.promptContentsProvider = promptContentsProvider;
    this.instantiationService = instantiationService;
    this.workspaceService = workspaceService;
    this.logService = logService;
    this.receivedTokens = [];
    this._references = [];
    this._onUpdate = this._register(new Emitter());
    this.firstParseResult = new FirstParseResult();
    this.started = false;
    this.options = {
      ...DEFAULT_OPTIONS,
      ...options
    };
    this._onUpdate.fire = this._onUpdate.fire.bind(this._onUpdate);
    const seenReferences = [...this.options.seenReferences];
    if (seenReferences.includes(this.uri.path)) {
      seenReferences.push(this.uri.path);
      this._errorCondition = new RecursiveReference(this.uri, seenReferences);
      this._onUpdate.fire();
      this.firstParseResult.complete();
      return this;
    }
    seenReferences.push(this.uri.path);
    this._register(this.promptContentsProvider.onContentChanged((streamOrError) => {
      this.onContentsChanged(streamOrError, seenReferences);
      this.firstParseResult.complete();
    }));
    this.promptContentsProvider.onDispose(this.dispose.bind(this));
  }
  /**
   * Handler the event event that is triggered when prompt contents change.
   *
   * @param streamOrError Either a binary stream of file contents, or an error object
   * 						that was generated during the reference resolve attempt.
   * @param seenReferences List of parent references that we've have already seen
   * 					 	during the process of traversing the references tree. It's
   * 						used to prevent the tree navigation to fall into an infinite
   * 						references recursion.
   */
  onContentsChanged(streamOrError, seenReferences) {
    this.stream?.dispose();
    delete this.stream;
    delete this._errorCondition;
    this.receivedTokens = [];
    this.promptHeader?.dispose();
    delete this.promptHeader;
    this.disposeReferences();
    if (streamOrError instanceof ResolveError) {
      this._errorCondition = streamOrError;
      this._onUpdate.fire();
      return;
    }
    this.stream = ChatPromptCodec.decode(streamOrError);
    this.stream.on("error", this.onStreamEnd.bind(this, this.stream));
    this.stream.on("end", this.onStreamEnd.bind(this, this.stream));
    this.stream.on("data", (token) => {
      if (token instanceof MarkdownToken || token instanceof PromptToken) {
        this.receivedTokens.push(token);
      }
      if (token instanceof FrontMatterHeader) {
        this.promptHeader = new PromptHeader(token.contentToken, this.promptContentsProvider.languageId).start();
        return;
      }
      if (token instanceof PromptVariableWithData) {
        try {
          this.onReference(FileReference.from(token), [...seenReferences]);
        } catch (error) {
        }
      }
      if (token instanceof MarkdownLink && !token.isURL) {
        this.onReference(token, [...seenReferences]);
      }
    });
    if (this.stream.disposed) {
      this.logService.warn(`[prompt parser][${basename(this.uri)}] cannot start stream that has been already disposed, aborting`);
      return;
    }
    this.stream.start();
  }
  /**
   * Handle a new reference token inside prompt contents.
   */
  onReference(token, seenReferences) {
    const { parentFolder } = this;
    const referenceUri = parentFolder !== null && path.isAbsolute(token.path) === false ? URI.joinPath(parentFolder, token.path) : URI.file(token.path);
    const contentProvider = this.promptContentsProvider.createNew({ uri: referenceUri });
    const reference = this.instantiationService.createInstance(PromptReference, contentProvider, token, { seenReferences });
    reference.onDispose(contentProvider.dispose.bind(contentProvider));
    this._references.push(reference);
    reference.onUpdate(this._onUpdate.fire);
    this._onUpdate.fire();
    reference.start();
    return this;
  }
  /**
   * Handle the `stream` end event.
   *
   * @param stream The stream that has ended.
   * @param error Optional error object if stream ended with an error.
   */
  onStreamEnd(_stream, error) {
    if (error) {
      this.logService.warn(`[prompt parser][${basename(this.uri)}] received an error on the chat prompt decoder stream: ${error}`);
    }
    this._onUpdate.fire();
    return this;
  }
  /**
   * Dispose all currently held references.
   */
  disposeReferences() {
    for (const reference of [...this._references]) {
      reference.dispose();
    }
    this._references.length = 0;
  }
  /**
   * Start the prompt parser.
   */
  start() {
    if (this.started) {
      return this;
    }
    this.started = true;
    if (this.errorCondition) {
      return this;
    }
    this.promptContentsProvider.start();
    return this;
  }
  /**
   * Associated URI of the prompt.
   */
  get uri() {
    return this.promptContentsProvider.uri;
  }
  /**
   * Get the parent folder URI of the prompt.
   * For instance, if prompt URI points to a file on a disk, this
   * function will return the folder URI that contains that file,
   * but if the URI points to an `untitled` document, will try to
   * use a different folder URI based on the workspace state.
   */
  get parentFolder() {
    if (this.uri.scheme === "file") {
      return dirname(this.uri);
    }
    const { folders } = this.workspaceService.getWorkspace();
    if (folders.length === 1) {
      return folders[0].uri;
    }
    return null;
  }
  /**
   * Get a list of immediate child references of the prompt.
   */
  get references() {
    return [...this._references];
  }
  /**
   * Get a list of all references of the prompt, including
   * all possible nested references its children may have.
   */
  get allReferences() {
    const result = [];
    for (const reference of this.references) {
      result.push(reference);
      if (reference.type === "file") {
        result.push(...reference.allReferences);
      }
    }
    return result;
  }
  /**
   * Get list of all valid references.
   */
  get allValidReferences() {
    return this.allReferences.filter((reference) => {
      const { errorCondition } = reference;
      if (!errorCondition) {
        return true;
      }
      if (errorCondition instanceof FolderReference) {
        return false;
      }
      return errorCondition instanceof NotPromptFile;
    });
  }
  /**
   * Get list of all valid child references as URIs.
   */
  get allValidReferencesUris() {
    return this.allValidReferences.map((child) => child.uri);
  }
  /**
   * Valid metadata records defined in the prompt header.
   */
  get metadata() {
    if (this.header === void 0) {
      return {};
    }
    const { metadata } = this.header;
    if (metadata === void 0) {
      return {};
    }
    const { tools, mode, description, applyTo } = metadata;
    const resultingMode = tools !== void 0 ? ChatMode.Agent : mode?.chatMode;
    return {
      mode: resultingMode,
      description: description?.text,
      tools: tools?.toolNames,
      applyTo: applyTo?.text
    };
  }
  /**
   * Entire associated `tools` metadata for this reference and
   * all possible nested child references.
   */
  get allToolsMetadata() {
    let hasTools = false;
    const result = [];
    const { tools, mode } = this.metadata;
    if (tools !== void 0) {
      result.push(...tools);
      hasTools = true;
    }
    const isRootInAgentMode = hasTools === true || mode === ChatMode.Agent;
    if (isRootInAgentMode === false) {
      return null;
    }
    for (const reference of this.references) {
      const { allToolsMetadata } = reference;
      if (allToolsMetadata === null) {
        continue;
      }
      result.push(...allToolsMetadata);
      hasTools = true;
    }
    if (hasTools === false) {
      return null;
    }
    return [...new Set(result)];
  }
  /**
   * Get list of errors for the direct links of the current reference.
   */
  get errors() {
    const childErrors = [];
    for (const reference of this.references) {
      const { errorCondition } = reference;
      if (errorCondition && !(errorCondition instanceof NotPromptFile)) {
        childErrors.push(errorCondition);
      }
    }
    return childErrors;
  }
  /**
   * List of all errors that occurred while resolving the current
   * reference including all possible errors of nested children.
   */
  get allErrors() {
    const result = [];
    for (const reference of this.references) {
      const { errorCondition } = reference;
      if (errorCondition && !(errorCondition instanceof NotPromptFile)) {
        result.push({
          originalError: errorCondition,
          parentUri: this.uri
        });
      }
      result.push(...reference.allErrors);
    }
    return result;
  }
  /**
   * The top most error of the current reference or any of its
   * possible child reference errors.
   */
  get topError() {
    if (this.errorCondition) {
      return new TopError({
        errorSubject: "root",
        errorsCount: 1,
        originalError: this.errorCondition
      });
    }
    const childErrors = [...this.errors];
    const nestedErrors = [];
    for (const reference of this.references) {
      nestedErrors.push(...reference.allErrors);
    }
    if (childErrors.length === 0 && nestedErrors.length === 0) {
      return void 0;
    }
    const firstDirectChildError = childErrors[0];
    const firstNestedChildError = nestedErrors[0];
    const hasDirectChildError = firstDirectChildError !== void 0;
    const firstChildError = hasDirectChildError ? {
      originalError: firstDirectChildError,
      parentUri: this.uri
    } : firstNestedChildError;
    const totalErrorsCount = childErrors.length + nestedErrors.length;
    const subject = hasDirectChildError ? "child" : "indirect-child";
    return new TopError({
      errorSubject: subject,
      originalError: firstChildError.originalError,
      parentUri: firstChildError.parentUri,
      errorsCount: totalErrorsCount
    });
  }
  /**
   * Check if the current reference points to a given resource.
   */
  sameUri(otherUri) {
    return this.uri.toString() === otherUri.toString();
  }
  /**
   * Check if the current reference points to a prompt snippet file.
   */
  get isPromptFile() {
    return isPromptOrInstructionsFile(this.uri);
  }
  /**
   * Returns a string representation of this object.
   */
  toString() {
    return `prompt:${this.uri.path}`;
  }
  /**
   * @inheritdoc
   */
  dispose() {
    if (this.disposed) {
      return;
    }
    this.disposeReferences();
    this.stream?.dispose();
    delete this.stream;
    this.promptHeader?.dispose();
    delete this.promptHeader;
    super.dispose();
  }
};
BasePromptParser = __decorate([
  __param(2, IInstantiationService),
  __param(3, IWorkspaceContextService),
  __param(4, ILogService)
], BasePromptParser);
let PromptReference = class PromptReference2 extends ObservableDisposable {
  static {
    __name(this, "PromptReference");
  }
  constructor(promptContentsProvider, token, options = {}, initService) {
    super();
    this.promptContentsProvider = promptContentsProvider;
    this.token = token;
    this.parser = this._register(initService.createInstance(BasePromptParser, this.promptContentsProvider, options));
  }
  /**
   * Get the range of the `link` part of the reference.
   */
  get linkRange() {
    if (this.token instanceof FileReference) {
      return this.token.dataRange;
    }
    if (this.token instanceof MarkdownLink) {
      return this.token.linkRange;
    }
    return void 0;
  }
  /**
   * Type of the reference, - either a prompt `#file` variable,
   * or a `markdown link` reference (`[caption](/path/to/file.md)`).
   */
  get type() {
    if (this.token instanceof FileReference) {
      return "file";
    }
    if (this.token instanceof MarkdownLink) {
      return "file";
    }
    assertNever(this.token, `Unknown token type '${this.token}'.`);
  }
  /**
   * Subtype of the reference, - either a prompt `#file` variable,
   * or a `markdown link` reference (`[caption](/path/to/file.md)`).
   */
  get subtype() {
    if (this.token instanceof FileReference) {
      return "prompt";
    }
    if (this.token instanceof MarkdownLink) {
      return "markdown";
    }
    assertNever(this.token, `Unknown token type '${this.token}'.`);
  }
  /**
   * Start parsing the reference contents.
   */
  start() {
    this.parser.start();
    return this;
  }
  /**
   * Subscribe to the `onUpdate` event that is fired when prompt tokens are updated.
   * @param callback The callback function to be called on updates.
   */
  onUpdate(callback) {
    this.parser.onUpdate(callback);
    return this;
  }
  get range() {
    return this.token.range;
  }
  get path() {
    return this.token.path;
  }
  get text() {
    return this.token.text;
  }
  get resolveFailed() {
    return this.parser.resolveFailed;
  }
  get errorCondition() {
    return this.parser.errorCondition;
  }
  get topError() {
    return this.parser.topError;
  }
  get uri() {
    return this.parser.uri;
  }
  get isPromptFile() {
    return this.parser.isPromptFile;
  }
  get errors() {
    return this.parser.errors;
  }
  get allErrors() {
    return this.parser.allErrors;
  }
  get references() {
    return this.parser.references;
  }
  get allReferences() {
    return this.parser.allReferences;
  }
  get metadata() {
    return this.parser.metadata;
  }
  get allToolsMetadata() {
    return this.parser.allToolsMetadata;
  }
  get allValidReferences() {
    return this.parser.allValidReferences;
  }
  async settled() {
    await this.parser.settled();
    return this;
  }
  async allSettled() {
    await this.parser.allSettled();
    return this;
  }
  /**
   * Returns a string representation of this object.
   */
  toString() {
    return `prompt-reference/${this.type}:${this.subtype}/${this.token}`;
  }
};
PromptReference = __decorate([
  __param(3, IInstantiationService)
], PromptReference);
class FirstParseResult extends DeferredPromise {
  static {
    __name(this, "FirstParseResult");
  }
  constructor() {
    super(...arguments);
    this._gotResult = false;
  }
  /**
   * Whether we've received at least one result.
   */
  get gotFirstResult() {
    return this._gotResult;
  }
  /**
   * Get underlying promise reference.
   */
  get promise() {
    return this.p;
  }
  /**
   * Complete the underlying promise.
   */
  complete() {
    this._gotResult = true;
    return super.complete(void 0);
  }
}
export {
  BasePromptParser,
  PromptReference
};
//# sourceMappingURL=basePromptParser.js.map
