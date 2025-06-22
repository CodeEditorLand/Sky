var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
class CachedKeyboardMapper {
  static {
    __name(this, "CachedKeyboardMapper");
  }
  constructor(actual) {
    this._actual = actual;
    this._cache = /* @__PURE__ */ new Map();
  }
  dumpDebugInfo() {
    return this._actual.dumpDebugInfo();
  }
  resolveKeyboardEvent(keyboardEvent) {
    return this._actual.resolveKeyboardEvent(keyboardEvent);
  }
  resolveKeybinding(keybinding) {
    const hashCode = keybinding.getHashCode();
    const resolved = this._cache.get(hashCode);
    if (!resolved) {
      const r = this._actual.resolveKeybinding(keybinding);
      this._cache.set(hashCode, r);
      return r;
    }
    return resolved;
  }
}
export {
  CachedKeyboardMapper
};
//# sourceMappingURL=keyboardMapper.js.map
