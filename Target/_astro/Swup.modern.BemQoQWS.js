const A = new WeakMap();
function x(e, t, i, s) {
	if (!e && !A.has(t)) return !1;
	const n = A.get(t) ?? new WeakMap();
	A.set(t, n);
	const o = n.get(i) ?? new Set();
	n.set(i, o);
	const a = o.has(s);
	return e ? o.add(s) : o.delete(s), a && e;
}
function N(e, t) {
	let i = e.target;
	if (
		(i instanceof Text && (i = i.parentElement),
		i instanceof Element && e.currentTarget instanceof Element)
	) {
		const s = i.closest(t);
		if (s && e.currentTarget.contains(s)) return s;
	}
}
function D(e, t, i, s = {}) {
	const { signal: n, base: o = document } = s;
	if (n?.aborted) return;
	const { once: a, ...r } = s,
		l = o instanceof Document ? o.documentElement : o,
		h = !!(typeof s == "object" ? s.capture : s),
		c = (m) => {
			const f = N(m, e);
			if (f) {
				const g = Object.assign(m, { delegateTarget: f });
				i.call(l, g),
					a && (l.removeEventListener(t, c, r), x(!1, l, i, u));
			}
		},
		u = JSON.stringify({ selector: e, type: t, capture: h });
	x(!0, l, i, u) || l.addEventListener(t, c, r),
		n?.addEventListener("abort", () => {
			x(!1, l, i, u);
		});
}
function p() {
	return (
		(p = Object.assign
			? Object.assign.bind()
			: function (e) {
					for (var t = 1; t < arguments.length; t++) {
						var i = arguments[t];
						for (var s in i)
							({}).hasOwnProperty.call(i, s) && (e[s] = i[s]);
					}
					return e;
				}),
		p.apply(null, arguments)
	);
}
const I = (e, t) =>
		String(e)
			.toLowerCase()
			.replace(/[\s/_.]+/g, "-")
			.replace(/[^\w-]+/g, "")
			.replace(/--+/g, "-")
			.replace(/^-+|-+$/g, "") ||
		t ||
		"",
	b = ({ hash: e } = {}) =>
		window.location.pathname +
		window.location.search +
		(e ? window.location.hash : ""),
	W = (e, t = {}) => {
		const i = p(
			{
				url: (e = e || b({ hash: !0 })),
				random: Math.random(),
				source: "swup",
			},
			t,
		);
		window.history.pushState(i, "", e);
	},
	k = (e = null, t = {}) => {
		e = e || b({ hash: !0 });
		const i = p(
			{},
			window.history.state || {},
			{ url: e, random: Math.random(), source: "swup" },
			t,
		);
		window.history.replaceState(i, "", e);
	},
	j = (e, t, i, s) => {
		const n = new AbortController();
		return (
			(s = p({}, s, { signal: n.signal })),
			D(e, t, i, s),
			{ destroy: () => n.abort() }
		);
	};
let w = class P extends URL {
	constructor(t, i = document.baseURI) {
		super(t.toString(), i), Object.setPrototypeOf(this, P.prototype);
	}
	get url() {
		return this.pathname + this.search;
	}
	static fromElement(t) {
		const i = t.getAttribute("href") || t.getAttribute("xlink:href") || "";
		return new P(i);
	}
	static fromUrl(t) {
		return new P(t);
	}
};
class E extends Error {
	constructor(t, i) {
		super(t),
			(this.url = void 0),
			(this.status = void 0),
			(this.aborted = void 0),
			(this.timedOut = void 0),
			(this.name = "FetchError"),
			(this.url = i.url),
			(this.status = i.status),
			(this.aborted = i.aborted || !1),
			(this.timedOut = i.timedOut || !1);
	}
}
async function B(e, t = {}) {
	var i;
	e = w.fromUrl(e).url;
	const { visit: s = this.visit } = t,
		n = p({}, this.options.requestHeaders, t.headers),
		o = (i = t.timeout) != null ? i : this.options.timeout,
		a = new AbortController(),
		{ signal: r } = a;
	t = p({}, t, { headers: n, signal: r });
	let l,
		h = !1,
		c = null;
	o &&
		o > 0 &&
		(c = setTimeout(() => {
			(h = !0), a.abort("timeout");
		}, o));
	try {
		(l = await this.hooks.call(
			"fetch:request",
			s,
			{ url: e, options: t },
			(v, { url: S, options: y }) => fetch(S, y),
		)),
			c && clearTimeout(c);
	} catch (v) {
		throw h
			? (this.hooks.call("fetch:timeout", s, { url: e }),
				new E(`Request timed out: ${e}`, { url: e, timedOut: h }))
			: v?.name === "AbortError" || r.aborted
				? new E(`Request aborted: ${e}`, { url: e, aborted: !0 })
				: v;
	}
	const { status: u, url: d } = l,
		m = await l.text();
	if (u === 500)
		throw (
			(this.hooks.call("fetch:error", s, {
				status: u,
				response: l,
				url: d,
			}),
			new E(`Server error: ${d}`, { status: u, url: d }))
		);
	if (!m) throw new E(`Empty response: ${d}`, { status: u, url: d });
	const { url: f } = w.fromUrl(d),
		g = { url: f, html: m };
	return (
		!s.cache.write ||
			(t.method && t.method !== "GET") ||
			e !== f ||
			this.cache.set(g.url, g),
		g
	);
}
class F {
	constructor(t) {
		(this.swup = void 0), (this.pages = new Map()), (this.swup = t);
	}
	get size() {
		return this.pages.size;
	}
	get all() {
		const t = new Map();
		return (
			this.pages.forEach((i, s) => {
				t.set(s, p({}, i));
			}),
			t
		);
	}
	has(t) {
		return this.pages.has(this.resolve(t));
	}
	get(t) {
		const i = this.pages.get(this.resolve(t));
		return i && p({}, i);
	}
	set(t, i) {
		(i = p({}, i, { url: (t = this.resolve(t)) })),
			this.pages.set(t, i),
			this.swup.hooks.callSync("cache:set", void 0, { page: i });
	}
	update(t, i) {
		t = this.resolve(t);
		const s = p({}, this.get(t), i, { url: t });
		this.pages.set(t, s);
	}
	delete(t) {
		this.pages.delete(this.resolve(t));
	}
	clear() {
		this.pages.clear(),
			this.swup.hooks.callSync("cache:clear", void 0, void 0);
	}
	prune(t) {
		this.pages.forEach((i, s) => {
			t(s, i) && this.delete(s);
		});
	}
	resolve(t) {
		const { url: i } = w.fromUrl(t);
		return this.swup.resolveUrl(i);
	}
}
const H = (e, t = document) => t.querySelector(e),
	L = (e, t = document) => Array.from(t.querySelectorAll(e)),
	R = () =>
		new Promise((e) => {
			requestAnimationFrame(() => {
				requestAnimationFrame(() => {
					e();
				});
			});
		});
function O(e) {
	return (
		!!e &&
		(typeof e == "object" || typeof e == "function") &&
		typeof e.then == "function"
	);
}
function _(e, t = []) {
	return new Promise((i, s) => {
		const n = e(...t);
		O(n) ? n.then(i, s) : i(n);
	});
}
function T(e, t) {
	const i = e?.closest(`[${t}]`);
	return i != null && i.hasAttribute(t) ? i?.getAttribute(t) || !0 : void 0;
}
class K {
	constructor(t) {
		(this.swup = void 0),
			(this.swupClasses = [
				"to-",
				"is-changing",
				"is-rendering",
				"is-popstate",
				"is-animating",
				"is-leaving",
			]),
			(this.swup = t);
	}
	get selectors() {
		const { scope: t } = this.swup.visit.animation;
		return t === "containers"
			? this.swup.visit.containers
			: t === "html"
				? ["html"]
				: Array.isArray(t)
					? t
					: [];
	}
	get selector() {
		return this.selectors.join(",");
	}
	get targets() {
		return this.selector.trim() ? L(this.selector) : [];
	}
	add(...t) {
		this.targets.forEach((i) => i.classList.add(...t));
	}
	remove(...t) {
		this.targets.forEach((i) => i.classList.remove(...t));
	}
	clear() {
		this.targets.forEach((t) => {
			const i = t.className.split(" ").filter((s) => this.isSwupClass(s));
			t.classList.remove(...i);
		});
	}
	isSwupClass(t) {
		return this.swupClasses.some((i) => t.startsWith(i));
	}
}
class M {
	constructor(t, i) {
		(this.id = void 0),
			(this.state = void 0),
			(this.from = void 0),
			(this.to = void 0),
			(this.containers = void 0),
			(this.animation = void 0),
			(this.trigger = void 0),
			(this.cache = void 0),
			(this.history = void 0),
			(this.scroll = void 0);
		const { to: s, from: n, hash: o, el: a, event: r } = i;
		(this.id = Math.random()),
			(this.state = 1),
			(this.from = { url: n ?? t.location.url, hash: t.location.hash }),
			(this.to = { url: s, hash: o }),
			(this.containers = t.options.containers),
			(this.animation = {
				animate: !0,
				wait: !1,
				name: void 0,
				native: t.options.native,
				scope: t.options.animationScope,
				selector: t.options.animationSelector,
			}),
			(this.trigger = { el: a, event: r }),
			(this.cache = { read: t.options.cache, write: t.options.cache }),
			(this.history = {
				action: "push",
				popstate: !1,
				direction: void 0,
			}),
			(this.scroll = { reset: !0, target: void 0 });
	}
	advance(t) {
		this.state < t && (this.state = t);
	}
	abort() {
		this.state = 8;
	}
	get done() {
		return this.state >= 7;
	}
}
function z(e) {
	return new M(this, e);
}
class G {
	constructor(t) {
		(this.swup = void 0),
			(this.registry = new Map()),
			(this.hooks = [
				"animation:out:start",
				"animation:out:await",
				"animation:out:end",
				"animation:in:start",
				"animation:in:await",
				"animation:in:end",
				"animation:skip",
				"cache:clear",
				"cache:set",
				"content:replace",
				"content:scroll",
				"enable",
				"disable",
				"fetch:request",
				"fetch:error",
				"fetch:timeout",
				"history:popstate",
				"link:click",
				"link:self",
				"link:anchor",
				"link:newtab",
				"page:load",
				"page:view",
				"scroll:top",
				"scroll:anchor",
				"visit:start",
				"visit:transition",
				"visit:abort",
				"visit:end",
			]),
			(this.swup = t),
			this.init();
	}
	init() {
		this.hooks.forEach((t) => this.create(t));
	}
	create(t) {
		this.registry.has(t) || this.registry.set(t, new Map());
	}
	exists(t) {
		return this.registry.has(t);
	}
	get(t) {
		const i = this.registry.get(t);
		if (i) return i;
		console.error(`Unknown hook '${t}'`);
	}
	clear() {
		this.registry.forEach((t) => t.clear());
	}
	on(t, i, s = {}) {
		const n = this.get(t);
		if (!n) return console.warn(`Hook '${t}' not found.`), () => {};
		const o = p({}, s, { id: n.size + 1, hook: t, handler: i });
		return n.set(i, o), () => this.off(t, i);
	}
	before(t, i, s = {}) {
		return this.on(t, i, p({}, s, { before: !0 }));
	}
	replace(t, i, s = {}) {
		return this.on(t, i, p({}, s, { replace: !0 }));
	}
	once(t, i, s = {}) {
		return this.on(t, i, p({}, s, { once: !0 }));
	}
	off(t, i) {
		const s = this.get(t);
		s && i
			? s.delete(i) || console.warn(`Handler for hook '${t}' not found.`)
			: s && s.clear();
	}
	async call(t, i, s, n) {
		const [o, a, r] = this.parseCallArgs(t, i, s, n),
			{ before: l, handler: h, after: c } = this.getHandlers(t, r);
		await this.run(l, o, a);
		const [u] = await this.run(h, o, a, !0);
		return await this.run(c, o, a), this.dispatchDomEvent(t, o, a), u;
	}
	callSync(t, i, s, n) {
		const [o, a, r] = this.parseCallArgs(t, i, s, n),
			{ before: l, handler: h, after: c } = this.getHandlers(t, r);
		this.runSync(l, o, a);
		const [u] = this.runSync(h, o, a, !0);
		return this.runSync(c, o, a), this.dispatchDomEvent(t, o, a), u;
	}
	parseCallArgs(t, i, s, n) {
		return i instanceof M ||
			(typeof i != "object" && typeof s != "function")
			? [i, s, n]
			: [void 0, i, s];
	}
	async run(t, i = this.swup.visit, s, n = !1) {
		const o = [];
		for (const { hook: a, handler: r, defaultHandler: l, once: h } of t)
			if (i == null || !i.done) {
				h && this.off(a, r);
				try {
					const c = await _(r, [i, s, l]);
					o.push(c);
				} catch (c) {
					if (n) throw c;
					console.error(`Error in hook '${a}':`, c);
				}
			}
		return o;
	}
	runSync(t, i = this.swup.visit, s, n = !1) {
		const o = [];
		for (const { hook: a, handler: r, defaultHandler: l, once: h } of t)
			if (i == null || !i.done) {
				h && this.off(a, r);
				try {
					const c = r(i, s, l);
					o.push(c),
						O(c) &&
							console.warn(
								`Swup will not await Promises in handler for synchronous hook '${a}'.`,
							);
				} catch (c) {
					if (n) throw c;
					console.error(`Error in hook '${a}':`, c);
				}
			}
		return o;
	}
	getHandlers(t, i) {
		const s = this.get(t);
		if (!s)
			return {
				found: !1,
				before: [],
				handler: [],
				after: [],
				replaced: !1,
			};
		const n = Array.from(s.values()),
			o = this.sortRegistrations,
			a = n.filter(({ before: u, replace: d }) => u && !d).sort(o),
			r = n
				.filter(({ replace: u }) => u)
				.filter((u) => !0)
				.sort(o),
			l = n.filter(({ before: u, replace: d }) => !u && !d).sort(o),
			h = r.length > 0;
		let c = [];
		if (i && ((c = [{ id: 0, hook: t, handler: i }]), h)) {
			const u = r.length - 1,
				d = (m) => {
					const f = r[m - 1];
					return f ? (g, v) => f.handler(g, v, d(m - 1)) : i;
				};
			c = [
				{ id: 0, hook: t, handler: r[u].handler, defaultHandler: d(u) },
			];
		}
		return { found: !0, before: a, handler: c, after: l, replaced: h };
	}
	sortRegistrations(t, i) {
		var s, n;
		return (
			((s = t.priority) != null ? s : 0) -
				((n = i.priority) != null ? n : 0) ||
			t.id - i.id ||
			0
		);
	}
	dispatchDomEvent(t, i, s) {
		if (i != null && i.done) return;
		const n = { hook: t, args: s, visit: i || this.swup.visit };
		document.dispatchEvent(
			new CustomEvent("swup:any", { detail: n, bubbles: !0 }),
		),
			document.dispatchEvent(
				new CustomEvent(`swup:${t}`, { detail: n, bubbles: !0 }),
			);
	}
}
const J = (e) => {
		if ((e && e.charAt(0) === "#" && (e = e.substring(1)), !e)) return null;
		const t = decodeURIComponent(e);
		let i =
			document.getElementById(e) ||
			document.getElementById(t) ||
			H(`a[name='${CSS.escape(e)}']`) ||
			H(`a[name='${CSS.escape(t)}']`);
		return i || e !== "top" || (i = document.body), i;
	},
	C = "transition",
	$ = "animation";
async function X({ selector: e, elements: t }) {
	if (e === !1 && !t) return;
	let i = [];
	if (t) i = Array.from(t);
	else if (e && ((i = L(e, document.body)), !i.length))
		return void console.warn(
			`[swup] No elements found matching animationSelector \`${e}\``,
		);
	const s = i.map((n) =>
		(function (o) {
			const {
				type: a,
				timeout: r,
				propCount: l,
			} = (function (h) {
				const c = window.getComputedStyle(h),
					u = U(c, `${C}Delay`),
					d = U(c, `${C}Duration`),
					m = q(u, d),
					f = U(c, `${$}Delay`),
					g = U(c, `${$}Duration`),
					v = q(f, g),
					S = Math.max(m, v),
					y = S > 0 ? (m > v ? C : $) : null;
				return {
					type: y,
					timeout: S,
					propCount: y ? (y === C ? d.length : g.length) : 0,
				};
			})(o);
			return (
				!(!a || !r) &&
				new Promise((h) => {
					const c = `${a}end`,
						u = performance.now();
					let d = 0;
					const m = () => {
							o.removeEventListener(c, f), h();
						},
						f = (g) => {
							g.target === o &&
								((performance.now() - u) / 1e3 <
									g.elapsedTime ||
									(++d >= l && m()));
						};
					setTimeout(() => {
						d < l && m();
					}, r + 1),
						o.addEventListener(c, f);
				})
			);
		})(n),
	);
	s.filter(Boolean).length > 0
		? await Promise.all(s)
		: e &&
			console.warn(
				`[swup] No CSS animation duration defined on elements matching \`${e}\``,
			);
}
function U(e, t) {
	return (e[t] || "").split(", ");
}
function q(e, t) {
	for (; e.length < t.length; ) e = e.concat(e);
	return Math.max(...t.map((i, s) => V(i) + V(e[s])));
}
function V(e) {
	return 1e3 * parseFloat(e);
}
function Q(e, t = {}, i = {}) {
	if (typeof e != "string")
		throw new Error("swup.navigate() requires a URL parameter");
	if (this.shouldIgnoreVisit(e, { el: i.el, event: i.event }))
		return void window.location.assign(e);
	const { url: s, hash: n } = w.fromUrl(e),
		o = this.createVisit(p({}, i, { to: s, hash: n }));
	this.performNavigation(o, t);
}
async function Y(e, t = {}) {
	if (this.navigating) {
		if (this.visit.state >= 6)
			return (
				(e.state = 2),
				void (this.onVisitEnd = () => this.performNavigation(e, t))
			);
		await this.hooks.call("visit:abort", this.visit, void 0),
			delete this.visit.to.document,
			(this.visit.state = 8);
	}
	(this.navigating = !0), (this.visit = e);
	const { el: i } = e.trigger;
	(t.referrer = t.referrer || this.location.url),
		t.animate === !1 && (e.animation.animate = !1),
		e.animation.animate || this.classes.clear();
	const s = t.history || T(i, "data-swup-history");
	typeof s == "string" &&
		["push", "replace"].includes(s) &&
		(e.history.action = s);
	const n = t.animation || T(i, "data-swup-animation");
	var o, a;
	typeof n == "string" && (e.animation.name = n),
		typeof t.cache == "object"
			? ((e.cache.read = (o = t.cache.read) != null ? o : e.cache.read),
				(e.cache.write =
					(a = t.cache.write) != null ? a : e.cache.write))
			: t.cache !== void 0 &&
				(e.cache = { read: !!t.cache, write: !!t.cache }),
		delete t.cache;
	try {
		await this.hooks.call("visit:start", e, void 0), (e.state = 3);
		const r = this.hooks.call(
			"page:load",
			e,
			{ options: t },
			async (h, c) => {
				let u;
				return (
					h.cache.read && (u = this.cache.get(h.to.url)),
					(c.page = u || (await this.fetchPage(h.to.url, c.options))),
					(c.cache = !!u),
					c.page
				);
			},
		);
		r.then(({ html: h }) => {
			e.advance(5),
				(e.to.html = h),
				(e.to.document = new DOMParser().parseFromString(
					h,
					"text/html",
				));
		});
		const l = e.to.url + e.to.hash;
		if (
			(e.history.popstate ||
				(e.history.action === "replace" ||
				e.to.url === this.location.url
					? k(l)
					: (this.currentHistoryIndex++,
						W(l, { index: this.currentHistoryIndex }))),
			(this.location = w.fromUrl(l)),
			e.history.popstate && this.classes.add("is-popstate"),
			e.animation.name && this.classes.add(`to-${I(e.animation.name)}`),
			e.animation.wait && (await r),
			e.done ||
				(await this.hooks.call(
					"visit:transition",
					e,
					void 0,
					async () => {
						if (!e.animation.animate)
							return (
								await this.hooks.call("animation:skip", void 0),
								void (await this.renderPage(e, await r))
							);
						e.advance(4),
							await this.animatePageOut(e),
							e.animation.native && document.startViewTransition
								? await document.startViewTransition(
										async () =>
											await this.renderPage(e, await r),
									).finished
								: await this.renderPage(e, await r),
							await this.animatePageIn(e);
					},
				),
				e.done))
		)
			return;
		await this.hooks.call("visit:end", e, void 0, () =>
			this.classes.clear(),
		),
			(e.state = 7),
			(this.navigating = !1),
			this.onVisitEnd && (this.onVisitEnd(), (this.onVisitEnd = void 0));
	} catch (r) {
		if (!r || (r != null && r.aborted)) return void (e.state = 8);
		(e.state = 9),
			console.error(r),
			(this.options.skipPopStateHandling = () => (
				window.location.assign(e.to.url + e.to.hash), !0
			)),
			window.history.back();
	} finally {
		delete e.to.document;
	}
}
const Z = async function (e) {
		await this.hooks.call("animation:out:start", e, void 0, () => {
			this.classes.add("is-changing", "is-animating", "is-leaving");
		}),
			await this.hooks.call(
				"animation:out:await",
				e,
				{ skip: !1 },
				(t, { skip: i }) => {
					if (!i)
						return this.awaitAnimations({
							selector: t.animation.selector,
						});
				},
			),
			await this.hooks.call("animation:out:end", e, void 0);
	},
	tt = function (e) {
		var t;
		const i = e.to.document;
		if (!i) return !1;
		const s =
			((t = i.querySelector("title")) == null ? void 0 : t.innerText) ||
			"";
		document.title = s;
		const n = L('[data-swup-persist]:not([data-swup-persist=""])'),
			o = e.containers
				.map((a) => {
					const r = document.querySelector(a),
						l = i.querySelector(a);
					return r && l
						? (r.replaceWith(l.cloneNode(!0)), !0)
						: (r ||
								console.warn(
									`[swup] Container missing in current document: ${a}`,
								),
							l ||
								console.warn(
									`[swup] Container missing in incoming document: ${a}`,
								),
							!1);
				})
				.filter(Boolean);
		return (
			n.forEach((a) => {
				const r = a.getAttribute("data-swup-persist"),
					l = H(`[data-swup-persist="${r}"]`);
				l && l !== a && l.replaceWith(a);
			}),
			o.length === e.containers.length
		);
	},
	et = function (e) {
		const t = { behavior: "auto" },
			{ target: i, reset: s } = e.scroll,
			n = i ?? e.to.hash;
		let o = !1;
		return (
			n &&
				(o = this.hooks.callSync(
					"scroll:anchor",
					e,
					{ hash: n, options: t },
					(a, { hash: r, options: l }) => {
						const h = this.getAnchorElement(r);
						return h && h.scrollIntoView(l), !!h;
					},
				)),
			s &&
				!o &&
				(o = this.hooks.callSync(
					"scroll:top",
					e,
					{ options: t },
					(a, { options: r }) => (
						window.scrollTo(p({ top: 0, left: 0 }, r)), !0
					),
				)),
			o
		);
	},
	it = async function (e) {
		if (e.done) return;
		const t = this.hooks.call(
			"animation:in:await",
			e,
			{ skip: !1 },
			(i, { skip: s }) => {
				if (!s)
					return this.awaitAnimations({
						selector: i.animation.selector,
					});
			},
		);
		await R(),
			await this.hooks.call("animation:in:start", e, void 0, () => {
				this.classes.remove("is-animating");
			}),
			await t,
			await this.hooks.call("animation:in:end", e, void 0);
	},
	st = async function (e, t) {
		if (e.done) return;
		e.advance(6);
		const { url: i } = t;
		this.isSameResolvedUrl(b(), i) ||
			(k(i),
			(this.location = w.fromUrl(i)),
			(e.to.url = this.location.url),
			(e.to.hash = this.location.hash)),
			await this.hooks.call(
				"content:replace",
				e,
				{ page: t },
				(s, {}) => {
					if (
						(this.classes.remove("is-leaving"),
						s.animation.animate && this.classes.add("is-rendering"),
						!this.replaceContent(s))
					)
						throw new Error("[swup] Container mismatch, aborting");
					s.animation.animate &&
						(this.classes.add(
							"is-changing",
							"is-animating",
							"is-rendering",
						),
						s.animation.name &&
							this.classes.add(`to-${I(s.animation.name)}`));
				},
			),
			await this.hooks.call("content:scroll", e, void 0, () =>
				this.scrollToContent(e),
			),
			await this.hooks.call("page:view", e, {
				url: this.location.url,
				title: document.title,
			});
	},
	nt = function (e) {
		var t;
		if (((t = e), !!t?.isSwupPlugin)) {
			if (
				((e.swup = this),
				!e._checkRequirements || e._checkRequirements())
			)
				return (
					e._beforeMount && e._beforeMount(),
					e.mount(),
					this.plugins.push(e),
					this.plugins
				);
		} else console.error("Not a swup plugin instance", e);
	};
function ot(e) {
	const t = this.findPlugin(e);
	if (t)
		return (
			t.unmount(),
			t._afterUnmount && t._afterUnmount(),
			(this.plugins = this.plugins.filter((i) => i !== t)),
			this.plugins
		);
	console.error("No such plugin", t);
}
function at(e) {
	return this.plugins.find(
		(t) => t === e || t.name === e || t.name === `Swup${String(e)}`,
	);
}
function rt(e) {
	if (typeof this.options.resolveUrl != "function")
		return (
			console.warn(
				"[swup] options.resolveUrl expects a callback function.",
			),
			e
		);
	const t = this.options.resolveUrl(e);
	return t && typeof t == "string"
		? t.startsWith("//") || t.startsWith("http")
			? (console.warn(
					"[swup] options.resolveUrl needs to return a relative url",
				),
				e)
			: t
		: (console.warn("[swup] options.resolveUrl needs to return a url"), e);
}
function lt(e, t) {
	return this.resolveUrl(e) === this.resolveUrl(t);
}
const ct = {
	animateHistoryBrowsing: !1,
	animationSelector: '[class*="transition-"]',
	animationScope: "html",
	cache: !0,
	containers: ["#swup"],
	ignoreVisit: (e, { el: t } = {}) =>
		!(t == null || !t.closest("[data-no-swup]")),
	linkSelector: "a[href]",
	linkToSelf: "scroll",
	native: !1,
	plugins: [],
	resolveUrl: (e) => e,
	requestHeaders: {
		"X-Requested-With": "swup",
		Accept: "text/html, application/xhtml+xml",
	},
	skipPopStateHandling: (e) => {
		var t;
		return ((t = e.state) == null ? void 0 : t.source) !== "swup";
	},
	timeout: 0,
};
class ht {
	get currentPageUrl() {
		return this.location.url;
	}
	constructor(t = {}) {
		var i, s;
		(this.version = "4.7.0"),
			(this.options = void 0),
			(this.defaults = ct),
			(this.plugins = []),
			(this.visit = void 0),
			(this.cache = void 0),
			(this.hooks = void 0),
			(this.classes = void 0),
			(this.location = w.fromUrl(window.location.href)),
			(this.currentHistoryIndex = void 0),
			(this.clickDelegate = void 0),
			(this.navigating = !1),
			(this.onVisitEnd = void 0),
			(this.use = nt),
			(this.unuse = ot),
			(this.findPlugin = at),
			(this.log = () => {}),
			(this.navigate = Q),
			(this.performNavigation = Y),
			(this.createVisit = z),
			(this.delegateEvent = j),
			(this.fetchPage = B),
			(this.awaitAnimations = X),
			(this.renderPage = st),
			(this.replaceContent = tt),
			(this.animatePageIn = it),
			(this.animatePageOut = Z),
			(this.scrollToContent = et),
			(this.getAnchorElement = J),
			(this.getCurrentUrl = b),
			(this.resolveUrl = rt),
			(this.isSameResolvedUrl = lt),
			(this.options = p({}, this.defaults, t)),
			(this.handleLinkClick = this.handleLinkClick.bind(this)),
			(this.handlePopState = this.handlePopState.bind(this)),
			(this.cache = new F(this)),
			(this.classes = new K(this)),
			(this.hooks = new G(this)),
			(this.visit = this.createVisit({ to: "" })),
			(this.currentHistoryIndex =
				(i = (s = window.history.state) == null ? void 0 : s.index) !=
				null
					? i
					: 1),
			this.enable();
	}
	async enable() {
		var t;
		const { linkSelector: i } = this.options;
		(this.clickDelegate = this.delegateEvent(
			i,
			"click",
			this.handleLinkClick,
		)),
			window.addEventListener("popstate", this.handlePopState),
			this.options.animateHistoryBrowsing &&
				(window.history.scrollRestoration = "manual"),
			(this.options.native =
				this.options.native && !!document.startViewTransition),
			this.options.plugins.forEach((s) => this.use(s)),
			((t = window.history.state) == null ? void 0 : t.source) !==
				"swup" && k(null, { index: this.currentHistoryIndex }),
			await R(),
			await this.hooks.call("enable", void 0, void 0, () => {
				const s = document.documentElement;
				s.classList.add("swup-enabled"),
					s.classList.toggle("swup-native", this.options.native);
			});
	}
	async destroy() {
		this.clickDelegate.destroy(),
			window.removeEventListener("popstate", this.handlePopState),
			this.cache.clear(),
			this.options.plugins.forEach((t) => this.unuse(t)),
			await this.hooks.call("disable", void 0, void 0, () => {
				const t = document.documentElement;
				t.classList.remove("swup-enabled"),
					t.classList.remove("swup-native");
			}),
			this.hooks.clear();
	}
	shouldIgnoreVisit(t, { el: i, event: s } = {}) {
		const { origin: n, url: o, hash: a } = w.fromUrl(t);
		return (
			n !== window.location.origin ||
			!(!i || !this.triggerWillOpenNewWindow(i)) ||
			!!this.options.ignoreVisit(o + a, { el: i, event: s })
		);
	}
	handleLinkClick(t) {
		const i = t.delegateTarget,
			{ href: s, url: n, hash: o } = w.fromElement(i);
		if (this.shouldIgnoreVisit(s, { el: i, event: t })) return;
		if (this.navigating && n === this.visit.to.url)
			return void t.preventDefault();
		const a = this.createVisit({ to: n, hash: o, el: i, event: t });
		t.metaKey || t.ctrlKey || t.shiftKey || t.altKey
			? this.hooks.callSync("link:newtab", a, { href: s })
			: t.button === 0 &&
				this.hooks.callSync(
					"link:click",
					a,
					{ el: i, event: t },
					() => {
						var r;
						const l = (r = a.from.url) != null ? r : "";
						t.preventDefault(),
							n && n !== l
								? this.isSameResolvedUrl(n, l) ||
									this.performNavigation(a)
								: o
									? this.hooks.callSync(
											"link:anchor",
											a,
											{ hash: o },
											() => {
												k(n + o),
													this.scrollToContent(a);
											},
										)
									: this.hooks.callSync(
											"link:self",
											a,
											void 0,
											() => {
												this.options.linkToSelf ===
												"navigate"
													? this.performNavigation(a)
													: (k(n),
														this.scrollToContent(
															a,
														));
											},
										);
					},
				);
	}
	handlePopState(t) {
		var i, s, n, o;
		const a =
			(i = (s = t.state) == null ? void 0 : s.url) != null
				? i
				: window.location.href;
		if (
			this.options.skipPopStateHandling(t) ||
			this.isSameResolvedUrl(b(), this.location.url)
		)
			return;
		const { url: r, hash: l } = w.fromUrl(a),
			h = this.createVisit({ to: r, hash: l, event: t });
		h.history.popstate = !0;
		const c =
			(n = (o = t.state) == null ? void 0 : o.index) != null ? n : 0;
		c &&
			c !== this.currentHistoryIndex &&
			((h.history.direction =
				c - this.currentHistoryIndex > 0 ? "forwards" : "backwards"),
			(this.currentHistoryIndex = c)),
			(h.animation.animate = !1),
			(h.scroll.reset = !1),
			(h.scroll.target = !1),
			this.options.animateHistoryBrowsing &&
				((h.animation.animate = !0), (h.scroll.reset = !0)),
			this.hooks.callSync("history:popstate", h, { event: t }, () => {
				this.performNavigation(h);
			});
	}
	triggerWillOpenNewWindow(t) {
		return !!t.matches('[download], [target="_blank"]');
	}
}
export {
	w as Location,
	I as classify,
	W as createHistoryRecord,
	ht as default,
	j as delegateEvent,
	T as getContextualAttr,
	b as getCurrentUrl,
	O as isPromise,
	R as nextTick,
	H as query,
	L as queryAll,
	_ as runAsPromise,
	k as updateHistoryRecord,
};
//# sourceMappingURL=Swup.modern.BemQoQWS.js.map