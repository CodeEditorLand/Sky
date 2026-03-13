var GitHubPullRequestState;
(function(GitHubPullRequestState2) {
  GitHubPullRequestState2["Open"] = "open";
  GitHubPullRequestState2["Closed"] = "closed";
  GitHubPullRequestState2["Merged"] = "merged";
})(GitHubPullRequestState || (GitHubPullRequestState = {}));
var MergeBlockerKind;
(function(MergeBlockerKind2) {
  MergeBlockerKind2["ChangesRequested"] = "changesRequested";
  MergeBlockerKind2["CIFailed"] = "ciFailed";
  MergeBlockerKind2["ApprovalNeeded"] = "approvalNeeded";
  MergeBlockerKind2["Conflicts"] = "conflicts";
  MergeBlockerKind2["Draft"] = "draft";
  MergeBlockerKind2["Unknown"] = "unknown";
})(MergeBlockerKind || (MergeBlockerKind = {}));
var GitHubCheckStatus;
(function(GitHubCheckStatus2) {
  GitHubCheckStatus2["Queued"] = "queued";
  GitHubCheckStatus2["InProgress"] = "in_progress";
  GitHubCheckStatus2["Completed"] = "completed";
})(GitHubCheckStatus || (GitHubCheckStatus = {}));
var GitHubCheckConclusion;
(function(GitHubCheckConclusion2) {
  GitHubCheckConclusion2["Success"] = "success";
  GitHubCheckConclusion2["Failure"] = "failure";
  GitHubCheckConclusion2["Neutral"] = "neutral";
  GitHubCheckConclusion2["Cancelled"] = "cancelled";
  GitHubCheckConclusion2["Skipped"] = "skipped";
  GitHubCheckConclusion2["TimedOut"] = "timed_out";
  GitHubCheckConclusion2["ActionRequired"] = "action_required";
  GitHubCheckConclusion2["Stale"] = "stale";
})(GitHubCheckConclusion || (GitHubCheckConclusion = {}));
var GitHubCIOverallStatus;
(function(GitHubCIOverallStatus2) {
  GitHubCIOverallStatus2["Pending"] = "pending";
  GitHubCIOverallStatus2["Success"] = "success";
  GitHubCIOverallStatus2["Failure"] = "failure";
  GitHubCIOverallStatus2["Neutral"] = "neutral";
})(GitHubCIOverallStatus || (GitHubCIOverallStatus = {}));
export {
  GitHubCIOverallStatus,
  GitHubCheckConclusion,
  GitHubCheckStatus,
  GitHubPullRequestState,
  MergeBlockerKind
};
//# sourceMappingURL=types.js.map
