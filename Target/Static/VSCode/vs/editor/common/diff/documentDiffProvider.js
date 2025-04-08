import { CancellationToken } from "../../../base/common/cancellation.js";
import { Event } from "../../../base/common/event.js";
import { MovedText } from "./linesDiffComputer.js";
import { DetailedLineRangeMapping } from "./rangeMapping.js";
import { ITextModel } from "../model.js";
const nullDocumentDiff = Object.freeze({
  identical: true,
  quitEarly: false,
  changes: Object.freeze([]),
  moves: Object.freeze([])
});
export {
  nullDocumentDiff
};
//# sourceMappingURL=documentDiffProvider.js.map
