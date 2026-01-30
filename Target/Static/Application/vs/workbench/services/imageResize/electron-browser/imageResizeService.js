import { IImageResizeService } from "../../../../platform/imageResize/common/imageResizeService.js";
import { ImageResizeService } from "../../../../platform/imageResize/browser/imageResizeService.js";
import { registerSingleton } from "../../../../platform/instantiation/common/extensions.js";
registerSingleton(
  IImageResizeService,
  ImageResizeService,
  1
  /* InstantiationType.Delayed */
);
//# sourceMappingURL=imageResizeService.js.map
