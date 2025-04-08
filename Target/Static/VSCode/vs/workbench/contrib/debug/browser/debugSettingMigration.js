var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Registry } from "../../../../platform/registry/common/platform.js";
import { Extensions, IConfigurationMigrationRegistry } from "../../../common/configuration.js";
Registry.as(Extensions.ConfigurationMigration).registerConfigurationMigrations([{
  key: "debug.autoExpandLazyVariables",
  migrateFn: /* @__PURE__ */ __name((value) => {
    if (value === true) {
      return { value: "on" };
    } else if (value === false) {
      return { value: "off" };
    }
    return [];
  }, "migrateFn")
}]);
//# sourceMappingURL=debugSettingMigration.js.map
