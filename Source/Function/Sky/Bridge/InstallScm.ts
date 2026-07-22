/**
 * @module Bridge/InstallScm
 *
 * ---- SCM bridge ----
 *
 * Mountain emits `sky://scm/{register,unregister,updateGroup,registerGroup}`
 * when extensions call `vscode.scm.createSourceControl(...)`. The bridge
 * fans them out as DOM CustomEvents so any Sky-side viewlet that wants to
 * mirror SCM state can subscribe to `cel:scm:*` without depending on
 * Tauri's event listener directly.
 *
 * In addition, when `__CEL_SERVICES__.SCM` is available (i.e. the stock
 * workbench's `ISCMService` was successfully resolved by the
 * `ExposeWorkbenchAccessor` Output transform), we register the provider
 * against the live workbench service so the SCM viewlet renders natively.
 * The shim provider is intentionally minimal: the workbench expects
 * observable-backed fields and emitter-backed events, but populating them
 * with real values right away would require deeper integration with the
 * extension's resource state. A null-safe fallback keeps the bridge stable
 * even when the services facade is missing or the registration throws.
 */

type CelSCMGroupShim = {

	GroupHandle: string;

	GroupId: string;

	ResourceStates: any[];

	Group: any;

	ChangeEmitter: any;

	ChangeResourcesEmitter: any;
};

type CelSCMShim = {

	Provider: any;

	Repository: any;

	ScmHandle: number | undefined;

	Groups: Map<string, CelSCMGroupShim>;

	ResourceGroupsEmitter: any;
};

export default async (Dependencies: {
	Register: (
		Channel: string,

		Handler: (Payload: any) => void,
	) => Promise<void>;
}): Promise<void> => {

	const { Register } = Dependencies;

	const ScmShimRegistry = new Map<string, CelSCMShim>();

	const ScmShimByHandle = new Map<number, CelSCMShim>();

	// Build a minimal `ISCMResource` from a Cocoon-side resource state
	// payload. Cocoon's `ScmNamespace.ts` passes the raw `resourceStates`
	// array verbatim from the extension's `sourceControl.resourceStates =
	// [...]` setter; entries can be either `vscode.SourceControlResourceState`
	// objects (richer shape with `decorations`/`command`/`contextValue`)
	// or simple `{ resourceUri }` shapes from older extensions. We pull
	// `sourceUri` and stash whatever else is present without requiring it.
	const BuildScmResource = (
		Services: any,

		Group: any,

		Raw: any,
	): any | null => {
		const UriField =
			Raw?.resourceUri ?? Raw?.sourceUri ?? Raw?.uri ?? Raw?.path;

		let SourceUri: any = null;

		if (UriField && typeof UriField === "object") {
			// Cocoon's URI hydration may already have produced a
			// real `URI`-shaped object; if not, reconstruct via
			// `URI.from`. POJOs with `{scheme,path,...}` work via
			// `URI.from`, raw strings via `URI.parse`.
			if (typeof UriField.with === "function") {
				SourceUri = UriField;
			} else if (typeof UriField.scheme === "string") {
				SourceUri = Services.URI.from(UriField);
			} else if (
				typeof UriField.toString === "function" &&
				UriField.toString !== Object.prototype.toString
			) {
				try {
					SourceUri = Services.URI.parse(UriField.toString());
				} catch {
					SourceUri = null;
				}
			}
		} else if (typeof UriField === "string") {
			try {
				SourceUri = Services.URI.parse(UriField);
			} catch {
				SourceUri = null;
			}
		}

		if (!SourceUri) return null;

		const Decorations = Raw?.decorations ?? {};

		return {
			sourceUri: SourceUri,

			resourceGroup: Group,

			decorations: {
				icon: Decorations.iconPath ?? Decorations.icon,

				iconDark: Decorations.iconDarkPath ?? Decorations.iconDark,

				tooltip: Decorations.tooltip,

				strikeThrough: Decorations.strikeThrough,

				faded: Decorations.faded,

				letter: Decorations.letter,

				color: Decorations.color,
			},

			contextValue: Raw?.contextValue,

			command: Raw?.command,

			multiDiffEditorOriginalUri: Raw?.multiDiffEditorOriginalUri,

			multiDiffEditorModifiedUri: Raw?.multiDiffEditorModifiedUri,
		};
	};

	const TryRegisterScmProvider = (Payload: any): void => {
		const Services: any = (globalThis as any).__CEL_SERVICES__;

		if (!Services || !Services.SCM || !Services.URI || !Services.Emitter)

			return;

		const ScmId: string = String(Payload?.scmId ?? Payload?.id ?? "");

		if (!ScmId) return;

		const ScmHandleNumber: number | undefined =
			typeof Payload?.handle === "number" ? Payload.handle : undefined;

		// Multi-repo workspaces (vscode.git scanning nested submodules under
		// Land/Dependency/Microsoft) call `createSourceControl` once per
		// repository, all with `scmId="git"` and a UNIQUE numeric handle.
		// Keying the shim by `ScmId` alone collapses every repo into a
		// single workbench provider AND lets the per-handle group registers
		// pile groups onto that shared provider, producing the visible
		// "Merge Changes / Untracked / Merge Changes" duplication. Key by
		// handle when one is supplied so each repo gets its own provider.
		const RegistryKey =
			ScmHandleNumber !== undefined
				? `${ScmId}#${ScmHandleNumber}`
				: ScmId;

		if (ScmShimRegistry.has(RegistryKey)) return;

		if (
			ScmHandleNumber !== undefined &&
			ScmShimByHandle.has(ScmHandleNumber)
		) {
			return;
		}

		try {
			const RootUri =
				typeof Payload?.rootUri === "string" &&
				Payload.rootUri.length > 0
					? Services.URI.parse(Payload.rootUri)

					: undefined;

			// Build a real `ITextModel` for the inputBox via
			// `IModelService.createModel`. Workbench's
			// `MainThreadSCMProvider` constructor reads
			// `inputBoxTextModel.uri` and binds editor commands to
			// the model identity, so a `null` placeholder makes
			// `registerSCMProvider` throw. We use a `cel-scm-input:`
			// scheme so we don't collide with the workbench's
			// built-in `SCMInputBoxContentProvider` (registered for
			// `vscode-source-control:` only when `MainThreadSCM`
			// instantiates - which only happens with a live
			// extension-host RPC channel; not the case here).
			let InputModel: any = null;

			if (Services.Models && Services.URI) {
				// Per-handle URI so co-existing providers don't collide on
				// the same `cel-scm-input:/git/input` model - the workbench
				// requires unique model identity per `inputBoxTextModel`.
				const InputUri = Services.URI.from({
					scheme: "cel-scm-input",
					path: `/${ScmId}/${ScmHandleNumber ?? "default"}/input`,
				});

				const Existing = Services.Models.getModel
					? Services.Models.getModel(InputUri)

					: null;

				if (Existing) {
					InputModel = Existing;
				} else {
					const LanguageSelection =
						Services.Languages && Services.Languages.createById
							? Services.Languages.createById("scminput")

							: null;

					InputModel = Services.Models.createModel(
						"",

						LanguageSelection,

						InputUri,
					);
				}
			}

			const ChangeEmitter = new Services.Emitter();

			const ResourceGroupsEmitter = new Services.Emitter();

			const ResourcesEmitter = new Services.Emitter();

			// `provider.groups` is a live list backed by our `Groups`
			// map; the workbench's SCM panel iterates it on every
			// `onDidChangeResourceGroups` fire to rebuild the tree.
			// Returning a cached array reference would break the
			// re-render heuristic, so build a fresh array each get.
			const ProviderGroupsList: any[] = [];

			// Multi-repo workspaces (Land's submodules) all share
			// `label="Git"`; the SCM viewlet renders identical "Git"
			// headers and the user can't tell repos apart. Derive a
			// per-repo display label from the rootUri's basename so
			// `Land/Element/Mountain/.git` shows up as "Mountain", its
			// submodules as their own folder names, etc.
			const RawLabel = String(Payload?.label ?? ScmId);

			const RootUriPath: string =
				typeof Payload?.rootUri === "string"
					? Payload.rootUri
					: typeof (Payload?.rootUri as any)?.path === "string"
						? (Payload.rootUri as any).path
						: "";

			const RootBasename = (() => {
				try {
					const Cleaned = RootUriPath.replace(/^file:\/\//, "");
					const Trimmed = Cleaned.replace(/\/+$/, "");
					const Last = Trimmed.split("/").filter(Boolean).pop();
					return Last && Last.length > 0 ? Last : "";
				} catch {
					return "";
				}
			})();
			const DisplayLabel =
				RootBasename && RawLabel.toLowerCase() === "git"
					? `${RawLabel} (${RootBasename})`
					: RawLabel;
			// `IObservable<T>`-shaped facade. The workbench's SCM viewlet
			// reads `provider.count.get()` etc. and may also call `.read()`
			// / `.onDidChange()` / `.map()` on the observable. We expose a
			// minimal shim that covers the read paths the viewlet exercises
			// and ignores the reactive subscription paths (count badge
			// re-renders via the `onDidChange` emitter on the provider, not
			// the per-field observable).
			const StaticObservable = <T>(
				Read: () => T,
			): {
				get(): T;

				read(): T;

				onDidChange: { dispose(): void };

				map<R>(transform: (value: T) => R): { get(): R; read(): R };
			} => ({
				get: Read,

				read: Read,

				onDidChange: { dispose: () => {} },

				map: <R>(Transform: (value: T) => R) => {
					const Lazy = (): R => Transform(Read());

					return { get: Lazy, read: Lazy };
				},
			});
			const CountObservable = StaticObservable<number>(() => {
				let Total = 0;

				for (const G of ProviderGroupsList) {
					const R = (G as any)?.resources;

					if (Array.isArray(R)) Total += R.length;
				}

				return Total;
			});
			// Mutable backing for `provider.commitTemplate` - updated from
			// `sky://scm/provider/changed` payloads so the workbench commit
			// input reflects the extension-set template.
			let CommitTemplateValue = "";
			const Provider = {
				id: ScmId,
				providerId: ScmId,
				label: DisplayLabel,
				name: DisplayLabel,
				rootUri: RootUri,
				get groups() {
					return ProviderGroupsList;
				},
				onDidChange: ChangeEmitter.event,
				onDidChangeResourceGroups: ResourceGroupsEmitter.event,
				onDidChangeResources: ResourcesEmitter.event,
				// Derived live count - sums resources across all groups so
				// the activity-bar badge and titlebar repo summary reflect
				// the real pending-changes total. Shape matches stock VS
				// Code's `IObservable<number | undefined>` so workbench
				// code can call `.get()` / `.read()` / `.map(fn)` without
				// crashing.
				count: CountObservable,
				commitTemplate: StaticObservable<string>(
					() => CommitTemplateValue,
				),
				contextValue: StaticObservable<string | undefined>(
					() => undefined,
				),
				artifactProvider: StaticObservable<undefined>(() => undefined),
				historyProvider: StaticObservable<undefined>(() => undefined),
				actionButton: StaticObservable<undefined>(() => undefined),
				statusBarCommands: StaticObservable<readonly unknown[]>(
					() => [],
				),
				inputBoxTextModel: InputModel,
				getOriginalResource: async () => null,
				dispose: () => {
					ChangeEmitter.dispose?.();

					ResourceGroupsEmitter.dispose?.();

					ResourcesEmitter.dispose?.();

					try {
						InputModel?.dispose?.();
					} catch {}
				},
			};
			const Repository = Services.SCM.registerSCMProvider(Provider);
			const Shim: CelSCMShim = {
				Provider,
				Repository,
				ScmHandle: ScmHandleNumber,
				Groups: new Map(),
				ResourceGroupsEmitter,
			};
			ScmShimRegistry.set(RegistryKey, Shim);
			if (ScmHandleNumber !== undefined) {
				ScmShimByHandle.set(ScmHandleNumber, Shim);
			}
			// Keep `ProviderGroupsList` reachable from the shim so
			// the registerGroup handler can mutate it in place.
			(Shim as any).ProviderGroupsList = ProviderGroupsList;
			// Stash the provider's own ChangeEmitter and a commit-template
			// setter so `sky://scm/provider/changed` can update the
			// observable's backing value and fire the public change event.
			(Shim as any).ChangeEmitter = ChangeEmitter;
			(Shim as any).SetCommitTemplate = (Value: string) => {
				CommitTemplateValue = Value;
			};
		} catch (Error) {
			// Workbench rejected the shim provider (e.g. ITextModel
			// could not be created on this profile, or `IModelService`
			// failed to resolve). Silently fall back to the
			// CustomEvent path - any Sky-side component listening on
			// `cel:scm:register` still gets the data. The
			// `Trace=cel-scm` gate surfaces the underlying
			// reason without spamming the renderer console on every
			// register.
			try {
				const W = globalThis as any;

				if (W?.process?.env?.Trace?.includes?.("cel-scm")) {
					(W.console || console).warn(
						`[Sky:CEL-SCM] registerSCMProvider failed for "${ScmId}": ${
							(Error as { message?: string })?.message ??
							String(Error)
						}`,
					);
				}
			} catch {}
		}
	};

	const TryUnregisterScmProvider = (Payload: any): void => {
		const ScmId: string = String(Payload?.scmId ?? Payload?.id ?? "");
		if (!ScmId) return;
		const ScmHandleNumber: number | undefined =
			typeof Payload?.handle === "number" ? Payload.handle : undefined;
		// Prefer handle-keyed lookup (the multi-repo case) and fall back
		// to the bare scmId for unregisters that arrived without a handle.
		let Entry: CelSCMShim | undefined;
		let RegistryKey: string | undefined;
		if (
			ScmHandleNumber !== undefined &&
			ScmShimByHandle.has(ScmHandleNumber)
		) {
			Entry = ScmShimByHandle.get(ScmHandleNumber);
			RegistryKey = `${ScmId}#${ScmHandleNumber}`;
		} else if (ScmShimRegistry.has(ScmId)) {
			Entry = ScmShimRegistry.get(ScmId);
			RegistryKey = ScmId;
		}
		if (!Entry) return;
		try {
			Entry.Repository?.dispose?.();
			Entry.Provider?.dispose?.();
		} catch {}
		if (RegistryKey) ScmShimRegistry.delete(RegistryKey);
		if (Entry.ScmHandle !== undefined) {
			ScmShimByHandle.delete(Entry.ScmHandle);
		}
	};

	// Match the wire payload's `scmHandle` (numeric, from
	// `RegisterScmResourceGroup.rs:78`) against our registry. Each repo
	// has a UNIQUE handle, so handle-lookup is the authoritative key in
	// multi-repo workspaces; the legacy `scmId` fallback covers payloads
	// that arrived before the producer started emitting handles.
	const ResolveScmShim = (Payload: any): CelSCMShim | null => {
		const Handle = Payload?.scmHandle;
		if (typeof Handle === "number") {
			const ByHandle = ScmShimByHandle.get(Handle);
			if (ByHandle) return ByHandle;
		}
		const ScmId = Payload?.scmId ?? Payload?.providerId;
		if (typeof ScmId === "string") {
			// With per-handle keys, `ScmId` alone is ambiguous; a bare
			// `scmId` lookup only resolves when exactly one provider with
			// that id is registered.
			if (ScmShimRegistry.has(ScmId)) {
				return ScmShimRegistry.get(ScmId) ?? null;
			}
			let SoleMatch: CelSCMShim | null = null;
			let Count = 0;
			for (const [Key, Shim] of ScmShimRegistry) {
				if (Key === ScmId || Key.startsWith(`${ScmId}#`)) {
					SoleMatch = Shim;

					Count += 1;
				}
			}
			if (Count === 1) return SoleMatch;
		}
		return null;
	};

	const TryRegisterScmGroup = (Payload: any): void => {
		const Services: any = (globalThis as any).__CEL_SERVICES__;
		if (!Services || !Services.Emitter || !Services.URI) return;
		const Shim = ResolveScmShim(Payload);
		if (!Shim) return;
		const GroupHandle: string = String(Payload?.groupHandle ?? "");
		const GroupId: string = String(Payload?.groupId ?? "");
		if (!GroupHandle || !GroupId) return;
		if (Shim.Groups.has(GroupHandle)) return;
		try {
			const ChangeEmitter = new Services.Emitter();
			const ChangeResourcesEmitter = new Services.Emitter();
			const Group: any = {
				id: GroupId,
				label: String(Payload?.label ?? GroupId),
				resources: [] as any[],
				features: { hideWhenEmpty: false },
				contextValue: undefined,
				hideWhenEmpty: false,
				multiDiffEditorEnableViewChanges: false,
				onDidChange: ChangeEmitter.event,
				onDidChangeResources: ChangeResourcesEmitter.event,
				get provider() {
					return Shim.Provider;
				},
				// `resourceTree` is consulted by the workbench's
				// hierarchical view mode (and by some flat-mode code
				// paths that pre-build the tree even when not
				// rendering it). Lazy-build a real `ResourceTree`
				// instance from the workbench's exposed class so the
				// panel can render either hierarchical or flat
				// without throwing. Cache per-group so repeat reads
				// don't rebuild on every tick.
				_resourceTree: null as any,
				get resourceTree() {
					const Self: any = this;

					if (Self._resourceTree) return Self._resourceTree;

					const Svc: any =
						(globalThis as any).__CEL_SERVICES__ ?? Services;

					const ResourceTreeCtor = Svc?.ResourceTree;

					const ExtUri =
						Svc?.UriIdentity?.extUri ??
						(Svc?.URI ? { isEqual: () => false } : null);

					const TreeRoot =
						(Shim.Provider?.rootUri as any) ||
						(Svc?.URI?.file ? Svc.URI.file("/") : null);

					if (!ResourceTreeCtor || !TreeRoot) return null;

					try {
						Self._resourceTree = new ResourceTreeCtor(
							Self,

							TreeRoot,

							ExtUri,
						);

						for (const Resource of Self.resources) {
							try {
								Self._resourceTree.add(
									Resource.sourceUri,

									Resource,
								);
							} catch {
								// One bad resource shouldn't take down
								// the whole tree.
							}
						}

						return Self._resourceTree;
					} catch {
						return null;
					}
				},
				splice: (
					Start: number,

					DeleteCount: number,

					ToInsert: any[],
				) => {
					(Group.resources as any[]).splice(
						Start,

						DeleteCount,
						...ToInsert,
					);

					// Invalidate tree cache so next read rebuilds it
					// against the updated `resources` array.
					(Group as any)._resourceTree = null;

					ChangeResourcesEmitter.fire();
				},
			};
			const GroupShim: CelSCMGroupShim = {
				GroupHandle,
				GroupId,
				ResourceStates: [],
				Group,
				ChangeEmitter,
				ChangeResourcesEmitter,
			};
			Shim.Groups.set(GroupHandle, GroupShim);
			(Shim as any).ProviderGroupsList.push(Group);
			Shim.ResourceGroupsEmitter.fire();
		} catch (Error) {
			try {
				const W = globalThis as any;

				if (W?.process?.env?.Trace?.includes?.("cel-scm")) {
					(W.console || console).warn(
						`[Sky:CEL-SCM] registerGroup failed for "${GroupId}": ${
							(Error as { message?: string })?.message ??
							String(Error)
						}`,
					);
				}
			} catch {}
		}
	};

	const TryUpdateScmGroup = (Payload: any): void => {
		const Services: any = (globalThis as any).__CEL_SERVICES__;
		if (!Services || !Services.URI) return;
		const Shim = ResolveScmShim(Payload);
		if (!Shim) return;
		const GroupHandle: string = String(Payload?.groupHandle ?? "");
		const GroupId: string = String(Payload?.groupId ?? "");
		// Mountain emits both `groupHandle` (canonical) and `groupId`
		// (split form). Prefer handle lookup; fall back to id-scan.
		let Group: CelSCMGroupShim | undefined =
			GroupHandle && Shim.Groups.get(GroupHandle);
		if (!Group && GroupId) {
			for (const Candidate of Shim.Groups.values()) {
				if (Candidate.GroupId === GroupId) {
					Group = Candidate;

					break;
				}
			}
		}
		if (!Group) return;
		const RawStates = Array.isArray(Payload?.resourceStates)
			? Payload.resourceStates
			: [];
		const Resources = RawStates.map((Raw: any) =>
			BuildScmResource(Services, Group!.Group, Raw),
		).filter((R: any): R is any => R !== null);
		// `splice` updates the live array + fires the panel's
		// re-render hook in one go. Replacing the contents in
		// place preserves array identity for any cached refs.
		// The custom splice wrapper signature is splice(Start, DeleteCount, ToInsert)
		// where ToInsert is the array. It spreads internally: ...ToInsert.
		// Passing ...Resources here would put each element into the wrong
		// parameter slot and cause "Spread syntax requires iterable" when empty.
		Group.Group.splice(0, Group.Group.resources.length, Resources);
		Group.ResourceStates = RawStates;
		// Provider-level change notifier - the SCM viewlet's title-bar
		// count, the activity-bar badge, and the Source Control welcome
		// suppression all read `provider.count`/`provider.onDidChange`.
		// Without firing here the resource-row tree updates but the badge
		// keeps showing the stale (or "undefined") count we saw on boot.
		try {
			const Emitter = (Shim.Provider as any)?.onDidChange;
			if (Emitter && typeof Emitter._emitter?.fire === "function") {
				Emitter._emitter.fire();
			}
		} catch {
			/* swallow - workbench may already have torn the provider down */
		}
		// Re-fire the resource-groups event too so the panel re-iterates
		// `provider.groups`; without this, late-arriving group entries
		// from the replay pass can end up invisible.
		try {
			Shim.ResourceGroupsEmitter?.fire?.();
		} catch {}
	};

	await Register("sky://scm/register", (Payload: any) => {
		document.dispatchEvent(
			new CustomEvent("cel:scm:register", { detail: Payload }),
		);

		TryRegisterScmProvider(Payload);
	});

	await Register("sky://scm/registerGroup", (Payload: any) => {
		document.dispatchEvent(
			new CustomEvent("cel:scm:registerGroup", { detail: Payload }),
		);

		TryRegisterScmGroup(Payload);
	});
	await Register("sky://scm/unregister", (Payload: any) => {
		document.dispatchEvent(
			new CustomEvent("cel:scm:unregister", { detail: Payload }),
		);

		TryUnregisterScmProvider(Payload);
	});
	await Register("sky://scm/updateGroup", (Payload: any) => {
		document.dispatchEvent(
			new CustomEvent("cel:scm:updateGroup", { detail: Payload }),
		);

		TryUpdateScmGroup(Payload);
	});

	// `sky://scm/provider/changed` - Mountain emits this when an extension
	// updates `sourceControl.inputBox.value`, `commitTemplate`, or similar
	// via `$scm:updateSourceControl`. We find the matching shim's InputModel
	// and apply the new value so the workbench commit input shows the extension-set text.
	await Register("sky://scm/provider/changed", (Payload: any) => {
		const Handle: number | undefined =
			typeof Payload?.handle === "number" ? Payload.handle : undefined;

		if (Handle === undefined) return;

		const Shim = ScmShimByHandle.get(Handle);

		if (!Shim) return;

		// Update input box text model if inputBoxValue changed
		const NewValue = Payload?.provider?.inputBox?.value;

		if (typeof NewValue === "string") {
			try {
				const InputModel = (Shim as any).Provider?.inputBoxTextModel;

				if (InputModel?.setValue) {
					InputModel.setValue(NewValue);
				} else if (InputModel?.applyEdits) {
					const LineCount = InputModel.getLineCount?.() ?? 1;

					const LastCol =
						InputModel.getLineMaxColumn?.(LineCount) ?? 1;

					InputModel.applyEdits([
						{
							range: {
								startLineNumber: 1,
								startColumn: 1,
								endLineNumber: LineCount,
								endColumn: LastCol,
							},
							text: NewValue,
							forceMoveMarkers: true,
						},
					]);
				}
			} catch {
				/* InputModel may not support setValue on all VS Code versions */
			}
		}

		// Update the mutable commit-template backing the provider's
		// `commitTemplate` observable when the payload carries one
		// (`SourceControlManagementProviderDTO.CommitTemplate`, camelCase
		// on the wire).
		const NewTemplate =
			Payload?.provider?.commitTemplate ?? Payload?.commitTemplate;

		if (typeof NewTemplate === "string") {
			try {
				(Shim as any).SetCommitTemplate?.(NewTemplate);
			} catch {}
		}

		// Fire the shim's stored ChangeEmitter so the SCM panel re-renders;
		// fall back to the workbench Emitter's private `_emitter` only when
		// the stored handle is missing.
		try {
			const StoredEmitter = (Shim as any).ChangeEmitter;

			if (typeof StoredEmitter?.fire === "function") {
				StoredEmitter.fire();
			} else {
				(Shim as any).Provider?.onDidChange?._emitter?.fire?.();
			}
		} catch {}
	});
};
