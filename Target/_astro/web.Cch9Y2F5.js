const u = {
	context: void 0,
	registry: void 0,
	getContextId() {
		return de(this.context.count);
	},
	getNextContextId() {
		return de(this.context.count++);
	},
};
function de(e) {
	const t = String(e),
		n = t.length - 1;
	return u.context.id + (n ? String.fromCharCode(96 + n) : "") + t;
}
function S(e) {
	u.context = e;
}
function He() {
	return { ...u.context, id: u.getNextContextId(), count: 0 };
}
const me = (e, t) => e === t,
	U = Symbol("solid-proxy"),
	B = { equals: me };
let xe = $e;
const N = 1,
	K = 2,
	we = { owned: null, cleanups: null, context: null, owner: null },
	ee = {};
var h = null;
let H = null,
	Me = null,
	y = null,
	w = null,
	E = null,
	G = 0;
function fe(e, t) {
	const n = y,
		s = h,
		i = e.length === 0,
		r = t === void 0 ? s : t,
		l = i
			? we
			: {
					owned: null,
					cleanups: null,
					context: r ? r.context : null,
					owner: r,
				},
		o = i ? e : () => e(() => A(() => Q(l)));
	(h = l), (y = null);
	try {
		return j(o, !0);
	} finally {
		(y = n), (h = s);
	}
}
function $(e, t) {
	t = t ? Object.assign({}, B, t) : B;
	const n = {
			value: e,
			observers: null,
			observerSlots: null,
			comparator: t.equals || void 0,
		},
		s = (i) => (typeof i == "function" && (i = i(n.value)), Ne(n, i));
	return [Pe.bind(n), s];
}
function ne(e, t, n) {
	const s = W(e, t, !0, N);
	D(s);
}
function T(e, t, n) {
	const s = W(e, t, !1, N);
	D(s);
}
function Ce(e, t, n) {
	xe = Ye;
	const s = W(e, t, !1, N),
		i = M && X(M);
	i && (s.suspense = i), (s.user = !0), E ? E.push(s) : D(s);
}
function P(e, t, n) {
	n = n ? Object.assign({}, B, n) : B;
	const s = W(e, t, !0, 0);
	return (
		(s.observers = null),
		(s.observerSlots = null),
		(s.comparator = n.equals || void 0),
		D(s),
		Pe.bind(s)
	);
}
function De(e) {
	return e && typeof e == "object" && "then" in e;
}
function Ae(e, t, n) {
	let s, i, r;
	(arguments.length === 2 && typeof t == "object") || arguments.length === 1
		? ((s = !0), (i = e), (r = {}))
		: ((s = e), (i = t), (r = {}));
	let l = null,
		o = ee,
		f = null,
		d = !1,
		c = !1,
		a = "initialValue" in r,
		b = typeof s == "function" && P(s);
	const x = new Set(),
		[C, O] = (r.storage || $)(r.initialValue),
		[k, L] = $(void 0),
		[F, J] = $(void 0, { equals: !1 }),
		[ce, ae] = $(a ? "ready" : "unresolved");
	if (u.context) {
		f = u.getNextContextId();
		let g;
		r.ssrLoadFrom === "initial"
			? (o = r.initialValue)
			: u.load && (g = u.load(f)) && (o = g);
	}
	function v(g, p, m, I) {
		return (
			l === g &&
				((l = null),
				I !== void 0 && (a = !0),
				(g === o || p === o) &&
					r.onHydrated &&
					queueMicrotask(() => r.onHydrated(I, { value: p })),
				(o = ee),
				_e(p, m)),
			p
		);
	}
	function _e(g, p) {
		j(() => {
			p === void 0 && O(() => g),
				ae(p !== void 0 ? "errored" : a ? "ready" : "unresolved"),
				L(p);
			for (const m of x.keys()) m.decrement();
			x.clear();
		}, !1);
	}
	function Z() {
		const g = M && X(M),
			p = C(),
			m = k();
		if (m !== void 0 && !l) throw m;
		return (
			y &&
				!y.user &&
				g &&
				ne(() => {
					F(),
						l &&
							(g.resolved && H && d
								? H.promises.add(l)
								: x.has(g) || (g.increment(), x.add(g)));
				}),
			p
		);
	}
	function z(g = !0) {
		if (g !== !1 && c) return;
		c = !1;
		const p = b ? b() : s;
		if (((d = H), p == null || p === !1)) {
			v(l, A(C));
			return;
		}
		const m = o !== ee ? o : A(() => i(p, { value: C(), refetching: g }));
		return De(m)
			? ((l = m),
				"value" in m
					? (m.status === "success"
							? v(l, m.value, void 0, p)
							: v(l, void 0, se(m.value), p),
						m)
					: ((c = !0),
						queueMicrotask(() => (c = !1)),
						j(() => {
							ae(a ? "refreshing" : "pending"), J();
						}, !1),
						m.then(
							(I) => v(m, I, void 0, p),
							(I) => v(m, void 0, se(I), p),
						)))
			: (v(l, m, void 0, p), m);
	}
	return (
		Object.defineProperties(Z, {
			state: { get: () => ce() },
			error: { get: () => k() },
			loading: {
				get() {
					const g = ce();
					return g === "pending" || g === "refreshing";
				},
			},
			latest: {
				get() {
					if (!a) return Z();
					const g = k();
					if (g && !l) throw g;
					return C();
				},
			},
		}),
		b ? ne(() => z(!1)) : z(!1),
		[Z, { refetch: z, mutate: O }]
	);
}
function Fe(e) {
	return j(e, !1);
}
function A(e) {
	if (y === null) return e();
	const t = y;
	y = null;
	try {
		return e();
	} finally {
		y = t;
	}
}
function Ue(e, t, n) {
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
		const f = A(() => t(o, i, l));
		return (i = o), f;
	};
}
function Ve(e) {
	Ce(() => A(e));
}
function Se(e) {
	return (
		h === null ||
			(h.cleanups === null ? (h.cleanups = [e]) : h.cleanups.push(e)),
		e
	);
}
function Ee() {
	return h;
}
function qe(e) {
	E.push.apply(E, e), (e.length = 0);
}
function ue(e, t) {
	const n = Symbol("context");
	return { id: n, Provider: Ge(n), defaultValue: e };
}
function X(e) {
	let t;
	return h && h.context && (t = h.context[e.id]) !== void 0
		? t
		: e.defaultValue;
}
function Oe(e) {
	const t = P(e),
		n = P(() => ie(t()));
	return (
		(n.toArray = () => {
			const s = n();
			return Array.isArray(s) ? s : s != null ? [s] : [];
		}),
		n
	);
}
let M;
function Be() {
	return M || (M = ue());
}
function Pe() {
	if (this.sources && this.state)
		if (this.state === N) D(this);
		else {
			const e = w;
			(w = null), j(() => Y(this), !1), (w = e);
		}
	if (y) {
		const e = this.observers ? this.observers.length : 0;
		y.sources
			? (y.sources.push(this), y.sourceSlots.push(e))
			: ((y.sources = [this]), (y.sourceSlots = [e])),
			this.observers
				? (this.observers.push(y),
					this.observerSlots.push(y.sources.length - 1))
				: ((this.observers = [y]),
					(this.observerSlots = [y.sources.length - 1]));
	}
	return this.value;
}
function Ne(e, t, n) {
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
								(r.pure ? w.push(r) : E.push(r),
								r.observers && Te(r)),
							l || (r.state = N);
					}
					if (w.length > 1e6) throw ((w = []), new Error());
				}, !1)),
		t
	);
}
function D(e) {
	if (!e.fn) return;
	Q(e);
	const t = G;
	Ke(e, e.value, t);
}
function Ke(e, t, n) {
	let s;
	const i = h,
		r = y;
	y = h = e;
	try {
		s = e.fn(t);
	} catch (l) {
		return (
			e.pure &&
				((e.state = N),
				e.owned && e.owned.forEach(Q),
				(e.owned = null)),
			(e.updatedAt = n + 1),
			je(l)
		);
	} finally {
		(y = r), (h = i);
	}
	(!e.updatedAt || e.updatedAt <= n) &&
		(e.updatedAt != null && "observers" in e ? Ne(e, s) : (e.value = s),
		(e.updatedAt = n));
}
function W(e, t, n, s = N, i) {
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
			(h !== we && (h.owned ? h.owned.push(r) : (h.owned = [r]))),
		r
	);
}
function R(e) {
	if (e.state === 0) return;
	if (e.state === K) return Y(e);
	if (e.suspense && A(e.suspense.inFallback))
		return e.suspense.effects.push(e);
	const t = [e];
	for (; (e = e.owner) && (!e.updatedAt || e.updatedAt < G); )
		e.state && t.push(e);
	for (let n = t.length - 1; n >= 0; n--)
		if (((e = t[n]), e.state === N)) D(e);
		else if (e.state === K) {
			const s = w;
			(w = null), j(() => Y(e, t[0]), !1), (w = s);
		}
}
function j(e, t) {
	if (w) return e();
	let n = !1;
	t || (w = []), E ? (n = !0) : (E = []), G++;
	try {
		const s = e();
		return Re(n), s;
	} catch (s) {
		n || (E = null), (w = null), je(s);
	}
}
function Re(e) {
	if ((w && ($e(w), (w = null)), e)) return;
	const t = E;
	(E = null), t.length && j(() => xe(t), !1);
}
function $e(e) {
	for (let t = 0; t < e.length; t++) R(e[t]);
}
function Ye(e) {
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
		} else
			u.effects &&
				((e = [...u.effects, ...e]),
				(n += u.effects.length),
				delete u.effects);
		S();
	}
	for (t = 0; t < n; t++) R(e[t]);
}
function Y(e, t) {
	e.state = 0;
	for (let n = 0; n < e.sources.length; n += 1) {
		const s = e.sources[n];
		if (s.sources) {
			const i = s.state;
			i === N
				? s !== t && (!s.updatedAt || s.updatedAt < G) && R(s)
				: i === K && Y(s, t);
		}
	}
}
function Te(e) {
	for (let t = 0; t < e.observers.length; t += 1) {
		const n = e.observers[t];
		n.state ||
			((n.state = K),
			n.pure ? w.push(n) : E.push(n),
			n.observers && Te(n));
	}
}
function Q(e) {
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
		for (t = e.owned.length - 1; t >= 0; t--) Q(e.owned[t]);
		e.owned = null;
	}
	if (e.cleanups) {
		for (t = e.cleanups.length - 1; t >= 0; t--) e.cleanups[t]();
		e.cleanups = null;
	}
	e.state = 0;
}
function se(e) {
	return e instanceof Error
		? e
		: new Error(typeof e == "string" ? e : "Unknown error", { cause: e });
}
function je(e, t = h) {
	throw se(e);
}
function ie(e) {
	if (typeof e == "function" && !e.length) return ie(e());
	if (Array.isArray(e)) {
		const t = [];
		for (let n = 0; n < e.length; n++) {
			const s = ie(e[n]);
			Array.isArray(s) ? t.push.apply(t, s) : t.push(s);
		}
		return t;
	}
	return e;
}
function Ge(e, t) {
	return function (s) {
		let i;
		return (
			T(
				() =>
					(i = A(
						() => (
							(h.context = { ...h.context, [e]: s.value }),
							Oe(() => s.children)
						),
					)),
				void 0,
			),
			i
		);
	};
}
let ke = !1;
function Le() {
	ke = !0;
}
function ve(e, t) {
	if (ke && u.context) {
		const n = u.context;
		S(He());
		const s = A(() => e(t || {}));
		return S(n), s;
	}
	return A(() => e(t || {}));
}
function q() {
	return !0;
}
const re = {
	get(e, t, n) {
		return t === U ? n : e.get(t);
	},
	has(e, t) {
		return t === U ? !0 : e.has(t);
	},
	set: q,
	deleteProperty: q,
	getOwnPropertyDescriptor(e, t) {
		return {
			configurable: !0,
			enumerable: !0,
			get() {
				return e.get(t);
			},
			set: q,
			deleteProperty: q,
		};
	},
	ownKeys(e) {
		return e.keys();
	},
};
function te(e) {
	return (e = typeof e == "function" ? e() : e) ? e : {};
}
function Xe() {
	for (let e = 0, t = this.length; e < t; ++e) {
		const n = this[e]();
		if (n !== void 0) return n;
	}
}
function We(...e) {
	let t = !1;
	for (let l = 0; l < e.length; l++) {
		const o = e[l];
		(t = t || (!!o && U in o)),
			(e[l] = typeof o == "function" ? ((t = !0), P(o)) : o);
	}
	if (t)
		return new Proxy(
			{
				get(l) {
					for (let o = e.length - 1; o >= 0; o--) {
						const f = te(e[o])[l];
						if (f !== void 0) return f;
					}
				},
				has(l) {
					for (let o = e.length - 1; o >= 0; o--)
						if (l in te(e[o])) return !0;
					return !1;
				},
				keys() {
					const l = [];
					for (let o = 0; o < e.length; o++)
						l.push(...Object.keys(te(e[o])));
					return [...new Set(l)];
				},
			},
			re,
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
							get: Xe.bind((n[c] = [a.get.bind(o)])),
						}
					: a.value !== void 0
						? a
						: void 0;
			else {
				const b = n[c];
				b &&
					(a.get
						? b.push(a.get.bind(o))
						: a.value !== void 0 && b.push(() => a.value));
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
function Qe(e, ...t) {
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
						re,
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
					re,
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
function Je(e) {
	let t, n;
	const s = (i) => {
		const r = u.context;
		if (r) {
			const [o, f] = $();
			u.count || (u.count = 0),
				u.count++,
				(n || (n = e())).then((d) => {
					S(r), u.count--, f(() => d.default), S();
				}),
				(t = o);
		} else if (!t) {
			const [o] = Ae(() => (n || (n = e())).then((f) => f.default));
			t = o;
		}
		let l;
		return P(
			() =>
				(l = t()) &&
				A(() => {
					if (!r) return l(i);
					const o = u.context;
					S(r);
					const f = l(i);
					return S(o), f;
				}),
		);
	};
	return (
		(s.preload = () =>
			n || ((n = e()).then((i) => (t = () => i.default)), n)),
		s
	);
}
const Ze = ue();
function ze(e) {
	let t = 0,
		n,
		s,
		i,
		r,
		l;
	const [o, f] = $(!1),
		d = Be(),
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
		a = Ee();
	if (u.context && u.load) {
		const C = u.getContextId();
		let O = u.load(C);
		if (
			(O &&
				(typeof O != "object" || O.status !== "success"
					? (i = O)
					: u.gather(C)),
			i && i !== "$$f")
		) {
			const [k, L] = $(void 0, { equals: !1 });
			(r = k),
				i.then(
					() => {
						if (u.done) return L();
						u.gather(C), S(s), L(), S();
					},
					(F) => {
						(l = F), L();
					},
				);
		}
	}
	const b = X(Ze);
	b && (n = b.register(c.inFallback));
	let x;
	return (
		Se(() => x && x()),
		ve(d.Provider, {
			value: c,
			get children() {
				return P(() => {
					if (l) throw l;
					if (((s = u.context), r)) return r(), (r = void 0);
					s && i === "$$f" && S();
					const C = P(() => e.children);
					return P((O) => {
						const k = c.inFallback(),
							{ showContent: L = !0, showFallback: F = !0 } = n
								? n()
								: {};
						if ((!k || (i && i !== "$$f")) && L)
							return (
								(c.resolved = !0),
								x && x(),
								(x = s = i = void 0),
								qe(c.effects),
								C()
							);
						if (F)
							return x
								? O
								: fe(
										(J) => (
											(x = J),
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
const wt = Object.freeze(
		Object.defineProperty(
			{
				__proto__: null,
				$PROXY: U,
				Suspense: ze,
				batch: Fe,
				children: Oe,
				createComponent: ve,
				createComputed: ne,
				createContext: ue,
				createEffect: Ce,
				createMemo: P,
				createRenderEffect: T,
				createResource: Ae,
				createRoot: fe,
				createSignal: $,
				enableHydration: Le,
				equalFn: me,
				getOwner: Ee,
				lazy: Je,
				mergeProps: We,
				on: Ue,
				onCleanup: Se,
				onMount: Ve,
				sharedConfig: u,
				splitProps: Qe,
				untrack: A,
				useContext: X,
			},
			Symbol.toStringTag,
			{ value: "Module" },
		),
	),
	et = [
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
	tt = new Set([
		"className",
		"value",
		"readOnly",
		"formNoValidate",
		"isMap",
		"noModule",
		"playsInline",
		...et,
	]),
	nt = new Set(["innerHTML", "textContent", "innerText", "children"]),
	st = Object.assign(Object.create(null), {
		className: "class",
		htmlFor: "for",
	}),
	it = Object.assign(Object.create(null), {
		class: "className",
		formnovalidate: { $: "formNoValidate", BUTTON: 1, INPUT: 1 },
		ismap: { $: "isMap", IMG: 1 },
		nomodule: { $: "noModule", SCRIPT: 1 },
		playsinline: { $: "playsInline", VIDEO: 1 },
		readonly: { $: "readOnly", INPUT: 1, TEXTAREA: 1 },
	});
function rt(e, t) {
	const n = it[e];
	return typeof n == "object" ? (n[t] ? n.$ : void 0) : n;
}
const ot = new Set([
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
function lt(e, t, n) {
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
						b = 1,
						x;
					for (
						;
						++a < i &&
						a < r &&
						!((x = d.get(t[a])) == null || x !== c + b);
					)
						b++;
					if (b > c - o) {
						const C = t[l];
						for (; o < c; ) e.insertBefore(n[o++], C);
					} else e.replaceChild(n[o++], t[l++]);
				} else l++;
			else t[l++].remove();
		}
	}
}
const he = "_$DX_DELEGATE";
function ft(e, t, n, s = {}) {
	let i;
	return (
		fe((r) => {
			(i = r),
				t === document
					? e()
					: yt(t, e(), t.firstChild ? null : void 0, n);
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
function ut(e, t = window.document) {
	const n = t[he] || (t[he] = new Set());
	for (let s = 0, i = e.length; s < i; s++) {
		const r = e[s];
		n.has(r) || (n.add(r), t.addEventListener(r, Ie));
	}
}
function oe(e, t, n) {
	(u.context && e.isConnected) ||
		(n == null ? e.removeAttribute(t) : e.setAttribute(t, n));
}
function ct(e, t) {
	(u.context && e.isConnected) ||
		(t == null ? e.removeAttribute("class") : (e.className = t));
}
function at(e, t, n, s) {
	if (s)
		Array.isArray(n)
			? ((e[`$$${t}`] = n[0]), (e[`$$${t}Data`] = n[1]))
			: (e[`$$${t}`] = n);
	else if (Array.isArray(n)) {
		const i = n[0];
		e.addEventListener(t, (n[0] = (r) => i.call(e, n[1], r)));
	} else e.addEventListener(t, n);
}
function dt(e, t, n = {}) {
	const s = Object.keys(t || {}),
		i = Object.keys(n);
	let r, l;
	for (r = 0, l = i.length; r < l; r++) {
		const o = i[r];
		!o || o === "undefined" || t[o] || (ge(e, o, !1), delete n[o]);
	}
	for (r = 0, l = s.length; r < l; r++) {
		const o = s[r],
			f = !!t[o];
		!o ||
			o === "undefined" ||
			n[o] === f ||
			!f ||
			(ge(e, o, !0), (n[o] = f));
	}
	return n;
}
function ht(e, t, n) {
	if (!t) return n ? oe(e, "style") : t;
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
function At(e, t = {}, n, s) {
	const i = {};
	return (
		T(() => (i.children = V(e, t.children, i.children))),
		T(() => typeof t.ref == "function" && gt(t.ref, e)),
		T(() => bt(e, t, n, !0, i, !0)),
		i
	);
}
function gt(e, t, n) {
	return A(() => e(t, n));
}
function yt(e, t, n, s) {
	if ((n !== void 0 && !s && (s = []), typeof t != "function"))
		return V(e, t, s, n);
	T((i) => V(e, t(), i, n), s);
}
function bt(e, t, n, s, i = {}, r = !1) {
	t || (t = {});
	for (const l in i)
		if (!(l in t)) {
			if (l === "children") continue;
			i[l] = ye(e, l, null, i[l], n, r);
		}
	for (const l in t) {
		if (l === "children") continue;
		const o = t[l];
		i[l] = ye(e, l, o, i[l], n, r);
	}
}
function pt(e, t, n = {}) {
	(u.completed = globalThis._$HY.completed),
		(u.events = globalThis._$HY.events),
		(u.load = (i) => globalThis._$HY.r[i]),
		(u.has = (i) => i in globalThis._$HY.r),
		(u.gather = (i) => pe(t, i)),
		(u.registry = new Map()),
		(u.context = { id: n.renderId || "", count: 0 }),
		pe(t, n.renderId);
	const s = ft(e, t, [...t.childNodes], n);
	return (u.context = null), s;
}
function St(e) {
	let t, n;
	return !u.context || !(t = u.registry.get((n = xt())))
		? e()
		: (u.completed && u.completed.add(t), u.registry.delete(n), t);
}
function Et() {
	u.events &&
		!u.events.queued &&
		(queueMicrotask(() => {
			const { completed: e, events: t } = u;
			for (t.queued = !1; t.length; ) {
				const [n, s] = t[0];
				if (!e.has(n)) return;
				Ie(s), t.shift();
			}
		}),
		(u.events.queued = !0));
}
function mt(e) {
	return e.toLowerCase().replace(/-([a-z])/g, (t, n) => n.toUpperCase());
}
function ge(e, t, n) {
	const s = t.trim().split(/\s+/);
	for (let i = 0, r = s.length; i < r; i++) e.classList.toggle(s[i], n);
}
function ye(e, t, n, s, i, r) {
	let l, o, f, d, c;
	if (t === "style") return ht(e, n, s);
	if (t === "classList") return dt(e, n, s);
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
			b = ot.has(a);
		if (!b && s) {
			const x = Array.isArray(s) ? s[0] : s;
			e.removeEventListener(a, x);
		}
		(b || n) && (at(e, a, n, b), b && ut([a]));
	} else if (t.slice(0, 5) === "attr:") oe(e, t.slice(5), n);
	else if (
		(c = t.slice(0, 5) === "prop:") ||
		(f = nt.has(t)) ||
		(d = rt(t, e.tagName)) ||
		(o = tt.has(t)) ||
		(l = e.nodeName.includes("-"))
	) {
		if (c) (t = t.slice(5)), (o = !0);
		else if (u.context && e.isConnected) return n;
		t === "class" || t === "className"
			? ct(e, n)
			: l && !o && !f
				? (e[mt(t)] = n)
				: (e[d || t] = n);
	} else oe(e, st[t] || t, n);
	return n;
}
function Ie(e) {
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
	const r = !!u.context && e.isConnected;
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
			if (le(f, t, n, i))
				return T(() => (n = V(e, f, n, s, !0))), () => n;
			if (r) {
				if (!f.length) return n;
				if (s === void 0) return [...e.childNodes];
				let c = f[0],
					a = [c];
				for (; (c = c.nextSibling) !== s; ) a.push(c);
				return (n = a);
			}
			if (f.length === 0) {
				if (((n = _(e, n, s)), o)) return n;
			} else
				d
					? n.length === 0
						? be(e, f, s)
						: lt(e, n, f)
					: (n && _(e), be(e, f));
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
function le(e, t, n, s) {
	let i = !1;
	for (let r = 0, l = t.length; r < l; r++) {
		let o = t[r],
			f = n && n[e.length],
			d;
		if (!(o == null || o === !0 || o === !1))
			if ((d = typeof o) == "object" && o.nodeType) e.push(o);
			else if (Array.isArray(o)) i = le(e, o, f) || i;
			else if (d === "function")
				if (s) {
					for (; typeof o == "function"; ) o = o();
					i =
						le(
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
function be(e, t, n = null) {
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
function pe(e, t) {
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
const Ot = (...e) => (Le(), pt(...e));
export {
	ze as S,
	$ as a,
	Fe as b,
	ve as c,
	Ce as d,
	P as e,
	gt as f,
	St as g,
	Ot as h,
	yt as i,
	At as j,
	Et as k,
	Je as l,
	We as m,
	Ve as n,
	Se as o,
	ut as p,
	Ue as q,
	ft as r,
	Qe as s,
	Ct as t,
	A as u,
	wt as v,
};
//# sourceMappingURL=web.Cch9Y2F5.js.map
