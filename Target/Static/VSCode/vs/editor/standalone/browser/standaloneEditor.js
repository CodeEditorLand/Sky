var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { mainWindow } from "../../../base/browser/window.js";
import { Disposable, DisposableStore, IDisposable } from "../../../base/common/lifecycle.js";
import { splitLines } from "../../../base/common/strings.js";
import { URI } from "../../../base/common/uri.js";
import "./standalone-tokens.css";
import { FontMeasurements } from "../../browser/config/fontMeasurements.js";
import { ICodeEditor } from "../../browser/editorBrowser.js";
import { EditorCommand, ServicesAccessor } from "../../browser/editorExtensions.js";
import { ICodeEditorService } from "../../browser/services/codeEditorService.js";
import { IInternalWebWorkerOptions, MonacoWebWorker, createWebWorker as actualCreateWebWorker } from "./standaloneWebWorker.js";
import { ApplyUpdateResult, ConfigurationChangedEvent, EditorOptions } from "../../common/config/editorOptions.js";
import { EditorZoom } from "../../common/config/editorZoom.js";
import { BareFontInfo, FontInfo } from "../../common/config/fontInfo.js";
import { IPosition } from "../../common/core/position.js";
import { IRange } from "../../common/core/range.js";
import { EditorType, IDiffEditor } from "../../common/editorCommon.js";
import * as languages from "../../common/languages.js";
import { ILanguageService } from "../../common/languages/language.js";
import { PLAINTEXT_LANGUAGE_ID } from "../../common/languages/modesRegistry.js";
import { NullState, nullTokenize } from "../../common/languages/nullTokenize.js";
import { FindMatch, ITextModel, TextModelResolvedOptions } from "../../common/model.js";
import { IModelService } from "../../common/services/model.js";
import * as standaloneEnums from "../../common/standalone/standaloneEnums.js";
import { Colorizer, IColorizerElementOptions, IColorizerOptions } from "./colorizer.js";
import { IActionDescriptor, IStandaloneCodeEditor, IStandaloneDiffEditor, IStandaloneDiffEditorConstructionOptions, IStandaloneEditorConstructionOptions, StandaloneDiffEditor2, StandaloneEditor, createTextModel } from "./standaloneCodeEditor.js";
import { IEditorOverrideServices, StandaloneKeybindingService, StandaloneServices } from "./standaloneServices.js";
import { StandaloneThemeService } from "./standaloneThemeService.js";
import { IStandaloneThemeData, IStandaloneThemeService } from "../common/standaloneTheme.js";
import { IMenuItem, MenuId, MenuRegistry } from "../../../platform/actions/common/actions.js";
import { CommandsRegistry, ICommandHandler } from "../../../platform/commands/common/commands.js";
import { ContextKeyExpr } from "../../../platform/contextkey/common/contextkey.js";
import { ITextResourceEditorInput } from "../../../platform/editor/common/editor.js";
import { IKeybindingService } from "../../../platform/keybinding/common/keybinding.js";
import { IMarker, IMarkerData, IMarkerService } from "../../../platform/markers/common/markers.js";
import { IOpenerService } from "../../../platform/opener/common/opener.js";
import { MultiDiffEditorWidget } from "../../browser/widget/multiDiffEditor/multiDiffEditorWidget.js";
function create(domElement, options, override) {
  const instantiationService = StandaloneServices.initialize(override || {});
  return instantiationService.createInstance(StandaloneEditor, domElement, options);
}
__name(create, "create");
function onDidCreateEditor(listener) {
  const codeEditorService = StandaloneServices.get(ICodeEditorService);
  return codeEditorService.onCodeEditorAdd((editor) => {
    listener(editor);
  });
}
__name(onDidCreateEditor, "onDidCreateEditor");
function onDidCreateDiffEditor(listener) {
  const codeEditorService = StandaloneServices.get(ICodeEditorService);
  return codeEditorService.onDiffEditorAdd((editor) => {
    listener(editor);
  });
}
__name(onDidCreateDiffEditor, "onDidCreateDiffEditor");
function getEditors() {
  const codeEditorService = StandaloneServices.get(ICodeEditorService);
  return codeEditorService.listCodeEditors();
}
__name(getEditors, "getEditors");
function getDiffEditors() {
  const codeEditorService = StandaloneServices.get(ICodeEditorService);
  return codeEditorService.listDiffEditors();
}
__name(getDiffEditors, "getDiffEditors");
function createDiffEditor(domElement, options, override) {
  const instantiationService = StandaloneServices.initialize(override || {});
  return instantiationService.createInstance(StandaloneDiffEditor2, domElement, options);
}
__name(createDiffEditor, "createDiffEditor");
function createMultiFileDiffEditor(domElement, override) {
  const instantiationService = StandaloneServices.initialize(override || {});
  return new MultiDiffEditorWidget(domElement, {}, instantiationService);
}
__name(createMultiFileDiffEditor, "createMultiFileDiffEditor");
function addCommand(descriptor) {
  if (typeof descriptor.id !== "string" || typeof descriptor.run !== "function") {
    throw new Error("Invalid command descriptor, `id` and `run` are required properties!");
  }
  return CommandsRegistry.registerCommand(descriptor.id, descriptor.run);
}
__name(addCommand, "addCommand");
function addEditorAction(descriptor) {
  if (typeof descriptor.id !== "string" || typeof descriptor.label !== "string" || typeof descriptor.run !== "function") {
    throw new Error("Invalid action descriptor, `id`, `label` and `run` are required properties!");
  }
  const precondition = ContextKeyExpr.deserialize(descriptor.precondition);
  const run = /* @__PURE__ */ __name((accessor, ...args) => {
    return EditorCommand.runEditorCommand(accessor, args, precondition, (accessor2, editor, args2) => Promise.resolve(descriptor.run(editor, ...args2)));
  }, "run");
  const toDispose = new DisposableStore();
  toDispose.add(CommandsRegistry.registerCommand(descriptor.id, run));
  if (descriptor.contextMenuGroupId) {
    const menuItem = {
      command: {
        id: descriptor.id,
        title: descriptor.label
      },
      when: precondition,
      group: descriptor.contextMenuGroupId,
      order: descriptor.contextMenuOrder || 0
    };
    toDispose.add(MenuRegistry.appendMenuItem(MenuId.EditorContext, menuItem));
  }
  if (Array.isArray(descriptor.keybindings)) {
    const keybindingService = StandaloneServices.get(IKeybindingService);
    if (!(keybindingService instanceof StandaloneKeybindingService)) {
      console.warn("Cannot add keybinding because the editor is configured with an unrecognized KeybindingService");
    } else {
      const keybindingsWhen = ContextKeyExpr.and(precondition, ContextKeyExpr.deserialize(descriptor.keybindingContext));
      toDispose.add(keybindingService.addDynamicKeybindings(descriptor.keybindings.map((keybinding) => {
        return {
          keybinding,
          command: descriptor.id,
          when: keybindingsWhen
        };
      })));
    }
  }
  return toDispose;
}
__name(addEditorAction, "addEditorAction");
function addKeybindingRule(rule) {
  return addKeybindingRules([rule]);
}
__name(addKeybindingRule, "addKeybindingRule");
function addKeybindingRules(rules) {
  const keybindingService = StandaloneServices.get(IKeybindingService);
  if (!(keybindingService instanceof StandaloneKeybindingService)) {
    console.warn("Cannot add keybinding because the editor is configured with an unrecognized KeybindingService");
    return Disposable.None;
  }
  return keybindingService.addDynamicKeybindings(rules.map((rule) => {
    return {
      keybinding: rule.keybinding,
      command: rule.command,
      commandArgs: rule.commandArgs,
      when: ContextKeyExpr.deserialize(rule.when)
    };
  }));
}
__name(addKeybindingRules, "addKeybindingRules");
function createModel(value, language, uri) {
  const languageService = StandaloneServices.get(ILanguageService);
  const languageId = languageService.getLanguageIdByMimeType(language) || language;
  return createTextModel(
    StandaloneServices.get(IModelService),
    languageService,
    value,
    languageId,
    uri
  );
}
__name(createModel, "createModel");
function setModelLanguage(model, mimeTypeOrLanguageId) {
  const languageService = StandaloneServices.get(ILanguageService);
  const languageId = languageService.getLanguageIdByMimeType(mimeTypeOrLanguageId) || mimeTypeOrLanguageId || PLAINTEXT_LANGUAGE_ID;
  model.setLanguage(languageService.createById(languageId));
}
__name(setModelLanguage, "setModelLanguage");
function setModelMarkers(model, owner, markers) {
  if (model) {
    const markerService = StandaloneServices.get(IMarkerService);
    markerService.changeOne(owner, model.uri, markers);
  }
}
__name(setModelMarkers, "setModelMarkers");
function removeAllMarkers(owner) {
  const markerService = StandaloneServices.get(IMarkerService);
  markerService.changeAll(owner, []);
}
__name(removeAllMarkers, "removeAllMarkers");
function getModelMarkers(filter) {
  const markerService = StandaloneServices.get(IMarkerService);
  return markerService.read(filter);
}
__name(getModelMarkers, "getModelMarkers");
function onDidChangeMarkers(listener) {
  const markerService = StandaloneServices.get(IMarkerService);
  return markerService.onMarkerChanged(listener);
}
__name(onDidChangeMarkers, "onDidChangeMarkers");
function getModel(uri) {
  const modelService = StandaloneServices.get(IModelService);
  return modelService.getModel(uri);
}
__name(getModel, "getModel");
function getModels() {
  const modelService = StandaloneServices.get(IModelService);
  return modelService.getModels();
}
__name(getModels, "getModels");
function onDidCreateModel(listener) {
  const modelService = StandaloneServices.get(IModelService);
  return modelService.onModelAdded(listener);
}
__name(onDidCreateModel, "onDidCreateModel");
function onWillDisposeModel(listener) {
  const modelService = StandaloneServices.get(IModelService);
  return modelService.onModelRemoved(listener);
}
__name(onWillDisposeModel, "onWillDisposeModel");
function onDidChangeModelLanguage(listener) {
  const modelService = StandaloneServices.get(IModelService);
  return modelService.onModelLanguageChanged((e) => {
    listener({
      model: e.model,
      oldLanguage: e.oldLanguageId
    });
  });
}
__name(onDidChangeModelLanguage, "onDidChangeModelLanguage");
function createWebWorker(opts) {
  return actualCreateWebWorker(StandaloneServices.get(IModelService), opts);
}
__name(createWebWorker, "createWebWorker");
function colorizeElement(domNode, options) {
  const languageService = StandaloneServices.get(ILanguageService);
  const themeService = StandaloneServices.get(IStandaloneThemeService);
  return Colorizer.colorizeElement(themeService, languageService, domNode, options).then(() => {
    themeService.registerEditorContainer(domNode);
  });
}
__name(colorizeElement, "colorizeElement");
function colorize(text, languageId, options) {
  const languageService = StandaloneServices.get(ILanguageService);
  const themeService = StandaloneServices.get(IStandaloneThemeService);
  themeService.registerEditorContainer(mainWindow.document.body);
  return Colorizer.colorize(languageService, text, languageId, options);
}
__name(colorize, "colorize");
function colorizeModelLine(model, lineNumber, tabSize = 4) {
  const themeService = StandaloneServices.get(IStandaloneThemeService);
  themeService.registerEditorContainer(mainWindow.document.body);
  return Colorizer.colorizeModelLine(model, lineNumber, tabSize);
}
__name(colorizeModelLine, "colorizeModelLine");
function getSafeTokenizationSupport(language) {
  const tokenizationSupport = languages.TokenizationRegistry.get(language);
  if (tokenizationSupport) {
    return tokenizationSupport;
  }
  return {
    getInitialState: /* @__PURE__ */ __name(() => NullState, "getInitialState"),
    tokenize: /* @__PURE__ */ __name((line, hasEOL, state) => nullTokenize(language, state), "tokenize")
  };
}
__name(getSafeTokenizationSupport, "getSafeTokenizationSupport");
function tokenize(text, languageId) {
  languages.TokenizationRegistry.getOrCreate(languageId);
  const tokenizationSupport = getSafeTokenizationSupport(languageId);
  const lines = splitLines(text);
  const result = [];
  let state = tokenizationSupport.getInitialState();
  for (let i = 0, len = lines.length; i < len; i++) {
    const line = lines[i];
    const tokenizationResult = tokenizationSupport.tokenize(line, true, state);
    result[i] = tokenizationResult.tokens;
    state = tokenizationResult.endState;
  }
  return result;
}
__name(tokenize, "tokenize");
function defineTheme(themeName, themeData) {
  const standaloneThemeService = StandaloneServices.get(IStandaloneThemeService);
  standaloneThemeService.defineTheme(themeName, themeData);
}
__name(defineTheme, "defineTheme");
function setTheme(themeName) {
  const standaloneThemeService = StandaloneServices.get(IStandaloneThemeService);
  standaloneThemeService.setTheme(themeName);
}
__name(setTheme, "setTheme");
function remeasureFonts() {
  FontMeasurements.clearAllFontInfos();
}
__name(remeasureFonts, "remeasureFonts");
function registerCommand(id, handler) {
  return CommandsRegistry.registerCommand({ id, handler });
}
__name(registerCommand, "registerCommand");
function registerLinkOpener(opener) {
  const openerService = StandaloneServices.get(IOpenerService);
  return openerService.registerOpener({
    async open(resource) {
      if (typeof resource === "string") {
        resource = URI.parse(resource);
      }
      return opener.open(resource);
    }
  });
}
__name(registerLinkOpener, "registerLinkOpener");
function registerEditorOpener(opener) {
  const codeEditorService = StandaloneServices.get(ICodeEditorService);
  return codeEditorService.registerCodeEditorOpenHandler(async (input, source, sideBySide) => {
    if (!source) {
      return null;
    }
    const selection = input.options?.selection;
    let selectionOrPosition;
    if (selection && typeof selection.endLineNumber === "number" && typeof selection.endColumn === "number") {
      selectionOrPosition = selection;
    } else if (selection) {
      selectionOrPosition = { lineNumber: selection.startLineNumber, column: selection.startColumn };
    }
    if (await opener.openCodeEditor(source, input.resource, selectionOrPosition)) {
      return source;
    }
    return null;
  });
}
__name(registerEditorOpener, "registerEditorOpener");
function createMonacoEditorAPI() {
  return {
    // methods
    create,
    getEditors,
    getDiffEditors,
    onDidCreateEditor,
    onDidCreateDiffEditor,
    createDiffEditor,
    addCommand,
    addEditorAction,
    addKeybindingRule,
    addKeybindingRules,
    createModel,
    setModelLanguage,
    setModelMarkers,
    getModelMarkers,
    removeAllMarkers,
    onDidChangeMarkers,
    getModels,
    getModel,
    onDidCreateModel,
    onWillDisposeModel,
    onDidChangeModelLanguage,
    createWebWorker,
    colorizeElement,
    colorize,
    colorizeModelLine,
    tokenize,
    defineTheme,
    setTheme,
    remeasureFonts,
    registerCommand,
    registerLinkOpener,
    registerEditorOpener,
    // enums
    AccessibilitySupport: standaloneEnums.AccessibilitySupport,
    ContentWidgetPositionPreference: standaloneEnums.ContentWidgetPositionPreference,
    CursorChangeReason: standaloneEnums.CursorChangeReason,
    DefaultEndOfLine: standaloneEnums.DefaultEndOfLine,
    EditorAutoIndentStrategy: standaloneEnums.EditorAutoIndentStrategy,
    EditorOption: standaloneEnums.EditorOption,
    EndOfLinePreference: standaloneEnums.EndOfLinePreference,
    EndOfLineSequence: standaloneEnums.EndOfLineSequence,
    MinimapPosition: standaloneEnums.MinimapPosition,
    MinimapSectionHeaderStyle: standaloneEnums.MinimapSectionHeaderStyle,
    MouseTargetType: standaloneEnums.MouseTargetType,
    OverlayWidgetPositionPreference: standaloneEnums.OverlayWidgetPositionPreference,
    OverviewRulerLane: standaloneEnums.OverviewRulerLane,
    GlyphMarginLane: standaloneEnums.GlyphMarginLane,
    RenderLineNumbersType: standaloneEnums.RenderLineNumbersType,
    RenderMinimap: standaloneEnums.RenderMinimap,
    ScrollbarVisibility: standaloneEnums.ScrollbarVisibility,
    ScrollType: standaloneEnums.ScrollType,
    TextEditorCursorBlinkingStyle: standaloneEnums.TextEditorCursorBlinkingStyle,
    TextEditorCursorStyle: standaloneEnums.TextEditorCursorStyle,
    TrackedRangeStickiness: standaloneEnums.TrackedRangeStickiness,
    WrappingIndent: standaloneEnums.WrappingIndent,
    InjectedTextCursorStops: standaloneEnums.InjectedTextCursorStops,
    PositionAffinity: standaloneEnums.PositionAffinity,
    ShowLightbulbIconMode: standaloneEnums.ShowLightbulbIconMode,
    // classes
    ConfigurationChangedEvent,
    BareFontInfo,
    FontInfo,
    TextModelResolvedOptions,
    FindMatch,
    ApplyUpdateResult,
    EditorZoom,
    createMultiFileDiffEditor,
    // vars
    EditorType,
    EditorOptions
  };
}
__name(createMonacoEditorAPI, "createMonacoEditorAPI");
export {
  addCommand,
  addEditorAction,
  addKeybindingRule,
  addKeybindingRules,
  colorize,
  colorizeElement,
  colorizeModelLine,
  create,
  createDiffEditor,
  createModel,
  createMonacoEditorAPI,
  createMultiFileDiffEditor,
  createWebWorker,
  defineTheme,
  getDiffEditors,
  getEditors,
  getModel,
  getModelMarkers,
  getModels,
  onDidChangeMarkers,
  onDidChangeModelLanguage,
  onDidCreateDiffEditor,
  onDidCreateEditor,
  onDidCreateModel,
  onWillDisposeModel,
  registerCommand,
  registerEditorOpener,
  registerLinkOpener,
  remeasureFonts,
  removeAllMarkers,
  setModelLanguage,
  setModelMarkers,
  setTheme,
  tokenize
};
//# sourceMappingURL=standaloneEditor.js.map
