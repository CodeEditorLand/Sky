const u = {
	context: void 0,
	registry: void 0,
	effects: void 0,
	done: !1,
	getContextId() {
		return he(this.context.count);
	},
	getNextContextId() {
		return he(this.context.count++);
	},
};
function he(e) {
	const t = String(e),
		n = t.length - 1;
	return u.context.id + (n ? String.fromCharCode(96 + n) : "") + t;
}
function S(e) {
	u.context = e;
}
function De() {
	return { ...u.context, id: u.getNextContextId(), count: 0 };
}
const xe = (e, t) => e === t,
	U = Symbol("solid-proxy"),
	Y = { equals: xe };
let Ae = je;
const P = 1,
	K = 2,
	Ce = { owned: null, cleanups: null, context: null, owner: null },
	te = {};
var h = null;
let H = null,
	Fe = null,
	g = null,
	x = null,
	E = null,
	X = 0;
function ue(e, t) {
	const n = g,
		s = h,
		i = e.length === 0,
		r = t === void 0 ? s : t,
		l = i
			? Ce
			: {
					owned: null,
					cleanups: null,
					context: r ? r.context : null,
					owner: r,
				},
		o = i ? e : () => e(() => C(() => J(l)));
	(h = l), (g = null);
	try {
		return j(o, !0);
	} finally {
		(g = n), (h = s);
	}
}
function $(e, t) {
	t = t ? Object.assign({}, Y, t) : Y;
	const n = {
			value: e,
			observers: null,
			observerSlots: null,
			comparator: t.equals || void 0,
		},
		s = (i) => (typeof i == "function" && (i = i(n.value)), Te(n, i));
	return [$e.bind(n), s];
}
function se(e, t, n) {
	const s = Q(e, t, !0, P);
	D(s);
}
function T(e, t, n) {
	const s = Q(e, t, !1, P);
	D(s);
}
function Se(e, t, n) {
	Ae = Xe;
	const s = Q(e, t, !1, P),
		i = M && W(M);
	i && (s.suspense = i), (s.user = !0), E ? E.push(s) : D(s);
}
function O(e, t, n) {
	n = n ? Object.assign({}, Y, n) : Y;
	const s = Q(e, t, !0, 0);
	return (
		(s.observers = null),
		(s.observerSlots = null),
		(s.comparator = n.equals || void 0),
		D(s),
		$e.bind(s)
	);
}
function Ue(e) {
	return e && typeof e == "object" && "then" in e;
}
function Ee(e, t, n) {
	let s, i, r;
	(arguments.length === 2 && typeof t == "object") || arguments.length === 1
		? ((s = !0), (i = e), (r = {}))
		: ((s = e), (i = t), (r = {}));
	let l = null,
		o = te,
		f = null,
		d = !1,
		c = !1,
		a = "initialValue" in r,
		y = typeof s == "function" && O(s);
	const w = new Set(),
		[A, N] = (r.storage || $)(r.initialValue),
		[k, v] = $(void 0),
		[F, Z] = $(void 0, { equals: !1 }),
		[ae, de] = $(a ? "ready" : "unresolved");
	u.context &&
		((f = u.getNextContextId()),
		r.ssrLoadFrom === "initial"
			? (o = r.initialValue)
			: u.load && u.has(f) && (o = u.load(f)));
	function L(b, p, m, I) {
		return (
			l === b &&
				((l = null),
				I !== void 0 && (a = !0),
				(b === o || p === o) &&
					r.onHydrated &&
					queueMicrotask(() => r.onHydrated(I, { value: p })),
				(o = te),
				Me(p, m)),
			p
		);
	}
	function Me(b, p) {
		j(() => {
			p === void 0 && N(() => b),
				de(p !== void 0 ? "errored" : a ? "ready" : "unresolved"),
				v(p);
			for (const m of w.keys()) m.decrement();
			w.clear();
		}, !1);
	}
	function z() {
		const b = M && W(M),
			p = A(),
			m = k();
		if (m !== void 0 && !l) throw m;
		return (
			g &&
				!g.user &&
				b &&
				se(() => {
					F(),
						l &&
							(b.resolved && H && d
								? H.promises.add(l)
								: w.has(b) || (b.increment(), w.add(b)));
				}),
			p
		);
	}
	function ee(b = !0) {
		if (b !== !1 && c) return;
		c = !1;
		const p = y ? y() : s;
		if (((d = H), p == null || p === !1)) {
			L(l, C(A));
			return;
		}
		const m = o !== te ? o : C(() => i(p, { value: A(), refetching: b }));
		return Ue(m)
			? ((l = m),
				"value" in m
					? (m.status === "success"
							? L(l, m.value, void 0, p)
							: L(l, void 0, ie(m.value), p),
						m)
					: ((c = !0),
						queueMicrotask(() => (c = !1)),
						j(() => {
							de(a ? "refreshing" : "pending"), Z();
						}, !1),
						m.then(
							(I) => L(m, I, void 0, p),
							(I) => L(m, void 0, ie(I), p),
						)))
			: (L(l, m, void 0, p), m);
	}
	return (
		Object.defineProperties(z, {
			state: { get: () => ae() },
			error: { get: () => k() },
			loading: {
				get() {
					const b = ae();
					return b === "pending" || b === "refreshing";
				},
			},
			latest: {
				get() {
					if (!a) return z();
					const b = k();
					if (b && !l) throw b;
					return A();
				},
			},
		}),
		y ? se(() => ee(!1)) : ee(!1),
		[z, { refetch: ee, mutate: N }]
	);
}
function Ve(e) {
	return j(e, !1);
}
function C(e) {
	if (g === null) return e();
	const t = g;
	g = null;
	try {
		return e();
	} finally {
		g = t;
	}
}
function qe(e, t, n) {
	const s = Array.isArray(e);
	let i,
		r = n && n.defer;
	return (l) => {
		let o;
		if (s) {
			o = Array(e.length);
			for (let d = 0; d < e.length; d++) o[d] = e[d]();
		} else o = e();
		if (r) return (r = !1), l;
		const f = C(() => t(o, i, l));
		return (i = o), f;
	};
}
function Be(e) {
	Se(() => C(e));
}
function Ne(e) {
	return (
		h === null ||
			(h.cleanups === null ? (h.cleanups = [e]) : h.cleanups.push(e)),
		e
	);
}
function Oe() {
	return h;
}
function Ye(e) {
	E.push.apply(E, e), (e.length = 0);
}
function ce(e, t) {
	const n = Symbol("context");
	return { id: n, Provider: We(n), defaultValue: e };
}
function W(e) {
	let t;
	return h && h.context && (t = h.context[e.id]) !== void 0
		? t
		: e.defaultValue;
}
function Pe(e) {
	const t = O(e),
		n = O(() => re(t()));
	return (
		(n.toArray = () => {
			const s = n();
			return Array.isArray(s) ? s : s != null ? [s] : [];
		}),
		n
	);
}
let M;
function Ke() {
	return M || (M = ce());
}
function $e() {
	if (this.sources && this.state)
		if (this.state === P) D(this);
		else {
			const e = x;
			(x = null), j(() => G(this), !1), (x = e);
		}
	if (g) {
		const e = this.observers ? this.observers.length : 0;
		g.sources
			? (g.sources.push(this), g.sourceSlots.push(e))
			: ((g.sources = [this]), (g.sourceSlots = [e])),
			this.observers
				? (this.observers.push(g),
					this.observerSlots.push(g.sources.length - 1))
				: ((this.observers = [g]),
					(this.observerSlots = [g.sources.length - 1]));
	}
	return this.value;
}
function Te(e, t, n) {
	let s = e.value;
	return (
		(!e.comparator || !e.comparator(s, t)) &&
			((e.value = t),
			e.observers &&
				e.observers.length &&
				j(() => {
					for (let i = 0; i < e.observers.length; i += 1) {
						const r = e.observers[i],
							l = H && H.running;
						l && H.disposed.has(r),
							(l ? !r.tState : !r.state) &&
								(r.pure ? x.push(r) : E.push(r),
								r.observers && ke(r)),
							l || (r.state = P);
					}
					if (x.length > 1e6) throw ((x = []), new Error());
				}, !1)),
		t
	);
}
function D(e) {
	if (!e.fn) return;
	J(e);
	const t = X;
	Re(e, e.value, t);
}
function Re(e, t, n) {
	let s;
	const i = h,
		r = g;
	g = h = e;
	try {
		s = e.fn(t);
	} catch (l) {
		return (
			e.pure &&
				((e.state = P),
				e.owned && e.owned.forEach(J),
				(e.owned = null)),
			(e.updatedAt = n + 1),
			ve(l)
		);
	} finally {
		(g = r), (h = i);
	}
	(!e.updatedAt || e.updatedAt <= n) &&
		(e.updatedAt != null && "observers" in e ? Te(e, s) : (e.value = s),
		(e.updatedAt = n));
}
function Q(e, t, n, s = P, i) {
	const r = {
		fn: e,
		state: s,
		updatedAt: null,
		owned: null,
		sources: null,
		sourceSlots: null,
		cleanups: null,
		value: t,
		owner: h,
		context: h ? h.context : null,
		pure: n,
	};
	return (
		h === null ||
			(h !== Ce && (h.owned ? h.owned.push(r) : (h.owned = [r]))),
		r
	);
}
function R(e) {
	if (e.state === 0) return;
	if (e.state === K) return G(e);
	if (e.suspense && C(e.suspense.inFallback))
		return e.suspense.effects.push(e);
	const t = [e];
	for (; (e = e.owner) && (!e.updatedAt || e.updatedAt < X); )
		e.state && t.push(e);
	for (let n = t.length - 1; n >= 0; n--)
		if (((e = t[n]), e.state === P)) D(e);
		else if (e.state === K) {
			const s = x;
			(x = null), j(() => G(e, t[0]), !1), (x = s);
		}
}
function j(e, t) {
	if (x) return e();
	let n = !1;
	t || (x = []), E ? (n = !0) : (E = []), X++;
	try {
		const s = e();
		return Ge(n), s;
	} catch (s) {
		n || (E = null), (x = null), ve(s);
	}
}
function Ge(e) {
	if ((x && (je(x), (x = null)), e)) return;
	const t = E;
	(E = null), t.length && j(() => Ae(t), !1);
}
function je(e) {
	for (let t = 0; t < e.length; t++) R(e[t]);
}
function Xe(e) {
	let t,
		n = 0;
	for (t = 0; t < e.length; t++) {
		const s = e[t];
		s.user ? (e[n++] = s) : R(s);
	}
	if (u.context) {
		if (u.count) {
			u.effects || (u.effects = []), u.effects.push(...e.slice(0, n));
			return;
		}
		S();
	}
	for (
		u.effects &&
			(u.done || !u.count) &&
			((e = [...u.effects, ...e]),
			(n += u.effects.length),
			delete u.effects),
			t = 0;
		t < n;
		t++
	)
		R(e[t]);
}
function G(e, t) {
	e.state = 0;
	for (let n = 0; n < e.sources.length; n += 1) {
		const s = e.sources[n];
		if (s.sources) {
			const i = s.state;
			i === P
				? s !== t && (!s.updatedAt || s.updatedAt < X) && R(s)
				: i === K && G(s, t);
		}
	}
}
function ke(e) {
	for (let t = 0; t < e.observers.length; t += 1) {
		const n = e.observers[t];
		n.state ||
			((n.state = K),
			n.pure ? x.push(n) : E.push(n),
			n.observers && ke(n));
	}
}
function J(e) {
	let t;
	if (e.sources)
		for (; e.sources.length; ) {
			const n = e.sources.pop(),
				s = e.sourceSlots.pop(),
				i = n.observers;
			if (i && i.length) {
				const r = i.pop(),
					l = n.observerSlots.pop();
				s < i.length &&
					((r.sourceSlots[l] = s),
					(i[s] = r),
					(n.observerSlots[s] = l));
			}
		}
	if (e.owned) {
		for (t = e.owned.length - 1; t >= 0; t--) J(e.owned[t]);
		e.owned = null;
	}
	if (e.cleanups) {
		for (t = e.cleanups.length - 1; t >= 0; t--) e.cleanups[t]();
		e.cleanups = null;
	}
	e.state = 0;
}
function ie(e) {
	return e instanceof Error
		? e
		: new Error(typeof e == "string" ? e : "Unknown error", { cause: e });
}
function ve(e, t = h) {
	throw ie(e);
}
function re(e) {
	if (typeof e == "function" && !e.length) return re(e());
	if (Array.isArray(e)) {
		const t = [];
		for (let n = 0; n < e.length; n++) {
			const s = re(e[n]);
			Array.isArray(s) ? t.push.apply(t, s) : t.push(s);
		}
		return t;
	}
	return e;
}
function We(e, t) {
	return function (s) {
		let i;
		return (
			T(
				() =>
					(i = C(
						() => (
							(h.context = { ...h.context, [e]: s.value }),
							Pe(() => s.children)
						),
					)),
				void 0,
			),
			i
		);
	};
}
let Le = !1;
function Ie() {
	Le = !0;
}
function _e(e, t) {
	if (Le && u.context) {
		const n = u.context;
		S(De());
		const s = C(() => e(t || {}));
		return S(n), s;
	}
	return C(() => e(t || {}));
}
function B() {
	return !0;
}
const oe = {
	get(e, t, n) {
		return t === U ? n : e.get(t);
	},
	has(e, t) {
		return t === U ? !0 : e.has(t);
	},
	set: B,
	deleteProperty: B,
	getOwnPropertyDescriptor(e, t) {
		return {
			configurable: !0,
			enumerable: !0,
			get() {
				return e.get(t);
			},
			set: B,
			deleteProperty: B,
		};
	},
	ownKeys(e) {
		return e.keys();
	},
};
function ne(e) {
	return (e = typeof e == "function" ? e() : e) ? e : {};
}
function Qe() {
	for (let e = 0, t = this.length; e < t; ++e) {
		const n = this[e]();
		if (n !== void 0) return n;
	}
}
function Je(...e) {
	let t = !1;
	for (let l = 0; l < e.length; l++) {
		const o = e[l];
		(t = t || (!!o && U in o)),
			(e[l] = typeof o == "function" ? ((t = !0), O(o)) : o);
	}
	if (t)
		return new Proxy(
			{
				get(l) {
					for (let o = e.length - 1; o >= 0; o--) {
						const f = ne(e[o])[l];
						if (f !== void 0) return f;
					}
				},
				has(l) {
					for (let o = e.length - 1; o >= 0; o--)
						if (l in ne(e[o])) return !0;
					return !1;
				},
				keys() {
					const l = [];
					for (let o = 0; o < e.length; o++)
						l.push(...Object.keys(ne(e[o])));
					return [...new Set(l)];
				},
			},
			oe,
		);
	const n = {},
		s = Object.create(null);
	for (let l = e.length - 1; l >= 0; l--) {
		const o = e[l];
		if (!o) continue;
		const f = Object.getOwnPropertyNames(o);
		for (let d = f.length - 1; d >= 0; d--) {
			const c = f[d];
			if (c === "__proto__" || c === "constructor") continue;
			const a = Object.getOwnPropertyDescriptor(o, c);
			if (!s[c])
				s[c] = a.get
					? {
							enumerable: !0,
							configurable: !0,
							get: Qe.bind((n[c] = [a.get.bind(o)])),
						}
					: a.value !== void 0
						? a
						: void 0;
			else {
				const y = n[c];
				y &&
					(a.get
						? y.push(a.get.bind(o))
						: a.value !== void 0 && y.push(() => a.value));
			}
		}
	}
	const i = {},
		r = Object.keys(s);
	for (let l = r.length - 1; l >= 0; l--) {
		const o = r[l],
			f = s[o];
		f && f.get
			? Object.defineProperty(i, o, f)
			: (i[o] = f ? f.value : void 0);
	}
	return i;
}
function Ze(e, ...t) {
	if (U in e) {
		const i = new Set(t.length > 1 ? t.flat() : t[0]),
			r = t.map(
				(l) =>
					new Proxy(
						{
							get(o) {
								return l.includes(o) ? e[o] : void 0;
							},
							has(o) {
								return l.includes(o) && o in e;
							},
							keys() {
								return l.filter((o) => o in e);
							},
						},
						oe,
					),
			);
		return (
			r.push(
				new Proxy(
					{
						get(l) {
							return i.has(l) ? void 0 : e[l];
						},
						has(l) {
							return i.has(l) ? !1 : l in e;
						},
						keys() {
							return Object.keys(e).filter((l) => !i.has(l));
						},
					},
					oe,
				),
			),
			r
		);
	}
	const n = {},
		s = t.map(() => ({}));
	for (const i of Object.getOwnPropertyNames(e)) {
		const r = Object.getOwnPropertyDescriptor(e, i),
			l =
				!r.get &&
				!r.set &&
				r.enumerable &&
				r.writable &&
				r.configurable;
		let o = !1,
			f = 0;
		for (const d of t)
			d.includes(i) &&
				((o = !0),
				l ? (s[f][i] = r.value) : Object.defineProperty(s[f], i, r)),
				++f;
		o || (l ? (n[i] = r.value) : Object.defineProperty(n, i, r));
	}
	return [...s, n];
}
function ze(e) {
	let t, n;
	const s = (i) => {
		const r = u.context;
		if (r) {
			const [o, f] = $();
			u.count || (u.count = 0),
				u.count++,
				(n || (n = e())).then((d) => {
					!u.done && S(r), u.count--, f(() => d.default), S();
				}),
				(t = o);
		} else if (!t) {
			const [o] = Ee(() => (n || (n = e())).then((f) => f.default));
			t = o;
		}
		let l;
		return O(() =>
			(l = t())
				? C(() => {
						if (!r || u.done) return l(i);
						const o = u.context;
						S(r);
						const f = l(i);
						return S(o), f;
					})
				: "",
		);
	};
	return (
		(s.preload = () =>
			n || ((n = e()).then((i) => (t = () => i.default)), n)),
		s
	);
}
const et = ce();
function tt(e) {
	let t = 0,
		n,
		s,
		i,
		r,
		l;
	const [o, f] = $(!1),
		d = Ke(),
		c = {
			increment: () => {
				++t === 1 && f(!0);
			},
			decrement: () => {
				--t === 0 && f(!1);
			},
			inFallback: o,
			effects: [],
			resolved: !1,
		},
		a = Oe();
	if (u.context && u.load) {
		const A = u.getContextId();
		let N = u.load(A);
		if (
			(N &&
				(typeof N != "object" || N.status !== "success"
					? (i = N)
					: u.gather(A)),
			i && i !== "$$f")
		) {
			const [k, v] = $(void 0, { equals: !1 });
			(r = k),
				i.then(
					() => {
						if (u.done) return v();
						u.gather(A), S(s), v(), S();
					},
					(F) => {
						(l = F), v();
					},
				);
		}
	}
	const y = W(et);
	y && (n = y.register(c.inFallback));
	let w;
	return (
		Ne(() => w && w()),
		_e(d.Provider, {
			value: c,
			get children() {
				return O(() => {
					if (l) throw l;
					if (((s = u.context), r)) return r(), (r = void 0);
					s && i === "$$f" && S();
					const A = O(() => e.children);
					return O((N) => {
						const k = c.inFallback(),
							{ showContent: v = !0, showFallback: F = !0 } = n
								? n()
								: {};
						if ((!k || (i && i !== "$$f")) && v)
							return (
								(c.resolved = !0),
								w && w(),
								(w = s = i = void 0),
								Ye(c.effects),
								A()
							);
						if (F)
							return w
								? N
								: ue(
										(Z) => (
											(w = Z),
											s &&
												(S({
													id: s.id + "F",
													count: 0,
												}),
												(s = void 0)),
											e.fallback
										),
										a,
									);
					});
				});
			},
		})
	);
}
const At = Object.freeze(
		Object.defineProperty(
			{
				__proto__: null,
				$PROXY: U,
				Suspense: tt,
				batch: Ve,
				children: Pe,
				createComponent: _e,
				createComputed: se,
				createContext: ce,
				createEffect: Se,
				createMemo: O,
				createRenderEffect: T,
				createResource: Ee,
				createRoot: ue,
				createSignal: $,
				enableHydration: Ie,
				equalFn: xe,
				getOwner: Oe,
				lazy: ze,
				mergeProps: Je,
				on: qe,
				onCleanup: Ne,
				onMount: Be,
				sharedConfig: u,
				splitProps: Ze,
				untrack: C,
				useContext: W,
			},
			Symbol.toStringTag,
			{ value: "Module" },
		),
	),
	nt = [
		"allowfullscreen",
		"async",
		"autofocus",
		"autoplay",
		"checked",
		"controls",
		"default",
		"disabled",
		"formnovalidate",
		"hidden",
		"indeterminate",
		"inert",
		"ismap",
		"loop",
		"multiple",
		"muted",
		"nomodule",
		"novalidate",
		"open",
		"playsinline",
		"readonly",
		"required",
		"reversed",
		"seamless",
		"selected",
	],
	st = new Set([
		"className",
		"value",
		"readOnly",
		"formNoValidate",
		"isMap",
		"noModule",
		"playsInline",
		...nt,
	]),
	it = new Set(["innerHTML", "textContent", "innerText", "children"]),
	rt = Object.assign(Object.create(null), {
		className: "class",
		htmlFor: "for",
	}),
	ot = Object.assign(Object.create(null), {
		class: "className",
		formnovalidate: { $: "formNoValidate", BUTTON: 1, INPUT: 1 },
		ismap: { $: "isMap", IMG: 1 },
		nomodule: { $: "noModule", SCRIPT: 1 },
		playsinline: { $: "playsInline", VIDEO: 1 },
		readonly: { $: "readOnly", INPUT: 1, TEXTAREA: 1 },
	});
function lt(e, t) {
	const n = ot[e];
	return typeof n == "object" ? (n[t] ? n.$ : void 0) : n;
}
const ft = new Set([
	"beforeinput",
	"click",
	"dblclick",
	"contextmenu",
	"focusin",
	"focusout",
	"input",
	"keydown",
	"keyup",
	"mousedown",
	"mousemove",
	"mouseout",
	"mouseover",
	"mouseup",
	"pointerdown",
	"pointermove",
	"pointerout",
	"pointerover",
	"pointerup",
	"touchend",
	"touchmove",
	"touchstart",
]);
function ut(e, t, n) {
	let s = n.length,
		i = t.length,
		r = s,
		l = 0,
		o = 0,
		f = t[i - 1].nextSibling,
		d = null;
	for (; l < i || o < r; ) {
		if (t[l] === n[o]) {
			l++, o++;
			continue;
		}
		for (; t[i - 1] === n[r - 1]; ) i--, r--;
		if (i === l) {
			const c = r < s ? (o ? n[o - 1].nextSibling : n[r - o]) : f;
			for (; o < r; ) e.insertBefore(n[o++], c);
		} else if (r === o)
			for (; l < i; ) (!d || !d.has(t[l])) && t[l].remove(), l++;
		else if (t[l] === n[r - 1] && n[o] === t[i - 1]) {
			const c = t[--i].nextSibling;
			e.insertBefore(n[o++], t[l++].nextSibling),
				e.insertBefore(n[--r], c),
				(t[i] = n[r]);
		} else {
			if (!d) {
				d = new Map();
				let a = o;
				for (; a < r; ) d.set(n[a], a++);
			}
			const c = d.get(t[l]);
			if (c != null)
				if (o < c && c < r) {
					let a = l,
						y = 1,
						w;
					for (
						;
						++a < i &&
						a < r &&
						!((w = d.get(t[a])) == null || w !== c + y);
					)
						y++;
					if (y > c - o) {
						const A = t[l];
						for (; o < c; ) e.insertBefore(n[o++], A);
					} else e.replaceChild(n[o++], t[l++]);
				} else l++;
			else t[l++].remove();
		}
	}
}
const ge = "_$DX_DELEGATE";
function ye(e, t, n, s = {}) {
	let i;
	return (
		ue((r) => {
			(i = r),
				t === document
					? e()
					: bt(t, e(), t.firstChild ? null : void 0, n);
		}, s.owner),
		() => {
			i(), (t.textContent = "");
		}
	);
}
function Ct(e, t, n) {
	let s;
	const i = () => {
			const l = document.createElement("template");
			return (l.innerHTML = e), l.content.firstChild;
		},
		r = () => (s || (s = i())).cloneNode(!0);
	return (r.cloneNode = r), r;
}
function ct(e, t = window.document) {
	const n = t[ge] || (t[ge] = new Set());
	for (let s = 0, i = e.length; s < i; s++) {
		const r = e[s];
		n.has(r) || (n.add(r), t.addEventListener(r, He));
	}
}
function le(e, t, n) {
	q(e) || (n == null ? e.removeAttribute(t) : e.setAttribute(t, n));
}
function at(e, t) {
	q(e) || (t == null ? e.removeAttribute("class") : (e.className = t));
}
function dt(e, t, n, s) {
	if (s)
		Array.isArray(n)
			? ((e[`$$${t}`] = n[0]), (e[`$$${t}Data`] = n[1]))
			: (e[`$$${t}`] = n);
	else if (Array.isArray(n)) {
		const i = n[0];
		e.addEventListener(t, (n[0] = (r) => i.call(e, n[1], r)));
	} else e.addEventListener(t, n);
}
function ht(e, t, n = {}) {
	const s = Object.keys(t || {}),
		i = Object.keys(n);
	let r, l;
	for (r = 0, l = i.length; r < l; r++) {
		const o = i[r];
		!o || o === "undefined" || t[o] || (be(e, o, !1), delete n[o]);
	}
	for (r = 0, l = s.length; r < l; r++) {
		const o = s[r],
			f = !!t[o];
		!o ||
			o === "undefined" ||
			n[o] === f ||
			!f ||
			(be(e, o, !0), (n[o] = f));
	}
	return n;
}
function gt(e, t, n) {
	if (!t) return n ? le(e, "style") : t;
	const s = e.style;
	if (typeof t == "string") return (s.cssText = t);
	typeof n == "string" && (s.cssText = n = void 0),
		n || (n = {}),
		t || (t = {});
	let i, r;
	for (r in n) t[r] == null && s.removeProperty(r), delete n[r];
	for (r in t) (i = t[r]), i !== n[r] && (s.setProperty(r, i), (n[r] = i));
	return n;
}
function St(e, t = {}, n, s) {
	const i = {};
	return (
		T(() => (i.children = V(e, t.children, i.children))),
		T(() => typeof t.ref == "function" && yt(t.ref, e)),
		T(() => pt(e, t, n, !0, i, !0)),
		i
	);
}
function yt(e, t, n) {
	return C(() => e(t, n));
}
function bt(e, t, n, s) {
	if ((n !== void 0 && !s && (s = []), typeof t != "function"))
		return V(e, t, s, n);
	T((i) => V(e, t(), i, n), s);
}
function pt(e, t, n, s, i = {}, r = !1) {
	t || (t = {});
	for (const l in i)
		if (!(l in t)) {
			if (l === "children") continue;
			i[l] = pe(e, l, null, i[l], n, r);
		}
	for (const l in t) {
		if (l === "children") continue;
		const o = t[l];
		i[l] = pe(e, l, o, i[l], n, r);
	}
}
function mt(e, t, n = {}) {
	if (globalThis._$HY.done) return ye(e, t, [...t.childNodes], n);
	(u.completed = globalThis._$HY.completed),
		(u.events = globalThis._$HY.events),
		(u.load = (s) => globalThis._$HY.r[s]),
		(u.has = (s) => s in globalThis._$HY.r),
		(u.gather = (s) => we(t, s)),
		(u.registry = new Map()),
		(u.context = { id: n.renderId || "", count: 0 });
	try {
		return we(t, n.renderId), ye(e, t, [...t.childNodes], n);
	} finally {
		u.context = null;
	}
}
function Et(e) {
	let t, n;
	return !q() || !(t = u.registry.get((n = xt())))
		? e()
		: (u.completed && u.completed.add(t), u.registry.delete(n), t);
}
function Nt() {
	u.events &&
		!u.events.queued &&
		(queueMicrotask(() => {
			const { completed: e, events: t } = u;
			for (t.queued = !1; t.length; ) {
				const [n, s] = t[0];
				if (!e.has(n)) return;
				t.shift(), He(s);
			}
			u.done &&
				((u.events = _$HY.events = null),
				(u.completed = _$HY.completed = null));
		}),
		(u.events.queued = !0));
}
function q(e) {
	return !!u.context && !u.done && (!e || e.isConnected);
}
function wt(e) {
	return e.toLowerCase().replace(/-([a-z])/g, (t, n) => n.toUpperCase());
}
function be(e, t, n) {
	const s = t.trim().split(/\s+/);
	for (let i = 0, r = s.length; i < r; i++) e.classList.toggle(s[i], n);
}
function pe(e, t, n, s, i, r) {
	let l, o, f, d, c;
	if (t === "style") return gt(e, n, s);
	if (t === "classList") return ht(e, n, s);
	if (n === s) return s;
	if (t === "ref") r || n(e);
	else if (t.slice(0, 3) === "on:") {
		const a = t.slice(3);
		s && e.removeEventListener(a, s), n && e.addEventListener(a, n);
	} else if (t.slice(0, 10) === "oncapture:") {
		const a = t.slice(10);
		s && e.removeEventListener(a, s, !0), n && e.addEventListener(a, n, !0);
	} else if (t.slice(0, 2) === "on") {
		const a = t.slice(2).toLowerCase(),
			y = ft.has(a);
		if (!y && s) {
			const w = Array.isArray(s) ? s[0] : s;
			e.removeEventListener(a, w);
		}
		(y || n) && (dt(e, a, n, y), y && ct([a]));
	} else if (t.slice(0, 5) === "attr:") le(e, t.slice(5), n);
	else if (
		(c = t.slice(0, 5) === "prop:") ||
		(f = it.has(t)) ||
		(d = lt(t, e.tagName)) ||
		(o = st.has(t)) ||
		(l = e.nodeName.includes("-"))
	) {
		if (c) (t = t.slice(5)), (o = !0);
		else if (q(e)) return n;
		t === "class" || t === "className"
			? at(e, n)
			: l && !o && !f
				? (e[wt(t)] = n)
				: (e[d || t] = n);
	} else le(e, rt[t] || t, n);
	return n;
}
function He(e) {
	if (u.registry && u.events && u.events.find(([s, i]) => i === e)) return;
	const t = `$$${e.type}`;
	let n = (e.composedPath && e.composedPath()[0]) || e.target;
	for (
		e.target !== n &&
			Object.defineProperty(e, "target", { configurable: !0, value: n }),
			Object.defineProperty(e, "currentTarget", {
				configurable: !0,
				get() {
					return n || document;
				},
			}),
			u.registry && !u.done && (u.done = _$HY.done = !0);
		n;
	) {
		const s = n[t];
		if (s && !n.disabled) {
			const i = n[`${t}Data`];
			if ((i !== void 0 ? s.call(n, i, e) : s.call(n, e), e.cancelBubble))
				return;
		}
		n = n._$host || n.parentNode || n.host;
	}
}
function V(e, t, n, s, i) {
	const r = q(e);
	if (r) {
		!n && (n = [...e.childNodes]);
		let f = [];
		for (let d = 0; d < n.length; d++) {
			const c = n[d];
			c.nodeType === 8 && c.data.slice(0, 2) === "!$"
				? c.remove()
				: f.push(c);
		}
		n = f;
	}
	for (; typeof n == "function"; ) n = n();
	if (t === n) return n;
	const l = typeof t,
		o = s !== void 0;
	if (
		((e = (o && n[0] && n[0].parentNode) || e),
		l === "string" || l === "number")
	) {
		if (r || (l === "number" && ((t = t.toString()), t === n))) return n;
		if (o) {
			let f = n[0];
			f && f.nodeType === 3
				? f.data !== t && (f.data = t)
				: (f = document.createTextNode(t)),
				(n = _(e, n, s, f));
		} else
			n !== "" && typeof n == "string"
				? (n = e.firstChild.data = t)
				: (n = e.textContent = t);
	} else if (t == null || l === "boolean") {
		if (r) return n;
		n = _(e, n, s);
	} else {
		if (l === "function")
			return (
				T(() => {
					let f = t();
					for (; typeof f == "function"; ) f = f();
					n = V(e, f, n, s);
				}),
				() => n
			);
		if (Array.isArray(t)) {
			const f = [],
				d = n && Array.isArray(n);
			if (fe(f, t, n, i))
				return T(() => (n = V(e, f, n, s, !0))), () => n;
			if (r) {
				if (!f.length) return n;
				if (s === void 0) return (n = [...e.childNodes]);
				let c = f[0];
				if (c.parentNode !== e) return n;
				const a = [c];
				for (; (c = c.nextSibling) !== s; ) a.push(c);
				return (n = a);
			}
			if (f.length === 0) {
				if (((n = _(e, n, s)), o)) return n;
			} else
				d
					? n.length === 0
						? me(e, f, s)
						: ut(e, n, f)
					: (n && _(e), me(e, f));
			n = f;
		} else if (t.nodeType) {
			if (r && t.parentNode) return (n = o ? [t] : t);
			if (Array.isArray(n)) {
				if (o) return (n = _(e, n, s, t));
				_(e, n, null, t);
			} else
				n == null || n === "" || !e.firstChild
					? e.appendChild(t)
					: e.replaceChild(t, e.firstChild);
			n = t;
		}
	}
	return n;
}
function fe(e, t, n, s) {
	let i = !1;
	for (let r = 0, l = t.length; r < l; r++) {
		let o = t[r],
			f = n && n[e.length],
			d;
		if (!(o == null || o === !0 || o === !1))
			if ((d = typeof o) == "object" && o.nodeType) e.push(o);
			else if (Array.isArray(o)) i = fe(e, o, f) || i;
			else if (d === "function")
				if (s) {
					for (; typeof o == "function"; ) o = o();
					i =
						fe(
							e,
							Array.isArray(o) ? o : [o],
							Array.isArray(f) ? f : [f],
						) || i;
				} else e.push(o), (i = !0);
			else {
				const c = String(o);
				f && f.nodeType === 3 && f.data === c
					? e.push(f)
					: e.push(document.createTextNode(c));
			}
	}
	return i;
}
function me(e, t, n = null) {
	for (let s = 0, i = t.length; s < i; s++) e.insertBefore(t[s], n);
}
function _(e, t, n, s) {
	if (n === void 0) return (e.textContent = "");
	const i = s || document.createTextNode("");
	if (t.length) {
		let r = !1;
		for (let l = t.length - 1; l >= 0; l--) {
			const o = t[l];
			if (i !== o) {
				const f = o.parentNode === e;
				!r && !l
					? f
						? e.replaceChild(i, o)
						: e.insertBefore(i, n)
					: f && o.remove();
			} else r = !0;
		}
	} else e.insertBefore(i, n);
	return [i];
}
function we(e, t) {
	const n = e.querySelectorAll("*[data-hk]");
	for (let s = 0; s < n.length; s++) {
		const i = n[s],
			r = i.getAttribute("data-hk");
		(!t || r.startsWith(t)) && !u.registry.has(r) && u.registry.set(r, i);
	}
}
function xt() {
	return u.getNextContextId();
}
const Ot = (...e) => (Ie(), mt(...e));
export {
	tt as S,
	$ as a,
	Ve as b,
	_e as c,
	Se as d,
	O as e,
	yt as f,
	Et as g,
	Ot as h,
	bt as i,
	St as j,
	Nt as k,
	ze as l,
	Je as m,
	Be as n,
	Ne as o,
	ct as p,
	qe as q,
	ye as r,
	Ze as s,
	Ct as t,
	C as u,
	At as v,
};
