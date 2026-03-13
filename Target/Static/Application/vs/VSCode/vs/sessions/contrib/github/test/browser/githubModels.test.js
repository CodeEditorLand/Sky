var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import assert from "assert";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../../base/test/common/utils.js";
import { DisposableStore } from "../../../../../base/common/lifecycle.js";
import { NullLogService } from "../../../../../platform/log/common/log.js";
import { GitHubPullRequestModel } from "../../browser/models/githubPullRequestModel.js";
import { GitHubPullRequestCIModel } from "../../browser/models/githubPullRequestCIModel.js";
import { GitHubRepositoryModel } from "../../browser/models/githubRepositoryModel.js";
class MockRepositoryFetcher {
  static {
    __name(this, "MockRepositoryFetcher");
  }
  async getRepository(_owner, _repo) {
    if (!this.nextResult) {
      throw new Error("No mock result");
    }
    return this.nextResult;
  }
}
class MockPRFetcher {
  static {
    __name(this, "MockPRFetcher");
  }
  constructor() {
    this.nextThreads = [];
    this.postReviewCommentCalls = [];
    this.postIssueCommentCalls = [];
  }
  async getPullRequest(_owner, _repo, _prNumber) {
    if (!this.nextPR) {
      throw new Error("No mock PR");
    }
    return this.nextPR;
  }
  async getMergeability(_owner, _repo, _prNumber) {
    if (!this.nextMergeability) {
      throw new Error("No mock mergeability");
    }
    return this.nextMergeability;
  }
  async getReviewThreads(_owner, _repo, _prNumber) {
    return this.nextThreads;
  }
  async postReviewComment(_owner, _repo, _prNumber, body, inReplyTo) {
    this.postReviewCommentCalls.push({ body, inReplyTo });
    return makeComment(999, body);
  }
  async postIssueComment(_owner, _repo, _prNumber, body) {
    this.postIssueCommentCalls.push({ body });
    return makeComment(998, body);
  }
  async resolveThread() {
    throw new Error("Not implemented");
  }
}
class MockCIFetcher {
  static {
    __name(this, "MockCIFetcher");
  }
  constructor() {
    this.nextChecks = [];
  }
  async getCheckRuns(_owner, _repo, _ref) {
    return this.nextChecks;
  }
  async getCheckRunAnnotations(_owner, _repo, _checkRunId) {
    return "mock annotations";
  }
}
suite("GitHubRepositoryModel", () => {
  const store = new DisposableStore();
  let mockFetcher;
  const logService = new NullLogService();
  setup(() => {
    mockFetcher = new MockRepositoryFetcher();
  });
  teardown(() => store.clear());
  ensureNoDisposablesAreLeakedInTestSuite();
  test("initial state is undefined", () => {
    const model = store.add(new GitHubRepositoryModel("owner", "repo", mockFetcher, logService));
    assert.strictEqual(model.repository.get(), void 0);
  });
  test("refresh populates repository observable", async () => {
    const model = store.add(new GitHubRepositoryModel("owner", "repo", mockFetcher, logService));
    mockFetcher.nextResult = {
      owner: "owner",
      name: "repo",
      fullName: "owner/repo",
      defaultBranch: "main",
      isPrivate: false,
      description: "test"
    };
    await model.refresh();
    assert.deepStrictEqual(model.repository.get(), mockFetcher.nextResult);
  });
  test("refresh handles errors gracefully", async () => {
    const model = store.add(new GitHubRepositoryModel("owner", "repo", mockFetcher, logService));
    await model.refresh();
    assert.strictEqual(model.repository.get(), void 0);
  });
});
suite("GitHubPullRequestModel", () => {
  const store = new DisposableStore();
  let mockFetcher;
  const logService = new NullLogService();
  setup(() => {
    mockFetcher = new MockPRFetcher();
  });
  teardown(() => store.clear());
  ensureNoDisposablesAreLeakedInTestSuite();
  test("initial state has empty observables", () => {
    const model = store.add(new GitHubPullRequestModel("owner", "repo", 1, mockFetcher, logService));
    assert.strictEqual(model.pullRequest.get(), void 0);
    assert.strictEqual(model.mergeability.get(), void 0);
    assert.deepStrictEqual(model.reviewThreads.get(), []);
  });
  test("refresh populates all observables", async () => {
    const model = store.add(new GitHubPullRequestModel("owner", "repo", 1, mockFetcher, logService));
    mockFetcher.nextPR = makePR();
    mockFetcher.nextMergeability = { canMerge: true, blockers: [] };
    mockFetcher.nextThreads = [makeThread("thread-100", "src/a.ts")];
    await model.refresh();
    assert.strictEqual(model.pullRequest.get()?.number, 1);
    assert.strictEqual(model.mergeability.get()?.canMerge, true);
    assert.strictEqual(model.reviewThreads.get().length, 1);
  });
  test("refreshThreads only updates threads", async () => {
    const model = store.add(new GitHubPullRequestModel("owner", "repo", 1, mockFetcher, logService));
    mockFetcher.nextThreads = [makeThread("thread-100", "src/a.ts"), makeThread("thread-200", "src/b.ts")];
    await model.refreshThreads();
    assert.strictEqual(model.pullRequest.get(), void 0);
    assert.strictEqual(model.reviewThreads.get().length, 2);
  });
  test("postReviewComment calls fetcher and refreshes threads", async () => {
    const model = store.add(new GitHubPullRequestModel("owner", "repo", 1, mockFetcher, logService));
    mockFetcher.nextThreads = [];
    const comment = await model.postReviewComment("LGTM", 100);
    assert.strictEqual(comment.body, "LGTM");
    assert.strictEqual(mockFetcher.postReviewCommentCalls.length, 1);
    assert.strictEqual(mockFetcher.postReviewCommentCalls[0].body, "LGTM");
  });
  test("postIssueComment calls fetcher", async () => {
    const model = store.add(new GitHubPullRequestModel("owner", "repo", 1, mockFetcher, logService));
    const comment = await model.postIssueComment("Great work!");
    assert.strictEqual(comment.body, "Great work!");
    assert.strictEqual(mockFetcher.postIssueCommentCalls.length, 1);
  });
  test("polling can be started and stopped", () => {
    const model = store.add(new GitHubPullRequestModel("owner", "repo", 1, mockFetcher, logService));
    model.startPolling(6e4);
    model.stopPolling();
  });
});
suite("GitHubPullRequestCIModel", () => {
  const store = new DisposableStore();
  let mockFetcher;
  const logService = new NullLogService();
  setup(() => {
    mockFetcher = new MockCIFetcher();
  });
  teardown(() => store.clear());
  ensureNoDisposablesAreLeakedInTestSuite();
  test("initial state is empty", () => {
    const model = store.add(new GitHubPullRequestCIModel("owner", "repo", "abc", mockFetcher, logService));
    assert.deepStrictEqual(model.checks.get(), []);
    assert.strictEqual(
      model.overallStatus.get(),
      "neutral"
      /* GitHubCIOverallStatus.Neutral */
    );
  });
  test("refresh populates checks and computes overall status", async () => {
    const model = store.add(new GitHubPullRequestCIModel("owner", "repo", "abc", mockFetcher, logService));
    mockFetcher.nextChecks = [
      { id: 1, name: "build", status: "completed", conclusion: "success", startedAt: void 0, completedAt: void 0, detailsUrl: void 0 },
      { id: 2, name: "test", status: "completed", conclusion: "failure", startedAt: void 0, completedAt: void 0, detailsUrl: void 0 }
    ];
    await model.refresh();
    assert.strictEqual(model.checks.get().length, 2);
    assert.strictEqual(
      model.overallStatus.get(),
      "failure"
      /* GitHubCIOverallStatus.Failure */
    );
  });
  test("getCheckRunAnnotations delegates to fetcher", async () => {
    const model = store.add(new GitHubPullRequestCIModel("owner", "repo", "abc", mockFetcher, logService));
    const result = await model.getCheckRunAnnotations(1);
    assert.strictEqual(result, "mock annotations");
  });
});
function makePR() {
  return {
    number: 1,
    title: "Test PR",
    body: "Test body",
    state: "open",
    author: { login: "author", avatarUrl: "" },
    headRef: "feature",
    baseRef: "main",
    isDraft: false,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-02T00:00:00Z",
    mergedAt: void 0,
    mergeable: true,
    mergeableState: "clean"
  };
}
__name(makePR, "makePR");
function makeThread(id, path) {
  return {
    id,
    isResolved: false,
    path,
    line: 10,
    comments: [makeComment(100, `Comment on ${path}`, id)]
  };
}
__name(makeThread, "makeThread");
function makeComment(id, body, threadId = String(id)) {
  return {
    id,
    body,
    author: { login: "reviewer", avatarUrl: "" },
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
    path: void 0,
    line: void 0,
    threadId,
    inReplyToId: void 0
  };
}
__name(makeComment, "makeComment");
//# sourceMappingURL=githubModels.test.js.map
