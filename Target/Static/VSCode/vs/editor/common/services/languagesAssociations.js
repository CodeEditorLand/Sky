var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { ParsedPattern, parse } from "../../../base/common/glob.js";
import { Mimes } from "../../../base/common/mime.js";
import { Schemas } from "../../../base/common/network.js";
import { basename, posix } from "../../../base/common/path.js";
import { DataUri } from "../../../base/common/resources.js";
import { startsWithUTF8BOM } from "../../../base/common/strings.js";
import { URI } from "../../../base/common/uri.js";
import { PLAINTEXT_LANGUAGE_ID } from "../languages/modesRegistry.js";
let registeredAssociations = [];
let nonUserRegisteredAssociations = [];
let userRegisteredAssociations = [];
function registerPlatformLanguageAssociation(association, warnOnOverwrite = false) {
  _registerLanguageAssociation(association, false, warnOnOverwrite);
}
__name(registerPlatformLanguageAssociation, "registerPlatformLanguageAssociation");
function registerConfiguredLanguageAssociation(association) {
  _registerLanguageAssociation(association, true, false);
}
__name(registerConfiguredLanguageAssociation, "registerConfiguredLanguageAssociation");
function _registerLanguageAssociation(association, userConfigured, warnOnOverwrite) {
  const associationItem = toLanguageAssociationItem(association, userConfigured);
  registeredAssociations.push(associationItem);
  if (!associationItem.userConfigured) {
    nonUserRegisteredAssociations.push(associationItem);
  } else {
    userRegisteredAssociations.push(associationItem);
  }
  if (warnOnOverwrite && !associationItem.userConfigured) {
    registeredAssociations.forEach((a) => {
      if (a.mime === associationItem.mime || a.userConfigured) {
        return;
      }
      if (associationItem.extension && a.extension === associationItem.extension) {
        console.warn(`Overwriting extension <<${associationItem.extension}>> to now point to mime <<${associationItem.mime}>>`);
      }
      if (associationItem.filename && a.filename === associationItem.filename) {
        console.warn(`Overwriting filename <<${associationItem.filename}>> to now point to mime <<${associationItem.mime}>>`);
      }
      if (associationItem.filepattern && a.filepattern === associationItem.filepattern) {
        console.warn(`Overwriting filepattern <<${associationItem.filepattern}>> to now point to mime <<${associationItem.mime}>>`);
      }
      if (associationItem.firstline && a.firstline === associationItem.firstline) {
        console.warn(`Overwriting firstline <<${associationItem.firstline}>> to now point to mime <<${associationItem.mime}>>`);
      }
    });
  }
}
__name(_registerLanguageAssociation, "_registerLanguageAssociation");
function toLanguageAssociationItem(association, userConfigured) {
  return {
    id: association.id,
    mime: association.mime,
    filename: association.filename,
    extension: association.extension,
    filepattern: association.filepattern,
    firstline: association.firstline,
    userConfigured,
    filenameLowercase: association.filename ? association.filename.toLowerCase() : void 0,
    extensionLowercase: association.extension ? association.extension.toLowerCase() : void 0,
    filepatternLowercase: association.filepattern ? parse(association.filepattern.toLowerCase()) : void 0,
    filepatternOnPath: association.filepattern ? association.filepattern.indexOf(posix.sep) >= 0 : false
  };
}
__name(toLanguageAssociationItem, "toLanguageAssociationItem");
function clearPlatformLanguageAssociations() {
  registeredAssociations = registeredAssociations.filter((a) => a.userConfigured);
  nonUserRegisteredAssociations = [];
}
__name(clearPlatformLanguageAssociations, "clearPlatformLanguageAssociations");
function clearConfiguredLanguageAssociations() {
  registeredAssociations = registeredAssociations.filter((a) => !a.userConfigured);
  userRegisteredAssociations = [];
}
__name(clearConfiguredLanguageAssociations, "clearConfiguredLanguageAssociations");
function getMimeTypes(resource, firstLine) {
  return getAssociations(resource, firstLine).map((item) => item.mime);
}
__name(getMimeTypes, "getMimeTypes");
function getLanguageIds(resource, firstLine) {
  return getAssociations(resource, firstLine).map((item) => item.id);
}
__name(getLanguageIds, "getLanguageIds");
function getAssociations(resource, firstLine) {
  let path;
  if (resource) {
    switch (resource.scheme) {
      case Schemas.file:
        path = resource.fsPath;
        break;
      case Schemas.data: {
        const metadata = DataUri.parseMetaData(resource);
        path = metadata.get(DataUri.META_DATA_LABEL);
        break;
      }
      case Schemas.vscodeNotebookCell:
        path = void 0;
        break;
      default:
        path = resource.path;
    }
  }
  if (!path) {
    return [{ id: "unknown", mime: Mimes.unknown }];
  }
  path = path.toLowerCase();
  const filename = basename(path);
  const configuredLanguage = getAssociationByPath(path, filename, userRegisteredAssociations);
  if (configuredLanguage) {
    return [configuredLanguage, { id: PLAINTEXT_LANGUAGE_ID, mime: Mimes.text }];
  }
  const registeredLanguage = getAssociationByPath(path, filename, nonUserRegisteredAssociations);
  if (registeredLanguage) {
    return [registeredLanguage, { id: PLAINTEXT_LANGUAGE_ID, mime: Mimes.text }];
  }
  if (firstLine) {
    const firstlineLanguage = getAssociationByFirstline(firstLine);
    if (firstlineLanguage) {
      return [firstlineLanguage, { id: PLAINTEXT_LANGUAGE_ID, mime: Mimes.text }];
    }
  }
  return [{ id: "unknown", mime: Mimes.unknown }];
}
__name(getAssociations, "getAssociations");
function getAssociationByPath(path, filename, associations) {
  let filenameMatch = void 0;
  let patternMatch = void 0;
  let extensionMatch = void 0;
  for (let i = associations.length - 1; i >= 0; i--) {
    const association = associations[i];
    if (filename === association.filenameLowercase) {
      filenameMatch = association;
      break;
    }
    if (association.filepattern) {
      if (!patternMatch || association.filepattern.length > patternMatch.filepattern.length) {
        const target = association.filepatternOnPath ? path : filename;
        if (association.filepatternLowercase?.(target)) {
          patternMatch = association;
        }
      }
    }
    if (association.extension) {
      if (!extensionMatch || association.extension.length > extensionMatch.extension.length) {
        if (filename.endsWith(association.extensionLowercase)) {
          extensionMatch = association;
        }
      }
    }
  }
  if (filenameMatch) {
    return filenameMatch;
  }
  if (patternMatch) {
    return patternMatch;
  }
  if (extensionMatch) {
    return extensionMatch;
  }
  return void 0;
}
__name(getAssociationByPath, "getAssociationByPath");
function getAssociationByFirstline(firstLine) {
  if (startsWithUTF8BOM(firstLine)) {
    firstLine = firstLine.substr(1);
  }
  if (firstLine.length > 0) {
    for (let i = registeredAssociations.length - 1; i >= 0; i--) {
      const association = registeredAssociations[i];
      if (!association.firstline) {
        continue;
      }
      const matches = firstLine.match(association.firstline);
      if (matches && matches.length > 0) {
        return association;
      }
    }
  }
  return void 0;
}
__name(getAssociationByFirstline, "getAssociationByFirstline");
export {
  clearConfiguredLanguageAssociations,
  clearPlatformLanguageAssociations,
  getLanguageIds,
  getMimeTypes,
  registerConfiguredLanguageAssociation,
  registerPlatformLanguageAssociation
};
//# sourceMappingURL=languagesAssociations.js.map
