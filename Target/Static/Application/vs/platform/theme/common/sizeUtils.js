var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Emitter } from "../../../base/common/event.js";
import { Extensions as JSONExtensions } from "../../jsonschemas/common/jsonContributionRegistry.js";
import * as platform from "../../registry/common/platform.js";
import { Disposable } from "../../../base/common/lifecycle.js";
import { RunOnceScheduler } from "../../../base/common/async.js";
function asCssVariableName(sizeIdent) {
  return `--vscode-${sizeIdent.replace(/\./g, "-")}`;
}
__name(asCssVariableName, "asCssVariableName");
function asCssVariable(size2) {
  return `var(${asCssVariableName(size2)})`;
}
__name(asCssVariable, "asCssVariable");
function asCssVariableWithDefault(size2, defaultCssValue) {
  return `var(${asCssVariableName(size2)}, ${defaultCssValue})`;
}
__name(asCssVariableWithDefault, "asCssVariableWithDefault");
function isSizeDefaults(value) {
  return value !== null && typeof value === "object" && "light" in value && "dark" in value;
}
__name(isSizeDefaults, "isSizeDefaults");
function size(value, unit = "px") {
  return { value, unit };
}
__name(size, "size");
function sizeForAllThemes(value, unit = "px") {
  const sizeValue = size(value, unit);
  return {
    light: sizeValue,
    dark: sizeValue,
    hcDark: sizeValue,
    hcLight: sizeValue
  };
}
__name(sizeForAllThemes, "sizeForAllThemes");
function sizeValueToCss(sizeValue) {
  return `${sizeValue.value}${sizeValue.unit}`;
}
__name(sizeValueToCss, "sizeValueToCss");
const Extensions = {
  SizeContribution: "base.contributions.sizes"
};
const DEFAULT_SIZE_CONFIG_VALUE = "default";
class SizeRegistry extends Disposable {
  static {
    __name(this, "SizeRegistry");
  }
  constructor() {
    super();
    this._onDidChangeSchema = this._register(new Emitter());
    this.onDidChangeSchema = this._onDidChangeSchema.event;
    this.sizeSchema = { type: "object", properties: {} };
    this.sizeReferenceSchema = { type: "string", enum: [], enumDescriptions: [] };
    this.sizesById = {};
  }
  notifyThemeUpdate(theme) {
    for (const key of Object.keys(this.sizesById)) {
      const sizeVal = this.resolveDefaultSize(key, theme);
      if (sizeVal) {
        this.sizeSchema.properties[key].default = sizeValueToCss(sizeVal);
      }
    }
    this._onDidChangeSchema.fire();
  }
  registerSize(id, defaults, description, deprecationMessage) {
    const sizeContribution = { id, description, defaults, deprecationMessage };
    this.sizesById[id] = sizeContribution;
    const propertySchema = {
      type: "string",
      pattern: "^(\\d+(\\.\\d+)?(px|rem|em|%))|default$",
      patternErrorMessage: 'Size must be a number followed by px, rem, em, or % (e.g., "12px", "1.5rem") or "default"'
    };
    if (deprecationMessage) {
      propertySchema.deprecationMessage = deprecationMessage;
    }
    this.sizeSchema.properties[id] = {
      description,
      ...propertySchema
    };
    this.sizeReferenceSchema.enum.push(id);
    this.sizeReferenceSchema.enumDescriptions.push(description);
    this._onDidChangeSchema.fire();
    return id;
  }
  deregisterSize(id) {
    delete this.sizesById[id];
    delete this.sizeSchema.properties[id];
    const index = this.sizeReferenceSchema.enum.indexOf(id);
    if (index !== -1) {
      this.sizeReferenceSchema.enum.splice(index, 1);
      this.sizeReferenceSchema.enumDescriptions.splice(index, 1);
    }
    this._onDidChangeSchema.fire();
  }
  getSizes() {
    return Object.keys(this.sizesById).map((id) => this.sizesById[id]);
  }
  resolveDefaultSize(id, theme) {
    const sizeDesc = this.sizesById[id];
    if (sizeDesc?.defaults) {
      const sizeValue = isSizeDefaults(sizeDesc.defaults) ? sizeDesc.defaults[theme.type] : sizeDesc.defaults;
      return sizeValue ?? void 0;
    }
    return void 0;
  }
  getSizeSchema() {
    return this.sizeSchema;
  }
  getSizeReferenceSchema() {
    return this.sizeReferenceSchema;
  }
  toString() {
    const sorter = /* @__PURE__ */ __name((a, b) => {
      const cat1 = a.indexOf(".") === -1 ? 0 : 1;
      const cat2 = b.indexOf(".") === -1 ? 0 : 1;
      if (cat1 !== cat2) {
        return cat1 - cat2;
      }
      return a.localeCompare(b);
    }, "sorter");
    return Object.keys(this.sizesById).sort(sorter).map((k) => `- \`${k}\`: ${this.sizesById[k].description}`).join("\n");
  }
}
const sizeRegistry = new SizeRegistry();
platform.Registry.add(Extensions.SizeContribution, sizeRegistry);
function registerSize(id, defaults, description, deprecationMessage) {
  return sizeRegistry.registerSize(id, defaults, description, deprecationMessage);
}
__name(registerSize, "registerSize");
function getSizeRegistry() {
  return sizeRegistry;
}
__name(getSizeRegistry, "getSizeRegistry");
const workbenchSizesSchemaId = "vscode://schemas/workbench-sizes";
const schemaRegistry = platform.Registry.as(JSONExtensions.JSONContribution);
schemaRegistry.registerSchema(workbenchSizesSchemaId, sizeRegistry.getSizeSchema());
const delayer = new RunOnceScheduler(() => schemaRegistry.notifySchemaChanged(workbenchSizesSchemaId), 200);
sizeRegistry.onDidChangeSchema(() => {
  if (!delayer.isScheduled()) {
    delayer.schedule();
  }
});
export {
  DEFAULT_SIZE_CONFIG_VALUE,
  Extensions,
  asCssVariable,
  asCssVariableName,
  asCssVariableWithDefault,
  getSizeRegistry,
  isSizeDefaults,
  registerSize,
  size,
  sizeForAllThemes,
  sizeValueToCss,
  workbenchSizesSchemaId
};
//# sourceMappingURL=sizeUtils.js.map
