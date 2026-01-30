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
var MainThreadChatCodemapper_1;
import { Disposable, DisposableMap } from "../../../base/common/lifecycle.js";
import { URI } from "../../../base/common/uri.js";
import { TextEdit } from "../../../editor/common/languages.js";
import { ICodeMapperService } from "../../contrib/chat/common/editing/chatCodeMapperService.js";
import { extHostNamedCustomer } from "../../services/extensions/common/extHostCustomers.js";
import { ExtHostContext, MainContext } from "../common/extHost.protocol.js";
import { NotebookDto } from "./mainThreadNotebookDto.js";
let MainThreadChatCodemapper = class MainThreadChatCodemapper2 extends Disposable {
  static {
    __name(this, "MainThreadChatCodemapper");
  }
  static {
    MainThreadChatCodemapper_1 = this;
  }
  static {
    this._requestHandlePool = 0;
  }
  constructor(extHostContext, codeMapperService) {
    super();
    this.codeMapperService = codeMapperService;
    this.providers = this._register(new DisposableMap());
    this._responseMap = /* @__PURE__ */ new Map();
    this._proxy = extHostContext.getProxy(ExtHostContext.ExtHostCodeMapper);
  }
  $registerCodeMapperProvider(handle, displayName) {
    const impl = {
      displayName,
      mapCode: /* @__PURE__ */ __name(async (uiRequest, response, token) => {
        const requestId = String(MainThreadChatCodemapper_1._requestHandlePool++);
        this._responseMap.set(requestId, response);
        const extHostRequest = {
          requestId,
          codeBlocks: uiRequest.codeBlocks,
          chatRequestId: uiRequest.chatRequestId,
          chatRequestModel: uiRequest.chatRequestModel,
          chatSessionResource: uiRequest.chatSessionResource,
          location: uiRequest.location
        };
        try {
          return await this._proxy.$mapCode(handle, extHostRequest, token).then((result) => result ?? void 0);
        } finally {
          this._responseMap.delete(requestId);
        }
      }, "mapCode")
    };
    const disposable = this.codeMapperService.registerCodeMapperProvider(handle, impl);
    this.providers.set(handle, disposable);
  }
  $unregisterCodeMapperProvider(handle) {
    this.providers.deleteAndDispose(handle);
  }
  $handleProgress(requestId, data) {
    const response = this._responseMap.get(requestId);
    if (response) {
      const edits = data.edits;
      const resource = URI.revive(data.uri);
      if (!edits.length) {
        response.textEdit(resource, []);
      } else if (edits.every(TextEdit.isTextEdit)) {
        response.textEdit(resource, edits);
      } else {
        response.notebookEdit(resource, edits.map(NotebookDto.fromCellEditOperationDto));
      }
    }
    return Promise.resolve();
  }
};
MainThreadChatCodemapper = MainThreadChatCodemapper_1 = __decorate([
  extHostNamedCustomer(MainContext.MainThreadCodeMapper),
  __param(1, ICodeMapperService)
], MainThreadChatCodemapper);
export {
  MainThreadChatCodemapper
};
//# sourceMappingURL=mainThreadChatCodeMapper.js.map
