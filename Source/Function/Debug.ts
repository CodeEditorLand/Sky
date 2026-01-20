/*---------------------------------------------------------------------------------------------
 * Sky Build Debugger
 * --------------------------------------------------------------------------------------------
 * This script is designed to run during the build phase of the Sky webview (the client-side
 * of the Astro-based application).
 *
 * Its primary responsibilities are:
 * 1. To inspect, resolve, and normalize all environment variables required for the build.
 * 2. To provide a "Single Source of Truth" for build configuration constants (e.g., Path,
 *    Platform flags, Bundling modes).
 * 3. To output an EXTENSIVE, structured, and color-coded report to the build terminal,
 *    ensuring developers have full visibility into the build context (Env, Path,
 *    Flags) before the main Astro/Vite process takes over.
 *
 * Usage:
 * This file is imported by `astro.config.ts`. The act of importing it triggers the
 * console logging side-effects immediately.
 *--------------------------------------------------------------------------------------------*/

import type { ViteStaticCopyOptions } from "vite-plugin-static-copy";

// -----------------------------------------------------------------------------
// 1. Core Utilities & Exports
// -----------------------------------------------------------------------------
export const { readFile } = await import("node:fs/promises");

// -----------------------------------------------------------------------------
// 2. Environment Variable Resolution
// -----------------------------------------------------------------------------

export const Bundle = process.env["Bundle"] === "true";

export const Browser = process.env["Browser"] === "true";

export const Dependency = process.env["Dependency"] ?? "CodeEditorLand/Editor";

export const Tauri = typeof process.env["TAURI_ENV_ARCH"] !== "undefined";

export const Platform = ((Platform) => {
	switch (Platform?.toLowerCase()) {
		case "windows":
			return "Windows";

		case "darwin":
			return "Mac";

		case "linux":
			return "Linux";

		case "android":
			return "Android";

		case "ios":
			return "iOS";

		default:
			return "Windows";
	}
})(process.env["TAURI_ENV_PLATFORM"]);

/**
 * "On" represents the active development/debugging state.
 * True if NODE_ENV is 'development' OR TAURI_ENV_DEBUG is set.
 */
export const On =
	process.env["NODE_ENV"] === "development" ||
	process.env["TAURI_ENV_DEBUG"] === "true";

// -----------------------------------------------------------------------------
// 3. Constants & Path
// -----------------------------------------------------------------------------

export const Link = [
	"@codeeditorland/common",

	"@codeeditorland/output",

	// "@codeeditorland/wind",

	"@codeeditorland/worker",
];

export const External = ["@microsoft/1ds-core-js", "@microsoft/1ds-post-js"];

export const Host = process.env["TAURI_DEV_HOST"]
	? `https://${process.env["TAURI_DEV_HOST"]}`
	: On
		? "http://localhost"
		: Tauri
			? "https://tauri.localhost"
			: "https://editor.land";

export const ApplicationStatic = "Static/Application";

export const VSCodeOutput =
	"node_modules/@codeeditorland/output/Target/Microsoft/VSCode";

export const KeyboardLayouts =
	"vs/workbench/services/keybinding/browser/keyboardLayouts";

// -----------------------------------------------------------------------------
// 4. Static Asset Logic
// -----------------------------------------------------------------------------

export const Static: ViteStaticCopyOptions = {
	targets: [],

	structured: false,
};

// Logic to populate Static.targets based on the environment
if (Bundle) {
	switch (Platform) {
		case "Windows":
			Static.targets.push({
				src: `${VSCodeOutput}/${KeyboardLayouts}/*.win.js`,

				dest: `${ApplicationStatic}/${KeyboardLayouts}/`,
			});

			break;

		case "Mac":
			Static.targets.push({
				src: `${VSCodeOutput}/${KeyboardLayouts}/*.darwin.js`,

				dest: `${ApplicationStatic}/${KeyboardLayouts}/`,
			});

			break;

		case "Linux":
			Static.targets.push({
				src: `${VSCodeOutput}/${KeyboardLayouts}/*.linux.js`,

				dest: `${ApplicationStatic}/${KeyboardLayouts}/`,
			});

			break;

		default:
			break;
	}

	Static.targets.push(
		...[
			{
				src: `node_modules/@codeeditorland/output/Target/${Dependency}/${On ? "vs/" : ""}${On ? "nls.js" : "nls.messages.js"}`,

				dest: `${ApplicationStatic}/${On ? "vs/" : ""}`,
			},

			{
				src: `${VSCodeOutput}/${KeyboardLayouts}/_.contribution.js`,

				dest: `${ApplicationStatic}/${KeyboardLayouts}/`,
			},

			{
				src: "node_modules/@codeeditorland/worker/Target/Worker.js",

				dest: ".",
			},
		],
	);
} else {
	Static.targets.push(
		...[
			{
				src: `${VSCodeOutput}/*`,

				dest: ApplicationStatic,
			},

			{
				src: "node_modules/@codeeditorland/worker/Target/*",

				dest: ".",
			},
		],
	);
}

Browser
	? External.push(
			...[
				"@codeeditorland/output/vs/code/electron-browser/workbench/workbench.js",
			],
		)
	: {};

// -----------------------------------------------------------------------------
// 5. EXTENSIVE DEBUG LOGGING
// -----------------------------------------------------------------------------
// This self-executing block runs immediately on import to output the build context.
(() => {
	const Color = {
		Reset: "\x1b[0m",
		Bright: "\x1b[1m",
		Dim: "\x1b[2m",
		Cyan: "\x1b[36m",
		Green: "\x1b[32m",
		Yellow: "\x1b[33m",
		Red: "\x1b[31m",
		Magenta: "\x1b[35m",
		Blue: "\x1b[34m",
	};

	const Header = (Text: string) =>
		`\n${Color.Bright}${Color.Cyan}════ ${Text} ════${Color.Reset}`;

	const Output = (Key: string, Value: any) =>
		`  ${Color.Cyan}${Key.padEnd(18)}${Color.Reset}: ${Value}`;

	console.log(
		`\n${Color.Bright}${Color.Magenta}╔══════════════════════════════════════════════════════════════════════════════╗${Color.Reset}`,
	);

	console.log(
		`${Color.Bright}${Color.Magenta}║  SKY BUILD CONTEXT DEBUGGER                                                  ║${Color.Reset}`,
	);

	console.log(
		`${Color.Bright}${Color.Magenta}╚══════════════════════════════════════════════════════════════════════════════╝${Color.Reset}`,
	);

	console.log(Header("Resolved Flags"));

	console.log(
		Output("Bundle", Bundle ? Color.Green + "TRUE" : Color.Dim + "false"),
	);

	console.log(
		Output("Browser", Browser ? Color.Green + "TRUE" : Color.Dim + "false"),
	);

	console.log(
		Output("Tauri", Tauri ? Color.Green + "TRUE" : Color.Dim + "false"),
	);

	console.log(
		Output(
			"Debug Mode (On)",
			On ? Color.Red + "ACTIVE" : Color.Green + "Inactive (Production)",
		),
	);

	console.log(Output("Platform", `${Color.Yellow}${Platform}${Color.Reset}`));

	console.log(Output("Host", `${Color.Blue}${Host}${Color.Reset}`));

	console.log(Output("Dependency", Dependency));

	console.log(Header("Process Environment (Raw)"));

	console.log(
		Output("NODE_ENV", process.env["NODE_ENV"] || Color.Dim + "undefined"),
	);

	console.log(
		Output(
			"TAURI_ENV_ARCH",
			process.env["TAURI_ENV_ARCH"] || Color.Dim + "undefined",
		),
	);

	console.log(
		Output(
			"TAURI_ENV_PLATFORM",
			process.env["TAURI_ENV_PLATFORM"] || Color.Dim + "undefined",
		),
	);

	console.log(
		Output(
			"TAURI_ENV_DEBUG",
			process.env["TAURI_ENV_DEBUG"] || Color.Dim + "undefined",
		),
	);

	console.log(
		Output(
			"TAURI_DEV_HOST",
			process.env["TAURI_DEV_HOST"] || Color.Dim + "undefined",
		),
	);

	console.log(Header("Build Path"));

	console.log(Output("ApplicationStatic", ApplicationStatic));

	console.log(Output("VSCodeOutput", VSCodeOutput));

	console.log(Output("KeyboardLayouts", KeyboardLayouts));

	console.log(Header("Module Configuration"));

	console.log(
		`  ${Color.Cyan}External Modules${Color.Reset}  : [ ${External.map((e) => Color.Yellow + e + Color.Reset).join(", ")} ]`,
	);

	console.log(
		`  ${Color.Cyan}Linked Packages${Color.Reset}   : [ ${Link.map((l) => Color.Yellow + l + Color.Reset).join(", ")} ]`,
	);

	console.log(Header("Static Asset Copy Rules"));

	if (Static.targets.length === 0) {
		console.log(`  ${Color.Dim}(No static targets defined)${Color.Reset}`);
	} else {
		Static.targets.forEach((Target, i) => {
			// @ts-ignore
			const Source = Target.src;

			// @ts-ignore
			const Destination = Target.dest;

			console.log(
				`  ${Color.Dim}[${i + 1}]${Color.Reset} ${Color.Green}${Source}${Color.Reset}`,
			);

			console.log(`      ${Color.Dim}➜${Color.Reset} ${Destination}`);
		});
	}

	console.log(
		`\n${Color.Bright}${Color.Magenta}════════════════════════════════════════════════════════════════════════════════${Color.Reset}\n`,
	);
})();
