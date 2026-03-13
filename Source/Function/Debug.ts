// Re-export On from Shared
export { On } from "./Shared";

// Path utilities
import { join } from "node:path";

// Compute paths based on current working directory (Sky package root when building)
const cwd = process.cwd();

// Relative path from Sky package root to workspace root node_modules
// Sky is at Element/Sky, workspace root is Land/
const VSCodeOutputRelative = "../../node_modules/@codeeditorland/output/Target/Microsoft/VSCode";
const VSCodeOutput = join(cwd, VSCodeOutputRelative);
const VSCodeVS = join(VSCodeOutput, "vs");

// Ensure forward slashes for glob patterns
const toGlob = (p: string) => p.split(/\\/).join("/");

// Host configuration
// Used for site URL and dev server host
export const Host =
	process.env["HOST"] ?? (process.env["NODE_ENV"] === "development" ? "http://localhost:9999" : undefined);

// Link: Modules to exclude from Vite optimization
// Used in optimizeDeps.exclude
export const Link = [
	"@codeeditorland/output",
	"@codeeditorland/output/vs",
	"monaco-editor",
];

// External: Modules to mark as external in Rollup (do not bundle)
// Used in rollupOptions.external
// These are VSCode telemetry dependencies that shouldn't be bundled
export const External = [
	"@codeeditorland/output",
	"monaco-editor",
	"@microsoft/1ds-post-js",
	"@microsoft/1ds-core-js",
	"@microsoft/1ds-signalr-js",
];

// Static: Configuration for vite-plugin-static-copy
// Copy public/static assets to the build output
// Note: Use `src` and `dest`, not `from` and `to`
export const Static = [
	{
		src: toGlob(join(cwd, "Public")),
		dest: ".",
		options: {},
	},
	{
		src: toGlob(join(cwd, VSCodeOutputRelative)),
		dest: "Static/Application/vs",
		options: {},
	},
];

// Validate that the expected VSCode files exist
export async function validateVSCodeOutput(): Promise<boolean> {
	try {
		const fs = await import("node:fs");
		const path = await import("node:path");

		// Check critical paths (use absolute paths)
		const workbenchPath = path.join(
			VSCodeVS,
			"code",
			"browser",
			"workbench",
			"workbench.js",
		);

		const basePath = path.join(VSCodeVS, "base", "browser", "browser.js");

		if (!fs.existsSync(workbenchPath)) {
			console.error(
				`[Sky] Missing VSCode workbench file: ${workbenchPath}`,
			);
			return false;
		}

		if (!fs.existsSync(basePath)) {
			console.error(`[Sky] Missing VSCode base file: ${basePath}`);
			return false;
		}

		return true;
	} catch (error) {
		console.error("[Sky] Error validating VSCode output:", error);
		return false;
	}
}