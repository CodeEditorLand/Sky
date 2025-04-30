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
import { IPromptsService } from "../../../service/types.js";
import { extUri } from "../../../../../../../../base/common/resources.js";
import { assertOneOf } from "../../../../../../../../base/common/types.js";
import { Disposable } from "../../../../../../../../base/common/lifecycle.js";
import { CancellationError } from "../../../../../../../../base/common/errors.js";
import { PROMPT_AND_INSTRUCTIONS_LANGUAGE_SELECTOR } from "../../../constants.js";
import { assert, assertNever } from "../../../../../../../../base/common/assert.js";
import { IFileService } from "../../../../../../../../platform/files/common/files.js";
import { ILanguageFeaturesService } from "../../../../../../../../editor/common/services/languageFeatures.js";
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
let PromptPathAutocompletion = class PromptPathAutocompletion2 extends Disposable {
  static {
    __name(this, "PromptPathAutocompletion");
  }
  constructor(fileService, promptsService, languageService) {
    super();
    this.fileService = fileService;
    this.promptsService = promptsService;
    this.languageService = languageService;
    this._debugDisplayName = "PromptPathAutocompletion";
    this.triggerCharacters = [":", ".", "/"];
    this._register(this.languageService.completionProvider.register(PROMPT_AND_INSTRUCTIONS_LANGUAGE_SELECTOR, this));
  }
  /**
   * The main function of this provider that calculates
   * completion items based on the provided arguments.
   */
  async provideCompletionItems(model, position, context, token) {
    assert(!token.isCancellationRequested, new CancellationError());
    const { triggerCharacter } = context;
    if (!triggerCharacter) {
      return void 0;
    }
    assertOneOf(triggerCharacter, this.triggerCharacters, `Prompt path autocompletion provider`);
    const parser = this.promptsService.getSyntaxParserFor(model);
    assert(!parser.disposed, "Prompt parser must not be disposed.");
    const { references } = await parser.start().settled();
    assert(!token.isCancellationRequested, new CancellationError());
    const fileReference = findFileReference(references, position);
    if (!fileReference) {
      return void 0;
    }
    const { parentFolder } = parser;
    if (parentFolder === null) {
      return void 0;
    }
    if (triggerCharacter === ":" || triggerCharacter === "." && fileReference.path === ".") {
      return {
        suggestions: await this.getFirstFolderSuggestions(triggerCharacter, parentFolder, fileReference)
      };
    }
    if (triggerCharacter === "/" || triggerCharacter === ".") {
      return {
        suggestions: await this.getNonFirstFolderSuggestions(triggerCharacter, parentFolder, fileReference)
      };
    }
    assertNever(triggerCharacter, `Unexpected trigger character '${triggerCharacter}'.`);
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
      const kind = child.isDirectory ? 23 : 20;
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
        kind: 23,
        insertText: "..",
        range,
        sortText: "0"
      },
      ...suggestions.map((suggestion) => {
        const suffix = suggestion.kind === 20 ? " " : "";
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
    const currentFolder = extUri.resolvePath(fileFolderUri, path);
    let suggestions = await this.getFolderSuggestions(currentFolder);
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
      const suffix = suggestion.kind === 20 ? " " : "";
      return {
        ...suggestion,
        insertText: `${suggestion.label}${suffix}`,
        range
      };
    });
  }
};
PromptPathAutocompletion = __decorate([
  __param(0, IFileService),
  __param(1, IPromptsService),
  __param(2, ILanguageFeaturesService)
], PromptPathAutocompletion);
export {
  PromptPathAutocompletion
};
//# sourceMappingURL=promptPathAutocompletion.js.map
