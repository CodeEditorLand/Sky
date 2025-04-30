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
import { CancellationToken } from "../../../../../base/common/cancellation.js";
import { Disposable } from "../../../../../base/common/lifecycle.js";
import { IThemeService } from "../../../../../platform/theme/common/themeService.js";
import { getColors } from "../color.js";
import { ColorDetector } from "../colorDetector.js";
import { createColorHover, updateColorPresentations, updateEditorModel } from "../colorPickerParticipantUtils.js";
import { ColorPickerWidget } from "../colorPickerWidget.js";
import { Range } from "../../../../common/core/range.js";
import { Dimension } from "../../../../../base/browser/dom.js";
class StandaloneColorPickerHover {
  static {
    __name(this, "StandaloneColorPickerHover");
  }
  constructor(owner, range, model, provider) {
    this.owner = owner;
    this.range = range;
    this.model = model;
    this.provider = provider;
  }
  static fromBaseColor(owner, color) {
    return new StandaloneColorPickerHover(owner, color.range, color.model, color.provider);
  }
}
class StandaloneColorPickerRenderedParts extends Disposable {
  static {
    __name(this, "StandaloneColorPickerRenderedParts");
  }
  constructor(editor, context, colorHover, themeService) {
    super();
    const editorModel = editor.getModel();
    const colorPickerModel = colorHover.model;
    this.color = colorHover.model.color;
    this.colorPicker = this._register(new ColorPickerWidget(
      context.fragment,
      colorPickerModel,
      editor.getOption(
        149
        /* EditorOption.pixelRatio */
      ),
      themeService,
      "standalone"
      /* ColorPickerWidgetType.Standalone */
    ));
    this._register(colorPickerModel.onColorFlushed((color) => {
      this.color = color;
    }));
    this._register(colorPickerModel.onDidChangeColor((color) => {
      updateColorPresentations(editorModel, colorPickerModel, color, colorHover.range, colorHover);
    }));
    let editorUpdatedByColorPicker = false;
    this._register(editor.onDidChangeModelContent((e) => {
      if (editorUpdatedByColorPicker) {
        editorUpdatedByColorPicker = false;
      } else {
        context.hide();
        editor.focus();
      }
    }));
    updateColorPresentations(editorModel, colorPickerModel, this.color, colorHover.range, colorHover);
  }
}
let StandaloneColorPickerParticipant = class StandaloneColorPickerParticipant2 {
  static {
    __name(this, "StandaloneColorPickerParticipant");
  }
  constructor(_editor, _themeService) {
    this._editor = _editor;
    this._themeService = _themeService;
    this.hoverOrdinal = 2;
  }
  async createColorHover(defaultColorInfo, defaultColorProvider, colorProviderRegistry) {
    if (!this._editor.hasModel()) {
      return null;
    }
    const colorDetector = ColorDetector.get(this._editor);
    if (!colorDetector) {
      return null;
    }
    const colors = await getColors(colorProviderRegistry, this._editor.getModel(), CancellationToken.None);
    let foundColorInfo = null;
    let foundColorProvider = null;
    for (const colorData of colors) {
      const colorInfo2 = colorData.colorInfo;
      if (Range.containsRange(colorInfo2.range, defaultColorInfo.range)) {
        foundColorInfo = colorInfo2;
        foundColorProvider = colorData.provider;
      }
    }
    const colorInfo = foundColorInfo ?? defaultColorInfo;
    const colorProvider = foundColorProvider ?? defaultColorProvider;
    const foundInEditor = !!foundColorInfo;
    const colorHover = StandaloneColorPickerHover.fromBaseColor(this, await createColorHover(this._editor.getModel(), colorInfo, colorProvider));
    return { colorHover, foundInEditor };
  }
  async updateEditorModel(colorHoverData) {
    if (!this._editor.hasModel()) {
      return;
    }
    const colorPickerModel = colorHoverData.model;
    let range = new Range(colorHoverData.range.startLineNumber, colorHoverData.range.startColumn, colorHoverData.range.endLineNumber, colorHoverData.range.endColumn);
    if (this._color) {
      await updateColorPresentations(this._editor.getModel(), colorPickerModel, this._color, range, colorHoverData);
      range = updateEditorModel(this._editor, range, colorPickerModel);
    }
  }
  renderHoverParts(context, hoverParts) {
    if (hoverParts.length === 0 || !this._editor.hasModel()) {
      return void 0;
    }
    this._setMinimumDimensions(context);
    this._renderedParts = new StandaloneColorPickerRenderedParts(this._editor, context, hoverParts[0], this._themeService);
    return this._renderedParts;
  }
  _setMinimumDimensions(context) {
    const minimumHeight = this._editor.getOption(
      68
      /* EditorOption.lineHeight */
    ) + 8;
    context.setMinimumDimensions(new Dimension(302, minimumHeight));
  }
  get _color() {
    return this._renderedParts?.color;
  }
};
StandaloneColorPickerParticipant = __decorate([
  __param(1, IThemeService)
], StandaloneColorPickerParticipant);
export {
  StandaloneColorPickerHover,
  StandaloneColorPickerParticipant,
  StandaloneColorPickerRenderedParts
};
//# sourceMappingURL=standaloneColorPickerParticipant.js.map
