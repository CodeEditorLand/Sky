var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Disposable, toDisposable } from "../../../../../base/common/lifecycle.js";
import { Widget } from "../../../../../base/browser/ui/widget.js";
import * as dom from "../../../../../base/browser/dom.js";
import { IHoverService } from "../../../../../platform/hover/browser/hover.js";
import { IConfigurationService } from "../../../../../platform/configuration/common/configuration.js";
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
const $ = dom.$;
let TerminalHover = class TerminalHover2 extends Disposable {
  static {
    __name(this, "TerminalHover");
  }
  constructor(_targetOptions, _text, _actions, _linkHandler, _hoverService, _configurationService) {
    super();
    this._targetOptions = _targetOptions;
    this._text = _text;
    this._actions = _actions;
    this._linkHandler = _linkHandler;
    this._hoverService = _hoverService;
    this._configurationService = _configurationService;
    this.id = "hover";
  }
  attach(container) {
    const showLinkHover = this._configurationService.getValue(
      "terminal.integrated.showLinkHover"
      /* TerminalSettingId.ShowLinkHover */
    );
    if (!showLinkHover) {
      return;
    }
    const target = new CellHoverTarget(container, this._targetOptions);
    const hover = this._hoverService.showInstantHover({
      target,
      content: this._text,
      actions: this._actions,
      linkHandler: this._linkHandler,
      // .xterm-hover lets xterm know that the hover is part of a link
      additionalClasses: ["xterm-hover"]
    });
    if (hover) {
      this._register(hover);
    }
  }
};
TerminalHover = __decorate([
  __param(4, IHoverService),
  __param(5, IConfigurationService)
], TerminalHover);
class CellHoverTarget extends Widget {
  static {
    __name(this, "CellHoverTarget");
  }
  get targetElements() {
    return this._targetElements;
  }
  constructor(container, _options) {
    super();
    this._options = _options;
    this._targetElements = [];
    this._domNode = $("div.terminal-hover-targets.xterm-hover");
    const rowCount = this._options.viewportRange.end.y - this._options.viewportRange.start.y + 1;
    const width = (this._options.viewportRange.end.y > this._options.viewportRange.start.y ? this._options.terminalDimensions.width - this._options.viewportRange.start.x : this._options.viewportRange.end.x - this._options.viewportRange.start.x + 1) * this._options.cellDimensions.width;
    const topTarget = $("div.terminal-hover-target.hoverHighlight");
    topTarget.style.left = `${this._options.viewportRange.start.x * this._options.cellDimensions.width}px`;
    topTarget.style.bottom = `${(this._options.terminalDimensions.height - this._options.viewportRange.start.y - 1) * this._options.cellDimensions.height}px`;
    topTarget.style.width = `${width}px`;
    topTarget.style.height = `${this._options.cellDimensions.height}px`;
    this._targetElements.push(this._domNode.appendChild(topTarget));
    if (rowCount > 2) {
      const middleTarget = $("div.terminal-hover-target.hoverHighlight");
      middleTarget.style.left = `0px`;
      middleTarget.style.bottom = `${(this._options.terminalDimensions.height - this._options.viewportRange.start.y - 1 - (rowCount - 2)) * this._options.cellDimensions.height}px`;
      middleTarget.style.width = `${this._options.terminalDimensions.width * this._options.cellDimensions.width}px`;
      middleTarget.style.height = `${(rowCount - 2) * this._options.cellDimensions.height}px`;
      this._targetElements.push(this._domNode.appendChild(middleTarget));
    }
    if (rowCount > 1) {
      const bottomTarget = $("div.terminal-hover-target.hoverHighlight");
      bottomTarget.style.left = `0px`;
      bottomTarget.style.bottom = `${(this._options.terminalDimensions.height - this._options.viewportRange.end.y - 1) * this._options.cellDimensions.height}px`;
      bottomTarget.style.width = `${(this._options.viewportRange.end.x + 1) * this._options.cellDimensions.width}px`;
      bottomTarget.style.height = `${this._options.cellDimensions.height}px`;
      this._targetElements.push(this._domNode.appendChild(bottomTarget));
    }
    if (this._options.modifierDownCallback && this._options.modifierUpCallback) {
      let down = false;
      this._register(dom.addDisposableListener(container.ownerDocument, "keydown", (e) => {
        if (e.ctrlKey && !down) {
          down = true;
          this._options.modifierDownCallback();
        }
      }));
      this._register(dom.addDisposableListener(container.ownerDocument, "keyup", (e) => {
        if (!e.ctrlKey) {
          down = false;
          this._options.modifierUpCallback();
        }
      }));
    }
    container.appendChild(this._domNode);
    this._register(toDisposable(() => this._domNode?.remove()));
  }
}
export {
  TerminalHover
};
//# sourceMappingURL=terminalHoverWidget.js.map
