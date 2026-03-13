var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Codicon } from "../../../../../base/common/codicons.js";
import * as nls from "../../../../../nls.js";
import { formatDebugEventsForContext, getDebugEventsModelDescription } from "../../common/chatDebugEvents.js";
async function createDebugEventsAttachment(sessionResource, chatDebugService) {
  chatDebugService.markDebugDataAttached(sessionResource);
  if (!chatDebugService.hasInvokedProviders(sessionResource)) {
    await chatDebugService.invokeProviders(sessionResource);
  }
  const events = chatDebugService.getEvents(sessionResource);
  const summary = events.length > 0 ? formatDebugEventsForContext(events) : nls.localize("debugEventsSnapshot.noEvents", "No debug events found for this conversation.");
  return {
    id: "chatDebugEvents",
    name: nls.localize("debugEventsSnapshot.contextName", "Debug Events Snapshot"),
    icon: Codicon.output,
    kind: "debugEvents",
    snapshotTime: Date.now(),
    sessionResource,
    value: summary,
    modelDescription: getDebugEventsModelDescription()
  };
}
__name(createDebugEventsAttachment, "createDebugEventsAttachment");
export {
  createDebugEventsAttachment
};
//# sourceMappingURL=chatDebugAttachment.js.map
