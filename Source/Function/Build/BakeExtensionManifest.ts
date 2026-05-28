import { dirname, join } from "node:path";

import { fileURLToPath } from "node:url";

import { homedir } from "node:os";

import { promises as Fs } from "node:fs";

import type { AstroIntegration } from "astro";

interface ExtManifest {

	name?: string;

	displayName?: string;

	description?: string;

	version?: string;

	publisher?: string;

	main?: string;

	type?: string;

	activationEvents?: string[];

	extensionDependencies?: string[];

	contributes?: unknown;

	engines?: { vscode?: string };

	categories?: string[];

	[key: string]: unknown;
}

interface CachedExtension {

	id: string;

	path: string;

	manifest: ExtManifest;
}

type NLSMap = Record<string, string>;

const LoadNLS = async (ExtPath: string): Promise<NLSMap> => {

	try {
		const Parsed = JSON.parse(
			await Fs.readFile(join(ExtPath, "package.nls.json"), "utf8"),
		) as Record<string, unknown>;

		return Object.fromEntries(
			Object.entries(Parsed).flatMap(([K, V]) => {
				const Msg =
					typeof V === "string"
						? V
						: typeof (V as { message?: unknown })?.message === "string"
							? (V as { message: string }).message
							: null;

				return Msg !== null ? [[K, Msg]] : [];
			}),
		);
	} catch {
		return {};
	}
};

const ResolveNLS = (Value: unknown, NLS: NLSMap): unknown => {

	if (typeof Value === "string") {
		const IsPlaceholder =
			Value.length > 2 && Value[0] === "%" && Value.at(-1) === "%";

		return IsPlaceholder ? (NLS[Value.slice(1, -1)] ?? Value) : Value;
	}

	if (Array.isArray(Value)) return Value.map((V) => ResolveNLS(V, NLS));

	if (Value && typeof Value === "object")

		return Object.fromEntries(
			Object.entries(Value as Record<string, unknown>).map(([K, V]) => [
				K,

				ResolveNLS(V, NLS),
			]),
		);

	return Value;
};

const ScanRoot = async (Root: string): Promise<CachedExtension[]> => {

	let Entries: string[] = [];

	try {
		Entries = (await Fs.readdir(Root)).filter((E) => !E.startsWith("."));
	} catch {
		return [];
	}

	const Results: CachedExtension[] = [];

	for (const Entry of Entries) {
		const ExtPath = join(Root, Entry);

		try {
			const Raw = await Fs.readFile(
				join(ExtPath, "package.json"),

				"utf8",
			);

			let Manifest = JSON.parse(Raw) as ExtManifest;

			const NLS = await LoadNLS(ExtPath);

			if (Object.keys(NLS).length > 0)

				Manifest = ResolveNLS(Manifest, NLS) as ExtManifest;

			const Publisher =
				Manifest.publisher ?? Entry.split(".")[0] ?? "unknown";

			const Name =
				Manifest.name ??
				Entry.split(".").slice(1).join(".") ??
				Entry;

			Results.push({
				id: `${Publisher}.${Name}`,
				path: ExtPath,
				manifest: Manifest,
			});
		} catch {
			// skip extensions with missing/invalid package.json
		}
	}

	return Results;
};

export default {

	name: "BakeExtensionManifest",

	hooks: {
		"astro:build:done": async ({ dir }) => {
			const Target = fileURLToPath(dir);

			const Home = homedir();

			const Start = Date.now();

			const Roots = [
				join(Target, "Static", "Application", "extensions"),

				join(Home, ".land", "extensions"),

				join(Home, ".fiddee", "extensions"),

				join(Home, ".vscode", "extensions"),
			];

			// Mountain's dev binary reads this directly at startup.
			const DebugPath = join(
				Target,

				"..",

				"..",

				"Mountain",

				"Target",

				"debug",

				"extensions.manifest.json",
			);

			// Bundled into .app via tauri.conf.json resources.
			const BundlePath = join(Target, "extensions.manifest.json");

			const Seen = new globalThis.Set<string>();

			const All: CachedExtension[] = [];

			for (const Root of Roots) {
				for (const Ext of await ScanRoot(Root)) {
					if (!Seen.has(Ext.id)) {
						Seen.add(Ext.id);

						All.push(Ext);
					}
				}
			}

			const Blob = JSON.stringify({
				version: 1,
				count: All.length,
				extensions: All,
			});

			if (All.length === 0) {
				// No extensions found. Write only BundlePath so Tauri's resource
				// bundler can include the file in the .app - the empty blob is
				// harmless there because LoadFromCache treats count=0 as a miss
				// and falls back to the live scan at runtime.
				// Never write to DebugPath when empty: an empty cache at the dev
				// binary location causes LoadFromCache to return 0 extensions,
				// which makes the workbench extension host time out on every launch.
				await Fs.mkdir(dirname(BundlePath), { recursive: true });

				await Fs.writeFile(BundlePath, Blob, "utf8");

				console.log(
					"[BakeExtensionManifest] No extensions found - wrote empty stub to BundlePath only.",
				);

				return;
			}

			// Always write both paths when BundlePath is missing, even if debug
			// cache is fresh - prevents .app from bundling a stale/stub manifest.
			let BundleExists = false;

			try {
				await Fs.access(BundlePath);

				BundleExists = true;
			} catch {
				/* missing */
			}

			let CacheMtime = 0;

			let CacheStub = false;

			try {
				CacheMtime = (await Fs.stat(DebugPath)).mtimeMs;

				const CacheContent = JSON.parse(
					await Fs.readFile(DebugPath, "utf8"),
				) as { count?: number };

				if (!CacheContent.count || CacheContent.count === 0)

					CacheStub = true;
			} catch {
				/* no cache yet */
			}

			let AnyNewer = !BundleExists || CacheStub;

			if (!AnyNewer) {
				for (const Ext of All) {
					try {
						const Mtime = (
							await Fs.stat(join(Ext.path, "package.json"))
						).mtimeMs;

						if (Mtime > CacheMtime) {
							AnyNewer = true;

							break;
						}
					} catch {
						AnyNewer = true;

						break;
					}
				}
			}

			if (!AnyNewer) {
				console.log(
					`[BakeExtensionManifest] Cache up-to-date (${All.length} extensions). Skipping.`,
				);

				return;
			}

			await Fs.mkdir(dirname(DebugPath), { recursive: true });

			await Fs.mkdir(dirname(BundlePath), { recursive: true });

			await Promise.all([
				Fs.writeFile(DebugPath, Blob, "utf8"),

				Fs.writeFile(BundlePath, Blob, "utf8"),
			]);

			console.log(
				`[BakeExtensionManifest] ${All.length} extension(s) -> both paths in ${Date.now() - Start}ms`,
			);
		},
	},
} satisfies AstroIntegration;
