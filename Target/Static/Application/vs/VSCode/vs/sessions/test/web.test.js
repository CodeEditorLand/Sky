var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __decorate = function(decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
  else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = function(paramIndex, decorator) {
  return function(target, key) {
    decorator(target, key, paramIndex);
  };
};
import { Workbench as SessionsWorkbench } from "../browser/workbench.js";
import { SessionsBrowserMain } from "../browser/web.main.js";
import { Emitter, Event } from "../../base/common/event.js";
import { observableValue } from "../../base/common/observable.js";
import { ChatEntitlement, IChatEntitlementService } from "../../workbench/services/chat/common/chatEntitlementService.js";
import { IDefaultAccountService } from "../../platform/defaultAccount/common/defaultAccount.js";
import { IChatAgentService } from "../../workbench/contrib/chat/common/participants/chatAgents.js";
import { ChatAgentLocation, ChatModeKind } from "../../workbench/contrib/chat/common/constants.js";
import { ExtensionIdentifier } from "../../platform/extensions/common/extensions.js";
import { IStorageService } from "../../platform/storage/common/storage.js";
import { URI } from "../../base/common/uri.js";
import { Disposable } from "../../base/common/lifecycle.js";
import { registerWorkbenchContribution2 } from "../../workbench/common/contributions.js";
import { IChatSessionsService } from "../../workbench/contrib/chat/common/chatSessionsService.js";
import { IGitService } from "../../workbench/contrib/git/common/gitService.js";
import { IFileService } from "../../platform/files/common/files.js";
import { InMemoryFileSystemProvider } from "../../platform/files/common/inMemoryFilesystemProvider.js";
import { VSBuffer } from "../../base/common/buffer.js";
const MOCK_FS_FILES = {
  "/mock-repo/src/index.ts": 'export function main() {\n	console.log("Hello from mock repo");\n}\n',
  "/mock-repo/src/utils.ts": "export function add(a: number, b: number): number {\n	return a + b;\n}\n",
  "/mock-repo/package.json": '{\n	"name": "mock-repo",\n	"version": "1.0.0"\n}\n',
  "/mock-repo/README.md": "# Mock Repository\n\nThis is a mock repository for E2E testing.\n"
};
function registerMockFileSystemProvider(serviceCollection) {
  const fileService = serviceCollection.get(IFileService);
  const provider = new InMemoryFileSystemProvider();
  fileService.registerProvider("mock-fs", provider);
  for (const [filePath, content] of Object.entries(MOCK_FS_FILES)) {
    const uri = URI.from({ scheme: "mock-fs", authority: "mock-repo", path: filePath });
    fileService.writeFile(uri, VSBuffer.fromString(content));
  }
  console.log("[Sessions Web Test] Registered mock-fs:// provider with pre-seeded files");
}
__name(registerMockFileSystemProvider, "registerMockFileSystemProvider");
const MOCK_ACCOUNT = {
  authenticationProvider: { id: "github", name: "GitHub (Mock)", enterprise: false },
  accountName: "e2e-test-user",
  sessionId: "mock-session-1",
  enterprise: false
};
class MockChatEntitlementService {
  static {
    __name(this, "MockChatEntitlementService");
  }
  constructor() {
    this.onDidChangeEntitlement = Event.None;
    this.onDidChangeQuotaExceeded = Event.None;
    this.onDidChangeQuotaRemaining = Event.None;
    this.onDidChangeSentiment = Event.None;
    this.onDidChangeAnonymous = Event.None;
    this.entitlement = ChatEntitlement.Free;
    this.entitlementObs = observableValue("entitlement", ChatEntitlement.Free);
    this.previewFeaturesDisabled = false;
    this.organisations = void 0;
    this.isInternal = false;
    this.sku = "free";
    this.copilotTrackingId = "mock-tracking-id";
    this.quotas = {};
    this.sentiment = { installed: true, registered: true };
    this.sentimentObs = observableValue("sentiment", { installed: true, registered: true });
    this.anonymous = false;
    this.anonymousObs = observableValue("anonymous", false);
  }
  markAnonymousRateLimited() {
  }
  async update(_token) {
  }
}
class MockDefaultAccountService {
  static {
    __name(this, "MockDefaultAccountService");
  }
  constructor() {
    this.onDidChangeDefaultAccount = Event.None;
    this.onDidChangePolicyData = Event.None;
    this.policyData = null;
    this.copilotTokenInfo = null;
    this.onDidChangeCopilotTokenInfo = Event.None;
  }
  async getDefaultAccount() {
    return MOCK_ACCOUNT;
  }
  getDefaultAccountAuthenticationProvider() {
    return MOCK_ACCOUNT.authenticationProvider;
  }
  setDefaultAccountProvider() {
  }
  async refresh() {
    return MOCK_ACCOUNT;
  }
  async signIn() {
    return MOCK_ACCOUNT;
  }
  async signOut() {
  }
}
const EXISTING_MOCK_FILES = /* @__PURE__ */ new Set(["/mock-repo/src/index.ts", "/mock-repo/src/utils.ts", "/mock-repo/package.json", "/mock-repo/README.md"]);
function emitFileEdits(fileEdits, progress) {
  for (const edit of fileEdits) {
    const isExistingFile = EXISTING_MOCK_FILES.has(edit.uri.path);
    const range = isExistingFile ? { startLineNumber: 1, startColumn: 1, endLineNumber: 99999, endColumn: 1 } : { startLineNumber: 1, startColumn: 1, endLineNumber: 1, endColumn: 1 };
    console.log(`[Sessions Web Test] Emitting textEdit for ${edit.uri.toString()} (existing: ${isExistingFile}, range: ${range.startLineNumber}-${range.endLineNumber})`);
    progress([{
      kind: "textEdit",
      uri: edit.uri,
      edits: [{ range, text: edit.content }],
      done: true
    }]);
  }
}
__name(emitFileEdits, "emitFileEdits");
function getMockResponseWithEdits(message) {
  if (/build|compile|create/i.test(message)) {
    return {
      text: "I'll help you build the project. Here are the changes:",
      fileEdits: [
        {
          // Modify existing file — adds build import + call
          uri: URI.from({ scheme: "mock-fs", authority: "mock-repo", path: "/mock-repo/src/index.ts" }),
          content: 'import { build } from "./build";\n\nexport function main() {\n	console.log("Hello from mock repo");\n	build();\n}\n'
        },
        {
          // New file — creates build script
          uri: URI.from({ scheme: "mock-fs", authority: "mock-repo", path: "/mock-repo/src/build.ts" }),
          content: 'export async function build() {\n	console.log("Building...");\n	console.log("Build complete!");\n}\n'
        },
        {
          // Modify existing file — adds build script
          uri: URI.from({ scheme: "mock-fs", authority: "mock-repo", path: "/mock-repo/package.json" }),
          content: '{\n	"name": "mock-repo",\n	"version": "1.0.0",\n	"scripts": {\n		"build": "node src/build.ts"\n	}\n}\n'
        }
      ]
    };
  }
  if (/fix|bug/i.test(message)) {
    return {
      text: "I found the issue and applied the fix. The input validation has been added.",
      fileEdits: [
        {
          // Modify existing file — adds input validation
          uri: URI.from({ scheme: "mock-fs", authority: "mock-repo", path: "/mock-repo/src/utils.ts" }),
          content: 'export function add(a: number, b: number): number {\n	if (typeof a !== "number" || typeof b !== "number") {\n		throw new TypeError("Both arguments must be numbers");\n	}\n	return a + b;\n}\n'
        }
      ]
    };
  }
  if (/explain|describe/i.test(message)) {
    return {
      text: "This project has a simple structure with a main entry point and utility functions."
    };
  }
  return {
    text: "I understand your request. Let me work on that.\n\n1. Review the codebase\n2. Make changes\n3. Run tests"
  };
}
__name(getMockResponseWithEdits, "getMockResponseWithEdits");
let MockChatAgentContribution = class MockChatAgentContribution2 extends Disposable {
  static {
    __name(this, "MockChatAgentContribution");
  }
  static {
    this.ID = "sessions.test.mockChatAgent";
  }
  constructor(chatAgentService, storageService, chatSessionsService) {
    super();
    this.chatAgentService = chatAgentService;
    this.storageService = storageService;
    this.chatSessionsService = chatSessionsService;
    this._sessionItems = [];
    this._itemsChangedEmitter = new Emitter();
    this._sessionHistory = /* @__PURE__ */ new Map();
    this._register(this._itemsChangedEmitter);
    this.registerMockAgents();
    this.registerMockSessionProvider();
    this.preseedFolder();
  }
  /**
   * Track a session for sidebar display and history re-opening.
   *
   * Populates `IChatSessionItem.changes` with file change metadata so the
   * ChangesViewPane can render them for background (copilotcli) sessions.
   * Background sessions read changes from `IAgentSessionsService.model`
   * which flows through from `IChatSessionItemController.items`.
   */
  addSessionItem(resource, message, responseText, fileEdits) {
    const key = resource.toString();
    const now = Date.now();
    if (!this._sessionHistory.has(key)) {
      this._sessionHistory.set(key, []);
    }
    this._sessionHistory.get(key).push({ type: "request", prompt: message, participant: "copilot" }, { type: "response", parts: [{ kind: "markdownContent", content: { value: responseText, isTrusted: false, supportThemeIcons: false, supportHtml: false } }], participant: "copilot" });
    const changes = fileEdits?.map((edit) => ({
      modifiedUri: edit.uri,
      insertions: edit.content.split("\n").length,
      deletions: EXISTING_MOCK_FILES.has(edit.uri.path) ? 1 : 0
    }));
    const existing = this._sessionItems.find((s) => s.resource.toString() === key);
    let addedOrUpdated = existing;
    if (existing) {
      existing.timing.lastRequestStarted = now;
      existing.timing.lastRequestEnded = now;
      if (changes) {
        existing.changes = changes;
      }
    } else {
      addedOrUpdated = {
        resource,
        label: message.slice(0, 50) || "Mock Session",
        status: 1,
        timing: { created: now, lastRequestStarted: now, lastRequestEnded: now },
        ...changes ? { changes } : {}
      };
      this._sessionItems.push(addedOrUpdated);
    }
    if (addedOrUpdated) {
      this._itemsChangedEmitter.fire({ addedOrUpdated: [addedOrUpdated] });
    }
  }
  registerMockAgents() {
    const agentIds = ["copilotcli", "copilot-cloud-agent"];
    const extensionId = new ExtensionIdentifier("vscode.sessions-e2e-mock");
    const self = this;
    for (const agentId of agentIds) {
      const agentData = {
        id: agentId,
        name: agentId,
        fullName: `Mock Agent (${agentId})`,
        description: "Mock chat agent for E2E testing",
        extensionId,
        extensionVersion: "0.0.1",
        extensionPublisherId: "vscode",
        extensionDisplayName: "Sessions E2E Mock",
        isDefault: true,
        metadata: {},
        slashCommands: [],
        locations: [ChatAgentLocation.Chat],
        modes: [ChatModeKind.Agent],
        disambiguation: []
      };
      const agentImpl = {
        async invoke(request, progress, _history, _token) {
          console.log(`[Sessions Web Test] Mock agent "${agentId}" invoked: "${request.message}"`);
          const response = getMockResponseWithEdits(request.message);
          progress([{
            kind: "markdownContent",
            content: { value: response.text, isTrusted: false, supportThemeIcons: false, supportHtml: false }
          }]);
          if (response.fileEdits) {
            emitFileEdits(response.fileEdits, progress);
            console.log(`[Sessions Web Test] Emitted ${response.fileEdits.length} file edits`);
          }
          self.addSessionItem(request.sessionResource, request.message, response.text, response.fileEdits);
          return { metadata: { mock: true } };
        }
      };
      try {
        this._register(this.chatAgentService.registerDynamicAgent(agentData, agentImpl));
        console.log(`[Sessions Web Test] Registered mock agent: ${agentId}`);
      } catch (err) {
        console.warn(`[Sessions Web Test] Failed to register agent ${agentId}:`, err);
      }
    }
  }
  registerMockSessionProvider() {
    const schemes = ["copilotcli", "copilot-cloud-agent"];
    const self = this;
    for (const scheme of schemes) {
      try {
        this._register(this.chatSessionsService.registerChatSessionContentProvider(scheme, {
          async provideChatSessionContent(sessionResource, _token) {
            const key = sessionResource.toString();
            const history = self._sessionHistory.get(key) ?? [];
            console.log(`[Sessions Web Test] Opening session ${key} (${history.length} history items)`);
            const disposeEmitter = new Emitter();
            const isComplete = observableValue("isComplete", history.length > 0);
            return {
              sessionResource,
              history,
              isCompleteObs: isComplete,
              onWillDispose: disposeEmitter.event,
              async requestHandler(request, progress, _history, _token2) {
                console.log(`[Sessions Web Test] Session request: "${request.message}"`);
                const response = getMockResponseWithEdits(request.message);
                progress([{
                  kind: "markdownContent",
                  content: { value: response.text, isTrusted: false, supportThemeIcons: false, supportHtml: false }
                }]);
                if (response.fileEdits) {
                  emitFileEdits(response.fileEdits, progress);
                }
                isComplete.set(true, void 0);
              },
              dispose() {
                disposeEmitter.fire();
                disposeEmitter.dispose();
              }
            };
          }
        }));
        const items = this._sessionItems;
        this._register(this.chatSessionsService.registerChatSessionItemController(scheme, {
          onDidChangeChatSessionItems: this._itemsChangedEmitter.event,
          get items() {
            return items;
          },
          async refresh() {
          }
        }));
        console.log(`[Sessions Web Test] Registered session provider for scheme: ${scheme}`);
      } catch (err) {
        console.warn(`[Sessions Web Test] Failed to register session provider for ${scheme}:`, err);
      }
    }
  }
  preseedFolder() {
    const mockFolderUri = URI.from({ scheme: "mock-fs", authority: "mock-repo", path: "/mock-repo" }).toString();
    this.storageService.store(
      "agentSessions.lastPickedFolder",
      mockFolderUri,
      0,
      1
      /* StorageTarget.MACHINE */
    );
    console.log(`[Sessions Web Test] Pre-seeded folder: ${mockFolderUri}`);
  }
};
MockChatAgentContribution = __decorate([
  __param(0, IChatAgentService),
  __param(1, IStorageService),
  __param(2, IChatSessionsService)
], MockChatAgentContribution);
registerWorkbenchContribution2(
  MockChatAgentContribution.ID,
  MockChatAgentContribution,
  1
  /* WorkbenchPhase.BlockStartup */
);
class MockGitService {
  static {
    __name(this, "MockGitService");
  }
  constructor() {
    this.repositories = [];
  }
  setDelegate(_delegate) {
    return Disposable.None;
  }
  async openRepository(_uri) {
    return void 0;
  }
}
class TestSessionsBrowserMain extends SessionsBrowserMain {
  static {
    __name(this, "TestSessionsBrowserMain");
  }
  createWorkbench(domElement, serviceCollection, logService) {
    console.log("[Sessions Web Test] Injecting mock services");
    registerMockFileSystemProvider(serviceCollection);
    serviceCollection.set(IChatEntitlementService, new MockChatEntitlementService());
    serviceCollection.set(IDefaultAccountService, new MockDefaultAccountService());
    serviceCollection.set(IGitService, new MockGitService());
    console.log("[Sessions Web Test] Creating Sessions workbench with mocks");
    return new SessionsWorkbench(domElement, void 0, serviceCollection, logService);
  }
}
export {
  TestSessionsBrowserMain
};
//# sourceMappingURL=web.test.js.map
