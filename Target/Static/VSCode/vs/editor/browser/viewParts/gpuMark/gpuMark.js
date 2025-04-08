var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import * as viewEvents from "../../../common/viewEvents.js";
import { ViewContext } from "../../../common/viewModel/viewContext.js";
import { ViewGpuContext } from "../../gpu/viewGpuContext.js";
import { DynamicViewOverlay } from "../../view/dynamicViewOverlay.js";
import { RenderingContext } from "../../view/renderingContext.js";
import { ViewLineOptions } from "../viewLines/viewLineOptions.js";
import "./gpuMark.css";
class GpuMarkOverlay extends DynamicViewOverlay {
  constructor(context, _viewGpuContext) {
    super();
    this._viewGpuContext = _viewGpuContext;
    this._context = context;
    this._renderResult = null;
    this._context.addEventHandler(this);
  }
  static {
    __name(this, "GpuMarkOverlay");
  }
  static CLASS_NAME = "gpu-mark";
  _context;
  _renderResult;
  dispose() {
    this._context.removeEventHandler(this);
    this._renderResult = null;
    super.dispose();
  }
  // --- begin event handlers
  onConfigurationChanged(e) {
    return true;
  }
  onCursorStateChanged(e) {
    return true;
  }
  onFlushed(e) {
    return true;
  }
  onLinesChanged(e) {
    return true;
  }
  onLinesDeleted(e) {
    return true;
  }
  onLinesInserted(e) {
    return true;
  }
  onScrollChanged(e) {
    return e.scrollTopChanged;
  }
  onZonesChanged(e) {
    return true;
  }
  onDecorationsChanged(e) {
    return true;
  }
  // --- end event handlers
  prepareRender(ctx) {
    const visibleStartLineNumber = ctx.visibleRange.startLineNumber;
    const visibleEndLineNumber = ctx.visibleRange.endLineNumber;
    const viewportData = ctx.viewportData;
    const options = new ViewLineOptions(this._context.configuration, this._context.theme.type);
    const output = [];
    for (let lineNumber = visibleStartLineNumber; lineNumber <= visibleEndLineNumber; lineNumber++) {
      const lineIndex = lineNumber - visibleStartLineNumber;
      const cannotRenderReasons = this._viewGpuContext.canRenderDetailed(options, viewportData, lineNumber);
      output[lineIndex] = cannotRenderReasons.length ? `<div class="${GpuMarkOverlay.CLASS_NAME}" title="Cannot render on GPU: ${cannotRenderReasons.join(", ")}"></div>` : "";
    }
    this._renderResult = output;
  }
  render(startLineNumber, lineNumber) {
    if (!this._renderResult) {
      return "";
    }
    const lineIndex = lineNumber - startLineNumber;
    if (lineIndex < 0 || lineIndex >= this._renderResult.length) {
      return "";
    }
    return this._renderResult[lineIndex];
  }
}
export {
  GpuMarkOverlay
};
//# sourceMappingURL=gpuMark.js.map
