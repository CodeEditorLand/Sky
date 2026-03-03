var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { URI } from "../../../../base/common/uri.js";
import { EditorResourceAccessor, SideBySideEditor } from "../../../../workbench/common/editor.js";
import { agentSessionContainsResource, editingEntriesContainResource } from "../../../../workbench/contrib/chat/browser/sessionResourceMatching.js";
function getSessionForResource(resourceUri, chatEditingService, agentSessionsService) {
  for (const editingSession of chatEditingService.editingSessionsObs.get()) {
    if (editingEntriesContainResource(editingSession.entries.get(), resourceUri)) {
      return editingSession.chatSessionResource;
    }
  }
  for (const session of agentSessionsService.model.sessions) {
    if (agentSessionContainsResource(session, resourceUri)) {
      return session.resource;
    }
  }
  return void 0;
}
__name(getSessionForResource, "getSessionForResource");
function getActiveResourceCandidates(input) {
  const result = [];
  const resources = EditorResourceAccessor.getOriginalUri(input, { supportSideBySide: SideBySideEditor.BOTH });
  if (!resources) {
    return result;
  }
  if (URI.isUri(resources)) {
    result.push(resources);
    return result;
  }
  if (resources.secondary) {
    result.push(resources.secondary);
  }
  if (resources.primary) {
    result.push(resources.primary);
  }
  return result;
}
__name(getActiveResourceCandidates, "getActiveResourceCandidates");
export {
  getActiveResourceCandidates,
  getSessionForResource
};
//# sourceMappingURL=agentFeedbackEditorUtils.js.map
