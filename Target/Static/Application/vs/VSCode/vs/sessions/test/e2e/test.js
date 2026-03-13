var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var require_test = __commonJS({
  "../../Dependency/Microsoft/Dependency/Editor/out/vs/sessions/test/e2e/test.cjs"() {
    const fs = require("fs");
    const path = require("path");
    const cp = require("child_process");
    const {
      APP_ROOT,
      SCENARIOS_DIR,
      runPlaywrightCli,
      getSnapshot,
      startServer,
      waitForServer
    } = require("./common.cjs");
    const PORT = 9100 + Math.floor(Math.random() * 900);
    const BASE_URL = `http://localhost:${PORT}/?skip-sessions-welcome`;
    function discoverCommandFiles(filter) {
      const compiledDir = path.join(SCENARIOS_DIR, "generated");
      if (!fs.existsSync(compiledDir)) {
        return [];
      }
      return fs.readdirSync(compiledDir).filter((f) => f.endsWith(".commands.json")).filter((f) => !filter || f.includes(filter)).sort().map((f) => path.join(compiledDir, f));
    }
    __name(discoverCommandFiles, "discoverCommandFiles");
    function normalizeLabel(text) {
      return text.replace(/[\uE000-\uF8FF]/g, "").trim().toLowerCase();
    }
    __name(normalizeLabel, "normalizeLabel");
    function resolveSemanticCommand(cmd, snapshotText) {
      const match = cmd.match(/^(click|focus)\s+(\w+)\s+"([^"]+)"$/);
      if (!match) {
        return { resolved: cmd, ok: true };
      }
      const [, action, role, label] = match;
      const needle = normalizeLabel(label);
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
        const lineLabel = normalizeLabel(labelMatch[1]);
        if (lineLabel.includes(needle) || needle.includes(lineLabel)) {
          return { resolved: `${action} ${refMatch[1]}`, ok: true };
        }
      }
      return { resolved: cmd, ok: false, message: `Could not find ${role} "${label}" in snapshot` };
    }
    __name(resolveSemanticCommand, "resolveSemanticCommand");
    const ASSERT_TIMEOUT_MS = 1e4;
    const ASSERT_POLL_MS = 500;
    function pollAssertion(checkFn) {
      const deadline = Date.now() + ASSERT_TIMEOUT_MS;
      let lastResult = checkFn();
      while (!lastResult.ok && Date.now() < deadline) {
        cp.spawnSync("sleep", [(ASSERT_POLL_MS / 1e3).toString()]);
        lastResult = checkFn();
      }
      return lastResult;
    }
    __name(pollAssertion, "pollAssertion");
    function executeCommand(cmd) {
      if (cmd.startsWith("# ASSERT_VISIBLE:")) {
        const text = cmd.slice("# ASSERT_VISIBLE:".length).trim();
        return pollAssertion(() => {
          const snap = getSnapshot();
          if (!snap.stdout) {
            return { ok: false, message: "Failed to get snapshot for assertion" };
          }
          if (!snap.stdout.toLowerCase().includes(text.toLowerCase())) {
            return { ok: false, message: `Expected "${text}" to be visible in snapshot` };
          }
          return { ok: true };
        });
      }
      if (cmd.startsWith("# ASSERT_DISABLED:")) {
        const label = cmd.slice("# ASSERT_DISABLED:".length).trim();
        return pollAssertion(() => {
          const snap = getSnapshot();
          if (!snap.stdout) {
            return { ok: false, message: "Failed to get snapshot for assertion" };
          }
          const needle = normalizeLabel(label);
          const buttonLine = snap.stdout.split("\n").find(
            (l) => l.includes("button") && l.match(/"([^"]+)"/) && normalizeLabel(l.match(/"([^"]+)"/)[1]) === needle
          );
          if (!buttonLine) {
            return { ok: false, message: `Button "${label}" not found in snapshot` };
          }
          if (!buttonLine.includes("[disabled]")) {
            return { ok: false, message: `Expected button "${label}" to be disabled` };
          }
          return { ok: true };
        });
      }
      if (cmd.startsWith("# ASSERT_ENABLED:")) {
        const label = cmd.slice("# ASSERT_ENABLED:".length).trim();
        return pollAssertion(() => {
          const snap = getSnapshot();
          if (!snap.stdout) {
            return { ok: false, message: "Failed to get snapshot for assertion" };
          }
          const needle = normalizeLabel(label);
          const buttonLine = snap.stdout.split("\n").find(
            (l) => l.includes("button") && l.match(/"([^"]+)"/) && normalizeLabel(l.match(/"([^"]+)"/)[1]) === needle
          );
          if (!buttonLine) {
            return { ok: false, message: `Button "${label}" not found in snapshot` };
          }
          if (buttonLine.includes("[disabled]")) {
            return { ok: false, message: `Expected button "${label}" to be enabled` };
          }
          return { ok: true };
        });
      }
      if (cmd.startsWith("#")) {
        return { ok: true };
      }
      const semanticMatch = cmd.match(/^(click|focus)\s+\w+\s+"[^"]+"$/);
      if (semanticMatch) {
        return pollAssertion(() => {
          const snap = getSnapshot();
          if (!snap.stdout) {
            return { ok: false, message: "Failed to get snapshot for command resolution" };
          }
          const { resolved, ok, message } = resolveSemanticCommand(cmd, snap.stdout);
          if (!ok) {
            return { ok: false, message: message || `Could not resolve: ${cmd}` };
          }
          console.log(`    [resolve] ${cmd} \u2192 ${resolved}`);
          const result2 = runPlaywrightCli(resolved);
          if (!result2.ok) {
            return { ok: false, message: `playwright-cli ${resolved} failed:
${result2.stderr || result2.stdout}` };
          }
          return { ok: true };
        });
      }
      const result = runPlaywrightCli(cmd);
      if (!result.ok) {
        return { ok: false, message: `playwright-cli ${cmd} failed:
${result.stderr || result.stdout}` };
      }
      return { ok: true };
    }
    __name(executeCommand, "executeCommand");
    async function main() {
      const filter = process.argv[2] || "";
      const commandFiles = discoverCommandFiles(filter);
      if (commandFiles.length === 0) {
        console.error("No .commands.json files found" + (filter ? ` matching "${filter}"` : ""));
        console.error('Run "npm run generate" first to compile scenarios.');
        process.exit(1);
      }
      console.log(`Found ${commandFiles.length} compiled scenario(s)
`);
      console.log(`Starting sessions web server on port ${PORT}\u2026`);
      const server = startServer(PORT, { mock: true });
      await waitForServer(`http://localhost:${PORT}/`, 3e4);
      console.log("Server ready.\n");
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
      let totalPassed = 0;
      let totalFailed = 0;
      for (const filePath of commandFiles) {
        const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
        console.log(`\u25B6 ${data.scenario}`);
        runPlaywrightCli(["press", "Escape"]);
        runPlaywrightCli(["goto", BASE_URL]);
        cp.spawnSync("sleep", ["3"]);
        let scenarioPassed = true;
        for (const [i, step] of data.steps.entries()) {
          cp.spawnSync("sleep", ["1"]);
          const label = `  step ${i + 1}: ${step.description}`;
          if (step.error) {
            console.error(`  \u274C ${label}`);
            console.error(`     Compilation error: ${step.error}`);
            totalFailed++;
            scenarioPassed = false;
            continue;
          }
          let stepPassed = true;
          for (const cmd of step.commands) {
            const result = executeCommand(cmd);
            if (!result.ok) {
              console.error(`  \u274C ${label}`);
              console.error(`     ${result.message}`);
              const basename = path.basename(filePath, ".commands.json");
              runPlaywrightCli(`screenshot --filename=out/failure-${basename}-step${i + 1}.png`);
              totalFailed++;
              stepPassed = false;
              scenarioPassed = false;
              break;
            }
          }
          if (stepPassed) {
            console.log(`  \u2705 ${label}`);
            totalPassed++;
          }
        }
        console.log();
      }
      cleanup(server);
      console.log(`Results: ${totalPassed} passed, ${totalFailed} failed`);
      process.exit(totalFailed > 0 ? 1 : 0);
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
export default require_test();
//# sourceMappingURL=test.js.map
