var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import * as cp from "child_process";
import * as path from "../../../../base/common/path.js";
import * as glob from "../../../../base/common/glob.js";
import { normalizeNFD } from "../../../../base/common/normalization.js";
import * as extpath from "../../../../base/common/extpath.js";
import { isMacintosh as isMac } from "../../../../base/common/platform.js";
import * as strings from "../../../../base/common/strings.js";
import { IFileQuery, IFolderQuery } from "../common/search.js";
import { anchorGlob } from "./ripgrepSearchUtils.js";
import { rgPath } from "@vscode/ripgrep";
const rgDiskPath = rgPath.replace(/\bnode_modules\.asar\b/, "node_modules.asar.unpacked");
function spawnRipgrepCmd(config, folderQuery, includePattern, excludePattern, numThreads) {
  const rgArgs = getRgArgs(config, folderQuery, includePattern, excludePattern, numThreads);
  const cwd = folderQuery.folder.fsPath;
  return {
    cmd: cp.spawn(rgDiskPath, rgArgs.args, { cwd }),
    rgDiskPath,
    siblingClauses: rgArgs.siblingClauses,
    rgArgs,
    cwd
  };
}
__name(spawnRipgrepCmd, "spawnRipgrepCmd");
function getRgArgs(config, folderQuery, includePattern, excludePattern, numThreads) {
  const args = ["--files", "--hidden", "--case-sensitive", "--no-require-git"];
  foldersToIncludeGlobs([folderQuery], includePattern, false).forEach((globArg) => {
    const inclusion = anchorGlob(globArg);
    args.push("-g", inclusion);
    if (isMac) {
      const normalized = normalizeNFD(inclusion);
      if (normalized !== inclusion) {
        args.push("-g", normalized);
      }
    }
  });
  const rgGlobs = foldersToRgExcludeGlobs([folderQuery], excludePattern, void 0, false);
  rgGlobs.globArgs.forEach((globArg) => {
    const exclusion = `!${anchorGlob(globArg)}`;
    args.push("-g", exclusion);
    if (isMac) {
      const normalized = normalizeNFD(exclusion);
      if (normalized !== exclusion) {
        args.push("-g", normalized);
      }
    }
  });
  if (folderQuery.disregardIgnoreFiles !== false) {
    args.push("--no-ignore");
  } else if (folderQuery.disregardParentIgnoreFiles !== false) {
    args.push("--no-ignore-parent");
  }
  if (!folderQuery.ignoreSymlinks) {
    args.push("--follow");
  }
  if (config.exists) {
    args.push("--quiet");
  }
  if (numThreads) {
    args.push("--threads", `${numThreads}`);
  }
  args.push("--no-config");
  if (folderQuery.disregardGlobalIgnoreFiles) {
    args.push("--no-ignore-global");
  }
  return {
    args,
    siblingClauses: rgGlobs.siblingClauses
  };
}
__name(getRgArgs, "getRgArgs");
function foldersToRgExcludeGlobs(folderQueries, globalExclude, excludesToSkip, absoluteGlobs = true) {
  const globArgs = [];
  let siblingClauses = {};
  folderQueries.forEach((folderQuery) => {
    const totalExcludePattern = Object.assign({}, folderQuery.excludePattern || {}, globalExclude || {});
    const result = globExprsToRgGlobs(totalExcludePattern, absoluteGlobs ? folderQuery.folder.fsPath : void 0, excludesToSkip);
    globArgs.push(...result.globArgs);
    if (result.siblingClauses) {
      siblingClauses = Object.assign(siblingClauses, result.siblingClauses);
    }
  });
  return { globArgs, siblingClauses };
}
__name(foldersToRgExcludeGlobs, "foldersToRgExcludeGlobs");
function foldersToIncludeGlobs(folderQueries, globalInclude, absoluteGlobs = true) {
  const globArgs = [];
  folderQueries.forEach((folderQuery) => {
    const totalIncludePattern = Object.assign({}, globalInclude || {}, folderQuery.includePattern || {});
    const result = globExprsToRgGlobs(totalIncludePattern, absoluteGlobs ? folderQuery.folder.fsPath : void 0);
    globArgs.push(...result.globArgs);
  });
  return globArgs;
}
__name(foldersToIncludeGlobs, "foldersToIncludeGlobs");
function globExprsToRgGlobs(patterns, folder, excludesToSkip) {
  const globArgs = [];
  const siblingClauses = {};
  Object.keys(patterns).forEach((key) => {
    if (excludesToSkip && excludesToSkip.has(key)) {
      return;
    }
    if (!key) {
      return;
    }
    const value = patterns[key];
    key = trimTrailingSlash(folder ? getAbsoluteGlob(folder, key) : key);
    if (key.startsWith("\\\\")) {
      key = "\\\\" + key.substr(2).replace(/\\/g, "/");
    } else {
      key = key.replace(/\\/g, "/");
    }
    if (typeof value === "boolean" && value) {
      if (key.startsWith("\\\\")) {
        key += "**";
      }
      globArgs.push(fixDriveC(key));
    } else if (value && value.when) {
      siblingClauses[key] = value;
    }
  });
  return { globArgs, siblingClauses };
}
__name(globExprsToRgGlobs, "globExprsToRgGlobs");
function getAbsoluteGlob(folder, key) {
  return path.isAbsolute(key) ? key : path.join(folder, key);
}
__name(getAbsoluteGlob, "getAbsoluteGlob");
function trimTrailingSlash(str) {
  str = strings.rtrim(str, "\\");
  return strings.rtrim(str, "/");
}
__name(trimTrailingSlash, "trimTrailingSlash");
function fixDriveC(path2) {
  const root = extpath.getRoot(path2);
  return root.toLowerCase() === "c:/" ? path2.replace(/^c:[/\\]/i, "/") : path2;
}
__name(fixDriveC, "fixDriveC");
export {
  fixDriveC,
  getAbsoluteGlob,
  spawnRipgrepCmd
};
//# sourceMappingURL=ripgrepFileSearch.js.map
