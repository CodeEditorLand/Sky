var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { URI } from "../../../../../base/common/uri.js";
var MarketplaceReferenceKind;
(function(MarketplaceReferenceKind2) {
  MarketplaceReferenceKind2["GitHubShorthand"] = "githubShorthand";
  MarketplaceReferenceKind2["GitUri"] = "gitUri";
  MarketplaceReferenceKind2["LocalFileUri"] = "localFileUri";
})(MarketplaceReferenceKind || (MarketplaceReferenceKind = {}));
function parseMarketplaceReferences(values) {
  const byCanonicalId = /* @__PURE__ */ new Map();
  for (const value of values) {
    if (typeof value !== "string") {
      continue;
    }
    const parsed = parseMarketplaceReference(value);
    if (!parsed) {
      continue;
    }
    if (!byCanonicalId.has(parsed.canonicalId)) {
      byCanonicalId.set(parsed.canonicalId, parsed);
    }
  }
  return [...byCanonicalId.values()];
}
__name(parseMarketplaceReferences, "parseMarketplaceReferences");
function deduplicateMarketplaceReferences(primary, secondary) {
  const byCanonicalId = /* @__PURE__ */ new Map();
  for (const ref of primary) {
    byCanonicalId.set(ref.canonicalId, ref);
  }
  for (const ref of secondary) {
    if (!byCanonicalId.has(ref.canonicalId)) {
      byCanonicalId.set(ref.canonicalId, ref);
    }
  }
  return [...byCanonicalId.values()];
}
__name(deduplicateMarketplaceReferences, "deduplicateMarketplaceReferences");
function parseMarketplaceReference(value) {
  const rawValue = value.trim();
  if (!rawValue) {
    return void 0;
  }
  const uriReference = parseUriMarketplaceReference(rawValue);
  if (uriReference) {
    return uriReference;
  }
  const scpReference = parseScpMarketplaceReference(rawValue);
  if (scpReference) {
    return scpReference;
  }
  const shorthandMatch = /^([A-Za-z0-9_.-]+)\/([A-Za-z0-9_.-]+)$/.exec(rawValue);
  if (shorthandMatch) {
    const owner = shorthandMatch[1];
    const repo = shorthandMatch[2];
    return {
      rawValue,
      displayLabel: `${owner}/${repo}`,
      cloneUrl: `https://github.com/${owner}/${repo}.git`,
      canonicalId: getGitHubCanonicalId(owner, repo),
      cacheSegments: ["github.com", owner, repo],
      kind: "githubShorthand",
      githubRepo: `${owner}/${repo}`
    };
  }
  return void 0;
}
__name(parseMarketplaceReference, "parseMarketplaceReference");
function parseUriMarketplaceReference(rawValue) {
  let uri;
  try {
    uri = URI.parse(rawValue);
  } catch {
    return void 0;
  }
  const scheme = uri.scheme.toLowerCase();
  if (scheme === "file" && /^file:\/\//i.test(rawValue)) {
    const localRepositoryUri = URI.file(uri.fsPath);
    return {
      rawValue,
      displayLabel: localRepositoryUri.fsPath,
      cloneUrl: rawValue,
      canonicalId: `file:${localRepositoryUri.toString().toLowerCase()}`,
      cacheSegments: [],
      kind: "localFileUri",
      localRepositoryUri
    };
  }
  if (scheme !== "http" && scheme !== "https" && scheme !== "ssh") {
    return void 0;
  }
  if (!uri.authority) {
    return void 0;
  }
  const normalizedPath = normalizeGitRepoPath(uri.path);
  if (!normalizedPath) {
    return void 0;
  }
  const gitSuffix = ".git";
  const sanitizedAuthority = sanitizePathSegment(uri.authority.toLowerCase());
  const pathHasGitSuffix = normalizedPath.toLowerCase().endsWith(gitSuffix);
  const pathWithoutGit = pathHasGitSuffix ? normalizedPath.slice(1, normalizedPath.length - gitSuffix.length) : normalizedPath.slice(1);
  const pathSegments = pathWithoutGit.split("/").map(sanitizePathSegment);
  const canonicalPath = pathHasGitSuffix ? normalizedPath.slice(1).toLowerCase() : `${normalizedPath.slice(1).toLowerCase()}${gitSuffix}`;
  return {
    rawValue,
    displayLabel: rawValue,
    cloneUrl: rawValue,
    canonicalId: `git:${uri.authority.toLowerCase()}/${canonicalPath}`,
    cacheSegments: [sanitizedAuthority, ...pathSegments],
    kind: "gitUri"
  };
}
__name(parseUriMarketplaceReference, "parseUriMarketplaceReference");
function parseScpMarketplaceReference(rawValue) {
  const match = /^([^@\s]+)@([^:\s]+):(.+\.git)$/i.exec(rawValue);
  if (!match) {
    return void 0;
  }
  const authority = match[2];
  const pathWithGit = match[3].replace(/^\/+/, "");
  if (!pathWithGit.toLowerCase().endsWith(".git")) {
    return void 0;
  }
  const pathSegments = pathWithGit.slice(0, -4).split("/").map(sanitizePathSegment);
  return {
    rawValue,
    displayLabel: rawValue,
    cloneUrl: rawValue,
    canonicalId: `git:${authority.toLowerCase()}/${pathWithGit.toLowerCase()}`,
    cacheSegments: [sanitizePathSegment(authority.toLowerCase()), ...pathSegments],
    kind: "gitUri"
  };
}
__name(parseScpMarketplaceReference, "parseScpMarketplaceReference");
function normalizeGitRepoPath(path) {
  const gitSuffix = ".git";
  const trimmed = path.replace(/\/+/g, "/").replace(/\/+$/g, "");
  const withLeadingSlash = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  const pathWithoutGit = withLeadingSlash.toLowerCase().endsWith(gitSuffix) ? withLeadingSlash.slice(1, withLeadingSlash.length - gitSuffix.length) : withLeadingSlash.slice(1);
  if (!pathWithoutGit || !pathWithoutGit.includes("/")) {
    return void 0;
  }
  return withLeadingSlash;
}
__name(normalizeGitRepoPath, "normalizeGitRepoPath");
function getGitHubCanonicalId(owner, repo) {
  return `github:${owner.toLowerCase()}/${repo.toLowerCase()}`;
}
__name(getGitHubCanonicalId, "getGitHubCanonicalId");
function sanitizePathSegment(value) {
  return value.replace(/[\\/:*?"<>|]/g, "_");
}
__name(sanitizePathSegment, "sanitizePathSegment");
export {
  MarketplaceReferenceKind,
  deduplicateMarketplaceReferences,
  parseMarketplaceReference,
  parseMarketplaceReferences
};
//# sourceMappingURL=marketplaceReference.js.map
