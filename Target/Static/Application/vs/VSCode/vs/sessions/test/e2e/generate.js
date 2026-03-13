var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var require_generate = __commonJS({
  "../../Dependency/Microsoft/Dependency/Editor/out/vs/sessions/test/e2e/generate.cjs"() {
    const fs = require("fs");
    const path = require("path");
    const cp = require("child_process");
    const {
      APP_ROOT,
      discoverScenarios,
      runPlaywrightCli,
      getSnapshot,
      startServer,
      waitForServer,
      commandsPathForScenario
    } = require("./common.cjs");
    const PORT = 9100 + Math.floor(Math.random() * 900);
    const BASE_URL = `http://localhost:${PORT}/?skip-sessions-welcome`;
    const SYSTEM_PROMPT = [
      "You are a test automation assistant. Given a snapshot of a web page's",
      "accessibility tree and a test step written in natural language, output the",
      "exact semantic commands needed to execute that step.",
      "",
      "Rules:",
      "- Output ONLY the commands, one per line. No explanation, no markdown.",
      "- Use SEMANTIC selectors with role and label, NOT element refs.",
      "  Examples:",
      '    click button "Send"',
      '    click textbox "Chat input"',
      '    click listitem "Today sessions section"',
      '    click tab "Changes - 3 files changed"',
      '    click treeitem "build.ts"',
      '- The format is: <action> <role> "<label>"',
      '- For typing text, use: type "the text here"',
      "- For pressing keys, use: press Enter (or other key name)",
      "- For assertions that something is visible, output: # ASSERT_VISIBLE: the text to check for",
      "- For assertions that a button is disabled, output: # ASSERT_DISABLED: the button label",
      "- For assertions that a button is enabled, output: # ASSERT_ENABLED: the button label",
      "- Icon characters (like codicons from the Unicode Private Use Area) appear in labels.",
      "  Strip them from your selectors \u2014 match by readable text only.",
      "- For labels with leading/trailing whitespace or icon chars, use only the readable text portion.",
      '- NEVER use element refs like e43, e155, etc. Always use role "label" selectors.',
      "- NEVER include dates, times, or timestamps in selectors \u2014 they change between runs.",
      "  Use only the stable portion of the label. For example, instead of:",
      '    click listitem "Background session explain the code (Completed), created 3/5/2026, 8:48:50 PM"',
      "  Use:",
      '    click listitem "explain the code"'
    ].join("\n");
    function askCopilot(step, snapshot) {
      const prompt = `Snapshot:
\`\`\`
${snapshot}
\`\`\`

Step: ${step}

Output the semantic commands:`;
      const result = cp.spawnSync("copilot", ["-p", `${SYSTEM_PROMPT}

${prompt}`, "--model", "claude-sonnet-4.6"], {
        cwd: APP_ROOT,
        stdio: ["ignore", "pipe", "pipe"],
        timeout: 6e4,
        env: { ...process.env }
      });
      const stdout = (result.stdout || "").toString().trim();
      const stderr = (result.stderr || "").toString().trim();
      if (result.status !== 0) {
        throw new Error(`Copilot CLI failed: ${stderr || stdout}`);
      }
      return stdout.split("\n").map((l) => l.trim()).filter((l) => l.length > 0);
    }
    __name(askCopilot, "askCopilot");
    function resolveSemanticCommand(cmd, snapshotText) {
      const match = cmd.match(/^(click|focus)\s+(\w+)\s+"([^"]+)"$/);
      if (!match) {
        return cmd;
      }
      const [, action, role, label] = match;
      const needle = label.replace(/[\uE000-\uF8FF]/g, "").trim().toLowerCase();
      for (const line of snapshotText.split("\n")) {
        const refMatch = line.match(/\[ref=(e\d+)\]/);
        if (!refMatch) {
          continue;
        }
        if (!line.includes(role)) {
          continue;
        }
        const labelMatch = line.match(/"([^"]+)"/);
        if (!labelMatch) {
          continue;
        }
        const lineLabel = labelMatch[1].replace(/[\uE000-\uF8FF]/g, "").trim().toLowerCase();
        if (lineLabel.includes(needle) || needle.includes(lineLabel)) {
          return `${action} ${refMatch[1]}`;
        }
      }
      console.error(`    \u26A0 Could not resolve: ${cmd}`);
      return cmd;
    }
    __name(resolveSemanticCommand, "resolveSemanticCommand");
    function compileScenario(scenario) {
      console.log(`
\u25B6 Compiling: ${scenario.name}`);
      const compiledSteps = [];
      for (const [i, step] of scenario.steps.entries()) {
        console.log(`  step ${i + 1}: ${step}`);
        const snapshot = getSnapshot();
        if (!snapshot.stdout) {
          console.error(`    \u26A0 Could not get snapshot, skipping step`);
          compiledSteps.push({ description: step, commands: [], error: "Failed to get snapshot" });
          continue;
        }
        try {
          const commands = askCopilot(step, snapshot.stdout);
          console.log(`    \u2192 ${commands.join(" ; ")}`);
          compiledSteps.push({ description: step, commands });
          for (const cmd of commands) {
            if (cmd.startsWith("#")) {
              continue;
            }
            const resolved = resolveSemanticCommand(cmd, snapshot.stdout);
            if (resolved !== cmd) {
              console.log(`      [resolve] ${cmd} \u2192 ${resolved}`);
            }
            const result = runPlaywrightCli(resolved);
            if (!result.ok) {
              console.error(`    \u26A0 Command failed: ${resolved} \u2014 ${result.stderr}`);
            }
          }
          cp.spawnSync("sleep", ["1"]);
        } catch (err) {
          console.error(`    \u2717 ${err.message}`);
          compiledSteps.push({ description: step, commands: [], error: err.message });
        }
      }
      return {
        scenario: scenario.name,
        generatedAt: (/* @__PURE__ */ new Date()).toISOString(),
        steps: compiledSteps
      };
    }
    __name(compileScenario, "compileScenario");
    async function main() {
      const filter = process.argv[2] || "";
      let scenarios = discoverScenarios();
      if (filter) {
        scenarios = scenarios.filter(
          (s) => s.filePath.includes(filter) || s.name.toLowerCase().includes(filter.toLowerCase())
        );
      }
      if (scenarios.length === 0) {
        console.error("No scenarios found" + (filter ? ` matching "${filter}"` : ""));
        process.exit(1);
      }
      console.log(`Found ${scenarios.length} scenario(s) to compile`);
      console.log(`Starting sessions web server on port ${PORT}\u2026`);
      const server = startServer(PORT, { mock: true });
      await waitForServer(`http://localhost:${PORT}/`, 3e4);
      console.log("Server ready.");
      const openResult = runPlaywrightCli(["open", "--headed"]);
      if (!openResult.ok) {
        console.error("Failed to open browser:", openResult.stdout, openResult.stderr);
        cleanup(server);
        process.exit(1);
      }
      const gotoResult = runPlaywrightCli(["goto", BASE_URL]);
      if (!gotoResult.ok) {
        console.error("Failed to navigate:", gotoResult.stdout, gotoResult.stderr);
        cleanup(server);
        process.exit(1);
      }
      cp.spawnSync("sleep", ["5"]);
      for (const scenario of scenarios) {
        runPlaywrightCli(["press", "Escape"]);
        runPlaywrightCli(["goto", BASE_URL]);
        cp.spawnSync("sleep", ["3"]);
        const compiled = compileScenario(scenario);
        const outPath = commandsPathForScenario(scenario.filePath);
        fs.mkdirSync(path.dirname(outPath), { recursive: true });
        fs.writeFileSync(outPath, JSON.stringify(compiled, null, "	") + "\n");
        console.log(`  \u2713 Saved: ${outPath}`);
      }
      cleanup(server);
      console.log("\nDone.");
    }
    __name(main, "main");
    function cleanup(server) {
      runPlaywrightCli("close");
      server.kill("SIGTERM");
    }
    __name(cleanup, "cleanup");
    main();
  }
});
export default require_generate();
//# sourceMappingURL=generate.js.map
