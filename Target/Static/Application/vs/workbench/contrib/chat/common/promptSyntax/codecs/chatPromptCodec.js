var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { ChatPromptDecoder } from "./chatPromptDecoder.js";
const ChatPromptCodec = Object.freeze({
  /**
   * Encode a stream of `TChatPromptToken`s into a stream of `VSBuffer`s.
   *
   * @see {@link ReadableStream}
   * @see {@link VSBuffer}
   */
  encode: /* @__PURE__ */ __name((_stream) => {
    throw new Error("The `encode` method is not implemented.");
  }, "encode"),
  /**
   * Decode a of `VSBuffer`s into a readable of `TChatPromptToken`s.
   *
   * @see {@link TChatPromptToken}
   * @see {@link VSBuffer}
   * @see {@link ChatPromptDecoder}
   * @see {@link ReadableStream}
   */
  decode: /* @__PURE__ */ __name((stream) => {
    return new ChatPromptDecoder(stream);
  }, "decode")
});
export {
  ChatPromptCodec
};
//# sourceMappingURL=chatPromptCodec.js.map
