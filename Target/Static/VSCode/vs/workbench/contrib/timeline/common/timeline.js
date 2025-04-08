var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { CancellationToken, CancellationTokenSource } from "../../../../base/common/cancellation.js";
import { Event } from "../../../../base/common/event.js";
import { IDisposable } from "../../../../base/common/lifecycle.js";
import { URI } from "../../../../base/common/uri.js";
import { Command } from "../../../../editor/common/languages.js";
import { ExtensionIdentifier } from "../../../../platform/extensions/common/extensions.js";
import { createDecorator } from "../../../../platform/instantiation/common/instantiation.js";
import { IAccessibilityInformation } from "../../../../platform/accessibility/common/accessibility.js";
import { ThemeIcon } from "../../../../base/common/themables.js";
import { IMarkdownString } from "../../../../base/common/htmlContent.js";
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
