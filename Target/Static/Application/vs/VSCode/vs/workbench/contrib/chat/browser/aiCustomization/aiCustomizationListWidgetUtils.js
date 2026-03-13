var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { PromptsType } from "../../common/promptSyntax/promptTypes.js";
function truncateToFirstSentence(text, maxChars = 120) {
  const match = text.match(/^[^.!?]*[.!?]/);
  if (match && match[0].length <= maxChars) {
    return match[0];
  }
  if (text.length > maxChars) {
    return text.substring(0, maxChars).trimEnd() + "\u2026";
  }
  return text;
}
__name(truncateToFirstSentence, "truncateToFirstSentence");
function getCustomizationSecondaryText(description, filename, promptType) {
  if (!description) {
    return filename;
  }
  return promptType === PromptsType.hook ? description : truncateToFirstSentence(description);
}
__name(getCustomizationSecondaryText, "getCustomizationSecondaryText");
export {
  getCustomizationSecondaryText,
  truncateToFirstSentence
};
//# sourceMappingURL=aiCustomizationListWidgetUtils.js.map
