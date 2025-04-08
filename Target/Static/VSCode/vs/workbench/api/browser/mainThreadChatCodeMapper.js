var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp(target, key, result);
  return result;
};
var __decorateParam = (index, decorator) => (target, key) => decorator(target, key, index);
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
import { CancellationToken } from "../../../base/common/cancellation.js";
import { Disposable, DisposableMap, IDisposable } from "../../../base/common/lifecycle.js";
import { URI } from "../../../base/common/uri.js";
import { TextEdit } from "../../../editor/common/languages.js";
import { ICodeMapperProvider, ICodeMapperRequest, ICodeMapperResponse, ICodeMapperService } from "../../contrib/chat/common/chatCodeMapperService.js";
import { extHostNamedCustomer, IExtHostContext } from "../../services/extensions/common/extHostCustomers.js";
import { ExtHostCodeMapperShape, ExtHostContext, ICodeMapperProgressDto, ICodeMapperRequestDto, MainContext, MainThreadCodeMapperShape } from "../common/extHost.protocol.js";
import { NotebookDto } from "./mainThreadNotebookDto.js";
let MainThreadChatCodemapper = class extends Disposable {
  constructor(extHostContext, codeMapperService) {
    super();
    this.codeMapperService = codeMapperService;
    this._proxy = extHostContext.getProxy(ExtHostContext.ExtHostCodeMapper);
  }
  providers = this._register(new DisposableMap());
  _proxy;
  _responseMap = /* @__PURE__ */ new Map();
  $registerCodeMapperProvider(handle, displayName) {
    const impl = {
      displayName,
      mapCode: /* @__PURE__ */ __name(async (uiRequest, response, token) => {
        const requestId = String(MainThreadChatCodemapper._requestHandlePool++);
        this._responseMap.set(requestId, response);
        const extHostRequest = {
          requestId,
          codeBlocks: uiRequest.codeBlocks,
          chatRequestId: uiRequest.chatRequestId,
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
__name(MainThreadChatCodemapper, "MainThreadChatCodemapper");
__publicField(MainThreadChatCodemapper, "_requestHandlePool", 0);
MainThreadChatCodemapper = __decorateClass([
  extHostNamedCustomer(MainContext.MainThreadCodeMapper),
  __decorateParam(1, ICodeMapperService)
], MainThreadChatCodemapper);
export {
  MainThreadChatCodemapper
};
//# sourceMappingURL=mainThreadChatCodeMapper.js.map
