var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
const detachPrompt = /* @__PURE__ */ __name(async (file, options) => {
  const { widget } = options;
  widget.attachmentModel.promptInstructions.remove(file);
  return widget;
}, "detachPrompt");
export {
  detachPrompt
};
//# sourceMappingURL=detachPrompt.js.map
