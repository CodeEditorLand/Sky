var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
const GET_REVIEW_THREADS_QUERY = [
  "query GetReviewThreads($owner: String!, $repo: String!, $prNumber: Int!) {",
  "  repository(owner: $owner, name: $repo) {",
  "    pullRequest(number: $prNumber) {",
  "      reviewThreads(first: 100) {",
  "        nodes {",
  "          id",
  "          isResolved",
  "          path",
  "          line",
  "          comments(first: 100) {",
  "            nodes {",
  "              databaseId",
  "              body",
  "              createdAt",
  "              updatedAt",
  "              path",
  "              line",
  "              originalLine",
  "              replyTo {",
  "                databaseId",
  "              }",
  "              author {",
  "                login",
  "                avatarUrl",
  "              }",
  "            }",
  "          }",
  "        }",
  "      }",
  "    }",
  "  }",
  "}"
].join("\n");
const RESOLVE_REVIEW_THREAD_MUTATION = [
  "mutation ResolveReviewThread($threadId: ID!) {",
  "  resolveReviewThread(input: { threadId: $threadId }) {",
  "    thread {",
  "      isResolved",
  "    }",
  "  }",
  "}"
].join("\n");
class GitHubPRFetcher {
  static {
    __name(this, "GitHubPRFetcher");
  }
  constructor(_apiClient) {
    this._apiClient = _apiClient;
  }
  async getPullRequest(owner, repo, prNumber) {
    const data = await this._apiClient.request("GET", `/repos/${e(owner)}/${e(repo)}/pulls/${prNumber}`, "githubApi.getPullRequest");
    return mapPullRequest(data);
  }
  async getMergeability(owner, repo, prNumber) {
    const [pr, reviews] = await Promise.all([
      this._apiClient.request("GET", `/repos/${e(owner)}/${e(repo)}/pulls/${prNumber}`, "githubApi.getMergeability.pr"),
      this._apiClient.request("GET", `/repos/${e(owner)}/${e(repo)}/pulls/${prNumber}/reviews`, "githubApi.getMergeability.reviews")
    ]);
    const blockers = [];
    if (pr.draft) {
      blockers.push({ kind: "draft", description: "Pull request is a draft" });
    }
    if (pr.mergeable === false) {
      blockers.push({ kind: "conflicts", description: "Pull request has merge conflicts" });
    }
    const latestReviewByUser = /* @__PURE__ */ new Map();
    for (const review of reviews) {
      if (review.state === "APPROVED" || review.state === "CHANGES_REQUESTED" || review.state === "DISMISSED") {
        latestReviewByUser.set(review.user.login, review.state);
      }
    }
    const hasChangesRequested = [...latestReviewByUser.values()].some((s) => s === "CHANGES_REQUESTED");
    if (hasChangesRequested) {
      blockers.push({ kind: "changesRequested", description: "Changes have been requested" });
    }
    if (pr.mergeable_state === "blocked") {
      const hasApproval = [...latestReviewByUser.values()].some((s) => s === "APPROVED");
      if (!hasApproval) {
        blockers.push({ kind: "approvalNeeded", description: "Approval is required" });
      }
    }
    if (pr.mergeable_state === "unstable") {
      blockers.push({ kind: "ciFailed", description: "CI checks have failed" });
    }
    return {
      canMerge: blockers.length === 0 && pr.mergeable !== false && pr.state === "open",
      blockers
    };
  }
  async getReviewThreads(owner, repo, prNumber) {
    const data = await this._apiClient.graphql(GET_REVIEW_THREADS_QUERY, "githubApi.getReviewThreads", { owner, repo, prNumber });
    const reviewThreads = data.repository?.pullRequest?.reviewThreads.nodes;
    if (!reviewThreads) {
      throw new Error(`Pull request not found: ${owner}/${repo}#${prNumber}`);
    }
    return reviewThreads.map(mapReviewThread);
  }
  async postReviewComment(owner, repo, prNumber, body, inReplyTo) {
    const data = await this._apiClient.request("POST", `/repos/${e(owner)}/${e(repo)}/pulls/${prNumber}/comments`, "githubApi.postReviewComment", { body, in_reply_to: inReplyTo });
    return mapReviewComment(data);
  }
  async postIssueComment(owner, repo, prNumber, body) {
    const data = await this._apiClient.request("POST", `/repos/${e(owner)}/${e(repo)}/issues/${prNumber}/comments`, "githubApi.postIssueComment", { body });
    return {
      id: data.id,
      body: data.body ?? "",
      author: mapUser(data.user),
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      path: void 0,
      line: void 0,
      threadId: String(data.id),
      inReplyToId: void 0
    };
  }
  async resolveThread(_owner, _repo, threadId) {
    const data = await this._apiClient.graphql(RESOLVE_REVIEW_THREAD_MUTATION, "githubApi.resolveThread", { threadId });
    if (!data.resolveReviewThread?.thread?.isResolved) {
      throw new Error(`Failed to resolve review thread ${threadId}`);
    }
  }
}
function e(value) {
  return encodeURIComponent(value);
}
__name(e, "e");
function mapUser(user) {
  return { login: user.login, avatarUrl: user.avatar_url };
}
__name(mapUser, "mapUser");
function mapPullRequest(data) {
  let state;
  if (data.merged) {
    state = "merged";
  } else if (data.state === "closed") {
    state = "closed";
  } else {
    state = "open";
  }
  return {
    number: data.number,
    title: data.title,
    body: data.body ?? "",
    state,
    author: mapUser(data.user),
    headRef: data.head.ref,
    baseRef: data.base.ref,
    isDraft: data.draft,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    mergedAt: data.merged_at ?? void 0,
    mergeable: data.mergeable ?? void 0,
    mergeableState: data.mergeable_state
  };
}
__name(mapPullRequest, "mapPullRequest");
function mapReviewComment(data) {
  return {
    id: data.id,
    body: data.body,
    author: mapUser(data.user),
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    path: data.path,
    line: data.line ?? data.original_line ?? void 0,
    threadId: String(data.in_reply_to_id ?? data.id),
    inReplyToId: data.in_reply_to_id
  };
}
__name(mapReviewComment, "mapReviewComment");
function mapReviewThread(thread) {
  return {
    id: thread.id,
    isResolved: thread.isResolved,
    path: thread.path,
    line: thread.line ?? void 0,
    comments: thread.comments.nodes.flatMap((comment) => mapGraphQLReviewComment(comment, thread))
  };
}
__name(mapReviewThread, "mapReviewThread");
function mapGraphQLReviewComment(comment, thread) {
  if (comment.databaseId === null || comment.author === null) {
    return [];
  }
  return [{
    id: comment.databaseId,
    body: comment.body,
    author: { login: comment.author.login, avatarUrl: comment.author.avatarUrl },
    createdAt: comment.createdAt,
    updatedAt: comment.updatedAt,
    path: comment.path ?? thread.path,
    line: comment.line ?? comment.originalLine ?? thread.line ?? void 0,
    threadId: thread.id,
    inReplyToId: comment.replyTo?.databaseId ?? void 0
  }];
}
__name(mapGraphQLReviewComment, "mapGraphQLReviewComment");
export {
  GitHubPRFetcher
};
//# sourceMappingURL=githubPRFetcher.js.map
