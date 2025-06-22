var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { addDisposableListener, h } from "../../../../../../../base/browser/dom.js";
import { renderIcon } from "../../../../../../../base/browser/ui/iconLabel/iconLabels.js";
import { Codicon } from "../../../../../../../base/common/codicons.js";
import { Disposable } from "../../../../../../../base/common/lifecycle.js";
import { autorun, constObservable } from "../../../../../../../base/common/observable.js";
import { localize } from "../../../../../../../nls.js";
import { buttonBackground, buttonForeground, buttonSeparator } from "../../../../../../../platform/theme/common/colorRegistry.js";
import { registerColor } from "../../../../../../../platform/theme/common/colorUtils.js";
import { OffsetRange } from "../../../../../../common/core/ranges/offsetRange.js";
const inlineEditIndicatorForeground = registerColor("inlineEdit.indicator.foreground", buttonForeground, localize("inlineEdit.indicator.foreground", "Foreground color for the inline edit indicator."));
const inlineEditIndicatorBackground = registerColor("inlineEdit.indicator.background", buttonBackground, localize("inlineEdit.indicator.background", "Background color for the inline edit indicator."));
const inlineEditIndicatorBorder = registerColor("inlineEdit.indicator.border", buttonSeparator, localize("inlineEdit.indicator.border", "Border color for the inline edit indicator."));
class InlineEditsIndicator extends Disposable {
  static {
    __name(this, "InlineEditsIndicator");
  }
  constructor(_editorObs, _state, _model) {
    super();
    this._editorObs = _editorObs;
    this._state = _state;
    this._model = _model;
    this._indicator = h("div.inline-edits-view-indicator", {
      style: {
        position: "absolute",
        overflow: "visible",
        cursor: "pointer"
      }
    }, [
      h("div.icon", {}, [
        renderIcon(Codicon.arrowLeft)
      ]),
      h("div.label", {}, [
        " inline edit"
      ])
    ]);
    this.isHoverVisible = constObservable(false);
    this._register(addDisposableListener(this._indicator.root, "click", () => {
      this._model.get()?.jump();
    }));
    this._register(this._editorObs.createOverlayWidget({
      domNode: this._indicator.root,
      position: constObservable(null),
      allowEditorOverflow: false,
      minContentWidthInPx: constObservable(0)
    }));
    this._register(autorun((reader) => {
      const state = this._state.read(reader);
      if (!state) {
        this._indicator.root.style.visibility = "hidden";
        return;
      }
      this._indicator.root.style.visibility = "";
      const i = this._editorObs.layoutInfo.read(reader);
      const range = new OffsetRange(0, i.height - 30);
      const topEdit = state.editTop;
      this._indicator.root.classList.toggle("top", topEdit < range.start);
      this._indicator.root.classList.toggle("bottom", topEdit > range.endExclusive);
      const showAnyway = state.showAlways;
      this._indicator.root.classList.toggle("visible", showAnyway);
      this._indicator.root.classList.toggle("contained", range.contains(topEdit));
      this._indicator.root.style.top = `${range.clip(topEdit)}px`;
      this._indicator.root.style.right = `${i.minimap.minimapWidth + i.verticalScrollbarWidth}px`;
    }));
  }
}
export {
  InlineEditsIndicator,
  inlineEditIndicatorBackground,
  inlineEditIndicatorBorder,
  inlineEditIndicatorForeground
};
//# sourceMappingURL=indicatorView.js.map
