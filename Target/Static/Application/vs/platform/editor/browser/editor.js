var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { addDisposableListener, EventHelper, EventType, getWindow } from "../../../base/browser/dom.js";
import { StandardKeyboardEvent } from "../../../base/browser/keyboardEvent.js";
import { StandardMouseEvent } from "../../../base/browser/mouseEvent.js";
import { DisposableStore } from "../../../base/common/lifecycle.js";
import { isMacintosh } from "../../../base/common/platform.js";
function registerOpenEditorListeners(element, onOpenEditor) {
  const disposables = new DisposableStore();
  disposables.add(addDisposableListener(element, EventType.CLICK, (e) => {
    if (e.detail === 2) {
      return;
    }
    EventHelper.stop(e, true);
    onOpenEditor(toOpenEditorOptions(new StandardMouseEvent(getWindow(element), e)));
  }));
  disposables.add(addDisposableListener(element, EventType.DBLCLICK, (e) => {
    EventHelper.stop(e, true);
    onOpenEditor(toOpenEditorOptions(new StandardMouseEvent(getWindow(element), e), true));
  }));
  disposables.add(addDisposableListener(element, EventType.KEY_DOWN, (e) => {
    const options = toOpenEditorOptions(new StandardKeyboardEvent(e));
    if (!options) {
      return;
    }
    EventHelper.stop(e, true);
    onOpenEditor(options);
  }));
  return disposables;
}
__name(registerOpenEditorListeners, "registerOpenEditorListeners");
function toOpenEditorOptions(event, isDoubleClick) {
  if (event instanceof StandardKeyboardEvent) {
    let preserveFocus = void 0;
    if (event.equals(
      3
      /* KeyCode.Enter */
    ) || isMacintosh && event.equals(
      2048 | 18
      /* KeyCode.DownArrow */
    )) {
      preserveFocus = false;
    } else if (event.equals(
      10
      /* KeyCode.Space */
    )) {
      preserveFocus = true;
    }
    if (typeof preserveFocus === "undefined") {
      return;
    }
    return { editorOptions: { preserveFocus, pinned: !preserveFocus }, openToSide: false };
  } else {
    return { editorOptions: { preserveFocus: !isDoubleClick, pinned: isDoubleClick || event.middleButton }, openToSide: event.ctrlKey || event.metaKey || event.altKey };
  }
}
__name(toOpenEditorOptions, "toOpenEditorOptions");
export {
  registerOpenEditorListeners,
  toOpenEditorOptions
};
//# sourceMappingURL=editor.js.map
