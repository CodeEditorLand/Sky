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
var ExtHostGitExtensionService_1;
import { Event } from "../../../base/common/event.js";
import { Disposable, DisposableStore } from "../../../base/common/lifecycle.js";
import { URI } from "../../../base/common/uri.js";
import { ExtensionIdentifier } from "../../../platform/extensions/common/extensions.js";
import { createDecorator } from "../../../platform/instantiation/common/instantiation.js";
import { IExtHostExtensionService } from "./extHostExtensionService.js";
import { IExtHostRpcService } from "./extHostRpcService.js";
import { GitRefTypeDto, MainContext } from "./extHost.protocol.js";
import { ResourceMap } from "../../../base/common/map.js";
const GIT_EXTENSION_ID = "vscode.git";
function toGitRefTypeDto(type) {
  switch (type) {
    case 0:
      return GitRefTypeDto.Head;
    case 1:
      return GitRefTypeDto.RemoteHead;
    case 2:
      return GitRefTypeDto.Tag;
    default:
      throw new Error(`Unknown GitRefType: ${type}`);
  }
}
__name(toGitRefTypeDto, "toGitRefTypeDto");
function toGitBranchDto(branch) {
  return {
    name: branch.name,
    commit: branch.commit,
    type: toGitRefTypeDto(branch.type),
    remote: branch.remote,
    upstream: branch.upstream ? toGitUpstreamRefDto(branch.upstream) : void 0,
    ahead: branch.ahead,
    behind: branch.behind
  };
}
__name(toGitBranchDto, "toGitBranchDto");
function toGitUpstreamRefDto(upstream) {
  return {
    remote: upstream.remote,
    name: upstream.name,
    commit: upstream.commit
  };
}
__name(toGitUpstreamRefDto, "toGitUpstreamRefDto");
var GitRefType;
(function(GitRefType2) {
  GitRefType2[GitRefType2["Head"] = 0] = "Head";
  GitRefType2[GitRefType2["RemoteHead"] = 1] = "RemoteHead";
  GitRefType2[GitRefType2["Tag"] = 2] = "Tag";
})(GitRefType || (GitRefType = {}));
const IExtHostGitExtensionService = createDecorator("IExtHostGitExtensionService");
let ExtHostGitExtensionService = class ExtHostGitExtensionService2 extends Disposable {
  static {
    __name(this, "ExtHostGitExtensionService");
  }
  static {
    ExtHostGitExtensionService_1 = this;
  }
  static {
    this._handlePool = 0;
  }
  constructor(extHostRpc, _extHostExtensionService) {
    super();
    this._extHostExtensionService = _extHostExtensionService;
    this._repositories = /* @__PURE__ */ new Map();
    this._repositoryByUri = new ResourceMap();
    this._disposables = this._register(new DisposableStore());
    this._proxy = extHostRpc.getProxy(MainContext.MainThreadGitExtension);
  }
  async $isGitExtensionAvailable() {
    const registry = await this._extHostExtensionService.getExtensionRegistry();
    return !!registry.getExtensionDescription(GIT_EXTENSION_ID);
  }
  async $openRepository(uri) {
    const api = await this._ensureGitApi();
    if (!api) {
      return void 0;
    }
    const repository = await api.openRepository(URI.revive(uri));
    if (!repository) {
      return void 0;
    }
    const existingHandle = this._repositoryByUri.get(repository.rootUri);
    if (existingHandle !== void 0) {
      return {
        handle: existingHandle,
        rootUri: repository.rootUri,
        state: {
          HEAD: repository.state.HEAD ? toGitBranchDto(repository.state.HEAD) : void 0
        }
      };
    }
    let repositoryState = repository.state;
    if (repositoryState.HEAD === void 0) {
      await Event.toPromise(repositoryState.onDidChange, this._disposables);
      repositoryState = repository.state;
    }
    const handle = ExtHostGitExtensionService_1._handlePool++;
    this._repositories.set(handle, repository);
    this._repositoryByUri.set(repository.rootUri, handle);
    this._disposables.add(repository.state.onDidChange(() => {
      this._proxy.$onDidChangeRepository(handle);
    }));
    return {
      handle,
      rootUri: repository.rootUri,
      state: {
        HEAD: repository.state.HEAD ? toGitBranchDto(repository.state.HEAD) : void 0
      }
    };
  }
  async $getRefs(handle, query, token) {
    const repository = this._repositories.get(handle);
    if (!repository) {
      return [];
    }
    try {
      const refs = await repository.getRefs(query, token);
      const result = refs.map((ref) => {
        if (!ref.name || !ref.commit) {
          return void 0;
        }
        const id = ref.type === 0 ? `refs/heads/${ref.name}` : ref.type === 1 ? `refs/remotes/${ref.remote}/${ref.name}` : `refs/tags/${ref.name}`;
        return {
          id,
          name: ref.name,
          type: toGitRefTypeDto(ref.type),
          revision: ref.commit
        };
      });
      return result.filter((ref) => !!ref);
    } catch {
      return [];
    }
  }
  async $getRepositoryState(handle) {
    const repository = this._repositories.get(handle);
    if (!repository) {
      return void 0;
    }
    const state = repository.state;
    return { HEAD: state.HEAD ? toGitBranchDto(state.HEAD) : void 0 };
  }
  async _ensureGitApi() {
    if (this._gitApi) {
      return this._gitApi;
    }
    try {
      await this._extHostExtensionService.activateByIdWithErrors(new ExtensionIdentifier(GIT_EXTENSION_ID), { startup: false, extensionId: new ExtensionIdentifier(GIT_EXTENSION_ID), activationEvent: "api" });
      const exports = this._extHostExtensionService.getExtensionExports(new ExtensionIdentifier(GIT_EXTENSION_ID));
      if (!!exports && typeof exports.getAPI === "function") {
        this._gitApi = exports.getAPI(1);
      }
    } catch {
    }
    return this._gitApi;
  }
  dispose() {
    this._disposables.dispose();
    super.dispose();
  }
};
ExtHostGitExtensionService = ExtHostGitExtensionService_1 = __decorate([
  __param(0, IExtHostRpcService),
  __param(1, IExtHostExtensionService)
], ExtHostGitExtensionService);
export {
  ExtHostGitExtensionService,
  IExtHostGitExtensionService
};
//# sourceMappingURL=extHostGitExtensionService.js.map
