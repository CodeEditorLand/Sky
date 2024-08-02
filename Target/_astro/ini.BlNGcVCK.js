/*!-----------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Version: 0.51.0-dev-20240731(93a0a2df32926aa86f7e11bc71a43afaea581a09)
 * Released under the MIT license
 * https://github.com/microsoft/monaco-editor/blob/main/LICENSE.txt
 *-----------------------------------------------------------------------------*/ var e =
		{
			comments: { lineComment: "#" },
			brackets: [
				["{", "}"],
				["[", "]"],
				["(", ")"],
			],
			autoClosingPairs: [
				{ open: "{", close: "}" },
				{ open: "[", close: "]" },
				{ open: "(", close: ")" },
				{ open: '"', close: '"' },
				{ open: "'", close: "'" },
			],
			surroundingPairs: [
				{ open: "{", close: "}" },
				{ open: "[", close: "]" },
				{ open: "(", close: ")" },
				{ open: '"', close: '"' },
				{ open: "'", close: "'" },
			],
		},
	n = {
		defaultToken: "",
		tokenPostfix: ".ini",
		escapes:
			/\\(?:[abfnrtv\\"']|x[0-9A-Fa-f]{1,4}|u[0-9A-Fa-f]{4}|U[0-9A-Fa-f]{8})/,
		tokenizer: {
			root: [
				[/^\[[^\]]*\]/, "metatag"],
				[/(^\w+)(\s*)(\=)/, ["key", "", "delimiter"]],
				{ include: "@whitespace" },
				[/\d+/, "number"],
				[/"([^"\\]|\\.)*$/, "string.invalid"],
				[/'([^'\\]|\\.)*$/, "string.invalid"],
				[/"/, "string", '@string."'],
				[/'/, "string", "@string.'"],
			],
			whitespace: [
				[/[ \t\r\n]+/, ""],
				[/^\s*[#;].*$/, "comment"],
			],
			string: [
				[/[^\\"']+/, "string"],
				[/@escapes/, "string.escape"],
				[/\\./, "string.escape.invalid"],
				[
					/["']/,
					{
						cases: {
							"$#==$S2": { token: "string", next: "@pop" },
							"@default": "string",
						},
					},
				],
			],
		},
	};
export { e as conf, n as language };
//# sourceMappingURL=ini.BlNGcVCK.js.map
