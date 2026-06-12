/**
 * @module Bridge/InstallSearch
 *
 * ---- Search result provider (Land-native) ----
 *
 * Stock VS Code web's `RemoteSearchService` constructs a
 * `LocalFileSearchWorkerClient` which calls
 * `HTMLFileSystemProvider.getHandle(folderUri)` to obtain a File System
 * Access API directory handle. Land's filesystem goes through Mountain
 * over Tauri IPC, not the browser's FSA API, so the handle resolve
 * returns `undefined` and the search viewlet silently returns zero
 * results. The fix: register a provider that routes to Mountain's
 * existing `search:findFiles` / `search:findInFiles` handlers via
 * `MountainIPCInvoke`. Registered for the `file` scheme under both
 * SearchProviderType.file (0) and SearchProviderType.text (1) so both
 * the Search viewlet text queries and file-name filter hit it.
 *
 * Registration is best-effort - if `__CEL_SERVICES__.Search` isn't
 * populated yet (workbench still booting), wait for the
 * `cel:workbench-ready` event fired by ExposeWorkbenchAccessor.
 */

interface CelUri {
	readonly scheme: string;

	readonly path: string;

	readonly fsPath: string;

	with(change: {
		scheme?: string;

		authority?: string;

		path?: string;
	}): CelUri;

	toString(skipEncoding?: boolean): string;
}

interface CelUriCtor {
	file(path: string): CelUri;

	parse(value: string, strict?: boolean): CelUri;

	from(components: {
		scheme: string;

		authority?: string;

		path?: string;
	}): CelUri;
}

interface CelSearchService {
	registerSearchResultProvider(
		scheme: string,

		type: number,

		provider: unknown,
	): { dispose(): void };
}

export default async (Dependencies: {
	GetServices: () => {
		Search?: CelSearchService;

		URI?: CelUriCtor;

		[key: string]: unknown;
	} | null;

	Invoke: (cmd: string, args?: Record<string, unknown>) => Promise<unknown>;
}): Promise<void> => {
	const { GetServices, Invoke } = Dependencies;

	// Extract the single-folder root URI from a query - Mountain's
	// search handlers take the active workspace folder, not a set.
	// Multi-root queries fan out over each folder; first one wins for
	// now (Land's scanner is single-root in the debug profile).
	const FolderFromQuery = (Query: any): string | null => {
		const Folder =
			Query?.folderQueries?.[0]?.folder ?? Query?.folder ?? null;

		if (!Folder) return null;

		if (typeof Folder === "string") return Folder;

		const Path = Folder?.fsPath ?? Folder?.path ?? "";

		return Path || null;
	};

	// `URI` lookup is re-resolved at every result construction so a
	// SkyBridge that registered before `__CEL_SERVICES__.URI` was
	// bound (event-rescue path runs before the URI patch lands) can
	// pick it up on the first actual search call rather than being
	// stuck with the boot-time snapshot. Cheap - single property
	// read per result row.
	//
	// The provider is registered IN-PROCESS in the workbench, NOT
	// through the extension-host RPC bridge - so the workbench
	// never calls `URI.revive(...)` on what we return. It dedups
	// results via `getComparisonKey(uri)` which is `uri.with({...})`
	// plus `.toString()`. Returning a raw `URIComponents` POJO
	// (`{ $mid:1, path, scheme }`) throws
	// `uri.with is not a function` at the first dedup check.
	const MakeFileUri = (
		FsPath: string,
	): CelUri | { scheme: string; path: string; fsPath: string } => {
		const Ctor = GetServices()?.URI;

		if (Ctor) return Ctor.file(FsPath);

		// Last-resort fallback when `__CEL_SERVICES__.URI` somehow
		// missed the patch. The result is a POJO with the right
		// shape but no `.with()` - the workbench will still throw
		// on dedup, just gracefully now (no `$mid:1` because that
		// implies revive should be called and isn't here).
		return { scheme: "file", path: FsPath, fsPath: FsPath };
	};

	// Translate a raw Mountain hit into the workbench's `IFileMatch`
	// shape.
	//
	// **Wire shape**: Mountain's `SearchProvider::TextSearch` (in
	// `Mountain/Source/Environment/SearchProvider.rs::TextSearch`)
	// returns one entry per FILE that contained matches:
	//
	// ```json
	// [
	//   {
	//     "resource": "file:///abs/path.ts",
	//     "matches": [
	//       { "preview": "line text", "line_number": 42 },
	//       { "preview": "another",   "line_number": 51 }
	//     ]
	//   },
	//   ...
	// ]
	// ```
	//
	// **Workbench shape**: `IFileMatch` is one entry per file with
	// `results[]` carrying every per-line match (`preview` + range).
	// The previous adapter read `Hit.uri` / `Hit.lineNumber` /
	// `Hit.preview` (flat per-hit shape) - none of those fields
	// exist in Mountain's response, so every search produced
	// `resource = MakeFileUri("")` and an empty results array. The
	// workbench's dedup map saw N "matches in <empty path>" rows
	// and merged them away to nothing visible.
	const MatchFromHit = (Hit: any) => {
		const Raw = String(Hit?.resource ?? Hit?.uri ?? "");

		const OsPath = Raw.replace(/^file:\/\//, "");
		type LineHit = {
			preview: string;

			lineNumber: number;

			columns: Array<{ start: number; end: number }>;
		};
		const PerLineMatches: LineHit[] = Array.isArray(Hit?.matches)
			? Hit.matches.map((Inner: any) => ({
					preview: String(Inner?.preview ?? ""),
					lineNumber: Number(
						Inner?.line_number ?? Inner?.lineNumber ?? 1,
					),
					columns: Array.isArray(Inner?.columns)
						? Inner.columns.map((C: any) => ({
								start: Number(C?.start ?? 0),
								end: Number(C?.end ?? 0),
							}))
						: [],
				}))
			: // Backwards-compat: also accept a flat per-hit shape
				// `{ uri, lineNumber, preview }` for any future Mountain
				// path that returns flat hits.
				[
					{
						preview: String(Hit?.preview ?? ""),
						lineNumber: Number(
							Hit?.lineNumber ?? Hit?.line_number ?? 1,
						),
						columns: [],
					},
				];
		return {
			resource: MakeFileUri(OsPath),
			results: PerLineMatches.map((M) => {
				// VS Code's current `ITextSearchMatch` shape (≥1.92):
				//   {
				//     uri?: URI,
				//     rangeLocations: { source: ISearchRange,
				//                       preview: ISearchRange }[],
				//     previewText: string,
				//   }
				// The OLD `{preview: {text, matches}, ranges}` shape
				// was renamed: `preview.text` → `previewText`, and
				// `preview.matches` + `ranges` collapsed into a single
				// pair-array `rangeLocations[]`. Stock vscode passes
				// our matches through `searchResult.add()` which
				// reads `previewText` + `rangeLocations` and silently
				// rejects (count-of-zero) entries with the old shape -
				// which is why the search panel showed 0 results
				// despite Mountain returning 2560 line-matches.
				//
				// `source`: 1-based line, 1-based column - the
				// position in the original file that matched.
				// `preview`: 1-based line=1, 1-based column - the
				// position WITHIN `previewText` for highlight
				// underlining.
				//
				// When Mountain didn't supply columns (older ripgrep
				// path or zero-width match), produce a single full-
				// line range so the row still renders.
				// `MatchImpl` (workbench/contrib/search/.../match.ts:31)
				// indexes `_fullPreviewLines[startLineNumber]` directly,
				// then +1's both axes when constructing the editor
				// `Range`. So both `source` and `preview` must be
				// fully 0-based here. Earlier shape was 1-based on the
				// preview, which made `previewLines[1]` === undefined
				// for single-line previews and produced
				// "undefined is not an object (evaluating
				// 'this._oneLinePreviewText.substring')". Source was
				// also off-by-one (line and column too high by 1).
				const SourceLine = Math.max(0, M.lineNumber - 1);

				const RangeLocations =
					M.columns.length > 0
						? M.columns.map((C) => ({
								source: {
									startLineNumber: SourceLine,
									startColumn: C.start,
									endLineNumber: SourceLine,
									endColumn: C.end,
								},
								preview: {
									startLineNumber: 0,
									startColumn: C.start,
									endLineNumber: 0,
									endColumn: C.end,
								},
							}))
						: [
								{
									source: {
										startLineNumber: SourceLine,
										startColumn: 0,
										endLineNumber: SourceLine,
										endColumn: M.preview.length,
									},
									preview: {
										startLineNumber: 0,
										startColumn: 0,
										endLineNumber: 0,
										endColumn: M.preview.length,
									},
								},
							];

				return {
					previewText: M.preview,
					rangeLocations: RangeLocations,
				};
			}),
		};
	};

	const Provider = {
		getAIName: async () => undefined,

		textSearch: async (
			Query: any,

			OnProgress?: (Item: unknown) => void,

			_Token?: unknown,
		) => {
			const Pattern = String(Query?.contentPattern?.pattern ?? "");

			if (!Pattern) {
				return { results: [], messages: [], limitHit: false };
			}

			const IsRegex = Boolean(Query?.contentPattern?.isRegExp);

			const IsCaseSensitive = Boolean(
				Query?.contentPattern?.isCaseSensitive,
			);

			const IsWordMatch = Boolean(Query?.contentPattern?.isWordMatch);

			const Include = Object.keys(Query?.includePattern ?? {})[0] ?? "**";

			const Exclude = Object.keys(Query?.excludePattern ?? {})[0] ?? "";

			const MaxResults = Number(Query?.maxResults ?? 1000);

			try {
				const Raw = (await Invoke("MountainIPCInvoke", {
					method: "search:findInFiles",
					params: [
						Pattern,
						IsRegex,
						IsCaseSensitive,
						IsWordMatch,
						Include,
						Exclude,
						MaxResults,
					],
				})) as any[];

				const Results: any[] = [];

				let LineMatchCount = 0;

				let OnProgressCalled = 0;

				const HasOnProgress = typeof OnProgress === "function";

				for (const Hit of Raw ?? []) {
					const Match = MatchFromHit(Hit);

					LineMatchCount += Match.results?.length ?? 0;

					if (HasOnProgress) {
						try {
							OnProgress?.(Match);

							OnProgressCalled++;
						} catch (ProgressErr) {
							Invoke("MountainIPCInvoke", {
								method: "diagnostic:log",
								params: [
									"sky-bridge",
									`OnProgress threw on file ${(Hit as any)?.resource}: ${ProgressErr instanceof Error ? ProgressErr.message : String(ProgressErr)}`,
								],
							}).catch(() => {});
						}
					}

					Results.push(Match);
				}

				void LineMatchCount;

				void OnProgressCalled;

				return {
					results: Results,
					messages: [],
					limitHit: Results.length >= MaxResults,
				};
			} catch (Error) {
				Invoke("MountainIPCInvoke", {
					method: "diagnostic:log",
					params: [
						"sky-bridge",
						`textSearch failed: ${Error instanceof globalThis.Error ? Error.message : String(Error)}`,
					],
				}).catch(() => {});

				return { results: [], messages: [], limitHit: false };
			}
		},

		fileSearch: async (Query: any, _Token?: unknown) => {
			// IFileQuery.filePattern is the user's typed filename
			// fragment (e.g. "set" matches "settings.ts"). Mountain's
			// `search:findFiles` takes a glob, so wrap the fragment
			// as `**/<pattern>*` to get prefix-substring matching -
			// a close approximation to VS Code's fuzzy file matcher.
			const Raw = String(Query?.filePattern ?? "").trim();

			const FolderRoot = FolderFromQuery(Query);

			const Glob = Raw
				? `**/*${Raw}*`
				: (Object.keys(Query?.includePattern ?? {})[0] ?? "**");

			const MaxResults = Number(Query?.maxResults ?? 500);

			try {
				// Positional contract for `search:findFiles` (see
				// `Mountain/Source/IPC/WindServiceHandlers/Search.rs::handle_search_find_files`):
				//   [include, exclude?, max?, useIgnore?, followSymlinks?]
				// `null` for exclude is required - dropping it shifts
				// `MaxResults` into the exclude slot which the
				// glob-extractor then ignores, leaving max defaulted
				// to 10000 instead of the requested cap.
				const Files = (await Invoke("MountainIPCInvoke", {
					method: "search:findFiles",
					params: [Glob, null, MaxResults],
				})) as string[];

				const Results = (Files ?? []).map((Uri) => ({
					resource: MakeFileUri(
						String(Uri).replace(/^file:\/\//, ""),
					),
				}));
				// Suppress unused warning - FolderRoot would be used
				// by a multi-folder fan-out that we don't need yet.
				void FolderRoot;
				return {
					results: Results,
					messages: [],
					limitHit: Results.length >= MaxResults,
				};
			} catch (Error) {
				Invoke("MountainIPCInvoke", {
					method: "diagnostic:log",
					params: [
						"sky-bridge",
						`fileSearch failed: ${Error instanceof globalThis.Error ? Error.message : String(Error)}`,
					],
				}).catch(() => {});
				return { results: [], messages: [], limitHit: false };
			}
		},
		clearCache: async (_Key: string) => undefined,
	};

	const RegisterLandSearchProvider = () => {
		const Services = GetServices();
		if (!Services?.Search?.registerSearchResultProvider) return false;

		try {
			Services.Search.registerSearchResultProvider("file", 0, Provider); // file
			Services.Search.registerSearchResultProvider("file", 1, Provider); // text
			Invoke("RenderDevLog", {
				Tag: "search",
				Message:
					"[SkyBridge] search provider registered (file scheme, types 0+1)",
				tag: "search",
				message:
					"[SkyBridge] search provider registered (file scheme, types 0+1)",
			}).catch(() => {});
			return true;
		} catch (Error) {
			Invoke("RenderDevLog", {
				Tag: "search",
				Message: `[SkyBridge] registerSearchResultProvider threw: ${String(Error)}`,
				tag: "search",
				message: `[SkyBridge] registerSearchResultProvider threw: ${String(Error)}`,
			}).catch(() => {});
			return false;
		}
	};

	RegisterLandSearchProvider();
};
