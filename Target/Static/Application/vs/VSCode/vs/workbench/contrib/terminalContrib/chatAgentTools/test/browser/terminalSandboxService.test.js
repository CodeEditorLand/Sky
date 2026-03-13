var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { strictEqual, ok } from "assert";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../../../base/test/common/utils.js";
import { workbenchInstantiationService } from "../../../../../test/browser/workbenchTestServices.js";
import { TerminalSandboxService } from "../../common/terminalSandboxService.js";
import { IConfigurationService } from "../../../../../../platform/configuration/common/configuration.js";
import { IFileService } from "../../../../../../platform/files/common/files.js";
import { IEnvironmentService } from "../../../../../../platform/environment/common/environment.js";
import { ILogService, NullLogService } from "../../../../../../platform/log/common/log.js";
import { IRemoteAgentService } from "../../../../../services/remote/common/remoteAgentService.js";
import { ITrustedDomainService } from "../../../../url/common/trustedDomainService.js";
import { URI } from "../../../../../../base/common/uri.js";
import { Emitter } from "../../../../../../base/common/event.js";
import { TestConfigurationService } from "../../../../../../platform/configuration/test/common/testConfigurationService.js";
suite("TerminalSandboxService - allowTrustedDomains", () => {
  const store = ensureNoDisposablesAreLeakedInTestSuite();
  let instantiationService;
  let configurationService;
  let trustedDomainService;
  let fileService;
  let createdFiles;
  class MockTrustedDomainService {
    static {
      __name(this, "MockTrustedDomainService");
    }
    constructor() {
      this._onDidChangeTrustedDomains = new Emitter();
      this.onDidChangeTrustedDomains = this._onDidChangeTrustedDomains.event;
      this.trustedDomains = [];
    }
    isValid(_resource) {
      return true;
    }
  }
  class MockFileService {
    static {
      __name(this, "MockFileService");
    }
    async createFile(uri, content) {
      const contentString = content.toString();
      createdFiles.set(uri.path, contentString);
      return {};
    }
  }
  class MockRemoteAgentService {
    static {
      __name(this, "MockRemoteAgentService");
    }
    async getEnvironment() {
      return {
        os: 3,
        tmpDir: URI.file("/tmp"),
        appRoot: URI.file("/app"),
        pid: 1234,
        connectionToken: "test-token",
        settingsPath: URI.file("/settings"),
        mcpResource: URI.file("/mcp"),
        logsPath: URI.file("/logs"),
        extensionHostLogsPath: URI.file("/ext-logs"),
        globalStorageHome: URI.file("/global"),
        workspaceStorageHome: URI.file("/workspace"),
        localHistoryHome: URI.file("/history"),
        userHome: URI.file("/home/user"),
        arch: "x64",
        marks: [],
        useHostProxy: false,
        profiles: {
          all: [],
          home: URI.file("/profiles")
        },
        isUnsupportedGlibc: false
      };
    }
  }
  setup(() => {
    createdFiles = /* @__PURE__ */ new Map();
    instantiationService = workbenchInstantiationService({}, store);
    configurationService = new TestConfigurationService();
    trustedDomainService = new MockTrustedDomainService();
    fileService = new MockFileService();
    configurationService.setUserConfiguration("chat.tools.terminal.sandbox.enabled", true);
    configurationService.setUserConfiguration("chat.tools.terminal.sandbox.network", {
      allowedDomains: [],
      deniedDomains: [],
      allowTrustedDomains: false
    });
    instantiationService.stub(IConfigurationService, configurationService);
    instantiationService.stub(IFileService, fileService);
    instantiationService.stub(IEnvironmentService, {
      _serviceBrand: void 0,
      tmpDir: URI.file("/tmp"),
      execPath: "/usr/bin/node"
    });
    instantiationService.stub(ILogService, new NullLogService());
    instantiationService.stub(IRemoteAgentService, new MockRemoteAgentService());
    instantiationService.stub(ITrustedDomainService, trustedDomainService);
  });
  test("should filter out sole wildcard (*) from trusted domains", async () => {
    configurationService.setUserConfiguration("chat.tools.terminal.sandbox.network", {
      allowedDomains: [],
      deniedDomains: [],
      allowTrustedDomains: true
    });
    trustedDomainService.trustedDomains = ["*"];
    const sandboxService = store.add(instantiationService.createInstance(TerminalSandboxService));
    const configPath = await sandboxService.getSandboxConfigPath();
    ok(configPath, "Config path should be defined");
    const configContent = createdFiles.get(configPath);
    ok(configContent, "Config file should be created");
    const config = JSON.parse(configContent);
    strictEqual(config.network.allowedDomains.length, 0, "Sole wildcard * should be filtered out");
  });
  test("should allow wildcards with domains like *.github.com", async () => {
    configurationService.setUserConfiguration("chat.tools.terminal.sandbox.network", {
      allowedDomains: [],
      deniedDomains: [],
      allowTrustedDomains: true
    });
    trustedDomainService.trustedDomains = ["*.github.com"];
    const sandboxService = store.add(instantiationService.createInstance(TerminalSandboxService));
    const configPath = await sandboxService.getSandboxConfigPath();
    ok(configPath, "Config path should be defined");
    const configContent = createdFiles.get(configPath);
    ok(configContent, "Config file should be created");
    const config = JSON.parse(configContent);
    strictEqual(config.network.allowedDomains.length, 1, "Wildcard domain should be included");
    strictEqual(config.network.allowedDomains[0], "*.github.com", "Wildcard domain should match");
  });
  test("should combine trusted domains with configured allowedDomains, filtering out *", async () => {
    configurationService.setUserConfiguration("chat.tools.terminal.sandbox.network", {
      allowedDomains: ["example.com"],
      deniedDomains: [],
      allowTrustedDomains: true
    });
    trustedDomainService.trustedDomains = ["*", "*.github.com", "microsoft.com"];
    const sandboxService = store.add(instantiationService.createInstance(TerminalSandboxService));
    const configPath = await sandboxService.getSandboxConfigPath();
    ok(configPath, "Config path should be defined");
    const configContent = createdFiles.get(configPath);
    ok(configContent, "Config file should be created");
    const config = JSON.parse(configContent);
    strictEqual(config.network.allowedDomains.length, 3, "Should have 3 domains (excluding *)");
    ok(config.network.allowedDomains.includes("example.com"), "Should include configured domain");
    ok(config.network.allowedDomains.includes("*.github.com"), "Should include wildcard domain");
    ok(config.network.allowedDomains.includes("microsoft.com"), "Should include microsoft.com");
    ok(!config.network.allowedDomains.includes("*"), "Should not include sole wildcard");
  });
  test("should not include trusted domains when allowTrustedDomains is false", async () => {
    configurationService.setUserConfiguration("chat.tools.terminal.sandbox.network", {
      allowedDomains: ["example.com"],
      deniedDomains: [],
      allowTrustedDomains: false
    });
    trustedDomainService.trustedDomains = ["*", "*.github.com"];
    const sandboxService = store.add(instantiationService.createInstance(TerminalSandboxService));
    const configPath = await sandboxService.getSandboxConfigPath();
    ok(configPath, "Config path should be defined");
    const configContent = createdFiles.get(configPath);
    ok(configContent, "Config file should be created");
    const config = JSON.parse(configContent);
    strictEqual(config.network.allowedDomains.length, 1, "Should only have configured domain");
    strictEqual(config.network.allowedDomains[0], "example.com", "Should only include example.com");
  });
  test("should deduplicate domains when combining sources", async () => {
    configurationService.setUserConfiguration("chat.tools.terminal.sandbox.network", {
      allowedDomains: ["github.com", "*.github.com"],
      deniedDomains: [],
      allowTrustedDomains: true
    });
    trustedDomainService.trustedDomains = ["*.github.com", "github.com"];
    const sandboxService = store.add(instantiationService.createInstance(TerminalSandboxService));
    const configPath = await sandboxService.getSandboxConfigPath();
    ok(configPath, "Config path should be defined");
    const configContent = createdFiles.get(configPath);
    ok(configContent, "Config file should be created");
    const config = JSON.parse(configContent);
    strictEqual(config.network.allowedDomains.length, 2, "Should have 2 unique domains");
    ok(config.network.allowedDomains.includes("github.com"), "Should include github.com");
    ok(config.network.allowedDomains.includes("*.github.com"), "Should include *.github.com");
  });
  test("should handle empty trusted domains list", async () => {
    configurationService.setUserConfiguration("chat.tools.terminal.sandbox.network", {
      allowedDomains: ["example.com"],
      deniedDomains: [],
      allowTrustedDomains: true
    });
    trustedDomainService.trustedDomains = [];
    const sandboxService = store.add(instantiationService.createInstance(TerminalSandboxService));
    const configPath = await sandboxService.getSandboxConfigPath();
    ok(configPath, "Config path should be defined");
    const configContent = createdFiles.get(configPath);
    ok(configContent, "Config file should be created");
    const config = JSON.parse(configContent);
    strictEqual(config.network.allowedDomains.length, 1, "Should have only configured domain");
    strictEqual(config.network.allowedDomains[0], "example.com", "Should only include example.com");
  });
  test("should handle only * in trusted domains", async () => {
    configurationService.setUserConfiguration("chat.tools.terminal.sandbox.network", {
      allowedDomains: [],
      deniedDomains: [],
      allowTrustedDomains: true
    });
    trustedDomainService.trustedDomains = ["*"];
    const sandboxService = store.add(instantiationService.createInstance(TerminalSandboxService));
    const configPath = await sandboxService.getSandboxConfigPath();
    ok(configPath, "Config path should be defined");
    const configContent = createdFiles.get(configPath);
    ok(configContent, "Config file should be created");
    const config = JSON.parse(configContent);
    strictEqual(config.network.allowedDomains.length, 0, "Should have no domains (* filtered out)");
  });
  test("should add ripgrep bin directory to PATH when wrapping command", async () => {
    const sandboxService = store.add(instantiationService.createInstance(TerminalSandboxService));
    await sandboxService.getSandboxConfigPath();
    const wrappedCommand = sandboxService.wrapCommand("echo test");
    ok(wrappedCommand.includes("PATH") && wrappedCommand.includes("ripgrep"), "Wrapped command should include PATH modification with ripgrep");
  });
  test("should pass wrapped command as a single quoted argument", async () => {
    const sandboxService = store.add(instantiationService.createInstance(TerminalSandboxService));
    await sandboxService.getSandboxConfigPath();
    const command = '";echo SANDBOX_ESCAPE_REPRO; # $(uname) `id`';
    const wrappedCommand = sandboxService.wrapCommand(command);
    ok(wrappedCommand.includes(`-c '";echo SANDBOX_ESCAPE_REPRO; # $(uname) \`id\`'`), "Wrapped command should shell-quote the command argument using single quotes");
    ok(!wrappedCommand.includes(`-c "${command}"`), "Wrapped command should not embed the command in double quotes");
  });
  test("should keep variable and command substitution payloads literal", async () => {
    const sandboxService = store.add(instantiationService.createInstance(TerminalSandboxService));
    await sandboxService.getSandboxConfigPath();
    const command = "echo $HOME $(curl eth0.me) `id`";
    const wrappedCommand = sandboxService.wrapCommand(command);
    ok(wrappedCommand.includes(`-c 'echo $HOME $(curl eth0.me) \`id\`'`), "Wrapped command should keep variable and command substitutions inside the quoted argument");
    ok(!wrappedCommand.includes(`-c ${command}`), "Wrapped command should not pass substitution payloads to -c without quoting");
  });
  test("should escape single-quote breakout payloads in wrapped command argument", async () => {
    const sandboxService = store.add(instantiationService.createInstance(TerminalSandboxService));
    await sandboxService.getSandboxConfigPath();
    const command = `';curl eth0.me; #'`;
    const wrappedCommand = sandboxService.wrapCommand(command);
    ok(wrappedCommand.includes(`-c '`), "Wrapped command should continue to use a single-quoted -c argument");
    ok(wrappedCommand.includes("curl eth0.me"), "Wrapped command should preserve the payload text literally");
    ok(!wrappedCommand.includes(`-c '${command}'`), "Wrapped command should not embed attacker-controlled single quotes without escaping");
    strictEqual((wrappedCommand.match(/\\''/g) ?? []).length, 2, "Single quote breakout payload should escape each embedded single quote");
  });
  test("should escape embedded single quotes in wrapped command argument", async () => {
    const sandboxService = store.add(instantiationService.createInstance(TerminalSandboxService));
    await sandboxService.getSandboxConfigPath();
    const wrappedCommand = sandboxService.wrapCommand(`echo 'hello'`);
    strictEqual((wrappedCommand.match(/\\''/g) ?? []).length, 2, "Single quote escapes should be inserted for each embedded single quote");
  });
});
//# sourceMappingURL=terminalSandboxService.test.js.map
