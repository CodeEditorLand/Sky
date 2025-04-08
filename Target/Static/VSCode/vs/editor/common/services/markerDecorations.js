import { ITextModel, IModelDecoration } from "../model.js";
import { createDecorator } from "../../../platform/instantiation/common/instantiation.js";
import { IMarker } from "../../../platform/markers/common/markers.js";
import { Event } from "../../../base/common/event.js";
import { Range } from "../core/range.js";
import { URI } from "../../../base/common/uri.js";
import { IDisposable } from "../../../base/common/lifecycle.js";
const IMarkerDecorationsService = createDecorator("markerDecorationsService");
export {
  IMarkerDecorationsService
};
//# sourceMappingURL=markerDecorations.js.map
