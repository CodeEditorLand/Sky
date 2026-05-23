import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { promises as Fs } from "node:fs";
import { brotliCompressSync, constants } from "node:zlib";

import type { AstroIntegration } from "astro";

const Compressible = new globalThis.Set([
	".cjs",
	".css",
	".htm",
	".html",
	".js",
	".json",
	".map",
	".md",
	".mjs",
	".svg",
	".txt",
	".wasm",
]);

const MinimumSize = 4 * 1024;

const MinimumSavingsRatio = 0.05;

const TextExtensions = new globalThis.Set([
	".css",
	".cjs",
	".html",
	".js",
	".mjs",
]);

const Walk = async (Root: string): Promise<string[]> => {
	const Out: string[] = [];
	const Stack: string[] = [Root];
	while (Stack.length > 0) {
		const Current = Stack.pop() as string;
		let Entries;
		try {
			Entries = await Fs.readdir(Current, { withFileTypes: true });
		} catch {
			continue;
		}
		for (const Entry of Entries) {
			const Full = join(Current, Entry.name);
			if (Entry.isDirectory()) Stack.push(Full);
			else if (Entry.isFile()) Out.push(Full);
		}
	}
	return Out;
};

const ProcessFile = async (
	Path: string,
): Promise<{ Wrote: boolean; Original: number; Compressed: number }> => {
	const Ext = Path.slice(Path.lastIndexOf("."));
	if (!Compressible.has(Ext) || Path.endsWith(".br"))
		return { Wrote: false, Original: 0, Compressed: 0 };

	const Stat = await Fs.stat(Path);
	if (Stat.size < MinimumSize)
		return { Wrote: false, Original: Stat.size, Compressed: 0 };

	const Sibling = `${Path}.br`;
	const SiblingStat = await Fs.stat(Sibling).catch(() => null);
	if (SiblingStat && SiblingStat.mtimeMs > Stat.mtimeMs)
		return { Wrote: false, Original: Stat.size, Compressed: SiblingStat.size };

	const Source = await Fs.readFile(Path);
	const Compressed = brotliCompressSync(Source, {
		params: {
			[constants.BROTLI_PARAM_QUALITY]: 11,
			[constants.BROTLI_PARAM_LGWIN]: 24,
			[constants.BROTLI_PARAM_MODE]: TextExtensions.has(Ext)
				? constants.BROTLI_MODE_TEXT
				: constants.BROTLI_MODE_GENERIC,
		},
	});

	if (1 - Compressed.byteLength / Source.byteLength < MinimumSavingsRatio)
		return {
			Wrote: false,
			Original: Source.byteLength,
			Compressed: Compressed.byteLength,
		};

	await Fs.writeFile(Sibling, Compressed);
	return {
		Wrote: true,
		Original: Source.byteLength,
		Compressed: Compressed.byteLength,
	};
};

export default {
	name: "CompressBundle",
	hooks: {
		"astro:build:done": async ({ dir }) => {
			const Target = fileURLToPath(dir);
			const Start = performance.now();
			const Roots = [
				join(Target, "_astro"),
				join(Target, "Static", "Application"),
			];
			let Wrote = 0;
			let Skipped = 0;
			let TotalOriginal = 0;
			let TotalCompressed = 0;
			for (const Root of Roots) {
				try {
					await Fs.access(Root);
				} catch {
					continue;
				}
				for (const File of await Walk(Root)) {
					const Result = await ProcessFile(File);
					if (Result.Wrote) {
						Wrote++;
						TotalOriginal += Result.Original;
						TotalCompressed += Result.Compressed;
					} else {
						Skipped++;
					}
				}
			}
			const Pct =
				TotalOriginal > 0
					? ((1 - TotalCompressed / TotalOriginal) * 100) | 0
					: 0;
			console.log(
				`[CompressBundle] wrote=${Wrote} skipped=${Skipped} ${TotalOriginal}->${TotalCompressed} bytes (${Pct}% reduction) in ${Math.round(performance.now() - Start)}ms`,
			);
		},
	},
} satisfies AstroIntegration;
