var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Color } from "../../../../base/common/color.js";
import { Emitter, Event } from "../../../../base/common/event.js";
import { IColorPresentation } from "../../../common/languages.js";
class ColorPickerModel {
  constructor(color, availableColorPresentations, presentationIndex) {
    this.presentationIndex = presentationIndex;
    this.originalColor = color;
    this._color = color;
    this._colorPresentations = availableColorPresentations;
  }
  static {
    __name(this, "ColorPickerModel");
  }
  originalColor;
  _color;
  get color() {
    return this._color;
  }
  set color(color) {
    if (this._color.equals(color)) {
      return;
    }
    this._color = color;
    this._onDidChangeColor.fire(color);
  }
  get presentation() {
    return this.colorPresentations[this.presentationIndex];
  }
  _colorPresentations;
  get colorPresentations() {
    return this._colorPresentations;
  }
  set colorPresentations(colorPresentations) {
    this._colorPresentations = colorPresentations;
    if (this.presentationIndex > colorPresentations.length - 1) {
      this.presentationIndex = 0;
    }
    this._onDidChangePresentation.fire(this.presentation);
  }
  _onColorFlushed = new Emitter();
  onColorFlushed = this._onColorFlushed.event;
  _onDidChangeColor = new Emitter();
  onDidChangeColor = this._onDidChangeColor.event;
  _onDidChangePresentation = new Emitter();
  onDidChangePresentation = this._onDidChangePresentation.event;
  selectNextColorPresentation() {
    this.presentationIndex = (this.presentationIndex + 1) % this.colorPresentations.length;
    this.flushColor();
    this._onDidChangePresentation.fire(this.presentation);
  }
  guessColorPresentation(color, originalText) {
    let presentationIndex = -1;
    for (let i = 0; i < this.colorPresentations.length; i++) {
      if (originalText.toLowerCase() === this.colorPresentations[i].label) {
        presentationIndex = i;
        break;
      }
    }
    if (presentationIndex === -1) {
      const originalTextPrefix = originalText.split("(")[0].toLowerCase();
      for (let i = 0; i < this.colorPresentations.length; i++) {
        if (this.colorPresentations[i].label.toLowerCase().startsWith(originalTextPrefix)) {
          presentationIndex = i;
          break;
        }
      }
    }
    if (presentationIndex !== -1 && presentationIndex !== this.presentationIndex) {
      this.presentationIndex = presentationIndex;
      this._onDidChangePresentation.fire(this.presentation);
    }
  }
  flushColor() {
    this._onColorFlushed.fire(this._color);
  }
}
export {
  ColorPickerModel
};
//# sourceMappingURL=colorPickerModel.js.map
