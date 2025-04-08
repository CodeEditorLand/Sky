var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Color } from "../../../../../../base/common/color.js";
import { BugIndicatingError } from "../../../../../../base/common/errors.js";
import { IObservable, observableFromEventOpts } from "../../../../../../base/common/observable.js";
import { localize } from "../../../../../../nls.js";
import { buttonBackground, buttonForeground, buttonSecondaryBackground, buttonSecondaryForeground, diffInserted, diffInsertedLine, diffRemoved, editorBackground } from "../../../../../../platform/theme/common/colorRegistry.js";
import { ColorIdentifier, darken, registerColor, transparent } from "../../../../../../platform/theme/common/colorUtils.js";
import { IThemeService } from "../../../../../../platform/theme/common/themeService.js";
import { InlineEditTabAction } from "./inlineEditsViewInterface.js";
const originalBackgroundColor = registerColor(
  "inlineEdit.originalBackground",
  transparent(diffRemoved, 0.2),
  localize("inlineEdit.originalBackground", "Background color for the original text in inline edits."),
  true
);
const modifiedBackgroundColor = registerColor(
  "inlineEdit.modifiedBackground",
  transparent(diffInserted, 0.3),
  localize("inlineEdit.modifiedBackground", "Background color for the modified text in inline edits."),
  true
);
const originalChangedLineBackgroundColor = registerColor(
  "inlineEdit.originalChangedLineBackground",
  transparent(diffRemoved, 0.8),
  localize("inlineEdit.originalChangedLineBackground", "Background color for the changed lines in the original text of inline edits."),
  true
);
const originalChangedTextOverlayColor = registerColor(
  "inlineEdit.originalChangedTextBackground",
  transparent(diffRemoved, 0.8),
  localize("inlineEdit.originalChangedTextBackground", "Overlay color for the changed text in the original text of inline edits."),
  true
);
const modifiedChangedLineBackgroundColor = registerColor(
  "inlineEdit.modifiedChangedLineBackground",
  {
    light: transparent(diffInsertedLine, 0.7),
    dark: transparent(diffInsertedLine, 0.7),
    hcDark: diffInsertedLine,
    hcLight: diffInsertedLine
  },
  localize("inlineEdit.modifiedChangedLineBackground", "Background color for the changed lines in the modified text of inline edits."),
  true
);
const modifiedChangedTextOverlayColor = registerColor(
  "inlineEdit.modifiedChangedTextBackground",
  transparent(diffInserted, 0.7),
  localize("inlineEdit.modifiedChangedTextBackground", "Overlay color for the changed text in the modified text of inline edits."),
  true
);
const inlineEditIndicatorPrimaryForeground = registerColor(
  "inlineEdit.gutterIndicator.primaryForeground",
  buttonForeground,
  localize("inlineEdit.gutterIndicator.primaryForeground", "Foreground color for the primary inline edit gutter indicator.")
);
const inlineEditIndicatorPrimaryBorder = registerColor(
  "inlineEdit.gutterIndicator.primaryBorder",
  buttonBackground,
  localize("inlineEdit.gutterIndicator.primaryBorder", "Border color for the primary inline edit gutter indicator.")
);
const inlineEditIndicatorPrimaryBackground = registerColor(
  "inlineEdit.gutterIndicator.primaryBackground",
  {
    light: transparent(inlineEditIndicatorPrimaryBorder, 0.5),
    dark: transparent(inlineEditIndicatorPrimaryBorder, 0.4),
    hcDark: transparent(inlineEditIndicatorPrimaryBorder, 0.4),
    hcLight: transparent(inlineEditIndicatorPrimaryBorder, 0.5)
  },
  localize("inlineEdit.gutterIndicator.primaryBackground", "Background color for the primary inline edit gutter indicator.")
);
const inlineEditIndicatorSecondaryForeground = registerColor(
  "inlineEdit.gutterIndicator.secondaryForeground",
  buttonSecondaryForeground,
  localize("inlineEdit.gutterIndicator.secondaryForeground", "Foreground color for the secondary inline edit gutter indicator.")
);
const inlineEditIndicatorSecondaryBorder = registerColor(
  "inlineEdit.gutterIndicator.secondaryBorder",
  buttonSecondaryBackground,
  localize("inlineEdit.gutterIndicator.secondaryBorder", "Border color for the secondary inline edit gutter indicator.")
);
const inlineEditIndicatorSecondaryBackground = registerColor(
  "inlineEdit.gutterIndicator.secondaryBackground",
  inlineEditIndicatorSecondaryBorder,
  localize("inlineEdit.gutterIndicator.secondaryBackground", "Background color for the secondary inline edit gutter indicator.")
);
const inlineEditIndicatorsuccessfulForeground = registerColor(
  "inlineEdit.gutterIndicator.successfulForeground",
  buttonForeground,
  localize("inlineEdit.gutterIndicator.successfulForeground", "Foreground color for the successful inline edit gutter indicator.")
);
const inlineEditIndicatorsuccessfulBorder = registerColor(
  "inlineEdit.gutterIndicator.successfulBorder",
  buttonBackground,
  localize("inlineEdit.gutterIndicator.successfulBorder", "Border color for the successful inline edit gutter indicator.")
);
const inlineEditIndicatorsuccessfulBackground = registerColor(
  "inlineEdit.gutterIndicator.successfulBackground",
  inlineEditIndicatorsuccessfulBorder,
  localize("inlineEdit.gutterIndicator.successfulBackground", "Background color for the successful inline edit gutter indicator.")
);
const inlineEditIndicatorBackground = registerColor(
  "inlineEdit.gutterIndicator.background",
  {
    hcDark: transparent("tab.inactiveBackground", 0.5),
    hcLight: transparent("tab.inactiveBackground", 0.5),
    dark: transparent("tab.inactiveBackground", 0.5),
    light: "#5f5f5f18"
  },
  localize("inlineEdit.gutterIndicator.background", "Background color for the inline edit gutter indicator.")
);
const originalBorder = registerColor(
  "inlineEdit.originalBorder",
  {
    light: diffRemoved,
    dark: diffRemoved,
    hcDark: diffRemoved,
    hcLight: diffRemoved
  },
  localize("inlineEdit.originalBorder", "Border color for the original text in inline edits.")
);
const modifiedBorder = registerColor(
  "inlineEdit.modifiedBorder",
  {
    light: darken(diffInserted, 0.6),
    dark: diffInserted,
    hcDark: diffInserted,
    hcLight: diffInserted
  },
  localize("inlineEdit.modifiedBorder", "Border color for the modified text in inline edits.")
);
const tabWillAcceptModifiedBorder = registerColor(
  "inlineEdit.tabWillAcceptModifiedBorder",
  {
    light: darken(modifiedBorder, 0),
    dark: darken(modifiedBorder, 0),
    hcDark: darken(modifiedBorder, 0),
    hcLight: darken(modifiedBorder, 0)
  },
  localize("inlineEdit.tabWillAcceptModifiedBorder", "Modified border color for the inline edits widget when tab will accept it.")
);
const tabWillAcceptOriginalBorder = registerColor(
  "inlineEdit.tabWillAcceptOriginalBorder",
  {
    light: darken(originalBorder, 0),
    dark: darken(originalBorder, 0),
    hcDark: darken(originalBorder, 0),
    hcLight: darken(originalBorder, 0)
  },
  localize("inlineEdit.tabWillAcceptOriginalBorder", "Original border color for the inline edits widget over the original text when tab will accept it.")
);
function getModifiedBorderColor(tabAction) {
  return tabAction.map((a) => a === InlineEditTabAction.Accept ? tabWillAcceptModifiedBorder : modifiedBorder);
}
__name(getModifiedBorderColor, "getModifiedBorderColor");
function getOriginalBorderColor(tabAction) {
  return tabAction.map((a) => a === InlineEditTabAction.Accept ? tabWillAcceptOriginalBorder : originalBorder);
}
__name(getOriginalBorderColor, "getOriginalBorderColor");
function getEditorBlendedColor(colorIdentifier, themeService) {
  let color;
  if (typeof colorIdentifier === "string") {
    color = observeColor(colorIdentifier, themeService);
  } else {
    color = colorIdentifier.map((identifier, reader) => observeColor(identifier, themeService).read(reader));
  }
  const backgroundColor = observeColor(editorBackground, themeService);
  return color.map((c, reader) => c.makeOpaque(backgroundColor.read(reader)));
}
__name(getEditorBlendedColor, "getEditorBlendedColor");
function observeColor(colorIdentifier, themeService) {
  return observableFromEventOpts(
    {
      owner: { observeColor: colorIdentifier },
      equalsFn: /* @__PURE__ */ __name((a, b) => a.equals(b), "equalsFn")
    },
    themeService.onDidColorThemeChange,
    () => {
      const color = themeService.getColorTheme().getColor(colorIdentifier);
      if (!color) {
        throw new BugIndicatingError(`Missing color: ${colorIdentifier}`);
      }
      return color;
    }
  );
}
__name(observeColor, "observeColor");
export {
  getEditorBlendedColor,
  getModifiedBorderColor,
  getOriginalBorderColor,
  inlineEditIndicatorBackground,
  inlineEditIndicatorPrimaryBackground,
  inlineEditIndicatorPrimaryBorder,
  inlineEditIndicatorPrimaryForeground,
  inlineEditIndicatorSecondaryBackground,
  inlineEditIndicatorSecondaryBorder,
  inlineEditIndicatorSecondaryForeground,
  inlineEditIndicatorsuccessfulBackground,
  inlineEditIndicatorsuccessfulBorder,
  inlineEditIndicatorsuccessfulForeground,
  modifiedBackgroundColor,
  modifiedChangedLineBackgroundColor,
  modifiedChangedTextOverlayColor,
  observeColor,
  originalBackgroundColor,
  originalChangedLineBackgroundColor,
  originalChangedTextOverlayColor
};
//# sourceMappingURL=theme.js.map
