var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Emitter, Event } from "../../../base/common/event.js";
import { Disposable } from "../../../base/common/lifecycle.js";
import { IChannel, IServerChannel } from "../../../base/parts/ipc/common/ipc.js";
import { URI, UriDto } from "../../../base/common/uri.js";
import { DidChangeProfilesEvent, IUserDataProfile, IUserDataProfileOptions, IUserDataProfilesService, IUserDataProfileUpdateOptions, reviveProfile } from "./userDataProfile.js";
import { IAnyWorkspaceIdentifier } from "../../workspace/common/workspace.js";
import { IURITransformer, transformIncomingURIs, transformOutgoingURIs } from "../../../base/common/uriIpc.js";
class RemoteUserDataProfilesServiceChannel {
  constructor(service, getUriTransformer) {
    this.service = service;
    this.getUriTransformer = getUriTransformer;
  }
  static {
    __name(this, "RemoteUserDataProfilesServiceChannel");
  }
  listen(context, event) {
    const uriTransformer = this.getUriTransformer(context);
    switch (event) {
      case "onDidChangeProfiles":
        return Event.map(this.service.onDidChangeProfiles, (e) => {
          return {
            all: e.all.map((p) => transformOutgoingURIs({ ...p }, uriTransformer)),
            added: e.added.map((p) => transformOutgoingURIs({ ...p }, uriTransformer)),
            removed: e.removed.map((p) => transformOutgoingURIs({ ...p }, uriTransformer)),
            updated: e.updated.map((p) => transformOutgoingURIs({ ...p }, uriTransformer))
          };
        });
    }
    throw new Error(`Invalid listen ${event}`);
  }
  async call(context, command, args) {
    const uriTransformer = this.getUriTransformer(context);
    switch (command) {
      case "createProfile": {
        const profile = await this.service.createProfile(args[0], args[1], args[2]);
        return transformOutgoingURIs({ ...profile }, uriTransformer);
      }
      case "updateProfile": {
        let profile = reviveProfile(transformIncomingURIs(args[0], uriTransformer), this.service.profilesHome.scheme);
        profile = await this.service.updateProfile(profile, args[1]);
        return transformOutgoingURIs({ ...profile }, uriTransformer);
      }
      case "removeProfile": {
        const profile = reviveProfile(transformIncomingURIs(args[0], uriTransformer), this.service.profilesHome.scheme);
        return this.service.removeProfile(profile);
      }
    }
    throw new Error(`Invalid call ${command}`);
  }
}
class UserDataProfilesService extends Disposable {
  constructor(profiles, profilesHome, channel) {
    super();
    this.profilesHome = profilesHome;
    this.channel = channel;
    this._profiles = profiles.map((profile) => reviveProfile(profile, this.profilesHome.scheme));
    this._register(this.channel.listen("onDidChangeProfiles")((e) => {
      const added = e.added.map((profile) => reviveProfile(profile, this.profilesHome.scheme));
      const removed = e.removed.map((profile) => reviveProfile(profile, this.profilesHome.scheme));
      const updated = e.updated.map((profile) => reviveProfile(profile, this.profilesHome.scheme));
      this._profiles = e.all.map((profile) => reviveProfile(profile, this.profilesHome.scheme));
      this._onDidChangeProfiles.fire({ added, removed, updated, all: this.profiles });
    }));
    this.onDidResetWorkspaces = this.channel.listen("onDidResetWorkspaces");
  }
  static {
    __name(this, "UserDataProfilesService");
  }
  _serviceBrand;
  get defaultProfile() {
    return this.profiles[0];
  }
  _profiles = [];
  get profiles() {
    return this._profiles;
  }
  _onDidChangeProfiles = this._register(new Emitter());
  onDidChangeProfiles = this._onDidChangeProfiles.event;
  onDidResetWorkspaces;
  async createNamedProfile(name, options, workspaceIdentifier) {
    const result = await this.channel.call("createNamedProfile", [name, options, workspaceIdentifier]);
    return reviveProfile(result, this.profilesHome.scheme);
  }
  async createProfile(id, name, options, workspaceIdentifier) {
    const result = await this.channel.call("createProfile", [id, name, options, workspaceIdentifier]);
    return reviveProfile(result, this.profilesHome.scheme);
  }
  async createTransientProfile(workspaceIdentifier) {
    const result = await this.channel.call("createTransientProfile", [workspaceIdentifier]);
    return reviveProfile(result, this.profilesHome.scheme);
  }
  async setProfileForWorkspace(workspaceIdentifier, profile) {
    await this.channel.call("setProfileForWorkspace", [workspaceIdentifier, profile]);
  }
  removeProfile(profile) {
    return this.channel.call("removeProfile", [profile]);
  }
  async updateProfile(profile, updateOptions) {
    const result = await this.channel.call("updateProfile", [profile, updateOptions]);
    return reviveProfile(result, this.profilesHome.scheme);
  }
  resetWorkspaces() {
    return this.channel.call("resetWorkspaces");
  }
  cleanUp() {
    return this.channel.call("cleanUp");
  }
  cleanUpTransientProfiles() {
    return this.channel.call("cleanUpTransientProfiles");
  }
}
export {
  RemoteUserDataProfilesServiceChannel,
  UserDataProfilesService
};
//# sourceMappingURL=userDataProfileIpc.js.map
