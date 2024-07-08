const __vite__mapDeps = (
	i,
	m = __vite__mapDeps,
	d = m.f ||
		(m.f = [
			"_astro/Context.Bu5wWiIs.js",
			"_astro/Editor.BrGPxqy1.js",
			"_astro/web.Dh-3o7rH.js",
			"_astro/Context.B6zNNifW.js",
			"_astro/Context.C6gjzhxr.js",
			"_astro/Context.B-xm8u_0.js",
			"_astro/Anchor.QMxO_YPj.js",
			"_astro/Merge.CzTQzxlv.js",
			"_astro/Button.jcqywE9T.js",
			"_astro/Copy.BvPFWC4d.js",
			"_astro/Copy.BCBGr1zU.css",
		]),
) => i.map((i) => d[i]);
import { _ as C } from "./Editor.BrGPxqy1.js";
import {
	d as Z,
	n as S,
	p as m,
	q as A,
	a as O,
	m as ce,
	v as _,
	w as fe,
	x as ge,
	k as ee,
	y as j,
	z as ye,
	t as L,
	o as H,
	A as he,
	i as V,
	c as k,
	F as me,
	f as ve,
	g as pe,
	j as Ee,
} from "./web.Dh-3o7rH.js";
import { e as G } from "./editor.main.CWF1r04W.js";
function f(e) {
	const [t, n] = Z(e);
	return { get: t, set: n };
}
function Ae({
	initialValues: e = {},
	validateOn: t = "submit",
	revalidateOn: n = "input",
	validate: r,
} = {}) {
	const a = f([]),
		l = f([]),
		o = f(),
		i = f(0),
		u = f(!1),
		s = f(!1),
		v = f(!1),
		d = f(!1),
		c = f(!1),
		g = f(!1),
		y = f({});
	return {
		internal: {
			initialValues: e,
			validate: r,
			validateOn: t,
			revalidateOn: n,
			fieldNames: a,
			fieldArrayNames: l,
			element: o,
			submitCount: i,
			submitting: u,
			submitted: s,
			validating: v,
			touched: d,
			dirty: c,
			invalid: g,
			response: y,
			fields: {},
			fieldArrays: {},
			validators: new Set(),
		},
		get element() {
			return o.get();
		},
		get submitCount() {
			return i.get();
		},
		get submitting() {
			return u.get();
		},
		get submitted() {
			return s.get();
		},
		get validating() {
			return v.get();
		},
		get touched() {
			return d.get();
		},
		get dirty() {
			return c.get();
		},
		get invalid() {
			return g.get();
		},
		get response() {
			return y.get();
		},
	};
}
function be(e) {
	const t = Ae(e);
	return [
		t,
		{
			Form: (n) => Me(S({ of: t }, n)),
			Field: (n) => Le(S({ of: t }, n)),
			FieldArray: (n) => Pe(S({ of: t }, n)),
		},
	];
}
function Q(e, t, n) {
	const {
		checked: r,
		files: a,
		options: l,
		value: o,
		valueAsDate: i,
		valueAsNumber: u,
	} = e;
	return m(() =>
		!n || n === "string"
			? o
			: n === "string[]"
				? l
					? [...l]
							.filter((s) => s.selected && !s.disabled)
							.map((s) => s.value)
					: r
						? [...(t.value.get() || []), o]
						: (t.value.get() || []).filter((s) => s !== o)
				: n === "number"
					? u
					: n === "boolean"
						? r
						: n === "File" && a
							? a[0]
							: n === "File[]" && a
								? [...a]
								: n === "Date" && i
									? i
									: t.value.get(),
	);
}
function W(e) {
	return [
		...Object.values(e.internal.fields),
		...Object.values(e.internal.fieldArrays),
	];
}
function F(e, t) {
	return e.internal.fieldArrays[t];
}
function Se(e, t) {
	return +t.replace(`${e}.`, "").split(".")[0];
}
function te(e, t) {
	ne(e, !1).forEach((n) => {
		const r = m(F(e, n).items.get).length - 1;
		t.filter((a) => a.startsWith(`${n}.`) && Se(n, a) > r).forEach((a) => {
			t.splice(t.indexOf(a), 1);
		});
	});
}
function ne(e, t = !0) {
	const n = [...m(e.internal.fieldArrayNames.get)];
	return t && te(e, n), n;
}
function Fe(e, t = !0) {
	const n = [...m(e.internal.fieldNames.get)];
	return t && te(e, n), n;
}
function w(e, t) {
	return e.internal.fields[t];
}
function q(e, t, n) {
	return m(() => {
		const r = Fe(e, n),
			a = ne(e, n);
		return typeof t == "string" || Array.isArray(t)
			? (typeof t == "string" ? [t] : t)
					.reduce(
						(l, o) => {
							const [i, u] = l;
							return (
								a.includes(o)
									? (a.forEach((s) => {
											s.startsWith(o) && u.add(s);
										}),
										r.forEach((s) => {
											s.startsWith(o) && i.add(s);
										}))
									: i.add(o),
								l
							);
						},
						[new Set(), new Set()],
					)
					.map((l) => [...l])
			: [r, a];
	});
}
function U(e, t) {
	return (typeof e != "string" && !Array.isArray(e) ? e : t) || {};
}
function M(e, t) {
	return e.split(".").reduce((n, r) => n?.[r], t);
}
let we = 0;
function z() {
	return we++;
}
function Ce(e, t) {
	const n = (r) => (r instanceof Blob ? r.size : r);
	return Array.isArray(e) && Array.isArray(t)
		? e.map(n).join() !== t.map(n).join()
		: e instanceof Date && t instanceof Date
			? e.getTime() !== t.getTime()
			: Number.isNaN(e) && Number.isNaN(t)
				? !1
				: e !== t;
}
function _e(e, t) {
	m(() =>
		e.internal.dirty.set(
			t || W(e).some((n) => n.active.get() && n.dirty.get()),
		),
	);
}
function ie(e, t) {
	m(() => {
		const n = Ce(t.startValue.get(), t.value.get());
		n !== t.dirty.get() &&
			A(() => {
				t.dirty.set(n), _e(e, n);
			});
	});
}
function re(e, t, n, { on: r, shouldFocus: a = !1 }) {
	m(() => {
		r.includes(
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
function $(e, t, n, r, a, l) {
	A(() => {
		t.value.set((o) => t.transform.reduce((i, u) => u(i, r), l ?? o)),
			t.touched.set(!0),
			e.internal.touched.set(!0),
			ie(e, t),
			re(e, t, n, { on: a });
	});
}
function Te(e, t) {
	if (!F(e, t)) {
		const n = M(t, e.internal.initialValues)?.map(() => z()) || [],
			r = f(n),
			a = f(n),
			l = f(n),
			o = f(""),
			i = f(!1),
			u = f(!1),
			s = f(!1);
		(e.internal.fieldArrays[t] = {
			initialItems: r,
			startItems: a,
			items: l,
			error: o,
			active: i,
			touched: u,
			dirty: s,
			validate: [],
			consumers: new Set(),
		}),
			e.internal.fieldArrayNames.set((v) => [...v, t]);
	}
	return F(e, t);
}
function ae(e, t) {
	if (!w(e, t)) {
		const n = M(t, e.internal.initialValues),
			r = f([]),
			a = f(n),
			l = f(n),
			o = f(n),
			i = f(""),
			u = f(!1),
			s = f(!1),
			v = f(!1);
		(e.internal.fields[t] = {
			elements: r,
			initialValue: a,
			startValue: l,
			value: o,
			error: i,
			active: u,
			touched: s,
			dirty: v,
			validate: [],
			transform: [],
			consumers: new Set(),
		}),
			e.internal.fieldNames.set((d) => [...d, t]);
	}
	return w(e, t);
}
function De(e, t, { shouldActive: n = !0 }) {
	const r = Object.entries(t)
		.reduce(
			(a, [l, o]) => (
				[w(e, l), F(e, l)].every(
					(i) => !i || (n && !m(i.active.get)),
				) && a.push(o),
				a
			),
			[],
		)
		.join(" ");
	r && e.internal.response.set({ status: "error", message: r });
}
function se(e, t) {
	m(() => {
		e.internal.invalid.set(
			t || W(e).some((n) => n.active.get() && n.error.get()),
		);
	});
}
function B(e) {
	let t = !1,
		n = !1,
		r = !1;
	m(() => {
		for (const a of W(e))
			if (
				(a.active.get() &&
					(a.touched.get() && (t = !0),
					a.dirty.get() && (n = !0),
					a.error.get() && (r = !0)),
				t && n && r)
			)
				break;
	}),
		A(() => {
			e.internal.touched.set(t),
				e.internal.dirty.set(n),
				e.internal.invalid.set(r);
		});
}
function oe(e, t) {
	m(() => w(e, t)?.elements.get()[0]?.focus());
}
function le(
	e,
	t,
	n,
	{
		shouldActive: r = !0,
		shouldTouched: a = !1,
		shouldDirty: l = !1,
		shouldFocus: o = !!n,
	} = {},
) {
	A(() => {
		m(() => {
			for (const i of [w(e, t), F(e, t)])
				i &&
					(!r || i.active.get()) &&
					(!a || i.touched.get()) &&
					(!l || i.dirty.get()) &&
					(i.error.set(n), n && "value" in i && o && oe(e, t));
		}),
			se(e, !!n);
	});
}
function Ie(e, t, n) {
	le(e, t, "", n);
}
function ue(e, t, n) {
	const [r, a] = q(e, t),
		{
			shouldActive: l = !0,
			shouldTouched: o = !1,
			shouldDirty: i = !1,
			shouldValid: u = !1,
		} = U(t, n);
	return (
		typeof t != "string" && !Array.isArray(t)
			? e.internal.fieldNames.get()
			: a.forEach((s) => F(e, s).items.get()),
		r.reduce(
			(s, v) => {
				const d = w(e, v);
				return (
					(!l || d.active.get()) &&
						(!o || d.touched.get()) &&
						(!i || d.dirty.get()) &&
						(!u || !d.error.get()) &&
						(typeof t == "string" ? v.replace(`${t}.`, "") : v)
							.split(".")
							.reduce(
								(c, g, y, p) =>
									(c[g] =
										y === p.length - 1
											? d.value.get()
											: (typeof c[g] == "object" &&
													c[g]) ||
												(isNaN(+p[y + 1]) ? {} : [])),
								s,
							),
					s
				);
			},
			typeof t == "string" ? [] : {},
		)
	);
}
function Ne(e, t, n) {
	const [r, a] = q(e, t, !1),
		l = typeof t == "string" && r.length === 1,
		o = !l && !Array.isArray(t),
		i = U(t, n),
		{
			initialValue: u,
			initialValues: s,
			keepResponse: v = !1,
			keepSubmitCount: d = !1,
			keepSubmitted: c = !1,
			keepValues: g = !1,
			keepDirtyValues: y = !1,
			keepItems: p = !1,
			keepDirtyItems: T = !1,
			keepErrors: D = !1,
			keepTouched: I = !1,
			keepDirty: P = !1,
		} = i;
	A(() =>
		m(() => {
			r.forEach((b) => {
				const h = w(e, b);
				(l ? "initialValue" in i : s) &&
					h.initialValue.set(() => (l ? u : M(b, s)));
				const N = y && h.dirty.get();
				!g &&
					!N &&
					(h.startValue.set(h.initialValue.get),
					h.value.set(h.initialValue.get),
					h.elements.get().forEach((J) => {
						J.type === "file" && (J.value = "");
					})),
					I || h.touched.set(!1),
					!P && !g && !N && h.dirty.set(!1),
					D || h.error.set("");
			}),
				a.forEach((b) => {
					const h = F(e, b),
						N = T && h.dirty.get();
					!p &&
						!N &&
						(s && h.initialItems.set(M(b, s)?.map(() => z()) || []),
						h.startItems.set([...h.initialItems.get()]),
						h.items.set([...h.initialItems.get()])),
						I || h.touched.set(!1),
						!P && !p && !N && h.dirty.set(!1),
						D || h.error.set("");
				}),
				o &&
					(v || e.internal.response.set({}),
					d || e.internal.submitCount.set(0),
					c || e.internal.submitted.set(!1)),
				B(e);
		}),
	);
}
function ke(e, t, { duration: n } = {}) {
	e.internal.response.set(t),
		n &&
			setTimeout(() => {
				m(e.internal.response.get) === t && e.internal.response.set({});
			}, n);
}
function Oe(
	e,
	t,
	n,
	{
		shouldTouched: r = !0,
		shouldDirty: a = !0,
		shouldValidate: l = !0,
		shouldFocus: o = !0,
	} = {},
) {
	A(() => {
		const i = ae(e, t);
		i.value.set(() => n),
			r && (i.touched.set(!0), e.internal.touched.set(!0)),
			a && ie(e, i),
			l && re(e, i, t, { on: ["touched", "input"], shouldFocus: o });
	});
}
async function R(e, t, n) {
	const [r, a] = q(e, t),
		{ shouldActive: l = !0, shouldFocus: o = !0 } = U(t, n),
		i = z();
	e.internal.validators.add(i), e.internal.validating.set(!0);
	const u = e.internal.validate
		? await e.internal.validate(m(() => ue(e, { shouldActive: l })))
		: {};
	let s =
		typeof t != "string" && !Array.isArray(t) ? !Object.keys(u).length : !0;
	const [v] = await Promise.all([
		Promise.all(
			r.map(async (d) => {
				const c = w(e, d);
				if (!l || m(c.active.get)) {
					let g;
					for (const p of c.validate)
						if (((g = await p(m(c.value.get))), g)) break;
					const y = g || u[d] || "";
					return y && (s = !1), c.error.set(y), y ? d : null;
				}
			}),
		),
		Promise.all(
			a.map(async (d) => {
				const c = F(e, d);
				if (!l || m(c.active.get)) {
					let g = "";
					for (const p of c.validate)
						if (((g = await p(m(c.items.get))), g)) break;
					const y = g || u[d] || "";
					y && (s = !1), c.error.set(y);
				}
			}),
		),
	]);
	return (
		A(() => {
			if ((De(e, u, { shouldActive: l }), o)) {
				const d = v.find((c) => c);
				d && oe(e, d);
			}
			se(e, !s),
				e.internal.validators.delete(i),
				e.internal.validators.size || e.internal.validating.set(!1);
		}),
		s
	);
}
function de({
	of: e,
	name: t,
	getStore: n,
	validate: r,
	transform: a,
	keepActive: l = !1,
	keepState: o = !0,
}) {
	O(() => {
		const i = n();
		(i.validate = r ? (Array.isArray(r) ? r : [r]) : []),
			"transform" in i &&
				(i.transform = a ? (Array.isArray(a) ? a : [a]) : []);
		const u = z();
		i.consumers.add(u),
			m(i.active.get) ||
				A(() => {
					i.active.set(!0), B(e);
				}),
			ce(() =>
				setTimeout(() => {
					i.consumers.delete(u),
						A(() => {
							!l &&
								!i.consumers.size &&
								(i.active.set(!1), o ? B(e) : Ne(e, t));
						}),
						"elements" in i &&
							i.elements.set((s) =>
								s.filter((v) => v.isConnected),
							);
				}),
			);
	});
}
function Le(e) {
	const t = _(() => ae(e.of, e.name));
	return (
		de(S({ getStore: t }, e)),
		_(() =>
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
						t().elements.set((r) => [...r, n]),
							O(() => {
								if (
									n.type !== "radio" &&
									t().startValue.get() === void 0 &&
									m(t().value.get) === void 0
								) {
									const r = Q(n, t(), e.type);
									t().startValue.set(() => r),
										t().value.set(() => r);
								}
							});
					},
					onInput(n) {
						$(
							e.of,
							t(),
							e.name,
							n,
							["touched", "input"],
							Q(n.currentTarget, t(), e.type),
						);
					},
					onChange(n) {
						$(e.of, t(), e.name, n, ["change"]);
					},
					onBlur(n) {
						$(e.of, t(), e.name, n, ["touched", "blur"]);
					},
				},
			),
		)
	);
}
function Pe(e) {
	const t = _(() => Te(e.of, e.name));
	return (
		de(S({ getStore: t }, e)),
		_(() =>
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
class X extends Error {
	name = "FormError";
	errors;
	constructor(t, n) {
		super(typeof t == "string" ? t : ""),
			(this.errors = typeof t == "string" ? n || {} : t);
	}
}
var Ve = L("<form novalidate>");
function Me(e) {
	const [, t, n] = fe(
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
		var r = ge(Ve),
			a = e.of.internal.element.set;
		return (
			typeof a == "function" ? ee(a, r) : (e.of.internal.element.set = r),
			j(
				r,
				S(n, {
					onSubmit: async (l) => {
						l.preventDefault();
						const { of: o, onSubmit: i, responseDuration: u } = e;
						A(() => {
							t.keepResponse || o.internal.response.set({}),
								o.internal.submitCount.set((s) => s + 1),
								o.internal.submitted.set(!0),
								o.internal.submitting.set(!0);
						});
						try {
							(await R(o, t)) && (await i(ue(o, t), l));
						} catch (s) {
							A(() => {
								s instanceof X &&
									Object.entries(s.errors).forEach(
										([v, d]) => {
											d &&
												le(o, v, d, {
													...t,
													shouldFocus: !1,
												});
										},
									),
									(!(s instanceof X) || s.message) &&
										ke(
											o,
											{
												status: "error",
												message:
													s?.message ||
													"An unknown error has occurred.",
											},
											{ duration: u },
										);
							});
						} finally {
							o.internal.submitting.set(!1);
						}
					},
				}),
				!1,
			),
			ye(),
			r
		);
	})();
}
function Re(e) {
	return (t) => ((!t && t !== 0) || (Array.isArray(t) && !t.length) ? e : "");
}
var xe = L("<div><p>Edit your <!> here:</p><br>"),
	ze = L(
		"<div class=w-full><div class=Editor><code class=Monaco></code><input>",
	),
	He = L("<div class=Error><span>&nbsp;&nbsp;&nbsp;"),
	$e = L("<input type=hidden>"),
	Ge = ({ Type: e } = { Type: "HTML" }) => {
		const [t, { Form: n, Field: r }] = be(),
			a = crypto.randomUUID();
		O(
			H(
				E.Editors[0],
				(u) => {
					Oe(t, "Content", u.get(a)?.Content ?? "", {
						shouldFocus: !1,
						shouldTouched: !1,
					}),
						R(t);
				},
				{ defer: !1 },
			),
		);
		const l = Z(je(e));
		O(
			H(K.Messages[0], (u) => u?.get("Type") && l[1](u?.get("Type")), {
				defer: !1,
			}),
		);
		let o, i;
		return (
			E.Editors[0]().set(a, {
				Type: e,
				Hidden: E.Editors[0]().size > 0,
				Content: l[0](),
			}),
			he(() => {
				o instanceof HTMLElement &&
					((i = G.create(o, {
						value: l[0](),
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
						theme: window.matchMedia("(prefers-color-scheme: dark)")
							.matches
							? "Dark"
							: "Light",
						wrappingStrategy: "advanced",
						word: "on",
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
					i.getModel()?.setEOL(G.EndOfLineSequence.LF),
					i.onKeyDown((u) => {
						u.ctrlKey &&
							u.code === "KeyS" &&
							(u.preventDefault(), R(t), t.element?.submit());
					}),
					i.getModel()?.onDidChangeContent(() => {
						E.Editors[1](
							Y(
								E.Editors[0](),
								new Map([
									[
										a,
										{
											Content:
												i.getModel()?.getValue() ?? "",
											Hidden:
												E.Editors[0]()?.get(a)
													?.Hidden ?? !0,
											Type: e,
										},
									],
								]),
							),
						);
					}),
					i.onDidChangeModelLanguageConfiguration(() =>
						i.getAction("editor.action.formatDocument")?.run(),
					),
					i.onDidLayoutChange(() =>
						i.getAction("editor.action.formatDocument")?.run(),
					),
					window.addEventListener("load", () =>
						i.getAction("editor.action.formatDocument")?.run(),
					),
					setTimeout(
						() =>
							i.getAction("editor.action.formatDocument")?.run(),
						1e3,
					),
					O(H(l[0], (u) => i.getModel()?.setValue(u), { defer: !1 })),
					K.Socket[0]()?.send(
						JSON.stringify({
							Key: x.Items[0]()?.get("Key")?.[0](),
							Identifier: x.Items[0]()?.get("Identifier")?.[0](),
							From: "Content",
							View: e,
						}),
					));
			}),
			(() => {
				var u = xe(),
					s = u.firstChild,
					v = s.firstChild,
					d = v.nextSibling;
				return (
					d.nextSibling,
					s.nextSibling,
					V(
						s,
						k(me, {
							get each() {
								return Array.from(E.Editors[0]().entries());
							},
							children: (c, g) => [
								k(We, {
									Action: () => {
										E.Editors[0]().forEach((y, p) => {
											(y.Hidden = c[0] !== p),
												E.Editors[1](
													Y(
														E.Editors[0](),
														new Map([[p, y]]),
													),
												);
										}),
											setTimeout(() => {
												i.setScrollPosition({
													scrollTop: -50,
												});
											}, 1e3);
									},
									get children() {
										return c[1].Type;
									},
								}),
								_(() =>
									g() === E.Editors[0]().size - 1
										? ""
										: " / ",
								),
							],
						}),
						d,
					),
					V(
						u,
						k(n, {
							method: "post",
							onSubmit: Be,
							get children() {
								return [
									k(r, {
										name: "Content",
										get validate() {
											return [
												Re(`Please enter some ${e}.`),
											];
										},
										children: (c, g) =>
											(() => {
												var y = ze(),
													p = y.firstChild,
													T = p.firstChild,
													D = T.nextSibling,
													I = o;
												return (
													typeof I == "function"
														? ee(I, T)
														: (o = T),
													V(
														p,
														(() => {
															var P = _(
																() => !!c.error,
															);
															return () =>
																P() &&
																(() => {
																	var b =
																			He(),
																		h =
																			b.firstChild;
																	return (
																		h.firstChild,
																		(b.$$click =
																			() => {
																				Ie(
																					t,
																					"Content",
																				),
																					i.focus();
																			}),
																		V(
																			h,
																			() =>
																				c.error,
																			null,
																		),
																		b
																	);
																})();
														})(),
														D,
													),
													j(
														D,
														S(g, {
															get value() {
																return (
																	E.Editors[0]()?.get(
																		a,
																	)
																		?.Content ??
																	""
																);
															},
															type: "hidden",
															required: !0,
														}),
														!1,
													),
													y
												);
											})(),
									}),
									k(r, {
										name: "Field",
										children: (c, g) =>
											(() => {
												var y = $e();
												return (
													j(
														y,
														S(g, { value: e }),
														!1,
													),
													y
												);
											})(),
									}),
								];
							},
						}),
						null,
					),
					ve(() =>
						pe(
							u,
							!E.Editors[0]()?.get(a)?.Hidden &&
								Ke.Data[0]()?.get("Name")
								? ""
								: "hidden",
						),
					),
					u
				);
			})()
		);
	};
const je = (e) => {
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
	Be = ({ Content: e, Field: t }, n) => {
		n &&
			(n.preventDefault(),
			K.Socket[0]()?.send(
				JSON.stringify({
					Key: x.Items[0]()?.get("Key")?.[0](),
					Identifier: x.Items[0]()?.get("Identifier")?.[0](),
					To: t,
					Input: e,
				}),
			));
	},
	{ default: E } = await C(
		async () => {
			const { default: e } = await import("./Context.Bu5wWiIs.js");
			return { default: e };
		},
		__vite__mapDeps([0, 1, 2]),
	),
	{ default: K } = await C(
		async () => {
			const { default: e } = await import("./Context.B6zNNifW.js");
			return { default: e };
		},
		__vite__mapDeps([3, 1, 2]),
	),
	{ default: Ke } = await C(
		async () => {
			const { default: e } = await import("./Context.C6gjzhxr.js");
			return { default: e };
		},
		__vite__mapDeps([4, 1, 2]),
	),
	{ default: x } = await C(
		async () => {
			const { default: e } = await import("./Context.B-xm8u_0.js");
			return { default: e };
		},
		__vite__mapDeps([5, 1, 2]),
	),
	{ default: We } = await C(
		async () => {
			const { default: e } = await import("./Anchor.QMxO_YPj.js");
			return { default: e };
		},
		__vite__mapDeps([6, 2, 7, 1]),
	),
	{ default: Qe } = await C(
		async () => {
			const { default: e } = await import("./Button.jcqywE9T.js");
			return { default: e };
		},
		__vite__mapDeps([8, 1, 2]),
	),
	{ default: Xe, Fn: Ye } = await C(
		async () => {
			const { default: e, Fn: t } = await import("./Copy.BvPFWC4d.js");
			return { default: e, Fn: t };
		},
		__vite__mapDeps([9, 1, 2, 10]),
	),
	{ default: Y } = await C(
		async () => {
			const { default: e } = await import("./Merge.CzTQzxlv.js");
			return { default: e };
		},
		__vite__mapDeps([7, 1, 2]),
	);
Ee(["click"]);
export {
	E as Action,
	We as Anchor,
	Qe as Button,
	K as Connection,
	Ye as Copy,
	Y as Merge,
	je as Return,
	Ke as Session,
	x as Store,
	Xe as Tip,
	Be as Update,
	Ge as default,
};
//# sourceMappingURL=Editor.CLXl1Ni-.js.map
