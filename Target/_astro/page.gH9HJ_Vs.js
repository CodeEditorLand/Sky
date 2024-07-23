import { i as A } from "./index.D6rU_tt3.js";
function g(e) {
	e = e || 1;
	var t = [],
		r = 0;
	function a(o) {
		t.push(o) > 1 || n();
	}
	function i() {
		r--, n();
	}
	function n() {
		r < e && t.length > 0 && (t.shift()(), r++);
	}
	return [a, i];
}
function y(e, t) {
	const r = t?.timeout ?? 50,
		a = Date.now();
	return setTimeout(function () {
		e({
			didTimeout: !1,
			timeRemaining: function () {
				return Math.max(0, r - (Date.now() - a));
			},
		});
	}, 1);
}
const b = window.requestIdleCallback || y;
var E = b;
const l = ["mouseenter", "touchstart", "focus"],
	v = new Set(),
	d = new Set();
function m({ href: e }) {
	try {
		const t = new URL(e);
		return (
			window.location.origin === t.origin &&
			window.location.pathname !== t.pathname &&
			!v.has(e)
		);
	} catch {}
	return !1;
}
let p, c;
function L(e) {
	v.add(e.href),
		c.observe(e),
		l.map((t) => e.addEventListener(t, h, { passive: !0, once: !0 }));
}
function k(e) {
	c.unobserve(e), l.map((t) => e.removeEventListener(t, h));
}
function h({ target: e }) {
	e instanceof HTMLAnchorElement && w(e);
}
async function w(e) {
	k(e);
	const { href: t } = e;
	try {
		const r = await fetch(t).then((n) => n.text());
		p ||= new DOMParser();
		const a = p.parseFromString(r, "text/html"),
			i = Array.from(a.querySelectorAll('link[rel="stylesheet"]'));
		await Promise.all(
			i
				.filter((n) => !d.has(n.href))
				.map((n) => (d.add(n.href), fetch(n.href))),
		);
	} catch {}
}
function q({
	selector: e = 'a[href][rel~="prefetch"]',
	throttle: t = 1,
	intentSelector: r = 'a[href][rel~="prefetch-intent"]',
}) {
	if (!navigator.onLine)
		return Promise.reject(
			new Error("Cannot prefetch, no network connection"),
		);
	if ("connection" in navigator) {
		const n = navigator.connection;
		if (n.saveData)
			return Promise.reject(
				new Error("Cannot prefetch, Save-Data is enabled"),
			);
		if (/(2|3)g/.test(n.effectiveType))
			return Promise.reject(
				new Error("Cannot prefetch, network conditions are poor"),
			);
	}
	const [a, i] = g(t);
	(c =
		c ||
		new IntersectionObserver((n) => {
			n.forEach((o) => {
				if (o.isIntersecting && o.target instanceof HTMLAnchorElement) {
					const f = o.target.getAttribute("rel") || "";
					let s = !1;
					Array.isArray(r)
						? (s = r.some((u) => f.includes(u)))
						: (s = f.includes(r)),
						s || a(() => w(o.target).finally(i));
				}
			});
		})),
		E(() => {
			[...document.querySelectorAll(e)].filter(m).forEach(L);
			const o = Array.isArray(r) ? r.join(",") : r;
			[...document.querySelectorAll(o)].filter(m).forEach((s) => {
				l.map((u) =>
					s.addEventListener(u, h, { passive: !0, once: !0 }),
				);
			});
		});
}
q({});
A();
//# sourceMappingURL=page.gH9HJ_Vs.js.map
