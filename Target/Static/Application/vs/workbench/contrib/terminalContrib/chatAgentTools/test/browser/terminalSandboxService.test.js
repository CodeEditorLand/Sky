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
});
//# sourceMappingURL=terminalSandboxService.test.js.map
