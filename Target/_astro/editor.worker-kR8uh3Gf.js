(function () {
	"use strict";
	class cr {
		constructor() {
			(this.listeners = []),
				(this.unexpectedErrorHandler = function (t) {
					setTimeout(() => {
						throw t.stack
							? Re.isErrorNoTelemetry(t)
								? new Re(
										t.message +
											`

` +
											t.stack,
									)
								: new Error(
										t.message +
											`

` +
											t.stack,
									)
							: t;
					}, 0);
				});
		}
		emit(t) {
			this.listeners.forEach((n) => {
				n(t);
			});
		}
		onUnexpectedError(t) {
			this.unexpectedErrorHandler(t), this.emit(t);
		}
		onUnexpectedExternalError(t) {
			this.unexpectedErrorHandler(t);
		}
	}
	const hr = new cr();
	function Ze(e) {
		fr(e) || hr.onUnexpectedError(e);
	}
	function rn(e) {
		if (e instanceof Error) {
			const { name: t, message: n } = e,
				s = e.stacktrace || e.stack;
			return {
				$isError: !0,
				name: t,
				message: n,
				stack: s,
				noTelemetry: Re.isErrorNoTelemetry(e),
			};
		}
		return e;
	}
	const vt = "Canceled";
	function fr(e) {
		return e instanceof dr
			? !0
			: e instanceof Error && e.name === vt && e.message === vt;
	}
	class dr extends Error {
		constructor() {
			super(vt), (this.name = this.message);
		}
	}
	class Re extends Error {
		constructor(t) {
			super(t), (this.name = "CodeExpectedError");
		}
		static fromError(t) {
			if (t instanceof Re) return t;
			const n = new Re();
			return (n.message = t.message), (n.stack = t.stack), n;
		}
		static isErrorNoTelemetry(t) {
			return t.name === "CodeExpectedError";
		}
	}
	class te extends Error {
		constructor(t) {
			super(t || "An unexpected bug occurred."),
				Object.setPrototypeOf(this, te.prototype);
		}
	}
	function mr(e, t) {
		const n = this;
		let s = !1,
			r;
		return function () {
			return s || ((s = !0), (r = e.apply(n, arguments))), r;
		};
	}
	var Ke;
	(function (e) {
		function t(p) {
			return (
				p &&
				typeof p == "object" &&
				typeof p[Symbol.iterator] == "function"
			);
		}
		e.is = t;
		const n = Object.freeze([]);
		function s() {
			return n;
		}
		e.empty = s;
		function* r(p) {
			yield p;
		}
		e.single = r;
		function i(p) {
			return t(p) ? p : r(p);
		}
		e.wrap = i;
		function o(p) {
			return p || n;
		}
		e.from = o;
		function* l(p) {
			for (let _ = p.length - 1; _ >= 0; _--) yield p[_];
		}
		e.reverse = l;
		function u(p) {
			return !p || p[Symbol.iterator]().next().done === !0;
		}
		e.isEmpty = u;
		function c(p) {
			return p[Symbol.iterator]().next().value;
		}
		e.first = c;
		function f(p, _) {
			let N = 0;
			for (const A of p) if (_(A, N++)) return !0;
			return !1;
		}
		e.some = f;
		function h(p, _) {
			for (const N of p) if (_(N)) return N;
		}
		e.find = h;
		function* d(p, _) {
			for (const N of p) _(N) && (yield N);
		}
		e.filter = d;
		function* m(p, _) {
			let N = 0;
			for (const A of p) yield _(A, N++);
		}
		e.map = m;
		function* g(p, _) {
			let N = 0;
			for (const A of p) yield* _(A, N++);
		}
		e.flatMap = g;
		function* b(...p) {
			for (const _ of p) yield* _;
		}
		e.concat = b;
		function w(p, _, N) {
			let A = N;
			for (const y of p) A = _(A, y);
			return A;
		}
		e.reduce = w;
		function* v(p, _, N = p.length) {
			for (
				_ < 0 && (_ += p.length),
					N < 0 ? (N += p.length) : N > p.length && (N = p.length);
				_ < N;
				_++
			)
				yield p[_];
		}
		e.slice = v;
		function C(p, _ = Number.POSITIVE_INFINITY) {
			const N = [];
			if (_ === 0) return [N, p];
			const A = p[Symbol.iterator]();
			for (let y = 0; y < _; y++) {
				const I = A.next();
				if (I.done) return [N, e.empty()];
				N.push(I.value);
			}
			return [
				N,
				{
					[Symbol.iterator]() {
						return A;
					},
				},
			];
		}
		e.consume = C;
		async function S(p) {
			const _ = [];
			for await (const N of p) _.push(N);
			return Promise.resolve(_);
		}
		e.asyncToArray = S;
	})(Ke || (Ke = {}));
	function z1(e) {
		return e;
	}
	function $1(e, t) {}
	function an(e) {
		if (Ke.is(e)) {
			const t = [];
			for (const n of e)
				if (n)
					try {
						n.dispose();
					} catch (s) {
						t.push(s);
					}
			if (t.length === 1) throw t[0];
			if (t.length > 1)
				throw new AggregateError(
					t,
					"Encountered errors while disposing of store",
				);
			return Array.isArray(e) ? [] : e;
		} else if (e) return e.dispose(), e;
	}
	function gr(...e) {
		return et(() => an(e));
	}
	function et(e) {
		return {
			dispose: mr(() => {
				e();
			}),
		};
	}
	class Ue {
		static {
			this.DISABLE_DISPOSED_WARNING = !1;
		}
		constructor() {
			(this._toDispose = new Set()), (this._isDisposed = !1);
		}
		dispose() {
			this._isDisposed || ((this._isDisposed = !0), this.clear());
		}
		get isDisposed() {
			return this._isDisposed;
		}
		clear() {
			if (this._toDispose.size !== 0)
				try {
					an(this._toDispose);
				} finally {
					this._toDispose.clear();
				}
		}
		add(t) {
			if (!t) return t;
			if (t === this)
				throw new Error("Cannot register a disposable on itself!");
			return (
				this._isDisposed
					? Ue.DISABLE_DISPOSED_WARNING ||
						console.warn(
							new Error(
								"Trying to add a disposable to a DisposableStore that has already been disposed of. The added object will be leaked!",
							).stack,
						)
					: this._toDispose.add(t),
				t
			);
		}
		deleteAndLeak(t) {
			t && this._toDispose.has(t) && this._toDispose.delete(t);
		}
	}
	class tt {
		static {
			this.None = Object.freeze({ dispose() {} });
		}
		constructor() {
			(this._store = new Ue()), this._store;
		}
		dispose() {
			this._store.dispose();
		}
		_register(t) {
			if (t === this)
				throw new Error("Cannot register a disposable on itself!");
			return this._store.add(t);
		}
	}
	class H {
		static {
			this.Undefined = new H(void 0);
		}
		constructor(t) {
			(this.element = t),
				(this.next = H.Undefined),
				(this.prev = H.Undefined);
		}
	}
	class br {
		constructor() {
			(this._first = H.Undefined),
				(this._last = H.Undefined),
				(this._size = 0);
		}
		get size() {
			return this._size;
		}
		isEmpty() {
			return this._first === H.Undefined;
		}
		clear() {
			let t = this._first;
			for (; t !== H.Undefined; ) {
				const n = t.next;
				(t.prev = H.Undefined), (t.next = H.Undefined), (t = n);
			}
			(this._first = H.Undefined),
				(this._last = H.Undefined),
				(this._size = 0);
		}
		unshift(t) {
			return this._insert(t, !1);
		}
		push(t) {
			return this._insert(t, !0);
		}
		_insert(t, n) {
			const s = new H(t);
			if (this._first === H.Undefined)
				(this._first = s), (this._last = s);
			else if (n) {
				const i = this._last;
				(this._last = s), (s.prev = i), (i.next = s);
			} else {
				const i = this._first;
				(this._first = s), (s.next = i), (i.prev = s);
			}
			this._size += 1;
			let r = !1;
			return () => {
				r || ((r = !0), this._remove(s));
			};
		}
		shift() {
			if (this._first !== H.Undefined) {
				const t = this._first.element;
				return this._remove(this._first), t;
			}
		}
		pop() {
			if (this._last !== H.Undefined) {
				const t = this._last.element;
				return this._remove(this._last), t;
			}
		}
		_remove(t) {
			if (t.prev !== H.Undefined && t.next !== H.Undefined) {
				const n = t.prev;
				(n.next = t.next), (t.next.prev = n);
			} else
				t.prev === H.Undefined && t.next === H.Undefined
					? ((this._first = H.Undefined), (this._last = H.Undefined))
					: t.next === H.Undefined
						? ((this._last = this._last.prev),
							(this._last.next = H.Undefined))
						: t.prev === H.Undefined &&
							((this._first = this._first.next),
							(this._first.prev = H.Undefined));
			this._size -= 1;
		}
		*[Symbol.iterator]() {
			let t = this._first;
			for (; t !== H.Undefined; ) yield t.element, (t = t.next);
		}
	}
	const _r =
		globalThis.performance &&
		typeof globalThis.performance.now == "function";
	class nt {
		static create(t) {
			return new nt(t);
		}
		constructor(t) {
			(this._now =
				_r && t === !1
					? Date.now
					: globalThis.performance.now.bind(globalThis.performance)),
				(this._startTime = this._now()),
				(this._stopTime = -1);
		}
		stop() {
			this._stopTime = this._now();
		}
		reset() {
			(this._startTime = this._now()), (this._stopTime = -1);
		}
		elapsed() {
			return this._stopTime !== -1
				? this._stopTime - this._startTime
				: this._now() - this._startTime;
		}
	}
	var Nt;
	(function (e) {
		e.None = () => tt.None;
		function t(x, L) {
			return h(x, () => {}, 0, void 0, !0, void 0, L);
		}
		e.defer = t;
		function n(x) {
			return (L, E = null, R) => {
				let F = !1,
					T;
				return (
					(T = x(
						(U) => {
							if (!F)
								return T ? T.dispose() : (F = !0), L.call(E, U);
						},
						null,
						R,
					)),
					F && T.dispose(),
					T
				);
			};
		}
		e.once = n;
		function s(x, L, E) {
			return c((R, F = null, T) => x((U) => R.call(F, L(U)), null, T), E);
		}
		e.map = s;
		function r(x, L, E) {
			return c(
				(R, F = null, T) =>
					x(
						(U) => {
							L(U), R.call(F, U);
						},
						null,
						T,
					),
				E,
			);
		}
		e.forEach = r;
		function i(x, L, E) {
			return c(
				(R, F = null, T) => x((U) => L(U) && R.call(F, U), null, T),
				E,
			);
		}
		e.filter = i;
		function o(x) {
			return x;
		}
		e.signal = o;
		function l(...x) {
			return (L, E = null, R) => {
				const F = gr(...x.map((T) => T((U) => L.call(E, U))));
				return f(F, R);
			};
		}
		e.any = l;
		function u(x, L, E, R) {
			let F = E;
			return s(x, (T) => ((F = L(F, T)), F), R);
		}
		e.reduce = u;
		function c(x, L) {
			let E;
			const R = {
					onWillAddFirstListener() {
						E = x(F.fire, F);
					},
					onDidRemoveLastListener() {
						E?.dispose();
					},
				},
				F = new ae(R);
			return L?.add(F), F.event;
		}
		function f(x, L) {
			return L instanceof Array ? L.push(x) : L && L.add(x), x;
		}
		function h(x, L, E = 100, R = !1, F = !1, T, U) {
			let J,
				Y,
				qe,
				wt = 0,
				Ye;
			const U1 = {
					leakWarningThreshold: T,
					onWillAddFirstListener() {
						J = x((H1) => {
							wt++,
								(Y = L(Y, H1)),
								R && !qe && (Lt.fire(Y), (Y = void 0)),
								(Ye = () => {
									const W1 = Y;
									(Y = void 0),
										(qe = void 0),
										(!R || wt > 1) && Lt.fire(W1),
										(wt = 0);
								}),
								typeof E == "number"
									? (clearTimeout(qe),
										(qe = setTimeout(Ye, E)))
									: qe === void 0 &&
										((qe = 0), queueMicrotask(Ye));
						});
					},
					onWillRemoveListener() {
						F && wt > 0 && Ye?.();
					},
					onDidRemoveLastListener() {
						(Ye = void 0), J.dispose();
					},
				},
				Lt = new ae(U1);
			return U?.add(Lt), Lt.event;
		}
		e.debounce = h;
		function d(x, L = 0, E) {
			return e.debounce(
				x,
				(R, F) => (R ? (R.push(F), R) : [F]),
				L,
				void 0,
				!0,
				void 0,
				E,
			);
		}
		e.accumulate = d;
		function m(x, L = (R, F) => R === F, E) {
			let R = !0,
				F;
			return i(
				x,
				(T) => {
					const U = R || !L(T, F);
					return (R = !1), (F = T), U;
				},
				E,
			);
		}
		e.latch = m;
		function g(x, L, E) {
			return [e.filter(x, L, E), e.filter(x, (R) => !L(R), E)];
		}
		e.split = g;
		function b(x, L = !1, E = [], R) {
			let F = E.slice(),
				T = x((Y) => {
					F ? F.push(Y) : J.fire(Y);
				});
			R && R.add(T);
			const U = () => {
					F?.forEach((Y) => J.fire(Y)), (F = null);
				},
				J = new ae({
					onWillAddFirstListener() {
						T || ((T = x((Y) => J.fire(Y))), R && R.add(T));
					},
					onDidAddFirstListener() {
						F && (L ? setTimeout(U) : U());
					},
					onDidRemoveLastListener() {
						T && T.dispose(), (T = null);
					},
				});
			return R && R.add(J), J.event;
		}
		e.buffer = b;
		function w(x, L) {
			return (R, F, T) => {
				const U = L(new C());
				return x(
					function (J) {
						const Y = U.evaluate(J);
						Y !== v && R.call(F, Y);
					},
					void 0,
					T,
				);
			};
		}
		e.chain = w;
		const v = Symbol("HaltChainable");
		class C {
			constructor() {
				this.steps = [];
			}
			map(L) {
				return this.steps.push(L), this;
			}
			forEach(L) {
				return this.steps.push((E) => (L(E), E)), this;
			}
			filter(L) {
				return this.steps.push((E) => (L(E) ? E : v)), this;
			}
			reduce(L, E) {
				let R = E;
				return this.steps.push((F) => ((R = L(R, F)), R)), this;
			}
			latch(L = (E, R) => E === R) {
				let E = !0,
					R;
				return (
					this.steps.push((F) => {
						const T = E || !L(F, R);
						return (E = !1), (R = F), T ? F : v;
					}),
					this
				);
			}
			evaluate(L) {
				for (const E of this.steps) if (((L = E(L)), L === v)) break;
				return L;
			}
		}
		function S(x, L, E = (R) => R) {
			const R = (...J) => U.fire(E(...J)),
				F = () => x.on(L, R),
				T = () => x.removeListener(L, R),
				U = new ae({
					onWillAddFirstListener: F,
					onDidRemoveLastListener: T,
				});
			return U.event;
		}
		e.fromNodeEventEmitter = S;
		function p(x, L, E = (R) => R) {
			const R = (...J) => U.fire(E(...J)),
				F = () => x.addEventListener(L, R),
				T = () => x.removeEventListener(L, R),
				U = new ae({
					onWillAddFirstListener: F,
					onDidRemoveLastListener: T,
				});
			return U.event;
		}
		e.fromDOMEventEmitter = p;
		function _(x) {
			return new Promise((L) => n(x)(L));
		}
		e.toPromise = _;
		function N(x) {
			const L = new ae();
			return (
				x
					.then(
						(E) => {
							L.fire(E);
						},
						() => {
							L.fire(void 0);
						},
					)
					.finally(() => {
						L.dispose();
					}),
				L.event
			);
		}
		e.fromPromise = N;
		function A(x, L) {
			return x((E) => L.fire(E));
		}
		e.forward = A;
		function y(x, L, E) {
			return L(E), x((R) => L(R));
		}
		e.runAndSubscribe = y;
		class I {
			constructor(L, E) {
				(this._observable = L),
					(this._counter = 0),
					(this._hasChanged = !1);
				const R = {
					onWillAddFirstListener: () => {
						L.addObserver(this);
					},
					onDidRemoveLastListener: () => {
						L.removeObserver(this);
					},
				};
				(this.emitter = new ae(R)), E && E.add(this.emitter);
			}
			beginUpdate(L) {
				this._counter++;
			}
			handlePossibleChange(L) {}
			handleChange(L, E) {
				this._hasChanged = !0;
			}
			endUpdate(L) {
				this._counter--,
					this._counter === 0 &&
						(this._observable.reportChanges(),
						this._hasChanged &&
							((this._hasChanged = !1),
							this.emitter.fire(this._observable.get())));
			}
		}
		function X(x, L) {
			return new I(x, L).emitter.event;
		}
		e.fromObservable = X;
		function B(x) {
			return (L, E, R) => {
				let F = 0,
					T = !1;
				const U = {
					beginUpdate() {
						F++;
					},
					endUpdate() {
						F--,
							F === 0 &&
								(x.reportChanges(), T && ((T = !1), L.call(E)));
					},
					handlePossibleChange() {},
					handleChange() {
						T = !0;
					},
				};
				x.addObserver(U), x.reportChanges();
				const J = {
					dispose() {
						x.removeObserver(U);
					},
				};
				return (
					R instanceof Ue ? R.add(J) : Array.isArray(R) && R.push(J),
					J
				);
			};
		}
		e.fromObservableLight = B;
	})(Nt || (Nt = {}));
	class st {
		static {
			this.all = new Set();
		}
		static {
			this._idPool = 0;
		}
		constructor(t) {
			(this.listenerCount = 0),
				(this.invocationCount = 0),
				(this.elapsedOverall = 0),
				(this.durations = []),
				(this.name = `${t}_${st._idPool++}`),
				st.all.add(this);
		}
		start(t) {
			(this._stopWatch = new nt()), (this.listenerCount = t);
		}
		stop() {
			if (this._stopWatch) {
				const t = this._stopWatch.elapsed();
				this.durations.push(t),
					(this.elapsedOverall += t),
					(this.invocationCount += 1),
					(this._stopWatch = void 0);
			}
		}
	}
	let xr = -1;
	class St {
		static {
			this._idPool = 1;
		}
		constructor(t, n, s = (St._idPool++).toString(16).padStart(3, "0")) {
			(this._errorHandler = t),
				(this.threshold = n),
				(this.name = s),
				(this._warnCountdown = 0);
		}
		dispose() {
			this._stacks?.clear();
		}
		check(t, n) {
			const s = this.threshold;
			if (s <= 0 || n < s) return;
			this._stacks || (this._stacks = new Map());
			const r = this._stacks.get(t.value) || 0;
			if (
				(this._stacks.set(t.value, r + 1),
				(this._warnCountdown -= 1),
				this._warnCountdown <= 0)
			) {
				this._warnCountdown = s * 0.5;
				const [i, o] = this.getMostFrequentStack(),
					l = `[${this.name}] potential listener LEAK detected, having ${n} listeners already. MOST frequent listener (${o}):`;
				console.warn(l), console.warn(i);
				const u = new pr(l, i);
				this._errorHandler(u);
			}
			return () => {
				const i = this._stacks.get(t.value) || 0;
				this._stacks.set(t.value, i - 1);
			};
		}
		getMostFrequentStack() {
			if (!this._stacks) return;
			let t,
				n = 0;
			for (const [s, r] of this._stacks)
				(!t || n < r) && ((t = [s, r]), (n = r));
			return t;
		}
	}
	class Ct {
		static create() {
			const t = new Error();
			return new Ct(t.stack ?? "");
		}
		constructor(t) {
			this.value = t;
		}
		print() {
			console.warn(
				this.value
					.split(`
`)
					.slice(2)
					.join(`
`),
			);
		}
	}
	class pr extends Error {
		constructor(t, n) {
			super(t), (this.name = "ListenerLeakError"), (this.stack = n);
		}
	}
	class wr extends Error {
		constructor(t, n) {
			super(t), (this.name = "ListenerRefusalError"), (this.stack = n);
		}
	}
	class At {
		constructor(t) {
			this.value = t;
		}
	}
	const Lr = 2;
	class ae {
		constructor(t) {
			(this._size = 0),
				(this._options = t),
				(this._leakageMon = this._options?.leakWarningThreshold
					? new St(
							t?.onListenerError ?? Ze,
							this._options?.leakWarningThreshold ?? xr,
						)
					: void 0),
				(this._perfMon = this._options?._profName
					? new st(this._options._profName)
					: void 0),
				(this._deliveryQueue = this._options?.deliveryQueue);
		}
		dispose() {
			this._disposed ||
				((this._disposed = !0),
				this._deliveryQueue?.current === this &&
					this._deliveryQueue.reset(),
				this._listeners &&
					((this._listeners = void 0), (this._size = 0)),
				this._options?.onDidRemoveLastListener?.(),
				this._leakageMon?.dispose());
		}
		get event() {
			return (
				(this._event ??= (t, n, s) => {
					if (
						this._leakageMon &&
						this._size > this._leakageMon.threshold ** 2
					) {
						const l = `[${this._leakageMon.name}] REFUSES to accept new listeners because it exceeded its threshold by far (${this._size} vs ${this._leakageMon.threshold})`;
						console.warn(l);
						const u = this._leakageMon.getMostFrequentStack() ?? [
								"UNKNOWN stack",
								-1,
							],
							c = new wr(
								`${l}. HINT: Stack shows most frequent listener (${u[1]}-times)`,
								u[0],
							);
						return (
							(this._options?.onListenerError || Ze)(c), tt.None
						);
					}
					if (this._disposed) return tt.None;
					n && (t = t.bind(n));
					const r = new At(t);
					let i;
					this._leakageMon &&
						this._size >=
							Math.ceil(this._leakageMon.threshold * 0.2) &&
						((r.stack = Ct.create()),
						(i = this._leakageMon.check(r.stack, this._size + 1))),
						this._listeners
							? this._listeners instanceof At
								? ((this._deliveryQueue ??= new vr()),
									(this._listeners = [this._listeners, r]))
								: this._listeners.push(r)
							: (this._options?.onWillAddFirstListener?.(this),
								(this._listeners = r),
								this._options?.onDidAddFirstListener?.(this)),
						this._size++;
					const o = et(() => {
						i?.(), this._removeListener(r);
					});
					return (
						s instanceof Ue
							? s.add(o)
							: Array.isArray(s) && s.push(o),
						o
					);
				}),
				this._event
			);
		}
		_removeListener(t) {
			if ((this._options?.onWillRemoveListener?.(this), !this._listeners))
				return;
			if (this._size === 1) {
				(this._listeners = void 0),
					this._options?.onDidRemoveLastListener?.(this),
					(this._size = 0);
				return;
			}
			const n = this._listeners,
				s = n.indexOf(t);
			if (s === -1)
				throw (
					(console.log("disposed?", this._disposed),
					console.log("size?", this._size),
					console.log("arr?", JSON.stringify(this._listeners)),
					new Error("Attempted to dispose unknown listener"))
				);
			this._size--, (n[s] = void 0);
			const r = this._deliveryQueue.current === this;
			if (this._size * Lr <= n.length) {
				let i = 0;
				for (let o = 0; o < n.length; o++)
					n[o]
						? (n[i++] = n[o])
						: r &&
							(this._deliveryQueue.end--,
							i < this._deliveryQueue.i &&
								this._deliveryQueue.i--);
				n.length = i;
			}
		}
		_deliver(t, n) {
			if (!t) return;
			const s = this._options?.onListenerError || Ze;
			if (!s) {
				t.value(n);
				return;
			}
			try {
				t.value(n);
			} catch (r) {
				s(r);
			}
		}
		_deliverQueue(t) {
			const n = t.current._listeners;
			for (; t.i < t.end; ) this._deliver(n[t.i++], t.value);
			t.reset();
		}
		fire(t) {
			if (
				(this._deliveryQueue?.current &&
					(this._deliverQueue(this._deliveryQueue),
					this._perfMon?.stop()),
				this._perfMon?.start(this._size),
				this._listeners)
			)
				if (this._listeners instanceof At)
					this._deliver(this._listeners, t);
				else {
					const n = this._deliveryQueue;
					n.enqueue(this, t, this._listeners.length),
						this._deliverQueue(n);
				}
			this._perfMon?.stop();
		}
		hasListeners() {
			return this._size > 0;
		}
	}
	class vr {
		constructor() {
			(this.i = -1), (this.end = 0);
		}
		enqueue(t, n, s) {
			(this.i = 0), (this.end = s), (this.current = t), (this.value = n);
		}
		reset() {
			(this.i = this.end), (this.current = void 0), (this.value = void 0);
		}
	}
	function Nr(e) {
		return typeof e == "string";
	}
	function Sr(e) {
		let t = [];
		for (; Object.prototype !== e; )
			(t = t.concat(Object.getOwnPropertyNames(e))),
				(e = Object.getPrototypeOf(e));
		return t;
	}
	function Rt(e) {
		const t = [];
		for (const n of Sr(e)) typeof e[n] == "function" && t.push(n);
		return t;
	}
	function Cr(e, t) {
		const n = (r) =>
				function () {
					const i = Array.prototype.slice.call(arguments, 0);
					return t(r, i);
				},
			s = {};
		for (const r of e) s[r] = n(r);
		return s;
	}
	const ye = "en";
	let yt = !1,
		Et = !1,
		Mt = !1,
		rt,
		kt = ye,
		on = ye,
		Ar,
		fe;
	const Se = globalThis;
	let ne;
	typeof Se.vscode < "u" && typeof Se.vscode.process < "u"
		? (ne = Se.vscode.process)
		: typeof process < "u" &&
			typeof process?.versions?.node == "string" &&
			(ne = process);
	const Rr =
		typeof ne?.versions?.electron == "string" && ne?.type === "renderer";
	if (typeof ne == "object") {
		(yt = ne.platform === "win32"),
			(Et = ne.platform === "darwin"),
			(Mt = ne.platform === "linux"),
			Mt && ne.env.SNAP && ne.env.SNAP_REVISION,
			ne.env.CI || ne.env.BUILD_ARTIFACTSTAGINGDIRECTORY,
			(rt = ye),
			(kt = ye);
		const e = ne.env.VSCODE_NLS_CONFIG;
		if (e)
			try {
				const t = JSON.parse(e);
				(rt = t.userLocale),
					(on = t.osLocale),
					(kt = t.resolvedLanguage || ye),
					(Ar = t.languagePack?.translationsConfigFile);
			} catch {}
	} else
		typeof navigator == "object" && !Rr
			? ((fe = navigator.userAgent),
				(yt = fe.indexOf("Windows") >= 0),
				(Et = fe.indexOf("Macintosh") >= 0),
				(fe.indexOf("Macintosh") >= 0 ||
					fe.indexOf("iPad") >= 0 ||
					fe.indexOf("iPhone") >= 0) &&
					navigator.maxTouchPoints &&
					navigator.maxTouchPoints > 0,
				(Mt = fe.indexOf("Linux") >= 0),
				fe?.indexOf("Mobi") >= 0,
				(kt = globalThis._VSCODE_NLS_LANGUAGE || ye),
				(rt = navigator.language.toLowerCase()),
				(on = rt))
			: console.error("Unable to resolve platform.");
	const He = yt,
		yr = Et,
		ce = fe,
		Er = typeof Se.postMessage == "function" && !Se.importScripts;
	(() => {
		if (Er) {
			const e = [];
			Se.addEventListener("message", (n) => {
				if (n.data && n.data.vscodeScheduleAsyncWork)
					for (let s = 0, r = e.length; s < r; s++) {
						const i = e[s];
						if (i.id === n.data.vscodeScheduleAsyncWork) {
							e.splice(s, 1), i.callback();
							return;
						}
					}
			});
			let t = 0;
			return (n) => {
				const s = ++t;
				e.push({ id: s, callback: n }),
					Se.postMessage({ vscodeScheduleAsyncWork: s }, "*");
			};
		}
		return (e) => setTimeout(e);
	})();
	const Mr = !!(ce && ce.indexOf("Chrome") >= 0);
	ce && ce.indexOf("Firefox") >= 0,
		!Mr && ce && ce.indexOf("Safari") >= 0,
		ce && ce.indexOf("Edg/") >= 0,
		ce && ce.indexOf("Android") >= 0;
	function kr(e) {
		return e;
	}
	class Fr {
		constructor(t, n) {
			(this.lastCache = void 0),
				(this.lastArgKey = void 0),
				typeof t == "function"
					? ((this._fn = t), (this._computeKey = kr))
					: ((this._fn = n), (this._computeKey = t.getCacheKey));
		}
		get(t) {
			const n = this._computeKey(t);
			return (
				this.lastArgKey !== n &&
					((this.lastArgKey = n), (this.lastCache = this._fn(t))),
				this.lastCache
			);
		}
	}
	class ln {
		constructor(t) {
			(this.executor = t), (this._didRun = !1);
		}
		get value() {
			if (!this._didRun)
				try {
					this._value = this.executor();
				} catch (t) {
					this._error = t;
				} finally {
					this._didRun = !0;
				}
			if (this._error) throw this._error;
			return this._value;
		}
		get rawValue() {
			return this._value;
		}
	}
	function Dr(e) {
		return e.replace(/[\\\{\}\*\+\?\|\^\$\.\[\]\(\)]/g, "\\$&");
	}
	function Pr(e) {
		return e.split(/\r\n|\r|\n/);
	}
	function Tr(e) {
		for (let t = 0, n = e.length; t < n; t++) {
			const s = e.charCodeAt(t);
			if (s !== 32 && s !== 9) return t;
		}
		return -1;
	}
	function Vr(e, t = e.length - 1) {
		for (let n = t; n >= 0; n--) {
			const s = e.charCodeAt(n);
			if (s !== 32 && s !== 9) return n;
		}
		return -1;
	}
	function un(e) {
		return e >= 65 && e <= 90;
	}
	function it(e) {
		return 55296 <= e && e <= 56319;
	}
	function Ft(e) {
		return 56320 <= e && e <= 57343;
	}
	function cn(e, t) {
		return ((e - 55296) << 10) + (t - 56320) + 65536;
	}
	function Ir(e, t, n) {
		const s = e.charCodeAt(n);
		if (it(s) && n + 1 < t) {
			const r = e.charCodeAt(n + 1);
			if (Ft(r)) return cn(s, r);
		}
		return s;
	}
	const Br = /^[\t\n\r\x20-\x7E]*$/;
	function qr(e) {
		return Br.test(e);
	}
	class ge {
		static {
			this.ambiguousCharacterData = new ln(() =>
				JSON.parse(
					'{"_common":[8232,32,8233,32,5760,32,8192,32,8193,32,8194,32,8195,32,8196,32,8197,32,8198,32,8200,32,8201,32,8202,32,8287,32,8199,32,8239,32,2042,95,65101,95,65102,95,65103,95,8208,45,8209,45,8210,45,65112,45,1748,45,8259,45,727,45,8722,45,10134,45,11450,45,1549,44,1643,44,8218,44,184,44,42233,44,894,59,2307,58,2691,58,1417,58,1795,58,1796,58,5868,58,65072,58,6147,58,6153,58,8282,58,1475,58,760,58,42889,58,8758,58,720,58,42237,58,451,33,11601,33,660,63,577,63,2429,63,5038,63,42731,63,119149,46,8228,46,1793,46,1794,46,42510,46,68176,46,1632,46,1776,46,42232,46,1373,96,65287,96,8219,96,8242,96,1370,96,1523,96,8175,96,65344,96,900,96,8189,96,8125,96,8127,96,8190,96,697,96,884,96,712,96,714,96,715,96,756,96,699,96,701,96,700,96,702,96,42892,96,1497,96,2036,96,2037,96,5194,96,5836,96,94033,96,94034,96,65339,91,10088,40,10098,40,12308,40,64830,40,65341,93,10089,41,10099,41,12309,41,64831,41,10100,123,119060,123,10101,125,65342,94,8270,42,1645,42,8727,42,66335,42,5941,47,8257,47,8725,47,8260,47,9585,47,10187,47,10744,47,119354,47,12755,47,12339,47,11462,47,20031,47,12035,47,65340,92,65128,92,8726,92,10189,92,10741,92,10745,92,119311,92,119355,92,12756,92,20022,92,12034,92,42872,38,708,94,710,94,5869,43,10133,43,66203,43,8249,60,10094,60,706,60,119350,60,5176,60,5810,60,5120,61,11840,61,12448,61,42239,61,8250,62,10095,62,707,62,119351,62,5171,62,94015,62,8275,126,732,126,8128,126,8764,126,65372,124,65293,45,120784,50,120794,50,120804,50,120814,50,120824,50,130034,50,42842,50,423,50,1000,50,42564,50,5311,50,42735,50,119302,51,120785,51,120795,51,120805,51,120815,51,120825,51,130035,51,42923,51,540,51,439,51,42858,51,11468,51,1248,51,94011,51,71882,51,120786,52,120796,52,120806,52,120816,52,120826,52,130036,52,5070,52,71855,52,120787,53,120797,53,120807,53,120817,53,120827,53,130037,53,444,53,71867,53,120788,54,120798,54,120808,54,120818,54,120828,54,130038,54,11474,54,5102,54,71893,54,119314,55,120789,55,120799,55,120809,55,120819,55,120829,55,130039,55,66770,55,71878,55,2819,56,2538,56,2666,56,125131,56,120790,56,120800,56,120810,56,120820,56,120830,56,130040,56,547,56,546,56,66330,56,2663,57,2920,57,2541,57,3437,57,120791,57,120801,57,120811,57,120821,57,120831,57,130041,57,42862,57,11466,57,71884,57,71852,57,71894,57,9082,97,65345,97,119834,97,119886,97,119938,97,119990,97,120042,97,120094,97,120146,97,120198,97,120250,97,120302,97,120354,97,120406,97,120458,97,593,97,945,97,120514,97,120572,97,120630,97,120688,97,120746,97,65313,65,119808,65,119860,65,119912,65,119964,65,120016,65,120068,65,120120,65,120172,65,120224,65,120276,65,120328,65,120380,65,120432,65,913,65,120488,65,120546,65,120604,65,120662,65,120720,65,5034,65,5573,65,42222,65,94016,65,66208,65,119835,98,119887,98,119939,98,119991,98,120043,98,120095,98,120147,98,120199,98,120251,98,120303,98,120355,98,120407,98,120459,98,388,98,5071,98,5234,98,5551,98,65314,66,8492,66,119809,66,119861,66,119913,66,120017,66,120069,66,120121,66,120173,66,120225,66,120277,66,120329,66,120381,66,120433,66,42932,66,914,66,120489,66,120547,66,120605,66,120663,66,120721,66,5108,66,5623,66,42192,66,66178,66,66209,66,66305,66,65347,99,8573,99,119836,99,119888,99,119940,99,119992,99,120044,99,120096,99,120148,99,120200,99,120252,99,120304,99,120356,99,120408,99,120460,99,7428,99,1010,99,11429,99,43951,99,66621,99,128844,67,71922,67,71913,67,65315,67,8557,67,8450,67,8493,67,119810,67,119862,67,119914,67,119966,67,120018,67,120174,67,120226,67,120278,67,120330,67,120382,67,120434,67,1017,67,11428,67,5087,67,42202,67,66210,67,66306,67,66581,67,66844,67,8574,100,8518,100,119837,100,119889,100,119941,100,119993,100,120045,100,120097,100,120149,100,120201,100,120253,100,120305,100,120357,100,120409,100,120461,100,1281,100,5095,100,5231,100,42194,100,8558,68,8517,68,119811,68,119863,68,119915,68,119967,68,120019,68,120071,68,120123,68,120175,68,120227,68,120279,68,120331,68,120383,68,120435,68,5024,68,5598,68,5610,68,42195,68,8494,101,65349,101,8495,101,8519,101,119838,101,119890,101,119942,101,120046,101,120098,101,120150,101,120202,101,120254,101,120306,101,120358,101,120410,101,120462,101,43826,101,1213,101,8959,69,65317,69,8496,69,119812,69,119864,69,119916,69,120020,69,120072,69,120124,69,120176,69,120228,69,120280,69,120332,69,120384,69,120436,69,917,69,120492,69,120550,69,120608,69,120666,69,120724,69,11577,69,5036,69,42224,69,71846,69,71854,69,66182,69,119839,102,119891,102,119943,102,119995,102,120047,102,120099,102,120151,102,120203,102,120255,102,120307,102,120359,102,120411,102,120463,102,43829,102,42905,102,383,102,7837,102,1412,102,119315,70,8497,70,119813,70,119865,70,119917,70,120021,70,120073,70,120125,70,120177,70,120229,70,120281,70,120333,70,120385,70,120437,70,42904,70,988,70,120778,70,5556,70,42205,70,71874,70,71842,70,66183,70,66213,70,66853,70,65351,103,8458,103,119840,103,119892,103,119944,103,120048,103,120100,103,120152,103,120204,103,120256,103,120308,103,120360,103,120412,103,120464,103,609,103,7555,103,397,103,1409,103,119814,71,119866,71,119918,71,119970,71,120022,71,120074,71,120126,71,120178,71,120230,71,120282,71,120334,71,120386,71,120438,71,1292,71,5056,71,5107,71,42198,71,65352,104,8462,104,119841,104,119945,104,119997,104,120049,104,120101,104,120153,104,120205,104,120257,104,120309,104,120361,104,120413,104,120465,104,1211,104,1392,104,5058,104,65320,72,8459,72,8460,72,8461,72,119815,72,119867,72,119919,72,120023,72,120179,72,120231,72,120283,72,120335,72,120387,72,120439,72,919,72,120494,72,120552,72,120610,72,120668,72,120726,72,11406,72,5051,72,5500,72,42215,72,66255,72,731,105,9075,105,65353,105,8560,105,8505,105,8520,105,119842,105,119894,105,119946,105,119998,105,120050,105,120102,105,120154,105,120206,105,120258,105,120310,105,120362,105,120414,105,120466,105,120484,105,618,105,617,105,953,105,8126,105,890,105,120522,105,120580,105,120638,105,120696,105,120754,105,1110,105,42567,105,1231,105,43893,105,5029,105,71875,105,65354,106,8521,106,119843,106,119895,106,119947,106,119999,106,120051,106,120103,106,120155,106,120207,106,120259,106,120311,106,120363,106,120415,106,120467,106,1011,106,1112,106,65322,74,119817,74,119869,74,119921,74,119973,74,120025,74,120077,74,120129,74,120181,74,120233,74,120285,74,120337,74,120389,74,120441,74,42930,74,895,74,1032,74,5035,74,5261,74,42201,74,119844,107,119896,107,119948,107,120000,107,120052,107,120104,107,120156,107,120208,107,120260,107,120312,107,120364,107,120416,107,120468,107,8490,75,65323,75,119818,75,119870,75,119922,75,119974,75,120026,75,120078,75,120130,75,120182,75,120234,75,120286,75,120338,75,120390,75,120442,75,922,75,120497,75,120555,75,120613,75,120671,75,120729,75,11412,75,5094,75,5845,75,42199,75,66840,75,1472,108,8739,73,9213,73,65512,73,1633,108,1777,73,66336,108,125127,108,120783,73,120793,73,120803,73,120813,73,120823,73,130033,73,65321,73,8544,73,8464,73,8465,73,119816,73,119868,73,119920,73,120024,73,120128,73,120180,73,120232,73,120284,73,120336,73,120388,73,120440,73,65356,108,8572,73,8467,108,119845,108,119897,108,119949,108,120001,108,120053,108,120105,73,120157,73,120209,73,120261,73,120313,73,120365,73,120417,73,120469,73,448,73,120496,73,120554,73,120612,73,120670,73,120728,73,11410,73,1030,73,1216,73,1493,108,1503,108,1575,108,126464,108,126592,108,65166,108,65165,108,1994,108,11599,73,5825,73,42226,73,93992,73,66186,124,66313,124,119338,76,8556,76,8466,76,119819,76,119871,76,119923,76,120027,76,120079,76,120131,76,120183,76,120235,76,120287,76,120339,76,120391,76,120443,76,11472,76,5086,76,5290,76,42209,76,93974,76,71843,76,71858,76,66587,76,66854,76,65325,77,8559,77,8499,77,119820,77,119872,77,119924,77,120028,77,120080,77,120132,77,120184,77,120236,77,120288,77,120340,77,120392,77,120444,77,924,77,120499,77,120557,77,120615,77,120673,77,120731,77,1018,77,11416,77,5047,77,5616,77,5846,77,42207,77,66224,77,66321,77,119847,110,119899,110,119951,110,120003,110,120055,110,120107,110,120159,110,120211,110,120263,110,120315,110,120367,110,120419,110,120471,110,1400,110,1404,110,65326,78,8469,78,119821,78,119873,78,119925,78,119977,78,120029,78,120081,78,120185,78,120237,78,120289,78,120341,78,120393,78,120445,78,925,78,120500,78,120558,78,120616,78,120674,78,120732,78,11418,78,42208,78,66835,78,3074,111,3202,111,3330,111,3458,111,2406,111,2662,111,2790,111,3046,111,3174,111,3302,111,3430,111,3664,111,3792,111,4160,111,1637,111,1781,111,65359,111,8500,111,119848,111,119900,111,119952,111,120056,111,120108,111,120160,111,120212,111,120264,111,120316,111,120368,111,120420,111,120472,111,7439,111,7441,111,43837,111,959,111,120528,111,120586,111,120644,111,120702,111,120760,111,963,111,120532,111,120590,111,120648,111,120706,111,120764,111,11423,111,4351,111,1413,111,1505,111,1607,111,126500,111,126564,111,126596,111,65259,111,65260,111,65258,111,65257,111,1726,111,64428,111,64429,111,64427,111,64426,111,1729,111,64424,111,64425,111,64423,111,64422,111,1749,111,3360,111,4125,111,66794,111,71880,111,71895,111,66604,111,1984,79,2534,79,2918,79,12295,79,70864,79,71904,79,120782,79,120792,79,120802,79,120812,79,120822,79,130032,79,65327,79,119822,79,119874,79,119926,79,119978,79,120030,79,120082,79,120134,79,120186,79,120238,79,120290,79,120342,79,120394,79,120446,79,927,79,120502,79,120560,79,120618,79,120676,79,120734,79,11422,79,1365,79,11604,79,4816,79,2848,79,66754,79,42227,79,71861,79,66194,79,66219,79,66564,79,66838,79,9076,112,65360,112,119849,112,119901,112,119953,112,120005,112,120057,112,120109,112,120161,112,120213,112,120265,112,120317,112,120369,112,120421,112,120473,112,961,112,120530,112,120544,112,120588,112,120602,112,120646,112,120660,112,120704,112,120718,112,120762,112,120776,112,11427,112,65328,80,8473,80,119823,80,119875,80,119927,80,119979,80,120031,80,120083,80,120187,80,120239,80,120291,80,120343,80,120395,80,120447,80,929,80,120504,80,120562,80,120620,80,120678,80,120736,80,11426,80,5090,80,5229,80,42193,80,66197,80,119850,113,119902,113,119954,113,120006,113,120058,113,120110,113,120162,113,120214,113,120266,113,120318,113,120370,113,120422,113,120474,113,1307,113,1379,113,1382,113,8474,81,119824,81,119876,81,119928,81,119980,81,120032,81,120084,81,120188,81,120240,81,120292,81,120344,81,120396,81,120448,81,11605,81,119851,114,119903,114,119955,114,120007,114,120059,114,120111,114,120163,114,120215,114,120267,114,120319,114,120371,114,120423,114,120475,114,43847,114,43848,114,7462,114,11397,114,43905,114,119318,82,8475,82,8476,82,8477,82,119825,82,119877,82,119929,82,120033,82,120189,82,120241,82,120293,82,120345,82,120397,82,120449,82,422,82,5025,82,5074,82,66740,82,5511,82,42211,82,94005,82,65363,115,119852,115,119904,115,119956,115,120008,115,120060,115,120112,115,120164,115,120216,115,120268,115,120320,115,120372,115,120424,115,120476,115,42801,115,445,115,1109,115,43946,115,71873,115,66632,115,65331,83,119826,83,119878,83,119930,83,119982,83,120034,83,120086,83,120138,83,120190,83,120242,83,120294,83,120346,83,120398,83,120450,83,1029,83,1359,83,5077,83,5082,83,42210,83,94010,83,66198,83,66592,83,119853,116,119905,116,119957,116,120009,116,120061,116,120113,116,120165,116,120217,116,120269,116,120321,116,120373,116,120425,116,120477,116,8868,84,10201,84,128872,84,65332,84,119827,84,119879,84,119931,84,119983,84,120035,84,120087,84,120139,84,120191,84,120243,84,120295,84,120347,84,120399,84,120451,84,932,84,120507,84,120565,84,120623,84,120681,84,120739,84,11430,84,5026,84,42196,84,93962,84,71868,84,66199,84,66225,84,66325,84,119854,117,119906,117,119958,117,120010,117,120062,117,120114,117,120166,117,120218,117,120270,117,120322,117,120374,117,120426,117,120478,117,42911,117,7452,117,43854,117,43858,117,651,117,965,117,120534,117,120592,117,120650,117,120708,117,120766,117,1405,117,66806,117,71896,117,8746,85,8899,85,119828,85,119880,85,119932,85,119984,85,120036,85,120088,85,120140,85,120192,85,120244,85,120296,85,120348,85,120400,85,120452,85,1357,85,4608,85,66766,85,5196,85,42228,85,94018,85,71864,85,8744,118,8897,118,65366,118,8564,118,119855,118,119907,118,119959,118,120011,118,120063,118,120115,118,120167,118,120219,118,120271,118,120323,118,120375,118,120427,118,120479,118,7456,118,957,118,120526,118,120584,118,120642,118,120700,118,120758,118,1141,118,1496,118,71430,118,43945,118,71872,118,119309,86,1639,86,1783,86,8548,86,119829,86,119881,86,119933,86,119985,86,120037,86,120089,86,120141,86,120193,86,120245,86,120297,86,120349,86,120401,86,120453,86,1140,86,11576,86,5081,86,5167,86,42719,86,42214,86,93960,86,71840,86,66845,86,623,119,119856,119,119908,119,119960,119,120012,119,120064,119,120116,119,120168,119,120220,119,120272,119,120324,119,120376,119,120428,119,120480,119,7457,119,1121,119,1309,119,1377,119,71434,119,71438,119,71439,119,43907,119,71919,87,71910,87,119830,87,119882,87,119934,87,119986,87,120038,87,120090,87,120142,87,120194,87,120246,87,120298,87,120350,87,120402,87,120454,87,1308,87,5043,87,5076,87,42218,87,5742,120,10539,120,10540,120,10799,120,65368,120,8569,120,119857,120,119909,120,119961,120,120013,120,120065,120,120117,120,120169,120,120221,120,120273,120,120325,120,120377,120,120429,120,120481,120,5441,120,5501,120,5741,88,9587,88,66338,88,71916,88,65336,88,8553,88,119831,88,119883,88,119935,88,119987,88,120039,88,120091,88,120143,88,120195,88,120247,88,120299,88,120351,88,120403,88,120455,88,42931,88,935,88,120510,88,120568,88,120626,88,120684,88,120742,88,11436,88,11613,88,5815,88,42219,88,66192,88,66228,88,66327,88,66855,88,611,121,7564,121,65369,121,119858,121,119910,121,119962,121,120014,121,120066,121,120118,121,120170,121,120222,121,120274,121,120326,121,120378,121,120430,121,120482,121,655,121,7935,121,43866,121,947,121,8509,121,120516,121,120574,121,120632,121,120690,121,120748,121,1199,121,4327,121,71900,121,65337,89,119832,89,119884,89,119936,89,119988,89,120040,89,120092,89,120144,89,120196,89,120248,89,120300,89,120352,89,120404,89,120456,89,933,89,978,89,120508,89,120566,89,120624,89,120682,89,120740,89,11432,89,1198,89,5033,89,5053,89,42220,89,94019,89,71844,89,66226,89,119859,122,119911,122,119963,122,120015,122,120067,122,120119,122,120171,122,120223,122,120275,122,120327,122,120379,122,120431,122,120483,122,7458,122,43923,122,71876,122,66293,90,71909,90,65338,90,8484,90,8488,90,119833,90,119885,90,119937,90,119989,90,120041,90,120197,90,120249,90,120301,90,120353,90,120405,90,120457,90,918,90,120493,90,120551,90,120609,90,120667,90,120725,90,5059,90,42204,90,71849,90,65282,34,65284,36,65285,37,65286,38,65290,42,65291,43,65294,46,65295,47,65296,48,65297,49,65298,50,65299,51,65300,52,65301,53,65302,54,65303,55,65304,56,65305,57,65308,60,65309,61,65310,62,65312,64,65316,68,65318,70,65319,71,65324,76,65329,81,65330,82,65333,85,65334,86,65335,87,65343,95,65346,98,65348,100,65350,102,65355,107,65357,109,65358,110,65361,113,65362,114,65364,116,65365,117,65367,119,65370,122,65371,123,65373,125,119846,109],"_default":[160,32,8211,45,65374,126,65306,58,65281,33,8216,96,8217,96,8245,96,180,96,12494,47,1047,51,1073,54,1072,97,1040,65,1068,98,1042,66,1089,99,1057,67,1077,101,1045,69,1053,72,305,105,1050,75,921,73,1052,77,1086,111,1054,79,1009,112,1088,112,1056,80,1075,114,1058,84,215,120,1093,120,1061,88,1091,121,1059,89,65283,35,65288,40,65289,41,65292,44,65307,59,65311,63],"cs":[65374,126,65306,58,65281,33,8216,96,8217,96,8245,96,180,96,12494,47,1047,51,1073,54,1072,97,1040,65,1068,98,1042,66,1089,99,1057,67,1077,101,1045,69,1053,72,305,105,1050,75,921,73,1052,77,1086,111,1054,79,1009,112,1088,112,1056,80,1075,114,1058,84,1093,120,1061,88,1091,121,1059,89,65283,35,65288,40,65289,41,65292,44,65307,59,65311,63],"de":[65374,126,65306,58,65281,33,8216,96,8217,96,8245,96,180,96,12494,47,1047,51,1073,54,1072,97,1040,65,1068,98,1042,66,1089,99,1057,67,1077,101,1045,69,1053,72,305,105,1050,75,921,73,1052,77,1086,111,1054,79,1009,112,1088,112,1056,80,1075,114,1058,84,1093,120,1061,88,1091,121,1059,89,65283,35,65288,40,65289,41,65292,44,65307,59,65311,63],"es":[8211,45,65374,126,65306,58,65281,33,8245,96,180,96,12494,47,1047,51,1073,54,1072,97,1040,65,1068,98,1042,66,1089,99,1057,67,1077,101,1045,69,1053,72,305,105,1050,75,1052,77,1086,111,1054,79,1009,112,1088,112,1056,80,1075,114,1058,84,215,120,1093,120,1061,88,1091,121,1059,89,65283,35,65288,40,65289,41,65292,44,65307,59,65311,63],"fr":[65374,126,65306,58,65281,33,8216,96,8245,96,12494,47,1047,51,1073,54,1072,97,1040,65,1068,98,1042,66,1089,99,1057,67,1077,101,1045,69,1053,72,305,105,1050,75,921,73,1052,77,1086,111,1054,79,1009,112,1088,112,1056,80,1075,114,1058,84,215,120,1093,120,1061,88,1091,121,1059,89,65283,35,65288,40,65289,41,65292,44,65307,59,65311,63],"it":[160,32,8211,45,65374,126,65306,58,65281,33,8216,96,8245,96,180,96,12494,47,1047,51,1073,54,1072,97,1040,65,1068,98,1042,66,1089,99,1057,67,1077,101,1045,69,1053,72,305,105,1050,75,921,73,1052,77,1086,111,1054,79,1009,112,1088,112,1056,80,1075,114,1058,84,215,120,1093,120,1061,88,1091,121,1059,89,65283,35,65288,40,65289,41,65292,44,65307,59,65311,63],"ja":[8211,45,65306,58,65281,33,8216,96,8217,96,8245,96,180,96,1047,51,1073,54,1072,97,1040,65,1068,98,1042,66,1089,99,1057,67,1077,101,1045,69,1053,72,305,105,1050,75,921,73,1052,77,1086,111,1054,79,1009,112,1088,112,1056,80,1075,114,1058,84,215,120,1093,120,1061,88,1091,121,1059,89,65283,35,65292,44,65307,59],"ko":[8211,45,65374,126,65306,58,65281,33,8245,96,180,96,12494,47,1047,51,1073,54,1072,97,1040,65,1068,98,1042,66,1089,99,1057,67,1077,101,1045,69,1053,72,305,105,1050,75,921,73,1052,77,1086,111,1054,79,1009,112,1088,112,1056,80,1075,114,1058,84,215,120,1093,120,1061,88,1091,121,1059,89,65283,35,65288,40,65289,41,65292,44,65307,59,65311,63],"pl":[65374,126,65306,58,65281,33,8216,96,8217,96,8245,96,180,96,12494,47,1047,51,1073,54,1072,97,1040,65,1068,98,1042,66,1089,99,1057,67,1077,101,1045,69,1053,72,305,105,1050,75,921,73,1052,77,1086,111,1054,79,1009,112,1088,112,1056,80,1075,114,1058,84,215,120,1093,120,1061,88,1091,121,1059,89,65283,35,65288,40,65289,41,65292,44,65307,59,65311,63],"pt-BR":[65374,126,65306,58,65281,33,8216,96,8217,96,8245,96,180,96,12494,47,1047,51,1073,54,1072,97,1040,65,1068,98,1042,66,1089,99,1057,67,1077,101,1045,69,1053,72,305,105,1050,75,921,73,1052,77,1086,111,1054,79,1009,112,1088,112,1056,80,1075,114,1058,84,215,120,1093,120,1061,88,1091,121,1059,89,65283,35,65288,40,65289,41,65292,44,65307,59,65311,63],"qps-ploc":[160,32,8211,45,65374,126,65306,58,65281,33,8216,96,8217,96,8245,96,180,96,12494,47,1047,51,1073,54,1072,97,1040,65,1068,98,1042,66,1089,99,1057,67,1077,101,1045,69,1053,72,305,105,1050,75,921,73,1052,77,1086,111,1054,79,1088,112,1056,80,1075,114,1058,84,215,120,1093,120,1061,88,1091,121,1059,89,65283,35,65288,40,65289,41,65292,44,65307,59,65311,63],"ru":[65374,126,65306,58,65281,33,8216,96,8217,96,8245,96,180,96,12494,47,305,105,921,73,1009,112,215,120,65283,35,65288,40,65289,41,65292,44,65307,59,65311,63],"tr":[160,32,8211,45,65374,126,65306,58,65281,33,8245,96,180,96,12494,47,1047,51,1073,54,1072,97,1040,65,1068,98,1042,66,1089,99,1057,67,1077,101,1045,69,1053,72,1050,75,921,73,1052,77,1086,111,1054,79,1009,112,1088,112,1056,80,1075,114,1058,84,215,120,1093,120,1061,88,1091,121,1059,89,65283,35,65288,40,65289,41,65292,44,65307,59,65311,63],"zh-hans":[65374,126,65306,58,65281,33,8245,96,180,96,12494,47,1047,51,1073,54,1072,97,1040,65,1068,98,1042,66,1089,99,1057,67,1077,101,1045,69,1053,72,305,105,1050,75,921,73,1052,77,1086,111,1054,79,1009,112,1088,112,1056,80,1075,114,1058,84,215,120,1093,120,1061,88,1091,121,1059,89,65288,40,65289,41],"zh-hant":[8211,45,65374,126,180,96,12494,47,1047,51,1073,54,1072,97,1040,65,1068,98,1042,66,1089,99,1057,67,1077,101,1045,69,1053,72,305,105,1050,75,921,73,1052,77,1086,111,1054,79,1009,112,1088,112,1056,80,1075,114,1058,84,215,120,1093,120,1061,88,1091,121,1059,89,65283,35,65307,59]}',
				),
			);
		}
		static {
			this.cache = new Fr({ getCacheKey: JSON.stringify }, (t) => {
				function n(f) {
					const h = new Map();
					for (let d = 0; d < f.length; d += 2) h.set(f[d], f[d + 1]);
					return h;
				}
				function s(f, h) {
					const d = new Map(f);
					for (const [m, g] of h) d.set(m, g);
					return d;
				}
				function r(f, h) {
					if (!f) return h;
					const d = new Map();
					for (const [m, g] of f) h.has(m) && d.set(m, g);
					return d;
				}
				const i = this.ambiguousCharacterData.value;
				let o = t.filter((f) => !f.startsWith("_") && f in i);
				o.length === 0 && (o = ["_default"]);
				let l;
				for (const f of o) {
					const h = n(i[f]);
					l = r(l, h);
				}
				const u = n(i._common),
					c = s(u, l);
				return new ge(c);
			});
		}
		static getInstance(t) {
			return ge.cache.get(Array.from(t));
		}
		static {
			this._locales = new ln(() =>
				Object.keys(ge.ambiguousCharacterData.value).filter(
					(t) => !t.startsWith("_"),
				),
			);
		}
		static getLocales() {
			return ge._locales.value;
		}
		constructor(t) {
			this.confusableDictionary = t;
		}
		isAmbiguous(t) {
			return this.confusableDictionary.has(t);
		}
		getPrimaryConfusable(t) {
			return this.confusableDictionary.get(t);
		}
		getConfusableCodePoints() {
			return new Set(this.confusableDictionary.keys());
		}
	}
	class Ce {
		static getRawData() {
			return JSON.parse(
				"[9,10,11,12,13,32,127,160,173,847,1564,4447,4448,6068,6069,6155,6156,6157,6158,7355,7356,8192,8193,8194,8195,8196,8197,8198,8199,8200,8201,8202,8203,8204,8205,8206,8207,8234,8235,8236,8237,8238,8239,8287,8288,8289,8290,8291,8292,8293,8294,8295,8296,8297,8298,8299,8300,8301,8302,8303,10240,12288,12644,65024,65025,65026,65027,65028,65029,65030,65031,65032,65033,65034,65035,65036,65037,65038,65039,65279,65440,65520,65521,65522,65523,65524,65525,65526,65527,65528,65532,78844,119155,119156,119157,119158,119159,119160,119161,119162,917504,917505,917506,917507,917508,917509,917510,917511,917512,917513,917514,917515,917516,917517,917518,917519,917520,917521,917522,917523,917524,917525,917526,917527,917528,917529,917530,917531,917532,917533,917534,917535,917536,917537,917538,917539,917540,917541,917542,917543,917544,917545,917546,917547,917548,917549,917550,917551,917552,917553,917554,917555,917556,917557,917558,917559,917560,917561,917562,917563,917564,917565,917566,917567,917568,917569,917570,917571,917572,917573,917574,917575,917576,917577,917578,917579,917580,917581,917582,917583,917584,917585,917586,917587,917588,917589,917590,917591,917592,917593,917594,917595,917596,917597,917598,917599,917600,917601,917602,917603,917604,917605,917606,917607,917608,917609,917610,917611,917612,917613,917614,917615,917616,917617,917618,917619,917620,917621,917622,917623,917624,917625,917626,917627,917628,917629,917630,917631,917760,917761,917762,917763,917764,917765,917766,917767,917768,917769,917770,917771,917772,917773,917774,917775,917776,917777,917778,917779,917780,917781,917782,917783,917784,917785,917786,917787,917788,917789,917790,917791,917792,917793,917794,917795,917796,917797,917798,917799,917800,917801,917802,917803,917804,917805,917806,917807,917808,917809,917810,917811,917812,917813,917814,917815,917816,917817,917818,917819,917820,917821,917822,917823,917824,917825,917826,917827,917828,917829,917830,917831,917832,917833,917834,917835,917836,917837,917838,917839,917840,917841,917842,917843,917844,917845,917846,917847,917848,917849,917850,917851,917852,917853,917854,917855,917856,917857,917858,917859,917860,917861,917862,917863,917864,917865,917866,917867,917868,917869,917870,917871,917872,917873,917874,917875,917876,917877,917878,917879,917880,917881,917882,917883,917884,917885,917886,917887,917888,917889,917890,917891,917892,917893,917894,917895,917896,917897,917898,917899,917900,917901,917902,917903,917904,917905,917906,917907,917908,917909,917910,917911,917912,917913,917914,917915,917916,917917,917918,917919,917920,917921,917922,917923,917924,917925,917926,917927,917928,917929,917930,917931,917932,917933,917934,917935,917936,917937,917938,917939,917940,917941,917942,917943,917944,917945,917946,917947,917948,917949,917950,917951,917952,917953,917954,917955,917956,917957,917958,917959,917960,917961,917962,917963,917964,917965,917966,917967,917968,917969,917970,917971,917972,917973,917974,917975,917976,917977,917978,917979,917980,917981,917982,917983,917984,917985,917986,917987,917988,917989,917990,917991,917992,917993,917994,917995,917996,917997,917998,917999]",
			);
		}
		static {
			this._data = void 0;
		}
		static getData() {
			return (
				this._data || (this._data = new Set(Ce.getRawData())),
				this._data
			);
		}
		static isInvisibleCharacter(t) {
			return Ce.getData().has(t);
		}
		static get codePoints() {
			return Ce.getData();
		}
	}
	const Ur = "$initialize";
	class Hr {
		constructor(t, n, s, r) {
			(this.vsWorker = t),
				(this.req = n),
				(this.method = s),
				(this.args = r),
				(this.type = 0);
		}
	}
	class hn {
		constructor(t, n, s, r) {
			(this.vsWorker = t),
				(this.seq = n),
				(this.res = s),
				(this.err = r),
				(this.type = 1);
		}
	}
	class Wr {
		constructor(t, n, s, r) {
			(this.vsWorker = t),
				(this.req = n),
				(this.eventName = s),
				(this.arg = r),
				(this.type = 2);
		}
	}
	class zr {
		constructor(t, n, s) {
			(this.vsWorker = t),
				(this.req = n),
				(this.event = s),
				(this.type = 3);
		}
	}
	class $r {
		constructor(t, n) {
			(this.vsWorker = t), (this.req = n), (this.type = 4);
		}
	}
	class Gr {
		constructor(t) {
			(this._workerId = -1),
				(this._handler = t),
				(this._lastSentReq = 0),
				(this._pendingReplies = Object.create(null)),
				(this._pendingEmitters = new Map()),
				(this._pendingEvents = new Map());
		}
		setWorkerId(t) {
			this._workerId = t;
		}
		sendMessage(t, n) {
			const s = String(++this._lastSentReq);
			return new Promise((r, i) => {
				(this._pendingReplies[s] = { resolve: r, reject: i }),
					this._send(new Hr(this._workerId, s, t, n));
			});
		}
		listen(t, n) {
			let s = null;
			const r = new ae({
				onWillAddFirstListener: () => {
					(s = String(++this._lastSentReq)),
						this._pendingEmitters.set(s, r),
						this._send(new Wr(this._workerId, s, t, n));
				},
				onDidRemoveLastListener: () => {
					this._pendingEmitters.delete(s),
						this._send(new $r(this._workerId, s)),
						(s = null);
				},
			});
			return r.event;
		}
		handleMessage(t) {
			!t ||
				!t.vsWorker ||
				(this._workerId !== -1 && t.vsWorker !== this._workerId) ||
				this._handleMessage(t);
		}
		_handleMessage(t) {
			switch (t.type) {
				case 1:
					return this._handleReplyMessage(t);
				case 0:
					return this._handleRequestMessage(t);
				case 2:
					return this._handleSubscribeEventMessage(t);
				case 3:
					return this._handleEventMessage(t);
				case 4:
					return this._handleUnsubscribeEventMessage(t);
			}
		}
		_handleReplyMessage(t) {
			if (!this._pendingReplies[t.seq]) {
				console.warn("Got reply to unknown seq");
				return;
			}
			const n = this._pendingReplies[t.seq];
			if ((delete this._pendingReplies[t.seq], t.err)) {
				let s = t.err;
				t.err.$isError &&
					((s = new Error()),
					(s.name = t.err.name),
					(s.message = t.err.message),
					(s.stack = t.err.stack)),
					n.reject(s);
				return;
			}
			n.resolve(t.res);
		}
		_handleRequestMessage(t) {
			const n = t.req;
			this._handler.handleMessage(t.method, t.args).then(
				(r) => {
					this._send(new hn(this._workerId, n, r, void 0));
				},
				(r) => {
					r.detail instanceof Error && (r.detail = rn(r.detail)),
						this._send(new hn(this._workerId, n, void 0, rn(r)));
				},
			);
		}
		_handleSubscribeEventMessage(t) {
			const n = t.req,
				s = this._handler.handleEvent(
					t.eventName,
					t.arg,
				)((r) => {
					this._send(new zr(this._workerId, n, r));
				});
			this._pendingEvents.set(n, s);
		}
		_handleEventMessage(t) {
			if (!this._pendingEmitters.has(t.req)) {
				console.warn("Got event for unknown req");
				return;
			}
			this._pendingEmitters.get(t.req).fire(t.event);
		}
		_handleUnsubscribeEventMessage(t) {
			if (!this._pendingEvents.has(t.req)) {
				console.warn("Got unsubscribe for unknown req");
				return;
			}
			this._pendingEvents.get(t.req).dispose(),
				this._pendingEvents.delete(t.req);
		}
		_send(t) {
			const n = [];
			if (t.type === 0)
				for (let s = 0; s < t.args.length; s++)
					t.args[s] instanceof ArrayBuffer && n.push(t.args[s]);
			else t.type === 1 && t.res instanceof ArrayBuffer && n.push(t.res);
			this._handler.sendMessage(t, n);
		}
	}
	function fn(e) {
		return e[0] === "o" && e[1] === "n" && un(e.charCodeAt(2));
	}
	function dn(e) {
		return /^onDynamic/.test(e) && un(e.charCodeAt(9));
	}
	function Or(e, t, n) {
		const s = (o) =>
				function () {
					const l = Array.prototype.slice.call(arguments, 0);
					return t(o, l);
				},
			r = (o) =>
				function (l) {
					return n(o, l);
				},
			i = {};
		for (const o of e) {
			if (dn(o)) {
				i[o] = r(o);
				continue;
			}
			if (fn(o)) {
				i[o] = n(o, void 0);
				continue;
			}
			i[o] = s(o);
		}
		return i;
	}
	class jr {
		constructor(t, n) {
			(this._requestHandlerFactory = n),
				(this._requestHandler = null),
				(this._protocol = new Gr({
					sendMessage: (s, r) => {
						t(s, r);
					},
					handleMessage: (s, r) => this._handleMessage(s, r),
					handleEvent: (s, r) => this._handleEvent(s, r),
				}));
		}
		onmessage(t) {
			this._protocol.handleMessage(t);
		}
		_handleMessage(t, n) {
			if (t === Ur) return this.initialize(n[0], n[1], n[2], n[3]);
			if (
				!this._requestHandler ||
				typeof this._requestHandler[t] != "function"
			)
				return Promise.reject(
					new Error("Missing requestHandler or method: " + t),
				);
			try {
				return Promise.resolve(
					this._requestHandler[t].apply(this._requestHandler, n),
				);
			} catch (s) {
				return Promise.reject(s);
			}
		}
		_handleEvent(t, n) {
			if (!this._requestHandler)
				throw new Error("Missing requestHandler");
			if (dn(t)) {
				const s = this._requestHandler[t].call(this._requestHandler, n);
				if (typeof s != "function")
					throw new Error(
						`Missing dynamic event ${t} on request handler.`,
					);
				return s;
			}
			if (fn(t)) {
				const s = this._requestHandler[t];
				if (typeof s != "function")
					throw new Error(`Missing event ${t} on request handler.`);
				return s;
			}
			throw new Error(`Malformed event name ${t}`);
		}
		initialize(t, n, s, r) {
			this._protocol.setWorkerId(t);
			const l = Or(
				r,
				(u, c) => this._protocol.sendMessage(u, c),
				(u, c) => this._protocol.listen(u, c),
			);
			return this._requestHandlerFactory
				? ((this._requestHandler = this._requestHandlerFactory(l)),
					Promise.resolve(Rt(this._requestHandler)))
				: (n &&
						(typeof n.baseUrl < "u" && delete n.baseUrl,
						typeof n.paths < "u" &&
							typeof n.paths.vs < "u" &&
							delete n.paths.vs,
						typeof n.trustedTypesPolicy < "u" &&
							delete n.trustedTypesPolicy,
						(n.catchError = !0),
						globalThis.require.config(n)),
					new Promise((u, c) => {
						const f = globalThis.require;
						f(
							[s],
							(h) => {
								if (
									((this._requestHandler = h.create(l)),
									!this._requestHandler)
								) {
									c(new Error("No RequestHandler!"));
									return;
								}
								u(Rt(this._requestHandler));
							},
							c,
						);
					}));
		}
	}
	class be {
		constructor(t, n, s, r) {
			(this.originalStart = t),
				(this.originalLength = n),
				(this.modifiedStart = s),
				(this.modifiedLength = r);
		}
		getOriginalEnd() {
			return this.originalStart + this.originalLength;
		}
		getModifiedEnd() {
			return this.modifiedStart + this.modifiedLength;
		}
	}
	function mn(e, t) {
		return ((t << 5) - t + e) | 0;
	}
	function Xr(e, t) {
		t = mn(149417, t);
		for (let n = 0, s = e.length; n < s; n++) t = mn(e.charCodeAt(n), t);
		return t;
	}
	function Dt(e, t, n = 32) {
		const s = n - t,
			r = ~((1 << s) - 1);
		return ((e << t) | ((r & e) >>> s)) >>> 0;
	}
	function gn(e, t = 0, n = e.byteLength, s = 0) {
		for (let r = 0; r < n; r++) e[t + r] = s;
	}
	function Qr(e, t, n = "0") {
		for (; e.length < t; ) e = n + e;
		return e;
	}
	function We(e, t = 32) {
		return e instanceof ArrayBuffer
			? Array.from(new Uint8Array(e))
					.map((n) => n.toString(16).padStart(2, "0"))
					.join("")
			: Qr((e >>> 0).toString(16), t / 4);
	}
	class bn {
		static {
			this._bigBlock32 = new DataView(new ArrayBuffer(320));
		}
		constructor() {
			(this._h0 = 1732584193),
				(this._h1 = 4023233417),
				(this._h2 = 2562383102),
				(this._h3 = 271733878),
				(this._h4 = 3285377520),
				(this._buff = new Uint8Array(67)),
				(this._buffDV = new DataView(this._buff.buffer)),
				(this._buffLen = 0),
				(this._totalLen = 0),
				(this._leftoverHighSurrogate = 0),
				(this._finished = !1);
		}
		update(t) {
			const n = t.length;
			if (n === 0) return;
			const s = this._buff;
			let r = this._buffLen,
				i = this._leftoverHighSurrogate,
				o,
				l;
			for (
				i !== 0
					? ((o = i), (l = -1), (i = 0))
					: ((o = t.charCodeAt(0)), (l = 0));
				;
			) {
				let u = o;
				if (it(o))
					if (l + 1 < n) {
						const c = t.charCodeAt(l + 1);
						Ft(c) ? (l++, (u = cn(o, c))) : (u = 65533);
					} else {
						i = o;
						break;
					}
				else Ft(o) && (u = 65533);
				if (((r = this._push(s, r, u)), l++, l < n))
					o = t.charCodeAt(l);
				else break;
			}
			(this._buffLen = r), (this._leftoverHighSurrogate = i);
		}
		_push(t, n, s) {
			return (
				s < 128
					? (t[n++] = s)
					: s < 2048
						? ((t[n++] = 192 | ((s & 1984) >>> 6)),
							(t[n++] = 128 | ((s & 63) >>> 0)))
						: s < 65536
							? ((t[n++] = 224 | ((s & 61440) >>> 12)),
								(t[n++] = 128 | ((s & 4032) >>> 6)),
								(t[n++] = 128 | ((s & 63) >>> 0)))
							: ((t[n++] = 240 | ((s & 1835008) >>> 18)),
								(t[n++] = 128 | ((s & 258048) >>> 12)),
								(t[n++] = 128 | ((s & 4032) >>> 6)),
								(t[n++] = 128 | ((s & 63) >>> 0))),
				n >= 64 &&
					(this._step(),
					(n -= 64),
					(this._totalLen += 64),
					(t[0] = t[64]),
					(t[1] = t[65]),
					(t[2] = t[66])),
				n
			);
		}
		digest() {
			return (
				this._finished ||
					((this._finished = !0),
					this._leftoverHighSurrogate &&
						((this._leftoverHighSurrogate = 0),
						(this._buffLen = this._push(
							this._buff,
							this._buffLen,
							65533,
						))),
					(this._totalLen += this._buffLen),
					this._wrapUp()),
				We(this._h0) +
					We(this._h1) +
					We(this._h2) +
					We(this._h3) +
					We(this._h4)
			);
		}
		_wrapUp() {
			(this._buff[this._buffLen++] = 128),
				gn(this._buff, this._buffLen),
				this._buffLen > 56 && (this._step(), gn(this._buff));
			const t = 8 * this._totalLen;
			this._buffDV.setUint32(56, Math.floor(t / 4294967296), !1),
				this._buffDV.setUint32(60, t % 4294967296, !1),
				this._step();
		}
		_step() {
			const t = bn._bigBlock32,
				n = this._buffDV;
			for (let h = 0; h < 64; h += 4)
				t.setUint32(h, n.getUint32(h, !1), !1);
			for (let h = 64; h < 320; h += 4)
				t.setUint32(
					h,
					Dt(
						t.getUint32(h - 12, !1) ^
							t.getUint32(h - 32, !1) ^
							t.getUint32(h - 56, !1) ^
							t.getUint32(h - 64, !1),
						1,
					),
					!1,
				);
			let s = this._h0,
				r = this._h1,
				i = this._h2,
				o = this._h3,
				l = this._h4,
				u,
				c,
				f;
			for (let h = 0; h < 80; h++)
				h < 20
					? ((u = (r & i) | (~r & o)), (c = 1518500249))
					: h < 40
						? ((u = r ^ i ^ o), (c = 1859775393))
						: h < 60
							? ((u = (r & i) | (r & o) | (i & o)),
								(c = 2400959708))
							: ((u = r ^ i ^ o), (c = 3395469782)),
					(f =
						(Dt(s, 5) + u + l + c + t.getUint32(h * 4, !1)) &
						4294967295),
					(l = o),
					(o = i),
					(i = Dt(r, 30)),
					(r = s),
					(s = f);
			(this._h0 = (this._h0 + s) & 4294967295),
				(this._h1 = (this._h1 + r) & 4294967295),
				(this._h2 = (this._h2 + i) & 4294967295),
				(this._h3 = (this._h3 + o) & 4294967295),
				(this._h4 = (this._h4 + l) & 4294967295);
		}
	}
	class _n {
		constructor(t) {
			this.source = t;
		}
		getElements() {
			const t = this.source,
				n = new Int32Array(t.length);
			for (let s = 0, r = t.length; s < r; s++) n[s] = t.charCodeAt(s);
			return n;
		}
	}
	function Jr(e, t, n) {
		return new _e(new _n(e), new _n(t)).ComputeDiff(n).changes;
	}
	class Ee {
		static Assert(t, n) {
			if (!t) throw new Error(n);
		}
	}
	class Me {
		static Copy(t, n, s, r, i) {
			for (let o = 0; o < i; o++) s[r + o] = t[n + o];
		}
		static Copy2(t, n, s, r, i) {
			for (let o = 0; o < i; o++) s[r + o] = t[n + o];
		}
	}
	class xn {
		constructor() {
			(this.m_changes = []),
				(this.m_originalStart = 1073741824),
				(this.m_modifiedStart = 1073741824),
				(this.m_originalCount = 0),
				(this.m_modifiedCount = 0);
		}
		MarkNextChange() {
			(this.m_originalCount > 0 || this.m_modifiedCount > 0) &&
				this.m_changes.push(
					new be(
						this.m_originalStart,
						this.m_originalCount,
						this.m_modifiedStart,
						this.m_modifiedCount,
					),
				),
				(this.m_originalCount = 0),
				(this.m_modifiedCount = 0),
				(this.m_originalStart = 1073741824),
				(this.m_modifiedStart = 1073741824);
		}
		AddOriginalElement(t, n) {
			(this.m_originalStart = Math.min(this.m_originalStart, t)),
				(this.m_modifiedStart = Math.min(this.m_modifiedStart, n)),
				this.m_originalCount++;
		}
		AddModifiedElement(t, n) {
			(this.m_originalStart = Math.min(this.m_originalStart, t)),
				(this.m_modifiedStart = Math.min(this.m_modifiedStart, n)),
				this.m_modifiedCount++;
		}
		getChanges() {
			return (
				(this.m_originalCount > 0 || this.m_modifiedCount > 0) &&
					this.MarkNextChange(),
				this.m_changes
			);
		}
		getReverseChanges() {
			return (
				(this.m_originalCount > 0 || this.m_modifiedCount > 0) &&
					this.MarkNextChange(),
				this.m_changes.reverse(),
				this.m_changes
			);
		}
	}
	class _e {
		constructor(t, n, s = null) {
			(this.ContinueProcessingPredicate = s),
				(this._originalSequence = t),
				(this._modifiedSequence = n);
			const [r, i, o] = _e._getElements(t),
				[l, u, c] = _e._getElements(n);
			(this._hasStrings = o && c),
				(this._originalStringElements = r),
				(this._originalElementsOrHash = i),
				(this._modifiedStringElements = l),
				(this._modifiedElementsOrHash = u),
				(this.m_forwardHistory = []),
				(this.m_reverseHistory = []);
		}
		static _isStringArray(t) {
			return t.length > 0 && typeof t[0] == "string";
		}
		static _getElements(t) {
			const n = t.getElements();
			if (_e._isStringArray(n)) {
				const s = new Int32Array(n.length);
				for (let r = 0, i = n.length; r < i; r++) s[r] = Xr(n[r], 0);
				return [n, s, !0];
			}
			return n instanceof Int32Array
				? [[], n, !1]
				: [[], new Int32Array(n), !1];
		}
		ElementsAreEqual(t, n) {
			return this._originalElementsOrHash[t] !==
				this._modifiedElementsOrHash[n]
				? !1
				: this._hasStrings
					? this._originalStringElements[t] ===
						this._modifiedStringElements[n]
					: !0;
		}
		ElementsAreStrictEqual(t, n) {
			if (!this.ElementsAreEqual(t, n)) return !1;
			const s = _e._getStrictElement(this._originalSequence, t),
				r = _e._getStrictElement(this._modifiedSequence, n);
			return s === r;
		}
		static _getStrictElement(t, n) {
			return typeof t.getStrictElement == "function"
				? t.getStrictElement(n)
				: null;
		}
		OriginalElementsAreEqual(t, n) {
			return this._originalElementsOrHash[t] !==
				this._originalElementsOrHash[n]
				? !1
				: this._hasStrings
					? this._originalStringElements[t] ===
						this._originalStringElements[n]
					: !0;
		}
		ModifiedElementsAreEqual(t, n) {
			return this._modifiedElementsOrHash[t] !==
				this._modifiedElementsOrHash[n]
				? !1
				: this._hasStrings
					? this._modifiedStringElements[t] ===
						this._modifiedStringElements[n]
					: !0;
		}
		ComputeDiff(t) {
			return this._ComputeDiff(
				0,
				this._originalElementsOrHash.length - 1,
				0,
				this._modifiedElementsOrHash.length - 1,
				t,
			);
		}
		_ComputeDiff(t, n, s, r, i) {
			const o = [!1];
			let l = this.ComputeDiffRecursive(t, n, s, r, o);
			return (
				i && (l = this.PrettifyChanges(l)),
				{ quitEarly: o[0], changes: l }
			);
		}
		ComputeDiffRecursive(t, n, s, r, i) {
			for (i[0] = !1; t <= n && s <= r && this.ElementsAreEqual(t, s); )
				t++, s++;
			for (; n >= t && r >= s && this.ElementsAreEqual(n, r); ) n--, r--;
			if (t > n || s > r) {
				let h;
				return (
					s <= r
						? (Ee.Assert(
								t === n + 1,
								"originalStart should only be one more than originalEnd",
							),
							(h = [new be(t, 0, s, r - s + 1)]))
						: t <= n
							? (Ee.Assert(
									s === r + 1,
									"modifiedStart should only be one more than modifiedEnd",
								),
								(h = [new be(t, n - t + 1, s, 0)]))
							: (Ee.Assert(
									t === n + 1,
									"originalStart should only be one more than originalEnd",
								),
								Ee.Assert(
									s === r + 1,
									"modifiedStart should only be one more than modifiedEnd",
								),
								(h = [])),
					h
				);
			}
			const o = [0],
				l = [0],
				u = this.ComputeRecursionPoint(t, n, s, r, o, l, i),
				c = o[0],
				f = l[0];
			if (u !== null) return u;
			if (!i[0]) {
				const h = this.ComputeDiffRecursive(t, c, s, f, i);
				let d = [];
				return (
					i[0]
						? (d = [
								new be(
									c + 1,
									n - (c + 1) + 1,
									f + 1,
									r - (f + 1) + 1,
								),
							])
						: (d = this.ComputeDiffRecursive(
								c + 1,
								n,
								f + 1,
								r,
								i,
							)),
					this.ConcatenateChanges(h, d)
				);
			}
			return [new be(t, n - t + 1, s, r - s + 1)];
		}
		WALKTRACE(t, n, s, r, i, o, l, u, c, f, h, d, m, g, b, w, v, C) {
			let S = null,
				p = null,
				_ = new xn(),
				N = n,
				A = s,
				y = m[0] - w[0] - r,
				I = -1073741824,
				X = this.m_forwardHistory.length - 1;
			do {
				const B = y + t;
				B === N || (B < A && c[B - 1] < c[B + 1])
					? ((h = c[B + 1]),
						(g = h - y - r),
						h < I && _.MarkNextChange(),
						(I = h),
						_.AddModifiedElement(h + 1, g),
						(y = B + 1 - t))
					: ((h = c[B - 1] + 1),
						(g = h - y - r),
						h < I && _.MarkNextChange(),
						(I = h - 1),
						_.AddOriginalElement(h, g + 1),
						(y = B - 1 - t)),
					X >= 0 &&
						((c = this.m_forwardHistory[X]),
						(t = c[0]),
						(N = 1),
						(A = c.length - 1));
			} while (--X >= -1);
			if (((S = _.getReverseChanges()), C[0])) {
				let B = m[0] + 1,
					x = w[0] + 1;
				if (S !== null && S.length > 0) {
					const L = S[S.length - 1];
					(B = Math.max(B, L.getOriginalEnd())),
						(x = Math.max(x, L.getModifiedEnd()));
				}
				p = [new be(B, d - B + 1, x, b - x + 1)];
			} else {
				(_ = new xn()),
					(N = o),
					(A = l),
					(y = m[0] - w[0] - u),
					(I = 1073741824),
					(X = v
						? this.m_reverseHistory.length - 1
						: this.m_reverseHistory.length - 2);
				do {
					const B = y + i;
					B === N || (B < A && f[B - 1] >= f[B + 1])
						? ((h = f[B + 1] - 1),
							(g = h - y - u),
							h > I && _.MarkNextChange(),
							(I = h + 1),
							_.AddOriginalElement(h + 1, g + 1),
							(y = B + 1 - i))
						: ((h = f[B - 1]),
							(g = h - y - u),
							h > I && _.MarkNextChange(),
							(I = h),
							_.AddModifiedElement(h + 1, g + 1),
							(y = B - 1 - i)),
						X >= 0 &&
							((f = this.m_reverseHistory[X]),
							(i = f[0]),
							(N = 1),
							(A = f.length - 1));
				} while (--X >= -1);
				p = _.getChanges();
			}
			return this.ConcatenateChanges(S, p);
		}
		ComputeRecursionPoint(t, n, s, r, i, o, l) {
			let u = 0,
				c = 0,
				f = 0,
				h = 0,
				d = 0,
				m = 0;
			t--,
				s--,
				(i[0] = 0),
				(o[0] = 0),
				(this.m_forwardHistory = []),
				(this.m_reverseHistory = []);
			const g = n - t + (r - s),
				b = g + 1,
				w = new Int32Array(b),
				v = new Int32Array(b),
				C = r - s,
				S = n - t,
				p = t - s,
				_ = n - r,
				A = (S - C) % 2 === 0;
			(w[C] = t), (v[S] = n), (l[0] = !1);
			for (let y = 1; y <= g / 2 + 1; y++) {
				let I = 0,
					X = 0;
				(f = this.ClipDiagonalBound(C - y, y, C, b)),
					(h = this.ClipDiagonalBound(C + y, y, C, b));
				for (let x = f; x <= h; x += 2) {
					x === f || (x < h && w[x - 1] < w[x + 1])
						? (u = w[x + 1])
						: (u = w[x - 1] + 1),
						(c = u - (x - C) - p);
					const L = u;
					for (
						;
						u < n && c < r && this.ElementsAreEqual(u + 1, c + 1);
					)
						u++, c++;
					if (
						((w[x] = u),
						u + c > I + X && ((I = u), (X = c)),
						!A && Math.abs(x - S) <= y - 1 && u >= v[x])
					)
						return (
							(i[0] = u),
							(o[0] = c),
							L <= v[x] && y <= 1448
								? this.WALKTRACE(
										C,
										f,
										h,
										p,
										S,
										d,
										m,
										_,
										w,
										v,
										u,
										n,
										i,
										c,
										r,
										o,
										A,
										l,
									)
								: null
						);
				}
				const B = (I - t + (X - s) - y) / 2;
				if (
					this.ContinueProcessingPredicate !== null &&
					!this.ContinueProcessingPredicate(I, B)
				)
					return (
						(l[0] = !0),
						(i[0] = I),
						(o[0] = X),
						B > 0 && y <= 1448
							? this.WALKTRACE(
									C,
									f,
									h,
									p,
									S,
									d,
									m,
									_,
									w,
									v,
									u,
									n,
									i,
									c,
									r,
									o,
									A,
									l,
								)
							: (t++, s++, [new be(t, n - t + 1, s, r - s + 1)])
					);
				(d = this.ClipDiagonalBound(S - y, y, S, b)),
					(m = this.ClipDiagonalBound(S + y, y, S, b));
				for (let x = d; x <= m; x += 2) {
					x === d || (x < m && v[x - 1] >= v[x + 1])
						? (u = v[x + 1] - 1)
						: (u = v[x - 1]),
						(c = u - (x - S) - _);
					const L = u;
					for (; u > t && c > s && this.ElementsAreEqual(u, c); )
						u--, c--;
					if (((v[x] = u), A && Math.abs(x - C) <= y && u <= w[x]))
						return (
							(i[0] = u),
							(o[0] = c),
							L >= w[x] && y <= 1448
								? this.WALKTRACE(
										C,
										f,
										h,
										p,
										S,
										d,
										m,
										_,
										w,
										v,
										u,
										n,
										i,
										c,
										r,
										o,
										A,
										l,
									)
								: null
						);
				}
				if (y <= 1447) {
					let x = new Int32Array(h - f + 2);
					(x[0] = C - f + 1),
						Me.Copy2(w, f, x, 1, h - f + 1),
						this.m_forwardHistory.push(x),
						(x = new Int32Array(m - d + 2)),
						(x[0] = S - d + 1),
						Me.Copy2(v, d, x, 1, m - d + 1),
						this.m_reverseHistory.push(x);
				}
			}
			return this.WALKTRACE(
				C,
				f,
				h,
				p,
				S,
				d,
				m,
				_,
				w,
				v,
				u,
				n,
				i,
				c,
				r,
				o,
				A,
				l,
			);
		}
		PrettifyChanges(t) {
			for (let n = 0; n < t.length; n++) {
				const s = t[n],
					r =
						n < t.length - 1
							? t[n + 1].originalStart
							: this._originalElementsOrHash.length,
					i =
						n < t.length - 1
							? t[n + 1].modifiedStart
							: this._modifiedElementsOrHash.length,
					o = s.originalLength > 0,
					l = s.modifiedLength > 0;
				for (
					;
					s.originalStart + s.originalLength < r &&
					s.modifiedStart + s.modifiedLength < i &&
					(!o ||
						this.OriginalElementsAreEqual(
							s.originalStart,
							s.originalStart + s.originalLength,
						)) &&
					(!l ||
						this.ModifiedElementsAreEqual(
							s.modifiedStart,
							s.modifiedStart + s.modifiedLength,
						));
				) {
					const c = this.ElementsAreStrictEqual(
						s.originalStart,
						s.modifiedStart,
					);
					if (
						this.ElementsAreStrictEqual(
							s.originalStart + s.originalLength,
							s.modifiedStart + s.modifiedLength,
						) &&
						!c
					)
						break;
					s.originalStart++, s.modifiedStart++;
				}
				const u = [null];
				if (
					n < t.length - 1 &&
					this.ChangesOverlap(t[n], t[n + 1], u)
				) {
					(t[n] = u[0]), t.splice(n + 1, 1), n--;
					continue;
				}
			}
			for (let n = t.length - 1; n >= 0; n--) {
				const s = t[n];
				let r = 0,
					i = 0;
				if (n > 0) {
					const h = t[n - 1];
					(r = h.originalStart + h.originalLength),
						(i = h.modifiedStart + h.modifiedLength);
				}
				const o = s.originalLength > 0,
					l = s.modifiedLength > 0;
				let u = 0,
					c = this._boundaryScore(
						s.originalStart,
						s.originalLength,
						s.modifiedStart,
						s.modifiedLength,
					);
				for (let h = 1; ; h++) {
					const d = s.originalStart - h,
						m = s.modifiedStart - h;
					if (
						d < r ||
						m < i ||
						(o &&
							!this.OriginalElementsAreEqual(
								d,
								d + s.originalLength,
							)) ||
						(l &&
							!this.ModifiedElementsAreEqual(
								m,
								m + s.modifiedLength,
							))
					)
						break;
					const b =
						(d === r && m === i ? 5 : 0) +
						this._boundaryScore(
							d,
							s.originalLength,
							m,
							s.modifiedLength,
						);
					b > c && ((c = b), (u = h));
				}
				(s.originalStart -= u), (s.modifiedStart -= u);
				const f = [null];
				if (n > 0 && this.ChangesOverlap(t[n - 1], t[n], f)) {
					(t[n - 1] = f[0]), t.splice(n, 1), n++;
					continue;
				}
			}
			if (this._hasStrings)
				for (let n = 1, s = t.length; n < s; n++) {
					const r = t[n - 1],
						i = t[n],
						o =
							i.originalStart -
							r.originalStart -
							r.originalLength,
						l = r.originalStart,
						u = i.originalStart + i.originalLength,
						c = u - l,
						f = r.modifiedStart,
						h = i.modifiedStart + i.modifiedLength,
						d = h - f;
					if (o < 5 && c < 20 && d < 20) {
						const m = this._findBetterContiguousSequence(
							l,
							c,
							f,
							d,
							o,
						);
						if (m) {
							const [g, b] = m;
							(g !== r.originalStart + r.originalLength ||
								b !== r.modifiedStart + r.modifiedLength) &&
								((r.originalLength = g - r.originalStart),
								(r.modifiedLength = b - r.modifiedStart),
								(i.originalStart = g + o),
								(i.modifiedStart = b + o),
								(i.originalLength = u - i.originalStart),
								(i.modifiedLength = h - i.modifiedStart));
						}
					}
				}
			return t;
		}
		_findBetterContiguousSequence(t, n, s, r, i) {
			if (n < i || r < i) return null;
			const o = t + n - i + 1,
				l = s + r - i + 1;
			let u = 0,
				c = 0,
				f = 0;
			for (let h = t; h < o; h++)
				for (let d = s; d < l; d++) {
					const m = this._contiguousSequenceScore(h, d, i);
					m > 0 && m > u && ((u = m), (c = h), (f = d));
				}
			return u > 0 ? [c, f] : null;
		}
		_contiguousSequenceScore(t, n, s) {
			let r = 0;
			for (let i = 0; i < s; i++) {
				if (!this.ElementsAreEqual(t + i, n + i)) return 0;
				r += this._originalStringElements[t + i].length;
			}
			return r;
		}
		_OriginalIsBoundary(t) {
			return t <= 0 || t >= this._originalElementsOrHash.length - 1
				? !0
				: this._hasStrings &&
						/^\s*$/.test(this._originalStringElements[t]);
		}
		_OriginalRegionIsBoundary(t, n) {
			if (this._OriginalIsBoundary(t) || this._OriginalIsBoundary(t - 1))
				return !0;
			if (n > 0) {
				const s = t + n;
				if (
					this._OriginalIsBoundary(s - 1) ||
					this._OriginalIsBoundary(s)
				)
					return !0;
			}
			return !1;
		}
		_ModifiedIsBoundary(t) {
			return t <= 0 || t >= this._modifiedElementsOrHash.length - 1
				? !0
				: this._hasStrings &&
						/^\s*$/.test(this._modifiedStringElements[t]);
		}
		_ModifiedRegionIsBoundary(t, n) {
			if (this._ModifiedIsBoundary(t) || this._ModifiedIsBoundary(t - 1))
				return !0;
			if (n > 0) {
				const s = t + n;
				if (
					this._ModifiedIsBoundary(s - 1) ||
					this._ModifiedIsBoundary(s)
				)
					return !0;
			}
			return !1;
		}
		_boundaryScore(t, n, s, r) {
			const i = this._OriginalRegionIsBoundary(t, n) ? 1 : 0,
				o = this._ModifiedRegionIsBoundary(s, r) ? 1 : 0;
			return i + o;
		}
		ConcatenateChanges(t, n) {
			const s = [];
			if (t.length === 0 || n.length === 0) return n.length > 0 ? n : t;
			if (this.ChangesOverlap(t[t.length - 1], n[0], s)) {
				const r = new Array(t.length + n.length - 1);
				return (
					Me.Copy(t, 0, r, 0, t.length - 1),
					(r[t.length - 1] = s[0]),
					Me.Copy(n, 1, r, t.length, n.length - 1),
					r
				);
			} else {
				const r = new Array(t.length + n.length);
				return (
					Me.Copy(t, 0, r, 0, t.length),
					Me.Copy(n, 0, r, t.length, n.length),
					r
				);
			}
		}
		ChangesOverlap(t, n, s) {
			if (
				(Ee.Assert(
					t.originalStart <= n.originalStart,
					"Left change is not less than or equal to right change",
				),
				Ee.Assert(
					t.modifiedStart <= n.modifiedStart,
					"Left change is not less than or equal to right change",
				),
				t.originalStart + t.originalLength >= n.originalStart ||
					t.modifiedStart + t.modifiedLength >= n.modifiedStart)
			) {
				const r = t.originalStart;
				let i = t.originalLength;
				const o = t.modifiedStart;
				let l = t.modifiedLength;
				return (
					t.originalStart + t.originalLength >= n.originalStart &&
						(i =
							n.originalStart +
							n.originalLength -
							t.originalStart),
					t.modifiedStart + t.modifiedLength >= n.modifiedStart &&
						(l =
							n.modifiedStart +
							n.modifiedLength -
							t.modifiedStart),
					(s[0] = new be(r, i, o, l)),
					!0
				);
			} else return (s[0] = null), !1;
		}
		ClipDiagonalBound(t, n, s, r) {
			if (t >= 0 && t < r) return t;
			const i = s,
				o = r - s - 1,
				l = n % 2 === 0;
			if (t < 0) {
				const u = i % 2 === 0;
				return l === u ? 0 : 1;
			} else {
				const u = o % 2 === 0;
				return l === u ? r - 1 : r - 2;
			}
		}
	}
	var pn = {};
	let ke;
	const Pt = globalThis.vscode;
	if (typeof Pt < "u" && typeof Pt.process < "u") {
		const e = Pt.process;
		ke = {
			get platform() {
				return e.platform;
			},
			get arch() {
				return e.arch;
			},
			get env() {
				return e.env;
			},
			cwd() {
				return e.cwd();
			},
		};
	} else
		typeof process < "u" && typeof process?.versions?.node == "string"
			? (ke = {
					get platform() {
						return process.platform;
					},
					get arch() {
						return process.arch;
					},
					get env() {
						return pn;
					},
					cwd() {
						return pn.VSCODE_CWD || process.cwd();
					},
				})
			: (ke = {
					get platform() {
						return He ? "win32" : yr ? "darwin" : "linux";
					},
					get arch() {},
					get env() {
						return {};
					},
					cwd() {
						return "/";
					},
				});
	const at = ke.cwd,
		Yr = ke.env,
		Zr = ke.platform,
		Kr = 65,
		ei = 97,
		ti = 90,
		ni = 122,
		xe = 46,
		Q = 47,
		K = 92,
		pe = 58,
		si = 63;
	class wn extends Error {
		constructor(t, n, s) {
			let r;
			typeof n == "string" && n.indexOf("not ") === 0
				? ((r = "must not be"), (n = n.replace(/^not /, "")))
				: (r = "must be");
			const i = t.indexOf(".") !== -1 ? "property" : "argument";
			let o = `The "${t}" ${i} ${r} of type ${n}`;
			(o += `. Received type ${typeof s}`),
				super(o),
				(this.code = "ERR_INVALID_ARG_TYPE");
		}
	}
	function ri(e, t) {
		if (e === null || typeof e != "object") throw new wn(t, "Object", e);
	}
	function O(e, t) {
		if (typeof e != "string") throw new wn(t, "string", e);
	}
	const we = Zr === "win32";
	function P(e) {
		return e === Q || e === K;
	}
	function Tt(e) {
		return e === Q;
	}
	function Le(e) {
		return (e >= Kr && e <= ti) || (e >= ei && e <= ni);
	}
	function ot(e, t, n, s) {
		let r = "",
			i = 0,
			o = -1,
			l = 0,
			u = 0;
		for (let c = 0; c <= e.length; ++c) {
			if (c < e.length) u = e.charCodeAt(c);
			else {
				if (s(u)) break;
				u = Q;
			}
			if (s(u)) {
				if (!(o === c - 1 || l === 1))
					if (l === 2) {
						if (
							r.length < 2 ||
							i !== 2 ||
							r.charCodeAt(r.length - 1) !== xe ||
							r.charCodeAt(r.length - 2) !== xe
						) {
							if (r.length > 2) {
								const f = r.lastIndexOf(n);
								f === -1
									? ((r = ""), (i = 0))
									: ((r = r.slice(0, f)),
										(i = r.length - 1 - r.lastIndexOf(n))),
									(o = c),
									(l = 0);
								continue;
							} else if (r.length !== 0) {
								(r = ""), (i = 0), (o = c), (l = 0);
								continue;
							}
						}
						t && ((r += r.length > 0 ? `${n}..` : ".."), (i = 2));
					} else
						r.length > 0
							? (r += `${n}${e.slice(o + 1, c)}`)
							: (r = e.slice(o + 1, c)),
							(i = c - o - 1);
				(o = c), (l = 0);
			} else u === xe && l !== -1 ? ++l : (l = -1);
		}
		return r;
	}
	function ii(e) {
		return e ? `${e[0] === "." ? "" : "."}${e}` : "";
	}
	function Ln(e, t) {
		ri(t, "pathObject");
		const n = t.dir || t.root,
			s = t.base || `${t.name || ""}${ii(t.ext)}`;
		return n ? (n === t.root ? `${n}${s}` : `${n}${e}${s}`) : s;
	}
	const Z = {
			resolve(...e) {
				let t = "",
					n = "",
					s = !1;
				for (let r = e.length - 1; r >= -1; r--) {
					let i;
					if (r >= 0) {
						if (((i = e[r]), O(i, `paths[${r}]`), i.length === 0))
							continue;
					} else
						t.length === 0
							? (i = at())
							: ((i = Yr[`=${t}`] || at()),
								(i === void 0 ||
									(i.slice(0, 2).toLowerCase() !==
										t.toLowerCase() &&
										i.charCodeAt(2) === K)) &&
									(i = `${t}\\`));
					const o = i.length;
					let l = 0,
						u = "",
						c = !1;
					const f = i.charCodeAt(0);
					if (o === 1) P(f) && ((l = 1), (c = !0));
					else if (P(f))
						if (((c = !0), P(i.charCodeAt(1)))) {
							let h = 2,
								d = h;
							for (; h < o && !P(i.charCodeAt(h)); ) h++;
							if (h < o && h !== d) {
								const m = i.slice(d, h);
								for (d = h; h < o && P(i.charCodeAt(h)); ) h++;
								if (h < o && h !== d) {
									for (d = h; h < o && !P(i.charCodeAt(h)); )
										h++;
									(h === o || h !== d) &&
										((u = `\\\\${m}\\${i.slice(d, h)}`),
										(l = h));
								}
							}
						} else l = 1;
					else
						Le(f) &&
							i.charCodeAt(1) === pe &&
							((u = i.slice(0, 2)),
							(l = 2),
							o > 2 && P(i.charCodeAt(2)) && ((c = !0), (l = 3)));
					if (u.length > 0)
						if (t.length > 0) {
							if (u.toLowerCase() !== t.toLowerCase()) continue;
						} else t = u;
					if (s) {
						if (t.length > 0) break;
					} else if (
						((n = `${i.slice(l)}\\${n}`),
						(s = c),
						c && t.length > 0)
					)
						break;
				}
				return (
					(n = ot(n, !s, "\\", P)),
					s ? `${t}\\${n}` : `${t}${n}` || "."
				);
			},
			normalize(e) {
				O(e, "path");
				const t = e.length;
				if (t === 0) return ".";
				let n = 0,
					s,
					r = !1;
				const i = e.charCodeAt(0);
				if (t === 1) return Tt(i) ? "\\" : e;
				if (P(i))
					if (((r = !0), P(e.charCodeAt(1)))) {
						let l = 2,
							u = l;
						for (; l < t && !P(e.charCodeAt(l)); ) l++;
						if (l < t && l !== u) {
							const c = e.slice(u, l);
							for (u = l; l < t && P(e.charCodeAt(l)); ) l++;
							if (l < t && l !== u) {
								for (u = l; l < t && !P(e.charCodeAt(l)); ) l++;
								if (l === t) return `\\\\${c}\\${e.slice(u)}\\`;
								l !== u &&
									((s = `\\\\${c}\\${e.slice(u, l)}`),
									(n = l));
							}
						}
					} else n = 1;
				else
					Le(i) &&
						e.charCodeAt(1) === pe &&
						((s = e.slice(0, 2)),
						(n = 2),
						t > 2 && P(e.charCodeAt(2)) && ((r = !0), (n = 3)));
				let o = n < t ? ot(e.slice(n), !r, "\\", P) : "";
				return (
					o.length === 0 && !r && (o = "."),
					o.length > 0 && P(e.charCodeAt(t - 1)) && (o += "\\"),
					s === void 0
						? r
							? `\\${o}`
							: o
						: r
							? `${s}\\${o}`
							: `${s}${o}`
				);
			},
			isAbsolute(e) {
				O(e, "path");
				const t = e.length;
				if (t === 0) return !1;
				const n = e.charCodeAt(0);
				return (
					P(n) ||
					(t > 2 &&
						Le(n) &&
						e.charCodeAt(1) === pe &&
						P(e.charCodeAt(2)))
				);
			},
			join(...e) {
				if (e.length === 0) return ".";
				let t, n;
				for (let i = 0; i < e.length; ++i) {
					const o = e[i];
					O(o, "path"),
						o.length > 0 &&
							(t === void 0 ? (t = n = o) : (t += `\\${o}`));
				}
				if (t === void 0) return ".";
				let s = !0,
					r = 0;
				if (typeof n == "string" && P(n.charCodeAt(0))) {
					++r;
					const i = n.length;
					i > 1 &&
						P(n.charCodeAt(1)) &&
						(++r, i > 2 && (P(n.charCodeAt(2)) ? ++r : (s = !1)));
				}
				if (s) {
					for (; r < t.length && P(t.charCodeAt(r)); ) r++;
					r >= 2 && (t = `\\${t.slice(r)}`);
				}
				return Z.normalize(t);
			},
			relative(e, t) {
				if ((O(e, "from"), O(t, "to"), e === t)) return "";
				const n = Z.resolve(e),
					s = Z.resolve(t);
				if (
					n === s ||
					((e = n.toLowerCase()), (t = s.toLowerCase()), e === t)
				)
					return "";
				let r = 0;
				for (; r < e.length && e.charCodeAt(r) === K; ) r++;
				let i = e.length;
				for (; i - 1 > r && e.charCodeAt(i - 1) === K; ) i--;
				const o = i - r;
				let l = 0;
				for (; l < t.length && t.charCodeAt(l) === K; ) l++;
				let u = t.length;
				for (; u - 1 > l && t.charCodeAt(u - 1) === K; ) u--;
				const c = u - l,
					f = o < c ? o : c;
				let h = -1,
					d = 0;
				for (; d < f; d++) {
					const g = e.charCodeAt(r + d);
					if (g !== t.charCodeAt(l + d)) break;
					g === K && (h = d);
				}
				if (d !== f) {
					if (h === -1) return s;
				} else {
					if (c > f) {
						if (t.charCodeAt(l + d) === K)
							return s.slice(l + d + 1);
						if (d === 2) return s.slice(l + d);
					}
					o > f &&
						(e.charCodeAt(r + d) === K
							? (h = d)
							: d === 2 && (h = 3)),
						h === -1 && (h = 0);
				}
				let m = "";
				for (d = r + h + 1; d <= i; ++d)
					(d === i || e.charCodeAt(d) === K) &&
						(m += m.length === 0 ? ".." : "\\..");
				return (
					(l += h),
					m.length > 0
						? `${m}${s.slice(l, u)}`
						: (s.charCodeAt(l) === K && ++l, s.slice(l, u))
				);
			},
			toNamespacedPath(e) {
				if (typeof e != "string" || e.length === 0) return e;
				const t = Z.resolve(e);
				if (t.length <= 2) return e;
				if (t.charCodeAt(0) === K) {
					if (t.charCodeAt(1) === K) {
						const n = t.charCodeAt(2);
						if (n !== si && n !== xe)
							return `\\\\?\\UNC\\${t.slice(2)}`;
					}
				} else if (
					Le(t.charCodeAt(0)) &&
					t.charCodeAt(1) === pe &&
					t.charCodeAt(2) === K
				)
					return `\\\\?\\${t}`;
				return e;
			},
			dirname(e) {
				O(e, "path");
				const t = e.length;
				if (t === 0) return ".";
				let n = -1,
					s = 0;
				const r = e.charCodeAt(0);
				if (t === 1) return P(r) ? e : ".";
				if (P(r)) {
					if (((n = s = 1), P(e.charCodeAt(1)))) {
						let l = 2,
							u = l;
						for (; l < t && !P(e.charCodeAt(l)); ) l++;
						if (l < t && l !== u) {
							for (u = l; l < t && P(e.charCodeAt(l)); ) l++;
							if (l < t && l !== u) {
								for (u = l; l < t && !P(e.charCodeAt(l)); ) l++;
								if (l === t) return e;
								l !== u && (n = s = l + 1);
							}
						}
					}
				} else
					Le(r) &&
						e.charCodeAt(1) === pe &&
						((n = t > 2 && P(e.charCodeAt(2)) ? 3 : 2), (s = n));
				let i = -1,
					o = !0;
				for (let l = t - 1; l >= s; --l)
					if (P(e.charCodeAt(l))) {
						if (!o) {
							i = l;
							break;
						}
					} else o = !1;
				if (i === -1) {
					if (n === -1) return ".";
					i = n;
				}
				return e.slice(0, i);
			},
			basename(e, t) {
				t !== void 0 && O(t, "suffix"), O(e, "path");
				let n = 0,
					s = -1,
					r = !0,
					i;
				if (
					(e.length >= 2 &&
						Le(e.charCodeAt(0)) &&
						e.charCodeAt(1) === pe &&
						(n = 2),
					t !== void 0 && t.length > 0 && t.length <= e.length)
				) {
					if (t === e) return "";
					let o = t.length - 1,
						l = -1;
					for (i = e.length - 1; i >= n; --i) {
						const u = e.charCodeAt(i);
						if (P(u)) {
							if (!r) {
								n = i + 1;
								break;
							}
						} else
							l === -1 && ((r = !1), (l = i + 1)),
								o >= 0 &&
									(u === t.charCodeAt(o)
										? --o === -1 && (s = i)
										: ((o = -1), (s = l)));
					}
					return (
						n === s ? (s = l) : s === -1 && (s = e.length),
						e.slice(n, s)
					);
				}
				for (i = e.length - 1; i >= n; --i)
					if (P(e.charCodeAt(i))) {
						if (!r) {
							n = i + 1;
							break;
						}
					} else s === -1 && ((r = !1), (s = i + 1));
				return s === -1 ? "" : e.slice(n, s);
			},
			extname(e) {
				O(e, "path");
				let t = 0,
					n = -1,
					s = 0,
					r = -1,
					i = !0,
					o = 0;
				e.length >= 2 &&
					e.charCodeAt(1) === pe &&
					Le(e.charCodeAt(0)) &&
					(t = s = 2);
				for (let l = e.length - 1; l >= t; --l) {
					const u = e.charCodeAt(l);
					if (P(u)) {
						if (!i) {
							s = l + 1;
							break;
						}
						continue;
					}
					r === -1 && ((i = !1), (r = l + 1)),
						u === xe
							? n === -1
								? (n = l)
								: o !== 1 && (o = 1)
							: n !== -1 && (o = -1);
				}
				return n === -1 ||
					r === -1 ||
					o === 0 ||
					(o === 1 && n === r - 1 && n === s + 1)
					? ""
					: e.slice(n, r);
			},
			format: Ln.bind(null, "\\"),
			parse(e) {
				O(e, "path");
				const t = { root: "", dir: "", base: "", ext: "", name: "" };
				if (e.length === 0) return t;
				const n = e.length;
				let s = 0,
					r = e.charCodeAt(0);
				if (n === 1)
					return P(r)
						? ((t.root = t.dir = e), t)
						: ((t.base = t.name = e), t);
				if (P(r)) {
					if (((s = 1), P(e.charCodeAt(1)))) {
						let h = 2,
							d = h;
						for (; h < n && !P(e.charCodeAt(h)); ) h++;
						if (h < n && h !== d) {
							for (d = h; h < n && P(e.charCodeAt(h)); ) h++;
							if (h < n && h !== d) {
								for (d = h; h < n && !P(e.charCodeAt(h)); ) h++;
								h === n ? (s = h) : h !== d && (s = h + 1);
							}
						}
					}
				} else if (Le(r) && e.charCodeAt(1) === pe) {
					if (n <= 2) return (t.root = t.dir = e), t;
					if (((s = 2), P(e.charCodeAt(2)))) {
						if (n === 3) return (t.root = t.dir = e), t;
						s = 3;
					}
				}
				s > 0 && (t.root = e.slice(0, s));
				let i = -1,
					o = s,
					l = -1,
					u = !0,
					c = e.length - 1,
					f = 0;
				for (; c >= s; --c) {
					if (((r = e.charCodeAt(c)), P(r))) {
						if (!u) {
							o = c + 1;
							break;
						}
						continue;
					}
					l === -1 && ((u = !1), (l = c + 1)),
						r === xe
							? i === -1
								? (i = c)
								: f !== 1 && (f = 1)
							: i !== -1 && (f = -1);
				}
				return (
					l !== -1 &&
						(i === -1 ||
						f === 0 ||
						(f === 1 && i === l - 1 && i === o + 1)
							? (t.base = t.name = e.slice(o, l))
							: ((t.name = e.slice(o, i)),
								(t.base = e.slice(o, l)),
								(t.ext = e.slice(i, l)))),
					o > 0 && o !== s
						? (t.dir = e.slice(0, o - 1))
						: (t.dir = t.root),
					t
				);
			},
			sep: "\\",
			delimiter: ";",
			win32: null,
			posix: null,
		},
		ai = (() => {
			if (we) {
				const e = /\\/g;
				return () => {
					const t = at().replace(e, "/");
					return t.slice(t.indexOf("/"));
				};
			}
			return () => at();
		})(),
		ee = {
			resolve(...e) {
				let t = "",
					n = !1;
				for (let s = e.length - 1; s >= -1 && !n; s--) {
					const r = s >= 0 ? e[s] : ai();
					O(r, `paths[${s}]`),
						r.length !== 0 &&
							((t = `${r}/${t}`), (n = r.charCodeAt(0) === Q));
				}
				return (
					(t = ot(t, !n, "/", Tt)),
					n ? `/${t}` : t.length > 0 ? t : "."
				);
			},
			normalize(e) {
				if ((O(e, "path"), e.length === 0)) return ".";
				const t = e.charCodeAt(0) === Q,
					n = e.charCodeAt(e.length - 1) === Q;
				return (
					(e = ot(e, !t, "/", Tt)),
					e.length === 0
						? t
							? "/"
							: n
								? "./"
								: "."
						: (n && (e += "/"), t ? `/${e}` : e)
				);
			},
			isAbsolute(e) {
				return O(e, "path"), e.length > 0 && e.charCodeAt(0) === Q;
			},
			join(...e) {
				if (e.length === 0) return ".";
				let t;
				for (let n = 0; n < e.length; ++n) {
					const s = e[n];
					O(s, "path"),
						s.length > 0 &&
							(t === void 0 ? (t = s) : (t += `/${s}`));
				}
				return t === void 0 ? "." : ee.normalize(t);
			},
			relative(e, t) {
				if (
					(O(e, "from"),
					O(t, "to"),
					e === t ||
						((e = ee.resolve(e)), (t = ee.resolve(t)), e === t))
				)
					return "";
				const n = 1,
					s = e.length,
					r = s - n,
					i = 1,
					o = t.length - i,
					l = r < o ? r : o;
				let u = -1,
					c = 0;
				for (; c < l; c++) {
					const h = e.charCodeAt(n + c);
					if (h !== t.charCodeAt(i + c)) break;
					h === Q && (u = c);
				}
				if (c === l)
					if (o > l) {
						if (t.charCodeAt(i + c) === Q)
							return t.slice(i + c + 1);
						if (c === 0) return t.slice(i + c);
					} else
						r > l &&
							(e.charCodeAt(n + c) === Q
								? (u = c)
								: c === 0 && (u = 0));
				let f = "";
				for (c = n + u + 1; c <= s; ++c)
					(c === s || e.charCodeAt(c) === Q) &&
						(f += f.length === 0 ? ".." : "/..");
				return `${f}${t.slice(i + u)}`;
			},
			toNamespacedPath(e) {
				return e;
			},
			dirname(e) {
				if ((O(e, "path"), e.length === 0)) return ".";
				const t = e.charCodeAt(0) === Q;
				let n = -1,
					s = !0;
				for (let r = e.length - 1; r >= 1; --r)
					if (e.charCodeAt(r) === Q) {
						if (!s) {
							n = r;
							break;
						}
					} else s = !1;
				return n === -1
					? t
						? "/"
						: "."
					: t && n === 1
						? "//"
						: e.slice(0, n);
			},
			basename(e, t) {
				t !== void 0 && O(t, "ext"), O(e, "path");
				let n = 0,
					s = -1,
					r = !0,
					i;
				if (t !== void 0 && t.length > 0 && t.length <= e.length) {
					if (t === e) return "";
					let o = t.length - 1,
						l = -1;
					for (i = e.length - 1; i >= 0; --i) {
						const u = e.charCodeAt(i);
						if (u === Q) {
							if (!r) {
								n = i + 1;
								break;
							}
						} else
							l === -1 && ((r = !1), (l = i + 1)),
								o >= 0 &&
									(u === t.charCodeAt(o)
										? --o === -1 && (s = i)
										: ((o = -1), (s = l)));
					}
					return (
						n === s ? (s = l) : s === -1 && (s = e.length),
						e.slice(n, s)
					);
				}
				for (i = e.length - 1; i >= 0; --i)
					if (e.charCodeAt(i) === Q) {
						if (!r) {
							n = i + 1;
							break;
						}
					} else s === -1 && ((r = !1), (s = i + 1));
				return s === -1 ? "" : e.slice(n, s);
			},
			extname(e) {
				O(e, "path");
				let t = -1,
					n = 0,
					s = -1,
					r = !0,
					i = 0;
				for (let o = e.length - 1; o >= 0; --o) {
					const l = e.charCodeAt(o);
					if (l === Q) {
						if (!r) {
							n = o + 1;
							break;
						}
						continue;
					}
					s === -1 && ((r = !1), (s = o + 1)),
						l === xe
							? t === -1
								? (t = o)
								: i !== 1 && (i = 1)
							: t !== -1 && (i = -1);
				}
				return t === -1 ||
					s === -1 ||
					i === 0 ||
					(i === 1 && t === s - 1 && t === n + 1)
					? ""
					: e.slice(t, s);
			},
			format: Ln.bind(null, "/"),
			parse(e) {
				O(e, "path");
				const t = { root: "", dir: "", base: "", ext: "", name: "" };
				if (e.length === 0) return t;
				const n = e.charCodeAt(0) === Q;
				let s;
				n ? ((t.root = "/"), (s = 1)) : (s = 0);
				let r = -1,
					i = 0,
					o = -1,
					l = !0,
					u = e.length - 1,
					c = 0;
				for (; u >= s; --u) {
					const f = e.charCodeAt(u);
					if (f === Q) {
						if (!l) {
							i = u + 1;
							break;
						}
						continue;
					}
					o === -1 && ((l = !1), (o = u + 1)),
						f === xe
							? r === -1
								? (r = u)
								: c !== 1 && (c = 1)
							: r !== -1 && (c = -1);
				}
				if (o !== -1) {
					const f = i === 0 && n ? 1 : i;
					r === -1 ||
					c === 0 ||
					(c === 1 && r === o - 1 && r === i + 1)
						? (t.base = t.name = e.slice(f, o))
						: ((t.name = e.slice(f, r)),
							(t.base = e.slice(f, o)),
							(t.ext = e.slice(r, o)));
				}
				return (
					i > 0 ? (t.dir = e.slice(0, i - 1)) : n && (t.dir = "/"), t
				);
			},
			sep: "/",
			delimiter: ":",
			win32: null,
			posix: null,
		};
	(ee.win32 = Z.win32 = Z),
		(ee.posix = Z.posix = ee),
		we ? Z.normalize : ee.normalize,
		we ? Z.resolve : ee.resolve,
		we ? Z.relative : ee.relative,
		we ? Z.dirname : ee.dirname,
		we ? Z.basename : ee.basename,
		we ? Z.extname : ee.extname,
		we ? Z.sep : ee.sep;
	const oi = /^\w[\w\d+.-]*$/,
		li = /^\//,
		ui = /^\/\//;
	function ci(e, t) {
		if (!e.scheme && t)
			throw new Error(
				`[UriError]: Scheme is missing: {scheme: "", authority: "${e.authority}", path: "${e.path}", query: "${e.query}", fragment: "${e.fragment}"}`,
			);
		if (e.scheme && !oi.test(e.scheme))
			throw new Error("[UriError]: Scheme contains illegal characters.");
		if (e.path) {
			if (e.authority) {
				if (!li.test(e.path))
					throw new Error(
						'[UriError]: If a URI contains an authority component, then the path component must either be empty or begin with a slash ("/") character',
					);
			} else if (ui.test(e.path))
				throw new Error(
					'[UriError]: If a URI does not contain an authority component, then the path cannot begin with two slash characters ("//")',
				);
		}
	}
	function hi(e, t) {
		return !e && !t ? "file" : e;
	}
	function fi(e, t) {
		switch (e) {
			case "https":
			case "http":
			case "file":
				t ? t[0] !== oe && (t = oe + t) : (t = oe);
				break;
		}
		return t;
	}
	const W = "",
		oe = "/",
		di = /^(([^:/?#]+?):)?(\/\/([^/?#]*))?([^?#]*)(\?([^#]*))?(#(.*))?/;
	class Ae {
		static isUri(t) {
			return t instanceof Ae
				? !0
				: t
					? typeof t.authority == "string" &&
						typeof t.fragment == "string" &&
						typeof t.path == "string" &&
						typeof t.query == "string" &&
						typeof t.scheme == "string" &&
						typeof t.fsPath == "string" &&
						typeof t.with == "function" &&
						typeof t.toString == "function"
					: !1;
		}
		constructor(t, n, s, r, i, o = !1) {
			typeof t == "object"
				? ((this.scheme = t.scheme || W),
					(this.authority = t.authority || W),
					(this.path = t.path || W),
					(this.query = t.query || W),
					(this.fragment = t.fragment || W))
				: ((this.scheme = hi(t, o)),
					(this.authority = n || W),
					(this.path = fi(this.scheme, s || W)),
					(this.query = r || W),
					(this.fragment = i || W),
					ci(this, o));
		}
		get fsPath() {
			return Vt(this, !1);
		}
		with(t) {
			if (!t) return this;
			let { scheme: n, authority: s, path: r, query: i, fragment: o } = t;
			return (
				n === void 0 ? (n = this.scheme) : n === null && (n = W),
				s === void 0 ? (s = this.authority) : s === null && (s = W),
				r === void 0 ? (r = this.path) : r === null && (r = W),
				i === void 0 ? (i = this.query) : i === null && (i = W),
				o === void 0 ? (o = this.fragment) : o === null && (o = W),
				n === this.scheme &&
				s === this.authority &&
				r === this.path &&
				i === this.query &&
				o === this.fragment
					? this
					: new Fe(n, s, r, i, o)
			);
		}
		static parse(t, n = !1) {
			const s = di.exec(t);
			return s
				? new Fe(
						s[2] || W,
						lt(s[4] || W),
						lt(s[5] || W),
						lt(s[7] || W),
						lt(s[9] || W),
						n,
					)
				: new Fe(W, W, W, W, W);
		}
		static file(t) {
			let n = W;
			if (
				(He && (t = t.replace(/\\/g, oe)), t[0] === oe && t[1] === oe)
			) {
				const s = t.indexOf(oe, 2);
				s === -1
					? ((n = t.substring(2)), (t = oe))
					: ((n = t.substring(2, s)), (t = t.substring(s) || oe));
			}
			return new Fe("file", n, t, W, W);
		}
		static from(t, n) {
			return new Fe(
				t.scheme,
				t.authority,
				t.path,
				t.query,
				t.fragment,
				n,
			);
		}
		static joinPath(t, ...n) {
			if (!t.path)
				throw new Error(
					"[UriError]: cannot call joinPath on URI without path",
				);
			let s;
			return (
				He && t.scheme === "file"
					? (s = Ae.file(Z.join(Vt(t, !0), ...n)).path)
					: (s = ee.join(t.path, ...n)),
				t.with({ path: s })
			);
		}
		toString(t = !1) {
			return It(this, t);
		}
		toJSON() {
			return this;
		}
		static revive(t) {
			if (t) {
				if (t instanceof Ae) return t;
				{
					const n = new Fe(t);
					return (
						(n._formatted = t.external ?? null),
						(n._fsPath = t._sep === vn ? t.fsPath ?? null : null),
						n
					);
				}
			} else return t;
		}
	}
	const vn = He ? 1 : void 0;
	class Fe extends Ae {
		constructor() {
			super(...arguments),
				(this._formatted = null),
				(this._fsPath = null);
		}
		get fsPath() {
			return this._fsPath || (this._fsPath = Vt(this, !1)), this._fsPath;
		}
		toString(t = !1) {
			return t
				? It(this, !0)
				: (this._formatted || (this._formatted = It(this, !1)),
					this._formatted);
		}
		toJSON() {
			const t = { $mid: 1 };
			return (
				this._fsPath && ((t.fsPath = this._fsPath), (t._sep = vn)),
				this._formatted && (t.external = this._formatted),
				this.path && (t.path = this.path),
				this.scheme && (t.scheme = this.scheme),
				this.authority && (t.authority = this.authority),
				this.query && (t.query = this.query),
				this.fragment && (t.fragment = this.fragment),
				t
			);
		}
	}
	const Nn = {
		58: "%3A",
		47: "%2F",
		63: "%3F",
		35: "%23",
		91: "%5B",
		93: "%5D",
		64: "%40",
		33: "%21",
		36: "%24",
		38: "%26",
		39: "%27",
		40: "%28",
		41: "%29",
		42: "%2A",
		43: "%2B",
		44: "%2C",
		59: "%3B",
		61: "%3D",
		32: "%20",
	};
	function Sn(e, t, n) {
		let s,
			r = -1;
		for (let i = 0; i < e.length; i++) {
			const o = e.charCodeAt(i);
			if (
				(o >= 97 && o <= 122) ||
				(o >= 65 && o <= 90) ||
				(o >= 48 && o <= 57) ||
				o === 45 ||
				o === 46 ||
				o === 95 ||
				o === 126 ||
				(t && o === 47) ||
				(n && o === 91) ||
				(n && o === 93) ||
				(n && o === 58)
			)
				r !== -1 &&
					((s += encodeURIComponent(e.substring(r, i))), (r = -1)),
					s !== void 0 && (s += e.charAt(i));
			else {
				s === void 0 && (s = e.substr(0, i));
				const l = Nn[o];
				l !== void 0
					? (r !== -1 &&
							((s += encodeURIComponent(e.substring(r, i))),
							(r = -1)),
						(s += l))
					: r === -1 && (r = i);
			}
		}
		return (
			r !== -1 && (s += encodeURIComponent(e.substring(r))),
			s !== void 0 ? s : e
		);
	}
	function mi(e) {
		let t;
		for (let n = 0; n < e.length; n++) {
			const s = e.charCodeAt(n);
			s === 35 || s === 63
				? (t === void 0 && (t = e.substr(0, n)), (t += Nn[s]))
				: t !== void 0 && (t += e[n]);
		}
		return t !== void 0 ? t : e;
	}
	function Vt(e, t) {
		let n;
		return (
			e.authority && e.path.length > 1 && e.scheme === "file"
				? (n = `//${e.authority}${e.path}`)
				: e.path.charCodeAt(0) === 47 &&
						((e.path.charCodeAt(1) >= 65 &&
							e.path.charCodeAt(1) <= 90) ||
							(e.path.charCodeAt(1) >= 97 &&
								e.path.charCodeAt(1) <= 122)) &&
						e.path.charCodeAt(2) === 58
					? t
						? (n = e.path.substr(1))
						: (n = e.path[1].toLowerCase() + e.path.substr(2))
					: (n = e.path),
			He && (n = n.replace(/\//g, "\\")),
			n
		);
	}
	function It(e, t) {
		const n = t ? mi : Sn;
		let s = "",
			{ scheme: r, authority: i, path: o, query: l, fragment: u } = e;
		if (
			(r && ((s += r), (s += ":")),
			(i || r === "file") && ((s += oe), (s += oe)),
			i)
		) {
			let c = i.indexOf("@");
			if (c !== -1) {
				const f = i.substr(0, c);
				(i = i.substr(c + 1)),
					(c = f.lastIndexOf(":")),
					c === -1
						? (s += n(f, !1, !1))
						: ((s += n(f.substr(0, c), !1, !1)),
							(s += ":"),
							(s += n(f.substr(c + 1), !1, !0))),
					(s += "@");
			}
			(i = i.toLowerCase()),
				(c = i.lastIndexOf(":")),
				c === -1
					? (s += n(i, !1, !0))
					: ((s += n(i.substr(0, c), !1, !0)), (s += i.substr(c)));
		}
		if (o) {
			if (
				o.length >= 3 &&
				o.charCodeAt(0) === 47 &&
				o.charCodeAt(2) === 58
			) {
				const c = o.charCodeAt(1);
				c >= 65 &&
					c <= 90 &&
					(o = `/${String.fromCharCode(c + 32)}:${o.substr(3)}`);
			} else if (o.length >= 2 && o.charCodeAt(1) === 58) {
				const c = o.charCodeAt(0);
				c >= 65 &&
					c <= 90 &&
					(o = `${String.fromCharCode(c + 32)}:${o.substr(2)}`);
			}
			s += n(o, !0, !1);
		}
		return (
			l && ((s += "?"), (s += n(l, !1, !1))),
			u && ((s += "#"), (s += t ? u : Sn(u, !1, !1))),
			s
		);
	}
	function Cn(e) {
		try {
			return decodeURIComponent(e);
		} catch {
			return e.length > 3 ? e.substr(0, 3) + Cn(e.substr(3)) : e;
		}
	}
	const An = /(%[0-9A-Za-z][0-9A-Za-z])+/g;
	function lt(e) {
		return e.match(An) ? e.replace(An, (t) => Cn(t)) : e;
	}
	class q {
		constructor(t, n) {
			(this.lineNumber = t), (this.column = n);
		}
		with(t = this.lineNumber, n = this.column) {
			return t === this.lineNumber && n === this.column
				? this
				: new q(t, n);
		}
		delta(t = 0, n = 0) {
			return this.with(this.lineNumber + t, this.column + n);
		}
		equals(t) {
			return q.equals(this, t);
		}
		static equals(t, n) {
			return !t && !n
				? !0
				: !!t &&
						!!n &&
						t.lineNumber === n.lineNumber &&
						t.column === n.column;
		}
		isBefore(t) {
			return q.isBefore(this, t);
		}
		static isBefore(t, n) {
			return t.lineNumber < n.lineNumber
				? !0
				: n.lineNumber < t.lineNumber
					? !1
					: t.column < n.column;
		}
		isBeforeOrEqual(t) {
			return q.isBeforeOrEqual(this, t);
		}
		static isBeforeOrEqual(t, n) {
			return t.lineNumber < n.lineNumber
				? !0
				: n.lineNumber < t.lineNumber
					? !1
					: t.column <= n.column;
		}
		static compare(t, n) {
			const s = t.lineNumber | 0,
				r = n.lineNumber | 0;
			if (s === r) {
				const i = t.column | 0,
					o = n.column | 0;
				return i - o;
			}
			return s - r;
		}
		clone() {
			return new q(this.lineNumber, this.column);
		}
		toString() {
			return "(" + this.lineNumber + "," + this.column + ")";
		}
		static lift(t) {
			return new q(t.lineNumber, t.column);
		}
		static isIPosition(t) {
			return (
				t &&
				typeof t.lineNumber == "number" &&
				typeof t.column == "number"
			);
		}
		toJSON() {
			return { lineNumber: this.lineNumber, column: this.column };
		}
	}
	class k {
		constructor(t, n, s, r) {
			t > s || (t === s && n > r)
				? ((this.startLineNumber = s),
					(this.startColumn = r),
					(this.endLineNumber = t),
					(this.endColumn = n))
				: ((this.startLineNumber = t),
					(this.startColumn = n),
					(this.endLineNumber = s),
					(this.endColumn = r));
		}
		isEmpty() {
			return k.isEmpty(this);
		}
		static isEmpty(t) {
			return (
				t.startLineNumber === t.endLineNumber &&
				t.startColumn === t.endColumn
			);
		}
		containsPosition(t) {
			return k.containsPosition(this, t);
		}
		static containsPosition(t, n) {
			return !(
				n.lineNumber < t.startLineNumber ||
				n.lineNumber > t.endLineNumber ||
				(n.lineNumber === t.startLineNumber &&
					n.column < t.startColumn) ||
				(n.lineNumber === t.endLineNumber && n.column > t.endColumn)
			);
		}
		static strictContainsPosition(t, n) {
			return !(
				n.lineNumber < t.startLineNumber ||
				n.lineNumber > t.endLineNumber ||
				(n.lineNumber === t.startLineNumber &&
					n.column <= t.startColumn) ||
				(n.lineNumber === t.endLineNumber && n.column >= t.endColumn)
			);
		}
		containsRange(t) {
			return k.containsRange(this, t);
		}
		static containsRange(t, n) {
			return !(
				n.startLineNumber < t.startLineNumber ||
				n.endLineNumber < t.startLineNumber ||
				n.startLineNumber > t.endLineNumber ||
				n.endLineNumber > t.endLineNumber ||
				(n.startLineNumber === t.startLineNumber &&
					n.startColumn < t.startColumn) ||
				(n.endLineNumber === t.endLineNumber &&
					n.endColumn > t.endColumn)
			);
		}
		strictContainsRange(t) {
			return k.strictContainsRange(this, t);
		}
		static strictContainsRange(t, n) {
			return !(
				n.startLineNumber < t.startLineNumber ||
				n.endLineNumber < t.startLineNumber ||
				n.startLineNumber > t.endLineNumber ||
				n.endLineNumber > t.endLineNumber ||
				(n.startLineNumber === t.startLineNumber &&
					n.startColumn <= t.startColumn) ||
				(n.endLineNumber === t.endLineNumber &&
					n.endColumn >= t.endColumn)
			);
		}
		plusRange(t) {
			return k.plusRange(this, t);
		}
		static plusRange(t, n) {
			let s, r, i, o;
			return (
				n.startLineNumber < t.startLineNumber
					? ((s = n.startLineNumber), (r = n.startColumn))
					: n.startLineNumber === t.startLineNumber
						? ((s = n.startLineNumber),
							(r = Math.min(n.startColumn, t.startColumn)))
						: ((s = t.startLineNumber), (r = t.startColumn)),
				n.endLineNumber > t.endLineNumber
					? ((i = n.endLineNumber), (o = n.endColumn))
					: n.endLineNumber === t.endLineNumber
						? ((i = n.endLineNumber),
							(o = Math.max(n.endColumn, t.endColumn)))
						: ((i = t.endLineNumber), (o = t.endColumn)),
				new k(s, r, i, o)
			);
		}
		intersectRanges(t) {
			return k.intersectRanges(this, t);
		}
		static intersectRanges(t, n) {
			let s = t.startLineNumber,
				r = t.startColumn,
				i = t.endLineNumber,
				o = t.endColumn;
			const l = n.startLineNumber,
				u = n.startColumn,
				c = n.endLineNumber,
				f = n.endColumn;
			return (
				s < l ? ((s = l), (r = u)) : s === l && (r = Math.max(r, u)),
				i > c ? ((i = c), (o = f)) : i === c && (o = Math.min(o, f)),
				s > i || (s === i && r > o) ? null : new k(s, r, i, o)
			);
		}
		equalsRange(t) {
			return k.equalsRange(this, t);
		}
		static equalsRange(t, n) {
			return !t && !n
				? !0
				: !!t &&
						!!n &&
						t.startLineNumber === n.startLineNumber &&
						t.startColumn === n.startColumn &&
						t.endLineNumber === n.endLineNumber &&
						t.endColumn === n.endColumn;
		}
		getEndPosition() {
			return k.getEndPosition(this);
		}
		static getEndPosition(t) {
			return new q(t.endLineNumber, t.endColumn);
		}
		getStartPosition() {
			return k.getStartPosition(this);
		}
		static getStartPosition(t) {
			return new q(t.startLineNumber, t.startColumn);
		}
		toString() {
			return (
				"[" +
				this.startLineNumber +
				"," +
				this.startColumn +
				" -> " +
				this.endLineNumber +
				"," +
				this.endColumn +
				"]"
			);
		}
		setEndPosition(t, n) {
			return new k(this.startLineNumber, this.startColumn, t, n);
		}
		setStartPosition(t, n) {
			return new k(t, n, this.endLineNumber, this.endColumn);
		}
		collapseToStart() {
			return k.collapseToStart(this);
		}
		static collapseToStart(t) {
			return new k(
				t.startLineNumber,
				t.startColumn,
				t.startLineNumber,
				t.startColumn,
			);
		}
		collapseToEnd() {
			return k.collapseToEnd(this);
		}
		static collapseToEnd(t) {
			return new k(
				t.endLineNumber,
				t.endColumn,
				t.endLineNumber,
				t.endColumn,
			);
		}
		delta(t) {
			return new k(
				this.startLineNumber + t,
				this.startColumn,
				this.endLineNumber + t,
				this.endColumn,
			);
		}
		static fromPositions(t, n = t) {
			return new k(t.lineNumber, t.column, n.lineNumber, n.column);
		}
		static lift(t) {
			return t
				? new k(
						t.startLineNumber,
						t.startColumn,
						t.endLineNumber,
						t.endColumn,
					)
				: null;
		}
		static isIRange(t) {
			return (
				t &&
				typeof t.startLineNumber == "number" &&
				typeof t.startColumn == "number" &&
				typeof t.endLineNumber == "number" &&
				typeof t.endColumn == "number"
			);
		}
		static areIntersectingOrTouching(t, n) {
			return !(
				t.endLineNumber < n.startLineNumber ||
				(t.endLineNumber === n.startLineNumber &&
					t.endColumn < n.startColumn) ||
				n.endLineNumber < t.startLineNumber ||
				(n.endLineNumber === t.startLineNumber &&
					n.endColumn < t.startColumn)
			);
		}
		static areIntersecting(t, n) {
			return !(
				t.endLineNumber < n.startLineNumber ||
				(t.endLineNumber === n.startLineNumber &&
					t.endColumn <= n.startColumn) ||
				n.endLineNumber < t.startLineNumber ||
				(n.endLineNumber === t.startLineNumber &&
					n.endColumn <= t.startColumn)
			);
		}
		static compareRangesUsingStarts(t, n) {
			if (t && n) {
				const i = t.startLineNumber | 0,
					o = n.startLineNumber | 0;
				if (i === o) {
					const l = t.startColumn | 0,
						u = n.startColumn | 0;
					if (l === u) {
						const c = t.endLineNumber | 0,
							f = n.endLineNumber | 0;
						if (c === f) {
							const h = t.endColumn | 0,
								d = n.endColumn | 0;
							return h - d;
						}
						return c - f;
					}
					return l - u;
				}
				return i - o;
			}
			return (t ? 1 : 0) - (n ? 1 : 0);
		}
		static compareRangesUsingEnds(t, n) {
			return t.endLineNumber === n.endLineNumber
				? t.endColumn === n.endColumn
					? t.startLineNumber === n.startLineNumber
						? t.startColumn - n.startColumn
						: t.startLineNumber - n.startLineNumber
					: t.endColumn - n.endColumn
				: t.endLineNumber - n.endLineNumber;
		}
		static spansMultipleLines(t) {
			return t.endLineNumber > t.startLineNumber;
		}
		toJSON() {
			return this;
		}
	}
	function gi(e, t, n = (s, r) => s === r) {
		if (e === t) return !0;
		if (!e || !t || e.length !== t.length) return !1;
		for (let s = 0, r = e.length; s < r; s++) if (!n(e[s], t[s])) return !1;
		return !0;
	}
	function* bi(e, t) {
		let n, s;
		for (const r of e)
			s !== void 0 && t(s, r) ? n.push(r) : (n && (yield n), (n = [r])),
				(s = r);
		n && (yield n);
	}
	function _i(e, t) {
		for (let n = 0; n <= e.length; n++)
			t(n === 0 ? void 0 : e[n - 1], n === e.length ? void 0 : e[n]);
	}
	function xi(e, t) {
		for (let n = 0; n < e.length; n++)
			t(
				n === 0 ? void 0 : e[n - 1],
				e[n],
				n + 1 === e.length ? void 0 : e[n + 1],
			);
	}
	function pi(e, t) {
		for (const n of t) e.push(n);
	}
	var Bt;
	(function (e) {
		function t(i) {
			return i < 0;
		}
		e.isLessThan = t;
		function n(i) {
			return i <= 0;
		}
		e.isLessThanOrEqual = n;
		function s(i) {
			return i > 0;
		}
		e.isGreaterThan = s;
		function r(i) {
			return i === 0;
		}
		(e.isNeitherLessOrGreaterThan = r),
			(e.greaterThan = 1),
			(e.lessThan = -1),
			(e.neitherLessOrGreaterThan = 0);
	})(Bt || (Bt = {}));
	function ut(e, t) {
		return (n, s) => t(e(n), e(s));
	}
	const ct = (e, t) => e - t;
	function wi(e) {
		return (t, n) => -e(t, n);
	}
	class ht {
		static {
			this.empty = new ht((t) => {});
		}
		constructor(t) {
			this.iterate = t;
		}
		toArray() {
			const t = [];
			return this.iterate((n) => (t.push(n), !0)), t;
		}
		filter(t) {
			return new ht((n) => this.iterate((s) => (t(s) ? n(s) : !0)));
		}
		map(t) {
			return new ht((n) => this.iterate((s) => n(t(s))));
		}
		findLast(t) {
			let n;
			return this.iterate((s) => (t(s) && (n = s), !0)), n;
		}
		findLastMaxBy(t) {
			let n,
				s = !0;
			return (
				this.iterate(
					(r) => (
						(s || Bt.isGreaterThan(t(r, n))) && ((s = !1), (n = r)),
						!0
					),
				),
				n
			);
		}
	}
	function Rn(e) {
		return e < 0 ? 0 : e > 255 ? 255 : e | 0;
	}
	function De(e) {
		return e < 0 ? 0 : e > 4294967295 ? 4294967295 : e | 0;
	}
	class Li {
		constructor(t) {
			(this.values = t),
				(this.prefixSum = new Uint32Array(t.length)),
				(this.prefixSumValidIndex = new Int32Array(1)),
				(this.prefixSumValidIndex[0] = -1);
		}
		insertValues(t, n) {
			t = De(t);
			const s = this.values,
				r = this.prefixSum,
				i = n.length;
			return i === 0
				? !1
				: ((this.values = new Uint32Array(s.length + i)),
					this.values.set(s.subarray(0, t), 0),
					this.values.set(s.subarray(t), t + i),
					this.values.set(n, t),
					t - 1 < this.prefixSumValidIndex[0] &&
						(this.prefixSumValidIndex[0] = t - 1),
					(this.prefixSum = new Uint32Array(this.values.length)),
					this.prefixSumValidIndex[0] >= 0 &&
						this.prefixSum.set(
							r.subarray(0, this.prefixSumValidIndex[0] + 1),
						),
					!0);
		}
		setValue(t, n) {
			return (
				(t = De(t)),
				(n = De(n)),
				this.values[t] === n
					? !1
					: ((this.values[t] = n),
						t - 1 < this.prefixSumValidIndex[0] &&
							(this.prefixSumValidIndex[0] = t - 1),
						!0)
			);
		}
		removeValues(t, n) {
			(t = De(t)), (n = De(n));
			const s = this.values,
				r = this.prefixSum;
			if (t >= s.length) return !1;
			const i = s.length - t;
			return (
				n >= i && (n = i),
				n === 0
					? !1
					: ((this.values = new Uint32Array(s.length - n)),
						this.values.set(s.subarray(0, t), 0),
						this.values.set(s.subarray(t + n), t),
						(this.prefixSum = new Uint32Array(this.values.length)),
						t - 1 < this.prefixSumValidIndex[0] &&
							(this.prefixSumValidIndex[0] = t - 1),
						this.prefixSumValidIndex[0] >= 0 &&
							this.prefixSum.set(
								r.subarray(0, this.prefixSumValidIndex[0] + 1),
							),
						!0)
			);
		}
		getTotalSum() {
			return this.values.length === 0
				? 0
				: this._getPrefixSum(this.values.length - 1);
		}
		getPrefixSum(t) {
			return t < 0 ? 0 : ((t = De(t)), this._getPrefixSum(t));
		}
		_getPrefixSum(t) {
			if (t <= this.prefixSumValidIndex[0]) return this.prefixSum[t];
			let n = this.prefixSumValidIndex[0] + 1;
			n === 0 && ((this.prefixSum[0] = this.values[0]), n++),
				t >= this.values.length && (t = this.values.length - 1);
			for (let s = n; s <= t; s++)
				this.prefixSum[s] = this.prefixSum[s - 1] + this.values[s];
			return (
				(this.prefixSumValidIndex[0] = Math.max(
					this.prefixSumValidIndex[0],
					t,
				)),
				this.prefixSum[t]
			);
		}
		getIndexOf(t) {
			(t = Math.floor(t)), this.getTotalSum();
			let n = 0,
				s = this.values.length - 1,
				r = 0,
				i = 0,
				o = 0;
			for (; n <= s; )
				if (
					((r = (n + (s - n) / 2) | 0),
					(i = this.prefixSum[r]),
					(o = i - this.values[r]),
					t < o)
				)
					s = r - 1;
				else if (t >= i) n = r + 1;
				else break;
			return new vi(r, t - o);
		}
	}
	class vi {
		constructor(t, n) {
			(this.index = t),
				(this.remainder = n),
				(this._prefixSumIndexOfResultBrand = void 0),
				(this.index = t),
				(this.remainder = n);
		}
	}
	class Ni {
		constructor(t, n, s, r) {
			(this._uri = t),
				(this._lines = n),
				(this._eol = s),
				(this._versionId = r),
				(this._lineStarts = null),
				(this._cachedTextValue = null);
		}
		dispose() {
			this._lines.length = 0;
		}
		get version() {
			return this._versionId;
		}
		getText() {
			return (
				this._cachedTextValue === null &&
					(this._cachedTextValue = this._lines.join(this._eol)),
				this._cachedTextValue
			);
		}
		onEvents(t) {
			t.eol &&
				t.eol !== this._eol &&
				((this._eol = t.eol), (this._lineStarts = null));
			const n = t.changes;
			for (const s of n)
				this._acceptDeleteRange(s.range),
					this._acceptInsertText(
						new q(s.range.startLineNumber, s.range.startColumn),
						s.text,
					);
			(this._versionId = t.versionId), (this._cachedTextValue = null);
		}
		_ensureLineStarts() {
			if (!this._lineStarts) {
				const t = this._eol.length,
					n = this._lines.length,
					s = new Uint32Array(n);
				for (let r = 0; r < n; r++) s[r] = this._lines[r].length + t;
				this._lineStarts = new Li(s);
			}
		}
		_setLineText(t, n) {
			(this._lines[t] = n),
				this._lineStarts &&
					this._lineStarts.setValue(
						t,
						this._lines[t].length + this._eol.length,
					);
		}
		_acceptDeleteRange(t) {
			if (t.startLineNumber === t.endLineNumber) {
				if (t.startColumn === t.endColumn) return;
				this._setLineText(
					t.startLineNumber - 1,
					this._lines[t.startLineNumber - 1].substring(
						0,
						t.startColumn - 1,
					) +
						this._lines[t.startLineNumber - 1].substring(
							t.endColumn - 1,
						),
				);
				return;
			}
			this._setLineText(
				t.startLineNumber - 1,
				this._lines[t.startLineNumber - 1].substring(
					0,
					t.startColumn - 1,
				) + this._lines[t.endLineNumber - 1].substring(t.endColumn - 1),
			),
				this._lines.splice(
					t.startLineNumber,
					t.endLineNumber - t.startLineNumber,
				),
				this._lineStarts &&
					this._lineStarts.removeValues(
						t.startLineNumber,
						t.endLineNumber - t.startLineNumber,
					);
		}
		_acceptInsertText(t, n) {
			if (n.length === 0) return;
			const s = Pr(n);
			if (s.length === 1) {
				this._setLineText(
					t.lineNumber - 1,
					this._lines[t.lineNumber - 1].substring(0, t.column - 1) +
						s[0] +
						this._lines[t.lineNumber - 1].substring(t.column - 1),
				);
				return;
			}
			(s[s.length - 1] += this._lines[t.lineNumber - 1].substring(
				t.column - 1,
			)),
				this._setLineText(
					t.lineNumber - 1,
					this._lines[t.lineNumber - 1].substring(0, t.column - 1) +
						s[0],
				);
			const r = new Uint32Array(s.length - 1);
			for (let i = 1; i < s.length; i++)
				this._lines.splice(t.lineNumber + i - 1, 0, s[i]),
					(r[i - 1] = s[i].length + this._eol.length);
			this._lineStarts && this._lineStarts.insertValues(t.lineNumber, r);
		}
	}
	const Si = "`~!@#$%^&*()-=+[{]}\\|;:'\",.<>/?";
	function Ci(e = "") {
		let t = "(-?\\d*\\.\\d\\w*)|([^";
		for (const n of Si) e.indexOf(n) >= 0 || (t += "\\" + n);
		return (t += "\\s]+)"), new RegExp(t, "g");
	}
	const yn = Ci();
	function En(e) {
		let t = yn;
		if (e && e instanceof RegExp)
			if (e.global) t = e;
			else {
				let n = "g";
				e.ignoreCase && (n += "i"),
					e.multiline && (n += "m"),
					e.unicode && (n += "u"),
					(t = new RegExp(e.source, n));
			}
		return (t.lastIndex = 0), t;
	}
	const Mn = new br();
	Mn.unshift({ maxLen: 1e3, windowSize: 15, timeBudget: 150 });
	function qt(e, t, n, s, r) {
		if (((t = En(t)), r || (r = Ke.first(Mn)), n.length > r.maxLen)) {
			let c = e - r.maxLen / 2;
			return (
				c < 0 ? (c = 0) : (s += c),
				(n = n.substring(c, e + r.maxLen / 2)),
				qt(e, t, n, s, r)
			);
		}
		const i = Date.now(),
			o = e - 1 - s;
		let l = -1,
			u = null;
		for (let c = 1; !(Date.now() - i >= r.timeBudget); c++) {
			const f = o - r.windowSize * c;
			t.lastIndex = Math.max(0, f);
			const h = Ai(t, n, o, l);
			if ((!h && u) || ((u = h), f <= 0)) break;
			l = f;
		}
		if (u) {
			const c = {
				word: u[0],
				startColumn: s + 1 + u.index,
				endColumn: s + 1 + u.index + u[0].length,
			};
			return (t.lastIndex = 0), c;
		}
		return null;
	}
	function Ai(e, t, n, s) {
		let r;
		for (; (r = e.exec(t)); ) {
			const i = r.index || 0;
			if (i <= n && e.lastIndex >= n) return r;
			if (s > 0 && i > s) return null;
		}
		return null;
	}
	class Ut {
		constructor(t) {
			const n = Rn(t);
			(this._defaultValue = n),
				(this._asciiMap = Ut._createAsciiMap(n)),
				(this._map = new Map());
		}
		static _createAsciiMap(t) {
			const n = new Uint8Array(256);
			return n.fill(t), n;
		}
		set(t, n) {
			const s = Rn(n);
			t >= 0 && t < 256 ? (this._asciiMap[t] = s) : this._map.set(t, s);
		}
		get(t) {
			return t >= 0 && t < 256
				? this._asciiMap[t]
				: this._map.get(t) || this._defaultValue;
		}
		clear() {
			this._asciiMap.fill(this._defaultValue), this._map.clear();
		}
	}
	class Ri {
		constructor(t, n, s) {
			const r = new Uint8Array(t * n);
			for (let i = 0, o = t * n; i < o; i++) r[i] = s;
			(this._data = r), (this.rows = t), (this.cols = n);
		}
		get(t, n) {
			return this._data[t * this.cols + n];
		}
		set(t, n, s) {
			this._data[t * this.cols + n] = s;
		}
	}
	class yi {
		constructor(t) {
			let n = 0,
				s = 0;
			for (let i = 0, o = t.length; i < o; i++) {
				const [l, u, c] = t[i];
				u > n && (n = u), l > s && (s = l), c > s && (s = c);
			}
			n++, s++;
			const r = new Ri(s, n, 0);
			for (let i = 0, o = t.length; i < o; i++) {
				const [l, u, c] = t[i];
				r.set(l, u, c);
			}
			(this._states = r), (this._maxCharCode = n);
		}
		nextState(t, n) {
			return n < 0 || n >= this._maxCharCode ? 0 : this._states.get(t, n);
		}
	}
	let Ht = null;
	function Ei() {
		return (
			Ht === null &&
				(Ht = new yi([
					[1, 104, 2],
					[1, 72, 2],
					[1, 102, 6],
					[1, 70, 6],
					[2, 116, 3],
					[2, 84, 3],
					[3, 116, 4],
					[3, 84, 4],
					[4, 112, 5],
					[4, 80, 5],
					[5, 115, 9],
					[5, 83, 9],
					[5, 58, 10],
					[6, 105, 7],
					[6, 73, 7],
					[7, 108, 8],
					[7, 76, 8],
					[8, 101, 9],
					[8, 69, 9],
					[9, 58, 10],
					[10, 47, 11],
					[11, 47, 12],
				])),
			Ht
		);
	}
	let ze = null;
	function Mi() {
		if (ze === null) {
			ze = new Ut(0);
			const e = ` 	<>'"、。｡､，．：；‘〈「『〔（［｛｢｣｝］）〕』」〉’｀～…`;
			for (let n = 0; n < e.length; n++) ze.set(e.charCodeAt(n), 1);
			const t = ".,;:";
			for (let n = 0; n < t.length; n++) ze.set(t.charCodeAt(n), 2);
		}
		return ze;
	}
	class ft {
		static _createLink(t, n, s, r, i) {
			let o = i - 1;
			do {
				const l = n.charCodeAt(o);
				if (t.get(l) !== 2) break;
				o--;
			} while (o > r);
			if (r > 0) {
				const l = n.charCodeAt(r - 1),
					u = n.charCodeAt(o);
				((l === 40 && u === 41) ||
					(l === 91 && u === 93) ||
					(l === 123 && u === 125)) &&
					o--;
			}
			return {
				range: {
					startLineNumber: s,
					startColumn: r + 1,
					endLineNumber: s,
					endColumn: o + 2,
				},
				url: n.substring(r, o + 1),
			};
		}
		static computeLinks(t, n = Ei()) {
			const s = Mi(),
				r = [];
			for (let i = 1, o = t.getLineCount(); i <= o; i++) {
				const l = t.getLineContent(i),
					u = l.length;
				let c = 0,
					f = 0,
					h = 0,
					d = 1,
					m = !1,
					g = !1,
					b = !1,
					w = !1;
				for (; c < u; ) {
					let v = !1;
					const C = l.charCodeAt(c);
					if (d === 13) {
						let S;
						switch (C) {
							case 40:
								(m = !0), (S = 0);
								break;
							case 41:
								S = m ? 0 : 1;
								break;
							case 91:
								(b = !0), (g = !0), (S = 0);
								break;
							case 93:
								(b = !1), (S = g ? 0 : 1);
								break;
							case 123:
								(w = !0), (S = 0);
								break;
							case 125:
								S = w ? 0 : 1;
								break;
							case 39:
							case 34:
							case 96:
								h === C
									? (S = 1)
									: h === 39 || h === 34 || h === 96
										? (S = 0)
										: (S = 1);
								break;
							case 42:
								S = h === 42 ? 1 : 0;
								break;
							case 124:
								S = h === 124 ? 1 : 0;
								break;
							case 32:
								S = b ? 0 : 1;
								break;
							default:
								S = s.get(C);
						}
						S === 1 &&
							(r.push(ft._createLink(s, l, i, f, c)), (v = !0));
					} else if (d === 12) {
						let S;
						C === 91 ? ((g = !0), (S = 0)) : (S = s.get(C)),
							S === 1 ? (v = !0) : (d = 13);
					} else (d = n.nextState(d, C)), d === 0 && (v = !0);
					v &&
						((d = 1),
						(m = !1),
						(g = !1),
						(w = !1),
						(f = c + 1),
						(h = C)),
						c++;
				}
				d === 13 && r.push(ft._createLink(s, l, i, f, u));
			}
			return r;
		}
	}
	function ki(e) {
		return !e ||
			typeof e.getLineCount != "function" ||
			typeof e.getLineContent != "function"
			? []
			: ft.computeLinks(e);
	}
	class Wt {
		constructor() {
			this._defaultValueSet = [
				["true", "false"],
				["True", "False"],
				[
					"Private",
					"Public",
					"Friend",
					"ReadOnly",
					"Partial",
					"Protected",
					"WriteOnly",
				],
				["public", "protected", "private"],
			];
		}
		static {
			this.INSTANCE = new Wt();
		}
		navigateValueSet(t, n, s, r, i) {
			if (t && n) {
				const o = this.doNavigateValueSet(n, i);
				if (o) return { range: t, value: o };
			}
			if (s && r) {
				const o = this.doNavigateValueSet(r, i);
				if (o) return { range: s, value: o };
			}
			return null;
		}
		doNavigateValueSet(t, n) {
			const s = this.numberReplace(t, n);
			return s !== null ? s : this.textReplace(t, n);
		}
		numberReplace(t, n) {
			const s = Math.pow(10, t.length - (t.lastIndexOf(".") + 1));
			let r = Number(t);
			const i = parseFloat(t);
			return !isNaN(r) && !isNaN(i) && r === i
				? r === 0 && !n
					? null
					: ((r = Math.floor(r * s)),
						(r += n ? s : -s),
						String(r / s))
				: null;
		}
		textReplace(t, n) {
			return this.valueSetsReplace(this._defaultValueSet, t, n);
		}
		valueSetsReplace(t, n, s) {
			let r = null;
			for (let i = 0, o = t.length; r === null && i < o; i++)
				r = this.valueSetReplace(t[i], n, s);
			return r;
		}
		valueSetReplace(t, n, s) {
			let r = t.indexOf(n);
			return r >= 0
				? ((r += s ? 1 : -1),
					r < 0 ? (r = t.length - 1) : (r %= t.length),
					t[r])
				: null;
		}
	}
	const kn = Object.freeze(function (e, t) {
		const n = setTimeout(e.bind(t), 0);
		return {
			dispose() {
				clearTimeout(n);
			},
		};
	});
	var dt;
	(function (e) {
		function t(n) {
			return n === e.None || n === e.Cancelled || n instanceof mt
				? !0
				: !n || typeof n != "object"
					? !1
					: typeof n.isCancellationRequested == "boolean" &&
						typeof n.onCancellationRequested == "function";
		}
		(e.isCancellationToken = t),
			(e.None = Object.freeze({
				isCancellationRequested: !1,
				onCancellationRequested: Nt.None,
			})),
			(e.Cancelled = Object.freeze({
				isCancellationRequested: !0,
				onCancellationRequested: kn,
			}));
	})(dt || (dt = {}));
	class mt {
		constructor() {
			(this._isCancelled = !1), (this._emitter = null);
		}
		cancel() {
			this._isCancelled ||
				((this._isCancelled = !0),
				this._emitter && (this._emitter.fire(void 0), this.dispose()));
		}
		get isCancellationRequested() {
			return this._isCancelled;
		}
		get onCancellationRequested() {
			return this._isCancelled
				? kn
				: (this._emitter || (this._emitter = new ae()),
					this._emitter.event);
		}
		dispose() {
			this._emitter && (this._emitter.dispose(), (this._emitter = null));
		}
	}
	class Fi {
		constructor(t) {
			(this._token = void 0),
				(this._parentListener = void 0),
				(this._parentListener =
					t && t.onCancellationRequested(this.cancel, this));
		}
		get token() {
			return this._token || (this._token = new mt()), this._token;
		}
		cancel() {
			this._token
				? this._token instanceof mt && this._token.cancel()
				: (this._token = dt.Cancelled);
		}
		dispose(t = !1) {
			t && this.cancel(),
				this._parentListener?.dispose(),
				this._token
					? this._token instanceof mt && this._token.dispose()
					: (this._token = dt.None);
		}
	}
	class zt {
		constructor() {
			(this._keyCodeToStr = []),
				(this._strToKeyCode = Object.create(null));
		}
		define(t, n) {
			(this._keyCodeToStr[t] = n),
				(this._strToKeyCode[n.toLowerCase()] = t);
		}
		keyCodeToStr(t) {
			return this._keyCodeToStr[t];
		}
		strToKeyCode(t) {
			return this._strToKeyCode[t.toLowerCase()] || 0;
		}
	}
	const gt = new zt(),
		$t = new zt(),
		Gt = new zt(),
		Di = new Array(230),
		Pi = Object.create(null),
		Ti = Object.create(null);
	(function () {
		const e = "",
			t = [
				[1, 0, "None", 0, "unknown", 0, "VK_UNKNOWN", e, e],
				[1, 1, "Hyper", 0, e, 0, e, e, e],
				[1, 2, "Super", 0, e, 0, e, e, e],
				[1, 3, "Fn", 0, e, 0, e, e, e],
				[1, 4, "FnLock", 0, e, 0, e, e, e],
				[1, 5, "Suspend", 0, e, 0, e, e, e],
				[1, 6, "Resume", 0, e, 0, e, e, e],
				[1, 7, "Turbo", 0, e, 0, e, e, e],
				[1, 8, "Sleep", 0, e, 0, "VK_SLEEP", e, e],
				[1, 9, "WakeUp", 0, e, 0, e, e, e],
				[0, 10, "KeyA", 31, "A", 65, "VK_A", e, e],
				[0, 11, "KeyB", 32, "B", 66, "VK_B", e, e],
				[0, 12, "KeyC", 33, "C", 67, "VK_C", e, e],
				[0, 13, "KeyD", 34, "D", 68, "VK_D", e, e],
				[0, 14, "KeyE", 35, "E", 69, "VK_E", e, e],
				[0, 15, "KeyF", 36, "F", 70, "VK_F", e, e],
				[0, 16, "KeyG", 37, "G", 71, "VK_G", e, e],
				[0, 17, "KeyH", 38, "H", 72, "VK_H", e, e],
				[0, 18, "KeyI", 39, "I", 73, "VK_I", e, e],
				[0, 19, "KeyJ", 40, "J", 74, "VK_J", e, e],
				[0, 20, "KeyK", 41, "K", 75, "VK_K", e, e],
				[0, 21, "KeyL", 42, "L", 76, "VK_L", e, e],
				[0, 22, "KeyM", 43, "M", 77, "VK_M", e, e],
				[0, 23, "KeyN", 44, "N", 78, "VK_N", e, e],
				[0, 24, "KeyO", 45, "O", 79, "VK_O", e, e],
				[0, 25, "KeyP", 46, "P", 80, "VK_P", e, e],
				[0, 26, "KeyQ", 47, "Q", 81, "VK_Q", e, e],
				[0, 27, "KeyR", 48, "R", 82, "VK_R", e, e],
				[0, 28, "KeyS", 49, "S", 83, "VK_S", e, e],
				[0, 29, "KeyT", 50, "T", 84, "VK_T", e, e],
				[0, 30, "KeyU", 51, "U", 85, "VK_U", e, e],
				[0, 31, "KeyV", 52, "V", 86, "VK_V", e, e],
				[0, 32, "KeyW", 53, "W", 87, "VK_W", e, e],
				[0, 33, "KeyX", 54, "X", 88, "VK_X", e, e],
				[0, 34, "KeyY", 55, "Y", 89, "VK_Y", e, e],
				[0, 35, "KeyZ", 56, "Z", 90, "VK_Z", e, e],
				[0, 36, "Digit1", 22, "1", 49, "VK_1", e, e],
				[0, 37, "Digit2", 23, "2", 50, "VK_2", e, e],
				[0, 38, "Digit3", 24, "3", 51, "VK_3", e, e],
				[0, 39, "Digit4", 25, "4", 52, "VK_4", e, e],
				[0, 40, "Digit5", 26, "5", 53, "VK_5", e, e],
				[0, 41, "Digit6", 27, "6", 54, "VK_6", e, e],
				[0, 42, "Digit7", 28, "7", 55, "VK_7", e, e],
				[0, 43, "Digit8", 29, "8", 56, "VK_8", e, e],
				[0, 44, "Digit9", 30, "9", 57, "VK_9", e, e],
				[0, 45, "Digit0", 21, "0", 48, "VK_0", e, e],
				[1, 46, "Enter", 3, "Enter", 13, "VK_RETURN", e, e],
				[1, 47, "Escape", 9, "Escape", 27, "VK_ESCAPE", e, e],
				[1, 48, "Backspace", 1, "Backspace", 8, "VK_BACK", e, e],
				[1, 49, "Tab", 2, "Tab", 9, "VK_TAB", e, e],
				[1, 50, "Space", 10, "Space", 32, "VK_SPACE", e, e],
				[
					0,
					51,
					"Minus",
					88,
					"-",
					189,
					"VK_OEM_MINUS",
					"-",
					"OEM_MINUS",
				],
				[0, 52, "Equal", 86, "=", 187, "VK_OEM_PLUS", "=", "OEM_PLUS"],
				[0, 53, "BracketLeft", 92, "[", 219, "VK_OEM_4", "[", "OEM_4"],
				[0, 54, "BracketRight", 94, "]", 221, "VK_OEM_6", "]", "OEM_6"],
				[0, 55, "Backslash", 93, "\\", 220, "VK_OEM_5", "\\", "OEM_5"],
				[0, 56, "IntlHash", 0, e, 0, e, e, e],
				[0, 57, "Semicolon", 85, ";", 186, "VK_OEM_1", ";", "OEM_1"],
				[0, 58, "Quote", 95, "'", 222, "VK_OEM_7", "'", "OEM_7"],
				[0, 59, "Backquote", 91, "`", 192, "VK_OEM_3", "`", "OEM_3"],
				[
					0,
					60,
					"Comma",
					87,
					",",
					188,
					"VK_OEM_COMMA",
					",",
					"OEM_COMMA",
				],
				[
					0,
					61,
					"Period",
					89,
					".",
					190,
					"VK_OEM_PERIOD",
					".",
					"OEM_PERIOD",
				],
				[0, 62, "Slash", 90, "/", 191, "VK_OEM_2", "/", "OEM_2"],
				[1, 63, "CapsLock", 8, "CapsLock", 20, "VK_CAPITAL", e, e],
				[1, 64, "F1", 59, "F1", 112, "VK_F1", e, e],
				[1, 65, "F2", 60, "F2", 113, "VK_F2", e, e],
				[1, 66, "F3", 61, "F3", 114, "VK_F3", e, e],
				[1, 67, "F4", 62, "F4", 115, "VK_F4", e, e],
				[1, 68, "F5", 63, "F5", 116, "VK_F5", e, e],
				[1, 69, "F6", 64, "F6", 117, "VK_F6", e, e],
				[1, 70, "F7", 65, "F7", 118, "VK_F7", e, e],
				[1, 71, "F8", 66, "F8", 119, "VK_F8", e, e],
				[1, 72, "F9", 67, "F9", 120, "VK_F9", e, e],
				[1, 73, "F10", 68, "F10", 121, "VK_F10", e, e],
				[1, 74, "F11", 69, "F11", 122, "VK_F11", e, e],
				[1, 75, "F12", 70, "F12", 123, "VK_F12", e, e],
				[1, 76, "PrintScreen", 0, e, 0, e, e, e],
				[1, 77, "ScrollLock", 84, "ScrollLock", 145, "VK_SCROLL", e, e],
				[1, 78, "Pause", 7, "PauseBreak", 19, "VK_PAUSE", e, e],
				[1, 79, "Insert", 19, "Insert", 45, "VK_INSERT", e, e],
				[1, 80, "Home", 14, "Home", 36, "VK_HOME", e, e],
				[1, 81, "PageUp", 11, "PageUp", 33, "VK_PRIOR", e, e],
				[1, 82, "Delete", 20, "Delete", 46, "VK_DELETE", e, e],
				[1, 83, "End", 13, "End", 35, "VK_END", e, e],
				[1, 84, "PageDown", 12, "PageDown", 34, "VK_NEXT", e, e],
				[
					1,
					85,
					"ArrowRight",
					17,
					"RightArrow",
					39,
					"VK_RIGHT",
					"Right",
					e,
				],
				[1, 86, "ArrowLeft", 15, "LeftArrow", 37, "VK_LEFT", "Left", e],
				[1, 87, "ArrowDown", 18, "DownArrow", 40, "VK_DOWN", "Down", e],
				[1, 88, "ArrowUp", 16, "UpArrow", 38, "VK_UP", "Up", e],
				[1, 89, "NumLock", 83, "NumLock", 144, "VK_NUMLOCK", e, e],
				[
					1,
					90,
					"NumpadDivide",
					113,
					"NumPad_Divide",
					111,
					"VK_DIVIDE",
					e,
					e,
				],
				[
					1,
					91,
					"NumpadMultiply",
					108,
					"NumPad_Multiply",
					106,
					"VK_MULTIPLY",
					e,
					e,
				],
				[
					1,
					92,
					"NumpadSubtract",
					111,
					"NumPad_Subtract",
					109,
					"VK_SUBTRACT",
					e,
					e,
				],
				[1, 93, "NumpadAdd", 109, "NumPad_Add", 107, "VK_ADD", e, e],
				[1, 94, "NumpadEnter", 3, e, 0, e, e, e],
				[1, 95, "Numpad1", 99, "NumPad1", 97, "VK_NUMPAD1", e, e],
				[1, 96, "Numpad2", 100, "NumPad2", 98, "VK_NUMPAD2", e, e],
				[1, 97, "Numpad3", 101, "NumPad3", 99, "VK_NUMPAD3", e, e],
				[1, 98, "Numpad4", 102, "NumPad4", 100, "VK_NUMPAD4", e, e],
				[1, 99, "Numpad5", 103, "NumPad5", 101, "VK_NUMPAD5", e, e],
				[1, 100, "Numpad6", 104, "NumPad6", 102, "VK_NUMPAD6", e, e],
				[1, 101, "Numpad7", 105, "NumPad7", 103, "VK_NUMPAD7", e, e],
				[1, 102, "Numpad8", 106, "NumPad8", 104, "VK_NUMPAD8", e, e],
				[1, 103, "Numpad9", 107, "NumPad9", 105, "VK_NUMPAD9", e, e],
				[1, 104, "Numpad0", 98, "NumPad0", 96, "VK_NUMPAD0", e, e],
				[
					1,
					105,
					"NumpadDecimal",
					112,
					"NumPad_Decimal",
					110,
					"VK_DECIMAL",
					e,
					e,
				],
				[
					0,
					106,
					"IntlBackslash",
					97,
					"OEM_102",
					226,
					"VK_OEM_102",
					e,
					e,
				],
				[1, 107, "ContextMenu", 58, "ContextMenu", 93, e, e, e],
				[1, 108, "Power", 0, e, 0, e, e, e],
				[1, 109, "NumpadEqual", 0, e, 0, e, e, e],
				[1, 110, "F13", 71, "F13", 124, "VK_F13", e, e],
				[1, 111, "F14", 72, "F14", 125, "VK_F14", e, e],
				[1, 112, "F15", 73, "F15", 126, "VK_F15", e, e],
				[1, 113, "F16", 74, "F16", 127, "VK_F16", e, e],
				[1, 114, "F17", 75, "F17", 128, "VK_F17", e, e],
				[1, 115, "F18", 76, "F18", 129, "VK_F18", e, e],
				[1, 116, "F19", 77, "F19", 130, "VK_F19", e, e],
				[1, 117, "F20", 78, "F20", 131, "VK_F20", e, e],
				[1, 118, "F21", 79, "F21", 132, "VK_F21", e, e],
				[1, 119, "F22", 80, "F22", 133, "VK_F22", e, e],
				[1, 120, "F23", 81, "F23", 134, "VK_F23", e, e],
				[1, 121, "F24", 82, "F24", 135, "VK_F24", e, e],
				[1, 122, "Open", 0, e, 0, e, e, e],
				[1, 123, "Help", 0, e, 0, e, e, e],
				[1, 124, "Select", 0, e, 0, e, e, e],
				[1, 125, "Again", 0, e, 0, e, e, e],
				[1, 126, "Undo", 0, e, 0, e, e, e],
				[1, 127, "Cut", 0, e, 0, e, e, e],
				[1, 128, "Copy", 0, e, 0, e, e, e],
				[1, 129, "Paste", 0, e, 0, e, e, e],
				[1, 130, "Find", 0, e, 0, e, e, e],
				[
					1,
					131,
					"AudioVolumeMute",
					117,
					"AudioVolumeMute",
					173,
					"VK_VOLUME_MUTE",
					e,
					e,
				],
				[
					1,
					132,
					"AudioVolumeUp",
					118,
					"AudioVolumeUp",
					175,
					"VK_VOLUME_UP",
					e,
					e,
				],
				[
					1,
					133,
					"AudioVolumeDown",
					119,
					"AudioVolumeDown",
					174,
					"VK_VOLUME_DOWN",
					e,
					e,
				],
				[
					1,
					134,
					"NumpadComma",
					110,
					"NumPad_Separator",
					108,
					"VK_SEPARATOR",
					e,
					e,
				],
				[0, 135, "IntlRo", 115, "ABNT_C1", 193, "VK_ABNT_C1", e, e],
				[1, 136, "KanaMode", 0, e, 0, e, e, e],
				[0, 137, "IntlYen", 0, e, 0, e, e, e],
				[1, 138, "Convert", 0, e, 0, e, e, e],
				[1, 139, "NonConvert", 0, e, 0, e, e, e],
				[1, 140, "Lang1", 0, e, 0, e, e, e],
				[1, 141, "Lang2", 0, e, 0, e, e, e],
				[1, 142, "Lang3", 0, e, 0, e, e, e],
				[1, 143, "Lang4", 0, e, 0, e, e, e],
				[1, 144, "Lang5", 0, e, 0, e, e, e],
				[1, 145, "Abort", 0, e, 0, e, e, e],
				[1, 146, "Props", 0, e, 0, e, e, e],
				[1, 147, "NumpadParenLeft", 0, e, 0, e, e, e],
				[1, 148, "NumpadParenRight", 0, e, 0, e, e, e],
				[1, 149, "NumpadBackspace", 0, e, 0, e, e, e],
				[1, 150, "NumpadMemoryStore", 0, e, 0, e, e, e],
				[1, 151, "NumpadMemoryRecall", 0, e, 0, e, e, e],
				[1, 152, "NumpadMemoryClear", 0, e, 0, e, e, e],
				[1, 153, "NumpadMemoryAdd", 0, e, 0, e, e, e],
				[1, 154, "NumpadMemorySubtract", 0, e, 0, e, e, e],
				[1, 155, "NumpadClear", 131, "Clear", 12, "VK_CLEAR", e, e],
				[1, 156, "NumpadClearEntry", 0, e, 0, e, e, e],
				[1, 0, e, 5, "Ctrl", 17, "VK_CONTROL", e, e],
				[1, 0, e, 4, "Shift", 16, "VK_SHIFT", e, e],
				[1, 0, e, 6, "Alt", 18, "VK_MENU", e, e],
				[1, 0, e, 57, "Meta", 91, "VK_COMMAND", e, e],
				[1, 157, "ControlLeft", 5, e, 0, "VK_LCONTROL", e, e],
				[1, 158, "ShiftLeft", 4, e, 0, "VK_LSHIFT", e, e],
				[1, 159, "AltLeft", 6, e, 0, "VK_LMENU", e, e],
				[1, 160, "MetaLeft", 57, e, 0, "VK_LWIN", e, e],
				[1, 161, "ControlRight", 5, e, 0, "VK_RCONTROL", e, e],
				[1, 162, "ShiftRight", 4, e, 0, "VK_RSHIFT", e, e],
				[1, 163, "AltRight", 6, e, 0, "VK_RMENU", e, e],
				[1, 164, "MetaRight", 57, e, 0, "VK_RWIN", e, e],
				[1, 165, "BrightnessUp", 0, e, 0, e, e, e],
				[1, 166, "BrightnessDown", 0, e, 0, e, e, e],
				[1, 167, "MediaPlay", 0, e, 0, e, e, e],
				[1, 168, "MediaRecord", 0, e, 0, e, e, e],
				[1, 169, "MediaFastForward", 0, e, 0, e, e, e],
				[1, 170, "MediaRewind", 0, e, 0, e, e, e],
				[
					1,
					171,
					"MediaTrackNext",
					124,
					"MediaTrackNext",
					176,
					"VK_MEDIA_NEXT_TRACK",
					e,
					e,
				],
				[
					1,
					172,
					"MediaTrackPrevious",
					125,
					"MediaTrackPrevious",
					177,
					"VK_MEDIA_PREV_TRACK",
					e,
					e,
				],
				[
					1,
					173,
					"MediaStop",
					126,
					"MediaStop",
					178,
					"VK_MEDIA_STOP",
					e,
					e,
				],
				[1, 174, "Eject", 0, e, 0, e, e, e],
				[
					1,
					175,
					"MediaPlayPause",
					127,
					"MediaPlayPause",
					179,
					"VK_MEDIA_PLAY_PAUSE",
					e,
					e,
				],
				[
					1,
					176,
					"MediaSelect",
					128,
					"LaunchMediaPlayer",
					181,
					"VK_MEDIA_LAUNCH_MEDIA_SELECT",
					e,
					e,
				],
				[
					1,
					177,
					"LaunchMail",
					129,
					"LaunchMail",
					180,
					"VK_MEDIA_LAUNCH_MAIL",
					e,
					e,
				],
				[
					1,
					178,
					"LaunchApp2",
					130,
					"LaunchApp2",
					183,
					"VK_MEDIA_LAUNCH_APP2",
					e,
					e,
				],
				[1, 179, "LaunchApp1", 0, e, 0, "VK_MEDIA_LAUNCH_APP1", e, e],
				[1, 180, "SelectTask", 0, e, 0, e, e, e],
				[1, 181, "LaunchScreenSaver", 0, e, 0, e, e, e],
				[
					1,
					182,
					"BrowserSearch",
					120,
					"BrowserSearch",
					170,
					"VK_BROWSER_SEARCH",
					e,
					e,
				],
				[
					1,
					183,
					"BrowserHome",
					121,
					"BrowserHome",
					172,
					"VK_BROWSER_HOME",
					e,
					e,
				],
				[
					1,
					184,
					"BrowserBack",
					122,
					"BrowserBack",
					166,
					"VK_BROWSER_BACK",
					e,
					e,
				],
				[
					1,
					185,
					"BrowserForward",
					123,
					"BrowserForward",
					167,
					"VK_BROWSER_FORWARD",
					e,
					e,
				],
				[1, 186, "BrowserStop", 0, e, 0, "VK_BROWSER_STOP", e, e],
				[1, 187, "BrowserRefresh", 0, e, 0, "VK_BROWSER_REFRESH", e, e],
				[
					1,
					188,
					"BrowserFavorites",
					0,
					e,
					0,
					"VK_BROWSER_FAVORITES",
					e,
					e,
				],
				[1, 189, "ZoomToggle", 0, e, 0, e, e, e],
				[1, 190, "MailReply", 0, e, 0, e, e, e],
				[1, 191, "MailForward", 0, e, 0, e, e, e],
				[1, 192, "MailSend", 0, e, 0, e, e, e],
				[1, 0, e, 114, "KeyInComposition", 229, e, e, e],
				[1, 0, e, 116, "ABNT_C2", 194, "VK_ABNT_C2", e, e],
				[1, 0, e, 96, "OEM_8", 223, "VK_OEM_8", e, e],
				[1, 0, e, 0, e, 0, "VK_KANA", e, e],
				[1, 0, e, 0, e, 0, "VK_HANGUL", e, e],
				[1, 0, e, 0, e, 0, "VK_JUNJA", e, e],
				[1, 0, e, 0, e, 0, "VK_FINAL", e, e],
				[1, 0, e, 0, e, 0, "VK_HANJA", e, e],
				[1, 0, e, 0, e, 0, "VK_KANJI", e, e],
				[1, 0, e, 0, e, 0, "VK_CONVERT", e, e],
				[1, 0, e, 0, e, 0, "VK_NONCONVERT", e, e],
				[1, 0, e, 0, e, 0, "VK_ACCEPT", e, e],
				[1, 0, e, 0, e, 0, "VK_MODECHANGE", e, e],
				[1, 0, e, 0, e, 0, "VK_SELECT", e, e],
				[1, 0, e, 0, e, 0, "VK_PRINT", e, e],
				[1, 0, e, 0, e, 0, "VK_EXECUTE", e, e],
				[1, 0, e, 0, e, 0, "VK_SNAPSHOT", e, e],
				[1, 0, e, 0, e, 0, "VK_HELP", e, e],
				[1, 0, e, 0, e, 0, "VK_APPS", e, e],
				[1, 0, e, 0, e, 0, "VK_PROCESSKEY", e, e],
				[1, 0, e, 0, e, 0, "VK_PACKET", e, e],
				[1, 0, e, 0, e, 0, "VK_DBE_SBCSCHAR", e, e],
				[1, 0, e, 0, e, 0, "VK_DBE_DBCSCHAR", e, e],
				[1, 0, e, 0, e, 0, "VK_ATTN", e, e],
				[1, 0, e, 0, e, 0, "VK_CRSEL", e, e],
				[1, 0, e, 0, e, 0, "VK_EXSEL", e, e],
				[1, 0, e, 0, e, 0, "VK_EREOF", e, e],
				[1, 0, e, 0, e, 0, "VK_PLAY", e, e],
				[1, 0, e, 0, e, 0, "VK_ZOOM", e, e],
				[1, 0, e, 0, e, 0, "VK_NONAME", e, e],
				[1, 0, e, 0, e, 0, "VK_PA1", e, e],
				[1, 0, e, 0, e, 0, "VK_OEM_CLEAR", e, e],
			],
			n = [],
			s = [];
		for (const r of t) {
			const [i, o, l, u, c, f, h, d, m] = r;
			if (
				(s[o] || ((s[o] = !0), (Pi[l] = o), (Ti[l.toLowerCase()] = o)),
				!n[u])
			) {
				if (((n[u] = !0), !c))
					throw new Error(
						`String representation missing for key code ${u} around scan code ${l}`,
					);
				gt.define(u, c),
					$t.define(u, d || c),
					Gt.define(u, m || d || c);
			}
			f && (Di[f] = u);
		}
	})();
	var Fn;
	(function (e) {
		function t(l) {
			return gt.keyCodeToStr(l);
		}
		e.toString = t;
		function n(l) {
			return gt.strToKeyCode(l);
		}
		e.fromString = n;
		function s(l) {
			return $t.keyCodeToStr(l);
		}
		e.toUserSettingsUS = s;
		function r(l) {
			return Gt.keyCodeToStr(l);
		}
		e.toUserSettingsGeneral = r;
		function i(l) {
			return $t.strToKeyCode(l) || Gt.strToKeyCode(l);
		}
		e.fromUserSettings = i;
		function o(l) {
			if (l >= 98 && l <= 113) return null;
			switch (l) {
				case 16:
					return "Up";
				case 18:
					return "Down";
				case 15:
					return "Left";
				case 17:
					return "Right";
			}
			return gt.keyCodeToStr(l);
		}
		e.toElectronAccelerator = o;
	})(Fn || (Fn = {}));
	function Vi(e, t) {
		const n = ((t & 65535) << 16) >>> 0;
		return (e | n) >>> 0;
	}
	class se extends k {
		constructor(t, n, s, r) {
			super(t, n, s, r),
				(this.selectionStartLineNumber = t),
				(this.selectionStartColumn = n),
				(this.positionLineNumber = s),
				(this.positionColumn = r);
		}
		toString() {
			return (
				"[" +
				this.selectionStartLineNumber +
				"," +
				this.selectionStartColumn +
				" -> " +
				this.positionLineNumber +
				"," +
				this.positionColumn +
				"]"
			);
		}
		equalsSelection(t) {
			return se.selectionsEqual(this, t);
		}
		static selectionsEqual(t, n) {
			return (
				t.selectionStartLineNumber === n.selectionStartLineNumber &&
				t.selectionStartColumn === n.selectionStartColumn &&
				t.positionLineNumber === n.positionLineNumber &&
				t.positionColumn === n.positionColumn
			);
		}
		getDirection() {
			return this.selectionStartLineNumber === this.startLineNumber &&
				this.selectionStartColumn === this.startColumn
				? 0
				: 1;
		}
		setEndPosition(t, n) {
			return this.getDirection() === 0
				? new se(this.startLineNumber, this.startColumn, t, n)
				: new se(t, n, this.startLineNumber, this.startColumn);
		}
		getPosition() {
			return new q(this.positionLineNumber, this.positionColumn);
		}
		getSelectionStart() {
			return new q(
				this.selectionStartLineNumber,
				this.selectionStartColumn,
			);
		}
		setStartPosition(t, n) {
			return this.getDirection() === 0
				? new se(t, n, this.endLineNumber, this.endColumn)
				: new se(this.endLineNumber, this.endColumn, t, n);
		}
		static fromPositions(t, n = t) {
			return new se(t.lineNumber, t.column, n.lineNumber, n.column);
		}
		static fromRange(t, n) {
			return n === 0
				? new se(
						t.startLineNumber,
						t.startColumn,
						t.endLineNumber,
						t.endColumn,
					)
				: new se(
						t.endLineNumber,
						t.endColumn,
						t.startLineNumber,
						t.startColumn,
					);
		}
		static liftSelection(t) {
			return new se(
				t.selectionStartLineNumber,
				t.selectionStartColumn,
				t.positionLineNumber,
				t.positionColumn,
			);
		}
		static selectionsArrEqual(t, n) {
			if ((t && !n) || (!t && n)) return !1;
			if (!t && !n) return !0;
			if (t.length !== n.length) return !1;
			for (let s = 0, r = t.length; s < r; s++)
				if (!this.selectionsEqual(t[s], n[s])) return !1;
			return !0;
		}
		static isISelection(t) {
			return (
				t &&
				typeof t.selectionStartLineNumber == "number" &&
				typeof t.selectionStartColumn == "number" &&
				typeof t.positionLineNumber == "number" &&
				typeof t.positionColumn == "number"
			);
		}
		static createWithDirection(t, n, s, r, i) {
			return i === 0 ? new se(t, n, s, r) : new se(s, r, t, n);
		}
	}
	const Dn = Object.create(null);
	function a(e, t) {
		if (Nr(t)) {
			const n = Dn[t];
			if (n === void 0)
				throw new Error(`${e} references an unknown codicon: ${t}`);
			t = n;
		}
		return (Dn[e] = t), { id: e };
	}
	const Ii = {
			add: a("add", 6e4),
			plus: a("plus", 6e4),
			gistNew: a("gist-new", 6e4),
			repoCreate: a("repo-create", 6e4),
			lightbulb: a("lightbulb", 60001),
			lightBulb: a("light-bulb", 60001),
			repo: a("repo", 60002),
			repoDelete: a("repo-delete", 60002),
			gistFork: a("gist-fork", 60003),
			repoForked: a("repo-forked", 60003),
			gitPullRequest: a("git-pull-request", 60004),
			gitPullRequestAbandoned: a("git-pull-request-abandoned", 60004),
			recordKeys: a("record-keys", 60005),
			keyboard: a("keyboard", 60005),
			tag: a("tag", 60006),
			gitPullRequestLabel: a("git-pull-request-label", 60006),
			tagAdd: a("tag-add", 60006),
			tagRemove: a("tag-remove", 60006),
			person: a("person", 60007),
			personFollow: a("person-follow", 60007),
			personOutline: a("person-outline", 60007),
			personFilled: a("person-filled", 60007),
			gitBranch: a("git-branch", 60008),
			gitBranchCreate: a("git-branch-create", 60008),
			gitBranchDelete: a("git-branch-delete", 60008),
			sourceControl: a("source-control", 60008),
			mirror: a("mirror", 60009),
			mirrorPublic: a("mirror-public", 60009),
			star: a("star", 60010),
			starAdd: a("star-add", 60010),
			starDelete: a("star-delete", 60010),
			starEmpty: a("star-empty", 60010),
			comment: a("comment", 60011),
			commentAdd: a("comment-add", 60011),
			alert: a("alert", 60012),
			warning: a("warning", 60012),
			search: a("search", 60013),
			searchSave: a("search-save", 60013),
			logOut: a("log-out", 60014),
			signOut: a("sign-out", 60014),
			logIn: a("log-in", 60015),
			signIn: a("sign-in", 60015),
			eye: a("eye", 60016),
			eyeUnwatch: a("eye-unwatch", 60016),
			eyeWatch: a("eye-watch", 60016),
			circleFilled: a("circle-filled", 60017),
			primitiveDot: a("primitive-dot", 60017),
			closeDirty: a("close-dirty", 60017),
			debugBreakpoint: a("debug-breakpoint", 60017),
			debugBreakpointDisabled: a("debug-breakpoint-disabled", 60017),
			debugHint: a("debug-hint", 60017),
			terminalDecorationSuccess: a("terminal-decoration-success", 60017),
			primitiveSquare: a("primitive-square", 60018),
			edit: a("edit", 60019),
			pencil: a("pencil", 60019),
			info: a("info", 60020),
			issueOpened: a("issue-opened", 60020),
			gistPrivate: a("gist-private", 60021),
			gitForkPrivate: a("git-fork-private", 60021),
			lock: a("lock", 60021),
			mirrorPrivate: a("mirror-private", 60021),
			close: a("close", 60022),
			removeClose: a("remove-close", 60022),
			x: a("x", 60022),
			repoSync: a("repo-sync", 60023),
			sync: a("sync", 60023),
			clone: a("clone", 60024),
			desktopDownload: a("desktop-download", 60024),
			beaker: a("beaker", 60025),
			microscope: a("microscope", 60025),
			vm: a("vm", 60026),
			deviceDesktop: a("device-desktop", 60026),
			file: a("file", 60027),
			fileText: a("file-text", 60027),
			more: a("more", 60028),
			ellipsis: a("ellipsis", 60028),
			kebabHorizontal: a("kebab-horizontal", 60028),
			mailReply: a("mail-reply", 60029),
			reply: a("reply", 60029),
			organization: a("organization", 60030),
			organizationFilled: a("organization-filled", 60030),
			organizationOutline: a("organization-outline", 60030),
			newFile: a("new-file", 60031),
			fileAdd: a("file-add", 60031),
			newFolder: a("new-folder", 60032),
			fileDirectoryCreate: a("file-directory-create", 60032),
			trash: a("trash", 60033),
			trashcan: a("trashcan", 60033),
			history: a("history", 60034),
			clock: a("clock", 60034),
			folder: a("folder", 60035),
			fileDirectory: a("file-directory", 60035),
			symbolFolder: a("symbol-folder", 60035),
			logoGithub: a("logo-github", 60036),
			markGithub: a("mark-github", 60036),
			github: a("github", 60036),
			terminal: a("terminal", 60037),
			console: a("console", 60037),
			repl: a("repl", 60037),
			zap: a("zap", 60038),
			symbolEvent: a("symbol-event", 60038),
			error: a("error", 60039),
			stop: a("stop", 60039),
			variable: a("variable", 60040),
			symbolVariable: a("symbol-variable", 60040),
			array: a("array", 60042),
			symbolArray: a("symbol-array", 60042),
			symbolModule: a("symbol-module", 60043),
			symbolPackage: a("symbol-package", 60043),
			symbolNamespace: a("symbol-namespace", 60043),
			symbolObject: a("symbol-object", 60043),
			symbolMethod: a("symbol-method", 60044),
			symbolFunction: a("symbol-function", 60044),
			symbolConstructor: a("symbol-constructor", 60044),
			symbolBoolean: a("symbol-boolean", 60047),
			symbolNull: a("symbol-null", 60047),
			symbolNumeric: a("symbol-numeric", 60048),
			symbolNumber: a("symbol-number", 60048),
			symbolStructure: a("symbol-structure", 60049),
			symbolStruct: a("symbol-struct", 60049),
			symbolParameter: a("symbol-parameter", 60050),
			symbolTypeParameter: a("symbol-type-parameter", 60050),
			symbolKey: a("symbol-key", 60051),
			symbolText: a("symbol-text", 60051),
			symbolReference: a("symbol-reference", 60052),
			goToFile: a("go-to-file", 60052),
			symbolEnum: a("symbol-enum", 60053),
			symbolValue: a("symbol-value", 60053),
			symbolRuler: a("symbol-ruler", 60054),
			symbolUnit: a("symbol-unit", 60054),
			activateBreakpoints: a("activate-breakpoints", 60055),
			archive: a("archive", 60056),
			arrowBoth: a("arrow-both", 60057),
			arrowDown: a("arrow-down", 60058),
			arrowLeft: a("arrow-left", 60059),
			arrowRight: a("arrow-right", 60060),
			arrowSmallDown: a("arrow-small-down", 60061),
			arrowSmallLeft: a("arrow-small-left", 60062),
			arrowSmallRight: a("arrow-small-right", 60063),
			arrowSmallUp: a("arrow-small-up", 60064),
			arrowUp: a("arrow-up", 60065),
			bell: a("bell", 60066),
			bold: a("bold", 60067),
			book: a("book", 60068),
			bookmark: a("bookmark", 60069),
			debugBreakpointConditionalUnverified: a(
				"debug-breakpoint-conditional-unverified",
				60070,
			),
			debugBreakpointConditional: a(
				"debug-breakpoint-conditional",
				60071,
			),
			debugBreakpointConditionalDisabled: a(
				"debug-breakpoint-conditional-disabled",
				60071,
			),
			debugBreakpointDataUnverified: a(
				"debug-breakpoint-data-unverified",
				60072,
			),
			debugBreakpointData: a("debug-breakpoint-data", 60073),
			debugBreakpointDataDisabled: a(
				"debug-breakpoint-data-disabled",
				60073,
			),
			debugBreakpointLogUnverified: a(
				"debug-breakpoint-log-unverified",
				60074,
			),
			debugBreakpointLog: a("debug-breakpoint-log", 60075),
			debugBreakpointLogDisabled: a(
				"debug-breakpoint-log-disabled",
				60075,
			),
			briefcase: a("briefcase", 60076),
			broadcast: a("broadcast", 60077),
			browser: a("browser", 60078),
			bug: a("bug", 60079),
			calendar: a("calendar", 60080),
			caseSensitive: a("case-sensitive", 60081),
			check: a("check", 60082),
			checklist: a("checklist", 60083),
			chevronDown: a("chevron-down", 60084),
			chevronLeft: a("chevron-left", 60085),
			chevronRight: a("chevron-right", 60086),
			chevronUp: a("chevron-up", 60087),
			chromeClose: a("chrome-close", 60088),
			chromeMaximize: a("chrome-maximize", 60089),
			chromeMinimize: a("chrome-minimize", 60090),
			chromeRestore: a("chrome-restore", 60091),
			circleOutline: a("circle-outline", 60092),
			circle: a("circle", 60092),
			debugBreakpointUnverified: a("debug-breakpoint-unverified", 60092),
			terminalDecorationIncomplete: a(
				"terminal-decoration-incomplete",
				60092,
			),
			circleSlash: a("circle-slash", 60093),
			circuitBoard: a("circuit-board", 60094),
			clearAll: a("clear-all", 60095),
			clippy: a("clippy", 60096),
			closeAll: a("close-all", 60097),
			cloudDownload: a("cloud-download", 60098),
			cloudUpload: a("cloud-upload", 60099),
			code: a("code", 60100),
			collapseAll: a("collapse-all", 60101),
			colorMode: a("color-mode", 60102),
			commentDiscussion: a("comment-discussion", 60103),
			creditCard: a("credit-card", 60105),
			dash: a("dash", 60108),
			dashboard: a("dashboard", 60109),
			database: a("database", 60110),
			debugContinue: a("debug-continue", 60111),
			debugDisconnect: a("debug-disconnect", 60112),
			debugPause: a("debug-pause", 60113),
			debugRestart: a("debug-restart", 60114),
			debugStart: a("debug-start", 60115),
			debugStepInto: a("debug-step-into", 60116),
			debugStepOut: a("debug-step-out", 60117),
			debugStepOver: a("debug-step-over", 60118),
			debugStop: a("debug-stop", 60119),
			debug: a("debug", 60120),
			deviceCameraVideo: a("device-camera-video", 60121),
			deviceCamera: a("device-camera", 60122),
			deviceMobile: a("device-mobile", 60123),
			diffAdded: a("diff-added", 60124),
			diffIgnored: a("diff-ignored", 60125),
			diffModified: a("diff-modified", 60126),
			diffRemoved: a("diff-removed", 60127),
			diffRenamed: a("diff-renamed", 60128),
			diff: a("diff", 60129),
			diffSidebyside: a("diff-sidebyside", 60129),
			discard: a("discard", 60130),
			editorLayout: a("editor-layout", 60131),
			emptyWindow: a("empty-window", 60132),
			exclude: a("exclude", 60133),
			extensions: a("extensions", 60134),
			eyeClosed: a("eye-closed", 60135),
			fileBinary: a("file-binary", 60136),
			fileCode: a("file-code", 60137),
			fileMedia: a("file-media", 60138),
			filePdf: a("file-pdf", 60139),
			fileSubmodule: a("file-submodule", 60140),
			fileSymlinkDirectory: a("file-symlink-directory", 60141),
			fileSymlinkFile: a("file-symlink-file", 60142),
			fileZip: a("file-zip", 60143),
			files: a("files", 60144),
			filter: a("filter", 60145),
			flame: a("flame", 60146),
			foldDown: a("fold-down", 60147),
			foldUp: a("fold-up", 60148),
			fold: a("fold", 60149),
			folderActive: a("folder-active", 60150),
			folderOpened: a("folder-opened", 60151),
			gear: a("gear", 60152),
			gift: a("gift", 60153),
			gistSecret: a("gist-secret", 60154),
			gist: a("gist", 60155),
			gitCommit: a("git-commit", 60156),
			gitCompare: a("git-compare", 60157),
			compareChanges: a("compare-changes", 60157),
			gitMerge: a("git-merge", 60158),
			githubAction: a("github-action", 60159),
			githubAlt: a("github-alt", 60160),
			globe: a("globe", 60161),
			grabber: a("grabber", 60162),
			graph: a("graph", 60163),
			gripper: a("gripper", 60164),
			heart: a("heart", 60165),
			home: a("home", 60166),
			horizontalRule: a("horizontal-rule", 60167),
			hubot: a("hubot", 60168),
			inbox: a("inbox", 60169),
			issueReopened: a("issue-reopened", 60171),
			issues: a("issues", 60172),
			italic: a("italic", 60173),
			jersey: a("jersey", 60174),
			json: a("json", 60175),
			kebabVertical: a("kebab-vertical", 60176),
			key: a("key", 60177),
			law: a("law", 60178),
			lightbulbAutofix: a("lightbulb-autofix", 60179),
			linkExternal: a("link-external", 60180),
			link: a("link", 60181),
			listOrdered: a("list-ordered", 60182),
			listUnordered: a("list-unordered", 60183),
			liveShare: a("live-share", 60184),
			loading: a("loading", 60185),
			location: a("location", 60186),
			mailRead: a("mail-read", 60187),
			mail: a("mail", 60188),
			markdown: a("markdown", 60189),
			megaphone: a("megaphone", 60190),
			mention: a("mention", 60191),
			milestone: a("milestone", 60192),
			gitPullRequestMilestone: a("git-pull-request-milestone", 60192),
			mortarBoard: a("mortar-board", 60193),
			move: a("move", 60194),
			multipleWindows: a("multiple-windows", 60195),
			mute: a("mute", 60196),
			noNewline: a("no-newline", 60197),
			note: a("note", 60198),
			octoface: a("octoface", 60199),
			openPreview: a("open-preview", 60200),
			package: a("package", 60201),
			paintcan: a("paintcan", 60202),
			pin: a("pin", 60203),
			play: a("play", 60204),
			run: a("run", 60204),
			plug: a("plug", 60205),
			preserveCase: a("preserve-case", 60206),
			preview: a("preview", 60207),
			project: a("project", 60208),
			pulse: a("pulse", 60209),
			question: a("question", 60210),
			quote: a("quote", 60211),
			radioTower: a("radio-tower", 60212),
			reactions: a("reactions", 60213),
			references: a("references", 60214),
			refresh: a("refresh", 60215),
			regex: a("regex", 60216),
			remoteExplorer: a("remote-explorer", 60217),
			remote: a("remote", 60218),
			remove: a("remove", 60219),
			replaceAll: a("replace-all", 60220),
			replace: a("replace", 60221),
			repoClone: a("repo-clone", 60222),
			repoForcePush: a("repo-force-push", 60223),
			repoPull: a("repo-pull", 60224),
			repoPush: a("repo-push", 60225),
			report: a("report", 60226),
			requestChanges: a("request-changes", 60227),
			rocket: a("rocket", 60228),
			rootFolderOpened: a("root-folder-opened", 60229),
			rootFolder: a("root-folder", 60230),
			rss: a("rss", 60231),
			ruby: a("ruby", 60232),
			saveAll: a("save-all", 60233),
			saveAs: a("save-as", 60234),
			save: a("save", 60235),
			screenFull: a("screen-full", 60236),
			screenNormal: a("screen-normal", 60237),
			searchStop: a("search-stop", 60238),
			server: a("server", 60240),
			settingsGear: a("settings-gear", 60241),
			settings: a("settings", 60242),
			shield: a("shield", 60243),
			smiley: a("smiley", 60244),
			sortPrecedence: a("sort-precedence", 60245),
			splitHorizontal: a("split-horizontal", 60246),
			splitVertical: a("split-vertical", 60247),
			squirrel: a("squirrel", 60248),
			starFull: a("star-full", 60249),
			starHalf: a("star-half", 60250),
			symbolClass: a("symbol-class", 60251),
			symbolColor: a("symbol-color", 60252),
			symbolConstant: a("symbol-constant", 60253),
			symbolEnumMember: a("symbol-enum-member", 60254),
			symbolField: a("symbol-field", 60255),
			symbolFile: a("symbol-file", 60256),
			symbolInterface: a("symbol-interface", 60257),
			symbolKeyword: a("symbol-keyword", 60258),
			symbolMisc: a("symbol-misc", 60259),
			symbolOperator: a("symbol-operator", 60260),
			symbolProperty: a("symbol-property", 60261),
			wrench: a("wrench", 60261),
			wrenchSubaction: a("wrench-subaction", 60261),
			symbolSnippet: a("symbol-snippet", 60262),
			tasklist: a("tasklist", 60263),
			telescope: a("telescope", 60264),
			textSize: a("text-size", 60265),
			threeBars: a("three-bars", 60266),
			thumbsdown: a("thumbsdown", 60267),
			thumbsup: a("thumbsup", 60268),
			tools: a("tools", 60269),
			triangleDown: a("triangle-down", 60270),
			triangleLeft: a("triangle-left", 60271),
			triangleRight: a("triangle-right", 60272),
			triangleUp: a("triangle-up", 60273),
			twitter: a("twitter", 60274),
			unfold: a("unfold", 60275),
			unlock: a("unlock", 60276),
			unmute: a("unmute", 60277),
			unverified: a("unverified", 60278),
			verified: a("verified", 60279),
			versions: a("versions", 60280),
			vmActive: a("vm-active", 60281),
			vmOutline: a("vm-outline", 60282),
			vmRunning: a("vm-running", 60283),
			watch: a("watch", 60284),
			whitespace: a("whitespace", 60285),
			wholeWord: a("whole-word", 60286),
			window: a("window", 60287),
			wordWrap: a("word-wrap", 60288),
			zoomIn: a("zoom-in", 60289),
			zoomOut: a("zoom-out", 60290),
			listFilter: a("list-filter", 60291),
			listFlat: a("list-flat", 60292),
			listSelection: a("list-selection", 60293),
			selection: a("selection", 60293),
			listTree: a("list-tree", 60294),
			debugBreakpointFunctionUnverified: a(
				"debug-breakpoint-function-unverified",
				60295,
			),
			debugBreakpointFunction: a("debug-breakpoint-function", 60296),
			debugBreakpointFunctionDisabled: a(
				"debug-breakpoint-function-disabled",
				60296,
			),
			debugStackframeActive: a("debug-stackframe-active", 60297),
			circleSmallFilled: a("circle-small-filled", 60298),
			debugStackframeDot: a("debug-stackframe-dot", 60298),
			terminalDecorationMark: a("terminal-decoration-mark", 60298),
			debugStackframe: a("debug-stackframe", 60299),
			debugStackframeFocused: a("debug-stackframe-focused", 60299),
			debugBreakpointUnsupported: a(
				"debug-breakpoint-unsupported",
				60300,
			),
			symbolString: a("symbol-string", 60301),
			debugReverseContinue: a("debug-reverse-continue", 60302),
			debugStepBack: a("debug-step-back", 60303),
			debugRestartFrame: a("debug-restart-frame", 60304),
			debugAlt: a("debug-alt", 60305),
			callIncoming: a("call-incoming", 60306),
			callOutgoing: a("call-outgoing", 60307),
			menu: a("menu", 60308),
			expandAll: a("expand-all", 60309),
			feedback: a("feedback", 60310),
			gitPullRequestReviewer: a("git-pull-request-reviewer", 60310),
			groupByRefType: a("group-by-ref-type", 60311),
			ungroupByRefType: a("ungroup-by-ref-type", 60312),
			account: a("account", 60313),
			gitPullRequestAssignee: a("git-pull-request-assignee", 60313),
			bellDot: a("bell-dot", 60314),
			debugConsole: a("debug-console", 60315),
			library: a("library", 60316),
			output: a("output", 60317),
			runAll: a("run-all", 60318),
			syncIgnored: a("sync-ignored", 60319),
			pinned: a("pinned", 60320),
			githubInverted: a("github-inverted", 60321),
			serverProcess: a("server-process", 60322),
			serverEnvironment: a("server-environment", 60323),
			pass: a("pass", 60324),
			issueClosed: a("issue-closed", 60324),
			stopCircle: a("stop-circle", 60325),
			playCircle: a("play-circle", 60326),
			record: a("record", 60327),
			debugAltSmall: a("debug-alt-small", 60328),
			vmConnect: a("vm-connect", 60329),
			cloud: a("cloud", 60330),
			merge: a("merge", 60331),
			export: a("export", 60332),
			graphLeft: a("graph-left", 60333),
			magnet: a("magnet", 60334),
			notebook: a("notebook", 60335),
			redo: a("redo", 60336),
			checkAll: a("check-all", 60337),
			pinnedDirty: a("pinned-dirty", 60338),
			passFilled: a("pass-filled", 60339),
			circleLargeFilled: a("circle-large-filled", 60340),
			circleLarge: a("circle-large", 60341),
			circleLargeOutline: a("circle-large-outline", 60341),
			combine: a("combine", 60342),
			gather: a("gather", 60342),
			table: a("table", 60343),
			variableGroup: a("variable-group", 60344),
			typeHierarchy: a("type-hierarchy", 60345),
			typeHierarchySub: a("type-hierarchy-sub", 60346),
			typeHierarchySuper: a("type-hierarchy-super", 60347),
			gitPullRequestCreate: a("git-pull-request-create", 60348),
			runAbove: a("run-above", 60349),
			runBelow: a("run-below", 60350),
			notebookTemplate: a("notebook-template", 60351),
			debugRerun: a("debug-rerun", 60352),
			workspaceTrusted: a("workspace-trusted", 60353),
			workspaceUntrusted: a("workspace-untrusted", 60354),
			workspaceUnknown: a("workspace-unknown", 60355),
			terminalCmd: a("terminal-cmd", 60356),
			terminalDebian: a("terminal-debian", 60357),
			terminalLinux: a("terminal-linux", 60358),
			terminalPowershell: a("terminal-powershell", 60359),
			terminalTmux: a("terminal-tmux", 60360),
			terminalUbuntu: a("terminal-ubuntu", 60361),
			terminalBash: a("terminal-bash", 60362),
			arrowSwap: a("arrow-swap", 60363),
			copy: a("copy", 60364),
			personAdd: a("person-add", 60365),
			filterFilled: a("filter-filled", 60366),
			wand: a("wand", 60367),
			debugLineByLine: a("debug-line-by-line", 60368),
			inspect: a("inspect", 60369),
			layers: a("layers", 60370),
			layersDot: a("layers-dot", 60371),
			layersActive: a("layers-active", 60372),
			compass: a("compass", 60373),
			compassDot: a("compass-dot", 60374),
			compassActive: a("compass-active", 60375),
			azure: a("azure", 60376),
			issueDraft: a("issue-draft", 60377),
			gitPullRequestClosed: a("git-pull-request-closed", 60378),
			gitPullRequestDraft: a("git-pull-request-draft", 60379),
			debugAll: a("debug-all", 60380),
			debugCoverage: a("debug-coverage", 60381),
			runErrors: a("run-errors", 60382),
			folderLibrary: a("folder-library", 60383),
			debugContinueSmall: a("debug-continue-small", 60384),
			beakerStop: a("beaker-stop", 60385),
			graphLine: a("graph-line", 60386),
			graphScatter: a("graph-scatter", 60387),
			pieChart: a("pie-chart", 60388),
			bracket: a("bracket", 60175),
			bracketDot: a("bracket-dot", 60389),
			bracketError: a("bracket-error", 60390),
			lockSmall: a("lock-small", 60391),
			azureDevops: a("azure-devops", 60392),
			verifiedFilled: a("verified-filled", 60393),
			newline: a("newline", 60394),
			layout: a("layout", 60395),
			layoutActivitybarLeft: a("layout-activitybar-left", 60396),
			layoutActivitybarRight: a("layout-activitybar-right", 60397),
			layoutPanelLeft: a("layout-panel-left", 60398),
			layoutPanelCenter: a("layout-panel-center", 60399),
			layoutPanelJustify: a("layout-panel-justify", 60400),
			layoutPanelRight: a("layout-panel-right", 60401),
			layoutPanel: a("layout-panel", 60402),
			layoutSidebarLeft: a("layout-sidebar-left", 60403),
			layoutSidebarRight: a("layout-sidebar-right", 60404),
			layoutStatusbar: a("layout-statusbar", 60405),
			layoutMenubar: a("layout-menubar", 60406),
			layoutCentered: a("layout-centered", 60407),
			target: a("target", 60408),
			indent: a("indent", 60409),
			recordSmall: a("record-small", 60410),
			errorSmall: a("error-small", 60411),
			terminalDecorationError: a("terminal-decoration-error", 60411),
			arrowCircleDown: a("arrow-circle-down", 60412),
			arrowCircleLeft: a("arrow-circle-left", 60413),
			arrowCircleRight: a("arrow-circle-right", 60414),
			arrowCircleUp: a("arrow-circle-up", 60415),
			layoutSidebarRightOff: a("layout-sidebar-right-off", 60416),
			layoutPanelOff: a("layout-panel-off", 60417),
			layoutSidebarLeftOff: a("layout-sidebar-left-off", 60418),
			blank: a("blank", 60419),
			heartFilled: a("heart-filled", 60420),
			map: a("map", 60421),
			mapHorizontal: a("map-horizontal", 60421),
			foldHorizontal: a("fold-horizontal", 60421),
			mapFilled: a("map-filled", 60422),
			mapHorizontalFilled: a("map-horizontal-filled", 60422),
			foldHorizontalFilled: a("fold-horizontal-filled", 60422),
			circleSmall: a("circle-small", 60423),
			bellSlash: a("bell-slash", 60424),
			bellSlashDot: a("bell-slash-dot", 60425),
			commentUnresolved: a("comment-unresolved", 60426),
			gitPullRequestGoToChanges: a(
				"git-pull-request-go-to-changes",
				60427,
			),
			gitPullRequestNewChanges: a("git-pull-request-new-changes", 60428),
			searchFuzzy: a("search-fuzzy", 60429),
			commentDraft: a("comment-draft", 60430),
			send: a("send", 60431),
			sparkle: a("sparkle", 60432),
			insert: a("insert", 60433),
			mic: a("mic", 60434),
			thumbsdownFilled: a("thumbsdown-filled", 60435),
			thumbsupFilled: a("thumbsup-filled", 60436),
			coffee: a("coffee", 60437),
			snake: a("snake", 60438),
			game: a("game", 60439),
			vr: a("vr", 60440),
			chip: a("chip", 60441),
			piano: a("piano", 60442),
			music: a("music", 60443),
			micFilled: a("mic-filled", 60444),
			repoFetch: a("repo-fetch", 60445),
			copilot: a("copilot", 60446),
			lightbulbSparkle: a("lightbulb-sparkle", 60447),
			robot: a("robot", 60448),
			sparkleFilled: a("sparkle-filled", 60449),
			diffSingle: a("diff-single", 60450),
			diffMultiple: a("diff-multiple", 60451),
			surroundWith: a("surround-with", 60452),
			share: a("share", 60453),
			gitStash: a("git-stash", 60454),
			gitStashApply: a("git-stash-apply", 60455),
			gitStashPop: a("git-stash-pop", 60456),
			vscode: a("vscode", 60457),
			vscodeInsiders: a("vscode-insiders", 60458),
			codeOss: a("code-oss", 60459),
			runCoverage: a("run-coverage", 60460),
			runAllCoverage: a("run-all-coverage", 60461),
			coverage: a("coverage", 60462),
			githubProject: a("github-project", 60463),
			mapVertical: a("map-vertical", 60464),
			foldVertical: a("fold-vertical", 60464),
			mapVerticalFilled: a("map-vertical-filled", 60465),
			foldVerticalFilled: a("fold-vertical-filled", 60465),
			goToSearch: a("go-to-search", 60466),
			percentage: a("percentage", 60467),
			sortPercentage: a("sort-percentage", 60467),
			attach: a("attach", 60468),
		},
		Bi = {
			dialogError: a("dialog-error", "error"),
			dialogWarning: a("dialog-warning", "warning"),
			dialogInfo: a("dialog-info", "info"),
			dialogClose: a("dialog-close", "close"),
			treeItemExpanded: a("tree-item-expanded", "chevron-down"),
			treeFilterOnTypeOn: a("tree-filter-on-type-on", "list-filter"),
			treeFilterOnTypeOff: a("tree-filter-on-type-off", "list-selection"),
			treeFilterClear: a("tree-filter-clear", "close"),
			treeItemLoading: a("tree-item-loading", "loading"),
			menuSelection: a("menu-selection", "check"),
			menuSubmenu: a("menu-submenu", "chevron-right"),
			menuBarMore: a("menubar-more", "more"),
			scrollbarButtonLeft: a("scrollbar-button-left", "triangle-left"),
			scrollbarButtonRight: a("scrollbar-button-right", "triangle-right"),
			scrollbarButtonUp: a("scrollbar-button-up", "triangle-up"),
			scrollbarButtonDown: a("scrollbar-button-down", "triangle-down"),
			toolBarMore: a("toolbar-more", "more"),
			quickInputBack: a("quick-input-back", "arrow-left"),
			dropDownButton: a("drop-down-button", 60084),
			symbolCustomColor: a("symbol-customcolor", 60252),
			exportIcon: a("export", 60332),
			workspaceUnspecified: a("workspace-unspecified", 60355),
			newLine: a("newline", 60394),
			thumbsDownFilled: a("thumbsdown-filled", 60435),
			thumbsUpFilled: a("thumbsup-filled", 60436),
			gitFetch: a("git-fetch", 60445),
			lightbulbSparkleAutofix: a("lightbulb-sparkle-autofix", 60447),
			debugBreakpointPending: a("debug-breakpoint-pending", 60377),
		},
		M = { ...Ii, ...Bi };
	class Pn {
		constructor() {
			(this._tokenizationSupports = new Map()),
				(this._factories = new Map()),
				(this._onDidChange = new ae()),
				(this.onDidChange = this._onDidChange.event),
				(this._colorMap = null);
		}
		handleChange(t) {
			this._onDidChange.fire({
				changedLanguages: t,
				changedColorMap: !1,
			});
		}
		register(t, n) {
			return (
				this._tokenizationSupports.set(t, n),
				this.handleChange([t]),
				et(() => {
					this._tokenizationSupports.get(t) === n &&
						(this._tokenizationSupports.delete(t),
						this.handleChange([t]));
				})
			);
		}
		get(t) {
			return this._tokenizationSupports.get(t) || null;
		}
		registerFactory(t, n) {
			this._factories.get(t)?.dispose();
			const s = new qi(this, t, n);
			return (
				this._factories.set(t, s),
				et(() => {
					const r = this._factories.get(t);
					!r || r !== s || (this._factories.delete(t), r.dispose());
				})
			);
		}
		async getOrCreate(t) {
			const n = this.get(t);
			if (n) return n;
			const s = this._factories.get(t);
			return !s || s.isResolved ? null : (await s.resolve(), this.get(t));
		}
		isResolved(t) {
			if (this.get(t)) return !0;
			const s = this._factories.get(t);
			return !!(!s || s.isResolved);
		}
		setColorMap(t) {
			(this._colorMap = t),
				this._onDidChange.fire({
					changedLanguages: Array.from(
						this._tokenizationSupports.keys(),
					),
					changedColorMap: !0,
				});
		}
		getColorMap() {
			return this._colorMap;
		}
		getDefaultBackground() {
			return this._colorMap && this._colorMap.length > 2
				? this._colorMap[2]
				: null;
		}
	}
	class qi extends tt {
		get isResolved() {
			return this._isResolved;
		}
		constructor(t, n, s) {
			super(),
				(this._registry = t),
				(this._languageId = n),
				(this._factory = s),
				(this._isDisposed = !1),
				(this._resolvePromise = null),
				(this._isResolved = !1);
		}
		dispose() {
			(this._isDisposed = !0), super.dispose();
		}
		async resolve() {
			return (
				this._resolvePromise || (this._resolvePromise = this._create()),
				this._resolvePromise
			);
		}
		async _create() {
			const t = await this._factory.tokenizationSupport;
			(this._isResolved = !0),
				t &&
					!this._isDisposed &&
					this._register(
						this._registry.register(this._languageId, t),
					);
		}
	}
	const Ui =
		globalThis._VSCODE_NLS_LANGUAGE === "pseudo" ||
		(typeof document < "u" &&
			document.location &&
			document.location.hash.indexOf("pseudo=true") >= 0);
	function Tn(e, t) {
		let n;
		return (
			t.length === 0
				? (n = e)
				: (n = e.replace(/\{(\d+)\}/g, (s, r) => {
						const i = r[0],
							o = t[i];
						let l = s;
						return (
							typeof o == "string"
								? (l = o)
								: (typeof o == "number" ||
										typeof o == "boolean" ||
										o === void 0 ||
										o === null) &&
									(l = String(o)),
							l
						);
					})),
			Ui && (n = "［" + n.replace(/[aouei]/g, "$&$&") + "］"),
			n
		);
	}
	function z(e, t, ...n) {
		return Tn(typeof e == "number" ? Hi(e, t) : t, n);
	}
	function Hi(e, t) {
		const n = globalThis._VSCODE_NLS_MESSAGES?.[e];
		if (typeof n != "string") {
			if (typeof t == "string") return t;
			throw new Error(`!!! NLS MISSING: ${e} !!!`);
		}
		return n;
	}
	class Wi {
		constructor(t, n, s) {
			(this.offset = t),
				(this.type = n),
				(this.language = s),
				(this._tokenBrand = void 0);
		}
		toString() {
			return "(" + this.offset + ", " + this.type + ")";
		}
	}
	var Vn;
	(function (e) {
		(e[(e.Increase = 0)] = "Increase"), (e[(e.Decrease = 1)] = "Decrease");
	})(Vn || (Vn = {}));
	var In;
	(function (e) {
		const t = new Map();
		t.set(0, M.symbolMethod),
			t.set(1, M.symbolFunction),
			t.set(2, M.symbolConstructor),
			t.set(3, M.symbolField),
			t.set(4, M.symbolVariable),
			t.set(5, M.symbolClass),
			t.set(6, M.symbolStruct),
			t.set(7, M.symbolInterface),
			t.set(8, M.symbolModule),
			t.set(9, M.symbolProperty),
			t.set(10, M.symbolEvent),
			t.set(11, M.symbolOperator),
			t.set(12, M.symbolUnit),
			t.set(13, M.symbolValue),
			t.set(15, M.symbolEnum),
			t.set(14, M.symbolConstant),
			t.set(15, M.symbolEnum),
			t.set(16, M.symbolEnumMember),
			t.set(17, M.symbolKeyword),
			t.set(27, M.symbolSnippet),
			t.set(18, M.symbolText),
			t.set(19, M.symbolColor),
			t.set(20, M.symbolFile),
			t.set(21, M.symbolReference),
			t.set(22, M.symbolCustomColor),
			t.set(23, M.symbolFolder),
			t.set(24, M.symbolTypeParameter),
			t.set(25, M.account),
			t.set(26, M.issues);
		function n(i) {
			let o = t.get(i);
			return (
				o ||
					(console.info(
						"No codicon found for CompletionItemKind " + i,
					),
					(o = M.symbolProperty)),
				o
			);
		}
		e.toIcon = n;
		const s = new Map();
		s.set("method", 0),
			s.set("function", 1),
			s.set("constructor", 2),
			s.set("field", 3),
			s.set("variable", 4),
			s.set("class", 5),
			s.set("struct", 6),
			s.set("interface", 7),
			s.set("module", 8),
			s.set("property", 9),
			s.set("event", 10),
			s.set("operator", 11),
			s.set("unit", 12),
			s.set("value", 13),
			s.set("constant", 14),
			s.set("enum", 15),
			s.set("enum-member", 16),
			s.set("enumMember", 16),
			s.set("keyword", 17),
			s.set("snippet", 27),
			s.set("text", 18),
			s.set("color", 19),
			s.set("file", 20),
			s.set("reference", 21),
			s.set("customcolor", 22),
			s.set("folder", 23),
			s.set("type-parameter", 24),
			s.set("typeParameter", 24),
			s.set("account", 25),
			s.set("issue", 26);
		function r(i, o) {
			let l = s.get(i);
			return typeof l > "u" && !o && (l = 9), l;
		}
		e.fromString = r;
	})(In || (In = {}));
	var Bn;
	(function (e) {
		(e[(e.Automatic = 0)] = "Automatic"),
			(e[(e.Explicit = 1)] = "Explicit");
	})(Bn || (Bn = {}));
	var qn;
	(function (e) {
		(e[(e.Automatic = 0)] = "Automatic"), (e[(e.PasteAs = 1)] = "PasteAs");
	})(qn || (qn = {}));
	var Un;
	(function (e) {
		(e[(e.Invoke = 1)] = "Invoke"),
			(e[(e.TriggerCharacter = 2)] = "TriggerCharacter"),
			(e[(e.ContentChange = 3)] = "ContentChange");
	})(Un || (Un = {}));
	var Hn;
	(function (e) {
		(e[(e.Text = 0)] = "Text"),
			(e[(e.Read = 1)] = "Read"),
			(e[(e.Write = 2)] = "Write");
	})(Hn || (Hn = {})),
		z("Array", "array"),
		z("Boolean", "boolean"),
		z("Class", "class"),
		z("Constant", "constant"),
		z("Constructor", "constructor"),
		z("Enum", "enumeration"),
		z("EnumMember", "enumeration member"),
		z("Event", "event"),
		z("Field", "field"),
		z("File", "file"),
		z("Function", "function"),
		z("Interface", "interface"),
		z("Key", "key"),
		z("Method", "method"),
		z("Module", "module"),
		z("Namespace", "namespace"),
		z("Null", "null"),
		z("Number", "number"),
		z("Object", "object"),
		z("Operator", "operator"),
		z("Package", "package"),
		z("Property", "property"),
		z("String", "string"),
		z("Struct", "struct"),
		z("TypeParameter", "type parameter"),
		z("Variable", "variable");
	var Wn;
	(function (e) {
		const t = new Map();
		t.set(0, M.symbolFile),
			t.set(1, M.symbolModule),
			t.set(2, M.symbolNamespace),
			t.set(3, M.symbolPackage),
			t.set(4, M.symbolClass),
			t.set(5, M.symbolMethod),
			t.set(6, M.symbolProperty),
			t.set(7, M.symbolField),
			t.set(8, M.symbolConstructor),
			t.set(9, M.symbolEnum),
			t.set(10, M.symbolInterface),
			t.set(11, M.symbolFunction),
			t.set(12, M.symbolVariable),
			t.set(13, M.symbolConstant),
			t.set(14, M.symbolString),
			t.set(15, M.symbolNumber),
			t.set(16, M.symbolBoolean),
			t.set(17, M.symbolArray),
			t.set(18, M.symbolObject),
			t.set(19, M.symbolKey),
			t.set(20, M.symbolNull),
			t.set(21, M.symbolEnumMember),
			t.set(22, M.symbolStruct),
			t.set(23, M.symbolEvent),
			t.set(24, M.symbolOperator),
			t.set(25, M.symbolTypeParameter);
		function n(s) {
			let r = t.get(s);
			return (
				r ||
					(console.info("No codicon found for SymbolKind " + s),
					(r = M.symbolProperty)),
				r
			);
		}
		e.toIcon = n;
	})(Wn || (Wn = {}));
	class ve {
		static {
			this.Comment = new ve("comment");
		}
		static {
			this.Imports = new ve("imports");
		}
		static {
			this.Region = new ve("region");
		}
		static fromValue(t) {
			switch (t) {
				case "comment":
					return ve.Comment;
				case "imports":
					return ve.Imports;
				case "region":
					return ve.Region;
			}
			return new ve(t);
		}
		constructor(t) {
			this.value = t;
		}
	}
	var zn;
	(function (e) {
		e[(e.AIGenerated = 1)] = "AIGenerated";
	})(zn || (zn = {}));
	var $n;
	(function (e) {
		(e[(e.Invoke = 0)] = "Invoke"), (e[(e.Automatic = 1)] = "Automatic");
	})($n || ($n = {}));
	var Gn;
	(function (e) {
		function t(n) {
			return !n || typeof n != "object"
				? !1
				: typeof n.id == "string" && typeof n.title == "string";
		}
		e.is = t;
	})(Gn || (Gn = {}));
	var On;
	(function (e) {
		(e[(e.Type = 1)] = "Type"), (e[(e.Parameter = 2)] = "Parameter");
	})(On || (On = {})),
		new Pn(),
		new Pn();
	var jn;
	(function (e) {
		(e[(e.Invoke = 0)] = "Invoke"), (e[(e.Automatic = 1)] = "Automatic");
	})(jn || (jn = {}));
	var Xn;
	(function (e) {
		(e[(e.Unknown = 0)] = "Unknown"),
			(e[(e.Disabled = 1)] = "Disabled"),
			(e[(e.Enabled = 2)] = "Enabled");
	})(Xn || (Xn = {}));
	var Qn;
	(function (e) {
		(e[(e.Invoke = 1)] = "Invoke"), (e[(e.Auto = 2)] = "Auto");
	})(Qn || (Qn = {}));
	var Jn;
	(function (e) {
		(e[(e.None = 0)] = "None"),
			(e[(e.KeepWhitespace = 1)] = "KeepWhitespace"),
			(e[(e.InsertAsSnippet = 4)] = "InsertAsSnippet");
	})(Jn || (Jn = {}));
	var Yn;
	(function (e) {
		(e[(e.Method = 0)] = "Method"),
			(e[(e.Function = 1)] = "Function"),
			(e[(e.Constructor = 2)] = "Constructor"),
			(e[(e.Field = 3)] = "Field"),
			(e[(e.Variable = 4)] = "Variable"),
			(e[(e.Class = 5)] = "Class"),
			(e[(e.Struct = 6)] = "Struct"),
			(e[(e.Interface = 7)] = "Interface"),
			(e[(e.Module = 8)] = "Module"),
			(e[(e.Property = 9)] = "Property"),
			(e[(e.Event = 10)] = "Event"),
			(e[(e.Operator = 11)] = "Operator"),
			(e[(e.Unit = 12)] = "Unit"),
			(e[(e.Value = 13)] = "Value"),
			(e[(e.Constant = 14)] = "Constant"),
			(e[(e.Enum = 15)] = "Enum"),
			(e[(e.EnumMember = 16)] = "EnumMember"),
			(e[(e.Keyword = 17)] = "Keyword"),
			(e[(e.Text = 18)] = "Text"),
			(e[(e.Color = 19)] = "Color"),
			(e[(e.File = 20)] = "File"),
			(e[(e.Reference = 21)] = "Reference"),
			(e[(e.Customcolor = 22)] = "Customcolor"),
			(e[(e.Folder = 23)] = "Folder"),
			(e[(e.TypeParameter = 24)] = "TypeParameter"),
			(e[(e.User = 25)] = "User"),
			(e[(e.Issue = 26)] = "Issue"),
			(e[(e.Snippet = 27)] = "Snippet");
	})(Yn || (Yn = {}));
	var Zn;
	(function (e) {
		e[(e.Deprecated = 1)] = "Deprecated";
	})(Zn || (Zn = {}));
	var Kn;
	(function (e) {
		(e[(e.Invoke = 0)] = "Invoke"),
			(e[(e.TriggerCharacter = 1)] = "TriggerCharacter"),
			(e[(e.TriggerForIncompleteCompletions = 2)] =
				"TriggerForIncompleteCompletions");
	})(Kn || (Kn = {}));
	var es;
	(function (e) {
		(e[(e.EXACT = 0)] = "EXACT"),
			(e[(e.ABOVE = 1)] = "ABOVE"),
			(e[(e.BELOW = 2)] = "BELOW");
	})(es || (es = {}));
	var ts;
	(function (e) {
		(e[(e.NotSet = 0)] = "NotSet"),
			(e[(e.ContentFlush = 1)] = "ContentFlush"),
			(e[(e.RecoverFromMarkers = 2)] = "RecoverFromMarkers"),
			(e[(e.Explicit = 3)] = "Explicit"),
			(e[(e.Paste = 4)] = "Paste"),
			(e[(e.Undo = 5)] = "Undo"),
			(e[(e.Redo = 6)] = "Redo");
	})(ts || (ts = {}));
	var ns;
	(function (e) {
		(e[(e.LF = 1)] = "LF"), (e[(e.CRLF = 2)] = "CRLF");
	})(ns || (ns = {}));
	var ss;
	(function (e) {
		(e[(e.Text = 0)] = "Text"),
			(e[(e.Read = 1)] = "Read"),
			(e[(e.Write = 2)] = "Write");
	})(ss || (ss = {}));
	var rs;
	(function (e) {
		(e[(e.None = 0)] = "None"),
			(e[(e.Keep = 1)] = "Keep"),
			(e[(e.Brackets = 2)] = "Brackets"),
			(e[(e.Advanced = 3)] = "Advanced"),
			(e[(e.Full = 4)] = "Full");
	})(rs || (rs = {}));
	var is;
	(function (e) {
		(e[(e.acceptSuggestionOnCommitCharacter = 0)] =
			"acceptSuggestionOnCommitCharacter"),
			(e[(e.acceptSuggestionOnEnter = 1)] = "acceptSuggestionOnEnter"),
			(e[(e.accessibilitySupport = 2)] = "accessibilitySupport"),
			(e[(e.accessibilityPageSize = 3)] = "accessibilityPageSize"),
			(e[(e.ariaLabel = 4)] = "ariaLabel"),
			(e[(e.ariaRequired = 5)] = "ariaRequired"),
			(e[(e.autoClosingBrackets = 6)] = "autoClosingBrackets"),
			(e[(e.autoClosingComments = 7)] = "autoClosingComments"),
			(e[(e.screenReaderAnnounceInlineSuggestion = 8)] =
				"screenReaderAnnounceInlineSuggestion"),
			(e[(e.autoClosingDelete = 9)] = "autoClosingDelete"),
			(e[(e.autoClosingOvertype = 10)] = "autoClosingOvertype"),
			(e[(e.autoClosingQuotes = 11)] = "autoClosingQuotes"),
			(e[(e.autoIndent = 12)] = "autoIndent"),
			(e[(e.automaticLayout = 13)] = "automaticLayout"),
			(e[(e.autoSurround = 14)] = "autoSurround"),
			(e[(e.bracketPairColorization = 15)] = "bracketPairColorization"),
			(e[(e.guides = 16)] = "guides"),
			(e[(e.codeLens = 17)] = "codeLens"),
			(e[(e.codeLensFontFamily = 18)] = "codeLensFontFamily"),
			(e[(e.codeLensFontSize = 19)] = "codeLensFontSize"),
			(e[(e.colorDecorators = 20)] = "colorDecorators"),
			(e[(e.colorDecoratorsLimit = 21)] = "colorDecoratorsLimit"),
			(e[(e.columnSelection = 22)] = "columnSelection"),
			(e[(e.comments = 23)] = "comments"),
			(e[(e.contextmenu = 24)] = "contextmenu"),
			(e[(e.copyWithSyntaxHighlighting = 25)] =
				"copyWithSyntaxHighlighting"),
			(e[(e.cursorBlinking = 26)] = "cursorBlinking"),
			(e[(e.cursorSmoothCaretAnimation = 27)] =
				"cursorSmoothCaretAnimation"),
			(e[(e.cursorStyle = 28)] = "cursorStyle"),
			(e[(e.cursorSurroundingLines = 29)] = "cursorSurroundingLines"),
			(e[(e.cursorSurroundingLinesStyle = 30)] =
				"cursorSurroundingLinesStyle"),
			(e[(e.cursorWidth = 31)] = "cursorWidth"),
			(e[(e.disableLayerHinting = 32)] = "disableLayerHinting"),
			(e[(e.disableMonospaceOptimizations = 33)] =
				"disableMonospaceOptimizations"),
			(e[(e.domReadOnly = 34)] = "domReadOnly"),
			(e[(e.dragAndDrop = 35)] = "dragAndDrop"),
			(e[(e.dropIntoEditor = 36)] = "dropIntoEditor"),
			(e[(e.emptySelectionClipboard = 37)] = "emptySelectionClipboard"),
			(e[(e.experimentalWhitespaceRendering = 38)] =
				"experimentalWhitespaceRendering"),
			(e[(e.extraEditorClassName = 39)] = "extraEditorClassName"),
			(e[(e.fastScrollSensitivity = 40)] = "fastScrollSensitivity"),
			(e[(e.find = 41)] = "find"),
			(e[(e.fixedOverflowWidgets = 42)] = "fixedOverflowWidgets"),
			(e[(e.folding = 43)] = "folding"),
			(e[(e.foldingStrategy = 44)] = "foldingStrategy"),
			(e[(e.foldingHighlight = 45)] = "foldingHighlight"),
			(e[(e.foldingImportsByDefault = 46)] = "foldingImportsByDefault"),
			(e[(e.foldingMaximumRegions = 47)] = "foldingMaximumRegions"),
			(e[(e.unfoldOnClickAfterEndOfLine = 48)] =
				"unfoldOnClickAfterEndOfLine"),
			(e[(e.fontFamily = 49)] = "fontFamily"),
			(e[(e.fontInfo = 50)] = "fontInfo"),
			(e[(e.fontLigatures = 51)] = "fontLigatures"),
			(e[(e.fontSize = 52)] = "fontSize"),
			(e[(e.fontWeight = 53)] = "fontWeight"),
			(e[(e.fontVariations = 54)] = "fontVariations"),
			(e[(e.formatOnPaste = 55)] = "formatOnPaste"),
			(e[(e.formatOnType = 56)] = "formatOnType"),
			(e[(e.glyphMargin = 57)] = "glyphMargin"),
			(e[(e.gotoLocation = 58)] = "gotoLocation"),
			(e[(e.hideCursorInOverviewRuler = 59)] =
				"hideCursorInOverviewRuler"),
			(e[(e.hover = 60)] = "hover"),
			(e[(e.inDiffEditor = 61)] = "inDiffEditor"),
			(e[(e.inlineSuggest = 62)] = "inlineSuggest"),
			(e[(e.inlineEdit = 63)] = "inlineEdit"),
			(e[(e.letterSpacing = 64)] = "letterSpacing"),
			(e[(e.lightbulb = 65)] = "lightbulb"),
			(e[(e.lineDecorationsWidth = 66)] = "lineDecorationsWidth"),
			(e[(e.lineHeight = 67)] = "lineHeight"),
			(e[(e.lineNumbers = 68)] = "lineNumbers"),
			(e[(e.lineNumbersMinChars = 69)] = "lineNumbersMinChars"),
			(e[(e.linkedEditing = 70)] = "linkedEditing"),
			(e[(e.links = 71)] = "links"),
			(e[(e.matchBrackets = 72)] = "matchBrackets"),
			(e[(e.minimap = 73)] = "minimap"),
			(e[(e.mouseStyle = 74)] = "mouseStyle"),
			(e[(e.mouseWheelScrollSensitivity = 75)] =
				"mouseWheelScrollSensitivity"),
			(e[(e.mouseWheelZoom = 76)] = "mouseWheelZoom"),
			(e[(e.multiCursorMergeOverlapping = 77)] =
				"multiCursorMergeOverlapping"),
			(e[(e.multiCursorModifier = 78)] = "multiCursorModifier"),
			(e[(e.multiCursorPaste = 79)] = "multiCursorPaste"),
			(e[(e.multiCursorLimit = 80)] = "multiCursorLimit"),
			(e[(e.occurrencesHighlight = 81)] = "occurrencesHighlight"),
			(e[(e.overviewRulerBorder = 82)] = "overviewRulerBorder"),
			(e[(e.overviewRulerLanes = 83)] = "overviewRulerLanes"),
			(e[(e.padding = 84)] = "padding"),
			(e[(e.pasteAs = 85)] = "pasteAs"),
			(e[(e.parameterHints = 86)] = "parameterHints"),
			(e[(e.peekWidgetDefaultFocus = 87)] = "peekWidgetDefaultFocus"),
			(e[(e.placeholder = 88)] = "placeholder"),
			(e[(e.definitionLinkOpensInPeek = 89)] =
				"definitionLinkOpensInPeek"),
			(e[(e.quickSuggestions = 90)] = "quickSuggestions"),
			(e[(e.quickSuggestionsDelay = 91)] = "quickSuggestionsDelay"),
			(e[(e.readOnly = 92)] = "readOnly"),
			(e[(e.readOnlyMessage = 93)] = "readOnlyMessage"),
			(e[(e.renameOnType = 94)] = "renameOnType"),
			(e[(e.renderControlCharacters = 95)] = "renderControlCharacters"),
			(e[(e.renderFinalNewline = 96)] = "renderFinalNewline"),
			(e[(e.renderLineHighlight = 97)] = "renderLineHighlight"),
			(e[(e.renderLineHighlightOnlyWhenFocus = 98)] =
				"renderLineHighlightOnlyWhenFocus"),
			(e[(e.renderValidationDecorations = 99)] =
				"renderValidationDecorations"),
			(e[(e.renderWhitespace = 100)] = "renderWhitespace"),
			(e[(e.revealHorizontalRightPadding = 101)] =
				"revealHorizontalRightPadding"),
			(e[(e.roundedSelection = 102)] = "roundedSelection"),
			(e[(e.rulers = 103)] = "rulers"),
			(e[(e.scrollbar = 104)] = "scrollbar"),
			(e[(e.scrollBeyondLastColumn = 105)] = "scrollBeyondLastColumn"),
			(e[(e.scrollBeyondLastLine = 106)] = "scrollBeyondLastLine"),
			(e[(e.scrollPredominantAxis = 107)] = "scrollPredominantAxis"),
			(e[(e.selectionClipboard = 108)] = "selectionClipboard"),
			(e[(e.selectionHighlight = 109)] = "selectionHighlight"),
			(e[(e.selectOnLineNumbers = 110)] = "selectOnLineNumbers"),
			(e[(e.showFoldingControls = 111)] = "showFoldingControls"),
			(e[(e.showUnused = 112)] = "showUnused"),
			(e[(e.snippetSuggestions = 113)] = "snippetSuggestions"),
			(e[(e.smartSelect = 114)] = "smartSelect"),
			(e[(e.smoothScrolling = 115)] = "smoothScrolling"),
			(e[(e.stickyScroll = 116)] = "stickyScroll"),
			(e[(e.stickyTabStops = 117)] = "stickyTabStops"),
			(e[(e.stopRenderingLineAfter = 118)] = "stopRenderingLineAfter"),
			(e[(e.suggest = 119)] = "suggest"),
			(e[(e.suggestFontSize = 120)] = "suggestFontSize"),
			(e[(e.suggestLineHeight = 121)] = "suggestLineHeight"),
			(e[(e.suggestOnTriggerCharacters = 122)] =
				"suggestOnTriggerCharacters"),
			(e[(e.suggestSelection = 123)] = "suggestSelection"),
			(e[(e.tabCompletion = 124)] = "tabCompletion"),
			(e[(e.tabIndex = 125)] = "tabIndex"),
			(e[(e.unicodeHighlighting = 126)] = "unicodeHighlighting"),
			(e[(e.unusualLineTerminators = 127)] = "unusualLineTerminators"),
			(e[(e.useShadowDOM = 128)] = "useShadowDOM"),
			(e[(e.useTabStops = 129)] = "useTabStops"),
			(e[(e.wordBreak = 130)] = "wordBreak"),
			(e[(e.wordSegmenterLocales = 131)] = "wordSegmenterLocales"),
			(e[(e.wordSeparators = 132)] = "wordSeparators"),
			(e[(e.wordWrap = 133)] = "wordWrap"),
			(e[(e.wordWrapBreakAfterCharacters = 134)] =
				"wordWrapBreakAfterCharacters"),
			(e[(e.wordWrapBreakBeforeCharacters = 135)] =
				"wordWrapBreakBeforeCharacters"),
			(e[(e.wordWrapColumn = 136)] = "wordWrapColumn"),
			(e[(e.wordWrapOverride1 = 137)] = "wordWrapOverride1"),
			(e[(e.wordWrapOverride2 = 138)] = "wordWrapOverride2"),
			(e[(e.wrappingIndent = 139)] = "wrappingIndent"),
			(e[(e.wrappingStrategy = 140)] = "wrappingStrategy"),
			(e[(e.showDeprecated = 141)] = "showDeprecated"),
			(e[(e.inlayHints = 142)] = "inlayHints"),
			(e[(e.editorClassName = 143)] = "editorClassName"),
			(e[(e.pixelRatio = 144)] = "pixelRatio"),
			(e[(e.tabFocusMode = 145)] = "tabFocusMode"),
			(e[(e.layoutInfo = 146)] = "layoutInfo"),
			(e[(e.wrappingInfo = 147)] = "wrappingInfo"),
			(e[(e.defaultColorDecorators = 148)] = "defaultColorDecorators"),
			(e[(e.colorDecoratorsActivatedOn = 149)] =
				"colorDecoratorsActivatedOn"),
			(e[(e.inlineCompletionsAccessibilityVerbose = 150)] =
				"inlineCompletionsAccessibilityVerbose");
	})(is || (is = {}));
	var as;
	(function (e) {
		(e[(e.TextDefined = 0)] = "TextDefined"),
			(e[(e.LF = 1)] = "LF"),
			(e[(e.CRLF = 2)] = "CRLF");
	})(as || (as = {}));
	var os;
	(function (e) {
		(e[(e.LF = 0)] = "LF"), (e[(e.CRLF = 1)] = "CRLF");
	})(os || (os = {}));
	var ls;
	(function (e) {
		(e[(e.Left = 1)] = "Left"),
			(e[(e.Center = 2)] = "Center"),
			(e[(e.Right = 3)] = "Right");
	})(ls || (ls = {}));
	var us;
	(function (e) {
		(e[(e.Increase = 0)] = "Increase"), (e[(e.Decrease = 1)] = "Decrease");
	})(us || (us = {}));
	var cs;
	(function (e) {
		(e[(e.None = 0)] = "None"),
			(e[(e.Indent = 1)] = "Indent"),
			(e[(e.IndentOutdent = 2)] = "IndentOutdent"),
			(e[(e.Outdent = 3)] = "Outdent");
	})(cs || (cs = {}));
	var hs;
	(function (e) {
		(e[(e.Both = 0)] = "Both"),
			(e[(e.Right = 1)] = "Right"),
			(e[(e.Left = 2)] = "Left"),
			(e[(e.None = 3)] = "None");
	})(hs || (hs = {}));
	var fs;
	(function (e) {
		(e[(e.Type = 1)] = "Type"), (e[(e.Parameter = 2)] = "Parameter");
	})(fs || (fs = {}));
	var ds;
	(function (e) {
		(e[(e.Automatic = 0)] = "Automatic"),
			(e[(e.Explicit = 1)] = "Explicit");
	})(ds || (ds = {}));
	var ms;
	(function (e) {
		(e[(e.Invoke = 0)] = "Invoke"), (e[(e.Automatic = 1)] = "Automatic");
	})(ms || (ms = {}));
	var Ot;
	(function (e) {
		(e[(e.DependsOnKbLayout = -1)] = "DependsOnKbLayout"),
			(e[(e.Unknown = 0)] = "Unknown"),
			(e[(e.Backspace = 1)] = "Backspace"),
			(e[(e.Tab = 2)] = "Tab"),
			(e[(e.Enter = 3)] = "Enter"),
			(e[(e.Shift = 4)] = "Shift"),
			(e[(e.Ctrl = 5)] = "Ctrl"),
			(e[(e.Alt = 6)] = "Alt"),
			(e[(e.PauseBreak = 7)] = "PauseBreak"),
			(e[(e.CapsLock = 8)] = "CapsLock"),
			(e[(e.Escape = 9)] = "Escape"),
			(e[(e.Space = 10)] = "Space"),
			(e[(e.PageUp = 11)] = "PageUp"),
			(e[(e.PageDown = 12)] = "PageDown"),
			(e[(e.End = 13)] = "End"),
			(e[(e.Home = 14)] = "Home"),
			(e[(e.LeftArrow = 15)] = "LeftArrow"),
			(e[(e.UpArrow = 16)] = "UpArrow"),
			(e[(e.RightArrow = 17)] = "RightArrow"),
			(e[(e.DownArrow = 18)] = "DownArrow"),
			(e[(e.Insert = 19)] = "Insert"),
			(e[(e.Delete = 20)] = "Delete"),
			(e[(e.Digit0 = 21)] = "Digit0"),
			(e[(e.Digit1 = 22)] = "Digit1"),
			(e[(e.Digit2 = 23)] = "Digit2"),
			(e[(e.Digit3 = 24)] = "Digit3"),
			(e[(e.Digit4 = 25)] = "Digit4"),
			(e[(e.Digit5 = 26)] = "Digit5"),
			(e[(e.Digit6 = 27)] = "Digit6"),
			(e[(e.Digit7 = 28)] = "Digit7"),
			(e[(e.Digit8 = 29)] = "Digit8"),
			(e[(e.Digit9 = 30)] = "Digit9"),
			(e[(e.KeyA = 31)] = "KeyA"),
			(e[(e.KeyB = 32)] = "KeyB"),
			(e[(e.KeyC = 33)] = "KeyC"),
			(e[(e.KeyD = 34)] = "KeyD"),
			(e[(e.KeyE = 35)] = "KeyE"),
			(e[(e.KeyF = 36)] = "KeyF"),
			(e[(e.KeyG = 37)] = "KeyG"),
			(e[(e.KeyH = 38)] = "KeyH"),
			(e[(e.KeyI = 39)] = "KeyI"),
			(e[(e.KeyJ = 40)] = "KeyJ"),
			(e[(e.KeyK = 41)] = "KeyK"),
			(e[(e.KeyL = 42)] = "KeyL"),
			(e[(e.KeyM = 43)] = "KeyM"),
			(e[(e.KeyN = 44)] = "KeyN"),
			(e[(e.KeyO = 45)] = "KeyO"),
			(e[(e.KeyP = 46)] = "KeyP"),
			(e[(e.KeyQ = 47)] = "KeyQ"),
			(e[(e.KeyR = 48)] = "KeyR"),
			(e[(e.KeyS = 49)] = "KeyS"),
			(e[(e.KeyT = 50)] = "KeyT"),
			(e[(e.KeyU = 51)] = "KeyU"),
			(e[(e.KeyV = 52)] = "KeyV"),
			(e[(e.KeyW = 53)] = "KeyW"),
			(e[(e.KeyX = 54)] = "KeyX"),
			(e[(e.KeyY = 55)] = "KeyY"),
			(e[(e.KeyZ = 56)] = "KeyZ"),
			(e[(e.Meta = 57)] = "Meta"),
			(e[(e.ContextMenu = 58)] = "ContextMenu"),
			(e[(e.F1 = 59)] = "F1"),
			(e[(e.F2 = 60)] = "F2"),
			(e[(e.F3 = 61)] = "F3"),
			(e[(e.F4 = 62)] = "F4"),
			(e[(e.F5 = 63)] = "F5"),
			(e[(e.F6 = 64)] = "F6"),
			(e[(e.F7 = 65)] = "F7"),
			(e[(e.F8 = 66)] = "F8"),
			(e[(e.F9 = 67)] = "F9"),
			(e[(e.F10 = 68)] = "F10"),
			(e[(e.F11 = 69)] = "F11"),
			(e[(e.F12 = 70)] = "F12"),
			(e[(e.F13 = 71)] = "F13"),
			(e[(e.F14 = 72)] = "F14"),
			(e[(e.F15 = 73)] = "F15"),
			(e[(e.F16 = 74)] = "F16"),
			(e[(e.F17 = 75)] = "F17"),
			(e[(e.F18 = 76)] = "F18"),
			(e[(e.F19 = 77)] = "F19"),
			(e[(e.F20 = 78)] = "F20"),
			(e[(e.F21 = 79)] = "F21"),
			(e[(e.F22 = 80)] = "F22"),
			(e[(e.F23 = 81)] = "F23"),
			(e[(e.F24 = 82)] = "F24"),
			(e[(e.NumLock = 83)] = "NumLock"),
			(e[(e.ScrollLock = 84)] = "ScrollLock"),
			(e[(e.Semicolon = 85)] = "Semicolon"),
			(e[(e.Equal = 86)] = "Equal"),
			(e[(e.Comma = 87)] = "Comma"),
			(e[(e.Minus = 88)] = "Minus"),
			(e[(e.Period = 89)] = "Period"),
			(e[(e.Slash = 90)] = "Slash"),
			(e[(e.Backquote = 91)] = "Backquote"),
			(e[(e.BracketLeft = 92)] = "BracketLeft"),
			(e[(e.Backslash = 93)] = "Backslash"),
			(e[(e.BracketRight = 94)] = "BracketRight"),
			(e[(e.Quote = 95)] = "Quote"),
			(e[(e.OEM_8 = 96)] = "OEM_8"),
			(e[(e.IntlBackslash = 97)] = "IntlBackslash"),
			(e[(e.Numpad0 = 98)] = "Numpad0"),
			(e[(e.Numpad1 = 99)] = "Numpad1"),
			(e[(e.Numpad2 = 100)] = "Numpad2"),
			(e[(e.Numpad3 = 101)] = "Numpad3"),
			(e[(e.Numpad4 = 102)] = "Numpad4"),
			(e[(e.Numpad5 = 103)] = "Numpad5"),
			(e[(e.Numpad6 = 104)] = "Numpad6"),
			(e[(e.Numpad7 = 105)] = "Numpad7"),
			(e[(e.Numpad8 = 106)] = "Numpad8"),
			(e[(e.Numpad9 = 107)] = "Numpad9"),
			(e[(e.NumpadMultiply = 108)] = "NumpadMultiply"),
			(e[(e.NumpadAdd = 109)] = "NumpadAdd"),
			(e[(e.NUMPAD_SEPARATOR = 110)] = "NUMPAD_SEPARATOR"),
			(e[(e.NumpadSubtract = 111)] = "NumpadSubtract"),
			(e[(e.NumpadDecimal = 112)] = "NumpadDecimal"),
			(e[(e.NumpadDivide = 113)] = "NumpadDivide"),
			(e[(e.KEY_IN_COMPOSITION = 114)] = "KEY_IN_COMPOSITION"),
			(e[(e.ABNT_C1 = 115)] = "ABNT_C1"),
			(e[(e.ABNT_C2 = 116)] = "ABNT_C2"),
			(e[(e.AudioVolumeMute = 117)] = "AudioVolumeMute"),
			(e[(e.AudioVolumeUp = 118)] = "AudioVolumeUp"),
			(e[(e.AudioVolumeDown = 119)] = "AudioVolumeDown"),
			(e[(e.BrowserSearch = 120)] = "BrowserSearch"),
			(e[(e.BrowserHome = 121)] = "BrowserHome"),
			(e[(e.BrowserBack = 122)] = "BrowserBack"),
			(e[(e.BrowserForward = 123)] = "BrowserForward"),
			(e[(e.MediaTrackNext = 124)] = "MediaTrackNext"),
			(e[(e.MediaTrackPrevious = 125)] = "MediaTrackPrevious"),
			(e[(e.MediaStop = 126)] = "MediaStop"),
			(e[(e.MediaPlayPause = 127)] = "MediaPlayPause"),
			(e[(e.LaunchMediaPlayer = 128)] = "LaunchMediaPlayer"),
			(e[(e.LaunchMail = 129)] = "LaunchMail"),
			(e[(e.LaunchApp2 = 130)] = "LaunchApp2"),
			(e[(e.Clear = 131)] = "Clear"),
			(e[(e.MAX_VALUE = 132)] = "MAX_VALUE");
	})(Ot || (Ot = {}));
	var jt;
	(function (e) {
		(e[(e.Hint = 1)] = "Hint"),
			(e[(e.Info = 2)] = "Info"),
			(e[(e.Warning = 4)] = "Warning"),
			(e[(e.Error = 8)] = "Error");
	})(jt || (jt = {}));
	var Xt;
	(function (e) {
		(e[(e.Unnecessary = 1)] = "Unnecessary"),
			(e[(e.Deprecated = 2)] = "Deprecated");
	})(Xt || (Xt = {}));
	var gs;
	(function (e) {
		(e[(e.Inline = 1)] = "Inline"), (e[(e.Gutter = 2)] = "Gutter");
	})(gs || (gs = {}));
	var bs;
	(function (e) {
		(e[(e.Normal = 1)] = "Normal"), (e[(e.Underlined = 2)] = "Underlined");
	})(bs || (bs = {}));
	var _s;
	(function (e) {
		(e[(e.UNKNOWN = 0)] = "UNKNOWN"),
			(e[(e.TEXTAREA = 1)] = "TEXTAREA"),
			(e[(e.GUTTER_GLYPH_MARGIN = 2)] = "GUTTER_GLYPH_MARGIN"),
			(e[(e.GUTTER_LINE_NUMBERS = 3)] = "GUTTER_LINE_NUMBERS"),
			(e[(e.GUTTER_LINE_DECORATIONS = 4)] = "GUTTER_LINE_DECORATIONS"),
			(e[(e.GUTTER_VIEW_ZONE = 5)] = "GUTTER_VIEW_ZONE"),
			(e[(e.CONTENT_TEXT = 6)] = "CONTENT_TEXT"),
			(e[(e.CONTENT_EMPTY = 7)] = "CONTENT_EMPTY"),
			(e[(e.CONTENT_VIEW_ZONE = 8)] = "CONTENT_VIEW_ZONE"),
			(e[(e.CONTENT_WIDGET = 9)] = "CONTENT_WIDGET"),
			(e[(e.OVERVIEW_RULER = 10)] = "OVERVIEW_RULER"),
			(e[(e.SCROLLBAR = 11)] = "SCROLLBAR"),
			(e[(e.OVERLAY_WIDGET = 12)] = "OVERLAY_WIDGET"),
			(e[(e.OUTSIDE_EDITOR = 13)] = "OUTSIDE_EDITOR");
	})(_s || (_s = {}));
	var xs;
	(function (e) {
		e[(e.AIGenerated = 1)] = "AIGenerated";
	})(xs || (xs = {}));
	var ps;
	(function (e) {
		(e[(e.Invoke = 0)] = "Invoke"), (e[(e.Automatic = 1)] = "Automatic");
	})(ps || (ps = {}));
	var ws;
	(function (e) {
		(e[(e.TOP_RIGHT_CORNER = 0)] = "TOP_RIGHT_CORNER"),
			(e[(e.BOTTOM_RIGHT_CORNER = 1)] = "BOTTOM_RIGHT_CORNER"),
			(e[(e.TOP_CENTER = 2)] = "TOP_CENTER");
	})(ws || (ws = {}));
	var Ls;
	(function (e) {
		(e[(e.Left = 1)] = "Left"),
			(e[(e.Center = 2)] = "Center"),
			(e[(e.Right = 4)] = "Right"),
			(e[(e.Full = 7)] = "Full");
	})(Ls || (Ls = {}));
	var vs;
	(function (e) {
		(e[(e.Word = 0)] = "Word"),
			(e[(e.Line = 1)] = "Line"),
			(e[(e.Suggest = 2)] = "Suggest");
	})(vs || (vs = {}));
	var Ns;
	(function (e) {
		(e[(e.Left = 0)] = "Left"),
			(e[(e.Right = 1)] = "Right"),
			(e[(e.None = 2)] = "None"),
			(e[(e.LeftOfInjectedText = 3)] = "LeftOfInjectedText"),
			(e[(e.RightOfInjectedText = 4)] = "RightOfInjectedText");
	})(Ns || (Ns = {}));
	var Ss;
	(function (e) {
		(e[(e.Off = 0)] = "Off"),
			(e[(e.On = 1)] = "On"),
			(e[(e.Relative = 2)] = "Relative"),
			(e[(e.Interval = 3)] = "Interval"),
			(e[(e.Custom = 4)] = "Custom");
	})(Ss || (Ss = {}));
	var Cs;
	(function (e) {
		(e[(e.None = 0)] = "None"),
			(e[(e.Text = 1)] = "Text"),
			(e[(e.Blocks = 2)] = "Blocks");
	})(Cs || (Cs = {}));
	var As;
	(function (e) {
		(e[(e.Smooth = 0)] = "Smooth"), (e[(e.Immediate = 1)] = "Immediate");
	})(As || (As = {}));
	var Rs;
	(function (e) {
		(e[(e.Auto = 1)] = "Auto"),
			(e[(e.Hidden = 2)] = "Hidden"),
			(e[(e.Visible = 3)] = "Visible");
	})(Rs || (Rs = {}));
	var Qt;
	(function (e) {
		(e[(e.LTR = 0)] = "LTR"), (e[(e.RTL = 1)] = "RTL");
	})(Qt || (Qt = {}));
	var ys;
	(function (e) {
		(e.Off = "off"), (e.OnCode = "onCode"), (e.On = "on");
	})(ys || (ys = {}));
	var Es;
	(function (e) {
		(e[(e.Invoke = 1)] = "Invoke"),
			(e[(e.TriggerCharacter = 2)] = "TriggerCharacter"),
			(e[(e.ContentChange = 3)] = "ContentChange");
	})(Es || (Es = {}));
	var Ms;
	(function (e) {
		(e[(e.File = 0)] = "File"),
			(e[(e.Module = 1)] = "Module"),
			(e[(e.Namespace = 2)] = "Namespace"),
			(e[(e.Package = 3)] = "Package"),
			(e[(e.Class = 4)] = "Class"),
			(e[(e.Method = 5)] = "Method"),
			(e[(e.Property = 6)] = "Property"),
			(e[(e.Field = 7)] = "Field"),
			(e[(e.Constructor = 8)] = "Constructor"),
			(e[(e.Enum = 9)] = "Enum"),
			(e[(e.Interface = 10)] = "Interface"),
			(e[(e.Function = 11)] = "Function"),
			(e[(e.Variable = 12)] = "Variable"),
			(e[(e.Constant = 13)] = "Constant"),
			(e[(e.String = 14)] = "String"),
			(e[(e.Number = 15)] = "Number"),
			(e[(e.Boolean = 16)] = "Boolean"),
			(e[(e.Array = 17)] = "Array"),
			(e[(e.Object = 18)] = "Object"),
			(e[(e.Key = 19)] = "Key"),
			(e[(e.Null = 20)] = "Null"),
			(e[(e.EnumMember = 21)] = "EnumMember"),
			(e[(e.Struct = 22)] = "Struct"),
			(e[(e.Event = 23)] = "Event"),
			(e[(e.Operator = 24)] = "Operator"),
			(e[(e.TypeParameter = 25)] = "TypeParameter");
	})(Ms || (Ms = {}));
	var ks;
	(function (e) {
		e[(e.Deprecated = 1)] = "Deprecated";
	})(ks || (ks = {}));
	var Fs;
	(function (e) {
		(e[(e.Hidden = 0)] = "Hidden"),
			(e[(e.Blink = 1)] = "Blink"),
			(e[(e.Smooth = 2)] = "Smooth"),
			(e[(e.Phase = 3)] = "Phase"),
			(e[(e.Expand = 4)] = "Expand"),
			(e[(e.Solid = 5)] = "Solid");
	})(Fs || (Fs = {}));
	var Ds;
	(function (e) {
		(e[(e.Line = 1)] = "Line"),
			(e[(e.Block = 2)] = "Block"),
			(e[(e.Underline = 3)] = "Underline"),
			(e[(e.LineThin = 4)] = "LineThin"),
			(e[(e.BlockOutline = 5)] = "BlockOutline"),
			(e[(e.UnderlineThin = 6)] = "UnderlineThin");
	})(Ds || (Ds = {}));
	var Ps;
	(function (e) {
		(e[(e.AlwaysGrowsWhenTypingAtEdges = 0)] =
			"AlwaysGrowsWhenTypingAtEdges"),
			(e[(e.NeverGrowsWhenTypingAtEdges = 1)] =
				"NeverGrowsWhenTypingAtEdges"),
			(e[(e.GrowsOnlyWhenTypingBefore = 2)] =
				"GrowsOnlyWhenTypingBefore"),
			(e[(e.GrowsOnlyWhenTypingAfter = 3)] = "GrowsOnlyWhenTypingAfter");
	})(Ps || (Ps = {}));
	var Ts;
	(function (e) {
		(e[(e.None = 0)] = "None"),
			(e[(e.Same = 1)] = "Same"),
			(e[(e.Indent = 2)] = "Indent"),
			(e[(e.DeepIndent = 3)] = "DeepIndent");
	})(Ts || (Ts = {}));
	class zi {
		static {
			this.CtrlCmd = 2048;
		}
		static {
			this.Shift = 1024;
		}
		static {
			this.Alt = 512;
		}
		static {
			this.WinCtrl = 256;
		}
		static chord(t, n) {
			return Vi(t, n);
		}
	}
	function $i() {
		return {
			editor: void 0,
			languages: void 0,
			CancellationTokenSource: Fi,
			Emitter: ae,
			KeyCode: Ot,
			KeyMod: zi,
			Position: q,
			Range: k,
			Selection: se,
			SelectionDirection: Qt,
			MarkerSeverity: jt,
			MarkerTag: Xt,
			Uri: Ae,
			Token: Wi,
		};
	}
	var Vs;
	class Gi {
		constructor() {
			(this[Vs] = "LinkedMap"),
				(this._map = new Map()),
				(this._head = void 0),
				(this._tail = void 0),
				(this._size = 0),
				(this._state = 0);
		}
		clear() {
			this._map.clear(),
				(this._head = void 0),
				(this._tail = void 0),
				(this._size = 0),
				this._state++;
		}
		isEmpty() {
			return !this._head && !this._tail;
		}
		get size() {
			return this._size;
		}
		get first() {
			return this._head?.value;
		}
		get last() {
			return this._tail?.value;
		}
		has(t) {
			return this._map.has(t);
		}
		get(t, n = 0) {
			const s = this._map.get(t);
			if (s) return n !== 0 && this.touch(s, n), s.value;
		}
		set(t, n, s = 0) {
			let r = this._map.get(t);
			if (r) (r.value = n), s !== 0 && this.touch(r, s);
			else {
				switch (
					((r = { key: t, value: n, next: void 0, previous: void 0 }),
					s)
				) {
					case 0:
						this.addItemLast(r);
						break;
					case 1:
						this.addItemFirst(r);
						break;
					case 2:
						this.addItemLast(r);
						break;
					default:
						this.addItemLast(r);
						break;
				}
				this._map.set(t, r), this._size++;
			}
			return this;
		}
		delete(t) {
			return !!this.remove(t);
		}
		remove(t) {
			const n = this._map.get(t);
			if (n)
				return (
					this._map.delete(t),
					this.removeItem(n),
					this._size--,
					n.value
				);
		}
		shift() {
			if (!this._head && !this._tail) return;
			if (!this._head || !this._tail) throw new Error("Invalid list");
			const t = this._head;
			return (
				this._map.delete(t.key),
				this.removeItem(t),
				this._size--,
				t.value
			);
		}
		forEach(t, n) {
			const s = this._state;
			let r = this._head;
			for (; r; ) {
				if (
					(n
						? t.bind(n)(r.value, r.key, this)
						: t(r.value, r.key, this),
					this._state !== s)
				)
					throw new Error("LinkedMap got modified during iteration.");
				r = r.next;
			}
		}
		keys() {
			const t = this,
				n = this._state;
			let s = this._head;
			const r = {
				[Symbol.iterator]() {
					return r;
				},
				next() {
					if (t._state !== n)
						throw new Error(
							"LinkedMap got modified during iteration.",
						);
					if (s) {
						const i = { value: s.key, done: !1 };
						return (s = s.next), i;
					} else return { value: void 0, done: !0 };
				},
			};
			return r;
		}
		values() {
			const t = this,
				n = this._state;
			let s = this._head;
			const r = {
				[Symbol.iterator]() {
					return r;
				},
				next() {
					if (t._state !== n)
						throw new Error(
							"LinkedMap got modified during iteration.",
						);
					if (s) {
						const i = { value: s.value, done: !1 };
						return (s = s.next), i;
					} else return { value: void 0, done: !0 };
				},
			};
			return r;
		}
		entries() {
			const t = this,
				n = this._state;
			let s = this._head;
			const r = {
				[Symbol.iterator]() {
					return r;
				},
				next() {
					if (t._state !== n)
						throw new Error(
							"LinkedMap got modified during iteration.",
						);
					if (s) {
						const i = { value: [s.key, s.value], done: !1 };
						return (s = s.next), i;
					} else return { value: void 0, done: !0 };
				},
			};
			return r;
		}
		[((Vs = Symbol.toStringTag), Symbol.iterator)]() {
			return this.entries();
		}
		trimOld(t) {
			if (t >= this.size) return;
			if (t === 0) {
				this.clear();
				return;
			}
			let n = this._head,
				s = this.size;
			for (; n && s > t; ) this._map.delete(n.key), (n = n.next), s--;
			(this._head = n),
				(this._size = s),
				n && (n.previous = void 0),
				this._state++;
		}
		trimNew(t) {
			if (t >= this.size) return;
			if (t === 0) {
				this.clear();
				return;
			}
			let n = this._tail,
				s = this.size;
			for (; n && s > t; ) this._map.delete(n.key), (n = n.previous), s--;
			(this._tail = n),
				(this._size = s),
				n && (n.next = void 0),
				this._state++;
		}
		addItemFirst(t) {
			if (!this._head && !this._tail) this._tail = t;
			else if (this._head)
				(t.next = this._head), (this._head.previous = t);
			else throw new Error("Invalid list");
			(this._head = t), this._state++;
		}
		addItemLast(t) {
			if (!this._head && !this._tail) this._head = t;
			else if (this._tail)
				(t.previous = this._tail), (this._tail.next = t);
			else throw new Error("Invalid list");
			(this._tail = t), this._state++;
		}
		removeItem(t) {
			if (t === this._head && t === this._tail)
				(this._head = void 0), (this._tail = void 0);
			else if (t === this._head) {
				if (!t.next) throw new Error("Invalid list");
				(t.next.previous = void 0), (this._head = t.next);
			} else if (t === this._tail) {
				if (!t.previous) throw new Error("Invalid list");
				(t.previous.next = void 0), (this._tail = t.previous);
			} else {
				const n = t.next,
					s = t.previous;
				if (!n || !s) throw new Error("Invalid list");
				(n.previous = s), (s.next = n);
			}
			(t.next = void 0), (t.previous = void 0), this._state++;
		}
		touch(t, n) {
			if (!this._head || !this._tail) throw new Error("Invalid list");
			if (!(n !== 1 && n !== 2)) {
				if (n === 1) {
					if (t === this._head) return;
					const s = t.next,
						r = t.previous;
					t === this._tail
						? ((r.next = void 0), (this._tail = r))
						: ((s.previous = r), (r.next = s)),
						(t.previous = void 0),
						(t.next = this._head),
						(this._head.previous = t),
						(this._head = t),
						this._state++;
				} else if (n === 2) {
					if (t === this._tail) return;
					const s = t.next,
						r = t.previous;
					t === this._head
						? ((s.previous = void 0), (this._head = s))
						: ((s.previous = r), (r.next = s)),
						(t.next = void 0),
						(t.previous = this._tail),
						(this._tail.next = t),
						(this._tail = t),
						this._state++;
				}
			}
		}
		toJSON() {
			const t = [];
			return (
				this.forEach((n, s) => {
					t.push([s, n]);
				}),
				t
			);
		}
		fromJSON(t) {
			this.clear();
			for (const [n, s] of t) this.set(n, s);
		}
	}
	class Oi extends Gi {
		constructor(t, n = 1) {
			super(),
				(this._limit = t),
				(this._ratio = Math.min(Math.max(0, n), 1));
		}
		get limit() {
			return this._limit;
		}
		set limit(t) {
			(this._limit = t), this.checkTrim();
		}
		get(t, n = 2) {
			return super.get(t, n);
		}
		peek(t) {
			return super.get(t, 0);
		}
		set(t, n) {
			return super.set(t, n, 2), this;
		}
		checkTrim() {
			this.size > this._limit &&
				this.trim(Math.round(this._limit * this._ratio));
		}
	}
	class ji extends Oi {
		constructor(t, n = 1) {
			super(t, n);
		}
		trim(t) {
			this.trimOld(t);
		}
		set(t, n) {
			return super.set(t, n), this.checkTrim(), this;
		}
	}
	class Xi {
		constructor() {
			this.map = new Map();
		}
		add(t, n) {
			let s = this.map.get(t);
			s || ((s = new Set()), this.map.set(t, s)), s.add(n);
		}
		delete(t, n) {
			const s = this.map.get(t);
			s && (s.delete(n), s.size === 0 && this.map.delete(t));
		}
		forEach(t, n) {
			const s = this.map.get(t);
			s && s.forEach(n);
		}
		get(t) {
			const n = this.map.get(t);
			return n || new Set();
		}
	}
	new ji(10);
	var Is;
	(function (e) {
		(e[(e.Left = 1)] = "Left"),
			(e[(e.Center = 2)] = "Center"),
			(e[(e.Right = 4)] = "Right"),
			(e[(e.Full = 7)] = "Full");
	})(Is || (Is = {}));
	var Bs;
	(function (e) {
		(e[(e.Left = 1)] = "Left"),
			(e[(e.Center = 2)] = "Center"),
			(e[(e.Right = 3)] = "Right");
	})(Bs || (Bs = {}));
	var qs;
	(function (e) {
		(e[(e.Both = 0)] = "Both"),
			(e[(e.Right = 1)] = "Right"),
			(e[(e.Left = 2)] = "Left"),
			(e[(e.None = 3)] = "None");
	})(qs || (qs = {}));
	function Qi(e, t, n, s, r) {
		if (s === 0) return !0;
		const i = t.charCodeAt(s - 1);
		if (e.get(i) !== 0 || i === 13 || i === 10) return !0;
		if (r > 0) {
			const o = t.charCodeAt(s);
			if (e.get(o) !== 0) return !0;
		}
		return !1;
	}
	function Ji(e, t, n, s, r) {
		if (s + r === n) return !0;
		const i = t.charCodeAt(s + r);
		if (e.get(i) !== 0 || i === 13 || i === 10) return !0;
		if (r > 0) {
			const o = t.charCodeAt(s + r - 1);
			if (e.get(o) !== 0) return !0;
		}
		return !1;
	}
	function Yi(e, t, n, s, r) {
		return Qi(e, t, n, s, r) && Ji(e, t, n, s, r);
	}
	class Zi {
		constructor(t, n) {
			(this._wordSeparators = t),
				(this._searchRegex = n),
				(this._prevMatchStartIndex = -1),
				(this._prevMatchLength = 0);
		}
		reset(t) {
			(this._searchRegex.lastIndex = t),
				(this._prevMatchStartIndex = -1),
				(this._prevMatchLength = 0);
		}
		next(t) {
			const n = t.length;
			let s;
			do {
				if (
					this._prevMatchStartIndex + this._prevMatchLength === n ||
					((s = this._searchRegex.exec(t)), !s)
				)
					return null;
				const r = s.index,
					i = s[0].length;
				if (
					r === this._prevMatchStartIndex &&
					i === this._prevMatchLength
				) {
					if (i === 0) {
						Ir(t, n, this._searchRegex.lastIndex) > 65535
							? (this._searchRegex.lastIndex += 2)
							: (this._searchRegex.lastIndex += 1);
						continue;
					}
					return null;
				}
				if (
					((this._prevMatchStartIndex = r),
					(this._prevMatchLength = i),
					!this._wordSeparators ||
						Yi(this._wordSeparators, t, n, r, i))
				)
					return s;
			} while (s);
			return null;
		}
	}
	function Ki(e, t = "Unreachable") {
		throw new Error(t);
	}
	function bt(e) {
		if (!e()) {
			debugger;
			e(), Ze(new te("Assertion Failed"));
		}
	}
	function Us(e, t) {
		let n = 0;
		for (; n < e.length - 1; ) {
			const s = e[n],
				r = e[n + 1];
			if (!t(s, r)) return !1;
			n++;
		}
		return !0;
	}
	class e1 {
		static computeUnicodeHighlights(t, n, s) {
			const r = s ? s.startLineNumber : 1,
				i = s ? s.endLineNumber : t.getLineCount(),
				o = new Hs(n),
				l = o.getCandidateCodePoints();
			let u;
			l === "allNonBasicAscii"
				? (u = new RegExp("[^\\t\\n\\r\\x20-\\x7E]", "g"))
				: (u = new RegExp(`${t1(Array.from(l))}`, "g"));
			const c = new Zi(null, u),
				f = [];
			let h = !1,
				d,
				m = 0,
				g = 0,
				b = 0;
			e: for (let w = r, v = i; w <= v; w++) {
				const C = t.getLineContent(w),
					S = C.length;
				c.reset(0);
				do
					if (((d = c.next(C)), d)) {
						let p = d.index,
							_ = d.index + d[0].length;
						if (p > 0) {
							const I = C.charCodeAt(p - 1);
							it(I) && p--;
						}
						if (_ + 1 < S) {
							const I = C.charCodeAt(_ - 1);
							it(I) && _++;
						}
						const N = C.substring(p, _);
						let A = qt(p + 1, yn, C, 0);
						A && A.endColumn <= p + 1 && (A = null);
						const y = o.shouldHighlightNonBasicASCII(
							N,
							A ? A.word : null,
						);
						if (y !== 0) {
							if (
								(y === 3
									? m++
									: y === 2
										? g++
										: y === 1
											? b++
											: Ki(),
								f.length >= 1e3)
							) {
								h = !0;
								break e;
							}
							f.push(new k(w, p + 1, w, _ + 1));
						}
					}
				while (d);
			}
			return {
				ranges: f,
				hasMore: h,
				ambiguousCharacterCount: m,
				invisibleCharacterCount: g,
				nonBasicAsciiCharacterCount: b,
			};
		}
		static computeUnicodeHighlightReason(t, n) {
			const s = new Hs(n);
			switch (s.shouldHighlightNonBasicASCII(t, null)) {
				case 0:
					return null;
				case 2:
					return { kind: 1 };
				case 3: {
					const i = t.codePointAt(0),
						o = s.ambiguousCharacters.getPrimaryConfusable(i),
						l = ge
							.getLocales()
							.filter(
								(u) =>
									!ge
										.getInstance(
											new Set([...n.allowedLocales, u]),
										)
										.isAmbiguous(i),
							);
					return {
						kind: 0,
						confusableWith: String.fromCodePoint(o),
						notAmbiguousInLocales: l,
					};
				}
				case 1:
					return { kind: 2 };
			}
		}
	}
	function t1(e, t) {
		return `[${Dr(e.map((s) => String.fromCodePoint(s)).join(""))}]`;
	}
	class Hs {
		constructor(t) {
			(this.options = t),
				(this.allowedCodePoints = new Set(t.allowedCodePoints)),
				(this.ambiguousCharacters = ge.getInstance(
					new Set(t.allowedLocales),
				));
		}
		getCandidateCodePoints() {
			if (this.options.nonBasicASCII) return "allNonBasicAscii";
			const t = new Set();
			if (this.options.invisibleCharacters)
				for (const n of Ce.codePoints)
					Ws(String.fromCodePoint(n)) || t.add(n);
			if (this.options.ambiguousCharacters)
				for (const n of this.ambiguousCharacters.getConfusableCodePoints())
					t.add(n);
			for (const n of this.allowedCodePoints) t.delete(n);
			return t;
		}
		shouldHighlightNonBasicASCII(t, n) {
			const s = t.codePointAt(0);
			if (this.allowedCodePoints.has(s)) return 0;
			if (this.options.nonBasicASCII) return 1;
			let r = !1,
				i = !1;
			if (n)
				for (const o of n) {
					const l = o.codePointAt(0),
						u = qr(o);
					(r = r || u),
						!u &&
							!this.ambiguousCharacters.isAmbiguous(l) &&
							!Ce.isInvisibleCharacter(l) &&
							(i = !0);
				}
			return !r && i
				? 0
				: this.options.invisibleCharacters &&
						!Ws(t) &&
						Ce.isInvisibleCharacter(s)
					? 2
					: this.options.ambiguousCharacters &&
							this.ambiguousCharacters.isAmbiguous(s)
						? 3
						: 0;
		}
	}
	function Ws(e) {
		return (
			e === " " ||
			e ===
				`
` ||
			e === "	"
		);
	}
	class _t {
		constructor(t, n, s) {
			(this.changes = t), (this.moves = n), (this.hitTimeout = s);
		}
	}
	class n1 {
		constructor(t, n) {
			(this.lineRangeMapping = t), (this.changes = n);
		}
	}
	class V {
		static addRange(t, n) {
			let s = 0;
			for (; s < n.length && n[s].endExclusive < t.start; ) s++;
			let r = s;
			for (; r < n.length && n[r].start <= t.endExclusive; ) r++;
			if (s === r) n.splice(s, 0, t);
			else {
				const i = Math.min(t.start, n[s].start),
					o = Math.max(t.endExclusive, n[r - 1].endExclusive);
				n.splice(s, r - s, new V(i, o));
			}
		}
		static tryCreate(t, n) {
			if (!(t > n)) return new V(t, n);
		}
		static ofLength(t) {
			return new V(0, t);
		}
		static ofStartAndLength(t, n) {
			return new V(t, t + n);
		}
		constructor(t, n) {
			if (((this.start = t), (this.endExclusive = n), t > n))
				throw new te(`Invalid range: ${this.toString()}`);
		}
		get isEmpty() {
			return this.start === this.endExclusive;
		}
		delta(t) {
			return new V(this.start + t, this.endExclusive + t);
		}
		deltaStart(t) {
			return new V(this.start + t, this.endExclusive);
		}
		deltaEnd(t) {
			return new V(this.start, this.endExclusive + t);
		}
		get length() {
			return this.endExclusive - this.start;
		}
		toString() {
			return `[${this.start}, ${this.endExclusive})`;
		}
		contains(t) {
			return this.start <= t && t < this.endExclusive;
		}
		join(t) {
			return new V(
				Math.min(this.start, t.start),
				Math.max(this.endExclusive, t.endExclusive),
			);
		}
		intersect(t) {
			const n = Math.max(this.start, t.start),
				s = Math.min(this.endExclusive, t.endExclusive);
			if (n <= s) return new V(n, s);
		}
		intersects(t) {
			const n = Math.max(this.start, t.start),
				s = Math.min(this.endExclusive, t.endExclusive);
			return n < s;
		}
		isBefore(t) {
			return this.endExclusive <= t.start;
		}
		isAfter(t) {
			return this.start >= t.endExclusive;
		}
		slice(t) {
			return t.slice(this.start, this.endExclusive);
		}
		substring(t) {
			return t.substring(this.start, this.endExclusive);
		}
		clip(t) {
			if (this.isEmpty)
				throw new te(`Invalid clipping range: ${this.toString()}`);
			return Math.max(this.start, Math.min(this.endExclusive - 1, t));
		}
		clipCyclic(t) {
			if (this.isEmpty)
				throw new te(`Invalid clipping range: ${this.toString()}`);
			return t < this.start
				? this.endExclusive - ((this.start - t) % this.length)
				: t >= this.endExclusive
					? this.start + ((t - this.start) % this.length)
					: t;
		}
		forEach(t) {
			for (let n = this.start; n < this.endExclusive; n++) t(n);
		}
	}
	function Pe(e, t) {
		const n = $e(e, t);
		return n === -1 ? void 0 : e[n];
	}
	function $e(e, t, n = 0, s = e.length) {
		let r = n,
			i = s;
		for (; r < i; ) {
			const o = Math.floor((r + i) / 2);
			t(e[o]) ? (r = o + 1) : (i = o);
		}
		return r - 1;
	}
	function s1(e, t) {
		const n = Jt(e, t);
		return n === e.length ? void 0 : e[n];
	}
	function Jt(e, t, n = 0, s = e.length) {
		let r = n,
			i = s;
		for (; r < i; ) {
			const o = Math.floor((r + i) / 2);
			t(e[o]) ? (i = o) : (r = o + 1);
		}
		return r;
	}
	class xt {
		static {
			this.assertInvariants = !1;
		}
		constructor(t) {
			(this._array = t), (this._findLastMonotonousLastIdx = 0);
		}
		findLastMonotonous(t) {
			if (xt.assertInvariants) {
				if (this._prevFindLastPredicate) {
					for (const s of this._array)
						if (this._prevFindLastPredicate(s) && !t(s))
							throw new Error(
								"MonotonousArray: current predicate must be weaker than (or equal to) the previous predicate.",
							);
				}
				this._prevFindLastPredicate = t;
			}
			const n = $e(this._array, t, this._findLastMonotonousLastIdx);
			return (
				(this._findLastMonotonousLastIdx = n + 1),
				n === -1 ? void 0 : this._array[n]
			);
		}
	}
	class D {
		static fromRangeInclusive(t) {
			return new D(t.startLineNumber, t.endLineNumber + 1);
		}
		static joinMany(t) {
			if (t.length === 0) return [];
			let n = new he(t[0].slice());
			for (let s = 1; s < t.length; s++)
				n = n.getUnion(new he(t[s].slice()));
			return n.ranges;
		}
		static join(t) {
			if (t.length === 0) throw new te("lineRanges cannot be empty");
			let n = t[0].startLineNumber,
				s = t[0].endLineNumberExclusive;
			for (let r = 1; r < t.length; r++)
				(n = Math.min(n, t[r].startLineNumber)),
					(s = Math.max(s, t[r].endLineNumberExclusive));
			return new D(n, s);
		}
		static ofLength(t, n) {
			return new D(t, t + n);
		}
		static deserialize(t) {
			return new D(t[0], t[1]);
		}
		constructor(t, n) {
			if (t > n)
				throw new te(
					`startLineNumber ${t} cannot be after endLineNumberExclusive ${n}`,
				);
			(this.startLineNumber = t), (this.endLineNumberExclusive = n);
		}
		contains(t) {
			return this.startLineNumber <= t && t < this.endLineNumberExclusive;
		}
		get isEmpty() {
			return this.startLineNumber === this.endLineNumberExclusive;
		}
		delta(t) {
			return new D(
				this.startLineNumber + t,
				this.endLineNumberExclusive + t,
			);
		}
		deltaLength(t) {
			return new D(this.startLineNumber, this.endLineNumberExclusive + t);
		}
		get length() {
			return this.endLineNumberExclusive - this.startLineNumber;
		}
		join(t) {
			return new D(
				Math.min(this.startLineNumber, t.startLineNumber),
				Math.max(this.endLineNumberExclusive, t.endLineNumberExclusive),
			);
		}
		toString() {
			return `[${this.startLineNumber},${this.endLineNumberExclusive})`;
		}
		intersect(t) {
			const n = Math.max(this.startLineNumber, t.startLineNumber),
				s = Math.min(
					this.endLineNumberExclusive,
					t.endLineNumberExclusive,
				);
			if (n <= s) return new D(n, s);
		}
		intersectsStrict(t) {
			return (
				this.startLineNumber < t.endLineNumberExclusive &&
				t.startLineNumber < this.endLineNumberExclusive
			);
		}
		overlapOrTouch(t) {
			return (
				this.startLineNumber <= t.endLineNumberExclusive &&
				t.startLineNumber <= this.endLineNumberExclusive
			);
		}
		equals(t) {
			return (
				this.startLineNumber === t.startLineNumber &&
				this.endLineNumberExclusive === t.endLineNumberExclusive
			);
		}
		toInclusiveRange() {
			return this.isEmpty
				? null
				: new k(
						this.startLineNumber,
						1,
						this.endLineNumberExclusive - 1,
						Number.MAX_SAFE_INTEGER,
					);
		}
		toExclusiveRange() {
			return new k(
				this.startLineNumber,
				1,
				this.endLineNumberExclusive,
				1,
			);
		}
		mapToLineArray(t) {
			const n = [];
			for (
				let s = this.startLineNumber;
				s < this.endLineNumberExclusive;
				s++
			)
				n.push(t(s));
			return n;
		}
		forEach(t) {
			for (
				let n = this.startLineNumber;
				n < this.endLineNumberExclusive;
				n++
			)
				t(n);
		}
		serialize() {
			return [this.startLineNumber, this.endLineNumberExclusive];
		}
		includes(t) {
			return this.startLineNumber <= t && t < this.endLineNumberExclusive;
		}
		toOffsetRange() {
			return new V(
				this.startLineNumber - 1,
				this.endLineNumberExclusive - 1,
			);
		}
	}
	class he {
		constructor(t = []) {
			this._normalizedRanges = t;
		}
		get ranges() {
			return this._normalizedRanges;
		}
		addRange(t) {
			if (t.length === 0) return;
			const n = Jt(
					this._normalizedRanges,
					(r) => r.endLineNumberExclusive >= t.startLineNumber,
				),
				s =
					$e(
						this._normalizedRanges,
						(r) => r.startLineNumber <= t.endLineNumberExclusive,
					) + 1;
			if (n === s) this._normalizedRanges.splice(n, 0, t);
			else if (n === s - 1) {
				const r = this._normalizedRanges[n];
				this._normalizedRanges[n] = r.join(t);
			} else {
				const r = this._normalizedRanges[n]
					.join(this._normalizedRanges[s - 1])
					.join(t);
				this._normalizedRanges.splice(n, s - n, r);
			}
		}
		contains(t) {
			const n = Pe(this._normalizedRanges, (s) => s.startLineNumber <= t);
			return !!n && n.endLineNumberExclusive > t;
		}
		intersects(t) {
			const n = Pe(
				this._normalizedRanges,
				(s) => s.startLineNumber < t.endLineNumberExclusive,
			);
			return !!n && n.endLineNumberExclusive > t.startLineNumber;
		}
		getUnion(t) {
			if (this._normalizedRanges.length === 0) return t;
			if (t._normalizedRanges.length === 0) return this;
			const n = [];
			let s = 0,
				r = 0,
				i = null;
			for (
				;
				s < this._normalizedRanges.length ||
				r < t._normalizedRanges.length;
			) {
				let o = null;
				if (
					s < this._normalizedRanges.length &&
					r < t._normalizedRanges.length
				) {
					const l = this._normalizedRanges[s],
						u = t._normalizedRanges[r];
					l.startLineNumber < u.startLineNumber
						? ((o = l), s++)
						: ((o = u), r++);
				} else
					s < this._normalizedRanges.length
						? ((o = this._normalizedRanges[s]), s++)
						: ((o = t._normalizedRanges[r]), r++);
				i === null
					? (i = o)
					: i.endLineNumberExclusive >= o.startLineNumber
						? (i = new D(
								i.startLineNumber,
								Math.max(
									i.endLineNumberExclusive,
									o.endLineNumberExclusive,
								),
							))
						: (n.push(i), (i = o));
			}
			return i !== null && n.push(i), new he(n);
		}
		subtractFrom(t) {
			const n = Jt(
					this._normalizedRanges,
					(o) => o.endLineNumberExclusive >= t.startLineNumber,
				),
				s =
					$e(
						this._normalizedRanges,
						(o) => o.startLineNumber <= t.endLineNumberExclusive,
					) + 1;
			if (n === s) return new he([t]);
			const r = [];
			let i = t.startLineNumber;
			for (let o = n; o < s; o++) {
				const l = this._normalizedRanges[o];
				l.startLineNumber > i && r.push(new D(i, l.startLineNumber)),
					(i = l.endLineNumberExclusive);
			}
			return (
				i < t.endLineNumberExclusive &&
					r.push(new D(i, t.endLineNumberExclusive)),
				new he(r)
			);
		}
		toString() {
			return this._normalizedRanges.map((t) => t.toString()).join(", ");
		}
		getIntersection(t) {
			const n = [];
			let s = 0,
				r = 0;
			for (
				;
				s < this._normalizedRanges.length &&
				r < t._normalizedRanges.length;
			) {
				const i = this._normalizedRanges[s],
					o = t._normalizedRanges[r],
					l = i.intersect(o);
				l && !l.isEmpty && n.push(l),
					i.endLineNumberExclusive < o.endLineNumberExclusive
						? s++
						: r++;
			}
			return new he(n);
		}
		getWithDelta(t) {
			return new he(this._normalizedRanges.map((n) => n.delta(t)));
		}
	}
	class Te {
		static {
			this.zero = new Te(0, 0);
		}
		static betweenPositions(t, n) {
			return t.lineNumber === n.lineNumber
				? new Te(0, n.column - t.column)
				: new Te(n.lineNumber - t.lineNumber, n.column - 1);
		}
		static ofRange(t) {
			return Te.betweenPositions(
				t.getStartPosition(),
				t.getEndPosition(),
			);
		}
		static ofText(t) {
			let n = 0,
				s = 0;
			for (const r of t)
				r ===
				`
`
					? (n++, (s = 0))
					: s++;
			return new Te(n, s);
		}
		constructor(t, n) {
			(this.lineCount = t), (this.columnCount = n);
		}
		isGreaterThanOrEqualTo(t) {
			return this.lineCount !== t.lineCount
				? this.lineCount > t.lineCount
				: this.columnCount >= t.columnCount;
		}
		createRange(t) {
			return this.lineCount === 0
				? new k(
						t.lineNumber,
						t.column,
						t.lineNumber,
						t.column + this.columnCount,
					)
				: new k(
						t.lineNumber,
						t.column,
						t.lineNumber + this.lineCount,
						this.columnCount + 1,
					);
		}
		addToPosition(t) {
			return this.lineCount === 0
				? new q(t.lineNumber, t.column + this.columnCount)
				: new q(t.lineNumber + this.lineCount, this.columnCount + 1);
		}
		toString() {
			return `${this.lineCount},${this.columnCount}`;
		}
	}
	class r1 {
		constructor(t, n) {
			(this.range = t), (this.text = n);
		}
		toSingleEditOperation() {
			return { range: this.range, text: this.text };
		}
	}
	class re {
		static inverse(t, n, s) {
			const r = [];
			let i = 1,
				o = 1;
			for (const u of t) {
				const c = new re(
					new D(i, u.original.startLineNumber),
					new D(o, u.modified.startLineNumber),
				);
				c.modified.isEmpty || r.push(c),
					(i = u.original.endLineNumberExclusive),
					(o = u.modified.endLineNumberExclusive);
			}
			const l = new re(new D(i, n + 1), new D(o, s + 1));
			return l.modified.isEmpty || r.push(l), r;
		}
		static clip(t, n, s) {
			const r = [];
			for (const i of t) {
				const o = i.original.intersect(n),
					l = i.modified.intersect(s);
				o && !o.isEmpty && l && !l.isEmpty && r.push(new re(o, l));
			}
			return r;
		}
		constructor(t, n) {
			(this.original = t), (this.modified = n);
		}
		toString() {
			return `{${this.original.toString()}->${this.modified.toString()}}`;
		}
		flip() {
			return new re(this.modified, this.original);
		}
		join(t) {
			return new re(
				this.original.join(t.original),
				this.modified.join(t.modified),
			);
		}
		toRangeMapping() {
			const t = this.original.toInclusiveRange(),
				n = this.modified.toInclusiveRange();
			if (t && n) return new le(t, n);
			if (
				this.original.startLineNumber === 1 ||
				this.modified.startLineNumber === 1
			) {
				if (
					!(
						this.modified.startLineNumber === 1 &&
						this.original.startLineNumber === 1
					)
				)
					throw new te("not a valid diff");
				return new le(
					new k(
						this.original.startLineNumber,
						1,
						this.original.endLineNumberExclusive,
						1,
					),
					new k(
						this.modified.startLineNumber,
						1,
						this.modified.endLineNumberExclusive,
						1,
					),
				);
			} else
				return new le(
					new k(
						this.original.startLineNumber - 1,
						Number.MAX_SAFE_INTEGER,
						this.original.endLineNumberExclusive - 1,
						Number.MAX_SAFE_INTEGER,
					),
					new k(
						this.modified.startLineNumber - 1,
						Number.MAX_SAFE_INTEGER,
						this.modified.endLineNumberExclusive - 1,
						Number.MAX_SAFE_INTEGER,
					),
				);
		}
		toRangeMapping2(t, n) {
			if (
				zs(this.original.endLineNumberExclusive, t) &&
				zs(this.modified.endLineNumberExclusive, n)
			)
				return new le(
					new k(
						this.original.startLineNumber,
						1,
						this.original.endLineNumberExclusive,
						1,
					),
					new k(
						this.modified.startLineNumber,
						1,
						this.modified.endLineNumberExclusive,
						1,
					),
				);
			if (!this.original.isEmpty && !this.modified.isEmpty)
				return new le(
					k.fromPositions(
						new q(this.original.startLineNumber, 1),
						Ve(
							new q(
								this.original.endLineNumberExclusive - 1,
								Number.MAX_SAFE_INTEGER,
							),
							t,
						),
					),
					k.fromPositions(
						new q(this.modified.startLineNumber, 1),
						Ve(
							new q(
								this.modified.endLineNumberExclusive - 1,
								Number.MAX_SAFE_INTEGER,
							),
							n,
						),
					),
				);
			if (
				this.original.startLineNumber > 1 &&
				this.modified.startLineNumber > 1
			)
				return new le(
					k.fromPositions(
						Ve(
							new q(
								this.original.startLineNumber - 1,
								Number.MAX_SAFE_INTEGER,
							),
							t,
						),
						Ve(
							new q(
								this.original.endLineNumberExclusive - 1,
								Number.MAX_SAFE_INTEGER,
							),
							t,
						),
					),
					k.fromPositions(
						Ve(
							new q(
								this.modified.startLineNumber - 1,
								Number.MAX_SAFE_INTEGER,
							),
							n,
						),
						Ve(
							new q(
								this.modified.endLineNumberExclusive - 1,
								Number.MAX_SAFE_INTEGER,
							),
							n,
						),
					),
				);
			throw new te();
		}
	}
	function Ve(e, t) {
		if (e.lineNumber < 1) return new q(1, 1);
		if (e.lineNumber > t.length)
			return new q(t.length, t[t.length - 1].length + 1);
		const n = t[e.lineNumber - 1];
		return e.column > n.length + 1 ? new q(e.lineNumber, n.length + 1) : e;
	}
	function zs(e, t) {
		return e >= 1 && e <= t.length;
	}
	class de extends re {
		static fromRangeMappings(t) {
			const n = D.join(
					t.map((r) => D.fromRangeInclusive(r.originalRange)),
				),
				s = D.join(t.map((r) => D.fromRangeInclusive(r.modifiedRange)));
			return new de(n, s, t);
		}
		constructor(t, n, s) {
			super(t, n), (this.innerChanges = s);
		}
		flip() {
			return new de(
				this.modified,
				this.original,
				this.innerChanges?.map((t) => t.flip()),
			);
		}
		withInnerChangesFromLineRanges() {
			return new de(this.original, this.modified, [
				this.toRangeMapping(),
			]);
		}
	}
	class le {
		static assertSorted(t) {
			for (let n = 1; n < t.length; n++) {
				const s = t[n - 1],
					r = t[n];
				if (
					!(
						s.originalRange
							.getEndPosition()
							.isBeforeOrEqual(
								r.originalRange.getStartPosition(),
							) &&
						s.modifiedRange
							.getEndPosition()
							.isBeforeOrEqual(r.modifiedRange.getStartPosition())
					)
				)
					throw new te("Range mappings must be sorted");
			}
		}
		constructor(t, n) {
			(this.originalRange = t), (this.modifiedRange = n);
		}
		toString() {
			return `{${this.originalRange.toString()}->${this.modifiedRange.toString()}}`;
		}
		flip() {
			return new le(this.modifiedRange, this.originalRange);
		}
		toTextEdit(t) {
			const n = t.getValueOfRange(this.modifiedRange);
			return new r1(this.originalRange, n);
		}
	}
	const i1 = 3;
	class a1 {
		computeDiff(t, n, s) {
			const i = new u1(t, n, {
					maxComputationTime: s.maxComputationTimeMs,
					shouldIgnoreTrimWhitespace: s.ignoreTrimWhitespace,
					shouldComputeCharChanges: !0,
					shouldMakePrettyDiff: !0,
					shouldPostProcessCharChanges: !0,
				}).computeDiff(),
				o = [];
			let l = null;
			for (const u of i.changes) {
				let c;
				u.originalEndLineNumber === 0
					? (c = new D(
							u.originalStartLineNumber + 1,
							u.originalStartLineNumber + 1,
						))
					: (c = new D(
							u.originalStartLineNumber,
							u.originalEndLineNumber + 1,
						));
				let f;
				u.modifiedEndLineNumber === 0
					? (f = new D(
							u.modifiedStartLineNumber + 1,
							u.modifiedStartLineNumber + 1,
						))
					: (f = new D(
							u.modifiedStartLineNumber,
							u.modifiedEndLineNumber + 1,
						));
				let h = new de(
					c,
					f,
					u.charChanges?.map(
						(d) =>
							new le(
								new k(
									d.originalStartLineNumber,
									d.originalStartColumn,
									d.originalEndLineNumber,
									d.originalEndColumn,
								),
								new k(
									d.modifiedStartLineNumber,
									d.modifiedStartColumn,
									d.modifiedEndLineNumber,
									d.modifiedEndColumn,
								),
							),
					),
				);
				l &&
					(l.modified.endLineNumberExclusive ===
						h.modified.startLineNumber ||
						l.original.endLineNumberExclusive ===
							h.original.startLineNumber) &&
					((h = new de(
						l.original.join(h.original),
						l.modified.join(h.modified),
						l.innerChanges && h.innerChanges
							? l.innerChanges.concat(h.innerChanges)
							: void 0,
					)),
					o.pop()),
					o.push(h),
					(l = h);
			}
			return (
				bt(() =>
					Us(
						o,
						(u, c) =>
							c.original.startLineNumber -
								u.original.endLineNumberExclusive ===
								c.modified.startLineNumber -
									u.modified.endLineNumberExclusive &&
							u.original.endLineNumberExclusive <
								c.original.startLineNumber &&
							u.modified.endLineNumberExclusive <
								c.modified.startLineNumber,
					),
				),
				new _t(o, [], i.quitEarly)
			);
		}
	}
	function $s(e, t, n, s) {
		return new _e(e, t, n).ComputeDiff(s);
	}
	let Gs = class {
		constructor(t) {
			const n = [],
				s = [];
			for (let r = 0, i = t.length; r < i; r++)
				(n[r] = Yt(t[r], 1)), (s[r] = Zt(t[r], 1));
			(this.lines = t), (this._startColumns = n), (this._endColumns = s);
		}
		getElements() {
			const t = [];
			for (let n = 0, s = this.lines.length; n < s; n++)
				t[n] = this.lines[n].substring(
					this._startColumns[n] - 1,
					this._endColumns[n] - 1,
				);
			return t;
		}
		getStrictElement(t) {
			return this.lines[t];
		}
		getStartLineNumber(t) {
			return t + 1;
		}
		getEndLineNumber(t) {
			return t + 1;
		}
		createCharSequence(t, n, s) {
			const r = [],
				i = [],
				o = [];
			let l = 0;
			for (let u = n; u <= s; u++) {
				const c = this.lines[u],
					f = t ? this._startColumns[u] : 1,
					h = t ? this._endColumns[u] : c.length + 1;
				for (let d = f; d < h; d++)
					(r[l] = c.charCodeAt(d - 1)),
						(i[l] = u + 1),
						(o[l] = d),
						l++;
				!t &&
					u < s &&
					((r[l] = 10), (i[l] = u + 1), (o[l] = c.length + 1), l++);
			}
			return new o1(r, i, o);
		}
	};
	class o1 {
		constructor(t, n, s) {
			(this._charCodes = t), (this._lineNumbers = n), (this._columns = s);
		}
		toString() {
			return (
				"[" +
				this._charCodes
					.map(
						(t, n) =>
							(t === 10 ? "\\n" : String.fromCharCode(t)) +
							`-(${this._lineNumbers[n]},${this._columns[n]})`,
					)
					.join(", ") +
				"]"
			);
		}
		_assertIndex(t, n) {
			if (t < 0 || t >= n.length) throw new Error("Illegal index");
		}
		getElements() {
			return this._charCodes;
		}
		getStartLineNumber(t) {
			return t > 0 && t === this._lineNumbers.length
				? this.getEndLineNumber(t - 1)
				: (this._assertIndex(t, this._lineNumbers),
					this._lineNumbers[t]);
		}
		getEndLineNumber(t) {
			return t === -1
				? this.getStartLineNumber(t + 1)
				: (this._assertIndex(t, this._lineNumbers),
					this._charCodes[t] === 10
						? this._lineNumbers[t] + 1
						: this._lineNumbers[t]);
		}
		getStartColumn(t) {
			return t > 0 && t === this._columns.length
				? this.getEndColumn(t - 1)
				: (this._assertIndex(t, this._columns), this._columns[t]);
		}
		getEndColumn(t) {
			return t === -1
				? this.getStartColumn(t + 1)
				: (this._assertIndex(t, this._columns),
					this._charCodes[t] === 10 ? 1 : this._columns[t] + 1);
		}
	}
	class Ie {
		constructor(t, n, s, r, i, o, l, u) {
			(this.originalStartLineNumber = t),
				(this.originalStartColumn = n),
				(this.originalEndLineNumber = s),
				(this.originalEndColumn = r),
				(this.modifiedStartLineNumber = i),
				(this.modifiedStartColumn = o),
				(this.modifiedEndLineNumber = l),
				(this.modifiedEndColumn = u);
		}
		static createFromDiffChange(t, n, s) {
			const r = n.getStartLineNumber(t.originalStart),
				i = n.getStartColumn(t.originalStart),
				o = n.getEndLineNumber(t.originalStart + t.originalLength - 1),
				l = n.getEndColumn(t.originalStart + t.originalLength - 1),
				u = s.getStartLineNumber(t.modifiedStart),
				c = s.getStartColumn(t.modifiedStart),
				f = s.getEndLineNumber(t.modifiedStart + t.modifiedLength - 1),
				h = s.getEndColumn(t.modifiedStart + t.modifiedLength - 1);
			return new Ie(r, i, o, l, u, c, f, h);
		}
	}
	function l1(e) {
		if (e.length <= 1) return e;
		const t = [e[0]];
		let n = t[0];
		for (let s = 1, r = e.length; s < r; s++) {
			const i = e[s],
				o = i.originalStart - (n.originalStart + n.originalLength),
				l = i.modifiedStart - (n.modifiedStart + n.modifiedLength);
			Math.min(o, l) < i1
				? ((n.originalLength =
						i.originalStart + i.originalLength - n.originalStart),
					(n.modifiedLength =
						i.modifiedStart + i.modifiedLength - n.modifiedStart))
				: (t.push(i), (n = i));
		}
		return t;
	}
	class Ge {
		constructor(t, n, s, r, i) {
			(this.originalStartLineNumber = t),
				(this.originalEndLineNumber = n),
				(this.modifiedStartLineNumber = s),
				(this.modifiedEndLineNumber = r),
				(this.charChanges = i);
		}
		static createFromDiffResult(t, n, s, r, i, o, l) {
			let u, c, f, h, d;
			if (
				(n.originalLength === 0
					? ((u = s.getStartLineNumber(n.originalStart) - 1), (c = 0))
					: ((u = s.getStartLineNumber(n.originalStart)),
						(c = s.getEndLineNumber(
							n.originalStart + n.originalLength - 1,
						))),
				n.modifiedLength === 0
					? ((f = r.getStartLineNumber(n.modifiedStart) - 1), (h = 0))
					: ((f = r.getStartLineNumber(n.modifiedStart)),
						(h = r.getEndLineNumber(
							n.modifiedStart + n.modifiedLength - 1,
						))),
				o &&
					n.originalLength > 0 &&
					n.originalLength < 20 &&
					n.modifiedLength > 0 &&
					n.modifiedLength < 20 &&
					i())
			) {
				const m = s.createCharSequence(
						t,
						n.originalStart,
						n.originalStart + n.originalLength - 1,
					),
					g = r.createCharSequence(
						t,
						n.modifiedStart,
						n.modifiedStart + n.modifiedLength - 1,
					);
				if (m.getElements().length > 0 && g.getElements().length > 0) {
					let b = $s(m, g, i, !0).changes;
					l && (b = l1(b)), (d = []);
					for (let w = 0, v = b.length; w < v; w++)
						d.push(Ie.createFromDiffChange(b[w], m, g));
				}
			}
			return new Ge(u, c, f, h, d);
		}
	}
	class u1 {
		constructor(t, n, s) {
			(this.shouldComputeCharChanges = s.shouldComputeCharChanges),
				(this.shouldPostProcessCharChanges =
					s.shouldPostProcessCharChanges),
				(this.shouldIgnoreTrimWhitespace =
					s.shouldIgnoreTrimWhitespace),
				(this.shouldMakePrettyDiff = s.shouldMakePrettyDiff),
				(this.originalLines = t),
				(this.modifiedLines = n),
				(this.original = new Gs(t)),
				(this.modified = new Gs(n)),
				(this.continueLineDiff = Os(s.maxComputationTime)),
				(this.continueCharDiff = Os(
					s.maxComputationTime === 0
						? 0
						: Math.min(s.maxComputationTime, 5e3),
				));
		}
		computeDiff() {
			if (
				this.original.lines.length === 1 &&
				this.original.lines[0].length === 0
			)
				return this.modified.lines.length === 1 &&
					this.modified.lines[0].length === 0
					? { quitEarly: !1, changes: [] }
					: {
							quitEarly: !1,
							changes: [
								{
									originalStartLineNumber: 1,
									originalEndLineNumber: 1,
									modifiedStartLineNumber: 1,
									modifiedEndLineNumber:
										this.modified.lines.length,
									charChanges: void 0,
								},
							],
						};
			if (
				this.modified.lines.length === 1 &&
				this.modified.lines[0].length === 0
			)
				return {
					quitEarly: !1,
					changes: [
						{
							originalStartLineNumber: 1,
							originalEndLineNumber: this.original.lines.length,
							modifiedStartLineNumber: 1,
							modifiedEndLineNumber: 1,
							charChanges: void 0,
						},
					],
				};
			const t = $s(
					this.original,
					this.modified,
					this.continueLineDiff,
					this.shouldMakePrettyDiff,
				),
				n = t.changes,
				s = t.quitEarly;
			if (this.shouldIgnoreTrimWhitespace) {
				const l = [];
				for (let u = 0, c = n.length; u < c; u++)
					l.push(
						Ge.createFromDiffResult(
							this.shouldIgnoreTrimWhitespace,
							n[u],
							this.original,
							this.modified,
							this.continueCharDiff,
							this.shouldComputeCharChanges,
							this.shouldPostProcessCharChanges,
						),
					);
				return { quitEarly: s, changes: l };
			}
			const r = [];
			let i = 0,
				o = 0;
			for (let l = -1, u = n.length; l < u; l++) {
				const c = l + 1 < u ? n[l + 1] : null,
					f = c ? c.originalStart : this.originalLines.length,
					h = c ? c.modifiedStart : this.modifiedLines.length;
				for (; i < f && o < h; ) {
					const d = this.originalLines[i],
						m = this.modifiedLines[o];
					if (d !== m) {
						{
							let g = Yt(d, 1),
								b = Yt(m, 1);
							for (; g > 1 && b > 1; ) {
								const w = d.charCodeAt(g - 2),
									v = m.charCodeAt(b - 2);
								if (w !== v) break;
								g--, b--;
							}
							(g > 1 || b > 1) &&
								this._pushTrimWhitespaceCharChange(
									r,
									i + 1,
									1,
									g,
									o + 1,
									1,
									b,
								);
						}
						{
							let g = Zt(d, 1),
								b = Zt(m, 1);
							const w = d.length + 1,
								v = m.length + 1;
							for (; g < w && b < v; ) {
								const C = d.charCodeAt(g - 1),
									S = d.charCodeAt(b - 1);
								if (C !== S) break;
								g++, b++;
							}
							(g < w || b < v) &&
								this._pushTrimWhitespaceCharChange(
									r,
									i + 1,
									g,
									w,
									o + 1,
									b,
									v,
								);
						}
					}
					i++, o++;
				}
				c &&
					(r.push(
						Ge.createFromDiffResult(
							this.shouldIgnoreTrimWhitespace,
							c,
							this.original,
							this.modified,
							this.continueCharDiff,
							this.shouldComputeCharChanges,
							this.shouldPostProcessCharChanges,
						),
					),
					(i += c.originalLength),
					(o += c.modifiedLength));
			}
			return { quitEarly: s, changes: r };
		}
		_pushTrimWhitespaceCharChange(t, n, s, r, i, o, l) {
			if (this._mergeTrimWhitespaceCharChange(t, n, s, r, i, o, l))
				return;
			let u;
			this.shouldComputeCharChanges &&
				(u = [new Ie(n, s, n, r, i, o, i, l)]),
				t.push(new Ge(n, n, i, i, u));
		}
		_mergeTrimWhitespaceCharChange(t, n, s, r, i, o, l) {
			const u = t.length;
			if (u === 0) return !1;
			const c = t[u - 1];
			return c.originalEndLineNumber === 0 ||
				c.modifiedEndLineNumber === 0
				? !1
				: c.originalEndLineNumber === n && c.modifiedEndLineNumber === i
					? (this.shouldComputeCharChanges &&
							c.charChanges &&
							c.charChanges.push(new Ie(n, s, n, r, i, o, i, l)),
						!0)
					: c.originalEndLineNumber + 1 === n &&
							c.modifiedEndLineNumber + 1 === i
						? ((c.originalEndLineNumber = n),
							(c.modifiedEndLineNumber = i),
							this.shouldComputeCharChanges &&
								c.charChanges &&
								c.charChanges.push(
									new Ie(n, s, n, r, i, o, i, l),
								),
							!0)
						: !1;
		}
	}
	function Yt(e, t) {
		const n = Tr(e);
		return n === -1 ? t : n + 1;
	}
	function Zt(e, t) {
		const n = Vr(e);
		return n === -1 ? t : n + 2;
	}
	function Os(e) {
		if (e === 0) return () => !0;
		const t = Date.now();
		return () => Date.now() - t < e;
	}
	class me {
		static trivial(t, n) {
			return new me(
				[new G(V.ofLength(t.length), V.ofLength(n.length))],
				!1,
			);
		}
		static trivialTimedOut(t, n) {
			return new me(
				[new G(V.ofLength(t.length), V.ofLength(n.length))],
				!0,
			);
		}
		constructor(t, n) {
			(this.diffs = t), (this.hitTimeout = n);
		}
	}
	class G {
		static invert(t, n) {
			const s = [];
			return (
				_i(t, (r, i) => {
					s.push(
						G.fromOffsetPairs(
							r ? r.getEndExclusives() : ue.zero,
							i
								? i.getStarts()
								: new ue(
										n,
										(r
											? r.seq2Range.endExclusive -
												r.seq1Range.endExclusive
											: 0) + n,
									),
						),
					);
				}),
				s
			);
		}
		static fromOffsetPairs(t, n) {
			return new G(
				new V(t.offset1, n.offset1),
				new V(t.offset2, n.offset2),
			);
		}
		static assertSorted(t) {
			let n;
			for (const s of t) {
				if (
					n &&
					!(
						n.seq1Range.endExclusive <= s.seq1Range.start &&
						n.seq2Range.endExclusive <= s.seq2Range.start
					)
				)
					throw new te("Sequence diffs must be sorted");
				n = s;
			}
		}
		constructor(t, n) {
			(this.seq1Range = t), (this.seq2Range = n);
		}
		swap() {
			return new G(this.seq2Range, this.seq1Range);
		}
		toString() {
			return `${this.seq1Range} <-> ${this.seq2Range}`;
		}
		join(t) {
			return new G(
				this.seq1Range.join(t.seq1Range),
				this.seq2Range.join(t.seq2Range),
			);
		}
		delta(t) {
			return t === 0
				? this
				: new G(this.seq1Range.delta(t), this.seq2Range.delta(t));
		}
		deltaStart(t) {
			return t === 0
				? this
				: new G(
						this.seq1Range.deltaStart(t),
						this.seq2Range.deltaStart(t),
					);
		}
		deltaEnd(t) {
			return t === 0
				? this
				: new G(this.seq1Range.deltaEnd(t), this.seq2Range.deltaEnd(t));
		}
		intersect(t) {
			const n = this.seq1Range.intersect(t.seq1Range),
				s = this.seq2Range.intersect(t.seq2Range);
			if (!(!n || !s)) return new G(n, s);
		}
		getStarts() {
			return new ue(this.seq1Range.start, this.seq2Range.start);
		}
		getEndExclusives() {
			return new ue(
				this.seq1Range.endExclusive,
				this.seq2Range.endExclusive,
			);
		}
	}
	class ue {
		static {
			this.zero = new ue(0, 0);
		}
		static {
			this.max = new ue(Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER);
		}
		constructor(t, n) {
			(this.offset1 = t), (this.offset2 = n);
		}
		toString() {
			return `${this.offset1} <-> ${this.offset2}`;
		}
		delta(t) {
			return t === 0 ? this : new ue(this.offset1 + t, this.offset2 + t);
		}
		equals(t) {
			return this.offset1 === t.offset1 && this.offset2 === t.offset2;
		}
	}
	class Oe {
		static {
			this.instance = new Oe();
		}
		isValid() {
			return !0;
		}
	}
	class c1 {
		constructor(t) {
			if (
				((this.timeout = t),
				(this.startTime = Date.now()),
				(this.valid = !0),
				t <= 0)
			)
				throw new te("timeout must be positive");
		}
		isValid() {
			if (!(Date.now() - this.startTime < this.timeout) && this.valid) {
				this.valid = !1;
				debugger;
			}
			return this.valid;
		}
	}
	class Kt {
		constructor(t, n) {
			(this.width = t),
				(this.height = n),
				(this.array = []),
				(this.array = new Array(t * n));
		}
		get(t, n) {
			return this.array[t + n * this.width];
		}
		set(t, n, s) {
			this.array[t + n * this.width] = s;
		}
	}
	function en(e) {
		return e === 32 || e === 9;
	}
	class je {
		static {
			this.chrKeys = new Map();
		}
		static getKey(t) {
			let n = this.chrKeys.get(t);
			return (
				n === void 0 &&
					((n = this.chrKeys.size), this.chrKeys.set(t, n)),
				n
			);
		}
		constructor(t, n, s) {
			(this.range = t),
				(this.lines = n),
				(this.source = s),
				(this.histogram = []);
			let r = 0;
			for (
				let i = t.startLineNumber - 1;
				i < t.endLineNumberExclusive - 1;
				i++
			) {
				const o = n[i];
				for (let u = 0; u < o.length; u++) {
					r++;
					const c = o[u],
						f = je.getKey(c);
					this.histogram[f] = (this.histogram[f] || 0) + 1;
				}
				r++;
				const l = je.getKey(`
`);
				this.histogram[l] = (this.histogram[l] || 0) + 1;
			}
			this.totalCount = r;
		}
		computeSimilarity(t) {
			let n = 0;
			const s = Math.max(this.histogram.length, t.histogram.length);
			for (let r = 0; r < s; r++)
				n += Math.abs((this.histogram[r] ?? 0) - (t.histogram[r] ?? 0));
			return 1 - n / (this.totalCount + t.totalCount);
		}
	}
	class h1 {
		compute(t, n, s = Oe.instance, r) {
			if (t.length === 0 || n.length === 0) return me.trivial(t, n);
			const i = new Kt(t.length, n.length),
				o = new Kt(t.length, n.length),
				l = new Kt(t.length, n.length);
			for (let g = 0; g < t.length; g++)
				for (let b = 0; b < n.length; b++) {
					if (!s.isValid()) return me.trivialTimedOut(t, n);
					const w = g === 0 ? 0 : i.get(g - 1, b),
						v = b === 0 ? 0 : i.get(g, b - 1);
					let C;
					t.getElement(g) === n.getElement(b)
						? (g === 0 || b === 0
								? (C = 0)
								: (C = i.get(g - 1, b - 1)),
							g > 0 &&
								b > 0 &&
								o.get(g - 1, b - 1) === 3 &&
								(C += l.get(g - 1, b - 1)),
							(C += r ? r(g, b) : 1))
						: (C = -1);
					const S = Math.max(w, v, C);
					if (S === C) {
						const p = g > 0 && b > 0 ? l.get(g - 1, b - 1) : 0;
						l.set(g, b, p + 1), o.set(g, b, 3);
					} else
						S === w
							? (l.set(g, b, 0), o.set(g, b, 1))
							: S === v && (l.set(g, b, 0), o.set(g, b, 2));
					i.set(g, b, S);
				}
			const u = [];
			let c = t.length,
				f = n.length;
			function h(g, b) {
				(g + 1 !== c || b + 1 !== f) &&
					u.push(new G(new V(g + 1, c), new V(b + 1, f))),
					(c = g),
					(f = b);
			}
			let d = t.length - 1,
				m = n.length - 1;
			for (; d >= 0 && m >= 0; )
				o.get(d, m) === 3
					? (h(d, m), d--, m--)
					: o.get(d, m) === 1
						? d--
						: m--;
			return h(-1, -1), u.reverse(), new me(u, !1);
		}
	}
	class js {
		compute(t, n, s = Oe.instance) {
			if (t.length === 0 || n.length === 0) return me.trivial(t, n);
			const r = t,
				i = n;
			function o(b, w) {
				for (
					;
					b < r.length &&
					w < i.length &&
					r.getElement(b) === i.getElement(w);
				)
					b++, w++;
				return b;
			}
			let l = 0;
			const u = new f1();
			u.set(0, o(0, 0));
			const c = new d1();
			c.set(0, u.get(0) === 0 ? null : new Xs(null, 0, 0, u.get(0)));
			let f = 0;
			e: for (;;) {
				if ((l++, !s.isValid())) return me.trivialTimedOut(r, i);
				const b = -Math.min(l, i.length + (l % 2)),
					w = Math.min(l, r.length + (l % 2));
				for (f = b; f <= w; f += 2) {
					const v = f === w ? -1 : u.get(f + 1),
						C = f === b ? -1 : u.get(f - 1) + 1,
						S = Math.min(Math.max(v, C), r.length),
						p = S - f;
					if (S > r.length || p > i.length) continue;
					const _ = o(S, p);
					u.set(f, _);
					const N = S === v ? c.get(f + 1) : c.get(f - 1);
					if (
						(c.set(f, _ !== S ? new Xs(N, S, p, _ - S) : N),
						u.get(f) === r.length && u.get(f) - f === i.length)
					)
						break e;
				}
			}
			let h = c.get(f);
			const d = [];
			let m = r.length,
				g = i.length;
			for (;;) {
				const b = h ? h.x + h.length : 0,
					w = h ? h.y + h.length : 0;
				if (
					((b !== m || w !== g) &&
						d.push(new G(new V(b, m), new V(w, g))),
					!h)
				)
					break;
				(m = h.x), (g = h.y), (h = h.prev);
			}
			return d.reverse(), new me(d, !1);
		}
	}
	class Xs {
		constructor(t, n, s, r) {
			(this.prev = t), (this.x = n), (this.y = s), (this.length = r);
		}
	}
	class f1 {
		constructor() {
			(this.positiveArr = new Int32Array(10)),
				(this.negativeArr = new Int32Array(10));
		}
		get(t) {
			return t < 0
				? ((t = -t - 1), this.negativeArr[t])
				: this.positiveArr[t];
		}
		set(t, n) {
			if (t < 0) {
				if (((t = -t - 1), t >= this.negativeArr.length)) {
					const s = this.negativeArr;
					(this.negativeArr = new Int32Array(s.length * 2)),
						this.negativeArr.set(s);
				}
				this.negativeArr[t] = n;
			} else {
				if (t >= this.positiveArr.length) {
					const s = this.positiveArr;
					(this.positiveArr = new Int32Array(s.length * 2)),
						this.positiveArr.set(s);
				}
				this.positiveArr[t] = n;
			}
		}
	}
	class d1 {
		constructor() {
			(this.positiveArr = []), (this.negativeArr = []);
		}
		get(t) {
			return t < 0
				? ((t = -t - 1), this.negativeArr[t])
				: this.positiveArr[t];
		}
		set(t, n) {
			t < 0
				? ((t = -t - 1), (this.negativeArr[t] = n))
				: (this.positiveArr[t] = n);
		}
	}
	class pt {
		constructor(t, n, s) {
			(this.lines = t),
				(this.range = n),
				(this.considerWhitespaceChanges = s),
				(this.elements = []),
				(this.firstElementOffsetByLineIdx = []),
				(this.lineStartOffsets = []),
				(this.trimmedWsLengthsByLineIdx = []),
				this.firstElementOffsetByLineIdx.push(0);
			for (
				let r = this.range.startLineNumber;
				r <= this.range.endLineNumber;
				r++
			) {
				let i = t[r - 1],
					o = 0;
				r === this.range.startLineNumber &&
					this.range.startColumn > 1 &&
					((o = this.range.startColumn - 1), (i = i.substring(o))),
					this.lineStartOffsets.push(o);
				let l = 0;
				if (!s) {
					const c = i.trimStart();
					(l = i.length - c.length), (i = c.trimEnd());
				}
				this.trimmedWsLengthsByLineIdx.push(l);
				const u =
					r === this.range.endLineNumber
						? Math.min(this.range.endColumn - 1 - o - l, i.length)
						: i.length;
				for (let c = 0; c < u; c++) this.elements.push(i.charCodeAt(c));
				r < this.range.endLineNumber &&
					(this.elements.push(10),
					this.firstElementOffsetByLineIdx.push(
						this.elements.length,
					));
			}
		}
		toString() {
			return `Slice: "${this.text}"`;
		}
		get text() {
			return this.getText(new V(0, this.length));
		}
		getText(t) {
			return this.elements
				.slice(t.start, t.endExclusive)
				.map((n) => String.fromCharCode(n))
				.join("");
		}
		getElement(t) {
			return this.elements[t];
		}
		get length() {
			return this.elements.length;
		}
		getBoundaryScore(t) {
			const n = Js(t > 0 ? this.elements[t - 1] : -1),
				s = Js(t < this.elements.length ? this.elements[t] : -1);
			if (n === 7 && s === 8) return 0;
			if (n === 8) return 150;
			let r = 0;
			return (
				n !== s && ((r += 10), n === 0 && s === 1 && (r += 1)),
				(r += Qs(n)),
				(r += Qs(s)),
				r
			);
		}
		translateOffset(t, n = "right") {
			const s = $e(this.firstElementOffsetByLineIdx, (i) => i <= t),
				r = t - this.firstElementOffsetByLineIdx[s];
			return new q(
				this.range.startLineNumber + s,
				1 +
					this.lineStartOffsets[s] +
					r +
					(r === 0 && n === "left"
						? 0
						: this.trimmedWsLengthsByLineIdx[s]),
			);
		}
		translateRange(t) {
			const n = this.translateOffset(t.start, "right"),
				s = this.translateOffset(t.endExclusive, "left");
			return s.isBefore(n)
				? k.fromPositions(s, s)
				: k.fromPositions(n, s);
		}
		findWordContaining(t) {
			if (t < 0 || t >= this.elements.length || !tn(this.elements[t]))
				return;
			let n = t;
			for (; n > 0 && tn(this.elements[n - 1]); ) n--;
			let s = t;
			for (; s < this.elements.length && tn(this.elements[s]); ) s++;
			return new V(n, s);
		}
		countLinesIn(t) {
			return (
				this.translateOffset(t.endExclusive).lineNumber -
				this.translateOffset(t.start).lineNumber
			);
		}
		isStronglyEqual(t, n) {
			return this.elements[t] === this.elements[n];
		}
		extendToFullLines(t) {
			const n =
					Pe(this.firstElementOffsetByLineIdx, (r) => r <= t.start) ??
					0,
				s =
					s1(
						this.firstElementOffsetByLineIdx,
						(r) => t.endExclusive <= r,
					) ?? this.elements.length;
			return new V(n, s);
		}
	}
	function tn(e) {
		return (
			(e >= 97 && e <= 122) ||
			(e >= 65 && e <= 90) ||
			(e >= 48 && e <= 57)
		);
	}
	const m1 = { 0: 0, 1: 0, 2: 0, 3: 10, 4: 2, 5: 30, 6: 3, 7: 10, 8: 10 };
	function Qs(e) {
		return m1[e];
	}
	function Js(e) {
		return e === 10
			? 8
			: e === 13
				? 7
				: en(e)
					? 6
					: e >= 97 && e <= 122
						? 0
						: e >= 65 && e <= 90
							? 1
							: e >= 48 && e <= 57
								? 2
								: e === -1
									? 3
									: e === 44 || e === 59
										? 5
										: 4;
	}
	function g1(e, t, n, s, r, i) {
		let { moves: o, excludedChanges: l } = _1(e, t, n, i);
		if (!i.isValid()) return [];
		const u = e.filter((f) => !l.has(f)),
			c = x1(u, s, r, t, n, i);
		return (
			pi(o, c),
			(o = p1(o)),
			(o = o.filter((f) => {
				const h = f.original
					.toOffsetRange()
					.slice(t)
					.map((m) => m.trim());
				return (
					h.join(`
`).length >= 15 && b1(h, (m) => m.length >= 2) >= 2
				);
			})),
			(o = w1(e, o)),
			o
		);
	}
	function b1(e, t) {
		let n = 0;
		for (const s of e) t(s) && n++;
		return n;
	}
	function _1(e, t, n, s) {
		const r = [],
			i = e
				.filter((u) => u.modified.isEmpty && u.original.length >= 3)
				.map((u) => new je(u.original, t, u)),
			o = new Set(
				e
					.filter((u) => u.original.isEmpty && u.modified.length >= 3)
					.map((u) => new je(u.modified, n, u)),
			),
			l = new Set();
		for (const u of i) {
			let c = -1,
				f;
			for (const h of o) {
				const d = u.computeSimilarity(h);
				d > c && ((c = d), (f = h));
			}
			if (
				(c > 0.9 &&
					f &&
					(o.delete(f),
					r.push(new re(u.range, f.range)),
					l.add(u.source),
					l.add(f.source)),
				!s.isValid())
			)
				return { moves: r, excludedChanges: l };
		}
		return { moves: r, excludedChanges: l };
	}
	function x1(e, t, n, s, r, i) {
		const o = [],
			l = new Xi();
		for (const d of e)
			for (
				let m = d.original.startLineNumber;
				m < d.original.endLineNumberExclusive - 2;
				m++
			) {
				const g = `${t[m - 1]}:${t[m + 1 - 1]}:${t[m + 2 - 1]}`;
				l.add(g, { range: new D(m, m + 3) });
			}
		const u = [];
		e.sort(ut((d) => d.modified.startLineNumber, ct));
		for (const d of e) {
			let m = [];
			for (
				let g = d.modified.startLineNumber;
				g < d.modified.endLineNumberExclusive - 2;
				g++
			) {
				const b = `${n[g - 1]}:${n[g + 1 - 1]}:${n[g + 2 - 1]}`,
					w = new D(g, g + 3),
					v = [];
				l.forEach(b, ({ range: C }) => {
					for (const p of m)
						if (
							p.originalLineRange.endLineNumberExclusive + 1 ===
								C.endLineNumberExclusive &&
							p.modifiedLineRange.endLineNumberExclusive + 1 ===
								w.endLineNumberExclusive
						) {
							(p.originalLineRange = new D(
								p.originalLineRange.startLineNumber,
								C.endLineNumberExclusive,
							)),
								(p.modifiedLineRange = new D(
									p.modifiedLineRange.startLineNumber,
									w.endLineNumberExclusive,
								)),
								v.push(p);
							return;
						}
					const S = { modifiedLineRange: w, originalLineRange: C };
					u.push(S), v.push(S);
				}),
					(m = v);
			}
			if (!i.isValid()) return [];
		}
		u.sort(wi(ut((d) => d.modifiedLineRange.length, ct)));
		const c = new he(),
			f = new he();
		for (const d of u) {
			const m =
					d.modifiedLineRange.startLineNumber -
					d.originalLineRange.startLineNumber,
				g = c.subtractFrom(d.modifiedLineRange),
				b = f.subtractFrom(d.originalLineRange).getWithDelta(m),
				w = g.getIntersection(b);
			for (const v of w.ranges) {
				if (v.length < 3) continue;
				const C = v,
					S = v.delta(-m);
				o.push(new re(S, C)), c.addRange(C), f.addRange(S);
			}
		}
		o.sort(ut((d) => d.original.startLineNumber, ct));
		const h = new xt(e);
		for (let d = 0; d < o.length; d++) {
			const m = o[d],
				g = h.findLastMonotonous(
					(N) =>
						N.original.startLineNumber <=
						m.original.startLineNumber,
				),
				b = Pe(
					e,
					(N) =>
						N.modified.startLineNumber <=
						m.modified.startLineNumber,
				),
				w = Math.max(
					m.original.startLineNumber - g.original.startLineNumber,
					m.modified.startLineNumber - b.modified.startLineNumber,
				),
				v = h.findLastMonotonous(
					(N) =>
						N.original.startLineNumber <
						m.original.endLineNumberExclusive,
				),
				C = Pe(
					e,
					(N) =>
						N.modified.startLineNumber <
						m.modified.endLineNumberExclusive,
				),
				S = Math.max(
					v.original.endLineNumberExclusive -
						m.original.endLineNumberExclusive,
					C.modified.endLineNumberExclusive -
						m.modified.endLineNumberExclusive,
				);
			let p;
			for (p = 0; p < w; p++) {
				const N = m.original.startLineNumber - p - 1,
					A = m.modified.startLineNumber - p - 1;
				if (
					N > s.length ||
					A > r.length ||
					c.contains(A) ||
					f.contains(N) ||
					!Ys(s[N - 1], r[A - 1], i)
				)
					break;
			}
			p > 0 &&
				(f.addRange(
					new D(
						m.original.startLineNumber - p,
						m.original.startLineNumber,
					),
				),
				c.addRange(
					new D(
						m.modified.startLineNumber - p,
						m.modified.startLineNumber,
					),
				));
			let _;
			for (_ = 0; _ < S; _++) {
				const N = m.original.endLineNumberExclusive + _,
					A = m.modified.endLineNumberExclusive + _;
				if (
					N > s.length ||
					A > r.length ||
					c.contains(A) ||
					f.contains(N) ||
					!Ys(s[N - 1], r[A - 1], i)
				)
					break;
			}
			_ > 0 &&
				(f.addRange(
					new D(
						m.original.endLineNumberExclusive,
						m.original.endLineNumberExclusive + _,
					),
				),
				c.addRange(
					new D(
						m.modified.endLineNumberExclusive,
						m.modified.endLineNumberExclusive + _,
					),
				)),
				(p > 0 || _ > 0) &&
					(o[d] = new re(
						new D(
							m.original.startLineNumber - p,
							m.original.endLineNumberExclusive + _,
						),
						new D(
							m.modified.startLineNumber - p,
							m.modified.endLineNumberExclusive + _,
						),
					));
		}
		return o;
	}
	function Ys(e, t, n) {
		if (e.trim() === t.trim()) return !0;
		if (e.length > 300 && t.length > 300) return !1;
		const r = new js().compute(
			new pt([e], new k(1, 1, 1, e.length), !1),
			new pt([t], new k(1, 1, 1, t.length), !1),
			n,
		);
		let i = 0;
		const o = G.invert(r.diffs, e.length);
		for (const f of o)
			f.seq1Range.forEach((h) => {
				en(e.charCodeAt(h)) || i++;
			});
		function l(f) {
			let h = 0;
			for (let d = 0; d < e.length; d++) en(f.charCodeAt(d)) || h++;
			return h;
		}
		const u = l(e.length > t.length ? e : t);
		return i / u > 0.6 && u > 10;
	}
	function p1(e) {
		if (e.length === 0) return e;
		e.sort(ut((n) => n.original.startLineNumber, ct));
		const t = [e[0]];
		for (let n = 1; n < e.length; n++) {
			const s = t[t.length - 1],
				r = e[n],
				i =
					r.original.startLineNumber -
					s.original.endLineNumberExclusive,
				o =
					r.modified.startLineNumber -
					s.modified.endLineNumberExclusive;
			if (i >= 0 && o >= 0 && i + o <= 2) {
				t[t.length - 1] = s.join(r);
				continue;
			}
			t.push(r);
		}
		return t;
	}
	function w1(e, t) {
		const n = new xt(e);
		return (
			(t = t.filter((s) => {
				const r =
						n.findLastMonotonous(
							(l) =>
								l.original.startLineNumber <
								s.original.endLineNumberExclusive,
						) || new re(new D(1, 1), new D(1, 1)),
					i = Pe(
						e,
						(l) =>
							l.modified.startLineNumber <
							s.modified.endLineNumberExclusive,
					);
				return r !== i;
			})),
			t
		);
	}
	function Zs(e, t, n) {
		let s = n;
		return (s = Ks(e, t, s)), (s = Ks(e, t, s)), (s = L1(e, t, s)), s;
	}
	function Ks(e, t, n) {
		if (n.length === 0) return n;
		const s = [];
		s.push(n[0]);
		for (let i = 1; i < n.length; i++) {
			const o = s[s.length - 1];
			let l = n[i];
			if (l.seq1Range.isEmpty || l.seq2Range.isEmpty) {
				const u = l.seq1Range.start - o.seq1Range.endExclusive;
				let c;
				for (
					c = 1;
					c <= u &&
					!(
						e.getElement(l.seq1Range.start - c) !==
							e.getElement(l.seq1Range.endExclusive - c) ||
						t.getElement(l.seq2Range.start - c) !==
							t.getElement(l.seq2Range.endExclusive - c)
					);
					c++
				);
				if ((c--, c === u)) {
					s[s.length - 1] = new G(
						new V(o.seq1Range.start, l.seq1Range.endExclusive - u),
						new V(o.seq2Range.start, l.seq2Range.endExclusive - u),
					);
					continue;
				}
				l = l.delta(-c);
			}
			s.push(l);
		}
		const r = [];
		for (let i = 0; i < s.length - 1; i++) {
			const o = s[i + 1];
			let l = s[i];
			if (l.seq1Range.isEmpty || l.seq2Range.isEmpty) {
				const u = o.seq1Range.start - l.seq1Range.endExclusive;
				let c;
				for (
					c = 0;
					c < u &&
					!(
						!e.isStronglyEqual(
							l.seq1Range.start + c,
							l.seq1Range.endExclusive + c,
						) ||
						!t.isStronglyEqual(
							l.seq2Range.start + c,
							l.seq2Range.endExclusive + c,
						)
					);
					c++
				);
				if (c === u) {
					s[i + 1] = new G(
						new V(l.seq1Range.start + u, o.seq1Range.endExclusive),
						new V(l.seq2Range.start + u, o.seq2Range.endExclusive),
					);
					continue;
				}
				c > 0 && (l = l.delta(c));
			}
			r.push(l);
		}
		return s.length > 0 && r.push(s[s.length - 1]), r;
	}
	function L1(e, t, n) {
		if (!e.getBoundaryScore || !t.getBoundaryScore) return n;
		for (let s = 0; s < n.length; s++) {
			const r = s > 0 ? n[s - 1] : void 0,
				i = n[s],
				o = s + 1 < n.length ? n[s + 1] : void 0,
				l = new V(
					r ? r.seq1Range.endExclusive + 1 : 0,
					o ? o.seq1Range.start - 1 : e.length,
				),
				u = new V(
					r ? r.seq2Range.endExclusive + 1 : 0,
					o ? o.seq2Range.start - 1 : t.length,
				);
			i.seq1Range.isEmpty
				? (n[s] = er(i, e, t, l, u))
				: i.seq2Range.isEmpty &&
					(n[s] = er(i.swap(), t, e, u, l).swap());
		}
		return n;
	}
	function er(e, t, n, s, r) {
		let o = 1;
		for (
			;
			e.seq1Range.start - o >= s.start &&
			e.seq2Range.start - o >= r.start &&
			n.isStronglyEqual(
				e.seq2Range.start - o,
				e.seq2Range.endExclusive - o,
			) &&
			o < 100;
		)
			o++;
		o--;
		let l = 0;
		for (
			;
			e.seq1Range.start + l < s.endExclusive &&
			e.seq2Range.endExclusive + l < r.endExclusive &&
			n.isStronglyEqual(
				e.seq2Range.start + l,
				e.seq2Range.endExclusive + l,
			) &&
			l < 100;
		)
			l++;
		if (o === 0 && l === 0) return e;
		let u = 0,
			c = -1;
		for (let f = -o; f <= l; f++) {
			const h = e.seq2Range.start + f,
				d = e.seq2Range.endExclusive + f,
				m = e.seq1Range.start + f,
				g =
					t.getBoundaryScore(m) +
					n.getBoundaryScore(h) +
					n.getBoundaryScore(d);
			g > c && ((c = g), (u = f));
		}
		return e.delta(u);
	}
	function v1(e, t, n) {
		const s = [];
		for (const r of n) {
			const i = s[s.length - 1];
			if (!i) {
				s.push(r);
				continue;
			}
			r.seq1Range.start - i.seq1Range.endExclusive <= 2 ||
			r.seq2Range.start - i.seq2Range.endExclusive <= 2
				? (s[s.length - 1] = new G(
						i.seq1Range.join(r.seq1Range),
						i.seq2Range.join(r.seq2Range),
					))
				: s.push(r);
		}
		return s;
	}
	function N1(e, t, n) {
		const s = G.invert(n, e.length),
			r = [];
		let i = new ue(0, 0);
		function o(u, c) {
			if (u.offset1 < i.offset1 || u.offset2 < i.offset2) return;
			const f = e.findWordContaining(u.offset1),
				h = t.findWordContaining(u.offset2);
			if (!f || !h) return;
			let d = new G(f, h);
			const m = d.intersect(c);
			let g = m.seq1Range.length,
				b = m.seq2Range.length;
			for (; s.length > 0; ) {
				const w = s[0];
				if (
					!(
						w.seq1Range.intersects(d.seq1Range) ||
						w.seq2Range.intersects(d.seq2Range)
					)
				)
					break;
				const C = e.findWordContaining(w.seq1Range.start),
					S = t.findWordContaining(w.seq2Range.start),
					p = new G(C, S),
					_ = p.intersect(w);
				if (
					((g += _.seq1Range.length),
					(b += _.seq2Range.length),
					(d = d.join(p)),
					d.seq1Range.endExclusive >= w.seq1Range.endExclusive)
				)
					s.shift();
				else break;
			}
			g + b < ((d.seq1Range.length + d.seq2Range.length) * 2) / 3 &&
				r.push(d),
				(i = d.getEndExclusives());
		}
		for (; s.length > 0; ) {
			const u = s.shift();
			u.seq1Range.isEmpty ||
				(o(u.getStarts(), u), o(u.getEndExclusives().delta(-1), u));
		}
		return S1(n, r);
	}
	function S1(e, t) {
		const n = [];
		for (; e.length > 0 || t.length > 0; ) {
			const s = e[0],
				r = t[0];
			let i;
			s && (!r || s.seq1Range.start < r.seq1Range.start)
				? (i = e.shift())
				: (i = t.shift()),
				n.length > 0 &&
				n[n.length - 1].seq1Range.endExclusive >= i.seq1Range.start
					? (n[n.length - 1] = n[n.length - 1].join(i))
					: n.push(i);
		}
		return n;
	}
	function C1(e, t, n) {
		let s = n;
		if (s.length === 0) return s;
		let r = 0,
			i;
		do {
			i = !1;
			const o = [s[0]];
			for (let l = 1; l < s.length; l++) {
				let f = function (d, m) {
					const g = new V(
						c.seq1Range.endExclusive,
						u.seq1Range.start,
					);
					return (
						e.getText(g).replace(/\s/g, "").length <= 4 &&
						(d.seq1Range.length + d.seq2Range.length > 5 ||
							m.seq1Range.length + m.seq2Range.length > 5)
					);
				};
				const u = s[l],
					c = o[o.length - 1];
				f(c, u)
					? ((i = !0), (o[o.length - 1] = o[o.length - 1].join(u)))
					: o.push(u);
			}
			s = o;
		} while (r++ < 10 && i);
		return s;
	}
	function A1(e, t, n) {
		let s = n;
		if (s.length === 0) return s;
		let r = 0,
			i;
		do {
			i = !1;
			const l = [s[0]];
			for (let u = 1; u < s.length; u++) {
				let h = function (m, g) {
					const b = new V(
						f.seq1Range.endExclusive,
						c.seq1Range.start,
					);
					if (e.countLinesIn(b) > 5 || b.length > 500) return !1;
					const v = e.getText(b).trim();
					if (v.length > 20 || v.split(/\r\n|\r|\n/).length > 1)
						return !1;
					const C = e.countLinesIn(m.seq1Range),
						S = m.seq1Range.length,
						p = t.countLinesIn(m.seq2Range),
						_ = m.seq2Range.length,
						N = e.countLinesIn(g.seq1Range),
						A = g.seq1Range.length,
						y = t.countLinesIn(g.seq2Range),
						I = g.seq2Range.length,
						X = 2 * 40 + 50;
					function B(x) {
						return Math.min(x, X);
					}
					return (
						Math.pow(
							Math.pow(B(C * 40 + S), 1.5) +
								Math.pow(B(p * 40 + _), 1.5),
							1.5,
						) +
							Math.pow(
								Math.pow(B(N * 40 + A), 1.5) +
									Math.pow(B(y * 40 + I), 1.5),
								1.5,
							) >
						(X ** 1.5) ** 1.5 * 1.3
					);
				};
				const c = s[u],
					f = l[l.length - 1];
				h(f, c)
					? ((i = !0), (l[l.length - 1] = l[l.length - 1].join(c)))
					: l.push(c);
			}
			s = l;
		} while (r++ < 10 && i);
		const o = [];
		return (
			xi(s, (l, u, c) => {
				let f = u;
				function h(v) {
					return (
						v.length > 0 &&
						v.trim().length <= 3 &&
						u.seq1Range.length + u.seq2Range.length > 100
					);
				}
				const d = e.extendToFullLines(u.seq1Range),
					m = e.getText(new V(d.start, u.seq1Range.start));
				h(m) && (f = f.deltaStart(-m.length));
				const g = e.getText(
					new V(u.seq1Range.endExclusive, d.endExclusive),
				);
				h(g) && (f = f.deltaEnd(g.length));
				const b = G.fromOffsetPairs(
						l ? l.getEndExclusives() : ue.zero,
						c ? c.getStarts() : ue.max,
					),
					w = f.intersect(b);
				o.length > 0 &&
				w.getStarts().equals(o[o.length - 1].getEndExclusives())
					? (o[o.length - 1] = o[o.length - 1].join(w))
					: o.push(w);
			}),
			o
		);
	}
	class tr {
		constructor(t, n) {
			(this.trimmedHash = t), (this.lines = n);
		}
		getElement(t) {
			return this.trimmedHash[t];
		}
		get length() {
			return this.trimmedHash.length;
		}
		getBoundaryScore(t) {
			const n = t === 0 ? 0 : nr(this.lines[t - 1]),
				s = t === this.lines.length ? 0 : nr(this.lines[t]);
			return 1e3 - (n + s);
		}
		getText(t) {
			return this.lines.slice(t.start, t.endExclusive).join(`
`);
		}
		isStronglyEqual(t, n) {
			return this.lines[t] === this.lines[n];
		}
	}
	function nr(e) {
		let t = 0;
		for (
			;
			t < e.length && (e.charCodeAt(t) === 32 || e.charCodeAt(t) === 9);
		)
			t++;
		return t;
	}
	class R1 {
		constructor() {
			(this.dynamicProgrammingDiffing = new h1()),
				(this.myersDiffingAlgorithm = new js());
		}
		computeDiff(t, n, s) {
			if (t.length <= 1 && gi(t, n, (_, N) => _ === N))
				return new _t([], [], !1);
			if (
				(t.length === 1 && t[0].length === 0) ||
				(n.length === 1 && n[0].length === 0)
			)
				return new _t(
					[
						new de(new D(1, t.length + 1), new D(1, n.length + 1), [
							new le(
								new k(
									1,
									1,
									t.length,
									t[t.length - 1].length + 1,
								),
								new k(
									1,
									1,
									n.length,
									n[n.length - 1].length + 1,
								),
							),
						]),
					],
					[],
					!1,
				);
			const r =
					s.maxComputationTimeMs === 0
						? Oe.instance
						: new c1(s.maxComputationTimeMs),
				i = !s.ignoreTrimWhitespace,
				o = new Map();
			function l(_) {
				let N = o.get(_);
				return N === void 0 && ((N = o.size), o.set(_, N)), N;
			}
			const u = t.map((_) => l(_.trim())),
				c = n.map((_) => l(_.trim())),
				f = new tr(u, t),
				h = new tr(c, n),
				d =
					f.length + h.length < 1700
						? this.dynamicProgrammingDiffing.compute(
								f,
								h,
								r,
								(_, N) =>
									t[_] === n[N]
										? n[N].length === 0
											? 0.1
											: 1 + Math.log(1 + n[N].length)
										: 0.99,
							)
						: this.myersDiffingAlgorithm.compute(f, h, r);
			let m = d.diffs,
				g = d.hitTimeout;
			(m = Zs(f, h, m)), (m = C1(f, h, m));
			const b = [],
				w = (_) => {
					if (i)
						for (let N = 0; N < _; N++) {
							const A = v + N,
								y = C + N;
							if (t[A] !== n[y]) {
								const I = this.refineDiff(
									t,
									n,
									new G(new V(A, A + 1), new V(y, y + 1)),
									r,
									i,
								);
								for (const X of I.mappings) b.push(X);
								I.hitTimeout && (g = !0);
							}
						}
				};
			let v = 0,
				C = 0;
			for (const _ of m) {
				bt(() => _.seq1Range.start - v === _.seq2Range.start - C);
				const N = _.seq1Range.start - v;
				w(N),
					(v = _.seq1Range.endExclusive),
					(C = _.seq2Range.endExclusive);
				const A = this.refineDiff(t, n, _, r, i);
				A.hitTimeout && (g = !0);
				for (const y of A.mappings) b.push(y);
			}
			w(t.length - v);
			const S = sr(b, t, n);
			let p = [];
			return (
				s.computeMoves && (p = this.computeMoves(S, t, n, u, c, r, i)),
				bt(() => {
					function _(A, y) {
						if (A.lineNumber < 1 || A.lineNumber > y.length)
							return !1;
						const I = y[A.lineNumber - 1];
						return !(A.column < 1 || A.column > I.length + 1);
					}
					function N(A, y) {
						return !(
							A.startLineNumber < 1 ||
							A.startLineNumber > y.length + 1 ||
							A.endLineNumberExclusive < 1 ||
							A.endLineNumberExclusive > y.length + 1
						);
					}
					for (const A of S) {
						if (!A.innerChanges) return !1;
						for (const y of A.innerChanges)
							if (
								!(
									_(y.modifiedRange.getStartPosition(), n) &&
									_(y.modifiedRange.getEndPosition(), n) &&
									_(y.originalRange.getStartPosition(), t) &&
									_(y.originalRange.getEndPosition(), t)
								)
							)
								return !1;
						if (!N(A.modified, n) || !N(A.original, t)) return !1;
					}
					return !0;
				}),
				new _t(S, p, g)
			);
		}
		computeMoves(t, n, s, r, i, o, l) {
			return g1(t, n, s, r, i, o).map((f) => {
				const h = this.refineDiff(
						n,
						s,
						new G(
							f.original.toOffsetRange(),
							f.modified.toOffsetRange(),
						),
						o,
						l,
					),
					d = sr(h.mappings, n, s, !0);
				return new n1(f, d);
			});
		}
		refineDiff(t, n, s, r, i) {
			const l = E1(s).toRangeMapping2(t, n),
				u = new pt(t, l.originalRange, i),
				c = new pt(n, l.modifiedRange, i),
				f =
					u.length + c.length < 500
						? this.dynamicProgrammingDiffing.compute(u, c, r)
						: this.myersDiffingAlgorithm.compute(u, c, r);
			let h = f.diffs;
			return (
				(h = Zs(u, c, h)),
				(h = N1(u, c, h)),
				(h = v1(u, c, h)),
				(h = A1(u, c, h)),
				{
					mappings: h.map(
						(m) =>
							new le(
								u.translateRange(m.seq1Range),
								c.translateRange(m.seq2Range),
							),
					),
					hitTimeout: f.hitTimeout,
				}
			);
		}
	}
	function sr(e, t, n, s = !1) {
		const r = [];
		for (const i of bi(
			e.map((o) => y1(o, t, n)),
			(o, l) =>
				o.original.overlapOrTouch(l.original) ||
				o.modified.overlapOrTouch(l.modified),
		)) {
			const o = i[0],
				l = i[i.length - 1];
			r.push(
				new de(
					o.original.join(l.original),
					o.modified.join(l.modified),
					i.map((u) => u.innerChanges[0]),
				),
			);
		}
		return (
			bt(() =>
				!s &&
				r.length > 0 &&
				(r[0].modified.startLineNumber !==
					r[0].original.startLineNumber ||
					n.length -
						r[r.length - 1].modified.endLineNumberExclusive !==
						t.length -
							r[r.length - 1].original.endLineNumberExclusive)
					? !1
					: Us(
							r,
							(i, o) =>
								o.original.startLineNumber -
									i.original.endLineNumberExclusive ===
									o.modified.startLineNumber -
										i.modified.endLineNumberExclusive &&
								i.original.endLineNumberExclusive <
									o.original.startLineNumber &&
								i.modified.endLineNumberExclusive <
									o.modified.startLineNumber,
						),
			),
			r
		);
	}
	function y1(e, t, n) {
		let s = 0,
			r = 0;
		e.modifiedRange.endColumn === 1 &&
			e.originalRange.endColumn === 1 &&
			e.originalRange.startLineNumber + s <=
				e.originalRange.endLineNumber &&
			e.modifiedRange.startLineNumber + s <=
				e.modifiedRange.endLineNumber &&
			(r = -1),
			e.modifiedRange.startColumn - 1 >=
				n[e.modifiedRange.startLineNumber - 1].length &&
				e.originalRange.startColumn - 1 >=
					t[e.originalRange.startLineNumber - 1].length &&
				e.originalRange.startLineNumber <=
					e.originalRange.endLineNumber + r &&
				e.modifiedRange.startLineNumber <=
					e.modifiedRange.endLineNumber + r &&
				(s = 1);
		const i = new D(
				e.originalRange.startLineNumber + s,
				e.originalRange.endLineNumber + 1 + r,
			),
			o = new D(
				e.modifiedRange.startLineNumber + s,
				e.modifiedRange.endLineNumber + 1 + r,
			);
		return new de(i, o, [e]);
	}
	function E1(e) {
		return new re(
			new D(e.seq1Range.start + 1, e.seq1Range.endExclusive + 1),
			new D(e.seq2Range.start + 1, e.seq2Range.endExclusive + 1),
		);
	}
	const rr = { getLegacy: () => new a1(), getDefault: () => new R1() };
	function Ne(e, t) {
		const n = Math.pow(10, t);
		return Math.round(e * n) / n;
	}
	class j {
		constructor(t, n, s, r = 1) {
			(this._rgbaBrand = void 0),
				(this.r = Math.min(255, Math.max(0, t)) | 0),
				(this.g = Math.min(255, Math.max(0, n)) | 0),
				(this.b = Math.min(255, Math.max(0, s)) | 0),
				(this.a = Ne(Math.max(Math.min(1, r), 0), 3));
		}
		static equals(t, n) {
			return t.r === n.r && t.g === n.g && t.b === n.b && t.a === n.a;
		}
	}
	class ie {
		constructor(t, n, s, r) {
			(this._hslaBrand = void 0),
				(this.h = Math.max(Math.min(360, t), 0) | 0),
				(this.s = Ne(Math.max(Math.min(1, n), 0), 3)),
				(this.l = Ne(Math.max(Math.min(1, s), 0), 3)),
				(this.a = Ne(Math.max(Math.min(1, r), 0), 3));
		}
		static equals(t, n) {
			return t.h === n.h && t.s === n.s && t.l === n.l && t.a === n.a;
		}
		static fromRGBA(t) {
			const n = t.r / 255,
				s = t.g / 255,
				r = t.b / 255,
				i = t.a,
				o = Math.max(n, s, r),
				l = Math.min(n, s, r);
			let u = 0,
				c = 0;
			const f = (l + o) / 2,
				h = o - l;
			if (h > 0) {
				switch (
					((c = Math.min(
						f <= 0.5 ? h / (2 * f) : h / (2 - 2 * f),
						1,
					)),
					o)
				) {
					case n:
						u = (s - r) / h + (s < r ? 6 : 0);
						break;
					case s:
						u = (r - n) / h + 2;
						break;
					case r:
						u = (n - s) / h + 4;
						break;
				}
				(u *= 60), (u = Math.round(u));
			}
			return new ie(u, c, f, i);
		}
		static _hue2rgb(t, n, s) {
			return (
				s < 0 && (s += 1),
				s > 1 && (s -= 1),
				s < 1 / 6
					? t + (n - t) * 6 * s
					: s < 1 / 2
						? n
						: s < 2 / 3
							? t + (n - t) * (2 / 3 - s) * 6
							: t
			);
		}
		static toRGBA(t) {
			const n = t.h / 360,
				{ s, l: r, a: i } = t;
			let o, l, u;
			if (s === 0) o = l = u = r;
			else {
				const c = r < 0.5 ? r * (1 + s) : r + s - r * s,
					f = 2 * r - c;
				(o = ie._hue2rgb(f, c, n + 1 / 3)),
					(l = ie._hue2rgb(f, c, n)),
					(u = ie._hue2rgb(f, c, n - 1 / 3));
			}
			return new j(
				Math.round(o * 255),
				Math.round(l * 255),
				Math.round(u * 255),
				i,
			);
		}
	}
	class Be {
		constructor(t, n, s, r) {
			(this._hsvaBrand = void 0),
				(this.h = Math.max(Math.min(360, t), 0) | 0),
				(this.s = Ne(Math.max(Math.min(1, n), 0), 3)),
				(this.v = Ne(Math.max(Math.min(1, s), 0), 3)),
				(this.a = Ne(Math.max(Math.min(1, r), 0), 3));
		}
		static equals(t, n) {
			return t.h === n.h && t.s === n.s && t.v === n.v && t.a === n.a;
		}
		static fromRGBA(t) {
			const n = t.r / 255,
				s = t.g / 255,
				r = t.b / 255,
				i = Math.max(n, s, r),
				o = Math.min(n, s, r),
				l = i - o,
				u = i === 0 ? 0 : l / i;
			let c;
			return (
				l === 0
					? (c = 0)
					: i === n
						? (c = ((((s - r) / l) % 6) + 6) % 6)
						: i === s
							? (c = (r - n) / l + 2)
							: (c = (n - s) / l + 4),
				new Be(Math.round(c * 60), u, i, t.a)
			);
		}
		static toRGBA(t) {
			const { h: n, s, v: r, a: i } = t,
				o = r * s,
				l = o * (1 - Math.abs(((n / 60) % 2) - 1)),
				u = r - o;
			let [c, f, h] = [0, 0, 0];
			return (
				n < 60
					? ((c = o), (f = l))
					: n < 120
						? ((c = l), (f = o))
						: n < 180
							? ((f = o), (h = l))
							: n < 240
								? ((f = l), (h = o))
								: n < 300
									? ((c = l), (h = o))
									: n <= 360 && ((c = o), (h = l)),
				(c = Math.round((c + u) * 255)),
				(f = Math.round((f + u) * 255)),
				(h = Math.round((h + u) * 255)),
				new j(c, f, h, i)
			);
		}
	}
	class $ {
		static fromHex(t) {
			return $.Format.CSS.parseHex(t) || $.red;
		}
		static equals(t, n) {
			return !t && !n ? !0 : !t || !n ? !1 : t.equals(n);
		}
		get hsla() {
			return this._hsla ? this._hsla : ie.fromRGBA(this.rgba);
		}
		get hsva() {
			return this._hsva ? this._hsva : Be.fromRGBA(this.rgba);
		}
		constructor(t) {
			if (t)
				if (t instanceof j) this.rgba = t;
				else if (t instanceof ie)
					(this._hsla = t), (this.rgba = ie.toRGBA(t));
				else if (t instanceof Be)
					(this._hsva = t), (this.rgba = Be.toRGBA(t));
				else throw new Error("Invalid color ctor argument");
			else throw new Error("Color needs a value");
		}
		equals(t) {
			return (
				!!t &&
				j.equals(this.rgba, t.rgba) &&
				ie.equals(this.hsla, t.hsla) &&
				Be.equals(this.hsva, t.hsva)
			);
		}
		getRelativeLuminance() {
			const t = $._relativeLuminanceForComponent(this.rgba.r),
				n = $._relativeLuminanceForComponent(this.rgba.g),
				s = $._relativeLuminanceForComponent(this.rgba.b),
				r = 0.2126 * t + 0.7152 * n + 0.0722 * s;
			return Ne(r, 4);
		}
		static _relativeLuminanceForComponent(t) {
			const n = t / 255;
			return n <= 0.03928
				? n / 12.92
				: Math.pow((n + 0.055) / 1.055, 2.4);
		}
		isLighter() {
			return (
				(this.rgba.r * 299 + this.rgba.g * 587 + this.rgba.b * 114) /
					1e3 >=
				128
			);
		}
		isLighterThan(t) {
			const n = this.getRelativeLuminance(),
				s = t.getRelativeLuminance();
			return n > s;
		}
		isDarkerThan(t) {
			const n = this.getRelativeLuminance(),
				s = t.getRelativeLuminance();
			return n < s;
		}
		lighten(t) {
			return new $(
				new ie(
					this.hsla.h,
					this.hsla.s,
					this.hsla.l + this.hsla.l * t,
					this.hsla.a,
				),
			);
		}
		darken(t) {
			return new $(
				new ie(
					this.hsla.h,
					this.hsla.s,
					this.hsla.l - this.hsla.l * t,
					this.hsla.a,
				),
			);
		}
		transparent(t) {
			const { r: n, g: s, b: r, a: i } = this.rgba;
			return new $(new j(n, s, r, i * t));
		}
		isTransparent() {
			return this.rgba.a === 0;
		}
		isOpaque() {
			return this.rgba.a === 1;
		}
		opposite() {
			return new $(
				new j(
					255 - this.rgba.r,
					255 - this.rgba.g,
					255 - this.rgba.b,
					this.rgba.a,
				),
			);
		}
		makeOpaque(t) {
			if (this.isOpaque() || t.rgba.a !== 1) return this;
			const { r: n, g: s, b: r, a: i } = this.rgba;
			return new $(
				new j(
					t.rgba.r - i * (t.rgba.r - n),
					t.rgba.g - i * (t.rgba.g - s),
					t.rgba.b - i * (t.rgba.b - r),
					1,
				),
			);
		}
		toString() {
			return (
				this._toString || (this._toString = $.Format.CSS.format(this)),
				this._toString
			);
		}
		static getLighterColor(t, n, s) {
			if (t.isLighterThan(n)) return t;
			s = s || 0.5;
			const r = t.getRelativeLuminance(),
				i = n.getRelativeLuminance();
			return (s = (s * (i - r)) / i), t.lighten(s);
		}
		static getDarkerColor(t, n, s) {
			if (t.isDarkerThan(n)) return t;
			s = s || 0.5;
			const r = t.getRelativeLuminance(),
				i = n.getRelativeLuminance();
			return (s = (s * (r - i)) / r), t.darken(s);
		}
		static {
			this.white = new $(new j(255, 255, 255, 1));
		}
		static {
			this.black = new $(new j(0, 0, 0, 1));
		}
		static {
			this.red = new $(new j(255, 0, 0, 1));
		}
		static {
			this.blue = new $(new j(0, 0, 255, 1));
		}
		static {
			this.green = new $(new j(0, 255, 0, 1));
		}
		static {
			this.cyan = new $(new j(0, 255, 255, 1));
		}
		static {
			this.lightgrey = new $(new j(211, 211, 211, 1));
		}
		static {
			this.transparent = new $(new j(0, 0, 0, 0));
		}
	}
	(function (e) {
		(function (t) {
			(function (n) {
				function s(m) {
					return m.rgba.a === 1
						? `rgb(${m.rgba.r}, ${m.rgba.g}, ${m.rgba.b})`
						: e.Format.CSS.formatRGBA(m);
				}
				n.formatRGB = s;
				function r(m) {
					return `rgba(${m.rgba.r}, ${m.rgba.g}, ${m.rgba.b}, ${+m.rgba.a.toFixed(2)})`;
				}
				n.formatRGBA = r;
				function i(m) {
					return m.hsla.a === 1
						? `hsl(${m.hsla.h}, ${(m.hsla.s * 100).toFixed(2)}%, ${(m.hsla.l * 100).toFixed(2)}%)`
						: e.Format.CSS.formatHSLA(m);
				}
				n.formatHSL = i;
				function o(m) {
					return `hsla(${m.hsla.h}, ${(m.hsla.s * 100).toFixed(2)}%, ${(m.hsla.l * 100).toFixed(2)}%, ${m.hsla.a.toFixed(2)})`;
				}
				n.formatHSLA = o;
				function l(m) {
					const g = m.toString(16);
					return g.length !== 2 ? "0" + g : g;
				}
				function u(m) {
					return `#${l(m.rgba.r)}${l(m.rgba.g)}${l(m.rgba.b)}`;
				}
				n.formatHex = u;
				function c(m, g = !1) {
					return g && m.rgba.a === 1
						? e.Format.CSS.formatHex(m)
						: `#${l(m.rgba.r)}${l(m.rgba.g)}${l(m.rgba.b)}${l(Math.round(m.rgba.a * 255))}`;
				}
				n.formatHexA = c;
				function f(m) {
					return m.isOpaque()
						? e.Format.CSS.formatHex(m)
						: e.Format.CSS.formatRGBA(m);
				}
				n.format = f;
				function h(m) {
					const g = m.length;
					if (g === 0 || m.charCodeAt(0) !== 35) return null;
					if (g === 7) {
						const b = 16 * d(m.charCodeAt(1)) + d(m.charCodeAt(2)),
							w = 16 * d(m.charCodeAt(3)) + d(m.charCodeAt(4)),
							v = 16 * d(m.charCodeAt(5)) + d(m.charCodeAt(6));
						return new e(new j(b, w, v, 1));
					}
					if (g === 9) {
						const b = 16 * d(m.charCodeAt(1)) + d(m.charCodeAt(2)),
							w = 16 * d(m.charCodeAt(3)) + d(m.charCodeAt(4)),
							v = 16 * d(m.charCodeAt(5)) + d(m.charCodeAt(6)),
							C = 16 * d(m.charCodeAt(7)) + d(m.charCodeAt(8));
						return new e(new j(b, w, v, C / 255));
					}
					if (g === 4) {
						const b = d(m.charCodeAt(1)),
							w = d(m.charCodeAt(2)),
							v = d(m.charCodeAt(3));
						return new e(new j(16 * b + b, 16 * w + w, 16 * v + v));
					}
					if (g === 5) {
						const b = d(m.charCodeAt(1)),
							w = d(m.charCodeAt(2)),
							v = d(m.charCodeAt(3)),
							C = d(m.charCodeAt(4));
						return new e(
							new j(
								16 * b + b,
								16 * w + w,
								16 * v + v,
								(16 * C + C) / 255,
							),
						);
					}
					return null;
				}
				n.parseHex = h;
				function d(m) {
					switch (m) {
						case 48:
							return 0;
						case 49:
							return 1;
						case 50:
							return 2;
						case 51:
							return 3;
						case 52:
							return 4;
						case 53:
							return 5;
						case 54:
							return 6;
						case 55:
							return 7;
						case 56:
							return 8;
						case 57:
							return 9;
						case 97:
							return 10;
						case 65:
							return 10;
						case 98:
							return 11;
						case 66:
							return 11;
						case 99:
							return 12;
						case 67:
							return 12;
						case 100:
							return 13;
						case 68:
							return 13;
						case 101:
							return 14;
						case 69:
							return 14;
						case 102:
							return 15;
						case 70:
							return 15;
					}
					return 0;
				}
			})(t.CSS || (t.CSS = {}));
		})(e.Format || (e.Format = {}));
	})($ || ($ = {}));
	function ir(e) {
		const t = [];
		for (const n of e) {
			const s = Number(n);
			(s || (s === 0 && n.replace(/\s/g, "") !== "")) && t.push(s);
		}
		return t;
	}
	function nn(e, t, n, s) {
		return { red: e / 255, blue: n / 255, green: t / 255, alpha: s };
	}
	function Xe(e, t) {
		const n = t.index,
			s = t[0].length;
		if (!n) return;
		const r = e.positionAt(n);
		return {
			startLineNumber: r.lineNumber,
			startColumn: r.column,
			endLineNumber: r.lineNumber,
			endColumn: r.column + s,
		};
	}
	function M1(e, t) {
		if (!e) return;
		const n = $.Format.CSS.parseHex(t);
		if (n)
			return {
				range: e,
				color: nn(n.rgba.r, n.rgba.g, n.rgba.b, n.rgba.a),
			};
	}
	function ar(e, t, n) {
		if (!e || t.length !== 1) return;
		const r = t[0].values(),
			i = ir(r);
		return { range: e, color: nn(i[0], i[1], i[2], n ? i[3] : 1) };
	}
	function or(e, t, n) {
		if (!e || t.length !== 1) return;
		const r = t[0].values(),
			i = ir(r),
			o = new $(new ie(i[0], i[1] / 100, i[2] / 100, n ? i[3] : 1));
		return { range: e, color: nn(o.rgba.r, o.rgba.g, o.rgba.b, o.rgba.a) };
	}
	function Qe(e, t) {
		return typeof e == "string" ? [...e.matchAll(t)] : e.findMatches(t);
	}
	function k1(e) {
		const t = [],
			s = Qe(
				e,
				/\b(rgb|rgba|hsl|hsla)(\([0-9\s,.\%]*\))|(#)([A-Fa-f0-9]{3})\b|(#)([A-Fa-f0-9]{4})\b|(#)([A-Fa-f0-9]{6})\b|(#)([A-Fa-f0-9]{8})\b/gm,
			);
		if (s.length > 0)
			for (const r of s) {
				const i = r.filter((c) => c !== void 0),
					o = i[1],
					l = i[2];
				if (!l) continue;
				let u;
				if (o === "rgb") {
					const c =
						/^\(\s*(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]|[0-9])\s*,\s*(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]|[0-9])\s*,\s*(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]|[0-9])\s*\)$/gm;
					u = ar(Xe(e, r), Qe(l, c), !1);
				} else if (o === "rgba") {
					const c =
						/^\(\s*(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]|[0-9])\s*,\s*(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]|[0-9])\s*,\s*(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]|[0-9])\s*,\s*(0[.][0-9]+|[.][0-9]+|[01][.]|[01])\s*\)$/gm;
					u = ar(Xe(e, r), Qe(l, c), !0);
				} else if (o === "hsl") {
					const c =
						/^\(\s*(36[0]|3[0-5][0-9]|[12][0-9][0-9]|[1-9]?[0-9])\s*,\s*(100|\d{1,2}[.]\d*|\d{1,2})%\s*,\s*(100|\d{1,2}[.]\d*|\d{1,2})%\s*\)$/gm;
					u = or(Xe(e, r), Qe(l, c), !1);
				} else if (o === "hsla") {
					const c =
						/^\(\s*(36[0]|3[0-5][0-9]|[12][0-9][0-9]|[1-9]?[0-9])\s*,\s*(100|\d{1,2}[.]\d*|\d{1,2})%\s*,\s*(100|\d{1,2}[.]\d*|\d{1,2})%\s*,\s*(0[.][0-9]+|[.][0-9]+|[01][.]|[01])\s*\)$/gm;
					u = or(Xe(e, r), Qe(l, c), !0);
				} else o === "#" && (u = M1(Xe(e, r), o + l));
				u && t.push(u);
			}
		return t;
	}
	function F1(e) {
		return !e ||
			typeof e.getValue != "function" ||
			typeof e.positionAt != "function"
			? []
			: k1(e);
	}
	const lr = new RegExp("\\bMARK:\\s*(.*)$", "d"),
		D1 = /^-+|-+$/g;
	function P1(e, t) {
		let n = [];
		if (t.findRegionSectionHeaders && t.foldingRules?.markers) {
			const s = T1(e, t);
			n = n.concat(s);
		}
		if (t.findMarkSectionHeaders) {
			const s = V1(e);
			n = n.concat(s);
		}
		return n;
	}
	function T1(e, t) {
		const n = [],
			s = e.getLineCount();
		for (let r = 1; r <= s; r++) {
			const i = e.getLineContent(r),
				o = i.match(t.foldingRules.markers.start);
			if (o) {
				const l = {
					startLineNumber: r,
					startColumn: o[0].length + 1,
					endLineNumber: r,
					endColumn: i.length + 1,
				};
				if (l.endColumn > l.startColumn) {
					const u = {
						range: l,
						...ur(i.substring(o[0].length)),
						shouldBeInComments: !1,
					};
					(u.text || u.hasSeparatorLine) && n.push(u);
				}
			}
		}
		return n;
	}
	function V1(e) {
		const t = [],
			n = e.getLineCount();
		for (let s = 1; s <= n; s++) {
			const r = e.getLineContent(s);
			I1(r, s, t);
		}
		return t;
	}
	function I1(e, t, n) {
		lr.lastIndex = 0;
		const s = lr.exec(e);
		if (s) {
			const r = s.indices[1][0] + 1,
				i = s.indices[1][1] + 1,
				o = {
					startLineNumber: t,
					startColumn: r,
					endLineNumber: t,
					endColumn: i,
				};
			if (o.endColumn > o.startColumn) {
				const l = { range: o, ...ur(s[1]), shouldBeInComments: !0 };
				(l.text || l.hasSeparatorLine) && n.push(l);
			}
		}
	}
	function ur(e) {
		e = e.trim();
		const t = e.startsWith("-");
		return (e = e.replace(D1, "")), { text: e, hasSeparatorLine: t };
	}
	class B1 extends Ni {
		get uri() {
			return this._uri;
		}
		get eol() {
			return this._eol;
		}
		getValue() {
			return this.getText();
		}
		findMatches(t) {
			const n = [];
			for (let s = 0; s < this._lines.length; s++) {
				const r = this._lines[s],
					i = this.offsetAt(new q(s + 1, 1)),
					o = r.matchAll(t);
				for (const l of o)
					(l.index || l.index === 0) && (l.index = l.index + i),
						n.push(l);
			}
			return n;
		}
		getLinesContent() {
			return this._lines.slice(0);
		}
		getLineCount() {
			return this._lines.length;
		}
		getLineContent(t) {
			return this._lines[t - 1];
		}
		getWordAtPosition(t, n) {
			const s = qt(t.column, En(n), this._lines[t.lineNumber - 1], 0);
			return s
				? new k(t.lineNumber, s.startColumn, t.lineNumber, s.endColumn)
				: null;
		}
		words(t) {
			const n = this._lines,
				s = this._wordenize.bind(this);
			let r = 0,
				i = "",
				o = 0,
				l = [];
			return {
				*[Symbol.iterator]() {
					for (;;)
						if (o < l.length) {
							const u = i.substring(l[o].start, l[o].end);
							(o += 1), yield u;
						} else if (r < n.length)
							(i = n[r]), (l = s(i, t)), (o = 0), (r += 1);
						else break;
				},
			};
		}
		getLineWords(t, n) {
			const s = this._lines[t - 1],
				r = this._wordenize(s, n),
				i = [];
			for (const o of r)
				i.push({
					word: s.substring(o.start, o.end),
					startColumn: o.start + 1,
					endColumn: o.end + 1,
				});
			return i;
		}
		_wordenize(t, n) {
			const s = [];
			let r;
			for (n.lastIndex = 0; (r = n.exec(t)) && r[0].length !== 0; )
				s.push({ start: r.index, end: r.index + r[0].length });
			return s;
		}
		getValueInRange(t) {
			if (
				((t = this._validateRange(t)),
				t.startLineNumber === t.endLineNumber)
			)
				return this._lines[t.startLineNumber - 1].substring(
					t.startColumn - 1,
					t.endColumn - 1,
				);
			const n = this._eol,
				s = t.startLineNumber - 1,
				r = t.endLineNumber - 1,
				i = [];
			i.push(this._lines[s].substring(t.startColumn - 1));
			for (let o = s + 1; o < r; o++) i.push(this._lines[o]);
			return (
				i.push(this._lines[r].substring(0, t.endColumn - 1)), i.join(n)
			);
		}
		offsetAt(t) {
			return (
				(t = this._validatePosition(t)),
				this._ensureLineStarts(),
				this._lineStarts.getPrefixSum(t.lineNumber - 2) + (t.column - 1)
			);
		}
		positionAt(t) {
			(t = Math.floor(t)), (t = Math.max(0, t)), this._ensureLineStarts();
			const n = this._lineStarts.getIndexOf(t),
				s = this._lines[n.index].length;
			return {
				lineNumber: 1 + n.index,
				column: 1 + Math.min(n.remainder, s),
			};
		}
		_validateRange(t) {
			const n = this._validatePosition({
					lineNumber: t.startLineNumber,
					column: t.startColumn,
				}),
				s = this._validatePosition({
					lineNumber: t.endLineNumber,
					column: t.endColumn,
				});
			return n.lineNumber !== t.startLineNumber ||
				n.column !== t.startColumn ||
				s.lineNumber !== t.endLineNumber ||
				s.column !== t.endColumn
				? {
						startLineNumber: n.lineNumber,
						startColumn: n.column,
						endLineNumber: s.lineNumber,
						endColumn: s.column,
					}
				: t;
		}
		_validatePosition(t) {
			if (!q.isIPosition(t)) throw new Error("bad position");
			let { lineNumber: n, column: s } = t,
				r = !1;
			if (n < 1) (n = 1), (s = 1), (r = !0);
			else if (n > this._lines.length)
				(n = this._lines.length),
					(s = this._lines[n - 1].length + 1),
					(r = !0);
			else {
				const i = this._lines[n - 1].length + 1;
				s < 1 ? ((s = 1), (r = !0)) : s > i && ((s = i), (r = !0));
			}
			return r ? { lineNumber: n, column: s } : t;
		}
	}
	class Je {
		constructor(t, n) {
			(this._host = t),
				(this._models = Object.create(null)),
				(this._foreignModuleFactory = n),
				(this._foreignModule = null);
		}
		dispose() {
			this._models = Object.create(null);
		}
		_getModel(t) {
			return this._models[t];
		}
		_getModels() {
			const t = [];
			return (
				Object.keys(this._models).forEach((n) =>
					t.push(this._models[n]),
				),
				t
			);
		}
		acceptNewModel(t) {
			this._models[t.url] = new B1(
				Ae.parse(t.url),
				t.lines,
				t.EOL,
				t.versionId,
			);
		}
		acceptModelChanged(t, n) {
			if (!this._models[t]) return;
			this._models[t].onEvents(n);
		}
		acceptRemovedModel(t) {
			this._models[t] && delete this._models[t];
		}
		async computeUnicodeHighlights(t, n, s) {
			const r = this._getModel(t);
			return r
				? e1.computeUnicodeHighlights(r, n, s)
				: {
						ranges: [],
						hasMore: !1,
						ambiguousCharacterCount: 0,
						invisibleCharacterCount: 0,
						nonBasicAsciiCharacterCount: 0,
					};
		}
		async findSectionHeaders(t, n) {
			const s = this._getModel(t);
			return s ? P1(s, n) : [];
		}
		async computeDiff(t, n, s, r) {
			const i = this._getModel(t),
				o = this._getModel(n);
			return !i || !o ? null : Je.computeDiff(i, o, s, r);
		}
		static computeDiff(t, n, s, r) {
			const i = r === "advanced" ? rr.getDefault() : rr.getLegacy(),
				o = t.getLinesContent(),
				l = n.getLinesContent(),
				u = i.computeDiff(o, l, s),
				c = u.changes.length > 0 ? !1 : this._modelsAreIdentical(t, n);
			function f(h) {
				return h.map((d) => [
					d.original.startLineNumber,
					d.original.endLineNumberExclusive,
					d.modified.startLineNumber,
					d.modified.endLineNumberExclusive,
					d.innerChanges?.map((m) => [
						m.originalRange.startLineNumber,
						m.originalRange.startColumn,
						m.originalRange.endLineNumber,
						m.originalRange.endColumn,
						m.modifiedRange.startLineNumber,
						m.modifiedRange.startColumn,
						m.modifiedRange.endLineNumber,
						m.modifiedRange.endColumn,
					]),
				]);
			}
			return {
				identical: c,
				quitEarly: u.hitTimeout,
				changes: f(u.changes),
				moves: u.moves.map((h) => [
					h.lineRangeMapping.original.startLineNumber,
					h.lineRangeMapping.original.endLineNumberExclusive,
					h.lineRangeMapping.modified.startLineNumber,
					h.lineRangeMapping.modified.endLineNumberExclusive,
					f(h.changes),
				]),
			};
		}
		static _modelsAreIdentical(t, n) {
			const s = t.getLineCount(),
				r = n.getLineCount();
			if (s !== r) return !1;
			for (let i = 1; i <= s; i++) {
				const o = t.getLineContent(i),
					l = n.getLineContent(i);
				if (o !== l) return !1;
			}
			return !0;
		}
		static {
			this._diffLimit = 1e5;
		}
		async computeMoreMinimalEdits(t, n, s) {
			const r = this._getModel(t);
			if (!r) return n;
			const i = [];
			let o;
			n = n.slice(0).sort((u, c) => {
				if (u.range && c.range)
					return k.compareRangesUsingStarts(u.range, c.range);
				const f = u.range ? 0 : 1,
					h = c.range ? 0 : 1;
				return f - h;
			});
			let l = 0;
			for (let u = 1; u < n.length; u++)
				k
					.getEndPosition(n[l].range)
					.equals(k.getStartPosition(n[u].range))
					? ((n[l].range = k.fromPositions(
							k.getStartPosition(n[l].range),
							k.getEndPosition(n[u].range),
						)),
						(n[l].text += n[u].text))
					: (l++, (n[l] = n[u]));
			n.length = l + 1;
			for (let { range: u, text: c, eol: f } of n) {
				if ((typeof f == "number" && (o = f), k.isEmpty(u) && !c))
					continue;
				const h = r.getValueInRange(u);
				if (((c = c.replace(/\r\n|\n|\r/g, r.eol)), h === c)) continue;
				if (Math.max(c.length, h.length) > Je._diffLimit) {
					i.push({ range: u, text: c });
					continue;
				}
				const d = Jr(h, c, s),
					m = r.offsetAt(k.lift(u).getStartPosition());
				for (const g of d) {
					const b = r.positionAt(m + g.originalStart),
						w = r.positionAt(
							m + g.originalStart + g.originalLength,
						),
						v = {
							text: c.substr(g.modifiedStart, g.modifiedLength),
							range: {
								startLineNumber: b.lineNumber,
								startColumn: b.column,
								endLineNumber: w.lineNumber,
								endColumn: w.column,
							},
						};
					r.getValueInRange(v.range) !== v.text && i.push(v);
				}
			}
			return (
				typeof o == "number" &&
					i.push({
						eol: o,
						text: "",
						range: {
							startLineNumber: 0,
							startColumn: 0,
							endLineNumber: 0,
							endColumn: 0,
						},
					}),
				i
			);
		}
		async computeLinks(t) {
			const n = this._getModel(t);
			return n ? ki(n) : null;
		}
		async computeDefaultDocumentColors(t) {
			const n = this._getModel(t);
			return n ? F1(n) : null;
		}
		static {
			this._suggestionsLimit = 1e4;
		}
		async textualSuggest(t, n, s, r) {
			const i = new nt(),
				o = new RegExp(s, r),
				l = new Set();
			e: for (const u of t) {
				const c = this._getModel(u);
				if (c) {
					for (const f of c.words(o))
						if (
							!(f === n || !isNaN(Number(f))) &&
							(l.add(f), l.size > Je._suggestionsLimit)
						)
							break e;
				}
			}
			return { words: Array.from(l), duration: i.elapsed() };
		}
		async computeWordRanges(t, n, s, r) {
			const i = this._getModel(t);
			if (!i) return Object.create(null);
			const o = new RegExp(s, r),
				l = Object.create(null);
			for (let u = n.startLineNumber; u < n.endLineNumber; u++) {
				const c = i.getLineWords(u, o);
				for (const f of c) {
					if (!isNaN(Number(f.word))) continue;
					let h = l[f.word];
					h || ((h = []), (l[f.word] = h)),
						h.push({
							startLineNumber: u,
							startColumn: f.startColumn,
							endLineNumber: u,
							endColumn: f.endColumn,
						});
				}
			}
			return l;
		}
		async navigateValueSet(t, n, s, r, i) {
			const o = this._getModel(t);
			if (!o) return null;
			const l = new RegExp(r, i);
			n.startColumn === n.endColumn &&
				(n = {
					startLineNumber: n.startLineNumber,
					startColumn: n.startColumn,
					endLineNumber: n.endLineNumber,
					endColumn: n.endColumn + 1,
				});
			const u = o.getValueInRange(n),
				c = o.getWordAtPosition(
					{ lineNumber: n.startLineNumber, column: n.startColumn },
					l,
				);
			if (!c) return null;
			const f = o.getValueInRange(c);
			return Wt.INSTANCE.navigateValueSet(n, u, c, f, s);
		}
		loadForeignModule(t, n, s) {
			const o = {
				host: Cr(s, (l, u) => this._host.fhr(l, u)),
				getMirrorModels: () => this._getModels(),
			};
			return this._foreignModuleFactory
				? ((this._foreignModule = this._foreignModuleFactory(o, n)),
					Promise.resolve(Rt(this._foreignModule)))
				: Promise.reject(new Error("Unexpected usage"));
		}
		fmr(t, n) {
			if (
				!this._foreignModule ||
				typeof this._foreignModule[t] != "function"
			)
				return Promise.reject(
					new Error("Missing requestHandler or method: " + t),
				);
			try {
				return Promise.resolve(
					this._foreignModule[t].apply(this._foreignModule, n),
				);
			} catch (s) {
				return Promise.reject(s);
			}
		}
	}
	typeof importScripts == "function" && (globalThis.monaco = $i());
	let sn = !1;
	function q1(e) {
		if (sn) return;
		sn = !0;
		const t = new jr(
			(n) => {
				globalThis.postMessage(n);
			},
			(n) => new Je(n, e),
		);
		globalThis.onmessage = (n) => {
			t.onmessage(n.data);
		};
	}
	globalThis.onmessage = (e) => {
		sn || q1(null);
	};
})();
//# sourceMappingURL=editor.worker-kR8uh3Gf.js.map