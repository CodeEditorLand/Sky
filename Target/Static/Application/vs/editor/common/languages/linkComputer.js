var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { CharacterClassifier } from "../core/characterClassifier.js";
var State;
(function(State2) {
  State2[State2["Invalid"] = 0] = "Invalid";
  State2[State2["Start"] = 1] = "Start";
  State2[State2["H"] = 2] = "H";
  State2[State2["HT"] = 3] = "HT";
  State2[State2["HTT"] = 4] = "HTT";
  State2[State2["HTTP"] = 5] = "HTTP";
  State2[State2["F"] = 6] = "F";
  State2[State2["FI"] = 7] = "FI";
  State2[State2["FIL"] = 8] = "FIL";
  State2[State2["BeforeColon"] = 9] = "BeforeColon";
  State2[State2["AfterColon"] = 10] = "AfterColon";
  State2[State2["AlmostThere"] = 11] = "AlmostThere";
  State2[State2["End"] = 12] = "End";
  State2[State2["Accept"] = 13] = "Accept";
  State2[State2["LastKnownState"] = 14] = "LastKnownState";
})(State || (State = {}));
class Uint8Matrix {
  static {
    __name(this, "Uint8Matrix");
  }
  constructor(rows, cols, defaultValue) {
    const data = new Uint8Array(rows * cols);
    for (let i = 0, len = rows * cols; i < len; i++) {
      data[i] = defaultValue;
    }
    this._data = data;
    this.rows = rows;
    this.cols = cols;
  }
  get(row, col) {
    return this._data[row * this.cols + col];
  }
  set(row, col, value) {
    this._data[row * this.cols + col] = value;
  }
}
class StateMachine {
  static {
    __name(this, "StateMachine");
  }
  constructor(edges) {
    let maxCharCode = 0;
    let maxState = 0;
    for (let i = 0, len = edges.length; i < len; i++) {
      const [from, chCode, to] = edges[i];
      if (chCode > maxCharCode) {
        maxCharCode = chCode;
      }
      if (from > maxState) {
        maxState = from;
      }
      if (to > maxState) {
        maxState = to;
      }
    }
    maxCharCode++;
    maxState++;
    const states = new Uint8Matrix(
      maxState,
      maxCharCode,
      0
      /* State.Invalid */
    );
    for (let i = 0, len = edges.length; i < len; i++) {
      const [from, chCode, to] = edges[i];
      states.set(from, chCode, to);
    }
    this._states = states;
    this._maxCharCode = maxCharCode;
  }
  nextState(currentState, chCode) {
    if (chCode < 0 || chCode >= this._maxCharCode) {
      return 0;
    }
    return this._states.get(currentState, chCode);
  }
}
let _stateMachine = null;
function getStateMachine() {
  if (_stateMachine === null) {
    _stateMachine = new StateMachine([
      [
        1,
        104,
        2
        /* State.H */
      ],
      [
        1,
        72,
        2
        /* State.H */
      ],
      [
        1,
        102,
        6
        /* State.F */
      ],
      [
        1,
        70,
        6
        /* State.F */
      ],
      [
        2,
        116,
        3
        /* State.HT */
      ],
      [
        2,
        84,
        3
        /* State.HT */
      ],
      [
        3,
        116,
        4
        /* State.HTT */
      ],
      [
        3,
        84,
        4
        /* State.HTT */
      ],
      [
        4,
        112,
        5
        /* State.HTTP */
      ],
      [
        4,
        80,
        5
        /* State.HTTP */
      ],
      [
        5,
        115,
        9
        /* State.BeforeColon */
      ],
      [
        5,
        83,
        9
        /* State.BeforeColon */
      ],
      [
        5,
        58,
        10
        /* State.AfterColon */
      ],
      [
        6,
        105,
        7
        /* State.FI */
      ],
      [
        6,
        73,
        7
        /* State.FI */
      ],
      [
        7,
        108,
        8
        /* State.FIL */
      ],
      [
        7,
        76,
        8
        /* State.FIL */
      ],
      [
        8,
        101,
        9
        /* State.BeforeColon */
      ],
      [
        8,
        69,
        9
        /* State.BeforeColon */
      ],
      [
        9,
        58,
        10
        /* State.AfterColon */
      ],
      [
        10,
        47,
        11
        /* State.AlmostThere */
      ],
      [
        11,
        47,
        12
        /* State.End */
      ]
    ]);
  }
  return _stateMachine;
}
__name(getStateMachine, "getStateMachine");
var CharacterClass;
(function(CharacterClass2) {
  CharacterClass2[CharacterClass2["None"] = 0] = "None";
  CharacterClass2[CharacterClass2["ForceTermination"] = 1] = "ForceTermination";
  CharacterClass2[CharacterClass2["CannotEndIn"] = 2] = "CannotEndIn";
})(CharacterClass || (CharacterClass = {}));
let _classifier = null;
function getClassifier() {
  if (_classifier === null) {
    _classifier = new CharacterClassifier(
      0
      /* CharacterClass.None */
    );
    const FORCE_TERMINATION_CHARACTERS = ` 	<>'"\u3001\u3002\uFF61\uFF64\uFF0C\uFF0E\uFF1A\uFF1B\u2018\u3008\u300C\u300E\u3014\uFF08\uFF3B\uFF5B\uFF62\uFF63\uFF5D\uFF3D\uFF09\u3015\u300F\u300D\u3009\u2019\uFF40\uFF5E\u2026|`;
    for (let i = 0; i < FORCE_TERMINATION_CHARACTERS.length; i++) {
      _classifier.set(
        FORCE_TERMINATION_CHARACTERS.charCodeAt(i),
        1
        /* CharacterClass.ForceTermination */
      );
    }
    const CANNOT_END_WITH_CHARACTERS = ".,;:";
    for (let i = 0; i < CANNOT_END_WITH_CHARACTERS.length; i++) {
      _classifier.set(
        CANNOT_END_WITH_CHARACTERS.charCodeAt(i),
        2
        /* CharacterClass.CannotEndIn */
      );
    }
  }
  return _classifier;
}
__name(getClassifier, "getClassifier");
class LinkComputer {
  static {
    __name(this, "LinkComputer");
  }
  static _createLink(classifier, line, lineNumber, linkBeginIndex, linkEndIndex) {
    let lastIncludedCharIndex = linkEndIndex - 1;
    do {
      const chCode = line.charCodeAt(lastIncludedCharIndex);
      const chClass = classifier.get(chCode);
      if (chClass !== 2) {
        break;
      }
      lastIncludedCharIndex--;
    } while (lastIncludedCharIndex > linkBeginIndex);
    if (linkBeginIndex > 0) {
      const charCodeBeforeLink = line.charCodeAt(linkBeginIndex - 1);
      const lastCharCodeInLink = line.charCodeAt(lastIncludedCharIndex);
      if (charCodeBeforeLink === 40 && lastCharCodeInLink === 41 || charCodeBeforeLink === 91 && lastCharCodeInLink === 93 || charCodeBeforeLink === 123 && lastCharCodeInLink === 125) {
        lastIncludedCharIndex--;
      }
    }
    return {
      range: {
        startLineNumber: lineNumber,
        startColumn: linkBeginIndex + 1,
        endLineNumber: lineNumber,
        endColumn: lastIncludedCharIndex + 2
      },
      url: line.substring(linkBeginIndex, lastIncludedCharIndex + 1)
    };
  }
  static computeLinks(model, stateMachine = getStateMachine()) {
    const classifier = getClassifier();
    const result = [];
    for (let i = 1, lineCount = model.getLineCount(); i <= lineCount; i++) {
      const line = model.getLineContent(i);
      const len = line.length;
      let j = 0;
      let linkBeginIndex = 0;
      let linkBeginChCode = 0;
      let state = 1;
      let hasOpenParens = false;
      let hasOpenSquareBracket = false;
      let inSquareBrackets = false;
      let hasOpenCurlyBracket = false;
      while (j < len) {
        let resetStateMachine = false;
        const chCode = line.charCodeAt(j);
        if (state === 13) {
          let chClass;
          switch (chCode) {
            case 40:
              hasOpenParens = true;
              chClass = 0;
              break;
            case 41:
              chClass = hasOpenParens ? 0 : 1;
              break;
            case 91:
              inSquareBrackets = true;
              hasOpenSquareBracket = true;
              chClass = 0;
              break;
            case 93:
              inSquareBrackets = false;
              chClass = hasOpenSquareBracket ? 0 : 1;
              break;
            case 123:
              hasOpenCurlyBracket = true;
              chClass = 0;
              break;
            case 125:
              chClass = hasOpenCurlyBracket ? 0 : 1;
              break;
            // The following three rules make it that ' or " or ` are allowed inside links
            // only if the link is wrapped by some other quote character
            case 39:
            case 34:
            case 96:
              if (linkBeginChCode === chCode) {
                chClass = 1;
              } else if (linkBeginChCode === 39 || linkBeginChCode === 34 || linkBeginChCode === 96) {
                chClass = 0;
              } else {
                chClass = 1;
              }
              break;
            case 42:
              chClass = linkBeginChCode === 42 ? 1 : 0;
              break;
            case 32:
              chClass = inSquareBrackets ? 0 : 1;
              break;
            default:
              chClass = classifier.get(chCode);
          }
          if (chClass === 1) {
            result.push(LinkComputer._createLink(classifier, line, i, linkBeginIndex, j));
            resetStateMachine = true;
          }
        } else if (state === 12) {
          let chClass;
          if (chCode === 91) {
            hasOpenSquareBracket = true;
            chClass = 0;
          } else {
            chClass = classifier.get(chCode);
          }
          if (chClass === 1) {
            resetStateMachine = true;
          } else {
            state = 13;
          }
        } else {
          state = stateMachine.nextState(state, chCode);
          if (state === 0) {
            resetStateMachine = true;
          }
        }
        if (resetStateMachine) {
          state = 1;
          hasOpenParens = false;
          hasOpenSquareBracket = false;
          hasOpenCurlyBracket = false;
          linkBeginIndex = j + 1;
          linkBeginChCode = chCode;
        }
        j++;
      }
      if (state === 13) {
        result.push(LinkComputer._createLink(classifier, line, i, linkBeginIndex, len));
      }
    }
    return result;
  }
}
function computeLinks(model) {
  if (!model || typeof model.getLineCount !== "function" || typeof model.getLineContent !== "function") {
    return [];
  }
  return LinkComputer.computeLinks(model);
}
__name(computeLinks, "computeLinks");
export {
  LinkComputer,
  State,
  StateMachine,
  computeLinks
};
//# sourceMappingURL=linkComputer.js.map
