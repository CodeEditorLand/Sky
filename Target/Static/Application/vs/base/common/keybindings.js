var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { illegalArgument } from "./errors.js";
var BinaryKeybindingsMask;
(function(BinaryKeybindingsMask2) {
  BinaryKeybindingsMask2[BinaryKeybindingsMask2["CtrlCmd"] = 2048] = "CtrlCmd";
  BinaryKeybindingsMask2[BinaryKeybindingsMask2["Shift"] = 1024] = "Shift";
  BinaryKeybindingsMask2[BinaryKeybindingsMask2["Alt"] = 512] = "Alt";
  BinaryKeybindingsMask2[BinaryKeybindingsMask2["WinCtrl"] = 256] = "WinCtrl";
  BinaryKeybindingsMask2[BinaryKeybindingsMask2["KeyCode"] = 255] = "KeyCode";
})(BinaryKeybindingsMask || (BinaryKeybindingsMask = {}));
function decodeKeybinding(keybinding, OS) {
  if (typeof keybinding === "number") {
    if (keybinding === 0) {
      return null;
    }
    const firstChord = (keybinding & 65535) >>> 0;
    const secondChord = (keybinding & 4294901760) >>> 16;
    if (secondChord !== 0) {
      return new Keybinding([
        createSimpleKeybinding(firstChord, OS),
        createSimpleKeybinding(secondChord, OS)
      ]);
    }
    return new Keybinding([createSimpleKeybinding(firstChord, OS)]);
  } else {
    const chords = [];
    for (let i = 0; i < keybinding.length; i++) {
      chords.push(createSimpleKeybinding(keybinding[i], OS));
    }
    return new Keybinding(chords);
  }
}
__name(decodeKeybinding, "decodeKeybinding");
function createSimpleKeybinding(keybinding, OS) {
  const ctrlCmd = keybinding & 2048 ? true : false;
  const winCtrl = keybinding & 256 ? true : false;
  const ctrlKey = OS === 2 ? winCtrl : ctrlCmd;
  const shiftKey = keybinding & 1024 ? true : false;
  const altKey = keybinding & 512 ? true : false;
  const metaKey = OS === 2 ? ctrlCmd : winCtrl;
  const keyCode = keybinding & 255;
  return new KeyCodeChord(ctrlKey, shiftKey, altKey, metaKey, keyCode);
}
__name(createSimpleKeybinding, "createSimpleKeybinding");
class KeyCodeChord {
  static {
    __name(this, "KeyCodeChord");
  }
  constructor(ctrlKey, shiftKey, altKey, metaKey, keyCode) {
    this.ctrlKey = ctrlKey;
    this.shiftKey = shiftKey;
    this.altKey = altKey;
    this.metaKey = metaKey;
    this.keyCode = keyCode;
  }
  equals(other) {
    return other instanceof KeyCodeChord && this.ctrlKey === other.ctrlKey && this.shiftKey === other.shiftKey && this.altKey === other.altKey && this.metaKey === other.metaKey && this.keyCode === other.keyCode;
  }
  getHashCode() {
    const ctrl = this.ctrlKey ? "1" : "0";
    const shift = this.shiftKey ? "1" : "0";
    const alt = this.altKey ? "1" : "0";
    const meta = this.metaKey ? "1" : "0";
    return `K${ctrl}${shift}${alt}${meta}${this.keyCode}`;
  }
  isModifierKey() {
    return this.keyCode === 0 || this.keyCode === 5 || this.keyCode === 57 || this.keyCode === 6 || this.keyCode === 4;
  }
  toKeybinding() {
    return new Keybinding([this]);
  }
  /**
   * Does this keybinding refer to the key code of a modifier and it also has the modifier flag?
   */
  isDuplicateModifierCase() {
    return this.ctrlKey && this.keyCode === 5 || this.shiftKey && this.keyCode === 4 || this.altKey && this.keyCode === 6 || this.metaKey && this.keyCode === 57;
  }
}
class ScanCodeChord {
  static {
    __name(this, "ScanCodeChord");
  }
  constructor(ctrlKey, shiftKey, altKey, metaKey, scanCode) {
    this.ctrlKey = ctrlKey;
    this.shiftKey = shiftKey;
    this.altKey = altKey;
    this.metaKey = metaKey;
    this.scanCode = scanCode;
  }
  equals(other) {
    return other instanceof ScanCodeChord && this.ctrlKey === other.ctrlKey && this.shiftKey === other.shiftKey && this.altKey === other.altKey && this.metaKey === other.metaKey && this.scanCode === other.scanCode;
  }
  getHashCode() {
    const ctrl = this.ctrlKey ? "1" : "0";
    const shift = this.shiftKey ? "1" : "0";
    const alt = this.altKey ? "1" : "0";
    const meta = this.metaKey ? "1" : "0";
    return `S${ctrl}${shift}${alt}${meta}${this.scanCode}`;
  }
  /**
   * Does this keybinding refer to the key code of a modifier and it also has the modifier flag?
   */
  isDuplicateModifierCase() {
    return this.ctrlKey && (this.scanCode === 157 || this.scanCode === 161) || this.shiftKey && (this.scanCode === 158 || this.scanCode === 162) || this.altKey && (this.scanCode === 159 || this.scanCode === 163) || this.metaKey && (this.scanCode === 160 || this.scanCode === 164);
  }
}
class Keybinding {
  static {
    __name(this, "Keybinding");
  }
  constructor(chords) {
    if (chords.length === 0) {
      throw illegalArgument(`chords`);
    }
    this.chords = chords;
  }
  getHashCode() {
    let result = "";
    for (let i = 0, len = this.chords.length; i < len; i++) {
      if (i !== 0) {
        result += ";";
      }
      result += this.chords[i].getHashCode();
    }
    return result;
  }
  equals(other) {
    if (other === null) {
      return false;
    }
    if (this.chords.length !== other.chords.length) {
      return false;
    }
    for (let i = 0; i < this.chords.length; i++) {
      if (!this.chords[i].equals(other.chords[i])) {
        return false;
      }
    }
    return true;
  }
}
class ResolvedChord {
  static {
    __name(this, "ResolvedChord");
  }
  constructor(ctrlKey, shiftKey, altKey, metaKey, keyLabel, keyAriaLabel) {
    this.ctrlKey = ctrlKey;
    this.shiftKey = shiftKey;
    this.altKey = altKey;
    this.metaKey = metaKey;
    this.keyLabel = keyLabel;
    this.keyAriaLabel = keyAriaLabel;
  }
}
class ResolvedKeybinding {
  static {
    __name(this, "ResolvedKeybinding");
  }
}
export {
  KeyCodeChord,
  Keybinding,
  ResolvedChord,
  ResolvedKeybinding,
  ScanCodeChord,
  createSimpleKeybinding,
  decodeKeybinding
};
//# sourceMappingURL=keybindings.js.map
