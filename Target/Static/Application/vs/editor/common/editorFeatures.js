var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
const editorFeatures = [];
function registerEditorFeature(ctor) {
  editorFeatures.push(ctor);
}
__name(registerEditorFeature, "registerEditorFeature");
function getEditorFeatures() {
  return editorFeatures.slice(0);
}
__name(getEditorFeatures, "getEditorFeatures");
export {
  getEditorFeatures,
  registerEditorFeature
};
//# sourceMappingURL=editorFeatures.js.map
