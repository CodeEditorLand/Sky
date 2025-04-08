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
import { LANGUAGE_SELECTOR } from "../constants.js";
import { IPromptsService } from "../service/types.js";
import { URI } from "../../../../../../base/common/uri.js";
import { assertOneOf } from "../../../../../../base/common/types.js";
import { isWindows } from "../../../../../../base/common/platform.js";
import { ITextModel } from "../../../../../../editor/common/model.js";
import { Disposable } from "../../../../../../base/common/lifecycle.js";
import { CancellationError } from "../../../../../../base/common/errors.js";
import { Position } from "../../../../../../editor/common/core/position.js";
import { dirname, extUri } from "../../../../../../base/common/resources.js";
import { assert, assertNever } from "../../../../../../base/common/assert.js";
import { IFileService } from "../../../../../../platform/files/common/files.js";
import { CancellationToken } from "../../../../../../base/common/cancellation.js";
import { Registry } from "../../../../../../platform/registry/common/platform.js";
import { LifecyclePhase } from "../../../../../services/lifecycle/common/lifecycle.js";
import { ILanguageFeaturesService } from "../../../../../../editor/common/services/languageFeatures.js";
import { IWorkbenchContributionsRegistry, Extensions as WorkbenchExtensions } from "../../../../../common/contributions.js";
import { CompletionContext, CompletionItem, CompletionItemKind, CompletionItemProvider, CompletionList } from "../../../../../../editor/common/languages.js";
const findFileReference = /* @__PURE__ */ __name((references, position) => {
  for (const reference of references) {
    const { range } = reference;
    if (reference.type !== "file") {
      return void 0;
    }
    if (reference.subtype !== "prompt") {
      return void 0;
    }
    const { startLineNumber, endColumn } = range;
    if (startLineNumber !== position.lineNumber || endColumn !== position.column) {
      continue;
    }
    return reference;
  }
  return void 0;
}, "findFileReference");
let PromptPathAutocompletion = class extends Disposable {
  constructor(fileService, promptSyntaxService, languageService) {
    super();
    this.fileService = fileService;
    this.promptSyntaxService = promptSyntaxService;
    this.languageService = languageService;
    this._register(this.languageService.completionProvider.register(LANGUAGE_SELECTOR, this));
  }
  static {
    __name(this, "PromptPathAutocompletion");
  }
  /**
   * Debug display name for this provider.
   */
  _debugDisplayName = "PromptPathAutocompletion";
  /**
   * List of trigger characters handled by this provider.
   */
  triggerCharacters = [":", ".", "/"];
  /**
   * The main function of this provider that calculates
   * completion items based on the provided arguments.
   */
  async provideCompletionItems(model, position, context, token) {
    assert(
      !token.isCancellationRequested,
      new CancellationError()
    );
    const { triggerCharacter } = context;
    if (!triggerCharacter) {
      return void 0;
    }
    assertOneOf(
      triggerCharacter,
      this.triggerCharacters,
      `Prompt path autocompletion provider`
    );
    const parser = this.promptSyntaxService.getSyntaxParserFor(model);
    assert(
      !parser.disposed,
      "Prompt parser must not be disposed."
    );
    const { references } = await parser.start().settled();
    assert(
      !token.isCancellationRequested,
      new CancellationError()
    );
    const fileReference = findFileReference(references, position);
    if (!fileReference) {
      return void 0;
    }
    const modelDirname = dirname(model.uri);
    if (triggerCharacter === ":" || triggerCharacter === "." && fileReference.path === ".") {
      return {
        suggestions: await this.getFirstFolderSuggestions(
          triggerCharacter,
          modelDirname,
          fileReference
        )
      };
    }
    if (triggerCharacter === "/" || triggerCharacter === ".") {
      return {
        suggestions: await this.getNonFirstFolderSuggestions(
          triggerCharacter,
          modelDirname,
          fileReference
        )
      };
    }
    assertNever(
      triggerCharacter,
      `Unexpected trigger character '${triggerCharacter}'.`
    );
  }
  /**
   * Gets "raw" folder suggestions. Unlike the full completion items,
   * these ones do not have `insertText` and `range` properties which
   * are meant to be added by the caller later on.
   */
  async getFolderSuggestions(uri) {
    const { children } = await this.fileService.resolve(uri);
    const suggestions = [];
    if (!children) {
      return suggestions;
    }
    for (const child of children) {
      const kind = child.isDirectory ? CompletionItemKind.Folder : CompletionItemKind.File;
      const sortText = child.isDirectory ? "1" : "2";
      suggestions.push({
        label: child.name,
        kind,
        sortText
      });
    }
    return suggestions;
  }
  /**
   * Gets suggestions for a first folder/file name in the path. E.g., the one
   * that follows immediately after the `:` character of the `#file:` variable.
   *
   * The main difference between this and "subsequent" folder cases is that in
   * the beginning of the path the suggestions also contain the `..` item and
   * the `./` normalization prefix for relative paths.
   *
   * See also {@link getNonFirstFolderSuggestions}.
   */
  async getFirstFolderSuggestions(character, fileFolderUri, fileReference) {
    const { linkRange } = fileReference;
    if (character === ":" && linkRange !== void 0) {
      return [];
    }
    if (character === "." && linkRange === void 0) {
      return [];
    }
    const suggestions = await this.getFolderSuggestions(fileFolderUri);
    const startColumnOffset = character === "." ? 1 : 0;
    const range = {
      ...fileReference.range,
      endColumn: fileReference.range.endColumn,
      startColumn: fileReference.range.endColumn - startColumnOffset
    };
    return [
      {
        label: "..",
        kind: CompletionItemKind.Folder,
        insertText: "..",
        range,
        sortText: "0"
      },
      ...suggestions.map((suggestion) => {
        const suffix = suggestion.kind === CompletionItemKind.File ? " " : "";
        return {
          ...suggestion,
          range,
          label: `./${suggestion.label}${suffix}`,
          // we use the `./` prefix for consistency
          insertText: `./${suggestion.label}${suffix}`
        };
      })
    ];
  }
  /**
   * Gets suggestions for a folder/file name that follows after the first one.
   * See also {@link getFirstFolderSuggestions}.
   */
  async getNonFirstFolderSuggestions(character, fileFolderUri, fileReference) {
    const { linkRange, path } = fileReference;
    if (linkRange === void 0) {
      return [];
    }
    const currenFolder = extUri.resolvePath(fileFolderUri, path);
    let suggestions = await this.getFolderSuggestions(currenFolder);
    if (character === ".") {
      suggestions = suggestions.filter((suggestion) => {
        return suggestion.label.startsWith(".");
      });
    }
    const startColumnOffset = character === "." ? 1 : 0;
    const range = {
      ...fileReference.range,
      endColumn: fileReference.range.endColumn,
      startColumn: fileReference.range.endColumn - startColumnOffset
    };
    return suggestions.map((suggestion) => {
      const suffix = suggestion.kind === CompletionItemKind.File ? " " : "";
      return {
        ...suggestion,
        insertText: `${suggestion.label}${suffix}`,
        range
      };
    });
  }
};
PromptPathAutocompletion = __decorateClass([
  __decorateParam(0, IFileService),
  __decorateParam(1, IPromptsService),
  __decorateParam(2, ILanguageFeaturesService)
], PromptPathAutocompletion);
if (!isWindows) {
  Registry.as(WorkbenchExtensions.Workbench).registerWorkbenchContribution(PromptPathAutocompletion, LifecyclePhase.Eventually);
}
export {
  PromptPathAutocompletion
};
//# sourceMappingURL=promptPathAutocompletion.js.map
