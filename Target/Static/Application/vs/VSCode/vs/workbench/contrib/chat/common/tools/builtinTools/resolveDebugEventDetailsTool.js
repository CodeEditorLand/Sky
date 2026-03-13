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
import { ToolDataSource } from "../languageModelToolsService.js";
const ResolveDebugEventDetailsToolId = "vscode_resolveDebugEventDetails_internal";
const ResolveDebugEventDetailsToolData = {
  id: ResolveDebugEventDetailsToolId,
  toolReferenceName: "resolveDebugEventDetails",
  displayName: localize("resolveDebugEventDetails.displayName", "Resolve Debug Event Details"),
  when: ChatContextKeys.chatSessionHasDebugTools,
  canBeReferencedInPrompt: false,
  modelDescription: "Resolves the full details for a specific chat debug event by its event ID. Use this tool to get detailed information about a debug event such as tool call input/output, model turn details, user message sections, or file lists. The event ID can be found in the debug event log summary provided in the conversation context.",
  source: ToolDataSource.Internal,
  inputSchema: {
    type: "object",
    properties: {
      eventId: {
        type: "string",
        description: "The ID of the debug event to resolve details for."
      }
    },
    required: ["eventId"]
  }
};
function formatResolvedContent(content) {
  switch (content.kind) {
    case "text":
      return content.value;
    case "fileList": {
      const lines = [`File list (${content.discoveryType}):`];
      if (content.sourceFolders) {
        for (const folder of content.sourceFolders) {
          lines.push(`  Source folder: ${folder.uri.toString()} (${folder.storage})`);
        }
      }
      for (const file of content.files) {
        const status = file.status === "loaded" ? "loaded" : `skipped${file.skipReason ? `: ${file.skipReason}` : ""}`;
        lines.push(`  ${file.uri.toString()} [${status}]`);
      }
      return lines.join("\n");
    }
    case "message": {
      const lines = [`${content.type === "user" ? "User" : "Agent"} message: ${content.message}`];
      for (const section of content.sections) {
        lines.push(`--- ${section.name} ---`);
        lines.push(section.content);
      }
      return lines.join("\n");
    }
    case "toolCall": {
      const lines = [`Tool call: ${content.toolName}`];
      if (content.result) {
        lines.push(`Result: ${content.result}`);
      }
      if (content.durationInMillis !== void 0) {
        lines.push(`Duration: ${content.durationInMillis}ms`);
      }
      if (content.input) {
        lines.push(`Input:
${content.input}`);
      }
      if (content.output) {
        lines.push(`Output:
${content.output}`);
      }
      return lines.join("\n");
    }
    case "modelTurn": {
      const lines = [`Model turn: ${content.requestName}`];
      if (content.model) {
        lines.push(`Model: ${content.model}`);
      }
      if (content.status) {
        lines.push(`Status: ${content.status}`);
      }
      if (content.durationInMillis !== void 0) {
        lines.push(`Duration: ${content.durationInMillis}ms`);
      }
      if (content.inputTokens !== void 0 || content.outputTokens !== void 0) {
        lines.push(`Tokens: input=${content.inputTokens ?? "?"}, output=${content.outputTokens ?? "?"}, cached=${content.cachedTokens ?? "?"}, total=${content.totalTokens ?? "?"}`);
      }
      if (content.errorMessage) {
        lines.push(`Error: ${content.errorMessage}`);
      }
      if (content.sections) {
        for (const section of content.sections) {
          lines.push(`--- ${section.name} ---`);
          lines.push(section.content);
        }
      }
      return lines.join("\n");
    }
    default: {
      const _ = content;
      return JSON.stringify(_);
    }
  }
}
__name(formatResolvedContent, "formatResolvedContent");
function truncate(text, maxLength = 30) {
  if (text.length <= maxLength) {
    return text;
  }
  const lastSpace = text.lastIndexOf(" ", maxLength);
  const cutoff = lastSpace > maxLength / 2 ? lastSpace : maxLength;
  return text.substring(0, cutoff) + "\u2026";
}
__name(truncate, "truncate");
function getEventLabel(event) {
  switch (event.kind) {
    case "generic":
      return event.name;
    case "toolCall":
      return event.toolName;
    case "modelTurn":
      return event.requestName ?? localize("debugEvent.modelTurn", "Model Turn");
    case "userMessage":
      return localize("debugEvent.userMessage", "User Message: {0}", truncate(event.message));
    case "agentResponse":
      return localize("debugEvent.agentResponse", "Agent Response: {0}", truncate(event.message));
    case "subagentInvocation":
      return event.agentName;
  }
}
__name(getEventLabel, "getEventLabel");
let ResolveDebugEventDetailsTool = class ResolveDebugEventDetailsTool2 {
  static {
    __name(this, "ResolveDebugEventDetailsTool");
  }
  constructor(chatDebugService) {
    this.chatDebugService = chatDebugService;
  }
  async prepareToolInvocation(context, _token) {
    const eventId = context.parameters?.eventId;
    let eventLabel;
    if (typeof eventId === "string" && context.chatSessionResource) {
      const events = this.chatDebugService.getEvents(context.chatSessionResource);
      const event = events.find((e) => e.id === eventId);
      if (event) {
        eventLabel = getEventLabel(event);
      }
    }
    if (eventLabel) {
      return {
        invocationMessage: localize("resolveDebugEventDetails.invocationMessageNamed", 'Resolving details for "{0}"', eventLabel),
        pastTenseMessage: localize("resolveDebugEventDetails.pastTenseMessageNamed", 'Resolved details for "{0}"', eventLabel)
      };
    }
    return {
      invocationMessage: localize("resolveDebugEventDetails.invocationMessage", "Resolving debug event details"),
      pastTenseMessage: localize("resolveDebugEventDetails.pastTenseMessage", "Resolved debug event details")
    };
  }
  async invoke(invocation, _countTokens, _progress, _token) {
    const eventId = invocation.parameters["eventId"];
    if (typeof eventId !== "string" || !eventId) {
      return {
        content: [{ kind: "text", value: "Error: eventId parameter is required." }]
      };
    }
    const sessionResource = invocation.context?.sessionResource;
    if (!sessionResource) {
      return {
        content: [{ kind: "text", value: "Error: no chat session context available." }]
      };
    }
    const sessionEvents = this.chatDebugService.getEvents(sessionResource);
    if (!sessionEvents.some((e) => e.id === eventId)) {
      return {
        content: [{ kind: "text", value: `No event with ID "${eventId}" found in the current session.` }]
      };
    }
    const resolved = await this.chatDebugService.resolveEvent(eventId);
    if (!resolved) {
      return {
        content: [{ kind: "text", value: `No details found for event ID: ${eventId}` }]
      };
    }
    return {
      content: [{ kind: "text", value: formatResolvedContent(resolved) }]
    };
  }
};
ResolveDebugEventDetailsTool = __decorate([
  __param(0, IChatDebugService)
], ResolveDebugEventDetailsTool);
export {
  ResolveDebugEventDetailsTool,
  ResolveDebugEventDetailsToolData,
  ResolveDebugEventDetailsToolId
};
//# sourceMappingURL=resolveDebugEventDetailsTool.js.map
