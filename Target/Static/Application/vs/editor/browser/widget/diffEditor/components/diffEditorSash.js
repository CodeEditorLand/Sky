var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Sash } from "../../../../../base/browser/ui/sash/sash.js";
import { Disposable } from "../../../../../base/common/lifecycle.js";
import { autorun, derivedWithSetter, observableValue } from "../../../../../base/common/observable.js";
class SashLayout {
  static {
    __name(this, "SashLayout");
  }
  resetSash() {
    this._sashRatio.set(void 0, void 0);
  }
  constructor(_options, dimensions) {
    this._options = _options;
    this.dimensions = dimensions;
    this.sashLeft = derivedWithSetter(this, (reader) => {
      const ratio = this._sashRatio.read(reader) ?? this._options.splitViewDefaultRatio.read(reader);
      return this._computeSashLeft(ratio, reader);
    }, (value, tx) => {
      const contentWidth = this.dimensions.width.get();
      this._sashRatio.set(value / contentWidth, tx);
    });
    this._sashRatio = observableValue(this, void 0);
  }
  /** @pure */
  _computeSashLeft(desiredRatio, reader) {
    const contentWidth = this.dimensions.width.read(reader);
    const midPoint = Math.floor(this._options.splitViewDefaultRatio.read(reader) * contentWidth);
    const sashLeft = this._options.enableSplitViewResizing.read(reader) ? Math.floor(desiredRatio * contentWidth) : midPoint;
    const MINIMUM_EDITOR_WIDTH = 100;
    if (contentWidth <= MINIMUM_EDITOR_WIDTH * 2) {
      return midPoint;
    }
    if (sashLeft < MINIMUM_EDITOR_WIDTH) {
      return MINIMUM_EDITOR_WIDTH;
    }
    if (sashLeft > contentWidth - MINIMUM_EDITOR_WIDTH) {
      return contentWidth - MINIMUM_EDITOR_WIDTH;
    }
    return sashLeft;
  }
}
class DiffEditorSash extends Disposable {
  static {
    __name(this, "DiffEditorSash");
  }
  constructor(_domNode, _dimensions, _enabled, _boundarySashes, sashLeft, _resetSash) {
    super();
    this._domNode = _domNode;
    this._dimensions = _dimensions;
    this._enabled = _enabled;
    this._boundarySashes = _boundarySashes;
    this.sashLeft = sashLeft;
    this._resetSash = _resetSash;
    this._sash = this._register(new Sash(this._domNode, {
      getVerticalSashTop: /* @__PURE__ */ __name((_sash) => 0, "getVerticalSashTop"),
      getVerticalSashLeft: /* @__PURE__ */ __name((_sash) => this.sashLeft.get(), "getVerticalSashLeft"),
      getVerticalSashHeight: /* @__PURE__ */ __name((_sash) => this._dimensions.height.get(), "getVerticalSashHeight")
    }, {
      orientation: 0
      /* Orientation.VERTICAL */
    }));
    this._startSashPosition = void 0;
    this._register(this._sash.onDidStart(() => {
      this._startSashPosition = this.sashLeft.get();
    }));
    this._register(this._sash.onDidChange((e) => {
      this.sashLeft.set(this._startSashPosition + (e.currentX - e.startX), void 0);
    }));
    this._register(this._sash.onDidEnd(() => this._sash.layout()));
    this._register(this._sash.onDidReset(() => this._resetSash()));
    this._register(autorun((reader) => {
      const sashes = this._boundarySashes.read(reader);
      if (sashes) {
        this._sash.orthogonalEndSash = sashes.bottom;
      }
    }));
    this._register(autorun((reader) => {
      const enabled = this._enabled.read(reader);
      this._sash.state = enabled ? 3 : 0;
      this.sashLeft.read(reader);
      this._dimensions.height.read(reader);
      this._sash.layout();
    }));
  }
}
export {
  DiffEditorSash,
  SashLayout
};
//# sourceMappingURL=diffEditorSash.js.map
