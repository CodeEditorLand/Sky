var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { URI } from "../../../base/common/uri.js";
const SshProtocolMatcher = /^([^@:]+@)?([^:]+):/;
const SshUrlMatcher = /^([^@:]+@)?([^:]+):(.+)$/;
const AuthorityMatcher = /^([^@]+@)?([^:]+)(:\d+)?$/;
const SecondLevelDomainMatcher = /([^@:.]+\.[^@:.]+)(:\d+)?$/;
const RemoteMatcher = /^\s*url\s*=\s*(.+\S)\s*$/mg;
const AnyButDot = /[^.]/g;
const AllowedSecondLevelDomains = [
  "github.com",
  "bitbucket.org",
  "visualstudio.com",
  "gitlab.com",
  "heroku.com",
  "azurewebsites.net",
  "ibm.com",
  "amazon.com",
  "amazonaws.com",
  "cloudapp.net",
  "rhcloud.com",
  "google.com",
  "azure.com"
];
function stripLowLevelDomains(domain) {
  const match = domain.match(SecondLevelDomainMatcher);
  return match ? match[1] : null;
}
__name(stripLowLevelDomains, "stripLowLevelDomains");
function extractDomain(url) {
  if (url.indexOf("://") === -1) {
    const match = url.match(SshProtocolMatcher);
    if (match) {
      return stripLowLevelDomains(match[2]);
    } else {
      return null;
    }
  }
  try {
    const uri = URI.parse(url);
    if (uri.authority) {
      return stripLowLevelDomains(uri.authority);
    }
  } catch (e) {
  }
  return null;
}
__name(extractDomain, "extractDomain");
function getDomainsOfRemotes(text, allowedDomains) {
  const domains = /* @__PURE__ */ new Set();
  let match;
  while (match = RemoteMatcher.exec(text)) {
    const domain = extractDomain(match[1]);
    if (domain) {
      domains.add(domain);
    }
  }
  const allowedDomainsSet = new Set(allowedDomains);
  return Array.from(domains).map((key) => allowedDomainsSet.has(key) ? key : key.replace(AnyButDot, "a"));
}
__name(getDomainsOfRemotes, "getDomainsOfRemotes");
function stripPort(authority) {
  const match = authority.match(AuthorityMatcher);
  return match ? match[2] : null;
}
__name(stripPort, "stripPort");
function normalizeRemote(host, path, stripEndingDotGit) {
  if (host && path) {
    if (stripEndingDotGit && path.endsWith(".git")) {
      path = path.substr(0, path.length - 4);
    }
    return path.indexOf("/") === 0 ? `${host}${path}` : `${host}/${path}`;
  }
  return null;
}
__name(normalizeRemote, "normalizeRemote");
function extractRemote(url, stripEndingDotGit) {
  if (url.indexOf("://") === -1) {
    const match = url.match(SshUrlMatcher);
    if (match) {
      return normalizeRemote(match[2], match[3], stripEndingDotGit);
    }
  }
  try {
    const uri = URI.parse(url);
    if (uri.authority) {
      return normalizeRemote(stripPort(uri.authority), uri.path, stripEndingDotGit);
    }
  } catch (e) {
  }
  return null;
}
__name(extractRemote, "extractRemote");
function getRemotes(text, stripEndingDotGit = false) {
  const remotes = [];
  let match;
  while (match = RemoteMatcher.exec(text)) {
    const remote = extractRemote(match[1], stripEndingDotGit);
    if (remote) {
      remotes.push(remote);
    }
  }
  return remotes;
}
__name(getRemotes, "getRemotes");
export {
  AllowedSecondLevelDomains,
  getDomainsOfRemotes,
  getRemotes
};
//# sourceMappingURL=configRemotes.js.map
