var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { UriParts, IRawURITransformer, URITransformer, IURITransformer } from "../../../base/common/uriIpc.js";
function createRawURITransformer(remoteAuthority) {
  return {
    transformIncoming: /* @__PURE__ */ __name((uri) => {
      if (uri.scheme === "vscode-remote") {
        return { scheme: "file", path: uri.path, query: uri.query, fragment: uri.fragment };
      }
      if (uri.scheme === "file") {
        return { scheme: "vscode-local", path: uri.path, query: uri.query, fragment: uri.fragment };
      }
      return uri;
    }, "transformIncoming"),
    transformOutgoing: /* @__PURE__ */ __name((uri) => {
      if (uri.scheme === "file") {
        return { scheme: "vscode-remote", authority: remoteAuthority, path: uri.path, query: uri.query, fragment: uri.fragment };
      }
      if (uri.scheme === "vscode-local") {
        return { scheme: "file", path: uri.path, query: uri.query, fragment: uri.fragment };
      }
      return uri;
    }, "transformOutgoing"),
    transformOutgoingScheme: /* @__PURE__ */ __name((scheme) => {
      if (scheme === "file") {
        return "vscode-remote";
      } else if (scheme === "vscode-local") {
        return "file";
      }
      return scheme;
    }, "transformOutgoingScheme")
  };
}
__name(createRawURITransformer, "createRawURITransformer");
function createURITransformer(remoteAuthority) {
  return new URITransformer(createRawURITransformer(remoteAuthority));
}
__name(createURITransformer, "createURITransformer");
export {
  createURITransformer
};
//# sourceMappingURL=uriTransformer.js.map
