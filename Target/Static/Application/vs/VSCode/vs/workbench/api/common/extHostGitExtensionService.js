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
    base: branch.base,
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
var GitStatus;
(function(GitStatus2) {
  GitStatus2[GitStatus2["INDEX_ADDED"] = 1] = "INDEX_ADDED";
  GitStatus2[GitStatus2["INDEX_DELETED"] = 2] = "INDEX_DELETED";
  GitStatus2[GitStatus2["INDEX_RENAMED"] = 3] = "INDEX_RENAMED";
  GitStatus2[GitStatus2["MODIFIED"] = 5] = "MODIFIED";
  GitStatus2[GitStatus2["DELETED"] = 6] = "DELETED";
  GitStatus2[GitStatus2["UNTRACKED"] = 7] = "UNTRACKED";
  GitStatus2[GitStatus2["INTENT_TO_ADD"] = 9] = "INTENT_TO_ADD";
  GitStatus2[GitStatus2["INTENT_TO_RENAME"] = 10] = "INTENT_TO_RENAME";
})(GitStatus || (GitStatus = {}));
function toGitChangeDto(change) {
  switch (change.status) {
    // Added: no original
    case 1:
    case 7:
    case 9:
      return { uri: change.uri, originalUri: void 0, modifiedUri: change.uri };
    // Deleted: no modified
    case 2:
    case 6:
      return { uri: change.uri, originalUri: change.uri, modifiedUri: void 0 };
    // Renamed: original is old name, modified is new name
    case 3:
    case 10:
      return { uri: change.uri, originalUri: change.originalUri, modifiedUri: change.renameUri };
    // Modified and everything else: both original and modified
    default:
      return { uri: change.uri, originalUri: change.originalUri, modifiedUri: change.uri };
  }
}
__name(toGitChangeDto, "toGitChangeDto");
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
      const state2 = await this._getRepositoryState(repository);
      return { handle: existingHandle, rootUri: repository.rootUri, state: state2 };
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
    const state = await this._getRepositoryState(repository);
    return { handle, rootUri: repository.rootUri, state };
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
    return this._getRepositoryState(repository);
  }
  async _getRepositoryState(repository) {
    const state = repository.state;
    const base = await this._getBranchBase(repository);
    return {
      HEAD: state.HEAD ? toGitBranchDto({ ...state.HEAD, base }) : void 0,
      mergeChanges: state.mergeChanges.map(toGitChangeDto),
      indexChanges: state.indexChanges.map(toGitChangeDto),
      workingTreeChanges: state.workingTreeChanges.map(toGitChangeDto),
      untrackedChanges: state.untrackedChanges.map(toGitChangeDto)
    };
  }
  async _getBranchBase(repository) {
    const state = repository.state;
    if (!state.HEAD?.name) {
      return void 0;
    }
    const baseBranch = await repository.getBranchBase(state.HEAD.name);
    if (!baseBranch?.name) {
      return void 0;
    }
    const isProtected = repository.isBranchProtected(baseBranch);
    return { name: baseBranch.name, isProtected };
  }
  async $diffBetweenWithStats(handle, ref1, ref2, path) {
    const repository = this._repositories.get(handle);
    if (!repository) {
      return [];
    }
    try {
      const changes = await repository.diffBetweenWithStats(ref1, ref2, path);
      return changes.map((c) => ({
        ...toGitChangeDto(c),
        insertions: c.insertions,
        deletions: c.deletions
      }));
    } catch {
      return [];
    }
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
