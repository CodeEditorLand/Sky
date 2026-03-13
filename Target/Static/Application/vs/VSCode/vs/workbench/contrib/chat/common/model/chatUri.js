var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { encodeBase64, VSBuffer, decodeBase64 } from "../../../../../base/common/buffer.js";
import { Schemas } from "../../../../../base/common/network.js";
import { URI } from "../../../../../base/common/uri.js";
import { localChatSessionType } from "../chatSessionsService.js";
var LocalChatSessionUri;
(function(LocalChatSessionUri2) {
  LocalChatSessionUri2.scheme = Schemas.vscodeLocalChatSession;
  function forSession(sessionId) {
    const encodedId = encodeBase64(VSBuffer.wrap(new TextEncoder().encode(sessionId)), false, true);
    return URI.from({ scheme: LocalChatSessionUri2.scheme, authority: localChatSessionType, path: "/" + encodedId });
  }
  __name(forSession, "forSession");
  LocalChatSessionUri2.forSession = forSession;
  function getNewSessionUri() {
    const handle = Math.floor(Math.random() * 1e9);
    return forSession(`chat-${handle}`);
  }
  __name(getNewSessionUri, "getNewSessionUri");
  LocalChatSessionUri2.getNewSessionUri = getNewSessionUri;
  function parseLocalSessionId(resource) {
    const parsed = parse(resource);
    return parsed?.chatSessionType === localChatSessionType ? parsed.sessionId : void 0;
  }
  __name(parseLocalSessionId, "parseLocalSessionId");
  LocalChatSessionUri2.parseLocalSessionId = parseLocalSessionId;
  function isLocalSession(resource) {
    return !!parseLocalSessionId(resource);
  }
  __name(isLocalSession, "isLocalSession");
  LocalChatSessionUri2.isLocalSession = isLocalSession;
  function parse(resource) {
    if (resource.scheme !== LocalChatSessionUri2.scheme) {
      return void 0;
    }
    if (!resource.authority) {
      return void 0;
    }
    const parts = resource.path.split("/");
    if (parts.length !== 2) {
      return void 0;
    }
    const chatSessionType = resource.authority;
    const decodedSessionId = decodeBase64(parts[1]);
    return { chatSessionType, sessionId: new TextDecoder().decode(decodedSessionId.buffer) };
  }
  __name(parse, "parse");
})(LocalChatSessionUri || (LocalChatSessionUri = {}));
function chatSessionResourceToId(resource) {
  const localId = LocalChatSessionUri.parseLocalSessionId(resource);
  if (localId) {
    return localId;
  }
  return resource.toString();
}
__name(chatSessionResourceToId, "chatSessionResourceToId");
function getChatSessionType(resource) {
  if (resource.scheme === Schemas.vscodeChatEditor) {
    return localChatSessionType;
  }
  if (resource.scheme === LocalChatSessionUri.scheme) {
    return resource.authority || localChatSessionType;
  }
  return resource.scheme;
}
__name(getChatSessionType, "getChatSessionType");
function isUntitledChatSession(resource) {
  return resource.path.startsWith("/untitled-");
}
__name(isUntitledChatSession, "isUntitledChatSession");
export {
  LocalChatSessionUri,
  chatSessionResourceToId,
  getChatSessionType,
  isUntitledChatSession
};
//# sourceMappingURL=chatUri.js.map
