var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { CancellationToken } from "../../../base/common/cancellation.js";
import { IExtensionDescription } from "../../../platform/extensions/common/extensions.js";
import { ICodeMapperResult } from "../../contrib/chat/common/chatCodeMapperService.js";
import * as extHostProtocol from "./extHost.protocol.js";
import { NotebookEdit, TextEdit } from "./extHostTypeConverters.js";
import { URI } from "../../../base/common/uri.js";
import { asArray } from "../../../base/common/arrays.js";
class ExtHostCodeMapper {
  static {
    __name(this, "ExtHostCodeMapper");
  }
  static _providerHandlePool = 0;
  _proxy;
  providers = /* @__PURE__ */ new Map();
  constructor(mainContext) {
    this._proxy = mainContext.getProxy(extHostProtocol.MainContext.MainThreadCodeMapper);
  }
  async $mapCode(handle, internalRequest, token) {
    const provider = this.providers.get(handle);
    if (!provider) {
      throw new Error(`Received request to map code for unknown provider handle ${handle}`);
    }
    const stream = {
      textEdit: /* @__PURE__ */ __name((target, edits) => {
        edits = asArray(edits);
        this._proxy.$handleProgress(internalRequest.requestId, {
          uri: target,
          edits: edits.map(TextEdit.from)
        });
      }, "textEdit"),
      notebookEdit: /* @__PURE__ */ __name((target, edits) => {
        edits = asArray(edits);
        this._proxy.$handleProgress(internalRequest.requestId, {
          uri: target,
          edits: edits.map(NotebookEdit.from)
        });
      }, "notebookEdit")
    };
    const request = {
      location: internalRequest.location,
      chatRequestId: internalRequest.chatRequestId,
      codeBlocks: internalRequest.codeBlocks.map((block) => {
        return {
          code: block.code,
          resource: URI.revive(block.resource),
          markdownBeforeBlock: block.markdownBeforeBlock
        };
      })
    };
    const result = await provider.provideMappedEdits(request, stream, token);
    return result ?? null;
  }
  registerMappedEditsProvider(extension, provider) {
    const handle = ExtHostCodeMapper._providerHandlePool++;
    this._proxy.$registerCodeMapperProvider(handle, extension.displayName ?? extension.name);
    this.providers.set(handle, provider);
    return {
      dispose: /* @__PURE__ */ __name(() => {
        return this._proxy.$unregisterCodeMapperProvider(handle);
      }, "dispose")
    };
  }
}
export {
  ExtHostCodeMapper
};
//# sourceMappingURL=extHostCodeMapper.js.map
