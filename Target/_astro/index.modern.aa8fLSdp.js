import { e as n } from "./index.modern.CkIAsQri.js";
function o() {
	return (
		(o = Object.assign
			? Object.assign.bind()
			: function (e) {
					for (var s = 1; s < arguments.length; s++) {
						var t = arguments[s];
						for (var a in t)
							Object.prototype.hasOwnProperty.call(t, a) &&
								(e[a] = t[a]);
					}
					return e;
				}),
		o.apply(this, arguments)
	);
}
class u extends n {
	constructor(s = {}) {
		super(),
			(this.name = "SwupBodyClassPlugin"),
			(this.requires = { swup: ">=4.6" }),
			(this.defaults = { prefix: "" }),
			(this.options = void 0),
			(this.updateBodyClass = (t) => {
				this.updateClassNames(document.body, t.to.document.body);
			}),
			(this.options = o({}, this.defaults, s));
	}
	mount() {
		this.on("content:replace", this.updateBodyClass);
	}
	updateClassNames(s, t) {
		const a = [...s.classList].filter((i) => this.isValidClassName(i)),
			r = [...t.classList].filter((i) => this.isValidClassName(i));
		s.classList.remove(...a), s.classList.add(...r);
	}
	isValidClassName(s) {
		return s && s.startsWith(this.options.prefix);
	}
}
export { u as default };
//# sourceMappingURL=index.modern.aa8fLSdp.js.map