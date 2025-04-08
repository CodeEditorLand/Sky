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
import * as browser from "../../../base/browser/browser.js";
import * as arrays from "../../../base/common/arrays.js";
import { Emitter, Event } from "../../../base/common/event.js";
import { Disposable } from "../../../base/common/lifecycle.js";
import * as objects from "../../../base/common/objects.js";
import * as platform from "../../../base/common/platform.js";
import { ElementSizeObserver } from "./elementSizeObserver.js";
import { FontMeasurements } from "./fontMeasurements.js";
import { migrateOptions } from "./migrateOptions.js";
import { TabFocus } from "./tabFocus.js";
import { ComputeOptionsMemory, ConfigurationChangedEvent, EditorOption, editorOptionsRegistry, FindComputedEditorOptionValueById, IComputedEditorOptions, IEditorOptions, IEnvironmentalOptions } from "../../common/config/editorOptions.js";
import { EditorZoom } from "../../common/config/editorZoom.js";
import { BareFontInfo, FontInfo, IValidatedEditorOptions } from "../../common/config/fontInfo.js";
import { IDimension } from "../../common/core/dimension.js";
import { IEditorConfiguration } from "../../common/config/editorConfiguration.js";
import { AccessibilitySupport, IAccessibilityService } from "../../../platform/accessibility/common/accessibility.js";
import { getWindow, getWindowById } from "../../../base/browser/dom.js";
import { PixelRatio } from "../../../base/browser/pixelRatio.js";
import { MenuId } from "../../../platform/actions/common/actions.js";
import { InputMode } from "../../common/inputMode.js";
let EditorConfiguration = class extends Disposable {
  constructor(isSimpleWidget, contextMenuId, options, container, _accessibilityService) {
    super();
    this._accessibilityService = _accessibilityService;
    this.isSimpleWidget = isSimpleWidget;
    this.contextMenuId = contextMenuId;
    this._containerObserver = this._register(new ElementSizeObserver(container, options.dimension));
    this._targetWindowId = getWindow(container).vscodeWindowId;
    this._rawOptions = deepCloneAndMigrateOptions(options);
    this._validatedOptions = EditorOptionsUtil.validateOptions(this._rawOptions);
    this.options = this._computeOptions();
    if (this.options.get(EditorOption.automaticLayout)) {
      this._containerObserver.startObserving();
    }
    this._register(EditorZoom.onDidChangeZoomLevel(() => this._recomputeOptions()));
    this._register(TabFocus.onDidChangeTabFocus(() => this._recomputeOptions()));
    this._register(this._containerObserver.onDidChange(() => this._recomputeOptions()));
    this._register(FontMeasurements.onDidChange(() => this._recomputeOptions()));
    this._register(PixelRatio.getInstance(getWindow(container)).onDidChange(() => this._recomputeOptions()));
    this._register(this._accessibilityService.onDidChangeScreenReaderOptimized(() => this._recomputeOptions()));
    this._register(InputMode.onDidChangeInputMode(() => this._recomputeOptions()));
  }
  static {
    __name(this, "EditorConfiguration");
  }
  _onDidChange = this._register(new Emitter());
  onDidChange = this._onDidChange.event;
  _onDidChangeFast = this._register(new Emitter());
  onDidChangeFast = this._onDidChangeFast.event;
  isSimpleWidget;
  contextMenuId;
  _containerObserver;
  _isDominatedByLongLines = false;
  _viewLineCount = 1;
  _lineNumbersDigitCount = 1;
  _reservedHeight = 0;
  _glyphMarginDecorationLaneCount = 1;
  _targetWindowId;
  _computeOptionsMemory = new ComputeOptionsMemory();
  /**
   * Raw options as they were passed in and merged with all calls to `updateOptions`.
   */
  _rawOptions;
  /**
   * Validated version of `_rawOptions`.
   */
  _validatedOptions;
  /**
   * Complete options which are a combination of passed in options and env values.
   */
  options;
  _recomputeOptions() {
    const newOptions = this._computeOptions();
    const changeEvent = EditorOptionsUtil.checkEquals(this.options, newOptions);
    if (changeEvent === null) {
      return;
    }
    this.options = newOptions;
    this._onDidChangeFast.fire(changeEvent);
    this._onDidChange.fire(changeEvent);
  }
  _computeOptions() {
    const partialEnv = this._readEnvConfiguration();
    const bareFontInfo = BareFontInfo.createFromValidatedSettings(this._validatedOptions, partialEnv.pixelRatio, this.isSimpleWidget);
    const fontInfo = this._readFontInfo(bareFontInfo);
    const env = {
      memory: this._computeOptionsMemory,
      outerWidth: partialEnv.outerWidth,
      outerHeight: partialEnv.outerHeight - this._reservedHeight,
      fontInfo,
      extraEditorClassName: partialEnv.extraEditorClassName,
      isDominatedByLongLines: this._isDominatedByLongLines,
      viewLineCount: this._viewLineCount,
      lineNumbersDigitCount: this._lineNumbersDigitCount,
      emptySelectionClipboard: partialEnv.emptySelectionClipboard,
      pixelRatio: partialEnv.pixelRatio,
      tabFocusMode: TabFocus.getTabFocusMode(),
      inputMode: InputMode.getInputMode(),
      accessibilitySupport: partialEnv.accessibilitySupport,
      glyphMarginDecorationLaneCount: this._glyphMarginDecorationLaneCount
    };
    return EditorOptionsUtil.computeOptions(this._validatedOptions, env);
  }
  _readEnvConfiguration() {
    return {
      extraEditorClassName: getExtraEditorClassName(),
      outerWidth: this._containerObserver.getWidth(),
      outerHeight: this._containerObserver.getHeight(),
      emptySelectionClipboard: browser.isWebKit || browser.isFirefox,
      pixelRatio: PixelRatio.getInstance(getWindowById(this._targetWindowId, true).window).value,
      accessibilitySupport: this._accessibilityService.isScreenReaderOptimized() ? AccessibilitySupport.Enabled : this._accessibilityService.getAccessibilitySupport()
    };
  }
  _readFontInfo(bareFontInfo) {
    return FontMeasurements.readFontInfo(getWindowById(this._targetWindowId, true).window, bareFontInfo);
  }
  getRawOptions() {
    return this._rawOptions;
  }
  updateOptions(_newOptions) {
    const newOptions = deepCloneAndMigrateOptions(_newOptions);
    const didChange = EditorOptionsUtil.applyUpdate(this._rawOptions, newOptions);
    if (!didChange) {
      return;
    }
    this._validatedOptions = EditorOptionsUtil.validateOptions(this._rawOptions);
    this._recomputeOptions();
  }
  observeContainer(dimension) {
    this._containerObserver.observe(dimension);
  }
  setIsDominatedByLongLines(isDominatedByLongLines) {
    if (this._isDominatedByLongLines === isDominatedByLongLines) {
      return;
    }
    this._isDominatedByLongLines = isDominatedByLongLines;
    this._recomputeOptions();
  }
  setModelLineCount(modelLineCount) {
    const lineNumbersDigitCount = digitCount(modelLineCount);
    if (this._lineNumbersDigitCount === lineNumbersDigitCount) {
      return;
    }
    this._lineNumbersDigitCount = lineNumbersDigitCount;
    this._recomputeOptions();
  }
  setViewLineCount(viewLineCount) {
    if (this._viewLineCount === viewLineCount) {
      return;
    }
    this._viewLineCount = viewLineCount;
    this._recomputeOptions();
  }
  setReservedHeight(reservedHeight) {
    if (this._reservedHeight === reservedHeight) {
      return;
    }
    this._reservedHeight = reservedHeight;
    this._recomputeOptions();
  }
  setGlyphMarginDecorationLaneCount(decorationLaneCount) {
    if (this._glyphMarginDecorationLaneCount === decorationLaneCount) {
      return;
    }
    this._glyphMarginDecorationLaneCount = decorationLaneCount;
    this._recomputeOptions();
  }
};
EditorConfiguration = __decorateClass([
  __decorateParam(4, IAccessibilityService)
], EditorConfiguration);
function digitCount(n) {
  let r = 0;
  while (n) {
    n = Math.floor(n / 10);
    r++;
  }
  return r ? r : 1;
}
__name(digitCount, "digitCount");
function getExtraEditorClassName() {
  let extra = "";
  if (!browser.isSafari && !browser.isWebkitWebView) {
    extra += "no-user-select ";
  }
  if (browser.isSafari) {
    extra += "no-minimap-shadow ";
    extra += "enable-user-select ";
  }
  if (platform.isMacintosh) {
    extra += "mac ";
  }
  return extra;
}
__name(getExtraEditorClassName, "getExtraEditorClassName");
class ValidatedEditorOptions {
  static {
    __name(this, "ValidatedEditorOptions");
  }
  _values = [];
  _read(option) {
    return this._values[option];
  }
  get(id) {
    return this._values[id];
  }
  _write(option, value) {
    this._values[option] = value;
  }
}
class ComputedEditorOptions {
  static {
    __name(this, "ComputedEditorOptions");
  }
  _values = [];
  _read(id) {
    if (id >= this._values.length) {
      throw new Error("Cannot read uninitialized value");
    }
    return this._values[id];
  }
  get(id) {
    return this._read(id);
  }
  _write(id, value) {
    this._values[id] = value;
  }
}
class EditorOptionsUtil {
  static {
    __name(this, "EditorOptionsUtil");
  }
  static validateOptions(options) {
    const result = new ValidatedEditorOptions();
    for (const editorOption of editorOptionsRegistry) {
      const value = editorOption.name === "_never_" ? void 0 : options[editorOption.name];
      result._write(editorOption.id, editorOption.validate(value));
    }
    return result;
  }
  static computeOptions(options, env) {
    const result = new ComputedEditorOptions();
    for (const editorOption of editorOptionsRegistry) {
      result._write(editorOption.id, editorOption.compute(env, result, options._read(editorOption.id)));
    }
    return result;
  }
  static _deepEquals(a, b) {
    if (typeof a !== "object" || typeof b !== "object" || !a || !b) {
      return a === b;
    }
    if (Array.isArray(a) || Array.isArray(b)) {
      return Array.isArray(a) && Array.isArray(b) ? arrays.equals(a, b) : false;
    }
    if (Object.keys(a).length !== Object.keys(b).length) {
      return false;
    }
    for (const key in a) {
      if (!EditorOptionsUtil._deepEquals(a[key], b[key])) {
        return false;
      }
    }
    return true;
  }
  static checkEquals(a, b) {
    const result = [];
    let somethingChanged = false;
    for (const editorOption of editorOptionsRegistry) {
      const changed = !EditorOptionsUtil._deepEquals(a._read(editorOption.id), b._read(editorOption.id));
      result[editorOption.id] = changed;
      if (changed) {
        somethingChanged = true;
      }
    }
    return somethingChanged ? new ConfigurationChangedEvent(result) : null;
  }
  /**
   * Returns true if something changed.
   * Modifies `options`.
  */
  static applyUpdate(options, update) {
    let changed = false;
    for (const editorOption of editorOptionsRegistry) {
      if (update.hasOwnProperty(editorOption.name)) {
        const result = editorOption.applyUpdate(options[editorOption.name], update[editorOption.name]);
        options[editorOption.name] = result.newValue;
        changed = changed || result.didChange;
      }
    }
    return changed;
  }
}
function deepCloneAndMigrateOptions(_options) {
  const options = objects.deepClone(_options);
  migrateOptions(options);
  return options;
}
__name(deepCloneAndMigrateOptions, "deepCloneAndMigrateOptions");
export {
  ComputedEditorOptions,
  EditorConfiguration
};
//# sourceMappingURL=editorConfiguration.js.map
