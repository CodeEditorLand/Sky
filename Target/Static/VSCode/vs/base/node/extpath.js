var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import * as fs from "fs";
import { CancellationToken } from "../common/cancellation.js";
import { basename, dirname, join, normalize, sep } from "../common/path.js";
import { isLinux } from "../common/platform.js";
import { rtrim } from "../common/strings.js";
import { Promises } from "./pfs.js";
async function realcase(path, token) {
  if (isLinux) {
    return path;
  }
  const dir = dirname(path);
  if (path === dir) {
    return path;
  }
  const name = (basename(path) || path).toLowerCase();
  try {
    if (token?.isCancellationRequested) {
      return null;
    }
    const entries = await Promises.readdir(dir);
    const found = entries.filter((e) => e.toLowerCase() === name);
    if (found.length === 1) {
      const prefix = await realcase(dir, token);
      if (prefix) {
        return join(prefix, found[0]);
      }
    } else if (found.length > 1) {
      const ix = found.indexOf(name);
      if (ix >= 0) {
        const prefix = await realcase(dir, token);
        if (prefix) {
          return join(prefix, found[ix]);
        }
      }
    }
  } catch (error) {
  }
  return null;
}
__name(realcase, "realcase");
async function realpath(path) {
  try {
    return await Promises.realpath(path);
  } catch (error) {
    const normalizedPath = normalizePath(path);
    await fs.promises.access(normalizedPath, fs.constants.R_OK);
    return normalizedPath;
  }
}
__name(realpath, "realpath");
function realpathSync(path) {
  try {
    return fs.realpathSync(path);
  } catch (error) {
    const normalizedPath = normalizePath(path);
    fs.accessSync(normalizedPath, fs.constants.R_OK);
    return normalizedPath;
  }
}
__name(realpathSync, "realpathSync");
function normalizePath(path) {
  return rtrim(normalize(path), sep);
}
__name(normalizePath, "normalizePath");
export {
  realcase,
  realpath,
  realpathSync
};
//# sourceMappingURL=extpath.js.map
