var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var ChatConfiguration = /* @__PURE__ */ ((ChatConfiguration2) => {
  ChatConfiguration2["UseFileStorage"] = "chat.useFileStorage";
  ChatConfiguration2["AgentEnabled"] = "chat.agent.enabled";
  ChatConfiguration2["Edits2Enabled"] = "chat.edits2.enabled";
  ChatConfiguration2["ExtensionToolsEnabled"] = "chat.extensionTools.enabled";
  return ChatConfiguration2;
})(ChatConfiguration || {});
var ChatMode = /* @__PURE__ */ ((ChatMode2) => {
  ChatMode2["Ask"] = "ask";
  ChatMode2["Edit"] = "edit";
  ChatMode2["Agent"] = "agent";
  return ChatMode2;
})(ChatMode || {});
function validateChatMode(mode) {
  switch (mode) {
    case "ask" /* Ask */:
    case "edit" /* Edit */:
    case "agent" /* Agent */:
      return mode;
    default:
      return void 0;
  }
}
__name(validateChatMode, "validateChatMode");
var ChatAgentLocation = /* @__PURE__ */ ((ChatAgentLocation2) => {
  ChatAgentLocation2["Panel"] = "panel";
  ChatAgentLocation2["Terminal"] = "terminal";
  ChatAgentLocation2["Notebook"] = "notebook";
  ChatAgentLocation2["Editor"] = "editor";
  ChatAgentLocation2["EditingSession"] = "editing-session";
  return ChatAgentLocation2;
})(ChatAgentLocation || {});
((ChatAgentLocation2) => {
  function fromRaw(value) {
    switch (value) {
      case "panel":
        return "panel" /* Panel */;
      case "terminal":
        return "terminal" /* Terminal */;
      case "notebook":
        return "notebook" /* Notebook */;
      case "editor":
        return "editor" /* Editor */;
      case "editing-session":
        return "editing-session" /* EditingSession */;
    }
    return "panel" /* Panel */;
  }
  ChatAgentLocation2.fromRaw = fromRaw;
  __name(fromRaw, "fromRaw");
})(ChatAgentLocation || (ChatAgentLocation = {}));
export {
  ChatAgentLocation,
  ChatConfiguration,
  ChatMode,
  validateChatMode
};
//# sourceMappingURL=constants.js.map
