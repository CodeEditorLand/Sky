var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var require_extension = __commonJS({
  "../../Dependency/Microsoft/Dependency/Editor/out/vs/sessions/test/e2e/extensions/sessions-e2e-mock/extension.js"(exports, module) {
    function activate(context) {
      const vscode = require("vscode");
      console.log("[sessions-e2e-mock] Activating mock extension");
      context.subscriptions.push(registerMockAuth(vscode));
      console.log("[sessions-e2e-mock] All mocks registered");
    }
    __name(activate, "activate");
    function registerMockAuth(vscode) {
      const sessionChangeEmitter = new vscode.EventEmitter();
      const mockSession = {
        id: "mock-session-1",
        accessToken: "gho_mock_e2e_test_token_00000000000000000000",
        account: {
          id: "e2e-test-user",
          label: "E2E Test User"
        },
        scopes: ["read:user", "repo", "workflow"]
      };
      const provider = {
        onDidChangeSessions: sessionChangeEmitter.event,
        async getSessions(_scopes, _options) {
          return [mockSession];
        },
        async createSession(_scopes, _options) {
          sessionChangeEmitter.fire({ added: [mockSession], removed: [], changed: [] });
          return mockSession;
        },
        async removeSession(_sessionId) {
          sessionChangeEmitter.fire({ added: [], removed: [mockSession], changed: [] });
        }
      };
      console.log("[sessions-e2e-mock] Registering mock GitHub auth provider");
      return vscode.authentication.registerAuthenticationProvider("github", "GitHub (Mock)", provider, {
        supportsMultipleAccounts: false
      });
    }
    __name(registerMockAuth, "registerMockAuth");
    module.exports = { activate };
  }
});
export default require_extension();
//# sourceMappingURL=extension.js.map
