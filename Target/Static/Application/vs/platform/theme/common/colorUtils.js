var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { assertNever } from "../../../base/common/assert.js";
import { RunOnceScheduler } from "../../../base/common/async.js";
import { Color } from "../../../base/common/color.js";
import { Emitter } from "../../../base/common/event.js";
import { Extensions as JSONExtensions } from "../../jsonschemas/common/jsonContributionRegistry.js";
import * as platform from "../../registry/common/platform.js";
import * as nls from "../../../nls.js";
import { Disposable } from "../../../base/common/lifecycle.js";
function asCssVariableName(colorIdent) {
  return `--vscode-${colorIdent.replace(/\./g, "-")}`;
}
__name(asCssVariableName, "asCssVariableName");
function asCssVariable(color) {
  return `var(${asCssVariableName(color)})`;
}
__name(asCssVariable, "asCssVariable");
function asCssVariableWithDefault(color, defaultCssValue) {
  return `var(${asCssVariableName(color)}, ${defaultCssValue})`;
}
__name(asCssVariableWithDefault, "asCssVariableWithDefault");
var ColorTransformType;
(function(ColorTransformType2) {
  ColorTransformType2[ColorTransformType2["Darken"] = 0] = "Darken";
  ColorTransformType2[ColorTransformType2["Lighten"] = 1] = "Lighten";
  ColorTransformType2[ColorTransformType2["Transparent"] = 2] = "Transparent";
  ColorTransformType2[ColorTransformType2["Opaque"] = 3] = "Opaque";
  ColorTransformType2[ColorTransformType2["OneOf"] = 4] = "OneOf";
  ColorTransformType2[ColorTransformType2["LessProminent"] = 5] = "LessProminent";
  ColorTransformType2[ColorTransformType2["IfDefinedThenElse"] = 6] = "IfDefinedThenElse";
  ColorTransformType2[ColorTransformType2["Mix"] = 7] = "Mix";
})(ColorTransformType || (ColorTransformType = {}));
function isColorDefaults(value) {
  return value !== null && typeof value === "object" && "light" in value && "dark" in value;
}
__name(isColorDefaults, "isColorDefaults");
const Extensions = {
  ColorContribution: "base.contributions.colors"
};
const DEFAULT_COLOR_CONFIG_VALUE = "default";
class ColorRegistry extends Disposable {
  static {
    __name(this, "ColorRegistry");
  }
  constructor() {
    super();
    this._onDidChangeSchema = this._register(new Emitter());
    this.onDidChangeSchema = this._onDidChangeSchema.event;
    this.colorSchema = { type: "object", properties: {} };
    this.colorReferenceSchema = { type: "string", enum: [], enumDescriptions: [] };
    this.colorsById = {};
  }
  notifyThemeUpdate(colorThemeData) {
    for (const key of Object.keys(this.colorsById)) {
      const color = colorThemeData.getColor(key);
      if (color) {
        this.colorSchema.properties[key].oneOf[0].defaultSnippets[0].body = `\${1:${Color.Format.CSS.formatHexA(color, true)}}`;
      }
    }
    this._onDidChangeSchema.fire();
  }
  registerColor(id, defaults, description, needsTransparency = false, deprecationMessage) {
    const colorContribution = { id, description, defaults, needsTransparency, deprecationMessage };
    this.colorsById[id] = colorContribution;
    const propertySchema = { type: "string", format: "color-hex", defaultSnippets: [{ body: "${1:#ff0000}" }] };
    if (deprecationMessage) {
      propertySchema.deprecationMessage = deprecationMessage;
    }
    if (needsTransparency) {
      propertySchema.pattern = "^#(?:(?<rgba>[0-9a-fA-f]{3}[0-9a-eA-E])|(?:[0-9a-fA-F]{6}(?:(?![fF]{2})(?:[0-9a-fA-F]{2}))))?$";
      propertySchema.patternErrorMessage = nls.localize("transparecyRequired", "This color must be transparent or it will obscure content");
    }
    this.colorSchema.properties[id] = {
      description,
      oneOf: [
        propertySchema,
        { type: "string", const: DEFAULT_COLOR_CONFIG_VALUE, description: nls.localize("useDefault", "Use the default color.") }
      ]
    };
    this.colorReferenceSchema.enum.push(id);
    this.colorReferenceSchema.enumDescriptions.push(description);
    this._onDidChangeSchema.fire();
    return id;
  }
  deregisterColor(id) {
    delete this.colorsById[id];
    delete this.colorSchema.properties[id];
    const index = this.colorReferenceSchema.enum.indexOf(id);
    if (index !== -1) {
      this.colorReferenceSchema.enum.splice(index, 1);
      this.colorReferenceSchema.enumDescriptions.splice(index, 1);
    }
    this._onDidChangeSchema.fire();
  }
  getColors() {
    return Object.keys(this.colorsById).map((id) => this.colorsById[id]);
  }
  resolveDefaultColor(id, theme) {
    const colorDesc = this.colorsById[id];
    if (colorDesc?.defaults) {
      const colorValue = isColorDefaults(colorDesc.defaults) ? colorDesc.defaults[theme.type] : colorDesc.defaults;
      return resolveColorValue(colorValue, theme);
    }
    return void 0;
  }
  getColorSchema() {
    return this.colorSchema;
  }
  getColorReferenceSchema() {
    return this.colorReferenceSchema;
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
    return Object.keys(this.colorsById).sort(sorter).map((k) => `- \`${k}\`: ${this.colorsById[k].description}`).join("\n");
  }
}
const colorRegistry = new ColorRegistry();
platform.Registry.add(Extensions.ColorContribution, colorRegistry);
function registerColor(id, defaults, description, needsTransparency, deprecationMessage) {
  return colorRegistry.registerColor(id, defaults, description, needsTransparency, deprecationMessage);
}
__name(registerColor, "registerColor");
function getColorRegistry() {
  return colorRegistry;
}
__name(getColorRegistry, "getColorRegistry");
function executeTransform(transform, theme) {
  switch (transform.op) {
    case 0:
      return resolveColorValue(transform.value, theme)?.darken(transform.factor);
    case 1:
      return resolveColorValue(transform.value, theme)?.lighten(transform.factor);
    case 2:
      return resolveColorValue(transform.value, theme)?.transparent(transform.factor);
    case 7: {
      const primaryColor = resolveColorValue(transform.color, theme) || Color.transparent;
      const otherColor = resolveColorValue(transform.with, theme) || Color.transparent;
      return primaryColor.mix(otherColor, transform.ratio);
    }
    case 3: {
      const backgroundColor = resolveColorValue(transform.background, theme);
      if (!backgroundColor) {
        return resolveColorValue(transform.value, theme);
      }
      return resolveColorValue(transform.value, theme)?.makeOpaque(backgroundColor);
    }
    case 4:
      for (const candidate of transform.values) {
        const color = resolveColorValue(candidate, theme);
        if (color) {
          return color;
        }
      }
      return void 0;
    case 6:
      return resolveColorValue(theme.defines(transform.if) ? transform.then : transform.else, theme);
    case 5: {
      const from = resolveColorValue(transform.value, theme);
      if (!from) {
        return void 0;
      }
      const backgroundColor = resolveColorValue(transform.background, theme);
      if (!backgroundColor) {
        return from.transparent(transform.factor * transform.transparency);
      }
      return from.isDarkerThan(backgroundColor) ? Color.getLighterColor(from, backgroundColor, transform.factor).transparent(transform.transparency) : Color.getDarkerColor(from, backgroundColor, transform.factor).transparent(transform.transparency);
    }
    default:
      throw assertNever(transform);
  }
}
__name(executeTransform, "executeTransform");
function darken(colorValue, factor) {
  return { op: 0, value: colorValue, factor };
}
__name(darken, "darken");
function lighten(colorValue, factor) {
  return { op: 1, value: colorValue, factor };
}
__name(lighten, "lighten");
function transparent(colorValue, factor) {
  return { op: 2, value: colorValue, factor };
}
__name(transparent, "transparent");
function opaque(colorValue, background) {
  return { op: 3, value: colorValue, background };
}
__name(opaque, "opaque");
function oneOf(...colorValues) {
  return { op: 4, values: colorValues };
}
__name(oneOf, "oneOf");
function ifDefinedThenElse(ifArg, thenArg, elseArg) {
  return { op: 6, if: ifArg, then: thenArg, else: elseArg };
}
__name(ifDefinedThenElse, "ifDefinedThenElse");
function lessProminent(colorValue, backgroundColorValue, factor, transparency) {
  return { op: 5, value: colorValue, background: backgroundColorValue, factor, transparency };
}
__name(lessProminent, "lessProminent");
function resolveColorValue(colorValue, theme) {
  if (colorValue === null) {
    return void 0;
  } else if (typeof colorValue === "string") {
    if (colorValue[0] === "#") {
      return Color.fromHex(colorValue);
    }
    return theme.getColor(colorValue);
  } else if (colorValue instanceof Color) {
    return colorValue;
  } else if (typeof colorValue === "object") {
    return executeTransform(colorValue, theme);
  }
  return void 0;
}
__name(resolveColorValue, "resolveColorValue");
const workbenchColorsSchemaId = "vscode://schemas/workbench-colors";
const schemaRegistry = platform.Registry.as(JSONExtensions.JSONContribution);
schemaRegistry.registerSchema(workbenchColorsSchemaId, colorRegistry.getColorSchema());
const delayer = new RunOnceScheduler(() => schemaRegistry.notifySchemaChanged(workbenchColorsSchemaId), 200);
colorRegistry.onDidChangeSchema(() => {
  if (!delayer.isScheduled()) {
    delayer.schedule();
  }
});
export {
  ColorTransformType,
  DEFAULT_COLOR_CONFIG_VALUE,
  Extensions,
  asCssVariable,
  asCssVariableName,
  asCssVariableWithDefault,
  darken,
  executeTransform,
  getColorRegistry,
  ifDefinedThenElse,
  isColorDefaults,
  lessProminent,
  lighten,
  oneOf,
  opaque,
  registerColor,
  resolveColorValue,
  transparent,
  workbenchColorsSchemaId
};
//# sourceMappingURL=colorUtils.js.map
