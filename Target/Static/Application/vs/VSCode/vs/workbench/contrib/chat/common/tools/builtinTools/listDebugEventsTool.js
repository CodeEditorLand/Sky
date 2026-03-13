var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
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
import { localize } from "../../../../../../nls.js";
import { ChatContextKeys } from "../../actions/chatContextKeys.js";
import { IChatDebugService } from "../../chatDebugService.js";
import { formatDebugEventsForContext, debugEventKindDescriptions, filterDebugEvents, debugEventFilterDescription } from "../../chatDebugEvents.js";
import { ToolDataSource } from "../languageModelToolsService.js";
const ListDebugEventsToolId = "vscode_listDebugEvents_internal";
const ListDebugEventsToolData = {
  id: ListDebugEventsToolId,
  toolReferenceName: "listDebugEvents",
  displayName: localize("listDebugEvents.displayName", "List Debug Events"),
  when: ChatContextKeys.chatSessionHasDebugTools,
  canBeReferencedInPrompt: false,
  modelDescription: "Lists debug event summaries for the current chat session. Returns a compact log of events including timestamps, event IDs, and brief descriptions. Use this tool FIRST to get an overview of what happened, then call resolveDebugEventDetails on specific event IDs to get full details.\n\nEvent types:\n" + Object.values(debugEventKindDescriptions).join("\n"),
  source: ToolDataSource.Internal,
  inputSchema: {
    type: "object",
    properties: {
      kind: {
        type: "string",
        description: "Filter by event kind: " + Object.keys(debugEventKindDescriptions).join(", ") + "."
      },
      filter: {
        type: "string",
        description: debugEventFilterDescription
      },
      limit: {
        type: "number",
        description: "Return only the N most recent matching events."
      }
    }
  }
};
let ListDebugEventsTool = class ListDebugEventsTool2 {
  static {
    __name(this, "ListDebugEventsTool");
  }
  constructor(chatDebugService) {
    this.chatDebugService = chatDebugService;
  }
  async prepareToolInvocation(_context, _token) {
    return {
      invocationMessage: localize("listDebugEvents.invocationMessage", "Listing debug events"),
      pastTenseMessage: localize("listDebugEvents.pastTenseMessage", "Listed debug events")
    };
  }
  async invoke(invocation, _countTokens, _progress, _token) {
    const sessionResource = invocation.context?.sessionResource;
    if (!sessionResource) {
      return {
        content: [{ kind: "text", value: "Error: no chat session context available." }]
      };
    }
    if (!this.chatDebugService.hasInvokedProviders(sessionResource)) {
      await this.chatDebugService.invokeProviders(sessionResource);
    }
    let events = this.chatDebugService.getEvents(sessionResource);
    if (events.length === 0) {
      return {
        content: [{ kind: "text", value: "No debug events found for this conversation." }]
      };
    }
    events = filterDebugEvents(events, {
      kind: typeof invocation.parameters["kind"] === "string" ? invocation.parameters["kind"] : void 0,
      filter: typeof invocation.parameters["filter"] === "string" ? invocation.parameters["filter"].toLowerCase() : void 0,
      limit: typeof invocation.parameters["limit"] === "number" ? invocation.parameters["limit"] : void 0
    });
    if (events.length === 0) {
      return {
        content: [{ kind: "text", value: "No debug events matched the filter criteria." }]
      };
    }
    const summary = formatDebugEventsForContext(events);
    return {
      content: [{
        kind: "text",
        value: "Debug event log for this conversation. Each line is a summary \u2014 call resolveDebugEventDetails with the event ID (shown as [id=...]) to get full details.\n\nIMPORTANT: Do NOT mention event IDs or tool resolution steps in your response to the user.\n\n" + summary
      }]
    };
  }
};
ListDebugEventsTool = __decorate([
  __param(0, IChatDebugService)
], ListDebugEventsTool);
export {
  ListDebugEventsTool,
  ListDebugEventsToolData,
  ListDebugEventsToolId
};
//# sourceMappingURL=listDebugEventsTool.js.map
