var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Iterable } from "../../../../../base/common/iterator.js";
import { dirname, joinPath } from "../../../../../base/common/resources.js";
import { splitLinesIncludeSeparators } from "../../../../../base/common/strings.js";
import { URI } from "../../../../../base/common/uri.js";
import { parse } from "../../../../../base/common/yaml.js";
import { Range } from "../../../../../editor/common/core/range.js";
import { PositionOffsetTransformer } from "../../../../../editor/common/core/text/positionToOffsetImpl.js";
import { Target } from "./service/promptsService.js";
class PromptFileParser {
  static {
    __name(this, "PromptFileParser");
  }
  constructor() {
  }
  parse(uri, content) {
    const linesWithEOL = splitLinesIncludeSeparators(content);
    if (linesWithEOL.length === 0) {
      return new ParsedPromptFile(uri, void 0, void 0);
    }
    let header = void 0;
    let body = void 0;
    let bodyStartLine = 0;
    if (linesWithEOL[0].match(/^---[\s\r\n]*$/)) {
      let headerEndLine = linesWithEOL.findIndex((line, index) => index > 0 && line.match(/^---[\s\r\n]*$/));
      if (headerEndLine === -1) {
        headerEndLine = linesWithEOL.length;
        bodyStartLine = linesWithEOL.length;
      } else {
        bodyStartLine = headerEndLine + 1;
      }
      const range = new Range(2, 1, headerEndLine + 1, 1);
      header = new PromptHeader(range, uri, linesWithEOL);
    }
    if (bodyStartLine < linesWithEOL.length) {
      const range = new Range(bodyStartLine + 1, 1, linesWithEOL.length + 1, 1);
      body = new PromptBody(range, linesWithEOL, uri);
    }
    return new ParsedPromptFile(uri, header, body);
  }
}
class ParsedPromptFile {
  static {
    __name(this, "ParsedPromptFile");
  }
  constructor(uri, header, body) {
    this.uri = uri;
    this.header = header;
    this.body = body;
  }
}
var PromptHeaderAttributes;
(function(PromptHeaderAttributes2) {
  PromptHeaderAttributes2.name = "name";
  PromptHeaderAttributes2.description = "description";
  PromptHeaderAttributes2.agent = "agent";
  PromptHeaderAttributes2.mode = "mode";
  PromptHeaderAttributes2.model = "model";
  PromptHeaderAttributes2.applyTo = "applyTo";
  PromptHeaderAttributes2.paths = "paths";
  PromptHeaderAttributes2.tools = "tools";
  PromptHeaderAttributes2.handOffs = "handoffs";
  PromptHeaderAttributes2.advancedOptions = "advancedOptions";
  PromptHeaderAttributes2.argumentHint = "argument-hint";
  PromptHeaderAttributes2.excludeAgent = "excludeAgent";
  PromptHeaderAttributes2.target = "target";
  PromptHeaderAttributes2.infer = "infer";
  PromptHeaderAttributes2.license = "license";
  PromptHeaderAttributes2.compatibility = "compatibility";
  PromptHeaderAttributes2.metadata = "metadata";
  PromptHeaderAttributes2.agents = "agents";
  PromptHeaderAttributes2.userInvokable = "user-invokable";
  PromptHeaderAttributes2.userInvocable = "user-invocable";
  PromptHeaderAttributes2.disableModelInvocation = "disable-model-invocation";
})(PromptHeaderAttributes || (PromptHeaderAttributes = {}));
var GithubPromptHeaderAttributes;
(function(GithubPromptHeaderAttributes2) {
  GithubPromptHeaderAttributes2.mcpServers = "mcp-servers";
  GithubPromptHeaderAttributes2.github = "github";
})(GithubPromptHeaderAttributes || (GithubPromptHeaderAttributes = {}));
var ClaudeHeaderAttributes;
(function(ClaudeHeaderAttributes2) {
  ClaudeHeaderAttributes2.disallowedTools = "disallowedTools";
})(ClaudeHeaderAttributes || (ClaudeHeaderAttributes = {}));
function isTarget(value) {
  return value === Target.VSCode || value === Target.GitHubCopilot || value === Target.Claude || value === Target.Undefined;
}
__name(isTarget, "isTarget");
class PromptHeader {
  static {
    __name(this, "PromptHeader");
  }
  constructor(range, uri, linesWithEOL) {
    this.range = range;
    this.uri = uri;
    this.linesWithEOL = linesWithEOL;
  }
  get _parsedHeader() {
    if (this._parsed === void 0) {
      const yamlErrors = [];
      const headerContent = this.linesWithEOL.slice(this.range.startLineNumber - 1, this.range.endLineNumber - 1).join("");
      const node = parse(headerContent, yamlErrors);
      const transformer = new PositionOffsetTransformer(headerContent);
      const asRange = /* @__PURE__ */ __name(({ startOffset, endOffset }) => {
        const startPos = transformer.getPosition(startOffset), endPos = transformer.getPosition(endOffset);
        const headerDelta = this.range.startLineNumber - 1;
        return new Range(startPos.lineNumber + headerDelta, startPos.column, endPos.lineNumber + headerDelta, endPos.column);
      }, "asRange");
      const asValue = /* @__PURE__ */ __name((node2) => {
        switch (node2.type) {
          case "scalar":
            return { type: "scalar", value: node2.value, range: asRange(node2), format: node2.format };
          case "sequence":
            return { type: "sequence", items: node2.items.map((item) => asValue(item)), range: asRange(node2) };
          case "map": {
            const properties = node2.properties.map((property) => ({ key: asValue(property.key), value: asValue(property.value) }));
            return { type: "map", properties, range: asRange(node2) };
          }
        }
      }, "asValue");
      const attributes = [];
      const errors = yamlErrors.map((err) => ({ message: err.message, range: asRange(err), code: err.code }));
      if (node) {
        if (node.type !== "map") {
          errors.push({ message: "Invalid header, expecting <key: value> pairs", range: this.range, code: "INVALID_YAML" });
        } else {
          for (const property of node.properties) {
            attributes.push({
              key: property.key.value,
              range: asRange({ startOffset: property.key.startOffset, endOffset: property.value.endOffset }),
              value: asValue(property.value)
            });
          }
        }
      }
      this._parsed = { node, attributes, errors };
    }
    return this._parsed;
  }
  get attributes() {
    return this._parsedHeader.attributes;
  }
  getAttribute(key) {
    return this._parsedHeader.attributes.find((attr) => attr.key === key);
  }
  get errors() {
    return this._parsedHeader.errors;
  }
  getStringAttribute(key) {
    const attribute = this._parsedHeader.attributes.find((attr) => attr.key === key);
    if (attribute?.value.type === "scalar") {
      return attribute.value.value;
    }
    return void 0;
  }
  get name() {
    return this.getStringAttribute(PromptHeaderAttributes.name);
  }
  get description() {
    return this.getStringAttribute(PromptHeaderAttributes.description);
  }
  get agent() {
    return this.getStringAttribute(PromptHeaderAttributes.agent) ?? this.getStringAttribute(PromptHeaderAttributes.mode);
  }
  get model() {
    return this.getStringOrStringArrayAttribute(PromptHeaderAttributes.model);
  }
  get applyTo() {
    return this.getStringAttribute(PromptHeaderAttributes.applyTo);
  }
  /**
   * Gets the 'paths' attribute from the header.
   * The `paths` field supports a list of glob patterns that scope the instruction
   * to specific files (used by Claude rules). Returns a string array or undefined.
   */
  get paths() {
    return this.getStringOrStringArrayAttribute(PromptHeaderAttributes.paths);
  }
  get argumentHint() {
    return this.getStringAttribute(PromptHeaderAttributes.argumentHint);
  }
  get target() {
    return this.getStringAttribute(PromptHeaderAttributes.target);
  }
  get infer() {
    return this.getBooleanAttribute(PromptHeaderAttributes.infer);
  }
  get tools() {
    const toolsAttribute = this._parsedHeader.attributes.find((attr) => attr.key === PromptHeaderAttributes.tools);
    if (!toolsAttribute) {
      return void 0;
    }
    let value = toolsAttribute.value;
    if (value.type === "scalar") {
      value = parseCommaSeparatedList(value);
    }
    if (value.type === "sequence") {
      const tools = [];
      for (const item of value.items) {
        if (item.type === "scalar" && item.value) {
          tools.push(item.value);
        }
      }
      return tools;
    }
    return void 0;
  }
  get handOffs() {
    const handoffsAttribute = this._parsedHeader.attributes.find((attr) => attr.key === PromptHeaderAttributes.handOffs);
    if (!handoffsAttribute) {
      return void 0;
    }
    if (handoffsAttribute.value.type === "sequence") {
      const handoffs = [];
      for (const item of handoffsAttribute.value.items) {
        if (item.type === "map") {
          let agent;
          let label;
          let prompt;
          let send;
          let showContinueOn;
          let model;
          for (const prop of item.properties) {
            if (prop.key.value === "agent" && prop.value.type === "scalar") {
              agent = prop.value.value;
            } else if (prop.key.value === "label" && prop.value.type === "scalar") {
              label = prop.value.value;
            } else if (prop.key.value === "prompt" && prop.value.type === "scalar") {
              prompt = prop.value.value;
            } else if (prop.key.value === "send" && prop.value.type === "scalar") {
              send = parseBoolean(prop.value);
            } else if (prop.key.value === "showContinueOn" && prop.value.type === "scalar") {
              showContinueOn = parseBoolean(prop.value);
            } else if (prop.key.value === "model" && prop.value.type === "scalar") {
              model = prop.value.value;
            }
          }
          if (agent && label && prompt !== void 0) {
            const handoff = {
              agent,
              label,
              prompt,
              ...send !== void 0 ? { send } : {},
              ...showContinueOn !== void 0 ? { showContinueOn } : {},
              ...model !== void 0 ? { model } : {}
            };
            handoffs.push(handoff);
          }
        }
      }
      return handoffs;
    }
    return void 0;
  }
  getStringArrayAttribute(key) {
    const attribute = this._parsedHeader.attributes.find((attr) => attr.key === key);
    if (!attribute) {
      return void 0;
    }
    if (attribute.value.type === "sequence") {
      const result = [];
      for (const item of attribute.value.items) {
        if (item.type === "scalar" && item.value) {
          result.push(item.value);
        }
      }
      return result;
    }
    return void 0;
  }
  getStringOrStringArrayAttribute(key) {
    const attribute = this._parsedHeader.attributes.find((attr) => attr.key === key);
    if (!attribute) {
      return void 0;
    }
    if (attribute.value.type === "scalar") {
      return [attribute.value.value];
    }
    if (attribute.value.type === "sequence") {
      const result = [];
      for (const item of attribute.value.items) {
        if (item.type === "scalar") {
          result.push(item.value);
        }
      }
      return result;
    }
    return void 0;
  }
  get agents() {
    return this.getStringArrayAttribute(PromptHeaderAttributes.agents);
  }
  get userInvocable() {
    return this.getBooleanAttribute(PromptHeaderAttributes.userInvocable) ?? this.getBooleanAttribute(PromptHeaderAttributes.userInvokable);
  }
  get disableModelInvocation() {
    return this.getBooleanAttribute(PromptHeaderAttributes.disableModelInvocation);
  }
  getBooleanAttribute(key) {
    const attribute = this._parsedHeader.attributes.find((attr) => attr.key === key);
    if (attribute?.value.type === "scalar") {
      return parseBoolean(attribute.value);
    }
    return void 0;
  }
}
function parseBoolean(stringValue) {
  if (stringValue.value === "true") {
    return true;
  } else if (stringValue.value === "false") {
    return false;
  }
  return void 0;
}
__name(parseBoolean, "parseBoolean");
class PromptBody {
  static {
    __name(this, "PromptBody");
  }
  constructor(range, linesWithEOL, uri) {
    this.range = range;
    this.linesWithEOL = linesWithEOL;
    this.uri = uri;
  }
  get fileReferences() {
    return this.getParsedBody().fileReferences;
  }
  get variableReferences() {
    return this.getParsedBody().variableReferences;
  }
  get offset() {
    return this.getParsedBody().bodyOffset;
  }
  getParsedBody() {
    if (this._parsed === void 0) {
      const markdownLinkRanges = [];
      const fileReferences = [];
      const variableReferences = [];
      const bodyOffset = Iterable.reduce(Iterable.slice(this.linesWithEOL, 0, this.range.startLineNumber - 1), (len, line) => line.length + len, 0);
      for (let i = this.range.startLineNumber - 1, lineStartOffset = bodyOffset; i < this.range.endLineNumber - 1; i++) {
        const line = this.linesWithEOL[i];
        const linkMatch = line.matchAll(/\[(.*?)\]\((.+?)\)/g);
        for (const match of linkMatch) {
          if (match.index > 0 && line[match.index - 1] === "!") {
            continue;
          }
          const linkEndOffset = match.index + match[0].length - 1;
          const linkStartOffset = match.index + match[0].length - match[2].length - 1;
          const range = new Range(i + 1, linkStartOffset + 1, i + 1, linkEndOffset + 1);
          fileReferences.push({ content: match[2], range, isMarkdownLink: true });
          markdownLinkRanges.push(new Range(i + 1, match.index + 1, i + 1, match.index + match[0].length + 1));
        }
        const reg = /#file:(?<filePath>[^\s#]+)|#tool:(?<toolName>[\w_\-\.\/]+)/gi;
        const matches = line.matchAll(reg);
        for (const match of matches) {
          const fullMatch = match[0];
          const fullRange = new Range(i + 1, match.index + 1, i + 1, match.index + fullMatch.length + 1);
          if (markdownLinkRanges.some((mdRange) => Range.areIntersectingOrTouching(mdRange, fullRange))) {
            continue;
          }
          const contentMatch = match.groups?.["filePath"] || match.groups?.["toolName"];
          if (!contentMatch) {
            continue;
          }
          const startOffset = match.index + fullMatch.length - contentMatch.length;
          const endOffset = match.index + fullMatch.length;
          const range = new Range(i + 1, startOffset + 1, i + 1, endOffset + 1);
          if (match.groups?.["filePath"]) {
            fileReferences.push({ content: match.groups?.["filePath"], range, isMarkdownLink: false });
          } else if (match.groups?.["toolName"]) {
            variableReferences.push({ name: match.groups?.["toolName"], range, offset: lineStartOffset + match.index });
          }
        }
        lineStartOffset += line.length;
      }
      this._parsed = { fileReferences: fileReferences.sort((a, b) => Range.compareRangesUsingStarts(a.range, b.range)), variableReferences, bodyOffset };
    }
    return this._parsed;
  }
  getContent() {
    return this.linesWithEOL.slice(this.range.startLineNumber - 1, this.range.endLineNumber - 1).join("");
  }
  resolveFilePath(path) {
    try {
      if (path.startsWith("/")) {
        return this.uri.with({ path });
      } else if (path.match(/^[a-zA-Z]+:\//)) {
        return URI.parse(path);
      } else {
        const dirName = dirname(this.uri);
        return joinPath(dirName, path);
      }
    } catch {
      return void 0;
    }
  }
}
function parseCommaSeparatedList(stringValue) {
  const result = [];
  const input = stringValue.value;
  const positionOffset = stringValue.range.getStartPosition();
  let pos = 0;
  const isWhitespace = /* @__PURE__ */ __name((char) => char === " " || char === "	", "isWhitespace");
  while (pos < input.length) {
    while (pos < input.length && isWhitespace(input[pos])) {
      pos++;
    }
    if (pos >= input.length) {
      break;
    }
    const startPos = pos;
    let value = "";
    let endPos;
    let quoteStyle;
    const char = input[pos];
    if (char === '"' || char === `'`) {
      const quote = char;
      pos++;
      while (pos < input.length && input[pos] !== quote) {
        value += input[pos];
        pos++;
      }
      endPos = pos + 1;
      if (pos < input.length) {
        pos++;
      }
      quoteStyle = quote === '"' ? "double" : "single";
    } else {
      const startPos2 = pos;
      while (pos < input.length && input[pos] !== ",") {
        value += input[pos];
        pos++;
      }
      value = value.trimEnd();
      endPos = startPos2 + value.length;
      quoteStyle = "none";
    }
    result.push({ type: "scalar", value, range: new Range(positionOffset.lineNumber, positionOffset.column + startPos, positionOffset.lineNumber, positionOffset.column + endPos), format: quoteStyle });
    while (pos < input.length && isWhitespace(input[pos])) {
      pos++;
    }
    if (pos < input.length && input[pos] === ",") {
      pos++;
    }
  }
  return { type: "sequence", items: result, range: stringValue.range };
}
__name(parseCommaSeparatedList, "parseCommaSeparatedList");
export {
  ClaudeHeaderAttributes,
  GithubPromptHeaderAttributes,
  ParsedPromptFile,
  PromptBody,
  PromptFileParser,
  PromptHeader,
  PromptHeaderAttributes,
  isTarget,
  parseCommaSeparatedList
};
//# sourceMappingURL=promptFileParser.js.map
