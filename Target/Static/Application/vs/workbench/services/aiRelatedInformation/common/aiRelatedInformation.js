import { createDecorator } from "../../../../platform/instantiation/common/instantiation.js";
const IAiRelatedInformationService = createDecorator("IAiRelatedInformationService");
var RelatedInformationType;
(function(RelatedInformationType2) {
  RelatedInformationType2[RelatedInformationType2["SymbolInformation"] = 1] = "SymbolInformation";
  RelatedInformationType2[RelatedInformationType2["CommandInformation"] = 2] = "CommandInformation";
  RelatedInformationType2[RelatedInformationType2["SearchInformation"] = 3] = "SearchInformation";
  RelatedInformationType2[RelatedInformationType2["SettingInformation"] = 4] = "SettingInformation";
})(RelatedInformationType || (RelatedInformationType = {}));
export {
  IAiRelatedInformationService,
  RelatedInformationType
};
//# sourceMappingURL=aiRelatedInformation.js.map
