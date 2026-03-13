var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
class GitHubPRCIFetcher {
  static {
    __name(this, "GitHubPRCIFetcher");
  }
  constructor(_apiClient) {
    this._apiClient = _apiClient;
  }
  async getCheckRuns(owner, repo, ref) {
    const data = await this._apiClient.request("GET", `/repos/${e(owner)}/${e(repo)}/commits/${e(ref)}/check-runs`, "githubApi.getCheckRuns");
    return data.check_runs.map(mapCheckRun);
  }
  /**
   * Get logs/output for a specific check run.
   *
   * Tries multiple sources in order:
   * 1. The check run's own output fields (title, summary, text) — set by the
   *    check run creator via the Checks API.
   * 2. Annotations attached to the check run.
   * 3. GitHub Actions job logs (only works for GitHub Actions workflows).
   */
  async getCheckRunAnnotations(owner, repo, checkRunId) {
    const sections = [];
    let detail;
    try {
      detail = await this._apiClient.request("GET", `/repos/${e(owner)}/${e(repo)}/check-runs/${checkRunId}`, "githubApi.getCheckRunAnnotations");
      const output = detail.output;
      if (output.title) {
        sections.push(`# ${output.title}`);
      }
      if (output.summary) {
        sections.push(output.summary);
      }
      if (output.text) {
        sections.push(output.text);
      }
    } catch {
    }
    try {
      const annotations = await this._apiClient.request("GET", `/repos/${e(owner)}/${e(repo)}/check-runs/${checkRunId}/annotations`, "githubApi.getCheckRunAnnotations.annotations");
      if (annotations.length > 0) {
        sections.push(annotations.map((a) => `[${a.annotation_level}] ${a.path}:${a.start_line}${a.end_line !== a.start_line ? `-${a.end_line}` : ""} ${a.title ? `(${a.title}) ` : ""}${a.message}`).join("\n"));
      }
    } catch {
    }
    if (sections.length > 0) {
      return sections.join("\n\n");
    }
    return "No output available for this check run.";
  }
}
function e(value) {
  return encodeURIComponent(value);
}
__name(e, "e");
function mapCheckRun(data) {
  return {
    id: data.id,
    name: data.name,
    status: mapCheckStatus(data.status),
    conclusion: data.conclusion ? mapCheckConclusion(data.conclusion) : void 0,
    startedAt: data.started_at ?? void 0,
    completedAt: data.completed_at ?? void 0,
    detailsUrl: data.details_url ?? void 0
  };
}
__name(mapCheckRun, "mapCheckRun");
function mapCheckStatus(status) {
  switch (status) {
    case "queued":
      return "queued";
    case "in_progress":
      return "in_progress";
    case "completed":
      return "completed";
    default:
      return "queued";
  }
}
__name(mapCheckStatus, "mapCheckStatus");
function mapCheckConclusion(conclusion) {
  switch (conclusion) {
    case "success":
      return "success";
    case "failure":
      return "failure";
    case "neutral":
      return "neutral";
    case "cancelled":
      return "cancelled";
    case "skipped":
      return "skipped";
    case "timed_out":
      return "timed_out";
    case "action_required":
      return "action_required";
    case "stale":
      return "stale";
    default:
      return "neutral";
  }
}
__name(mapCheckConclusion, "mapCheckConclusion");
function computeOverallCIStatus(checks) {
  if (checks.length === 0) {
    return "neutral";
  }
  let hasFailure = false;
  let hasPending = false;
  for (const check of checks) {
    if (check.status !== "completed") {
      hasPending = true;
      continue;
    }
    if (check.conclusion === "failure" || check.conclusion === "timed_out" || check.conclusion === "action_required") {
      hasFailure = true;
    }
  }
  if (hasFailure) {
    return "failure";
  }
  if (hasPending) {
    return "pending";
  }
  return "success";
}
__name(computeOverallCIStatus, "computeOverallCIStatus");
export {
  GitHubPRCIFetcher,
  computeOverallCIStatus
};
//# sourceMappingURL=githubPRCIFetcher.js.map
