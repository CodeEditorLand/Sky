var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __decorate = function(decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
  else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = function(paramIndex, decorator) {
  return function(target, key) {
    decorator(target, key, paramIndex);
  };
};
var GitHubFileSystemProvider_1;
import { Emitter } from "../../../../base/common/event.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
import { FileSystemProviderErrorCode, FileType, createFileSystemProviderError } from "../../../../platform/files/common/files.js";
import { IRequestService, asJson } from "../../../../platform/request/common/request.js";
import { IAuthenticationService } from "../../../../workbench/services/authentication/common/authentication.js";
import { CancellationToken } from "../../../../base/common/cancellation.js";
import { ILogService } from "../../../../platform/log/common/log.js";
const GITHUB_REMOTE_FILE_SCHEME = "github-remote-file";
let GitHubFileSystemProvider = class GitHubFileSystemProvider2 extends Disposable {
  static {
    __name(this, "GitHubFileSystemProvider");
  }
  static {
    GitHubFileSystemProvider_1 = this;
  }
  static {
    this.CACHE_TTL_MS = 5 * 60 * 1e3;
  }
  constructor(requestService, authenticationService, logService) {
    super();
    this.requestService = requestService;
    this.authenticationService = authenticationService;
    this.logService = logService;
    this._onDidChangeCapabilities = this._register(new Emitter());
    this.onDidChangeCapabilities = this._onDidChangeCapabilities.event;
    this.capabilities = 2048 | 2 | 1024;
    this._onDidChangeFile = this._register(new Emitter());
    this.onDidChangeFile = this._onDidChangeFile.event;
    this.treeCache = /* @__PURE__ */ new Map();
  }
  // --- URI parsing
  /**
   * Parse a github-remote-file URI into its components.
   * Format: github-remote-file://github/{owner}/{repo}/{ref}/{path...}
   */
  parseUri(resource) {
    const parts = resource.path.split("/").filter(Boolean);
    if (parts.length < 3) {
      throw createFileSystemProviderError("Invalid github-remote-file URI: expected /{owner}/{repo}/{ref}/...", FileSystemProviderErrorCode.FileNotFound);
    }
    const owner = parts[0];
    const repo = parts[1];
    const ref = parts[2];
    const path = parts.slice(3).join("/");
    return { owner, repo, ref, path };
  }
  getCacheKey(owner, repo, ref) {
    return `${owner}/${repo}/${ref}`;
  }
  // --- GitHub API
  async getAuthToken() {
    const sessions = await this.authenticationService.getSessions("github", ["repo"]);
    if (sessions.length > 0) {
      return sessions[0].accessToken;
    }
    const session = await this.authenticationService.createSession("github", ["repo"]);
    return session.accessToken;
  }
  async fetchTree(owner, repo, ref) {
    const cacheKey = this.getCacheKey(owner, repo, ref);
    const cached = this.treeCache.get(cacheKey);
    if (cached && Date.now() - cached.fetchedAt < GitHubFileSystemProvider_1.CACHE_TTL_MS) {
      return cached;
    }
    this.logService.info(`[SessionRepoFS] Fetching tree for ${owner}/${repo}@${ref}`);
    const token = await this.getAuthToken();
    const url = `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/git/trees/${encodeURIComponent(ref)}?recursive=1`;
    const response = await this.requestService.request({
      type: "GET",
      url,
      headers: {
        "Authorization": `token ${token}`,
        "Accept": "application/vnd.github.v3+json",
        "User-Agent": "VSCode-SessionRepoFS"
      }
    }, CancellationToken.None);
    const data = await asJson(response);
    if (!data) {
      throw createFileSystemProviderError(`Failed to fetch tree for ${owner}/${repo}@${ref}`, FileSystemProviderErrorCode.Unavailable);
    }
    const entries = /* @__PURE__ */ new Map();
    entries.set("", { type: FileType.Directory, size: 0, sha: data.sha });
    const dirs = /* @__PURE__ */ new Set();
    for (const entry of data.tree) {
      const fileType = entry.type === "tree" ? FileType.Directory : FileType.File;
      entries.set(entry.path, { type: fileType, size: entry.size ?? 0, sha: entry.sha });
      if (fileType === FileType.Directory) {
        dirs.add(entry.path);
      }
      const pathParts = entry.path.split("/");
      for (let i = 1; i < pathParts.length; i++) {
        const parentPath = pathParts.slice(0, i).join("/");
        if (!dirs.has(parentPath)) {
          dirs.add(parentPath);
          if (!entries.has(parentPath)) {
            entries.set(parentPath, { type: FileType.Directory, size: 0, sha: "" });
          }
        }
      }
    }
    const cacheEntry = { entries, fetchedAt: Date.now() };
    this.treeCache.set(cacheKey, cacheEntry);
    return cacheEntry;
  }
  // --- IFileSystemProvider
  async stat(resource) {
    const { owner, repo, ref, path } = this.parseUri(resource);
    const tree = await this.fetchTree(owner, repo, ref);
    const entry = tree.entries.get(path);
    if (!entry) {
      throw createFileSystemProviderError("File not found", FileSystemProviderErrorCode.FileNotFound);
    }
    return {
      type: entry.type,
      ctime: 0,
      mtime: 0,
      size: entry.size
    };
  }
  async readdir(resource) {
    const { owner, repo, ref, path } = this.parseUri(resource);
    const tree = await this.fetchTree(owner, repo, ref);
    const prefix = path ? path + "/" : "";
    const result = [];
    for (const [entryPath, entry] of tree.entries) {
      if (!entryPath.startsWith(prefix)) {
        continue;
      }
      const relativePath = entryPath.slice(prefix.length);
      if (relativePath && !relativePath.includes("/")) {
        result.push([relativePath, entry.type]);
      }
    }
    return result;
  }
  async readFile(resource) {
    const { owner, repo, ref, path } = this.parseUri(resource);
    const tree = await this.fetchTree(owner, repo, ref);
    const entry = tree.entries.get(path);
    if (!entry || entry.type === FileType.Directory) {
      throw createFileSystemProviderError("File not found", FileSystemProviderErrorCode.FileNotFound);
    }
    const token = await this.getAuthToken();
    const url = `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/git/blobs/${encodeURIComponent(entry.sha)}`;
    const response = await this.requestService.request({
      type: "GET",
      url,
      headers: {
        "Authorization": `token ${token}`,
        "Accept": "application/vnd.github.v3+json",
        "User-Agent": "VSCode-SessionRepoFS"
      }
    }, CancellationToken.None);
    const data = await asJson(response);
    if (!data) {
      throw createFileSystemProviderError(`Failed to read file ${path}`, FileSystemProviderErrorCode.Unavailable);
    }
    if (data.encoding === "base64") {
      const binaryString = atob(data.content.replace(/\n/g, ""));
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      return bytes;
    }
    return new TextEncoder().encode(data.content);
  }
  // --- Readonly stubs
  watch() {
    return Disposable.None;
  }
  async writeFile(_resource, _content, _opts) {
    throw createFileSystemProviderError("Operation not supported", FileSystemProviderErrorCode.NoPermissions);
  }
  async mkdir(_resource) {
    throw createFileSystemProviderError("Operation not supported", FileSystemProviderErrorCode.NoPermissions);
  }
  async delete(_resource, _opts) {
    throw createFileSystemProviderError("Operation not supported", FileSystemProviderErrorCode.NoPermissions);
  }
  async rename(_from, _to, _opts) {
    throw createFileSystemProviderError("Operation not supported", FileSystemProviderErrorCode.NoPermissions);
  }
  // --- Cache management
  invalidateCache(owner, repo, ref) {
    this.treeCache.delete(this.getCacheKey(owner, repo, ref));
  }
  dispose() {
    this.treeCache.clear();
    super.dispose();
  }
};
GitHubFileSystemProvider = GitHubFileSystemProvider_1 = __decorate([
  __param(0, IRequestService),
  __param(1, IAuthenticationService),
  __param(2, ILogService)
], GitHubFileSystemProvider);
export {
  GITHUB_REMOTE_FILE_SCHEME,
  GitHubFileSystemProvider
};
//# sourceMappingURL=githubFileSystemProvider.js.map
