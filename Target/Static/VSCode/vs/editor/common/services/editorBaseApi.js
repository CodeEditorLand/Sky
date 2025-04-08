var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { CancellationTokenSource } from "../../../base/common/cancellation.js";
import { Emitter } from "../../../base/common/event.js";
import { KeyChord, KeyMod as ConstKeyMod } from "../../../base/common/keyCodes.js";
import { URI } from "../../../base/common/uri.js";
import { Position } from "../core/position.js";
import { Range } from "../core/range.js";
import { Selection } from "../core/selection.js";
import { Token } from "../languages.js";
import * as standaloneEnums from "../standalone/standaloneEnums.js";
class KeyMod {
  static {
    __name(this, "KeyMod");
  }
  static CtrlCmd = ConstKeyMod.CtrlCmd;
  static Shift = ConstKeyMod.Shift;
  static Alt = ConstKeyMod.Alt;
  static WinCtrl = ConstKeyMod.WinCtrl;
  static chord(firstPart, secondPart) {
    return KeyChord(firstPart, secondPart);
  }
}
function createMonacoBaseAPI() {
  return {
    editor: void 0,
    // undefined override expected here
    languages: void 0,
    // undefined override expected here
    CancellationTokenSource,
    Emitter,
    KeyCode: standaloneEnums.KeyCode,
    KeyMod,
    Position,
    Range,
    Selection,
    SelectionDirection: standaloneEnums.SelectionDirection,
    MarkerSeverity: standaloneEnums.MarkerSeverity,
    MarkerTag: standaloneEnums.MarkerTag,
    Uri: URI,
    Token
  };
}
__name(createMonacoBaseAPI, "createMonacoBaseAPI");
export {
  KeyMod,
  createMonacoBaseAPI
};
//# sourceMappingURL=editorBaseApi.js.map
