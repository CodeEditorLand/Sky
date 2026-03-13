#!/usr/bin/env node

/**
 * Prebuild Step: Copy VSCode Output
 *
 * This script copies the VSCode compiled output to the expected location
 * in the package before the build starts. It ensures that the full vs/
 * directory structure is available for Vite/Rollup to resolve modules.
 */

const fs = require('node:fs');
const { cp, rm, mkdir } = require('node:fs/promises');
const { join, basename } = require('node:path');
const { existsSync } = require('node:fs');

// Get project root (Land directory)
// __dirname = Element/Sky/Source/Function
const projectRoot = join(__dirname, '../../../../');

// Configuration
const VSCodeOutput = join(projectRoot, 'node_modules/@codeeditorland/output/Target/Microsoft/VSCode');

// Source candidates for VSCode compiled output
// Prefer the Output package's Target (built from src/ via Rest compiler)
// Fallback to standard VSCode out/ if needed
const sourceCandidates = [
	join(projectRoot, 'Element/Output/Target/Microsoft/VSCode'),
	// Removed prebuilt out/ to enforce source-based compilation
	// join(projectRoot, 'Dependency/Microsoft/Dependency/Editor/out'),
];

function isDirectory(p) {
	try {
		return fs.statSync(p).isDirectory();
	} catch {
		return false;
	}
}

function hasVSCodeContent(vsDir) {
	// Check for key VSCode files to confirm it has actual content
	// vsDir is already the path to the vs/ directory
	const markers = [
		'code/browser/workbench/workbench.js',
		'base/browser/browser.js',
		'workbench/workbench.web.main.js',
		'amdX.js',
	];
	for (const marker of markers) {
		if (!existsSync(join(vsDir, marker))) {
			return false;
		}
	}
	return true;
}

async function copyVSCode() {
	console.log('[CopyVSCode] Starting VSCode output copy...');
	console.log('[CopyVSCode] Project root:', projectRoot);

	// Check if destination already has valid content
	const destVsPath = join(VSCodeOutput, 'vs');
	if (existsSync(destVsPath) && hasVSCodeContent(destVsPath)) {
		console.log('[CopyVSCode] Destination already has valid VSCode content, skipping copy.');
		return;
	}

	// Find the source vs/ directory with actual content
	let sourceVsPath = null;

	for (const candidate of sourceCandidates) {
		if (!existsSync(candidate)) {
			console.log(`[CopyVSCode] Candidate does not exist: ${candidate}`);
			continue;
		}
		console.log(`[CopyVSCode] Found candidate: ${candidate}`);

		// Prefer the vs/ subdirectory inside candidate
		const vsPath = join(candidate, 'vs');
		if (existsSync(vsPath) && isDirectory(vsPath)) {
			console.log(`[CopyVSCode] Found vs subdirectory: ${vsPath}`);
			// Check if it has actual VSCode content
			if (hasVSCodeContent(vsPath)) {
				sourceVsPath = vsPath;
				console.log(`[CopyVSCode] ✓ vs subdirectory has content, using it`);
				break;
			} else {
				console.log(`[CopyVSCode] vs subdirectory exists but missing content, checking next candidate`);
			}
		} else if (basename(candidate) === 'vs' && isDirectory(candidate)) {
			console.log(`[CopyVSCode] Candidate is a vs directory`);
			if (hasVSCodeContent(candidate)) {
				sourceVsPath = candidate;
				console.log(`[CopyVSCode] ✓ candidate has content, using it`);
				break;
			} else {
				console.log(`[CopyVSCode] candidate exists but missing content, checking next candidate`);
			}
		} else {
			console.log(`[CopyVSCode] Candidate has no valid vs directory, skipping`);
		}
	}

	if (!sourceVsPath) {
		console.warn('[CopyVSCode] WARNING: No VSCode output source with valid content found!');
		console.warn('[CopyVSCode] Build may fail due to missing VSCode workbench files.');
		process.exit(0); // Don't fail - maybe already copied
	}

	// Ensure destination parent directory exists
	await mkdir(VSCodeOutput, { recursive: true });

	// Copy vs/ contents to destination vs/ directory
	console.log(`[CopyVSCode] Copying from ${sourceVsPath} to ${destVsPath}`);
	await cp(sourceVsPath, destVsPath, { recursive: true });
	console.log('[CopyVSCode] ✓ Copy completed');

	// Verify critical files
	console.log('[CopyVSCode] Verifying copy...');
	const required = [
		'code/browser/workbench/workbench.js',
		'base/browser/browser.js',
		'workbench/workbench.web.main.js',
		'amdX.js',
	];

	for (const file of required) {
		const fullPath = join(destVsPath, file);
		if (existsSync(fullPath)) {
			console.log(`[CopyVSCode] ✓ ${file}`);
		} else {
			console.warn(`[CopyVSCode] ✗ Missing: ${file}`);
		}
	}
}

copyVSCode().catch(err => {
	console.error('[CopyVSCode] ✗ Error:', err);
	process.exit(1);
});
