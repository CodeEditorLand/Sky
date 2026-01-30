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
import { clamp } from "../../../../base/common/numbers.js";
import { setGlobalSashSize, setGlobalHoverDelay } from "../../../../base/browser/ui/sash/sash.js";
import { Event } from "../../../../base/common/event.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { createStyleSheet } from "../../../../base/browser/domStylesheets.js";
const minSize = 1;
const maxSize = 20;
let SashSettingsController = class SashSettingsController2 extends Disposable {
  static {
    __name(this, "SashSettingsController");
  }
  static {
    this.ID = "workbench.contrib.sash";
  }
  constructor(configurationService) {
    super();
    this.configurationService = configurationService;
    this.styleSheet = createStyleSheet();
    const onDidChangeSize = Event.filter(configurationService.onDidChangeConfiguration, (e) => e.affectsConfiguration("workbench.sash.size"));
    onDidChangeSize(this.onDidChangeSize, this, this._store);
    this.onDidChangeSize();
    const onDidChangeHoverDelay = Event.filter(configurationService.onDidChangeConfiguration, (e) => e.affectsConfiguration("workbench.sash.hoverDelay"));
    onDidChangeHoverDelay(this.onDidChangeHoverDelay, this, this._store);
    this.onDidChangeHoverDelay();
  }
  onDidChangeSize() {
    const configuredSize = this.configurationService.getValue("workbench.sash.size");
    const size = clamp(configuredSize, 4, 20);
    const hoverSize = clamp(configuredSize, 1, 8);
    this.styleSheet.textContent = `
			.monaco-workbench {
				--vscode-sash-size: ${size}px;
				--vscode-sash-hover-size: ${hoverSize}px;
			}
		`;
    setGlobalSashSize(size);
  }
  onDidChangeHoverDelay() {
    setGlobalHoverDelay(this.configurationService.getValue("workbench.sash.hoverDelay"));
  }
};
SashSettingsController = __decorate([
  __param(0, IConfigurationService)
], SashSettingsController);
export {
  SashSettingsController,
  maxSize,
  minSize
};
//# sourceMappingURL=sash.js.map
