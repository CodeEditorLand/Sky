var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
class GitHubRepositoryFetcher {
  static {
    __name(this, "GitHubRepositoryFetcher");
  }
  constructor(_apiClient) {
    this._apiClient = _apiClient;
  }
  async getRepository(owner, repo) {
    const data = await this._apiClient.request("GET", `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`, "githubApi.getRepository");
    return {
      owner: data.owner.login,
      name: data.name,
      fullName: data.full_name,
      defaultBranch: data.default_branch,
      isPrivate: data.private,
      description: data.description ?? ""
    };
  }
}
export {
  GitHubRepositoryFetcher
};
//# sourceMappingURL=githubRepositoryFetcher.js.map
