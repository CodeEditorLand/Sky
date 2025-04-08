var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { BreadcrumbsWidget } from "../../../../base/browser/ui/breadcrumbs/breadcrumbsWidget.js";
import { Emitter, Event } from "../../../../base/common/event.js";
import * as glob from "../../../../base/common/glob.js";
import { IDisposable } from "../../../../base/common/lifecycle.js";
import { localize } from "../../../../nls.js";
import { IConfigurationOverrides, IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { Extensions, IConfigurationRegistry, ConfigurationScope } from "../../../../platform/configuration/common/configurationRegistry.js";
import { InstantiationType, registerSingleton } from "../../../../platform/instantiation/common/extensions.js";
import { createDecorator } from "../../../../platform/instantiation/common/instantiation.js";
import { Registry } from "../../../../platform/registry/common/platform.js";
import { GroupIdentifier, IEditorPartOptions } from "../../../common/editor.js";
const IBreadcrumbsService = createDecorator("IEditorBreadcrumbsService");
class BreadcrumbsService {
  static {
    __name(this, "BreadcrumbsService");
  }
  _map = /* @__PURE__ */ new Map();
  register(group, widget) {
    if (this._map.has(group)) {
      throw new Error(`group (${group}) has already a widget`);
    }
    this._map.set(group, widget);
    return {
      dispose: /* @__PURE__ */ __name(() => this._map.delete(group), "dispose")
    };
  }
  getWidget(group) {
    return this._map.get(group);
  }
}
registerSingleton(IBreadcrumbsService, BreadcrumbsService, InstantiationType.Delayed);
class BreadcrumbsConfig {
  static {
    __name(this, "BreadcrumbsConfig");
  }
  constructor() {
  }
  static IsEnabled = BreadcrumbsConfig._stub("breadcrumbs.enabled");
  static UseQuickPick = BreadcrumbsConfig._stub("breadcrumbs.useQuickPick");
  static FilePath = BreadcrumbsConfig._stub("breadcrumbs.filePath");
  static SymbolPath = BreadcrumbsConfig._stub("breadcrumbs.symbolPath");
  static SymbolSortOrder = BreadcrumbsConfig._stub("breadcrumbs.symbolSortOrder");
  static Icons = BreadcrumbsConfig._stub("breadcrumbs.icons");
  static TitleScrollbarSizing = BreadcrumbsConfig._stub("workbench.editor.titleScrollbarSizing");
  static FileExcludes = BreadcrumbsConfig._stub("files.exclude");
  static _stub(name) {
    return {
      bindTo(service) {
        const onDidChange = new Emitter();
        const listener = service.onDidChangeConfiguration((e) => {
          if (e.affectsConfiguration(name)) {
            onDidChange.fire(void 0);
          }
        });
        return new class {
          name = name;
          onDidChange = onDidChange.event;
          getValue(overrides) {
            if (overrides) {
              return service.getValue(name, overrides);
            } else {
              return service.getValue(name);
            }
          }
          updateValue(newValue, overrides) {
            if (overrides) {
              return service.updateValue(name, newValue, overrides);
            } else {
              return service.updateValue(name, newValue);
            }
          }
          dispose() {
            listener.dispose();
            onDidChange.dispose();
          }
        }();
      }
    };
  }
}
Registry.as(Extensions.Configuration).registerConfiguration({
  id: "breadcrumbs",
  title: localize("title", "Breadcrumb Navigation"),
  order: 101,
  type: "object",
  properties: {
    "breadcrumbs.enabled": {
      description: localize("enabled", "Enable/disable navigation breadcrumbs."),
      type: "boolean",
      default: true
    },
    "breadcrumbs.filePath": {
      description: localize("filepath", "Controls whether and how file paths are shown in the breadcrumbs view."),
      type: "string",
      default: "on",
      enum: ["on", "off", "last"],
      enumDescriptions: [
        localize("filepath.on", "Show the file path in the breadcrumbs view."),
        localize("filepath.off", "Do not show the file path in the breadcrumbs view."),
        localize("filepath.last", "Only show the last element of the file path in the breadcrumbs view.")
      ]
    },
    "breadcrumbs.symbolPath": {
      description: localize("symbolpath", "Controls whether and how symbols are shown in the breadcrumbs view."),
      type: "string",
      default: "on",
      enum: ["on", "off", "last"],
      enumDescriptions: [
        localize("symbolpath.on", "Show all symbols in the breadcrumbs view."),
        localize("symbolpath.off", "Do not show symbols in the breadcrumbs view."),
        localize("symbolpath.last", "Only show the current symbol in the breadcrumbs view.")
      ]
    },
    "breadcrumbs.symbolSortOrder": {
      description: localize("symbolSortOrder", "Controls how symbols are sorted in the breadcrumbs outline view."),
      type: "string",
      default: "position",
      scope: ConfigurationScope.LANGUAGE_OVERRIDABLE,
      enum: ["position", "name", "type"],
      enumDescriptions: [
        localize("symbolSortOrder.position", "Show symbol outline in file position order."),
        localize("symbolSortOrder.name", "Show symbol outline in alphabetical order."),
        localize("symbolSortOrder.type", "Show symbol outline in symbol type order.")
      ]
    },
    "breadcrumbs.icons": {
      description: localize("icons", "Render breadcrumb items with icons."),
      type: "boolean",
      default: true
    },
    "breadcrumbs.showFiles": {
      type: "boolean",
      default: true,
      scope: ConfigurationScope.LANGUAGE_OVERRIDABLE,
      markdownDescription: localize("filteredTypes.file", "When enabled breadcrumbs show `file`-symbols.")
    },
    "breadcrumbs.showModules": {
      type: "boolean",
      default: true,
      scope: ConfigurationScope.LANGUAGE_OVERRIDABLE,
      markdownDescription: localize("filteredTypes.module", "When enabled breadcrumbs show `module`-symbols.")
    },
    "breadcrumbs.showNamespaces": {
      type: "boolean",
      default: true,
      scope: ConfigurationScope.LANGUAGE_OVERRIDABLE,
      markdownDescription: localize("filteredTypes.namespace", "When enabled breadcrumbs show `namespace`-symbols.")
    },
    "breadcrumbs.showPackages": {
      type: "boolean",
      default: true,
      scope: ConfigurationScope.LANGUAGE_OVERRIDABLE,
      markdownDescription: localize("filteredTypes.package", "When enabled breadcrumbs show `package`-symbols.")
    },
    "breadcrumbs.showClasses": {
      type: "boolean",
      default: true,
      scope: ConfigurationScope.LANGUAGE_OVERRIDABLE,
      markdownDescription: localize("filteredTypes.class", "When enabled breadcrumbs show `class`-symbols.")
    },
    "breadcrumbs.showMethods": {
      type: "boolean",
      default: true,
      scope: ConfigurationScope.LANGUAGE_OVERRIDABLE,
      markdownDescription: localize("filteredTypes.method", "When enabled breadcrumbs show `method`-symbols.")
    },
    "breadcrumbs.showProperties": {
      type: "boolean",
      default: true,
      scope: ConfigurationScope.LANGUAGE_OVERRIDABLE,
      markdownDescription: localize("filteredTypes.property", "When enabled breadcrumbs show `property`-symbols.")
    },
    "breadcrumbs.showFields": {
      type: "boolean",
      default: true,
      scope: ConfigurationScope.LANGUAGE_OVERRIDABLE,
      markdownDescription: localize("filteredTypes.field", "When enabled breadcrumbs show `field`-symbols.")
    },
    "breadcrumbs.showConstructors": {
      type: "boolean",
      default: true,
      scope: ConfigurationScope.LANGUAGE_OVERRIDABLE,
      markdownDescription: localize("filteredTypes.constructor", "When enabled breadcrumbs show `constructor`-symbols.")
    },
    "breadcrumbs.showEnums": {
      type: "boolean",
      default: true,
      scope: ConfigurationScope.LANGUAGE_OVERRIDABLE,
      markdownDescription: localize("filteredTypes.enum", "When enabled breadcrumbs show `enum`-symbols.")
    },
    "breadcrumbs.showInterfaces": {
      type: "boolean",
      default: true,
      scope: ConfigurationScope.LANGUAGE_OVERRIDABLE,
      markdownDescription: localize("filteredTypes.interface", "When enabled breadcrumbs show `interface`-symbols.")
    },
    "breadcrumbs.showFunctions": {
      type: "boolean",
      default: true,
      scope: ConfigurationScope.LANGUAGE_OVERRIDABLE,
      markdownDescription: localize("filteredTypes.function", "When enabled breadcrumbs show `function`-symbols.")
    },
    "breadcrumbs.showVariables": {
      type: "boolean",
      default: true,
      scope: ConfigurationScope.LANGUAGE_OVERRIDABLE,
      markdownDescription: localize("filteredTypes.variable", "When enabled breadcrumbs show `variable`-symbols.")
    },
    "breadcrumbs.showConstants": {
      type: "boolean",
      default: true,
      scope: ConfigurationScope.LANGUAGE_OVERRIDABLE,
      markdownDescription: localize("filteredTypes.constant", "When enabled breadcrumbs show `constant`-symbols.")
    },
    "breadcrumbs.showStrings": {
      type: "boolean",
      default: true,
      scope: ConfigurationScope.LANGUAGE_OVERRIDABLE,
      markdownDescription: localize("filteredTypes.string", "When enabled breadcrumbs show `string`-symbols.")
    },
    "breadcrumbs.showNumbers": {
      type: "boolean",
      default: true,
      scope: ConfigurationScope.LANGUAGE_OVERRIDABLE,
      markdownDescription: localize("filteredTypes.number", "When enabled breadcrumbs show `number`-symbols.")
    },
    "breadcrumbs.showBooleans": {
      type: "boolean",
      default: true,
      scope: ConfigurationScope.LANGUAGE_OVERRIDABLE,
      markdownDescription: localize("filteredTypes.boolean", "When enabled breadcrumbs show `boolean`-symbols.")
    },
    "breadcrumbs.showArrays": {
      type: "boolean",
      default: true,
      scope: ConfigurationScope.LANGUAGE_OVERRIDABLE,
      markdownDescription: localize("filteredTypes.array", "When enabled breadcrumbs show `array`-symbols.")
    },
    "breadcrumbs.showObjects": {
      type: "boolean",
      default: true,
      scope: ConfigurationScope.LANGUAGE_OVERRIDABLE,
      markdownDescription: localize("filteredTypes.object", "When enabled breadcrumbs show `object`-symbols.")
    },
    "breadcrumbs.showKeys": {
      type: "boolean",
      default: true,
      scope: ConfigurationScope.LANGUAGE_OVERRIDABLE,
      markdownDescription: localize("filteredTypes.key", "When enabled breadcrumbs show `key`-symbols.")
    },
    "breadcrumbs.showNull": {
      type: "boolean",
      default: true,
      scope: ConfigurationScope.LANGUAGE_OVERRIDABLE,
      markdownDescription: localize("filteredTypes.null", "When enabled breadcrumbs show `null`-symbols.")
    },
    "breadcrumbs.showEnumMembers": {
      type: "boolean",
      default: true,
      scope: ConfigurationScope.LANGUAGE_OVERRIDABLE,
      markdownDescription: localize("filteredTypes.enumMember", "When enabled breadcrumbs show `enumMember`-symbols.")
    },
    "breadcrumbs.showStructs": {
      type: "boolean",
      default: true,
      scope: ConfigurationScope.LANGUAGE_OVERRIDABLE,
      markdownDescription: localize("filteredTypes.struct", "When enabled breadcrumbs show `struct`-symbols.")
    },
    "breadcrumbs.showEvents": {
      type: "boolean",
      default: true,
      scope: ConfigurationScope.LANGUAGE_OVERRIDABLE,
      markdownDescription: localize("filteredTypes.event", "When enabled breadcrumbs show `event`-symbols.")
    },
    "breadcrumbs.showOperators": {
      type: "boolean",
      default: true,
      scope: ConfigurationScope.LANGUAGE_OVERRIDABLE,
      markdownDescription: localize("filteredTypes.operator", "When enabled breadcrumbs show `operator`-symbols.")
    },
    "breadcrumbs.showTypeParameters": {
      type: "boolean",
      default: true,
      scope: ConfigurationScope.LANGUAGE_OVERRIDABLE,
      markdownDescription: localize("filteredTypes.typeParameter", "When enabled breadcrumbs show `typeParameter`-symbols.")
    }
  }
});
export {
  BreadcrumbsConfig,
  BreadcrumbsService,
  IBreadcrumbsService
};
//# sourceMappingURL=breadcrumbs.js.map
