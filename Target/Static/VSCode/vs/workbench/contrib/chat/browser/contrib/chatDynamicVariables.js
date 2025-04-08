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
import { coalesce, groupBy } from "../../../../../base/common/arrays.js";
import { assertNever } from "../../../../../base/common/assert.js";
import { timeout } from "../../../../../base/common/async.js";
import { CancellationToken } from "../../../../../base/common/cancellation.js";
import { Codicon } from "../../../../../base/common/codicons.js";
import { isCancellationError } from "../../../../../base/common/errors.js";
import * as glob from "../../../../../base/common/glob.js";
import { IMarkdownString, MarkdownString } from "../../../../../base/common/htmlContent.js";
import { Disposable, DisposableStore } from "../../../../../base/common/lifecycle.js";
import { ResourceSet } from "../../../../../base/common/map.js";
import { basename, dirname, joinPath, relativePath } from "../../../../../base/common/resources.js";
import { ThemeIcon } from "../../../../../base/common/themables.js";
import { URI } from "../../../../../base/common/uri.js";
import { IRange, Range } from "../../../../../editor/common/core/range.js";
import { IDecorationOptions } from "../../../../../editor/common/editorCommon.js";
import { Command, isLocation } from "../../../../../editor/common/languages.js";
import { ITextModelService } from "../../../../../editor/common/services/resolverService.js";
import { localize } from "../../../../../nls.js";
import { Action2, registerAction2 } from "../../../../../platform/actions/common/actions.js";
import { ICommandService } from "../../../../../platform/commands/common/commands.js";
import { IConfigurationService } from "../../../../../platform/configuration/common/configuration.js";
import { FileType, IFileService } from "../../../../../platform/files/common/files.js";
import { IInstantiationService, ServicesAccessor } from "../../../../../platform/instantiation/common/instantiation.js";
import { ILabelService } from "../../../../../platform/label/common/label.js";
import { ILogService } from "../../../../../platform/log/common/log.js";
import { IMarkerService, MarkerSeverity } from "../../../../../platform/markers/common/markers.js";
import { PromptsConfig } from "../../../../../platform/prompts/common/config.js";
import { IQuickInputService, IQuickPickItem, IQuickPickSeparator } from "../../../../../platform/quickinput/common/quickInput.js";
import { IUriIdentityService } from "../../../../../platform/uriIdentity/common/uriIdentity.js";
import { IWorkspaceContextService } from "../../../../../platform/workspace/common/workspace.js";
import { getExcludes, IFileQuery, ISearchComplete, ISearchConfiguration, ISearchService, QueryType } from "../../../../services/search/common/search.js";
import { ISymbolQuickPickItem } from "../../../search/browser/symbolsQuickAccess.js";
import { IDiagnosticVariableEntryFilterData } from "../../common/chatModel.js";
import { IChatRequestProblemsVariable, IChatRequestVariableValue, IDynamicVariable } from "../../common/chatVariables.js";
import { IChatWidget } from "../chat.js";
import { ChatWidget, IChatWidgetContrib } from "../chatWidget.js";
import { ChatFileReference } from "./chatDynamicVariables/chatFileReference.js";
const dynamicVariableDecorationType = "chat-dynamic-variable";
function changeIsBeforeVariable(changeRange, variableRange) {
  return changeRange.endLineNumber < variableRange.startLineNumber || changeRange.endLineNumber === variableRange.startLineNumber && changeRange.endColumn <= variableRange.startColumn;
}
__name(changeIsBeforeVariable, "changeIsBeforeVariable");
function changeIsAfterVariable(changeRange, variableRange) {
  return changeRange.startLineNumber > variableRange.endLineNumber || changeRange.startLineNumber === variableRange.endLineNumber && changeRange.startColumn >= variableRange.endColumn;
}
__name(changeIsAfterVariable, "changeIsAfterVariable");
let ChatDynamicVariableModel = class extends Disposable {
  constructor(widget, labelService, configService, instantiationService) {
    super();
    this.widget = widget;
    this.labelService = labelService;
    this.configService = configService;
    this.instantiationService = instantiationService;
    this._register(widget.inputEditor.onDidChangeModelContent((e) => {
      e.changes.forEach((c) => {
        this._variables = coalesce(this._variables.map((ref) => {
          const intersection = Range.intersectRanges(ref.range, c.range);
          if (intersection && !intersection.isEmpty()) {
            if (!Range.containsRange(c.range, ref.range)) {
              const rangeToDelete = new Range(ref.range.startLineNumber, ref.range.startColumn, ref.range.endLineNumber, ref.range.endColumn - 1);
              this.widget.inputEditor.executeEdits(this.id, [{
                range: rangeToDelete,
                text: ""
              }]);
              this.widget.refreshParsedInput();
            }
            if ("dispose" in ref && typeof ref.dispose === "function") {
              ref.dispose();
            }
            return null;
          } else if (Range.compareRangesUsingStarts(ref.range, c.range) > 0) {
            if (changeIsBeforeVariable(c.range, ref.range)) {
              const linesInserted = c.text.split("\n").length - 1;
              const linesRemoved = c.range.endLineNumber - c.range.startLineNumber;
              const lineDelta = linesInserted - linesRemoved;
              let columnDelta = 0;
              if (c.range.endLineNumber === ref.range.startLineNumber) {
                if (c.range.endColumn <= ref.range.startColumn) {
                  if (linesInserted === 0) {
                    const charsInserted = c.text.length;
                    const charsRemoved = c.rangeLength;
                    columnDelta = charsInserted - charsRemoved;
                  } else {
                    columnDelta = -(c.range.endColumn - 1);
                  }
                } else {
                  columnDelta = 0;
                }
              } else if (c.range.endLineNumber < ref.range.startLineNumber) {
                columnDelta = 0;
              }
              const newRange = {
                startLineNumber: ref.range.startLineNumber + lineDelta,
                startColumn: ref.range.startColumn + columnDelta,
                endLineNumber: ref.range.endLineNumber + lineDelta,
                endColumn: ref.range.endColumn + columnDelta
              };
              if (ref instanceof ChatFileReference) {
                ref.range = newRange;
                return ref;
              } else {
                return {
                  ...ref,
                  range: newRange
                };
              }
            } else if (changeIsAfterVariable(c.range, ref.range)) {
              return ref;
            } else {
              return null;
            }
          }
          return ref;
        }));
      });
      this.updateDecorations();
    }));
  }
  static {
    __name(this, "ChatDynamicVariableModel");
  }
  static ID = "chatDynamicVariableModel";
  _variables = [];
  get variables() {
    return [...this._variables];
  }
  get id() {
    return ChatDynamicVariableModel.ID;
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
    this.widget.inputEditor.setDecorationsByType("chat", dynamicVariableDecorationType, this._variables.map((r) => ({
      range: r.range,
      hoverMessage: this.getHoverForReference(r)
    })));
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
      if ("dispose" in variable && typeof variable.dispose === "function") {
        variable.dispose();
      }
    }
  }
  dispose() {
    this.disposeVariables();
    super.dispose();
  }
};
ChatDynamicVariableModel = __decorateClass([
  __decorateParam(1, ILabelService),
  __decorateParam(2, IConfigurationService),
  __decorateParam(3, IInstantiationService)
], ChatDynamicVariableModel);
function isDynamicVariable(obj) {
  return obj && typeof obj.id === "string" && Range.isIRange(obj.range) && "data" in obj;
}
__name(isDynamicVariable, "isDynamicVariable");
ChatWidget.CONTRIBS.push(ChatDynamicVariableModel);
function isSelectAndInsertActionContext(context) {
  return "widget" in context && "range" in context;
}
__name(isSelectAndInsertActionContext, "isSelectAndInsertActionContext");
class SelectAndInsertFileAction extends Action2 {
  static {
    __name(this, "SelectAndInsertFileAction");
  }
  static Name = "files";
  static Item = {
    label: localize("allFiles", "All Files"),
    description: localize("allFilesDescription", "Search for relevant files in the workspace and provide context from them")
  };
  static ID = "workbench.action.chat.selectAndInsertFile";
  constructor() {
    super({
      id: SelectAndInsertFileAction.ID,
      title: ""
      // not displayed
    });
  }
  async run(accessor, ...args) {
    const textModelService = accessor.get(ITextModelService);
    const logService = accessor.get(ILogService);
    const quickInputService = accessor.get(IQuickInputService);
    const context = args[0];
    if (!isSelectAndInsertActionContext(context)) {
      return;
    }
    const doCleanup = /* @__PURE__ */ __name(() => {
      context.widget.inputEditor.executeEdits("chatInsertFile", [{ range: context.range, text: `` }]);
    }, "doCleanup");
    await timeout(0);
    const picks = await quickInputService.quickAccess.pick("");
    if (!picks?.length) {
      logService.trace("SelectAndInsertFileAction: no file selected");
      doCleanup();
      return;
    }
    const editor = context.widget.inputEditor;
    const range = context.range;
    if (picks[0] === SelectAndInsertFileAction.Item) {
      const text2 = `#${SelectAndInsertFileAction.Name}`;
      const success2 = editor.executeEdits("chatInsertFile", [{ range, text: text2 + " " }]);
      if (!success2) {
        logService.trace(`SelectAndInsertFileAction: failed to insert "${text2}"`);
        doCleanup();
      }
      return;
    }
    const resource = picks[0].resource;
    if (!textModelService.canHandleResource(resource)) {
      logService.trace("SelectAndInsertFileAction: non-text resource selected");
      doCleanup();
      return;
    }
    const fileName = basename(resource);
    const text = `#file:${fileName}`;
    const success = editor.executeEdits("chatInsertFile", [{ range, text: text + " " }]);
    if (!success) {
      logService.trace(`SelectAndInsertFileAction: failed to insert "${text}"`);
      doCleanup();
      return;
    }
    context.widget.getContrib(ChatDynamicVariableModel.ID)?.addReference({
      id: "vscode.file",
      isFile: true,
      prefix: "file",
      range: { startLineNumber: range.startLineNumber, startColumn: range.startColumn, endLineNumber: range.endLineNumber, endColumn: range.startColumn + text.length },
      data: resource
    });
  }
}
registerAction2(SelectAndInsertFileAction);
class SelectAndInsertFolderAction extends Action2 {
  static {
    __name(this, "SelectAndInsertFolderAction");
  }
  static Name = "folder";
  static ID = "workbench.action.chat.selectAndInsertFolder";
  constructor() {
    super({
      id: SelectAndInsertFolderAction.ID,
      title: ""
      // not displayed
    });
  }
  async run(accessor, ...args) {
    const logService = accessor.get(ILogService);
    const context = args[0];
    if (!isSelectAndInsertActionContext(context)) {
      return;
    }
    const doCleanup = /* @__PURE__ */ __name(() => {
      context.widget.inputEditor.executeEdits("chatInsertFolder", [{ range: context.range, text: `` }]);
    }, "doCleanup");
    const folder = await createFolderQuickPick(accessor);
    if (!folder) {
      logService.trace("SelectAndInsertFolderAction: no folder selected");
      doCleanup();
      return;
    }
    const editor = context.widget.inputEditor;
    const range = context.range;
    const folderName = basename(folder);
    const text = `#folder:${folderName}`;
    const success = editor.executeEdits("chatInsertFolder", [{ range, text: text + " " }]);
    if (!success) {
      logService.trace(`SelectAndInsertFolderAction: failed to insert "${text}"`);
      doCleanup();
      return;
    }
    context.widget.getContrib(ChatDynamicVariableModel.ID)?.addReference({
      id: "vscode.folder",
      isFile: false,
      isDirectory: true,
      prefix: "folder",
      range: { startLineNumber: range.startLineNumber, startColumn: range.startColumn, endLineNumber: range.endLineNumber, endColumn: range.startColumn + text.length },
      data: folder
    });
  }
}
registerAction2(SelectAndInsertFolderAction);
async function createFolderQuickPick(accessor) {
  const quickInputService = accessor.get(IQuickInputService);
  const searchService = accessor.get(ISearchService);
  const configurationService = accessor.get(IConfigurationService);
  const workspaceService = accessor.get(IWorkspaceContextService);
  const fileService = accessor.get(IFileService);
  const labelService = accessor.get(ILabelService);
  const workspaces = workspaceService.getWorkspace().folders.map((folder) => folder.uri);
  const topLevelFolderItems = (await getTopLevelFolders(workspaces, fileService)).map(createQuickPickItem);
  const quickPick = quickInputService.createQuickPick();
  quickPick.placeholder = "Search folder by name";
  quickPick.items = topLevelFolderItems;
  return await new Promise((_resolve) => {
    const disposables = new DisposableStore();
    const resolve = /* @__PURE__ */ __name((res) => {
      _resolve(res);
      disposables.dispose();
      quickPick.dispose();
    }, "resolve");
    disposables.add(quickPick.onDidChangeValue(async (value) => {
      if (value === "") {
        quickPick.items = topLevelFolderItems;
        return;
      }
      const workspaceFolders = await Promise.all(
        workspaces.map(
          (workspace) => searchFolders(
            workspace,
            value,
            true,
            void 0,
            void 0,
            configurationService,
            searchService
          )
        )
      );
      quickPick.items = workspaceFolders.flat().map(createQuickPickItem);
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
  function createQuickPickItem(folder) {
    return {
      type: "item",
      id: folder.toString(),
      resource: folder,
      alwaysShow: true,
      label: basename(folder),
      description: labelService.getUriLabel(dirname(folder), { relative: true }),
      iconClass: ThemeIcon.asClassName(Codicon.folder)
    };
  }
  __name(createQuickPickItem, "createQuickPickItem");
}
__name(createFolderQuickPick, "createFolderQuickPick");
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
async function searchFolders(workspace, pattern, fuzzyMatch, token, cacheKey, configurationService, searchService) {
  const segmentMatchPattern = caseInsensitiveGlobPattern(fuzzyMatch ? fuzzyMatchingGlobPattern(pattern) : continousMatchingGlobPattern(pattern));
  const searchExcludePattern = getExcludes(configurationService.getValue({ resource: workspace })) || {};
  const searchOptions = {
    folderQueries: [{
      folder: workspace,
      disregardIgnoreFiles: configurationService.getValue("explorer.excludeGitIgnore")
    }],
    type: QueryType.File,
    shouldGlobMatchFilePattern: true,
    cacheKey,
    excludePattern: searchExcludePattern
  };
  let folderResults;
  try {
    folderResults = await searchService.fileSearch({ ...searchOptions, filePattern: `**/${segmentMatchPattern}/**` }, token);
  } catch (e) {
    if (!isCancellationError(e)) {
      throw e;
    }
  }
  if (!folderResults || token?.isCancellationRequested) {
    return [];
  }
  const folderResources = getMatchingFoldersFromFiles(folderResults.results.map((result) => result.resource), workspace, segmentMatchPattern);
  return folderResources;
}
__name(searchFolders, "searchFolders");
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
class SelectAndInsertSymAction extends Action2 {
  static {
    __name(this, "SelectAndInsertSymAction");
  }
  static Name = "symbols";
  static ID = "workbench.action.chat.selectAndInsertSym";
  constructor() {
    super({
      id: SelectAndInsertSymAction.ID,
      title: ""
      // not displayed
    });
  }
  async run(accessor, ...args) {
    const textModelService = accessor.get(ITextModelService);
    const logService = accessor.get(ILogService);
    const quickInputService = accessor.get(IQuickInputService);
    const context = args[0];
    if (!isSelectAndInsertActionContext(context)) {
      return;
    }
    const doCleanup = /* @__PURE__ */ __name(() => {
      context.widget.inputEditor.executeEdits("chatInsertSym", [{ range: context.range, text: `` }]);
    }, "doCleanup");
    await timeout(0);
    const picks = await quickInputService.quickAccess.pick("#", { enabledProviderPrefixes: ["#"] });
    if (!picks?.length) {
      logService.trace("SelectAndInsertSymAction: no symbol selected");
      doCleanup();
      return;
    }
    const editor = context.widget.inputEditor;
    const range = context.range;
    const symbol = picks[0].symbol;
    if (!symbol || !textModelService.canHandleResource(symbol.location.uri)) {
      logService.trace("SelectAndInsertSymAction: non-text resource selected");
      doCleanup();
      return;
    }
    const text = `#sym:${symbol.name}`;
    const success = editor.executeEdits("chatInsertSym", [{ range, text: text + " " }]);
    if (!success) {
      logService.trace(`SelectAndInsertSymAction: failed to insert "${text}"`);
      doCleanup();
      return;
    }
    context.widget.getContrib(ChatDynamicVariableModel.ID)?.addReference({
      id: "vscode.symbol",
      prefix: "symbol",
      range: { startLineNumber: range.startLineNumber, startColumn: range.startColumn, endLineNumber: range.endLineNumber, endColumn: range.startColumn + text.length },
      data: symbol.location
    });
  }
}
registerAction2(SelectAndInsertSymAction);
function isAddDynamicVariableContext(context) {
  return "widget" in context && "range" in context && "variableData" in context;
}
__name(isAddDynamicVariableContext, "isAddDynamicVariableContext");
class AddDynamicVariableAction extends Action2 {
  static {
    __name(this, "AddDynamicVariableAction");
  }
  static ID = "workbench.action.chat.addDynamicVariable";
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
      prefix: "file",
      data: variableData
    });
  }
}
registerAction2(AddDynamicVariableAction);
async function createMarkersQuickPick(accessor, level, onBackgroundAccept) {
  const markers = accessor.get(IMarkerService).read({ severities: MarkerSeverity.Error | MarkerSeverity.Warning | MarkerSeverity.Info });
  if (!markers.length) {
    return;
  }
  const uriIdentityService = accessor.get(IUriIdentityService);
  const labelService = accessor.get(ILabelService);
  const grouped = groupBy(markers, (a, b) => uriIdentityService.extUri.compare(a.resource, b.resource));
  const severities = /* @__PURE__ */ new Set();
  const items = [];
  let pickCount = 0;
  for (const group of grouped) {
    const resource = group[0].resource;
    if (level === "problem") {
      items.push({ type: "separator", label: labelService.getUriLabel(resource, { relative: true }) });
      for (const marker of group) {
        pickCount++;
        severities.add(marker.severity);
        items.push({
          type: "item",
          resource: marker.resource,
          label: marker.message,
          description: localize("markers.panel.at.ln.col.number", "[Ln {0}, Col {1}]", "" + marker.startLineNumber, "" + marker.startColumn),
          entry: IDiagnosticVariableEntryFilterData.fromMarker(marker)
        });
      }
    } else if (level === "file") {
      const entry = { filterUri: resource };
      pickCount++;
      items.push({
        type: "item",
        resource,
        label: IDiagnosticVariableEntryFilterData.label(entry),
        description: group[0].message + (group.length > 1 ? localize("problemsMore", "+ {0} more", group.length - 1) : ""),
        entry
      });
      for (const marker of group) {
        severities.add(marker.severity);
      }
    } else {
      assertNever(level);
    }
  }
  if (pickCount < 2) {
    return items.find((i) => i.type === "item")?.entry;
  }
  if (level === "file") {
    items.unshift({ type: "separator", label: localize("markers.panel.files", "Files") });
  }
  items.unshift({ type: "item", label: localize("markers.panel.allErrors", "All Problems"), entry: { filterSeverity: MarkerSeverity.Info } });
  const quickInputService = accessor.get(IQuickInputService);
  const store = new DisposableStore();
  const quickPick = store.add(quickInputService.createQuickPick({ useSeparators: true }));
  quickPick.canAcceptInBackground = !onBackgroundAccept;
  quickPick.placeholder = localize("pickAProblem", "Pick a problem to attach...");
  quickPick.items = items;
  return new Promise((resolve) => {
    store.add(quickPick.onDidHide(() => resolve(void 0)));
    store.add(quickPick.onDidAccept((ev) => {
      if (ev.inBackground) {
        onBackgroundAccept?.(quickPick.selectedItems.map((i) => i.entry));
      } else {
        resolve(quickPick.selectedItems[0]?.entry);
        quickPick.dispose();
      }
    }));
    quickPick.show();
  }).finally(() => store.dispose());
}
__name(createMarkersQuickPick, "createMarkersQuickPick");
class SelectAndInsertProblemAction extends Action2 {
  static {
    __name(this, "SelectAndInsertProblemAction");
  }
  static Name = "problems";
  static ID = "workbench.action.chat.selectAndInsertProblems";
  constructor() {
    super({
      id: SelectAndInsertProblemAction.ID,
      title: ""
      // not displayed
    });
  }
  async run(accessor, ...args) {
    const logService = accessor.get(ILogService);
    const context = args[0];
    if (!isSelectAndInsertActionContext(context)) {
      return;
    }
    const doCleanup = /* @__PURE__ */ __name(() => {
      context.widget.inputEditor.executeEdits("chatInsertProblems", [{ range: context.range, text: `` }]);
    }, "doCleanup");
    const pick = await createMarkersQuickPick(accessor, "file");
    if (!pick) {
      doCleanup();
      return;
    }
    const editor = context.widget.inputEditor;
    const originalRange = context.range;
    const insertText = `#${SelectAndInsertProblemAction.Name}:${pick.filterUri ? basename(pick.filterUri) : MarkerSeverity.toString(pick.filterSeverity)}`;
    const varRange = new Range(originalRange.startLineNumber, originalRange.startColumn, originalRange.endLineNumber, originalRange.startColumn + insertText.length);
    const success = editor.executeEdits("chatInsertProblems", [{ range: varRange, text: insertText + " " }]);
    if (!success) {
      logService.trace(`SelectAndInsertProblemsAction: failed to insert "${insertText}"`);
      doCleanup();
      return;
    }
    context.widget.getContrib(ChatDynamicVariableModel.ID)?.addReference({
      id: "vscode.problems",
      prefix: SelectAndInsertProblemAction.Name,
      range: varRange,
      data: { id: "vscode.problems", filter: pick }
    });
  }
}
registerAction2(SelectAndInsertProblemAction);
export {
  AddDynamicVariableAction,
  ChatDynamicVariableModel,
  SelectAndInsertFileAction,
  SelectAndInsertFolderAction,
  SelectAndInsertProblemAction,
  SelectAndInsertSymAction,
  createFolderQuickPick,
  createMarkersQuickPick,
  dynamicVariableDecorationType,
  getTopLevelFolders,
  searchFolders
};
//# sourceMappingURL=chatDynamicVariables.js.map
