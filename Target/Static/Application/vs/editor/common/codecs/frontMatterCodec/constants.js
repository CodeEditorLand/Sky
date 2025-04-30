import { NewLine } from "../linesCodec/tokens/newLine.js";
import { CarriageReturn } from "../linesCodec/tokens/carriageReturn.js";
import { FormFeed, Space, Tab, VerticalTab } from "../simpleCodec/tokens/index.js";
const VALID_SPACE_TOKENS = Object.freeze([
  Space,
  Tab,
  CarriageReturn,
  NewLine,
  FormFeed,
  VerticalTab
]);
export {
  VALID_SPACE_TOKENS
};
//# sourceMappingURL=constants.js.map
