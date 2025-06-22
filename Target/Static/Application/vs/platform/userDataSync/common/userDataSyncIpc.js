var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Emitter } from "../../../base/common/event.js";
import { Disposable } from "../../../base/common/lifecycle.js";
import { URI } from "../../../base/common/uri.js";
import { IConfigurationService } from "../../configuration/common/configuration.js";
import { IProductService } from "../../product/common/productService.js";
import { IStorageService } from "../../storage/common/storage.js";
import { AbstractUserDataSyncStoreManagementService } from "./userDataSyncStoreService.js";
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
class UserDataSyncAccountServiceChannel {
  static {
    __name(this, "UserDataSyncAccountServiceChannel");
  }
  constructor(service) {
    this.service = service;
  }
  listen(_, event) {
    switch (event) {
      case "onDidChangeAccount":
        return this.service.onDidChangeAccount;
      case "onTokenFailed":
        return this.service.onTokenFailed;
    }
    throw new Error(`[UserDataSyncAccountServiceChannel] Event not found: ${event}`);
  }
  call(context, command, args) {
    switch (command) {
      case "_getInitialData":
        return Promise.resolve(this.service.account);
      case "updateAccount":
        return this.service.updateAccount(args);
    }
    throw new Error("Invalid call");
  }
}
class UserDataSyncAccountServiceChannelClient extends Disposable {
  static {
    __name(this, "UserDataSyncAccountServiceChannelClient");
  }
  get account() {
    return this._account;
  }
  get onTokenFailed() {
    return this.channel.listen("onTokenFailed");
  }
  constructor(channel) {
    super();
    this.channel = channel;
    this._onDidChangeAccount = this._register(new Emitter());
    this.onDidChangeAccount = this._onDidChangeAccount.event;
    this.channel.call("_getInitialData").then((account) => {
      this._account = account;
      this._register(this.channel.listen("onDidChangeAccount")((account2) => {
        this._account = account2;
        this._onDidChangeAccount.fire(account2);
      }));
    });
  }
  updateAccount(account) {
    return this.channel.call("updateAccount", account);
  }
}
class UserDataSyncStoreManagementServiceChannel {
  static {
    __name(this, "UserDataSyncStoreManagementServiceChannel");
  }
  constructor(service) {
    this.service = service;
  }
  listen(_, event) {
    switch (event) {
      case "onDidChangeUserDataSyncStore":
        return this.service.onDidChangeUserDataSyncStore;
    }
    throw new Error(`[UserDataSyncStoreManagementServiceChannel] Event not found: ${event}`);
  }
  call(context, command, args) {
    switch (command) {
      case "switch":
        return this.service.switch(args[0]);
      case "getPreviousUserDataSyncStore":
        return this.service.getPreviousUserDataSyncStore();
    }
    throw new Error("Invalid call");
  }
}
let UserDataSyncStoreManagementServiceChannelClient = class UserDataSyncStoreManagementServiceChannelClient2 extends AbstractUserDataSyncStoreManagementService {
  static {
    __name(this, "UserDataSyncStoreManagementServiceChannelClient");
  }
  constructor(channel, productService, configurationService, storageService) {
    super(productService, configurationService, storageService);
    this.channel = channel;
    this._register(this.channel.listen("onDidChangeUserDataSyncStore")(() => this.updateUserDataSyncStore()));
  }
  async switch(type) {
    return this.channel.call("switch", [type]);
  }
  async getPreviousUserDataSyncStore() {
    const userDataSyncStore = await this.channel.call("getPreviousUserDataSyncStore");
    return this.revive(userDataSyncStore);
  }
  revive(userDataSyncStore) {
    return {
      url: URI.revive(userDataSyncStore.url),
      type: userDataSyncStore.type,
      defaultUrl: URI.revive(userDataSyncStore.defaultUrl),
      insidersUrl: URI.revive(userDataSyncStore.insidersUrl),
      stableUrl: URI.revive(userDataSyncStore.stableUrl),
      canSwitch: userDataSyncStore.canSwitch,
      authenticationProviders: userDataSyncStore.authenticationProviders
    };
  }
};
UserDataSyncStoreManagementServiceChannelClient = __decorate([
  __param(1, IProductService),
  __param(2, IConfigurationService),
  __param(3, IStorageService)
], UserDataSyncStoreManagementServiceChannelClient);
export {
  UserDataSyncAccountServiceChannel,
  UserDataSyncAccountServiceChannelClient,
  UserDataSyncStoreManagementServiceChannel,
  UserDataSyncStoreManagementServiceChannelClient
};
//# sourceMappingURL=userDataSyncIpc.js.map
