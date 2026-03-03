var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import assert from "assert";
import { URI } from "../../../../../base/common/uri.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../../base/test/common/utils.js";
import { PromptsType } from "../../../../../workbench/contrib/chat/common/promptSyntax/promptTypes.js";
import { PromptsStorage, AgentFileType } from "../../../../../workbench/contrib/chat/common/promptSyntax/service/promptsService.js";
import { getSourceCounts, getSourceCountsTotal, getCustomizationTotalCount } from "../../browser/customizationCounts.js";
import { Event } from "../../../../../base/common/event.js";
import { observableValue } from "../../../../../base/common/observable.js";
function localFile(path) {
  return { uri: URI.file(path), storage: PromptsStorage.local, type: PromptsType.instructions };
}
__name(localFile, "localFile");
function userFile(path) {
  return { uri: URI.file(path), storage: PromptsStorage.user, type: PromptsType.instructions };
}
__name(userFile, "userFile");
function extensionFile(path) {
  return {
    uri: URI.file(path),
    storage: PromptsStorage.extension,
    type: PromptsType.instructions,
    extension: void 0,
    source: void 0
  };
}
__name(extensionFile, "extensionFile");
function agentInstructionFile(path) {
  return { uri: URI.file(path), realPath: void 0, type: AgentFileType.agentsMd };
}
__name(agentInstructionFile, "agentInstructionFile");
function makeWorkspaceFolder(path, name) {
  const uri = URI.file(path);
  return {
    uri,
    name: name ?? path.split("/").pop(),
    index: 0,
    toResource: /* @__PURE__ */ __name((rel) => URI.joinPath(uri, rel), "toResource")
  };
}
__name(makeWorkspaceFolder, "makeWorkspaceFolder");
function createMockPromptsService(opts = {}) {
  return {
    listPromptFilesForStorage: /* @__PURE__ */ __name(async (type, storage) => {
      if (storage === PromptsStorage.local) {
        return opts.localFiles ?? [];
      }
      if (storage === PromptsStorage.user) {
        return opts.userFiles ?? [];
      }
      if (storage === PromptsStorage.extension) {
        return opts.extensionFiles ?? [];
      }
      return [];
    }, "listPromptFilesForStorage"),
    listPromptFiles: /* @__PURE__ */ __name(async () => opts.allFiles ?? [...opts.localFiles ?? [], ...opts.userFiles ?? [], ...opts.extensionFiles ?? []], "listPromptFiles"),
    listAgentInstructions: /* @__PURE__ */ __name(async () => opts.agentInstructions ?? [], "listAgentInstructions"),
    getCustomAgents: /* @__PURE__ */ __name(async () => (opts.agents ?? []).map((a) => ({
      name: a.name,
      uri: a.uri,
      source: { storage: a.storage }
    })), "getCustomAgents"),
    findAgentSkills: /* @__PURE__ */ __name(async () => (opts.skills ?? []).map((s) => ({
      name: s.name,
      uri: s.uri,
      storage: s.storage
    })), "findAgentSkills"),
    getPromptSlashCommands: /* @__PURE__ */ __name(async () => (opts.commands ?? []).map((c) => ({
      name: c.name,
      promptPath: { uri: c.uri, storage: c.storage, type: c.type }
    })), "getPromptSlashCommands"),
    getSourceFolders: /* @__PURE__ */ __name(async () => [], "getSourceFolders"),
    getResolvedSourceFolders: /* @__PURE__ */ __name(async () => [], "getResolvedSourceFolders"),
    onDidChangeCustomAgents: Event.None,
    onDidChangeSlashCommands: Event.None
  };
}
__name(createMockPromptsService, "createMockPromptsService");
function createMockWorkspaceService(opts = {}) {
  const defaultFilter = opts.filter ?? {
    sources: [PromptsStorage.local, PromptsStorage.user, PromptsStorage.extension]
  };
  return {
    _serviceBrand: void 0,
    activeProjectRoot: observableValue("test", opts.activeRoot),
    getActiveProjectRoot: /* @__PURE__ */ __name(() => opts.activeRoot, "getActiveProjectRoot"),
    managementSections: [],
    getStorageSourceFilter: /* @__PURE__ */ __name(() => defaultFilter, "getStorageSourceFilter"),
    preferManualCreation: false,
    commitFiles: /* @__PURE__ */ __name(async () => {
    }, "commitFiles"),
    generateCustomization: /* @__PURE__ */ __name(async () => {
    }, "generateCustomization")
  };
}
__name(createMockWorkspaceService, "createMockWorkspaceService");
function createMockWorkspaceContextService(folders) {
  return {
    getWorkspace: /* @__PURE__ */ __name(() => ({ folders }), "getWorkspace"),
    getWorkbenchState: /* @__PURE__ */ __name(() => 2, "getWorkbenchState"),
    getWorkspaceFolder: /* @__PURE__ */ __name(() => folders[0], "getWorkspaceFolder"),
    onDidChangeWorkspaceFolders: Event.None,
    onDidChangeWorkbenchState: Event.None,
    onDidChangeWorkspaceName: Event.None,
    isInsideWorkspace: /* @__PURE__ */ __name(() => true, "isInsideWorkspace")
  };
}
__name(createMockWorkspaceContextService, "createMockWorkspaceContextService");
suite("customizationCounts", () => {
  ensureNoDisposablesAreLeakedInTestSuite();
  const workspaceRoot = URI.file("/workspace");
  const workspaceFolder = makeWorkspaceFolder("/workspace");
  suite("getSourceCountsTotal", () => {
    test("sums only visible sources", () => {
      const counts = { workspace: 5, user: 3, extension: 2 };
      const filter = { sources: [PromptsStorage.local, PromptsStorage.user] };
      assert.strictEqual(getSourceCountsTotal(counts, filter), 8);
    });
    test("returns 0 for empty sources", () => {
      const counts = { workspace: 5, user: 3, extension: 2 };
      const filter = { sources: [] };
      assert.strictEqual(getSourceCountsTotal(counts, filter), 0);
    });
    test("sums all sources", () => {
      const counts = { workspace: 5, user: 3, extension: 2 };
      const filter = { sources: [PromptsStorage.local, PromptsStorage.user, PromptsStorage.extension] };
      assert.strictEqual(getSourceCountsTotal(counts, filter), 10);
    });
    test("handles single source", () => {
      const counts = { workspace: 7, user: 0, extension: 0 };
      const filter = { sources: [PromptsStorage.local] };
      assert.strictEqual(getSourceCountsTotal(counts, filter), 7);
    });
    test("ignores plugin storage in totals (not in ISourceCounts)", () => {
      const counts = { workspace: 1, user: 1, extension: 1 };
      const filter = { sources: [PromptsStorage.plugin] };
      assert.strictEqual(getSourceCountsTotal(counts, filter), 0);
    });
  });
  suite("getSourceCounts - instructions", () => {
    test("includes agent instruction files in workspace count", async () => {
      const promptsService = createMockPromptsService({
        localFiles: [
          localFile("/workspace/.github/instructions/a.instructions.md")
        ],
        userFiles: [],
        extensionFiles: [],
        allFiles: [
          localFile("/workspace/.github/instructions/a.instructions.md")
        ],
        agentInstructions: [
          agentInstructionFile("/workspace/AGENTS.md"),
          agentInstructionFile("/workspace/.github/copilot-instructions.md")
        ]
      });
      const workspaceService = createMockWorkspaceService({ activeRoot: workspaceRoot });
      const contextService = createMockWorkspaceContextService([workspaceFolder]);
      const counts = await getSourceCounts(promptsService, PromptsType.instructions, { sources: [PromptsStorage.local, PromptsStorage.user] }, contextService, workspaceService);
      assert.strictEqual(counts.workspace, 3);
      assert.strictEqual(counts.user, 0);
    });
    test("classifies agent instructions outside workspace as user", async () => {
      const promptsService = createMockPromptsService({
        localFiles: [],
        userFiles: [],
        extensionFiles: [],
        allFiles: [],
        agentInstructions: [
          agentInstructionFile("/home/user/.claude/CLAUDE.md")
        ]
      });
      const workspaceService = createMockWorkspaceService({ activeRoot: workspaceRoot });
      const contextService = createMockWorkspaceContextService([workspaceFolder]);
      const counts = await getSourceCounts(promptsService, PromptsType.instructions, { sources: [PromptsStorage.local, PromptsStorage.user] }, contextService, workspaceService);
      assert.strictEqual(counts.workspace, 0);
      assert.strictEqual(counts.user, 1);
    });
    test("agent instructions under active root classified as workspace", async () => {
      const activeRoot = URI.file("/session/worktree");
      const promptsService = createMockPromptsService({
        allFiles: [],
        agentInstructions: [
          agentInstructionFile("/session/worktree/AGENTS.md")
        ]
      });
      const workspaceService = createMockWorkspaceService({ activeRoot });
      const contextService = createMockWorkspaceContextService([]);
      const counts = await getSourceCounts(promptsService, PromptsType.instructions, { sources: [PromptsStorage.local, PromptsStorage.user] }, contextService, workspaceService);
      assert.strictEqual(counts.workspace, 1);
      assert.strictEqual(counts.user, 0);
    });
    test("no agent instructions returns only prompt file counts", async () => {
      const promptsService = createMockPromptsService({
        allFiles: [
          localFile("/workspace/.github/instructions/a.instructions.md"),
          localFile("/workspace/.github/instructions/b.instructions.md")
        ],
        agentInstructions: []
      });
      const workspaceService = createMockWorkspaceService({ activeRoot: workspaceRoot });
      const contextService = createMockWorkspaceContextService([workspaceFolder]);
      const counts = await getSourceCounts(promptsService, PromptsType.instructions, { sources: [PromptsStorage.local] }, contextService, workspaceService);
      assert.strictEqual(counts.workspace, 2);
    });
    test("mixed agent instructions across workspace and user", async () => {
      const promptsService = createMockPromptsService({
        allFiles: [
          localFile("/workspace/.github/instructions/rules.instructions.md")
        ],
        agentInstructions: [
          agentInstructionFile("/workspace/AGENTS.md"),
          agentInstructionFile("/workspace/CLAUDE.md"),
          agentInstructionFile("/home/user/.claude/CLAUDE.md")
        ]
      });
      const workspaceService = createMockWorkspaceService({ activeRoot: workspaceRoot });
      const contextService = createMockWorkspaceContextService([workspaceFolder]);
      const counts = await getSourceCounts(promptsService, PromptsType.instructions, { sources: [PromptsStorage.local, PromptsStorage.user] }, contextService, workspaceService);
      assert.strictEqual(counts.workspace, 3);
      assert.strictEqual(counts.user, 1);
    });
  });
  suite("getSourceCounts - agents", () => {
    test("uses getCustomAgents instead of listPromptFilesForStorage", async () => {
      const promptsService = createMockPromptsService({
        // listPromptFilesForStorage would return these — but agents should use getCustomAgents
        localFiles: [localFile("/workspace/.github/agents/a.agent.md")],
        agents: [
          { name: "agent-a", uri: URI.file("/workspace/.github/agents/a.agent.md"), storage: PromptsStorage.local },
          { name: "agent-b", uri: URI.file("/workspace/.github/agents/b.agent.md"), storage: PromptsStorage.local }
        ]
      });
      const workspaceService = createMockWorkspaceService({ activeRoot: workspaceRoot });
      const contextService = createMockWorkspaceContextService([workspaceFolder]);
      const counts = await getSourceCounts(promptsService, PromptsType.agent, { sources: [PromptsStorage.local] }, contextService, workspaceService);
      assert.strictEqual(counts.workspace, 2);
    });
    test("counts agents across storage types", async () => {
      const promptsService = createMockPromptsService({
        agents: [
          { name: "local-agent", uri: URI.file("/workspace/.github/agents/a.agent.md"), storage: PromptsStorage.local },
          { name: "user-agent", uri: URI.file("/home/.claude/agents/b.agent.md"), storage: PromptsStorage.user },
          { name: "ext-agent", uri: URI.file("/ext/agents/c.agent.md"), storage: PromptsStorage.extension }
        ]
      });
      const workspaceService = createMockWorkspaceService({ activeRoot: workspaceRoot });
      const contextService = createMockWorkspaceContextService([workspaceFolder]);
      const counts = await getSourceCounts(promptsService, PromptsType.agent, { sources: [PromptsStorage.local, PromptsStorage.user, PromptsStorage.extension] }, contextService, workspaceService);
      assert.deepStrictEqual(counts, { workspace: 1, user: 1, extension: 1 });
    });
    test("empty agents returns all zeros", async () => {
      const promptsService = createMockPromptsService({ agents: [] });
      const workspaceService = createMockWorkspaceService({ activeRoot: workspaceRoot });
      const contextService = createMockWorkspaceContextService([workspaceFolder]);
      const counts = await getSourceCounts(promptsService, PromptsType.agent, { sources: [PromptsStorage.local, PromptsStorage.user] }, contextService, workspaceService);
      assert.deepStrictEqual(counts, { workspace: 0, user: 0, extension: 0 });
    });
  });
  suite("getSourceCounts - skills", () => {
    test("uses findAgentSkills", async () => {
      const promptsService = createMockPromptsService({
        skills: [
          { name: "skill-a", uri: URI.file("/workspace/.github/skills/a/SKILL.md"), storage: PromptsStorage.local },
          { name: "skill-b", uri: URI.file("/home/user/.copilot/skills/b/SKILL.md"), storage: PromptsStorage.user }
        ]
      });
      const workspaceService = createMockWorkspaceService({ activeRoot: workspaceRoot });
      const contextService = createMockWorkspaceContextService([workspaceFolder]);
      const counts = await getSourceCounts(promptsService, PromptsType.skill, { sources: [PromptsStorage.local, PromptsStorage.user] }, contextService, workspaceService);
      assert.strictEqual(counts.workspace, 1);
      assert.strictEqual(counts.user, 1);
    });
    test("empty skills returns zeros", async () => {
      const promptsService = createMockPromptsService({ skills: [] });
      const workspaceService = createMockWorkspaceService({ activeRoot: workspaceRoot });
      const contextService = createMockWorkspaceContextService([workspaceFolder]);
      const counts = await getSourceCounts(promptsService, PromptsType.skill, { sources: [PromptsStorage.local, PromptsStorage.user] }, contextService, workspaceService);
      assert.deepStrictEqual(counts, { workspace: 0, user: 0, extension: 0 });
    });
    test("skills filtered by storage source filter", async () => {
      const promptsService = createMockPromptsService({
        skills: [
          { name: "skill-a", uri: URI.file("/workspace/.github/skills/a/SKILL.md"), storage: PromptsStorage.local },
          { name: "skill-b", uri: URI.file("/home/user/.copilot/skills/b/SKILL.md"), storage: PromptsStorage.user }
        ]
      });
      const workspaceService = createMockWorkspaceService({ activeRoot: workspaceRoot });
      const contextService = createMockWorkspaceContextService([workspaceFolder]);
      const counts = await getSourceCounts(promptsService, PromptsType.skill, { sources: [PromptsStorage.local] }, contextService, workspaceService);
      assert.strictEqual(counts.workspace, 1);
      assert.strictEqual(counts.user, 0);
    });
  });
  suite("getSourceCounts - prompts", () => {
    test("uses getPromptSlashCommands and filters out skills", async () => {
      const promptsService = createMockPromptsService({
        commands: [
          { name: "my-prompt", uri: URI.file("/workspace/.github/prompts/a.prompt.md"), storage: PromptsStorage.local, type: PromptsType.prompt },
          { name: "my-skill", uri: URI.file("/workspace/.github/skills/b/SKILL.md"), storage: PromptsStorage.local, type: PromptsType.skill }
        ]
      });
      const workspaceService = createMockWorkspaceService({ activeRoot: workspaceRoot });
      const contextService = createMockWorkspaceContextService([workspaceFolder]);
      const counts = await getSourceCounts(promptsService, PromptsType.prompt, { sources: [PromptsStorage.local] }, contextService, workspaceService);
      assert.strictEqual(counts.workspace, 1);
    });
    test("counts prompts across storage types", async () => {
      const promptsService = createMockPromptsService({
        commands: [
          { name: "wp", uri: URI.file("/workspace/.github/prompts/a.prompt.md"), storage: PromptsStorage.local, type: PromptsType.prompt },
          { name: "up", uri: URI.file("/home/user/prompts/b.prompt.md"), storage: PromptsStorage.user, type: PromptsType.prompt }
        ]
      });
      const workspaceService = createMockWorkspaceService({ activeRoot: workspaceRoot });
      const contextService = createMockWorkspaceContextService([workspaceFolder]);
      const counts = await getSourceCounts(promptsService, PromptsType.prompt, { sources: [PromptsStorage.local, PromptsStorage.user] }, contextService, workspaceService);
      assert.deepStrictEqual(counts, { workspace: 1, user: 1, extension: 0 });
    });
    test("all skills are excluded from prompt counts", async () => {
      const promptsService = createMockPromptsService({
        commands: [
          { name: "s1", uri: URI.file("/w/s1/SKILL.md"), storage: PromptsStorage.local, type: PromptsType.skill },
          { name: "s2", uri: URI.file("/w/s2/SKILL.md"), storage: PromptsStorage.user, type: PromptsType.skill }
        ]
      });
      const workspaceService = createMockWorkspaceService({ activeRoot: workspaceRoot });
      const contextService = createMockWorkspaceContextService([workspaceFolder]);
      const counts = await getSourceCounts(promptsService, PromptsType.prompt, { sources: [PromptsStorage.local, PromptsStorage.user] }, contextService, workspaceService);
      assert.deepStrictEqual(counts, { workspace: 0, user: 0, extension: 0 });
    });
  });
  suite("getSourceCounts - hooks", () => {
    test("uses listPromptFiles for hooks", async () => {
      const promptsService = createMockPromptsService({
        allFiles: [
          localFile("/workspace/.github/hooks/pre-commit.json"),
          localFile("/workspace/.claude/settings.json")
        ]
      });
      const workspaceService = createMockWorkspaceService({ activeRoot: workspaceRoot });
      const contextService = createMockWorkspaceContextService([workspaceFolder]);
      const counts = await getSourceCounts(promptsService, PromptsType.hook, { sources: [PromptsStorage.local] }, contextService, workspaceService);
      assert.strictEqual(counts.workspace, 2);
    });
    test("hooks with only local source excludes user hooks", async () => {
      const promptsService = createMockPromptsService({
        allFiles: [
          localFile("/workspace/.github/hooks/pre-commit.json"),
          userFile("/home/user/.claude/settings.json")
        ]
      });
      const workspaceService = createMockWorkspaceService({ activeRoot: workspaceRoot });
      const contextService = createMockWorkspaceContextService([workspaceFolder]);
      const counts = await getSourceCounts(promptsService, PromptsType.hook, { sources: [PromptsStorage.local] }, contextService, workspaceService);
      assert.strictEqual(counts.workspace, 1);
      assert.strictEqual(counts.user, 0);
    });
  });
  suite("getSourceCounts - filter", () => {
    test("applies includedUserFileRoots filter", async () => {
      const copilotRoot = URI.file("/home/user/.copilot");
      const promptsService = createMockPromptsService({
        allFiles: [
          localFile("/workspace/.github/instructions/a.instructions.md"),
          userFile("/home/user/.copilot/instructions/b.instructions.md"),
          userFile("/home/user/.vscode/instructions/c.instructions.md")
        ]
      });
      const workspaceService = createMockWorkspaceService({ activeRoot: workspaceRoot });
      const contextService = createMockWorkspaceContextService([workspaceFolder]);
      const counts = await getSourceCounts(promptsService, PromptsType.instructions, {
        sources: [PromptsStorage.local, PromptsStorage.user],
        includedUserFileRoots: [copilotRoot]
      }, contextService, workspaceService);
      assert.strictEqual(counts.workspace, 1);
      assert.strictEqual(counts.user, 1);
    });
    test("excludes storage types not in sources", async () => {
      const promptsService = createMockPromptsService({
        allFiles: [
          localFile("/workspace/.github/instructions/a.instructions.md"),
          extensionFile("/ext/instructions/b.instructions.md")
        ]
      });
      const workspaceService = createMockWorkspaceService({ activeRoot: workspaceRoot });
      const contextService = createMockWorkspaceContextService([workspaceFolder]);
      const counts = await getSourceCounts(promptsService, PromptsType.instructions, { sources: [PromptsStorage.local] }, contextService, workspaceService);
      assert.strictEqual(counts.workspace, 1);
      assert.strictEqual(counts.extension, 0);
    });
    test("includedUserFileRoots with multiple roots", async () => {
      const copilotRoot = URI.file("/home/user/.copilot");
      const claudeRoot = URI.file("/home/user/.claude");
      const promptsService = createMockPromptsService({
        allFiles: [
          userFile("/home/user/.copilot/instructions/a.instructions.md"),
          userFile("/home/user/.claude/rules/b.md"),
          userFile("/home/user/.vscode/instructions/c.instructions.md"),
          userFile("/home/user/.agents/instructions/d.instructions.md")
        ]
      });
      const workspaceService = createMockWorkspaceService({ activeRoot: workspaceRoot });
      const contextService = createMockWorkspaceContextService([workspaceFolder]);
      const counts = await getSourceCounts(promptsService, PromptsType.instructions, {
        sources: [PromptsStorage.local, PromptsStorage.user],
        includedUserFileRoots: [copilotRoot, claudeRoot]
      }, contextService, workspaceService);
      assert.strictEqual(counts.user, 2);
    });
    test("undefined includedUserFileRoots shows all user files", async () => {
      const promptsService = createMockPromptsService({
        allFiles: [
          userFile("/home/user/.copilot/instructions/a.instructions.md"),
          userFile("/home/user/.vscode/instructions/b.instructions.md")
        ]
      });
      const workspaceService = createMockWorkspaceService({ activeRoot: workspaceRoot });
      const contextService = createMockWorkspaceContextService([workspaceFolder]);
      const counts = await getSourceCounts(promptsService, PromptsType.instructions, { sources: [PromptsStorage.user] }, contextService, workspaceService);
      assert.strictEqual(counts.user, 2);
    });
  });
  suite("getCustomizationTotalCount", () => {
    test("sums all sections", async () => {
      const promptsService = createMockPromptsService({
        agents: [
          { name: "a", uri: URI.file("/w/a.agent.md"), storage: PromptsStorage.local }
        ],
        skills: [
          { name: "s", uri: URI.file("/w/s/SKILL.md"), storage: PromptsStorage.local }
        ],
        commands: [
          { name: "p", uri: URI.file("/w/p.prompt.md"), storage: PromptsStorage.local, type: PromptsType.prompt }
        ]
      });
      const mcpService = {
        servers: observableValue("test", [{ id: "srv1" }])
      };
      const workspaceService = createMockWorkspaceService({
        activeRoot: URI.file("/w"),
        filter: { sources: [PromptsStorage.local] }
      });
      const contextService = createMockWorkspaceContextService([makeWorkspaceFolder("/w")]);
      const total = await getCustomizationTotalCount(promptsService, mcpService, workspaceService, contextService);
      assert.strictEqual(total, 4);
    });
    test("empty workspace returns only mcp count", async () => {
      const promptsService = createMockPromptsService({});
      const mcpService = {
        servers: observableValue("test", [{ id: "s1" }, { id: "s2" }])
      };
      const workspaceService = createMockWorkspaceService({
        filter: { sources: [PromptsStorage.local] }
      });
      const contextService = createMockWorkspaceContextService([]);
      const total = await getCustomizationTotalCount(promptsService, mcpService, workspaceService, contextService);
      assert.strictEqual(total, 2);
    });
    test("includes instructions with agent files in count", async () => {
      const instructionFiles = [
        localFile("/w/.github/instructions/a.instructions.md")
      ];
      const promptsService = createMockPromptsService({
        allFiles: instructionFiles,
        agentInstructions: [
          agentInstructionFile("/w/AGENTS.md")
        ]
      });
      promptsService.listPromptFiles = async (type) => {
        return type === PromptsType.instructions ? instructionFiles : [];
      };
      const mcpService = {
        servers: observableValue("test", [])
      };
      const workspaceService = createMockWorkspaceService({
        activeRoot: URI.file("/w"),
        filter: { sources: [PromptsStorage.local] }
      });
      const contextService = createMockWorkspaceContextService([makeWorkspaceFolder("/w")]);
      const total = await getCustomizationTotalCount(promptsService, mcpService, workspaceService, contextService);
      assert.strictEqual(total, 2);
    });
  });
  suite("data source consistency", () => {
    test("instructions count matches widget: listPromptFiles + listAgentInstructions", async () => {
      const instructionFiles = Array.from({ length: 13 }, (_, i) => localFile(`/workspace/.github/instructions/rule-${i}.instructions.md`));
      const promptsService = createMockPromptsService({
        localFiles: instructionFiles,
        allFiles: instructionFiles,
        agentInstructions: [
          agentInstructionFile("/workspace/AGENTS.md"),
          agentInstructionFile("/workspace/.github/copilot-instructions.md")
        ]
      });
      const workspaceService = createMockWorkspaceService({ activeRoot: workspaceRoot });
      const contextService = createMockWorkspaceContextService([workspaceFolder]);
      const counts = await getSourceCounts(promptsService, PromptsType.instructions, { sources: [PromptsStorage.local, PromptsStorage.user] }, contextService, workspaceService);
      assert.strictEqual(counts.workspace, 15);
    });
    test("agents count uses getCustomAgents not listPromptFilesForStorage", async () => {
      const promptsService = createMockPromptsService({
        // Raw file count would be 3
        localFiles: [
          localFile("/workspace/.github/agents/a.agent.md"),
          localFile("/workspace/.github/agents/b.agent.md"),
          localFile("/workspace/.github/agents/README.md")
          // would be excluded by getCustomAgents
        ],
        // But parsed custom agents is only 2
        agents: [
          { name: "agent-a", uri: URI.file("/workspace/.github/agents/a.agent.md"), storage: PromptsStorage.local },
          { name: "agent-b", uri: URI.file("/workspace/.github/agents/b.agent.md"), storage: PromptsStorage.local }
        ]
      });
      const workspaceService = createMockWorkspaceService({ activeRoot: workspaceRoot });
      const contextService = createMockWorkspaceContextService([workspaceFolder]);
      const counts = await getSourceCounts(promptsService, PromptsType.agent, { sources: [PromptsStorage.local] }, contextService, workspaceService);
      assert.strictEqual(counts.workspace, 2);
    });
    test("prompts count excludes skills to match widget", async () => {
      const promptsService = createMockPromptsService({
        localFiles: [
          localFile("/workspace/.github/prompts/a.prompt.md"),
          localFile("/workspace/.github/prompts/b.prompt.md")
        ],
        commands: [
          { name: "prompt-a", uri: URI.file("/workspace/.github/prompts/a.prompt.md"), storage: PromptsStorage.local, type: PromptsType.prompt },
          { name: "prompt-b", uri: URI.file("/workspace/.github/prompts/b.prompt.md"), storage: PromptsStorage.local, type: PromptsType.prompt },
          { name: "skill-x", uri: URI.file("/workspace/.github/skills/x/SKILL.md"), storage: PromptsStorage.local, type: PromptsType.skill }
        ]
      });
      const workspaceService = createMockWorkspaceService({ activeRoot: workspaceRoot });
      const contextService = createMockWorkspaceContextService([workspaceFolder]);
      const counts = await getSourceCounts(promptsService, PromptsType.prompt, { sources: [PromptsStorage.local] }, contextService, workspaceService);
      assert.strictEqual(counts.workspace, 2);
    });
    test("no active root: agent instructions classified as user", async () => {
      const promptsService = createMockPromptsService({
        allFiles: [],
        agentInstructions: [
          agentInstructionFile("/somewhere/AGENTS.md")
        ]
      });
      const workspaceService = createMockWorkspaceService({ activeRoot: void 0 });
      const contextService = createMockWorkspaceContextService([]);
      const counts = await getSourceCounts(promptsService, PromptsType.instructions, { sources: [PromptsStorage.local, PromptsStorage.user] }, contextService, workspaceService);
      assert.strictEqual(counts.workspace, 0);
      assert.strictEqual(counts.user, 1);
    });
  });
});
//# sourceMappingURL=customizationCounts.test.js.map
