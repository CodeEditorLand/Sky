#!/usr/bin/env node
const { execSync } = require("node:child_process");

const { join } = require("node:path");

// Set high memory limit
process.env.NODE_OPTIONS = "--max-old-space-size=32768"; // 32GB

console.log("[Build] Starting build with 32GB memory limit...");

// Get Sky directory
const skyDir = join(__dirname, "../..");

// Run copy first
console.log("[Build] Copying VSCode output...");

execSync("node ./Source/Function/CopyVSCode.js", {
	stdio: "inherit",
	cwd: skyDir,
});

// Run astro build using npx to ensure correct PATH
console.log("[Build] Running astro build...");

execSync("npx astro build", { stdio: "inherit", cwd: skyDir });

console.log("[Build] ✓ Build completed successfully");
