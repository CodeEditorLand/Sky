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
var ChatDynamicVariableModel_1;
import { coalesce } from "../../../../../base/common/arrays.js";
import { Codicon } from "../../../../../base/common/codicons.js";
import { isCancellationError } from "../../../../../base/common/errors.js";
import * as glob from "../../../../../base/common/glob.js";
import { MarkdownString } from "../../../../../base/common/htmlContent.js";
import { Disposable, DisposableStore, dispose, isDisposable } from "../../../../../base/common/lifecycle.js";
import { ResourceSet } from "../../../../../base/common/map.js";
import { basename, dirname, extUri, joinPath, relativePath } from "../../../../../base/common/resources.js";
import { ThemeIcon } from "../../../../../base/common/themables.js";
import { URI } from "../../../../../base/common/uri.js";
import { Range } from "../../../../../editor/common/core/range.js";
import { isLocation } from "../../../../../editor/common/languages.js";
import { ILanguageService } from "../../../../../editor/common/languages/language.js";
import { getIconClasses } from "../../../../../editor/common/services/getIconClasses.js";
import { IModelService } from "../../../../../editor/common/services/model.js";
import { Action2, registerAction2 } from "../../../../../platform/actions/common/actions.js";
import { ICommandService } from "../../../../../platform/commands/common/commands.js";
import { IConfigurationService } from "../../../../../platform/configuration/common/configuration.js";
import { FileKind, FileType, IFileService } from "../../../../../platform/files/common/files.js";
import { IInstantiationService } from "../../../../../platform/instantiation/common/instantiation.js";
import { ILabelService } from "../../../../../platform/label/common/label.js";
import { PromptsConfig } from "../../../../../platform/prompts/common/config.js";
import { IQuickInputService } from "../../../../../platform/quickinput/common/quickInput.js";
import { IWorkspaceContextService } from "../../../../../platform/workspace/common/workspace.js";
import { IHistoryService } from "../../../../services/history/common/history.js";
import { getExcludes, ISearchService } from "../../../../services/search/common/search.js";
import { ChatWidget } from "../chatWidget.js";
import { ChatFileReference } from "./chatDynamicVariables/chatFileReference.js";
const dynamicVariableDecorationType = "chat-dynamic-variable";
let ChatDynamicVariableModel = class ChatDynamicVariableModel2 extends Disposable {
  static {
    __name(this, "ChatDynamicVariableModel");
  }
  static {
    ChatDynamicVariableModel_1 = this;
  }
  static {
    this.ID = "chatDynamicVariableModel";
  }
  get variables() {
    return [...this._variables];
  }
  get id() {
    return ChatDynamicVariableModel_1.ID;
  }
  constructor(widget, labelService, configService, instantiationService) {
    super();
    this.widget = widget;
    this.labelService = labelService;
    this.configService = configService;
    this.instantiationService = instantiationService;
    this._variables = [];
    this.decorationData = [];
    this._register(widget.inputEditor.onDidChangeModelContent((e) => {
      const removed = [];
      let didChange = false;
      this._variables = coalesce(this._variables.map((ref, idx) => {
        const model = widget.inputEditor.getModel();
        if (!model) {
          removed.push(ref);
          return null;
        }
        const data = this.decorationData[idx];
        const newRange = model.getDecorationRange(data.id);
        if (!newRange) {
          removed.push(ref);
          return null;
        }
        const newText = model.getValueInRange(newRange);
        if (newText !== data.text) {
          this.widget.inputEditor.executeEdits(this.id, [{
            range: newRange,
            text: ""
          }]);
          this.widget.refreshParsedInput();
          removed.push(ref);
          return null;
        }
        if (newRange.equalsRange(ref.range)) {
          return ref;
        }
        didChange = true;
        if (ref instanceof ChatFileReference) {
          ref.range = newRange;
          return ref;
        } else {
          return { ...ref, range: newRange };
        }
      }));
      dispose(removed.filter(isDisposable));
      if (didChange || removed.length > 0) {
        this.widget.refreshParsedInput();
      }
      this.updateDecorations();
    }));
  }
  getInputState() {
    return this.variables.map((variable) => {
      if (variable instanceof ChatFileReference) {
        return variable.reference;
      }
      return variable;
    });
  }
  setInputState(s) {
    if (!Array.isArray(s)) {
      s = [];
    }
    this.disposeVariables();
    this._variables = [];
    for (const variable of s) {
      if (!isDynamicVariable(variable)) {
        continue;
      }
      this.addReference(variable);
    }
  }
  addReference(ref) {
    const promptSnippetsEnabled = PromptsConfig.enabled(this.configService);
    const variable = ref.id === "vscode.file" && promptSnippetsEnabled ? this.instantiationService.createInstance(ChatFileReference, ref) : ref;
    this._variables.push(variable);
    this.updateDecorations();
    this.widget.refreshParsedInput();
    if (variable instanceof ChatFileReference && variable.isPromptFile) {
      variable.onUpdate(() => {
        this.updateDecorations();
      });
      variable.start();
    }
  }
  updateDecorations() {
    const decorationIds = this.widget.inputEditor.setDecorationsByType("chat", dynamicVariableDecorationType, this._variables.map((r) => ({
      range: r.range,
      hoverMessage: this.getHoverForReference(r)
    })));
    this.decorationData = [];
    for (let i = 0; i < decorationIds.length; i++) {
      this.decorationData.push({
        id: decorationIds[i],
        text: this.widget.inputEditor.getModel().getValueInRange(this._variables[i].range)
      });
    }
  }
  getHoverForReference(ref) {
    const value = ref.data;
    if (URI.isUri(value)) {
      return new MarkdownString(this.labelService.getUriLabel(value, { relative: true }));
    } else if (isLocation(value)) {
      const prefix = ref.fullName ? ` ${ref.fullName}` : "";
      const rangeString = `#${value.range.startLineNumber}-${value.range.endLineNumber}`;
      return new MarkdownString(prefix + this.labelService.getUriLabel(value.uri, { relative: true }) + rangeString);
    } else {
      return void 0;
    }
  }
  /**
   * Dispose all existing variables.
   */
  disposeVariables() {
    for (const variable of this._variables) {
      if (isDisposable(variable)) {
        variable.dispose();
      }
    }
  }
  dispose() {
    this.disposeVariables();
    super.dispose();
  }
};
ChatDynamicVariableModel = ChatDynamicVariableModel_1 = __decorate([
  __param(1, ILabelService),
  __param(2, IConfigurationService),
  __param(3, IInstantiationService)
], ChatDynamicVariableModel);
function isDynamicVariable(obj) {
  return obj && typeof obj.id === "string" && Range.isIRange(obj.range) && "data" in obj;
}
__name(isDynamicVariable, "isDynamicVariable");
ChatWidget.CONTRIBS.push(ChatDynamicVariableModel);
async function createFilesAndFolderQuickPick(accessor) {
  const quickInputService = accessor.get(IQuickInputService);
  const searchService = accessor.get(ISearchService);
  const configurationService = accessor.get(IConfigurationService);
  const workspaceService = accessor.get(IWorkspaceContextService);
  const fileService = accessor.get(IFileService);
  const labelService = accessor.get(ILabelService);
  const modelService = accessor.get(IModelService);
  const languageService = accessor.get(ILanguageService);
  const historyService = accessor.get(IHistoryService);
  const workspaces = workspaceService.getWorkspace().folders.map((folder) => folder.uri);
  const defaultItems = [];
  (await getTopLevelFolders(workspaces, fileService)).forEach((uri) => defaultItems.push(createQuickPickItem(uri, FileKind.FOLDER)));
  historyService.getHistory().filter((a) => a.resource).slice(0, 30).forEach((uri) => defaultItems.push(createQuickPickItem(uri.resource, FileKind.FILE)));
  defaultItems.sort((a, b) => extUri.compare(a.resource, b.resource));
  const quickPick = quickInputService.createQuickPick();
  quickPick.placeholder = "Search file or folder by name";
  quickPick.items = defaultItems;
  return await new Promise((_resolve) => {
    const disposables = new DisposableStore();
    const resolve = /* @__PURE__ */ __name((res) => {
      _resolve(res);
      disposables.dispose();
      quickPick.dispose();
    }, "resolve");
    disposables.add(quickPick.onDidChangeValue(async (value) => {
      if (value === "") {
        quickPick.items = defaultItems;
        return;
      }
      const picks = [];
      await Promise.all(workspaces.map(async (workspace) => {
        const result = await searchFilesAndFolders(workspace, value, true, void 0, void 0, configurationService, searchService);
        for (const folder of result.folders) {
          picks.push(createQuickPickItem(folder, FileKind.FOLDER));
        }
        for (const file of result.files) {
          picks.push(createQuickPickItem(file, FileKind.FILE));
        }
      }));
      quickPick.items = picks.sort((a, b) => extUri.compare(a.resource, b.resource));
    }));
    disposables.add(quickPick.onDidAccept((e) => {
      const value = quickPick.selectedItems[0]?.resource;
      resolve(value);
    }));
    disposables.add(quickPick.onDidHide(() => {
      resolve(void 0);
    }));
    quickPick.show();
  });
  function createQuickPickItem(resource, kind) {
    return {
      resource,
      kind,
      id: resource.toString(),
      alwaysShow: true,
      label: basename(resource),
      description: labelService.getUriLabel(dirname(resource), { relative: true }),
      iconClasses: kind === FileKind.FILE ? getIconClasses(modelService, languageService, resource, FileKind.FILE) : void 0,
      iconClass: kind === FileKind.FOLDER ? ThemeIcon.asClassName(Codicon.folder) : void 0
    };
  }
  __name(createQuickPickItem, "createQuickPickItem");
}
__name(createFilesAndFolderQuickPick, "createFilesAndFolderQuickPick");
async function getTopLevelFolders(workspaces, fileService) {
  const folders = [];
  for (const workspace of workspaces) {
    const fileSystemProvider = fileService.getProvider(workspace.scheme);
    if (!fileSystemProvider) {
      continue;
    }
    const entries = await fileSystemProvider.readdir(workspace);
    for (const [name, type] of entries) {
      const entryResource = joinPath(workspace, name);
      if (type === FileType.Directory) {
        folders.push(entryResource);
      }
    }
  }
  return folders;
}
__name(getTopLevelFolders, "getTopLevelFolders");
async function searchFilesAndFolders(workspace, pattern, fuzzyMatch, token, cacheKey, configurationService, searchService) {
  const segmentMatchPattern = caseInsensitiveGlobPattern(fuzzyMatch ? fuzzyMatchingGlobPattern(pattern) : continousMatchingGlobPattern(pattern));
  const searchExcludePattern = getExcludes(configurationService.getValue({ resource: workspace })) || {};
  const searchOptions = {
    folderQueries: [{
      folder: workspace,
      disregardIgnoreFiles: configurationService.getValue("explorer.excludeGitIgnore")
    }],
    type: 1,
    shouldGlobMatchFilePattern: true,
    cacheKey,
    excludePattern: searchExcludePattern,
    sortByScore: true
  };
  let searchResult;
  try {
    searchResult = await searchService.fileSearch({ ...searchOptions, filePattern: `{**/${segmentMatchPattern}/**,${pattern}}` }, token);
  } catch (e) {
    if (!isCancellationError(e)) {
      throw e;
    }
  }
  if (!searchResult || token?.isCancellationRequested) {
    return { files: [], folders: [] };
  }
  const fileResources = searchResult.results.map((result) => result.resource);
  const folderResources = getMatchingFoldersFromFiles(fileResources, workspace, segmentMatchPattern);
  return { folders: folderResources, files: fileResources };
}
__name(searchFilesAndFolders, "searchFilesAndFolders");
function fuzzyMatchingGlobPattern(pattern) {
  if (!pattern) {
    return "*";
  }
  return "*" + pattern.split("").join("*") + "*";
}
__name(fuzzyMatchingGlobPattern, "fuzzyMatchingGlobPattern");
function continousMatchingGlobPattern(pattern) {
  if (!pattern) {
    return "*";
  }
  return "*" + pattern + "*";
}
__name(continousMatchingGlobPattern, "continousMatchingGlobPattern");
function caseInsensitiveGlobPattern(pattern) {
  let caseInsensitiveFilePattern = "";
  for (let i = 0; i < pattern.length; i++) {
    const char = pattern[i];
    if (/[a-zA-Z]/.test(char)) {
      caseInsensitiveFilePattern += `[${char.toLowerCase()}${char.toUpperCase()}]`;
    } else {
      caseInsensitiveFilePattern += char;
    }
  }
  return caseInsensitiveFilePattern;
}
__name(caseInsensitiveGlobPattern, "caseInsensitiveGlobPattern");
function getMatchingFoldersFromFiles(resources, workspace, segmentMatchPattern) {
  const uniqueFolders = new ResourceSet();
  for (const resource of resources) {
    const relativePathToRoot = relativePath(workspace, resource);
    if (!relativePathToRoot) {
      throw new Error("Resource is not a child of the workspace");
    }
    let dirResource = workspace;
    const stats = relativePathToRoot.split("/").slice(0, -1);
    for (const stat of stats) {
      dirResource = dirResource.with({ path: `${dirResource.path}/${stat}` });
      uniqueFolders.add(dirResource);
    }
  }
  const matchingFolders = [];
  for (const folderResource of uniqueFolders) {
    const stats = folderResource.path.split("/");
    const dirStat = stats[stats.length - 1];
    if (!dirStat || !glob.match(segmentMatchPattern, dirStat)) {
      continue;
    }
    matchingFolders.push(folderResource);
  }
  return matchingFolders;
}
__name(getMatchingFoldersFromFiles, "getMatchingFoldersFromFiles");
function isAddDynamicVariableContext(context) {
  return "widget" in context && "range" in context && "variableData" in context;
}
__name(isAddDynamicVariableContext, "isAddDynamicVariableContext");
class AddDynamicVariableAction extends Action2 {
  static {
    __name(this, "AddDynamicVariableAction");
  }
  static {
    this.ID = "workbench.action.chat.addDynamicVariable";
  }
  constructor() {
    super({
      id: AddDynamicVariableAction.ID,
      title: ""
      // not displayed
    });
  }
  async run(accessor, ...args) {
    const context = args[0];
    if (!isAddDynamicVariableContext(context)) {
      return;
    }
    let range = context.range;
    const variableData = context.variableData;
    const doCleanup = /* @__PURE__ */ __name(() => {
      context.widget.inputEditor.executeEdits("chatInsertDynamicVariableWithArguments", [{ range: context.range, text: `` }]);
    }, "doCleanup");
    if (context.command) {
      const commandService = accessor.get(ICommandService);
      const selection = await commandService.executeCommand(context.command.id, ...context.command.arguments ?? []);
      if (!selection) {
        doCleanup();
        return;
      }
      const insertText = ":" + selection;
      const insertRange = new Range(range.startLineNumber, range.endColumn, range.endLineNumber, range.endColumn + insertText.length);
      range = new Range(range.startLineNumber, range.startColumn, range.endLineNumber, range.endColumn + insertText.length);
      const editor = context.widget.inputEditor;
      const success = editor.executeEdits("chatInsertDynamicVariableWithArguments", [{ range: insertRange, text: insertText + " " }]);
      if (!success) {
        doCleanup();
        return;
      }
    }
    context.widget.getContrib(ChatDynamicVariableModel.ID)?.addReference({
      id: context.id,
      range,
      isFile: true,
      data: variableData
    });
  }
}
registerAction2(AddDynamicVariableAction);
export {
  AddDynamicVariableAction,
  ChatDynamicVariableModel,
  createFilesAndFolderQuickPick,
  dynamicVariableDecorationType,
  getTopLevelFolders,
  searchFilesAndFolders
};
//# sourceMappingURL=chatDynamicVariables.js.map
