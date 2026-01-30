var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
async function getTextResponseFromStream(response) {
  let responseText = "";
  const streaming = (async () => {
    if (!response || !response.stream) {
      return;
    }
    for await (const part of response.stream) {
      if (Array.isArray(part)) {
        for (const p of part) {
          if (p.type === "text") {
            responseText += p.value;
          }
        }
      } else if (part.type === "text") {
        responseText += part.value;
      }
    }
  })();
  try {
    await Promise.all([response.result, streaming]);
    return responseText;
  } catch (err) {
    return "Error occurred " + err;
  }
}
__name(getTextResponseFromStream, "getTextResponseFromStream");
export {
  getTextResponseFromStream
};
//# sourceMappingURL=utils.js.map
