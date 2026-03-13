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
import { RunOnceScheduler } from "../../../../../base/common/async.js";
import { BugIndicatingError, ErrorNoTelemetry } from "../../../../../base/common/errors.js";
import { Lazy } from "../../../../../base/common/lazy.js";
import { Disposable, MutableDisposable, toDisposable } from "../../../../../base/common/lifecycle.js";
import { ITreeSitterLibraryService } from "../../../../../editor/common/services/treeSitter/treeSitterLibraryService.js";
import { SedFileWriteParser } from "./commandParsers/sedFileWriteParser.js";
var TreeSitterCommandParserLanguage;
(function(TreeSitterCommandParserLanguage2) {
  TreeSitterCommandParserLanguage2["Bash"] = "bash";
  TreeSitterCommandParserLanguage2["PowerShell"] = "powershell";
})(TreeSitterCommandParserLanguage || (TreeSitterCommandParserLanguage = {}));
let TreeSitterCommandParser = class TreeSitterCommandParser2 extends Disposable {
  static {
    __name(this, "TreeSitterCommandParser");
  }
  constructor(_treeSitterLibraryService) {
    super();
    this._treeSitterLibraryService = _treeSitterLibraryService;
    this._treeCache = this._register(new TreeCache());
    this._commandFileWriteParsers = [
      new SedFileWriteParser()
    ];
    this._parser = new Lazy(() => this._treeSitterLibraryService.getParserClass().then((ParserCtor) => new ParserCtor()));
  }
  async extractSubCommands(languageId, commandLine) {
    const captures = await this._queryTree(languageId, commandLine, "(command) @command");
    return captures.map((e) => e.node.text);
  }
  async extractPwshDoubleAmpersandChainOperators(commandLine) {
    const captures = await this._queryTree("powershell", commandLine, [
      "(",
      "  (pipeline",
      "    (pipeline_chain_tail) @double.ampersand)",
      ")"
    ].join("\n"));
    return captures;
  }
  async getFileWrites(languageId, commandLine) {
    let query;
    switch (languageId) {
      case "bash":
        query = [
          "(file_redirect",
          "  destination: [(word) (string (string_content)) (raw_string) (concatenation)] @file)"
        ].join("\n");
        break;
      case "powershell":
        query = [
          "(redirection",
          "  (redirected_file_name) @file)"
        ].join("\n");
        break;
    }
    const captures = await this._queryTree(languageId, commandLine, query);
    return captures.map((e) => e.node.text.trim());
  }
  /**
   * Extracts file targets from commands that perform file writes beyond shell redirections.
   * Uses registered command parsers (e.g., for `sed -i`) to detect command-specific file writes.
   * Returns an array of file paths that would be modified.
   */
  async getCommandFileWrites(languageId, commandLine) {
    if (languageId !== "bash") {
      return [];
    }
    const query = "(command) @command";
    const captures = await this._queryTree(languageId, commandLine, query);
    const result = [];
    for (const capture of captures) {
      const commandText = capture.node.text;
      for (const parser of this._commandFileWriteParsers) {
        if (parser.canHandle(commandText)) {
          result.push(...parser.extractFileWrites(commandText));
        }
      }
    }
    return result;
  }
  async _queryTree(languageId, commandLine, querySource) {
    const { tree, query } = await this._doQuery(languageId, commandLine, querySource);
    return query.captures(tree.rootNode);
  }
  async _doQuery(languageId, commandLine, querySource) {
    const language = await this._treeSitterLibraryService.getLanguagePromise(languageId);
    if (!language) {
      throw new BugIndicatingError("Failed to fetch language grammar");
    }
    let tree = this._treeCache.get(languageId, commandLine);
    if (!tree) {
      const parser = await this._parser.value;
      parser.setLanguage(language);
      const parsedTree = parser.parse(commandLine);
      if (!parsedTree) {
        throw new ErrorNoTelemetry("Failed to parse tree");
      }
      tree = parsedTree;
      this._treeCache.set(languageId, commandLine, tree);
    }
    const query = await this._treeSitterLibraryService.createQuery(language, querySource);
    if (!query) {
      throw new BugIndicatingError("Failed to create tree sitter query");
    }
    return { tree, query };
  }
};
TreeSitterCommandParser = __decorate([
  __param(0, ITreeSitterLibraryService)
], TreeSitterCommandParser);
class TreeCache extends Disposable {
  static {
    __name(this, "TreeCache");
  }
  constructor() {
    super();
    this._cache = /* @__PURE__ */ new Map();
    this._clearScheduler = this._register(new MutableDisposable());
    this._register(toDisposable(() => this._cache.clear()));
  }
  get(languageId, commandLine) {
    this._resetClearTimer();
    return this._cache.get(this._getCacheKey(languageId, commandLine));
  }
  set(languageId, commandLine, tree) {
    this._resetClearTimer();
    this._cache.set(this._getCacheKey(languageId, commandLine), tree);
  }
  _getCacheKey(languageId, commandLine) {
    return `${languageId}:${commandLine}`;
  }
  _resetClearTimer() {
    this._clearScheduler.value = new RunOnceScheduler(() => {
      this._cache.clear();
    }, 1e4);
    this._clearScheduler.value.schedule();
  }
}
export {
  TreeSitterCommandParser,
  TreeSitterCommandParserLanguage
};
//# sourceMappingURL=treeSitterCommandParser.js.map
