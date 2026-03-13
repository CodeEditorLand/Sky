var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { RunOnceScheduler } from "../../../../../base/common/async.js";
import { Disposable } from "../../../../../base/common/lifecycle.js";
import { observableValue } from "../../../../../base/common/observable.js";
import { computeOverallCIStatus } from "../fetchers/githubPRCIFetcher.js";
const LOG_PREFIX = "[GitHubPullRequestCIModel]";
const DEFAULT_POLL_INTERVAL_MS = 6e4;
class GitHubPullRequestCIModel extends Disposable {
  static {
    __name(this, "GitHubPullRequestCIModel");
  }
  constructor(owner, repo, headRef, _fetcher, _logService) {
    super();
    this.owner = owner;
    this.repo = repo;
    this.headRef = headRef;
    this._fetcher = _fetcher;
    this._logService = _logService;
    this._checks = observableValue(this, []);
    this.checks = this._checks;
    this._overallStatus = observableValue(
      this,
      "neutral"
      /* GitHubCIOverallStatus.Neutral */
    );
    this.overallStatus = this._overallStatus;
    this._disposed = false;
    this._pollScheduler = this._register(new RunOnceScheduler(() => this._poll(), DEFAULT_POLL_INTERVAL_MS));
  }
  /**
   * Refresh all CI check data.
   */
  async refresh() {
    try {
      const checks = await this._fetcher.getCheckRuns(this.owner, this.repo, this.headRef);
      this._checks.set(checks, void 0);
      this._overallStatus.set(computeOverallCIStatus(checks), void 0);
    } catch (err) {
      this._logService.error(`${LOG_PREFIX} Failed to refresh CI checks for ${this.owner}/${this.repo}@${this.headRef}:`, err);
    }
  }
  /**
   * Get annotations (structured logs) for a specific check run.
   */
  async getCheckRunAnnotations(checkRunId) {
    return this._fetcher.getCheckRunAnnotations(this.owner, this.repo, checkRunId);
  }
  /**
   * Start periodic polling. Each cycle refreshes CI check data.
   */
  startPolling(intervalMs = DEFAULT_POLL_INTERVAL_MS) {
    this._pollScheduler.cancel();
    this._pollScheduler.schedule(intervalMs);
  }
  /**
   * Stop periodic polling.
   */
  stopPolling() {
    this._pollScheduler.cancel();
  }
  async _poll() {
    await this.refresh();
    if (!this._disposed) {
      this._pollScheduler.schedule();
    }
  }
  dispose() {
    this._disposed = true;
    super.dispose();
  }
}
export {
  GitHubPullRequestCIModel
};
//# sourceMappingURL=githubPullRequestCIModel.js.map
