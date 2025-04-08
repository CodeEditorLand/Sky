var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Emitter, Event } from "../../../../base/common/event.js";
import severity from "../../../../base/common/severity.js";
import { isObject, isString } from "../../../../base/common/types.js";
import { generateUuid } from "../../../../base/common/uuid.js";
import * as nls from "../../../../nls.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { IDebugConfiguration, IDebugSession, IExpression, INestingReplElement, IReplElement, IReplElementSource, IStackFrame } from "./debug.js";
import { ExpressionContainer } from "./debugModel.js";
const MAX_REPL_LENGTH = 1e4;
let topReplElementCounter = 0;
const getUniqueId = /* @__PURE__ */ __name(() => `topReplElement:${topReplElementCounter++}`, "getUniqueId");
class ReplOutputElement {
  constructor(session, id, value, severity2, sourceData, expression) {
    this.session = session;
    this.id = id;
    this.value = value;
    this.severity = severity2;
    this.sourceData = sourceData;
    this.expression = expression;
  }
  static {
    __name(this, "ReplOutputElement");
  }
  _count = 1;
  _onDidChangeCount = new Emitter();
  toString(includeSource = false) {
    let valueRespectCount = this.value;
    for (let i = 1; i < this.count; i++) {
      valueRespectCount += (valueRespectCount.endsWith("\n") ? "" : "\n") + this.value;
    }
    const sourceStr = this.sourceData && includeSource ? ` ${this.sourceData.source.name}` : "";
    return valueRespectCount + sourceStr;
  }
  getId() {
    return this.id;
  }
  getChildren() {
    return this.expression?.getChildren() || Promise.resolve([]);
  }
  set count(value) {
    this._count = value;
    this._onDidChangeCount.fire();
  }
  get count() {
    return this._count;
  }
  get onDidChangeCount() {
    return this._onDidChangeCount.event;
  }
  get hasChildren() {
    return !!this.expression?.hasChildren;
  }
}
class ReplVariableElement {
  constructor(session, expression, severity2, sourceData) {
    this.session = session;
    this.expression = expression;
    this.severity = severity2;
    this.sourceData = sourceData;
    this.hasChildren = expression.hasChildren;
  }
  static {
    __name(this, "ReplVariableElement");
  }
  hasChildren;
  id = generateUuid();
  getSession() {
    return this.session;
  }
  getChildren() {
    return this.expression.getChildren();
  }
  toString() {
    return this.expression.toString();
  }
  getId() {
    return this.id;
  }
}
class RawObjectReplElement {
  // upper bound of children per value
  constructor(id, name, valueObj, sourceData, annotation) {
    this.id = id;
    this.name = name;
    this.valueObj = valueObj;
    this.sourceData = sourceData;
    this.annotation = annotation;
  }
  static {
    __name(this, "RawObjectReplElement");
  }
  static MAX_CHILDREN = 1e3;
  getId() {
    return this.id;
  }
  getSession() {
    return void 0;
  }
  get value() {
    if (this.valueObj === null) {
      return "null";
    } else if (Array.isArray(this.valueObj)) {
      return `Array[${this.valueObj.length}]`;
    } else if (isObject(this.valueObj)) {
      return "Object";
    } else if (isString(this.valueObj)) {
      return `"${this.valueObj}"`;
    }
    return String(this.valueObj) || "";
  }
  get hasChildren() {
    return Array.isArray(this.valueObj) && this.valueObj.length > 0 || isObject(this.valueObj) && Object.getOwnPropertyNames(this.valueObj).length > 0;
  }
  evaluateLazy() {
    throw new Error("Method not implemented.");
  }
  getChildren() {
    let result = [];
    if (Array.isArray(this.valueObj)) {
      result = this.valueObj.slice(0, RawObjectReplElement.MAX_CHILDREN).map((v, index) => new RawObjectReplElement(`${this.id}:${index}`, String(index), v));
    } else if (isObject(this.valueObj)) {
      result = Object.getOwnPropertyNames(this.valueObj).slice(0, RawObjectReplElement.MAX_CHILDREN).map((key, index) => new RawObjectReplElement(`${this.id}:${index}`, key, this.valueObj[key]));
    }
    return Promise.resolve(result);
  }
  toString() {
    return `${this.name}
${this.value}`;
  }
}
class ReplEvaluationInput {
  constructor(value) {
    this.value = value;
    this.id = generateUuid();
  }
  static {
    __name(this, "ReplEvaluationInput");
  }
  id;
  toString() {
    return this.value;
  }
  getId() {
    return this.id;
  }
}
class ReplEvaluationResult extends ExpressionContainer {
  constructor(originalExpression) {
    super(void 0, void 0, 0, generateUuid());
    this.originalExpression = originalExpression;
  }
  static {
    __name(this, "ReplEvaluationResult");
  }
  _available = true;
  get available() {
    return this._available;
  }
  async evaluateExpression(expression, session, stackFrame, context) {
    const result = await super.evaluateExpression(expression, session, stackFrame, context);
    this._available = result;
    return result;
  }
  toString() {
    return `${this.value}`;
  }
}
class ReplGroup {
  constructor(session, name, autoExpand, sourceData) {
    this.session = session;
    this.name = name;
    this.autoExpand = autoExpand;
    this.sourceData = sourceData;
    this.id = `replGroup:${ReplGroup.COUNTER++}`;
  }
  static {
    __name(this, "ReplGroup");
  }
  children = [];
  id;
  ended = false;
  static COUNTER = 0;
  get hasChildren() {
    return true;
  }
  getId() {
    return this.id;
  }
  toString(includeSource = false) {
    const sourceStr = includeSource && this.sourceData ? ` ${this.sourceData.source.name}` : "";
    return this.name + sourceStr;
  }
  addChild(child) {
    const lastElement = this.children.length ? this.children[this.children.length - 1] : void 0;
    if (lastElement instanceof ReplGroup && !lastElement.hasEnded) {
      lastElement.addChild(child);
    } else {
      this.children.push(child);
    }
  }
  getChildren() {
    return this.children;
  }
  end() {
    const lastElement = this.children.length ? this.children[this.children.length - 1] : void 0;
    if (lastElement instanceof ReplGroup && !lastElement.hasEnded) {
      lastElement.end();
    } else {
      this.ended = true;
    }
  }
  get hasEnded() {
    return this.ended;
  }
}
function areSourcesEqual(first, second) {
  if (!first && !second) {
    return true;
  }
  if (first && second) {
    return first.column === second.column && first.lineNumber === second.lineNumber && first.source.uri.toString() === second.source.uri.toString();
  }
  return false;
}
__name(areSourcesEqual, "areSourcesEqual");
class ReplModel {
  constructor(configurationService) {
    this.configurationService = configurationService;
  }
  static {
    __name(this, "ReplModel");
  }
  replElements = [];
  _onDidChangeElements = new Emitter();
  onDidChangeElements = this._onDidChangeElements.event;
  getReplElements() {
    return this.replElements;
  }
  async addReplExpression(session, stackFrame, expression) {
    this.addReplElement(new ReplEvaluationInput(expression));
    const result = new ReplEvaluationResult(expression);
    await result.evaluateExpression(expression, session, stackFrame, "repl");
    this.addReplElement(result);
  }
  appendToRepl(session, { output, expression, sev, source }) {
    const clearAnsiSequence = "\x1B[2J";
    const clearAnsiIndex = output.lastIndexOf(clearAnsiSequence);
    if (clearAnsiIndex !== -1) {
      this.removeReplExpressions();
      this.appendToRepl(session, { output: nls.localize("consoleCleared", "Console was cleared"), sev: severity.Ignore });
      output = output.substring(clearAnsiIndex + clearAnsiSequence.length);
    }
    if (expression) {
      this.addReplElement(output ? new ReplOutputElement(session, getUniqueId(), output, sev, source, expression) : new ReplVariableElement(session, expression, sev, source));
      return;
    }
    const previousElement = this.replElements.length ? this.replElements[this.replElements.length - 1] : void 0;
    if (previousElement instanceof ReplOutputElement && previousElement.severity === sev) {
      const config = this.configurationService.getValue("debug");
      if (previousElement.value === output && areSourcesEqual(previousElement.sourceData, source) && config.console.collapseIdenticalLines) {
        previousElement.count++;
        return;
      }
      if (!previousElement.value.endsWith("\n") && !previousElement.value.endsWith("\r\n") && previousElement.count === 1) {
        this.replElements[this.replElements.length - 1] = new ReplOutputElement(
          session,
          getUniqueId(),
          previousElement.value + output,
          sev,
          source
        );
        this._onDidChangeElements.fire(void 0);
        return;
      }
    }
    const element = new ReplOutputElement(session, getUniqueId(), output, sev, source);
    this.addReplElement(element);
  }
  startGroup(session, name, autoExpand, sourceData) {
    const group = new ReplGroup(session, name, autoExpand, sourceData);
    this.addReplElement(group);
  }
  endGroup() {
    const lastElement = this.replElements[this.replElements.length - 1];
    if (lastElement instanceof ReplGroup) {
      lastElement.end();
    }
  }
  addReplElement(newElement) {
    const lastElement = this.replElements.length ? this.replElements[this.replElements.length - 1] : void 0;
    if (lastElement instanceof ReplGroup && !lastElement.hasEnded) {
      lastElement.addChild(newElement);
    } else {
      this.replElements.push(newElement);
      if (this.replElements.length > MAX_REPL_LENGTH) {
        this.replElements.splice(0, this.replElements.length - MAX_REPL_LENGTH);
      }
    }
    this._onDidChangeElements.fire(newElement);
  }
  removeReplExpressions() {
    if (this.replElements.length > 0) {
      this.replElements = [];
      this._onDidChangeElements.fire(void 0);
    }
  }
  /** Returns a new REPL model that's a copy of this one. */
  clone() {
    const newRepl = new ReplModel(this.configurationService);
    newRepl.replElements = this.replElements.slice();
    return newRepl;
  }
}
export {
  RawObjectReplElement,
  ReplEvaluationInput,
  ReplEvaluationResult,
  ReplGroup,
  ReplModel,
  ReplOutputElement,
  ReplVariableElement
};
//# sourceMappingURL=replModel.js.map
