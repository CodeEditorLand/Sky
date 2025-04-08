var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import * as path from "path";
import * as fs from "fs";
import * as perf from "../common/performance.js";
async function resolveNLSConfiguration({ userLocale, osLocale, userDataPath, commit, nlsMetadataPath }) {
  perf.mark("code/willGenerateNls");
  if (process.env["VSCODE_DEV"] || userLocale === "pseudo" || userLocale.startsWith("en") || !commit || !userDataPath) {
    return defaultNLSConfiguration(userLocale, osLocale, nlsMetadataPath);
  }
  try {
    const languagePacks = await getLanguagePackConfigurations(userDataPath);
    if (!languagePacks) {
      return defaultNLSConfiguration(userLocale, osLocale, nlsMetadataPath);
    }
    const resolvedLanguage = resolveLanguagePackLanguage(languagePacks, userLocale);
    if (!resolvedLanguage) {
      return defaultNLSConfiguration(userLocale, osLocale, nlsMetadataPath);
    }
    const languagePack = languagePacks[resolvedLanguage];
    const mainLanguagePackPath = languagePack?.translations?.["vscode"];
    if (!languagePack || typeof languagePack.hash !== "string" || !languagePack.translations || typeof mainLanguagePackPath !== "string" || !await exists(mainLanguagePackPath)) {
      return defaultNLSConfiguration(userLocale, osLocale, nlsMetadataPath);
    }
    const languagePackId = `${languagePack.hash}.${resolvedLanguage}`;
    const globalLanguagePackCachePath = path.join(userDataPath, "clp", languagePackId);
    const commitLanguagePackCachePath = path.join(globalLanguagePackCachePath, commit);
    const languagePackMessagesFile = path.join(commitLanguagePackCachePath, "nls.messages.json");
    const translationsConfigFile = path.join(globalLanguagePackCachePath, "tcf.json");
    const languagePackCorruptMarkerFile = path.join(globalLanguagePackCachePath, "corrupted.info");
    if (await exists(languagePackCorruptMarkerFile)) {
      await fs.promises.rm(globalLanguagePackCachePath, { recursive: true, force: true, maxRetries: 3 });
    }
    const result = {
      userLocale,
      osLocale,
      resolvedLanguage,
      defaultMessagesFile: path.join(nlsMetadataPath, "nls.messages.json"),
      languagePack: {
        translationsConfigFile,
        messagesFile: languagePackMessagesFile,
        corruptMarkerFile: languagePackCorruptMarkerFile
      },
      // NLS: below properties are a relic from old times only used by vscode-nls and deprecated
      locale: userLocale,
      availableLanguages: { "*": resolvedLanguage },
      _languagePackId: languagePackId,
      _languagePackSupport: true,
      _translationsConfigFile: translationsConfigFile,
      _cacheRoot: globalLanguagePackCachePath,
      _resolvedLanguagePackCoreLocation: commitLanguagePackCachePath,
      _corruptedFile: languagePackCorruptMarkerFile
    };
    if (await exists(commitLanguagePackCachePath)) {
      touch(commitLanguagePackCachePath).catch(() => {
      });
      perf.mark("code/didGenerateNls");
      return result;
    }
    const [
      ,
      nlsDefaultKeys,
      nlsDefaultMessages,
      nlsPackdata
    ] = await Promise.all([
      fs.promises.mkdir(commitLanguagePackCachePath, { recursive: true }),
      JSON.parse(await fs.promises.readFile(path.join(nlsMetadataPath, "nls.keys.json"), "utf-8")),
      JSON.parse(await fs.promises.readFile(path.join(nlsMetadataPath, "nls.messages.json"), "utf-8")),
      JSON.parse(await fs.promises.readFile(mainLanguagePackPath, "utf-8"))
    ]);
    const nlsResult = [];
    let nlsIndex = 0;
    for (const [moduleId, nlsKeys] of nlsDefaultKeys) {
      const moduleTranslations = nlsPackdata.contents[moduleId];
      for (const nlsKey of nlsKeys) {
        nlsResult.push(moduleTranslations?.[nlsKey] || nlsDefaultMessages[nlsIndex]);
        nlsIndex++;
      }
    }
    await Promise.all([
      fs.promises.writeFile(languagePackMessagesFile, JSON.stringify(nlsResult), "utf-8"),
      fs.promises.writeFile(translationsConfigFile, JSON.stringify(languagePack.translations), "utf-8")
    ]);
    perf.mark("code/didGenerateNls");
    return result;
  } catch (error) {
    console.error("Generating translation files failed.", error);
  }
  return defaultNLSConfiguration(userLocale, osLocale, nlsMetadataPath);
}
__name(resolveNLSConfiguration, "resolveNLSConfiguration");
async function getLanguagePackConfigurations(userDataPath) {
  const configFile = path.join(userDataPath, "languagepacks.json");
  try {
    return JSON.parse(await fs.promises.readFile(configFile, "utf-8"));
  } catch (err) {
    return void 0;
  }
}
__name(getLanguagePackConfigurations, "getLanguagePackConfigurations");
function resolveLanguagePackLanguage(languagePacks, locale) {
  try {
    while (locale) {
      if (languagePacks[locale]) {
        return locale;
      }
      const index = locale.lastIndexOf("-");
      if (index > 0) {
        locale = locale.substring(0, index);
      } else {
        return void 0;
      }
    }
  } catch (error) {
    console.error("Resolving language pack configuration failed.", error);
  }
  return void 0;
}
__name(resolveLanguagePackLanguage, "resolveLanguagePackLanguage");
function defaultNLSConfiguration(userLocale, osLocale, nlsMetadataPath) {
  perf.mark("code/didGenerateNls");
  return {
    userLocale,
    osLocale,
    resolvedLanguage: "en",
    defaultMessagesFile: path.join(nlsMetadataPath, "nls.messages.json"),
    // NLS: below 2 are a relic from old times only used by vscode-nls and deprecated
    locale: userLocale,
    availableLanguages: {}
  };
}
__name(defaultNLSConfiguration, "defaultNLSConfiguration");
async function exists(path2) {
  try {
    await fs.promises.access(path2);
    return true;
  } catch {
    return false;
  }
}
__name(exists, "exists");
function touch(path2) {
  const date = /* @__PURE__ */ new Date();
  return fs.promises.utimes(path2, date, date);
}
__name(touch, "touch");
export {
  resolveNLSConfiguration
};
//# sourceMappingURL=nls.js.map
