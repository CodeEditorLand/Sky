import { createDecorator } from "../../../../platform/instantiation/common/instantiation.js";
var GitRefType;
(function(GitRefType2) {
  GitRefType2[GitRefType2["Head"] = 0] = "Head";
  GitRefType2[GitRefType2["RemoteHead"] = 1] = "RemoteHead";
  GitRefType2[GitRefType2["Tag"] = 2] = "Tag";
})(GitRefType || (GitRefType = {}));
const IGitService = createDecorator("gitService");
export {
  GitRefType,
  IGitService
};
//# sourceMappingURL=gitService.js.map
