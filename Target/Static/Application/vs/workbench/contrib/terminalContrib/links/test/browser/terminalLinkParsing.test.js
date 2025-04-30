import { deepStrictEqual, ok, strictEqual } from "assert";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../../../base/test/common/utils.js";
import { detectLinks, detectLinkSuffixes, getLinkSuffix, removeLinkQueryString, removeLinkSuffix } from "../../browser/terminalLinkParsing.js";
const operatingSystems = [
  3,
  2,
  1
  /* OperatingSystem.Windows */
];
const osTestPath = {
  [
    3
    /* OperatingSystem.Linux */
  ]: "/test/path/linux",
  [
    2
    /* OperatingSystem.Macintosh */
  ]: "/test/path/macintosh",
  [
    1
    /* OperatingSystem.Windows */
  ]: "C:\\test\\path\\windows"
};
const osLabel = {
  [
    3
    /* OperatingSystem.Linux */
  ]: "[Linux]",
  [
    2
    /* OperatingSystem.Macintosh */
  ]: "[macOS]",
  [
    1
    /* OperatingSystem.Windows */
  ]: "[Windows]"
};
const testRow = 339;
const testCol = 12;
const testRowEnd = 341;
const testColEnd = 789;
const testLinks = [
  // Simple
  { link: "foo", prefix: void 0, suffix: void 0, hasRow: false, hasCol: false },
  { link: "foo:339", prefix: void 0, suffix: ":339", hasRow: true, hasCol: false },
  { link: "foo:339:12", prefix: void 0, suffix: ":339:12", hasRow: true, hasCol: true },
  { link: "foo:339:12-789", prefix: void 0, suffix: ":339:12-789", hasRow: true, hasCol: true, hasRowEnd: false, hasColEnd: true },
  { link: "foo:339.12", prefix: void 0, suffix: ":339.12", hasRow: true, hasCol: true },
  { link: "foo:339.12-789", prefix: void 0, suffix: ":339.12-789", hasRow: true, hasCol: true, hasRowEnd: false, hasColEnd: true },
  { link: "foo:339.12-341.789", prefix: void 0, suffix: ":339.12-341.789", hasRow: true, hasCol: true, hasRowEnd: true, hasColEnd: true },
  { link: "foo#339", prefix: void 0, suffix: "#339", hasRow: true, hasCol: false },
  { link: "foo#339:12", prefix: void 0, suffix: "#339:12", hasRow: true, hasCol: true },
  { link: "foo#339:12-789", prefix: void 0, suffix: "#339:12-789", hasRow: true, hasCol: true, hasRowEnd: false, hasColEnd: true },
  { link: "foo#339.12", prefix: void 0, suffix: "#339.12", hasRow: true, hasCol: true },
  { link: "foo#339.12-789", prefix: void 0, suffix: "#339.12-789", hasRow: true, hasCol: true, hasRowEnd: false, hasColEnd: true },
  { link: "foo#339.12-341.789", prefix: void 0, suffix: "#339.12-341.789", hasRow: true, hasCol: true, hasRowEnd: true, hasColEnd: true },
  { link: "foo 339", prefix: void 0, suffix: " 339", hasRow: true, hasCol: false },
  { link: "foo 339:12", prefix: void 0, suffix: " 339:12", hasRow: true, hasCol: true },
  { link: "foo 339:12-789", prefix: void 0, suffix: " 339:12-789", hasRow: true, hasCol: true, hasRowEnd: false, hasColEnd: true },
  { link: "foo 339.12", prefix: void 0, suffix: " 339.12", hasRow: true, hasCol: true },
  { link: "foo 339.12-789", prefix: void 0, suffix: " 339.12-789", hasRow: true, hasCol: true, hasRowEnd: false, hasColEnd: true },
  { link: "foo 339.12-341.789", prefix: void 0, suffix: " 339.12-341.789", hasRow: true, hasCol: true, hasRowEnd: true, hasColEnd: true },
  { link: "foo, 339", prefix: void 0, suffix: ", 339", hasRow: true, hasCol: false },
  // Double quotes
  { link: '"foo",339', prefix: '"', suffix: '",339', hasRow: true, hasCol: false },
  { link: '"foo",339:12', prefix: '"', suffix: '",339:12', hasRow: true, hasCol: true },
  { link: '"foo",339.12', prefix: '"', suffix: '",339.12', hasRow: true, hasCol: true },
  { link: '"foo", line 339', prefix: '"', suffix: '", line 339', hasRow: true, hasCol: false },
  { link: '"foo", line 339, col 12', prefix: '"', suffix: '", line 339, col 12', hasRow: true, hasCol: true },
  { link: '"foo", line 339, column 12', prefix: '"', suffix: '", line 339, column 12', hasRow: true, hasCol: true },
  { link: '"foo":line 339', prefix: '"', suffix: '":line 339', hasRow: true, hasCol: false },
  { link: '"foo":line 339, col 12', prefix: '"', suffix: '":line 339, col 12', hasRow: true, hasCol: true },
  { link: '"foo":line 339, column 12', prefix: '"', suffix: '":line 339, column 12', hasRow: true, hasCol: true },
  { link: '"foo": line 339', prefix: '"', suffix: '": line 339', hasRow: true, hasCol: false },
  { link: '"foo": line 339, col 12', prefix: '"', suffix: '": line 339, col 12', hasRow: true, hasCol: true },
  { link: '"foo": line 339, column 12', prefix: '"', suffix: '": line 339, column 12', hasRow: true, hasCol: true },
  { link: '"foo" on line 339', prefix: '"', suffix: '" on line 339', hasRow: true, hasCol: false },
  { link: '"foo" on line 339, col 12', prefix: '"', suffix: '" on line 339, col 12', hasRow: true, hasCol: true },
  { link: '"foo" on line 339, column 12', prefix: '"', suffix: '" on line 339, column 12', hasRow: true, hasCol: true },
  { link: '"foo" line 339', prefix: '"', suffix: '" line 339', hasRow: true, hasCol: false },
  { link: '"foo" line 339 column 12', prefix: '"', suffix: '" line 339 column 12', hasRow: true, hasCol: true },
  // Single quotes
  { link: "'foo',339", prefix: "'", suffix: "',339", hasRow: true, hasCol: false },
  { link: "'foo',339:12", prefix: "'", suffix: "',339:12", hasRow: true, hasCol: true },
  { link: "'foo',339.12", prefix: "'", suffix: "',339.12", hasRow: true, hasCol: true },
  { link: "'foo', line 339", prefix: "'", suffix: "', line 339", hasRow: true, hasCol: false },
  { link: "'foo', line 339, col 12", prefix: "'", suffix: "', line 339, col 12", hasRow: true, hasCol: true },
  { link: "'foo', line 339, column 12", prefix: "'", suffix: "', line 339, column 12", hasRow: true, hasCol: true },
  { link: "'foo':line 339", prefix: "'", suffix: "':line 339", hasRow: true, hasCol: false },
  { link: "'foo':line 339, col 12", prefix: "'", suffix: "':line 339, col 12", hasRow: true, hasCol: true },
  { link: "'foo':line 339, column 12", prefix: "'", suffix: "':line 339, column 12", hasRow: true, hasCol: true },
  { link: "'foo': line 339", prefix: "'", suffix: "': line 339", hasRow: true, hasCol: false },
  { link: "'foo': line 339, col 12", prefix: "'", suffix: "': line 339, col 12", hasRow: true, hasCol: true },
  { link: "'foo': line 339, column 12", prefix: "'", suffix: "': line 339, column 12", hasRow: true, hasCol: true },
  { link: "'foo' on line 339", prefix: "'", suffix: "' on line 339", hasRow: true, hasCol: false },
  { link: "'foo' on line 339, col 12", prefix: "'", suffix: "' on line 339, col 12", hasRow: true, hasCol: true },
  { link: "'foo' on line 339, column 12", prefix: "'", suffix: "' on line 339, column 12", hasRow: true, hasCol: true },
  { link: "'foo' line 339", prefix: "'", suffix: "' line 339", hasRow: true, hasCol: false },
  { link: "'foo' line 339 column 12", prefix: "'", suffix: "' line 339 column 12", hasRow: true, hasCol: true },
  // No quotes
  { link: "foo, line 339", prefix: void 0, suffix: ", line 339", hasRow: true, hasCol: false },
  { link: "foo, line 339, col 12", prefix: void 0, suffix: ", line 339, col 12", hasRow: true, hasCol: true },
  { link: "foo, line 339, column 12", prefix: void 0, suffix: ", line 339, column 12", hasRow: true, hasCol: true },
  { link: "foo:line 339", prefix: void 0, suffix: ":line 339", hasRow: true, hasCol: false },
  { link: "foo:line 339, col 12", prefix: void 0, suffix: ":line 339, col 12", hasRow: true, hasCol: true },
  { link: "foo:line 339, column 12", prefix: void 0, suffix: ":line 339, column 12", hasRow: true, hasCol: true },
  { link: "foo: line 339", prefix: void 0, suffix: ": line 339", hasRow: true, hasCol: false },
  { link: "foo: line 339, col 12", prefix: void 0, suffix: ": line 339, col 12", hasRow: true, hasCol: true },
  { link: "foo: line 339, column 12", prefix: void 0, suffix: ": line 339, column 12", hasRow: true, hasCol: true },
  { link: "foo on line 339", prefix: void 0, suffix: " on line 339", hasRow: true, hasCol: false },
  { link: "foo on line 339, col 12", prefix: void 0, suffix: " on line 339, col 12", hasRow: true, hasCol: true },
  { link: "foo on line 339, column 12", prefix: void 0, suffix: " on line 339, column 12", hasRow: true, hasCol: true },
  { link: "foo line 339", prefix: void 0, suffix: " line 339", hasRow: true, hasCol: false },
  { link: "foo line 339 column 12", prefix: void 0, suffix: " line 339 column 12", hasRow: true, hasCol: true },
  // Parentheses
  { link: "foo(339)", prefix: void 0, suffix: "(339)", hasRow: true, hasCol: false },
  { link: "foo(339,12)", prefix: void 0, suffix: "(339,12)", hasRow: true, hasCol: true },
  { link: "foo(339, 12)", prefix: void 0, suffix: "(339, 12)", hasRow: true, hasCol: true },
  { link: "foo (339)", prefix: void 0, suffix: " (339)", hasRow: true, hasCol: false },
  { link: "foo (339,12)", prefix: void 0, suffix: " (339,12)", hasRow: true, hasCol: true },
  { link: "foo (339, 12)", prefix: void 0, suffix: " (339, 12)", hasRow: true, hasCol: true },
  { link: "foo: (339)", prefix: void 0, suffix: ": (339)", hasRow: true, hasCol: false },
  { link: "foo: (339,12)", prefix: void 0, suffix: ": (339,12)", hasRow: true, hasCol: true },
  { link: "foo: (339, 12)", prefix: void 0, suffix: ": (339, 12)", hasRow: true, hasCol: true },
  { link: "foo(339:12)", prefix: void 0, suffix: "(339:12)", hasRow: true, hasCol: true },
  { link: "foo (339:12)", prefix: void 0, suffix: " (339:12)", hasRow: true, hasCol: true },
  // Square brackets
  { link: "foo[339]", prefix: void 0, suffix: "[339]", hasRow: true, hasCol: false },
  { link: "foo[339,12]", prefix: void 0, suffix: "[339,12]", hasRow: true, hasCol: true },
  { link: "foo[339, 12]", prefix: void 0, suffix: "[339, 12]", hasRow: true, hasCol: true },
  { link: "foo [339]", prefix: void 0, suffix: " [339]", hasRow: true, hasCol: false },
  { link: "foo [339,12]", prefix: void 0, suffix: " [339,12]", hasRow: true, hasCol: true },
  { link: "foo [339, 12]", prefix: void 0, suffix: " [339, 12]", hasRow: true, hasCol: true },
  { link: "foo: [339]", prefix: void 0, suffix: ": [339]", hasRow: true, hasCol: false },
  { link: "foo: [339,12]", prefix: void 0, suffix: ": [339,12]", hasRow: true, hasCol: true },
  { link: "foo: [339, 12]", prefix: void 0, suffix: ": [339, 12]", hasRow: true, hasCol: true },
  { link: "foo[339:12]", prefix: void 0, suffix: "[339:12]", hasRow: true, hasCol: true },
  { link: "foo [339:12]", prefix: void 0, suffix: " [339:12]", hasRow: true, hasCol: true },
  // OCaml-style
  { link: '"foo", line 339, character 12', prefix: '"', suffix: '", line 339, character 12', hasRow: true, hasCol: true },
  { link: '"foo", line 339, characters 12-789', prefix: '"', suffix: '", line 339, characters 12-789', hasRow: true, hasCol: true, hasColEnd: true },
  { link: '"foo", lines 339-341', prefix: '"', suffix: '", lines 339-341', hasRow: true, hasCol: false, hasRowEnd: true },
  { link: '"foo", lines 339-341, characters 12-789', prefix: '"', suffix: '", lines 339-341, characters 12-789', hasRow: true, hasCol: true, hasRowEnd: true, hasColEnd: true },
  // Non-breaking space
  { link: "foo\xA0339:12", prefix: void 0, suffix: "\xA0339:12", hasRow: true, hasCol: true },
  { link: '"foo" on line 339,\xA0column 12', prefix: '"', suffix: '" on line 339,\xA0column 12', hasRow: true, hasCol: true },
  { link: "'foo' on line\xA0339, column 12", prefix: "'", suffix: "' on line\xA0339, column 12", hasRow: true, hasCol: true },
  { link: "foo (339,\xA012)", prefix: void 0, suffix: " (339,\xA012)", hasRow: true, hasCol: true },
  { link: "foo\xA0[339, 12]", prefix: void 0, suffix: "\xA0[339, 12]", hasRow: true, hasCol: true }
];
const testLinksWithSuffix = testLinks.filter((e) => !!e.suffix);
suite("TerminalLinkParsing", () => {
  ensureNoDisposablesAreLeakedInTestSuite();
  suite("removeLinkSuffix", () => {
    for (const testLink of testLinks) {
      test("`" + testLink.link + "`", () => {
        deepStrictEqual(removeLinkSuffix(testLink.link), testLink.suffix === void 0 ? testLink.link : testLink.link.replace(testLink.suffix, ""));
      });
    }
  });
  suite("getLinkSuffix", () => {
    for (const testLink of testLinks) {
      test("`" + testLink.link + "`", () => {
        deepStrictEqual(getLinkSuffix(testLink.link), testLink.suffix === void 0 ? null : {
          row: testLink.hasRow ? testRow : void 0,
          col: testLink.hasCol ? testCol : void 0,
          rowEnd: testLink.hasRowEnd ? testRowEnd : void 0,
          colEnd: testLink.hasColEnd ? testColEnd : void 0,
          suffix: {
            index: testLink.link.length - testLink.suffix.length,
            text: testLink.suffix
          }
        });
      });
    }
  });
  suite("detectLinkSuffixes", () => {
    for (const testLink of testLinks) {
      test("`" + testLink.link + "`", () => {
        deepStrictEqual(detectLinkSuffixes(testLink.link), testLink.suffix === void 0 ? [] : [{
          row: testLink.hasRow ? testRow : void 0,
          col: testLink.hasCol ? testCol : void 0,
          rowEnd: testLink.hasRowEnd ? testRowEnd : void 0,
          colEnd: testLink.hasColEnd ? testColEnd : void 0,
          suffix: {
            index: testLink.link.length - testLink.suffix.length,
            text: testLink.suffix
          }
        }]);
      });
    }
    test("foo(1, 2) bar[3, 4] baz on line 5", () => {
      deepStrictEqual(detectLinkSuffixes("foo(1, 2) bar[3, 4] baz on line 5"), [
        {
          col: 2,
          row: 1,
          rowEnd: void 0,
          colEnd: void 0,
          suffix: {
            index: 3,
            text: "(1, 2)"
          }
        },
        {
          col: 4,
          row: 3,
          rowEnd: void 0,
          colEnd: void 0,
          suffix: {
            index: 13,
            text: "[3, 4]"
          }
        },
        {
          col: void 0,
          row: 5,
          rowEnd: void 0,
          colEnd: void 0,
          suffix: {
            index: 23,
            text: " on line 5"
          }
        }
      ]);
    });
  });
  suite("removeLinkQueryString", () => {
    test("should remove any query string from the link", () => {
      strictEqual(removeLinkQueryString("?a=b"), "");
      strictEqual(removeLinkQueryString("foo?a=b"), "foo");
      strictEqual(removeLinkQueryString("./foo?a=b"), "./foo");
      strictEqual(removeLinkQueryString("/foo/bar?a=b"), "/foo/bar");
      strictEqual(removeLinkQueryString("foo?a=b?"), "foo");
      strictEqual(removeLinkQueryString("foo?a=b&c=d"), "foo");
    });
    test("should respect ? in UNC paths", () => {
      strictEqual(removeLinkQueryString("\\\\?\\foo?a=b"), "\\\\?\\foo");
    });
  });
  suite("detectLinks", () => {
    test('foo(1, 2) bar[3, 4] "baz" on line 5', () => {
      deepStrictEqual(detectLinks(
        'foo(1, 2) bar[3, 4] "baz" on line 5',
        3
        /* OperatingSystem.Linux */
      ), [
        {
          path: {
            index: 0,
            text: "foo"
          },
          prefix: void 0,
          suffix: {
            col: 2,
            row: 1,
            rowEnd: void 0,
            colEnd: void 0,
            suffix: {
              index: 3,
              text: "(1, 2)"
            }
          }
        },
        {
          path: {
            index: 10,
            text: "bar"
          },
          prefix: void 0,
          suffix: {
            col: 4,
            row: 3,
            rowEnd: void 0,
            colEnd: void 0,
            suffix: {
              index: 13,
              text: "[3, 4]"
            }
          }
        },
        {
          path: {
            index: 21,
            text: "baz"
          },
          prefix: {
            index: 20,
            text: '"'
          },
          suffix: {
            col: void 0,
            row: 5,
            rowEnd: void 0,
            colEnd: void 0,
            suffix: {
              index: 24,
              text: '" on line 5'
            }
          }
        }
      ]);
    });
    test("should detect multiple links when opening brackets are in the text", () => {
      deepStrictEqual(detectLinks(
        "notlink[foo:45]",
        3
        /* OperatingSystem.Linux */
      ), [
        {
          path: {
            index: 0,
            text: "notlink[foo"
          },
          prefix: void 0,
          suffix: {
            col: void 0,
            row: 45,
            rowEnd: void 0,
            colEnd: void 0,
            suffix: {
              index: 11,
              text: ":45"
            }
          }
        },
        {
          path: {
            index: 8,
            text: "foo"
          },
          prefix: void 0,
          suffix: {
            col: void 0,
            row: 45,
            rowEnd: void 0,
            colEnd: void 0,
            suffix: {
              index: 11,
              text: ":45"
            }
          }
        }
      ]);
    });
    test("should extract the link prefix", () => {
      deepStrictEqual(detectLinks(
        '"foo", line 5, col 6',
        3
        /* OperatingSystem.Linux */
      ), [
        {
          path: {
            index: 1,
            text: "foo"
          },
          prefix: {
            index: 0,
            text: '"'
          },
          suffix: {
            row: 5,
            col: 6,
            rowEnd: void 0,
            colEnd: void 0,
            suffix: {
              index: 4,
              text: '", line 5, col 6'
            }
          }
        }
      ]);
    });
    test("should be smart about determining the link prefix when multiple prefix characters exist", () => {
      deepStrictEqual(detectLinks(
        `echo '"foo", line 5, col 6'`,
        3
        /* OperatingSystem.Linux */
      ), [
        {
          path: {
            index: 7,
            text: "foo"
          },
          prefix: {
            index: 6,
            text: '"'
          },
          suffix: {
            row: 5,
            col: 6,
            rowEnd: void 0,
            colEnd: void 0,
            suffix: {
              index: 10,
              text: '", line 5, col 6'
            }
          }
        }
      ], "The outer single quotes should be excluded from the link prefix and suffix");
    });
    test("should detect both suffix and non-suffix links on a single line", () => {
      deepStrictEqual(detectLinks(
        `PS C:\\Github\\microsoft\\vscode> echo '"foo", line 5, col 6'`,
        1
        /* OperatingSystem.Windows */
      ), [
        {
          path: {
            index: 3,
            text: "C:\\Github\\microsoft\\vscode"
          },
          prefix: void 0,
          suffix: void 0
        },
        {
          path: {
            index: 38,
            text: "foo"
          },
          prefix: {
            index: 37,
            text: '"'
          },
          suffix: {
            row: 5,
            col: 6,
            rowEnd: void 0,
            colEnd: void 0,
            suffix: {
              index: 41,
              text: '", line 5, col 6'
            }
          }
        }
      ]);
    });
    suite('"|"', () => {
      test("should exclude pipe characters from link paths", () => {
        deepStrictEqual(detectLinks(
          "|C:\\Github\\microsoft\\vscode|",
          1
          /* OperatingSystem.Windows */
        ), [
          {
            path: {
              index: 1,
              text: "C:\\Github\\microsoft\\vscode"
            },
            prefix: void 0,
            suffix: void 0
          }
        ]);
      });
      test("should exclude pipe characters from link paths with suffixes", () => {
        deepStrictEqual(detectLinks(
          "|C:\\Github\\microsoft\\vscode:400|",
          1
          /* OperatingSystem.Windows */
        ), [
          {
            path: {
              index: 1,
              text: "C:\\Github\\microsoft\\vscode"
            },
            prefix: void 0,
            suffix: {
              col: void 0,
              row: 400,
              rowEnd: void 0,
              colEnd: void 0,
              suffix: {
                index: 27,
                text: ":400"
              }
            }
          }
        ]);
      });
    });
    suite('"<>"', () => {
      for (const os of operatingSystems) {
        test(`should exclude bracket characters from link paths ${osLabel[os]}`, () => {
          deepStrictEqual(detectLinks(`<${osTestPath[os]}<`, os), [
            {
              path: {
                index: 1,
                text: osTestPath[os]
              },
              prefix: void 0,
              suffix: void 0
            }
          ]);
          deepStrictEqual(detectLinks(`>${osTestPath[os]}>`, os), [
            {
              path: {
                index: 1,
                text: osTestPath[os]
              },
              prefix: void 0,
              suffix: void 0
            }
          ]);
        });
        test(`should exclude bracket characters from link paths with suffixes ${osLabel[os]}`, () => {
          deepStrictEqual(detectLinks(`<${osTestPath[os]}:400<`, os), [
            {
              path: {
                index: 1,
                text: osTestPath[os]
              },
              prefix: void 0,
              suffix: {
                col: void 0,
                row: 400,
                rowEnd: void 0,
                colEnd: void 0,
                suffix: {
                  index: 1 + osTestPath[os].length,
                  text: ":400"
                }
              }
            }
          ]);
          deepStrictEqual(detectLinks(`>${osTestPath[os]}:400>`, os), [
            {
              path: {
                index: 1,
                text: osTestPath[os]
              },
              prefix: void 0,
              suffix: {
                col: void 0,
                row: 400,
                rowEnd: void 0,
                colEnd: void 0,
                suffix: {
                  index: 1 + osTestPath[os].length,
                  text: ":400"
                }
              }
            }
          ]);
        });
      }
    });
    suite("query strings", () => {
      for (const os of operatingSystems) {
        test(`should exclude query strings from link paths ${osLabel[os]}`, () => {
          deepStrictEqual(detectLinks(`${osTestPath[os]}?a=b`, os), [
            {
              path: {
                index: 0,
                text: osTestPath[os]
              },
              prefix: void 0,
              suffix: void 0
            }
          ]);
          deepStrictEqual(detectLinks(`${osTestPath[os]}?a=b&c=d`, os), [
            {
              path: {
                index: 0,
                text: osTestPath[os]
              },
              prefix: void 0,
              suffix: void 0
            }
          ]);
        });
        test("should not detect links starting with ? within query strings that contain posix-style paths (#204195)", () => {
          strictEqual(detectLinks(`http://foo.com/?bar=/a/b&baz=c`, os).some((e) => e.path.text.startsWith("?")), false);
        });
        test("should not detect links starting with ? within query strings that contain Windows-style paths (#204195)", () => {
          strictEqual(detectLinks(`http://foo.com/?bar=a:\\b&baz=c`, os).some((e) => e.path.text.startsWith("?")), false);
        });
      }
    });
    suite("should detect file names in git diffs", () => {
      test("--- a/foo/bar", () => {
        deepStrictEqual(detectLinks(
          "--- a/foo/bar",
          3
          /* OperatingSystem.Linux */
        ), [
          {
            path: {
              index: 6,
              text: "foo/bar"
            },
            prefix: void 0,
            suffix: void 0
          }
        ]);
      });
      test("+++ b/foo/bar", () => {
        deepStrictEqual(detectLinks(
          "+++ b/foo/bar",
          3
          /* OperatingSystem.Linux */
        ), [
          {
            path: {
              index: 6,
              text: "foo/bar"
            },
            prefix: void 0,
            suffix: void 0
          }
        ]);
      });
      test("diff --git a/foo/bar b/foo/baz", () => {
        deepStrictEqual(detectLinks(
          "diff --git a/foo/bar b/foo/baz",
          3
          /* OperatingSystem.Linux */
        ), [
          {
            path: {
              index: 13,
              text: "foo/bar"
            },
            prefix: void 0,
            suffix: void 0
          },
          {
            path: {
              index: 23,
              text: "foo/baz"
            },
            prefix: void 0,
            suffix: void 0
          }
        ]);
      });
    });
    suite("should detect 3 suffix links on a single line", () => {
      for (let i = 0; i < testLinksWithSuffix.length - 2; i++) {
        const link1 = testLinksWithSuffix[i];
        const link2 = testLinksWithSuffix[i + 1];
        const link3 = testLinksWithSuffix[i + 2];
        const line = ` ${link1.link} ${link2.link} ${link3.link} `;
        test("`" + line.replaceAll("\xA0", "<nbsp>") + "`", () => {
          strictEqual(detectLinks(
            line,
            3
            /* OperatingSystem.Linux */
          ).length, 3);
          ok(link1.suffix);
          ok(link2.suffix);
          ok(link3.suffix);
          const detectedLink1 = {
            prefix: link1.prefix ? {
              index: 1,
              text: link1.prefix
            } : void 0,
            path: {
              index: 1 + (link1.prefix?.length ?? 0),
              text: link1.link.replace(link1.suffix, "").replace(link1.prefix || "", "")
            },
            suffix: {
              row: link1.hasRow ? testRow : void 0,
              col: link1.hasCol ? testCol : void 0,
              rowEnd: link1.hasRowEnd ? testRowEnd : void 0,
              colEnd: link1.hasColEnd ? testColEnd : void 0,
              suffix: {
                index: 1 + (link1.link.length - link1.suffix.length),
                text: link1.suffix
              }
            }
          };
          const detectedLink2 = {
            prefix: link2.prefix ? {
              index: (detectedLink1.prefix?.index ?? detectedLink1.path.index) + link1.link.length + 1,
              text: link2.prefix
            } : void 0,
            path: {
              index: (detectedLink1.prefix?.index ?? detectedLink1.path.index) + link1.link.length + 1 + (link2.prefix ?? "").length,
              text: link2.link.replace(link2.suffix, "").replace(link2.prefix ?? "", "")
            },
            suffix: {
              row: link2.hasRow ? testRow : void 0,
              col: link2.hasCol ? testCol : void 0,
              rowEnd: link2.hasRowEnd ? testRowEnd : void 0,
              colEnd: link2.hasColEnd ? testColEnd : void 0,
              suffix: {
                index: (detectedLink1.prefix?.index ?? detectedLink1.path.index) + link1.link.length + 1 + (link2.link.length - link2.suffix.length),
                text: link2.suffix
              }
            }
          };
          const detectedLink3 = {
            prefix: link3.prefix ? {
              index: (detectedLink2.prefix?.index ?? detectedLink2.path.index) + link2.link.length + 1,
              text: link3.prefix
            } : void 0,
            path: {
              index: (detectedLink2.prefix?.index ?? detectedLink2.path.index) + link2.link.length + 1 + (link3.prefix ?? "").length,
              text: link3.link.replace(link3.suffix, "").replace(link3.prefix ?? "", "")
            },
            suffix: {
              row: link3.hasRow ? testRow : void 0,
              col: link3.hasCol ? testCol : void 0,
              rowEnd: link3.hasRowEnd ? testRowEnd : void 0,
              colEnd: link3.hasColEnd ? testColEnd : void 0,
              suffix: {
                index: (detectedLink2.prefix?.index ?? detectedLink2.path.index) + link2.link.length + 1 + (link3.link.length - link3.suffix.length),
                text: link3.suffix
              }
            }
          };
          deepStrictEqual(detectLinks(
            line,
            3
            /* OperatingSystem.Linux */
          ), [detectedLink1, detectedLink2, detectedLink3]);
        });
      }
    });
    suite("should ignore links with suffixes when the path itself is the empty string", () => {
      deepStrictEqual(detectLinks(
        '""",1',
        3
        /* OperatingSystem.Linux */
      ), []);
    });
  });
});
//# sourceMappingURL=terminalLinkParsing.test.js.map
