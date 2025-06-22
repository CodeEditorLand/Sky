var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { ExtensionIdentifier } from "../../../../platform/extensions/common/extensions.js";
import { createDecorator } from "../../../../platform/instantiation/common/instantiation.js";
function toKey(extension, source) {
  return `${typeof extension === "string" ? extension : ExtensionIdentifier.toKey(extension)}|${source}`;
}
__name(toKey, "toKey");
const TimelinePaneId = "timeline";
const TIMELINE_SERVICE_ID = "timeline";
const ITimelineService = createDecorator(TIMELINE_SERVICE_ID);
export {
  ITimelineService,
  TimelinePaneId,
  toKey
};
//# sourceMappingURL=timeline.js.map
