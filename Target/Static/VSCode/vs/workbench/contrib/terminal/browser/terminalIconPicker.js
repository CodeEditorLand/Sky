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
import { Dimension, getActiveDocument } from "../../../../base/browser/dom.js";
import { HoverPosition } from "../../../../base/browser/ui/hover/hoverWidget.js";
import { codiconsLibrary } from "../../../../base/common/codiconsLibrary.js";
import { Lazy } from "../../../../base/common/lazy.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
import { IHoverService } from "../../../../platform/hover/browser/hover.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { defaultInputBoxStyles } from "../../../../platform/theme/browser/defaultStyles.js";
import { getIconRegistry, IconContribution } from "../../../../platform/theme/common/iconRegistry.js";
import { WorkbenchIconSelectBox } from "../../../services/userDataProfile/browser/iconSelectBox.js";
const icons = new Lazy(() => {
  const iconDefinitions = getIconRegistry().getIcons();
  const includedChars = /* @__PURE__ */ new Set();
  const dedupedIcons = iconDefinitions.filter((e) => {
    if (e.id === codiconsLibrary.blank.id) {
      return false;
    }
    if (!("fontCharacter" in e.defaults)) {
      return false;
    }
    if (includedChars.has(e.defaults.fontCharacter)) {
      return false;
    }
    includedChars.add(e.defaults.fontCharacter);
    return true;
  });
  return dedupedIcons;
});
let TerminalIconPicker = class extends Disposable {
  constructor(instantiationService, _hoverService) {
    super();
    this._hoverService = _hoverService;
    this._iconSelectBox = instantiationService.createInstance(WorkbenchIconSelectBox, {
      icons: icons.value,
      inputBoxStyles: defaultInputBoxStyles,
      showIconInfo: true
    });
  }
  static {
    __name(this, "TerminalIconPicker");
  }
  _iconSelectBox;
  async pickIcons() {
    const dimension = new Dimension(486, 260);
    return new Promise((resolve) => {
      this._register(this._iconSelectBox.onDidSelect((e) => {
        resolve(e);
        this._iconSelectBox.dispose();
      }));
      this._iconSelectBox.clearInput();
      const hoverWidget = this._hoverService.showInstantHover({
        content: this._iconSelectBox.domNode,
        target: getActiveDocument().body,
        position: {
          hoverPosition: HoverPosition.BELOW
        },
        persistence: {
          sticky: true
        },
        appearance: {
          showPointer: true
        }
      }, true);
      if (hoverWidget) {
        this._register(hoverWidget);
      }
      this._iconSelectBox.layout(dimension);
      this._iconSelectBox.focus();
    });
  }
};
TerminalIconPicker = __decorateClass([
  __decorateParam(0, IInstantiationService),
  __decorateParam(1, IHoverService)
], TerminalIconPicker);
export {
  TerminalIconPicker
};
//# sourceMappingURL=terminalIconPicker.js.map
