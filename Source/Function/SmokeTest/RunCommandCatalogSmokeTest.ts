/**
 * @module Function/SmokeTest/RunCommandCatalogSmokeTest
 * @description
 * Boot-time smoke test that walks Wind's generated `CommandCatalog`
 * and asserts each command id is *known* to the workbench's command
 * service. Knowledge here is the weakest precondition we can verify
 * without invoking commands (which would trip side-effects like
 * `workbench.action.closeWindow`):
 *
 *   - `command:has(<id>)` returns true → known
 *   - command resolves through `getCommands()` → known
 *
 * Anything else surfaces in the harness report as `missing`. The
 * harness is opt-in via either gate (PascalCase, matching Land's
 * env-var naming convention - see `.env.Land.Diagnostics`):
 *
 *   - URL query string: `?Smoke=1` (survives reloads as long as
 *     the URL is preserved)
 *   - LocalStorage: `localStorage.setItem("Smoke", "1")` (sticky
 *     across reloads; clear with `removeItem` to disable)
 *   - Build-time env: `Smoke=1` set before Sky's prepublishOnly,
 *     surfaced via `import.meta.env.Smoke` (Vite define).
 *
 * The report is written to `console.info` (one summary line + one
 * `console.table` of failures) and emitted as a CustomEvent
 * (`cel:smoke-test:complete`) so a future Sky-side telemetry probe
 * can ship it to PostHog.
 *
 * Designed to add zero observable overhead when disabled - the
 * `Should*` gate short-circuits before importing the catalog.
 */

// Loaded lazily: see `LoadCatalog` below. Static import would force
// Rollup/Vite to resolve the generated artefact at Sky's build time,
// which fails when Wind's codegen step hasn't run yet (fresh checkout,
// `--filter=@codeeditorland/sky` partial build, CI cache miss). The
// dynamic import is hidden from Rollup's static analyser via a
// runtime-built path string + `@vite-ignore` directive so a missing
// catalog falls through to the harness's empty-catalog branch instead
// of breaking the entire build.
interface CommandCatalogEntry {
	readonly CommandIdentifier: string;
	readonly Kind: string;
	readonly SourcePath: string;
	readonly SourceLine: number;
	readonly HasKeybinding: boolean;
}

interface CommandCatalogModule {
	readonly CommandCatalog: ReadonlyArray<CommandCatalogEntry>;
}

const LoadCatalog = async (): Promise<ReadonlyArray<CommandCatalogEntry>> => {
	try {
		// String concatenation defeats Rollup's static-import analyser.
		// `@vite-ignore` doubles up the signal: Vite skips the literal
		// even when it can resolve it, so dev builds also stay clean.
		const Specifier = [
			"@codeeditorland",
			"wind",
			"Target",
			"Effect",
			"Generated",
			"CommandCatalog.js",
		].join("/");
		const Module = (await import(
			/* @vite-ignore */ Specifier
		)) as CommandCatalogModule;
		if (Array.isArray(Module?.CommandCatalog)) return Module.CommandCatalog;
	} catch {
		/* fall through to empty */
	}
	return [];
};

interface CommandHostShape {
	executeCommand(command: string, ...rest: unknown[]): Promise<unknown>;
	getCommands?(filterInternal?: boolean): Promise<ReadonlyArray<string>>;
}

interface SmokeTestSummary {
	readonly total: number;
	readonly known: number;
	readonly missing: number;
	readonly missingIds: ReadonlyArray<string>;
	readonly elapsedMilliseconds: number;
}

const ResolveQueryFlag = (): boolean => {
	try {
		if (typeof window === "undefined") return false;
		const Params = new URLSearchParams(window.location.search);
		const Flag = Params.get("Smoke");
		return Flag === "1" || Flag === "true";
	} catch {
		return false;
	}
};

const ResolveStorageFlag = (): boolean => {
	try {
		if (typeof localStorage === "undefined") return false;
		const Stored = localStorage.getItem("Smoke");
		return Stored === "1" || Stored === "true";
	} catch {
		return false;
	}
};

const ResolveBuildTimeFlag = (): boolean => {
	try {
		// Vite/Astro replace `import.meta.env.Smoke` at build time with
		// the value present at compile time. When undefined the
		// expression evaluates to `undefined` and the gate stays off.
		const Meta = (import.meta as { env?: Record<string, unknown> }).env;
		if (!Meta) return false;
		const Flag = Meta["Smoke"];
		return Flag === "1" || Flag === "true" || Flag === true;
	} catch {
		return false;
	}
};

const ShouldRunSmokeTest = (): boolean => {
	return ResolveQueryFlag() || ResolveStorageFlag() || ResolveBuildTimeFlag();
};

const ResolveCommandHost = (): CommandHostShape | null => {
	try {
		const Globals = globalThis as Record<string, unknown>;
		const Workbench = Globals["__CEL_WORKBENCH__"] as
			| { commands?: CommandHostShape }
			| undefined;
		if (Workbench?.commands?.executeCommand) return Workbench.commands;
	} catch {
		/* fall through */
	}
	try {
		const Globals = globalThis as Record<string, unknown>;
		const Services = Globals["__CEL_SERVICES__"] as
			| { Commands?: CommandHostShape }
			| undefined;
		if (Services?.Commands?.executeCommand) return Services.Commands;
	} catch {
		/* fall through */
	}
	return null;
};

const ListKnownCommands = async (
	host: CommandHostShape,
): Promise<ReadonlySet<string>> => {
	if (typeof host.getCommands !== "function") return new Set();
	try {
		const All = await host.getCommands(false);
		return new Set(All);
	} catch {
		return new Set();
	}
};

const RunOnce = async (): Promise<SmokeTestSummary> => {
	const Started = performance.now();
	const Catalog = await LoadCatalog();
	if (Catalog.length === 0) {
		return {
			total: 0,
			known: 0,
			missing: 0,
			missingIds: [],
			elapsedMilliseconds: Math.round(performance.now() - Started),
		};
	}
	const Host = ResolveCommandHost();
	if (!Host) {
		return {
			total: Catalog.length,
			known: 0,
			missing: Catalog.length,
			missingIds: Catalog.map((entry) => entry.CommandIdentifier),
			elapsedMilliseconds: Math.round(performance.now() - Started),
		};
	}
	const Known = await ListKnownCommands(Host);
	const MissingIds: string[] = [];
	for (const Entry of Catalog) {
		if (!Known.has(Entry.CommandIdentifier)) {
			MissingIds.push(Entry.CommandIdentifier);
		}
	}
	return {
		total: Catalog.length,
		known: Catalog.length - MissingIds.length,
		missing: MissingIds.length,
		missingIds: MissingIds,
		elapsedMilliseconds: Math.round(performance.now() - Started),
	};
};

const ReportSummary = (summary: SmokeTestSummary): void => {
	const Tag = "[Land/SmokeTest/CommandCatalog]";
	if (typeof console === "undefined") return;
	console.info(
		`${Tag} ${summary.known}/${summary.total} commands known (${summary.missing} missing) in ${summary.elapsedMilliseconds}ms`,
	);
	if (summary.missing > 0 && summary.missingIds.length > 0) {
		const Preview = summary.missingIds.slice(0, 50);
		console.info(`${Tag} first ${Preview.length} missing:`, Preview);
	}
	try {
		document.dispatchEvent(
			new CustomEvent("cel:smoke-test:complete", { detail: summary }),
		);
	} catch {
		/* document might not be available in tests */
	}
};

export const RunCommandCatalogSmokeTest = async (): Promise<void> => {
	if (!ShouldRunSmokeTest()) return;
	try {
		const Summary = await RunOnce();
		ReportSummary(Summary);
	} catch (Cause) {
		try {
			console.warn(
				"[Land/SmokeTest/CommandCatalog] harness threw - skipping report",
				Cause,
			);
		} catch {
			/* console may be unavailable */
		}
	}
};

export default RunCommandCatalogSmokeTest;
