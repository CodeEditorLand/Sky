/**
 * Build Utility: VSCode Output Copy
 *
 * This module ensures that VSCode compiled output is properly copied to
 * the package output directory for correct module resolution during build.
 *
 * The VSCode workbench has complex relative imports that require the full
 * vs/ directory structure to be present at the root of the package.
 */

import { cp, mkdir, readFile, rm } from "node:fs/promises";
import { dirname, join } from "node:path";
import process from "node:process";

/**
 * Copy VSCode compiled output to the expected location in the package.
 *
 * This should be called during the build process before Vite/Rollup starts.
 * It ensures that:
 * - node_modules/@codeeditorland/output/Target/Microsoft/VSCode/vs/ exists
 * - All VSCode workbench files are present with correct relative paths
 *
 * Sources (in order of preference):
 * 1. element/Output/Target/Microsoft/VSCode/ (from Element build)
 * 2. Dependency/Microsoft/Dependency/Editor/out/ (from VSCode build)
 *
 * Destination:
 *   node_modules/@codeeditorland/output/Target/Microsoft/VSCode/
 *
 * Note: This copies the entire vs/ directory structure to preserve
 *   relative import paths used by VSCode modules.
 */
export async function copyVSCodeOutput(): Promise<void> {
	const VSCodeOutput =
		"node_modules/@codeeditorland/output/Target/Microsoft/VSCode";

	// Ensure destination directory exists
	await mkdir(VSCodeOutput, { recursive: true });

	// Determine source location (prefer Element/Output, fallback to Dependency)
	const sourceCandidates = [
		"Element/Output/Target/Microsoft/VSCode",
		"Dependency/Microsoft/Dependency/Editor/out",
	];

	let sourcePath: string | null = null;
	for (const candidate of sourceCandidates) {
		try {
			await import("node:fs").then((fs) => {
				if (fs.existsSync(candidate)) {
					sourcePath = candidate;
					console.log(`[BuildVSCode] Found source at: ${candidate}`);
					return true;
				}
			});
		} catch {
			// ignore and try next
		}
	}

	if (!sourcePath) {
		console.warn("[BuildVSCode] WARNING: No VSCode output found!");
		console.warn(
			"[BuildVSCode] The VSCode workbench may not be available. Building anyway...",
		);
		return;
	}

	// Clean existing destination (but keep parent directory)
	try {
		await rm(VSCodeOutput, { recursive: true, force: true });
		await mkdir(VSCodeOutput, { recursive: true });
	} catch (error) {
		console.warn(
			"[BuildVSCode] Warning: Could not clean destination:",
			error,
		);
	}

	// Copy source to destination
	console.log(`[BuildVSCode] Copying from ${sourcePath} to ${VSCodeOutput}`);

	try {
		await cp(sourcePath, VSCodeOutput, { recursive: true });
		console.log("[BuildVSCode] ✓ VSCode output copied successfully");
	} catch (error) {
		console.error("[BuildVSCode] ✗ Failed to copy VSCode output:", error);
		throw error;
	}

	// Verify the copy
	await verifyVSCodeOutput(VSCodeOutput);
}

/**
 * Verify that the VSCode output has the expected files.
 */
async function verifyVSCodeOutput(vscodePath: string): Promise<void> {
	const fs = await import("node:fs");

	const requiredFiles = [
		"vs/code/browser/workbench/workbench.js",
		"vs/base/browser/browser.js",
		"vs/workbench/workbench.web.main.js",
		"vs/amdX.js",
	];

	for (const file of requiredFiles) {
		const fullPath = join(vscodePath, file);
		if (!fs.existsSync(fullPath)) {
			console.warn(
				`[BuildVSCode] WARNING: Missing required file: ${file}`,
			);
		} else {
			console.log(`[BuildVSCode] ✓ Found: ${file}`);
		}
	}
}

/**
 * Main entry point for standalone execution.
 */
if (import.meta.url === `file://${process.argv[1]}`) {
	copyVSCodeOutput().catch((error) => {
		console.error("[BuildVSCode] Build failed:", error);
		process.exit(1);
	});
}
