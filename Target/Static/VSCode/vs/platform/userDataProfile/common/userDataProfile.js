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
import { hash } from "../../../base/common/hash.js";
import { Emitter, Event } from "../../../base/common/event.js";
import { Disposable } from "../../../base/common/lifecycle.js";
import { basename, joinPath } from "../../../base/common/resources.js";
import { URI, UriDto } from "../../../base/common/uri.js";
import { localize } from "../../../nls.js";
import { IEnvironmentService } from "../../environment/common/environment.js";
import { FileOperationResult, IFileService, toFileOperationResult } from "../../files/common/files.js";
import { createDecorator } from "../../instantiation/common/instantiation.js";
import { ILogService } from "../../log/common/log.js";
import { IAnyWorkspaceIdentifier, isSingleFolderWorkspaceIdentifier, isWorkspaceIdentifier } from "../../workspace/common/workspace.js";
import { IStringDictionary } from "../../../base/common/collections.js";
import { IUriIdentityService } from "../../uriIdentity/common/uriIdentity.js";
import { Promises } from "../../../base/common/async.js";
import { generateUuid } from "../../../base/common/uuid.js";
import { escapeRegExpCharacters } from "../../../base/common/strings.js";
import { isString, Mutable } from "../../../base/common/types.js";
var ProfileResourceType = /* @__PURE__ */ ((ProfileResourceType2) => {
  ProfileResourceType2["Settings"] = "settings";
  ProfileResourceType2["Keybindings"] = "keybindings";
  ProfileResourceType2["Snippets"] = "snippets";
  ProfileResourceType2["Prompts"] = "prompts";
  ProfileResourceType2["Tasks"] = "tasks";
  ProfileResourceType2["Extensions"] = "extensions";
  ProfileResourceType2["GlobalState"] = "globalState";
  return ProfileResourceType2;
})(ProfileResourceType || {});
function isUserDataProfile(thing) {
  const candidate = thing;
  return !!(candidate && typeof candidate === "object" && typeof candidate.id === "string" && typeof candidate.isDefault === "boolean" && typeof candidate.name === "string" && URI.isUri(candidate.location) && URI.isUri(candidate.globalStorageHome) && URI.isUri(candidate.settingsResource) && URI.isUri(candidate.keybindingsResource) && URI.isUri(candidate.tasksResource) && URI.isUri(candidate.snippetsHome) && URI.isUri(candidate.promptsHome) && URI.isUri(candidate.extensionsResource));
}
__name(isUserDataProfile, "isUserDataProfile");
const IUserDataProfilesService = createDecorator("IUserDataProfilesService");
function reviveProfile(profile, scheme) {
  return {
    id: profile.id,
    isDefault: profile.isDefault,
    name: profile.name,
    icon: profile.icon,
    location: URI.revive(profile.location).with({ scheme }),
    globalStorageHome: URI.revive(profile.globalStorageHome).with({ scheme }),
    settingsResource: URI.revive(profile.settingsResource).with({ scheme }),
    keybindingsResource: URI.revive(profile.keybindingsResource).with({ scheme }),
    tasksResource: URI.revive(profile.tasksResource).with({ scheme }),
    snippetsHome: URI.revive(profile.snippetsHome).with({ scheme }),
    promptsHome: URI.revive(profile.promptsHome).with({ scheme }),
    extensionsResource: URI.revive(profile.extensionsResource).with({ scheme }),
    cacheHome: URI.revive(profile.cacheHome).with({ scheme }),
    useDefaultFlags: profile.useDefaultFlags,
    isTransient: profile.isTransient,
    workspaces: profile.workspaces?.map((w) => URI.revive(w))
  };
}
__name(reviveProfile, "reviveProfile");
function toUserDataProfile(id, name, location, profilesCacheHome, options, defaultProfile) {
  return {
    id,
    name,
    location,
    isDefault: false,
    icon: options?.icon,
    globalStorageHome: defaultProfile && options?.useDefaultFlags?.globalState ? defaultProfile.globalStorageHome : joinPath(location, "globalStorage"),
    settingsResource: defaultProfile && options?.useDefaultFlags?.settings ? defaultProfile.settingsResource : joinPath(location, "settings.json"),
    keybindingsResource: defaultProfile && options?.useDefaultFlags?.keybindings ? defaultProfile.keybindingsResource : joinPath(location, "keybindings.json"),
    tasksResource: defaultProfile && options?.useDefaultFlags?.tasks ? defaultProfile.tasksResource : joinPath(location, "tasks.json"),
    snippetsHome: defaultProfile && options?.useDefaultFlags?.snippets ? defaultProfile.snippetsHome : joinPath(location, "snippets"),
    promptsHome: defaultProfile && options?.useDefaultFlags?.prompts ? defaultProfile.promptsHome : joinPath(location, "prompts"),
    extensionsResource: defaultProfile && options?.useDefaultFlags?.extensions ? defaultProfile.extensionsResource : joinPath(location, "extensions.json"),
    cacheHome: joinPath(profilesCacheHome, id),
    useDefaultFlags: options?.useDefaultFlags,
    isTransient: options?.transient,
    workspaces: options?.workspaces
  };
}
__name(toUserDataProfile, "toUserDataProfile");
let UserDataProfilesService = class extends Disposable {
  constructor(environmentService, fileService, uriIdentityService, logService) {
    super();
    this.environmentService = environmentService;
    this.fileService = fileService;
    this.uriIdentityService = uriIdentityService;
    this.logService = logService;
    this.profilesHome = joinPath(this.environmentService.userRoamingDataHome, "profiles");
    this.profilesCacheHome = joinPath(this.environmentService.cacheHome, "CachedProfilesData");
  }
  static {
    __name(this, "UserDataProfilesService");
  }
  static PROFILES_KEY = "userDataProfiles";
  static PROFILE_ASSOCIATIONS_KEY = "profileAssociations";
  _serviceBrand;
  profilesHome;
  profilesCacheHome;
  get defaultProfile() {
    return this.profiles[0];
  }
  get profiles() {
    return [...this.profilesObject.profiles, ...this.transientProfilesObject.profiles];
  }
  _onDidChangeProfiles = this._register(new Emitter());
  onDidChangeProfiles = this._onDidChangeProfiles.event;
  _onWillCreateProfile = this._register(new Emitter());
  onWillCreateProfile = this._onWillCreateProfile.event;
  _onWillRemoveProfile = this._register(new Emitter());
  onWillRemoveProfile = this._onWillRemoveProfile.event;
  _onDidResetWorkspaces = this._register(new Emitter());
  onDidResetWorkspaces = this._onDidResetWorkspaces.event;
  profileCreationPromises = /* @__PURE__ */ new Map();
  transientProfilesObject = {
    profiles: [],
    emptyWindows: /* @__PURE__ */ new Map()
  };
  init() {
    this._profilesObject = void 0;
  }
  _profilesObject;
  get profilesObject() {
    if (!this._profilesObject) {
      const defaultProfile = this.createDefaultProfile();
      const profiles = [defaultProfile];
      try {
        for (const storedProfile of this.getStoredProfiles()) {
          if (!storedProfile.name || !isString(storedProfile.name) || !storedProfile.location) {
            this.logService.warn("Skipping the invalid stored profile", storedProfile.location || storedProfile.name);
            continue;
          }
          profiles.push(toUserDataProfile(basename(storedProfile.location), storedProfile.name, storedProfile.location, this.profilesCacheHome, { icon: storedProfile.icon, useDefaultFlags: storedProfile.useDefaultFlags }, defaultProfile));
        }
      } catch (error) {
        this.logService.error(error);
      }
      const emptyWindows = /* @__PURE__ */ new Map();
      if (profiles.length) {
        try {
          const profileAssociaitions = this.getStoredProfileAssociations();
          if (profileAssociaitions.workspaces) {
            for (const [workspacePath, profileId] of Object.entries(profileAssociaitions.workspaces)) {
              const workspace = URI.parse(workspacePath);
              const profile = profiles.find((p) => p.id === profileId);
              if (profile) {
                const workspaces = profile.workspaces ? profile.workspaces.slice(0) : [];
                workspaces.push(workspace);
                profile.workspaces = workspaces;
              }
            }
          }
          if (profileAssociaitions.emptyWindows) {
            for (const [windowId, profileId] of Object.entries(profileAssociaitions.emptyWindows)) {
              const profile = profiles.find((p) => p.id === profileId);
              if (profile) {
                emptyWindows.set(windowId, profile);
              }
            }
          }
        } catch (error) {
          this.logService.error(error);
        }
      }
      this._profilesObject = { profiles, emptyWindows };
    }
    return this._profilesObject;
  }
  createDefaultProfile() {
    const defaultProfile = toUserDataProfile("__default__profile__", localize("defaultProfile", "Default"), this.environmentService.userRoamingDataHome, this.profilesCacheHome);
    return { ...defaultProfile, extensionsResource: this.getDefaultProfileExtensionsLocation() ?? defaultProfile.extensionsResource, isDefault: true };
  }
  async createTransientProfile(workspaceIdentifier) {
    const namePrefix = `Temp`;
    const nameRegEx = new RegExp(`${escapeRegExpCharacters(namePrefix)}\\s(\\d+)`);
    let nameIndex = 0;
    for (const profile of this.profiles) {
      const matches = nameRegEx.exec(profile.name);
      const index = matches ? parseInt(matches[1]) : 0;
      nameIndex = index > nameIndex ? index : nameIndex;
    }
    const name = `${namePrefix} ${nameIndex + 1}`;
    return this.createProfile(hash(generateUuid()).toString(16), name, { transient: true }, workspaceIdentifier);
  }
  async createNamedProfile(name, options, workspaceIdentifier) {
    return this.createProfile(hash(generateUuid()).toString(16), name, options, workspaceIdentifier);
  }
  async createProfile(id, name, options, workspaceIdentifier) {
    const profile = await this.doCreateProfile(id, name, options, workspaceIdentifier);
    return profile;
  }
  async doCreateProfile(id, name, options, workspaceIdentifier) {
    if (!isString(name) || !name) {
      throw new Error("Name of the profile is mandatory and must be of type `string`");
    }
    let profileCreationPromise = this.profileCreationPromises.get(name);
    if (!profileCreationPromise) {
      profileCreationPromise = (async () => {
        try {
          const existing = this.profiles.find((p) => p.id === id || !p.isTransient && !options?.transient && p.name === name);
          if (existing) {
            throw new Error(`Profile with ${name} name already exists`);
          }
          const workspace = workspaceIdentifier ? this.getWorkspace(workspaceIdentifier) : void 0;
          if (URI.isUri(workspace)) {
            options = { ...options, workspaces: [workspace] };
          }
          const profile = toUserDataProfile(id, name, joinPath(this.profilesHome, id), this.profilesCacheHome, options, this.defaultProfile);
          await this.fileService.createFolder(profile.location);
          const joiners = [];
          this._onWillCreateProfile.fire({
            profile,
            join(promise) {
              joiners.push(promise);
            }
          });
          await Promises.settled(joiners);
          if (workspace && !URI.isUri(workspace)) {
            this.updateEmptyWindowAssociation(workspace, profile, !!profile.isTransient);
          }
          this.updateProfiles([profile], [], []);
          return profile;
        } finally {
          this.profileCreationPromises.delete(name);
        }
      })();
      this.profileCreationPromises.set(name, profileCreationPromise);
    }
    return profileCreationPromise;
  }
  async updateProfile(profile, options) {
    const profilesToUpdate = [];
    for (const existing of this.profiles) {
      let profileToUpdate;
      if (profile.id === existing.id) {
        if (!existing.isDefault) {
          profileToUpdate = toUserDataProfile(existing.id, options.name ?? existing.name, existing.location, this.profilesCacheHome, {
            icon: options.icon === null ? void 0 : options.icon ?? existing.icon,
            transient: options.transient ?? existing.isTransient,
            useDefaultFlags: options.useDefaultFlags ?? existing.useDefaultFlags,
            workspaces: options.workspaces ?? existing.workspaces
          }, this.defaultProfile);
        } else if (options.workspaces) {
          profileToUpdate = existing;
          profileToUpdate.workspaces = options.workspaces;
        }
      } else if (options.workspaces) {
        const workspaces = existing.workspaces?.filter((w1) => !options.workspaces?.some((w2) => this.uriIdentityService.extUri.isEqual(w1, w2)));
        if (existing.workspaces?.length !== workspaces?.length) {
          profileToUpdate = existing;
          profileToUpdate.workspaces = workspaces;
        }
      }
      if (profileToUpdate) {
        profilesToUpdate.push(profileToUpdate);
      }
    }
    if (!profilesToUpdate.length) {
      if (profile.isDefault) {
        throw new Error("Cannot update default profile");
      }
      throw new Error(`Profile '${profile.name}' does not exist`);
    }
    this.updateProfiles([], [], profilesToUpdate);
    const updatedProfile = this.profiles.find((p) => p.id === profile.id);
    if (!updatedProfile) {
      throw new Error(`Profile '${profile.name}' was not updated`);
    }
    return updatedProfile;
  }
  async removeProfile(profileToRemove) {
    if (profileToRemove.isDefault) {
      throw new Error("Cannot remove default profile");
    }
    const profile = this.profiles.find((p) => p.id === profileToRemove.id);
    if (!profile) {
      throw new Error(`Profile '${profileToRemove.name}' does not exist`);
    }
    const joiners = [];
    this._onWillRemoveProfile.fire({
      profile,
      join(promise) {
        joiners.push(promise);
      }
    });
    try {
      await Promise.allSettled(joiners);
    } catch (error) {
      this.logService.error(error);
    }
    this.updateProfiles([], [profile], []);
    try {
      await this.fileService.del(profile.cacheHome, { recursive: true });
    } catch (error) {
      if (toFileOperationResult(error) !== FileOperationResult.FILE_NOT_FOUND) {
        this.logService.error(error);
      }
    }
  }
  async setProfileForWorkspace(workspaceIdentifier, profileToSet) {
    const profile = this.profiles.find((p) => p.id === profileToSet.id);
    if (!profile) {
      throw new Error(`Profile '${profileToSet.name}' does not exist`);
    }
    const workspace = this.getWorkspace(workspaceIdentifier);
    if (URI.isUri(workspace)) {
      const workspaces = profile.workspaces ? [...profile.workspaces] : [];
      if (!workspaces.some((w) => this.uriIdentityService.extUri.isEqual(w, workspace))) {
        workspaces.push(workspace);
        await this.updateProfile(profile, { workspaces });
      }
    } else {
      this.updateEmptyWindowAssociation(workspace, profile, false);
      this.updateStoredProfiles(this.profiles);
    }
  }
  unsetWorkspace(workspaceIdentifier, transient = false) {
    const workspace = this.getWorkspace(workspaceIdentifier);
    if (URI.isUri(workspace)) {
      const currentlyAssociatedProfile = this.getProfileForWorkspace(workspaceIdentifier);
      if (currentlyAssociatedProfile) {
        this.updateProfile(currentlyAssociatedProfile, { workspaces: currentlyAssociatedProfile.workspaces?.filter((w) => !this.uriIdentityService.extUri.isEqual(w, workspace)) });
      }
    } else {
      this.updateEmptyWindowAssociation(workspace, void 0, transient);
      this.updateStoredProfiles(this.profiles);
    }
  }
  async resetWorkspaces() {
    this.transientProfilesObject.emptyWindows.clear();
    this.profilesObject.emptyWindows.clear();
    for (const profile of this.profiles) {
      profile.workspaces = void 0;
    }
    this.updateProfiles([], [], this.profiles);
    this._onDidResetWorkspaces.fire();
  }
  async cleanUp() {
    if (await this.fileService.exists(this.profilesHome)) {
      const stat = await this.fileService.resolve(this.profilesHome);
      await Promise.all((stat.children || []).filter((child) => child.isDirectory && this.profiles.every((p) => !this.uriIdentityService.extUri.isEqual(p.location, child.resource))).map((child) => this.fileService.del(child.resource, { recursive: true })));
    }
  }
  async cleanUpTransientProfiles() {
    const unAssociatedTransientProfiles = this.transientProfilesObject.profiles.filter((p) => !this.isProfileAssociatedToWorkspace(p));
    await Promise.allSettled(unAssociatedTransientProfiles.map((p) => this.removeProfile(p)));
  }
  getProfileForWorkspace(workspaceIdentifier) {
    const workspace = this.getWorkspace(workspaceIdentifier);
    return URI.isUri(workspace) ? this.profiles.find((p) => p.workspaces?.some((w) => this.uriIdentityService.extUri.isEqual(w, workspace))) : this.profilesObject.emptyWindows.get(workspace) ?? this.transientProfilesObject.emptyWindows.get(workspace);
  }
  getWorkspace(workspaceIdentifier) {
    if (isSingleFolderWorkspaceIdentifier(workspaceIdentifier)) {
      return workspaceIdentifier.uri;
    }
    if (isWorkspaceIdentifier(workspaceIdentifier)) {
      return workspaceIdentifier.configPath;
    }
    return workspaceIdentifier.id;
  }
  isProfileAssociatedToWorkspace(profile) {
    if (profile.workspaces?.length) {
      return true;
    }
    if ([...this.profilesObject.emptyWindows.values()].some((windowProfile) => this.uriIdentityService.extUri.isEqual(windowProfile.location, profile.location))) {
      return true;
    }
    if ([...this.transientProfilesObject.emptyWindows.values()].some((windowProfile) => this.uriIdentityService.extUri.isEqual(windowProfile.location, profile.location))) {
      return true;
    }
    return false;
  }
  updateProfiles(added, removed, updated) {
    const allProfiles = [...this.profiles, ...added];
    const transientProfiles = this.transientProfilesObject.profiles;
    this.transientProfilesObject.profiles = [];
    const profiles = [];
    for (let profile of allProfiles) {
      if (removed.some((p) => profile.id === p.id)) {
        for (const windowId of [...this.profilesObject.emptyWindows.keys()]) {
          if (profile.id === this.profilesObject.emptyWindows.get(windowId)?.id) {
            this.profilesObject.emptyWindows.delete(windowId);
          }
        }
        continue;
      }
      if (!profile.isDefault) {
        profile = updated.find((p) => profile.id === p.id) ?? profile;
        const transientProfile = transientProfiles.find((p) => profile.id === p.id);
        if (profile.isTransient) {
          this.transientProfilesObject.profiles.push(profile);
        } else {
          if (transientProfile) {
            for (const [windowId, p] of this.transientProfilesObject.emptyWindows.entries()) {
              if (profile.id === p.id) {
                this.transientProfilesObject.emptyWindows.delete(windowId);
                this.profilesObject.emptyWindows.set(windowId, profile);
                break;
              }
            }
          }
        }
      }
      if (profile.workspaces?.length === 0) {
        profile.workspaces = void 0;
      }
      profiles.push(profile);
    }
    this.updateStoredProfiles(profiles);
    this.triggerProfilesChanges(added, removed, updated);
  }
  triggerProfilesChanges(added, removed, updated) {
    this._onDidChangeProfiles.fire({ added, removed, updated, all: this.profiles });
  }
  updateEmptyWindowAssociation(windowId, newProfile, transient) {
    transient = newProfile?.isTransient ? true : transient;
    if (transient) {
      if (newProfile) {
        this.transientProfilesObject.emptyWindows.set(windowId, newProfile);
      } else {
        this.transientProfilesObject.emptyWindows.delete(windowId);
      }
    } else {
      this.transientProfilesObject.emptyWindows.delete(windowId);
      if (newProfile) {
        this.profilesObject.emptyWindows.set(windowId, newProfile);
      } else {
        this.profilesObject.emptyWindows.delete(windowId);
      }
    }
  }
  updateStoredProfiles(profiles) {
    const storedProfiles = [];
    const workspaces = {};
    const emptyWindows = {};
    for (const profile of profiles) {
      if (profile.isTransient) {
        continue;
      }
      if (!profile.isDefault) {
        storedProfiles.push({ location: profile.location, name: profile.name, icon: profile.icon, useDefaultFlags: profile.useDefaultFlags });
      }
      if (profile.workspaces) {
        for (const workspace of profile.workspaces) {
          workspaces[workspace.toString()] = profile.id;
        }
      }
    }
    for (const [windowId, profile] of this.profilesObject.emptyWindows.entries()) {
      emptyWindows[windowId.toString()] = profile.id;
    }
    this.saveStoredProfileAssociations({ workspaces, emptyWindows });
    this.saveStoredProfiles(storedProfiles);
    this._profilesObject = void 0;
  }
  getStoredProfiles() {
    return [];
  }
  saveStoredProfiles(storedProfiles) {
    throw new Error("not implemented");
  }
  getStoredProfileAssociations() {
    return {};
  }
  saveStoredProfileAssociations(storedProfileAssociations) {
    throw new Error("not implemented");
  }
  getDefaultProfileExtensionsLocation() {
    return void 0;
  }
};
UserDataProfilesService = __decorateClass([
  __decorateParam(0, IEnvironmentService),
  __decorateParam(1, IFileService),
  __decorateParam(2, IUriIdentityService),
  __decorateParam(3, ILogService)
], UserDataProfilesService);
class InMemoryUserDataProfilesService extends UserDataProfilesService {
  static {
    __name(this, "InMemoryUserDataProfilesService");
  }
  storedProfiles = [];
  getStoredProfiles() {
    return this.storedProfiles;
  }
  saveStoredProfiles(storedProfiles) {
    this.storedProfiles = storedProfiles;
  }
  storedProfileAssociations = {};
  getStoredProfileAssociations() {
    return this.storedProfileAssociations;
  }
  saveStoredProfileAssociations(storedProfileAssociations) {
    this.storedProfileAssociations = storedProfileAssociations;
  }
}
export {
  IUserDataProfilesService,
  InMemoryUserDataProfilesService,
  ProfileResourceType,
  UserDataProfilesService,
  isUserDataProfile,
  reviveProfile,
  toUserDataProfile
};
//# sourceMappingURL=userDataProfile.js.map
