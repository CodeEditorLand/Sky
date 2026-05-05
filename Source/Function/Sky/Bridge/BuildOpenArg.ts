/**
 * Normalises any URI-shaped input that crosses Sky → Cocoon →
 * extension into a `URI` instance the workbench can consume. Stock
 * VS Code's `vscode.env.openExternal(uri)` requires a real `URI`
 * (the workbench's URI class with `.with()` / `.fsPath` / etc); a
 * plain `{ scheme, path }` POJO surfaces as
 * `'xxx is not a function'` deep inside `_openExternal`. We reach
 * for `__CEL_SERVICES__.URI.from()` first and only emit the POJO
 * shape when the service handle isn't yet wired - that fallback is
 * still serialisable to / from the wire so the failure mode is
 * "URI loses its prototype" not "extension crashes".
 *
 * Three input shapes are accepted: plain strings (URL or filesystem
 * path), URI-like objects (`{ scheme, path, ... }`), and
 * `WorkspaceFolder`-style nested wrappers (`{ uri: { scheme, ... } }`).
 * Anything else passes through untouched so the caller can route
 * non-URI args to other handlers.
 */
// Minimal structural shape - the helper only needs `URI?.from(parts)`,
// not the full `CelServices` surface. Keeping the type local avoids a
// circular `import type` from Bridge.ts which still evaluates at
// compile-time and would couple this module's emit ordering.
interface ServicesProbe {
	URI?: {
		from(parts: {
			scheme: string;
			authority?: string;
			path?: string;
			query?: string;
			fragment?: string;
		}): unknown;
	};
}

export default (
	GetServices: () => ServicesProbe | null,
	Source: unknown,
): unknown => {
	const Ctor = GetServices()?.URI;
	const ExtractParts = (
		Value: unknown,
	): {
		Scheme: string;
		Authority: string;
		Path: string;
		Query: string;
		Fragment: string;
	} | null => {
		if (Value == null) return null;
		if (typeof Value === "string") {
			const Trimmed = Value.trim();
			if (!Trimmed) return null;
			if (Trimmed.includes("://")) {
				try {
					const Parsed = new URL(Trimmed);
					return {
						Scheme: Parsed.protocol.replace(/:$/, ""),
						Authority: Parsed.host,
						Path: decodeURIComponent(Parsed.pathname),
						Query: Parsed.search.replace(/^\?/, ""),
						Fragment: Parsed.hash.replace(/^#/, ""),
					};
				} catch {
					return null;
				}
			}
			return {
				Scheme: "file",
				Authority: "",
				Path: Trimmed,
				Query: "",
				Fragment: "",
			};
		}
		if (typeof Value !== "object") return null;
		const Holder = Value as Record<string, unknown>;
		if (Holder["uri"] && typeof Holder["uri"] === "object") {
			return ExtractParts(Holder["uri"]);
		}
		const Scheme = String(Holder["scheme"] ?? "file");
		const Path = String(Holder["path"] ?? Holder["fsPath"] ?? "");
		if (!Path) return null;
		return {
			Scheme,
			Authority: String(Holder["authority"] ?? ""),
			Path,
			Query: String(Holder["query"] ?? ""),
			Fragment: String(Holder["fragment"] ?? ""),
		};
	};
	const Parts = ExtractParts(Source);
	if (!Parts) return Source;
	if (Ctor) {
		try {
			return Ctor.from({
				scheme: Parts.Scheme,
				authority: Parts.Authority,
				path: Parts.Path,
				query: Parts.Query,
				fragment: Parts.Fragment,
			});
		} catch {
			/* fall through to POJO */
		}
	}
	return {
		$mid: 1,
		scheme: Parts.Scheme,
		authority: Parts.Authority,
		path: Parts.Path,
		query: Parts.Query,
		fragment: Parts.Fragment,
	};
};
