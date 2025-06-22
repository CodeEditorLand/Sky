import { NewLine } from "../linesCodec/tokens/newLine.js";
import { CarriageReturn } from "../linesCodec/tokens/carriageReturn.js";
import { FormFeed, SpacingToken } from "../simpleCodec/tokens/tokens.js";
const VALID_INTER_RECORD_SPACING_TOKENS = Object.freeze([
  SpacingToken,
  CarriageReturn,
  NewLine,
  FormFeed
]);
export {
  VALID_INTER_RECORD_SPACING_TOKENS
};
//# sourceMappingURL=constants.js.map
