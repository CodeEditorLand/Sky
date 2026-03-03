/**
 * @module NativeModulePolyfill
 *
 * @description
 * Polyfill for native Electron modules that the workbench imports.
 * Intercepts `require('electron')` calls and provides shim implementations
 * over Tauri instead of actual Electron modules.
 *
 * @feature_set
 * - Intercept `require('electron')` calls
 * - Provide Electron module APIs as shims over Tauri
 * - Handle `electron.ipcRenderer`, `electron.webFrame`, etc.
 * - Return polyfill implementations instead of actual Electron modules
 *
 * @electron_modules_supported
 * - `electron` → Main Electron module with all sub-modules
 * - `electron.ipcRenderer` → IPCRendererShim
 * - `electron.webFrame` → WebFrame polyfill
 * - `electron.remote` → Not supported (no main process access)
 * - `electron.shell` → Shell operations via Tauri
 * - `electron.dialog` → Dialog via Tauri
 * - `electron.clipboard` → Clipboard via Tauri
 * - `electron.app` → Mock app object
 * - `electron.screen` → Screen via Tauri
 * - `electron.nativeTheme` → NativeTheme via Tauri
 * - `electron.contextBridge` → Not needed (no context isolation in same window)
 *
 * @phase 7 of Approach A3 implementation
 */
/**
 * Electron-like module structure
 */
interface ElectronModule {
    ipcRenderer: IpcRenderer;
    webFrame: WebFrame;
    app: App;
    screen: Screen;
    shell: Shell;
    dialog: Dialog;
    clipboard: Clipboard;
    nativeTheme: NativeTheme;
    BrowserWindow: BrowserWindow;
}
/**
 * Import VSCode types for compatibility
 */
import type { IpcRenderer } from "@codeeditorland/output/vs/base/parts/sandbox/electron-browser/electronTypes";
/**
 * WebFrame interface (partial)
 */
interface WebFrame {
    setZoomLevel(level: number): void;
    setZoomFactor(factor: number): void;
    getZoomFactor(): number;
    getZoomLevel(): number;
    insertCSS(css: string): void;
    insertText(text: string): void;
}
/**
 * App interface (partial, mock for renderer)
 */
interface App {
    getName(): string;
    getVersion(): string;
    getLocale(): string;
    isReady(): boolean;
    whenReady(): Promise<void>;
}
/**
 * Screen interface (partial)
 */
interface Screen {
    getDisplayNearestPoint(point: {
        x: number;
        y: number;
    }): {
        id: number;
        bounds: {
            x: number;
            y: number;
            width: number;
            height: number;
        };
    };
    getPrimaryDisplay(): {
        id: number;
        bounds: {
            x: number;
            y: number;
            width: number;
            height: number;
        };
    };
    getAllDisplays(): Array<{
        id: number;
        bounds: {
            x: number;
            y: number;
            width: number;
            height: number;
        };
    }>;
}
/**
 * Shell interface (partial)
 */
interface Shell {
    openExternal(url: string): Promise<void>;
    openPath(path: string): Promise<string>;
    showItemInFolder(path: string): Promise<void>;
    trashItem(path: string): Promise<void>;
    beep(): void;
}
/**
 * Dialog interface (partial)
 */
interface Dialog {
    showOpenDialog(options?: unknown): Promise<{
        filePaths: string[];
        canceled: boolean;
    }>;
    showSaveDialog(options?: unknown): Promise<{
        filePath: string | undefined;
        canceled: boolean;
    }>;
    showMessage(message: string): void;
    showError(message: string): void;
}
/**
 * Clipboard interface (partial)
 */
interface Clipboard {
    writeText(text: string): Promise<void>;
    readText(): Promise<string>;
    writeBuffer(format: string, buffer: Buffer): Promise<void>;
    readBuffer(format: string): Promise<Buffer | undefined>;
    clear(): void;
}
/**
 * NativeTheme interface (partial)
 */
interface NativeTheme {
    shouldUseDarkColors: boolean;
    shouldUseInvertedColorScheme: boolean;
    theme: "system" | "light" | "dark";
}
/**
 * BrowserWindow interface (partial, mock for renderer)
 */
interface BrowserWindow {
    id: number;
    isFocused(): boolean;
    focus(): void;
    show(): void;
    hide(): void;
    close(): void;
    isMaximizable(): boolean;
    isMinimizable(): boolean;
    getBounds(): {
        x: number;
        y: number;
        width: number;
        height: number;
    };
}
/**
 * Create WebFrame polyfill
 */
declare function createWebFrame(): WebFrame;
/**
 * Create App mock
 */
declare function createApp(): App;
/**
 * Create Screen polyfill
 */
declare function createScreen(): Screen;
/**
 * Create Shell polyfill
 */
declare function createShell(): Shell;
/**
 * Create Dialog polyfill
 */
declare function createDialog(): Dialog;
/**
 * Create Clipboard polyfill
 */
declare function createClipboard(): Clipboard;
/**
 * Create NativeTheme polyfill
 */
declare function createNativeTheme(): NativeTheme;
/**
 * Create BrowserWindow mock for renderer process
 */
declare function createBrowserWindow(): BrowserWindow;
/**
 * Create Electron module with all sub-modules
 */
declare function createElectronModule(): ElectronModule;
/**
 * Install the native module polyfill
 */
export declare function installNativeModulePolyfill(): void;
declare const _default: {
    install: typeof installNativeModulePolyfill;
    createElectronModule: typeof createElectronModule;
    createWebFrame: typeof createWebFrame;
    createApp: typeof createApp;
    createScreen: typeof createScreen;
    createShell: typeof createShell;
    createDialog: typeof createDialog;
    createClipboard: typeof createClipboard;
    createNativeTheme: typeof createNativeTheme;
    createBrowserWindow: typeof createBrowserWindow;
};
export default _default;
//# sourceMappingURL=NativeModulePolyfill.d.ts.map