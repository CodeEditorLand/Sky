/**
 * @module ChildProcessPolyfill
 *
 * @description
 * Polyfill for Node.js child_process module in the renderer sandbox.
 * Maps child process operations to Mountain and Cocoon commands.
 *
 * @feature_set
 * - spawn(command, args, options) → Mountain electron:spawn_child_process
 * - exec(command, options) → Mountain electron:exec_command
 * - fork(modulePath, args, options) → Mountain electron:fork_extension_host (for Cocoon)
 *
 * @return_types
 * ChildProcess-like objects with:
 * - pid, killed, exitCode, signalCode
 * - stdin, stdout, stderr (mock with event handling)
 * - on(event, listener), emit(event, ...args)
 * - kill(signal)
 *
 * @phase 5 of Approach A3 implementation
 */
/**
 * Spawn options
 */
interface SpawnOptions {
    cwd?: string;
    env?: Record<string, string>;
    stdio?: Array<"pipe" | "ignore" | "inherit" | Stream | number | null> | "pipe" | "ignore" | "inherit";
    detached?: boolean;
    shell?: boolean | string;
    windowsVerbatimArguments?: boolean;
    windowsHide?: boolean;
    uid?: number;
    gid?: number;
    serialization?: "json" | "advanced";
}
/**
 * Exec options
 */
interface ExecOptions {
    cwd?: string;
    env?: Record<string, string>;
    encoding?: BufferEncoding;
    timeout?: number;
    maxBuffer?: number;
    killSignal?: string;
    uid?: number;
    gid?: number;
    shell?: string | boolean;
    windowsHide?: boolean;
}
/**
 * Fork options
 */
interface ForkOptions {
    cwd?: string;
    env?: Record<string, string>;
    execPath?: string;
    execArgv?: string[];
    silent?: boolean;
    stdio?: Array<"pipe" | "ignore" | "inherit" | Stream | number | null> | "pipe" | "ignore" | "inherit";
    detached?: boolean;
    windowsVerbatimArguments?: boolean;
    windowsHide?: boolean;
    uid?: number;
    gid?: number;
    serialization?: "json" | "advanced";
}
/**
 * Kill signals
 */
type SignalNumber = 1 | 2 | 3 | 9 | 10 | 12 | 15 | 17 | 19;
type SignalString = "SIGHUP" | "SIGINT" | "SIGQUIT" | "SIGILL" | "SIGTRAP" | "SIGABRT" | "SIGIOT" | "SIGBUS" | "SIGFPE" | "SIGKILL" | "SIGUSR1" | "SIGSEGV" | "SIGUSR2" | "SIGPIPE" | "SIGALRM" | "SIGTERM" | "SIGCHLD" | "SIGCONT" | "SIGSTOP" | "SIGTSTP" | "SIGTTIN" | "SIGTTOU" | "SIGURG" | "SIGXCPU" | "SIGXFSZ" | "SIGVTALRM" | "SIGPROF" | "SIGWINCH" | "SIGIO" | "SIGPOLL" | "SIGPWR" | "SIGSYS";
type Signal = SignalNumber | SignalString;
/**
 * Child process event types
 */
type ChildProcessEvent = "close" | "disconnect" | "error" | "exit" | "message" | "spawn";
/**
 * Child process event listener
 */
type ChildProcessEventListener = (...args: unknown[]) => void;
/**
 * Mock Stream for stdin/stdout/stderr
 */
interface Stream {
    write(data: string | Buffer): boolean;
    end(data?: string | Buffer): void;
    on(event: string, listener: (...args: unknown[]) => void): void;
    removeAllListeners(event?: string): void;
    stdio?: Stream;
    fd?: number;
}
/**
 * ChildProcess class implementing mock child process behavior
 */
declare class ChildProcess {
    pid: number;
    killed: boolean;
    exitCode: number | null;
    signalCode: Signal | null;
    stdin: Stream;
    stdout: Stream;
    stderr: Stream;
    stdio: Stream[];
    private listeners;
    private _sPid;
    constructor(spawnId: string);
    /**
     * Set up Tauri event listeners for this process
     */
    private setupEventListeners;
    private _unlistenFunctions;
    /**
     * Add event listener
     */
    on(event: ChildProcessEvent, listener: ChildProcessEventListener): this;
    /**
     * Add one-time event listener
     */
    once(event: ChildProcessEvent, listener: ChildProcessEventListener): this;
    /**
     * Remove event listener
     */
    removeListener(event: ChildProcessEvent, listener: ChildProcessEventListener): this;
    /**
     * Remove all listeners for an event
     */
    removeAllListeners(event?: ChildProcessEvent): this;
    /**
     * Emit event to all listeners
     */
    private emit;
    /**
     * Kill the process
     */
    kill(signal?: Signal): boolean;
    /**
     * Send a message to the process (IPC)
     */
    send(message: unknown, sendHandle?: unknown, options?: {
        swallowErrors?: boolean;
    }): boolean;
    /**
     * Disconnect from the process
     */
    disconnect(): void;
    /**
     * Ref the process (keep it alive)
     */
    ref(): this;
    /**
     * Unref the process (allow it to exit)
     */
    unref(): this;
    /**
     * Cleanup resources
     */
    private cleanup;
}
/**
 * Spawn a child process
 */
declare function spawn(command: string, args?: string[], options?: SpawnOptions): ChildProcess;
/**
 * Execute a command and get output
 */
declare function exec(command: string, options?: ExecOptions, callback?: (error: Error | null, stdout: string, stderr: string) => void): ChildProcess;
/**
 * Exec with Promise
 */
declare function execPromise(command: string, options?: ExecOptions): Promise<{
    stdout: string;
    stderr: string;
}>;
/**
 * Fork a Node.js module as a child process
 * This is primarily used for extension hosts in VSCode
 */
declare function fork(modulePath: string, args?: string[], options?: ForkOptions): ChildProcess;
/**
 * Install the child process polyfill
 */
export declare function installChildProcessPolyfill(): void;
declare const _default: {
    install: typeof installChildProcessPolyfill;
    module: {
        spawn: typeof spawn;
        exec: typeof exec;
        execSync: () => never;
        fork: typeof fork;
        execFile: typeof exec;
    };
    spawn: typeof spawn;
    exec: typeof exec;
    execPromise: typeof execPromise;
    fork: typeof fork;
    ChildProcess: typeof ChildProcess;
};
export default _default;
//# sourceMappingURL=ChildProcessPolyfill.d.ts.map