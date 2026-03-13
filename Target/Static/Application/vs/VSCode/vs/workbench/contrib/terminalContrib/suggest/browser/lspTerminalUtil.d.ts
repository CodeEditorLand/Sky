export declare const VSCODE_LSP_TERMINAL_PROMPT_TRACKER = "vscode_lsp_terminal_prompt_tracker= {}\n";
export declare const terminalLspSupportedLanguages: Set<{
    shellType: string;
    languageId: string;
    extension: string;
}>;
export declare function getTerminalLspSupportedLanguageObj(shellType: string): {
    shellType: string;
    languageId: string;
    extension: string;
} | undefined;
