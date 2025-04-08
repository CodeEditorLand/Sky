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
import { KeyCode, KeyMod } from "../../../../base/common/keyCodes.js";
import { extname, isEqual } from "../../../../base/common/resources.js";
import { URI } from "../../../../base/common/uri.js";
import { ServicesAccessor } from "../../../../editor/browser/editorExtensions.js";
import { Range } from "../../../../editor/common/core/range.js";
import { ToggleCaseSensitiveKeybinding, ToggleRegexKeybinding, ToggleWholeWordKeybinding } from "../../../../editor/contrib/find/browser/findModel.js";
import { localize, localize2 } from "../../../../nls.js";
import { Action2, MenuId, registerAction2 } from "../../../../platform/actions/common/actions.js";
import { CommandsRegistry } from "../../../../platform/commands/common/commands.js";
import { ContextKeyExpr, IContextKeyService } from "../../../../platform/contextkey/common/contextkey.js";
import { SyncDescriptor } from "../../../../platform/instantiation/common/descriptors.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { KeybindingWeight } from "../../../../platform/keybinding/common/keybindingsRegistry.js";
import { Registry } from "../../../../platform/registry/common/platform.js";
import { EditorPaneDescriptor, IEditorPaneRegistry } from "../../../browser/editor.js";
import { IWorkbenchContribution, WorkbenchPhase, registerWorkbenchContribution2 } from "../../../common/contributions.js";
import { IEditorSerializer, IEditorFactoryRegistry, EditorExtensions, DEFAULT_EDITOR_ASSOCIATION } from "../../../common/editor.js";
import { ActiveEditorContext } from "../../../common/contextkeys.js";
import { IViewsService } from "../../../services/views/common/viewsService.js";
import { getSearchView } from "../../search/browser/searchActionsBase.js";
import { searchNewEditorIcon, searchRefreshIcon } from "../../search/browser/searchIcons.js";
import * as SearchConstants from "../../search/common/constants.js";
import * as SearchEditorConstants from "./constants.js";
import { SearchEditor } from "./searchEditor.js";
import { createEditorFromSearchResult, modifySearchEditorContextLinesCommand, openNewSearchEditor, openSearchEditor, selectAllSearchEditorMatchesCommand, toggleSearchEditorCaseSensitiveCommand, toggleSearchEditorContextLinesCommand, toggleSearchEditorRegexCommand, toggleSearchEditorWholeWordCommand } from "./searchEditorActions.js";
import { getOrMakeSearchEditorInput, SearchEditorInput, SEARCH_EDITOR_EXT } from "./searchEditorInput.js";
import { IEditorService } from "../../../services/editor/common/editorService.js";
import { VIEW_ID } from "../../../services/search/common/search.js";
import { RegisteredEditorPriority, IEditorResolverService } from "../../../services/editor/common/editorResolverService.js";
import { IWorkingCopyEditorHandler, IWorkingCopyEditorService } from "../../../services/workingCopy/common/workingCopyEditorService.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
import { IWorkingCopyIdentifier } from "../../../services/workingCopy/common/workingCopy.js";
import { EditorInput } from "../../../common/editor/editorInput.js";
import { getActiveElement } from "../../../../base/browser/dom.js";
const OpenInEditorCommandId = "search.action.openInEditor";
const OpenNewEditorToSideCommandId = "search.action.openNewEditorToSide";
const FocusQueryEditorWidgetCommandId = "search.action.focusQueryEditorWidget";
const FocusQueryEditorFilesToIncludeCommandId = "search.action.focusFilesToInclude";
const FocusQueryEditorFilesToExcludeCommandId = "search.action.focusFilesToExclude";
const ToggleSearchEditorCaseSensitiveCommandId = "toggleSearchEditorCaseSensitive";
const ToggleSearchEditorWholeWordCommandId = "toggleSearchEditorWholeWord";
const ToggleSearchEditorRegexCommandId = "toggleSearchEditorRegex";
const IncreaseSearchEditorContextLinesCommandId = "increaseSearchEditorContextLines";
const DecreaseSearchEditorContextLinesCommandId = "decreaseSearchEditorContextLines";
const RerunSearchEditorSearchCommandId = "rerunSearchEditorSearch";
const CleanSearchEditorStateCommandId = "cleanSearchEditorState";
const SelectAllSearchEditorMatchesCommandId = "selectAllSearchEditorMatches";
Registry.as(EditorExtensions.EditorPane).registerEditorPane(
  EditorPaneDescriptor.create(
    SearchEditor,
    SearchEditor.ID,
    localize("searchEditor", "Search Editor")
  ),
  [
    new SyncDescriptor(SearchEditorInput)
  ]
);
let SearchEditorContribution = class {
  static {
    __name(this, "SearchEditorContribution");
  }
  static ID = "workbench.contrib.searchEditor";
  constructor(editorResolverService, instantiationService) {
    editorResolverService.registerEditor(
      "*" + SEARCH_EDITOR_EXT,
      {
        id: SearchEditorInput.ID,
        label: localize("promptOpenWith.searchEditor.displayName", "Search Editor"),
        detail: DEFAULT_EDITOR_ASSOCIATION.providerDisplayName,
        priority: RegisteredEditorPriority.default
      },
      {
        singlePerResource: true,
        canSupportResource: /* @__PURE__ */ __name((resource) => extname(resource) === SEARCH_EDITOR_EXT, "canSupportResource")
      },
      {
        createEditorInput: /* @__PURE__ */ __name(({ resource }) => {
          return { editor: instantiationService.invokeFunction(getOrMakeSearchEditorInput, { from: "existingFile", fileUri: resource }) };
        }, "createEditorInput")
      }
    );
  }
};
SearchEditorContribution = __decorateClass([
  __decorateParam(0, IEditorResolverService),
  __decorateParam(1, IInstantiationService)
], SearchEditorContribution);
registerWorkbenchContribution2(SearchEditorContribution.ID, SearchEditorContribution, WorkbenchPhase.BlockStartup);
class SearchEditorInputSerializer {
  static {
    __name(this, "SearchEditorInputSerializer");
  }
  canSerialize(input) {
    return !!input.tryReadConfigSync();
  }
  serialize(input) {
    if (!this.canSerialize(input)) {
      return void 0;
    }
    if (input.isDisposed()) {
      return JSON.stringify({ modelUri: void 0, dirty: false, config: input.tryReadConfigSync(), name: input.getName(), matchRanges: [], backingUri: input.backingUri?.toString() });
    }
    let modelUri = void 0;
    if (input.modelUri.path || input.modelUri.fragment && input.isDirty()) {
      modelUri = input.modelUri.toString();
    }
    const config = input.tryReadConfigSync();
    const dirty = input.isDirty();
    const matchRanges = dirty ? input.getMatchRanges() : [];
    const backingUri = input.backingUri;
    return JSON.stringify({ modelUri, dirty, config, name: input.getName(), matchRanges, backingUri: backingUri?.toString() });
  }
  deserialize(instantiationService, serializedEditorInput) {
    const { modelUri, dirty, config, matchRanges, backingUri } = JSON.parse(serializedEditorInput);
    if (config && config.query !== void 0) {
      if (modelUri) {
        const input = instantiationService.invokeFunction(
          getOrMakeSearchEditorInput,
          { from: "model", modelUri: URI.parse(modelUri), config, backupOf: backingUri ? URI.parse(backingUri) : void 0 }
        );
        input.setDirty(dirty);
        input.setMatchRanges(matchRanges);
        return input;
      } else {
        if (backingUri) {
          return instantiationService.invokeFunction(
            getOrMakeSearchEditorInput,
            { from: "existingFile", fileUri: URI.parse(backingUri) }
          );
        } else {
          return instantiationService.invokeFunction(
            getOrMakeSearchEditorInput,
            { from: "rawData", resultsContents: "", config }
          );
        }
      }
    }
    return void 0;
  }
}
Registry.as(EditorExtensions.EditorFactory).registerEditorSerializer(
  SearchEditorInput.ID,
  SearchEditorInputSerializer
);
CommandsRegistry.registerCommand(
  CleanSearchEditorStateCommandId,
  (accessor) => {
    const activeEditorPane = accessor.get(IEditorService).activeEditorPane;
    if (activeEditorPane instanceof SearchEditor) {
      activeEditorPane.cleanState();
    }
  }
);
const category = localize2("search", "Search Editor");
const translateLegacyConfig = /* @__PURE__ */ __name((legacyConfig = {}) => {
  const config = {};
  const overrides = {
    includes: "filesToInclude",
    excludes: "filesToExclude",
    wholeWord: "matchWholeWord",
    caseSensitive: "isCaseSensitive",
    regexp: "isRegexp",
    useIgnores: "useExcludeSettingsAndIgnoreFiles"
  };
  Object.entries(legacyConfig).forEach(([key, value]) => {
    config[overrides[key] ?? key] = value;
  });
  return config;
}, "translateLegacyConfig");
const openArgMetadata = {
  description: "Open a new search editor. Arguments passed can include variables like ${relativeFileDirname}.",
  args: [{
    name: "Open new Search Editor args",
    schema: {
      properties: {
        query: { type: "string" },
        filesToInclude: { type: "string" },
        filesToExclude: { type: "string" },
        contextLines: { type: "number" },
        matchWholeWord: { type: "boolean" },
        isCaseSensitive: { type: "boolean" },
        isRegexp: { type: "boolean" },
        useExcludeSettingsAndIgnoreFiles: { type: "boolean" },
        showIncludesExcludes: { type: "boolean" },
        triggerSearch: { type: "boolean" },
        focusResults: { type: "boolean" },
        onlyOpenEditors: { type: "boolean" }
      }
    }
  }]
};
registerAction2(class extends Action2 {
  constructor() {
    super({
      id: "search.searchEditor.action.deleteFileResults",
      title: localize2("searchEditor.deleteResultBlock", "Delete File Results"),
      keybinding: {
        weight: KeybindingWeight.EditorContrib,
        primary: KeyMod.CtrlCmd | KeyMod.Shift | KeyCode.Backspace
      },
      precondition: SearchEditorConstants.InSearchEditor,
      category,
      f1: true
    });
  }
  async run(accessor) {
    const contextService = accessor.get(IContextKeyService).getContext(getActiveElement());
    if (contextService.getValue(SearchEditorConstants.InSearchEditor.serialize())) {
      accessor.get(IEditorService).activeEditorPane.deleteResultBlock();
    }
  }
});
registerAction2(class extends Action2 {
  constructor() {
    super({
      id: SearchEditorConstants.OpenNewEditorCommandId,
      title: localize2("search.openNewSearchEditor", "New Search Editor"),
      category,
      f1: true,
      metadata: openArgMetadata
    });
  }
  async run(accessor, args) {
    await accessor.get(IInstantiationService).invokeFunction(openNewSearchEditor, translateLegacyConfig({ location: "new", ...args }));
  }
});
registerAction2(class extends Action2 {
  constructor() {
    super({
      id: SearchEditorConstants.OpenEditorCommandId,
      title: localize2("search.openSearchEditor", "Open Search Editor"),
      category,
      f1: true,
      metadata: openArgMetadata
    });
  }
  async run(accessor, args) {
    await accessor.get(IInstantiationService).invokeFunction(openNewSearchEditor, translateLegacyConfig({ location: "reuse", ...args }));
  }
});
registerAction2(class extends Action2 {
  constructor() {
    super({
      id: OpenNewEditorToSideCommandId,
      title: localize2("search.openNewEditorToSide", "Open New Search Editor to the Side"),
      category,
      f1: true,
      metadata: openArgMetadata
    });
  }
  async run(accessor, args) {
    await accessor.get(IInstantiationService).invokeFunction(openNewSearchEditor, translateLegacyConfig(args), true);
  }
});
registerAction2(class extends Action2 {
  constructor() {
    super({
      id: OpenInEditorCommandId,
      title: localize2("search.openResultsInEditor", "Open Results in Editor"),
      category,
      f1: true,
      keybinding: {
        primary: KeyMod.Alt | KeyCode.Enter,
        when: ContextKeyExpr.and(SearchConstants.SearchContext.HasSearchResults, SearchConstants.SearchContext.SearchViewFocusedKey),
        weight: KeybindingWeight.WorkbenchContrib,
        mac: {
          primary: KeyMod.CtrlCmd | KeyCode.Enter
        }
      }
    });
  }
  async run(accessor) {
    const viewsService = accessor.get(IViewsService);
    const instantiationService = accessor.get(IInstantiationService);
    const searchView = getSearchView(viewsService);
    if (searchView) {
      await instantiationService.invokeFunction(createEditorFromSearchResult, searchView.searchResult, searchView.searchIncludePattern.getValue(), searchView.searchExcludePattern.getValue(), searchView.searchIncludePattern.onlySearchInOpenEditors());
    }
  }
});
registerAction2(class extends Action2 {
  constructor() {
    super({
      id: RerunSearchEditorSearchCommandId,
      title: localize2("search.rerunSearchInEditor", "Search Again"),
      category,
      keybinding: {
        primary: KeyMod.CtrlCmd | KeyMod.Shift | KeyCode.KeyR,
        when: SearchEditorConstants.InSearchEditor,
        weight: KeybindingWeight.EditorContrib
      },
      icon: searchRefreshIcon,
      menu: [
        {
          id: MenuId.EditorTitle,
          group: "navigation",
          when: ActiveEditorContext.isEqualTo(SearchEditorConstants.SearchEditorID)
        },
        {
          id: MenuId.CommandPalette,
          when: ActiveEditorContext.isEqualTo(SearchEditorConstants.SearchEditorID)
        }
      ]
    });
  }
  async run(accessor) {
    const editorService = accessor.get(IEditorService);
    const input = editorService.activeEditor;
    if (input instanceof SearchEditorInput) {
      editorService.activeEditorPane.triggerSearch({ resetCursor: false });
    }
  }
});
registerAction2(class extends Action2 {
  constructor() {
    super({
      id: FocusQueryEditorWidgetCommandId,
      title: localize2("search.action.focusQueryEditorWidget", "Focus Search Editor Input"),
      category,
      f1: true,
      precondition: SearchEditorConstants.InSearchEditor,
      keybinding: {
        primary: KeyCode.Escape,
        weight: KeybindingWeight.EditorContrib
      }
    });
  }
  async run(accessor) {
    const editorService = accessor.get(IEditorService);
    const input = editorService.activeEditor;
    if (input instanceof SearchEditorInput) {
      editorService.activeEditorPane.focusSearchInput();
    }
  }
});
registerAction2(class extends Action2 {
  constructor() {
    super({
      id: FocusQueryEditorFilesToIncludeCommandId,
      title: localize2("search.action.focusFilesToInclude", "Focus Search Editor Files to Include"),
      category,
      f1: true,
      precondition: SearchEditorConstants.InSearchEditor
    });
  }
  async run(accessor) {
    const editorService = accessor.get(IEditorService);
    const input = editorService.activeEditor;
    if (input instanceof SearchEditorInput) {
      editorService.activeEditorPane.focusFilesToIncludeInput();
    }
  }
});
registerAction2(class extends Action2 {
  constructor() {
    super({
      id: FocusQueryEditorFilesToExcludeCommandId,
      title: localize2("search.action.focusFilesToExclude", "Focus Search Editor Files to Exclude"),
      category,
      f1: true,
      precondition: SearchEditorConstants.InSearchEditor
    });
  }
  async run(accessor) {
    const editorService = accessor.get(IEditorService);
    const input = editorService.activeEditor;
    if (input instanceof SearchEditorInput) {
      editorService.activeEditorPane.focusFilesToExcludeInput();
    }
  }
});
registerAction2(class extends Action2 {
  constructor() {
    super({
      id: ToggleSearchEditorCaseSensitiveCommandId,
      title: localize2("searchEditor.action.toggleSearchEditorCaseSensitive", "Toggle Match Case"),
      category,
      f1: true,
      precondition: SearchEditorConstants.InSearchEditor,
      keybinding: Object.assign({
        weight: KeybindingWeight.WorkbenchContrib,
        when: SearchConstants.SearchContext.SearchInputBoxFocusedKey
      }, ToggleCaseSensitiveKeybinding)
    });
  }
  run(accessor) {
    toggleSearchEditorCaseSensitiveCommand(accessor);
  }
});
registerAction2(class extends Action2 {
  constructor() {
    super({
      id: ToggleSearchEditorWholeWordCommandId,
      title: localize2("searchEditor.action.toggleSearchEditorWholeWord", "Toggle Match Whole Word"),
      category,
      f1: true,
      precondition: SearchEditorConstants.InSearchEditor,
      keybinding: Object.assign({
        weight: KeybindingWeight.WorkbenchContrib,
        when: SearchConstants.SearchContext.SearchInputBoxFocusedKey
      }, ToggleWholeWordKeybinding)
    });
  }
  run(accessor) {
    toggleSearchEditorWholeWordCommand(accessor);
  }
});
registerAction2(class extends Action2 {
  constructor() {
    super({
      id: ToggleSearchEditorRegexCommandId,
      title: localize2("searchEditor.action.toggleSearchEditorRegex", "Toggle Use Regular Expression"),
      category,
      f1: true,
      precondition: SearchEditorConstants.InSearchEditor,
      keybinding: Object.assign({
        weight: KeybindingWeight.WorkbenchContrib,
        when: SearchConstants.SearchContext.SearchInputBoxFocusedKey
      }, ToggleRegexKeybinding)
    });
  }
  run(accessor) {
    toggleSearchEditorRegexCommand(accessor);
  }
});
registerAction2(class extends Action2 {
  constructor() {
    super({
      id: SearchEditorConstants.ToggleSearchEditorContextLinesCommandId,
      title: localize2("searchEditor.action.toggleSearchEditorContextLines", "Toggle Context Lines"),
      category,
      f1: true,
      precondition: SearchEditorConstants.InSearchEditor,
      keybinding: {
        weight: KeybindingWeight.WorkbenchContrib,
        primary: KeyMod.Alt | KeyCode.KeyL,
        mac: { primary: KeyMod.CtrlCmd | KeyMod.Alt | KeyCode.KeyL }
      }
    });
  }
  run(accessor) {
    toggleSearchEditorContextLinesCommand(accessor);
  }
});
registerAction2(class extends Action2 {
  constructor() {
    super({
      id: IncreaseSearchEditorContextLinesCommandId,
      title: localize2("searchEditor.action.increaseSearchEditorContextLines", "Increase Context Lines"),
      category,
      f1: true,
      precondition: SearchEditorConstants.InSearchEditor,
      keybinding: {
        weight: KeybindingWeight.WorkbenchContrib,
        primary: KeyMod.Alt | KeyCode.Equal
      }
    });
  }
  run(accessor) {
    modifySearchEditorContextLinesCommand(accessor, true);
  }
});
registerAction2(class extends Action2 {
  constructor() {
    super({
      id: DecreaseSearchEditorContextLinesCommandId,
      title: localize2("searchEditor.action.decreaseSearchEditorContextLines", "Decrease Context Lines"),
      category,
      f1: true,
      precondition: SearchEditorConstants.InSearchEditor,
      keybinding: {
        weight: KeybindingWeight.WorkbenchContrib,
        primary: KeyMod.Alt | KeyCode.Minus
      }
    });
  }
  run(accessor) {
    modifySearchEditorContextLinesCommand(accessor, false);
  }
});
registerAction2(class extends Action2 {
  constructor() {
    super({
      id: SelectAllSearchEditorMatchesCommandId,
      title: localize2("searchEditor.action.selectAllSearchEditorMatches", "Select All Matches"),
      category,
      f1: true,
      precondition: SearchEditorConstants.InSearchEditor,
      keybinding: {
        weight: KeybindingWeight.WorkbenchContrib,
        primary: KeyMod.CtrlCmd | KeyMod.Shift | KeyCode.KeyL
      }
    });
  }
  run(accessor) {
    selectAllSearchEditorMatchesCommand(accessor);
  }
});
registerAction2(class OpenSearchEditorAction extends Action2 {
  static {
    __name(this, "OpenSearchEditorAction");
  }
  constructor() {
    super({
      id: "search.action.openNewEditorFromView",
      title: localize("search.openNewEditor", "Open New Search Editor"),
      category,
      icon: searchNewEditorIcon,
      menu: [{
        id: MenuId.ViewTitle,
        group: "navigation",
        order: 2,
        when: ContextKeyExpr.equals("view", VIEW_ID)
      }]
    });
  }
  run(accessor, ...args) {
    return openSearchEditor(accessor);
  }
});
let SearchEditorWorkingCopyEditorHandler = class extends Disposable {
  constructor(instantiationService, workingCopyEditorService) {
    super();
    this.instantiationService = instantiationService;
    this._register(workingCopyEditorService.registerHandler(this));
  }
  static {
    __name(this, "SearchEditorWorkingCopyEditorHandler");
  }
  static ID = "workbench.contrib.searchEditorWorkingCopyEditorHandler";
  handles(workingCopy) {
    return workingCopy.resource.scheme === SearchEditorConstants.SearchEditorScheme;
  }
  isOpen(workingCopy, editor) {
    if (!this.handles(workingCopy)) {
      return false;
    }
    return editor instanceof SearchEditorInput && isEqual(workingCopy.resource, editor.modelUri);
  }
  createEditor(workingCopy) {
    const input = this.instantiationService.invokeFunction(getOrMakeSearchEditorInput, { from: "model", modelUri: workingCopy.resource });
    input.setDirty(true);
    return input;
  }
};
SearchEditorWorkingCopyEditorHandler = __decorateClass([
  __decorateParam(0, IInstantiationService),
  __decorateParam(1, IWorkingCopyEditorService)
], SearchEditorWorkingCopyEditorHandler);
registerWorkbenchContribution2(SearchEditorWorkingCopyEditorHandler.ID, SearchEditorWorkingCopyEditorHandler, WorkbenchPhase.BlockRestore);
//# sourceMappingURL=searchEditor.contribution.js.map
