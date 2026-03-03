import { Disposable, IDisposable } from '../../../base/common/lifecycle.js';
import { URI } from '../../../base/common/uri.js';
import { BrowserViewStorageScope } from '../common/browserView.js';
/**
 * Holds an Electron session along with its storage scope and unique browser
 * context identifier.  Each instance maps one-to-one to an Electron
 * {@link Electron.Session} -- the {@link id} is derived from what makes the
 * Electron session unique (scope + workspace), **not** from any view id.
 * Multiple browser views may reference the same `BrowserSession`.
 *
 * The class centralises the permission configuration.  The {@link id}
 * doubles as the CDP `browserContextId`.
 *
 * This class uses a private constructor with static factory methods
 * ({@link getOrCreate}, {@link getOrCreateGlobal}, etc.) and maintains
 * an internal registry of live sessions. Use the static methods to
 * obtain instances.
 */
export declare class BrowserSession extends Disposable {
    /**
     * Unique identifier for this session.  Derived from what makes the
     * underlying Electron session unique (scope key, workspace id, view
     * id, or context uuid) -- NOT from any particular view id.
     */
    readonly id: string;
    /** The underlying Electron session. */
    readonly electronSession: Electron.Session;
    /** Resolved storage scope. */
    readonly storageScope: BrowserViewStorageScope;
    /**
     * All live sessions keyed by their unique id.
     *
     * ID derivation rules (one-to-one with Electron sessions):
     *  - Global scope         -> `"global"`
     *  - Workspace scope      -> `"workspace:${workspaceId}"`
     *  - Ephemeral scope      -> `"ephemeral:${viewId}"` or `"${type}:${viewId}"` for custom types
     */
    private static readonly _sessions;
    /**
     * Weak set mirroring the Electron sessions owned by any BrowserSession.
     * Useful for quickly checking whether a given {@link Electron.WebContents}
     * belongs to the integrated browser.
     */
    static readonly knownSessions: WeakSet<Electron.Session>;
    /**
     * Check if a {@link Electron.WebContents} belongs to an integrated browser
     * view backed by a BrowserSession.
     */
    static isBrowserViewWebContents(contents: Electron.WebContents): boolean;
    /**
     * Return an existing session for the given id, or `undefined`.
     */
    static get(id: string): BrowserSession | undefined;
    /**
     * Return all live browser context IDs (i.e. all session {@link id}s).
     */
    static getBrowserContextIds(): string[];
    /**
     * Get or create the singleton global-scope session.
     */
    static getOrCreateGlobal(): BrowserSession;
    /**
     * Get or create a workspace-scope session for the given workspace.
     */
    static getOrCreateWorkspace(workspaceId: string, workspaceStorageHome: URI): BrowserSession;
    /**
     * Get or create an ephemeral session for the given view / target id.
     */
    static getOrCreateEphemeral(viewId: string, type?: string): BrowserSession;
    /**
     * Get or create a session for a workbench-originated browser view.
     * The session id is derived from the *scope* -- not the view id -- so
     * multiple views that share a scope (e.g. two Global views) get the
     * same `BrowserSession`.
     *
     * @param viewId   Used only for ephemeral sessions where every view
     *                 needs its own Electron session.
     * @param scope    Desired storage scope.
     * @param workspaceStorageHome  Root folder under which per-workspace
     *                              browser storage is created
     *                              (`IEnvironmentMainService.workspaceStorageHome`).
     * @param workspaceId  Only required when `scope` is `workspace`.
     */
    static getOrCreate(viewId: string, scope: BrowserViewStorageScope, workspaceStorageHome: URI, workspaceId?: string): BrowserSession;
    private refs;
    private constructor();
    /**
     * Apply the standard permission policy to the session.
     */
    private configureSession;
    acquire(): IDisposable;
    dispose(): void;
}
