var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
function randomPort() {
  const min = 1025;
  const max = 65535;
  return min + Math.floor((max - min) * Math.random());
}
__name(randomPort, "randomPort");
export {
  randomPort
};
//# sourceMappingURL=ports.js.map
