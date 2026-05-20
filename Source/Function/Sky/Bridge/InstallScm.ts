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
			} else if (typeof UriField.toString === "function") {
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
		if (ScmShimRegistry.has(ScmId)) return;
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
				const InputUri = Services.URI.from({
					scheme: "cel-scm-input",
					path: `/${ScmId}/input`,
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
			const Provider = {
				id: ScmId,
				providerId: ScmId,
				label: String(Payload?.label ?? ScmId),
				name: String(Payload?.label ?? ScmId),
				rootUri: RootUri,
				get groups() {
					return ProviderGroupsList;
				},
				onDidChange: ChangeEmitter.event,
				onDidChangeResourceGroups: ResourceGroupsEmitter.event,
				onDidChangeResources: ResourcesEmitter.event,
				count: { get: () => 0 } as any,
				commitTemplate: { get: () => "" } as any,
				contextValue: { get: () => undefined } as any,
				artifactProvider: { get: () => undefined } as any,
				historyProvider: { get: () => undefined } as any,
				actionButton: { get: () => undefined } as any,
				statusBarCommands: { get: () => [] } as any,
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
			const ScmHandleNumber: number | undefined =
				typeof Payload?.handle === "number"
					? Payload.handle
					: undefined;
			const Shim: CelSCMShim = {
				Provider,
				Repository,
				ScmHandle: ScmHandleNumber,
				Groups: new Map(),
				ResourceGroupsEmitter,
			};
			ScmShimRegistry.set(ScmId, Shim);
			if (ScmHandleNumber !== undefined) {
				ScmShimByHandle.set(ScmHandleNumber, Shim);
			}
			// Keep `ProviderGroupsList` reachable from the shim so
			// the registerGroup handler can mutate it in place.
			(Shim as any).ProviderGroupsList = ProviderGroupsList;
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
		const Entry = ScmShimRegistry.get(ScmId);
		if (!Entry) return;
		try {
			Entry.Repository?.dispose?.();
			Entry.Provider?.dispose?.();
		} catch {}
		ScmShimRegistry.delete(ScmId);
		if (Entry.ScmHandle !== undefined) {
			ScmShimByHandle.delete(Entry.ScmHandle);
		}
	};

	// Match the wire payload's `scmHandle` (numeric, from
	// `RegisterScmResourceGroup.rs:78`) against our registry. Falls
	// back to a linear scan when the payload only carries `scmId`.
	const ResolveScmShim = (Payload: any): CelSCMShim | null => {
		const Handle = Payload?.scmHandle;
		if (typeof Handle === "number") {
			const ByHandle = ScmShimByHandle.get(Handle);
			if (ByHandle) return ByHandle;
		}
		const ScmId = Payload?.scmId ?? Payload?.providerId;
		if (typeof ScmId === "string") {
			const ById = ScmShimRegistry.get(ScmId);
			if (ById) return ById;
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
		Group.Group.splice(0, Group.Group.resources.length, Resources);
		Group.ResourceStates = RawStates;
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
};
