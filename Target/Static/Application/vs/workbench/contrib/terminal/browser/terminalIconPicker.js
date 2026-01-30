var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __decorate = function(decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
  else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = function(paramIndex, decorator) {
  return function(target, key) {
    decorator(target, key, paramIndex);
  };
};
import { Dimension, getActiveDocument } from "../../../../base/browser/dom.js";
import { codiconsLibrary } from "../../../../base/common/codiconsLibrary.js";
import { Lazy } from "../../../../base/common/lazy.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
import { ThemeIcon } from "../../../../base/common/themables.js";
import { IHoverService } from "../../../../platform/hover/browser/hover.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { ILayoutService } from "../../../../platform/layout/browser/layoutService.js";
import { defaultInputBoxStyles } from "../../../../platform/theme/browser/defaultStyles.js";
import { getIconRegistry } from "../../../../platform/theme/common/iconRegistry.js";
import { WorkbenchIconSelectBox } from "../../../services/userDataProfile/browser/iconSelectBox.js";
const icons = new Lazy(() => {
  const iconDefinitions = getIconRegistry().getIcons();
  const includedChars = /* @__PURE__ */ new Set();
  const dedupedIcons = iconDefinitions.filter((e) => {
    if (e.id === codiconsLibrary.blank.id) {
      return false;
    }
    if (ThemeIcon.isThemeIcon(e.defaults)) {
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
let TerminalIconPicker = class TerminalIconPicker2 extends Disposable {
  static {
    __name(this, "TerminalIconPicker");
  }
  constructor(instantiationService, _hoverService, _layoutService) {
    super();
    this._hoverService = _hoverService;
    this._layoutService = _layoutService;
    this._iconSelectBox = instantiationService.createInstance(WorkbenchIconSelectBox, {
      icons: icons.value,
      inputBoxStyles: defaultInputBoxStyles
    });
  }
  async pickIcons() {
    const dimension = new Dimension(486, 260);
    return new Promise((resolve) => {
      this._register(this._iconSelectBox.onDidSelect((e) => {
        resolve(e);
        this._iconSelectBox.dispose();
      }));
      this._iconSelectBox.clearInput();
      const body = getActiveDocument().body;
      const bodyRect = body.getBoundingClientRect();
      const hoverWidget = this._hoverService.showInstantHover({
        content: this._iconSelectBox.domNode,
        target: {
          targetElements: [body],
          x: bodyRect.left + (bodyRect.width - dimension.width) / 2,
          y: bodyRect.top + this._layoutService.activeContainerOffset.top
        },
        position: {
          hoverPosition: 2
        },
        persistence: {
          sticky: true
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
TerminalIconPicker = __decorate([
  __param(0, IInstantiationService),
  __param(1, IHoverService),
  __param(2, ILayoutService)
], TerminalIconPicker);
export {
  TerminalIconPicker
};
//# sourceMappingURL=terminalIconPicker.js.map
