var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { ViewEventHandler } from "../../../common/viewEventHandler.js";
import { GlyphRasterizer } from "../raster/glyphRasterizer.js";
class BaseRenderStrategy extends ViewEventHandler {
  constructor(_context, _viewGpuContext, _device, _glyphRasterizer) {
    super();
    this._context = _context;
    this._viewGpuContext = _viewGpuContext;
    this._device = _device;
    this._glyphRasterizer = _glyphRasterizer;
    this._context.addEventHandler(this);
  }
  static {
    __name(this, "BaseRenderStrategy");
  }
  get glyphRasterizer() {
    return this._glyphRasterizer.value;
  }
}
export {
  BaseRenderStrategy
};
//# sourceMappingURL=baseRenderStrategy.js.map
