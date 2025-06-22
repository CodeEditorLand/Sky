var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Disposable } from "../../../../../base/common/lifecycle.js";
import { IConfigurationService } from "../../../../../platform/configuration/common/configuration.js";
import { ITerminalLogService } from "../../../../../platform/terminal/common/terminal.js";
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
let BufferContentTracker = class BufferContentTracker2 extends Disposable {
  static {
    __name(this, "BufferContentTracker");
  }
  get lines() {
    return this._lines;
  }
  constructor(_xterm, _configurationService, _logService) {
    super();
    this._xterm = _xterm;
    this._configurationService = _configurationService;
    this._logService = _logService;
    this._priorEditorViewportLineCount = 0;
    this._lines = [];
    this.bufferToEditorLineMapping = /* @__PURE__ */ new Map();
  }
  reset() {
    this._lines = [];
    this._lastCachedMarker = void 0;
    this.update();
  }
  update() {
    if (this._lastCachedMarker?.isDisposed) {
      this._lines = [];
      this._lastCachedMarker = void 0;
    }
    this._removeViewportContent();
    this._updateCachedContent();
    this._updateViewportContent();
    this._lastCachedMarker = this._register(this._xterm.raw.registerMarker());
    this._logService.debug("Buffer content tracker: set ", this._lines.length, " lines");
  }
  _updateCachedContent() {
    const buffer = this._xterm.raw.buffer.active;
    const start = this._lastCachedMarker?.line ? this._lastCachedMarker.line - this._xterm.raw.rows + 1 : 0;
    const end = buffer.baseY;
    if (start < 0 || start > end) {
      return;
    }
    const scrollback = this._configurationService.getValue(
      "terminal.integrated.scrollback"
      /* TerminalSettingId.Scrollback */
    );
    const maxBufferSize = scrollback + this._xterm.raw.rows - 1;
    const linesToAdd = end - start;
    if (linesToAdd + this._lines.length > maxBufferSize) {
      const numToRemove = linesToAdd + this._lines.length - maxBufferSize;
      for (let i = 0; i < numToRemove; i++) {
        this._lines.shift();
      }
      this._logService.debug("Buffer content tracker: removed ", numToRemove, " lines from top of cached lines, now ", this._lines.length, " lines");
    }
    const cachedLines = [];
    let currentLine = "";
    for (let i = start; i < end; i++) {
      const line = buffer.getLine(i);
      if (!line) {
        continue;
      }
      this.bufferToEditorLineMapping.set(i, this._lines.length + cachedLines.length);
      const isWrapped = buffer.getLine(i + 1)?.isWrapped;
      currentLine += line.translateToString(!isWrapped);
      if (currentLine && !isWrapped || i === buffer.baseY + this._xterm.raw.rows - 1) {
        if (line.length) {
          cachedLines.push(currentLine);
          currentLine = "";
        }
      }
    }
    this._logService.debug("Buffer content tracker:", cachedLines.length, " lines cached");
    this._lines.push(...cachedLines);
  }
  _removeViewportContent() {
    if (!this._lines.length) {
      return;
    }
    let linesToRemove = this._priorEditorViewportLineCount;
    let index = 1;
    while (linesToRemove) {
      this.bufferToEditorLineMapping.forEach((value, key) => {
        if (value === this._lines.length - index) {
          this.bufferToEditorLineMapping.delete(key);
        }
      });
      this._lines.pop();
      index++;
      linesToRemove--;
    }
    this._logService.debug("Buffer content tracker: removed lines from viewport, now ", this._lines.length, " lines cached");
  }
  _updateViewportContent() {
    const buffer = this._xterm.raw.buffer.active;
    this._priorEditorViewportLineCount = 0;
    let currentLine = "";
    for (let i = buffer.baseY; i < buffer.baseY + this._xterm.raw.rows; i++) {
      const line = buffer.getLine(i);
      if (!line) {
        continue;
      }
      this.bufferToEditorLineMapping.set(i, this._lines.length);
      const isWrapped = buffer.getLine(i + 1)?.isWrapped;
      currentLine += line.translateToString(!isWrapped);
      if (currentLine && !isWrapped || i === buffer.baseY + this._xterm.raw.rows - 1) {
        if (currentLine.length) {
          this._priorEditorViewportLineCount++;
          this._lines.push(currentLine);
          currentLine = "";
        }
      }
    }
    this._logService.debug("Viewport content update complete, ", this._lines.length, " lines in the viewport");
  }
};
BufferContentTracker = __decorate([
  __param(1, IConfigurationService),
  __param(2, ITerminalLogService)
], BufferContentTracker);
export {
  BufferContentTracker
};
//# sourceMappingURL=bufferContentTracker.js.map
