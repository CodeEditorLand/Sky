var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp(target, key, result);
  return result;
};
var __decorateParam = (index, decorator) => (target, key) => decorator(target, key, index);
import { URI } from "../../../../../../base/common/uri.js";
import { assert } from "../../../../../../base/common/assert.js";
import { IDynamicVariable } from "../../../common/chatVariables.js";
import { IRange } from "../../../../../../editor/common/core/range.js";
import { ILogService } from "../../../../../../platform/log/common/log.js";
import { FilePromptParser } from "../../../common/promptSyntax/parsers/filePromptParser.js";
import { IInstantiationService } from "../../../../../../platform/instantiation/common/instantiation.js";
let ChatFileReference = class extends FilePromptParser {
  /**
   * @throws if the `data` reference is no an instance of `URI`.
   */
  constructor(reference, initService, logService) {
    const { data } = reference;
    assert(
      data instanceof URI,
      `Variable data must be an URI, got '${data}'.`
    );
    super(data, [], initService, logService);
    this.reference = reference;
  }
  static {
    __name(this, "ChatFileReference");
  }
  /**
   * Note! below are the getters that simply forward to the underlying `IDynamicVariable` object;
   * 		 while we could implement the logic generically using the `Proxy` class here, it's hard
   * 		 to make Typescript to recognize this generic implementation correctly
   */
  get id() {
    return this.reference.id;
  }
  get range() {
    return this.reference.range;
  }
  set range(range) {
    this.reference.range = range;
  }
  get data() {
    return this.uri;
  }
  get prefix() {
    return this.reference.prefix;
  }
  get isFile() {
    return this.reference.isFile;
  }
  get fullName() {
    return this.reference.fullName;
  }
  get icon() {
    return this.reference.icon;
  }
  get modelDescription() {
    return this.reference.modelDescription;
  }
};
ChatFileReference = __decorateClass([
  __decorateParam(1, IInstantiationService),
  __decorateParam(2, ILogService)
], ChatFileReference);
export {
  ChatFileReference
};
//# sourceMappingURL=chatFileReference.js.map
