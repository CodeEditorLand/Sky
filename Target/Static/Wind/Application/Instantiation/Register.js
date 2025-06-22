var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
const LayerMap = /* @__PURE__ */ new Map();
const RegisterService = /* @__PURE__ */ __name((Constructor, Layer) => {
  LayerMap.set(Constructor, Layer);
}, "RegisterService");
export {
  LayerMap,
  RegisterService
};
//# sourceMappingURL=Register.js.map
