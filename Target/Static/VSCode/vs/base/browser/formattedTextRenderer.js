var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import * as DOM from "./dom.js";
import { IKeyboardEvent } from "./keyboardEvent.js";
import { IMouseEvent } from "./mouseEvent.js";
import { DisposableStore } from "../common/lifecycle.js";
function renderText(text, options = {}) {
  const element = createElement(options);
  element.textContent = text;
  return element;
}
__name(renderText, "renderText");
function renderFormattedText(formattedText, options = {}) {
  const element = createElement(options);
  _renderFormattedText(element, parseFormattedText(formattedText, !!options.renderCodeSegments), options.actionHandler, options.renderCodeSegments);
  return element;
}
__name(renderFormattedText, "renderFormattedText");
function createElement(options) {
  const tagName = options.inline ? "span" : "div";
  const element = document.createElement(tagName);
  if (options.className) {
    element.className = options.className;
  }
  return element;
}
__name(createElement, "createElement");
class StringStream {
  static {
    __name(this, "StringStream");
  }
  source;
  index;
  constructor(source) {
    this.source = source;
    this.index = 0;
  }
  eos() {
    return this.index >= this.source.length;
  }
  next() {
    const next = this.peek();
    this.advance();
    return next;
  }
  peek() {
    return this.source[this.index];
  }
  advance() {
    this.index++;
  }
}
var FormatType = /* @__PURE__ */ ((FormatType2) => {
  FormatType2[FormatType2["Invalid"] = 0] = "Invalid";
  FormatType2[FormatType2["Root"] = 1] = "Root";
  FormatType2[FormatType2["Text"] = 2] = "Text";
  FormatType2[FormatType2["Bold"] = 3] = "Bold";
  FormatType2[FormatType2["Italics"] = 4] = "Italics";
  FormatType2[FormatType2["Action"] = 5] = "Action";
  FormatType2[FormatType2["ActionClose"] = 6] = "ActionClose";
  FormatType2[FormatType2["Code"] = 7] = "Code";
  FormatType2[FormatType2["NewLine"] = 8] = "NewLine";
  return FormatType2;
})(FormatType || {});
function _renderFormattedText(element, treeNode, actionHandler, renderCodeSegments) {
  let child;
  if (treeNode.type === 2 /* Text */) {
    child = document.createTextNode(treeNode.content || "");
  } else if (treeNode.type === 3 /* Bold */) {
    child = document.createElement("b");
  } else if (treeNode.type === 4 /* Italics */) {
    child = document.createElement("i");
  } else if (treeNode.type === 7 /* Code */ && renderCodeSegments) {
    child = document.createElement("code");
  } else if (treeNode.type === 5 /* Action */ && actionHandler) {
    const a = document.createElement("a");
    actionHandler.disposables.add(DOM.addStandardDisposableListener(a, "click", (event) => {
      actionHandler.callback(String(treeNode.index), event);
    }));
    child = a;
  } else if (treeNode.type === 8 /* NewLine */) {
    child = document.createElement("br");
  } else if (treeNode.type === 1 /* Root */) {
    child = element;
  }
  if (child && element !== child) {
    element.appendChild(child);
  }
  if (child && Array.isArray(treeNode.children)) {
    treeNode.children.forEach((nodeChild) => {
      _renderFormattedText(child, nodeChild, actionHandler, renderCodeSegments);
    });
  }
}
__name(_renderFormattedText, "_renderFormattedText");
function parseFormattedText(content, parseCodeSegments) {
  const root = {
    type: 1 /* Root */,
    children: []
  };
  let actionViewItemIndex = 0;
  let current = root;
  const stack = [];
  const stream = new StringStream(content);
  while (!stream.eos()) {
    let next = stream.next();
    const isEscapedFormatType = next === "\\" && formatTagType(stream.peek(), parseCodeSegments) !== 0 /* Invalid */;
    if (isEscapedFormatType) {
      next = stream.next();
    }
    if (!isEscapedFormatType && isFormatTag(next, parseCodeSegments) && next === stream.peek()) {
      stream.advance();
      if (current.type === 2 /* Text */) {
        current = stack.pop();
      }
      const type = formatTagType(next, parseCodeSegments);
      if (current.type === type || current.type === 5 /* Action */ && type === 6 /* ActionClose */) {
        current = stack.pop();
      } else {
        const newCurrent = {
          type,
          children: []
        };
        if (type === 5 /* Action */) {
          newCurrent.index = actionViewItemIndex;
          actionViewItemIndex++;
        }
        current.children.push(newCurrent);
        stack.push(current);
        current = newCurrent;
      }
    } else if (next === "\n") {
      if (current.type === 2 /* Text */) {
        current = stack.pop();
      }
      current.children.push({
        type: 8 /* NewLine */
      });
    } else {
      if (current.type !== 2 /* Text */) {
        const textCurrent = {
          type: 2 /* Text */,
          content: next
        };
        current.children.push(textCurrent);
        stack.push(current);
        current = textCurrent;
      } else {
        current.content += next;
      }
    }
  }
  if (current.type === 2 /* Text */) {
    current = stack.pop();
  }
  if (stack.length) {
  }
  return root;
}
__name(parseFormattedText, "parseFormattedText");
function isFormatTag(char, supportCodeSegments) {
  return formatTagType(char, supportCodeSegments) !== 0 /* Invalid */;
}
__name(isFormatTag, "isFormatTag");
function formatTagType(char, supportCodeSegments) {
  switch (char) {
    case "*":
      return 3 /* Bold */;
    case "_":
      return 4 /* Italics */;
    case "[":
      return 5 /* Action */;
    case "]":
      return 6 /* ActionClose */;
    case "`":
      return supportCodeSegments ? 7 /* Code */ : 0 /* Invalid */;
    default:
      return 0 /* Invalid */;
  }
}
__name(formatTagType, "formatTagType");
export {
  createElement,
  renderFormattedText,
  renderText
};
//# sourceMappingURL=formattedTextRenderer.js.map
