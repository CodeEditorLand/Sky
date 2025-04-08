var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Registry } from "../../../../platform/registry/common/platform.js";
import { EditorSettingMigration, ISettingsWriter } from "../../../../editor/browser/config/migrateOptions.js";
import { ConfigurationKeyValuePairs, Extensions, IConfigurationMigrationRegistry } from "../../../common/configuration.js";
Registry.as(Extensions.ConfigurationMigration).registerConfigurationMigrations(EditorSettingMigration.items.map((item) => ({
  key: `editor.${item.key}`,
  migrateFn: /* @__PURE__ */ __name((value, accessor) => {
    const configurationKeyValuePairs = [];
    const writer = /* @__PURE__ */ __name((key, value2) => configurationKeyValuePairs.push([`editor.${key}`, { value: value2 }]), "writer");
    item.migrate(value, (key) => accessor(`editor.${key}`), writer);
    return configurationKeyValuePairs;
  }, "migrateFn")
})));
//# sourceMappingURL=editorSettingsMigration.js.map
