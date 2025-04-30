var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { KeyCodeChord, Keybinding } from "../../../../base/common/keybindings.js";
import { USLayoutResolvedKeybinding } from "../../../../platform/keybinding/common/usLayoutResolvedKeybinding.js";
class FallbackKeyboardMapper {
  static {
    __name(this, "FallbackKeyboardMapper");
  }
  constructor(_mapAltGrToCtrlAlt, _OS) {
    this._mapAltGrToCtrlAlt = _mapAltGrToCtrlAlt;
    this._OS = _OS;
  }
  dumpDebugInfo() {
    return "FallbackKeyboardMapper dispatching on keyCode";
  }
  resolveKeyboardEvent(keyboardEvent) {
    const ctrlKey = keyboardEvent.ctrlKey || this._mapAltGrToCtrlAlt && keyboardEvent.altGraphKey;
    const altKey = keyboardEvent.altKey || this._mapAltGrToCtrlAlt && keyboardEvent.altGraphKey;
    const chord = new KeyCodeChord(ctrlKey, keyboardEvent.shiftKey, altKey, keyboardEvent.metaKey, keyboardEvent.keyCode);
    const result = this.resolveKeybinding(new Keybinding([chord]));
    return result[0];
  }
  resolveKeybinding(keybinding) {
    return USLayoutResolvedKeybinding.resolveKeybinding(keybinding, this._OS);
  }
}
export {
  FallbackKeyboardMapper
};
//# sourceMappingURL=fallbackKeyboardMapper.js.map
