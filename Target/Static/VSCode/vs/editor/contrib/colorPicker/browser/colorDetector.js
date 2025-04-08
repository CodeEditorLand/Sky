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
import { CancelablePromise, createCancelablePromise, TimeoutTimer } from "../../../../base/common/async.js";
import { RGBA } from "../../../../base/common/color.js";
import { onUnexpectedError } from "../../../../base/common/errors.js";
import { Emitter, Event } from "../../../../base/common/event.js";
import { Disposable, DisposableStore } from "../../../../base/common/lifecycle.js";
import { StopWatch } from "../../../../base/common/stopwatch.js";
import { noBreakWhitespace } from "../../../../base/common/strings.js";
import { ICodeEditor } from "../../../browser/editorBrowser.js";
import { DynamicCssRules } from "../../../browser/editorDom.js";
import { EditorOption } from "../../../common/config/editorOptions.js";
import { Position } from "../../../common/core/position.js";
import { Range } from "../../../common/core/range.js";
import { IEditorContribution, IEditorDecorationsCollection } from "../../../common/editorCommon.js";
import { IModelDecoration, IModelDeltaDecoration } from "../../../common/model.js";
import { ModelDecorationOptions } from "../../../common/model/textModel.js";
import { IFeatureDebounceInformation, ILanguageFeatureDebounceService } from "../../../common/services/languageFeatureDebounce.js";
import { ILanguageFeaturesService } from "../../../common/services/languageFeatures.js";
import { getColors, IColorData } from "./color.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
const ColorDecorationInjectedTextMarker = /* @__PURE__ */ Object.create({});
let ColorDetector = class extends Disposable {
  constructor(_editor, _configurationService, _languageFeaturesService, languageFeatureDebounceService) {
    super();
    this._editor = _editor;
    this._configurationService = _configurationService;
    this._languageFeaturesService = _languageFeaturesService;
    this._colorDecoratorIds = this._editor.createDecorationsCollection();
    this._ruleFactory = new DynamicCssRules(this._editor);
    this._debounceInformation = languageFeatureDebounceService.for(_languageFeaturesService.colorProvider, "Document Colors", { min: ColorDetector.RECOMPUTE_TIME });
    this._register(_editor.onDidChangeModel(() => {
      this._isColorDecoratorsEnabled = this.isEnabled();
      this.updateColors();
    }));
    this._register(_editor.onDidChangeModelLanguage(() => this.updateColors()));
    this._register(_languageFeaturesService.colorProvider.onDidChange(() => this.updateColors()));
    this._register(_editor.onDidChangeConfiguration((e) => {
      const prevIsEnabled = this._isColorDecoratorsEnabled;
      this._isColorDecoratorsEnabled = this.isEnabled();
      this._defaultColorDecoratorsEnablement = this._editor.getOption(EditorOption.defaultColorDecorators);
      const updatedColorDecoratorsSetting = prevIsEnabled !== this._isColorDecoratorsEnabled || e.hasChanged(EditorOption.colorDecoratorsLimit);
      const updatedDefaultColorDecoratorsSetting = e.hasChanged(EditorOption.defaultColorDecorators);
      if (updatedColorDecoratorsSetting || updatedDefaultColorDecoratorsSetting) {
        if (this._isColorDecoratorsEnabled) {
          this.updateColors();
        } else {
          this.removeAllDecorations();
        }
      }
    }));
    this._timeoutTimer = null;
    this._computePromise = null;
    this._isColorDecoratorsEnabled = this.isEnabled();
    this._defaultColorDecoratorsEnablement = this._editor.getOption(EditorOption.defaultColorDecorators);
    this.updateColors();
  }
  static {
    __name(this, "ColorDetector");
  }
  static ID = "editor.contrib.colorDetector";
  static RECOMPUTE_TIME = 1e3;
  // ms
  _localToDispose = this._register(new DisposableStore());
  _computePromise;
  _timeoutTimer;
  _debounceInformation;
  _decorationsIds = [];
  _colorDatas = /* @__PURE__ */ new Map();
  _colorDecoratorIds;
  _isColorDecoratorsEnabled;
  _defaultColorDecoratorsEnablement;
  _ruleFactory;
  _decoratorLimitReporter = new DecoratorLimitReporter();
  isEnabled() {
    const model = this._editor.getModel();
    if (!model) {
      return false;
    }
    const languageId = model.getLanguageId();
    const deprecatedConfig = this._configurationService.getValue(languageId);
    if (deprecatedConfig && typeof deprecatedConfig === "object") {
      const colorDecorators = deprecatedConfig["colorDecorators"];
      if (colorDecorators && colorDecorators["enable"] !== void 0 && !colorDecorators["enable"]) {
        return colorDecorators["enable"];
      }
    }
    return this._editor.getOption(EditorOption.colorDecorators);
  }
  get limitReporter() {
    return this._decoratorLimitReporter;
  }
  static get(editor) {
    return editor.getContribution(this.ID);
  }
  dispose() {
    this.stop();
    this.removeAllDecorations();
    super.dispose();
  }
  updateColors() {
    this.stop();
    if (!this._isColorDecoratorsEnabled) {
      return;
    }
    const model = this._editor.getModel();
    if (!model || !this._languageFeaturesService.colorProvider.has(model)) {
      return;
    }
    this._localToDispose.add(this._editor.onDidChangeModelContent(() => {
      if (!this._timeoutTimer) {
        this._timeoutTimer = new TimeoutTimer();
        this._timeoutTimer.cancelAndSet(() => {
          this._timeoutTimer = null;
          this.beginCompute();
        }, this._debounceInformation.get(model));
      }
    }));
    this.beginCompute();
  }
  async beginCompute() {
    this._computePromise = createCancelablePromise(async (token) => {
      const model = this._editor.getModel();
      if (!model) {
        return [];
      }
      const sw = new StopWatch(false);
      const colors = await getColors(this._languageFeaturesService.colorProvider, model, token, this._defaultColorDecoratorsEnablement);
      this._debounceInformation.update(model, sw.elapsed());
      return colors;
    });
    try {
      const colors = await this._computePromise;
      this.updateDecorations(colors);
      this.updateColorDecorators(colors);
      this._computePromise = null;
    } catch (e) {
      onUnexpectedError(e);
    }
  }
  stop() {
    if (this._timeoutTimer) {
      this._timeoutTimer.cancel();
      this._timeoutTimer = null;
    }
    if (this._computePromise) {
      this._computePromise.cancel();
      this._computePromise = null;
    }
    this._localToDispose.clear();
  }
  updateDecorations(colorDatas) {
    const decorations = colorDatas.map((c) => ({
      range: {
        startLineNumber: c.colorInfo.range.startLineNumber,
        startColumn: c.colorInfo.range.startColumn,
        endLineNumber: c.colorInfo.range.endLineNumber,
        endColumn: c.colorInfo.range.endColumn
      },
      options: ModelDecorationOptions.EMPTY
    }));
    this._editor.changeDecorations((changeAccessor) => {
      this._decorationsIds = changeAccessor.deltaDecorations(this._decorationsIds, decorations);
      this._colorDatas = /* @__PURE__ */ new Map();
      this._decorationsIds.forEach((id, i) => this._colorDatas.set(id, colorDatas[i]));
    });
  }
  _colorDecorationClassRefs = this._register(new DisposableStore());
  updateColorDecorators(colorData) {
    this._colorDecorationClassRefs.clear();
    const decorations = [];
    const limit = this._editor.getOption(EditorOption.colorDecoratorsLimit);
    for (let i = 0; i < colorData.length && decorations.length < limit; i++) {
      const { red, green, blue, alpha } = colorData[i].colorInfo.color;
      const rgba = new RGBA(Math.round(red * 255), Math.round(green * 255), Math.round(blue * 255), alpha);
      const color = `rgba(${rgba.r}, ${rgba.g}, ${rgba.b}, ${rgba.a})`;
      const ref = this._colorDecorationClassRefs.add(
        this._ruleFactory.createClassNameRef({
          backgroundColor: color
        })
      );
      decorations.push({
        range: {
          startLineNumber: colorData[i].colorInfo.range.startLineNumber,
          startColumn: colorData[i].colorInfo.range.startColumn,
          endLineNumber: colorData[i].colorInfo.range.endLineNumber,
          endColumn: colorData[i].colorInfo.range.endColumn
        },
        options: {
          description: "colorDetector",
          before: {
            content: noBreakWhitespace,
            inlineClassName: `${ref.className} colorpicker-color-decoration`,
            inlineClassNameAffectsLetterSpacing: true,
            attachedData: ColorDecorationInjectedTextMarker
          }
        }
      });
    }
    const limited = limit < colorData.length ? limit : false;
    this._decoratorLimitReporter.update(colorData.length, limited);
    this._colorDecoratorIds.set(decorations);
  }
  removeAllDecorations() {
    this._editor.removeDecorations(this._decorationsIds);
    this._decorationsIds = [];
    this._colorDecoratorIds.clear();
    this._colorDecorationClassRefs.clear();
  }
  getColorData(position) {
    const model = this._editor.getModel();
    if (!model) {
      return null;
    }
    const decorations = model.getDecorationsInRange(Range.fromPositions(position, position)).filter((d) => this._colorDatas.has(d.id));
    if (decorations.length === 0) {
      return null;
    }
    return this._colorDatas.get(decorations[0].id);
  }
  isColorDecoration(decoration) {
    return this._colorDecoratorIds.has(decoration);
  }
};
ColorDetector = __decorateClass([
  __decorateParam(1, IConfigurationService),
  __decorateParam(2, ILanguageFeaturesService),
  __decorateParam(3, ILanguageFeatureDebounceService)
], ColorDetector);
class DecoratorLimitReporter {
  static {
    __name(this, "DecoratorLimitReporter");
  }
  _onDidChange = new Emitter();
  onDidChange = this._onDidChange.event;
  _computed = 0;
  _limited = false;
  get computed() {
    return this._computed;
  }
  get limited() {
    return this._limited;
  }
  update(computed, limited) {
    if (computed !== this._computed || limited !== this._limited) {
      this._computed = computed;
      this._limited = limited;
      this._onDidChange.fire();
    }
  }
}
export {
  ColorDecorationInjectedTextMarker,
  ColorDetector,
  DecoratorLimitReporter
};
//# sourceMappingURL=colorDetector.js.map
