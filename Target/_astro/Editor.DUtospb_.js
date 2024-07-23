import {
	a as _,
	m as A,
	u as y,
	b,
	d as z,
	o as ne,
	e as D,
	s as ie,
	g as re,
	f as X,
	j as M,
	k as se,
	t as w,
	n as ae,
	i as L,
	c as O,
	p as oe,
	q as le,
} from "./web.Bb4_WBG9.js";
import { e as H } from "./editor.main.COpP3lv-.js";
import "./preload-helper.BiBI96sQ.js";
function d(e) {
	const [t, n] = _(e);
	return { get: t, set: n };
}
function ue({
	initialValues: e = {},
	validateOn: t = "submit",
	revalidateOn: n = "input",
	validate: i,
} = {}) {
	const a = d([]),
		l = d([]),
		s = d(),
		r = d(0),
		u = d(!1),
		o = d(!1),
		f = d(!1),
		c = d(!1),
		g = d(!1),
		m = d(!1),
		h = d({});
	return {
		internal: {
			initialValues: e,
			validate: i,
			validateOn: t,
			revalidateOn: n,
			fieldNames: a,
			fieldArrayNames: l,
			element: s,
			submitCount: r,
			submitting: u,
			submitted: o,
			validating: f,
			touched: c,
			dirty: g,
			invalid: m,
			response: h,
			fields: {},
			fieldArrays: {},
			validators: new Set(),
		},
		get element() {
			return s.get();
		},
		get submitCount() {
			return r.get();
		},
		get submitting() {
			return u.get();
		},
		get submitted() {
			return o.get();
		},
		get validating() {
			return f.get();
		},
		get touched() {
			return c.get();
		},
		get dirty() {
			return g.get();
		},
		get invalid() {
			return m.get();
		},
		get response() {
			return h.get();
		},
	};
}
function ce(e) {
	const t = ue(e);
	return [
		t,
		{
			Form: (n) => De(A({ of: t }, n)),
			Field: (n) => Ce(A({ of: t }, n)),
			FieldArray: (n) => Ne(A({ of: t }, n)),
		},
	];
}
function U(e, t, n) {
	const {
		checked: i,
		files: a,
		options: l,
		value: s,
		valueAsDate: r,
		valueAsNumber: u,
	} = e;
	return y(() =>
		!n || n === "string"
			? s
			: n === "string[]"
				? l
					? [...l]
							.filter((o) => o.selected && !o.disabled)
							.map((o) => o.value)
					: i
						? [...(t.value.get() || []), s]
						: (t.value.get() || []).filter((o) => o !== s)
				: n === "number"
					? u
					: n === "boolean"
						? i
						: n === "File" && a
							? a[0]
							: n === "File[]" && a
								? [...a]
								: n === "Date" && r
									? r
									: t.value.get(),
	);
}
function V(e) {
	return [
		...Object.values(e.internal.fields),
		...Object.values(e.internal.fieldArrays),
	];
}
function S(e, t) {
	return e.internal.fieldArrays[t];
}
function de(e, t) {
	return +t.replace(`${e}.`, "").split(".")[0];
}
function G(e, t) {
	J(e, !1).forEach((n) => {
		const i = y(S(e, n).items.get).length - 1;
		t.filter((a) => a.startsWith(`${n}.`) && de(n, a) > i).forEach((a) => {
			t.splice(t.indexOf(a), 1);
		});
	});
}
function J(e, t = !0) {
	const n = [...y(e.internal.fieldArrayNames.get)];
	return t && G(e, n), n;
}
function fe(e, t = !0) {
	const n = [...y(e.internal.fieldNames.get)];
	return t && G(e, n), n;
}
function F(e, t) {
	return e.internal.fields[t];
}
function $(e, t, n) {
	return y(() => {
		const i = fe(e, n),
			a = J(e, n);
		return typeof t == "string" || Array.isArray(t)
			? (typeof t == "string" ? [t] : t)
					.reduce(
						(l, s) => {
							const [r, u] = l;
							return (
								a.includes(s)
									? (a.forEach((o) => {
											o.startsWith(s) && u.add(o);
										}),
										i.forEach((o) => {
											o.startsWith(s) && r.add(o);
										}))
									: r.add(s),
								l
							);
						},
						[new Set(), new Set()],
					)
					.map((l) => [...l])
			: [i, a];
	});
}
function j(e, t) {
	return (typeof e != "string" && !Array.isArray(e) ? e : t) || {};
}
function T(e, t) {
	return e.split(".").reduce((n, i) => n?.[i], t);
}
let ge = 0;
function I() {
	return ge++;
}
function ye(e, t) {
	const n = (i) => (i instanceof Blob ? i.size : i);
	return Array.isArray(e) && Array.isArray(t)
		? e.map(n).join() !== t.map(n).join()
		: e instanceof Date && t instanceof Date
			? e.getTime() !== t.getTime()
			: Number.isNaN(e) && Number.isNaN(t)
				? !1
				: e !== t;
}
function me(e, t) {
	y(() =>
		e.internal.dirty.set(
			t || V(e).some((n) => n.active.get() && n.dirty.get()),
		),
	);
}
function ve(e, t) {
	y(() => {
		const n = ye(t.startValue.get(), t.value.get());
		n !== t.dirty.get() &&
			b(() => {
				t.dirty.set(n), me(e, n);
			});
	});
}
function he(e, t, n, { on: i, shouldFocus: a = !1 }) {
	y(() => {
		i.includes(
			(
				e.internal.validateOn === "submit"
					? e.internal.submitted.get()
					: t.error.get()
			)
				? e.internal.revalidateOn
				: e.internal.validateOn,
		) && R(e, n, { shouldFocus: a });
	});
}
function P(e, t, n, i, a, l) {
	b(() => {
		t.value.set((s) => t.transform.reduce((r, u) => u(r, i), l ?? s)),
			t.touched.set(!0),
			e.internal.touched.set(!0),
			ve(e, t),
			he(e, t, n, { on: a });
	});
}
function pe(e, t) {
	if (!S(e, t)) {
		const n = T(t, e.internal.initialValues)?.map(() => I()) || [],
			i = d(n),
			a = d(n),
			l = d(n),
			s = d(""),
			r = d(!1),
			u = d(!1),
			o = d(!1);
		(e.internal.fieldArrays[t] = {
			initialItems: i,
			startItems: a,
			items: l,
			error: s,
			active: r,
			touched: u,
			dirty: o,
			validate: [],
			consumers: new Set(),
		}),
			e.internal.fieldArrayNames.set((f) => [...f, t]);
	}
	return S(e, t);
}
function be(e, t) {
	if (!F(e, t)) {
		const n = T(t, e.internal.initialValues),
			i = d([]),
			a = d(n),
			l = d(n),
			s = d(n),
			r = d(""),
			u = d(!1),
			o = d(!1),
			f = d(!1);
		(e.internal.fields[t] = {
			elements: i,
			initialValue: a,
			startValue: l,
			value: s,
			error: r,
			active: u,
			touched: o,
			dirty: f,
			validate: [],
			transform: [],
			consumers: new Set(),
		}),
			e.internal.fieldNames.set((c) => [...c, t]);
	}
	return F(e, t);
}
function Ae(e, t, { shouldActive: n = !0 }) {
	const i = Object.entries(t)
		.reduce(
			(a, [l, s]) => (
				[F(e, l), S(e, l)].every(
					(r) => !r || (n && !y(r.active.get)),
				) && a.push(s),
				a
			),
			[],
		)
		.join(" ");
	i && e.internal.response.set({ status: "error", message: i });
}
function Q(e, t) {
	y(() => {
		e.internal.invalid.set(
			t || V(e).some((n) => n.active.get() && n.error.get()),
		);
	});
}
function x(e) {
	let t = !1,
		n = !1,
		i = !1;
	y(() => {
		for (const a of V(e))
			if (
				(a.active.get() &&
					(a.touched.get() && (t = !0),
					a.dirty.get() && (n = !0),
					a.error.get() && (i = !0)),
				t && n && i)
			)
				break;
	}),
		b(() => {
			e.internal.touched.set(t),
				e.internal.dirty.set(n),
				e.internal.invalid.set(i);
		});
}
function Y(e, t) {
	y(() => F(e, t)?.elements.get()[0]?.focus());
}
function Z(
	e,
	t,
	n,
	{
		shouldActive: i = !0,
		shouldTouched: a = !1,
		shouldDirty: l = !1,
		shouldFocus: s = !!n,
	} = {},
) {
	b(() => {
		y(() => {
			for (const r of [F(e, t), S(e, t)])
				r &&
					(!i || r.active.get()) &&
					(!a || r.touched.get()) &&
					(!l || r.dirty.get()) &&
					(r.error.set(n), n && "value" in r && s && Y(e, t));
		}),
			Q(e, !!n);
	});
}
function Se(e, t, n) {
	Z(e, t, "", n);
}
function ee(e, t, n) {
	const [i, a] = $(e, t),
		{
			shouldActive: l = !0,
			shouldTouched: s = !1,
			shouldDirty: r = !1,
			shouldValid: u = !1,
		} = j(t, n);
	return (
		typeof t != "string" && !Array.isArray(t)
			? e.internal.fieldNames.get()
			: a.forEach((o) => S(e, o).items.get()),
		i.reduce(
			(o, f) => {
				const c = F(e, f);
				return (
					(!l || c.active.get()) &&
						(!s || c.touched.get()) &&
						(!r || c.dirty.get()) &&
						(!u || !c.error.get()) &&
						(typeof t == "string" ? f.replace(`${t}.`, "") : f)
							.split(".")
							.reduce(
								(g, m, h, p) =>
									(g[m] =
										h === p.length - 1
											? c.value.get()
											: (typeof g[m] == "object" &&
													g[m]) ||
												(isNaN(+p[h + 1]) ? {} : [])),
								o,
							),
					o
				);
			},
			typeof t == "string" ? [] : {},
		)
	);
}
function Fe(e, t, n) {
	const [i, a] = $(e, t, !1),
		l = typeof t == "string" && i.length === 1,
		s = !l && !Array.isArray(t),
		r = j(t, n),
		{
			initialValue: u,
			initialValues: o,
			keepResponse: f = !1,
			keepSubmitCount: c = !1,
			keepSubmitted: g = !1,
			keepValues: m = !1,
			keepDirtyValues: h = !1,
			keepItems: p = !1,
			keepDirtyItems: E = !1,
			keepErrors: C = !1,
			keepTouched: W = !1,
			keepDirty: q = !1,
		} = r;
	b(() =>
		y(() => {
			i.forEach((N) => {
				const v = F(e, N);
				(l ? "initialValue" in r : o) &&
					v.initialValue.set(() => (l ? u : T(N, o)));
				const k = h && v.dirty.get();
				!m &&
					!k &&
					(v.startValue.set(v.initialValue.get),
					v.value.set(v.initialValue.get),
					v.elements.get().forEach((B) => {
						B.type === "file" && (B.value = "");
					})),
					W || v.touched.set(!1),
					!q && !m && !k && v.dirty.set(!1),
					C || v.error.set("");
			}),
				a.forEach((N) => {
					const v = S(e, N),
						k = E && v.dirty.get();
					!p &&
						!k &&
						(o && v.initialItems.set(T(N, o)?.map(() => I()) || []),
						v.startItems.set([...v.initialItems.get()]),
						v.items.set([...v.initialItems.get()])),
						W || v.touched.set(!1),
						!q && !p && !k && v.dirty.set(!1),
						C || v.error.set("");
				}),
				s &&
					(f || e.internal.response.set({}),
					c || e.internal.submitCount.set(0),
					g || e.internal.submitted.set(!1)),
				x(e);
		}),
	);
}
function Ee(e, t, { duration: n } = {}) {
	e.internal.response.set(t),
		n &&
			setTimeout(() => {
				y(e.internal.response.get) === t && e.internal.response.set({});
			}, n);
}
async function R(e, t, n) {
	const [i, a] = $(e, t),
		{ shouldActive: l = !0, shouldFocus: s = !0 } = j(t, n),
		r = I();
	e.internal.validators.add(r), e.internal.validating.set(!0);
	const u = e.internal.validate
		? await e.internal.validate(y(() => ee(e, { shouldActive: l })))
		: {};
	let o =
		typeof t != "string" && !Array.isArray(t) ? !Object.keys(u).length : !0;
	const [f] = await Promise.all([
		Promise.all(
			i.map(async (c) => {
				const g = F(e, c);
				if (!l || y(g.active.get)) {
					let m;
					for (const p of g.validate)
						if (((m = await p(y(g.value.get))), m)) break;
					const h = m || u[c] || "";
					return h && (o = !1), g.error.set(h), h ? c : null;
				}
			}),
		),
		Promise.all(
			a.map(async (c) => {
				const g = S(e, c);
				if (!l || y(g.active.get)) {
					let m = "";
					for (const p of g.validate)
						if (((m = await p(y(g.items.get))), m)) break;
					const h = m || u[c] || "";
					h && (o = !1), g.error.set(h);
				}
			}),
		),
	]);
	return (
		b(() => {
			if ((Ae(e, u, { shouldActive: l }), s)) {
				const c = f.find((g) => g);
				c && Y(e, c);
			}
			Q(e, !o),
				e.internal.validators.delete(r),
				e.internal.validators.size || e.internal.validating.set(!1);
		}),
		o
	);
}
function te({
	of: e,
	name: t,
	getStore: n,
	validate: i,
	transform: a,
	keepActive: l = !1,
	keepState: s = !0,
}) {
	z(() => {
		const r = n();
		(r.validate = i ? (Array.isArray(i) ? i : [i]) : []),
			"transform" in r &&
				(r.transform = a ? (Array.isArray(a) ? a : [a]) : []);
		const u = I();
		r.consumers.add(u),
			y(r.active.get) ||
				b(() => {
					r.active.set(!0), x(e);
				}),
			ne(() =>
				setTimeout(() => {
					r.consumers.delete(u),
						b(() => {
							!l &&
								!r.consumers.size &&
								(r.active.set(!1), s ? x(e) : Fe(e, t));
						}),
						"elements" in r &&
							r.elements.set((o) =>
								o.filter((f) => f.isConnected),
							);
				}),
			);
	});
}
function Ce(e) {
	const t = D(() => be(e.of, e.name));
	return (
		te(A({ getStore: t }, e)),
		D(() =>
			e.children(
				{
					get name() {
						return e.name;
					},
					get value() {
						return t().value.get();
					},
					get error() {
						return t().error.get();
					},
					get active() {
						return t().active.get();
					},
					get touched() {
						return t().touched.get();
					},
					get dirty() {
						return t().dirty.get();
					},
				},
				{
					get name() {
						return e.name;
					},
					get autofocus() {
						return !!t().error.get();
					},
					ref(n) {
						t().elements.set((i) => [...i, n]),
							z(() => {
								if (
									n.type !== "radio" &&
									t().startValue.get() === void 0 &&
									y(t().value.get) === void 0
								) {
									const i = U(n, t(), e.type);
									t().startValue.set(() => i),
										t().value.set(() => i);
								}
							});
					},
					onInput(n) {
						P(
							e.of,
							t(),
							e.name,
							n,
							["touched", "input"],
							U(n.currentTarget, t(), e.type),
						);
					},
					onChange(n) {
						P(e.of, t(), e.name, n, ["change"]);
					},
					onBlur(n) {
						P(e.of, t(), e.name, n, ["touched", "blur"]);
					},
				},
			),
		)
	);
}
function Ne(e) {
	const t = D(() => pe(e.of, e.name));
	return (
		te(A({ getStore: t }, e)),
		D(() =>
			e.children({
				get name() {
					return e.name;
				},
				get items() {
					return t().items.get();
				},
				get error() {
					return t().error.get();
				},
				get active() {
					return t().active.get();
				},
				get touched() {
					return t().touched.get();
				},
				get dirty() {
					return t().dirty.get();
				},
			}),
		)
	);
}
class K extends Error {
	name = "FormError";
	errors;
	constructor(t, n) {
		super(typeof t == "string" ? t : ""),
			(this.errors = typeof t == "string" ? n || {} : t);
	}
}
var ke = w("<form novalidate>");
function De(e) {
	const [, t, n] = ie(
		e,
		["of"],
		[
			"keepResponse",
			"shouldActive",
			"shouldTouched",
			"shouldDirty",
			"shouldFocus",
		],
	);
	return (() => {
		var i = re(ke),
			a = e.of.internal.element.set;
		return (
			typeof a == "function" ? X(a, i) : (e.of.internal.element.set = i),
			M(
				i,
				A(n, {
					onSubmit: async (l) => {
						l.preventDefault();
						const { of: s, onSubmit: r, responseDuration: u } = e;
						b(() => {
							t.keepResponse || s.internal.response.set({}),
								s.internal.submitCount.set((o) => o + 1),
								s.internal.submitted.set(!0),
								s.internal.submitting.set(!0);
						});
						try {
							(await R(s, t)) && (await r(ee(s, t), l));
						} catch (o) {
							b(() => {
								o instanceof K &&
									Object.entries(o.errors).forEach(
										([f, c]) => {
											c &&
												Z(s, f, c, {
													...t,
													shouldFocus: !1,
												});
										},
									),
									(!(o instanceof K) || o.message) &&
										Ee(
											s,
											{
												status: "error",
												message:
													o?.message ||
													"An unknown error has occurred.",
											},
											{ duration: u },
										);
							});
						} finally {
							s.internal.submitting.set(!1);
						}
					},
				}),
				!1,
			),
			se(),
			i
		);
	})();
}
function we(e) {
	return (t) => ((!t && t !== 0) || (Array.isArray(t) && !t.length) ? e : "");
}
var Te = w("<div>"),
	Ie = w(
		"<div class=w-full><div class=Editor><code class=Monaco></code><input>",
	),
	Le = w("<div class=Error><span>&nbsp;&nbsp;&nbsp;"),
	Oe = w("<input type=hidden>"),
	$e = ({ Type: e } = { Type: "HTML" }) => {
		const [t, { Form: n, Field: i }] = ce();
		crypto.randomUUID();
		const a = _(Pe(e));
		let l, s;
		return (
			ae(() => {
				console.log(void 0),
					l instanceof HTMLElement &&
						((s = H.create(l, {
							value: a[0](),
							language: e.toLowerCase(),
							automaticLayout: !0,
							lineNumbers: "off",
							"semanticHighlighting.enabled": "configuredByTheme",
							autoClosingBrackets: "always",
							autoIndent: "full",
							tabSize: 4,
							detectIndentation: !1,
							useTabStops: !0,
							minimap: { enabled: !1 },
							scrollbar: {
								useShadows: !0,
								horizontal: "hidden",
								verticalScrollbarSize: 10,
								verticalSliderSize: 4,
								alwaysConsumeMouseWheel: !1,
							},
							folding: !1,
							theme: window.matchMedia(
								"(prefers-color-scheme: dark)",
							).matches
								? "Dark"
								: "Light",
							wrappingStrategy: "advanced",
							bracketPairColorization: {
								enabled: !0,
								independentColorPoolPerBracketType: !0,
							},
							padding: { top: 12, bottom: 12 },
							fixedOverflowWidgets: !0,
							tabCompletion: "on",
							acceptSuggestionOnEnter: "on",
							cursorWidth: 5,
							roundedSelection: !0,
							matchBrackets: "always",
							autoSurround: "languageDefined",
							screenReaderAnnounceInlineSuggestion: !1,
							renderFinalNewline: "on",
							selectOnLineNumbers: !1,
							formatOnType: !0,
							formatOnPaste: !0,
							fontFamily: "'Source Code Pro'",
							fontWeight: "400",
							fontLigatures: !0,
							links: !1,
							fontSize: 16,
						})),
						s.getModel()?.setEOL(H.EndOfLineSequence.LF),
						s.onKeyDown((r) => {
							r.ctrlKey &&
								r.code === "KeyS" &&
								(r.preventDefault(), R(t), t.element?.submit());
						}),
						s.onDidChangeModelLanguageConfiguration(() =>
							s.getAction("editor.action.formatDocument")?.run(),
						),
						s.onDidLayoutChange(() =>
							s.getAction("editor.action.formatDocument")?.run(),
						),
						window.addEventListener("load", () =>
							s.getAction("editor.action.formatDocument")?.run(),
						),
						setTimeout(
							() =>
								s
									.getAction("editor.action.formatDocument")
									?.run(),
							1e3,
						),
						z(
							le(a[0], (r) => s.getModel()?.setValue(r), {
								defer: !1,
							}),
						));
			}),
			(() => {
				var r = Te();
				return (
					L(
						r,
						O(n, {
							method: "post",
							onSubmit: Me,
							get children() {
								return [
									O(i, {
										name: "Content",
										get validate() {
											return [
												we(`Please enter some ${e}.`),
											];
										},
										children: (u, o) =>
											(() => {
												var f = Ie(),
													c = f.firstChild,
													g = c.firstChild,
													m = g.nextSibling,
													h = l;
												return (
													typeof h == "function"
														? X(h, g)
														: (l = g),
													L(
														c,
														(() => {
															var p = D(
																() => !!u.error,
															);
															return () =>
																p() &&
																(() => {
																	var E =
																			Le(),
																		C =
																			E.firstChild;
																	return (
																		C.firstChild,
																		(E.$$click =
																			() => {
																				Se(
																					t,
																					"Content",
																				),
																					s.focus();
																			}),
																		L(
																			C,
																			() =>
																				u.error,
																			null,
																		),
																		E
																	);
																})();
														})(),
														m,
													),
													M(
														m,
														A(o, {
															type: "hidden",
															required: !0,
														}),
														!1,
													),
													f
												);
											})(),
									}),
									O(i, {
										name: "Field",
										children: (u, o) =>
											(() => {
												var f = Oe();
												return (
													M(
														f,
														A(o, { value: e }),
														!1,
													),
													f
												);
											})(),
									}),
								];
							},
						}),
					),
					r
				);
			})()
		);
	};
const Pe = (e) => {
		switch (e) {
			case "CSS":
				return `
/* Example CSS Code */
body {

}			
`;
			case "HTML":
				return `
<!-- Example HTML Code -->
<!doctype html>
<html lang="en">
	<body>
	</body>
</html>
`;
			case "TypeScript":
				return `
/**
 * Example TypeScript Code
 */
export default () => ({});
`;
			default:
				return "";
		}
	},
	Me = ({ Content: e, Field: t }, n) => {
		n && (n.preventDefault(), console.log(e), console.log(t));
	};
oe(["click"]);
export { Pe as Return, Me as Update, $e as default };
//# sourceMappingURL=Editor.DUtospb_.js.map
