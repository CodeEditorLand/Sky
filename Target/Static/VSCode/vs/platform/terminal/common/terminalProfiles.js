var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Codicon } from "../../../base/common/codicons.js";
import { URI, UriComponents } from "../../../base/common/uri.js";
import { localize } from "../../../nls.js";
import { IExtensionTerminalProfile, ITerminalProfile, TerminalIcon } from "./terminal.js";
import { ThemeIcon } from "../../../base/common/themables.js";
function createProfileSchemaEnums(detectedProfiles, extensionProfiles) {
  const result = [{
    name: null,
    description: localize("terminalAutomaticProfile", "Automatically detect the default")
  }];
  result.push(...detectedProfiles.map((e) => {
    return {
      name: e.profileName,
      description: createProfileDescription(e)
    };
  }));
  if (extensionProfiles) {
    result.push(...extensionProfiles.map((extensionProfile) => {
      return {
        name: extensionProfile.title,
        description: createExtensionProfileDescription(extensionProfile)
      };
    }));
  }
  return {
    values: result.map((e) => e.name),
    markdownDescriptions: result.map((e) => e.description)
  };
}
__name(createProfileSchemaEnums, "createProfileSchemaEnums");
function createProfileDescription(profile) {
  let description = `$(${ThemeIcon.isThemeIcon(profile.icon) ? profile.icon.id : profile.icon ? profile.icon : Codicon.terminal.id}) ${profile.profileName}
- path: ${profile.path}`;
  if (profile.args) {
    if (typeof profile.args === "string") {
      description += `
- args: "${profile.args}"`;
    } else {
      description += `
- args: [${profile.args.length === 0 ? "" : `'${profile.args.join(`','`)}'`}]`;
    }
  }
  if (profile.overrideName !== void 0) {
    description += `
- overrideName: ${profile.overrideName}`;
  }
  if (profile.color) {
    description += `
- color: ${profile.color}`;
  }
  if (profile.env) {
    description += `
- env: ${JSON.stringify(profile.env)}`;
  }
  return description;
}
__name(createProfileDescription, "createProfileDescription");
function createExtensionProfileDescription(profile) {
  const description = `$(${ThemeIcon.isThemeIcon(profile.icon) ? profile.icon.id : profile.icon ? profile.icon : Codicon.terminal.id}) ${profile.title}
- extensionIdentifier: ${profile.extensionIdentifier}`;
  return description;
}
__name(createExtensionProfileDescription, "createExtensionProfileDescription");
function terminalProfileArgsMatch(args1, args2) {
  if (!args1 && !args2) {
    return true;
  } else if (typeof args1 === "string" && typeof args2 === "string") {
    return args1 === args2;
  } else if (Array.isArray(args1) && Array.isArray(args2)) {
    if (args1.length !== args2.length) {
      return false;
    }
    for (let i = 0; i < args1.length; i++) {
      if (args1[i] !== args2[i]) {
        return false;
      }
    }
    return true;
  }
  return false;
}
__name(terminalProfileArgsMatch, "terminalProfileArgsMatch");
function terminalIconsEqual(a, b) {
  if (!a && !b) {
    return true;
  } else if (!a || !b) {
    return false;
  }
  if (ThemeIcon.isThemeIcon(a) && ThemeIcon.isThemeIcon(b)) {
    return a.id === b.id && a.color === b.color;
  }
  if (typeof a === "object" && "light" in a && "dark" in a && typeof b === "object" && "light" in b && "dark" in b) {
    const castedA = a;
    const castedB = b;
    if ((URI.isUri(castedA.light) || isUriComponents(castedA.light)) && (URI.isUri(castedA.dark) || isUriComponents(castedA.dark)) && (URI.isUri(castedB.light) || isUriComponents(castedB.light)) && (URI.isUri(castedB.dark) || isUriComponents(castedB.dark))) {
      return castedA.light.path === castedB.light.path && castedA.dark.path === castedB.dark.path;
    }
  }
  if (URI.isUri(a) && URI.isUri(b) || (isUriComponents(a) || isUriComponents(b))) {
    const castedA = a;
    const castedB = b;
    return castedA.path === castedB.path && castedA.scheme === castedB.scheme;
  }
  return false;
}
__name(terminalIconsEqual, "terminalIconsEqual");
function isUriComponents(thing) {
  if (!thing) {
    return false;
  }
  return typeof thing.path === "string" && typeof thing.scheme === "string";
}
__name(isUriComponents, "isUriComponents");
export {
  createProfileSchemaEnums,
  isUriComponents,
  terminalIconsEqual,
  terminalProfileArgsMatch
};
//# sourceMappingURL=terminalProfiles.js.map
