import assert from "assert";
import { URI } from "../../../../../base/common/uri.js";
import { Registry } from "../../../../../platform/registry/common/platform.js";
import { Extensions as ConfigurationExtensions } from "../../../../../platform/configuration/common/configurationRegistry.js";
import { FileService } from "../../../../../platform/files/common/fileService.js";
import { NullLogService } from "../../../../../platform/log/common/log.js";
import { NullPolicyService } from "../../../../../platform/policy/common/policy.js";
import { VSBuffer } from "../../../../../base/common/buffer.js";
import { UriIdentityService } from "../../../../../platform/uriIdentity/common/uriIdentityService.js";
import { InMemoryFileSystemProvider } from "../../../../../platform/files/common/inMemoryFilesystemProvider.js";
import { joinPath } from "../../../../../base/common/resources.js";
import { Schemas } from "../../../../../base/common/network.js";
import { UserDataProfilesService } from "../../../../../platform/userDataProfile/common/userDataProfile.js";
import { UserDataProfileService } from "../../../../../workbench/services/userDataProfile/common/userDataProfileService.js";
import { FileUserDataProvider } from "../../../../../platform/userData/common/fileUserDataProvider.js";
import { TestEnvironmentService } from "../../../../../workbench/test/browser/workbenchTestServices.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../../base/test/common/utils.js";
import { runWithFakedTimers } from "../../../../../base/test/common/timeTravelScheduler.js";
import { ConfigurationService } from "../../browser/configurationService.js";
import { SessionsWorkspaceContextService } from "../../../workspace/browser/workspaceContextService.js";
import { getWorkspaceIdentifier } from "../../../../../workbench/services/workspaces/browser/workspaces.js";
import { Event } from "../../../../../base/common/event.js";
const ROOT = URI.file("tests").with({ scheme: "vscode-tests" });
suite("Sessions ConfigurationService", () => {
  let testObject;
  let workspaceService;
  let fileService;
  let userDataProfileService;
  const configurationRegistry = Registry.as(ConfigurationExtensions.Configuration);
  const disposables = ensureNoDisposablesAreLeakedInTestSuite();
  suiteSetup(() => {
    configurationRegistry.registerConfiguration({
      "id": "_test_sessions",
      "type": "object",
      "properties": {
        "sessionsConfigurationService.testSetting": {
          "type": "string",
          "default": "defaultValue",
          scope: 5
          /* ConfigurationScope.RESOURCE */
        },
        "sessionsConfigurationService.machineSetting": {
          "type": "string",
          "default": "defaultValue",
          scope: 2
          /* ConfigurationScope.MACHINE */
        },
        "sessionsConfigurationService.applicationSetting": {
          "type": "string",
          "default": "defaultValue",
          scope: 1
          /* ConfigurationScope.APPLICATION */
        }
      }
    });
  });
  setup(async () => {
    const logService = new NullLogService();
    fileService = disposables.add(new FileService(logService));
    const fileSystemProvider = disposables.add(new InMemoryFileSystemProvider());
    disposables.add(fileService.registerProvider(ROOT.scheme, fileSystemProvider));
    const environmentService = TestEnvironmentService;
    const uriIdentityService = disposables.add(new UriIdentityService(fileService));
    const userDataProfilesService = disposables.add(new UserDataProfilesService(environmentService, fileService, uriIdentityService, logService));
    disposables.add(fileService.registerProvider(Schemas.vscodeUserData, disposables.add(new FileUserDataProvider(ROOT.scheme, fileSystemProvider, Schemas.vscodeUserData, userDataProfilesService, uriIdentityService, logService))));
    userDataProfileService = disposables.add(new UserDataProfileService(userDataProfilesService.defaultProfile));
    const configResource = joinPath(ROOT, "agent-sessions.code-workspace");
    await fileService.writeFile(configResource, VSBuffer.fromString(JSON.stringify({ folders: [] })));
    workspaceService = disposables.add(new SessionsWorkspaceContextService(getWorkspaceIdentifier(configResource), uriIdentityService));
    testObject = disposables.add(new ConfigurationService(userDataProfileService, workspaceService, uriIdentityService, fileService, new NullPolicyService(), logService));
    await testObject.initialize();
  });
  test("defaults", () => {
    assert.strictEqual(testObject.getValue("sessionsConfigurationService.testSetting"), "defaultValue");
    assert.strictEqual(testObject.getValue("sessionsConfigurationService.machineSetting"), "defaultValue");
    assert.strictEqual(testObject.getValue("sessionsConfigurationService.applicationSetting"), "defaultValue");
  });
  test("user settings override defaults", () => runWithFakedTimers({ useFakeTimers: true }, async () => {
    await fileService.writeFile(userDataProfileService.currentProfile.settingsResource, VSBuffer.fromString('{ "sessionsConfigurationService.testSetting": "userValue" }'));
    await testObject.reloadConfiguration();
    assert.strictEqual(testObject.getValue("sessionsConfigurationService.testSetting"), "userValue");
  }));
  test("workspace folder settings override user settings", () => runWithFakedTimers({ useFakeTimers: true }, async () => {
    const folder = joinPath(ROOT, "myFolder");
    await fileService.createFolder(folder);
    await fileService.writeFile(userDataProfileService.currentProfile.settingsResource, VSBuffer.fromString('{ "sessionsConfigurationService.testSetting": "userValue" }'));
    await testObject.reloadConfiguration();
    await fileService.writeFile(joinPath(folder, ".vscode", "settings.json"), VSBuffer.fromString('{ "sessionsConfigurationService.testSetting": "folderValue" }'));
    await workspaceService.addFolders([{ uri: folder }]);
    assert.strictEqual(testObject.getValue("sessionsConfigurationService.testSetting", { resource: folder }), "folderValue");
  }));
  test("folder settings are read when folders are added", () => runWithFakedTimers({ useFakeTimers: true }, async () => {
    const folder = joinPath(ROOT, "addedFolder");
    await fileService.createFolder(folder);
    await fileService.writeFile(joinPath(folder, ".vscode", "settings.json"), VSBuffer.fromString('{ "sessionsConfigurationService.testSetting": "folderValue" }'));
    await workspaceService.addFolders([{ uri: folder }]);
    assert.strictEqual(testObject.getValue("sessionsConfigurationService.testSetting", { resource: folder }), "folderValue");
  }));
  test("folder settings are removed when folders are removed", () => runWithFakedTimers({ useFakeTimers: true }, async () => {
    const folder = joinPath(ROOT, "removedFolder");
    await fileService.createFolder(folder);
    await fileService.writeFile(joinPath(folder, ".vscode", "settings.json"), VSBuffer.fromString('{ "sessionsConfigurationService.testSetting": "folderValue" }'));
    await workspaceService.addFolders([{ uri: folder }]);
    assert.strictEqual(testObject.getValue("sessionsConfigurationService.testSetting", { resource: folder }), "folderValue");
    await workspaceService.removeFolders([folder]);
    assert.strictEqual(testObject.getValue("sessionsConfigurationService.testSetting", { resource: folder }), "defaultValue");
  }));
  test("configuration change event is fired when folders with settings are removed", () => runWithFakedTimers({ useFakeTimers: true }, async () => {
    const folder = joinPath(ROOT, "removedFolder2");
    await fileService.createFolder(folder);
    await fileService.writeFile(joinPath(folder, ".vscode", "settings.json"), VSBuffer.fromString('{ "sessionsConfigurationService.testSetting": "folderValue" }'));
    await workspaceService.addFolders([{ uri: folder }]);
    assert.strictEqual(testObject.getValue("sessionsConfigurationService.testSetting", { resource: folder }), "folderValue");
    const promise = Event.toPromise(testObject.onDidChangeConfiguration);
    await workspaceService.removeFolders([folder]);
    const event = await promise;
    assert.ok(event.affectsConfiguration("sessionsConfigurationService.testSetting"));
    assert.strictEqual(testObject.getValue("sessionsConfigurationService.testSetting", { resource: folder }), "defaultValue");
  }));
  test("configuration change event is fired on user settings change", () => runWithFakedTimers({ useFakeTimers: true }, async () => {
    const promise = Event.toPromise(testObject.onDidChangeConfiguration);
    await fileService.writeFile(userDataProfileService.currentProfile.settingsResource, VSBuffer.fromString('{ "sessionsConfigurationService.testSetting": "userValue" }'));
    await testObject.reloadConfiguration();
    const event = await promise;
    assert.ok(event.affectsConfiguration("sessionsConfigurationService.testSetting"));
  }));
  test("inspect returns correct values per layer", () => runWithFakedTimers({ useFakeTimers: true }, async () => {
    const folder = joinPath(ROOT, "inspectFolder");
    await fileService.createFolder(folder);
    await fileService.writeFile(userDataProfileService.currentProfile.settingsResource, VSBuffer.fromString('{ "sessionsConfigurationService.testSetting": "userValue" }'));
    await testObject.reloadConfiguration();
    await fileService.writeFile(joinPath(folder, ".vscode", "settings.json"), VSBuffer.fromString('{ "sessionsConfigurationService.testSetting": "folderValue" }'));
    await workspaceService.addFolders([{ uri: folder }]);
    const inspection = testObject.inspect("sessionsConfigurationService.testSetting", { resource: folder });
    assert.strictEqual(inspection.defaultValue, "defaultValue");
    assert.strictEqual(inspection.userValue, "userValue");
    assert.strictEqual(inspection.workspaceFolderValue, "folderValue");
  }));
  test("application settings are not read from workspace folder", () => runWithFakedTimers({ useFakeTimers: true }, async () => {
    const folder = joinPath(ROOT, "appFolder");
    await fileService.createFolder(folder);
    await fileService.writeFile(joinPath(folder, ".vscode", "settings.json"), VSBuffer.fromString('{ "sessionsConfigurationService.applicationSetting": "folderValue" }'));
    await workspaceService.addFolders([{ uri: folder }]);
    assert.strictEqual(testObject.getValue("sessionsConfigurationService.applicationSetting", { resource: folder }), "defaultValue");
  }));
  test("machine settings are not read from workspace folder", () => runWithFakedTimers({ useFakeTimers: true }, async () => {
    const folder = joinPath(ROOT, "machineFolder");
    await fileService.createFolder(folder);
    await fileService.writeFile(joinPath(folder, ".vscode", "settings.json"), VSBuffer.fromString('{ "sessionsConfigurationService.machineSetting": "folderValue" }'));
    await workspaceService.addFolders([{ uri: folder }]);
    assert.strictEqual(testObject.getValue("sessionsConfigurationService.machineSetting", { resource: folder }), "defaultValue");
  }));
  test("folder settings change fires configuration change event", () => runWithFakedTimers({ useFakeTimers: true }, async () => {
    const folder = joinPath(ROOT, "changeFolder");
    await fileService.createFolder(folder);
    await fileService.writeFile(joinPath(folder, ".vscode", "settings.json"), VSBuffer.fromString('{ "sessionsConfigurationService.testSetting": "initialValue" }'));
    await workspaceService.addFolders([{ uri: folder }]);
    assert.strictEqual(testObject.getValue("sessionsConfigurationService.testSetting", { resource: folder }), "initialValue");
    const promise = Event.toPromise(testObject.onDidChangeConfiguration);
    await fileService.writeFile(joinPath(folder, ".vscode", "settings.json"), VSBuffer.fromString('{ "sessionsConfigurationService.testSetting": "updatedValue" }'));
    const event = await promise;
    assert.ok(event.affectsConfiguration("sessionsConfigurationService.testSetting"));
    assert.strictEqual(testObject.getValue("sessionsConfigurationService.testSetting", { resource: folder }), "updatedValue");
  }));
  test("updateValue writes to user settings", () => runWithFakedTimers({ useFakeTimers: true }, async () => {
    await testObject.updateValue("sessionsConfigurationService.testSetting", "writtenValue");
    assert.strictEqual(testObject.getValue("sessionsConfigurationService.testSetting"), "writtenValue");
  }));
  test("updateValue persists to settings file", () => runWithFakedTimers({ useFakeTimers: true }, async () => {
    await testObject.updateValue("sessionsConfigurationService.testSetting", "persistedValue");
    const content = (await fileService.readFile(userDataProfileService.currentProfile.settingsResource)).value.toString();
    assert.ok(content.includes('"sessionsConfigurationService.testSetting"'));
    assert.ok(content.includes("persistedValue"));
  }));
  test("updateValue fires change event", () => runWithFakedTimers({ useFakeTimers: true }, async () => {
    const promise = Event.toPromise(testObject.onDidChangeConfiguration);
    await testObject.updateValue("sessionsConfigurationService.testSetting", "eventValue");
    const event = await promise;
    assert.ok(event.affectsConfiguration("sessionsConfigurationService.testSetting"));
  }));
  test("updateValue removes setting when value equals default", () => runWithFakedTimers({ useFakeTimers: true }, async () => {
    await testObject.updateValue("sessionsConfigurationService.testSetting", "nonDefault");
    assert.strictEqual(testObject.getValue("sessionsConfigurationService.testSetting"), "nonDefault");
    await testObject.updateValue("sessionsConfigurationService.testSetting", "defaultValue");
    const content = (await fileService.readFile(userDataProfileService.currentProfile.settingsResource)).value.toString();
    assert.ok(!content.includes("sessionsConfigurationService.testSetting"));
  }));
  test("updateValue can update multiple settings", () => runWithFakedTimers({ useFakeTimers: true }, async () => {
    await testObject.updateValue("sessionsConfigurationService.testSetting", "value1");
    await testObject.updateValue("sessionsConfigurationService.machineSetting", "value2");
    assert.strictEqual(testObject.getValue("sessionsConfigurationService.testSetting"), "value1");
    assert.strictEqual(testObject.getValue("sessionsConfigurationService.machineSetting"), "value2");
  }));
  test("updateValue with language override", () => runWithFakedTimers({ useFakeTimers: true }, async () => {
    await testObject.updateValue("sessionsConfigurationService.testSetting", "langValue", { overrideIdentifier: "jsonc" });
    assert.strictEqual(testObject.getValue("sessionsConfigurationService.testSetting", { overrideIdentifier: "jsonc" }), "langValue");
    assert.strictEqual(testObject.getValue("sessionsConfigurationService.testSetting"), "defaultValue");
  }));
  test("updateValue is reflected in inspect", () => runWithFakedTimers({ useFakeTimers: true }, async () => {
    await testObject.updateValue("sessionsConfigurationService.testSetting", "inspectedValue");
    const inspection = testObject.inspect("sessionsConfigurationService.testSetting");
    assert.strictEqual(inspection.defaultValue, "defaultValue");
    assert.strictEqual(inspection.userValue, "inspectedValue");
  }));
  test("read setting from workspace folder", () => runWithFakedTimers({ useFakeTimers: true }, async () => {
    const folder = joinPath(ROOT, "readFolder");
    await fileService.createFolder(folder);
    await fileService.writeFile(joinPath(folder, ".vscode", "settings.json"), VSBuffer.fromString('{ "sessionsConfigurationService.testSetting": "folderValue" }'));
    await workspaceService.addFolders([{ uri: folder }]);
    assert.strictEqual(testObject.getValue("sessionsConfigurationService.testSetting", { resource: folder }), "folderValue");
    assert.strictEqual(testObject.getValue("sessionsConfigurationService.testSetting"), "defaultValue");
  }));
  test("write setting to workspace folder", () => runWithFakedTimers({ useFakeTimers: true }, async () => {
    const folder = joinPath(ROOT, "writeFolder");
    await fileService.createFolder(folder);
    await workspaceService.addFolders([{ uri: folder }]);
    await testObject.updateValue(
      "sessionsConfigurationService.testSetting",
      "writtenFolderValue",
      { resource: folder },
      6
      /* ConfigurationTarget.WORKSPACE_FOLDER */
    );
    assert.strictEqual(testObject.getValue("sessionsConfigurationService.testSetting", { resource: folder }), "writtenFolderValue");
  }));
  test("write setting to workspace folder persists to folder settings file", () => runWithFakedTimers({ useFakeTimers: true }, async () => {
    const folder = joinPath(ROOT, "persistFolder");
    await fileService.createFolder(folder);
    await workspaceService.addFolders([{ uri: folder }]);
    await testObject.updateValue(
      "sessionsConfigurationService.testSetting",
      "persistedFolderValue",
      { resource: folder },
      6
      /* ConfigurationTarget.WORKSPACE_FOLDER */
    );
    const content = (await fileService.readFile(joinPath(folder, ".vscode", "settings.json"))).value.toString();
    assert.ok(content.includes('"sessionsConfigurationService.testSetting"'));
    assert.ok(content.includes("persistedFolderValue"));
  }));
  test("write setting to workspace folder does not affect user settings", () => runWithFakedTimers({ useFakeTimers: true }, async () => {
    const folder = joinPath(ROOT, "isolateFolder");
    await fileService.createFolder(folder);
    await workspaceService.addFolders([{ uri: folder }]);
    await testObject.updateValue(
      "sessionsConfigurationService.testSetting",
      "folderOnly",
      { resource: folder },
      6
      /* ConfigurationTarget.WORKSPACE_FOLDER */
    );
    assert.strictEqual(testObject.getValue("sessionsConfigurationService.testSetting", { resource: folder }), "folderOnly");
    assert.strictEqual(testObject.getValue("sessionsConfigurationService.testSetting"), "defaultValue");
  }));
  test("workspace folder setting overrides user setting for resource", () => runWithFakedTimers({ useFakeTimers: true }, async () => {
    const folder = joinPath(ROOT, "overrideFolder");
    await fileService.createFolder(folder);
    await workspaceService.addFolders([{ uri: folder }]);
    await testObject.updateValue("sessionsConfigurationService.testSetting", "userValue");
    await testObject.updateValue(
      "sessionsConfigurationService.testSetting",
      "folderValue",
      { resource: folder },
      6
      /* ConfigurationTarget.WORKSPACE_FOLDER */
    );
    assert.strictEqual(testObject.getValue("sessionsConfigurationService.testSetting", { resource: folder }), "folderValue");
    assert.strictEqual(testObject.getValue("sessionsConfigurationService.testSetting"), "userValue");
  }));
  test("inspect shows workspace folder value after write", () => runWithFakedTimers({ useFakeTimers: true }, async () => {
    const folder = joinPath(ROOT, "inspectWriteFolder");
    await fileService.createFolder(folder);
    await workspaceService.addFolders([{ uri: folder }]);
    await testObject.updateValue("sessionsConfigurationService.testSetting", "userVal");
    await testObject.updateValue(
      "sessionsConfigurationService.testSetting",
      "folderVal",
      { resource: folder },
      6
      /* ConfigurationTarget.WORKSPACE_FOLDER */
    );
    const inspection = testObject.inspect("sessionsConfigurationService.testSetting", { resource: folder });
    assert.strictEqual(inspection.defaultValue, "defaultValue");
    assert.strictEqual(inspection.userValue, "userVal");
    assert.strictEqual(inspection.workspaceFolderValue, "folderVal");
  }));
  test("removing folder clears its written settings", () => runWithFakedTimers({ useFakeTimers: true }, async () => {
    const folder = joinPath(ROOT, "clearFolder");
    await fileService.createFolder(folder);
    await workspaceService.addFolders([{ uri: folder }]);
    await testObject.updateValue(
      "sessionsConfigurationService.testSetting",
      "folderValue",
      { resource: folder },
      6
      /* ConfigurationTarget.WORKSPACE_FOLDER */
    );
    assert.strictEqual(testObject.getValue("sessionsConfigurationService.testSetting", { resource: folder }), "folderValue");
    await workspaceService.removeFolders([folder]);
    assert.strictEqual(testObject.getValue("sessionsConfigurationService.testSetting", { resource: folder }), "defaultValue");
  }));
});
//# sourceMappingURL=configurationService.test.js.map
