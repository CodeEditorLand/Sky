var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
const debugEventKindDescriptions = {
  generic: '- generic (category: "discovery"): File discovery for instructions, skills, agents, hooks. Resolving returns a fileList with full file paths, load status, skip reasons, and source folders. Always resolve these for questions about customization files.\n- generic (other): Miscellaneous logs. Resolving returns additional text details.',
  toolCall: "- toolCall: A tool invocation. Resolving returns tool name, input, output, status, and duration.",
  modelTurn: "- modelTurn: An LLM round-trip. Resolving returns model name, token usage, timing, errors, and prompt sections.",
  subagentInvocation: "- subagentInvocation: A sub-agent spawn. Resolving returns agent name, status, duration, and counts.",
  userMessage: "- userMessage: The full prompt sent to the model. Resolving returns the complete message and all prompt sections (system prompt, instructions, context). Essential for understanding what the model received.",
  agentResponse: "- agentResponse: The model's response. Resolving returns the full response text and sections."
};
function formatDebugEventsForContext(events) {
  const lines = [];
  for (const event of events) {
    const ts = event.created.toISOString();
    const id = event.id ? ` [id=${event.id}]` : "";
    switch (event.kind) {
      case "generic":
        lines.push(`[${ts}]${id} ${event.level >= 3 ? "ERROR" : event.level >= 2 ? "WARN" : "INFO"}: ${event.name}${event.details ? " - " + event.details : ""}${event.category ? " (category: " + event.category + ")" : ""}`);
        break;
      case "toolCall":
        lines.push(`[${ts}]${id} TOOL_CALL: ${event.toolName}${event.result ? " result=" + event.result : ""}${event.durationInMillis !== void 0 ? " duration=" + event.durationInMillis + "ms" : ""}`);
        break;
      case "modelTurn":
        lines.push(`[${ts}]${id} MODEL_TURN: ${event.requestName ?? "unknown"}${event.model ? " model=" + event.model : ""}${event.inputTokens !== void 0 ? " tokens(in=" + event.inputTokens + ",out=" + (event.outputTokens ?? "?") + ")" : ""}${event.durationInMillis !== void 0 ? " duration=" + event.durationInMillis + "ms" : ""}`);
        break;
      case "subagentInvocation":
        lines.push(`[${ts}]${id} SUBAGENT: ${event.agentName}${event.status ? " status=" + event.status : ""}${event.durationInMillis !== void 0 ? " duration=" + event.durationInMillis + "ms" : ""}`);
        break;
      case "userMessage":
        lines.push(`[${ts}]${id} USER_MESSAGE: ${event.message.substring(0, 200)}${event.message.length > 200 ? "..." : ""} (${event.sections.length} sections)`);
        break;
      case "agentResponse":
        lines.push(`[${ts}]${id} AGENT_RESPONSE: ${event.message.substring(0, 200)}${event.message.length > 200 ? "..." : ""} (${event.sections.length} sections)`);
        break;
      default: {
        const _ = event;
        void _;
        break;
      }
    }
  }
  return lines.join("\n");
}
__name(formatDebugEventsForContext, "formatDebugEventsForContext");
function getDebugEventsModelDescription() {
  return `These are the debug event logs from the current chat conversation. Analyze them to help answer the user's troubleshooting question.

CRITICAL INSTRUCTION: You MUST call the resolveDebugEventDetails tool on relevant events BEFORE answering. The log lines below are only summaries \u2014 they do NOT contain the actual data (file paths, prompt content, tool I/O, etc.). The real information is only available by resolving events. Never answer based solely on the summary lines. Always resolve first, then answer.

Call resolveDebugEventDetails in parallel on all events that could be relevant to the user's question. When in doubt, resolve more events rather than fewer.

IMPORTANT: Do NOT mention event IDs, tool resolution steps, or internal debug mechanics in your response. The user does not know about debug events or event IDs. Present your findings directly and naturally, as if you simply know the answer. Never say things like "I need to resolve events" or show event IDs.

Event types and what resolving them returns:
` + Object.values(debugEventKindDescriptions).join("\n");
}
__name(getDebugEventsModelDescription, "getDebugEventsModelDescription");
function debugEventMatchesText(event, term) {
  if (event.kind.toLowerCase().includes(term)) {
    return true;
  }
  switch (event.kind) {
    case "toolCall":
      return event.toolName.toLowerCase().includes(term) || (event.input?.toLowerCase().includes(term) ?? false) || (event.output?.toLowerCase().includes(term) ?? false);
    case "modelTurn":
      return (event.model?.toLowerCase().includes(term) ?? false) || (event.requestName?.toLowerCase().includes(term) ?? false);
    case "generic":
      return event.name.toLowerCase().includes(term) || (event.details?.toLowerCase().includes(term) ?? false) || (event.category?.toLowerCase().includes(term) ?? false);
    case "subagentInvocation":
      return event.agentName.toLowerCase().includes(term) || (event.description?.toLowerCase().includes(term) ?? false);
    case "userMessage":
    case "agentResponse":
      return event.message.toLowerCase().includes(term) || event.sections.some((s) => s.name.toLowerCase().includes(term) || s.content.toLowerCase().includes(term));
  }
}
__name(debugEventMatchesText, "debugEventMatchesText");
const timestampTokenPattern = /\b(?:before|after):\d{4}(?:-\d{2}(?:-\d{2}(?:t\d{1,2}(?::\d{2}(?::\d{2})?)?)?)?)?(\b|$)/g;
function parseTimeToken(text, prefix) {
  const regex = new RegExp(`${prefix}:(\\d{4})(?:-(\\d{2})(?:-(\\d{2})(?:t(\\d{1,2})(?::(\\d{2})(?::(\\d{2}))?)?)?)?)?(?!\\w)`);
  const m = regex.exec(text);
  if (!m) {
    return void 0;
  }
  const year = parseInt(m[1], 10);
  const month = m[2] !== void 0 ? parseInt(m[2], 10) - 1 : void 0;
  const day = m[3] !== void 0 ? parseInt(m[3], 10) : void 0;
  const hour = m[4] !== void 0 ? parseInt(m[4], 10) : void 0;
  const minute = m[5] !== void 0 ? parseInt(m[5], 10) : void 0;
  const second = m[6] !== void 0 ? parseInt(m[6], 10) : void 0;
  if (prefix === "before") {
    if (second !== void 0) {
      return new Date(year, month, day, hour, minute, second, 999).getTime();
    } else if (minute !== void 0) {
      return new Date(year, month, day, hour, minute, 59, 999).getTime();
    } else if (hour !== void 0) {
      return new Date(year, month, day, hour, 59, 59, 999).getTime();
    } else if (day !== void 0) {
      return new Date(year, month, day, 23, 59, 59, 999).getTime();
    } else if (month !== void 0) {
      return new Date(year, month + 1, 0, 23, 59, 59, 999).getTime();
    } else {
      return new Date(year, 11, 31, 23, 59, 59, 999).getTime();
    }
  } else {
    return new Date(year, month ?? 0, day ?? 1, hour ?? 0, minute ?? 0, second ?? 0, 0).getTime();
  }
}
__name(parseTimeToken, "parseTimeToken");
function stripTimestampTokens(text) {
  return text.replace(timestampTokenPattern, "").trim();
}
__name(stripTimestampTokens, "stripTimestampTokens");
function filterDebugEventsByText(events, filterText) {
  const beforeTimestamp = parseTimeToken(filterText, "before");
  const afterTimestamp = parseTimeToken(filterText, "after");
  const textOnly = stripTimestampTokens(filterText);
  const terms = textOnly.split(/\s*,\s*/).filter((t) => t.length > 0);
  const includeTerms = terms.filter((t) => !t.startsWith("!")).map((t) => t.trim());
  const excludeTerms = terms.filter((t) => t.startsWith("!")).map((t) => t.slice(1).trim()).filter((t) => t.length > 0);
  return events.filter((e) => {
    const time = e.created.getTime();
    if (beforeTimestamp !== void 0 && time > beforeTimestamp) {
      return false;
    }
    if (afterTimestamp !== void 0 && time < afterTimestamp) {
      return false;
    }
    if (excludeTerms.some((term) => debugEventMatchesText(e, term))) {
      return false;
    }
    if (includeTerms.length > 0) {
      return includeTerms.some((term) => debugEventMatchesText(e, term));
    }
    return true;
  });
}
__name(filterDebugEventsByText, "filterDebugEventsByText");
const debugEventFilterDescription = "Comma-separated text search terms. Prefix a term with ! to exclude it. Matches against event kind, tool names, model names, agent names, categories, event names, and message content. Also supports before:YYYY[-MM[-DD[THH[:MM[:SS]]]]] and after:YYYY[-MM[-DD[THH[:MM[:SS]]]]] to filter by timestamp.";
function filterDebugEvents(events, options) {
  let result = events;
  if (options.kind) {
    result = result.filter((e) => e.kind === options.kind);
  }
  if (options.filter) {
    result = filterDebugEventsByText(result, options.filter);
  }
  if (options.limit !== void 0 && options.limit > 0 && result.length > options.limit) {
    result = result.slice(result.length - options.limit);
  }
  return result;
}
__name(filterDebugEvents, "filterDebugEvents");
export {
  debugEventFilterDescription,
  debugEventKindDescriptions,
  debugEventMatchesText,
  filterDebugEvents,
  filterDebugEventsByText,
  formatDebugEventsForContext,
  getDebugEventsModelDescription,
  parseTimeToken,
  stripTimestampTokens
};
//# sourceMappingURL=chatDebugEvents.js.map
