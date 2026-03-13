var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Range } from "../../../../editor/common/core/range.js";
var SessionEditorCommentSource;
(function(SessionEditorCommentSource2) {
  SessionEditorCommentSource2["AgentFeedback"] = "agentFeedback";
  SessionEditorCommentSource2["CodeReview"] = "codeReview";
  SessionEditorCommentSource2["PRReview"] = "prReview";
})(SessionEditorCommentSource || (SessionEditorCommentSource = {}));
function getCodeReviewComments(reviewState) {
  return reviewState.kind === "result" ? reviewState.comments : [];
}
__name(getCodeReviewComments, "getCodeReviewComments");
function getPRReviewComments(prReviewState) {
  return prReviewState?.kind === "loaded" ? prReviewState.comments : [];
}
__name(getPRReviewComments, "getPRReviewComments");
function getSessionEditorComments(sessionResource, agentFeedbackItems, reviewState, prReviewState) {
  const comments = [];
  for (const item of agentFeedbackItems) {
    comments.push({
      id: toSessionEditorCommentId("agentFeedback", item.id),
      sourceId: item.id,
      source: "agentFeedback",
      sessionResource,
      resourceUri: item.resourceUri,
      range: item.range,
      text: item.text,
      suggestion: item.suggestion,
      canConvertToAgentFeedback: false
    });
  }
  for (const item of getCodeReviewComments(reviewState)) {
    comments.push({
      id: toSessionEditorCommentId("codeReview", item.id),
      sourceId: item.id,
      source: "codeReview",
      sessionResource,
      resourceUri: item.uri,
      range: item.range,
      text: item.body,
      suggestion: item.suggestion,
      severity: item.severity,
      canConvertToAgentFeedback: true
    });
  }
  for (const item of getPRReviewComments(prReviewState)) {
    comments.push({
      id: toSessionEditorCommentId("prReview", item.id),
      sourceId: item.id,
      source: "prReview",
      sessionResource,
      resourceUri: item.uri,
      range: item.range,
      text: item.body,
      canConvertToAgentFeedback: true
    });
  }
  comments.sort(compareSessionEditorComments);
  return comments;
}
__name(getSessionEditorComments, "getSessionEditorComments");
function compareSessionEditorComments(a, b) {
  return a.resourceUri.toString().localeCompare(b.resourceUri.toString()) || Range.compareRangesUsingStarts(Range.lift(a.range), Range.lift(b.range)) || a.source.localeCompare(b.source) || a.sourceId.localeCompare(b.sourceId);
}
__name(compareSessionEditorComments, "compareSessionEditorComments");
function groupNearbySessionEditorComments(items, lineThreshold = 5) {
  if (items.length === 0) {
    return [];
  }
  const sorted = [...items].sort(compareSessionEditorComments);
  const groups = [];
  let currentGroup = [sorted[0]];
  for (let i = 1; i < sorted.length; i++) {
    const firstItem = currentGroup[0];
    const currentItem = sorted[i];
    const sameResource = currentItem.resourceUri.toString() === firstItem.resourceUri.toString();
    const verticalSpan = currentItem.range.startLineNumber - firstItem.range.startLineNumber;
    if (sameResource && verticalSpan <= lineThreshold) {
      currentGroup.push(currentItem);
    } else {
      groups.push(currentGroup);
      currentGroup = [currentItem];
    }
  }
  groups.push(currentGroup);
  return groups;
}
__name(groupNearbySessionEditorComments, "groupNearbySessionEditorComments");
function getResourceEditorComments(resourceUri, comments) {
  const resource = resourceUri.toString();
  return comments.filter((comment) => comment.resourceUri.toString() === resource);
}
__name(getResourceEditorComments, "getResourceEditorComments");
function toSessionEditorCommentId(source, sourceId) {
  return `${source}:${sourceId}`;
}
__name(toSessionEditorCommentId, "toSessionEditorCommentId");
function hasAgentFeedbackComments(comments) {
  return comments.some(
    (comment) => comment.source === "agentFeedback"
    /* SessionEditorCommentSource.AgentFeedback */
  );
}
__name(hasAgentFeedbackComments, "hasAgentFeedbackComments");
export {
  SessionEditorCommentSource,
  compareSessionEditorComments,
  getCodeReviewComments,
  getPRReviewComments,
  getResourceEditorComments,
  getSessionEditorComments,
  groupNearbySessionEditorComments,
  hasAgentFeedbackComments,
  toSessionEditorCommentId
};
//# sourceMappingURL=sessionEditorComments.js.map
