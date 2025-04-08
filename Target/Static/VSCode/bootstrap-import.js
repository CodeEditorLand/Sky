var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { fileURLToPath, pathToFileURL } from "node:url";
import { promises } from "node:fs";
import { join } from "node:path";
const _specifierToUrl = {};
async function initialize(injectPath) {
  const injectPackageJSONPath = fileURLToPath(new URL("../package.json", pathToFileURL(injectPath)));
  const packageJSON = JSON.parse(String(await promises.readFile(injectPackageJSONPath)));
  for (const [name] of Object.entries(packageJSON.dependencies)) {
    try {
      const path = join(injectPackageJSONPath, `../node_modules/${name}/package.json`);
      let { main } = JSON.parse(String(await promises.readFile(path)));
      if (!main) {
        main = "index.js";
      }
      if (!main.endsWith(".js")) {
        main += ".js";
      }
      const mainPath = join(injectPackageJSONPath, `../node_modules/${name}/${main}`);
      _specifierToUrl[name] = pathToFileURL(mainPath).href;
    } catch (err) {
      console.error(name);
      console.error(err);
    }
  }
  console.log(`[bootstrap-import] Initialized node_modules redirector for: ${injectPath}`);
}
__name(initialize, "initialize");
async function resolve(specifier, context, nextResolve) {
  const newSpecifier = _specifierToUrl[specifier];
  if (newSpecifier !== void 0) {
    return {
      format: "commonjs",
      shortCircuit: true,
      url: newSpecifier
    };
  }
  return nextResolve(specifier, context);
}
__name(resolve, "resolve");
export {
  initialize,
  resolve
};
//# sourceMappingURL=bootstrap-import.js.map
