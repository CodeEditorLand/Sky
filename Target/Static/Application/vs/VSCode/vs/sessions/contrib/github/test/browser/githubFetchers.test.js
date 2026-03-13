var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import assert from "assert";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../../base/test/common/utils.js";
import { DisposableStore } from "../../../../../base/common/lifecycle.js";
import { GitHubPRFetcher } from "../../browser/fetchers/githubPRFetcher.js";
import { GitHubPRCIFetcher, computeOverallCIStatus } from "../../browser/fetchers/githubPRCIFetcher.js";
import { GitHubRepositoryFetcher } from "../../browser/fetchers/githubRepositoryFetcher.js";
import { GitHubApiError } from "../../browser/githubApiClient.js";
class MockApiClient {
  static {
    __name(this, "MockApiClient");
  }
  constructor() {
    this.requestCalls = [];
    this.graphqlCalls = [];
  }
  setNextResponse(data) {
    this._nextResponse = data;
    this._nextError = void 0;
  }
  setNextError(error) {
    this._nextError = error;
    this._nextResponse = void 0;
  }
  async request(_method, _path, _callSite, _body) {
    this.requestCalls.push({ method: _method, path: _path, body: _body });
    if (this._nextError) {
      throw this._nextError;
    }
    return this._nextResponse;
  }
  async graphql(query, _callSite, variables) {
    this.graphqlCalls.push({ query, variables });
    if (this._nextError) {
      throw this._nextError;
    }
    return this._nextResponse;
  }
}
suite("GitHubRepositoryFetcher", () => {
  const store = new DisposableStore();
  let mockApi;
  let fetcher;
  setup(() => {
    mockApi = new MockApiClient();
    fetcher = new GitHubRepositoryFetcher(mockApi);
  });
  teardown(() => store.clear());
  ensureNoDisposablesAreLeakedInTestSuite();
  test("getRepository returns mapped data", async () => {
    mockApi.setNextResponse({
      name: "vscode",
      full_name: "microsoft/vscode",
      owner: { login: "microsoft" },
      default_branch: "main",
      private: false,
      description: "Visual Studio Code"
    });
    const repo = await fetcher.getRepository("microsoft", "vscode");
    assert.deepStrictEqual(repo, {
      owner: "microsoft",
      name: "vscode",
      fullName: "microsoft/vscode",
      defaultBranch: "main",
      isPrivate: false,
      description: "Visual Studio Code"
    });
    assert.strictEqual(mockApi.requestCalls[0].path, "/repos/microsoft/vscode");
  });
  test("getRepository handles null description", async () => {
    mockApi.setNextResponse({
      name: "test",
      full_name: "owner/test",
      owner: { login: "owner" },
      default_branch: "main",
      private: true,
      description: null
    });
    const repo = await fetcher.getRepository("owner", "test");
    assert.strictEqual(repo.description, "");
  });
  test("getRepository propagates API errors", async () => {
    mockApi.setNextError(new GitHubApiError("Not found", 404, void 0));
    await assert.rejects(() => fetcher.getRepository("owner", "nonexistent"), (err) => err instanceof GitHubApiError && err.statusCode === 404);
  });
});
suite("GitHubPRFetcher", () => {
  const store = new DisposableStore();
  let mockApi;
  let fetcher;
  setup(() => {
    mockApi = new MockApiClient();
    fetcher = new GitHubPRFetcher(mockApi);
  });
  teardown(() => store.clear());
  ensureNoDisposablesAreLeakedInTestSuite();
  test("getPullRequest maps open PR", async () => {
    mockApi.setNextResponse(makePRResponse({ state: "open", merged: false, draft: false }));
    const pr = await fetcher.getPullRequest("owner", "repo", 1);
    assert.strictEqual(
      pr.state,
      "open"
      /* GitHubPullRequestState.Open */
    );
    assert.strictEqual(pr.isDraft, false);
    assert.strictEqual(pr.number, 1);
    assert.strictEqual(pr.title, "Test PR");
  });
  test("getPullRequest maps merged PR", async () => {
    mockApi.setNextResponse(makePRResponse({ state: "closed", merged: true, draft: false }));
    const pr = await fetcher.getPullRequest("owner", "repo", 1);
    assert.strictEqual(
      pr.state,
      "merged"
      /* GitHubPullRequestState.Merged */
    );
    assert.ok(pr.mergedAt);
  });
  test("getPullRequest maps closed PR", async () => {
    mockApi.setNextResponse(makePRResponse({ state: "closed", merged: false, draft: false }));
    const pr = await fetcher.getPullRequest("owner", "repo", 1);
    assert.strictEqual(
      pr.state,
      "closed"
      /* GitHubPullRequestState.Closed */
    );
  });
  test("getReviewThreads returns GraphQL thread metadata", async () => {
    mockApi.setNextResponse(makeGraphQLReviewThreadsResponse([
      makeGraphQLReviewThread({
        id: "thread-a",
        path: "src/a.ts",
        line: 10,
        isResolved: false,
        comments: [
          makeGraphQLReviewComment({ databaseId: 100, path: "src/a.ts", line: 10 }),
          makeGraphQLReviewComment({ databaseId: 101, path: "src/a.ts", line: 10, replyToDatabaseId: 100 })
        ]
      }),
      makeGraphQLReviewThread({
        id: "thread-b",
        path: "src/b.ts",
        line: 20,
        isResolved: true,
        comments: [makeGraphQLReviewComment({ databaseId: 200, path: "src/b.ts", line: 20 })]
      })
    ]));
    const threads = await fetcher.getReviewThreads("owner", "repo", 1);
    assert.strictEqual(threads.length, 2);
    const thread1 = threads.find((t) => t.id === "thread-a");
    assert.ok(thread1);
    assert.strictEqual(thread1.comments.length, 2);
    assert.strictEqual(thread1.path, "src/a.ts");
    assert.strictEqual(thread1.line, 10);
    assert.strictEqual(thread1.comments[0].threadId, "thread-a");
    const thread2 = threads.find((t) => t.id === "thread-b");
    assert.ok(thread2);
    assert.strictEqual(thread2.comments.length, 1);
    assert.strictEqual(thread2.path, "src/b.ts");
    assert.strictEqual(thread2.isResolved, true);
  });
  test("resolveThread uses GraphQL mutation", async () => {
    mockApi.setNextResponse({
      resolveReviewThread: {
        thread: {
          isResolved: true
        }
      }
    });
    await fetcher.resolveThread("owner", "repo", "thread-a");
    assert.strictEqual(mockApi.graphqlCalls.length, 1);
    assert.deepStrictEqual(mockApi.graphqlCalls[0].variables, { threadId: "thread-a" });
  });
  test("getMergeability detects draft blocker", async () => {
    let callCount = 0;
    const originalRequest = mockApi.request.bind(mockApi);
    mockApi.request = async function(_method, _path, _body) {
      if (callCount++ === 0) {
        return makePRResponse({ state: "open", merged: false, draft: true, mergeable: true, mergeable_state: "clean" });
      }
      return [];
    };
    const result = await fetcher.getMergeability("owner", "repo", 1);
    assert.strictEqual(result.canMerge, false);
    assert.ok(result.blockers.some(
      (b) => b.kind === "draft"
      /* MergeBlockerKind.Draft */
    ));
    mockApi.request = originalRequest;
  });
  test("getMergeability detects conflicts blocker", async () => {
    let callCount = 0;
    const originalRequest = mockApi.request.bind(mockApi);
    mockApi.request = async function() {
      if (callCount++ === 0) {
        return makePRResponse({ state: "open", merged: false, draft: false, mergeable: false, mergeable_state: "dirty" });
      }
      return [];
    };
    const result = await fetcher.getMergeability("owner", "repo", 1);
    assert.strictEqual(result.canMerge, false);
    assert.ok(result.blockers.some(
      (b) => b.kind === "conflicts"
      /* MergeBlockerKind.Conflicts */
    ));
    mockApi.request = originalRequest;
  });
  test("getMergeability detects changes requested blocker", async () => {
    let callCount = 0;
    const originalRequest = mockApi.request.bind(mockApi);
    mockApi.request = async function() {
      if (callCount++ === 0) {
        return makePRResponse({ state: "open", merged: false, draft: false, mergeable: true, mergeable_state: "clean" });
      }
      return [
        { id: 1, user: { login: "reviewer", avatar_url: "" }, state: "CHANGES_REQUESTED", submitted_at: "2024-01-01T00:00:00Z" }
      ];
    };
    const result = await fetcher.getMergeability("owner", "repo", 1);
    assert.strictEqual(result.canMerge, false);
    assert.ok(result.blockers.some(
      (b) => b.kind === "changesRequested"
      /* MergeBlockerKind.ChangesRequested */
    ));
    mockApi.request = originalRequest;
  });
});
suite("GitHubPRCIFetcher", () => {
  const store = new DisposableStore();
  let mockApi;
  let fetcher;
  setup(() => {
    mockApi = new MockApiClient();
    fetcher = new GitHubPRCIFetcher(mockApi);
  });
  teardown(() => store.clear());
  ensureNoDisposablesAreLeakedInTestSuite();
  test("getCheckRuns maps check runs", async () => {
    mockApi.setNextResponse({
      total_count: 2,
      check_runs: [
        { id: 1, name: "build", status: "completed", conclusion: "success", started_at: "2024-01-01T00:00:00Z", completed_at: "2024-01-01T00:10:00Z", details_url: "https://example.com/1" },
        { id: 2, name: "test", status: "in_progress", conclusion: null, started_at: "2024-01-01T00:00:00Z", completed_at: null, details_url: null }
      ]
    });
    const checks = await fetcher.getCheckRuns("owner", "repo", "abc123");
    assert.strictEqual(checks.length, 2);
    assert.deepStrictEqual(checks[0], {
      id: 1,
      name: "build",
      status: "completed",
      conclusion: "success",
      startedAt: "2024-01-01T00:00:00Z",
      completedAt: "2024-01-01T00:10:00Z",
      detailsUrl: "https://example.com/1"
    });
    assert.strictEqual(checks[1].conclusion, void 0);
  });
  test("getCheckRunAnnotations returns formatted annotations", async () => {
    mockApi.setNextResponse([
      { path: "src/a.ts", start_line: 10, end_line: 10, annotation_level: "failure", message: "type error", title: "TS2345" },
      { path: "src/b.ts", start_line: 5, end_line: 8, annotation_level: "warning", message: "unused var", title: null }
    ]);
    const result = await fetcher.getCheckRunAnnotations("owner", "repo", 1);
    assert.ok(result.includes("[failure] src/a.ts:10"));
    assert.ok(result.includes("(TS2345)"));
    assert.ok(result.includes("[warning] src/b.ts:5-8"));
  });
});
suite("computeOverallCIStatus", () => {
  ensureNoDisposablesAreLeakedInTestSuite();
  test("returns neutral for empty checks", () => {
    assert.strictEqual(
      computeOverallCIStatus([]),
      "neutral"
      /* GitHubCIOverallStatus.Neutral */
    );
  });
  test("returns success when all completed successfully", () => {
    const checks = [
      makeCheck({
        status: "completed",
        conclusion: "success"
        /* GitHubCheckConclusion.Success */
      }),
      makeCheck({
        status: "completed",
        conclusion: "neutral"
        /* GitHubCheckConclusion.Neutral */
      })
    ];
    assert.strictEqual(
      computeOverallCIStatus(checks),
      "success"
      /* GitHubCIOverallStatus.Success */
    );
  });
  test("returns failure when any check failed", () => {
    const checks = [
      makeCheck({
        status: "completed",
        conclusion: "success"
        /* GitHubCheckConclusion.Success */
      }),
      makeCheck({
        status: "completed",
        conclusion: "failure"
        /* GitHubCheckConclusion.Failure */
      })
    ];
    assert.strictEqual(
      computeOverallCIStatus(checks),
      "failure"
      /* GitHubCIOverallStatus.Failure */
    );
  });
  test("returns pending when any check is in progress", () => {
    const checks = [
      makeCheck({
        status: "completed",
        conclusion: "success"
        /* GitHubCheckConclusion.Success */
      }),
      makeCheck({ status: "in_progress", conclusion: void 0 })
    ];
    assert.strictEqual(
      computeOverallCIStatus(checks),
      "pending"
      /* GitHubCIOverallStatus.Pending */
    );
  });
  test("failure takes precedence over pending", () => {
    const checks = [
      makeCheck({
        status: "completed",
        conclusion: "failure"
        /* GitHubCheckConclusion.Failure */
      }),
      makeCheck({ status: "in_progress", conclusion: void 0 })
    ];
    assert.strictEqual(
      computeOverallCIStatus(checks),
      "failure"
      /* GitHubCIOverallStatus.Failure */
    );
  });
});
function makePRResponse(overrides) {
  return {
    number: 1,
    title: "Test PR",
    body: "Test body",
    state: overrides.state,
    draft: overrides.draft,
    user: { login: "author", avatar_url: "https://example.com/avatar" },
    head: { ref: "feature-branch" },
    base: { ref: "main" },
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-02T00:00:00Z",
    merged_at: overrides.merged ? "2024-01-02T00:00:00Z" : null,
    mergeable: overrides.mergeable ?? true,
    mergeable_state: overrides.mergeable_state ?? "clean",
    merged: overrides.merged
  };
}
__name(makePRResponse, "makePRResponse");
function makeGraphQLReviewThreadsResponse(threads) {
  return {
    repository: {
      pullRequest: {
        reviewThreads: {
          nodes: threads
        }
      }
    }
  };
}
__name(makeGraphQLReviewThreadsResponse, "makeGraphQLReviewThreadsResponse");
function makeGraphQLReviewThread(overrides = {}) {
  return {
    id: overrides.id ?? "thread-1",
    isResolved: overrides.isResolved ?? false,
    path: overrides.path ?? "src/a.ts",
    line: overrides.line ?? 10,
    comments: {
      nodes: overrides.comments ?? [makeGraphQLReviewComment()]
    }
  };
}
__name(makeGraphQLReviewThread, "makeGraphQLReviewThread");
function makeGraphQLReviewComment(overrides = {}) {
  return {
    databaseId: overrides.databaseId ?? 100,
    body: overrides.body ?? "Test comment",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
    path: overrides.path ?? "src/a.ts",
    line: overrides.line ?? 10,
    originalLine: overrides.line ?? 10,
    replyTo: overrides.replyToDatabaseId !== void 0 ? { databaseId: overrides.replyToDatabaseId } : null,
    author: {
      login: "reviewer",
      avatarUrl: "https://example.com/avatar"
    }
  };
}
__name(makeGraphQLReviewComment, "makeGraphQLReviewComment");
function makeCheck(overrides) {
  return {
    id: 1,
    name: "test-check",
    status: overrides.status,
    conclusion: overrides.conclusion,
    startedAt: void 0,
    completedAt: void 0,
    detailsUrl: void 0
  };
}
__name(makeCheck, "makeCheck");
//# sourceMappingURL=githubFetchers.test.js.map
