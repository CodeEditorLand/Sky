import{strictEqual as t}from"assert";import{$Ibb as o}from"../../../../../../base/test/common/utils.js";import{$DCc as e}from"../../browser/executeStrategy/executeStrategy.js";suite("Execute Strategy - Prompt Detection",()=>{o(),test("detectsCommonPromptPattern should detect PowerShell prompts",()=>{t(e("PS C:\\>").detected,!0),t(e("PS C:\\Windows\\System32>").detected,!0),t(e("PS C:\\Users\\test> ").detected,!0)}),test("detectsCommonPromptPattern should detect Command Prompt",()=>{t(e("C:\\>").detected,!0),t(e("C:\\Windows\\System32>").detected,!0),t(e("D:\\test> ").detected,!0)}),test("detectsCommonPromptPattern should detect Bash prompts",()=>{t(e("user@host:~$ ").detected,!0),t(e("$ ").detected,!0),t(e("[user@host ~]$ ").detected,!0)}),test("detectsCommonPromptPattern should detect root prompts",()=>{t(e("root@host:~# ").detected,!0),t(e("# ").detected,!0),t(e("[root@host ~]# ").detected,!0)}),test("detectsCommonPromptPattern should detect Python REPL",()=>{t(e(">>> ").detected,!0),t(e(">>>").detected,!0)}),test("detectsCommonPromptPattern should detect starship prompts",()=>{t(e("~ \u276F ").detected,!0),t(e("/path/to/project \u276F").detected,!0)}),test("detectsCommonPromptPattern should detect generic prompts",()=>{t(e("test> ").detected,!0),t(e("someprompt% ").detected,!0)}),test("detectsCommonPromptPattern should handle multiline content",()=>{t(e(`command output line 1
command output line 2
user@host:~$ `).detected,!0)}),test("detectsCommonPromptPattern should reject non-prompt content",()=>{t(e("just some output").detected,!1),t(e("error: command not found").detected,!1),t(e("").detected,!1),t(e("   ").detected,!1)}),test("detectsCommonPromptPattern should handle edge cases",()=>{t(e(`output


`).detected,!1),t(e(`

$ 

`).detected,!0),t(e(`output
PS C:\\> `).detected,!0)})});
