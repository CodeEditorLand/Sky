import{strictEqual as e}from"assert";import{$Ibb as s}from"../../../../../../base/test/common/utils.js";import{$0l as a}from"../../../../../../platform/configuration/common/configuration.js";import{$jTc as r}from"../../../../../../platform/configuration/test/common/testConfigurationService.js";import{$Mp as c}from"../../../../../../platform/dialogs/common/dialogs.js";import{$kTc as l}from"../../../../../../platform/dialogs/test/common/testDialogService.js";import{$oTc as d}from"../../../../../../platform/instantiation/test/common/instantiationServiceMock.js";import{$_Dc as i}from"../../browser/terminalClipboard.js";suite("TerminalClipboard",function(){const u=s();suite("shouldPasteTerminalText",()=>{let n,o;setup(async()=>{n=u.add(new d),o=new r({"terminal.integrated.enableMultiLinePasteWarning":"auto"}),n.stub(a,o),n.stub(c,new l(void 0,{result:{confirmed:!1}}))});function t(f){o=new r({"terminal.integrated.enableMultiLinePasteWarning":f}),n.stub(a,o)}test("Single line string",async()=>{e(await n.invokeFunction(i,"foo",void 0),!0),t("always"),e(await n.invokeFunction(i,"foo",void 0),!0),t("never"),e(await n.invokeFunction(i,"foo",void 0),!0)}),test("Single line string with trailing new line",async()=>{e(await n.invokeFunction(i,`foo
`,void 0),!0),t("always"),e(await n.invokeFunction(i,`foo
`,void 0),!1),t("never"),e(await n.invokeFunction(i,`foo
`,void 0),!0)}),test("Multi-line string",async()=>{e(await n.invokeFunction(i,`foo
bar`,void 0),!1),t("always"),e(await n.invokeFunction(i,`foo
bar`,void 0),!1),t("never"),e(await n.invokeFunction(i,`foo
bar`,void 0),!0)}),test("Bracketed paste mode",async()=>{e(await n.invokeFunction(i,`foo
bar`,!0),!0),t("always"),e(await n.invokeFunction(i,`foo
bar`,!0),!1),t("never"),e(await n.invokeFunction(i,`foo
bar`,!0),!0)}),test("Legacy config",async()=>{t(!0),e(await n.invokeFunction(i,`foo
bar`,void 0),!1),e(await n.invokeFunction(i,`foo
bar`,!0),!0),t(!1),e(await n.invokeFunction(i,`foo
bar`,!0),!0)}),test("Invalid config",async()=>{t(123),e(await n.invokeFunction(i,`foo
bar`,void 0),!1),e(await n.invokeFunction(i,`foo
bar`,!0),!0)})})});
