var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { RunOnceScheduler } from "../../../../../base/common/async.js";
import { Disposable } from "../../../../../base/common/lifecycle.js";
import { observableValue } from "../../../../../base/common/observable.js";
const LOG_PREFIX = "[GitHubPullRequestModel]";
const DEFAULT_POLL_INTERVAL_MS = 3e4;
class GitHubPullRequestModel extends Disposable {
  static {
    __name(this, "GitHubPullRequestModel");
  }
  constructor(owner, repo, prNumber, _fetcher, _logService) {
    super();
    this.owner = owner;
    this.repo = repo;
    this.prNumber = prNumber;
    this._fetcher = _fetcher;
    this._logService = _logService;
    this._pullRequest = observableValue(this, void 0);
    this.pullRequest = this._pullRequest;
    this._mergeability = observableValue(this, void 0);
    this.mergeability = this._mergeability;
    this._reviewThreads = observableValue(this, []);
    this.reviewThreads = this._reviewThreads;
    this._disposed = false;
    this._pollScheduler = this._register(new RunOnceScheduler(() => this._poll(), DEFAULT_POLL_INTERVAL_MS));
  }
  /**
   * Refresh all PR data: pull request info, mergeability, and review threads.
   */
  async refresh() {
    await Promise.all([
      this._refreshPullRequest(),
      this._refreshMergeability(),
      this._refreshThreads()
    ]);
  }
  /**
   * Refresh only the review threads.
   */
  async refreshThreads() {
    await this._refreshThreads();
  }
  /**
   * Post a reply to an existing review thread and refresh threads.
   */
  async postReviewComment(body, inReplyTo) {
    const comment = await this._fetcher.postReviewComment(this.owner, this.repo, this.prNumber, body, inReplyTo);
    await this._refreshThreads();
    return comment;
  }
  /**
   * Post a top-level issue comment on the PR.
   */
  async postIssueComment(body) {
    return this._fetcher.postIssueComment(this.owner, this.repo, this.prNumber, body);
  }
  /**
   * Resolve a review thread and refresh the thread list.
   */
  async resolveThread(threadId) {
    await this._fetcher.resolveThread(this.owner, this.repo, threadId);
    await this._refreshThreads();
  }
  /**
   * Start periodic polling. Each cycle refreshes all PR data.
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
  async _refreshPullRequest() {
    try {
      const data = await this._fetcher.getPullRequest(this.owner, this.repo, this.prNumber);
      this._pullRequest.set(data, void 0);
    } catch (err) {
      this._logService.error(`${LOG_PREFIX} Failed to refresh PR #${this.prNumber}:`, err);
    }
  }
  async _refreshMergeability() {
    try {
      const data = await this._fetcher.getMergeability(this.owner, this.repo, this.prNumber);
      this._mergeability.set(data, void 0);
    } catch (err) {
      this._logService.error(`${LOG_PREFIX} Failed to refresh mergeability for PR #${this.prNumber}:`, err);
    }
  }
  async _refreshThreads() {
    try {
      const data = await this._fetcher.getReviewThreads(this.owner, this.repo, this.prNumber);
      this._reviewThreads.set(data, void 0);
    } catch (err) {
      this._logService.error(`${LOG_PREFIX} Failed to refresh threads for PR #${this.prNumber}:`, err);
    }
  }
}
export {
  GitHubPullRequestModel
};
//# sourceMappingURL=githubPullRequestModel.js.map
