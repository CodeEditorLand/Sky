var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var ChatConfiguration;
(function(ChatConfiguration2) {
  ChatConfiguration2["UseFileStorage"] = "chat.useFileStorage";
  ChatConfiguration2["AgentEnabled"] = "chat.agent.enabled";
  ChatConfiguration2["Edits2Enabled"] = "chat.edits2.enabled";
  ChatConfiguration2["ExtensionToolsEnabled"] = "chat.extensionTools.enabled";
})(ChatConfiguration || (ChatConfiguration = {}));
var ChatMode;
(function(ChatMode2) {
  ChatMode2["Ask"] = "ask";
  ChatMode2["Edit"] = "edit";
  ChatMode2["Agent"] = "agent";
})(ChatMode || (ChatMode = {}));
function modeToString(mode) {
  switch (mode) {
    case ChatMode.Agent:
      return "Agent";
    case ChatMode.Edit:
      return "Edit";
    case ChatMode.Ask:
    default:
      return "Ask";
  }
}
__name(modeToString, "modeToString");
function validateChatMode(mode) {
  switch (mode) {
    case ChatMode.Ask:
    case ChatMode.Edit:
    case ChatMode.Agent:
      return mode;
    default:
      return void 0;
  }
}
__name(validateChatMode, "validateChatMode");
function isChatMode(mode) {
  return !!validateChatMode(mode);
}
__name(isChatMode, "isChatMode");
var ChatAgentLocation;
(function(ChatAgentLocation2) {
  ChatAgentLocation2["Panel"] = "panel";
  ChatAgentLocation2["Terminal"] = "terminal";
  ChatAgentLocation2["Notebook"] = "notebook";
  ChatAgentLocation2["Editor"] = "editor";
})(ChatAgentLocation || (ChatAgentLocation = {}));
(function(ChatAgentLocation2) {
  function fromRaw(value) {
    switch (value) {
      case "panel":
        return ChatAgentLocation2.Panel;
      case "terminal":
        return ChatAgentLocation2.Terminal;
      case "notebook":
        return ChatAgentLocation2.Notebook;
      case "editor":
        return ChatAgentLocation2.Editor;
    }
    return ChatAgentLocation2.Panel;
  }
  __name(fromRaw, "fromRaw");
  ChatAgentLocation2.fromRaw = fromRaw;
})(ChatAgentLocation || (ChatAgentLocation = {}));
export {
  ChatAgentLocation,
  ChatConfiguration,
  ChatMode,
  isChatMode,
  modeToString,
  validateChatMode
};
//# sourceMappingURL=constants.js.map
