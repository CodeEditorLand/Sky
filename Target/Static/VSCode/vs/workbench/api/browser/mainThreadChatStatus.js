var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
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
import { Disposable } from "../../../base/common/lifecycle.js";
import { IChatStatusItemService } from "../../contrib/chat/browser/chatStatusItemService.js";
import { IExtHostContext, extHostNamedCustomer } from "../../services/extensions/common/extHostCustomers.js";
import { ChatStatusItemDto, MainContext, MainThreadChatStatusShape } from "../common/extHost.protocol.js";
let MainThreadChatStatus = class extends Disposable {
  constructor(_extHostContext, _chatStatusItemService) {
    super();
    this._chatStatusItemService = _chatStatusItemService;
  }
  $setEntry(id, entry) {
    this._chatStatusItemService.setOrUpdateEntry({
      id,
      label: entry.title,
      description: entry.description,
      detail: entry.detail
    });
  }
  $disposeEntry(id) {
    this._chatStatusItemService.deleteEntry(id);
  }
};
__name(MainThreadChatStatus, "MainThreadChatStatus");
MainThreadChatStatus = __decorateClass([
  extHostNamedCustomer(MainContext.MainThreadChatStatus),
  __decorateParam(1, IChatStatusItemService)
], MainThreadChatStatus);
export {
  MainThreadChatStatus
};
//# sourceMappingURL=mainThreadChatStatus.js.map
