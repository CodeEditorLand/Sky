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
import * as nls from "../../../../nls.js";
import "./media/dirtydiffDecorator.css";
import { Disposable, DisposableStore, DisposableMap, IReference } from "../../../../base/common/lifecycle.js";
import { Event } from "../../../../base/common/event.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { ModelDecorationOptions } from "../../../../editor/common/model/textModel.js";
import { themeColorFromId } from "../../../../platform/theme/common/themeService.js";
import { ICodeEditor, isCodeEditor } from "../../../../editor/browser/editorBrowser.js";
import { IEditorDecorationsCollection } from "../../../../editor/common/editorCommon.js";
import { OverviewRulerLane, IModelDecorationOptions, MinimapPosition } from "../../../../editor/common/model.js";
import * as domStylesheetsJs from "../../../../base/browser/domStylesheets.js";
import { IEditorService } from "../../../services/editor/common/editorService.js";
import { ChangeType, getChangeType, minimapGutterAddedBackground, minimapGutterDeletedBackground, minimapGutterModifiedBackground, overviewRulerAddedForeground, overviewRulerDeletedForeground, overviewRulerModifiedForeground } from "../common/quickDiff.js";
import { QuickDiffModel, IQuickDiffModelService } from "./quickDiffModel.js";
import { IWorkbenchContribution } from "../../../common/contributions.js";
import { ResourceMap } from "../../../../base/common/map.js";
import { IUriIdentityService } from "../../../../platform/uriIdentity/common/uriIdentity.js";
import { IContextKey, IContextKeyService, RawContextKey } from "../../../../platform/contextkey/common/contextkey.js";
import { autorun, autorunWithStore, IObservable, observableFromEvent } from "../../../../base/common/observable.js";
import { EditorInput } from "../../../common/editor/editorInput.js";
const quickDiffDecorationCount = new RawContextKey("quickDiffDecorationCount", 0);
let QuickDiffDecorator = class extends Disposable {
  constructor(codeEditor, quickDiffModelRef, configurationService) {
    super();
    this.codeEditor = codeEditor;
    this.quickDiffModelRef = quickDiffModelRef;
    this.configurationService = configurationService;
    const decorations = configurationService.getValue("scm.diffDecorations");
    const gutter = decorations === "all" || decorations === "gutter";
    const overview = decorations === "all" || decorations === "overview";
    const minimap = decorations === "all" || decorations === "minimap";
    const diffAdded = nls.localize("diffAdded", "Added lines");
    this.addedOptions = QuickDiffDecorator.createDecoration("dirty-diff-added", diffAdded, {
      gutter,
      overview: { active: overview, color: overviewRulerAddedForeground },
      minimap: { active: minimap, color: minimapGutterAddedBackground },
      isWholeLine: true
    });
    this.addedPatternOptions = QuickDiffDecorator.createDecoration("dirty-diff-added-pattern", diffAdded, {
      gutter,
      overview: { active: overview, color: overviewRulerAddedForeground },
      minimap: { active: minimap, color: minimapGutterAddedBackground },
      isWholeLine: true
    });
    const diffModified = nls.localize("diffModified", "Changed lines");
    this.modifiedOptions = QuickDiffDecorator.createDecoration("dirty-diff-modified", diffModified, {
      gutter,
      overview: { active: overview, color: overviewRulerModifiedForeground },
      minimap: { active: minimap, color: minimapGutterModifiedBackground },
      isWholeLine: true
    });
    this.modifiedPatternOptions = QuickDiffDecorator.createDecoration("dirty-diff-modified-pattern", diffModified, {
      gutter,
      overview: { active: overview, color: overviewRulerModifiedForeground },
      minimap: { active: minimap, color: minimapGutterModifiedBackground },
      isWholeLine: true
    });
    this.deletedOptions = QuickDiffDecorator.createDecoration("dirty-diff-deleted", nls.localize("diffDeleted", "Removed lines"), {
      gutter,
      overview: { active: overview, color: overviewRulerDeletedForeground },
      minimap: { active: minimap, color: minimapGutterDeletedBackground },
      isWholeLine: false
    });
    this._register(configurationService.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration("scm.diffDecorationsGutterPattern")) {
        this.onDidChange();
      }
    }));
    this._register(Event.runAndSubscribe(this.quickDiffModelRef.object.onDidChange, () => this.onDidChange()));
  }
  static {
    __name(this, "QuickDiffDecorator");
  }
  static createDecoration(className, tooltip, options) {
    const decorationOptions = {
      description: "dirty-diff-decoration",
      isWholeLine: options.isWholeLine
    };
    if (options.gutter) {
      decorationOptions.linesDecorationsClassName = `dirty-diff-glyph ${className}`;
      decorationOptions.linesDecorationsTooltip = tooltip;
    }
    if (options.overview.active) {
      decorationOptions.overviewRuler = {
        color: themeColorFromId(options.overview.color),
        position: OverviewRulerLane.Left
      };
    }
    if (options.minimap.active) {
      decorationOptions.minimap = {
        color: themeColorFromId(options.minimap.color),
        position: MinimapPosition.Gutter
      };
    }
    return ModelDecorationOptions.createDynamic(decorationOptions);
  }
  addedOptions;
  addedPatternOptions;
  modifiedOptions;
  modifiedPatternOptions;
  deletedOptions;
  decorationsCollection;
  onDidChange() {
    if (!this.codeEditor.hasModel()) {
      return;
    }
    const visibleQuickDiffs = this.quickDiffModelRef.object.quickDiffs.filter((quickDiff) => quickDiff.visible);
    const pattern = this.configurationService.getValue("scm.diffDecorationsGutterPattern");
    const decorations = this.quickDiffModelRef.object.changes.filter((labeledChange) => visibleQuickDiffs.some((quickDiff) => quickDiff.label === labeledChange.label)).map((labeledChange) => {
      const change = labeledChange.change;
      const changeType = getChangeType(change);
      const startLineNumber = change.modifiedStartLineNumber;
      const endLineNumber = change.modifiedEndLineNumber || startLineNumber;
      switch (changeType) {
        case ChangeType.Add:
          return {
            range: {
              startLineNumber,
              startColumn: 1,
              endLineNumber,
              endColumn: 1
            },
            options: pattern.added ? this.addedPatternOptions : this.addedOptions
          };
        case ChangeType.Delete:
          return {
            range: {
              startLineNumber,
              startColumn: Number.MAX_VALUE,
              endLineNumber: startLineNumber,
              endColumn: Number.MAX_VALUE
            },
            options: this.deletedOptions
          };
        case ChangeType.Modify:
          return {
            range: {
              startLineNumber,
              startColumn: 1,
              endLineNumber,
              endColumn: 1
            },
            options: pattern.modified ? this.modifiedPatternOptions : this.modifiedOptions
          };
      }
    });
    if (!this.decorationsCollection) {
      this.decorationsCollection = this.codeEditor.createDecorationsCollection(decorations);
    } else {
      this.decorationsCollection.set(decorations);
    }
  }
  dispose() {
    if (this.decorationsCollection) {
      this.decorationsCollection.clear();
    }
    this.decorationsCollection = void 0;
    this.quickDiffModelRef.dispose();
    super.dispose();
  }
};
QuickDiffDecorator = __decorateClass([
  __decorateParam(2, IConfigurationService)
], QuickDiffDecorator);
let QuickDiffWorkbenchController = class extends Disposable {
  constructor(editorService, configurationService, quickDiffModelService, uriIdentityService, contextKeyService) {
    super();
    this.editorService = editorService;
    this.configurationService = configurationService;
    this.quickDiffModelService = quickDiffModelService;
    this.uriIdentityService = uriIdentityService;
    this.stylesheet = domStylesheetsJs.createStyleSheet(void 0, void 0, this._store);
    this.quickDiffDecorationCount = quickDiffDecorationCount.bindTo(contextKeyService);
    this.activeEditor = observableFromEvent(
      this,
      this.editorService.onDidActiveEditorChange,
      () => this.editorService.activeEditor
    );
    const onDidChangeConfiguration = Event.filter(configurationService.onDidChangeConfiguration, (e) => e.affectsConfiguration("scm.diffDecorations"));
    this._register(onDidChangeConfiguration(this.onDidChangeConfiguration, this));
    this.onDidChangeConfiguration();
    const onDidChangeDiffWidthConfiguration = Event.filter(configurationService.onDidChangeConfiguration, (e) => e.affectsConfiguration("scm.diffDecorationsGutterWidth"));
    this._register(onDidChangeDiffWidthConfiguration(this.onDidChangeDiffWidthConfiguration, this));
    this.onDidChangeDiffWidthConfiguration();
    const onDidChangeDiffVisibilityConfiguration = Event.filter(configurationService.onDidChangeConfiguration, (e) => e.affectsConfiguration("scm.diffDecorationsGutterVisibility"));
    this._register(onDidChangeDiffVisibilityConfiguration(this.onDidChangeDiffVisibilityConfiguration, this));
    this.onDidChangeDiffVisibilityConfiguration();
  }
  static {
    __name(this, "QuickDiffWorkbenchController");
  }
  enabled = false;
  quickDiffDecorationCount;
  activeEditor;
  // Resource URI -> Code Editor Id -> Decoration (Disposable)
  decorators = new ResourceMap();
  viewState = { width: 3, visibility: "always" };
  transientDisposables = this._register(new DisposableStore());
  stylesheet;
  onDidChangeConfiguration() {
    const enabled = this.configurationService.getValue("scm.diffDecorations") !== "none";
    if (enabled) {
      this.enable();
    } else {
      this.disable();
    }
  }
  onDidChangeDiffWidthConfiguration() {
    let width = this.configurationService.getValue("scm.diffDecorationsGutterWidth");
    if (isNaN(width) || width <= 0 || width > 5) {
      width = 3;
    }
    this.setViewState({ ...this.viewState, width });
  }
  onDidChangeDiffVisibilityConfiguration() {
    const visibility = this.configurationService.getValue("scm.diffDecorationsGutterVisibility");
    this.setViewState({ ...this.viewState, visibility });
  }
  setViewState(state) {
    this.viewState = state;
    this.stylesheet.textContent = `
			.monaco-editor .dirty-diff-added,
			.monaco-editor .dirty-diff-modified {
				border-left-width:${state.width}px;
			}
			.monaco-editor .dirty-diff-added-pattern,
			.monaco-editor .dirty-diff-added-pattern:before,
			.monaco-editor .dirty-diff-modified-pattern,
			.monaco-editor .dirty-diff-modified-pattern:before {
				background-size: ${state.width}px ${state.width}px;
			}
			.monaco-editor .dirty-diff-added,
			.monaco-editor .dirty-diff-added-pattern,
			.monaco-editor .dirty-diff-modified,
			.monaco-editor .dirty-diff-modified-pattern,
			.monaco-editor .dirty-diff-deleted {
				opacity: ${state.visibility === "always" ? 1 : 0};
			}
		`;
  }
  enable() {
    if (this.enabled) {
      this.disable();
    }
    this.transientDisposables.add(Event.any(this.editorService.onDidCloseEditor, this.editorService.onDidVisibleEditorsChange)(() => this.onEditorsChanged()));
    this.onEditorsChanged();
    this.onDidActiveEditorChange();
    this.enabled = true;
  }
  disable() {
    if (!this.enabled) {
      return;
    }
    this.transientDisposables.clear();
    this.quickDiffDecorationCount.set(0);
    for (const [uri, decoratorMap] of this.decorators.entries()) {
      decoratorMap.dispose();
      this.decorators.delete(uri);
    }
    this.enabled = false;
  }
  onDidActiveEditorChange() {
    this.transientDisposables.add(autorunWithStore((reader, store) => {
      const activeEditor = this.activeEditor.read(reader);
      const activeTextEditorControl = this.editorService.activeTextEditorControl;
      if (!isCodeEditor(activeTextEditorControl) || !activeEditor?.resource) {
        this.quickDiffDecorationCount.set(0);
        return;
      }
      const quickDiffModelRef = this.quickDiffModelService.createQuickDiffModelReference(activeEditor.resource);
      if (!quickDiffModelRef) {
        this.quickDiffDecorationCount.set(0);
        return;
      }
      store.add(quickDiffModelRef);
      const visibleDecorationCount = observableFromEvent(
        this,
        quickDiffModelRef.object.onDidChange,
        () => {
          const visibleQuickDiffs = quickDiffModelRef.object.quickDiffs.filter((quickDiff) => quickDiff.visible);
          return quickDiffModelRef.object.changes.filter((labeledChange) => visibleQuickDiffs.some((quickDiff) => quickDiff.label === labeledChange.label)).length;
        }
      );
      store.add(autorun((reader2) => {
        const count = visibleDecorationCount.read(reader2);
        this.quickDiffDecorationCount.set(count);
      }));
    }));
  }
  onEditorsChanged() {
    for (const editor of this.editorService.visibleTextEditorControls) {
      if (!isCodeEditor(editor)) {
        continue;
      }
      const textModel = editor.getModel();
      if (!textModel) {
        continue;
      }
      const editorId = editor.getId();
      if (this.decorators.get(textModel.uri)?.has(editorId)) {
        continue;
      }
      const quickDiffModelRef = this.quickDiffModelService.createQuickDiffModelReference(textModel.uri);
      if (!quickDiffModelRef) {
        continue;
      }
      if (!this.decorators.has(textModel.uri)) {
        this.decorators.set(textModel.uri, new DisposableMap());
      }
      this.decorators.get(textModel.uri).set(editorId, new QuickDiffDecorator(editor, quickDiffModelRef, this.configurationService));
    }
    for (const [uri, decoratorMap] of this.decorators.entries()) {
      for (const editorId of decoratorMap.keys()) {
        const codeEditor = this.editorService.visibleTextEditorControls.find((editor) => isCodeEditor(editor) && editor.getId() === editorId && this.uriIdentityService.extUri.isEqual(editor.getModel()?.uri, uri));
        if (!codeEditor) {
          decoratorMap.deleteAndDispose(editorId);
        }
      }
      if (decoratorMap.size === 0) {
        decoratorMap.dispose();
        this.decorators.delete(uri);
      }
    }
  }
  dispose() {
    this.disable();
    super.dispose();
  }
};
QuickDiffWorkbenchController = __decorateClass([
  __decorateParam(0, IEditorService),
  __decorateParam(1, IConfigurationService),
  __decorateParam(2, IQuickDiffModelService),
  __decorateParam(3, IUriIdentityService),
  __decorateParam(4, IContextKeyService)
], QuickDiffWorkbenchController);
export {
  QuickDiffWorkbenchController,
  quickDiffDecorationCount
};
//# sourceMappingURL=quickDiffDecorator.js.map
