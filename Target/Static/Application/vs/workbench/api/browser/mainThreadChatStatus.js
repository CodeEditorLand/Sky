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
import { Disposable } from "../../../base/common/lifecycle.js";
import { IChatStatusItemService } from "../../contrib/chat/browser/chatStatusItemService.js";
import { extHostNamedCustomer } from "../../services/extensions/common/extHostCustomers.js";
import { MainContext } from "../common/extHost.protocol.js";
let MainThreadChatStatus = class MainThreadChatStatus2 extends Disposable {
  static {
    __name(this, "MainThreadChatStatus");
  }
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
MainThreadChatStatus = __decorate([
  extHostNamedCustomer(MainContext.MainThreadChatStatus),
  __param(1, IChatStatusItemService)
], MainThreadChatStatus);
export {
  MainThreadChatStatus
};
//# sourceMappingURL=mainThreadChatStatus.js.map
