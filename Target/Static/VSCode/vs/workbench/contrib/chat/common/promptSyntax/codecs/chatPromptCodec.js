var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { VSBuffer } from "../../../../../../base/common/buffer.js";
import { ReadableStream } from "../../../../../../base/common/stream.js";
import { ChatPromptDecoder, TChatPromptToken } from "./chatPromptDecoder.js";
const ChatPromptCodec = Object.freeze({
  /**
   * Encode a stream of `TChatPromptToken`s into a stream of `VSBuffer`s.
   *
   * @see {@linkcode ReadableStream}
   * @see {@linkcode VSBuffer}
   */
  encode: /* @__PURE__ */ __name((_stream) => {
    throw new Error("The `encode` method is not implemented.");
  }, "encode"),
  /**
   * Decode a of `VSBuffer`s into a readable of `TChatPromptToken`s.
   *
   * @see {@linkcode TChatPromptToken}
   * @see {@linkcode VSBuffer}
   * @see {@linkcode ChatPromptDecoder}
   * @see {@linkcode ReadableStream}
   */
  decode: /* @__PURE__ */ __name((stream) => {
    return new ChatPromptDecoder(stream);
  }, "decode")
});
export {
  ChatPromptCodec
};
//# sourceMappingURL=chatPromptCodec.js.map
