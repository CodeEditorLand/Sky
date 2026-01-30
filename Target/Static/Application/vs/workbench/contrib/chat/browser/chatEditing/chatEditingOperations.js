var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { StringSHA1 } from "../../../../../base/common/hash.js";
import { LocalChatSessionUri } from "../../common/model/chatUri.js";
var FileOperationType;
(function(FileOperationType2) {
  FileOperationType2["Create"] = "create";
  FileOperationType2["Delete"] = "delete";
  FileOperationType2["Rename"] = "rename";
  FileOperationType2["TextEdit"] = "textEdit";
  FileOperationType2["NotebookEdit"] = "notebookEdit";
})(FileOperationType || (FileOperationType = {}));
function getKeyForChatSessionResource(chatSessionResource) {
  const sessionId = LocalChatSessionUri.parseLocalSessionId(chatSessionResource);
  if (sessionId) {
    return sessionId;
  }
  const sha = new StringSHA1();
  sha.update(chatSessionResource.toString());
  return sha.digest();
}
__name(getKeyForChatSessionResource, "getKeyForChatSessionResource");
export {
  FileOperationType,
  getKeyForChatSessionResource
};
//# sourceMappingURL=chatEditingOperations.js.map
