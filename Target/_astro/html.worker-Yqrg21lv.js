(function () {
	"use strict";
	class Na {
		constructor() {
			(this.listeners = []),
				(this.unexpectedErrorHandler = function (t) {
					setTimeout(() => {
						throw t.stack
							? $e.isErrorNoTelemetry(t)
								? new $e(
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
	const Da = new Na();
	function kt(e) {
		Ia(e) || Da.onUnexpectedError(e);
	}
	function di(e) {
		if (e instanceof Error) {
			const { name: t, message: n } = e,
				i = e.stacktrace || e.stack;
			return {
				$isError: !0,
				name: t,
				message: n,
				stack: i,
				noTelemetry: $e.isErrorNoTelemetry(e),
			};
		}
		return e;
	}
	const on = "Canceled";
	function Ia(e) {
		return e instanceof za
			? !0
			: e instanceof Error && e.name === on && e.message === on;
	}
	class za extends Error {
		constructor() {
			super(on), (this.name = this.message);
		}
	}
	class $e extends Error {
		constructor(t) {
			super(t), (this.name = "CodeExpectedError");
		}
		static fromError(t) {
			if (t instanceof $e) return t;
			const n = new $e();
			return (n.message = t.message), (n.stack = t.stack), n;
		}
		static isErrorNoTelemetry(t) {
			return t.name === "CodeExpectedError";
		}
	}
	class de extends Error {
		constructor(t) {
			super(t || "An unexpected bug occurred."),
				Object.setPrototypeOf(this, de.prototype);
		}
	}
	function Ha(e, t) {
		const n = this;
		let i = !1,
			r;
		return function () {
			return i || ((i = !0), (r = e.apply(n, arguments))), r;
		};
	}
	var At;
	(function (e) {
		function t(R) {
			return (
				R &&
				typeof R == "object" &&
				typeof R[Symbol.iterator] == "function"
			);
		}
		e.is = t;
		const n = Object.freeze([]);
		function i() {
			return n;
		}
		e.empty = i;
		function* r(R) {
			yield R;
		}
		e.single = r;
		function s(R) {
			return t(R) ? R : r(R);
		}
		e.wrap = s;
		function o(R) {
			return R || n;
		}
		e.from = o;
		function* l(R) {
			for (let N = R.length - 1; N >= 0; N--) yield R[N];
		}
		e.reverse = l;
		function a(R) {
			return !R || R[Symbol.iterator]().next().done === !0;
		}
		e.isEmpty = a;
		function u(R) {
			return R[Symbol.iterator]().next().value;
		}
		e.first = u;
		function c(R, N) {
			let M = 0;
			for (const b of R) if (N(b, M++)) return !0;
			return !1;
		}
		e.some = c;
		function d(R, N) {
			for (const M of R) if (N(M)) return M;
		}
		e.find = d;
		function* m(R, N) {
			for (const M of R) N(M) && (yield M);
		}
		e.filter = m;
		function* f(R, N) {
			let M = 0;
			for (const b of R) yield N(b, M++);
		}
		e.map = f;
		function* w(R, N) {
			let M = 0;
			for (const b of R) yield* N(b, M++);
		}
		e.flatMap = w;
		function* g(...R) {
			for (const N of R) yield* N;
		}
		e.concat = g;
		function k(R, N, M) {
			let b = M;
			for (const p of R) b = N(b, p);
			return b;
		}
		e.reduce = k;
		function* v(R, N, M = R.length) {
			for (
				N < 0 && (N += R.length),
					M < 0 ? (M += R.length) : M > R.length && (M = R.length);
				N < M;
				N++
			)
				yield R[N];
		}
		e.slice = v;
		function y(R, N = Number.POSITIVE_INFINITY) {
			const M = [];
			if (N === 0) return [M, R];
			const b = R[Symbol.iterator]();
			for (let p = 0; p < N; p++) {
				const T = b.next();
				if (T.done) return [M, e.empty()];
				M.push(T.value);
			}
			return [
				M,
				{
					[Symbol.iterator]() {
						return b;
					},
				},
			];
		}
		e.consume = y;
		async function E(R) {
			const N = [];
			for await (const M of R) N.push(M);
			return Promise.resolve(N);
		}
		e.asyncToArray = E;
	})(At || (At = {}));
	function xc(e) {
		return e;
	}
	function Tc(e, t) {}
	function mi(e) {
		if (At.is(e)) {
			const t = [];
			for (const n of e)
				if (n)
					try {
						n.dispose();
					} catch (i) {
						t.push(i);
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
	function Ua(...e) {
		return St(() => mi(e));
	}
	function St(e) {
		return {
			dispose: Ha(() => {
				e();
			}),
		};
	}
	class ut {
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
					mi(this._toDispose);
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
					? ut.DISABLE_DISPOSED_WARNING ||
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
	class Lt {
		static {
			this.None = Object.freeze({ dispose() {} });
		}
		constructor() {
			(this._store = new ut()), this._store;
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
	let Q = class sn {
		static {
			this.Undefined = new sn(void 0);
		}
		constructor(t) {
			(this.element = t),
				(this.next = sn.Undefined),
				(this.prev = sn.Undefined);
		}
	};
	class Wa {
		constructor() {
			(this._first = Q.Undefined),
				(this._last = Q.Undefined),
				(this._size = 0);
		}
		get size() {
			return this._size;
		}
		isEmpty() {
			return this._first === Q.Undefined;
		}
		clear() {
			let t = this._first;
			for (; t !== Q.Undefined; ) {
				const n = t.next;
				(t.prev = Q.Undefined), (t.next = Q.Undefined), (t = n);
			}
			(this._first = Q.Undefined),
				(this._last = Q.Undefined),
				(this._size = 0);
		}
		unshift(t) {
			return this._insert(t, !1);
		}
		push(t) {
			return this._insert(t, !0);
		}
		_insert(t, n) {
			const i = new Q(t);
			if (this._first === Q.Undefined)
				(this._first = i), (this._last = i);
			else if (n) {
				const s = this._last;
				(this._last = i), (i.prev = s), (s.next = i);
			} else {
				const s = this._first;
				(this._first = i), (i.next = s), (s.prev = i);
			}
			this._size += 1;
			let r = !1;
			return () => {
				r || ((r = !0), this._remove(i));
			};
		}
		shift() {
			if (this._first !== Q.Undefined) {
				const t = this._first.element;
				return this._remove(this._first), t;
			}
		}
		pop() {
			if (this._last !== Q.Undefined) {
				const t = this._last.element;
				return this._remove(this._last), t;
			}
		}
		_remove(t) {
			if (t.prev !== Q.Undefined && t.next !== Q.Undefined) {
				const n = t.prev;
				(n.next = t.next), (t.next.prev = n);
			} else
				t.prev === Q.Undefined && t.next === Q.Undefined
					? ((this._first = Q.Undefined), (this._last = Q.Undefined))
					: t.next === Q.Undefined
						? ((this._last = this._last.prev),
							(this._last.next = Q.Undefined))
						: t.prev === Q.Undefined &&
							((this._first = this._first.next),
							(this._first.prev = Q.Undefined));
			this._size -= 1;
		}
		*[Symbol.iterator]() {
			let t = this._first;
			for (; t !== Q.Undefined; ) yield t.element, (t = t.next);
		}
	}
	const Fa =
		globalThis.performance &&
		typeof globalThis.performance.now == "function";
	class Ct {
		static create(t) {
			return new Ct(t);
		}
		constructor(t) {
			(this._now =
				Fa && t === !1
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
	var ln;
	(function (e) {
		e.None = () => Lt.None;
		function t(_, A) {
			return d(_, () => {}, 0, void 0, !0, void 0, A);
		}
		e.defer = t;
		function n(_) {
			return (A, x = null, S) => {
				let D = !1,
					I;
				return (
					(I = _(
						(F) => {
							if (!D)
								return I ? I.dispose() : (D = !0), A.call(x, F);
						},
						null,
						S,
					)),
					D && I.dispose(),
					I
				);
			};
		}
		e.once = n;
		function i(_, A, x) {
			return u((S, D = null, I) => _((F) => S.call(D, A(F)), null, I), x);
		}
		e.map = i;
		function r(_, A, x) {
			return u(
				(S, D = null, I) =>
					_(
						(F) => {
							A(F), S.call(D, F);
						},
						null,
						I,
					),
				x,
			);
		}
		e.forEach = r;
		function s(_, A, x) {
			return u(
				(S, D = null, I) => _((F) => A(F) && S.call(D, F), null, I),
				x,
			);
		}
		e.filter = s;
		function o(_) {
			return _;
		}
		e.signal = o;
		function l(..._) {
			return (A, x = null, S) => {
				const D = Ua(..._.map((I) => I((F) => A.call(x, F))));
				return c(D, S);
			};
		}
		e.any = l;
		function a(_, A, x, S) {
			let D = x;
			return i(_, (I) => ((D = A(D, I)), D), S);
		}
		e.reduce = a;
		function u(_, A) {
			let x;
			const S = {
					onWillAddFirstListener() {
						x = _(D.fire, D);
					},
					onDidRemoveLastListener() {
						x?.dispose();
					},
				},
				D = new we(S);
			return A?.add(D), D.event;
		}
		function c(_, A) {
			return A instanceof Array ? A.push(_) : A && A.add(_), _;
		}
		function d(_, A, x = 100, S = !1, D = !1, I, F) {
			let W,
				U,
				V,
				J = 0,
				se;
			const Be = {
					leakWarningThreshold: I,
					onWillAddFirstListener() {
						W = _((vc) => {
							J++,
								(U = A(U, vc)),
								S && !V && (lt.fire(U), (U = void 0)),
								(se = () => {
									const yc = U;
									(U = void 0),
										(V = void 0),
										(!S || J > 1) && lt.fire(yc),
										(J = 0);
								}),
								typeof x == "number"
									? (clearTimeout(V), (V = setTimeout(se, x)))
									: V === void 0 &&
										((V = 0), queueMicrotask(se));
						});
					},
					onWillRemoveListener() {
						D && J > 0 && se?.();
					},
					onDidRemoveLastListener() {
						(se = void 0), W.dispose();
					},
				},
				lt = new we(Be);
			return F?.add(lt), lt.event;
		}
		e.debounce = d;
		function m(_, A = 0, x) {
			return e.debounce(
				_,
				(S, D) => (S ? (S.push(D), S) : [D]),
				A,
				void 0,
				!0,
				void 0,
				x,
			);
		}
		e.accumulate = m;
		function f(_, A = (S, D) => S === D, x) {
			let S = !0,
				D;
			return s(
				_,
				(I) => {
					const F = S || !A(I, D);
					return (S = !1), (D = I), F;
				},
				x,
			);
		}
		e.latch = f;
		function w(_, A, x) {
			return [e.filter(_, A, x), e.filter(_, (S) => !A(S), x)];
		}
		e.split = w;
		function g(_, A = !1, x = [], S) {
			let D = x.slice(),
				I = _((U) => {
					D ? D.push(U) : W.fire(U);
				});
			S && S.add(I);
			const F = () => {
					D?.forEach((U) => W.fire(U)), (D = null);
				},
				W = new we({
					onWillAddFirstListener() {
						I || ((I = _((U) => W.fire(U))), S && S.add(I));
					},
					onDidAddFirstListener() {
						D && (A ? setTimeout(F) : F());
					},
					onDidRemoveLastListener() {
						I && I.dispose(), (I = null);
					},
				});
			return S && S.add(W), W.event;
		}
		e.buffer = g;
		function k(_, A) {
			return (S, D, I) => {
				const F = A(new y());
				return _(
					function (W) {
						const U = F.evaluate(W);
						U !== v && S.call(D, U);
					},
					void 0,
					I,
				);
			};
		}
		e.chain = k;
		const v = Symbol("HaltChainable");
		class y {
			constructor() {
				this.steps = [];
			}
			map(A) {
				return this.steps.push(A), this;
			}
			forEach(A) {
				return this.steps.push((x) => (A(x), x)), this;
			}
			filter(A) {
				return this.steps.push((x) => (A(x) ? x : v)), this;
			}
			reduce(A, x) {
				let S = x;
				return this.steps.push((D) => ((S = A(S, D)), S)), this;
			}
			latch(A = (x, S) => x === S) {
				let x = !0,
					S;
				return (
					this.steps.push((D) => {
						const I = x || !A(D, S);
						return (x = !1), (S = D), I ? D : v;
					}),
					this
				);
			}
			evaluate(A) {
				for (const x of this.steps) if (((A = x(A)), A === v)) break;
				return A;
			}
		}
		function E(_, A, x = (S) => S) {
			const S = (...W) => F.fire(x(...W)),
				D = () => _.on(A, S),
				I = () => _.removeListener(A, S),
				F = new we({
					onWillAddFirstListener: D,
					onDidRemoveLastListener: I,
				});
			return F.event;
		}
		e.fromNodeEventEmitter = E;
		function R(_, A, x = (S) => S) {
			const S = (...W) => F.fire(x(...W)),
				D = () => _.addEventListener(A, S),
				I = () => _.removeEventListener(A, S),
				F = new we({
					onWillAddFirstListener: D,
					onDidRemoveLastListener: I,
				});
			return F.event;
		}
		e.fromDOMEventEmitter = R;
		function N(_) {
			return new Promise((A) => n(_)(A));
		}
		e.toPromise = N;
		function M(_) {
			const A = new we();
			return (
				_.then(
					(x) => {
						A.fire(x);
					},
					() => {
						A.fire(void 0);
					},
				).finally(() => {
					A.dispose();
				}),
				A.event
			);
		}
		e.fromPromise = M;
		function b(_, A) {
			return _((x) => A.fire(x));
		}
		e.forward = b;
		function p(_, A, x) {
			return A(x), _((S) => A(S));
		}
		e.runAndSubscribe = p;
		class T {
			constructor(A, x) {
				(this._observable = A),
					(this._counter = 0),
					(this._hasChanged = !1);
				const S = {
					onWillAddFirstListener: () => {
						A.addObserver(this);
					},
					onDidRemoveLastListener: () => {
						A.removeObserver(this);
					},
				};
				(this.emitter = new we(S)), x && x.add(this.emitter);
			}
			beginUpdate(A) {
				this._counter++;
			}
			handlePossibleChange(A) {}
			handleChange(A, x) {
				this._hasChanged = !0;
			}
			endUpdate(A) {
				this._counter--,
					this._counter === 0 &&
						(this._observable.reportChanges(),
						this._hasChanged &&
							((this._hasChanged = !1),
							this.emitter.fire(this._observable.get())));
			}
		}
		function H(_, A) {
			return new T(_, A).emitter.event;
		}
		e.fromObservable = H;
		function L(_) {
			return (A, x, S) => {
				let D = 0,
					I = !1;
				const F = {
					beginUpdate() {
						D++;
					},
					endUpdate() {
						D--,
							D === 0 &&
								(_.reportChanges(), I && ((I = !1), A.call(x)));
					},
					handlePossibleChange() {},
					handleChange() {
						I = !0;
					},
				};
				_.addObserver(F), _.reportChanges();
				const W = {
					dispose() {
						_.removeObserver(F);
					},
				};
				return (
					S instanceof ut ? S.add(W) : Array.isArray(S) && S.push(W),
					W
				);
			};
		}
		e.fromObservableLight = L;
	})(ln || (ln = {}));
	class Et {
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
				(this.name = `${t}_${Et._idPool++}`),
				Et.all.add(this);
		}
		start(t) {
			(this._stopWatch = new Ct()), (this.listenerCount = t);
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
	let Pa = -1;
	class un {
		static {
			this._idPool = 1;
		}
		constructor(t, n, i = (un._idPool++).toString(16).padStart(3, "0")) {
			(this._errorHandler = t),
				(this.threshold = n),
				(this.name = i),
				(this._warnCountdown = 0);
		}
		dispose() {
			this._stacks?.clear();
		}
		check(t, n) {
			const i = this.threshold;
			if (i <= 0 || n < i) return;
			this._stacks || (this._stacks = new Map());
			const r = this._stacks.get(t.value) || 0;
			if (
				(this._stacks.set(t.value, r + 1),
				(this._warnCountdown -= 1),
				this._warnCountdown <= 0)
			) {
				this._warnCountdown = i * 0.5;
				const [s, o] = this.getMostFrequentStack(),
					l = `[${this.name}] potential listener LEAK detected, having ${n} listeners already. MOST frequent listener (${o}):`;
				console.warn(l), console.warn(s);
				const a = new Ba(l, s);
				this._errorHandler(a);
			}
			return () => {
				const s = this._stacks.get(t.value) || 0;
				this._stacks.set(t.value, s - 1);
			};
		}
		getMostFrequentStack() {
			if (!this._stacks) return;
			let t,
				n = 0;
			for (const [i, r] of this._stacks)
				(!t || n < r) && ((t = [i, r]), (n = r));
			return t;
		}
	}
	class cn {
		static create() {
			const t = new Error();
			return new cn(t.stack ?? "");
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
	class Ba extends Error {
		constructor(t, n) {
			super(t), (this.name = "ListenerLeakError"), (this.stack = n);
		}
	}
	class qa extends Error {
		constructor(t, n) {
			super(t), (this.name = "ListenerRefusalError"), (this.stack = n);
		}
	}
	class hn {
		constructor(t) {
			this.value = t;
		}
	}
	const Oa = 2;
	class we {
		constructor(t) {
			(this._size = 0),
				(this._options = t),
				(this._leakageMon = this._options?.leakWarningThreshold
					? new un(
							t?.onListenerError ?? kt,
							this._options?.leakWarningThreshold ?? Pa,
						)
					: void 0),
				(this._perfMon = this._options?._profName
					? new Et(this._options._profName)
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
				(this._event ??= (t, n, i) => {
					if (
						this._leakageMon &&
						this._size > this._leakageMon.threshold ** 2
					) {
						const l = `[${this._leakageMon.name}] REFUSES to accept new listeners because it exceeded its threshold by far (${this._size} vs ${this._leakageMon.threshold})`;
						console.warn(l);
						const a = this._leakageMon.getMostFrequentStack() ?? [
								"UNKNOWN stack",
								-1,
							],
							u = new qa(
								`${l}. HINT: Stack shows most frequent listener (${a[1]}-times)`,
								a[0],
							);
						return (
							(this._options?.onListenerError || kt)(u), Lt.None
						);
					}
					if (this._disposed) return Lt.None;
					n && (t = t.bind(n));
					const r = new hn(t);
					let s;
					this._leakageMon &&
						this._size >=
							Math.ceil(this._leakageMon.threshold * 0.2) &&
						((r.stack = cn.create()),
						(s = this._leakageMon.check(r.stack, this._size + 1))),
						this._listeners
							? this._listeners instanceof hn
								? ((this._deliveryQueue ??= new Va()),
									(this._listeners = [this._listeners, r]))
								: this._listeners.push(r)
							: (this._options?.onWillAddFirstListener?.(this),
								(this._listeners = r),
								this._options?.onDidAddFirstListener?.(this)),
						this._size++;
					const o = St(() => {
						s?.(), this._removeListener(r);
					});
					return (
						i instanceof ut
							? i.add(o)
							: Array.isArray(i) && i.push(o),
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
				i = n.indexOf(t);
			if (i === -1)
				throw (
					(console.log("disposed?", this._disposed),
					console.log("size?", this._size),
					console.log("arr?", JSON.stringify(this._listeners)),
					new Error("Attempted to dispose unknown listener"))
				);
			this._size--, (n[i] = void 0);
			const r = this._deliveryQueue.current === this;
			if (this._size * Oa <= n.length) {
				let s = 0;
				for (let o = 0; o < n.length; o++)
					n[o]
						? (n[s++] = n[o])
						: r &&
							(this._deliveryQueue.end--,
							s < this._deliveryQueue.i &&
								this._deliveryQueue.i--);
				n.length = s;
			}
		}
		_deliver(t, n) {
			if (!t) return;
			const i = this._options?.onListenerError || kt;
			if (!i) {
				t.value(n);
				return;
			}
			try {
				t.value(n);
			} catch (r) {
				i(r);
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
				if (this._listeners instanceof hn)
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
	class Va {
		constructor() {
			(this.i = -1), (this.end = 0);
		}
		enqueue(t, n, i) {
			(this.i = 0), (this.end = i), (this.current = t), (this.value = n);
		}
		reset() {
			(this.i = this.end), (this.current = void 0), (this.value = void 0);
		}
	}
	function ja(e) {
		return typeof e == "string";
	}
	function Ga(e) {
		let t = [];
		for (; Object.prototype !== e; )
			(t = t.concat(Object.getOwnPropertyNames(e))),
				(e = Object.getPrototypeOf(e));
		return t;
	}
	function dn(e) {
		const t = [];
		for (const n of Ga(e)) typeof e[n] == "function" && t.push(n);
		return t;
	}
	function $a(e, t) {
		const n = (r) =>
				function () {
					const s = Array.prototype.slice.call(arguments, 0);
					return t(r, s);
				},
			i = {};
		for (const r of e) i[r] = n(r);
		return i;
	}
	const Xe = "en";
	let mn = !1,
		fn = !1,
		pn = !1,
		Rt,
		gn = Xe,
		fi = Xe,
		Xa,
		Ce;
	const Oe = globalThis;
	let me;
	typeof Oe.vscode < "u" && typeof Oe.vscode.process < "u"
		? (me = Oe.vscode.process)
		: typeof process < "u" &&
			typeof process?.versions?.node == "string" &&
			(me = process);
	const Ja =
		typeof me?.versions?.electron == "string" && me?.type === "renderer";
	if (typeof me == "object") {
		(mn = me.platform === "win32"),
			(fn = me.platform === "darwin"),
			(pn = me.platform === "linux"),
			pn && me.env.SNAP && me.env.SNAP_REVISION,
			me.env.CI || me.env.BUILD_ARTIFACTSTAGINGDIRECTORY,
			(Rt = Xe),
			(gn = Xe);
		const e = me.env.VSCODE_NLS_CONFIG;
		if (e)
			try {
				const t = JSON.parse(e);
				(Rt = t.userLocale),
					(fi = t.osLocale),
					(gn = t.resolvedLanguage || Xe),
					(Xa = t.languagePack?.translationsConfigFile);
			} catch {}
	} else
		typeof navigator == "object" && !Ja
			? ((Ce = navigator.userAgent),
				(mn = Ce.indexOf("Windows") >= 0),
				(fn = Ce.indexOf("Macintosh") >= 0),
				(Ce.indexOf("Macintosh") >= 0 ||
					Ce.indexOf("iPad") >= 0 ||
					Ce.indexOf("iPhone") >= 0) &&
					navigator.maxTouchPoints &&
					navigator.maxTouchPoints > 0,
				(pn = Ce.indexOf("Linux") >= 0),
				Ce?.indexOf("Mobi") >= 0,
				(gn = globalThis._VSCODE_NLS_LANGUAGE || Xe),
				(Rt = navigator.language.toLowerCase()),
				(fi = Rt))
			: console.error("Unable to resolve platform.");
	const ct = mn,
		Ya = fn,
		Ae = Ce,
		Qa = typeof Oe.postMessage == "function" && !Oe.importScripts;
	(() => {
		if (Qa) {
			const e = [];
			Oe.addEventListener("message", (n) => {
				if (n.data && n.data.vscodeScheduleAsyncWork)
					for (let i = 0, r = e.length; i < r; i++) {
						const s = e[i];
						if (s.id === n.data.vscodeScheduleAsyncWork) {
							e.splice(i, 1), s.callback();
							return;
						}
					}
			});
			let t = 0;
			return (n) => {
				const i = ++t;
				e.push({ id: i, callback: n }),
					Oe.postMessage({ vscodeScheduleAsyncWork: i }, "*");
			};
		}
		return (e) => setTimeout(e);
	})();
	const Za = !!(Ae && Ae.indexOf("Chrome") >= 0);
	Ae && Ae.indexOf("Firefox") >= 0,
		!Za && Ae && Ae.indexOf("Safari") >= 0,
		Ae && Ae.indexOf("Edg/") >= 0,
		Ae && Ae.indexOf("Android") >= 0;
	function Ka(e) {
		return e;
	}
	class eo {
		constructor(t, n) {
			(this.lastCache = void 0),
				(this.lastArgKey = void 0),
				typeof t == "function"
					? ((this._fn = t), (this._computeKey = Ka))
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
	class pi {
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
	function to(e) {
		return e.replace(/[\\\{\}\*\+\?\|\^\$\.\[\]\(\)]/g, "\\$&");
	}
	function no(e) {
		return e.split(/\r\n|\r|\n/);
	}
	function io(e) {
		for (let t = 0, n = e.length; t < n; t++) {
			const i = e.charCodeAt(t);
			if (i !== 32 && i !== 9) return t;
		}
		return -1;
	}
	function ro(e, t = e.length - 1) {
		for (let n = t; n >= 0; n--) {
			const i = e.charCodeAt(n);
			if (i !== 32 && i !== 9) return n;
		}
		return -1;
	}
	function gi(e) {
		return e >= 65 && e <= 90;
	}
	function Mt(e) {
		return 55296 <= e && e <= 56319;
	}
	function bn(e) {
		return 56320 <= e && e <= 57343;
	}
	function bi(e, t) {
		return ((e - 55296) << 10) + (t - 56320) + 65536;
	}
	function so(e, t, n) {
		const i = e.charCodeAt(n);
		if (Mt(i) && n + 1 < t) {
			const r = e.charCodeAt(n + 1);
			if (bn(r)) return bi(i, r);
		}
		return i;
	}
	const ao = /^[\t\n\r\x20-\x7E]*$/;
	function oo(e) {
		return ao.test(e);
	}
	class Ne {
		static {
			this.ambiguousCharacterData = new pi(() =>
				JSON.parse(
					'{"_common":[8232,32,8233,32,5760,32,8192,32,8193,32,8194,32,8195,32,8196,32,8197,32,8198,32,8200,32,8201,32,8202,32,8287,32,8199,32,8239,32,2042,95,65101,95,65102,95,65103,95,8208,45,8209,45,8210,45,65112,45,1748,45,8259,45,727,45,8722,45,10134,45,11450,45,1549,44,1643,44,8218,44,184,44,42233,44,894,59,2307,58,2691,58,1417,58,1795,58,1796,58,5868,58,65072,58,6147,58,6153,58,8282,58,1475,58,760,58,42889,58,8758,58,720,58,42237,58,451,33,11601,33,660,63,577,63,2429,63,5038,63,42731,63,119149,46,8228,46,1793,46,1794,46,42510,46,68176,46,1632,46,1776,46,42232,46,1373,96,65287,96,8219,96,8242,96,1370,96,1523,96,8175,96,65344,96,900,96,8189,96,8125,96,8127,96,8190,96,697,96,884,96,712,96,714,96,715,96,756,96,699,96,701,96,700,96,702,96,42892,96,1497,96,2036,96,2037,96,5194,96,5836,96,94033,96,94034,96,65339,91,10088,40,10098,40,12308,40,64830,40,65341,93,10089,41,10099,41,12309,41,64831,41,10100,123,119060,123,10101,125,65342,94,8270,42,1645,42,8727,42,66335,42,5941,47,8257,47,8725,47,8260,47,9585,47,10187,47,10744,47,119354,47,12755,47,12339,47,11462,47,20031,47,12035,47,65340,92,65128,92,8726,92,10189,92,10741,92,10745,92,119311,92,119355,92,12756,92,20022,92,12034,92,42872,38,708,94,710,94,5869,43,10133,43,66203,43,8249,60,10094,60,706,60,119350,60,5176,60,5810,60,5120,61,11840,61,12448,61,42239,61,8250,62,10095,62,707,62,119351,62,5171,62,94015,62,8275,126,732,126,8128,126,8764,126,65372,124,65293,45,120784,50,120794,50,120804,50,120814,50,120824,50,130034,50,42842,50,423,50,1000,50,42564,50,5311,50,42735,50,119302,51,120785,51,120795,51,120805,51,120815,51,120825,51,130035,51,42923,51,540,51,439,51,42858,51,11468,51,1248,51,94011,51,71882,51,120786,52,120796,52,120806,52,120816,52,120826,52,130036,52,5070,52,71855,52,120787,53,120797,53,120807,53,120817,53,120827,53,130037,53,444,53,71867,53,120788,54,120798,54,120808,54,120818,54,120828,54,130038,54,11474,54,5102,54,71893,54,119314,55,120789,55,120799,55,120809,55,120819,55,120829,55,130039,55,66770,55,71878,55,2819,56,2538,56,2666,56,125131,56,120790,56,120800,56,120810,56,120820,56,120830,56,130040,56,547,56,546,56,66330,56,2663,57,2920,57,2541,57,3437,57,120791,57,120801,57,120811,57,120821,57,120831,57,130041,57,42862,57,11466,57,71884,57,71852,57,71894,57,9082,97,65345,97,119834,97,119886,97,119938,97,119990,97,120042,97,120094,97,120146,97,120198,97,120250,97,120302,97,120354,97,120406,97,120458,97,593,97,945,97,120514,97,120572,97,120630,97,120688,97,120746,97,65313,65,119808,65,119860,65,119912,65,119964,65,120016,65,120068,65,120120,65,120172,65,120224,65,120276,65,120328,65,120380,65,120432,65,913,65,120488,65,120546,65,120604,65,120662,65,120720,65,5034,65,5573,65,42222,65,94016,65,66208,65,119835,98,119887,98,119939,98,119991,98,120043,98,120095,98,120147,98,120199,98,120251,98,120303,98,120355,98,120407,98,120459,98,388,98,5071,98,5234,98,5551,98,65314,66,8492,66,119809,66,119861,66,119913,66,120017,66,120069,66,120121,66,120173,66,120225,66,120277,66,120329,66,120381,66,120433,66,42932,66,914,66,120489,66,120547,66,120605,66,120663,66,120721,66,5108,66,5623,66,42192,66,66178,66,66209,66,66305,66,65347,99,8573,99,119836,99,119888,99,119940,99,119992,99,120044,99,120096,99,120148,99,120200,99,120252,99,120304,99,120356,99,120408,99,120460,99,7428,99,1010,99,11429,99,43951,99,66621,99,128844,67,71922,67,71913,67,65315,67,8557,67,8450,67,8493,67,119810,67,119862,67,119914,67,119966,67,120018,67,120174,67,120226,67,120278,67,120330,67,120382,67,120434,67,1017,67,11428,67,5087,67,42202,67,66210,67,66306,67,66581,67,66844,67,8574,100,8518,100,119837,100,119889,100,119941,100,119993,100,120045,100,120097,100,120149,100,120201,100,120253,100,120305,100,120357,100,120409,100,120461,100,1281,100,5095,100,5231,100,42194,100,8558,68,8517,68,119811,68,119863,68,119915,68,119967,68,120019,68,120071,68,120123,68,120175,68,120227,68,120279,68,120331,68,120383,68,120435,68,5024,68,5598,68,5610,68,42195,68,8494,101,65349,101,8495,101,8519,101,119838,101,119890,101,119942,101,120046,101,120098,101,120150,101,120202,101,120254,101,120306,101,120358,101,120410,101,120462,101,43826,101,1213,101,8959,69,65317,69,8496,69,119812,69,119864,69,119916,69,120020,69,120072,69,120124,69,120176,69,120228,69,120280,69,120332,69,120384,69,120436,69,917,69,120492,69,120550,69,120608,69,120666,69,120724,69,11577,69,5036,69,42224,69,71846,69,71854,69,66182,69,119839,102,119891,102,119943,102,119995,102,120047,102,120099,102,120151,102,120203,102,120255,102,120307,102,120359,102,120411,102,120463,102,43829,102,42905,102,383,102,7837,102,1412,102,119315,70,8497,70,119813,70,119865,70,119917,70,120021,70,120073,70,120125,70,120177,70,120229,70,120281,70,120333,70,120385,70,120437,70,42904,70,988,70,120778,70,5556,70,42205,70,71874,70,71842,70,66183,70,66213,70,66853,70,65351,103,8458,103,119840,103,119892,103,119944,103,120048,103,120100,103,120152,103,120204,103,120256,103,120308,103,120360,103,120412,103,120464,103,609,103,7555,103,397,103,1409,103,119814,71,119866,71,119918,71,119970,71,120022,71,120074,71,120126,71,120178,71,120230,71,120282,71,120334,71,120386,71,120438,71,1292,71,5056,71,5107,71,42198,71,65352,104,8462,104,119841,104,119945,104,119997,104,120049,104,120101,104,120153,104,120205,104,120257,104,120309,104,120361,104,120413,104,120465,104,1211,104,1392,104,5058,104,65320,72,8459,72,8460,72,8461,72,119815,72,119867,72,119919,72,120023,72,120179,72,120231,72,120283,72,120335,72,120387,72,120439,72,919,72,120494,72,120552,72,120610,72,120668,72,120726,72,11406,72,5051,72,5500,72,42215,72,66255,72,731,105,9075,105,65353,105,8560,105,8505,105,8520,105,119842,105,119894,105,119946,105,119998,105,120050,105,120102,105,120154,105,120206,105,120258,105,120310,105,120362,105,120414,105,120466,105,120484,105,618,105,617,105,953,105,8126,105,890,105,120522,105,120580,105,120638,105,120696,105,120754,105,1110,105,42567,105,1231,105,43893,105,5029,105,71875,105,65354,106,8521,106,119843,106,119895,106,119947,106,119999,106,120051,106,120103,106,120155,106,120207,106,120259,106,120311,106,120363,106,120415,106,120467,106,1011,106,1112,106,65322,74,119817,74,119869,74,119921,74,119973,74,120025,74,120077,74,120129,74,120181,74,120233,74,120285,74,120337,74,120389,74,120441,74,42930,74,895,74,1032,74,5035,74,5261,74,42201,74,119844,107,119896,107,119948,107,120000,107,120052,107,120104,107,120156,107,120208,107,120260,107,120312,107,120364,107,120416,107,120468,107,8490,75,65323,75,119818,75,119870,75,119922,75,119974,75,120026,75,120078,75,120130,75,120182,75,120234,75,120286,75,120338,75,120390,75,120442,75,922,75,120497,75,120555,75,120613,75,120671,75,120729,75,11412,75,5094,75,5845,75,42199,75,66840,75,1472,108,8739,73,9213,73,65512,73,1633,108,1777,73,66336,108,125127,108,120783,73,120793,73,120803,73,120813,73,120823,73,130033,73,65321,73,8544,73,8464,73,8465,73,119816,73,119868,73,119920,73,120024,73,120128,73,120180,73,120232,73,120284,73,120336,73,120388,73,120440,73,65356,108,8572,73,8467,108,119845,108,119897,108,119949,108,120001,108,120053,108,120105,73,120157,73,120209,73,120261,73,120313,73,120365,73,120417,73,120469,73,448,73,120496,73,120554,73,120612,73,120670,73,120728,73,11410,73,1030,73,1216,73,1493,108,1503,108,1575,108,126464,108,126592,108,65166,108,65165,108,1994,108,11599,73,5825,73,42226,73,93992,73,66186,124,66313,124,119338,76,8556,76,8466,76,119819,76,119871,76,119923,76,120027,76,120079,76,120131,76,120183,76,120235,76,120287,76,120339,76,120391,76,120443,76,11472,76,5086,76,5290,76,42209,76,93974,76,71843,76,71858,76,66587,76,66854,76,65325,77,8559,77,8499,77,119820,77,119872,77,119924,77,120028,77,120080,77,120132,77,120184,77,120236,77,120288,77,120340,77,120392,77,120444,77,924,77,120499,77,120557,77,120615,77,120673,77,120731,77,1018,77,11416,77,5047,77,5616,77,5846,77,42207,77,66224,77,66321,77,119847,110,119899,110,119951,110,120003,110,120055,110,120107,110,120159,110,120211,110,120263,110,120315,110,120367,110,120419,110,120471,110,1400,110,1404,110,65326,78,8469,78,119821,78,119873,78,119925,78,119977,78,120029,78,120081,78,120185,78,120237,78,120289,78,120341,78,120393,78,120445,78,925,78,120500,78,120558,78,120616,78,120674,78,120732,78,11418,78,42208,78,66835,78,3074,111,3202,111,3330,111,3458,111,2406,111,2662,111,2790,111,3046,111,3174,111,3302,111,3430,111,3664,111,3792,111,4160,111,1637,111,1781,111,65359,111,8500,111,119848,111,119900,111,119952,111,120056,111,120108,111,120160,111,120212,111,120264,111,120316,111,120368,111,120420,111,120472,111,7439,111,7441,111,43837,111,959,111,120528,111,120586,111,120644,111,120702,111,120760,111,963,111,120532,111,120590,111,120648,111,120706,111,120764,111,11423,111,4351,111,1413,111,1505,111,1607,111,126500,111,126564,111,126596,111,65259,111,65260,111,65258,111,65257,111,1726,111,64428,111,64429,111,64427,111,64426,111,1729,111,64424,111,64425,111,64423,111,64422,111,1749,111,3360,111,4125,111,66794,111,71880,111,71895,111,66604,111,1984,79,2534,79,2918,79,12295,79,70864,79,71904,79,120782,79,120792,79,120802,79,120812,79,120822,79,130032,79,65327,79,119822,79,119874,79,119926,79,119978,79,120030,79,120082,79,120134,79,120186,79,120238,79,120290,79,120342,79,120394,79,120446,79,927,79,120502,79,120560,79,120618,79,120676,79,120734,79,11422,79,1365,79,11604,79,4816,79,2848,79,66754,79,42227,79,71861,79,66194,79,66219,79,66564,79,66838,79,9076,112,65360,112,119849,112,119901,112,119953,112,120005,112,120057,112,120109,112,120161,112,120213,112,120265,112,120317,112,120369,112,120421,112,120473,112,961,112,120530,112,120544,112,120588,112,120602,112,120646,112,120660,112,120704,112,120718,112,120762,112,120776,112,11427,112,65328,80,8473,80,119823,80,119875,80,119927,80,119979,80,120031,80,120083,80,120187,80,120239,80,120291,80,120343,80,120395,80,120447,80,929,80,120504,80,120562,80,120620,80,120678,80,120736,80,11426,80,5090,80,5229,80,42193,80,66197,80,119850,113,119902,113,119954,113,120006,113,120058,113,120110,113,120162,113,120214,113,120266,113,120318,113,120370,113,120422,113,120474,113,1307,113,1379,113,1382,113,8474,81,119824,81,119876,81,119928,81,119980,81,120032,81,120084,81,120188,81,120240,81,120292,81,120344,81,120396,81,120448,81,11605,81,119851,114,119903,114,119955,114,120007,114,120059,114,120111,114,120163,114,120215,114,120267,114,120319,114,120371,114,120423,114,120475,114,43847,114,43848,114,7462,114,11397,114,43905,114,119318,82,8475,82,8476,82,8477,82,119825,82,119877,82,119929,82,120033,82,120189,82,120241,82,120293,82,120345,82,120397,82,120449,82,422,82,5025,82,5074,82,66740,82,5511,82,42211,82,94005,82,65363,115,119852,115,119904,115,119956,115,120008,115,120060,115,120112,115,120164,115,120216,115,120268,115,120320,115,120372,115,120424,115,120476,115,42801,115,445,115,1109,115,43946,115,71873,115,66632,115,65331,83,119826,83,119878,83,119930,83,119982,83,120034,83,120086,83,120138,83,120190,83,120242,83,120294,83,120346,83,120398,83,120450,83,1029,83,1359,83,5077,83,5082,83,42210,83,94010,83,66198,83,66592,83,119853,116,119905,116,119957,116,120009,116,120061,116,120113,116,120165,116,120217,116,120269,116,120321,116,120373,116,120425,116,120477,116,8868,84,10201,84,128872,84,65332,84,119827,84,119879,84,119931,84,119983,84,120035,84,120087,84,120139,84,120191,84,120243,84,120295,84,120347,84,120399,84,120451,84,932,84,120507,84,120565,84,120623,84,120681,84,120739,84,11430,84,5026,84,42196,84,93962,84,71868,84,66199,84,66225,84,66325,84,119854,117,119906,117,119958,117,120010,117,120062,117,120114,117,120166,117,120218,117,120270,117,120322,117,120374,117,120426,117,120478,117,42911,117,7452,117,43854,117,43858,117,651,117,965,117,120534,117,120592,117,120650,117,120708,117,120766,117,1405,117,66806,117,71896,117,8746,85,8899,85,119828,85,119880,85,119932,85,119984,85,120036,85,120088,85,120140,85,120192,85,120244,85,120296,85,120348,85,120400,85,120452,85,1357,85,4608,85,66766,85,5196,85,42228,85,94018,85,71864,85,8744,118,8897,118,65366,118,8564,118,119855,118,119907,118,119959,118,120011,118,120063,118,120115,118,120167,118,120219,118,120271,118,120323,118,120375,118,120427,118,120479,118,7456,118,957,118,120526,118,120584,118,120642,118,120700,118,120758,118,1141,118,1496,118,71430,118,43945,118,71872,118,119309,86,1639,86,1783,86,8548,86,119829,86,119881,86,119933,86,119985,86,120037,86,120089,86,120141,86,120193,86,120245,86,120297,86,120349,86,120401,86,120453,86,1140,86,11576,86,5081,86,5167,86,42719,86,42214,86,93960,86,71840,86,66845,86,623,119,119856,119,119908,119,119960,119,120012,119,120064,119,120116,119,120168,119,120220,119,120272,119,120324,119,120376,119,120428,119,120480,119,7457,119,1121,119,1309,119,1377,119,71434,119,71438,119,71439,119,43907,119,71919,87,71910,87,119830,87,119882,87,119934,87,119986,87,120038,87,120090,87,120142,87,120194,87,120246,87,120298,87,120350,87,120402,87,120454,87,1308,87,5043,87,5076,87,42218,87,5742,120,10539,120,10540,120,10799,120,65368,120,8569,120,119857,120,119909,120,119961,120,120013,120,120065,120,120117,120,120169,120,120221,120,120273,120,120325,120,120377,120,120429,120,120481,120,5441,120,5501,120,5741,88,9587,88,66338,88,71916,88,65336,88,8553,88,119831,88,119883,88,119935,88,119987,88,120039,88,120091,88,120143,88,120195,88,120247,88,120299,88,120351,88,120403,88,120455,88,42931,88,935,88,120510,88,120568,88,120626,88,120684,88,120742,88,11436,88,11613,88,5815,88,42219,88,66192,88,66228,88,66327,88,66855,88,611,121,7564,121,65369,121,119858,121,119910,121,119962,121,120014,121,120066,121,120118,121,120170,121,120222,121,120274,121,120326,121,120378,121,120430,121,120482,121,655,121,7935,121,43866,121,947,121,8509,121,120516,121,120574,121,120632,121,120690,121,120748,121,1199,121,4327,121,71900,121,65337,89,119832,89,119884,89,119936,89,119988,89,120040,89,120092,89,120144,89,120196,89,120248,89,120300,89,120352,89,120404,89,120456,89,933,89,978,89,120508,89,120566,89,120624,89,120682,89,120740,89,11432,89,1198,89,5033,89,5053,89,42220,89,94019,89,71844,89,66226,89,119859,122,119911,122,119963,122,120015,122,120067,122,120119,122,120171,122,120223,122,120275,122,120327,122,120379,122,120431,122,120483,122,7458,122,43923,122,71876,122,66293,90,71909,90,65338,90,8484,90,8488,90,119833,90,119885,90,119937,90,119989,90,120041,90,120197,90,120249,90,120301,90,120353,90,120405,90,120457,90,918,90,120493,90,120551,90,120609,90,120667,90,120725,90,5059,90,42204,90,71849,90,65282,34,65284,36,65285,37,65286,38,65290,42,65291,43,65294,46,65295,47,65296,48,65297,49,65298,50,65299,51,65300,52,65301,53,65302,54,65303,55,65304,56,65305,57,65308,60,65309,61,65310,62,65312,64,65316,68,65318,70,65319,71,65324,76,65329,81,65330,82,65333,85,65334,86,65335,87,65343,95,65346,98,65348,100,65350,102,65355,107,65357,109,65358,110,65361,113,65362,114,65364,116,65365,117,65367,119,65370,122,65371,123,65373,125,119846,109],"_default":[160,32,8211,45,65374,126,65306,58,65281,33,8216,96,8217,96,8245,96,180,96,12494,47,1047,51,1073,54,1072,97,1040,65,1068,98,1042,66,1089,99,1057,67,1077,101,1045,69,1053,72,305,105,1050,75,921,73,1052,77,1086,111,1054,79,1009,112,1088,112,1056,80,1075,114,1058,84,215,120,1093,120,1061,88,1091,121,1059,89,65283,35,65288,40,65289,41,65292,44,65307,59,65311,63],"cs":[65374,126,65306,58,65281,33,8216,96,8217,96,8245,96,180,96,12494,47,1047,51,1073,54,1072,97,1040,65,1068,98,1042,66,1089,99,1057,67,1077,101,1045,69,1053,72,305,105,1050,75,921,73,1052,77,1086,111,1054,79,1009,112,1088,112,1056,80,1075,114,1058,84,1093,120,1061,88,1091,121,1059,89,65283,35,65288,40,65289,41,65292,44,65307,59,65311,63],"de":[65374,126,65306,58,65281,33,8216,96,8217,96,8245,96,180,96,12494,47,1047,51,1073,54,1072,97,1040,65,1068,98,1042,66,1089,99,1057,67,1077,101,1045,69,1053,72,305,105,1050,75,921,73,1052,77,1086,111,1054,79,1009,112,1088,112,1056,80,1075,114,1058,84,1093,120,1061,88,1091,121,1059,89,65283,35,65288,40,65289,41,65292,44,65307,59,65311,63],"es":[8211,45,65374,126,65306,58,65281,33,8245,96,180,96,12494,47,1047,51,1073,54,1072,97,1040,65,1068,98,1042,66,1089,99,1057,67,1077,101,1045,69,1053,72,305,105,1050,75,1052,77,1086,111,1054,79,1009,112,1088,112,1056,80,1075,114,1058,84,215,120,1093,120,1061,88,1091,121,1059,89,65283,35,65288,40,65289,41,65292,44,65307,59,65311,63],"fr":[65374,126,65306,58,65281,33,8216,96,8245,96,12494,47,1047,51,1073,54,1072,97,1040,65,1068,98,1042,66,1089,99,1057,67,1077,101,1045,69,1053,72,305,105,1050,75,921,73,1052,77,1086,111,1054,79,1009,112,1088,112,1056,80,1075,114,1058,84,215,120,1093,120,1061,88,1091,121,1059,89,65283,35,65288,40,65289,41,65292,44,65307,59,65311,63],"it":[160,32,8211,45,65374,126,65306,58,65281,33,8216,96,8245,96,180,96,12494,47,1047,51,1073,54,1072,97,1040,65,1068,98,1042,66,1089,99,1057,67,1077,101,1045,69,1053,72,305,105,1050,75,921,73,1052,77,1086,111,1054,79,1009,112,1088,112,1056,80,1075,114,1058,84,215,120,1093,120,1061,88,1091,121,1059,89,65283,35,65288,40,65289,41,65292,44,65307,59,65311,63],"ja":[8211,45,65306,58,65281,33,8216,96,8217,96,8245,96,180,96,1047,51,1073,54,1072,97,1040,65,1068,98,1042,66,1089,99,1057,67,1077,101,1045,69,1053,72,305,105,1050,75,921,73,1052,77,1086,111,1054,79,1009,112,1088,112,1056,80,1075,114,1058,84,215,120,1093,120,1061,88,1091,121,1059,89,65283,35,65292,44,65307,59],"ko":[8211,45,65374,126,65306,58,65281,33,8245,96,180,96,12494,47,1047,51,1073,54,1072,97,1040,65,1068,98,1042,66,1089,99,1057,67,1077,101,1045,69,1053,72,305,105,1050,75,921,73,1052,77,1086,111,1054,79,1009,112,1088,112,1056,80,1075,114,1058,84,215,120,1093,120,1061,88,1091,121,1059,89,65283,35,65288,40,65289,41,65292,44,65307,59,65311,63],"pl":[65374,126,65306,58,65281,33,8216,96,8217,96,8245,96,180,96,12494,47,1047,51,1073,54,1072,97,1040,65,1068,98,1042,66,1089,99,1057,67,1077,101,1045,69,1053,72,305,105,1050,75,921,73,1052,77,1086,111,1054,79,1009,112,1088,112,1056,80,1075,114,1058,84,215,120,1093,120,1061,88,1091,121,1059,89,65283,35,65288,40,65289,41,65292,44,65307,59,65311,63],"pt-BR":[65374,126,65306,58,65281,33,8216,96,8217,96,8245,96,180,96,12494,47,1047,51,1073,54,1072,97,1040,65,1068,98,1042,66,1089,99,1057,67,1077,101,1045,69,1053,72,305,105,1050,75,921,73,1052,77,1086,111,1054,79,1009,112,1088,112,1056,80,1075,114,1058,84,215,120,1093,120,1061,88,1091,121,1059,89,65283,35,65288,40,65289,41,65292,44,65307,59,65311,63],"qps-ploc":[160,32,8211,45,65374,126,65306,58,65281,33,8216,96,8217,96,8245,96,180,96,12494,47,1047,51,1073,54,1072,97,1040,65,1068,98,1042,66,1089,99,1057,67,1077,101,1045,69,1053,72,305,105,1050,75,921,73,1052,77,1086,111,1054,79,1088,112,1056,80,1075,114,1058,84,215,120,1093,120,1061,88,1091,121,1059,89,65283,35,65288,40,65289,41,65292,44,65307,59,65311,63],"ru":[65374,126,65306,58,65281,33,8216,96,8217,96,8245,96,180,96,12494,47,305,105,921,73,1009,112,215,120,65283,35,65288,40,65289,41,65292,44,65307,59,65311,63],"tr":[160,32,8211,45,65374,126,65306,58,65281,33,8245,96,180,96,12494,47,1047,51,1073,54,1072,97,1040,65,1068,98,1042,66,1089,99,1057,67,1077,101,1045,69,1053,72,1050,75,921,73,1052,77,1086,111,1054,79,1009,112,1088,112,1056,80,1075,114,1058,84,215,120,1093,120,1061,88,1091,121,1059,89,65283,35,65288,40,65289,41,65292,44,65307,59,65311,63],"zh-hans":[65374,126,65306,58,65281,33,8245,96,180,96,12494,47,1047,51,1073,54,1072,97,1040,65,1068,98,1042,66,1089,99,1057,67,1077,101,1045,69,1053,72,305,105,1050,75,921,73,1052,77,1086,111,1054,79,1009,112,1088,112,1056,80,1075,114,1058,84,215,120,1093,120,1061,88,1091,121,1059,89,65288,40,65289,41],"zh-hant":[8211,45,65374,126,180,96,12494,47,1047,51,1073,54,1072,97,1040,65,1068,98,1042,66,1089,99,1057,67,1077,101,1045,69,1053,72,305,105,1050,75,921,73,1052,77,1086,111,1054,79,1009,112,1088,112,1056,80,1075,114,1058,84,215,120,1093,120,1061,88,1091,121,1059,89,65283,35,65307,59]}',
				),
			);
		}
		static {
			this.cache = new eo({ getCacheKey: JSON.stringify }, (t) => {
				function n(c) {
					const d = new Map();
					for (let m = 0; m < c.length; m += 2) d.set(c[m], c[m + 1]);
					return d;
				}
				function i(c, d) {
					const m = new Map(c);
					for (const [f, w] of d) m.set(f, w);
					return m;
				}
				function r(c, d) {
					if (!c) return d;
					const m = new Map();
					for (const [f, w] of c) d.has(f) && m.set(f, w);
					return m;
				}
				const s = this.ambiguousCharacterData.value;
				let o = t.filter((c) => !c.startsWith("_") && c in s);
				o.length === 0 && (o = ["_default"]);
				let l;
				for (const c of o) {
					const d = n(s[c]);
					l = r(l, d);
				}
				const a = n(s._common),
					u = i(a, l);
				return new Ne(u);
			});
		}
		static getInstance(t) {
			return Ne.cache.get(Array.from(t));
		}
		static {
			this._locales = new pi(() =>
				Object.keys(Ne.ambiguousCharacterData.value).filter(
					(t) => !t.startsWith("_"),
				),
			);
		}
		static getLocales() {
			return Ne._locales.value;
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
	class Ve {
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
				this._data || (this._data = new Set(Ve.getRawData())),
				this._data
			);
		}
		static isInvisibleCharacter(t) {
			return Ve.getData().has(t);
		}
		static get codePoints() {
			return Ve.getData();
		}
	}
	const lo = "$initialize";
	class uo {
		constructor(t, n, i, r) {
			(this.vsWorker = t),
				(this.req = n),
				(this.method = i),
				(this.args = r),
				(this.type = 0);
		}
	}
	class _i {
		constructor(t, n, i, r) {
			(this.vsWorker = t),
				(this.seq = n),
				(this.res = i),
				(this.err = r),
				(this.type = 1);
		}
	}
	class co {
		constructor(t, n, i, r) {
			(this.vsWorker = t),
				(this.req = n),
				(this.eventName = i),
				(this.arg = r),
				(this.type = 2);
		}
	}
	class ho {
		constructor(t, n, i) {
			(this.vsWorker = t),
				(this.req = n),
				(this.event = i),
				(this.type = 3);
		}
	}
	class mo {
		constructor(t, n) {
			(this.vsWorker = t), (this.req = n), (this.type = 4);
		}
	}
	class fo {
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
			const i = String(++this._lastSentReq);
			return new Promise((r, s) => {
				(this._pendingReplies[i] = { resolve: r, reject: s }),
					this._send(new uo(this._workerId, i, t, n));
			});
		}
		listen(t, n) {
			let i = null;
			const r = new we({
				onWillAddFirstListener: () => {
					(i = String(++this._lastSentReq)),
						this._pendingEmitters.set(i, r),
						this._send(new co(this._workerId, i, t, n));
				},
				onDidRemoveLastListener: () => {
					this._pendingEmitters.delete(i),
						this._send(new mo(this._workerId, i)),
						(i = null);
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
				let i = t.err;
				t.err.$isError &&
					((i = new Error()),
					(i.name = t.err.name),
					(i.message = t.err.message),
					(i.stack = t.err.stack)),
					n.reject(i);
				return;
			}
			n.resolve(t.res);
		}
		_handleRequestMessage(t) {
			const n = t.req;
			this._handler.handleMessage(t.method, t.args).then(
				(r) => {
					this._send(new _i(this._workerId, n, r, void 0));
				},
				(r) => {
					r.detail instanceof Error && (r.detail = di(r.detail)),
						this._send(new _i(this._workerId, n, void 0, di(r)));
				},
			);
		}
		_handleSubscribeEventMessage(t) {
			const n = t.req,
				i = this._handler.handleEvent(
					t.eventName,
					t.arg,
				)((r) => {
					this._send(new ho(this._workerId, n, r));
				});
			this._pendingEvents.set(n, i);
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
				for (let i = 0; i < t.args.length; i++)
					t.args[i] instanceof ArrayBuffer && n.push(t.args[i]);
			else t.type === 1 && t.res instanceof ArrayBuffer && n.push(t.res);
			this._handler.sendMessage(t, n);
		}
	}
	function wi(e) {
		return e[0] === "o" && e[1] === "n" && gi(e.charCodeAt(2));
	}
	function vi(e) {
		return /^onDynamic/.test(e) && gi(e.charCodeAt(9));
	}
	function po(e, t, n) {
		const i = (o) =>
				function () {
					const l = Array.prototype.slice.call(arguments, 0);
					return t(o, l);
				},
			r = (o) =>
				function (l) {
					return n(o, l);
				},
			s = {};
		for (const o of e) {
			if (vi(o)) {
				s[o] = r(o);
				continue;
			}
			if (wi(o)) {
				s[o] = n(o, void 0);
				continue;
			}
			s[o] = i(o);
		}
		return s;
	}
	class go {
		constructor(t, n) {
			(this._requestHandlerFactory = n),
				(this._requestHandler = null),
				(this._protocol = new fo({
					sendMessage: (i, r) => {
						t(i, r);
					},
					handleMessage: (i, r) => this._handleMessage(i, r),
					handleEvent: (i, r) => this._handleEvent(i, r),
				}));
		}
		onmessage(t) {
			this._protocol.handleMessage(t);
		}
		_handleMessage(t, n) {
			if (t === lo) return this.initialize(n[0], n[1], n[2], n[3]);
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
			} catch (i) {
				return Promise.reject(i);
			}
		}
		_handleEvent(t, n) {
			if (!this._requestHandler)
				throw new Error("Missing requestHandler");
			if (vi(t)) {
				const i = this._requestHandler[t].call(this._requestHandler, n);
				if (typeof i != "function")
					throw new Error(
						`Missing dynamic event ${t} on request handler.`,
					);
				return i;
			}
			if (wi(t)) {
				const i = this._requestHandler[t];
				if (typeof i != "function")
					throw new Error(`Missing event ${t} on request handler.`);
				return i;
			}
			throw new Error(`Malformed event name ${t}`);
		}
		initialize(t, n, i, r) {
			this._protocol.setWorkerId(t);
			const l = po(
				r,
				(a, u) => this._protocol.sendMessage(a, u),
				(a, u) => this._protocol.listen(a, u),
			);
			return this._requestHandlerFactory
				? ((this._requestHandler = this._requestHandlerFactory(l)),
					Promise.resolve(dn(this._requestHandler)))
				: (n &&
						(typeof n.baseUrl < "u" && delete n.baseUrl,
						typeof n.paths < "u" &&
							typeof n.paths.vs < "u" &&
							delete n.paths.vs,
						typeof n.trustedTypesPolicy < "u" &&
							delete n.trustedTypesPolicy,
						(n.catchError = !0),
						globalThis.require.config(n)),
					new Promise((a, u) => {
						const c = globalThis.require;
						c(
							[i],
							(d) => {
								if (
									((this._requestHandler = d.create(l)),
									!this._requestHandler)
								) {
									u(new Error("No RequestHandler!"));
									return;
								}
								a(dn(this._requestHandler));
							},
							u,
						);
					}));
		}
	}
	class De {
		constructor(t, n, i, r) {
			(this.originalStart = t),
				(this.originalLength = n),
				(this.modifiedStart = i),
				(this.modifiedLength = r);
		}
		getOriginalEnd() {
			return this.originalStart + this.originalLength;
		}
		getModifiedEnd() {
			return this.modifiedStart + this.modifiedLength;
		}
	}
	function yi(e, t) {
		return ((t << 5) - t + e) | 0;
	}
	function bo(e, t) {
		t = yi(149417, t);
		for (let n = 0, i = e.length; n < i; n++) t = yi(e.charCodeAt(n), t);
		return t;
	}
	function _n(e, t, n = 32) {
		const i = n - t,
			r = ~((1 << i) - 1);
		return ((e << t) | ((r & e) >>> i)) >>> 0;
	}
	function xi(e, t = 0, n = e.byteLength, i = 0) {
		for (let r = 0; r < n; r++) e[t + r] = i;
	}
	function _o(e, t, n = "0") {
		for (; e.length < t; ) e = n + e;
		return e;
	}
	function ht(e, t = 32) {
		return e instanceof ArrayBuffer
			? Array.from(new Uint8Array(e))
					.map((n) => n.toString(16).padStart(2, "0"))
					.join("")
			: _o((e >>> 0).toString(16), t / 4);
	}
	class Ti {
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
			const i = this._buff;
			let r = this._buffLen,
				s = this._leftoverHighSurrogate,
				o,
				l;
			for (
				s !== 0
					? ((o = s), (l = -1), (s = 0))
					: ((o = t.charCodeAt(0)), (l = 0));
				;
			) {
				let a = o;
				if (Mt(o))
					if (l + 1 < n) {
						const u = t.charCodeAt(l + 1);
						bn(u) ? (l++, (a = bi(o, u))) : (a = 65533);
					} else {
						s = o;
						break;
					}
				else bn(o) && (a = 65533);
				if (((r = this._push(i, r, a)), l++, l < n))
					o = t.charCodeAt(l);
				else break;
			}
			(this._buffLen = r), (this._leftoverHighSurrogate = s);
		}
		_push(t, n, i) {
			return (
				i < 128
					? (t[n++] = i)
					: i < 2048
						? ((t[n++] = 192 | ((i & 1984) >>> 6)),
							(t[n++] = 128 | ((i & 63) >>> 0)))
						: i < 65536
							? ((t[n++] = 224 | ((i & 61440) >>> 12)),
								(t[n++] = 128 | ((i & 4032) >>> 6)),
								(t[n++] = 128 | ((i & 63) >>> 0)))
							: ((t[n++] = 240 | ((i & 1835008) >>> 18)),
								(t[n++] = 128 | ((i & 258048) >>> 12)),
								(t[n++] = 128 | ((i & 4032) >>> 6)),
								(t[n++] = 128 | ((i & 63) >>> 0))),
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
				ht(this._h0) +
					ht(this._h1) +
					ht(this._h2) +
					ht(this._h3) +
					ht(this._h4)
			);
		}
		_wrapUp() {
			(this._buff[this._buffLen++] = 128),
				xi(this._buff, this._buffLen),
				this._buffLen > 56 && (this._step(), xi(this._buff));
			const t = 8 * this._totalLen;
			this._buffDV.setUint32(56, Math.floor(t / 4294967296), !1),
				this._buffDV.setUint32(60, t % 4294967296, !1),
				this._step();
		}
		_step() {
			const t = Ti._bigBlock32,
				n = this._buffDV;
			for (let d = 0; d < 64; d += 4)
				t.setUint32(d, n.getUint32(d, !1), !1);
			for (let d = 64; d < 320; d += 4)
				t.setUint32(
					d,
					_n(
						t.getUint32(d - 12, !1) ^
							t.getUint32(d - 32, !1) ^
							t.getUint32(d - 56, !1) ^
							t.getUint32(d - 64, !1),
						1,
					),
					!1,
				);
			let i = this._h0,
				r = this._h1,
				s = this._h2,
				o = this._h3,
				l = this._h4,
				a,
				u,
				c;
			for (let d = 0; d < 80; d++)
				d < 20
					? ((a = (r & s) | (~r & o)), (u = 1518500249))
					: d < 40
						? ((a = r ^ s ^ o), (u = 1859775393))
						: d < 60
							? ((a = (r & s) | (r & o) | (s & o)),
								(u = 2400959708))
							: ((a = r ^ s ^ o), (u = 3395469782)),
					(c =
						(_n(i, 5) + a + l + u + t.getUint32(d * 4, !1)) &
						4294967295),
					(l = o),
					(o = s),
					(s = _n(r, 30)),
					(r = i),
					(i = c);
			(this._h0 = (this._h0 + i) & 4294967295),
				(this._h1 = (this._h1 + r) & 4294967295),
				(this._h2 = (this._h2 + s) & 4294967295),
				(this._h3 = (this._h3 + o) & 4294967295),
				(this._h4 = (this._h4 + l) & 4294967295);
		}
	}
	class ki {
		constructor(t) {
			this.source = t;
		}
		getElements() {
			const t = this.source,
				n = new Int32Array(t.length);
			for (let i = 0, r = t.length; i < r; i++) n[i] = t.charCodeAt(i);
			return n;
		}
	}
	function wo(e, t, n) {
		return new Ie(new ki(e), new ki(t)).ComputeDiff(n).changes;
	}
	class Je {
		static Assert(t, n) {
			if (!t) throw new Error(n);
		}
	}
	class Ye {
		static Copy(t, n, i, r, s) {
			for (let o = 0; o < s; o++) i[r + o] = t[n + o];
		}
		static Copy2(t, n, i, r, s) {
			for (let o = 0; o < s; o++) i[r + o] = t[n + o];
		}
	}
	class Ai {
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
					new De(
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
	class Ie {
		constructor(t, n, i = null) {
			(this.ContinueProcessingPredicate = i),
				(this._originalSequence = t),
				(this._modifiedSequence = n);
			const [r, s, o] = Ie._getElements(t),
				[l, a, u] = Ie._getElements(n);
			(this._hasStrings = o && u),
				(this._originalStringElements = r),
				(this._originalElementsOrHash = s),
				(this._modifiedStringElements = l),
				(this._modifiedElementsOrHash = a),
				(this.m_forwardHistory = []),
				(this.m_reverseHistory = []);
		}
		static _isStringArray(t) {
			return t.length > 0 && typeof t[0] == "string";
		}
		static _getElements(t) {
			const n = t.getElements();
			if (Ie._isStringArray(n)) {
				const i = new Int32Array(n.length);
				for (let r = 0, s = n.length; r < s; r++) i[r] = bo(n[r], 0);
				return [n, i, !0];
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
			const i = Ie._getStrictElement(this._originalSequence, t),
				r = Ie._getStrictElement(this._modifiedSequence, n);
			return i === r;
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
		_ComputeDiff(t, n, i, r, s) {
			const o = [!1];
			let l = this.ComputeDiffRecursive(t, n, i, r, o);
			return (
				s && (l = this.PrettifyChanges(l)),
				{ quitEarly: o[0], changes: l }
			);
		}
		ComputeDiffRecursive(t, n, i, r, s) {
			for (s[0] = !1; t <= n && i <= r && this.ElementsAreEqual(t, i); )
				t++, i++;
			for (; n >= t && r >= i && this.ElementsAreEqual(n, r); ) n--, r--;
			if (t > n || i > r) {
				let d;
				return (
					i <= r
						? (Je.Assert(
								t === n + 1,
								"originalStart should only be one more than originalEnd",
							),
							(d = [new De(t, 0, i, r - i + 1)]))
						: t <= n
							? (Je.Assert(
									i === r + 1,
									"modifiedStart should only be one more than modifiedEnd",
								),
								(d = [new De(t, n - t + 1, i, 0)]))
							: (Je.Assert(
									t === n + 1,
									"originalStart should only be one more than originalEnd",
								),
								Je.Assert(
									i === r + 1,
									"modifiedStart should only be one more than modifiedEnd",
								),
								(d = [])),
					d
				);
			}
			const o = [0],
				l = [0],
				a = this.ComputeRecursionPoint(t, n, i, r, o, l, s),
				u = o[0],
				c = l[0];
			if (a !== null) return a;
			if (!s[0]) {
				const d = this.ComputeDiffRecursive(t, u, i, c, s);
				let m = [];
				return (
					s[0]
						? (m = [
								new De(
									u + 1,
									n - (u + 1) + 1,
									c + 1,
									r - (c + 1) + 1,
								),
							])
						: (m = this.ComputeDiffRecursive(
								u + 1,
								n,
								c + 1,
								r,
								s,
							)),
					this.ConcatenateChanges(d, m)
				);
			}
			return [new De(t, n - t + 1, i, r - i + 1)];
		}
		WALKTRACE(t, n, i, r, s, o, l, a, u, c, d, m, f, w, g, k, v, y) {
			let E = null,
				R = null,
				N = new Ai(),
				M = n,
				b = i,
				p = f[0] - k[0] - r,
				T = -1073741824,
				H = this.m_forwardHistory.length - 1;
			do {
				const L = p + t;
				L === M || (L < b && u[L - 1] < u[L + 1])
					? ((d = u[L + 1]),
						(w = d - p - r),
						d < T && N.MarkNextChange(),
						(T = d),
						N.AddModifiedElement(d + 1, w),
						(p = L + 1 - t))
					: ((d = u[L - 1] + 1),
						(w = d - p - r),
						d < T && N.MarkNextChange(),
						(T = d - 1),
						N.AddOriginalElement(d, w + 1),
						(p = L - 1 - t)),
					H >= 0 &&
						((u = this.m_forwardHistory[H]),
						(t = u[0]),
						(M = 1),
						(b = u.length - 1));
			} while (--H >= -1);
			if (((E = N.getReverseChanges()), y[0])) {
				let L = f[0] + 1,
					_ = k[0] + 1;
				if (E !== null && E.length > 0) {
					const A = E[E.length - 1];
					(L = Math.max(L, A.getOriginalEnd())),
						(_ = Math.max(_, A.getModifiedEnd()));
				}
				R = [new De(L, m - L + 1, _, g - _ + 1)];
			} else {
				(N = new Ai()),
					(M = o),
					(b = l),
					(p = f[0] - k[0] - a),
					(T = 1073741824),
					(H = v
						? this.m_reverseHistory.length - 1
						: this.m_reverseHistory.length - 2);
				do {
					const L = p + s;
					L === M || (L < b && c[L - 1] >= c[L + 1])
						? ((d = c[L + 1] - 1),
							(w = d - p - a),
							d > T && N.MarkNextChange(),
							(T = d + 1),
							N.AddOriginalElement(d + 1, w + 1),
							(p = L + 1 - s))
						: ((d = c[L - 1]),
							(w = d - p - a),
							d > T && N.MarkNextChange(),
							(T = d),
							N.AddModifiedElement(d + 1, w + 1),
							(p = L - 1 - s)),
						H >= 0 &&
							((c = this.m_reverseHistory[H]),
							(s = c[0]),
							(M = 1),
							(b = c.length - 1));
				} while (--H >= -1);
				R = N.getChanges();
			}
			return this.ConcatenateChanges(E, R);
		}
		ComputeRecursionPoint(t, n, i, r, s, o, l) {
			let a = 0,
				u = 0,
				c = 0,
				d = 0,
				m = 0,
				f = 0;
			t--,
				i--,
				(s[0] = 0),
				(o[0] = 0),
				(this.m_forwardHistory = []),
				(this.m_reverseHistory = []);
			const w = n - t + (r - i),
				g = w + 1,
				k = new Int32Array(g),
				v = new Int32Array(g),
				y = r - i,
				E = n - t,
				R = t - i,
				N = n - r,
				b = (E - y) % 2 === 0;
			(k[y] = t), (v[E] = n), (l[0] = !1);
			for (let p = 1; p <= w / 2 + 1; p++) {
				let T = 0,
					H = 0;
				(c = this.ClipDiagonalBound(y - p, p, y, g)),
					(d = this.ClipDiagonalBound(y + p, p, y, g));
				for (let _ = c; _ <= d; _ += 2) {
					_ === c || (_ < d && k[_ - 1] < k[_ + 1])
						? (a = k[_ + 1])
						: (a = k[_ - 1] + 1),
						(u = a - (_ - y) - R);
					const A = a;
					for (
						;
						a < n && u < r && this.ElementsAreEqual(a + 1, u + 1);
					)
						a++, u++;
					if (
						((k[_] = a),
						a + u > T + H && ((T = a), (H = u)),
						!b && Math.abs(_ - E) <= p - 1 && a >= v[_])
					)
						return (
							(s[0] = a),
							(o[0] = u),
							A <= v[_] && p <= 1448
								? this.WALKTRACE(
										y,
										c,
										d,
										R,
										E,
										m,
										f,
										N,
										k,
										v,
										a,
										n,
										s,
										u,
										r,
										o,
										b,
										l,
									)
								: null
						);
				}
				const L = (T - t + (H - i) - p) / 2;
				if (
					this.ContinueProcessingPredicate !== null &&
					!this.ContinueProcessingPredicate(T, L)
				)
					return (
						(l[0] = !0),
						(s[0] = T),
						(o[0] = H),
						L > 0 && p <= 1448
							? this.WALKTRACE(
									y,
									c,
									d,
									R,
									E,
									m,
									f,
									N,
									k,
									v,
									a,
									n,
									s,
									u,
									r,
									o,
									b,
									l,
								)
							: (t++, i++, [new De(t, n - t + 1, i, r - i + 1)])
					);
				(m = this.ClipDiagonalBound(E - p, p, E, g)),
					(f = this.ClipDiagonalBound(E + p, p, E, g));
				for (let _ = m; _ <= f; _ += 2) {
					_ === m || (_ < f && v[_ - 1] >= v[_ + 1])
						? (a = v[_ + 1] - 1)
						: (a = v[_ - 1]),
						(u = a - (_ - E) - N);
					const A = a;
					for (; a > t && u > i && this.ElementsAreEqual(a, u); )
						a--, u--;
					if (((v[_] = a), b && Math.abs(_ - y) <= p && a <= k[_]))
						return (
							(s[0] = a),
							(o[0] = u),
							A >= k[_] && p <= 1448
								? this.WALKTRACE(
										y,
										c,
										d,
										R,
										E,
										m,
										f,
										N,
										k,
										v,
										a,
										n,
										s,
										u,
										r,
										o,
										b,
										l,
									)
								: null
						);
				}
				if (p <= 1447) {
					let _ = new Int32Array(d - c + 2);
					(_[0] = y - c + 1),
						Ye.Copy2(k, c, _, 1, d - c + 1),
						this.m_forwardHistory.push(_),
						(_ = new Int32Array(f - m + 2)),
						(_[0] = E - m + 1),
						Ye.Copy2(v, m, _, 1, f - m + 1),
						this.m_reverseHistory.push(_);
				}
			}
			return this.WALKTRACE(
				y,
				c,
				d,
				R,
				E,
				m,
				f,
				N,
				k,
				v,
				a,
				n,
				s,
				u,
				r,
				o,
				b,
				l,
			);
		}
		PrettifyChanges(t) {
			for (let n = 0; n < t.length; n++) {
				const i = t[n],
					r =
						n < t.length - 1
							? t[n + 1].originalStart
							: this._originalElementsOrHash.length,
					s =
						n < t.length - 1
							? t[n + 1].modifiedStart
							: this._modifiedElementsOrHash.length,
					o = i.originalLength > 0,
					l = i.modifiedLength > 0;
				for (
					;
					i.originalStart + i.originalLength < r &&
					i.modifiedStart + i.modifiedLength < s &&
					(!o ||
						this.OriginalElementsAreEqual(
							i.originalStart,
							i.originalStart + i.originalLength,
						)) &&
					(!l ||
						this.ModifiedElementsAreEqual(
							i.modifiedStart,
							i.modifiedStart + i.modifiedLength,
						));
				) {
					const u = this.ElementsAreStrictEqual(
						i.originalStart,
						i.modifiedStart,
					);
					if (
						this.ElementsAreStrictEqual(
							i.originalStart + i.originalLength,
							i.modifiedStart + i.modifiedLength,
						) &&
						!u
					)
						break;
					i.originalStart++, i.modifiedStart++;
				}
				const a = [null];
				if (
					n < t.length - 1 &&
					this.ChangesOverlap(t[n], t[n + 1], a)
				) {
					(t[n] = a[0]), t.splice(n + 1, 1), n--;
					continue;
				}
			}
			for (let n = t.length - 1; n >= 0; n--) {
				const i = t[n];
				let r = 0,
					s = 0;
				if (n > 0) {
					const d = t[n - 1];
					(r = d.originalStart + d.originalLength),
						(s = d.modifiedStart + d.modifiedLength);
				}
				const o = i.originalLength > 0,
					l = i.modifiedLength > 0;
				let a = 0,
					u = this._boundaryScore(
						i.originalStart,
						i.originalLength,
						i.modifiedStart,
						i.modifiedLength,
					);
				for (let d = 1; ; d++) {
					const m = i.originalStart - d,
						f = i.modifiedStart - d;
					if (
						m < r ||
						f < s ||
						(o &&
							!this.OriginalElementsAreEqual(
								m,
								m + i.originalLength,
							)) ||
						(l &&
							!this.ModifiedElementsAreEqual(
								f,
								f + i.modifiedLength,
							))
					)
						break;
					const g =
						(m === r && f === s ? 5 : 0) +
						this._boundaryScore(
							m,
							i.originalLength,
							f,
							i.modifiedLength,
						);
					g > u && ((u = g), (a = d));
				}
				(i.originalStart -= a), (i.modifiedStart -= a);
				const c = [null];
				if (n > 0 && this.ChangesOverlap(t[n - 1], t[n], c)) {
					(t[n - 1] = c[0]), t.splice(n, 1), n++;
					continue;
				}
			}
			if (this._hasStrings)
				for (let n = 1, i = t.length; n < i; n++) {
					const r = t[n - 1],
						s = t[n],
						o =
							s.originalStart -
							r.originalStart -
							r.originalLength,
						l = r.originalStart,
						a = s.originalStart + s.originalLength,
						u = a - l,
						c = r.modifiedStart,
						d = s.modifiedStart + s.modifiedLength,
						m = d - c;
					if (o < 5 && u < 20 && m < 20) {
						const f = this._findBetterContiguousSequence(
							l,
							u,
							c,
							m,
							o,
						);
						if (f) {
							const [w, g] = f;
							(w !== r.originalStart + r.originalLength ||
								g !== r.modifiedStart + r.modifiedLength) &&
								((r.originalLength = w - r.originalStart),
								(r.modifiedLength = g - r.modifiedStart),
								(s.originalStart = w + o),
								(s.modifiedStart = g + o),
								(s.originalLength = a - s.originalStart),
								(s.modifiedLength = d - s.modifiedStart));
						}
					}
				}
			return t;
		}
		_findBetterContiguousSequence(t, n, i, r, s) {
			if (n < s || r < s) return null;
			const o = t + n - s + 1,
				l = i + r - s + 1;
			let a = 0,
				u = 0,
				c = 0;
			for (let d = t; d < o; d++)
				for (let m = i; m < l; m++) {
					const f = this._contiguousSequenceScore(d, m, s);
					f > 0 && f > a && ((a = f), (u = d), (c = m));
				}
			return a > 0 ? [u, c] : null;
		}
		_contiguousSequenceScore(t, n, i) {
			let r = 0;
			for (let s = 0; s < i; s++) {
				if (!this.ElementsAreEqual(t + s, n + s)) return 0;
				r += this._originalStringElements[t + s].length;
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
				const i = t + n;
				if (
					this._OriginalIsBoundary(i - 1) ||
					this._OriginalIsBoundary(i)
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
				const i = t + n;
				if (
					this._ModifiedIsBoundary(i - 1) ||
					this._ModifiedIsBoundary(i)
				)
					return !0;
			}
			return !1;
		}
		_boundaryScore(t, n, i, r) {
			const s = this._OriginalRegionIsBoundary(t, n) ? 1 : 0,
				o = this._ModifiedRegionIsBoundary(i, r) ? 1 : 0;
			return s + o;
		}
		ConcatenateChanges(t, n) {
			const i = [];
			if (t.length === 0 || n.length === 0) return n.length > 0 ? n : t;
			if (this.ChangesOverlap(t[t.length - 1], n[0], i)) {
				const r = new Array(t.length + n.length - 1);
				return (
					Ye.Copy(t, 0, r, 0, t.length - 1),
					(r[t.length - 1] = i[0]),
					Ye.Copy(n, 1, r, t.length, n.length - 1),
					r
				);
			} else {
				const r = new Array(t.length + n.length);
				return (
					Ye.Copy(t, 0, r, 0, t.length),
					Ye.Copy(n, 0, r, t.length, n.length),
					r
				);
			}
		}
		ChangesOverlap(t, n, i) {
			if (
				(Je.Assert(
					t.originalStart <= n.originalStart,
					"Left change is not less than or equal to right change",
				),
				Je.Assert(
					t.modifiedStart <= n.modifiedStart,
					"Left change is not less than or equal to right change",
				),
				t.originalStart + t.originalLength >= n.originalStart ||
					t.modifiedStart + t.modifiedLength >= n.modifiedStart)
			) {
				const r = t.originalStart;
				let s = t.originalLength;
				const o = t.modifiedStart;
				let l = t.modifiedLength;
				return (
					t.originalStart + t.originalLength >= n.originalStart &&
						(s =
							n.originalStart +
							n.originalLength -
							t.originalStart),
					t.modifiedStart + t.modifiedLength >= n.modifiedStart &&
						(l =
							n.modifiedStart +
							n.modifiedLength -
							t.modifiedStart),
					(i[0] = new De(r, s, o, l)),
					!0
				);
			} else return (i[0] = null), !1;
		}
		ClipDiagonalBound(t, n, i, r) {
			if (t >= 0 && t < r) return t;
			const s = i,
				o = r - i - 1,
				l = n % 2 === 0;
			if (t < 0) {
				const a = s % 2 === 0;
				return l === a ? 0 : 1;
			} else {
				const a = o % 2 === 0;
				return l === a ? r - 1 : r - 2;
			}
		}
	}
	var Si = {};
	let Qe;
	const wn = globalThis.vscode;
	if (typeof wn < "u" && typeof wn.process < "u") {
		const e = wn.process;
		Qe = {
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
			? (Qe = {
					get platform() {
						return process.platform;
					},
					get arch() {
						return process.arch;
					},
					get env() {
						return Si;
					},
					cwd() {
						return Si.VSCODE_CWD || process.cwd();
					},
				})
			: (Qe = {
					get platform() {
						return ct ? "win32" : Ya ? "darwin" : "linux";
					},
					get arch() {},
					get env() {
						return {};
					},
					cwd() {
						return "/";
					},
				});
	const Nt = Qe.cwd,
		vo = Qe.env,
		yo = Qe.platform,
		xo = 65,
		To = 97,
		ko = 90,
		Ao = 122,
		ze = 46,
		ae = 47,
		ue = 92,
		He = 58,
		So = 63;
	class Li extends Error {
		constructor(t, n, i) {
			let r;
			typeof n == "string" && n.indexOf("not ") === 0
				? ((r = "must not be"), (n = n.replace(/^not /, "")))
				: (r = "must be");
			const s = t.indexOf(".") !== -1 ? "property" : "argument";
			let o = `The "${t}" ${s} ${r} of type ${n}`;
			(o += `. Received type ${typeof i}`),
				super(o),
				(this.code = "ERR_INVALID_ARG_TYPE");
		}
	}
	function Lo(e, t) {
		if (e === null || typeof e != "object") throw new Li(t, "Object", e);
	}
	function K(e, t) {
		if (typeof e != "string") throw new Li(t, "string", e);
	}
	const Ue = yo === "win32";
	function O(e) {
		return e === ae || e === ue;
	}
	function vn(e) {
		return e === ae;
	}
	function We(e) {
		return (e >= xo && e <= ko) || (e >= To && e <= Ao);
	}
	function Dt(e, t, n, i) {
		let r = "",
			s = 0,
			o = -1,
			l = 0,
			a = 0;
		for (let u = 0; u <= e.length; ++u) {
			if (u < e.length) a = e.charCodeAt(u);
			else {
				if (i(a)) break;
				a = ae;
			}
			if (i(a)) {
				if (!(o === u - 1 || l === 1))
					if (l === 2) {
						if (
							r.length < 2 ||
							s !== 2 ||
							r.charCodeAt(r.length - 1) !== ze ||
							r.charCodeAt(r.length - 2) !== ze
						) {
							if (r.length > 2) {
								const c = r.lastIndexOf(n);
								c === -1
									? ((r = ""), (s = 0))
									: ((r = r.slice(0, c)),
										(s = r.length - 1 - r.lastIndexOf(n))),
									(o = u),
									(l = 0);
								continue;
							} else if (r.length !== 0) {
								(r = ""), (s = 0), (o = u), (l = 0);
								continue;
							}
						}
						t && ((r += r.length > 0 ? `${n}..` : ".."), (s = 2));
					} else
						r.length > 0
							? (r += `${n}${e.slice(o + 1, u)}`)
							: (r = e.slice(o + 1, u)),
							(s = u - o - 1);
				(o = u), (l = 0);
			} else a === ze && l !== -1 ? ++l : (l = -1);
		}
		return r;
	}
	function Co(e) {
		return e ? `${e[0] === "." ? "" : "."}${e}` : "";
	}
	function Ci(e, t) {
		Lo(t, "pathObject");
		const n = t.dir || t.root,
			i = t.base || `${t.name || ""}${Co(t.ext)}`;
		return n ? (n === t.root ? `${n}${i}` : `${n}${e}${i}`) : i;
	}
	const le = {
			resolve(...e) {
				let t = "",
					n = "",
					i = !1;
				for (let r = e.length - 1; r >= -1; r--) {
					let s;
					if (r >= 0) {
						if (((s = e[r]), K(s, `paths[${r}]`), s.length === 0))
							continue;
					} else
						t.length === 0
							? (s = Nt())
							: ((s = vo[`=${t}`] || Nt()),
								(s === void 0 ||
									(s.slice(0, 2).toLowerCase() !==
										t.toLowerCase() &&
										s.charCodeAt(2) === ue)) &&
									(s = `${t}\\`));
					const o = s.length;
					let l = 0,
						a = "",
						u = !1;
					const c = s.charCodeAt(0);
					if (o === 1) O(c) && ((l = 1), (u = !0));
					else if (O(c))
						if (((u = !0), O(s.charCodeAt(1)))) {
							let d = 2,
								m = d;
							for (; d < o && !O(s.charCodeAt(d)); ) d++;
							if (d < o && d !== m) {
								const f = s.slice(m, d);
								for (m = d; d < o && O(s.charCodeAt(d)); ) d++;
								if (d < o && d !== m) {
									for (m = d; d < o && !O(s.charCodeAt(d)); )
										d++;
									(d === o || d !== m) &&
										((a = `\\\\${f}\\${s.slice(m, d)}`),
										(l = d));
								}
							}
						} else l = 1;
					else
						We(c) &&
							s.charCodeAt(1) === He &&
							((a = s.slice(0, 2)),
							(l = 2),
							o > 2 && O(s.charCodeAt(2)) && ((u = !0), (l = 3)));
					if (a.length > 0)
						if (t.length > 0) {
							if (a.toLowerCase() !== t.toLowerCase()) continue;
						} else t = a;
					if (i) {
						if (t.length > 0) break;
					} else if (
						((n = `${s.slice(l)}\\${n}`),
						(i = u),
						u && t.length > 0)
					)
						break;
				}
				return (
					(n = Dt(n, !i, "\\", O)),
					i ? `${t}\\${n}` : `${t}${n}` || "."
				);
			},
			normalize(e) {
				K(e, "path");
				const t = e.length;
				if (t === 0) return ".";
				let n = 0,
					i,
					r = !1;
				const s = e.charCodeAt(0);
				if (t === 1) return vn(s) ? "\\" : e;
				if (O(s))
					if (((r = !0), O(e.charCodeAt(1)))) {
						let l = 2,
							a = l;
						for (; l < t && !O(e.charCodeAt(l)); ) l++;
						if (l < t && l !== a) {
							const u = e.slice(a, l);
							for (a = l; l < t && O(e.charCodeAt(l)); ) l++;
							if (l < t && l !== a) {
								for (a = l; l < t && !O(e.charCodeAt(l)); ) l++;
								if (l === t) return `\\\\${u}\\${e.slice(a)}\\`;
								l !== a &&
									((i = `\\\\${u}\\${e.slice(a, l)}`),
									(n = l));
							}
						}
					} else n = 1;
				else
					We(s) &&
						e.charCodeAt(1) === He &&
						((i = e.slice(0, 2)),
						(n = 2),
						t > 2 && O(e.charCodeAt(2)) && ((r = !0), (n = 3)));
				let o = n < t ? Dt(e.slice(n), !r, "\\", O) : "";
				return (
					o.length === 0 && !r && (o = "."),
					o.length > 0 && O(e.charCodeAt(t - 1)) && (o += "\\"),
					i === void 0
						? r
							? `\\${o}`
							: o
						: r
							? `${i}\\${o}`
							: `${i}${o}`
				);
			},
			isAbsolute(e) {
				K(e, "path");
				const t = e.length;
				if (t === 0) return !1;
				const n = e.charCodeAt(0);
				return (
					O(n) ||
					(t > 2 &&
						We(n) &&
						e.charCodeAt(1) === He &&
						O(e.charCodeAt(2)))
				);
			},
			join(...e) {
				if (e.length === 0) return ".";
				let t, n;
				for (let s = 0; s < e.length; ++s) {
					const o = e[s];
					K(o, "path"),
						o.length > 0 &&
							(t === void 0 ? (t = n = o) : (t += `\\${o}`));
				}
				if (t === void 0) return ".";
				let i = !0,
					r = 0;
				if (typeof n == "string" && O(n.charCodeAt(0))) {
					++r;
					const s = n.length;
					s > 1 &&
						O(n.charCodeAt(1)) &&
						(++r, s > 2 && (O(n.charCodeAt(2)) ? ++r : (i = !1)));
				}
				if (i) {
					for (; r < t.length && O(t.charCodeAt(r)); ) r++;
					r >= 2 && (t = `\\${t.slice(r)}`);
				}
				return le.normalize(t);
			},
			relative(e, t) {
				if ((K(e, "from"), K(t, "to"), e === t)) return "";
				const n = le.resolve(e),
					i = le.resolve(t);
				if (
					n === i ||
					((e = n.toLowerCase()), (t = i.toLowerCase()), e === t)
				)
					return "";
				let r = 0;
				for (; r < e.length && e.charCodeAt(r) === ue; ) r++;
				let s = e.length;
				for (; s - 1 > r && e.charCodeAt(s - 1) === ue; ) s--;
				const o = s - r;
				let l = 0;
				for (; l < t.length && t.charCodeAt(l) === ue; ) l++;
				let a = t.length;
				for (; a - 1 > l && t.charCodeAt(a - 1) === ue; ) a--;
				const u = a - l,
					c = o < u ? o : u;
				let d = -1,
					m = 0;
				for (; m < c; m++) {
					const w = e.charCodeAt(r + m);
					if (w !== t.charCodeAt(l + m)) break;
					w === ue && (d = m);
				}
				if (m !== c) {
					if (d === -1) return i;
				} else {
					if (u > c) {
						if (t.charCodeAt(l + m) === ue)
							return i.slice(l + m + 1);
						if (m === 2) return i.slice(l + m);
					}
					o > c &&
						(e.charCodeAt(r + m) === ue
							? (d = m)
							: m === 2 && (d = 3)),
						d === -1 && (d = 0);
				}
				let f = "";
				for (m = r + d + 1; m <= s; ++m)
					(m === s || e.charCodeAt(m) === ue) &&
						(f += f.length === 0 ? ".." : "\\..");
				return (
					(l += d),
					f.length > 0
						? `${f}${i.slice(l, a)}`
						: (i.charCodeAt(l) === ue && ++l, i.slice(l, a))
				);
			},
			toNamespacedPath(e) {
				if (typeof e != "string" || e.length === 0) return e;
				const t = le.resolve(e);
				if (t.length <= 2) return e;
				if (t.charCodeAt(0) === ue) {
					if (t.charCodeAt(1) === ue) {
						const n = t.charCodeAt(2);
						if (n !== So && n !== ze)
							return `\\\\?\\UNC\\${t.slice(2)}`;
					}
				} else if (
					We(t.charCodeAt(0)) &&
					t.charCodeAt(1) === He &&
					t.charCodeAt(2) === ue
				)
					return `\\\\?\\${t}`;
				return e;
			},
			dirname(e) {
				K(e, "path");
				const t = e.length;
				if (t === 0) return ".";
				let n = -1,
					i = 0;
				const r = e.charCodeAt(0);
				if (t === 1) return O(r) ? e : ".";
				if (O(r)) {
					if (((n = i = 1), O(e.charCodeAt(1)))) {
						let l = 2,
							a = l;
						for (; l < t && !O(e.charCodeAt(l)); ) l++;
						if (l < t && l !== a) {
							for (a = l; l < t && O(e.charCodeAt(l)); ) l++;
							if (l < t && l !== a) {
								for (a = l; l < t && !O(e.charCodeAt(l)); ) l++;
								if (l === t) return e;
								l !== a && (n = i = l + 1);
							}
						}
					}
				} else
					We(r) &&
						e.charCodeAt(1) === He &&
						((n = t > 2 && O(e.charCodeAt(2)) ? 3 : 2), (i = n));
				let s = -1,
					o = !0;
				for (let l = t - 1; l >= i; --l)
					if (O(e.charCodeAt(l))) {
						if (!o) {
							s = l;
							break;
						}
					} else o = !1;
				if (s === -1) {
					if (n === -1) return ".";
					s = n;
				}
				return e.slice(0, s);
			},
			basename(e, t) {
				t !== void 0 && K(t, "suffix"), K(e, "path");
				let n = 0,
					i = -1,
					r = !0,
					s;
				if (
					(e.length >= 2 &&
						We(e.charCodeAt(0)) &&
						e.charCodeAt(1) === He &&
						(n = 2),
					t !== void 0 && t.length > 0 && t.length <= e.length)
				) {
					if (t === e) return "";
					let o = t.length - 1,
						l = -1;
					for (s = e.length - 1; s >= n; --s) {
						const a = e.charCodeAt(s);
						if (O(a)) {
							if (!r) {
								n = s + 1;
								break;
							}
						} else
							l === -1 && ((r = !1), (l = s + 1)),
								o >= 0 &&
									(a === t.charCodeAt(o)
										? --o === -1 && (i = s)
										: ((o = -1), (i = l)));
					}
					return (
						n === i ? (i = l) : i === -1 && (i = e.length),
						e.slice(n, i)
					);
				}
				for (s = e.length - 1; s >= n; --s)
					if (O(e.charCodeAt(s))) {
						if (!r) {
							n = s + 1;
							break;
						}
					} else i === -1 && ((r = !1), (i = s + 1));
				return i === -1 ? "" : e.slice(n, i);
			},
			extname(e) {
				K(e, "path");
				let t = 0,
					n = -1,
					i = 0,
					r = -1,
					s = !0,
					o = 0;
				e.length >= 2 &&
					e.charCodeAt(1) === He &&
					We(e.charCodeAt(0)) &&
					(t = i = 2);
				for (let l = e.length - 1; l >= t; --l) {
					const a = e.charCodeAt(l);
					if (O(a)) {
						if (!s) {
							i = l + 1;
							break;
						}
						continue;
					}
					r === -1 && ((s = !1), (r = l + 1)),
						a === ze
							? n === -1
								? (n = l)
								: o !== 1 && (o = 1)
							: n !== -1 && (o = -1);
				}
				return n === -1 ||
					r === -1 ||
					o === 0 ||
					(o === 1 && n === r - 1 && n === i + 1)
					? ""
					: e.slice(n, r);
			},
			format: Ci.bind(null, "\\"),
			parse(e) {
				K(e, "path");
				const t = { root: "", dir: "", base: "", ext: "", name: "" };
				if (e.length === 0) return t;
				const n = e.length;
				let i = 0,
					r = e.charCodeAt(0);
				if (n === 1)
					return O(r)
						? ((t.root = t.dir = e), t)
						: ((t.base = t.name = e), t);
				if (O(r)) {
					if (((i = 1), O(e.charCodeAt(1)))) {
						let d = 2,
							m = d;
						for (; d < n && !O(e.charCodeAt(d)); ) d++;
						if (d < n && d !== m) {
							for (m = d; d < n && O(e.charCodeAt(d)); ) d++;
							if (d < n && d !== m) {
								for (m = d; d < n && !O(e.charCodeAt(d)); ) d++;
								d === n ? (i = d) : d !== m && (i = d + 1);
							}
						}
					}
				} else if (We(r) && e.charCodeAt(1) === He) {
					if (n <= 2) return (t.root = t.dir = e), t;
					if (((i = 2), O(e.charCodeAt(2)))) {
						if (n === 3) return (t.root = t.dir = e), t;
						i = 3;
					}
				}
				i > 0 && (t.root = e.slice(0, i));
				let s = -1,
					o = i,
					l = -1,
					a = !0,
					u = e.length - 1,
					c = 0;
				for (; u >= i; --u) {
					if (((r = e.charCodeAt(u)), O(r))) {
						if (!a) {
							o = u + 1;
							break;
						}
						continue;
					}
					l === -1 && ((a = !1), (l = u + 1)),
						r === ze
							? s === -1
								? (s = u)
								: c !== 1 && (c = 1)
							: s !== -1 && (c = -1);
				}
				return (
					l !== -1 &&
						(s === -1 ||
						c === 0 ||
						(c === 1 && s === l - 1 && s === o + 1)
							? (t.base = t.name = e.slice(o, l))
							: ((t.name = e.slice(o, s)),
								(t.base = e.slice(o, l)),
								(t.ext = e.slice(s, l)))),
					o > 0 && o !== i
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
		Eo = (() => {
			if (Ue) {
				const e = /\\/g;
				return () => {
					const t = Nt().replace(e, "/");
					return t.slice(t.indexOf("/"));
				};
			}
			return () => Nt();
		})(),
		ce = {
			resolve(...e) {
				let t = "",
					n = !1;
				for (let i = e.length - 1; i >= -1 && !n; i--) {
					const r = i >= 0 ? e[i] : Eo();
					K(r, `paths[${i}]`),
						r.length !== 0 &&
							((t = `${r}/${t}`), (n = r.charCodeAt(0) === ae));
				}
				return (
					(t = Dt(t, !n, "/", vn)),
					n ? `/${t}` : t.length > 0 ? t : "."
				);
			},
			normalize(e) {
				if ((K(e, "path"), e.length === 0)) return ".";
				const t = e.charCodeAt(0) === ae,
					n = e.charCodeAt(e.length - 1) === ae;
				return (
					(e = Dt(e, !t, "/", vn)),
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
				return K(e, "path"), e.length > 0 && e.charCodeAt(0) === ae;
			},
			join(...e) {
				if (e.length === 0) return ".";
				let t;
				for (let n = 0; n < e.length; ++n) {
					const i = e[n];
					K(i, "path"),
						i.length > 0 &&
							(t === void 0 ? (t = i) : (t += `/${i}`));
				}
				return t === void 0 ? "." : ce.normalize(t);
			},
			relative(e, t) {
				if (
					(K(e, "from"),
					K(t, "to"),
					e === t ||
						((e = ce.resolve(e)), (t = ce.resolve(t)), e === t))
				)
					return "";
				const n = 1,
					i = e.length,
					r = i - n,
					s = 1,
					o = t.length - s,
					l = r < o ? r : o;
				let a = -1,
					u = 0;
				for (; u < l; u++) {
					const d = e.charCodeAt(n + u);
					if (d !== t.charCodeAt(s + u)) break;
					d === ae && (a = u);
				}
				if (u === l)
					if (o > l) {
						if (t.charCodeAt(s + u) === ae)
							return t.slice(s + u + 1);
						if (u === 0) return t.slice(s + u);
					} else
						r > l &&
							(e.charCodeAt(n + u) === ae
								? (a = u)
								: u === 0 && (a = 0));
				let c = "";
				for (u = n + a + 1; u <= i; ++u)
					(u === i || e.charCodeAt(u) === ae) &&
						(c += c.length === 0 ? ".." : "/..");
				return `${c}${t.slice(s + a)}`;
			},
			toNamespacedPath(e) {
				return e;
			},
			dirname(e) {
				if ((K(e, "path"), e.length === 0)) return ".";
				const t = e.charCodeAt(0) === ae;
				let n = -1,
					i = !0;
				for (let r = e.length - 1; r >= 1; --r)
					if (e.charCodeAt(r) === ae) {
						if (!i) {
							n = r;
							break;
						}
					} else i = !1;
				return n === -1
					? t
						? "/"
						: "."
					: t && n === 1
						? "//"
						: e.slice(0, n);
			},
			basename(e, t) {
				t !== void 0 && K(t, "ext"), K(e, "path");
				let n = 0,
					i = -1,
					r = !0,
					s;
				if (t !== void 0 && t.length > 0 && t.length <= e.length) {
					if (t === e) return "";
					let o = t.length - 1,
						l = -1;
					for (s = e.length - 1; s >= 0; --s) {
						const a = e.charCodeAt(s);
						if (a === ae) {
							if (!r) {
								n = s + 1;
								break;
							}
						} else
							l === -1 && ((r = !1), (l = s + 1)),
								o >= 0 &&
									(a === t.charCodeAt(o)
										? --o === -1 && (i = s)
										: ((o = -1), (i = l)));
					}
					return (
						n === i ? (i = l) : i === -1 && (i = e.length),
						e.slice(n, i)
					);
				}
				for (s = e.length - 1; s >= 0; --s)
					if (e.charCodeAt(s) === ae) {
						if (!r) {
							n = s + 1;
							break;
						}
					} else i === -1 && ((r = !1), (i = s + 1));
				return i === -1 ? "" : e.slice(n, i);
			},
			extname(e) {
				K(e, "path");
				let t = -1,
					n = 0,
					i = -1,
					r = !0,
					s = 0;
				for (let o = e.length - 1; o >= 0; --o) {
					const l = e.charCodeAt(o);
					if (l === ae) {
						if (!r) {
							n = o + 1;
							break;
						}
						continue;
					}
					i === -1 && ((r = !1), (i = o + 1)),
						l === ze
							? t === -1
								? (t = o)
								: s !== 1 && (s = 1)
							: t !== -1 && (s = -1);
				}
				return t === -1 ||
					i === -1 ||
					s === 0 ||
					(s === 1 && t === i - 1 && t === n + 1)
					? ""
					: e.slice(t, i);
			},
			format: Ci.bind(null, "/"),
			parse(e) {
				K(e, "path");
				const t = { root: "", dir: "", base: "", ext: "", name: "" };
				if (e.length === 0) return t;
				const n = e.charCodeAt(0) === ae;
				let i;
				n ? ((t.root = "/"), (i = 1)) : (i = 0);
				let r = -1,
					s = 0,
					o = -1,
					l = !0,
					a = e.length - 1,
					u = 0;
				for (; a >= i; --a) {
					const c = e.charCodeAt(a);
					if (c === ae) {
						if (!l) {
							s = a + 1;
							break;
						}
						continue;
					}
					o === -1 && ((l = !1), (o = a + 1)),
						c === ze
							? r === -1
								? (r = a)
								: u !== 1 && (u = 1)
							: r !== -1 && (u = -1);
				}
				if (o !== -1) {
					const c = s === 0 && n ? 1 : s;
					r === -1 ||
					u === 0 ||
					(u === 1 && r === o - 1 && r === s + 1)
						? (t.base = t.name = e.slice(c, o))
						: ((t.name = e.slice(c, r)),
							(t.base = e.slice(c, o)),
							(t.ext = e.slice(r, o)));
				}
				return (
					s > 0 ? (t.dir = e.slice(0, s - 1)) : n && (t.dir = "/"), t
				);
			},
			sep: "/",
			delimiter: ":",
			win32: null,
			posix: null,
		};
	(ce.win32 = le.win32 = le),
		(ce.posix = le.posix = ce),
		Ue ? le.normalize : ce.normalize,
		Ue ? le.resolve : ce.resolve,
		Ue ? le.relative : ce.relative,
		Ue ? le.dirname : ce.dirname,
		Ue ? le.basename : ce.basename,
		Ue ? le.extname : ce.extname,
		Ue ? le.sep : ce.sep;
	const Ro = /^\w[\w\d+.-]*$/,
		Mo = /^\//,
		No = /^\/\//;
	function Do(e, t) {
		if (!e.scheme && t)
			throw new Error(
				`[UriError]: Scheme is missing: {scheme: "", authority: "${e.authority}", path: "${e.path}", query: "${e.query}", fragment: "${e.fragment}"}`,
			);
		if (e.scheme && !Ro.test(e.scheme))
			throw new Error("[UriError]: Scheme contains illegal characters.");
		if (e.path) {
			if (e.authority) {
				if (!Mo.test(e.path))
					throw new Error(
						'[UriError]: If a URI contains an authority component, then the path component must either be empty or begin with a slash ("/") character',
					);
			} else if (No.test(e.path))
				throw new Error(
					'[UriError]: If a URI does not contain an authority component, then the path cannot begin with two slash characters ("//")',
				);
		}
	}
	function Io(e, t) {
		return !e && !t ? "file" : e;
	}
	function zo(e, t) {
		switch (e) {
			case "https":
			case "http":
			case "file":
				t ? t[0] !== ve && (t = ve + t) : (t = ve);
				break;
		}
		return t;
	}
	const X = "",
		ve = "/",
		Ho = /^(([^:/?#]+?):)?(\/\/([^/?#]*))?([^?#]*)(\?([^#]*))?(#(.*))?/;
	let yn = class an {
		static isUri(t) {
			return t instanceof an
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
		constructor(t, n, i, r, s, o = !1) {
			typeof t == "object"
				? ((this.scheme = t.scheme || X),
					(this.authority = t.authority || X),
					(this.path = t.path || X),
					(this.query = t.query || X),
					(this.fragment = t.fragment || X))
				: ((this.scheme = Io(t, o)),
					(this.authority = n || X),
					(this.path = zo(this.scheme, i || X)),
					(this.query = r || X),
					(this.fragment = s || X),
					Do(this, o));
		}
		get fsPath() {
			return xn(this, !1);
		}
		with(t) {
			if (!t) return this;
			let { scheme: n, authority: i, path: r, query: s, fragment: o } = t;
			return (
				n === void 0 ? (n = this.scheme) : n === null && (n = X),
				i === void 0 ? (i = this.authority) : i === null && (i = X),
				r === void 0 ? (r = this.path) : r === null && (r = X),
				s === void 0 ? (s = this.query) : s === null && (s = X),
				o === void 0 ? (o = this.fragment) : o === null && (o = X),
				n === this.scheme &&
				i === this.authority &&
				r === this.path &&
				s === this.query &&
				o === this.fragment
					? this
					: new Ze(n, i, r, s, o)
			);
		}
		static parse(t, n = !1) {
			const i = Ho.exec(t);
			return i
				? new Ze(
						i[2] || X,
						It(i[4] || X),
						It(i[5] || X),
						It(i[7] || X),
						It(i[9] || X),
						n,
					)
				: new Ze(X, X, X, X, X);
		}
		static file(t) {
			let n = X;
			if (
				(ct && (t = t.replace(/\\/g, ve)), t[0] === ve && t[1] === ve)
			) {
				const i = t.indexOf(ve, 2);
				i === -1
					? ((n = t.substring(2)), (t = ve))
					: ((n = t.substring(2, i)), (t = t.substring(i) || ve));
			}
			return new Ze("file", n, t, X, X);
		}
		static from(t, n) {
			return new Ze(
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
			let i;
			return (
				ct && t.scheme === "file"
					? (i = an.file(le.join(xn(t, !0), ...n)).path)
					: (i = ce.join(t.path, ...n)),
				t.with({ path: i })
			);
		}
		toString(t = !1) {
			return Tn(this, t);
		}
		toJSON() {
			return this;
		}
		static revive(t) {
			if (t) {
				if (t instanceof an) return t;
				{
					const n = new Ze(t);
					return (
						(n._formatted = t.external ?? null),
						(n._fsPath = t._sep === Ei ? t.fsPath ?? null : null),
						n
					);
				}
			} else return t;
		}
	};
	const Ei = ct ? 1 : void 0;
	class Ze extends yn {
		constructor() {
			super(...arguments),
				(this._formatted = null),
				(this._fsPath = null);
		}
		get fsPath() {
			return this._fsPath || (this._fsPath = xn(this, !1)), this._fsPath;
		}
		toString(t = !1) {
			return t
				? Tn(this, !0)
				: (this._formatted || (this._formatted = Tn(this, !1)),
					this._formatted);
		}
		toJSON() {
			const t = { $mid: 1 };
			return (
				this._fsPath && ((t.fsPath = this._fsPath), (t._sep = Ei)),
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
	const Ri = {
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
	function Mi(e, t, n) {
		let i,
			r = -1;
		for (let s = 0; s < e.length; s++) {
			const o = e.charCodeAt(s);
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
					((i += encodeURIComponent(e.substring(r, s))), (r = -1)),
					i !== void 0 && (i += e.charAt(s));
			else {
				i === void 0 && (i = e.substr(0, s));
				const l = Ri[o];
				l !== void 0
					? (r !== -1 &&
							((i += encodeURIComponent(e.substring(r, s))),
							(r = -1)),
						(i += l))
					: r === -1 && (r = s);
			}
		}
		return (
			r !== -1 && (i += encodeURIComponent(e.substring(r))),
			i !== void 0 ? i : e
		);
	}
	function Uo(e) {
		let t;
		for (let n = 0; n < e.length; n++) {
			const i = e.charCodeAt(n);
			i === 35 || i === 63
				? (t === void 0 && (t = e.substr(0, n)), (t += Ri[i]))
				: t !== void 0 && (t += e[n]);
		}
		return t !== void 0 ? t : e;
	}
	function xn(e, t) {
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
			ct && (n = n.replace(/\//g, "\\")),
			n
		);
	}
	function Tn(e, t) {
		const n = t ? Uo : Mi;
		let i = "",
			{ scheme: r, authority: s, path: o, query: l, fragment: a } = e;
		if (
			(r && ((i += r), (i += ":")),
			(s || r === "file") && ((i += ve), (i += ve)),
			s)
		) {
			let u = s.indexOf("@");
			if (u !== -1) {
				const c = s.substr(0, u);
				(s = s.substr(u + 1)),
					(u = c.lastIndexOf(":")),
					u === -1
						? (i += n(c, !1, !1))
						: ((i += n(c.substr(0, u), !1, !1)),
							(i += ":"),
							(i += n(c.substr(u + 1), !1, !0))),
					(i += "@");
			}
			(s = s.toLowerCase()),
				(u = s.lastIndexOf(":")),
				u === -1
					? (i += n(s, !1, !0))
					: ((i += n(s.substr(0, u), !1, !0)), (i += s.substr(u)));
		}
		if (o) {
			if (
				o.length >= 3 &&
				o.charCodeAt(0) === 47 &&
				o.charCodeAt(2) === 58
			) {
				const u = o.charCodeAt(1);
				u >= 65 &&
					u <= 90 &&
					(o = `/${String.fromCharCode(u + 32)}:${o.substr(3)}`);
			} else if (o.length >= 2 && o.charCodeAt(1) === 58) {
				const u = o.charCodeAt(0);
				u >= 65 &&
					u <= 90 &&
					(o = `${String.fromCharCode(u + 32)}:${o.substr(2)}`);
			}
			i += n(o, !0, !1);
		}
		return (
			l && ((i += "?"), (i += n(l, !1, !1))),
			a && ((i += "#"), (i += t ? a : Mi(a, !1, !1))),
			i
		);
	}
	function Ni(e) {
		try {
			return decodeURIComponent(e);
		} catch {
			return e.length > 3 ? e.substr(0, 3) + Ni(e.substr(3)) : e;
		}
	}
	const Di = /(%[0-9A-Za-z][0-9A-Za-z])+/g;
	function It(e) {
		return e.match(Di) ? e.replace(Di, (t) => Ni(t)) : e;
	}
	let ee = class Ge {
			constructor(t, n) {
				(this.lineNumber = t), (this.column = n);
			}
			with(t = this.lineNumber, n = this.column) {
				return t === this.lineNumber && n === this.column
					? this
					: new Ge(t, n);
			}
			delta(t = 0, n = 0) {
				return this.with(this.lineNumber + t, this.column + n);
			}
			equals(t) {
				return Ge.equals(this, t);
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
				return Ge.isBefore(this, t);
			}
			static isBefore(t, n) {
				return t.lineNumber < n.lineNumber
					? !0
					: n.lineNumber < t.lineNumber
						? !1
						: t.column < n.column;
			}
			isBeforeOrEqual(t) {
				return Ge.isBeforeOrEqual(this, t);
			}
			static isBeforeOrEqual(t, n) {
				return t.lineNumber < n.lineNumber
					? !0
					: n.lineNumber < t.lineNumber
						? !1
						: t.column <= n.column;
			}
			static compare(t, n) {
				const i = t.lineNumber | 0,
					r = n.lineNumber | 0;
				if (i === r) {
					const s = t.column | 0,
						o = n.column | 0;
					return s - o;
				}
				return i - r;
			}
			clone() {
				return new Ge(this.lineNumber, this.column);
			}
			toString() {
				return "(" + this.lineNumber + "," + this.column + ")";
			}
			static lift(t) {
				return new Ge(t.lineNumber, t.column);
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
		},
		$ = class te {
			constructor(t, n, i, r) {
				t > i || (t === i && n > r)
					? ((this.startLineNumber = i),
						(this.startColumn = r),
						(this.endLineNumber = t),
						(this.endColumn = n))
					: ((this.startLineNumber = t),
						(this.startColumn = n),
						(this.endLineNumber = i),
						(this.endColumn = r));
			}
			isEmpty() {
				return te.isEmpty(this);
			}
			static isEmpty(t) {
				return (
					t.startLineNumber === t.endLineNumber &&
					t.startColumn === t.endColumn
				);
			}
			containsPosition(t) {
				return te.containsPosition(this, t);
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
					(n.lineNumber === t.endLineNumber &&
						n.column >= t.endColumn)
				);
			}
			containsRange(t) {
				return te.containsRange(this, t);
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
				return te.strictContainsRange(this, t);
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
				return te.plusRange(this, t);
			}
			static plusRange(t, n) {
				let i, r, s, o;
				return (
					n.startLineNumber < t.startLineNumber
						? ((i = n.startLineNumber), (r = n.startColumn))
						: n.startLineNumber === t.startLineNumber
							? ((i = n.startLineNumber),
								(r = Math.min(n.startColumn, t.startColumn)))
							: ((i = t.startLineNumber), (r = t.startColumn)),
					n.endLineNumber > t.endLineNumber
						? ((s = n.endLineNumber), (o = n.endColumn))
						: n.endLineNumber === t.endLineNumber
							? ((s = n.endLineNumber),
								(o = Math.max(n.endColumn, t.endColumn)))
							: ((s = t.endLineNumber), (o = t.endColumn)),
					new te(i, r, s, o)
				);
			}
			intersectRanges(t) {
				return te.intersectRanges(this, t);
			}
			static intersectRanges(t, n) {
				let i = t.startLineNumber,
					r = t.startColumn,
					s = t.endLineNumber,
					o = t.endColumn;
				const l = n.startLineNumber,
					a = n.startColumn,
					u = n.endLineNumber,
					c = n.endColumn;
				return (
					i < l
						? ((i = l), (r = a))
						: i === l && (r = Math.max(r, a)),
					s > u
						? ((s = u), (o = c))
						: s === u && (o = Math.min(o, c)),
					i > s || (i === s && r > o) ? null : new te(i, r, s, o)
				);
			}
			equalsRange(t) {
				return te.equalsRange(this, t);
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
				return te.getEndPosition(this);
			}
			static getEndPosition(t) {
				return new ee(t.endLineNumber, t.endColumn);
			}
			getStartPosition() {
				return te.getStartPosition(this);
			}
			static getStartPosition(t) {
				return new ee(t.startLineNumber, t.startColumn);
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
				return new te(this.startLineNumber, this.startColumn, t, n);
			}
			setStartPosition(t, n) {
				return new te(t, n, this.endLineNumber, this.endColumn);
			}
			collapseToStart() {
				return te.collapseToStart(this);
			}
			static collapseToStart(t) {
				return new te(
					t.startLineNumber,
					t.startColumn,
					t.startLineNumber,
					t.startColumn,
				);
			}
			collapseToEnd() {
				return te.collapseToEnd(this);
			}
			static collapseToEnd(t) {
				return new te(
					t.endLineNumber,
					t.endColumn,
					t.endLineNumber,
					t.endColumn,
				);
			}
			delta(t) {
				return new te(
					this.startLineNumber + t,
					this.startColumn,
					this.endLineNumber + t,
					this.endColumn,
				);
			}
			static fromPositions(t, n = t) {
				return new te(t.lineNumber, t.column, n.lineNumber, n.column);
			}
			static lift(t) {
				return t
					? new te(
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
					const s = t.startLineNumber | 0,
						o = n.startLineNumber | 0;
					if (s === o) {
						const l = t.startColumn | 0,
							a = n.startColumn | 0;
						if (l === a) {
							const u = t.endLineNumber | 0,
								c = n.endLineNumber | 0;
							if (u === c) {
								const d = t.endColumn | 0,
									m = n.endColumn | 0;
								return d - m;
							}
							return u - c;
						}
						return l - a;
					}
					return s - o;
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
		};
	function Wo(e, t, n = (i, r) => i === r) {
		if (e === t) return !0;
		if (!e || !t || e.length !== t.length) return !1;
		for (let i = 0, r = e.length; i < r; i++) if (!n(e[i], t[i])) return !1;
		return !0;
	}
	function* Fo(e, t) {
		let n, i;
		for (const r of e)
			i !== void 0 && t(i, r) ? n.push(r) : (n && (yield n), (n = [r])),
				(i = r);
		n && (yield n);
	}
	function Po(e, t) {
		for (let n = 0; n <= e.length; n++)
			t(n === 0 ? void 0 : e[n - 1], n === e.length ? void 0 : e[n]);
	}
	function Bo(e, t) {
		for (let n = 0; n < e.length; n++)
			t(
				n === 0 ? void 0 : e[n - 1],
				e[n],
				n + 1 === e.length ? void 0 : e[n + 1],
			);
	}
	function qo(e, t) {
		for (const n of t) e.push(n);
	}
	var kn;
	(function (e) {
		function t(s) {
			return s < 0;
		}
		e.isLessThan = t;
		function n(s) {
			return s <= 0;
		}
		e.isLessThanOrEqual = n;
		function i(s) {
			return s > 0;
		}
		e.isGreaterThan = i;
		function r(s) {
			return s === 0;
		}
		(e.isNeitherLessOrGreaterThan = r),
			(e.greaterThan = 1),
			(e.lessThan = -1),
			(e.neitherLessOrGreaterThan = 0);
	})(kn || (kn = {}));
	function zt(e, t) {
		return (n, i) => t(e(n), e(i));
	}
	const Ht = (e, t) => e - t;
	function Oo(e) {
		return (t, n) => -e(t, n);
	}
	class Ut {
		static {
			this.empty = new Ut((t) => {});
		}
		constructor(t) {
			this.iterate = t;
		}
		toArray() {
			const t = [];
			return this.iterate((n) => (t.push(n), !0)), t;
		}
		filter(t) {
			return new Ut((n) => this.iterate((i) => (t(i) ? n(i) : !0)));
		}
		map(t) {
			return new Ut((n) => this.iterate((i) => n(t(i))));
		}
		findLast(t) {
			let n;
			return this.iterate((i) => (t(i) && (n = i), !0)), n;
		}
		findLastMaxBy(t) {
			let n,
				i = !0;
			return (
				this.iterate(
					(r) => (
						(i || kn.isGreaterThan(t(r, n))) && ((i = !1), (n = r)),
						!0
					),
				),
				n
			);
		}
	}
	function Ii(e) {
		return e < 0 ? 0 : e > 255 ? 255 : e | 0;
	}
	function Ke(e) {
		return e < 0 ? 0 : e > 4294967295 ? 4294967295 : e | 0;
	}
	class Vo {
		constructor(t) {
			(this.values = t),
				(this.prefixSum = new Uint32Array(t.length)),
				(this.prefixSumValidIndex = new Int32Array(1)),
				(this.prefixSumValidIndex[0] = -1);
		}
		insertValues(t, n) {
			t = Ke(t);
			const i = this.values,
				r = this.prefixSum,
				s = n.length;
			return s === 0
				? !1
				: ((this.values = new Uint32Array(i.length + s)),
					this.values.set(i.subarray(0, t), 0),
					this.values.set(i.subarray(t), t + s),
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
				(t = Ke(t)),
				(n = Ke(n)),
				this.values[t] === n
					? !1
					: ((this.values[t] = n),
						t - 1 < this.prefixSumValidIndex[0] &&
							(this.prefixSumValidIndex[0] = t - 1),
						!0)
			);
		}
		removeValues(t, n) {
			(t = Ke(t)), (n = Ke(n));
			const i = this.values,
				r = this.prefixSum;
			if (t >= i.length) return !1;
			const s = i.length - t;
			return (
				n >= s && (n = s),
				n === 0
					? !1
					: ((this.values = new Uint32Array(i.length - n)),
						this.values.set(i.subarray(0, t), 0),
						this.values.set(i.subarray(t + n), t),
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
			return t < 0 ? 0 : ((t = Ke(t)), this._getPrefixSum(t));
		}
		_getPrefixSum(t) {
			if (t <= this.prefixSumValidIndex[0]) return this.prefixSum[t];
			let n = this.prefixSumValidIndex[0] + 1;
			n === 0 && ((this.prefixSum[0] = this.values[0]), n++),
				t >= this.values.length && (t = this.values.length - 1);
			for (let i = n; i <= t; i++)
				this.prefixSum[i] = this.prefixSum[i - 1] + this.values[i];
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
				i = this.values.length - 1,
				r = 0,
				s = 0,
				o = 0;
			for (; n <= i; )
				if (
					((r = (n + (i - n) / 2) | 0),
					(s = this.prefixSum[r]),
					(o = s - this.values[r]),
					t < o)
				)
					i = r - 1;
				else if (t >= s) n = r + 1;
				else break;
			return new jo(r, t - o);
		}
	}
	class jo {
		constructor(t, n) {
			(this.index = t),
				(this.remainder = n),
				(this._prefixSumIndexOfResultBrand = void 0),
				(this.index = t),
				(this.remainder = n);
		}
	}
	class Go {
		constructor(t, n, i, r) {
			(this._uri = t),
				(this._lines = n),
				(this._eol = i),
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
			for (const i of n)
				this._acceptDeleteRange(i.range),
					this._acceptInsertText(
						new ee(i.range.startLineNumber, i.range.startColumn),
						i.text,
					);
			(this._versionId = t.versionId), (this._cachedTextValue = null);
		}
		_ensureLineStarts() {
			if (!this._lineStarts) {
				const t = this._eol.length,
					n = this._lines.length,
					i = new Uint32Array(n);
				for (let r = 0; r < n; r++) i[r] = this._lines[r].length + t;
				this._lineStarts = new Vo(i);
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
			const i = no(n);
			if (i.length === 1) {
				this._setLineText(
					t.lineNumber - 1,
					this._lines[t.lineNumber - 1].substring(0, t.column - 1) +
						i[0] +
						this._lines[t.lineNumber - 1].substring(t.column - 1),
				);
				return;
			}
			(i[i.length - 1] += this._lines[t.lineNumber - 1].substring(
				t.column - 1,
			)),
				this._setLineText(
					t.lineNumber - 1,
					this._lines[t.lineNumber - 1].substring(0, t.column - 1) +
						i[0],
				);
			const r = new Uint32Array(i.length - 1);
			for (let s = 1; s < i.length; s++)
				this._lines.splice(t.lineNumber + s - 1, 0, i[s]),
					(r[s - 1] = i[s].length + this._eol.length);
			this._lineStarts && this._lineStarts.insertValues(t.lineNumber, r);
		}
	}
	const $o = "`~!@#$%^&*()-=+[{]}\\|;:'\",.<>/?";
	function Xo(e = "") {
		let t = "(-?\\d*\\.\\d\\w*)|([^";
		for (const n of $o) e.indexOf(n) >= 0 || (t += "\\" + n);
		return (t += "\\s]+)"), new RegExp(t, "g");
	}
	const zi = Xo();
	function Hi(e) {
		let t = zi;
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
	const Ui = new Wa();
	Ui.unshift({ maxLen: 1e3, windowSize: 15, timeBudget: 150 });
	function An(e, t, n, i, r) {
		if (((t = Hi(t)), r || (r = At.first(Ui)), n.length > r.maxLen)) {
			let u = e - r.maxLen / 2;
			return (
				u < 0 ? (u = 0) : (i += u),
				(n = n.substring(u, e + r.maxLen / 2)),
				An(e, t, n, i, r)
			);
		}
		const s = Date.now(),
			o = e - 1 - i;
		let l = -1,
			a = null;
		for (let u = 1; !(Date.now() - s >= r.timeBudget); u++) {
			const c = o - r.windowSize * u;
			t.lastIndex = Math.max(0, c);
			const d = Jo(t, n, o, l);
			if ((!d && a) || ((a = d), c <= 0)) break;
			l = c;
		}
		if (a) {
			const u = {
				word: a[0],
				startColumn: i + 1 + a.index,
				endColumn: i + 1 + a.index + a[0].length,
			};
			return (t.lastIndex = 0), u;
		}
		return null;
	}
	function Jo(e, t, n, i) {
		let r;
		for (; (r = e.exec(t)); ) {
			const s = r.index || 0;
			if (s <= n && e.lastIndex >= n) return r;
			if (i > 0 && s > i) return null;
		}
		return null;
	}
	class Sn {
		constructor(t) {
			const n = Ii(t);
			(this._defaultValue = n),
				(this._asciiMap = Sn._createAsciiMap(n)),
				(this._map = new Map());
		}
		static _createAsciiMap(t) {
			const n = new Uint8Array(256);
			return n.fill(t), n;
		}
		set(t, n) {
			const i = Ii(n);
			t >= 0 && t < 256 ? (this._asciiMap[t] = i) : this._map.set(t, i);
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
	class Yo {
		constructor(t, n, i) {
			const r = new Uint8Array(t * n);
			for (let s = 0, o = t * n; s < o; s++) r[s] = i;
			(this._data = r), (this.rows = t), (this.cols = n);
		}
		get(t, n) {
			return this._data[t * this.cols + n];
		}
		set(t, n, i) {
			this._data[t * this.cols + n] = i;
		}
	}
	class Qo {
		constructor(t) {
			let n = 0,
				i = 0;
			for (let s = 0, o = t.length; s < o; s++) {
				const [l, a, u] = t[s];
				a > n && (n = a), l > i && (i = l), u > i && (i = u);
			}
			n++, i++;
			const r = new Yo(i, n, 0);
			for (let s = 0, o = t.length; s < o; s++) {
				const [l, a, u] = t[s];
				r.set(l, a, u);
			}
			(this._states = r), (this._maxCharCode = n);
		}
		nextState(t, n) {
			return n < 0 || n >= this._maxCharCode ? 0 : this._states.get(t, n);
		}
	}
	let Ln = null;
	function Zo() {
		return (
			Ln === null &&
				(Ln = new Qo([
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
			Ln
		);
	}
	let dt = null;
	function Ko() {
		if (dt === null) {
			dt = new Sn(0);
			const e = ` 	<>'"、。｡､，．：；‘〈「『〔（［｛｢｣｝］）〕』」〉’｀～…`;
			for (let n = 0; n < e.length; n++) dt.set(e.charCodeAt(n), 1);
			const t = ".,;:";
			for (let n = 0; n < t.length; n++) dt.set(t.charCodeAt(n), 2);
		}
		return dt;
	}
	class Wt {
		static _createLink(t, n, i, r, s) {
			let o = s - 1;
			do {
				const l = n.charCodeAt(o);
				if (t.get(l) !== 2) break;
				o--;
			} while (o > r);
			if (r > 0) {
				const l = n.charCodeAt(r - 1),
					a = n.charCodeAt(o);
				((l === 40 && a === 41) ||
					(l === 91 && a === 93) ||
					(l === 123 && a === 125)) &&
					o--;
			}
			return {
				range: {
					startLineNumber: i,
					startColumn: r + 1,
					endLineNumber: i,
					endColumn: o + 2,
				},
				url: n.substring(r, o + 1),
			};
		}
		static computeLinks(t, n = Zo()) {
			const i = Ko(),
				r = [];
			for (let s = 1, o = t.getLineCount(); s <= o; s++) {
				const l = t.getLineContent(s),
					a = l.length;
				let u = 0,
					c = 0,
					d = 0,
					m = 1,
					f = !1,
					w = !1,
					g = !1,
					k = !1;
				for (; u < a; ) {
					let v = !1;
					const y = l.charCodeAt(u);
					if (m === 13) {
						let E;
						switch (y) {
							case 40:
								(f = !0), (E = 0);
								break;
							case 41:
								E = f ? 0 : 1;
								break;
							case 91:
								(g = !0), (w = !0), (E = 0);
								break;
							case 93:
								(g = !1), (E = w ? 0 : 1);
								break;
							case 123:
								(k = !0), (E = 0);
								break;
							case 125:
								E = k ? 0 : 1;
								break;
							case 39:
							case 34:
							case 96:
								d === y
									? (E = 1)
									: d === 39 || d === 34 || d === 96
										? (E = 0)
										: (E = 1);
								break;
							case 42:
								E = d === 42 ? 1 : 0;
								break;
							case 124:
								E = d === 124 ? 1 : 0;
								break;
							case 32:
								E = g ? 0 : 1;
								break;
							default:
								E = i.get(y);
						}
						E === 1 &&
							(r.push(Wt._createLink(i, l, s, c, u)), (v = !0));
					} else if (m === 12) {
						let E;
						y === 91 ? ((w = !0), (E = 0)) : (E = i.get(y)),
							E === 1 ? (v = !0) : (m = 13);
					} else (m = n.nextState(m, y)), m === 0 && (v = !0);
					v &&
						((m = 1),
						(f = !1),
						(w = !1),
						(k = !1),
						(c = u + 1),
						(d = y)),
						u++;
				}
				m === 13 && r.push(Wt._createLink(i, l, s, c, a));
			}
			return r;
		}
	}
	function el(e) {
		return !e ||
			typeof e.getLineCount != "function" ||
			typeof e.getLineContent != "function"
			? []
			: Wt.computeLinks(e);
	}
	class Cn {
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
			this.INSTANCE = new Cn();
		}
		navigateValueSet(t, n, i, r, s) {
			if (t && n) {
				const o = this.doNavigateValueSet(n, s);
				if (o) return { range: t, value: o };
			}
			if (i && r) {
				const o = this.doNavigateValueSet(r, s);
				if (o) return { range: i, value: o };
			}
			return null;
		}
		doNavigateValueSet(t, n) {
			const i = this.numberReplace(t, n);
			return i !== null ? i : this.textReplace(t, n);
		}
		numberReplace(t, n) {
			const i = Math.pow(10, t.length - (t.lastIndexOf(".") + 1));
			let r = Number(t);
			const s = parseFloat(t);
			return !isNaN(r) && !isNaN(s) && r === s
				? r === 0 && !n
					? null
					: ((r = Math.floor(r * i)),
						(r += n ? i : -i),
						String(r / i))
				: null;
		}
		textReplace(t, n) {
			return this.valueSetsReplace(this._defaultValueSet, t, n);
		}
		valueSetsReplace(t, n, i) {
			let r = null;
			for (let s = 0, o = t.length; r === null && s < o; s++)
				r = this.valueSetReplace(t[s], n, i);
			return r;
		}
		valueSetReplace(t, n, i) {
			let r = t.indexOf(n);
			return r >= 0
				? ((r += i ? 1 : -1),
					r < 0 ? (r = t.length - 1) : (r %= t.length),
					t[r])
				: null;
		}
	}
	const Wi = Object.freeze(function (e, t) {
		const n = setTimeout(e.bind(t), 0);
		return {
			dispose() {
				clearTimeout(n);
			},
		};
	});
	var Ft;
	(function (e) {
		function t(n) {
			return n === e.None || n === e.Cancelled || n instanceof Pt
				? !0
				: !n || typeof n != "object"
					? !1
					: typeof n.isCancellationRequested == "boolean" &&
						typeof n.onCancellationRequested == "function";
		}
		(e.isCancellationToken = t),
			(e.None = Object.freeze({
				isCancellationRequested: !1,
				onCancellationRequested: ln.None,
			})),
			(e.Cancelled = Object.freeze({
				isCancellationRequested: !0,
				onCancellationRequested: Wi,
			}));
	})(Ft || (Ft = {}));
	class Pt {
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
				? Wi
				: (this._emitter || (this._emitter = new we()),
					this._emitter.event);
		}
		dispose() {
			this._emitter && (this._emitter.dispose(), (this._emitter = null));
		}
	}
	class tl {
		constructor(t) {
			(this._token = void 0),
				(this._parentListener = void 0),
				(this._parentListener =
					t && t.onCancellationRequested(this.cancel, this));
		}
		get token() {
			return this._token || (this._token = new Pt()), this._token;
		}
		cancel() {
			this._token
				? this._token instanceof Pt && this._token.cancel()
				: (this._token = Ft.Cancelled);
		}
		dispose(t = !1) {
			t && this.cancel(),
				this._parentListener?.dispose(),
				this._token
					? this._token instanceof Pt && this._token.dispose()
					: (this._token = Ft.None);
		}
	}
	class En {
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
	const Bt = new En(),
		Rn = new En(),
		Mn = new En(),
		nl = new Array(230),
		il = Object.create(null),
		rl = Object.create(null);
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
			i = [];
		for (const r of t) {
			const [s, o, l, a, u, c, d, m, f] = r;
			if (
				(i[o] || ((i[o] = !0), (il[l] = o), (rl[l.toLowerCase()] = o)),
				!n[a])
			) {
				if (((n[a] = !0), !u))
					throw new Error(
						`String representation missing for key code ${a} around scan code ${l}`,
					);
				Bt.define(a, u),
					Rn.define(a, m || u),
					Mn.define(a, f || m || u);
			}
			c && (nl[c] = a);
		}
	})();
	var Fi;
	(function (e) {
		function t(l) {
			return Bt.keyCodeToStr(l);
		}
		e.toString = t;
		function n(l) {
			return Bt.strToKeyCode(l);
		}
		e.fromString = n;
		function i(l) {
			return Rn.keyCodeToStr(l);
		}
		e.toUserSettingsUS = i;
		function r(l) {
			return Mn.keyCodeToStr(l);
		}
		e.toUserSettingsGeneral = r;
		function s(l) {
			return Rn.strToKeyCode(l) || Mn.strToKeyCode(l);
		}
		e.fromUserSettings = s;
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
			return Bt.keyCodeToStr(l);
		}
		e.toElectronAccelerator = o;
	})(Fi || (Fi = {}));
	function sl(e, t) {
		const n = ((t & 65535) << 16) >>> 0;
		return (e | n) >>> 0;
	}
	class fe extends $ {
		constructor(t, n, i, r) {
			super(t, n, i, r),
				(this.selectionStartLineNumber = t),
				(this.selectionStartColumn = n),
				(this.positionLineNumber = i),
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
			return fe.selectionsEqual(this, t);
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
				? new fe(this.startLineNumber, this.startColumn, t, n)
				: new fe(t, n, this.startLineNumber, this.startColumn);
		}
		getPosition() {
			return new ee(this.positionLineNumber, this.positionColumn);
		}
		getSelectionStart() {
			return new ee(
				this.selectionStartLineNumber,
				this.selectionStartColumn,
			);
		}
		setStartPosition(t, n) {
			return this.getDirection() === 0
				? new fe(t, n, this.endLineNumber, this.endColumn)
				: new fe(this.endLineNumber, this.endColumn, t, n);
		}
		static fromPositions(t, n = t) {
			return new fe(t.lineNumber, t.column, n.lineNumber, n.column);
		}
		static fromRange(t, n) {
			return n === 0
				? new fe(
						t.startLineNumber,
						t.startColumn,
						t.endLineNumber,
						t.endColumn,
					)
				: new fe(
						t.endLineNumber,
						t.endColumn,
						t.startLineNumber,
						t.startColumn,
					);
		}
		static liftSelection(t) {
			return new fe(
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
			for (let i = 0, r = t.length; i < r; i++)
				if (!this.selectionsEqual(t[i], n[i])) return !1;
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
		static createWithDirection(t, n, i, r, s) {
			return s === 0 ? new fe(t, n, i, r) : new fe(i, r, t, n);
		}
	}
	const Pi = Object.create(null);
	function h(e, t) {
		if (ja(t)) {
			const n = Pi[t];
			if (n === void 0)
				throw new Error(`${e} references an unknown codicon: ${t}`);
			t = n;
		}
		return (Pi[e] = t), { id: e };
	}
	const al = {
			add: h("add", 6e4),
			plus: h("plus", 6e4),
			gistNew: h("gist-new", 6e4),
			repoCreate: h("repo-create", 6e4),
			lightbulb: h("lightbulb", 60001),
			lightBulb: h("light-bulb", 60001),
			repo: h("repo", 60002),
			repoDelete: h("repo-delete", 60002),
			gistFork: h("gist-fork", 60003),
			repoForked: h("repo-forked", 60003),
			gitPullRequest: h("git-pull-request", 60004),
			gitPullRequestAbandoned: h("git-pull-request-abandoned", 60004),
			recordKeys: h("record-keys", 60005),
			keyboard: h("keyboard", 60005),
			tag: h("tag", 60006),
			gitPullRequestLabel: h("git-pull-request-label", 60006),
			tagAdd: h("tag-add", 60006),
			tagRemove: h("tag-remove", 60006),
			person: h("person", 60007),
			personFollow: h("person-follow", 60007),
			personOutline: h("person-outline", 60007),
			personFilled: h("person-filled", 60007),
			gitBranch: h("git-branch", 60008),
			gitBranchCreate: h("git-branch-create", 60008),
			gitBranchDelete: h("git-branch-delete", 60008),
			sourceControl: h("source-control", 60008),
			mirror: h("mirror", 60009),
			mirrorPublic: h("mirror-public", 60009),
			star: h("star", 60010),
			starAdd: h("star-add", 60010),
			starDelete: h("star-delete", 60010),
			starEmpty: h("star-empty", 60010),
			comment: h("comment", 60011),
			commentAdd: h("comment-add", 60011),
			alert: h("alert", 60012),
			warning: h("warning", 60012),
			search: h("search", 60013),
			searchSave: h("search-save", 60013),
			logOut: h("log-out", 60014),
			signOut: h("sign-out", 60014),
			logIn: h("log-in", 60015),
			signIn: h("sign-in", 60015),
			eye: h("eye", 60016),
			eyeUnwatch: h("eye-unwatch", 60016),
			eyeWatch: h("eye-watch", 60016),
			circleFilled: h("circle-filled", 60017),
			primitiveDot: h("primitive-dot", 60017),
			closeDirty: h("close-dirty", 60017),
			debugBreakpoint: h("debug-breakpoint", 60017),
			debugBreakpointDisabled: h("debug-breakpoint-disabled", 60017),
			debugHint: h("debug-hint", 60017),
			terminalDecorationSuccess: h("terminal-decoration-success", 60017),
			primitiveSquare: h("primitive-square", 60018),
			edit: h("edit", 60019),
			pencil: h("pencil", 60019),
			info: h("info", 60020),
			issueOpened: h("issue-opened", 60020),
			gistPrivate: h("gist-private", 60021),
			gitForkPrivate: h("git-fork-private", 60021),
			lock: h("lock", 60021),
			mirrorPrivate: h("mirror-private", 60021),
			close: h("close", 60022),
			removeClose: h("remove-close", 60022),
			x: h("x", 60022),
			repoSync: h("repo-sync", 60023),
			sync: h("sync", 60023),
			clone: h("clone", 60024),
			desktopDownload: h("desktop-download", 60024),
			beaker: h("beaker", 60025),
			microscope: h("microscope", 60025),
			vm: h("vm", 60026),
			deviceDesktop: h("device-desktop", 60026),
			file: h("file", 60027),
			fileText: h("file-text", 60027),
			more: h("more", 60028),
			ellipsis: h("ellipsis", 60028),
			kebabHorizontal: h("kebab-horizontal", 60028),
			mailReply: h("mail-reply", 60029),
			reply: h("reply", 60029),
			organization: h("organization", 60030),
			organizationFilled: h("organization-filled", 60030),
			organizationOutline: h("organization-outline", 60030),
			newFile: h("new-file", 60031),
			fileAdd: h("file-add", 60031),
			newFolder: h("new-folder", 60032),
			fileDirectoryCreate: h("file-directory-create", 60032),
			trash: h("trash", 60033),
			trashcan: h("trashcan", 60033),
			history: h("history", 60034),
			clock: h("clock", 60034),
			folder: h("folder", 60035),
			fileDirectory: h("file-directory", 60035),
			symbolFolder: h("symbol-folder", 60035),
			logoGithub: h("logo-github", 60036),
			markGithub: h("mark-github", 60036),
			github: h("github", 60036),
			terminal: h("terminal", 60037),
			console: h("console", 60037),
			repl: h("repl", 60037),
			zap: h("zap", 60038),
			symbolEvent: h("symbol-event", 60038),
			error: h("error", 60039),
			stop: h("stop", 60039),
			variable: h("variable", 60040),
			symbolVariable: h("symbol-variable", 60040),
			array: h("array", 60042),
			symbolArray: h("symbol-array", 60042),
			symbolModule: h("symbol-module", 60043),
			symbolPackage: h("symbol-package", 60043),
			symbolNamespace: h("symbol-namespace", 60043),
			symbolObject: h("symbol-object", 60043),
			symbolMethod: h("symbol-method", 60044),
			symbolFunction: h("symbol-function", 60044),
			symbolConstructor: h("symbol-constructor", 60044),
			symbolBoolean: h("symbol-boolean", 60047),
			symbolNull: h("symbol-null", 60047),
			symbolNumeric: h("symbol-numeric", 60048),
			symbolNumber: h("symbol-number", 60048),
			symbolStructure: h("symbol-structure", 60049),
			symbolStruct: h("symbol-struct", 60049),
			symbolParameter: h("symbol-parameter", 60050),
			symbolTypeParameter: h("symbol-type-parameter", 60050),
			symbolKey: h("symbol-key", 60051),
			symbolText: h("symbol-text", 60051),
			symbolReference: h("symbol-reference", 60052),
			goToFile: h("go-to-file", 60052),
			symbolEnum: h("symbol-enum", 60053),
			symbolValue: h("symbol-value", 60053),
			symbolRuler: h("symbol-ruler", 60054),
			symbolUnit: h("symbol-unit", 60054),
			activateBreakpoints: h("activate-breakpoints", 60055),
			archive: h("archive", 60056),
			arrowBoth: h("arrow-both", 60057),
			arrowDown: h("arrow-down", 60058),
			arrowLeft: h("arrow-left", 60059),
			arrowRight: h("arrow-right", 60060),
			arrowSmallDown: h("arrow-small-down", 60061),
			arrowSmallLeft: h("arrow-small-left", 60062),
			arrowSmallRight: h("arrow-small-right", 60063),
			arrowSmallUp: h("arrow-small-up", 60064),
			arrowUp: h("arrow-up", 60065),
			bell: h("bell", 60066),
			bold: h("bold", 60067),
			book: h("book", 60068),
			bookmark: h("bookmark", 60069),
			debugBreakpointConditionalUnverified: h(
				"debug-breakpoint-conditional-unverified",
				60070,
			),
			debugBreakpointConditional: h(
				"debug-breakpoint-conditional",
				60071,
			),
			debugBreakpointConditionalDisabled: h(
				"debug-breakpoint-conditional-disabled",
				60071,
			),
			debugBreakpointDataUnverified: h(
				"debug-breakpoint-data-unverified",
				60072,
			),
			debugBreakpointData: h("debug-breakpoint-data", 60073),
			debugBreakpointDataDisabled: h(
				"debug-breakpoint-data-disabled",
				60073,
			),
			debugBreakpointLogUnverified: h(
				"debug-breakpoint-log-unverified",
				60074,
			),
			debugBreakpointLog: h("debug-breakpoint-log", 60075),
			debugBreakpointLogDisabled: h(
				"debug-breakpoint-log-disabled",
				60075,
			),
			briefcase: h("briefcase", 60076),
			broadcast: h("broadcast", 60077),
			browser: h("browser", 60078),
			bug: h("bug", 60079),
			calendar: h("calendar", 60080),
			caseSensitive: h("case-sensitive", 60081),
			check: h("check", 60082),
			checklist: h("checklist", 60083),
			chevronDown: h("chevron-down", 60084),
			chevronLeft: h("chevron-left", 60085),
			chevronRight: h("chevron-right", 60086),
			chevronUp: h("chevron-up", 60087),
			chromeClose: h("chrome-close", 60088),
			chromeMaximize: h("chrome-maximize", 60089),
			chromeMinimize: h("chrome-minimize", 60090),
			chromeRestore: h("chrome-restore", 60091),
			circleOutline: h("circle-outline", 60092),
			circle: h("circle", 60092),
			debugBreakpointUnverified: h("debug-breakpoint-unverified", 60092),
			terminalDecorationIncomplete: h(
				"terminal-decoration-incomplete",
				60092,
			),
			circleSlash: h("circle-slash", 60093),
			circuitBoard: h("circuit-board", 60094),
			clearAll: h("clear-all", 60095),
			clippy: h("clippy", 60096),
			closeAll: h("close-all", 60097),
			cloudDownload: h("cloud-download", 60098),
			cloudUpload: h("cloud-upload", 60099),
			code: h("code", 60100),
			collapseAll: h("collapse-all", 60101),
			colorMode: h("color-mode", 60102),
			commentDiscussion: h("comment-discussion", 60103),
			creditCard: h("credit-card", 60105),
			dash: h("dash", 60108),
			dashboard: h("dashboard", 60109),
			database: h("database", 60110),
			debugContinue: h("debug-continue", 60111),
			debugDisconnect: h("debug-disconnect", 60112),
			debugPause: h("debug-pause", 60113),
			debugRestart: h("debug-restart", 60114),
			debugStart: h("debug-start", 60115),
			debugStepInto: h("debug-step-into", 60116),
			debugStepOut: h("debug-step-out", 60117),
			debugStepOver: h("debug-step-over", 60118),
			debugStop: h("debug-stop", 60119),
			debug: h("debug", 60120),
			deviceCameraVideo: h("device-camera-video", 60121),
			deviceCamera: h("device-camera", 60122),
			deviceMobile: h("device-mobile", 60123),
			diffAdded: h("diff-added", 60124),
			diffIgnored: h("diff-ignored", 60125),
			diffModified: h("diff-modified", 60126),
			diffRemoved: h("diff-removed", 60127),
			diffRenamed: h("diff-renamed", 60128),
			diff: h("diff", 60129),
			diffSidebyside: h("diff-sidebyside", 60129),
			discard: h("discard", 60130),
			editorLayout: h("editor-layout", 60131),
			emptyWindow: h("empty-window", 60132),
			exclude: h("exclude", 60133),
			extensions: h("extensions", 60134),
			eyeClosed: h("eye-closed", 60135),
			fileBinary: h("file-binary", 60136),
			fileCode: h("file-code", 60137),
			fileMedia: h("file-media", 60138),
			filePdf: h("file-pdf", 60139),
			fileSubmodule: h("file-submodule", 60140),
			fileSymlinkDirectory: h("file-symlink-directory", 60141),
			fileSymlinkFile: h("file-symlink-file", 60142),
			fileZip: h("file-zip", 60143),
			files: h("files", 60144),
			filter: h("filter", 60145),
			flame: h("flame", 60146),
			foldDown: h("fold-down", 60147),
			foldUp: h("fold-up", 60148),
			fold: h("fold", 60149),
			folderActive: h("folder-active", 60150),
			folderOpened: h("folder-opened", 60151),
			gear: h("gear", 60152),
			gift: h("gift", 60153),
			gistSecret: h("gist-secret", 60154),
			gist: h("gist", 60155),
			gitCommit: h("git-commit", 60156),
			gitCompare: h("git-compare", 60157),
			compareChanges: h("compare-changes", 60157),
			gitMerge: h("git-merge", 60158),
			githubAction: h("github-action", 60159),
			githubAlt: h("github-alt", 60160),
			globe: h("globe", 60161),
			grabber: h("grabber", 60162),
			graph: h("graph", 60163),
			gripper: h("gripper", 60164),
			heart: h("heart", 60165),
			home: h("home", 60166),
			horizontalRule: h("horizontal-rule", 60167),
			hubot: h("hubot", 60168),
			inbox: h("inbox", 60169),
			issueReopened: h("issue-reopened", 60171),
			issues: h("issues", 60172),
			italic: h("italic", 60173),
			jersey: h("jersey", 60174),
			json: h("json", 60175),
			kebabVertical: h("kebab-vertical", 60176),
			key: h("key", 60177),
			law: h("law", 60178),
			lightbulbAutofix: h("lightbulb-autofix", 60179),
			linkExternal: h("link-external", 60180),
			link: h("link", 60181),
			listOrdered: h("list-ordered", 60182),
			listUnordered: h("list-unordered", 60183),
			liveShare: h("live-share", 60184),
			loading: h("loading", 60185),
			location: h("location", 60186),
			mailRead: h("mail-read", 60187),
			mail: h("mail", 60188),
			markdown: h("markdown", 60189),
			megaphone: h("megaphone", 60190),
			mention: h("mention", 60191),
			milestone: h("milestone", 60192),
			gitPullRequestMilestone: h("git-pull-request-milestone", 60192),
			mortarBoard: h("mortar-board", 60193),
			move: h("move", 60194),
			multipleWindows: h("multiple-windows", 60195),
			mute: h("mute", 60196),
			noNewline: h("no-newline", 60197),
			note: h("note", 60198),
			octoface: h("octoface", 60199),
			openPreview: h("open-preview", 60200),
			package: h("package", 60201),
			paintcan: h("paintcan", 60202),
			pin: h("pin", 60203),
			play: h("play", 60204),
			run: h("run", 60204),
			plug: h("plug", 60205),
			preserveCase: h("preserve-case", 60206),
			preview: h("preview", 60207),
			project: h("project", 60208),
			pulse: h("pulse", 60209),
			question: h("question", 60210),
			quote: h("quote", 60211),
			radioTower: h("radio-tower", 60212),
			reactions: h("reactions", 60213),
			references: h("references", 60214),
			refresh: h("refresh", 60215),
			regex: h("regex", 60216),
			remoteExplorer: h("remote-explorer", 60217),
			remote: h("remote", 60218),
			remove: h("remove", 60219),
			replaceAll: h("replace-all", 60220),
			replace: h("replace", 60221),
			repoClone: h("repo-clone", 60222),
			repoForcePush: h("repo-force-push", 60223),
			repoPull: h("repo-pull", 60224),
			repoPush: h("repo-push", 60225),
			report: h("report", 60226),
			requestChanges: h("request-changes", 60227),
			rocket: h("rocket", 60228),
			rootFolderOpened: h("root-folder-opened", 60229),
			rootFolder: h("root-folder", 60230),
			rss: h("rss", 60231),
			ruby: h("ruby", 60232),
			saveAll: h("save-all", 60233),
			saveAs: h("save-as", 60234),
			save: h("save", 60235),
			screenFull: h("screen-full", 60236),
			screenNormal: h("screen-normal", 60237),
			searchStop: h("search-stop", 60238),
			server: h("server", 60240),
			settingsGear: h("settings-gear", 60241),
			settings: h("settings", 60242),
			shield: h("shield", 60243),
			smiley: h("smiley", 60244),
			sortPrecedence: h("sort-precedence", 60245),
			splitHorizontal: h("split-horizontal", 60246),
			splitVertical: h("split-vertical", 60247),
			squirrel: h("squirrel", 60248),
			starFull: h("star-full", 60249),
			starHalf: h("star-half", 60250),
			symbolClass: h("symbol-class", 60251),
			symbolColor: h("symbol-color", 60252),
			symbolConstant: h("symbol-constant", 60253),
			symbolEnumMember: h("symbol-enum-member", 60254),
			symbolField: h("symbol-field", 60255),
			symbolFile: h("symbol-file", 60256),
			symbolInterface: h("symbol-interface", 60257),
			symbolKeyword: h("symbol-keyword", 60258),
			symbolMisc: h("symbol-misc", 60259),
			symbolOperator: h("symbol-operator", 60260),
			symbolProperty: h("symbol-property", 60261),
			wrench: h("wrench", 60261),
			wrenchSubaction: h("wrench-subaction", 60261),
			symbolSnippet: h("symbol-snippet", 60262),
			tasklist: h("tasklist", 60263),
			telescope: h("telescope", 60264),
			textSize: h("text-size", 60265),
			threeBars: h("three-bars", 60266),
			thumbsdown: h("thumbsdown", 60267),
			thumbsup: h("thumbsup", 60268),
			tools: h("tools", 60269),
			triangleDown: h("triangle-down", 60270),
			triangleLeft: h("triangle-left", 60271),
			triangleRight: h("triangle-right", 60272),
			triangleUp: h("triangle-up", 60273),
			twitter: h("twitter", 60274),
			unfold: h("unfold", 60275),
			unlock: h("unlock", 60276),
			unmute: h("unmute", 60277),
			unverified: h("unverified", 60278),
			verified: h("verified", 60279),
			versions: h("versions", 60280),
			vmActive: h("vm-active", 60281),
			vmOutline: h("vm-outline", 60282),
			vmRunning: h("vm-running", 60283),
			watch: h("watch", 60284),
			whitespace: h("whitespace", 60285),
			wholeWord: h("whole-word", 60286),
			window: h("window", 60287),
			wordWrap: h("word-wrap", 60288),
			zoomIn: h("zoom-in", 60289),
			zoomOut: h("zoom-out", 60290),
			listFilter: h("list-filter", 60291),
			listFlat: h("list-flat", 60292),
			listSelection: h("list-selection", 60293),
			selection: h("selection", 60293),
			listTree: h("list-tree", 60294),
			debugBreakpointFunctionUnverified: h(
				"debug-breakpoint-function-unverified",
				60295,
			),
			debugBreakpointFunction: h("debug-breakpoint-function", 60296),
			debugBreakpointFunctionDisabled: h(
				"debug-breakpoint-function-disabled",
				60296,
			),
			debugStackframeActive: h("debug-stackframe-active", 60297),
			circleSmallFilled: h("circle-small-filled", 60298),
			debugStackframeDot: h("debug-stackframe-dot", 60298),
			terminalDecorationMark: h("terminal-decoration-mark", 60298),
			debugStackframe: h("debug-stackframe", 60299),
			debugStackframeFocused: h("debug-stackframe-focused", 60299),
			debugBreakpointUnsupported: h(
				"debug-breakpoint-unsupported",
				60300,
			),
			symbolString: h("symbol-string", 60301),
			debugReverseContinue: h("debug-reverse-continue", 60302),
			debugStepBack: h("debug-step-back", 60303),
			debugRestartFrame: h("debug-restart-frame", 60304),
			debugAlt: h("debug-alt", 60305),
			callIncoming: h("call-incoming", 60306),
			callOutgoing: h("call-outgoing", 60307),
			menu: h("menu", 60308),
			expandAll: h("expand-all", 60309),
			feedback: h("feedback", 60310),
			gitPullRequestReviewer: h("git-pull-request-reviewer", 60310),
			groupByRefType: h("group-by-ref-type", 60311),
			ungroupByRefType: h("ungroup-by-ref-type", 60312),
			account: h("account", 60313),
			gitPullRequestAssignee: h("git-pull-request-assignee", 60313),
			bellDot: h("bell-dot", 60314),
			debugConsole: h("debug-console", 60315),
			library: h("library", 60316),
			output: h("output", 60317),
			runAll: h("run-all", 60318),
			syncIgnored: h("sync-ignored", 60319),
			pinned: h("pinned", 60320),
			githubInverted: h("github-inverted", 60321),
			serverProcess: h("server-process", 60322),
			serverEnvironment: h("server-environment", 60323),
			pass: h("pass", 60324),
			issueClosed: h("issue-closed", 60324),
			stopCircle: h("stop-circle", 60325),
			playCircle: h("play-circle", 60326),
			record: h("record", 60327),
			debugAltSmall: h("debug-alt-small", 60328),
			vmConnect: h("vm-connect", 60329),
			cloud: h("cloud", 60330),
			merge: h("merge", 60331),
			export: h("export", 60332),
			graphLeft: h("graph-left", 60333),
			magnet: h("magnet", 60334),
			notebook: h("notebook", 60335),
			redo: h("redo", 60336),
			checkAll: h("check-all", 60337),
			pinnedDirty: h("pinned-dirty", 60338),
			passFilled: h("pass-filled", 60339),
			circleLargeFilled: h("circle-large-filled", 60340),
			circleLarge: h("circle-large", 60341),
			circleLargeOutline: h("circle-large-outline", 60341),
			combine: h("combine", 60342),
			gather: h("gather", 60342),
			table: h("table", 60343),
			variableGroup: h("variable-group", 60344),
			typeHierarchy: h("type-hierarchy", 60345),
			typeHierarchySub: h("type-hierarchy-sub", 60346),
			typeHierarchySuper: h("type-hierarchy-super", 60347),
			gitPullRequestCreate: h("git-pull-request-create", 60348),
			runAbove: h("run-above", 60349),
			runBelow: h("run-below", 60350),
			notebookTemplate: h("notebook-template", 60351),
			debugRerun: h("debug-rerun", 60352),
			workspaceTrusted: h("workspace-trusted", 60353),
			workspaceUntrusted: h("workspace-untrusted", 60354),
			workspaceUnknown: h("workspace-unknown", 60355),
			terminalCmd: h("terminal-cmd", 60356),
			terminalDebian: h("terminal-debian", 60357),
			terminalLinux: h("terminal-linux", 60358),
			terminalPowershell: h("terminal-powershell", 60359),
			terminalTmux: h("terminal-tmux", 60360),
			terminalUbuntu: h("terminal-ubuntu", 60361),
			terminalBash: h("terminal-bash", 60362),
			arrowSwap: h("arrow-swap", 60363),
			copy: h("copy", 60364),
			personAdd: h("person-add", 60365),
			filterFilled: h("filter-filled", 60366),
			wand: h("wand", 60367),
			debugLineByLine: h("debug-line-by-line", 60368),
			inspect: h("inspect", 60369),
			layers: h("layers", 60370),
			layersDot: h("layers-dot", 60371),
			layersActive: h("layers-active", 60372),
			compass: h("compass", 60373),
			compassDot: h("compass-dot", 60374),
			compassActive: h("compass-active", 60375),
			azure: h("azure", 60376),
			issueDraft: h("issue-draft", 60377),
			gitPullRequestClosed: h("git-pull-request-closed", 60378),
			gitPullRequestDraft: h("git-pull-request-draft", 60379),
			debugAll: h("debug-all", 60380),
			debugCoverage: h("debug-coverage", 60381),
			runErrors: h("run-errors", 60382),
			folderLibrary: h("folder-library", 60383),
			debugContinueSmall: h("debug-continue-small", 60384),
			beakerStop: h("beaker-stop", 60385),
			graphLine: h("graph-line", 60386),
			graphScatter: h("graph-scatter", 60387),
			pieChart: h("pie-chart", 60388),
			bracket: h("bracket", 60175),
			bracketDot: h("bracket-dot", 60389),
			bracketError: h("bracket-error", 60390),
			lockSmall: h("lock-small", 60391),
			azureDevops: h("azure-devops", 60392),
			verifiedFilled: h("verified-filled", 60393),
			newline: h("newline", 60394),
			layout: h("layout", 60395),
			layoutActivitybarLeft: h("layout-activitybar-left", 60396),
			layoutActivitybarRight: h("layout-activitybar-right", 60397),
			layoutPanelLeft: h("layout-panel-left", 60398),
			layoutPanelCenter: h("layout-panel-center", 60399),
			layoutPanelJustify: h("layout-panel-justify", 60400),
			layoutPanelRight: h("layout-panel-right", 60401),
			layoutPanel: h("layout-panel", 60402),
			layoutSidebarLeft: h("layout-sidebar-left", 60403),
			layoutSidebarRight: h("layout-sidebar-right", 60404),
			layoutStatusbar: h("layout-statusbar", 60405),
			layoutMenubar: h("layout-menubar", 60406),
			layoutCentered: h("layout-centered", 60407),
			target: h("target", 60408),
			indent: h("indent", 60409),
			recordSmall: h("record-small", 60410),
			errorSmall: h("error-small", 60411),
			terminalDecorationError: h("terminal-decoration-error", 60411),
			arrowCircleDown: h("arrow-circle-down", 60412),
			arrowCircleLeft: h("arrow-circle-left", 60413),
			arrowCircleRight: h("arrow-circle-right", 60414),
			arrowCircleUp: h("arrow-circle-up", 60415),
			layoutSidebarRightOff: h("layout-sidebar-right-off", 60416),
			layoutPanelOff: h("layout-panel-off", 60417),
			layoutSidebarLeftOff: h("layout-sidebar-left-off", 60418),
			blank: h("blank", 60419),
			heartFilled: h("heart-filled", 60420),
			map: h("map", 60421),
			mapHorizontal: h("map-horizontal", 60421),
			foldHorizontal: h("fold-horizontal", 60421),
			mapFilled: h("map-filled", 60422),
			mapHorizontalFilled: h("map-horizontal-filled", 60422),
			foldHorizontalFilled: h("fold-horizontal-filled", 60422),
			circleSmall: h("circle-small", 60423),
			bellSlash: h("bell-slash", 60424),
			bellSlashDot: h("bell-slash-dot", 60425),
			commentUnresolved: h("comment-unresolved", 60426),
			gitPullRequestGoToChanges: h(
				"git-pull-request-go-to-changes",
				60427,
			),
			gitPullRequestNewChanges: h("git-pull-request-new-changes", 60428),
			searchFuzzy: h("search-fuzzy", 60429),
			commentDraft: h("comment-draft", 60430),
			send: h("send", 60431),
			sparkle: h("sparkle", 60432),
			insert: h("insert", 60433),
			mic: h("mic", 60434),
			thumbsdownFilled: h("thumbsdown-filled", 60435),
			thumbsupFilled: h("thumbsup-filled", 60436),
			coffee: h("coffee", 60437),
			snake: h("snake", 60438),
			game: h("game", 60439),
			vr: h("vr", 60440),
			chip: h("chip", 60441),
			piano: h("piano", 60442),
			music: h("music", 60443),
			micFilled: h("mic-filled", 60444),
			repoFetch: h("repo-fetch", 60445),
			copilot: h("copilot", 60446),
			lightbulbSparkle: h("lightbulb-sparkle", 60447),
			robot: h("robot", 60448),
			sparkleFilled: h("sparkle-filled", 60449),
			diffSingle: h("diff-single", 60450),
			diffMultiple: h("diff-multiple", 60451),
			surroundWith: h("surround-with", 60452),
			share: h("share", 60453),
			gitStash: h("git-stash", 60454),
			gitStashApply: h("git-stash-apply", 60455),
			gitStashPop: h("git-stash-pop", 60456),
			vscode: h("vscode", 60457),
			vscodeInsiders: h("vscode-insiders", 60458),
			codeOss: h("code-oss", 60459),
			runCoverage: h("run-coverage", 60460),
			runAllCoverage: h("run-all-coverage", 60461),
			coverage: h("coverage", 60462),
			githubProject: h("github-project", 60463),
			mapVertical: h("map-vertical", 60464),
			foldVertical: h("fold-vertical", 60464),
			mapVerticalFilled: h("map-vertical-filled", 60465),
			foldVerticalFilled: h("fold-vertical-filled", 60465),
			goToSearch: h("go-to-search", 60466),
			percentage: h("percentage", 60467),
			sortPercentage: h("sort-percentage", 60467),
			attach: h("attach", 60468),
		},
		ol = {
			dialogError: h("dialog-error", "error"),
			dialogWarning: h("dialog-warning", "warning"),
			dialogInfo: h("dialog-info", "info"),
			dialogClose: h("dialog-close", "close"),
			treeItemExpanded: h("tree-item-expanded", "chevron-down"),
			treeFilterOnTypeOn: h("tree-filter-on-type-on", "list-filter"),
			treeFilterOnTypeOff: h("tree-filter-on-type-off", "list-selection"),
			treeFilterClear: h("tree-filter-clear", "close"),
			treeItemLoading: h("tree-item-loading", "loading"),
			menuSelection: h("menu-selection", "check"),
			menuSubmenu: h("menu-submenu", "chevron-right"),
			menuBarMore: h("menubar-more", "more"),
			scrollbarButtonLeft: h("scrollbar-button-left", "triangle-left"),
			scrollbarButtonRight: h("scrollbar-button-right", "triangle-right"),
			scrollbarButtonUp: h("scrollbar-button-up", "triangle-up"),
			scrollbarButtonDown: h("scrollbar-button-down", "triangle-down"),
			toolBarMore: h("toolbar-more", "more"),
			quickInputBack: h("quick-input-back", "arrow-left"),
			dropDownButton: h("drop-down-button", 60084),
			symbolCustomColor: h("symbol-customcolor", 60252),
			exportIcon: h("export", 60332),
			workspaceUnspecified: h("workspace-unspecified", 60355),
			newLine: h("newline", 60394),
			thumbsDownFilled: h("thumbsdown-filled", 60435),
			thumbsUpFilled: h("thumbsup-filled", 60436),
			gitFetch: h("git-fetch", 60445),
			lightbulbSparkleAutofix: h("lightbulb-sparkle-autofix", 60447),
			debugBreakpointPending: h("debug-breakpoint-pending", 60377),
		},
		P = { ...al, ...ol };
	class Bi {
		constructor() {
			(this._tokenizationSupports = new Map()),
				(this._factories = new Map()),
				(this._onDidChange = new we()),
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
				St(() => {
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
			const i = new ll(this, t, n);
			return (
				this._factories.set(t, i),
				St(() => {
					const r = this._factories.get(t);
					!r || r !== i || (this._factories.delete(t), r.dispose());
				})
			);
		}
		async getOrCreate(t) {
			const n = this.get(t);
			if (n) return n;
			const i = this._factories.get(t);
			return !i || i.isResolved ? null : (await i.resolve(), this.get(t));
		}
		isResolved(t) {
			if (this.get(t)) return !0;
			const i = this._factories.get(t);
			return !!(!i || i.isResolved);
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
	class ll extends Lt {
		get isResolved() {
			return this._isResolved;
		}
		constructor(t, n, i) {
			super(),
				(this._registry = t),
				(this._languageId = n),
				(this._factory = i),
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
	const ul =
		globalThis._VSCODE_NLS_LANGUAGE === "pseudo" ||
		(typeof document < "u" &&
			document.location &&
			document.location.hash.indexOf("pseudo=true") >= 0);
	function qi(e, t) {
		let n;
		return (
			t.length === 0
				? (n = e)
				: (n = e.replace(/\{(\d+)\}/g, (i, r) => {
						const s = r[0],
							o = t[s];
						let l = i;
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
			ul && (n = "［" + n.replace(/[aouei]/g, "$&$&") + "］"),
			n
		);
	}
	function Y(e, t, ...n) {
		return qi(typeof e == "number" ? cl(e, t) : t, n);
	}
	function cl(e, t) {
		const n = globalThis._VSCODE_NLS_MESSAGES?.[e];
		if (typeof n != "string") {
			if (typeof t == "string") return t;
			throw new Error(`!!! NLS MISSING: ${e} !!!`);
		}
		return n;
	}
	class hl {
		constructor(t, n, i) {
			(this.offset = t),
				(this.type = n),
				(this.language = i),
				(this._tokenBrand = void 0);
		}
		toString() {
			return "(" + this.offset + ", " + this.type + ")";
		}
	}
	var Oi;
	(function (e) {
		(e[(e.Increase = 0)] = "Increase"), (e[(e.Decrease = 1)] = "Decrease");
	})(Oi || (Oi = {}));
	var Vi;
	(function (e) {
		const t = new Map();
		t.set(0, P.symbolMethod),
			t.set(1, P.symbolFunction),
			t.set(2, P.symbolConstructor),
			t.set(3, P.symbolField),
			t.set(4, P.symbolVariable),
			t.set(5, P.symbolClass),
			t.set(6, P.symbolStruct),
			t.set(7, P.symbolInterface),
			t.set(8, P.symbolModule),
			t.set(9, P.symbolProperty),
			t.set(10, P.symbolEvent),
			t.set(11, P.symbolOperator),
			t.set(12, P.symbolUnit),
			t.set(13, P.symbolValue),
			t.set(15, P.symbolEnum),
			t.set(14, P.symbolConstant),
			t.set(15, P.symbolEnum),
			t.set(16, P.symbolEnumMember),
			t.set(17, P.symbolKeyword),
			t.set(27, P.symbolSnippet),
			t.set(18, P.symbolText),
			t.set(19, P.symbolColor),
			t.set(20, P.symbolFile),
			t.set(21, P.symbolReference),
			t.set(22, P.symbolCustomColor),
			t.set(23, P.symbolFolder),
			t.set(24, P.symbolTypeParameter),
			t.set(25, P.account),
			t.set(26, P.issues);
		function n(s) {
			let o = t.get(s);
			return (
				o ||
					(console.info(
						"No codicon found for CompletionItemKind " + s,
					),
					(o = P.symbolProperty)),
				o
			);
		}
		e.toIcon = n;
		const i = new Map();
		i.set("method", 0),
			i.set("function", 1),
			i.set("constructor", 2),
			i.set("field", 3),
			i.set("variable", 4),
			i.set("class", 5),
			i.set("struct", 6),
			i.set("interface", 7),
			i.set("module", 8),
			i.set("property", 9),
			i.set("event", 10),
			i.set("operator", 11),
			i.set("unit", 12),
			i.set("value", 13),
			i.set("constant", 14),
			i.set("enum", 15),
			i.set("enum-member", 16),
			i.set("enumMember", 16),
			i.set("keyword", 17),
			i.set("snippet", 27),
			i.set("text", 18),
			i.set("color", 19),
			i.set("file", 20),
			i.set("reference", 21),
			i.set("customcolor", 22),
			i.set("folder", 23),
			i.set("type-parameter", 24),
			i.set("typeParameter", 24),
			i.set("account", 25),
			i.set("issue", 26);
		function r(s, o) {
			let l = i.get(s);
			return typeof l > "u" && !o && (l = 9), l;
		}
		e.fromString = r;
	})(Vi || (Vi = {}));
	var ji;
	(function (e) {
		(e[(e.Automatic = 0)] = "Automatic"),
			(e[(e.Explicit = 1)] = "Explicit");
	})(ji || (ji = {}));
	var Gi;
	(function (e) {
		(e[(e.Automatic = 0)] = "Automatic"), (e[(e.PasteAs = 1)] = "PasteAs");
	})(Gi || (Gi = {}));
	var $i;
	(function (e) {
		(e[(e.Invoke = 1)] = "Invoke"),
			(e[(e.TriggerCharacter = 2)] = "TriggerCharacter"),
			(e[(e.ContentChange = 3)] = "ContentChange");
	})($i || ($i = {}));
	var Xi;
	(function (e) {
		(e[(e.Text = 0)] = "Text"),
			(e[(e.Read = 1)] = "Read"),
			(e[(e.Write = 2)] = "Write");
	})(Xi || (Xi = {})),
		Y("Array", "array"),
		Y("Boolean", "boolean"),
		Y("Class", "class"),
		Y("Constant", "constant"),
		Y("Constructor", "constructor"),
		Y("Enum", "enumeration"),
		Y("EnumMember", "enumeration member"),
		Y("Event", "event"),
		Y("Field", "field"),
		Y("File", "file"),
		Y("Function", "function"),
		Y("Interface", "interface"),
		Y("Key", "key"),
		Y("Method", "method"),
		Y("Module", "module"),
		Y("Namespace", "namespace"),
		Y("Null", "null"),
		Y("Number", "number"),
		Y("Object", "object"),
		Y("Operator", "operator"),
		Y("Package", "package"),
		Y("Property", "property"),
		Y("String", "string"),
		Y("Struct", "struct"),
		Y("TypeParameter", "type parameter"),
		Y("Variable", "variable");
	var Ji;
	(function (e) {
		const t = new Map();
		t.set(0, P.symbolFile),
			t.set(1, P.symbolModule),
			t.set(2, P.symbolNamespace),
			t.set(3, P.symbolPackage),
			t.set(4, P.symbolClass),
			t.set(5, P.symbolMethod),
			t.set(6, P.symbolProperty),
			t.set(7, P.symbolField),
			t.set(8, P.symbolConstructor),
			t.set(9, P.symbolEnum),
			t.set(10, P.symbolInterface),
			t.set(11, P.symbolFunction),
			t.set(12, P.symbolVariable),
			t.set(13, P.symbolConstant),
			t.set(14, P.symbolString),
			t.set(15, P.symbolNumber),
			t.set(16, P.symbolBoolean),
			t.set(17, P.symbolArray),
			t.set(18, P.symbolObject),
			t.set(19, P.symbolKey),
			t.set(20, P.symbolNull),
			t.set(21, P.symbolEnumMember),
			t.set(22, P.symbolStruct),
			t.set(23, P.symbolEvent),
			t.set(24, P.symbolOperator),
			t.set(25, P.symbolTypeParameter);
		function n(i) {
			let r = t.get(i);
			return (
				r ||
					(console.info("No codicon found for SymbolKind " + i),
					(r = P.symbolProperty)),
				r
			);
		}
		e.toIcon = n;
	})(Ji || (Ji = {}));
	let Ac = class qe {
		static {
			this.Comment = new qe("comment");
		}
		static {
			this.Imports = new qe("imports");
		}
		static {
			this.Region = new qe("region");
		}
		static fromValue(t) {
			switch (t) {
				case "comment":
					return qe.Comment;
				case "imports":
					return qe.Imports;
				case "region":
					return qe.Region;
			}
			return new qe(t);
		}
		constructor(t) {
			this.value = t;
		}
	};
	var Yi;
	(function (e) {
		e[(e.AIGenerated = 1)] = "AIGenerated";
	})(Yi || (Yi = {}));
	var Qi;
	(function (e) {
		(e[(e.Invoke = 0)] = "Invoke"), (e[(e.Automatic = 1)] = "Automatic");
	})(Qi || (Qi = {}));
	var Zi;
	(function (e) {
		function t(n) {
			return !n || typeof n != "object"
				? !1
				: typeof n.id == "string" && typeof n.title == "string";
		}
		e.is = t;
	})(Zi || (Zi = {}));
	var Ki;
	(function (e) {
		(e[(e.Type = 1)] = "Type"), (e[(e.Parameter = 2)] = "Parameter");
	})(Ki || (Ki = {})),
		new Bi(),
		new Bi();
	var er;
	(function (e) {
		(e[(e.Invoke = 0)] = "Invoke"), (e[(e.Automatic = 1)] = "Automatic");
	})(er || (er = {}));
	var tr;
	(function (e) {
		(e[(e.Unknown = 0)] = "Unknown"),
			(e[(e.Disabled = 1)] = "Disabled"),
			(e[(e.Enabled = 2)] = "Enabled");
	})(tr || (tr = {}));
	var nr;
	(function (e) {
		(e[(e.Invoke = 1)] = "Invoke"), (e[(e.Auto = 2)] = "Auto");
	})(nr || (nr = {}));
	var ir;
	(function (e) {
		(e[(e.None = 0)] = "None"),
			(e[(e.KeepWhitespace = 1)] = "KeepWhitespace"),
			(e[(e.InsertAsSnippet = 4)] = "InsertAsSnippet");
	})(ir || (ir = {}));
	var rr;
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
	})(rr || (rr = {}));
	var sr;
	(function (e) {
		e[(e.Deprecated = 1)] = "Deprecated";
	})(sr || (sr = {}));
	var ar;
	(function (e) {
		(e[(e.Invoke = 0)] = "Invoke"),
			(e[(e.TriggerCharacter = 1)] = "TriggerCharacter"),
			(e[(e.TriggerForIncompleteCompletions = 2)] =
				"TriggerForIncompleteCompletions");
	})(ar || (ar = {}));
	var or;
	(function (e) {
		(e[(e.EXACT = 0)] = "EXACT"),
			(e[(e.ABOVE = 1)] = "ABOVE"),
			(e[(e.BELOW = 2)] = "BELOW");
	})(or || (or = {}));
	var lr;
	(function (e) {
		(e[(e.NotSet = 0)] = "NotSet"),
			(e[(e.ContentFlush = 1)] = "ContentFlush"),
			(e[(e.RecoverFromMarkers = 2)] = "RecoverFromMarkers"),
			(e[(e.Explicit = 3)] = "Explicit"),
			(e[(e.Paste = 4)] = "Paste"),
			(e[(e.Undo = 5)] = "Undo"),
			(e[(e.Redo = 6)] = "Redo");
	})(lr || (lr = {}));
	var ur;
	(function (e) {
		(e[(e.LF = 1)] = "LF"), (e[(e.CRLF = 2)] = "CRLF");
	})(ur || (ur = {}));
	var cr;
	(function (e) {
		(e[(e.Text = 0)] = "Text"),
			(e[(e.Read = 1)] = "Read"),
			(e[(e.Write = 2)] = "Write");
	})(cr || (cr = {}));
	var hr;
	(function (e) {
		(e[(e.None = 0)] = "None"),
			(e[(e.Keep = 1)] = "Keep"),
			(e[(e.Brackets = 2)] = "Brackets"),
			(e[(e.Advanced = 3)] = "Advanced"),
			(e[(e.Full = 4)] = "Full");
	})(hr || (hr = {}));
	var dr;
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
	})(dr || (dr = {}));
	var mr;
	(function (e) {
		(e[(e.TextDefined = 0)] = "TextDefined"),
			(e[(e.LF = 1)] = "LF"),
			(e[(e.CRLF = 2)] = "CRLF");
	})(mr || (mr = {}));
	var fr;
	(function (e) {
		(e[(e.LF = 0)] = "LF"), (e[(e.CRLF = 1)] = "CRLF");
	})(fr || (fr = {}));
	var pr;
	(function (e) {
		(e[(e.Left = 1)] = "Left"),
			(e[(e.Center = 2)] = "Center"),
			(e[(e.Right = 3)] = "Right");
	})(pr || (pr = {}));
	var gr;
	(function (e) {
		(e[(e.Increase = 0)] = "Increase"), (e[(e.Decrease = 1)] = "Decrease");
	})(gr || (gr = {}));
	var br;
	(function (e) {
		(e[(e.None = 0)] = "None"),
			(e[(e.Indent = 1)] = "Indent"),
			(e[(e.IndentOutdent = 2)] = "IndentOutdent"),
			(e[(e.Outdent = 3)] = "Outdent");
	})(br || (br = {}));
	var _r;
	(function (e) {
		(e[(e.Both = 0)] = "Both"),
			(e[(e.Right = 1)] = "Right"),
			(e[(e.Left = 2)] = "Left"),
			(e[(e.None = 3)] = "None");
	})(_r || (_r = {}));
	var wr;
	(function (e) {
		(e[(e.Type = 1)] = "Type"), (e[(e.Parameter = 2)] = "Parameter");
	})(wr || (wr = {}));
	var vr;
	(function (e) {
		(e[(e.Automatic = 0)] = "Automatic"),
			(e[(e.Explicit = 1)] = "Explicit");
	})(vr || (vr = {}));
	var yr;
	(function (e) {
		(e[(e.Invoke = 0)] = "Invoke"), (e[(e.Automatic = 1)] = "Automatic");
	})(yr || (yr = {}));
	var Nn;
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
	})(Nn || (Nn = {}));
	var Dn;
	(function (e) {
		(e[(e.Hint = 1)] = "Hint"),
			(e[(e.Info = 2)] = "Info"),
			(e[(e.Warning = 4)] = "Warning"),
			(e[(e.Error = 8)] = "Error");
	})(Dn || (Dn = {}));
	var In;
	(function (e) {
		(e[(e.Unnecessary = 1)] = "Unnecessary"),
			(e[(e.Deprecated = 2)] = "Deprecated");
	})(In || (In = {}));
	var xr;
	(function (e) {
		(e[(e.Inline = 1)] = "Inline"), (e[(e.Gutter = 2)] = "Gutter");
	})(xr || (xr = {}));
	var Tr;
	(function (e) {
		(e[(e.Normal = 1)] = "Normal"), (e[(e.Underlined = 2)] = "Underlined");
	})(Tr || (Tr = {}));
	var kr;
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
	})(kr || (kr = {}));
	var Ar;
	(function (e) {
		e[(e.AIGenerated = 1)] = "AIGenerated";
	})(Ar || (Ar = {}));
	var Sr;
	(function (e) {
		(e[(e.Invoke = 0)] = "Invoke"), (e[(e.Automatic = 1)] = "Automatic");
	})(Sr || (Sr = {}));
	var Lr;
	(function (e) {
		(e[(e.TOP_RIGHT_CORNER = 0)] = "TOP_RIGHT_CORNER"),
			(e[(e.BOTTOM_RIGHT_CORNER = 1)] = "BOTTOM_RIGHT_CORNER"),
			(e[(e.TOP_CENTER = 2)] = "TOP_CENTER");
	})(Lr || (Lr = {}));
	var Cr;
	(function (e) {
		(e[(e.Left = 1)] = "Left"),
			(e[(e.Center = 2)] = "Center"),
			(e[(e.Right = 4)] = "Right"),
			(e[(e.Full = 7)] = "Full");
	})(Cr || (Cr = {}));
	var Er;
	(function (e) {
		(e[(e.Word = 0)] = "Word"),
			(e[(e.Line = 1)] = "Line"),
			(e[(e.Suggest = 2)] = "Suggest");
	})(Er || (Er = {}));
	var Rr;
	(function (e) {
		(e[(e.Left = 0)] = "Left"),
			(e[(e.Right = 1)] = "Right"),
			(e[(e.None = 2)] = "None"),
			(e[(e.LeftOfInjectedText = 3)] = "LeftOfInjectedText"),
			(e[(e.RightOfInjectedText = 4)] = "RightOfInjectedText");
	})(Rr || (Rr = {}));
	var Mr;
	(function (e) {
		(e[(e.Off = 0)] = "Off"),
			(e[(e.On = 1)] = "On"),
			(e[(e.Relative = 2)] = "Relative"),
			(e[(e.Interval = 3)] = "Interval"),
			(e[(e.Custom = 4)] = "Custom");
	})(Mr || (Mr = {}));
	var Nr;
	(function (e) {
		(e[(e.None = 0)] = "None"),
			(e[(e.Text = 1)] = "Text"),
			(e[(e.Blocks = 2)] = "Blocks");
	})(Nr || (Nr = {}));
	var Dr;
	(function (e) {
		(e[(e.Smooth = 0)] = "Smooth"), (e[(e.Immediate = 1)] = "Immediate");
	})(Dr || (Dr = {}));
	var Ir;
	(function (e) {
		(e[(e.Auto = 1)] = "Auto"),
			(e[(e.Hidden = 2)] = "Hidden"),
			(e[(e.Visible = 3)] = "Visible");
	})(Ir || (Ir = {}));
	var zn;
	(function (e) {
		(e[(e.LTR = 0)] = "LTR"), (e[(e.RTL = 1)] = "RTL");
	})(zn || (zn = {}));
	var zr;
	(function (e) {
		(e.Off = "off"), (e.OnCode = "onCode"), (e.On = "on");
	})(zr || (zr = {}));
	var Hr;
	(function (e) {
		(e[(e.Invoke = 1)] = "Invoke"),
			(e[(e.TriggerCharacter = 2)] = "TriggerCharacter"),
			(e[(e.ContentChange = 3)] = "ContentChange");
	})(Hr || (Hr = {}));
	var Ur;
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
	})(Ur || (Ur = {}));
	var Wr;
	(function (e) {
		e[(e.Deprecated = 1)] = "Deprecated";
	})(Wr || (Wr = {}));
	var Fr;
	(function (e) {
		(e[(e.Hidden = 0)] = "Hidden"),
			(e[(e.Blink = 1)] = "Blink"),
			(e[(e.Smooth = 2)] = "Smooth"),
			(e[(e.Phase = 3)] = "Phase"),
			(e[(e.Expand = 4)] = "Expand"),
			(e[(e.Solid = 5)] = "Solid");
	})(Fr || (Fr = {}));
	var Pr;
	(function (e) {
		(e[(e.Line = 1)] = "Line"),
			(e[(e.Block = 2)] = "Block"),
			(e[(e.Underline = 3)] = "Underline"),
			(e[(e.LineThin = 4)] = "LineThin"),
			(e[(e.BlockOutline = 5)] = "BlockOutline"),
			(e[(e.UnderlineThin = 6)] = "UnderlineThin");
	})(Pr || (Pr = {}));
	var Br;
	(function (e) {
		(e[(e.AlwaysGrowsWhenTypingAtEdges = 0)] =
			"AlwaysGrowsWhenTypingAtEdges"),
			(e[(e.NeverGrowsWhenTypingAtEdges = 1)] =
				"NeverGrowsWhenTypingAtEdges"),
			(e[(e.GrowsOnlyWhenTypingBefore = 2)] =
				"GrowsOnlyWhenTypingBefore"),
			(e[(e.GrowsOnlyWhenTypingAfter = 3)] = "GrowsOnlyWhenTypingAfter");
	})(Br || (Br = {}));
	var qr;
	(function (e) {
		(e[(e.None = 0)] = "None"),
			(e[(e.Same = 1)] = "Same"),
			(e[(e.Indent = 2)] = "Indent"),
			(e[(e.DeepIndent = 3)] = "DeepIndent");
	})(qr || (qr = {}));
	class dl {
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
			return sl(t, n);
		}
	}
	function ml() {
		return {
			editor: void 0,
			languages: void 0,
			CancellationTokenSource: tl,
			Emitter: we,
			KeyCode: Nn,
			KeyMod: dl,
			Position: ee,
			Range: $,
			Selection: fe,
			SelectionDirection: zn,
			MarkerSeverity: Dn,
			MarkerTag: In,
			Uri: yn,
			Token: hl,
		};
	}
	var Or;
	class fl {
		constructor() {
			(this[Or] = "LinkedMap"),
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
			const i = this._map.get(t);
			if (i) return n !== 0 && this.touch(i, n), i.value;
		}
		set(t, n, i = 0) {
			let r = this._map.get(t);
			if (r) (r.value = n), i !== 0 && this.touch(r, i);
			else {
				switch (
					((r = { key: t, value: n, next: void 0, previous: void 0 }),
					i)
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
			const i = this._state;
			let r = this._head;
			for (; r; ) {
				if (
					(n
						? t.bind(n)(r.value, r.key, this)
						: t(r.value, r.key, this),
					this._state !== i)
				)
					throw new Error("LinkedMap got modified during iteration.");
				r = r.next;
			}
		}
		keys() {
			const t = this,
				n = this._state;
			let i = this._head;
			const r = {
				[Symbol.iterator]() {
					return r;
				},
				next() {
					if (t._state !== n)
						throw new Error(
							"LinkedMap got modified during iteration.",
						);
					if (i) {
						const s = { value: i.key, done: !1 };
						return (i = i.next), s;
					} else return { value: void 0, done: !0 };
				},
			};
			return r;
		}
		values() {
			const t = this,
				n = this._state;
			let i = this._head;
			const r = {
				[Symbol.iterator]() {
					return r;
				},
				next() {
					if (t._state !== n)
						throw new Error(
							"LinkedMap got modified during iteration.",
						);
					if (i) {
						const s = { value: i.value, done: !1 };
						return (i = i.next), s;
					} else return { value: void 0, done: !0 };
				},
			};
			return r;
		}
		entries() {
			const t = this,
				n = this._state;
			let i = this._head;
			const r = {
				[Symbol.iterator]() {
					return r;
				},
				next() {
					if (t._state !== n)
						throw new Error(
							"LinkedMap got modified during iteration.",
						);
					if (i) {
						const s = { value: [i.key, i.value], done: !1 };
						return (i = i.next), s;
					} else return { value: void 0, done: !0 };
				},
			};
			return r;
		}
		[((Or = Symbol.toStringTag), Symbol.iterator)]() {
			return this.entries();
		}
		trimOld(t) {
			if (t >= this.size) return;
			if (t === 0) {
				this.clear();
				return;
			}
			let n = this._head,
				i = this.size;
			for (; n && i > t; ) this._map.delete(n.key), (n = n.next), i--;
			(this._head = n),
				(this._size = i),
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
				i = this.size;
			for (; n && i > t; ) this._map.delete(n.key), (n = n.previous), i--;
			(this._tail = n),
				(this._size = i),
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
					i = t.previous;
				if (!n || !i) throw new Error("Invalid list");
				(n.previous = i), (i.next = n);
			}
			(t.next = void 0), (t.previous = void 0), this._state++;
		}
		touch(t, n) {
			if (!this._head || !this._tail) throw new Error("Invalid list");
			if (!(n !== 1 && n !== 2)) {
				if (n === 1) {
					if (t === this._head) return;
					const i = t.next,
						r = t.previous;
					t === this._tail
						? ((r.next = void 0), (this._tail = r))
						: ((i.previous = r), (r.next = i)),
						(t.previous = void 0),
						(t.next = this._head),
						(this._head.previous = t),
						(this._head = t),
						this._state++;
				} else if (n === 2) {
					if (t === this._tail) return;
					const i = t.next,
						r = t.previous;
					t === this._head
						? ((i.previous = void 0), (this._head = i))
						: ((i.previous = r), (r.next = i)),
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
				this.forEach((n, i) => {
					t.push([i, n]);
				}),
				t
			);
		}
		fromJSON(t) {
			this.clear();
			for (const [n, i] of t) this.set(n, i);
		}
	}
	class pl extends fl {
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
	class gl extends pl {
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
	class bl {
		constructor() {
			this.map = new Map();
		}
		add(t, n) {
			let i = this.map.get(t);
			i || ((i = new Set()), this.map.set(t, i)), i.add(n);
		}
		delete(t, n) {
			const i = this.map.get(t);
			i && (i.delete(n), i.size === 0 && this.map.delete(t));
		}
		forEach(t, n) {
			const i = this.map.get(t);
			i && i.forEach(n);
		}
		get(t) {
			const n = this.map.get(t);
			return n || new Set();
		}
	}
	new gl(10);
	var Vr;
	(function (e) {
		(e[(e.Left = 1)] = "Left"),
			(e[(e.Center = 2)] = "Center"),
			(e[(e.Right = 4)] = "Right"),
			(e[(e.Full = 7)] = "Full");
	})(Vr || (Vr = {}));
	var jr;
	(function (e) {
		(e[(e.Left = 1)] = "Left"),
			(e[(e.Center = 2)] = "Center"),
			(e[(e.Right = 3)] = "Right");
	})(jr || (jr = {}));
	var Gr;
	(function (e) {
		(e[(e.Both = 0)] = "Both"),
			(e[(e.Right = 1)] = "Right"),
			(e[(e.Left = 2)] = "Left"),
			(e[(e.None = 3)] = "None");
	})(Gr || (Gr = {}));
	function _l(e, t, n, i, r) {
		if (i === 0) return !0;
		const s = t.charCodeAt(i - 1);
		if (e.get(s) !== 0 || s === 13 || s === 10) return !0;
		if (r > 0) {
			const o = t.charCodeAt(i);
			if (e.get(o) !== 0) return !0;
		}
		return !1;
	}
	function wl(e, t, n, i, r) {
		if (i + r === n) return !0;
		const s = t.charCodeAt(i + r);
		if (e.get(s) !== 0 || s === 13 || s === 10) return !0;
		if (r > 0) {
			const o = t.charCodeAt(i + r - 1);
			if (e.get(o) !== 0) return !0;
		}
		return !1;
	}
	function vl(e, t, n, i, r) {
		return _l(e, t, n, i, r) && wl(e, t, n, i, r);
	}
	class yl {
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
			let i;
			do {
				if (
					this._prevMatchStartIndex + this._prevMatchLength === n ||
					((i = this._searchRegex.exec(t)), !i)
				)
					return null;
				const r = i.index,
					s = i[0].length;
				if (
					r === this._prevMatchStartIndex &&
					s === this._prevMatchLength
				) {
					if (s === 0) {
						so(t, n, this._searchRegex.lastIndex) > 65535
							? (this._searchRegex.lastIndex += 2)
							: (this._searchRegex.lastIndex += 1);
						continue;
					}
					return null;
				}
				if (
					((this._prevMatchStartIndex = r),
					(this._prevMatchLength = s),
					!this._wordSeparators ||
						vl(this._wordSeparators, t, n, r, s))
				)
					return i;
			} while (i);
			return null;
		}
	}
	function xl(e, t = "Unreachable") {
		throw new Error(t);
	}
	function qt(e) {
		if (!e()) {
			debugger;
			e(), kt(new de("Assertion Failed"));
		}
	}
	function $r(e, t) {
		let n = 0;
		for (; n < e.length - 1; ) {
			const i = e[n],
				r = e[n + 1];
			if (!t(i, r)) return !1;
			n++;
		}
		return !0;
	}
	class Tl {
		static computeUnicodeHighlights(t, n, i) {
			const r = i ? i.startLineNumber : 1,
				s = i ? i.endLineNumber : t.getLineCount(),
				o = new Xr(n),
				l = o.getCandidateCodePoints();
			let a;
			l === "allNonBasicAscii"
				? (a = new RegExp("[^\\t\\n\\r\\x20-\\x7E]", "g"))
				: (a = new RegExp(`${kl(Array.from(l))}`, "g"));
			const u = new yl(null, a),
				c = [];
			let d = !1,
				m,
				f = 0,
				w = 0,
				g = 0;
			e: for (let k = r, v = s; k <= v; k++) {
				const y = t.getLineContent(k),
					E = y.length;
				u.reset(0);
				do
					if (((m = u.next(y)), m)) {
						let R = m.index,
							N = m.index + m[0].length;
						if (R > 0) {
							const T = y.charCodeAt(R - 1);
							Mt(T) && R--;
						}
						if (N + 1 < E) {
							const T = y.charCodeAt(N - 1);
							Mt(T) && N++;
						}
						const M = y.substring(R, N);
						let b = An(R + 1, zi, y, 0);
						b && b.endColumn <= R + 1 && (b = null);
						const p = o.shouldHighlightNonBasicASCII(
							M,
							b ? b.word : null,
						);
						if (p !== 0) {
							if (
								(p === 3
									? f++
									: p === 2
										? w++
										: p === 1
											? g++
											: xl(),
								c.length >= 1e3)
							) {
								d = !0;
								break e;
							}
							c.push(new $(k, R + 1, k, N + 1));
						}
					}
				while (m);
			}
			return {
				ranges: c,
				hasMore: d,
				ambiguousCharacterCount: f,
				invisibleCharacterCount: w,
				nonBasicAsciiCharacterCount: g,
			};
		}
		static computeUnicodeHighlightReason(t, n) {
			const i = new Xr(n);
			switch (i.shouldHighlightNonBasicASCII(t, null)) {
				case 0:
					return null;
				case 2:
					return { kind: 1 };
				case 3: {
					const s = t.codePointAt(0),
						o = i.ambiguousCharacters.getPrimaryConfusable(s),
						l = Ne.getLocales().filter(
							(a) =>
								!Ne.getInstance(
									new Set([...n.allowedLocales, a]),
								).isAmbiguous(s),
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
	function kl(e, t) {
		return `[${to(e.map((i) => String.fromCodePoint(i)).join(""))}]`;
	}
	class Xr {
		constructor(t) {
			(this.options = t),
				(this.allowedCodePoints = new Set(t.allowedCodePoints)),
				(this.ambiguousCharacters = Ne.getInstance(
					new Set(t.allowedLocales),
				));
		}
		getCandidateCodePoints() {
			if (this.options.nonBasicASCII) return "allNonBasicAscii";
			const t = new Set();
			if (this.options.invisibleCharacters)
				for (const n of Ve.codePoints)
					Jr(String.fromCodePoint(n)) || t.add(n);
			if (this.options.ambiguousCharacters)
				for (const n of this.ambiguousCharacters.getConfusableCodePoints())
					t.add(n);
			for (const n of this.allowedCodePoints) t.delete(n);
			return t;
		}
		shouldHighlightNonBasicASCII(t, n) {
			const i = t.codePointAt(0);
			if (this.allowedCodePoints.has(i)) return 0;
			if (this.options.nonBasicASCII) return 1;
			let r = !1,
				s = !1;
			if (n)
				for (const o of n) {
					const l = o.codePointAt(0),
						a = oo(o);
					(r = r || a),
						!a &&
							!this.ambiguousCharacters.isAmbiguous(l) &&
							!Ve.isInvisibleCharacter(l) &&
							(s = !0);
				}
			return !r && s
				? 0
				: this.options.invisibleCharacters &&
						!Jr(t) &&
						Ve.isInvisibleCharacter(i)
					? 2
					: this.options.ambiguousCharacters &&
							this.ambiguousCharacters.isAmbiguous(i)
						? 3
						: 0;
		}
	}
	function Jr(e) {
		return (
			e === " " ||
			e ===
				`
` ||
			e === "	"
		);
	}
	class Ot {
		constructor(t, n, i) {
			(this.changes = t), (this.moves = n), (this.hitTimeout = i);
		}
	}
	class Al {
		constructor(t, n) {
			(this.lineRangeMapping = t), (this.changes = n);
		}
	}
	class j {
		static addRange(t, n) {
			let i = 0;
			for (; i < n.length && n[i].endExclusive < t.start; ) i++;
			let r = i;
			for (; r < n.length && n[r].start <= t.endExclusive; ) r++;
			if (i === r) n.splice(i, 0, t);
			else {
				const s = Math.min(t.start, n[i].start),
					o = Math.max(t.endExclusive, n[r - 1].endExclusive);
				n.splice(i, r - i, new j(s, o));
			}
		}
		static tryCreate(t, n) {
			if (!(t > n)) return new j(t, n);
		}
		static ofLength(t) {
			return new j(0, t);
		}
		static ofStartAndLength(t, n) {
			return new j(t, t + n);
		}
		constructor(t, n) {
			if (((this.start = t), (this.endExclusive = n), t > n))
				throw new de(`Invalid range: ${this.toString()}`);
		}
		get isEmpty() {
			return this.start === this.endExclusive;
		}
		delta(t) {
			return new j(this.start + t, this.endExclusive + t);
		}
		deltaStart(t) {
			return new j(this.start + t, this.endExclusive);
		}
		deltaEnd(t) {
			return new j(this.start, this.endExclusive + t);
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
			return new j(
				Math.min(this.start, t.start),
				Math.max(this.endExclusive, t.endExclusive),
			);
		}
		intersect(t) {
			const n = Math.max(this.start, t.start),
				i = Math.min(this.endExclusive, t.endExclusive);
			if (n <= i) return new j(n, i);
		}
		intersects(t) {
			const n = Math.max(this.start, t.start),
				i = Math.min(this.endExclusive, t.endExclusive);
			return n < i;
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
				throw new de(`Invalid clipping range: ${this.toString()}`);
			return Math.max(this.start, Math.min(this.endExclusive - 1, t));
		}
		clipCyclic(t) {
			if (this.isEmpty)
				throw new de(`Invalid clipping range: ${this.toString()}`);
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
	function et(e, t) {
		const n = mt(e, t);
		return n === -1 ? void 0 : e[n];
	}
	function mt(e, t, n = 0, i = e.length) {
		let r = n,
			s = i;
		for (; r < s; ) {
			const o = Math.floor((r + s) / 2);
			t(e[o]) ? (r = o + 1) : (s = o);
		}
		return r - 1;
	}
	function Sl(e, t) {
		const n = Hn(e, t);
		return n === e.length ? void 0 : e[n];
	}
	function Hn(e, t, n = 0, i = e.length) {
		let r = n,
			s = i;
		for (; r < s; ) {
			const o = Math.floor((r + s) / 2);
			t(e[o]) ? (s = o) : (r = o + 1);
		}
		return r;
	}
	class Vt {
		static {
			this.assertInvariants = !1;
		}
		constructor(t) {
			(this._array = t), (this._findLastMonotonousLastIdx = 0);
		}
		findLastMonotonous(t) {
			if (Vt.assertInvariants) {
				if (this._prevFindLastPredicate) {
					for (const i of this._array)
						if (this._prevFindLastPredicate(i) && !t(i))
							throw new Error(
								"MonotonousArray: current predicate must be weaker than (or equal to) the previous predicate.",
							);
				}
				this._prevFindLastPredicate = t;
			}
			const n = mt(this._array, t, this._findLastMonotonousLastIdx);
			return (
				(this._findLastMonotonousLastIdx = n + 1),
				n === -1 ? void 0 : this._array[n]
			);
		}
	}
	class q {
		static fromRangeInclusive(t) {
			return new q(t.startLineNumber, t.endLineNumber + 1);
		}
		static joinMany(t) {
			if (t.length === 0) return [];
			let n = new Se(t[0].slice());
			for (let i = 1; i < t.length; i++)
				n = n.getUnion(new Se(t[i].slice()));
			return n.ranges;
		}
		static join(t) {
			if (t.length === 0) throw new de("lineRanges cannot be empty");
			let n = t[0].startLineNumber,
				i = t[0].endLineNumberExclusive;
			for (let r = 1; r < t.length; r++)
				(n = Math.min(n, t[r].startLineNumber)),
					(i = Math.max(i, t[r].endLineNumberExclusive));
			return new q(n, i);
		}
		static ofLength(t, n) {
			return new q(t, t + n);
		}
		static deserialize(t) {
			return new q(t[0], t[1]);
		}
		constructor(t, n) {
			if (t > n)
				throw new de(
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
			return new q(
				this.startLineNumber + t,
				this.endLineNumberExclusive + t,
			);
		}
		deltaLength(t) {
			return new q(this.startLineNumber, this.endLineNumberExclusive + t);
		}
		get length() {
			return this.endLineNumberExclusive - this.startLineNumber;
		}
		join(t) {
			return new q(
				Math.min(this.startLineNumber, t.startLineNumber),
				Math.max(this.endLineNumberExclusive, t.endLineNumberExclusive),
			);
		}
		toString() {
			return `[${this.startLineNumber},${this.endLineNumberExclusive})`;
		}
		intersect(t) {
			const n = Math.max(this.startLineNumber, t.startLineNumber),
				i = Math.min(
					this.endLineNumberExclusive,
					t.endLineNumberExclusive,
				);
			if (n <= i) return new q(n, i);
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
				: new $(
						this.startLineNumber,
						1,
						this.endLineNumberExclusive - 1,
						Number.MAX_SAFE_INTEGER,
					);
		}
		toExclusiveRange() {
			return new $(
				this.startLineNumber,
				1,
				this.endLineNumberExclusive,
				1,
			);
		}
		mapToLineArray(t) {
			const n = [];
			for (
				let i = this.startLineNumber;
				i < this.endLineNumberExclusive;
				i++
			)
				n.push(t(i));
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
			return new j(
				this.startLineNumber - 1,
				this.endLineNumberExclusive - 1,
			);
		}
	}
	class Se {
		constructor(t = []) {
			this._normalizedRanges = t;
		}
		get ranges() {
			return this._normalizedRanges;
		}
		addRange(t) {
			if (t.length === 0) return;
			const n = Hn(
					this._normalizedRanges,
					(r) => r.endLineNumberExclusive >= t.startLineNumber,
				),
				i =
					mt(
						this._normalizedRanges,
						(r) => r.startLineNumber <= t.endLineNumberExclusive,
					) + 1;
			if (n === i) this._normalizedRanges.splice(n, 0, t);
			else if (n === i - 1) {
				const r = this._normalizedRanges[n];
				this._normalizedRanges[n] = r.join(t);
			} else {
				const r = this._normalizedRanges[n]
					.join(this._normalizedRanges[i - 1])
					.join(t);
				this._normalizedRanges.splice(n, i - n, r);
			}
		}
		contains(t) {
			const n = et(this._normalizedRanges, (i) => i.startLineNumber <= t);
			return !!n && n.endLineNumberExclusive > t;
		}
		intersects(t) {
			const n = et(
				this._normalizedRanges,
				(i) => i.startLineNumber < t.endLineNumberExclusive,
			);
			return !!n && n.endLineNumberExclusive > t.startLineNumber;
		}
		getUnion(t) {
			if (this._normalizedRanges.length === 0) return t;
			if (t._normalizedRanges.length === 0) return this;
			const n = [];
			let i = 0,
				r = 0,
				s = null;
			for (
				;
				i < this._normalizedRanges.length ||
				r < t._normalizedRanges.length;
			) {
				let o = null;
				if (
					i < this._normalizedRanges.length &&
					r < t._normalizedRanges.length
				) {
					const l = this._normalizedRanges[i],
						a = t._normalizedRanges[r];
					l.startLineNumber < a.startLineNumber
						? ((o = l), i++)
						: ((o = a), r++);
				} else
					i < this._normalizedRanges.length
						? ((o = this._normalizedRanges[i]), i++)
						: ((o = t._normalizedRanges[r]), r++);
				s === null
					? (s = o)
					: s.endLineNumberExclusive >= o.startLineNumber
						? (s = new q(
								s.startLineNumber,
								Math.max(
									s.endLineNumberExclusive,
									o.endLineNumberExclusive,
								),
							))
						: (n.push(s), (s = o));
			}
			return s !== null && n.push(s), new Se(n);
		}
		subtractFrom(t) {
			const n = Hn(
					this._normalizedRanges,
					(o) => o.endLineNumberExclusive >= t.startLineNumber,
				),
				i =
					mt(
						this._normalizedRanges,
						(o) => o.startLineNumber <= t.endLineNumberExclusive,
					) + 1;
			if (n === i) return new Se([t]);
			const r = [];
			let s = t.startLineNumber;
			for (let o = n; o < i; o++) {
				const l = this._normalizedRanges[o];
				l.startLineNumber > s && r.push(new q(s, l.startLineNumber)),
					(s = l.endLineNumberExclusive);
			}
			return (
				s < t.endLineNumberExclusive &&
					r.push(new q(s, t.endLineNumberExclusive)),
				new Se(r)
			);
		}
		toString() {
			return this._normalizedRanges.map((t) => t.toString()).join(", ");
		}
		getIntersection(t) {
			const n = [];
			let i = 0,
				r = 0;
			for (
				;
				i < this._normalizedRanges.length &&
				r < t._normalizedRanges.length;
			) {
				const s = this._normalizedRanges[i],
					o = t._normalizedRanges[r],
					l = s.intersect(o);
				l && !l.isEmpty && n.push(l),
					s.endLineNumberExclusive < o.endLineNumberExclusive
						? i++
						: r++;
			}
			return new Se(n);
		}
		getWithDelta(t) {
			return new Se(this._normalizedRanges.map((n) => n.delta(t)));
		}
	}
	class tt {
		static {
			this.zero = new tt(0, 0);
		}
		static betweenPositions(t, n) {
			return t.lineNumber === n.lineNumber
				? new tt(0, n.column - t.column)
				: new tt(n.lineNumber - t.lineNumber, n.column - 1);
		}
		static ofRange(t) {
			return tt.betweenPositions(
				t.getStartPosition(),
				t.getEndPosition(),
			);
		}
		static ofText(t) {
			let n = 0,
				i = 0;
			for (const r of t)
				r ===
				`
`
					? (n++, (i = 0))
					: i++;
			return new tt(n, i);
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
				? new $(
						t.lineNumber,
						t.column,
						t.lineNumber,
						t.column + this.columnCount,
					)
				: new $(
						t.lineNumber,
						t.column,
						t.lineNumber + this.lineCount,
						this.columnCount + 1,
					);
		}
		addToPosition(t) {
			return this.lineCount === 0
				? new ee(t.lineNumber, t.column + this.columnCount)
				: new ee(t.lineNumber + this.lineCount, this.columnCount + 1);
		}
		toString() {
			return `${this.lineCount},${this.columnCount}`;
		}
	}
	class Ll {
		constructor(t, n) {
			(this.range = t), (this.text = n);
		}
		toSingleEditOperation() {
			return { range: this.range, text: this.text };
		}
	}
	class be {
		static inverse(t, n, i) {
			const r = [];
			let s = 1,
				o = 1;
			for (const a of t) {
				const u = new be(
					new q(s, a.original.startLineNumber),
					new q(o, a.modified.startLineNumber),
				);
				u.modified.isEmpty || r.push(u),
					(s = a.original.endLineNumberExclusive),
					(o = a.modified.endLineNumberExclusive);
			}
			const l = new be(new q(s, n + 1), new q(o, i + 1));
			return l.modified.isEmpty || r.push(l), r;
		}
		static clip(t, n, i) {
			const r = [];
			for (const s of t) {
				const o = s.original.intersect(n),
					l = s.modified.intersect(i);
				o && !o.isEmpty && l && !l.isEmpty && r.push(new be(o, l));
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
			return new be(this.modified, this.original);
		}
		join(t) {
			return new be(
				this.original.join(t.original),
				this.modified.join(t.modified),
			);
		}
		toRangeMapping() {
			const t = this.original.toInclusiveRange(),
				n = this.modified.toInclusiveRange();
			if (t && n) return new ye(t, n);
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
					throw new de("not a valid diff");
				return new ye(
					new $(
						this.original.startLineNumber,
						1,
						this.original.endLineNumberExclusive,
						1,
					),
					new $(
						this.modified.startLineNumber,
						1,
						this.modified.endLineNumberExclusive,
						1,
					),
				);
			} else
				return new ye(
					new $(
						this.original.startLineNumber - 1,
						Number.MAX_SAFE_INTEGER,
						this.original.endLineNumberExclusive - 1,
						Number.MAX_SAFE_INTEGER,
					),
					new $(
						this.modified.startLineNumber - 1,
						Number.MAX_SAFE_INTEGER,
						this.modified.endLineNumberExclusive - 1,
						Number.MAX_SAFE_INTEGER,
					),
				);
		}
		toRangeMapping2(t, n) {
			if (
				Yr(this.original.endLineNumberExclusive, t) &&
				Yr(this.modified.endLineNumberExclusive, n)
			)
				return new ye(
					new $(
						this.original.startLineNumber,
						1,
						this.original.endLineNumberExclusive,
						1,
					),
					new $(
						this.modified.startLineNumber,
						1,
						this.modified.endLineNumberExclusive,
						1,
					),
				);
			if (!this.original.isEmpty && !this.modified.isEmpty)
				return new ye(
					$.fromPositions(
						new ee(this.original.startLineNumber, 1),
						nt(
							new ee(
								this.original.endLineNumberExclusive - 1,
								Number.MAX_SAFE_INTEGER,
							),
							t,
						),
					),
					$.fromPositions(
						new ee(this.modified.startLineNumber, 1),
						nt(
							new ee(
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
				return new ye(
					$.fromPositions(
						nt(
							new ee(
								this.original.startLineNumber - 1,
								Number.MAX_SAFE_INTEGER,
							),
							t,
						),
						nt(
							new ee(
								this.original.endLineNumberExclusive - 1,
								Number.MAX_SAFE_INTEGER,
							),
							t,
						),
					),
					$.fromPositions(
						nt(
							new ee(
								this.modified.startLineNumber - 1,
								Number.MAX_SAFE_INTEGER,
							),
							n,
						),
						nt(
							new ee(
								this.modified.endLineNumberExclusive - 1,
								Number.MAX_SAFE_INTEGER,
							),
							n,
						),
					),
				);
			throw new de();
		}
	}
	function nt(e, t) {
		if (e.lineNumber < 1) return new ee(1, 1);
		if (e.lineNumber > t.length)
			return new ee(t.length, t[t.length - 1].length + 1);
		const n = t[e.lineNumber - 1];
		return e.column > n.length + 1 ? new ee(e.lineNumber, n.length + 1) : e;
	}
	function Yr(e, t) {
		return e >= 1 && e <= t.length;
	}
	class Ee extends be {
		static fromRangeMappings(t) {
			const n = q.join(
					t.map((r) => q.fromRangeInclusive(r.originalRange)),
				),
				i = q.join(t.map((r) => q.fromRangeInclusive(r.modifiedRange)));
			return new Ee(n, i, t);
		}
		constructor(t, n, i) {
			super(t, n), (this.innerChanges = i);
		}
		flip() {
			return new Ee(
				this.modified,
				this.original,
				this.innerChanges?.map((t) => t.flip()),
			);
		}
		withInnerChangesFromLineRanges() {
			return new Ee(this.original, this.modified, [
				this.toRangeMapping(),
			]);
		}
	}
	class ye {
		static assertSorted(t) {
			for (let n = 1; n < t.length; n++) {
				const i = t[n - 1],
					r = t[n];
				if (
					!(
						i.originalRange
							.getEndPosition()
							.isBeforeOrEqual(
								r.originalRange.getStartPosition(),
							) &&
						i.modifiedRange
							.getEndPosition()
							.isBeforeOrEqual(r.modifiedRange.getStartPosition())
					)
				)
					throw new de("Range mappings must be sorted");
			}
		}
		constructor(t, n) {
			(this.originalRange = t), (this.modifiedRange = n);
		}
		toString() {
			return `{${this.originalRange.toString()}->${this.modifiedRange.toString()}}`;
		}
		flip() {
			return new ye(this.modifiedRange, this.originalRange);
		}
		toTextEdit(t) {
			const n = t.getValueOfRange(this.modifiedRange);
			return new Ll(this.originalRange, n);
		}
	}
	const Cl = 3;
	class El {
		computeDiff(t, n, i) {
			const s = new Nl(t, n, {
					maxComputationTime: i.maxComputationTimeMs,
					shouldIgnoreTrimWhitespace: i.ignoreTrimWhitespace,
					shouldComputeCharChanges: !0,
					shouldMakePrettyDiff: !0,
					shouldPostProcessCharChanges: !0,
				}).computeDiff(),
				o = [];
			let l = null;
			for (const a of s.changes) {
				let u;
				a.originalEndLineNumber === 0
					? (u = new q(
							a.originalStartLineNumber + 1,
							a.originalStartLineNumber + 1,
						))
					: (u = new q(
							a.originalStartLineNumber,
							a.originalEndLineNumber + 1,
						));
				let c;
				a.modifiedEndLineNumber === 0
					? (c = new q(
							a.modifiedStartLineNumber + 1,
							a.modifiedStartLineNumber + 1,
						))
					: (c = new q(
							a.modifiedStartLineNumber,
							a.modifiedEndLineNumber + 1,
						));
				let d = new Ee(
					u,
					c,
					a.charChanges?.map(
						(m) =>
							new ye(
								new $(
									m.originalStartLineNumber,
									m.originalStartColumn,
									m.originalEndLineNumber,
									m.originalEndColumn,
								),
								new $(
									m.modifiedStartLineNumber,
									m.modifiedStartColumn,
									m.modifiedEndLineNumber,
									m.modifiedEndColumn,
								),
							),
					),
				);
				l &&
					(l.modified.endLineNumberExclusive ===
						d.modified.startLineNumber ||
						l.original.endLineNumberExclusive ===
							d.original.startLineNumber) &&
					((d = new Ee(
						l.original.join(d.original),
						l.modified.join(d.modified),
						l.innerChanges && d.innerChanges
							? l.innerChanges.concat(d.innerChanges)
							: void 0,
					)),
					o.pop()),
					o.push(d),
					(l = d);
			}
			return (
				qt(() =>
					$r(
						o,
						(a, u) =>
							u.original.startLineNumber -
								a.original.endLineNumberExclusive ===
								u.modified.startLineNumber -
									a.modified.endLineNumberExclusive &&
							a.original.endLineNumberExclusive <
								u.original.startLineNumber &&
							a.modified.endLineNumberExclusive <
								u.modified.startLineNumber,
					),
				),
				new Ot(o, [], s.quitEarly)
			);
		}
	}
	function Qr(e, t, n, i) {
		return new Ie(e, t, n).ComputeDiff(i);
	}
	let Zr = class {
		constructor(t) {
			const n = [],
				i = [];
			for (let r = 0, s = t.length; r < s; r++)
				(n[r] = Un(t[r], 1)), (i[r] = Wn(t[r], 1));
			(this.lines = t), (this._startColumns = n), (this._endColumns = i);
		}
		getElements() {
			const t = [];
			for (let n = 0, i = this.lines.length; n < i; n++)
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
		createCharSequence(t, n, i) {
			const r = [],
				s = [],
				o = [];
			let l = 0;
			for (let a = n; a <= i; a++) {
				const u = this.lines[a],
					c = t ? this._startColumns[a] : 1,
					d = t ? this._endColumns[a] : u.length + 1;
				for (let m = c; m < d; m++)
					(r[l] = u.charCodeAt(m - 1)),
						(s[l] = a + 1),
						(o[l] = m),
						l++;
				!t &&
					a < i &&
					((r[l] = 10), (s[l] = a + 1), (o[l] = u.length + 1), l++);
			}
			return new Rl(r, s, o);
		}
	};
	class Rl {
		constructor(t, n, i) {
			(this._charCodes = t), (this._lineNumbers = n), (this._columns = i);
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
	class it {
		constructor(t, n, i, r, s, o, l, a) {
			(this.originalStartLineNumber = t),
				(this.originalStartColumn = n),
				(this.originalEndLineNumber = i),
				(this.originalEndColumn = r),
				(this.modifiedStartLineNumber = s),
				(this.modifiedStartColumn = o),
				(this.modifiedEndLineNumber = l),
				(this.modifiedEndColumn = a);
		}
		static createFromDiffChange(t, n, i) {
			const r = n.getStartLineNumber(t.originalStart),
				s = n.getStartColumn(t.originalStart),
				o = n.getEndLineNumber(t.originalStart + t.originalLength - 1),
				l = n.getEndColumn(t.originalStart + t.originalLength - 1),
				a = i.getStartLineNumber(t.modifiedStart),
				u = i.getStartColumn(t.modifiedStart),
				c = i.getEndLineNumber(t.modifiedStart + t.modifiedLength - 1),
				d = i.getEndColumn(t.modifiedStart + t.modifiedLength - 1);
			return new it(r, s, o, l, a, u, c, d);
		}
	}
	function Ml(e) {
		if (e.length <= 1) return e;
		const t = [e[0]];
		let n = t[0];
		for (let i = 1, r = e.length; i < r; i++) {
			const s = e[i],
				o = s.originalStart - (n.originalStart + n.originalLength),
				l = s.modifiedStart - (n.modifiedStart + n.modifiedLength);
			Math.min(o, l) < Cl
				? ((n.originalLength =
						s.originalStart + s.originalLength - n.originalStart),
					(n.modifiedLength =
						s.modifiedStart + s.modifiedLength - n.modifiedStart))
				: (t.push(s), (n = s));
		}
		return t;
	}
	class ft {
		constructor(t, n, i, r, s) {
			(this.originalStartLineNumber = t),
				(this.originalEndLineNumber = n),
				(this.modifiedStartLineNumber = i),
				(this.modifiedEndLineNumber = r),
				(this.charChanges = s);
		}
		static createFromDiffResult(t, n, i, r, s, o, l) {
			let a, u, c, d, m;
			if (
				(n.originalLength === 0
					? ((a = i.getStartLineNumber(n.originalStart) - 1), (u = 0))
					: ((a = i.getStartLineNumber(n.originalStart)),
						(u = i.getEndLineNumber(
							n.originalStart + n.originalLength - 1,
						))),
				n.modifiedLength === 0
					? ((c = r.getStartLineNumber(n.modifiedStart) - 1), (d = 0))
					: ((c = r.getStartLineNumber(n.modifiedStart)),
						(d = r.getEndLineNumber(
							n.modifiedStart + n.modifiedLength - 1,
						))),
				o &&
					n.originalLength > 0 &&
					n.originalLength < 20 &&
					n.modifiedLength > 0 &&
					n.modifiedLength < 20 &&
					s())
			) {
				const f = i.createCharSequence(
						t,
						n.originalStart,
						n.originalStart + n.originalLength - 1,
					),
					w = r.createCharSequence(
						t,
						n.modifiedStart,
						n.modifiedStart + n.modifiedLength - 1,
					);
				if (f.getElements().length > 0 && w.getElements().length > 0) {
					let g = Qr(f, w, s, !0).changes;
					l && (g = Ml(g)), (m = []);
					for (let k = 0, v = g.length; k < v; k++)
						m.push(it.createFromDiffChange(g[k], f, w));
				}
			}
			return new ft(a, u, c, d, m);
		}
	}
	class Nl {
		constructor(t, n, i) {
			(this.shouldComputeCharChanges = i.shouldComputeCharChanges),
				(this.shouldPostProcessCharChanges =
					i.shouldPostProcessCharChanges),
				(this.shouldIgnoreTrimWhitespace =
					i.shouldIgnoreTrimWhitespace),
				(this.shouldMakePrettyDiff = i.shouldMakePrettyDiff),
				(this.originalLines = t),
				(this.modifiedLines = n),
				(this.original = new Zr(t)),
				(this.modified = new Zr(n)),
				(this.continueLineDiff = Kr(i.maxComputationTime)),
				(this.continueCharDiff = Kr(
					i.maxComputationTime === 0
						? 0
						: Math.min(i.maxComputationTime, 5e3),
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
			const t = Qr(
					this.original,
					this.modified,
					this.continueLineDiff,
					this.shouldMakePrettyDiff,
				),
				n = t.changes,
				i = t.quitEarly;
			if (this.shouldIgnoreTrimWhitespace) {
				const l = [];
				for (let a = 0, u = n.length; a < u; a++)
					l.push(
						ft.createFromDiffResult(
							this.shouldIgnoreTrimWhitespace,
							n[a],
							this.original,
							this.modified,
							this.continueCharDiff,
							this.shouldComputeCharChanges,
							this.shouldPostProcessCharChanges,
						),
					);
				return { quitEarly: i, changes: l };
			}
			const r = [];
			let s = 0,
				o = 0;
			for (let l = -1, a = n.length; l < a; l++) {
				const u = l + 1 < a ? n[l + 1] : null,
					c = u ? u.originalStart : this.originalLines.length,
					d = u ? u.modifiedStart : this.modifiedLines.length;
				for (; s < c && o < d; ) {
					const m = this.originalLines[s],
						f = this.modifiedLines[o];
					if (m !== f) {
						{
							let w = Un(m, 1),
								g = Un(f, 1);
							for (; w > 1 && g > 1; ) {
								const k = m.charCodeAt(w - 2),
									v = f.charCodeAt(g - 2);
								if (k !== v) break;
								w--, g--;
							}
							(w > 1 || g > 1) &&
								this._pushTrimWhitespaceCharChange(
									r,
									s + 1,
									1,
									w,
									o + 1,
									1,
									g,
								);
						}
						{
							let w = Wn(m, 1),
								g = Wn(f, 1);
							const k = m.length + 1,
								v = f.length + 1;
							for (; w < k && g < v; ) {
								const y = m.charCodeAt(w - 1),
									E = m.charCodeAt(g - 1);
								if (y !== E) break;
								w++, g++;
							}
							(w < k || g < v) &&
								this._pushTrimWhitespaceCharChange(
									r,
									s + 1,
									w,
									k,
									o + 1,
									g,
									v,
								);
						}
					}
					s++, o++;
				}
				u &&
					(r.push(
						ft.createFromDiffResult(
							this.shouldIgnoreTrimWhitespace,
							u,
							this.original,
							this.modified,
							this.continueCharDiff,
							this.shouldComputeCharChanges,
							this.shouldPostProcessCharChanges,
						),
					),
					(s += u.originalLength),
					(o += u.modifiedLength));
			}
			return { quitEarly: i, changes: r };
		}
		_pushTrimWhitespaceCharChange(t, n, i, r, s, o, l) {
			if (this._mergeTrimWhitespaceCharChange(t, n, i, r, s, o, l))
				return;
			let a;
			this.shouldComputeCharChanges &&
				(a = [new it(n, i, n, r, s, o, s, l)]),
				t.push(new ft(n, n, s, s, a));
		}
		_mergeTrimWhitespaceCharChange(t, n, i, r, s, o, l) {
			const a = t.length;
			if (a === 0) return !1;
			const u = t[a - 1];
			return u.originalEndLineNumber === 0 ||
				u.modifiedEndLineNumber === 0
				? !1
				: u.originalEndLineNumber === n && u.modifiedEndLineNumber === s
					? (this.shouldComputeCharChanges &&
							u.charChanges &&
							u.charChanges.push(new it(n, i, n, r, s, o, s, l)),
						!0)
					: u.originalEndLineNumber + 1 === n &&
							u.modifiedEndLineNumber + 1 === s
						? ((u.originalEndLineNumber = n),
							(u.modifiedEndLineNumber = s),
							this.shouldComputeCharChanges &&
								u.charChanges &&
								u.charChanges.push(
									new it(n, i, n, r, s, o, s, l),
								),
							!0)
						: !1;
		}
	}
	function Un(e, t) {
		const n = io(e);
		return n === -1 ? t : n + 1;
	}
	function Wn(e, t) {
		const n = ro(e);
		return n === -1 ? t : n + 2;
	}
	function Kr(e) {
		if (e === 0) return () => !0;
		const t = Date.now();
		return () => Date.now() - t < e;
	}
	class Re {
		static trivial(t, n) {
			return new Re(
				[new Z(j.ofLength(t.length), j.ofLength(n.length))],
				!1,
			);
		}
		static trivialTimedOut(t, n) {
			return new Re(
				[new Z(j.ofLength(t.length), j.ofLength(n.length))],
				!0,
			);
		}
		constructor(t, n) {
			(this.diffs = t), (this.hitTimeout = n);
		}
	}
	class Z {
		static invert(t, n) {
			const i = [];
			return (
				Po(t, (r, s) => {
					i.push(
						Z.fromOffsetPairs(
							r ? r.getEndExclusives() : xe.zero,
							s
								? s.getStarts()
								: new xe(
										n,
										(r
											? r.seq2Range.endExclusive -
												r.seq1Range.endExclusive
											: 0) + n,
									),
						),
					);
				}),
				i
			);
		}
		static fromOffsetPairs(t, n) {
			return new Z(
				new j(t.offset1, n.offset1),
				new j(t.offset2, n.offset2),
			);
		}
		static assertSorted(t) {
			let n;
			for (const i of t) {
				if (
					n &&
					!(
						n.seq1Range.endExclusive <= i.seq1Range.start &&
						n.seq2Range.endExclusive <= i.seq2Range.start
					)
				)
					throw new de("Sequence diffs must be sorted");
				n = i;
			}
		}
		constructor(t, n) {
			(this.seq1Range = t), (this.seq2Range = n);
		}
		swap() {
			return new Z(this.seq2Range, this.seq1Range);
		}
		toString() {
			return `${this.seq1Range} <-> ${this.seq2Range}`;
		}
		join(t) {
			return new Z(
				this.seq1Range.join(t.seq1Range),
				this.seq2Range.join(t.seq2Range),
			);
		}
		delta(t) {
			return t === 0
				? this
				: new Z(this.seq1Range.delta(t), this.seq2Range.delta(t));
		}
		deltaStart(t) {
			return t === 0
				? this
				: new Z(
						this.seq1Range.deltaStart(t),
						this.seq2Range.deltaStart(t),
					);
		}
		deltaEnd(t) {
			return t === 0
				? this
				: new Z(this.seq1Range.deltaEnd(t), this.seq2Range.deltaEnd(t));
		}
		intersect(t) {
			const n = this.seq1Range.intersect(t.seq1Range),
				i = this.seq2Range.intersect(t.seq2Range);
			if (!(!n || !i)) return new Z(n, i);
		}
		getStarts() {
			return new xe(this.seq1Range.start, this.seq2Range.start);
		}
		getEndExclusives() {
			return new xe(
				this.seq1Range.endExclusive,
				this.seq2Range.endExclusive,
			);
		}
	}
	class xe {
		static {
			this.zero = new xe(0, 0);
		}
		static {
			this.max = new xe(Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER);
		}
		constructor(t, n) {
			(this.offset1 = t), (this.offset2 = n);
		}
		toString() {
			return `${this.offset1} <-> ${this.offset2}`;
		}
		delta(t) {
			return t === 0 ? this : new xe(this.offset1 + t, this.offset2 + t);
		}
		equals(t) {
			return this.offset1 === t.offset1 && this.offset2 === t.offset2;
		}
	}
	class pt {
		static {
			this.instance = new pt();
		}
		isValid() {
			return !0;
		}
	}
	class Dl {
		constructor(t) {
			if (
				((this.timeout = t),
				(this.startTime = Date.now()),
				(this.valid = !0),
				t <= 0)
			)
				throw new de("timeout must be positive");
		}
		isValid() {
			if (!(Date.now() - this.startTime < this.timeout) && this.valid) {
				this.valid = !1;
				debugger;
			}
			return this.valid;
		}
	}
	class Fn {
		constructor(t, n) {
			(this.width = t),
				(this.height = n),
				(this.array = []),
				(this.array = new Array(t * n));
		}
		get(t, n) {
			return this.array[t + n * this.width];
		}
		set(t, n, i) {
			this.array[t + n * this.width] = i;
		}
	}
	function Pn(e) {
		return e === 32 || e === 9;
	}
	class gt {
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
		constructor(t, n, i) {
			(this.range = t),
				(this.lines = n),
				(this.source = i),
				(this.histogram = []);
			let r = 0;
			for (
				let s = t.startLineNumber - 1;
				s < t.endLineNumberExclusive - 1;
				s++
			) {
				const o = n[s];
				for (let a = 0; a < o.length; a++) {
					r++;
					const u = o[a],
						c = gt.getKey(u);
					this.histogram[c] = (this.histogram[c] || 0) + 1;
				}
				r++;
				const l = gt.getKey(`
`);
				this.histogram[l] = (this.histogram[l] || 0) + 1;
			}
			this.totalCount = r;
		}
		computeSimilarity(t) {
			let n = 0;
			const i = Math.max(this.histogram.length, t.histogram.length);
			for (let r = 0; r < i; r++)
				n += Math.abs((this.histogram[r] ?? 0) - (t.histogram[r] ?? 0));
			return 1 - n / (this.totalCount + t.totalCount);
		}
	}
	class Il {
		compute(t, n, i = pt.instance, r) {
			if (t.length === 0 || n.length === 0) return Re.trivial(t, n);
			const s = new Fn(t.length, n.length),
				o = new Fn(t.length, n.length),
				l = new Fn(t.length, n.length);
			for (let w = 0; w < t.length; w++)
				for (let g = 0; g < n.length; g++) {
					if (!i.isValid()) return Re.trivialTimedOut(t, n);
					const k = w === 0 ? 0 : s.get(w - 1, g),
						v = g === 0 ? 0 : s.get(w, g - 1);
					let y;
					t.getElement(w) === n.getElement(g)
						? (w === 0 || g === 0
								? (y = 0)
								: (y = s.get(w - 1, g - 1)),
							w > 0 &&
								g > 0 &&
								o.get(w - 1, g - 1) === 3 &&
								(y += l.get(w - 1, g - 1)),
							(y += r ? r(w, g) : 1))
						: (y = -1);
					const E = Math.max(k, v, y);
					if (E === y) {
						const R = w > 0 && g > 0 ? l.get(w - 1, g - 1) : 0;
						l.set(w, g, R + 1), o.set(w, g, 3);
					} else
						E === k
							? (l.set(w, g, 0), o.set(w, g, 1))
							: E === v && (l.set(w, g, 0), o.set(w, g, 2));
					s.set(w, g, E);
				}
			const a = [];
			let u = t.length,
				c = n.length;
			function d(w, g) {
				(w + 1 !== u || g + 1 !== c) &&
					a.push(new Z(new j(w + 1, u), new j(g + 1, c))),
					(u = w),
					(c = g);
			}
			let m = t.length - 1,
				f = n.length - 1;
			for (; m >= 0 && f >= 0; )
				o.get(m, f) === 3
					? (d(m, f), m--, f--)
					: o.get(m, f) === 1
						? m--
						: f--;
			return d(-1, -1), a.reverse(), new Re(a, !1);
		}
	}
	class es {
		compute(t, n, i = pt.instance) {
			if (t.length === 0 || n.length === 0) return Re.trivial(t, n);
			const r = t,
				s = n;
			function o(g, k) {
				for (
					;
					g < r.length &&
					k < s.length &&
					r.getElement(g) === s.getElement(k);
				)
					g++, k++;
				return g;
			}
			let l = 0;
			const a = new zl();
			a.set(0, o(0, 0));
			const u = new Hl();
			u.set(0, a.get(0) === 0 ? null : new ts(null, 0, 0, a.get(0)));
			let c = 0;
			e: for (;;) {
				if ((l++, !i.isValid())) return Re.trivialTimedOut(r, s);
				const g = -Math.min(l, s.length + (l % 2)),
					k = Math.min(l, r.length + (l % 2));
				for (c = g; c <= k; c += 2) {
					const v = c === k ? -1 : a.get(c + 1),
						y = c === g ? -1 : a.get(c - 1) + 1,
						E = Math.min(Math.max(v, y), r.length),
						R = E - c;
					if (E > r.length || R > s.length) continue;
					const N = o(E, R);
					a.set(c, N);
					const M = E === v ? u.get(c + 1) : u.get(c - 1);
					if (
						(u.set(c, N !== E ? new ts(M, E, R, N - E) : M),
						a.get(c) === r.length && a.get(c) - c === s.length)
					)
						break e;
				}
			}
			let d = u.get(c);
			const m = [];
			let f = r.length,
				w = s.length;
			for (;;) {
				const g = d ? d.x + d.length : 0,
					k = d ? d.y + d.length : 0;
				if (
					((g !== f || k !== w) &&
						m.push(new Z(new j(g, f), new j(k, w))),
					!d)
				)
					break;
				(f = d.x), (w = d.y), (d = d.prev);
			}
			return m.reverse(), new Re(m, !1);
		}
	}
	class ts {
		constructor(t, n, i, r) {
			(this.prev = t), (this.x = n), (this.y = i), (this.length = r);
		}
	}
	class zl {
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
					const i = this.negativeArr;
					(this.negativeArr = new Int32Array(i.length * 2)),
						this.negativeArr.set(i);
				}
				this.negativeArr[t] = n;
			} else {
				if (t >= this.positiveArr.length) {
					const i = this.positiveArr;
					(this.positiveArr = new Int32Array(i.length * 2)),
						this.positiveArr.set(i);
				}
				this.positiveArr[t] = n;
			}
		}
	}
	class Hl {
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
	class jt {
		constructor(t, n, i) {
			(this.lines = t),
				(this.range = n),
				(this.considerWhitespaceChanges = i),
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
				let s = t[r - 1],
					o = 0;
				r === this.range.startLineNumber &&
					this.range.startColumn > 1 &&
					((o = this.range.startColumn - 1), (s = s.substring(o))),
					this.lineStartOffsets.push(o);
				let l = 0;
				if (!i) {
					const u = s.trimStart();
					(l = s.length - u.length), (s = u.trimEnd());
				}
				this.trimmedWsLengthsByLineIdx.push(l);
				const a =
					r === this.range.endLineNumber
						? Math.min(this.range.endColumn - 1 - o - l, s.length)
						: s.length;
				for (let u = 0; u < a; u++) this.elements.push(s.charCodeAt(u));
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
			return this.getText(new j(0, this.length));
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
			const n = is(t > 0 ? this.elements[t - 1] : -1),
				i = is(t < this.elements.length ? this.elements[t] : -1);
			if (n === 7 && i === 8) return 0;
			if (n === 8) return 150;
			let r = 0;
			return (
				n !== i && ((r += 10), n === 0 && i === 1 && (r += 1)),
				(r += ns(n)),
				(r += ns(i)),
				r
			);
		}
		translateOffset(t, n = "right") {
			const i = mt(this.firstElementOffsetByLineIdx, (s) => s <= t),
				r = t - this.firstElementOffsetByLineIdx[i];
			return new ee(
				this.range.startLineNumber + i,
				1 +
					this.lineStartOffsets[i] +
					r +
					(r === 0 && n === "left"
						? 0
						: this.trimmedWsLengthsByLineIdx[i]),
			);
		}
		translateRange(t) {
			const n = this.translateOffset(t.start, "right"),
				i = this.translateOffset(t.endExclusive, "left");
			return i.isBefore(n)
				? $.fromPositions(i, i)
				: $.fromPositions(n, i);
		}
		findWordContaining(t) {
			if (t < 0 || t >= this.elements.length || !Bn(this.elements[t]))
				return;
			let n = t;
			for (; n > 0 && Bn(this.elements[n - 1]); ) n--;
			let i = t;
			for (; i < this.elements.length && Bn(this.elements[i]); ) i++;
			return new j(n, i);
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
					et(this.firstElementOffsetByLineIdx, (r) => r <= t.start) ??
					0,
				i =
					Sl(
						this.firstElementOffsetByLineIdx,
						(r) => t.endExclusive <= r,
					) ?? this.elements.length;
			return new j(n, i);
		}
	}
	function Bn(e) {
		return (
			(e >= 97 && e <= 122) ||
			(e >= 65 && e <= 90) ||
			(e >= 48 && e <= 57)
		);
	}
	const Ul = { 0: 0, 1: 0, 2: 0, 3: 10, 4: 2, 5: 30, 6: 3, 7: 10, 8: 10 };
	function ns(e) {
		return Ul[e];
	}
	function is(e) {
		return e === 10
			? 8
			: e === 13
				? 7
				: Pn(e)
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
	function Wl(e, t, n, i, r, s) {
		let { moves: o, excludedChanges: l } = Pl(e, t, n, s);
		if (!s.isValid()) return [];
		const a = e.filter((c) => !l.has(c)),
			u = Bl(a, i, r, t, n, s);
		return (
			qo(o, u),
			(o = ql(o)),
			(o = o.filter((c) => {
				const d = c.original
					.toOffsetRange()
					.slice(t)
					.map((f) => f.trim());
				return (
					d.join(`
`).length >= 15 && Fl(d, (f) => f.length >= 2) >= 2
				);
			})),
			(o = Ol(e, o)),
			o
		);
	}
	function Fl(e, t) {
		let n = 0;
		for (const i of e) t(i) && n++;
		return n;
	}
	function Pl(e, t, n, i) {
		const r = [],
			s = e
				.filter((a) => a.modified.isEmpty && a.original.length >= 3)
				.map((a) => new gt(a.original, t, a)),
			o = new Set(
				e
					.filter((a) => a.original.isEmpty && a.modified.length >= 3)
					.map((a) => new gt(a.modified, n, a)),
			),
			l = new Set();
		for (const a of s) {
			let u = -1,
				c;
			for (const d of o) {
				const m = a.computeSimilarity(d);
				m > u && ((u = m), (c = d));
			}
			if (
				(u > 0.9 &&
					c &&
					(o.delete(c),
					r.push(new be(a.range, c.range)),
					l.add(a.source),
					l.add(c.source)),
				!i.isValid())
			)
				return { moves: r, excludedChanges: l };
		}
		return { moves: r, excludedChanges: l };
	}
	function Bl(e, t, n, i, r, s) {
		const o = [],
			l = new bl();
		for (const m of e)
			for (
				let f = m.original.startLineNumber;
				f < m.original.endLineNumberExclusive - 2;
				f++
			) {
				const w = `${t[f - 1]}:${t[f + 1 - 1]}:${t[f + 2 - 1]}`;
				l.add(w, { range: new q(f, f + 3) });
			}
		const a = [];
		e.sort(zt((m) => m.modified.startLineNumber, Ht));
		for (const m of e) {
			let f = [];
			for (
				let w = m.modified.startLineNumber;
				w < m.modified.endLineNumberExclusive - 2;
				w++
			) {
				const g = `${n[w - 1]}:${n[w + 1 - 1]}:${n[w + 2 - 1]}`,
					k = new q(w, w + 3),
					v = [];
				l.forEach(g, ({ range: y }) => {
					for (const R of f)
						if (
							R.originalLineRange.endLineNumberExclusive + 1 ===
								y.endLineNumberExclusive &&
							R.modifiedLineRange.endLineNumberExclusive + 1 ===
								k.endLineNumberExclusive
						) {
							(R.originalLineRange = new q(
								R.originalLineRange.startLineNumber,
								y.endLineNumberExclusive,
							)),
								(R.modifiedLineRange = new q(
									R.modifiedLineRange.startLineNumber,
									k.endLineNumberExclusive,
								)),
								v.push(R);
							return;
						}
					const E = { modifiedLineRange: k, originalLineRange: y };
					a.push(E), v.push(E);
				}),
					(f = v);
			}
			if (!s.isValid()) return [];
		}
		a.sort(Oo(zt((m) => m.modifiedLineRange.length, Ht)));
		const u = new Se(),
			c = new Se();
		for (const m of a) {
			const f =
					m.modifiedLineRange.startLineNumber -
					m.originalLineRange.startLineNumber,
				w = u.subtractFrom(m.modifiedLineRange),
				g = c.subtractFrom(m.originalLineRange).getWithDelta(f),
				k = w.getIntersection(g);
			for (const v of k.ranges) {
				if (v.length < 3) continue;
				const y = v,
					E = v.delta(-f);
				o.push(new be(E, y)), u.addRange(y), c.addRange(E);
			}
		}
		o.sort(zt((m) => m.original.startLineNumber, Ht));
		const d = new Vt(e);
		for (let m = 0; m < o.length; m++) {
			const f = o[m],
				w = d.findLastMonotonous(
					(M) =>
						M.original.startLineNumber <=
						f.original.startLineNumber,
				),
				g = et(
					e,
					(M) =>
						M.modified.startLineNumber <=
						f.modified.startLineNumber,
				),
				k = Math.max(
					f.original.startLineNumber - w.original.startLineNumber,
					f.modified.startLineNumber - g.modified.startLineNumber,
				),
				v = d.findLastMonotonous(
					(M) =>
						M.original.startLineNumber <
						f.original.endLineNumberExclusive,
				),
				y = et(
					e,
					(M) =>
						M.modified.startLineNumber <
						f.modified.endLineNumberExclusive,
				),
				E = Math.max(
					v.original.endLineNumberExclusive -
						f.original.endLineNumberExclusive,
					y.modified.endLineNumberExclusive -
						f.modified.endLineNumberExclusive,
				);
			let R;
			for (R = 0; R < k; R++) {
				const M = f.original.startLineNumber - R - 1,
					b = f.modified.startLineNumber - R - 1;
				if (
					M > i.length ||
					b > r.length ||
					u.contains(b) ||
					c.contains(M) ||
					!rs(i[M - 1], r[b - 1], s)
				)
					break;
			}
			R > 0 &&
				(c.addRange(
					new q(
						f.original.startLineNumber - R,
						f.original.startLineNumber,
					),
				),
				u.addRange(
					new q(
						f.modified.startLineNumber - R,
						f.modified.startLineNumber,
					),
				));
			let N;
			for (N = 0; N < E; N++) {
				const M = f.original.endLineNumberExclusive + N,
					b = f.modified.endLineNumberExclusive + N;
				if (
					M > i.length ||
					b > r.length ||
					u.contains(b) ||
					c.contains(M) ||
					!rs(i[M - 1], r[b - 1], s)
				)
					break;
			}
			N > 0 &&
				(c.addRange(
					new q(
						f.original.endLineNumberExclusive,
						f.original.endLineNumberExclusive + N,
					),
				),
				u.addRange(
					new q(
						f.modified.endLineNumberExclusive,
						f.modified.endLineNumberExclusive + N,
					),
				)),
				(R > 0 || N > 0) &&
					(o[m] = new be(
						new q(
							f.original.startLineNumber - R,
							f.original.endLineNumberExclusive + N,
						),
						new q(
							f.modified.startLineNumber - R,
							f.modified.endLineNumberExclusive + N,
						),
					));
		}
		return o;
	}
	function rs(e, t, n) {
		if (e.trim() === t.trim()) return !0;
		if (e.length > 300 && t.length > 300) return !1;
		const r = new es().compute(
			new jt([e], new $(1, 1, 1, e.length), !1),
			new jt([t], new $(1, 1, 1, t.length), !1),
			n,
		);
		let s = 0;
		const o = Z.invert(r.diffs, e.length);
		for (const c of o)
			c.seq1Range.forEach((d) => {
				Pn(e.charCodeAt(d)) || s++;
			});
		function l(c) {
			let d = 0;
			for (let m = 0; m < e.length; m++) Pn(c.charCodeAt(m)) || d++;
			return d;
		}
		const a = l(e.length > t.length ? e : t);
		return s / a > 0.6 && a > 10;
	}
	function ql(e) {
		if (e.length === 0) return e;
		e.sort(zt((n) => n.original.startLineNumber, Ht));
		const t = [e[0]];
		for (let n = 1; n < e.length; n++) {
			const i = t[t.length - 1],
				r = e[n],
				s =
					r.original.startLineNumber -
					i.original.endLineNumberExclusive,
				o =
					r.modified.startLineNumber -
					i.modified.endLineNumberExclusive;
			if (s >= 0 && o >= 0 && s + o <= 2) {
				t[t.length - 1] = i.join(r);
				continue;
			}
			t.push(r);
		}
		return t;
	}
	function Ol(e, t) {
		const n = new Vt(e);
		return (
			(t = t.filter((i) => {
				const r =
						n.findLastMonotonous(
							(l) =>
								l.original.startLineNumber <
								i.original.endLineNumberExclusive,
						) || new be(new q(1, 1), new q(1, 1)),
					s = et(
						e,
						(l) =>
							l.modified.startLineNumber <
							i.modified.endLineNumberExclusive,
					);
				return r !== s;
			})),
			t
		);
	}
	function ss(e, t, n) {
		let i = n;
		return (i = as(e, t, i)), (i = as(e, t, i)), (i = Vl(e, t, i)), i;
	}
	function as(e, t, n) {
		if (n.length === 0) return n;
		const i = [];
		i.push(n[0]);
		for (let s = 1; s < n.length; s++) {
			const o = i[i.length - 1];
			let l = n[s];
			if (l.seq1Range.isEmpty || l.seq2Range.isEmpty) {
				const a = l.seq1Range.start - o.seq1Range.endExclusive;
				let u;
				for (
					u = 1;
					u <= a &&
					!(
						e.getElement(l.seq1Range.start - u) !==
							e.getElement(l.seq1Range.endExclusive - u) ||
						t.getElement(l.seq2Range.start - u) !==
							t.getElement(l.seq2Range.endExclusive - u)
					);
					u++
				);
				if ((u--, u === a)) {
					i[i.length - 1] = new Z(
						new j(o.seq1Range.start, l.seq1Range.endExclusive - a),
						new j(o.seq2Range.start, l.seq2Range.endExclusive - a),
					);
					continue;
				}
				l = l.delta(-u);
			}
			i.push(l);
		}
		const r = [];
		for (let s = 0; s < i.length - 1; s++) {
			const o = i[s + 1];
			let l = i[s];
			if (l.seq1Range.isEmpty || l.seq2Range.isEmpty) {
				const a = o.seq1Range.start - l.seq1Range.endExclusive;
				let u;
				for (
					u = 0;
					u < a &&
					!(
						!e.isStronglyEqual(
							l.seq1Range.start + u,
							l.seq1Range.endExclusive + u,
						) ||
						!t.isStronglyEqual(
							l.seq2Range.start + u,
							l.seq2Range.endExclusive + u,
						)
					);
					u++
				);
				if (u === a) {
					i[s + 1] = new Z(
						new j(l.seq1Range.start + a, o.seq1Range.endExclusive),
						new j(l.seq2Range.start + a, o.seq2Range.endExclusive),
					);
					continue;
				}
				u > 0 && (l = l.delta(u));
			}
			r.push(l);
		}
		return i.length > 0 && r.push(i[i.length - 1]), r;
	}
	function Vl(e, t, n) {
		if (!e.getBoundaryScore || !t.getBoundaryScore) return n;
		for (let i = 0; i < n.length; i++) {
			const r = i > 0 ? n[i - 1] : void 0,
				s = n[i],
				o = i + 1 < n.length ? n[i + 1] : void 0,
				l = new j(
					r ? r.seq1Range.endExclusive + 1 : 0,
					o ? o.seq1Range.start - 1 : e.length,
				),
				a = new j(
					r ? r.seq2Range.endExclusive + 1 : 0,
					o ? o.seq2Range.start - 1 : t.length,
				);
			s.seq1Range.isEmpty
				? (n[i] = os(s, e, t, l, a))
				: s.seq2Range.isEmpty &&
					(n[i] = os(s.swap(), t, e, a, l).swap());
		}
		return n;
	}
	function os(e, t, n, i, r) {
		let o = 1;
		for (
			;
			e.seq1Range.start - o >= i.start &&
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
			e.seq1Range.start + l < i.endExclusive &&
			e.seq2Range.endExclusive + l < r.endExclusive &&
			n.isStronglyEqual(
				e.seq2Range.start + l,
				e.seq2Range.endExclusive + l,
			) &&
			l < 100;
		)
			l++;
		if (o === 0 && l === 0) return e;
		let a = 0,
			u = -1;
		for (let c = -o; c <= l; c++) {
			const d = e.seq2Range.start + c,
				m = e.seq2Range.endExclusive + c,
				f = e.seq1Range.start + c,
				w =
					t.getBoundaryScore(f) +
					n.getBoundaryScore(d) +
					n.getBoundaryScore(m);
			w > u && ((u = w), (a = c));
		}
		return e.delta(a);
	}
	function jl(e, t, n) {
		const i = [];
		for (const r of n) {
			const s = i[i.length - 1];
			if (!s) {
				i.push(r);
				continue;
			}
			r.seq1Range.start - s.seq1Range.endExclusive <= 2 ||
			r.seq2Range.start - s.seq2Range.endExclusive <= 2
				? (i[i.length - 1] = new Z(
						s.seq1Range.join(r.seq1Range),
						s.seq2Range.join(r.seq2Range),
					))
				: i.push(r);
		}
		return i;
	}
	function Gl(e, t, n) {
		const i = Z.invert(n, e.length),
			r = [];
		let s = new xe(0, 0);
		function o(a, u) {
			if (a.offset1 < s.offset1 || a.offset2 < s.offset2) return;
			const c = e.findWordContaining(a.offset1),
				d = t.findWordContaining(a.offset2);
			if (!c || !d) return;
			let m = new Z(c, d);
			const f = m.intersect(u);
			let w = f.seq1Range.length,
				g = f.seq2Range.length;
			for (; i.length > 0; ) {
				const k = i[0];
				if (
					!(
						k.seq1Range.intersects(m.seq1Range) ||
						k.seq2Range.intersects(m.seq2Range)
					)
				)
					break;
				const y = e.findWordContaining(k.seq1Range.start),
					E = t.findWordContaining(k.seq2Range.start),
					R = new Z(y, E),
					N = R.intersect(k);
				if (
					((w += N.seq1Range.length),
					(g += N.seq2Range.length),
					(m = m.join(R)),
					m.seq1Range.endExclusive >= k.seq1Range.endExclusive)
				)
					i.shift();
				else break;
			}
			w + g < ((m.seq1Range.length + m.seq2Range.length) * 2) / 3 &&
				r.push(m),
				(s = m.getEndExclusives());
		}
		for (; i.length > 0; ) {
			const a = i.shift();
			a.seq1Range.isEmpty ||
				(o(a.getStarts(), a), o(a.getEndExclusives().delta(-1), a));
		}
		return $l(n, r);
	}
	function $l(e, t) {
		const n = [];
		for (; e.length > 0 || t.length > 0; ) {
			const i = e[0],
				r = t[0];
			let s;
			i && (!r || i.seq1Range.start < r.seq1Range.start)
				? (s = e.shift())
				: (s = t.shift()),
				n.length > 0 &&
				n[n.length - 1].seq1Range.endExclusive >= s.seq1Range.start
					? (n[n.length - 1] = n[n.length - 1].join(s))
					: n.push(s);
		}
		return n;
	}
	function Xl(e, t, n) {
		let i = n;
		if (i.length === 0) return i;
		let r = 0,
			s;
		do {
			s = !1;
			const o = [i[0]];
			for (let l = 1; l < i.length; l++) {
				let c = function (m, f) {
					const w = new j(
						u.seq1Range.endExclusive,
						a.seq1Range.start,
					);
					return (
						e.getText(w).replace(/\s/g, "").length <= 4 &&
						(m.seq1Range.length + m.seq2Range.length > 5 ||
							f.seq1Range.length + f.seq2Range.length > 5)
					);
				};
				const a = i[l],
					u = o[o.length - 1];
				c(u, a)
					? ((s = !0), (o[o.length - 1] = o[o.length - 1].join(a)))
					: o.push(a);
			}
			i = o;
		} while (r++ < 10 && s);
		return i;
	}
	function Jl(e, t, n) {
		let i = n;
		if (i.length === 0) return i;
		let r = 0,
			s;
		do {
			s = !1;
			const l = [i[0]];
			for (let a = 1; a < i.length; a++) {
				let d = function (f, w) {
					const g = new j(
						c.seq1Range.endExclusive,
						u.seq1Range.start,
					);
					if (e.countLinesIn(g) > 5 || g.length > 500) return !1;
					const v = e.getText(g).trim();
					if (v.length > 20 || v.split(/\r\n|\r|\n/).length > 1)
						return !1;
					const y = e.countLinesIn(f.seq1Range),
						E = f.seq1Range.length,
						R = t.countLinesIn(f.seq2Range),
						N = f.seq2Range.length,
						M = e.countLinesIn(w.seq1Range),
						b = w.seq1Range.length,
						p = t.countLinesIn(w.seq2Range),
						T = w.seq2Range.length,
						H = 2 * 40 + 50;
					function L(_) {
						return Math.min(_, H);
					}
					return (
						Math.pow(
							Math.pow(L(y * 40 + E), 1.5) +
								Math.pow(L(R * 40 + N), 1.5),
							1.5,
						) +
							Math.pow(
								Math.pow(L(M * 40 + b), 1.5) +
									Math.pow(L(p * 40 + T), 1.5),
								1.5,
							) >
						(H ** 1.5) ** 1.5 * 1.3
					);
				};
				const u = i[a],
					c = l[l.length - 1];
				d(c, u)
					? ((s = !0), (l[l.length - 1] = l[l.length - 1].join(u)))
					: l.push(u);
			}
			i = l;
		} while (r++ < 10 && s);
		const o = [];
		return (
			Bo(i, (l, a, u) => {
				let c = a;
				function d(v) {
					return (
						v.length > 0 &&
						v.trim().length <= 3 &&
						a.seq1Range.length + a.seq2Range.length > 100
					);
				}
				const m = e.extendToFullLines(a.seq1Range),
					f = e.getText(new j(m.start, a.seq1Range.start));
				d(f) && (c = c.deltaStart(-f.length));
				const w = e.getText(
					new j(a.seq1Range.endExclusive, m.endExclusive),
				);
				d(w) && (c = c.deltaEnd(w.length));
				const g = Z.fromOffsetPairs(
						l ? l.getEndExclusives() : xe.zero,
						u ? u.getStarts() : xe.max,
					),
					k = c.intersect(g);
				o.length > 0 &&
				k.getStarts().equals(o[o.length - 1].getEndExclusives())
					? (o[o.length - 1] = o[o.length - 1].join(k))
					: o.push(k);
			}),
			o
		);
	}
	class ls {
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
			const n = t === 0 ? 0 : us(this.lines[t - 1]),
				i = t === this.lines.length ? 0 : us(this.lines[t]);
			return 1e3 - (n + i);
		}
		getText(t) {
			return this.lines.slice(t.start, t.endExclusive).join(`
`);
		}
		isStronglyEqual(t, n) {
			return this.lines[t] === this.lines[n];
		}
	}
	function us(e) {
		let t = 0;
		for (
			;
			t < e.length && (e.charCodeAt(t) === 32 || e.charCodeAt(t) === 9);
		)
			t++;
		return t;
	}
	class Yl {
		constructor() {
			(this.dynamicProgrammingDiffing = new Il()),
				(this.myersDiffingAlgorithm = new es());
		}
		computeDiff(t, n, i) {
			if (t.length <= 1 && Wo(t, n, (N, M) => N === M))
				return new Ot([], [], !1);
			if (
				(t.length === 1 && t[0].length === 0) ||
				(n.length === 1 && n[0].length === 0)
			)
				return new Ot(
					[
						new Ee(new q(1, t.length + 1), new q(1, n.length + 1), [
							new ye(
								new $(
									1,
									1,
									t.length,
									t[t.length - 1].length + 1,
								),
								new $(
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
					i.maxComputationTimeMs === 0
						? pt.instance
						: new Dl(i.maxComputationTimeMs),
				s = !i.ignoreTrimWhitespace,
				o = new Map();
			function l(N) {
				let M = o.get(N);
				return M === void 0 && ((M = o.size), o.set(N, M)), M;
			}
			const a = t.map((N) => l(N.trim())),
				u = n.map((N) => l(N.trim())),
				c = new ls(a, t),
				d = new ls(u, n),
				m =
					c.length + d.length < 1700
						? this.dynamicProgrammingDiffing.compute(
								c,
								d,
								r,
								(N, M) =>
									t[N] === n[M]
										? n[M].length === 0
											? 0.1
											: 1 + Math.log(1 + n[M].length)
										: 0.99,
							)
						: this.myersDiffingAlgorithm.compute(c, d, r);
			let f = m.diffs,
				w = m.hitTimeout;
			(f = ss(c, d, f)), (f = Xl(c, d, f));
			const g = [],
				k = (N) => {
					if (s)
						for (let M = 0; M < N; M++) {
							const b = v + M,
								p = y + M;
							if (t[b] !== n[p]) {
								const T = this.refineDiff(
									t,
									n,
									new Z(new j(b, b + 1), new j(p, p + 1)),
									r,
									s,
								);
								for (const H of T.mappings) g.push(H);
								T.hitTimeout && (w = !0);
							}
						}
				};
			let v = 0,
				y = 0;
			for (const N of f) {
				qt(() => N.seq1Range.start - v === N.seq2Range.start - y);
				const M = N.seq1Range.start - v;
				k(M),
					(v = N.seq1Range.endExclusive),
					(y = N.seq2Range.endExclusive);
				const b = this.refineDiff(t, n, N, r, s);
				b.hitTimeout && (w = !0);
				for (const p of b.mappings) g.push(p);
			}
			k(t.length - v);
			const E = cs(g, t, n);
			let R = [];
			return (
				i.computeMoves && (R = this.computeMoves(E, t, n, a, u, r, s)),
				qt(() => {
					function N(b, p) {
						if (b.lineNumber < 1 || b.lineNumber > p.length)
							return !1;
						const T = p[b.lineNumber - 1];
						return !(b.column < 1 || b.column > T.length + 1);
					}
					function M(b, p) {
						return !(
							b.startLineNumber < 1 ||
							b.startLineNumber > p.length + 1 ||
							b.endLineNumberExclusive < 1 ||
							b.endLineNumberExclusive > p.length + 1
						);
					}
					for (const b of E) {
						if (!b.innerChanges) return !1;
						for (const p of b.innerChanges)
							if (
								!(
									N(p.modifiedRange.getStartPosition(), n) &&
									N(p.modifiedRange.getEndPosition(), n) &&
									N(p.originalRange.getStartPosition(), t) &&
									N(p.originalRange.getEndPosition(), t)
								)
							)
								return !1;
						if (!M(b.modified, n) || !M(b.original, t)) return !1;
					}
					return !0;
				}),
				new Ot(E, R, w)
			);
		}
		computeMoves(t, n, i, r, s, o, l) {
			return Wl(t, n, i, r, s, o).map((c) => {
				const d = this.refineDiff(
						n,
						i,
						new Z(
							c.original.toOffsetRange(),
							c.modified.toOffsetRange(),
						),
						o,
						l,
					),
					m = cs(d.mappings, n, i, !0);
				return new Al(c, m);
			});
		}
		refineDiff(t, n, i, r, s) {
			const l = Zl(i).toRangeMapping2(t, n),
				a = new jt(t, l.originalRange, s),
				u = new jt(n, l.modifiedRange, s),
				c =
					a.length + u.length < 500
						? this.dynamicProgrammingDiffing.compute(a, u, r)
						: this.myersDiffingAlgorithm.compute(a, u, r);
			let d = c.diffs;
			return (
				(d = ss(a, u, d)),
				(d = Gl(a, u, d)),
				(d = jl(a, u, d)),
				(d = Jl(a, u, d)),
				{
					mappings: d.map(
						(f) =>
							new ye(
								a.translateRange(f.seq1Range),
								u.translateRange(f.seq2Range),
							),
					),
					hitTimeout: c.hitTimeout,
				}
			);
		}
	}
	function cs(e, t, n, i = !1) {
		const r = [];
		for (const s of Fo(
			e.map((o) => Ql(o, t, n)),
			(o, l) =>
				o.original.overlapOrTouch(l.original) ||
				o.modified.overlapOrTouch(l.modified),
		)) {
			const o = s[0],
				l = s[s.length - 1];
			r.push(
				new Ee(
					o.original.join(l.original),
					o.modified.join(l.modified),
					s.map((a) => a.innerChanges[0]),
				),
			);
		}
		return (
			qt(() =>
				!i &&
				r.length > 0 &&
				(r[0].modified.startLineNumber !==
					r[0].original.startLineNumber ||
					n.length -
						r[r.length - 1].modified.endLineNumberExclusive !==
						t.length -
							r[r.length - 1].original.endLineNumberExclusive)
					? !1
					: $r(
							r,
							(s, o) =>
								o.original.startLineNumber -
									s.original.endLineNumberExclusive ===
									o.modified.startLineNumber -
										s.modified.endLineNumberExclusive &&
								s.original.endLineNumberExclusive <
									o.original.startLineNumber &&
								s.modified.endLineNumberExclusive <
									o.modified.startLineNumber,
						),
			),
			r
		);
	}
	function Ql(e, t, n) {
		let i = 0,
			r = 0;
		e.modifiedRange.endColumn === 1 &&
			e.originalRange.endColumn === 1 &&
			e.originalRange.startLineNumber + i <=
				e.originalRange.endLineNumber &&
			e.modifiedRange.startLineNumber + i <=
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
				(i = 1);
		const s = new q(
				e.originalRange.startLineNumber + i,
				e.originalRange.endLineNumber + 1 + r,
			),
			o = new q(
				e.modifiedRange.startLineNumber + i,
				e.modifiedRange.endLineNumber + 1 + r,
			);
		return new Ee(s, o, [e]);
	}
	function Zl(e) {
		return new be(
			new q(e.seq1Range.start + 1, e.seq1Range.endExclusive + 1),
			new q(e.seq2Range.start + 1, e.seq2Range.endExclusive + 1),
		);
	}
	const hs = { getLegacy: () => new El(), getDefault: () => new Yl() };
	function Fe(e, t) {
		const n = Math.pow(10, t);
		return Math.round(e * n) / n;
	}
	class ie {
		constructor(t, n, i, r = 1) {
			(this._rgbaBrand = void 0),
				(this.r = Math.min(255, Math.max(0, t)) | 0),
				(this.g = Math.min(255, Math.max(0, n)) | 0),
				(this.b = Math.min(255, Math.max(0, i)) | 0),
				(this.a = Fe(Math.max(Math.min(1, r), 0), 3));
		}
		static equals(t, n) {
			return t.r === n.r && t.g === n.g && t.b === n.b && t.a === n.a;
		}
	}
	class _e {
		constructor(t, n, i, r) {
			(this._hslaBrand = void 0),
				(this.h = Math.max(Math.min(360, t), 0) | 0),
				(this.s = Fe(Math.max(Math.min(1, n), 0), 3)),
				(this.l = Fe(Math.max(Math.min(1, i), 0), 3)),
				(this.a = Fe(Math.max(Math.min(1, r), 0), 3));
		}
		static equals(t, n) {
			return t.h === n.h && t.s === n.s && t.l === n.l && t.a === n.a;
		}
		static fromRGBA(t) {
			const n = t.r / 255,
				i = t.g / 255,
				r = t.b / 255,
				s = t.a,
				o = Math.max(n, i, r),
				l = Math.min(n, i, r);
			let a = 0,
				u = 0;
			const c = (l + o) / 2,
				d = o - l;
			if (d > 0) {
				switch (
					((u = Math.min(
						c <= 0.5 ? d / (2 * c) : d / (2 - 2 * c),
						1,
					)),
					o)
				) {
					case n:
						a = (i - r) / d + (i < r ? 6 : 0);
						break;
					case i:
						a = (r - n) / d + 2;
						break;
					case r:
						a = (n - i) / d + 4;
						break;
				}
				(a *= 60), (a = Math.round(a));
			}
			return new _e(a, u, c, s);
		}
		static _hue2rgb(t, n, i) {
			return (
				i < 0 && (i += 1),
				i > 1 && (i -= 1),
				i < 1 / 6
					? t + (n - t) * 6 * i
					: i < 1 / 2
						? n
						: i < 2 / 3
							? t + (n - t) * (2 / 3 - i) * 6
							: t
			);
		}
		static toRGBA(t) {
			const n = t.h / 360,
				{ s: i, l: r, a: s } = t;
			let o, l, a;
			if (i === 0) o = l = a = r;
			else {
				const u = r < 0.5 ? r * (1 + i) : r + i - r * i,
					c = 2 * r - u;
				(o = _e._hue2rgb(c, u, n + 1 / 3)),
					(l = _e._hue2rgb(c, u, n)),
					(a = _e._hue2rgb(c, u, n - 1 / 3));
			}
			return new ie(
				Math.round(o * 255),
				Math.round(l * 255),
				Math.round(a * 255),
				s,
			);
		}
	}
	class rt {
		constructor(t, n, i, r) {
			(this._hsvaBrand = void 0),
				(this.h = Math.max(Math.min(360, t), 0) | 0),
				(this.s = Fe(Math.max(Math.min(1, n), 0), 3)),
				(this.v = Fe(Math.max(Math.min(1, i), 0), 3)),
				(this.a = Fe(Math.max(Math.min(1, r), 0), 3));
		}
		static equals(t, n) {
			return t.h === n.h && t.s === n.s && t.v === n.v && t.a === n.a;
		}
		static fromRGBA(t) {
			const n = t.r / 255,
				i = t.g / 255,
				r = t.b / 255,
				s = Math.max(n, i, r),
				o = Math.min(n, i, r),
				l = s - o,
				a = s === 0 ? 0 : l / s;
			let u;
			return (
				l === 0
					? (u = 0)
					: s === n
						? (u = ((((i - r) / l) % 6) + 6) % 6)
						: s === i
							? (u = (r - n) / l + 2)
							: (u = (n - i) / l + 4),
				new rt(Math.round(u * 60), a, s, t.a)
			);
		}
		static toRGBA(t) {
			const { h: n, s: i, v: r, a: s } = t,
				o = r * i,
				l = o * (1 - Math.abs(((n / 60) % 2) - 1)),
				a = r - o;
			let [u, c, d] = [0, 0, 0];
			return (
				n < 60
					? ((u = o), (c = l))
					: n < 120
						? ((u = l), (c = o))
						: n < 180
							? ((c = o), (d = l))
							: n < 240
								? ((c = l), (d = o))
								: n < 300
									? ((u = l), (d = o))
									: n <= 360 && ((u = o), (d = l)),
				(u = Math.round((u + a) * 255)),
				(c = Math.round((c + a) * 255)),
				(d = Math.round((d + a) * 255)),
				new ie(u, c, d, s)
			);
		}
	}
	let Gt = class ne {
		static fromHex(t) {
			return ne.Format.CSS.parseHex(t) || ne.red;
		}
		static equals(t, n) {
			return !t && !n ? !0 : !t || !n ? !1 : t.equals(n);
		}
		get hsla() {
			return this._hsla ? this._hsla : _e.fromRGBA(this.rgba);
		}
		get hsva() {
			return this._hsva ? this._hsva : rt.fromRGBA(this.rgba);
		}
		constructor(t) {
			if (t)
				if (t instanceof ie) this.rgba = t;
				else if (t instanceof _e)
					(this._hsla = t), (this.rgba = _e.toRGBA(t));
				else if (t instanceof rt)
					(this._hsva = t), (this.rgba = rt.toRGBA(t));
				else throw new Error("Invalid color ctor argument");
			else throw new Error("Color needs a value");
		}
		equals(t) {
			return (
				!!t &&
				ie.equals(this.rgba, t.rgba) &&
				_e.equals(this.hsla, t.hsla) &&
				rt.equals(this.hsva, t.hsva)
			);
		}
		getRelativeLuminance() {
			const t = ne._relativeLuminanceForComponent(this.rgba.r),
				n = ne._relativeLuminanceForComponent(this.rgba.g),
				i = ne._relativeLuminanceForComponent(this.rgba.b),
				r = 0.2126 * t + 0.7152 * n + 0.0722 * i;
			return Fe(r, 4);
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
				i = t.getRelativeLuminance();
			return n > i;
		}
		isDarkerThan(t) {
			const n = this.getRelativeLuminance(),
				i = t.getRelativeLuminance();
			return n < i;
		}
		lighten(t) {
			return new ne(
				new _e(
					this.hsla.h,
					this.hsla.s,
					this.hsla.l + this.hsla.l * t,
					this.hsla.a,
				),
			);
		}
		darken(t) {
			return new ne(
				new _e(
					this.hsla.h,
					this.hsla.s,
					this.hsla.l - this.hsla.l * t,
					this.hsla.a,
				),
			);
		}
		transparent(t) {
			const { r: n, g: i, b: r, a: s } = this.rgba;
			return new ne(new ie(n, i, r, s * t));
		}
		isTransparent() {
			return this.rgba.a === 0;
		}
		isOpaque() {
			return this.rgba.a === 1;
		}
		opposite() {
			return new ne(
				new ie(
					255 - this.rgba.r,
					255 - this.rgba.g,
					255 - this.rgba.b,
					this.rgba.a,
				),
			);
		}
		makeOpaque(t) {
			if (this.isOpaque() || t.rgba.a !== 1) return this;
			const { r: n, g: i, b: r, a: s } = this.rgba;
			return new ne(
				new ie(
					t.rgba.r - s * (t.rgba.r - n),
					t.rgba.g - s * (t.rgba.g - i),
					t.rgba.b - s * (t.rgba.b - r),
					1,
				),
			);
		}
		toString() {
			return (
				this._toString || (this._toString = ne.Format.CSS.format(this)),
				this._toString
			);
		}
		static getLighterColor(t, n, i) {
			if (t.isLighterThan(n)) return t;
			i = i || 0.5;
			const r = t.getRelativeLuminance(),
				s = n.getRelativeLuminance();
			return (i = (i * (s - r)) / s), t.lighten(i);
		}
		static getDarkerColor(t, n, i) {
			if (t.isDarkerThan(n)) return t;
			i = i || 0.5;
			const r = t.getRelativeLuminance(),
				s = n.getRelativeLuminance();
			return (i = (i * (r - s)) / r), t.darken(i);
		}
		static {
			this.white = new ne(new ie(255, 255, 255, 1));
		}
		static {
			this.black = new ne(new ie(0, 0, 0, 1));
		}
		static {
			this.red = new ne(new ie(255, 0, 0, 1));
		}
		static {
			this.blue = new ne(new ie(0, 0, 255, 1));
		}
		static {
			this.green = new ne(new ie(0, 255, 0, 1));
		}
		static {
			this.cyan = new ne(new ie(0, 255, 255, 1));
		}
		static {
			this.lightgrey = new ne(new ie(211, 211, 211, 1));
		}
		static {
			this.transparent = new ne(new ie(0, 0, 0, 0));
		}
	};
	(function (e) {
		(function (t) {
			(function (n) {
				function i(f) {
					return f.rgba.a === 1
						? `rgb(${f.rgba.r}, ${f.rgba.g}, ${f.rgba.b})`
						: e.Format.CSS.formatRGBA(f);
				}
				n.formatRGB = i;
				function r(f) {
					return `rgba(${f.rgba.r}, ${f.rgba.g}, ${f.rgba.b}, ${+f.rgba.a.toFixed(2)})`;
				}
				n.formatRGBA = r;
				function s(f) {
					return f.hsla.a === 1
						? `hsl(${f.hsla.h}, ${(f.hsla.s * 100).toFixed(2)}%, ${(f.hsla.l * 100).toFixed(2)}%)`
						: e.Format.CSS.formatHSLA(f);
				}
				n.formatHSL = s;
				function o(f) {
					return `hsla(${f.hsla.h}, ${(f.hsla.s * 100).toFixed(2)}%, ${(f.hsla.l * 100).toFixed(2)}%, ${f.hsla.a.toFixed(2)})`;
				}
				n.formatHSLA = o;
				function l(f) {
					const w = f.toString(16);
					return w.length !== 2 ? "0" + w : w;
				}
				function a(f) {
					return `#${l(f.rgba.r)}${l(f.rgba.g)}${l(f.rgba.b)}`;
				}
				n.formatHex = a;
				function u(f, w = !1) {
					return w && f.rgba.a === 1
						? e.Format.CSS.formatHex(f)
						: `#${l(f.rgba.r)}${l(f.rgba.g)}${l(f.rgba.b)}${l(Math.round(f.rgba.a * 255))}`;
				}
				n.formatHexA = u;
				function c(f) {
					return f.isOpaque()
						? e.Format.CSS.formatHex(f)
						: e.Format.CSS.formatRGBA(f);
				}
				n.format = c;
				function d(f) {
					const w = f.length;
					if (w === 0 || f.charCodeAt(0) !== 35) return null;
					if (w === 7) {
						const g = 16 * m(f.charCodeAt(1)) + m(f.charCodeAt(2)),
							k = 16 * m(f.charCodeAt(3)) + m(f.charCodeAt(4)),
							v = 16 * m(f.charCodeAt(5)) + m(f.charCodeAt(6));
						return new e(new ie(g, k, v, 1));
					}
					if (w === 9) {
						const g = 16 * m(f.charCodeAt(1)) + m(f.charCodeAt(2)),
							k = 16 * m(f.charCodeAt(3)) + m(f.charCodeAt(4)),
							v = 16 * m(f.charCodeAt(5)) + m(f.charCodeAt(6)),
							y = 16 * m(f.charCodeAt(7)) + m(f.charCodeAt(8));
						return new e(new ie(g, k, v, y / 255));
					}
					if (w === 4) {
						const g = m(f.charCodeAt(1)),
							k = m(f.charCodeAt(2)),
							v = m(f.charCodeAt(3));
						return new e(
							new ie(16 * g + g, 16 * k + k, 16 * v + v),
						);
					}
					if (w === 5) {
						const g = m(f.charCodeAt(1)),
							k = m(f.charCodeAt(2)),
							v = m(f.charCodeAt(3)),
							y = m(f.charCodeAt(4));
						return new e(
							new ie(
								16 * g + g,
								16 * k + k,
								16 * v + v,
								(16 * y + y) / 255,
							),
						);
					}
					return null;
				}
				n.parseHex = d;
				function m(f) {
					switch (f) {
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
	})(Gt || (Gt = {}));
	function ds(e) {
		const t = [];
		for (const n of e) {
			const i = Number(n);
			(i || (i === 0 && n.replace(/\s/g, "") !== "")) && t.push(i);
		}
		return t;
	}
	function qn(e, t, n, i) {
		return { red: e / 255, blue: n / 255, green: t / 255, alpha: i };
	}
	function bt(e, t) {
		const n = t.index,
			i = t[0].length;
		if (!n) return;
		const r = e.positionAt(n);
		return {
			startLineNumber: r.lineNumber,
			startColumn: r.column,
			endLineNumber: r.lineNumber,
			endColumn: r.column + i,
		};
	}
	function Kl(e, t) {
		if (!e) return;
		const n = Gt.Format.CSS.parseHex(t);
		if (n)
			return {
				range: e,
				color: qn(n.rgba.r, n.rgba.g, n.rgba.b, n.rgba.a),
			};
	}
	function ms(e, t, n) {
		if (!e || t.length !== 1) return;
		const r = t[0].values(),
			s = ds(r);
		return { range: e, color: qn(s[0], s[1], s[2], n ? s[3] : 1) };
	}
	function fs(e, t, n) {
		if (!e || t.length !== 1) return;
		const r = t[0].values(),
			s = ds(r),
			o = new Gt(new _e(s[0], s[1] / 100, s[2] / 100, n ? s[3] : 1));
		return { range: e, color: qn(o.rgba.r, o.rgba.g, o.rgba.b, o.rgba.a) };
	}
	function _t(e, t) {
		return typeof e == "string" ? [...e.matchAll(t)] : e.findMatches(t);
	}
	function eu(e) {
		const t = [],
			i = _t(
				e,
				/\b(rgb|rgba|hsl|hsla)(\([0-9\s,.\%]*\))|(#)([A-Fa-f0-9]{3})\b|(#)([A-Fa-f0-9]{4})\b|(#)([A-Fa-f0-9]{6})\b|(#)([A-Fa-f0-9]{8})\b/gm,
			);
		if (i.length > 0)
			for (const r of i) {
				const s = r.filter((u) => u !== void 0),
					o = s[1],
					l = s[2];
				if (!l) continue;
				let a;
				if (o === "rgb") {
					const u =
						/^\(\s*(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]|[0-9])\s*,\s*(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]|[0-9])\s*,\s*(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]|[0-9])\s*\)$/gm;
					a = ms(bt(e, r), _t(l, u), !1);
				} else if (o === "rgba") {
					const u =
						/^\(\s*(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]|[0-9])\s*,\s*(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]|[0-9])\s*,\s*(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]|[0-9])\s*,\s*(0[.][0-9]+|[.][0-9]+|[01][.]|[01])\s*\)$/gm;
					a = ms(bt(e, r), _t(l, u), !0);
				} else if (o === "hsl") {
					const u =
						/^\(\s*(36[0]|3[0-5][0-9]|[12][0-9][0-9]|[1-9]?[0-9])\s*,\s*(100|\d{1,2}[.]\d*|\d{1,2})%\s*,\s*(100|\d{1,2}[.]\d*|\d{1,2})%\s*\)$/gm;
					a = fs(bt(e, r), _t(l, u), !1);
				} else if (o === "hsla") {
					const u =
						/^\(\s*(36[0]|3[0-5][0-9]|[12][0-9][0-9]|[1-9]?[0-9])\s*,\s*(100|\d{1,2}[.]\d*|\d{1,2})%\s*,\s*(100|\d{1,2}[.]\d*|\d{1,2})%\s*,\s*(0[.][0-9]+|[.][0-9]+|[01][.]|[01])\s*\)$/gm;
					a = fs(bt(e, r), _t(l, u), !0);
				} else o === "#" && (a = Kl(bt(e, r), o + l));
				a && t.push(a);
			}
		return t;
	}
	function tu(e) {
		return !e ||
			typeof e.getValue != "function" ||
			typeof e.positionAt != "function"
			? []
			: eu(e);
	}
	const ps = new RegExp("\\bMARK:\\s*(.*)$", "d"),
		nu = /^-+|-+$/g;
	function iu(e, t) {
		let n = [];
		if (t.findRegionSectionHeaders && t.foldingRules?.markers) {
			const i = ru(e, t);
			n = n.concat(i);
		}
		if (t.findMarkSectionHeaders) {
			const i = su(e);
			n = n.concat(i);
		}
		return n;
	}
	function ru(e, t) {
		const n = [],
			i = e.getLineCount();
		for (let r = 1; r <= i; r++) {
			const s = e.getLineContent(r),
				o = s.match(t.foldingRules.markers.start);
			if (o) {
				const l = {
					startLineNumber: r,
					startColumn: o[0].length + 1,
					endLineNumber: r,
					endColumn: s.length + 1,
				};
				if (l.endColumn > l.startColumn) {
					const a = {
						range: l,
						...gs(s.substring(o[0].length)),
						shouldBeInComments: !1,
					};
					(a.text || a.hasSeparatorLine) && n.push(a);
				}
			}
		}
		return n;
	}
	function su(e) {
		const t = [],
			n = e.getLineCount();
		for (let i = 1; i <= n; i++) {
			const r = e.getLineContent(i);
			au(r, i, t);
		}
		return t;
	}
	function au(e, t, n) {
		ps.lastIndex = 0;
		const i = ps.exec(e);
		if (i) {
			const r = i.indices[1][0] + 1,
				s = i.indices[1][1] + 1,
				o = {
					startLineNumber: t,
					startColumn: r,
					endLineNumber: t,
					endColumn: s,
				};
			if (o.endColumn > o.startColumn) {
				const l = { range: o, ...gs(i[1]), shouldBeInComments: !0 };
				(l.text || l.hasSeparatorLine) && n.push(l);
			}
		}
	}
	function gs(e) {
		e = e.trim();
		const t = e.startsWith("-");
		return (e = e.replace(nu, "")), { text: e, hasSeparatorLine: t };
	}
	class ou extends Go {
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
			for (let i = 0; i < this._lines.length; i++) {
				const r = this._lines[i],
					s = this.offsetAt(new ee(i + 1, 1)),
					o = r.matchAll(t);
				for (const l of o)
					(l.index || l.index === 0) && (l.index = l.index + s),
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
			const i = An(t.column, Hi(n), this._lines[t.lineNumber - 1], 0);
			return i
				? new $(t.lineNumber, i.startColumn, t.lineNumber, i.endColumn)
				: null;
		}
		words(t) {
			const n = this._lines,
				i = this._wordenize.bind(this);
			let r = 0,
				s = "",
				o = 0,
				l = [];
			return {
				*[Symbol.iterator]() {
					for (;;)
						if (o < l.length) {
							const a = s.substring(l[o].start, l[o].end);
							(o += 1), yield a;
						} else if (r < n.length)
							(s = n[r]), (l = i(s, t)), (o = 0), (r += 1);
						else break;
				},
			};
		}
		getLineWords(t, n) {
			const i = this._lines[t - 1],
				r = this._wordenize(i, n),
				s = [];
			for (const o of r)
				s.push({
					word: i.substring(o.start, o.end),
					startColumn: o.start + 1,
					endColumn: o.end + 1,
				});
			return s;
		}
		_wordenize(t, n) {
			const i = [];
			let r;
			for (n.lastIndex = 0; (r = n.exec(t)) && r[0].length !== 0; )
				i.push({ start: r.index, end: r.index + r[0].length });
			return i;
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
				i = t.startLineNumber - 1,
				r = t.endLineNumber - 1,
				s = [];
			s.push(this._lines[i].substring(t.startColumn - 1));
			for (let o = i + 1; o < r; o++) s.push(this._lines[o]);
			return (
				s.push(this._lines[r].substring(0, t.endColumn - 1)), s.join(n)
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
				i = this._lines[n.index].length;
			return {
				lineNumber: 1 + n.index,
				column: 1 + Math.min(n.remainder, i),
			};
		}
		_validateRange(t) {
			const n = this._validatePosition({
					lineNumber: t.startLineNumber,
					column: t.startColumn,
				}),
				i = this._validatePosition({
					lineNumber: t.endLineNumber,
					column: t.endColumn,
				});
			return n.lineNumber !== t.startLineNumber ||
				n.column !== t.startColumn ||
				i.lineNumber !== t.endLineNumber ||
				i.column !== t.endColumn
				? {
						startLineNumber: n.lineNumber,
						startColumn: n.column,
						endLineNumber: i.lineNumber,
						endColumn: i.column,
					}
				: t;
		}
		_validatePosition(t) {
			if (!ee.isIPosition(t)) throw new Error("bad position");
			let { lineNumber: n, column: i } = t,
				r = !1;
			if (n < 1) (n = 1), (i = 1), (r = !0);
			else if (n > this._lines.length)
				(n = this._lines.length),
					(i = this._lines[n - 1].length + 1),
					(r = !0);
			else {
				const s = this._lines[n - 1].length + 1;
				i < 1 ? ((i = 1), (r = !0)) : i > s && ((i = s), (r = !0));
			}
			return r ? { lineNumber: n, column: i } : t;
		}
	}
	class wt {
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
			this._models[t.url] = new ou(
				yn.parse(t.url),
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
		async computeUnicodeHighlights(t, n, i) {
			const r = this._getModel(t);
			return r
				? Tl.computeUnicodeHighlights(r, n, i)
				: {
						ranges: [],
						hasMore: !1,
						ambiguousCharacterCount: 0,
						invisibleCharacterCount: 0,
						nonBasicAsciiCharacterCount: 0,
					};
		}
		async findSectionHeaders(t, n) {
			const i = this._getModel(t);
			return i ? iu(i, n) : [];
		}
		async computeDiff(t, n, i, r) {
			const s = this._getModel(t),
				o = this._getModel(n);
			return !s || !o ? null : wt.computeDiff(s, o, i, r);
		}
		static computeDiff(t, n, i, r) {
			const s = r === "advanced" ? hs.getDefault() : hs.getLegacy(),
				o = t.getLinesContent(),
				l = n.getLinesContent(),
				a = s.computeDiff(o, l, i),
				u = a.changes.length > 0 ? !1 : this._modelsAreIdentical(t, n);
			function c(d) {
				return d.map((m) => [
					m.original.startLineNumber,
					m.original.endLineNumberExclusive,
					m.modified.startLineNumber,
					m.modified.endLineNumberExclusive,
					m.innerChanges?.map((f) => [
						f.originalRange.startLineNumber,
						f.originalRange.startColumn,
						f.originalRange.endLineNumber,
						f.originalRange.endColumn,
						f.modifiedRange.startLineNumber,
						f.modifiedRange.startColumn,
						f.modifiedRange.endLineNumber,
						f.modifiedRange.endColumn,
					]),
				]);
			}
			return {
				identical: u,
				quitEarly: a.hitTimeout,
				changes: c(a.changes),
				moves: a.moves.map((d) => [
					d.lineRangeMapping.original.startLineNumber,
					d.lineRangeMapping.original.endLineNumberExclusive,
					d.lineRangeMapping.modified.startLineNumber,
					d.lineRangeMapping.modified.endLineNumberExclusive,
					c(d.changes),
				]),
			};
		}
		static _modelsAreIdentical(t, n) {
			const i = t.getLineCount(),
				r = n.getLineCount();
			if (i !== r) return !1;
			for (let s = 1; s <= i; s++) {
				const o = t.getLineContent(s),
					l = n.getLineContent(s);
				if (o !== l) return !1;
			}
			return !0;
		}
		static {
			this._diffLimit = 1e5;
		}
		async computeMoreMinimalEdits(t, n, i) {
			const r = this._getModel(t);
			if (!r) return n;
			const s = [];
			let o;
			n = n.slice(0).sort((a, u) => {
				if (a.range && u.range)
					return $.compareRangesUsingStarts(a.range, u.range);
				const c = a.range ? 0 : 1,
					d = u.range ? 0 : 1;
				return c - d;
			});
			let l = 0;
			for (let a = 1; a < n.length; a++)
				$.getEndPosition(n[l].range).equals(
					$.getStartPosition(n[a].range),
				)
					? ((n[l].range = $.fromPositions(
							$.getStartPosition(n[l].range),
							$.getEndPosition(n[a].range),
						)),
						(n[l].text += n[a].text))
					: (l++, (n[l] = n[a]));
			n.length = l + 1;
			for (let { range: a, text: u, eol: c } of n) {
				if ((typeof c == "number" && (o = c), $.isEmpty(a) && !u))
					continue;
				const d = r.getValueInRange(a);
				if (((u = u.replace(/\r\n|\n|\r/g, r.eol)), d === u)) continue;
				if (Math.max(u.length, d.length) > wt._diffLimit) {
					s.push({ range: a, text: u });
					continue;
				}
				const m = wo(d, u, i),
					f = r.offsetAt($.lift(a).getStartPosition());
				for (const w of m) {
					const g = r.positionAt(f + w.originalStart),
						k = r.positionAt(
							f + w.originalStart + w.originalLength,
						),
						v = {
							text: u.substr(w.modifiedStart, w.modifiedLength),
							range: {
								startLineNumber: g.lineNumber,
								startColumn: g.column,
								endLineNumber: k.lineNumber,
								endColumn: k.column,
							},
						};
					r.getValueInRange(v.range) !== v.text && s.push(v);
				}
			}
			return (
				typeof o == "number" &&
					s.push({
						eol: o,
						text: "",
						range: {
							startLineNumber: 0,
							startColumn: 0,
							endLineNumber: 0,
							endColumn: 0,
						},
					}),
				s
			);
		}
		async computeLinks(t) {
			const n = this._getModel(t);
			return n ? el(n) : null;
		}
		async computeDefaultDocumentColors(t) {
			const n = this._getModel(t);
			return n ? tu(n) : null;
		}
		static {
			this._suggestionsLimit = 1e4;
		}
		async textualSuggest(t, n, i, r) {
			const s = new Ct(),
				o = new RegExp(i, r),
				l = new Set();
			e: for (const a of t) {
				const u = this._getModel(a);
				if (u) {
					for (const c of u.words(o))
						if (
							!(c === n || !isNaN(Number(c))) &&
							(l.add(c), l.size > wt._suggestionsLimit)
						)
							break e;
				}
			}
			return { words: Array.from(l), duration: s.elapsed() };
		}
		async computeWordRanges(t, n, i, r) {
			const s = this._getModel(t);
			if (!s) return Object.create(null);
			const o = new RegExp(i, r),
				l = Object.create(null);
			for (let a = n.startLineNumber; a < n.endLineNumber; a++) {
				const u = s.getLineWords(a, o);
				for (const c of u) {
					if (!isNaN(Number(c.word))) continue;
					let d = l[c.word];
					d || ((d = []), (l[c.word] = d)),
						d.push({
							startLineNumber: a,
							startColumn: c.startColumn,
							endLineNumber: a,
							endColumn: c.endColumn,
						});
				}
			}
			return l;
		}
		async navigateValueSet(t, n, i, r, s) {
			const o = this._getModel(t);
			if (!o) return null;
			const l = new RegExp(r, s);
			n.startColumn === n.endColumn &&
				(n = {
					startLineNumber: n.startLineNumber,
					startColumn: n.startColumn,
					endLineNumber: n.endLineNumber,
					endColumn: n.endColumn + 1,
				});
			const a = o.getValueInRange(n),
				u = o.getWordAtPosition(
					{ lineNumber: n.startLineNumber, column: n.startColumn },
					l,
				);
			if (!u) return null;
			const c = o.getValueInRange(u);
			return Cn.INSTANCE.navigateValueSet(n, a, u, c, i);
		}
		loadForeignModule(t, n, i) {
			const o = {
				host: $a(i, (l, a) => this._host.fhr(l, a)),
				getMirrorModels: () => this._getModels(),
			};
			return this._foreignModuleFactory
				? ((this._foreignModule = this._foreignModuleFactory(o, n)),
					Promise.resolve(dn(this._foreignModule)))
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
			} catch (i) {
				return Promise.reject(i);
			}
		}
	}
	typeof importScripts == "function" && (globalThis.monaco = ml());
	let On = !1;
	function bs(e) {
		if (On) return;
		On = !0;
		const t = new go(
			(n) => {
				globalThis.postMessage(n);
			},
			(n) => new wt(n, e),
		);
		globalThis.onmessage = (n) => {
			t.onmessage(n.data);
		};
	}
	globalThis.onmessage = (e) => {
		On || bs(null);
	}; /*!-----------------------------------------------------------------------------
	 * Copyright (c) Microsoft Corporation. All rights reserved.
	 * Version: 0.51.0-dev-20240731(93a0a2df32926aa86f7e11bc71a43afaea581a09)
	 * Released under the MIT license
	 * https://github.com/microsoft/monaco-editor/blob/main/LICENSE.txt
	 *-----------------------------------------------------------------------------*/
	function Te(...e) {
		const t = e[0];
		let n, i, r;
		if (typeof t == "string")
			(n = t),
				(i = t),
				e.splice(0, 1),
				(r = !e || typeof e[0] != "object" ? e : e[0]);
		else if (t instanceof Array) {
			const s = e.slice(1);
			if (t.length !== s.length + 1)
				throw new Error(
					"expected a string as the first argument to l10n.t",
				);
			let o = t[0];
			for (let l = 1; l < t.length; l++) o += `{${l - 1}}` + t[l];
			return Te(o, ...s);
		} else
			(i = t.message),
				(n = i),
				t.comment &&
					t.comment.length > 0 &&
					(n += `/${Array.isArray(t.comment) ? t.comment.join("") : t.comment}`),
				(r = t.args ?? {});
		return uu(i, r);
	}
	var lu = /{([^}]+)}/g;
	function uu(e, t) {
		return Object.keys(t).length === 0
			? e
			: e.replace(lu, (n, i) => t[i] ?? n);
	}
	var _s;
	(function (e) {
		function t(n) {
			return typeof n == "string";
		}
		e.is = t;
	})(_s || (_s = {}));
	var Vn;
	(function (e) {
		function t(n) {
			return typeof n == "string";
		}
		e.is = t;
	})(Vn || (Vn = {}));
	var ws;
	(function (e) {
		(e.MIN_VALUE = -2147483648), (e.MAX_VALUE = 2147483647);
		function t(n) {
			return typeof n == "number" && e.MIN_VALUE <= n && n <= e.MAX_VALUE;
		}
		e.is = t;
	})(ws || (ws = {}));
	var $t;
	(function (e) {
		(e.MIN_VALUE = 0), (e.MAX_VALUE = 2147483647);
		function t(n) {
			return typeof n == "number" && e.MIN_VALUE <= n && n <= e.MAX_VALUE;
		}
		e.is = t;
	})($t || ($t = {}));
	var re;
	(function (e) {
		function t(i, r) {
			return (
				i === Number.MAX_VALUE && (i = $t.MAX_VALUE),
				r === Number.MAX_VALUE && (r = $t.MAX_VALUE),
				{ line: i, character: r }
			);
		}
		e.create = t;
		function n(i) {
			let r = i;
			return (
				C.objectLiteral(r) &&
				C.uinteger(r.line) &&
				C.uinteger(r.character)
			);
		}
		e.is = n;
	})(re || (re = {}));
	var G;
	(function (e) {
		function t(i, r, s, o) {
			if (
				C.uinteger(i) &&
				C.uinteger(r) &&
				C.uinteger(s) &&
				C.uinteger(o)
			)
				return { start: re.create(i, r), end: re.create(s, o) };
			if (re.is(i) && re.is(r)) return { start: i, end: r };
			throw new Error(
				`Range#create called with invalid arguments[${i}, ${r}, ${s}, ${o}]`,
			);
		}
		e.create = t;
		function n(i) {
			let r = i;
			return C.objectLiteral(r) && re.is(r.start) && re.is(r.end);
		}
		e.is = n;
	})(G || (G = {}));
	var Xt;
	(function (e) {
		function t(i, r) {
			return { uri: i, range: r };
		}
		e.create = t;
		function n(i) {
			let r = i;
			return (
				C.objectLiteral(r) &&
				G.is(r.range) &&
				(C.string(r.uri) || C.undefined(r.uri))
			);
		}
		e.is = n;
	})(Xt || (Xt = {}));
	var vs;
	(function (e) {
		function t(i, r, s, o) {
			return {
				targetUri: i,
				targetRange: r,
				targetSelectionRange: s,
				originSelectionRange: o,
			};
		}
		e.create = t;
		function n(i) {
			let r = i;
			return (
				C.objectLiteral(r) &&
				G.is(r.targetRange) &&
				C.string(r.targetUri) &&
				G.is(r.targetSelectionRange) &&
				(G.is(r.originSelectionRange) ||
					C.undefined(r.originSelectionRange))
			);
		}
		e.is = n;
	})(vs || (vs = {}));
	var jn;
	(function (e) {
		function t(i, r, s, o) {
			return { red: i, green: r, blue: s, alpha: o };
		}
		e.create = t;
		function n(i) {
			const r = i;
			return (
				C.objectLiteral(r) &&
				C.numberRange(r.red, 0, 1) &&
				C.numberRange(r.green, 0, 1) &&
				C.numberRange(r.blue, 0, 1) &&
				C.numberRange(r.alpha, 0, 1)
			);
		}
		e.is = n;
	})(jn || (jn = {}));
	var ys;
	(function (e) {
		function t(i, r) {
			return { range: i, color: r };
		}
		e.create = t;
		function n(i) {
			const r = i;
			return C.objectLiteral(r) && G.is(r.range) && jn.is(r.color);
		}
		e.is = n;
	})(ys || (ys = {}));
	var xs;
	(function (e) {
		function t(i, r, s) {
			return { label: i, textEdit: r, additionalTextEdits: s };
		}
		e.create = t;
		function n(i) {
			const r = i;
			return (
				C.objectLiteral(r) &&
				C.string(r.label) &&
				(C.undefined(r.textEdit) || oe.is(r)) &&
				(C.undefined(r.additionalTextEdits) ||
					C.typedArray(r.additionalTextEdits, oe.is))
			);
		}
		e.is = n;
	})(xs || (xs = {}));
	var Jt;
	(function (e) {
		(e.Comment = "comment"), (e.Imports = "imports"), (e.Region = "region");
	})(Jt || (Jt = {}));
	var Ts;
	(function (e) {
		function t(i, r, s, o, l, a) {
			const u = { startLine: i, endLine: r };
			return (
				C.defined(s) && (u.startCharacter = s),
				C.defined(o) && (u.endCharacter = o),
				C.defined(l) && (u.kind = l),
				C.defined(a) && (u.collapsedText = a),
				u
			);
		}
		e.create = t;
		function n(i) {
			const r = i;
			return (
				C.objectLiteral(r) &&
				C.uinteger(r.startLine) &&
				C.uinteger(r.startLine) &&
				(C.undefined(r.startCharacter) ||
					C.uinteger(r.startCharacter)) &&
				(C.undefined(r.endCharacter) || C.uinteger(r.endCharacter)) &&
				(C.undefined(r.kind) || C.string(r.kind))
			);
		}
		e.is = n;
	})(Ts || (Ts = {}));
	var Gn;
	(function (e) {
		function t(i, r) {
			return { location: i, message: r };
		}
		e.create = t;
		function n(i) {
			let r = i;
			return C.defined(r) && Xt.is(r.location) && C.string(r.message);
		}
		e.is = n;
	})(Gn || (Gn = {}));
	var ks;
	(function (e) {
		(e.Error = 1), (e.Warning = 2), (e.Information = 3), (e.Hint = 4);
	})(ks || (ks = {}));
	var As;
	(function (e) {
		(e.Unnecessary = 1), (e.Deprecated = 2);
	})(As || (As = {}));
	var Ss;
	(function (e) {
		function t(n) {
			const i = n;
			return C.objectLiteral(i) && C.string(i.href);
		}
		e.is = t;
	})(Ss || (Ss = {}));
	var Yt;
	(function (e) {
		function t(i, r, s, o, l, a) {
			let u = { range: i, message: r };
			return (
				C.defined(s) && (u.severity = s),
				C.defined(o) && (u.code = o),
				C.defined(l) && (u.source = l),
				C.defined(a) && (u.relatedInformation = a),
				u
			);
		}
		e.create = t;
		function n(i) {
			var r;
			let s = i;
			return (
				C.defined(s) &&
				G.is(s.range) &&
				C.string(s.message) &&
				(C.number(s.severity) || C.undefined(s.severity)) &&
				(C.integer(s.code) ||
					C.string(s.code) ||
					C.undefined(s.code)) &&
				(C.undefined(s.codeDescription) ||
					C.string(
						(r = s.codeDescription) === null || r === void 0
							? void 0
							: r.href,
					)) &&
				(C.string(s.source) || C.undefined(s.source)) &&
				(C.undefined(s.relatedInformation) ||
					C.typedArray(s.relatedInformation, Gn.is))
			);
		}
		e.is = n;
	})(Yt || (Yt = {}));
	var st;
	(function (e) {
		function t(i, r, ...s) {
			let o = { title: i, command: r };
			return C.defined(s) && s.length > 0 && (o.arguments = s), o;
		}
		e.create = t;
		function n(i) {
			let r = i;
			return C.defined(r) && C.string(r.title) && C.string(r.command);
		}
		e.is = n;
	})(st || (st = {}));
	var oe;
	(function (e) {
		function t(s, o) {
			return { range: s, newText: o };
		}
		e.replace = t;
		function n(s, o) {
			return { range: { start: s, end: s }, newText: o };
		}
		e.insert = n;
		function i(s) {
			return { range: s, newText: "" };
		}
		e.del = i;
		function r(s) {
			const o = s;
			return C.objectLiteral(o) && C.string(o.newText) && G.is(o.range);
		}
		e.is = r;
	})(oe || (oe = {}));
	var $n;
	(function (e) {
		function t(i, r, s) {
			const o = { label: i };
			return (
				r !== void 0 && (o.needsConfirmation = r),
				s !== void 0 && (o.description = s),
				o
			);
		}
		e.create = t;
		function n(i) {
			const r = i;
			return (
				C.objectLiteral(r) &&
				C.string(r.label) &&
				(C.boolean(r.needsConfirmation) ||
					r.needsConfirmation === void 0) &&
				(C.string(r.description) || r.description === void 0)
			);
		}
		e.is = n;
	})($n || ($n = {}));
	var at;
	(function (e) {
		function t(n) {
			const i = n;
			return C.string(i);
		}
		e.is = t;
	})(at || (at = {}));
	var Ls;
	(function (e) {
		function t(s, o, l) {
			return { range: s, newText: o, annotationId: l };
		}
		e.replace = t;
		function n(s, o, l) {
			return { range: { start: s, end: s }, newText: o, annotationId: l };
		}
		e.insert = n;
		function i(s, o) {
			return { range: s, newText: "", annotationId: o };
		}
		e.del = i;
		function r(s) {
			const o = s;
			return oe.is(o) && ($n.is(o.annotationId) || at.is(o.annotationId));
		}
		e.is = r;
	})(Ls || (Ls = {}));
	var Xn;
	(function (e) {
		function t(i, r) {
			return { textDocument: i, edits: r };
		}
		e.create = t;
		function n(i) {
			let r = i;
			return (
				C.defined(r) && Kn.is(r.textDocument) && Array.isArray(r.edits)
			);
		}
		e.is = n;
	})(Xn || (Xn = {}));
	var Jn;
	(function (e) {
		function t(i, r, s) {
			let o = { kind: "create", uri: i };
			return (
				r !== void 0 &&
					(r.overwrite !== void 0 || r.ignoreIfExists !== void 0) &&
					(o.options = r),
				s !== void 0 && (o.annotationId = s),
				o
			);
		}
		e.create = t;
		function n(i) {
			let r = i;
			return (
				r &&
				r.kind === "create" &&
				C.string(r.uri) &&
				(r.options === void 0 ||
					((r.options.overwrite === void 0 ||
						C.boolean(r.options.overwrite)) &&
						(r.options.ignoreIfExists === void 0 ||
							C.boolean(r.options.ignoreIfExists)))) &&
				(r.annotationId === void 0 || at.is(r.annotationId))
			);
		}
		e.is = n;
	})(Jn || (Jn = {}));
	var Yn;
	(function (e) {
		function t(i, r, s, o) {
			let l = { kind: "rename", oldUri: i, newUri: r };
			return (
				s !== void 0 &&
					(s.overwrite !== void 0 || s.ignoreIfExists !== void 0) &&
					(l.options = s),
				o !== void 0 && (l.annotationId = o),
				l
			);
		}
		e.create = t;
		function n(i) {
			let r = i;
			return (
				r &&
				r.kind === "rename" &&
				C.string(r.oldUri) &&
				C.string(r.newUri) &&
				(r.options === void 0 ||
					((r.options.overwrite === void 0 ||
						C.boolean(r.options.overwrite)) &&
						(r.options.ignoreIfExists === void 0 ||
							C.boolean(r.options.ignoreIfExists)))) &&
				(r.annotationId === void 0 || at.is(r.annotationId))
			);
		}
		e.is = n;
	})(Yn || (Yn = {}));
	var Qn;
	(function (e) {
		function t(i, r, s) {
			let o = { kind: "delete", uri: i };
			return (
				r !== void 0 &&
					(r.recursive !== void 0 ||
						r.ignoreIfNotExists !== void 0) &&
					(o.options = r),
				s !== void 0 && (o.annotationId = s),
				o
			);
		}
		e.create = t;
		function n(i) {
			let r = i;
			return (
				r &&
				r.kind === "delete" &&
				C.string(r.uri) &&
				(r.options === void 0 ||
					((r.options.recursive === void 0 ||
						C.boolean(r.options.recursive)) &&
						(r.options.ignoreIfNotExists === void 0 ||
							C.boolean(r.options.ignoreIfNotExists)))) &&
				(r.annotationId === void 0 || at.is(r.annotationId))
			);
		}
		e.is = n;
	})(Qn || (Qn = {}));
	var Zn;
	(function (e) {
		function t(n) {
			let i = n;
			return (
				i &&
				(i.changes !== void 0 || i.documentChanges !== void 0) &&
				(i.documentChanges === void 0 ||
					i.documentChanges.every((r) =>
						C.string(r.kind)
							? Jn.is(r) || Yn.is(r) || Qn.is(r)
							: Xn.is(r),
					))
			);
		}
		e.is = t;
	})(Zn || (Zn = {}));
	var Cs;
	(function (e) {
		function t(i) {
			return { uri: i };
		}
		e.create = t;
		function n(i) {
			let r = i;
			return C.defined(r) && C.string(r.uri);
		}
		e.is = n;
	})(Cs || (Cs = {}));
	var Es;
	(function (e) {
		function t(i, r) {
			return { uri: i, version: r };
		}
		e.create = t;
		function n(i) {
			let r = i;
			return C.defined(r) && C.string(r.uri) && C.integer(r.version);
		}
		e.is = n;
	})(Es || (Es = {}));
	var Kn;
	(function (e) {
		function t(i, r) {
			return { uri: i, version: r };
		}
		e.create = t;
		function n(i) {
			let r = i;
			return (
				C.defined(r) &&
				C.string(r.uri) &&
				(r.version === null || C.integer(r.version))
			);
		}
		e.is = n;
	})(Kn || (Kn = {}));
	var Rs;
	(function (e) {
		function t(i, r, s, o) {
			return { uri: i, languageId: r, version: s, text: o };
		}
		e.create = t;
		function n(i) {
			let r = i;
			return (
				C.defined(r) &&
				C.string(r.uri) &&
				C.string(r.languageId) &&
				C.integer(r.version) &&
				C.string(r.text)
			);
		}
		e.is = n;
	})(Rs || (Rs = {}));
	var Me;
	(function (e) {
		(e.PlainText = "plaintext"), (e.Markdown = "markdown");
		function t(n) {
			const i = n;
			return i === e.PlainText || i === e.Markdown;
		}
		e.is = t;
	})(Me || (Me = {}));
	var vt;
	(function (e) {
		function t(n) {
			const i = n;
			return C.objectLiteral(n) && Me.is(i.kind) && C.string(i.value);
		}
		e.is = t;
	})(vt || (vt = {}));
	var he;
	(function (e) {
		(e.Text = 1),
			(e.Method = 2),
			(e.Function = 3),
			(e.Constructor = 4),
			(e.Field = 5),
			(e.Variable = 6),
			(e.Class = 7),
			(e.Interface = 8),
			(e.Module = 9),
			(e.Property = 10),
			(e.Unit = 11),
			(e.Value = 12),
			(e.Enum = 13),
			(e.Keyword = 14),
			(e.Snippet = 15),
			(e.Color = 16),
			(e.File = 17),
			(e.Reference = 18),
			(e.Folder = 19),
			(e.EnumMember = 20),
			(e.Constant = 21),
			(e.Struct = 22),
			(e.Event = 23),
			(e.Operator = 24),
			(e.TypeParameter = 25);
	})(he || (he = {}));
	var ke;
	(function (e) {
		(e.PlainText = 1), (e.Snippet = 2);
	})(ke || (ke = {}));
	var Ms;
	(function (e) {
		e.Deprecated = 1;
	})(Ms || (Ms = {}));
	var Ns;
	(function (e) {
		function t(i, r, s) {
			return { newText: i, insert: r, replace: s };
		}
		e.create = t;
		function n(i) {
			const r = i;
			return (
				r && C.string(r.newText) && G.is(r.insert) && G.is(r.replace)
			);
		}
		e.is = n;
	})(Ns || (Ns = {}));
	var Ds;
	(function (e) {
		(e.asIs = 1), (e.adjustIndentation = 2);
	})(Ds || (Ds = {}));
	var Is;
	(function (e) {
		function t(n) {
			const i = n;
			return (
				i &&
				(C.string(i.detail) || i.detail === void 0) &&
				(C.string(i.description) || i.description === void 0)
			);
		}
		e.is = t;
	})(Is || (Is = {}));
	var zs;
	(function (e) {
		function t(n) {
			return { label: n };
		}
		e.create = t;
	})(zs || (zs = {}));
	var Hs;
	(function (e) {
		function t(n, i) {
			return { items: n || [], isIncomplete: !!i };
		}
		e.create = t;
	})(Hs || (Hs = {}));
	var Qt;
	(function (e) {
		function t(i) {
			return i.replace(/[\\`*_{}[\]()#+\-.!]/g, "\\$&");
		}
		e.fromPlainText = t;
		function n(i) {
			const r = i;
			return (
				C.string(r) ||
				(C.objectLiteral(r) &&
					C.string(r.language) &&
					C.string(r.value))
			);
		}
		e.is = n;
	})(Qt || (Qt = {}));
	var Us;
	(function (e) {
		function t(n) {
			let i = n;
			return (
				!!i &&
				C.objectLiteral(i) &&
				(vt.is(i.contents) ||
					Qt.is(i.contents) ||
					C.typedArray(i.contents, Qt.is)) &&
				(n.range === void 0 || G.is(n.range))
			);
		}
		e.is = t;
	})(Us || (Us = {}));
	var Ws;
	(function (e) {
		function t(n, i) {
			return i ? { label: n, documentation: i } : { label: n };
		}
		e.create = t;
	})(Ws || (Ws = {}));
	var Fs;
	(function (e) {
		function t(n, i, ...r) {
			let s = { label: n };
			return (
				C.defined(i) && (s.documentation = i),
				C.defined(r) ? (s.parameters = r) : (s.parameters = []),
				s
			);
		}
		e.create = t;
	})(Fs || (Fs = {}));
	var Zt;
	(function (e) {
		(e.Text = 1), (e.Read = 2), (e.Write = 3);
	})(Zt || (Zt = {}));
	var Ps;
	(function (e) {
		function t(n, i) {
			let r = { range: n };
			return C.number(i) && (r.kind = i), r;
		}
		e.create = t;
	})(Ps || (Ps = {}));
	var ei;
	(function (e) {
		(e.File = 1),
			(e.Module = 2),
			(e.Namespace = 3),
			(e.Package = 4),
			(e.Class = 5),
			(e.Method = 6),
			(e.Property = 7),
			(e.Field = 8),
			(e.Constructor = 9),
			(e.Enum = 10),
			(e.Interface = 11),
			(e.Function = 12),
			(e.Variable = 13),
			(e.Constant = 14),
			(e.String = 15),
			(e.Number = 16),
			(e.Boolean = 17),
			(e.Array = 18),
			(e.Object = 19),
			(e.Key = 20),
			(e.Null = 21),
			(e.EnumMember = 22),
			(e.Struct = 23),
			(e.Event = 24),
			(e.Operator = 25),
			(e.TypeParameter = 26);
	})(ei || (ei = {}));
	var Bs;
	(function (e) {
		e.Deprecated = 1;
	})(Bs || (Bs = {}));
	var ti;
	(function (e) {
		function t(n, i, r, s, o) {
			let l = { name: n, kind: i, location: { uri: s, range: r } };
			return o && (l.containerName = o), l;
		}
		e.create = t;
	})(ti || (ti = {}));
	var qs;
	(function (e) {
		function t(n, i, r, s) {
			return s !== void 0
				? { name: n, kind: i, location: { uri: r, range: s } }
				: { name: n, kind: i, location: { uri: r } };
		}
		e.create = t;
	})(qs || (qs = {}));
	var ni;
	(function (e) {
		function t(i, r, s, o, l, a) {
			let u = {
				name: i,
				detail: r,
				kind: s,
				range: o,
				selectionRange: l,
			};
			return a !== void 0 && (u.children = a), u;
		}
		e.create = t;
		function n(i) {
			let r = i;
			return (
				r &&
				C.string(r.name) &&
				C.number(r.kind) &&
				G.is(r.range) &&
				G.is(r.selectionRange) &&
				(r.detail === void 0 || C.string(r.detail)) &&
				(r.deprecated === void 0 || C.boolean(r.deprecated)) &&
				(r.children === void 0 || Array.isArray(r.children)) &&
				(r.tags === void 0 || Array.isArray(r.tags))
			);
		}
		e.is = n;
	})(ni || (ni = {}));
	var Os;
	(function (e) {
		(e.Empty = ""),
			(e.QuickFix = "quickfix"),
			(e.Refactor = "refactor"),
			(e.RefactorExtract = "refactor.extract"),
			(e.RefactorInline = "refactor.inline"),
			(e.RefactorRewrite = "refactor.rewrite"),
			(e.Source = "source"),
			(e.SourceOrganizeImports = "source.organizeImports"),
			(e.SourceFixAll = "source.fixAll");
	})(Os || (Os = {}));
	var Kt;
	(function (e) {
		(e.Invoked = 1), (e.Automatic = 2);
	})(Kt || (Kt = {}));
	var Vs;
	(function (e) {
		function t(i, r, s) {
			let o = { diagnostics: i };
			return (
				r != null && (o.only = r), s != null && (o.triggerKind = s), o
			);
		}
		e.create = t;
		function n(i) {
			let r = i;
			return (
				C.defined(r) &&
				C.typedArray(r.diagnostics, Yt.is) &&
				(r.only === void 0 || C.typedArray(r.only, C.string)) &&
				(r.triggerKind === void 0 ||
					r.triggerKind === Kt.Invoked ||
					r.triggerKind === Kt.Automatic)
			);
		}
		e.is = n;
	})(Vs || (Vs = {}));
	var js;
	(function (e) {
		function t(i, r, s) {
			let o = { title: i },
				l = !0;
			return (
				typeof r == "string"
					? ((l = !1), (o.kind = r))
					: st.is(r)
						? (o.command = r)
						: (o.edit = r),
				l && s !== void 0 && (o.kind = s),
				o
			);
		}
		e.create = t;
		function n(i) {
			let r = i;
			return (
				r &&
				C.string(r.title) &&
				(r.diagnostics === void 0 ||
					C.typedArray(r.diagnostics, Yt.is)) &&
				(r.kind === void 0 || C.string(r.kind)) &&
				(r.edit !== void 0 || r.command !== void 0) &&
				(r.command === void 0 || st.is(r.command)) &&
				(r.isPreferred === void 0 || C.boolean(r.isPreferred)) &&
				(r.edit === void 0 || Zn.is(r.edit))
			);
		}
		e.is = n;
	})(js || (js = {}));
	var Gs;
	(function (e) {
		function t(i, r) {
			let s = { range: i };
			return C.defined(r) && (s.data = r), s;
		}
		e.create = t;
		function n(i) {
			let r = i;
			return (
				C.defined(r) &&
				G.is(r.range) &&
				(C.undefined(r.command) || st.is(r.command))
			);
		}
		e.is = n;
	})(Gs || (Gs = {}));
	var $s;
	(function (e) {
		function t(i, r) {
			return { tabSize: i, insertSpaces: r };
		}
		e.create = t;
		function n(i) {
			let r = i;
			return (
				C.defined(r) &&
				C.uinteger(r.tabSize) &&
				C.boolean(r.insertSpaces)
			);
		}
		e.is = n;
	})($s || ($s = {}));
	var Xs;
	(function (e) {
		function t(i, r, s) {
			return { range: i, target: r, data: s };
		}
		e.create = t;
		function n(i) {
			let r = i;
			return (
				C.defined(r) &&
				G.is(r.range) &&
				(C.undefined(r.target) || C.string(r.target))
			);
		}
		e.is = n;
	})(Xs || (Xs = {}));
	var en;
	(function (e) {
		function t(i, r) {
			return { range: i, parent: r };
		}
		e.create = t;
		function n(i) {
			let r = i;
			return (
				C.objectLiteral(r) &&
				G.is(r.range) &&
				(r.parent === void 0 || e.is(r.parent))
			);
		}
		e.is = n;
	})(en || (en = {}));
	var Js;
	(function (e) {
		(e.namespace = "namespace"),
			(e.type = "type"),
			(e.class = "class"),
			(e.enum = "enum"),
			(e.interface = "interface"),
			(e.struct = "struct"),
			(e.typeParameter = "typeParameter"),
			(e.parameter = "parameter"),
			(e.variable = "variable"),
			(e.property = "property"),
			(e.enumMember = "enumMember"),
			(e.event = "event"),
			(e.function = "function"),
			(e.method = "method"),
			(e.macro = "macro"),
			(e.keyword = "keyword"),
			(e.modifier = "modifier"),
			(e.comment = "comment"),
			(e.string = "string"),
			(e.number = "number"),
			(e.regexp = "regexp"),
			(e.operator = "operator"),
			(e.decorator = "decorator");
	})(Js || (Js = {}));
	var Ys;
	(function (e) {
		(e.declaration = "declaration"),
			(e.definition = "definition"),
			(e.readonly = "readonly"),
			(e.static = "static"),
			(e.deprecated = "deprecated"),
			(e.abstract = "abstract"),
			(e.async = "async"),
			(e.modification = "modification"),
			(e.documentation = "documentation"),
			(e.defaultLibrary = "defaultLibrary");
	})(Ys || (Ys = {}));
	var Qs;
	(function (e) {
		function t(n) {
			const i = n;
			return (
				C.objectLiteral(i) &&
				(i.resultId === void 0 || typeof i.resultId == "string") &&
				Array.isArray(i.data) &&
				(i.data.length === 0 || typeof i.data[0] == "number")
			);
		}
		e.is = t;
	})(Qs || (Qs = {}));
	var Zs;
	(function (e) {
		function t(i, r) {
			return { range: i, text: r };
		}
		e.create = t;
		function n(i) {
			const r = i;
			return r != null && G.is(r.range) && C.string(r.text);
		}
		e.is = n;
	})(Zs || (Zs = {}));
	var Ks;
	(function (e) {
		function t(i, r, s) {
			return { range: i, variableName: r, caseSensitiveLookup: s };
		}
		e.create = t;
		function n(i) {
			const r = i;
			return (
				r != null &&
				G.is(r.range) &&
				C.boolean(r.caseSensitiveLookup) &&
				(C.string(r.variableName) || r.variableName === void 0)
			);
		}
		e.is = n;
	})(Ks || (Ks = {}));
	var ea;
	(function (e) {
		function t(i, r) {
			return { range: i, expression: r };
		}
		e.create = t;
		function n(i) {
			const r = i;
			return (
				r != null &&
				G.is(r.range) &&
				(C.string(r.expression) || r.expression === void 0)
			);
		}
		e.is = n;
	})(ea || (ea = {}));
	var ta;
	(function (e) {
		function t(i, r) {
			return { frameId: i, stoppedLocation: r };
		}
		e.create = t;
		function n(i) {
			const r = i;
			return C.defined(r) && G.is(i.stoppedLocation);
		}
		e.is = n;
	})(ta || (ta = {}));
	var ii;
	(function (e) {
		(e.Type = 1), (e.Parameter = 2);
		function t(n) {
			return n === 1 || n === 2;
		}
		e.is = t;
	})(ii || (ii = {}));
	var ri;
	(function (e) {
		function t(i) {
			return { value: i };
		}
		e.create = t;
		function n(i) {
			const r = i;
			return (
				C.objectLiteral(r) &&
				(r.tooltip === void 0 ||
					C.string(r.tooltip) ||
					vt.is(r.tooltip)) &&
				(r.location === void 0 || Xt.is(r.location)) &&
				(r.command === void 0 || st.is(r.command))
			);
		}
		e.is = n;
	})(ri || (ri = {}));
	var na;
	(function (e) {
		function t(i, r, s) {
			const o = { position: i, label: r };
			return s !== void 0 && (o.kind = s), o;
		}
		e.create = t;
		function n(i) {
			const r = i;
			return (
				(C.objectLiteral(r) &&
					re.is(r.position) &&
					(C.string(r.label) || C.typedArray(r.label, ri.is)) &&
					(r.kind === void 0 || ii.is(r.kind)) &&
					r.textEdits === void 0) ||
				(C.typedArray(r.textEdits, oe.is) &&
					(r.tooltip === void 0 ||
						C.string(r.tooltip) ||
						vt.is(r.tooltip)) &&
					(r.paddingLeft === void 0 || C.boolean(r.paddingLeft)) &&
					(r.paddingRight === void 0 || C.boolean(r.paddingRight)))
			);
		}
		e.is = n;
	})(na || (na = {}));
	var ia;
	(function (e) {
		function t(n) {
			return { kind: "snippet", value: n };
		}
		e.createSnippet = t;
	})(ia || (ia = {}));
	var ra;
	(function (e) {
		function t(n, i, r, s) {
			return { insertText: n, filterText: i, range: r, command: s };
		}
		e.create = t;
	})(ra || (ra = {}));
	var sa;
	(function (e) {
		function t(n) {
			return { items: n };
		}
		e.create = t;
	})(sa || (sa = {}));
	var aa;
	(function (e) {
		(e.Invoked = 0), (e.Automatic = 1);
	})(aa || (aa = {}));
	var oa;
	(function (e) {
		function t(n, i) {
			return { range: n, text: i };
		}
		e.create = t;
	})(oa || (oa = {}));
	var la;
	(function (e) {
		function t(n, i) {
			return { triggerKind: n, selectedCompletionInfo: i };
		}
		e.create = t;
	})(la || (la = {}));
	var ua;
	(function (e) {
		function t(n) {
			const i = n;
			return C.objectLiteral(i) && Vn.is(i.uri) && C.string(i.name);
		}
		e.is = t;
	})(ua || (ua = {}));
	var ca;
	(function (e) {
		function t(s, o, l, a) {
			return new cu(s, o, l, a);
		}
		e.create = t;
		function n(s) {
			let o = s;
			return !!(
				C.defined(o) &&
				C.string(o.uri) &&
				(C.undefined(o.languageId) || C.string(o.languageId)) &&
				C.uinteger(o.lineCount) &&
				C.func(o.getText) &&
				C.func(o.positionAt) &&
				C.func(o.offsetAt)
			);
		}
		e.is = n;
		function i(s, o) {
			let l = s.getText(),
				a = r(o, (c, d) => {
					let m = c.range.start.line - d.range.start.line;
					return m === 0
						? c.range.start.character - d.range.start.character
						: m;
				}),
				u = l.length;
			for (let c = a.length - 1; c >= 0; c--) {
				let d = a[c],
					m = s.offsetAt(d.range.start),
					f = s.offsetAt(d.range.end);
				if (f <= u)
					l =
						l.substring(0, m) +
						d.newText +
						l.substring(f, l.length);
				else throw new Error("Overlapping edit");
				u = m;
			}
			return l;
		}
		e.applyEdits = i;
		function r(s, o) {
			if (s.length <= 1) return s;
			const l = (s.length / 2) | 0,
				a = s.slice(0, l),
				u = s.slice(l);
			r(a, o), r(u, o);
			let c = 0,
				d = 0,
				m = 0;
			for (; c < a.length && d < u.length; )
				o(a[c], u[d]) <= 0 ? (s[m++] = a[c++]) : (s[m++] = u[d++]);
			for (; c < a.length; ) s[m++] = a[c++];
			for (; d < u.length; ) s[m++] = u[d++];
			return s;
		}
	})(ca || (ca = {}));
	var cu = class {
			constructor(e, t, n, i) {
				(this._uri = e),
					(this._languageId = t),
					(this._version = n),
					(this._content = i),
					(this._lineOffsets = void 0);
			}
			get uri() {
				return this._uri;
			}
			get languageId() {
				return this._languageId;
			}
			get version() {
				return this._version;
			}
			getText(e) {
				if (e) {
					let t = this.offsetAt(e.start),
						n = this.offsetAt(e.end);
					return this._content.substring(t, n);
				}
				return this._content;
			}
			update(e, t) {
				(this._content = e.text),
					(this._version = t),
					(this._lineOffsets = void 0);
			}
			getLineOffsets() {
				if (this._lineOffsets === void 0) {
					let e = [],
						t = this._content,
						n = !0;
					for (let i = 0; i < t.length; i++) {
						n && (e.push(i), (n = !1));
						let r = t.charAt(i);
						(n =
							r === "\r" ||
							r ===
								`
`),
							r === "\r" &&
								i + 1 < t.length &&
								t.charAt(i + 1) ===
									`
` &&
								i++;
					}
					n && t.length > 0 && e.push(t.length),
						(this._lineOffsets = e);
				}
				return this._lineOffsets;
			}
			positionAt(e) {
				e = Math.max(Math.min(e, this._content.length), 0);
				let t = this.getLineOffsets(),
					n = 0,
					i = t.length;
				if (i === 0) return re.create(0, e);
				for (; n < i; ) {
					let s = Math.floor((n + i) / 2);
					t[s] > e ? (i = s) : (n = s + 1);
				}
				let r = n - 1;
				return re.create(r, e - t[r]);
			}
			offsetAt(e) {
				let t = this.getLineOffsets();
				if (e.line >= t.length) return this._content.length;
				if (e.line < 0) return 0;
				let n = t[e.line],
					i =
						e.line + 1 < t.length
							? t[e.line + 1]
							: this._content.length;
				return Math.max(Math.min(n + e.character, i), n);
			}
			get lineCount() {
				return this.getLineOffsets().length;
			}
		},
		C;
	(function (e) {
		const t = Object.prototype.toString;
		function n(f) {
			return typeof f < "u";
		}
		e.defined = n;
		function i(f) {
			return typeof f > "u";
		}
		e.undefined = i;
		function r(f) {
			return f === !0 || f === !1;
		}
		e.boolean = r;
		function s(f) {
			return t.call(f) === "[object String]";
		}
		e.string = s;
		function o(f) {
			return t.call(f) === "[object Number]";
		}
		e.number = o;
		function l(f, w, g) {
			return t.call(f) === "[object Number]" && w <= f && f <= g;
		}
		e.numberRange = l;
		function a(f) {
			return (
				t.call(f) === "[object Number]" &&
				-2147483648 <= f &&
				f <= 2147483647
			);
		}
		e.integer = a;
		function u(f) {
			return t.call(f) === "[object Number]" && 0 <= f && f <= 2147483647;
		}
		e.uinteger = u;
		function c(f) {
			return t.call(f) === "[object Function]";
		}
		e.func = c;
		function d(f) {
			return f !== null && typeof f == "object";
		}
		e.objectLiteral = d;
		function m(f, w) {
			return Array.isArray(f) && f.every(w);
		}
		e.typedArray = m;
	})(C || (C = {}));
	var ha = class hi {
			constructor(t, n, i, r) {
				(this._uri = t),
					(this._languageId = n),
					(this._version = i),
					(this._content = r),
					(this._lineOffsets = void 0);
			}
			get uri() {
				return this._uri;
			}
			get languageId() {
				return this._languageId;
			}
			get version() {
				return this._version;
			}
			getText(t) {
				if (t) {
					const n = this.offsetAt(t.start),
						i = this.offsetAt(t.end);
					return this._content.substring(n, i);
				}
				return this._content;
			}
			update(t, n) {
				for (let i of t)
					if (hi.isIncremental(i)) {
						const r = ma(i.range),
							s = this.offsetAt(r.start),
							o = this.offsetAt(r.end);
						this._content =
							this._content.substring(0, s) +
							i.text +
							this._content.substring(o, this._content.length);
						const l = Math.max(r.start.line, 0),
							a = Math.max(r.end.line, 0);
						let u = this._lineOffsets;
						const c = da(i.text, !1, s);
						if (a - l === c.length)
							for (let m = 0, f = c.length; m < f; m++)
								u[m + l + 1] = c[m];
						else
							c.length < 1e4
								? u.splice(l + 1, a - l, ...c)
								: (this._lineOffsets = u =
										u
											.slice(0, l + 1)
											.concat(c, u.slice(a + 1)));
						const d = i.text.length - (o - s);
						if (d !== 0)
							for (
								let m = l + 1 + c.length, f = u.length;
								m < f;
								m++
							)
								u[m] = u[m] + d;
					} else if (hi.isFull(i))
						(this._content = i.text), (this._lineOffsets = void 0);
					else throw new Error("Unknown change event received");
				this._version = n;
			}
			getLineOffsets() {
				return (
					this._lineOffsets === void 0 &&
						(this._lineOffsets = da(this._content, !0)),
					this._lineOffsets
				);
			}
			positionAt(t) {
				t = Math.max(Math.min(t, this._content.length), 0);
				let n = this.getLineOffsets(),
					i = 0,
					r = n.length;
				if (r === 0) return { line: 0, character: t };
				for (; i < r; ) {
					let o = Math.floor((i + r) / 2);
					n[o] > t ? (r = o) : (i = o + 1);
				}
				let s = i - 1;
				return { line: s, character: t - n[s] };
			}
			offsetAt(t) {
				let n = this.getLineOffsets();
				if (t.line >= n.length) return this._content.length;
				if (t.line < 0) return 0;
				let i = n[t.line],
					r =
						t.line + 1 < n.length
							? n[t.line + 1]
							: this._content.length;
				return Math.max(Math.min(i + t.character, r), i);
			}
			get lineCount() {
				return this.getLineOffsets().length;
			}
			static isIncremental(t) {
				let n = t;
				return (
					n != null &&
					typeof n.text == "string" &&
					n.range !== void 0 &&
					(n.rangeLength === void 0 ||
						typeof n.rangeLength == "number")
				);
			}
			static isFull(t) {
				let n = t;
				return (
					n != null &&
					typeof n.text == "string" &&
					n.range === void 0 &&
					n.rangeLength === void 0
				);
			}
		},
		si;
	(function (e) {
		function t(r, s, o, l) {
			return new ha(r, s, o, l);
		}
		e.create = t;
		function n(r, s, o) {
			if (r instanceof ha) return r.update(s, o), r;
			throw new Error(
				"TextDocument.update: document must be created by TextDocument.create",
			);
		}
		e.update = n;
		function i(r, s) {
			let o = r.getText(),
				l = ai(s.map(hu), (c, d) => {
					let m = c.range.start.line - d.range.start.line;
					return m === 0
						? c.range.start.character - d.range.start.character
						: m;
				}),
				a = 0;
			const u = [];
			for (const c of l) {
				let d = r.offsetAt(c.range.start);
				if (d < a) throw new Error("Overlapping edit");
				d > a && u.push(o.substring(a, d)),
					c.newText.length && u.push(c.newText),
					(a = r.offsetAt(c.range.end));
			}
			return u.push(o.substr(a)), u.join("");
		}
		e.applyEdits = i;
	})(si || (si = {}));
	function ai(e, t) {
		if (e.length <= 1) return e;
		const n = (e.length / 2) | 0,
			i = e.slice(0, n),
			r = e.slice(n);
		ai(i, t), ai(r, t);
		let s = 0,
			o = 0,
			l = 0;
		for (; s < i.length && o < r.length; )
			t(i[s], r[o]) <= 0 ? (e[l++] = i[s++]) : (e[l++] = r[o++]);
		for (; s < i.length; ) e[l++] = i[s++];
		for (; o < r.length; ) e[l++] = r[o++];
		return e;
	}
	function da(e, t, n = 0) {
		const i = t ? [n] : [];
		for (let r = 0; r < e.length; r++) {
			let s = e.charCodeAt(r);
			(s === 13 || s === 10) &&
				(s === 13 &&
					r + 1 < e.length &&
					e.charCodeAt(r + 1) === 10 &&
					r++,
				i.push(n + r + 1));
		}
		return i;
	}
	function ma(e) {
		const t = e.start,
			n = e.end;
		return t.line > n.line ||
			(t.line === n.line && t.character > n.character)
			? { start: n, end: t }
			: e;
	}
	function hu(e) {
		const t = ma(e.range);
		return t !== e.range ? { newText: e.newText, range: t } : e;
	}
	var z;
	(function (e) {
		(e[(e.StartCommentTag = 0)] = "StartCommentTag"),
			(e[(e.Comment = 1)] = "Comment"),
			(e[(e.EndCommentTag = 2)] = "EndCommentTag"),
			(e[(e.StartTagOpen = 3)] = "StartTagOpen"),
			(e[(e.StartTagClose = 4)] = "StartTagClose"),
			(e[(e.StartTagSelfClose = 5)] = "StartTagSelfClose"),
			(e[(e.StartTag = 6)] = "StartTag"),
			(e[(e.EndTagOpen = 7)] = "EndTagOpen"),
			(e[(e.EndTagClose = 8)] = "EndTagClose"),
			(e[(e.EndTag = 9)] = "EndTag"),
			(e[(e.DelimiterAssign = 10)] = "DelimiterAssign"),
			(e[(e.AttributeName = 11)] = "AttributeName"),
			(e[(e.AttributeValue = 12)] = "AttributeValue"),
			(e[(e.StartDoctypeTag = 13)] = "StartDoctypeTag"),
			(e[(e.Doctype = 14)] = "Doctype"),
			(e[(e.EndDoctypeTag = 15)] = "EndDoctypeTag"),
			(e[(e.Content = 16)] = "Content"),
			(e[(e.Whitespace = 17)] = "Whitespace"),
			(e[(e.Unknown = 18)] = "Unknown"),
			(e[(e.Script = 19)] = "Script"),
			(e[(e.Styles = 20)] = "Styles"),
			(e[(e.EOS = 21)] = "EOS");
	})(z || (z = {}));
	var B;
	(function (e) {
		(e[(e.WithinContent = 0)] = "WithinContent"),
			(e[(e.AfterOpeningStartTag = 1)] = "AfterOpeningStartTag"),
			(e[(e.AfterOpeningEndTag = 2)] = "AfterOpeningEndTag"),
			(e[(e.WithinDoctype = 3)] = "WithinDoctype"),
			(e[(e.WithinTag = 4)] = "WithinTag"),
			(e[(e.WithinEndTag = 5)] = "WithinEndTag"),
			(e[(e.WithinComment = 6)] = "WithinComment"),
			(e[(e.WithinScriptContent = 7)] = "WithinScriptContent"),
			(e[(e.WithinStyleContent = 8)] = "WithinStyleContent"),
			(e[(e.AfterAttributeName = 9)] = "AfterAttributeName"),
			(e[(e.BeforeAttributeValue = 10)] = "BeforeAttributeValue");
	})(B || (B = {}));
	var fa;
	(function (e) {
		e.LATEST = {
			textDocument: {
				completion: {
					completionItem: {
						documentationFormat: [Me.Markdown, Me.PlainText],
					},
				},
				hover: { contentFormat: [Me.Markdown, Me.PlainText] },
			},
		};
	})(fa || (fa = {}));
	var oi;
	(function (e) {
		(e[(e.Unknown = 0)] = "Unknown"),
			(e[(e.File = 1)] = "File"),
			(e[(e.Directory = 2)] = "Directory"),
			(e[(e.SymbolicLink = 64)] = "SymbolicLink");
	})(oi || (oi = {}));
	var du = class {
			constructor(e, t) {
				(this.source = e), (this.len = e.length), (this.position = t);
			}
			eos() {
				return this.len <= this.position;
			}
			getSource() {
				return this.source;
			}
			pos() {
				return this.position;
			}
			goBackTo(e) {
				this.position = e;
			}
			goBack(e) {
				this.position -= e;
			}
			advance(e) {
				this.position += e;
			}
			goToEnd() {
				this.position = this.source.length;
			}
			nextChar() {
				return this.source.charCodeAt(this.position++) || 0;
			}
			peekChar(e = 0) {
				return this.source.charCodeAt(this.position + e) || 0;
			}
			advanceIfChar(e) {
				return e === this.source.charCodeAt(this.position)
					? (this.position++, !0)
					: !1;
			}
			advanceIfChars(e) {
				let t;
				if (this.position + e.length > this.source.length) return !1;
				for (t = 0; t < e.length; t++)
					if (this.source.charCodeAt(this.position + t) !== e[t])
						return !1;
				return this.advance(t), !0;
			}
			advanceIfRegExp(e) {
				const n = this.source.substr(this.position).match(e);
				return n
					? ((this.position = this.position + n.index + n[0].length),
						n[0])
					: "";
			}
			advanceUntilRegExp(e) {
				const n = this.source.substr(this.position).match(e);
				return n
					? ((this.position = this.position + n.index), n[0])
					: (this.goToEnd(), "");
			}
			advanceUntilChar(e) {
				for (; this.position < this.source.length; ) {
					if (this.source.charCodeAt(this.position) === e) return !0;
					this.advance(1);
				}
				return !1;
			}
			advanceUntilChars(e) {
				for (; this.position + e.length <= this.source.length; ) {
					let t = 0;
					for (
						;
						t < e.length &&
						this.source.charCodeAt(this.position + t) === e[t];
						t++
					);
					if (t === e.length) return !0;
					this.advance(1);
				}
				return this.goToEnd(), !1;
			}
			skipWhitespace() {
				return (
					this.advanceWhileChar(
						(t) =>
							t === wu ||
							t === vu ||
							t === gu ||
							t === _u ||
							t === bu,
					) > 0
				);
			}
			advanceWhileChar(e) {
				const t = this.position;
				for (
					;
					this.position < this.len &&
					e(this.source.charCodeAt(this.position));
				)
					this.position++;
				return this.position - t;
			}
		},
		pa = 33,
		ot = 45,
		tn = 60,
		Le = 62,
		li = 47,
		mu = 61,
		fu = 34,
		pu = 39,
		gu = 10,
		bu = 13,
		_u = 12,
		wu = 32,
		vu = 9,
		yu = { "text/x-handlebars-template": !0, "text/html": !0 };
	function pe(e, t = 0, n = B.WithinContent, i = !1) {
		const r = new du(e, t);
		let s = n,
			o = 0,
			l = z.Unknown,
			a,
			u,
			c,
			d,
			m;
		function f() {
			return r.advanceIfRegExp(/^[_:\w][_:\w-.\d]*/).toLowerCase();
		}
		function w() {
			return r
				.advanceIfRegExp(/^[^\s"'></=\x00-\x0F\x7F\x80-\x9F]*/)
				.toLowerCase();
		}
		function g(y, E, R) {
			return (l = E), (o = y), (a = R), E;
		}
		function k() {
			const y = r.pos(),
				E = s,
				R = v();
			return R !== z.EOS &&
				y === r.pos() &&
				!(i && (R === z.StartTagClose || R === z.EndTagClose))
				? (console.warn(
						"Scanner.scan has not advanced at offset " +
							y +
							", state before: " +
							E +
							" after: " +
							s,
					),
					r.advance(1),
					g(y, z.Unknown))
				: R;
		}
		function v() {
			const y = r.pos();
			if (r.eos()) return g(y, z.EOS);
			let E;
			switch (s) {
				case B.WithinComment:
					return r.advanceIfChars([ot, ot, Le])
						? ((s = B.WithinContent), g(y, z.EndCommentTag))
						: (r.advanceUntilChars([ot, ot, Le]), g(y, z.Comment));
				case B.WithinDoctype:
					return r.advanceIfChar(Le)
						? ((s = B.WithinContent), g(y, z.EndDoctypeTag))
						: (r.advanceUntilChar(Le), g(y, z.Doctype));
				case B.WithinContent:
					if (r.advanceIfChar(tn)) {
						if (!r.eos() && r.peekChar() === pa) {
							if (r.advanceIfChars([pa, ot, ot]))
								return (
									(s = B.WithinComment),
									g(y, z.StartCommentTag)
								);
							if (r.advanceIfRegExp(/^!doctype/i))
								return (
									(s = B.WithinDoctype),
									g(y, z.StartDoctypeTag)
								);
						}
						return r.advanceIfChar(li)
							? ((s = B.AfterOpeningEndTag), g(y, z.EndTagOpen))
							: ((s = B.AfterOpeningStartTag),
								g(y, z.StartTagOpen));
					}
					return r.advanceUntilChar(tn), g(y, z.Content);
				case B.AfterOpeningEndTag:
					return f().length > 0
						? ((s = B.WithinEndTag), g(y, z.EndTag))
						: r.skipWhitespace()
							? g(
									y,
									z.Whitespace,
									Te(
										"Tag name must directly follow the open bracket.",
									),
								)
							: ((s = B.WithinEndTag),
								r.advanceUntilChar(Le),
								y < r.pos()
									? g(
											y,
											z.Unknown,
											Te("End tag name expected."),
										)
									: v());
				case B.WithinEndTag:
					if (r.skipWhitespace()) return g(y, z.Whitespace);
					if (r.advanceIfChar(Le))
						return (s = B.WithinContent), g(y, z.EndTagClose);
					if (i && r.peekChar() === tn)
						return (
							(s = B.WithinContent),
							g(y, z.EndTagClose, Te("Closing bracket missing."))
						);
					E = Te("Closing bracket expected.");
					break;
				case B.AfterOpeningStartTag:
					return (
						(c = f()),
						(m = void 0),
						(d = void 0),
						c.length > 0
							? ((u = !1), (s = B.WithinTag), g(y, z.StartTag))
							: r.skipWhitespace()
								? g(
										y,
										z.Whitespace,
										Te(
											"Tag name must directly follow the open bracket.",
										),
									)
								: ((s = B.WithinTag),
									r.advanceUntilChar(Le),
									y < r.pos()
										? g(
												y,
												z.Unknown,
												Te("Start tag name expected."),
											)
										: v())
					);
				case B.WithinTag:
					return r.skipWhitespace()
						? ((u = !0), g(y, z.Whitespace))
						: u && ((d = w()), d.length > 0)
							? ((s = B.AfterAttributeName),
								(u = !1),
								g(y, z.AttributeName))
							: r.advanceIfChars([li, Le])
								? ((s = B.WithinContent),
									g(y, z.StartTagSelfClose))
								: r.advanceIfChar(Le)
									? (c === "script"
											? m && yu[m]
												? (s = B.WithinContent)
												: (s = B.WithinScriptContent)
											: c === "style"
												? (s = B.WithinStyleContent)
												: (s = B.WithinContent),
										g(y, z.StartTagClose))
									: i && r.peekChar() === tn
										? ((s = B.WithinContent),
											g(
												y,
												z.StartTagClose,
												Te("Closing bracket missing."),
											))
										: (r.advance(1),
											g(
												y,
												z.Unknown,
												Te(
													"Unexpected character in tag.",
												),
											));
				case B.AfterAttributeName:
					return r.skipWhitespace()
						? ((u = !0), g(y, z.Whitespace))
						: r.advanceIfChar(mu)
							? ((s = B.BeforeAttributeValue),
								g(y, z.DelimiterAssign))
							: ((s = B.WithinTag), v());
				case B.BeforeAttributeValue:
					if (r.skipWhitespace()) return g(y, z.Whitespace);
					let N = r.advanceIfRegExp(/^[^\s"'`=<>]+/);
					if (
						N.length > 0 &&
						(r.peekChar() === Le &&
							r.peekChar(-1) === li &&
							(r.goBack(1), (N = N.substring(0, N.length - 1))),
						d === "type" && (m = N),
						N.length > 0)
					)
						return (
							(s = B.WithinTag), (u = !1), g(y, z.AttributeValue)
						);
					const M = r.peekChar();
					return M === pu || M === fu
						? (r.advance(1),
							r.advanceUntilChar(M) && r.advance(1),
							d === "type" &&
								(m = r
									.getSource()
									.substring(y + 1, r.pos() - 1)),
							(s = B.WithinTag),
							(u = !1),
							g(y, z.AttributeValue))
						: ((s = B.WithinTag), (u = !1), v());
				case B.WithinScriptContent:
					let b = 1;
					for (; !r.eos(); ) {
						const p = r.advanceIfRegExp(
							/<!--|-->|<\/?script\s*\/?>?/i,
						);
						if (p.length === 0) return r.goToEnd(), g(y, z.Script);
						if (p === "<!--") b === 1 && (b = 2);
						else if (p === "-->") b = 1;
						else if (p[1] !== "/") b === 2 && (b = 3);
						else if (b === 3) b = 2;
						else {
							r.goBack(p.length);
							break;
						}
					}
					return (
						(s = B.WithinContent),
						y < r.pos() ? g(y, z.Script) : v()
					);
				case B.WithinStyleContent:
					return (
						r.advanceUntilRegExp(/<\/style/i),
						(s = B.WithinContent),
						y < r.pos() ? g(y, z.Styles) : v()
					);
			}
			return r.advance(1), (s = B.WithinContent), g(y, z.Unknown, E);
		}
		return {
			scan: k,
			getTokenType: () => l,
			getTokenOffset: () => o,
			getTokenLength: () => r.pos() - o,
			getTokenEnd: () => r.pos(),
			getTokenText: () => r.getSource().substring(o, r.pos()),
			getScannerState: () => s,
			getTokenError: () => a,
		};
	}
	function ga(e, t) {
		let n = 0,
			i = e.length;
		if (i === 0) return 0;
		for (; n < i; ) {
			let r = Math.floor((n + i) / 2);
			t(e[r]) ? (i = r) : (n = r + 1);
		}
		return n;
	}
	function xu(e, t, n) {
		let i = 0,
			r = e.length - 1;
		for (; i <= r; ) {
			const s = ((i + r) / 2) | 0,
				o = n(e[s], t);
			if (o < 0) i = s + 1;
			else if (o > 0) r = s - 1;
			else return s;
		}
		return -(i + 1);
	}
	var ba = class {
			get attributeNames() {
				return this.attributes ? Object.keys(this.attributes) : [];
			}
			constructor(e, t, n, i) {
				(this.start = e),
					(this.end = t),
					(this.children = n),
					(this.parent = i),
					(this.closed = !1);
			}
			isSameTag(e) {
				return this.tag === void 0
					? e === void 0
					: e !== void 0 &&
							this.tag.length === e.length &&
							this.tag.toLowerCase() === e;
			}
			get firstChild() {
				return this.children[0];
			}
			get lastChild() {
				return this.children.length
					? this.children[this.children.length - 1]
					: void 0;
			}
			findNodeBefore(e) {
				const t = ga(this.children, (n) => e <= n.start) - 1;
				if (t >= 0) {
					const n = this.children[t];
					if (e > n.start) {
						if (e < n.end) return n.findNodeBefore(e);
						const i = n.lastChild;
						return i && i.end === n.end ? n.findNodeBefore(e) : n;
					}
				}
				return this;
			}
			findNodeAt(e) {
				const t = ga(this.children, (n) => e <= n.start) - 1;
				if (t >= 0) {
					const n = this.children[t];
					if (e > n.start && e <= n.end) return n.findNodeAt(e);
				}
				return this;
			}
		},
		Tu = class {
			constructor(e) {
				this.dataManager = e;
			}
			parseDocument(e) {
				return this.parse(
					e.getText(),
					this.dataManager.getVoidElements(e.languageId),
				);
			}
			parse(e, t) {
				const n = pe(e, void 0, void 0, !0),
					i = new ba(0, e.length, [], void 0);
				let r = i,
					s = -1,
					o,
					l = null,
					a = n.scan();
				for (; a !== z.EOS; ) {
					switch (a) {
						case z.StartTagOpen:
							const u = new ba(
								n.getTokenOffset(),
								e.length,
								[],
								r,
							);
							r.children.push(u), (r = u);
							break;
						case z.StartTag:
							r.tag = n.getTokenText();
							break;
						case z.StartTagClose:
							r.parent &&
								((r.end = n.getTokenEnd()),
								n.getTokenLength()
									? ((r.startTagEnd = n.getTokenEnd()),
										r.tag &&
											this.dataManager.isVoidElement(
												r.tag,
												t,
											) &&
											((r.closed = !0), (r = r.parent)))
									: (r = r.parent));
							break;
						case z.StartTagSelfClose:
							r.parent &&
								((r.closed = !0),
								(r.end = n.getTokenEnd()),
								(r.startTagEnd = n.getTokenEnd()),
								(r = r.parent));
							break;
						case z.EndTagOpen:
							(s = n.getTokenOffset()), (o = void 0);
							break;
						case z.EndTag:
							o = n.getTokenText().toLowerCase();
							break;
						case z.EndTagClose:
							let c = r;
							for (; !c.isSameTag(o) && c.parent; ) c = c.parent;
							if (c.parent) {
								for (; r !== c; )
									(r.end = s),
										(r.closed = !1),
										(r = r.parent);
								(r.closed = !0),
									(r.endTagStart = s),
									(r.end = n.getTokenEnd()),
									(r = r.parent);
							}
							break;
						case z.AttributeName: {
							l = n.getTokenText();
							let d = r.attributes;
							d || (r.attributes = d = {}), (d[l] = null);
							break;
						}
						case z.AttributeValue: {
							const d = n.getTokenText(),
								m = r.attributes;
							m && l && ((m[l] = d), (l = null));
							break;
						}
					}
					a = n.scan();
				}
				for (; r.parent; )
					(r.end = e.length), (r.closed = !1), (r = r.parent);
				return {
					roots: i.children,
					findNodeBefore: i.findNodeBefore.bind(i),
					findNodeAt: i.findNodeAt.bind(i),
				};
			}
		},
		yt = {
			"Aacute;": "Á",
			Aacute: "Á",
			"aacute;": "á",
			aacute: "á",
			"Abreve;": "Ă",
			"abreve;": "ă",
			"ac;": "∾",
			"acd;": "∿",
			"acE;": "∾̳",
			"Acirc;": "Â",
			Acirc: "Â",
			"acirc;": "â",
			acirc: "â",
			"acute;": "´",
			acute: "´",
			"Acy;": "А",
			"acy;": "а",
			"AElig;": "Æ",
			AElig: "Æ",
			"aelig;": "æ",
			aelig: "æ",
			"af;": "⁡",
			"Afr;": "𝔄",
			"afr;": "𝔞",
			"Agrave;": "À",
			Agrave: "À",
			"agrave;": "à",
			agrave: "à",
			"alefsym;": "ℵ",
			"aleph;": "ℵ",
			"Alpha;": "Α",
			"alpha;": "α",
			"Amacr;": "Ā",
			"amacr;": "ā",
			"amalg;": "⨿",
			"AMP;": "&",
			AMP: "&",
			"amp;": "&",
			amp: "&",
			"And;": "⩓",
			"and;": "∧",
			"andand;": "⩕",
			"andd;": "⩜",
			"andslope;": "⩘",
			"andv;": "⩚",
			"ang;": "∠",
			"ange;": "⦤",
			"angle;": "∠",
			"angmsd;": "∡",
			"angmsdaa;": "⦨",
			"angmsdab;": "⦩",
			"angmsdac;": "⦪",
			"angmsdad;": "⦫",
			"angmsdae;": "⦬",
			"angmsdaf;": "⦭",
			"angmsdag;": "⦮",
			"angmsdah;": "⦯",
			"angrt;": "∟",
			"angrtvb;": "⊾",
			"angrtvbd;": "⦝",
			"angsph;": "∢",
			"angst;": "Å",
			"angzarr;": "⍼",
			"Aogon;": "Ą",
			"aogon;": "ą",
			"Aopf;": "𝔸",
			"aopf;": "𝕒",
			"ap;": "≈",
			"apacir;": "⩯",
			"apE;": "⩰",
			"ape;": "≊",
			"apid;": "≋",
			"apos;": "'",
			"ApplyFunction;": "⁡",
			"approx;": "≈",
			"approxeq;": "≊",
			"Aring;": "Å",
			Aring: "Å",
			"aring;": "å",
			aring: "å",
			"Ascr;": "𝒜",
			"ascr;": "𝒶",
			"Assign;": "≔",
			"ast;": "*",
			"asymp;": "≈",
			"asympeq;": "≍",
			"Atilde;": "Ã",
			Atilde: "Ã",
			"atilde;": "ã",
			atilde: "ã",
			"Auml;": "Ä",
			Auml: "Ä",
			"auml;": "ä",
			auml: "ä",
			"awconint;": "∳",
			"awint;": "⨑",
			"backcong;": "≌",
			"backepsilon;": "϶",
			"backprime;": "‵",
			"backsim;": "∽",
			"backsimeq;": "⋍",
			"Backslash;": "∖",
			"Barv;": "⫧",
			"barvee;": "⊽",
			"Barwed;": "⌆",
			"barwed;": "⌅",
			"barwedge;": "⌅",
			"bbrk;": "⎵",
			"bbrktbrk;": "⎶",
			"bcong;": "≌",
			"Bcy;": "Б",
			"bcy;": "б",
			"bdquo;": "„",
			"becaus;": "∵",
			"Because;": "∵",
			"because;": "∵",
			"bemptyv;": "⦰",
			"bepsi;": "϶",
			"bernou;": "ℬ",
			"Bernoullis;": "ℬ",
			"Beta;": "Β",
			"beta;": "β",
			"beth;": "ℶ",
			"between;": "≬",
			"Bfr;": "𝔅",
			"bfr;": "𝔟",
			"bigcap;": "⋂",
			"bigcirc;": "◯",
			"bigcup;": "⋃",
			"bigodot;": "⨀",
			"bigoplus;": "⨁",
			"bigotimes;": "⨂",
			"bigsqcup;": "⨆",
			"bigstar;": "★",
			"bigtriangledown;": "▽",
			"bigtriangleup;": "△",
			"biguplus;": "⨄",
			"bigvee;": "⋁",
			"bigwedge;": "⋀",
			"bkarow;": "⤍",
			"blacklozenge;": "⧫",
			"blacksquare;": "▪",
			"blacktriangle;": "▴",
			"blacktriangledown;": "▾",
			"blacktriangleleft;": "◂",
			"blacktriangleright;": "▸",
			"blank;": "␣",
			"blk12;": "▒",
			"blk14;": "░",
			"blk34;": "▓",
			"block;": "█",
			"bne;": "=⃥",
			"bnequiv;": "≡⃥",
			"bNot;": "⫭",
			"bnot;": "⌐",
			"Bopf;": "𝔹",
			"bopf;": "𝕓",
			"bot;": "⊥",
			"bottom;": "⊥",
			"bowtie;": "⋈",
			"boxbox;": "⧉",
			"boxDL;": "╗",
			"boxDl;": "╖",
			"boxdL;": "╕",
			"boxdl;": "┐",
			"boxDR;": "╔",
			"boxDr;": "╓",
			"boxdR;": "╒",
			"boxdr;": "┌",
			"boxH;": "═",
			"boxh;": "─",
			"boxHD;": "╦",
			"boxHd;": "╤",
			"boxhD;": "╥",
			"boxhd;": "┬",
			"boxHU;": "╩",
			"boxHu;": "╧",
			"boxhU;": "╨",
			"boxhu;": "┴",
			"boxminus;": "⊟",
			"boxplus;": "⊞",
			"boxtimes;": "⊠",
			"boxUL;": "╝",
			"boxUl;": "╜",
			"boxuL;": "╛",
			"boxul;": "┘",
			"boxUR;": "╚",
			"boxUr;": "╙",
			"boxuR;": "╘",
			"boxur;": "└",
			"boxV;": "║",
			"boxv;": "│",
			"boxVH;": "╬",
			"boxVh;": "╫",
			"boxvH;": "╪",
			"boxvh;": "┼",
			"boxVL;": "╣",
			"boxVl;": "╢",
			"boxvL;": "╡",
			"boxvl;": "┤",
			"boxVR;": "╠",
			"boxVr;": "╟",
			"boxvR;": "╞",
			"boxvr;": "├",
			"bprime;": "‵",
			"Breve;": "˘",
			"breve;": "˘",
			"brvbar;": "¦",
			brvbar: "¦",
			"Bscr;": "ℬ",
			"bscr;": "𝒷",
			"bsemi;": "⁏",
			"bsim;": "∽",
			"bsime;": "⋍",
			"bsol;": "\\",
			"bsolb;": "⧅",
			"bsolhsub;": "⟈",
			"bull;": "•",
			"bullet;": "•",
			"bump;": "≎",
			"bumpE;": "⪮",
			"bumpe;": "≏",
			"Bumpeq;": "≎",
			"bumpeq;": "≏",
			"Cacute;": "Ć",
			"cacute;": "ć",
			"Cap;": "⋒",
			"cap;": "∩",
			"capand;": "⩄",
			"capbrcup;": "⩉",
			"capcap;": "⩋",
			"capcup;": "⩇",
			"capdot;": "⩀",
			"CapitalDifferentialD;": "ⅅ",
			"caps;": "∩︀",
			"caret;": "⁁",
			"caron;": "ˇ",
			"Cayleys;": "ℭ",
			"ccaps;": "⩍",
			"Ccaron;": "Č",
			"ccaron;": "č",
			"Ccedil;": "Ç",
			Ccedil: "Ç",
			"ccedil;": "ç",
			ccedil: "ç",
			"Ccirc;": "Ĉ",
			"ccirc;": "ĉ",
			"Cconint;": "∰",
			"ccups;": "⩌",
			"ccupssm;": "⩐",
			"Cdot;": "Ċ",
			"cdot;": "ċ",
			"cedil;": "¸",
			cedil: "¸",
			"Cedilla;": "¸",
			"cemptyv;": "⦲",
			"cent;": "¢",
			cent: "¢",
			"CenterDot;": "·",
			"centerdot;": "·",
			"Cfr;": "ℭ",
			"cfr;": "𝔠",
			"CHcy;": "Ч",
			"chcy;": "ч",
			"check;": "✓",
			"checkmark;": "✓",
			"Chi;": "Χ",
			"chi;": "χ",
			"cir;": "○",
			"circ;": "ˆ",
			"circeq;": "≗",
			"circlearrowleft;": "↺",
			"circlearrowright;": "↻",
			"circledast;": "⊛",
			"circledcirc;": "⊚",
			"circleddash;": "⊝",
			"CircleDot;": "⊙",
			"circledR;": "®",
			"circledS;": "Ⓢ",
			"CircleMinus;": "⊖",
			"CirclePlus;": "⊕",
			"CircleTimes;": "⊗",
			"cirE;": "⧃",
			"cire;": "≗",
			"cirfnint;": "⨐",
			"cirmid;": "⫯",
			"cirscir;": "⧂",
			"ClockwiseContourIntegral;": "∲",
			"CloseCurlyDoubleQuote;": "”",
			"CloseCurlyQuote;": "’",
			"clubs;": "♣",
			"clubsuit;": "♣",
			"Colon;": "∷",
			"colon;": ":",
			"Colone;": "⩴",
			"colone;": "≔",
			"coloneq;": "≔",
			"comma;": ",",
			"commat;": "@",
			"comp;": "∁",
			"compfn;": "∘",
			"complement;": "∁",
			"complexes;": "ℂ",
			"cong;": "≅",
			"congdot;": "⩭",
			"Congruent;": "≡",
			"Conint;": "∯",
			"conint;": "∮",
			"ContourIntegral;": "∮",
			"Copf;": "ℂ",
			"copf;": "𝕔",
			"coprod;": "∐",
			"Coproduct;": "∐",
			"COPY;": "©",
			COPY: "©",
			"copy;": "©",
			copy: "©",
			"copysr;": "℗",
			"CounterClockwiseContourIntegral;": "∳",
			"crarr;": "↵",
			"Cross;": "⨯",
			"cross;": "✗",
			"Cscr;": "𝒞",
			"cscr;": "𝒸",
			"csub;": "⫏",
			"csube;": "⫑",
			"csup;": "⫐",
			"csupe;": "⫒",
			"ctdot;": "⋯",
			"cudarrl;": "⤸",
			"cudarrr;": "⤵",
			"cuepr;": "⋞",
			"cuesc;": "⋟",
			"cularr;": "↶",
			"cularrp;": "⤽",
			"Cup;": "⋓",
			"cup;": "∪",
			"cupbrcap;": "⩈",
			"CupCap;": "≍",
			"cupcap;": "⩆",
			"cupcup;": "⩊",
			"cupdot;": "⊍",
			"cupor;": "⩅",
			"cups;": "∪︀",
			"curarr;": "↷",
			"curarrm;": "⤼",
			"curlyeqprec;": "⋞",
			"curlyeqsucc;": "⋟",
			"curlyvee;": "⋎",
			"curlywedge;": "⋏",
			"curren;": "¤",
			curren: "¤",
			"curvearrowleft;": "↶",
			"curvearrowright;": "↷",
			"cuvee;": "⋎",
			"cuwed;": "⋏",
			"cwconint;": "∲",
			"cwint;": "∱",
			"cylcty;": "⌭",
			"Dagger;": "‡",
			"dagger;": "†",
			"daleth;": "ℸ",
			"Darr;": "↡",
			"dArr;": "⇓",
			"darr;": "↓",
			"dash;": "‐",
			"Dashv;": "⫤",
			"dashv;": "⊣",
			"dbkarow;": "⤏",
			"dblac;": "˝",
			"Dcaron;": "Ď",
			"dcaron;": "ď",
			"Dcy;": "Д",
			"dcy;": "д",
			"DD;": "ⅅ",
			"dd;": "ⅆ",
			"ddagger;": "‡",
			"ddarr;": "⇊",
			"DDotrahd;": "⤑",
			"ddotseq;": "⩷",
			"deg;": "°",
			deg: "°",
			"Del;": "∇",
			"Delta;": "Δ",
			"delta;": "δ",
			"demptyv;": "⦱",
			"dfisht;": "⥿",
			"Dfr;": "𝔇",
			"dfr;": "𝔡",
			"dHar;": "⥥",
			"dharl;": "⇃",
			"dharr;": "⇂",
			"DiacriticalAcute;": "´",
			"DiacriticalDot;": "˙",
			"DiacriticalDoubleAcute;": "˝",
			"DiacriticalGrave;": "`",
			"DiacriticalTilde;": "˜",
			"diam;": "⋄",
			"Diamond;": "⋄",
			"diamond;": "⋄",
			"diamondsuit;": "♦",
			"diams;": "♦",
			"die;": "¨",
			"DifferentialD;": "ⅆ",
			"digamma;": "ϝ",
			"disin;": "⋲",
			"div;": "÷",
			"divide;": "÷",
			divide: "÷",
			"divideontimes;": "⋇",
			"divonx;": "⋇",
			"DJcy;": "Ђ",
			"djcy;": "ђ",
			"dlcorn;": "⌞",
			"dlcrop;": "⌍",
			"dollar;": "$",
			"Dopf;": "𝔻",
			"dopf;": "𝕕",
			"Dot;": "¨",
			"dot;": "˙",
			"DotDot;": "⃜",
			"doteq;": "≐",
			"doteqdot;": "≑",
			"DotEqual;": "≐",
			"dotminus;": "∸",
			"dotplus;": "∔",
			"dotsquare;": "⊡",
			"doublebarwedge;": "⌆",
			"DoubleContourIntegral;": "∯",
			"DoubleDot;": "¨",
			"DoubleDownArrow;": "⇓",
			"DoubleLeftArrow;": "⇐",
			"DoubleLeftRightArrow;": "⇔",
			"DoubleLeftTee;": "⫤",
			"DoubleLongLeftArrow;": "⟸",
			"DoubleLongLeftRightArrow;": "⟺",
			"DoubleLongRightArrow;": "⟹",
			"DoubleRightArrow;": "⇒",
			"DoubleRightTee;": "⊨",
			"DoubleUpArrow;": "⇑",
			"DoubleUpDownArrow;": "⇕",
			"DoubleVerticalBar;": "∥",
			"DownArrow;": "↓",
			"Downarrow;": "⇓",
			"downarrow;": "↓",
			"DownArrowBar;": "⤓",
			"DownArrowUpArrow;": "⇵",
			"DownBreve;": "̑",
			"downdownarrows;": "⇊",
			"downharpoonleft;": "⇃",
			"downharpoonright;": "⇂",
			"DownLeftRightVector;": "⥐",
			"DownLeftTeeVector;": "⥞",
			"DownLeftVector;": "↽",
			"DownLeftVectorBar;": "⥖",
			"DownRightTeeVector;": "⥟",
			"DownRightVector;": "⇁",
			"DownRightVectorBar;": "⥗",
			"DownTee;": "⊤",
			"DownTeeArrow;": "↧",
			"drbkarow;": "⤐",
			"drcorn;": "⌟",
			"drcrop;": "⌌",
			"Dscr;": "𝒟",
			"dscr;": "𝒹",
			"DScy;": "Ѕ",
			"dscy;": "ѕ",
			"dsol;": "⧶",
			"Dstrok;": "Đ",
			"dstrok;": "đ",
			"dtdot;": "⋱",
			"dtri;": "▿",
			"dtrif;": "▾",
			"duarr;": "⇵",
			"duhar;": "⥯",
			"dwangle;": "⦦",
			"DZcy;": "Џ",
			"dzcy;": "џ",
			"dzigrarr;": "⟿",
			"Eacute;": "É",
			Eacute: "É",
			"eacute;": "é",
			eacute: "é",
			"easter;": "⩮",
			"Ecaron;": "Ě",
			"ecaron;": "ě",
			"ecir;": "≖",
			"Ecirc;": "Ê",
			Ecirc: "Ê",
			"ecirc;": "ê",
			ecirc: "ê",
			"ecolon;": "≕",
			"Ecy;": "Э",
			"ecy;": "э",
			"eDDot;": "⩷",
			"Edot;": "Ė",
			"eDot;": "≑",
			"edot;": "ė",
			"ee;": "ⅇ",
			"efDot;": "≒",
			"Efr;": "𝔈",
			"efr;": "𝔢",
			"eg;": "⪚",
			"Egrave;": "È",
			Egrave: "È",
			"egrave;": "è",
			egrave: "è",
			"egs;": "⪖",
			"egsdot;": "⪘",
			"el;": "⪙",
			"Element;": "∈",
			"elinters;": "⏧",
			"ell;": "ℓ",
			"els;": "⪕",
			"elsdot;": "⪗",
			"Emacr;": "Ē",
			"emacr;": "ē",
			"empty;": "∅",
			"emptyset;": "∅",
			"EmptySmallSquare;": "◻",
			"emptyv;": "∅",
			"EmptyVerySmallSquare;": "▫",
			"emsp;": " ",
			"emsp13;": " ",
			"emsp14;": " ",
			"ENG;": "Ŋ",
			"eng;": "ŋ",
			"ensp;": " ",
			"Eogon;": "Ę",
			"eogon;": "ę",
			"Eopf;": "𝔼",
			"eopf;": "𝕖",
			"epar;": "⋕",
			"eparsl;": "⧣",
			"eplus;": "⩱",
			"epsi;": "ε",
			"Epsilon;": "Ε",
			"epsilon;": "ε",
			"epsiv;": "ϵ",
			"eqcirc;": "≖",
			"eqcolon;": "≕",
			"eqsim;": "≂",
			"eqslantgtr;": "⪖",
			"eqslantless;": "⪕",
			"Equal;": "⩵",
			"equals;": "=",
			"EqualTilde;": "≂",
			"equest;": "≟",
			"Equilibrium;": "⇌",
			"equiv;": "≡",
			"equivDD;": "⩸",
			"eqvparsl;": "⧥",
			"erarr;": "⥱",
			"erDot;": "≓",
			"Escr;": "ℰ",
			"escr;": "ℯ",
			"esdot;": "≐",
			"Esim;": "⩳",
			"esim;": "≂",
			"Eta;": "Η",
			"eta;": "η",
			"ETH;": "Ð",
			ETH: "Ð",
			"eth;": "ð",
			eth: "ð",
			"Euml;": "Ë",
			Euml: "Ë",
			"euml;": "ë",
			euml: "ë",
			"euro;": "€",
			"excl;": "!",
			"exist;": "∃",
			"Exists;": "∃",
			"expectation;": "ℰ",
			"ExponentialE;": "ⅇ",
			"exponentiale;": "ⅇ",
			"fallingdotseq;": "≒",
			"Fcy;": "Ф",
			"fcy;": "ф",
			"female;": "♀",
			"ffilig;": "ﬃ",
			"fflig;": "ﬀ",
			"ffllig;": "ﬄ",
			"Ffr;": "𝔉",
			"ffr;": "𝔣",
			"filig;": "ﬁ",
			"FilledSmallSquare;": "◼",
			"FilledVerySmallSquare;": "▪",
			"fjlig;": "fj",
			"flat;": "♭",
			"fllig;": "ﬂ",
			"fltns;": "▱",
			"fnof;": "ƒ",
			"Fopf;": "𝔽",
			"fopf;": "𝕗",
			"ForAll;": "∀",
			"forall;": "∀",
			"fork;": "⋔",
			"forkv;": "⫙",
			"Fouriertrf;": "ℱ",
			"fpartint;": "⨍",
			"frac12;": "½",
			frac12: "½",
			"frac13;": "⅓",
			"frac14;": "¼",
			frac14: "¼",
			"frac15;": "⅕",
			"frac16;": "⅙",
			"frac18;": "⅛",
			"frac23;": "⅔",
			"frac25;": "⅖",
			"frac34;": "¾",
			frac34: "¾",
			"frac35;": "⅗",
			"frac38;": "⅜",
			"frac45;": "⅘",
			"frac56;": "⅚",
			"frac58;": "⅝",
			"frac78;": "⅞",
			"frasl;": "⁄",
			"frown;": "⌢",
			"Fscr;": "ℱ",
			"fscr;": "𝒻",
			"gacute;": "ǵ",
			"Gamma;": "Γ",
			"gamma;": "γ",
			"Gammad;": "Ϝ",
			"gammad;": "ϝ",
			"gap;": "⪆",
			"Gbreve;": "Ğ",
			"gbreve;": "ğ",
			"Gcedil;": "Ģ",
			"Gcirc;": "Ĝ",
			"gcirc;": "ĝ",
			"Gcy;": "Г",
			"gcy;": "г",
			"Gdot;": "Ġ",
			"gdot;": "ġ",
			"gE;": "≧",
			"ge;": "≥",
			"gEl;": "⪌",
			"gel;": "⋛",
			"geq;": "≥",
			"geqq;": "≧",
			"geqslant;": "⩾",
			"ges;": "⩾",
			"gescc;": "⪩",
			"gesdot;": "⪀",
			"gesdoto;": "⪂",
			"gesdotol;": "⪄",
			"gesl;": "⋛︀",
			"gesles;": "⪔",
			"Gfr;": "𝔊",
			"gfr;": "𝔤",
			"Gg;": "⋙",
			"gg;": "≫",
			"ggg;": "⋙",
			"gimel;": "ℷ",
			"GJcy;": "Ѓ",
			"gjcy;": "ѓ",
			"gl;": "≷",
			"gla;": "⪥",
			"glE;": "⪒",
			"glj;": "⪤",
			"gnap;": "⪊",
			"gnapprox;": "⪊",
			"gnE;": "≩",
			"gne;": "⪈",
			"gneq;": "⪈",
			"gneqq;": "≩",
			"gnsim;": "⋧",
			"Gopf;": "𝔾",
			"gopf;": "𝕘",
			"grave;": "`",
			"GreaterEqual;": "≥",
			"GreaterEqualLess;": "⋛",
			"GreaterFullEqual;": "≧",
			"GreaterGreater;": "⪢",
			"GreaterLess;": "≷",
			"GreaterSlantEqual;": "⩾",
			"GreaterTilde;": "≳",
			"Gscr;": "𝒢",
			"gscr;": "ℊ",
			"gsim;": "≳",
			"gsime;": "⪎",
			"gsiml;": "⪐",
			"GT;": ">",
			GT: ">",
			"Gt;": "≫",
			"gt;": ">",
			gt: ">",
			"gtcc;": "⪧",
			"gtcir;": "⩺",
			"gtdot;": "⋗",
			"gtlPar;": "⦕",
			"gtquest;": "⩼",
			"gtrapprox;": "⪆",
			"gtrarr;": "⥸",
			"gtrdot;": "⋗",
			"gtreqless;": "⋛",
			"gtreqqless;": "⪌",
			"gtrless;": "≷",
			"gtrsim;": "≳",
			"gvertneqq;": "≩︀",
			"gvnE;": "≩︀",
			"Hacek;": "ˇ",
			"hairsp;": " ",
			"half;": "½",
			"hamilt;": "ℋ",
			"HARDcy;": "Ъ",
			"hardcy;": "ъ",
			"hArr;": "⇔",
			"harr;": "↔",
			"harrcir;": "⥈",
			"harrw;": "↭",
			"Hat;": "^",
			"hbar;": "ℏ",
			"Hcirc;": "Ĥ",
			"hcirc;": "ĥ",
			"hearts;": "♥",
			"heartsuit;": "♥",
			"hellip;": "…",
			"hercon;": "⊹",
			"Hfr;": "ℌ",
			"hfr;": "𝔥",
			"HilbertSpace;": "ℋ",
			"hksearow;": "⤥",
			"hkswarow;": "⤦",
			"hoarr;": "⇿",
			"homtht;": "∻",
			"hookleftarrow;": "↩",
			"hookrightarrow;": "↪",
			"Hopf;": "ℍ",
			"hopf;": "𝕙",
			"horbar;": "―",
			"HorizontalLine;": "─",
			"Hscr;": "ℋ",
			"hscr;": "𝒽",
			"hslash;": "ℏ",
			"Hstrok;": "Ħ",
			"hstrok;": "ħ",
			"HumpDownHump;": "≎",
			"HumpEqual;": "≏",
			"hybull;": "⁃",
			"hyphen;": "‐",
			"Iacute;": "Í",
			Iacute: "Í",
			"iacute;": "í",
			iacute: "í",
			"ic;": "⁣",
			"Icirc;": "Î",
			Icirc: "Î",
			"icirc;": "î",
			icirc: "î",
			"Icy;": "И",
			"icy;": "и",
			"Idot;": "İ",
			"IEcy;": "Е",
			"iecy;": "е",
			"iexcl;": "¡",
			iexcl: "¡",
			"iff;": "⇔",
			"Ifr;": "ℑ",
			"ifr;": "𝔦",
			"Igrave;": "Ì",
			Igrave: "Ì",
			"igrave;": "ì",
			igrave: "ì",
			"ii;": "ⅈ",
			"iiiint;": "⨌",
			"iiint;": "∭",
			"iinfin;": "⧜",
			"iiota;": "℩",
			"IJlig;": "Ĳ",
			"ijlig;": "ĳ",
			"Im;": "ℑ",
			"Imacr;": "Ī",
			"imacr;": "ī",
			"image;": "ℑ",
			"ImaginaryI;": "ⅈ",
			"imagline;": "ℐ",
			"imagpart;": "ℑ",
			"imath;": "ı",
			"imof;": "⊷",
			"imped;": "Ƶ",
			"Implies;": "⇒",
			"in;": "∈",
			"incare;": "℅",
			"infin;": "∞",
			"infintie;": "⧝",
			"inodot;": "ı",
			"Int;": "∬",
			"int;": "∫",
			"intcal;": "⊺",
			"integers;": "ℤ",
			"Integral;": "∫",
			"intercal;": "⊺",
			"Intersection;": "⋂",
			"intlarhk;": "⨗",
			"intprod;": "⨼",
			"InvisibleComma;": "⁣",
			"InvisibleTimes;": "⁢",
			"IOcy;": "Ё",
			"iocy;": "ё",
			"Iogon;": "Į",
			"iogon;": "į",
			"Iopf;": "𝕀",
			"iopf;": "𝕚",
			"Iota;": "Ι",
			"iota;": "ι",
			"iprod;": "⨼",
			"iquest;": "¿",
			iquest: "¿",
			"Iscr;": "ℐ",
			"iscr;": "𝒾",
			"isin;": "∈",
			"isindot;": "⋵",
			"isinE;": "⋹",
			"isins;": "⋴",
			"isinsv;": "⋳",
			"isinv;": "∈",
			"it;": "⁢",
			"Itilde;": "Ĩ",
			"itilde;": "ĩ",
			"Iukcy;": "І",
			"iukcy;": "і",
			"Iuml;": "Ï",
			Iuml: "Ï",
			"iuml;": "ï",
			iuml: "ï",
			"Jcirc;": "Ĵ",
			"jcirc;": "ĵ",
			"Jcy;": "Й",
			"jcy;": "й",
			"Jfr;": "𝔍",
			"jfr;": "𝔧",
			"jmath;": "ȷ",
			"Jopf;": "𝕁",
			"jopf;": "𝕛",
			"Jscr;": "𝒥",
			"jscr;": "𝒿",
			"Jsercy;": "Ј",
			"jsercy;": "ј",
			"Jukcy;": "Є",
			"jukcy;": "є",
			"Kappa;": "Κ",
			"kappa;": "κ",
			"kappav;": "ϰ",
			"Kcedil;": "Ķ",
			"kcedil;": "ķ",
			"Kcy;": "К",
			"kcy;": "к",
			"Kfr;": "𝔎",
			"kfr;": "𝔨",
			"kgreen;": "ĸ",
			"KHcy;": "Х",
			"khcy;": "х",
			"KJcy;": "Ќ",
			"kjcy;": "ќ",
			"Kopf;": "𝕂",
			"kopf;": "𝕜",
			"Kscr;": "𝒦",
			"kscr;": "𝓀",
			"lAarr;": "⇚",
			"Lacute;": "Ĺ",
			"lacute;": "ĺ",
			"laemptyv;": "⦴",
			"lagran;": "ℒ",
			"Lambda;": "Λ",
			"lambda;": "λ",
			"Lang;": "⟪",
			"lang;": "⟨",
			"langd;": "⦑",
			"langle;": "⟨",
			"lap;": "⪅",
			"Laplacetrf;": "ℒ",
			"laquo;": "«",
			laquo: "«",
			"Larr;": "↞",
			"lArr;": "⇐",
			"larr;": "←",
			"larrb;": "⇤",
			"larrbfs;": "⤟",
			"larrfs;": "⤝",
			"larrhk;": "↩",
			"larrlp;": "↫",
			"larrpl;": "⤹",
			"larrsim;": "⥳",
			"larrtl;": "↢",
			"lat;": "⪫",
			"lAtail;": "⤛",
			"latail;": "⤙",
			"late;": "⪭",
			"lates;": "⪭︀",
			"lBarr;": "⤎",
			"lbarr;": "⤌",
			"lbbrk;": "❲",
			"lbrace;": "{",
			"lbrack;": "[",
			"lbrke;": "⦋",
			"lbrksld;": "⦏",
			"lbrkslu;": "⦍",
			"Lcaron;": "Ľ",
			"lcaron;": "ľ",
			"Lcedil;": "Ļ",
			"lcedil;": "ļ",
			"lceil;": "⌈",
			"lcub;": "{",
			"Lcy;": "Л",
			"lcy;": "л",
			"ldca;": "⤶",
			"ldquo;": "“",
			"ldquor;": "„",
			"ldrdhar;": "⥧",
			"ldrushar;": "⥋",
			"ldsh;": "↲",
			"lE;": "≦",
			"le;": "≤",
			"LeftAngleBracket;": "⟨",
			"LeftArrow;": "←",
			"Leftarrow;": "⇐",
			"leftarrow;": "←",
			"LeftArrowBar;": "⇤",
			"LeftArrowRightArrow;": "⇆",
			"leftarrowtail;": "↢",
			"LeftCeiling;": "⌈",
			"LeftDoubleBracket;": "⟦",
			"LeftDownTeeVector;": "⥡",
			"LeftDownVector;": "⇃",
			"LeftDownVectorBar;": "⥙",
			"LeftFloor;": "⌊",
			"leftharpoondown;": "↽",
			"leftharpoonup;": "↼",
			"leftleftarrows;": "⇇",
			"LeftRightArrow;": "↔",
			"Leftrightarrow;": "⇔",
			"leftrightarrow;": "↔",
			"leftrightarrows;": "⇆",
			"leftrightharpoons;": "⇋",
			"leftrightsquigarrow;": "↭",
			"LeftRightVector;": "⥎",
			"LeftTee;": "⊣",
			"LeftTeeArrow;": "↤",
			"LeftTeeVector;": "⥚",
			"leftthreetimes;": "⋋",
			"LeftTriangle;": "⊲",
			"LeftTriangleBar;": "⧏",
			"LeftTriangleEqual;": "⊴",
			"LeftUpDownVector;": "⥑",
			"LeftUpTeeVector;": "⥠",
			"LeftUpVector;": "↿",
			"LeftUpVectorBar;": "⥘",
			"LeftVector;": "↼",
			"LeftVectorBar;": "⥒",
			"lEg;": "⪋",
			"leg;": "⋚",
			"leq;": "≤",
			"leqq;": "≦",
			"leqslant;": "⩽",
			"les;": "⩽",
			"lescc;": "⪨",
			"lesdot;": "⩿",
			"lesdoto;": "⪁",
			"lesdotor;": "⪃",
			"lesg;": "⋚︀",
			"lesges;": "⪓",
			"lessapprox;": "⪅",
			"lessdot;": "⋖",
			"lesseqgtr;": "⋚",
			"lesseqqgtr;": "⪋",
			"LessEqualGreater;": "⋚",
			"LessFullEqual;": "≦",
			"LessGreater;": "≶",
			"lessgtr;": "≶",
			"LessLess;": "⪡",
			"lesssim;": "≲",
			"LessSlantEqual;": "⩽",
			"LessTilde;": "≲",
			"lfisht;": "⥼",
			"lfloor;": "⌊",
			"Lfr;": "𝔏",
			"lfr;": "𝔩",
			"lg;": "≶",
			"lgE;": "⪑",
			"lHar;": "⥢",
			"lhard;": "↽",
			"lharu;": "↼",
			"lharul;": "⥪",
			"lhblk;": "▄",
			"LJcy;": "Љ",
			"ljcy;": "љ",
			"Ll;": "⋘",
			"ll;": "≪",
			"llarr;": "⇇",
			"llcorner;": "⌞",
			"Lleftarrow;": "⇚",
			"llhard;": "⥫",
			"lltri;": "◺",
			"Lmidot;": "Ŀ",
			"lmidot;": "ŀ",
			"lmoust;": "⎰",
			"lmoustache;": "⎰",
			"lnap;": "⪉",
			"lnapprox;": "⪉",
			"lnE;": "≨",
			"lne;": "⪇",
			"lneq;": "⪇",
			"lneqq;": "≨",
			"lnsim;": "⋦",
			"loang;": "⟬",
			"loarr;": "⇽",
			"lobrk;": "⟦",
			"LongLeftArrow;": "⟵",
			"Longleftarrow;": "⟸",
			"longleftarrow;": "⟵",
			"LongLeftRightArrow;": "⟷",
			"Longleftrightarrow;": "⟺",
			"longleftrightarrow;": "⟷",
			"longmapsto;": "⟼",
			"LongRightArrow;": "⟶",
			"Longrightarrow;": "⟹",
			"longrightarrow;": "⟶",
			"looparrowleft;": "↫",
			"looparrowright;": "↬",
			"lopar;": "⦅",
			"Lopf;": "𝕃",
			"lopf;": "𝕝",
			"loplus;": "⨭",
			"lotimes;": "⨴",
			"lowast;": "∗",
			"lowbar;": "_",
			"LowerLeftArrow;": "↙",
			"LowerRightArrow;": "↘",
			"loz;": "◊",
			"lozenge;": "◊",
			"lozf;": "⧫",
			"lpar;": "(",
			"lparlt;": "⦓",
			"lrarr;": "⇆",
			"lrcorner;": "⌟",
			"lrhar;": "⇋",
			"lrhard;": "⥭",
			"lrm;": "‎",
			"lrtri;": "⊿",
			"lsaquo;": "‹",
			"Lscr;": "ℒ",
			"lscr;": "𝓁",
			"Lsh;": "↰",
			"lsh;": "↰",
			"lsim;": "≲",
			"lsime;": "⪍",
			"lsimg;": "⪏",
			"lsqb;": "[",
			"lsquo;": "‘",
			"lsquor;": "‚",
			"Lstrok;": "Ł",
			"lstrok;": "ł",
			"LT;": "<",
			LT: "<",
			"Lt;": "≪",
			"lt;": "<",
			lt: "<",
			"ltcc;": "⪦",
			"ltcir;": "⩹",
			"ltdot;": "⋖",
			"lthree;": "⋋",
			"ltimes;": "⋉",
			"ltlarr;": "⥶",
			"ltquest;": "⩻",
			"ltri;": "◃",
			"ltrie;": "⊴",
			"ltrif;": "◂",
			"ltrPar;": "⦖",
			"lurdshar;": "⥊",
			"luruhar;": "⥦",
			"lvertneqq;": "≨︀",
			"lvnE;": "≨︀",
			"macr;": "¯",
			macr: "¯",
			"male;": "♂",
			"malt;": "✠",
			"maltese;": "✠",
			"Map;": "⤅",
			"map;": "↦",
			"mapsto;": "↦",
			"mapstodown;": "↧",
			"mapstoleft;": "↤",
			"mapstoup;": "↥",
			"marker;": "▮",
			"mcomma;": "⨩",
			"Mcy;": "М",
			"mcy;": "м",
			"mdash;": "—",
			"mDDot;": "∺",
			"measuredangle;": "∡",
			"MediumSpace;": " ",
			"Mellintrf;": "ℳ",
			"Mfr;": "𝔐",
			"mfr;": "𝔪",
			"mho;": "℧",
			"micro;": "µ",
			micro: "µ",
			"mid;": "∣",
			"midast;": "*",
			"midcir;": "⫰",
			"middot;": "·",
			middot: "·",
			"minus;": "−",
			"minusb;": "⊟",
			"minusd;": "∸",
			"minusdu;": "⨪",
			"MinusPlus;": "∓",
			"mlcp;": "⫛",
			"mldr;": "…",
			"mnplus;": "∓",
			"models;": "⊧",
			"Mopf;": "𝕄",
			"mopf;": "𝕞",
			"mp;": "∓",
			"Mscr;": "ℳ",
			"mscr;": "𝓂",
			"mstpos;": "∾",
			"Mu;": "Μ",
			"mu;": "μ",
			"multimap;": "⊸",
			"mumap;": "⊸",
			"nabla;": "∇",
			"Nacute;": "Ń",
			"nacute;": "ń",
			"nang;": "∠⃒",
			"nap;": "≉",
			"napE;": "⩰̸",
			"napid;": "≋̸",
			"napos;": "ŉ",
			"napprox;": "≉",
			"natur;": "♮",
			"natural;": "♮",
			"naturals;": "ℕ",
			"nbsp;": " ",
			nbsp: " ",
			"nbump;": "≎̸",
			"nbumpe;": "≏̸",
			"ncap;": "⩃",
			"Ncaron;": "Ň",
			"ncaron;": "ň",
			"Ncedil;": "Ņ",
			"ncedil;": "ņ",
			"ncong;": "≇",
			"ncongdot;": "⩭̸",
			"ncup;": "⩂",
			"Ncy;": "Н",
			"ncy;": "н",
			"ndash;": "–",
			"ne;": "≠",
			"nearhk;": "⤤",
			"neArr;": "⇗",
			"nearr;": "↗",
			"nearrow;": "↗",
			"nedot;": "≐̸",
			"NegativeMediumSpace;": "​",
			"NegativeThickSpace;": "​",
			"NegativeThinSpace;": "​",
			"NegativeVeryThinSpace;": "​",
			"nequiv;": "≢",
			"nesear;": "⤨",
			"nesim;": "≂̸",
			"NestedGreaterGreater;": "≫",
			"NestedLessLess;": "≪",
			"NewLine;": `
`,
			"nexist;": "∄",
			"nexists;": "∄",
			"Nfr;": "𝔑",
			"nfr;": "𝔫",
			"ngE;": "≧̸",
			"nge;": "≱",
			"ngeq;": "≱",
			"ngeqq;": "≧̸",
			"ngeqslant;": "⩾̸",
			"nges;": "⩾̸",
			"nGg;": "⋙̸",
			"ngsim;": "≵",
			"nGt;": "≫⃒",
			"ngt;": "≯",
			"ngtr;": "≯",
			"nGtv;": "≫̸",
			"nhArr;": "⇎",
			"nharr;": "↮",
			"nhpar;": "⫲",
			"ni;": "∋",
			"nis;": "⋼",
			"nisd;": "⋺",
			"niv;": "∋",
			"NJcy;": "Њ",
			"njcy;": "њ",
			"nlArr;": "⇍",
			"nlarr;": "↚",
			"nldr;": "‥",
			"nlE;": "≦̸",
			"nle;": "≰",
			"nLeftarrow;": "⇍",
			"nleftarrow;": "↚",
			"nLeftrightarrow;": "⇎",
			"nleftrightarrow;": "↮",
			"nleq;": "≰",
			"nleqq;": "≦̸",
			"nleqslant;": "⩽̸",
			"nles;": "⩽̸",
			"nless;": "≮",
			"nLl;": "⋘̸",
			"nlsim;": "≴",
			"nLt;": "≪⃒",
			"nlt;": "≮",
			"nltri;": "⋪",
			"nltrie;": "⋬",
			"nLtv;": "≪̸",
			"nmid;": "∤",
			"NoBreak;": "⁠",
			"NonBreakingSpace;": " ",
			"Nopf;": "ℕ",
			"nopf;": "𝕟",
			"Not;": "⫬",
			"not;": "¬",
			not: "¬",
			"NotCongruent;": "≢",
			"NotCupCap;": "≭",
			"NotDoubleVerticalBar;": "∦",
			"NotElement;": "∉",
			"NotEqual;": "≠",
			"NotEqualTilde;": "≂̸",
			"NotExists;": "∄",
			"NotGreater;": "≯",
			"NotGreaterEqual;": "≱",
			"NotGreaterFullEqual;": "≧̸",
			"NotGreaterGreater;": "≫̸",
			"NotGreaterLess;": "≹",
			"NotGreaterSlantEqual;": "⩾̸",
			"NotGreaterTilde;": "≵",
			"NotHumpDownHump;": "≎̸",
			"NotHumpEqual;": "≏̸",
			"notin;": "∉",
			"notindot;": "⋵̸",
			"notinE;": "⋹̸",
			"notinva;": "∉",
			"notinvb;": "⋷",
			"notinvc;": "⋶",
			"NotLeftTriangle;": "⋪",
			"NotLeftTriangleBar;": "⧏̸",
			"NotLeftTriangleEqual;": "⋬",
			"NotLess;": "≮",
			"NotLessEqual;": "≰",
			"NotLessGreater;": "≸",
			"NotLessLess;": "≪̸",
			"NotLessSlantEqual;": "⩽̸",
			"NotLessTilde;": "≴",
			"NotNestedGreaterGreater;": "⪢̸",
			"NotNestedLessLess;": "⪡̸",
			"notni;": "∌",
			"notniva;": "∌",
			"notnivb;": "⋾",
			"notnivc;": "⋽",
			"NotPrecedes;": "⊀",
			"NotPrecedesEqual;": "⪯̸",
			"NotPrecedesSlantEqual;": "⋠",
			"NotReverseElement;": "∌",
			"NotRightTriangle;": "⋫",
			"NotRightTriangleBar;": "⧐̸",
			"NotRightTriangleEqual;": "⋭",
			"NotSquareSubset;": "⊏̸",
			"NotSquareSubsetEqual;": "⋢",
			"NotSquareSuperset;": "⊐̸",
			"NotSquareSupersetEqual;": "⋣",
			"NotSubset;": "⊂⃒",
			"NotSubsetEqual;": "⊈",
			"NotSucceeds;": "⊁",
			"NotSucceedsEqual;": "⪰̸",
			"NotSucceedsSlantEqual;": "⋡",
			"NotSucceedsTilde;": "≿̸",
			"NotSuperset;": "⊃⃒",
			"NotSupersetEqual;": "⊉",
			"NotTilde;": "≁",
			"NotTildeEqual;": "≄",
			"NotTildeFullEqual;": "≇",
			"NotTildeTilde;": "≉",
			"NotVerticalBar;": "∤",
			"npar;": "∦",
			"nparallel;": "∦",
			"nparsl;": "⫽⃥",
			"npart;": "∂̸",
			"npolint;": "⨔",
			"npr;": "⊀",
			"nprcue;": "⋠",
			"npre;": "⪯̸",
			"nprec;": "⊀",
			"npreceq;": "⪯̸",
			"nrArr;": "⇏",
			"nrarr;": "↛",
			"nrarrc;": "⤳̸",
			"nrarrw;": "↝̸",
			"nRightarrow;": "⇏",
			"nrightarrow;": "↛",
			"nrtri;": "⋫",
			"nrtrie;": "⋭",
			"nsc;": "⊁",
			"nsccue;": "⋡",
			"nsce;": "⪰̸",
			"Nscr;": "𝒩",
			"nscr;": "𝓃",
			"nshortmid;": "∤",
			"nshortparallel;": "∦",
			"nsim;": "≁",
			"nsime;": "≄",
			"nsimeq;": "≄",
			"nsmid;": "∤",
			"nspar;": "∦",
			"nsqsube;": "⋢",
			"nsqsupe;": "⋣",
			"nsub;": "⊄",
			"nsubE;": "⫅̸",
			"nsube;": "⊈",
			"nsubset;": "⊂⃒",
			"nsubseteq;": "⊈",
			"nsubseteqq;": "⫅̸",
			"nsucc;": "⊁",
			"nsucceq;": "⪰̸",
			"nsup;": "⊅",
			"nsupE;": "⫆̸",
			"nsupe;": "⊉",
			"nsupset;": "⊃⃒",
			"nsupseteq;": "⊉",
			"nsupseteqq;": "⫆̸",
			"ntgl;": "≹",
			"Ntilde;": "Ñ",
			Ntilde: "Ñ",
			"ntilde;": "ñ",
			ntilde: "ñ",
			"ntlg;": "≸",
			"ntriangleleft;": "⋪",
			"ntrianglelefteq;": "⋬",
			"ntriangleright;": "⋫",
			"ntrianglerighteq;": "⋭",
			"Nu;": "Ν",
			"nu;": "ν",
			"num;": "#",
			"numero;": "№",
			"numsp;": " ",
			"nvap;": "≍⃒",
			"nVDash;": "⊯",
			"nVdash;": "⊮",
			"nvDash;": "⊭",
			"nvdash;": "⊬",
			"nvge;": "≥⃒",
			"nvgt;": ">⃒",
			"nvHarr;": "⤄",
			"nvinfin;": "⧞",
			"nvlArr;": "⤂",
			"nvle;": "≤⃒",
			"nvlt;": "<⃒",
			"nvltrie;": "⊴⃒",
			"nvrArr;": "⤃",
			"nvrtrie;": "⊵⃒",
			"nvsim;": "∼⃒",
			"nwarhk;": "⤣",
			"nwArr;": "⇖",
			"nwarr;": "↖",
			"nwarrow;": "↖",
			"nwnear;": "⤧",
			"Oacute;": "Ó",
			Oacute: "Ó",
			"oacute;": "ó",
			oacute: "ó",
			"oast;": "⊛",
			"ocir;": "⊚",
			"Ocirc;": "Ô",
			Ocirc: "Ô",
			"ocirc;": "ô",
			ocirc: "ô",
			"Ocy;": "О",
			"ocy;": "о",
			"odash;": "⊝",
			"Odblac;": "Ő",
			"odblac;": "ő",
			"odiv;": "⨸",
			"odot;": "⊙",
			"odsold;": "⦼",
			"OElig;": "Œ",
			"oelig;": "œ",
			"ofcir;": "⦿",
			"Ofr;": "𝔒",
			"ofr;": "𝔬",
			"ogon;": "˛",
			"Ograve;": "Ò",
			Ograve: "Ò",
			"ograve;": "ò",
			ograve: "ò",
			"ogt;": "⧁",
			"ohbar;": "⦵",
			"ohm;": "Ω",
			"oint;": "∮",
			"olarr;": "↺",
			"olcir;": "⦾",
			"olcross;": "⦻",
			"oline;": "‾",
			"olt;": "⧀",
			"Omacr;": "Ō",
			"omacr;": "ō",
			"Omega;": "Ω",
			"omega;": "ω",
			"Omicron;": "Ο",
			"omicron;": "ο",
			"omid;": "⦶",
			"ominus;": "⊖",
			"Oopf;": "𝕆",
			"oopf;": "𝕠",
			"opar;": "⦷",
			"OpenCurlyDoubleQuote;": "“",
			"OpenCurlyQuote;": "‘",
			"operp;": "⦹",
			"oplus;": "⊕",
			"Or;": "⩔",
			"or;": "∨",
			"orarr;": "↻",
			"ord;": "⩝",
			"order;": "ℴ",
			"orderof;": "ℴ",
			"ordf;": "ª",
			ordf: "ª",
			"ordm;": "º",
			ordm: "º",
			"origof;": "⊶",
			"oror;": "⩖",
			"orslope;": "⩗",
			"orv;": "⩛",
			"oS;": "Ⓢ",
			"Oscr;": "𝒪",
			"oscr;": "ℴ",
			"Oslash;": "Ø",
			Oslash: "Ø",
			"oslash;": "ø",
			oslash: "ø",
			"osol;": "⊘",
			"Otilde;": "Õ",
			Otilde: "Õ",
			"otilde;": "õ",
			otilde: "õ",
			"Otimes;": "⨷",
			"otimes;": "⊗",
			"otimesas;": "⨶",
			"Ouml;": "Ö",
			Ouml: "Ö",
			"ouml;": "ö",
			ouml: "ö",
			"ovbar;": "⌽",
			"OverBar;": "‾",
			"OverBrace;": "⏞",
			"OverBracket;": "⎴",
			"OverParenthesis;": "⏜",
			"par;": "∥",
			"para;": "¶",
			para: "¶",
			"parallel;": "∥",
			"parsim;": "⫳",
			"parsl;": "⫽",
			"part;": "∂",
			"PartialD;": "∂",
			"Pcy;": "П",
			"pcy;": "п",
			"percnt;": "%",
			"period;": ".",
			"permil;": "‰",
			"perp;": "⊥",
			"pertenk;": "‱",
			"Pfr;": "𝔓",
			"pfr;": "𝔭",
			"Phi;": "Φ",
			"phi;": "φ",
			"phiv;": "ϕ",
			"phmmat;": "ℳ",
			"phone;": "☎",
			"Pi;": "Π",
			"pi;": "π",
			"pitchfork;": "⋔",
			"piv;": "ϖ",
			"planck;": "ℏ",
			"planckh;": "ℎ",
			"plankv;": "ℏ",
			"plus;": "+",
			"plusacir;": "⨣",
			"plusb;": "⊞",
			"pluscir;": "⨢",
			"plusdo;": "∔",
			"plusdu;": "⨥",
			"pluse;": "⩲",
			"PlusMinus;": "±",
			"plusmn;": "±",
			plusmn: "±",
			"plussim;": "⨦",
			"plustwo;": "⨧",
			"pm;": "±",
			"Poincareplane;": "ℌ",
			"pointint;": "⨕",
			"Popf;": "ℙ",
			"popf;": "𝕡",
			"pound;": "£",
			pound: "£",
			"Pr;": "⪻",
			"pr;": "≺",
			"prap;": "⪷",
			"prcue;": "≼",
			"prE;": "⪳",
			"pre;": "⪯",
			"prec;": "≺",
			"precapprox;": "⪷",
			"preccurlyeq;": "≼",
			"Precedes;": "≺",
			"PrecedesEqual;": "⪯",
			"PrecedesSlantEqual;": "≼",
			"PrecedesTilde;": "≾",
			"preceq;": "⪯",
			"precnapprox;": "⪹",
			"precneqq;": "⪵",
			"precnsim;": "⋨",
			"precsim;": "≾",
			"Prime;": "″",
			"prime;": "′",
			"primes;": "ℙ",
			"prnap;": "⪹",
			"prnE;": "⪵",
			"prnsim;": "⋨",
			"prod;": "∏",
			"Product;": "∏",
			"profalar;": "⌮",
			"profline;": "⌒",
			"profsurf;": "⌓",
			"prop;": "∝",
			"Proportion;": "∷",
			"Proportional;": "∝",
			"propto;": "∝",
			"prsim;": "≾",
			"prurel;": "⊰",
			"Pscr;": "𝒫",
			"pscr;": "𝓅",
			"Psi;": "Ψ",
			"psi;": "ψ",
			"puncsp;": " ",
			"Qfr;": "𝔔",
			"qfr;": "𝔮",
			"qint;": "⨌",
			"Qopf;": "ℚ",
			"qopf;": "𝕢",
			"qprime;": "⁗",
			"Qscr;": "𝒬",
			"qscr;": "𝓆",
			"quaternions;": "ℍ",
			"quatint;": "⨖",
			"quest;": "?",
			"questeq;": "≟",
			"QUOT;": '"',
			QUOT: '"',
			"quot;": '"',
			quot: '"',
			"rAarr;": "⇛",
			"race;": "∽̱",
			"Racute;": "Ŕ",
			"racute;": "ŕ",
			"radic;": "√",
			"raemptyv;": "⦳",
			"Rang;": "⟫",
			"rang;": "⟩",
			"rangd;": "⦒",
			"range;": "⦥",
			"rangle;": "⟩",
			"raquo;": "»",
			raquo: "»",
			"Rarr;": "↠",
			"rArr;": "⇒",
			"rarr;": "→",
			"rarrap;": "⥵",
			"rarrb;": "⇥",
			"rarrbfs;": "⤠",
			"rarrc;": "⤳",
			"rarrfs;": "⤞",
			"rarrhk;": "↪",
			"rarrlp;": "↬",
			"rarrpl;": "⥅",
			"rarrsim;": "⥴",
			"Rarrtl;": "⤖",
			"rarrtl;": "↣",
			"rarrw;": "↝",
			"rAtail;": "⤜",
			"ratail;": "⤚",
			"ratio;": "∶",
			"rationals;": "ℚ",
			"RBarr;": "⤐",
			"rBarr;": "⤏",
			"rbarr;": "⤍",
			"rbbrk;": "❳",
			"rbrace;": "}",
			"rbrack;": "]",
			"rbrke;": "⦌",
			"rbrksld;": "⦎",
			"rbrkslu;": "⦐",
			"Rcaron;": "Ř",
			"rcaron;": "ř",
			"Rcedil;": "Ŗ",
			"rcedil;": "ŗ",
			"rceil;": "⌉",
			"rcub;": "}",
			"Rcy;": "Р",
			"rcy;": "р",
			"rdca;": "⤷",
			"rdldhar;": "⥩",
			"rdquo;": "”",
			"rdquor;": "”",
			"rdsh;": "↳",
			"Re;": "ℜ",
			"real;": "ℜ",
			"realine;": "ℛ",
			"realpart;": "ℜ",
			"reals;": "ℝ",
			"rect;": "▭",
			"REG;": "®",
			REG: "®",
			"reg;": "®",
			reg: "®",
			"ReverseElement;": "∋",
			"ReverseEquilibrium;": "⇋",
			"ReverseUpEquilibrium;": "⥯",
			"rfisht;": "⥽",
			"rfloor;": "⌋",
			"Rfr;": "ℜ",
			"rfr;": "𝔯",
			"rHar;": "⥤",
			"rhard;": "⇁",
			"rharu;": "⇀",
			"rharul;": "⥬",
			"Rho;": "Ρ",
			"rho;": "ρ",
			"rhov;": "ϱ",
			"RightAngleBracket;": "⟩",
			"RightArrow;": "→",
			"Rightarrow;": "⇒",
			"rightarrow;": "→",
			"RightArrowBar;": "⇥",
			"RightArrowLeftArrow;": "⇄",
			"rightarrowtail;": "↣",
			"RightCeiling;": "⌉",
			"RightDoubleBracket;": "⟧",
			"RightDownTeeVector;": "⥝",
			"RightDownVector;": "⇂",
			"RightDownVectorBar;": "⥕",
			"RightFloor;": "⌋",
			"rightharpoondown;": "⇁",
			"rightharpoonup;": "⇀",
			"rightleftarrows;": "⇄",
			"rightleftharpoons;": "⇌",
			"rightrightarrows;": "⇉",
			"rightsquigarrow;": "↝",
			"RightTee;": "⊢",
			"RightTeeArrow;": "↦",
			"RightTeeVector;": "⥛",
			"rightthreetimes;": "⋌",
			"RightTriangle;": "⊳",
			"RightTriangleBar;": "⧐",
			"RightTriangleEqual;": "⊵",
			"RightUpDownVector;": "⥏",
			"RightUpTeeVector;": "⥜",
			"RightUpVector;": "↾",
			"RightUpVectorBar;": "⥔",
			"RightVector;": "⇀",
			"RightVectorBar;": "⥓",
			"ring;": "˚",
			"risingdotseq;": "≓",
			"rlarr;": "⇄",
			"rlhar;": "⇌",
			"rlm;": "‏",
			"rmoust;": "⎱",
			"rmoustache;": "⎱",
			"rnmid;": "⫮",
			"roang;": "⟭",
			"roarr;": "⇾",
			"robrk;": "⟧",
			"ropar;": "⦆",
			"Ropf;": "ℝ",
			"ropf;": "𝕣",
			"roplus;": "⨮",
			"rotimes;": "⨵",
			"RoundImplies;": "⥰",
			"rpar;": ")",
			"rpargt;": "⦔",
			"rppolint;": "⨒",
			"rrarr;": "⇉",
			"Rrightarrow;": "⇛",
			"rsaquo;": "›",
			"Rscr;": "ℛ",
			"rscr;": "𝓇",
			"Rsh;": "↱",
			"rsh;": "↱",
			"rsqb;": "]",
			"rsquo;": "’",
			"rsquor;": "’",
			"rthree;": "⋌",
			"rtimes;": "⋊",
			"rtri;": "▹",
			"rtrie;": "⊵",
			"rtrif;": "▸",
			"rtriltri;": "⧎",
			"RuleDelayed;": "⧴",
			"ruluhar;": "⥨",
			"rx;": "℞",
			"Sacute;": "Ś",
			"sacute;": "ś",
			"sbquo;": "‚",
			"Sc;": "⪼",
			"sc;": "≻",
			"scap;": "⪸",
			"Scaron;": "Š",
			"scaron;": "š",
			"sccue;": "≽",
			"scE;": "⪴",
			"sce;": "⪰",
			"Scedil;": "Ş",
			"scedil;": "ş",
			"Scirc;": "Ŝ",
			"scirc;": "ŝ",
			"scnap;": "⪺",
			"scnE;": "⪶",
			"scnsim;": "⋩",
			"scpolint;": "⨓",
			"scsim;": "≿",
			"Scy;": "С",
			"scy;": "с",
			"sdot;": "⋅",
			"sdotb;": "⊡",
			"sdote;": "⩦",
			"searhk;": "⤥",
			"seArr;": "⇘",
			"searr;": "↘",
			"searrow;": "↘",
			"sect;": "§",
			sect: "§",
			"semi;": ";",
			"seswar;": "⤩",
			"setminus;": "∖",
			"setmn;": "∖",
			"sext;": "✶",
			"Sfr;": "𝔖",
			"sfr;": "𝔰",
			"sfrown;": "⌢",
			"sharp;": "♯",
			"SHCHcy;": "Щ",
			"shchcy;": "щ",
			"SHcy;": "Ш",
			"shcy;": "ш",
			"ShortDownArrow;": "↓",
			"ShortLeftArrow;": "←",
			"shortmid;": "∣",
			"shortparallel;": "∥",
			"ShortRightArrow;": "→",
			"ShortUpArrow;": "↑",
			"shy;": "­",
			shy: "­",
			"Sigma;": "Σ",
			"sigma;": "σ",
			"sigmaf;": "ς",
			"sigmav;": "ς",
			"sim;": "∼",
			"simdot;": "⩪",
			"sime;": "≃",
			"simeq;": "≃",
			"simg;": "⪞",
			"simgE;": "⪠",
			"siml;": "⪝",
			"simlE;": "⪟",
			"simne;": "≆",
			"simplus;": "⨤",
			"simrarr;": "⥲",
			"slarr;": "←",
			"SmallCircle;": "∘",
			"smallsetminus;": "∖",
			"smashp;": "⨳",
			"smeparsl;": "⧤",
			"smid;": "∣",
			"smile;": "⌣",
			"smt;": "⪪",
			"smte;": "⪬",
			"smtes;": "⪬︀",
			"SOFTcy;": "Ь",
			"softcy;": "ь",
			"sol;": "/",
			"solb;": "⧄",
			"solbar;": "⌿",
			"Sopf;": "𝕊",
			"sopf;": "𝕤",
			"spades;": "♠",
			"spadesuit;": "♠",
			"spar;": "∥",
			"sqcap;": "⊓",
			"sqcaps;": "⊓︀",
			"sqcup;": "⊔",
			"sqcups;": "⊔︀",
			"Sqrt;": "√",
			"sqsub;": "⊏",
			"sqsube;": "⊑",
			"sqsubset;": "⊏",
			"sqsubseteq;": "⊑",
			"sqsup;": "⊐",
			"sqsupe;": "⊒",
			"sqsupset;": "⊐",
			"sqsupseteq;": "⊒",
			"squ;": "□",
			"Square;": "□",
			"square;": "□",
			"SquareIntersection;": "⊓",
			"SquareSubset;": "⊏",
			"SquareSubsetEqual;": "⊑",
			"SquareSuperset;": "⊐",
			"SquareSupersetEqual;": "⊒",
			"SquareUnion;": "⊔",
			"squarf;": "▪",
			"squf;": "▪",
			"srarr;": "→",
			"Sscr;": "𝒮",
			"sscr;": "𝓈",
			"ssetmn;": "∖",
			"ssmile;": "⌣",
			"sstarf;": "⋆",
			"Star;": "⋆",
			"star;": "☆",
			"starf;": "★",
			"straightepsilon;": "ϵ",
			"straightphi;": "ϕ",
			"strns;": "¯",
			"Sub;": "⋐",
			"sub;": "⊂",
			"subdot;": "⪽",
			"subE;": "⫅",
			"sube;": "⊆",
			"subedot;": "⫃",
			"submult;": "⫁",
			"subnE;": "⫋",
			"subne;": "⊊",
			"subplus;": "⪿",
			"subrarr;": "⥹",
			"Subset;": "⋐",
			"subset;": "⊂",
			"subseteq;": "⊆",
			"subseteqq;": "⫅",
			"SubsetEqual;": "⊆",
			"subsetneq;": "⊊",
			"subsetneqq;": "⫋",
			"subsim;": "⫇",
			"subsub;": "⫕",
			"subsup;": "⫓",
			"succ;": "≻",
			"succapprox;": "⪸",
			"succcurlyeq;": "≽",
			"Succeeds;": "≻",
			"SucceedsEqual;": "⪰",
			"SucceedsSlantEqual;": "≽",
			"SucceedsTilde;": "≿",
			"succeq;": "⪰",
			"succnapprox;": "⪺",
			"succneqq;": "⪶",
			"succnsim;": "⋩",
			"succsim;": "≿",
			"SuchThat;": "∋",
			"Sum;": "∑",
			"sum;": "∑",
			"sung;": "♪",
			"Sup;": "⋑",
			"sup;": "⊃",
			"sup1;": "¹",
			sup1: "¹",
			"sup2;": "²",
			sup2: "²",
			"sup3;": "³",
			sup3: "³",
			"supdot;": "⪾",
			"supdsub;": "⫘",
			"supE;": "⫆",
			"supe;": "⊇",
			"supedot;": "⫄",
			"Superset;": "⊃",
			"SupersetEqual;": "⊇",
			"suphsol;": "⟉",
			"suphsub;": "⫗",
			"suplarr;": "⥻",
			"supmult;": "⫂",
			"supnE;": "⫌",
			"supne;": "⊋",
			"supplus;": "⫀",
			"Supset;": "⋑",
			"supset;": "⊃",
			"supseteq;": "⊇",
			"supseteqq;": "⫆",
			"supsetneq;": "⊋",
			"supsetneqq;": "⫌",
			"supsim;": "⫈",
			"supsub;": "⫔",
			"supsup;": "⫖",
			"swarhk;": "⤦",
			"swArr;": "⇙",
			"swarr;": "↙",
			"swarrow;": "↙",
			"swnwar;": "⤪",
			"szlig;": "ß",
			szlig: "ß",
			"Tab;": "	",
			"target;": "⌖",
			"Tau;": "Τ",
			"tau;": "τ",
			"tbrk;": "⎴",
			"Tcaron;": "Ť",
			"tcaron;": "ť",
			"Tcedil;": "Ţ",
			"tcedil;": "ţ",
			"Tcy;": "Т",
			"tcy;": "т",
			"tdot;": "⃛",
			"telrec;": "⌕",
			"Tfr;": "𝔗",
			"tfr;": "𝔱",
			"there4;": "∴",
			"Therefore;": "∴",
			"therefore;": "∴",
			"Theta;": "Θ",
			"theta;": "θ",
			"thetasym;": "ϑ",
			"thetav;": "ϑ",
			"thickapprox;": "≈",
			"thicksim;": "∼",
			"ThickSpace;": "  ",
			"thinsp;": " ",
			"ThinSpace;": " ",
			"thkap;": "≈",
			"thksim;": "∼",
			"THORN;": "Þ",
			THORN: "Þ",
			"thorn;": "þ",
			thorn: "þ",
			"Tilde;": "∼",
			"tilde;": "˜",
			"TildeEqual;": "≃",
			"TildeFullEqual;": "≅",
			"TildeTilde;": "≈",
			"times;": "×",
			times: "×",
			"timesb;": "⊠",
			"timesbar;": "⨱",
			"timesd;": "⨰",
			"tint;": "∭",
			"toea;": "⤨",
			"top;": "⊤",
			"topbot;": "⌶",
			"topcir;": "⫱",
			"Topf;": "𝕋",
			"topf;": "𝕥",
			"topfork;": "⫚",
			"tosa;": "⤩",
			"tprime;": "‴",
			"TRADE;": "™",
			"trade;": "™",
			"triangle;": "▵",
			"triangledown;": "▿",
			"triangleleft;": "◃",
			"trianglelefteq;": "⊴",
			"triangleq;": "≜",
			"triangleright;": "▹",
			"trianglerighteq;": "⊵",
			"tridot;": "◬",
			"trie;": "≜",
			"triminus;": "⨺",
			"TripleDot;": "⃛",
			"triplus;": "⨹",
			"trisb;": "⧍",
			"tritime;": "⨻",
			"trpezium;": "⏢",
			"Tscr;": "𝒯",
			"tscr;": "𝓉",
			"TScy;": "Ц",
			"tscy;": "ц",
			"TSHcy;": "Ћ",
			"tshcy;": "ћ",
			"Tstrok;": "Ŧ",
			"tstrok;": "ŧ",
			"twixt;": "≬",
			"twoheadleftarrow;": "↞",
			"twoheadrightarrow;": "↠",
			"Uacute;": "Ú",
			Uacute: "Ú",
			"uacute;": "ú",
			uacute: "ú",
			"Uarr;": "↟",
			"uArr;": "⇑",
			"uarr;": "↑",
			"Uarrocir;": "⥉",
			"Ubrcy;": "Ў",
			"ubrcy;": "ў",
			"Ubreve;": "Ŭ",
			"ubreve;": "ŭ",
			"Ucirc;": "Û",
			Ucirc: "Û",
			"ucirc;": "û",
			ucirc: "û",
			"Ucy;": "У",
			"ucy;": "у",
			"udarr;": "⇅",
			"Udblac;": "Ű",
			"udblac;": "ű",
			"udhar;": "⥮",
			"ufisht;": "⥾",
			"Ufr;": "𝔘",
			"ufr;": "𝔲",
			"Ugrave;": "Ù",
			Ugrave: "Ù",
			"ugrave;": "ù",
			ugrave: "ù",
			"uHar;": "⥣",
			"uharl;": "↿",
			"uharr;": "↾",
			"uhblk;": "▀",
			"ulcorn;": "⌜",
			"ulcorner;": "⌜",
			"ulcrop;": "⌏",
			"ultri;": "◸",
			"Umacr;": "Ū",
			"umacr;": "ū",
			"uml;": "¨",
			uml: "¨",
			"UnderBar;": "_",
			"UnderBrace;": "⏟",
			"UnderBracket;": "⎵",
			"UnderParenthesis;": "⏝",
			"Union;": "⋃",
			"UnionPlus;": "⊎",
			"Uogon;": "Ų",
			"uogon;": "ų",
			"Uopf;": "𝕌",
			"uopf;": "𝕦",
			"UpArrow;": "↑",
			"Uparrow;": "⇑",
			"uparrow;": "↑",
			"UpArrowBar;": "⤒",
			"UpArrowDownArrow;": "⇅",
			"UpDownArrow;": "↕",
			"Updownarrow;": "⇕",
			"updownarrow;": "↕",
			"UpEquilibrium;": "⥮",
			"upharpoonleft;": "↿",
			"upharpoonright;": "↾",
			"uplus;": "⊎",
			"UpperLeftArrow;": "↖",
			"UpperRightArrow;": "↗",
			"Upsi;": "ϒ",
			"upsi;": "υ",
			"upsih;": "ϒ",
			"Upsilon;": "Υ",
			"upsilon;": "υ",
			"UpTee;": "⊥",
			"UpTeeArrow;": "↥",
			"upuparrows;": "⇈",
			"urcorn;": "⌝",
			"urcorner;": "⌝",
			"urcrop;": "⌎",
			"Uring;": "Ů",
			"uring;": "ů",
			"urtri;": "◹",
			"Uscr;": "𝒰",
			"uscr;": "𝓊",
			"utdot;": "⋰",
			"Utilde;": "Ũ",
			"utilde;": "ũ",
			"utri;": "▵",
			"utrif;": "▴",
			"uuarr;": "⇈",
			"Uuml;": "Ü",
			Uuml: "Ü",
			"uuml;": "ü",
			uuml: "ü",
			"uwangle;": "⦧",
			"vangrt;": "⦜",
			"varepsilon;": "ϵ",
			"varkappa;": "ϰ",
			"varnothing;": "∅",
			"varphi;": "ϕ",
			"varpi;": "ϖ",
			"varpropto;": "∝",
			"vArr;": "⇕",
			"varr;": "↕",
			"varrho;": "ϱ",
			"varsigma;": "ς",
			"varsubsetneq;": "⊊︀",
			"varsubsetneqq;": "⫋︀",
			"varsupsetneq;": "⊋︀",
			"varsupsetneqq;": "⫌︀",
			"vartheta;": "ϑ",
			"vartriangleleft;": "⊲",
			"vartriangleright;": "⊳",
			"Vbar;": "⫫",
			"vBar;": "⫨",
			"vBarv;": "⫩",
			"Vcy;": "В",
			"vcy;": "в",
			"VDash;": "⊫",
			"Vdash;": "⊩",
			"vDash;": "⊨",
			"vdash;": "⊢",
			"Vdashl;": "⫦",
			"Vee;": "⋁",
			"vee;": "∨",
			"veebar;": "⊻",
			"veeeq;": "≚",
			"vellip;": "⋮",
			"Verbar;": "‖",
			"verbar;": "|",
			"Vert;": "‖",
			"vert;": "|",
			"VerticalBar;": "∣",
			"VerticalLine;": "|",
			"VerticalSeparator;": "❘",
			"VerticalTilde;": "≀",
			"VeryThinSpace;": " ",
			"Vfr;": "𝔙",
			"vfr;": "𝔳",
			"vltri;": "⊲",
			"vnsub;": "⊂⃒",
			"vnsup;": "⊃⃒",
			"Vopf;": "𝕍",
			"vopf;": "𝕧",
			"vprop;": "∝",
			"vrtri;": "⊳",
			"Vscr;": "𝒱",
			"vscr;": "𝓋",
			"vsubnE;": "⫋︀",
			"vsubne;": "⊊︀",
			"vsupnE;": "⫌︀",
			"vsupne;": "⊋︀",
			"Vvdash;": "⊪",
			"vzigzag;": "⦚",
			"Wcirc;": "Ŵ",
			"wcirc;": "ŵ",
			"wedbar;": "⩟",
			"Wedge;": "⋀",
			"wedge;": "∧",
			"wedgeq;": "≙",
			"weierp;": "℘",
			"Wfr;": "𝔚",
			"wfr;": "𝔴",
			"Wopf;": "𝕎",
			"wopf;": "𝕨",
			"wp;": "℘",
			"wr;": "≀",
			"wreath;": "≀",
			"Wscr;": "𝒲",
			"wscr;": "𝓌",
			"xcap;": "⋂",
			"xcirc;": "◯",
			"xcup;": "⋃",
			"xdtri;": "▽",
			"Xfr;": "𝔛",
			"xfr;": "𝔵",
			"xhArr;": "⟺",
			"xharr;": "⟷",
			"Xi;": "Ξ",
			"xi;": "ξ",
			"xlArr;": "⟸",
			"xlarr;": "⟵",
			"xmap;": "⟼",
			"xnis;": "⋻",
			"xodot;": "⨀",
			"Xopf;": "𝕏",
			"xopf;": "𝕩",
			"xoplus;": "⨁",
			"xotime;": "⨂",
			"xrArr;": "⟹",
			"xrarr;": "⟶",
			"Xscr;": "𝒳",
			"xscr;": "𝓍",
			"xsqcup;": "⨆",
			"xuplus;": "⨄",
			"xutri;": "△",
			"xvee;": "⋁",
			"xwedge;": "⋀",
			"Yacute;": "Ý",
			Yacute: "Ý",
			"yacute;": "ý",
			yacute: "ý",
			"YAcy;": "Я",
			"yacy;": "я",
			"Ycirc;": "Ŷ",
			"ycirc;": "ŷ",
			"Ycy;": "Ы",
			"ycy;": "ы",
			"yen;": "¥",
			yen: "¥",
			"Yfr;": "𝔜",
			"yfr;": "𝔶",
			"YIcy;": "Ї",
			"yicy;": "ї",
			"Yopf;": "𝕐",
			"yopf;": "𝕪",
			"Yscr;": "𝒴",
			"yscr;": "𝓎",
			"YUcy;": "Ю",
			"yucy;": "ю",
			"Yuml;": "Ÿ",
			"yuml;": "ÿ",
			yuml: "ÿ",
			"Zacute;": "Ź",
			"zacute;": "ź",
			"Zcaron;": "Ž",
			"zcaron;": "ž",
			"Zcy;": "З",
			"zcy;": "з",
			"Zdot;": "Ż",
			"zdot;": "ż",
			"zeetrf;": "ℨ",
			"ZeroWidthSpace;": "​",
			"Zeta;": "Ζ",
			"zeta;": "ζ",
			"Zfr;": "ℨ",
			"zfr;": "𝔷",
			"ZHcy;": "Ж",
			"zhcy;": "ж",
			"zigrarr;": "⇝",
			"Zopf;": "ℤ",
			"zopf;": "𝕫",
			"Zscr;": "𝒵",
			"zscr;": "𝓏",
			"zwj;": "‍",
			"zwnj;": "‌",
		};
	function Pe(e, t) {
		if (e.length < t.length) return !1;
		for (let n = 0; n < t.length; n++) if (e[n] !== t[n]) return !1;
		return !0;
	}
	function ku(e, t) {
		const n = e.length - t.length;
		return n > 0 ? e.lastIndexOf(t) === n : n === 0 ? e === t : !1;
	}
	function _a(e, t) {
		let n = "";
		for (; t > 0; ) (t & 1) === 1 && (n += e), (e += e), (t = t >>> 1);
		return n;
	}
	var Au = 97,
		Su = 122,
		Lu = 65,
		Cu = 90,
		Eu = 48,
		Ru = 57;
	function xt(e, t) {
		const n = e.charCodeAt(t);
		return (
			(Au <= n && n <= Su) || (Lu <= n && n <= Cu) || (Eu <= n && n <= Ru)
		);
	}
	function nn(e) {
		return typeof e < "u";
	}
	function Mu(e) {
		if (e)
			return typeof e == "string"
				? { kind: "markdown", value: e }
				: { kind: "markdown", value: e.value };
	}
	var wa = class {
		isApplicable() {
			return !0;
		}
		constructor(e, t) {
			(this.id = e),
				(this._tags = []),
				(this._tagMap = {}),
				(this._valueSetMap = {}),
				(this._tags = t.tags || []),
				(this._globalAttributes = t.globalAttributes || []),
				this._tags.forEach((n) => {
					this._tagMap[n.name.toLowerCase()] = n;
				}),
				t.valueSets &&
					t.valueSets.forEach((n) => {
						this._valueSetMap[n.name] = n.values;
					});
		}
		getId() {
			return this.id;
		}
		provideTags() {
			return this._tags;
		}
		provideAttributes(e) {
			const t = [],
				n = (r) => {
					t.push(r);
				},
				i = this._tagMap[e.toLowerCase()];
			return (
				i && i.attributes.forEach(n),
				this._globalAttributes.forEach(n),
				t
			);
		}
		provideValues(e, t) {
			const n = [];
			t = t.toLowerCase();
			const i = (s) => {
					s.forEach((o) => {
						o.name.toLowerCase() === t &&
							(o.values &&
								o.values.forEach((l) => {
									n.push(l);
								}),
							o.valueSet &&
								this._valueSetMap[o.valueSet] &&
								this._valueSetMap[o.valueSet].forEach((l) => {
									n.push(l);
								}));
					});
				},
				r = this._tagMap[e.toLowerCase()];
			return r && i(r.attributes), i(this._globalAttributes), n;
		}
	};
	function je(e, t = {}, n) {
		const i = { kind: n ? "markdown" : "plaintext", value: "" };
		if (e.description && t.documentation !== !1) {
			const r = Mu(e.description);
			r && (i.value += r.value);
		}
		if (
			(e.references &&
				e.references.length > 0 &&
				t.references !== !1 &&
				(i.value.length &&
					(i.value += `

`),
				n
					? (i.value += e.references
							.map((r) => `[${r.name}](${r.url})`)
							.join(" | "))
					: (i.value += e.references
							.map((r) => `${r.name}: ${r.url}`)
							.join(`
`))),
			i.value !== "")
		)
			return i;
	}
	var Nu = class {
			constructor(e, t) {
				(this.dataManager = e),
					(this.readDirectory = t),
					(this.atributeCompletions = []);
			}
			onHtmlAttributeValue(e) {
				this.dataManager.isPathAttribute(e.tag, e.attribute) &&
					this.atributeCompletions.push(e);
			}
			async computeCompletions(e, t) {
				const n = { items: [], isIncomplete: !1 };
				for (const i of this.atributeCompletions) {
					const r = Iu(e.getText(i.range));
					if (zu(r))
						if (r === "." || r === "..") n.isIncomplete = !0;
						else {
							const s = Hu(i.value, r, i.range),
								o = await this.providePathSuggestions(
									i.value,
									s,
									e,
									t,
								);
							for (const l of o) n.items.push(l);
						}
				}
				return n;
			}
			async providePathSuggestions(e, t, n, i) {
				const r = e.substring(0, e.lastIndexOf("/") + 1);
				let s = i.resolveReference(r || ".", n.uri);
				if (s)
					try {
						const o = [],
							l = await this.readDirectory(s);
						for (const [a, u] of l)
							a.charCodeAt(0) !== Du &&
								o.push(Uu(a, u === oi.Directory, t));
						return o;
					} catch {}
				return [];
			}
		},
		Du = 46;
	function Iu(e) {
		return Pe(e, "'") || Pe(e, '"') ? e.slice(1, -1) : e;
	}
	function zu(e) {
		return !(Pe(e, "http") || Pe(e, "https") || Pe(e, "//"));
	}
	function Hu(e, t, n) {
		let i;
		const r = e.lastIndexOf("/");
		if (r === -1) i = Wu(n, 1, -1);
		else {
			const s = t.slice(r + 1),
				o = Tt(n.end, -1 - s.length),
				l = s.indexOf(" ");
			let a;
			l !== -1 ? (a = Tt(o, l)) : (a = Tt(n.end, -1)),
				(i = G.create(o, a));
		}
		return i;
	}
	function Uu(e, t, n) {
		return t
			? ((e = e + "/"),
				{
					label: e,
					kind: he.Folder,
					textEdit: oe.replace(n, e),
					command: {
						title: "Suggest",
						command: "editor.action.triggerSuggest",
					},
				})
			: { label: e, kind: he.File, textEdit: oe.replace(n, e) };
	}
	function Tt(e, t) {
		return re.create(e.line, e.character + t);
	}
	function Wu(e, t, n) {
		const i = Tt(e.start, t),
			r = Tt(e.end, n);
		return G.create(i, r);
	}
	var Fu = class {
		constructor(e, t) {
			(this.lsOptions = e),
				(this.dataManager = t),
				(this.completionParticipants = []);
		}
		setCompletionParticipants(e) {
			this.completionParticipants = e || [];
		}
		async doComplete2(e, t, n, i, r) {
			if (
				!this.lsOptions.fileSystemProvider ||
				!this.lsOptions.fileSystemProvider.readDirectory
			)
				return this.doComplete(e, t, n, r);
			const s = new Nu(
					this.dataManager,
					this.lsOptions.fileSystemProvider.readDirectory,
				),
				o = this.completionParticipants;
			this.completionParticipants = [s].concat(o);
			const l = this.doComplete(e, t, n, r);
			try {
				const a = await s.computeCompletions(e, i);
				return {
					isIncomplete: l.isIncomplete || a.isIncomplete,
					items: a.items.concat(l.items),
				};
			} finally {
				this.completionParticipants = o;
			}
		}
		doComplete(e, t, n, i) {
			const r = this._doComplete(e, t, n, i);
			return this.convertCompletionList(r);
		}
		_doComplete(e, t, n, i) {
			const r = { isIncomplete: !1, items: [] },
				s = this.completionParticipants,
				o = this.dataManager
					.getDataProviders()
					.filter(
						(x) =>
							x.isApplicable(e.languageId) &&
							(!i || i[x.getId()] !== !1),
					),
				l = this.dataManager.getVoidElements(o),
				a = this.doesSupportMarkdown(),
				u = e.getText(),
				c = e.offsetAt(t),
				d = n.findNodeBefore(c);
			if (!d) return r;
			const m = pe(u, d.start);
			let f = "",
				w;
			function g(x, S = c) {
				return (
					x > c && (x = c),
					{ start: e.positionAt(x), end: e.positionAt(S) }
				);
			}
			function k(x, S) {
				const D = g(x, S);
				return (
					o.forEach((I) => {
						I.provideTags().forEach((F) => {
							r.items.push({
								label: F.name,
								kind: he.Property,
								documentation: je(F, void 0, a),
								textEdit: oe.replace(D, F.name),
								insertTextFormat: ke.PlainText,
							});
						});
					}),
					r
				);
			}
			function v(x) {
				let S = x;
				for (; S > 0; ) {
					const D = u.charAt(S - 1);
					if (
						`
\r`.indexOf(D) >= 0
					)
						return u.substring(S, x);
					if (!rn(D)) return null;
					S--;
				}
				return u.substring(0, x);
			}
			function y(x, S, D = c) {
				const I = g(x, D),
					F = va(u, D, B.WithinEndTag, z.EndTagClose) ? "" : ">";
				let W = d;
				for (S && (W = W.parent); W; ) {
					const U = W.tag;
					if (
						U &&
						(!W.closed || (W.endTagStart && W.endTagStart > c))
					) {
						const V = {
								label: "/" + U,
								kind: he.Property,
								filterText: "/" + U,
								textEdit: oe.replace(I, "/" + U + F),
								insertTextFormat: ke.PlainText,
							},
							J = v(W.start),
							se = v(x - 1);
						if (J !== null && se !== null && J !== se) {
							const Be = J + "</" + U + F;
							(V.textEdit = oe.replace(g(x - 1 - se.length), Be)),
								(V.filterText = se + "</" + U);
						}
						return r.items.push(V), r;
					}
					W = W.parent;
				}
				return (
					S ||
						o.forEach((U) => {
							U.provideTags().forEach((V) => {
								r.items.push({
									label: "/" + V.name,
									kind: he.Property,
									documentation: je(V, void 0, a),
									filterText: "/" + V.name + F,
									textEdit: oe.replace(I, "/" + V.name + F),
									insertTextFormat: ke.PlainText,
								});
							});
						}),
					r
				);
			}
			const E = (x, S) => {
				if (i && i.hideAutoCompleteProposals) return r;
				if (!this.dataManager.isVoidElement(S, l)) {
					const D = e.positionAt(x);
					r.items.push({
						label: "</" + S + ">",
						kind: he.Property,
						filterText: "</" + S + ">",
						textEdit: oe.insert(D, "$0</" + S + ">"),
						insertTextFormat: ke.Snippet,
					});
				}
				return r;
			};
			function R(x, S) {
				return k(x, S), y(x, !0, S), r;
			}
			function N() {
				const x = Object.create(null);
				return (
					d.attributeNames.forEach((S) => {
						x[S] = !0;
					}),
					x
				);
			}
			function M(x, S = c) {
				let D = c;
				for (; D < S && u[D] !== "<"; ) D++;
				const I = u.substring(x, S),
					F = g(x, D);
				let W = "";
				if (!va(u, S, B.AfterAttributeName, z.DelimiterAssign)) {
					const V = i?.attributeDefaultValue ?? "doublequotes";
					V === "empty"
						? (W = "=$1")
						: V === "singlequotes"
							? (W = "='$1'")
							: (W = '="$1"');
				}
				const U = N();
				return (
					(U[I] = !1),
					o.forEach((V) => {
						V.provideAttributes(f).forEach((J) => {
							if (U[J.name]) return;
							U[J.name] = !0;
							let se = J.name,
								Be;
							J.valueSet !== "v" &&
								W.length &&
								((se = se + W),
								(J.valueSet || J.name === "style") &&
									(Be = {
										title: "Suggest",
										command: "editor.action.triggerSuggest",
									})),
								r.items.push({
									label: J.name,
									kind:
										J.valueSet === "handler"
											? he.Function
											: he.Value,
									documentation: je(J, void 0, a),
									textEdit: oe.replace(F, se),
									insertTextFormat: ke.Snippet,
									command: Be,
								});
						});
					}),
					b(F, U),
					r
				);
			}
			function b(x, S) {
				const D = "data-",
					I = {};
				I[D] = `${D}$1="$2"`;
				function F(W) {
					W.attributeNames.forEach((U) => {
						Pe(U, D) && !I[U] && !S[U] && (I[U] = U + '="$1"');
					}),
						W.children.forEach((U) => F(U));
				}
				n && n.roots.forEach((W) => F(W)),
					Object.keys(I).forEach((W) =>
						r.items.push({
							label: W,
							kind: he.Value,
							textEdit: oe.replace(x, I[W]),
							insertTextFormat: ke.Snippet,
						}),
					);
			}
			function p(x, S = c) {
				let D, I, F;
				if (c > x && c <= S && Pu(u[x])) {
					const W = x + 1;
					let U = S;
					S > x && u[S - 1] === u[x] && U--;
					const V = Bu(u, c, W),
						J = qu(u, c, U);
					(D = g(V, J)),
						(F = c >= W && c <= U ? u.substring(W, c) : ""),
						(I = !1);
				} else (D = g(x, S)), (F = u.substring(x, c)), (I = !0);
				if (s.length > 0) {
					const W = f.toLowerCase(),
						U = w.toLowerCase(),
						V = g(x, S);
					for (const J of s)
						J.onHtmlAttributeValue &&
							J.onHtmlAttributeValue({
								document: e,
								position: t,
								tag: W,
								attribute: U,
								value: F,
								range: V,
							});
				}
				return (
					o.forEach((W) => {
						W.provideValues(f, w).forEach((U) => {
							const V = I ? '"' + U.name + '"' : U.name;
							r.items.push({
								label: U.name,
								filterText: V,
								kind: he.Unit,
								documentation: je(U, void 0, a),
								textEdit: oe.replace(D, V),
								insertTextFormat: ke.PlainText,
							});
						});
					}),
					L(),
					r
				);
			}
			function T(x) {
				return c === m.getTokenEnd() &&
					((A = m.scan()), A === x && m.getTokenOffset() === c)
					? m.getTokenEnd()
					: c;
			}
			function H() {
				for (const x of s)
					x.onHtmlContent &&
						x.onHtmlContent({ document: e, position: t });
				return L();
			}
			function L() {
				let x = c - 1,
					S = t.character;
				for (; x >= 0 && xt(u, x); ) x--, S--;
				if (x >= 0 && u[x] === "&") {
					const D = G.create(re.create(t.line, S - 1), t);
					for (const I in yt)
						if (ku(I, ";")) {
							const F = "&" + I;
							r.items.push({
								label: F,
								kind: he.Keyword,
								documentation: Te(
									"Character entity representing '{0}'",
									yt[I],
								),
								textEdit: oe.replace(D, F),
								insertTextFormat: ke.PlainText,
							});
						}
				}
				return r;
			}
			function _(x, S) {
				const D = g(x, S);
				r.items.push({
					label: "!DOCTYPE",
					kind: he.Property,
					documentation: "A preamble for an HTML document.",
					textEdit: oe.replace(D, "!DOCTYPE html>"),
					insertTextFormat: ke.PlainText,
				});
			}
			let A = m.scan();
			for (; A !== z.EOS && m.getTokenOffset() <= c; ) {
				switch (A) {
					case z.StartTagOpen:
						if (m.getTokenEnd() === c) {
							const x = T(z.StartTag);
							return t.line === 0 && _(c, x), R(c, x);
						}
						break;
					case z.StartTag:
						if (m.getTokenOffset() <= c && c <= m.getTokenEnd())
							return k(m.getTokenOffset(), m.getTokenEnd());
						f = m.getTokenText();
						break;
					case z.AttributeName:
						if (m.getTokenOffset() <= c && c <= m.getTokenEnd())
							return M(m.getTokenOffset(), m.getTokenEnd());
						w = m.getTokenText();
						break;
					case z.DelimiterAssign:
						if (m.getTokenEnd() === c) {
							const x = T(z.AttributeValue);
							return p(c, x);
						}
						break;
					case z.AttributeValue:
						if (m.getTokenOffset() <= c && c <= m.getTokenEnd())
							return p(m.getTokenOffset(), m.getTokenEnd());
						break;
					case z.Whitespace:
						if (c <= m.getTokenEnd())
							switch (m.getScannerState()) {
								case B.AfterOpeningStartTag:
									const x = m.getTokenOffset(),
										S = T(z.StartTag);
									return R(x, S);
								case B.WithinTag:
								case B.AfterAttributeName:
									return M(m.getTokenEnd());
								case B.BeforeAttributeValue:
									return p(m.getTokenEnd());
								case B.AfterOpeningEndTag:
									return y(m.getTokenOffset() - 1, !1);
								case B.WithinContent:
									return H();
							}
						break;
					case z.EndTagOpen:
						if (c <= m.getTokenEnd()) {
							const x = m.getTokenOffset() + 1,
								S = T(z.EndTag);
							return y(x, !1, S);
						}
						break;
					case z.EndTag:
						if (c <= m.getTokenEnd()) {
							let x = m.getTokenOffset() - 1;
							for (; x >= 0; ) {
								const S = u.charAt(x);
								if (S === "/") return y(x, !1, m.getTokenEnd());
								if (!rn(S)) break;
								x--;
							}
						}
						break;
					case z.StartTagClose:
						if (c <= m.getTokenEnd() && f)
							return E(m.getTokenEnd(), f);
						break;
					case z.Content:
						if (c <= m.getTokenEnd()) return H();
						break;
					default:
						if (c <= m.getTokenEnd()) return r;
						break;
				}
				A = m.scan();
			}
			return r;
		}
		doQuoteComplete(e, t, n, i) {
			const r = e.offsetAt(t);
			if (r <= 0) return null;
			const s = i?.attributeDefaultValue ?? "doublequotes";
			if (s === "empty" || e.getText().charAt(r - 1) !== "=") return null;
			const l = s === "doublequotes" ? '"$1"' : "'$1'",
				a = n.findNodeBefore(r);
			if (
				a &&
				a.attributes &&
				a.start < r &&
				(!a.endTagStart || a.endTagStart > r)
			) {
				const u = pe(e.getText(), a.start);
				let c = u.scan();
				for (; c !== z.EOS && u.getTokenEnd() <= r; ) {
					if (c === z.AttributeName && u.getTokenEnd() === r - 1)
						return (
							(c = u.scan()),
							c !== z.DelimiterAssign ||
							((c = u.scan()),
							c === z.Unknown || c === z.AttributeValue)
								? null
								: l
						);
					c = u.scan();
				}
			}
			return null;
		}
		doTagComplete(e, t, n) {
			const i = e.offsetAt(t);
			if (i <= 0) return null;
			const r = e.getText().charAt(i - 1);
			if (r === ">") {
				const s = this.dataManager.getVoidElements(e.languageId),
					o = n.findNodeBefore(i);
				if (
					o &&
					o.tag &&
					!this.dataManager.isVoidElement(o.tag, s) &&
					o.start < i &&
					(!o.endTagStart || o.endTagStart > i)
				) {
					const l = pe(e.getText(), o.start);
					let a = l.scan();
					for (; a !== z.EOS && l.getTokenEnd() <= i; ) {
						if (a === z.StartTagClose && l.getTokenEnd() === i)
							return `$0</${o.tag}>`;
						a = l.scan();
					}
				}
			} else if (r === "/") {
				let s = n.findNodeBefore(i);
				for (; s && s.closed && !(s.endTagStart && s.endTagStart > i); )
					s = s.parent;
				if (s && s.tag) {
					const o = pe(e.getText(), s.start);
					let l = o.scan();
					for (; l !== z.EOS && o.getTokenEnd() <= i; ) {
						if (l === z.EndTagOpen && o.getTokenEnd() === i)
							return e.getText().charAt(i) !== ">"
								? `${s.tag}>`
								: s.tag;
						l = o.scan();
					}
				}
			}
			return null;
		}
		convertCompletionList(e) {
			return (
				this.doesSupportMarkdown() ||
					e.items.forEach((t) => {
						t.documentation &&
							typeof t.documentation != "string" &&
							(t.documentation = {
								kind: "plaintext",
								value: t.documentation.value,
							});
					}),
				e
			);
		}
		doesSupportMarkdown() {
			if (!nn(this.supportsMarkdown)) {
				if (!nn(this.lsOptions.clientCapabilities))
					return (this.supportsMarkdown = !0), this.supportsMarkdown;
				const e =
					this.lsOptions.clientCapabilities.textDocument?.completion
						?.completionItem?.documentationFormat;
				this.supportsMarkdown =
					Array.isArray(e) && e.indexOf(Me.Markdown) !== -1;
			}
			return this.supportsMarkdown;
		}
	};
	function Pu(e) {
		return /^["']*$/.test(e);
	}
	function rn(e) {
		return /^\s*$/.test(e);
	}
	function va(e, t, n, i) {
		const r = pe(e, t, n);
		let s = r.scan();
		for (; s === z.Whitespace; ) s = r.scan();
		return s === i;
	}
	function Bu(e, t, n) {
		for (; t > n && !rn(e[t - 1]); ) t--;
		return t;
	}
	function qu(e, t, n) {
		for (; t < n && !rn(e[t]); ) t++;
		return t;
	}
	var Ou = class {
		constructor(e, t) {
			(this.lsOptions = e), (this.dataManager = t);
		}
		doHover(e, t, n, i) {
			const r = this.convertContents.bind(this),
				s = this.doesSupportMarkdown(),
				o = e.offsetAt(t),
				l = n.findNodeAt(o),
				a = e.getText();
			if (!l || !l.tag) return null;
			const u = this.dataManager
				.getDataProviders()
				.filter((M) => M.isApplicable(e.languageId));
			function c(M, b, p) {
				for (const T of u) {
					let H = null;
					if (
						(T.provideTags().forEach((L) => {
							if (L.name.toLowerCase() === M.toLowerCase()) {
								let _ = je(L, i, s);
								_ ||
									(_ = {
										kind: s ? "markdown" : "plaintext",
										value: "",
									}),
									(H = { contents: _, range: b });
							}
						}),
						H)
					)
						return (H.contents = r(H.contents)), H;
				}
				return null;
			}
			function d(M, b, p) {
				for (const T of u) {
					let H = null;
					if (
						(T.provideAttributes(M).forEach((L) => {
							if (b === L.name && L.description) {
								const _ = je(L, i, s);
								_
									? (H = { contents: _, range: p })
									: (H = null);
							}
						}),
						H)
					)
						return (H.contents = r(H.contents)), H;
				}
				return null;
			}
			function m(M, b, p, T) {
				for (const H of u) {
					let L = null;
					if (
						(H.provideValues(M, b).forEach((_) => {
							if (p === _.name && _.description) {
								const A = je(_, i, s);
								A
									? (L = { contents: A, range: T })
									: (L = null);
							}
						}),
						L)
					)
						return (L.contents = r(L.contents)), L;
				}
				return null;
			}
			function f(M, b) {
				let p = k(M);
				for (const T in yt) {
					let H = null;
					const L = "&" + T;
					if (p === L) {
						let _ = yt[T].charCodeAt(0).toString(16).toUpperCase(),
							A = "U+";
						if (_.length < 4) {
							const S = 4 - _.length;
							let D = 0;
							for (; D < S; ) (A += "0"), (D += 1);
						}
						A += _;
						const x = Te(
							"Character entity representing '{0}', unicode equivalent '{1}'",
							yt[T],
							A,
						);
						x ? (H = { contents: x, range: b }) : (H = null);
					}
					if (H) return (H.contents = r(H.contents)), H;
				}
				return null;
			}
			function w(M, b) {
				const p = pe(e.getText(), b);
				let T = p.scan();
				for (
					;
					T !== z.EOS &&
					(p.getTokenEnd() < o || (p.getTokenEnd() === o && T !== M));
				)
					T = p.scan();
				return T === M && o <= p.getTokenEnd()
					? {
							start: e.positionAt(p.getTokenOffset()),
							end: e.positionAt(p.getTokenEnd()),
						}
					: null;
			}
			function g() {
				let M = o - 1,
					b = t.character;
				for (; M >= 0 && xt(a, M); ) M--, b--;
				let p = M + 1,
					T = b;
				for (; xt(a, p); ) p++, T++;
				if (M >= 0 && a[M] === "&") {
					let H = null;
					return (
						a[p] === ";"
							? (H = G.create(
									re.create(t.line, b),
									re.create(t.line, T + 1),
								))
							: (H = G.create(
									re.create(t.line, b),
									re.create(t.line, T),
								)),
						H
					);
				}
				return null;
			}
			function k(M) {
				let b = o - 1,
					p = "&";
				for (; b >= 0 && xt(M, b); ) b--;
				for (b = b + 1; xt(M, b); ) (p += M[b]), (b += 1);
				return (p += ";"), p;
			}
			if (l.endTagStart && o >= l.endTagStart) {
				const M = w(z.EndTag, l.endTagStart);
				return M ? c(l.tag, M) : null;
			}
			const v = w(z.StartTag, l.start);
			if (v) return c(l.tag, v);
			const y = w(z.AttributeName, l.start);
			if (y) {
				const M = l.tag,
					b = e.getText(y);
				return d(M, b, y);
			}
			const E = g();
			if (E) return f(a, E);
			function R(M, b) {
				const p = pe(e.getText(), M);
				let T = p.scan(),
					H;
				for (; T !== z.EOS && p.getTokenEnd() <= b; )
					(T = p.scan()),
						T === z.AttributeName && (H = p.getTokenText());
				return H;
			}
			const N = w(z.AttributeValue, l.start);
			if (N) {
				const M = l.tag,
					b = Vu(e.getText(N)),
					p = R(l.start, e.offsetAt(N.start));
				if (p) return m(M, p, b, N);
			}
			return null;
		}
		convertContents(e) {
			if (!this.doesSupportMarkdown()) {
				if (typeof e == "string") return e;
				if ("kind" in e) return { kind: "plaintext", value: e.value };
				if (Array.isArray(e))
					e.map((t) => (typeof t == "string" ? t : t.value));
				else return e.value;
			}
			return e;
		}
		doesSupportMarkdown() {
			if (!nn(this.supportsMarkdown)) {
				if (!nn(this.lsOptions.clientCapabilities))
					return (this.supportsMarkdown = !0), this.supportsMarkdown;
				const e =
					this.lsOptions.clientCapabilities?.textDocument?.hover
						?.contentFormat;
				this.supportsMarkdown =
					Array.isArray(e) && e.indexOf(Me.Markdown) !== -1;
			}
			return this.supportsMarkdown;
		}
	};
	function Vu(e) {
		return e.length <= 1
			? e.replace(/['"]/, "")
			: ((e[0] === "'" || e[0] === '"') && (e = e.slice(1)),
				(e[e.length - 1] === "'" || e[e.length - 1] === '"') &&
					(e = e.slice(0, -1)),
				e);
	}
	function ju(e, t) {
		return e;
	}
	var ya;
	(function () {
		var e = [
				,
				,
				function (r) {
					function s(a) {
						(this.__parent = a),
							(this.__character_count = 0),
							(this.__indent_count = -1),
							(this.__alignment_count = 0),
							(this.__wrap_point_index = 0),
							(this.__wrap_point_character_count = 0),
							(this.__wrap_point_indent_count = -1),
							(this.__wrap_point_alignment_count = 0),
							(this.__items = []);
					}
					(s.prototype.clone_empty = function () {
						var a = new s(this.__parent);
						return (
							a.set_indent(
								this.__indent_count,
								this.__alignment_count,
							),
							a
						);
					}),
						(s.prototype.item = function (a) {
							return a < 0
								? this.__items[this.__items.length + a]
								: this.__items[a];
						}),
						(s.prototype.has_match = function (a) {
							for (var u = this.__items.length - 1; u >= 0; u--)
								if (this.__items[u].match(a)) return !0;
							return !1;
						}),
						(s.prototype.set_indent = function (a, u) {
							this.is_empty() &&
								((this.__indent_count = a || 0),
								(this.__alignment_count = u || 0),
								(this.__character_count =
									this.__parent.get_indent_size(
										this.__indent_count,
										this.__alignment_count,
									)));
						}),
						(s.prototype._set_wrap_point = function () {
							this.__parent.wrap_line_length &&
								((this.__wrap_point_index =
									this.__items.length),
								(this.__wrap_point_character_count =
									this.__character_count),
								(this.__wrap_point_indent_count =
									this.__parent.next_line.__indent_count),
								(this.__wrap_point_alignment_count =
									this.__parent.next_line.__alignment_count));
						}),
						(s.prototype._should_wrap = function () {
							return (
								this.__wrap_point_index &&
								this.__character_count >
									this.__parent.wrap_line_length &&
								this.__wrap_point_character_count >
									this.__parent.next_line.__character_count
							);
						}),
						(s.prototype._allow_wrap = function () {
							if (this._should_wrap()) {
								this.__parent.add_new_line();
								var a = this.__parent.current_line;
								return (
									a.set_indent(
										this.__wrap_point_indent_count,
										this.__wrap_point_alignment_count,
									),
									(a.__items = this.__items.slice(
										this.__wrap_point_index,
									)),
									(this.__items = this.__items.slice(
										0,
										this.__wrap_point_index,
									)),
									(a.__character_count +=
										this.__character_count -
										this.__wrap_point_character_count),
									(this.__character_count =
										this.__wrap_point_character_count),
									a.__items[0] === " " &&
										(a.__items.splice(0, 1),
										(a.__character_count -= 1)),
									!0
								);
							}
							return !1;
						}),
						(s.prototype.is_empty = function () {
							return this.__items.length === 0;
						}),
						(s.prototype.last = function () {
							return this.is_empty()
								? null
								: this.__items[this.__items.length - 1];
						}),
						(s.prototype.push = function (a) {
							this.__items.push(a);
							var u = a.lastIndexOf(`
`);
							u !== -1
								? (this.__character_count = a.length - u)
								: (this.__character_count += a.length);
						}),
						(s.prototype.pop = function () {
							var a = null;
							return (
								this.is_empty() ||
									((a = this.__items.pop()),
									(this.__character_count -= a.length)),
								a
							);
						}),
						(s.prototype._remove_indent = function () {
							this.__indent_count > 0 &&
								((this.__indent_count -= 1),
								(this.__character_count -=
									this.__parent.indent_size));
						}),
						(s.prototype._remove_wrap_indent = function () {
							this.__wrap_point_indent_count > 0 &&
								(this.__wrap_point_indent_count -= 1);
						}),
						(s.prototype.trim = function () {
							for (; this.last() === " "; )
								this.__items.pop(),
									(this.__character_count -= 1);
						}),
						(s.prototype.toString = function () {
							var a = "";
							return (
								this.is_empty()
									? this.__parent.indent_empty_lines &&
										(a = this.__parent.get_indent_string(
											this.__indent_count,
										))
									: ((a = this.__parent.get_indent_string(
											this.__indent_count,
											this.__alignment_count,
										)),
										(a += this.__items.join(""))),
								a
							);
						});
					function o(a, u) {
						(this.__cache = [""]),
							(this.__indent_size = a.indent_size),
							(this.__indent_string = a.indent_char),
							a.indent_with_tabs ||
								(this.__indent_string = new Array(
									a.indent_size + 1,
								).join(a.indent_char)),
							(u = u || ""),
							a.indent_level > 0 &&
								(u = new Array(a.indent_level + 1).join(
									this.__indent_string,
								)),
							(this.__base_string = u),
							(this.__base_string_length = u.length);
					}
					(o.prototype.get_indent_size = function (a, u) {
						var c = this.__base_string_length;
						return (
							(u = u || 0),
							a < 0 && (c = 0),
							(c += a * this.__indent_size),
							(c += u),
							c
						);
					}),
						(o.prototype.get_indent_string = function (a, u) {
							var c = this.__base_string;
							return (
								(u = u || 0),
								a < 0 && ((a = 0), (c = "")),
								(u += a * this.__indent_size),
								this.__ensure_cache(u),
								(c += this.__cache[u]),
								c
							);
						}),
						(o.prototype.__ensure_cache = function (a) {
							for (; a >= this.__cache.length; )
								this.__add_column();
						}),
						(o.prototype.__add_column = function () {
							var a = this.__cache.length,
								u = 0,
								c = "";
							this.__indent_size &&
								a >= this.__indent_size &&
								((u = Math.floor(a / this.__indent_size)),
								(a -= u * this.__indent_size),
								(c = new Array(u + 1).join(
									this.__indent_string,
								))),
								a && (c += new Array(a + 1).join(" ")),
								this.__cache.push(c);
						});
					function l(a, u) {
						(this.__indent_cache = new o(a, u)),
							(this.raw = !1),
							(this._end_with_newline = a.end_with_newline),
							(this.indent_size = a.indent_size),
							(this.wrap_line_length = a.wrap_line_length),
							(this.indent_empty_lines = a.indent_empty_lines),
							(this.__lines = []),
							(this.previous_line = null),
							(this.current_line = null),
							(this.next_line = new s(this)),
							(this.space_before_token = !1),
							(this.non_breaking_space = !1),
							(this.previous_token_wrapped = !1),
							this.__add_outputline();
					}
					(l.prototype.__add_outputline = function () {
						(this.previous_line = this.current_line),
							(this.current_line = this.next_line.clone_empty()),
							this.__lines.push(this.current_line);
					}),
						(l.prototype.get_line_number = function () {
							return this.__lines.length;
						}),
						(l.prototype.get_indent_string = function (a, u) {
							return this.__indent_cache.get_indent_string(a, u);
						}),
						(l.prototype.get_indent_size = function (a, u) {
							return this.__indent_cache.get_indent_size(a, u);
						}),
						(l.prototype.is_empty = function () {
							return (
								!this.previous_line &&
								this.current_line.is_empty()
							);
						}),
						(l.prototype.add_new_line = function (a) {
							return this.is_empty() ||
								(!a && this.just_added_newline())
								? !1
								: (this.raw || this.__add_outputline(), !0);
						}),
						(l.prototype.get_code = function (a) {
							this.trim(!0);
							var u = this.current_line.pop();
							u &&
								(u[u.length - 1] ===
									`
` && (u = u.replace(/\n+$/g, "")),
								this.current_line.push(u)),
								this._end_with_newline &&
									this.__add_outputline();
							var c = this.__lines.join(`
`);
							return (
								a !==
									`
` && (c = c.replace(/[\n]/g, a)),
								c
							);
						}),
						(l.prototype.set_wrap_point = function () {
							this.current_line._set_wrap_point();
						}),
						(l.prototype.set_indent = function (a, u) {
							return (
								(a = a || 0),
								(u = u || 0),
								this.next_line.set_indent(a, u),
								this.__lines.length > 1
									? (this.current_line.set_indent(a, u), !0)
									: (this.current_line.set_indent(), !1)
							);
						}),
						(l.prototype.add_raw_token = function (a) {
							for (var u = 0; u < a.newlines; u++)
								this.__add_outputline();
							this.current_line.set_indent(-1),
								this.current_line.push(a.whitespace_before),
								this.current_line.push(a.text),
								(this.space_before_token = !1),
								(this.non_breaking_space = !1),
								(this.previous_token_wrapped = !1);
						}),
						(l.prototype.add_token = function (a) {
							this.__add_space_before_token(),
								this.current_line.push(a),
								(this.space_before_token = !1),
								(this.non_breaking_space = !1),
								(this.previous_token_wrapped =
									this.current_line._allow_wrap());
						}),
						(l.prototype.__add_space_before_token = function () {
							this.space_before_token &&
								!this.just_added_newline() &&
								(this.non_breaking_space ||
									this.set_wrap_point(),
								this.current_line.push(" "));
						}),
						(l.prototype.remove_indent = function (a) {
							for (var u = this.__lines.length; a < u; )
								this.__lines[a]._remove_indent(), a++;
							this.current_line._remove_wrap_indent();
						}),
						(l.prototype.trim = function (a) {
							for (
								a = a === void 0 ? !1 : a,
									this.current_line.trim();
								a &&
								this.__lines.length > 1 &&
								this.current_line.is_empty();
							)
								this.__lines.pop(),
									(this.current_line =
										this.__lines[this.__lines.length - 1]),
									this.current_line.trim();
							this.previous_line =
								this.__lines.length > 1
									? this.__lines[this.__lines.length - 2]
									: null;
						}),
						(l.prototype.just_added_newline = function () {
							return this.current_line.is_empty();
						}),
						(l.prototype.just_added_blankline = function () {
							return (
								this.is_empty() ||
								(this.current_line.is_empty() &&
									this.previous_line.is_empty())
							);
						}),
						(l.prototype.ensure_empty_line_above = function (a, u) {
							for (var c = this.__lines.length - 2; c >= 0; ) {
								var d = this.__lines[c];
								if (d.is_empty()) break;
								if (
									d.item(0).indexOf(a) !== 0 &&
									d.item(-1) !== u
								) {
									this.__lines.splice(c + 1, 0, new s(this)),
										(this.previous_line =
											this.__lines[
												this.__lines.length - 2
											]);
									break;
								}
								c--;
							}
						}),
						(r.exports.Output = l);
				},
				,
				,
				,
				function (r) {
					function s(a, u) {
						(this.raw_options = o(a, u)),
							(this.disabled = this._get_boolean("disabled")),
							(this.eol = this._get_characters("eol", "auto")),
							(this.end_with_newline =
								this._get_boolean("end_with_newline")),
							(this.indent_size = this._get_number(
								"indent_size",
								4,
							)),
							(this.indent_char = this._get_characters(
								"indent_char",
								" ",
							)),
							(this.indent_level =
								this._get_number("indent_level")),
							(this.preserve_newlines = this._get_boolean(
								"preserve_newlines",
								!0,
							)),
							(this.max_preserve_newlines = this._get_number(
								"max_preserve_newlines",
								32786,
							)),
							this.preserve_newlines ||
								(this.max_preserve_newlines = 0),
							(this.indent_with_tabs = this._get_boolean(
								"indent_with_tabs",
								this.indent_char === "	",
							)),
							this.indent_with_tabs &&
								((this.indent_char = "	"),
								this.indent_size === 1 &&
									(this.indent_size = 4)),
							(this.wrap_line_length = this._get_number(
								"wrap_line_length",
								this._get_number("max_char"),
							)),
							(this.indent_empty_lines =
								this._get_boolean("indent_empty_lines")),
							(this.templating = this._get_selection_list(
								"templating",
								[
									"auto",
									"none",
									"angular",
									"django",
									"erb",
									"handlebars",
									"php",
									"smarty",
								],
								["auto"],
							));
					}
					(s.prototype._get_array = function (a, u) {
						var c = this.raw_options[a],
							d = u || [];
						return (
							typeof c == "object"
								? c !== null &&
									typeof c.concat == "function" &&
									(d = c.concat())
								: typeof c == "string" &&
									(d = c.split(/[^a-zA-Z0-9_\/\-]+/)),
							d
						);
					}),
						(s.prototype._get_boolean = function (a, u) {
							var c = this.raw_options[a],
								d = c === void 0 ? !!u : !!c;
							return d;
						}),
						(s.prototype._get_characters = function (a, u) {
							var c = this.raw_options[a],
								d = u || "";
							return (
								typeof c == "string" &&
									(d = c
										.replace(/\\r/, "\r")
										.replace(
											/\\n/,
											`
`,
										)
										.replace(/\\t/, "	")),
								d
							);
						}),
						(s.prototype._get_number = function (a, u) {
							var c = this.raw_options[a];
							(u = parseInt(u, 10)), isNaN(u) && (u = 0);
							var d = parseInt(c, 10);
							return isNaN(d) && (d = u), d;
						}),
						(s.prototype._get_selection = function (a, u, c) {
							var d = this._get_selection_list(a, u, c);
							if (d.length !== 1)
								throw new Error(
									"Invalid Option Value: The option '" +
										a +
										`' can only be one of the following values:
` +
										u +
										`
You passed in: '` +
										this.raw_options[a] +
										"'",
								);
							return d[0];
						}),
						(s.prototype._get_selection_list = function (a, u, c) {
							if (!u || u.length === 0)
								throw new Error(
									"Selection list cannot be empty.",
								);
							if (
								((c = c || [u[0]]),
								!this._is_valid_selection(c, u))
							)
								throw new Error("Invalid Default Value!");
							var d = this._get_array(a, c);
							if (!this._is_valid_selection(d, u))
								throw new Error(
									"Invalid Option Value: The option '" +
										a +
										`' can contain only the following values:
` +
										u +
										`
You passed in: '` +
										this.raw_options[a] +
										"'",
								);
							return d;
						}),
						(s.prototype._is_valid_selection = function (a, u) {
							return (
								a.length &&
								u.length &&
								!a.some(function (c) {
									return u.indexOf(c) === -1;
								})
							);
						});
					function o(a, u) {
						var c = {};
						a = l(a);
						var d;
						for (d in a) d !== u && (c[d] = a[d]);
						if (u && a[u]) for (d in a[u]) c[d] = a[u][d];
						return c;
					}
					function l(a) {
						var u = {},
							c;
						for (c in a) {
							var d = c.replace(/-/g, "_");
							u[d] = a[c];
						}
						return u;
					}
					(r.exports.Options = s),
						(r.exports.normalizeOpts = l),
						(r.exports.mergeOpts = o);
				},
				,
				function (r) {
					var s = RegExp.prototype.hasOwnProperty("sticky");
					function o(l) {
						(this.__input = l || ""),
							(this.__input_length = this.__input.length),
							(this.__position = 0);
					}
					(o.prototype.restart = function () {
						this.__position = 0;
					}),
						(o.prototype.back = function () {
							this.__position > 0 && (this.__position -= 1);
						}),
						(o.prototype.hasNext = function () {
							return this.__position < this.__input_length;
						}),
						(o.prototype.next = function () {
							var l = null;
							return (
								this.hasNext() &&
									((l = this.__input.charAt(this.__position)),
									(this.__position += 1)),
								l
							);
						}),
						(o.prototype.peek = function (l) {
							var a = null;
							return (
								(l = l || 0),
								(l += this.__position),
								l >= 0 &&
									l < this.__input_length &&
									(a = this.__input.charAt(l)),
								a
							);
						}),
						(o.prototype.__match = function (l, a) {
							l.lastIndex = a;
							var u = l.exec(this.__input);
							return (
								u &&
									!(s && l.sticky) &&
									u.index !== a &&
									(u = null),
								u
							);
						}),
						(o.prototype.test = function (l, a) {
							return (
								(a = a || 0),
								(a += this.__position),
								a >= 0 && a < this.__input_length
									? !!this.__match(l, a)
									: !1
							);
						}),
						(o.prototype.testChar = function (l, a) {
							var u = this.peek(a);
							return (l.lastIndex = 0), u !== null && l.test(u);
						}),
						(o.prototype.match = function (l) {
							var a = this.__match(l, this.__position);
							return (
								a
									? (this.__position += a[0].length)
									: (a = null),
								a
							);
						}),
						(o.prototype.read = function (l, a, u) {
							var c = "",
								d;
							return (
								l && ((d = this.match(l)), d && (c += d[0])),
								a && (d || !l) && (c += this.readUntil(a, u)),
								c
							);
						}),
						(o.prototype.readUntil = function (l, a) {
							var u = "",
								c = this.__position;
							l.lastIndex = this.__position;
							var d = l.exec(this.__input);
							return (
								d
									? ((c = d.index), a && (c += d[0].length))
									: (c = this.__input_length),
								(u = this.__input.substring(
									this.__position,
									c,
								)),
								(this.__position = c),
								u
							);
						}),
						(o.prototype.readUntilAfter = function (l) {
							return this.readUntil(l, !0);
						}),
						(o.prototype.get_regexp = function (l, a) {
							var u = null,
								c = "g";
							return (
								a && s && (c = "y"),
								typeof l == "string" && l !== ""
									? (u = new RegExp(l, c))
									: l && (u = new RegExp(l.source, c)),
								u
							);
						}),
						(o.prototype.get_literal_regexp = function (l) {
							return RegExp(
								l.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&"),
							);
						}),
						(o.prototype.peekUntilAfter = function (l) {
							var a = this.__position,
								u = this.readUntilAfter(l);
							return (this.__position = a), u;
						}),
						(o.prototype.lookBack = function (l) {
							var a = this.__position - 1;
							return (
								a >= l.length &&
								this.__input
									.substring(a - l.length, a)
									.toLowerCase() === l
							);
						}),
						(r.exports.InputScanner = o);
				},
				,
				,
				,
				,
				function (r) {
					function s(o, l) {
						(o = typeof o == "string" ? o : o.source),
							(l = typeof l == "string" ? l : l.source),
							(this.__directives_block_pattern = new RegExp(
								o + / beautify( \w+[:]\w+)+ /.source + l,
								"g",
							)),
							(this.__directive_pattern = / (\w+)[:](\w+)/g),
							(this.__directives_end_ignore_pattern = new RegExp(
								o + /\sbeautify\signore:end\s/.source + l,
								"g",
							));
					}
					(s.prototype.get_directives = function (o) {
						if (!o.match(this.__directives_block_pattern))
							return null;
						var l = {};
						this.__directive_pattern.lastIndex = 0;
						for (var a = this.__directive_pattern.exec(o); a; )
							(l[a[1]] = a[2]),
								(a = this.__directive_pattern.exec(o));
						return l;
					}),
						(s.prototype.readIgnored = function (o) {
							return o.readUntilAfter(
								this.__directives_end_ignore_pattern,
							);
						}),
						(r.exports.Directives = s);
				},
				,
				function (r, s, o) {
					var l = o(16).Beautifier,
						a = o(17).Options;
					function u(c, d) {
						var m = new l(c, d);
						return m.beautify();
					}
					(r.exports = u),
						(r.exports.defaultOptions = function () {
							return new a();
						});
				},
				function (r, s, o) {
					var l = o(17).Options,
						a = o(2).Output,
						u = o(8).InputScanner,
						c = o(13).Directives,
						d = new c(/\/\*/, /\*\//),
						m = /\r\n|[\r\n]/,
						f = /\r\n|[\r\n]/g,
						w = /\s/,
						g = /(?:\s|\n)+/g,
						k = /\/\*(?:[\s\S]*?)((?:\*\/)|$)/g,
						v = /\/\/(?:[^\n\r\u2028\u2029]*)/g;
					function y(E, R) {
						(this._source_text = E || ""),
							(this._options = new l(R)),
							(this._ch = null),
							(this._input = null),
							(this.NESTED_AT_RULE = {
								page: !0,
								"font-face": !0,
								keyframes: !0,
								media: !0,
								supports: !0,
								document: !0,
							}),
							(this.CONDITIONAL_GROUP_RULE = {
								media: !0,
								supports: !0,
								document: !0,
							}),
							(this.NON_SEMICOLON_NEWLINE_PROPERTY = [
								"grid-template-areas",
								"grid-template",
							]);
					}
					(y.prototype.eatString = function (E) {
						var R = "";
						for (this._ch = this._input.next(); this._ch; ) {
							if (((R += this._ch), this._ch === "\\"))
								R += this._input.next();
							else if (
								E.indexOf(this._ch) !== -1 ||
								this._ch ===
									`
`
							)
								break;
							this._ch = this._input.next();
						}
						return R;
					}),
						(y.prototype.eatWhitespace = function (E) {
							for (
								var R = w.test(this._input.peek()), N = 0;
								w.test(this._input.peek());
							)
								(this._ch = this._input.next()),
									E &&
										this._ch ===
											`
` &&
										(N === 0 ||
											N <
												this._options
													.max_preserve_newlines) &&
										(N++, this._output.add_new_line(!0));
							return R;
						}),
						(y.prototype.foundNestedPseudoClass = function () {
							for (
								var E = 0, R = 1, N = this._input.peek(R);
								N;
							) {
								if (N === "{") return !0;
								if (N === "(") E += 1;
								else if (N === ")") {
									if (E === 0) return !1;
									E -= 1;
								} else if (N === ";" || N === "}") return !1;
								R++, (N = this._input.peek(R));
							}
							return !1;
						}),
						(y.prototype.print_string = function (E) {
							this._output.set_indent(this._indentLevel),
								(this._output.non_breaking_space = !0),
								this._output.add_token(E);
						}),
						(y.prototype.preserveSingleSpace = function (E) {
							E && (this._output.space_before_token = !0);
						}),
						(y.prototype.indent = function () {
							this._indentLevel++;
						}),
						(y.prototype.outdent = function () {
							this._indentLevel > 0 && this._indentLevel--;
						}),
						(y.prototype.beautify = function () {
							if (this._options.disabled)
								return this._source_text;
							var E = this._source_text,
								R = this._options.eol;
							R === "auto" &&
								((R = `
`),
								E && m.test(E || "") && (R = E.match(m)[0])),
								(E = E.replace(
									f,
									`
`,
								));
							var N = E.match(/^[\t ]*/)[0];
							(this._output = new a(this._options, N)),
								(this._input = new u(E)),
								(this._indentLevel = 0),
								(this._nestedLevel = 0),
								(this._ch = null);
							for (
								var M = 0,
									b = !1,
									p = !1,
									T = !1,
									H = !1,
									L = !1,
									_ = this._ch,
									A = !1,
									x,
									S,
									D;
								(x = this._input.read(g)),
									(S = x !== ""),
									(D = _),
									(this._ch = this._input.next()),
									this._ch === "\\" &&
										this._input.hasNext() &&
										(this._ch += this._input.next()),
									(_ = this._ch),
									this._ch;
							)
								if (
									this._ch === "/" &&
									this._input.peek() === "*"
								) {
									this._output.add_new_line(),
										this._input.back();
									var I = this._input.read(k),
										F = d.get_directives(I);
									F &&
										F.ignore === "start" &&
										(I += d.readIgnored(this._input)),
										this.print_string(I),
										this.eatWhitespace(!0),
										this._output.add_new_line();
								} else if (
									this._ch === "/" &&
									this._input.peek() === "/"
								)
									(this._output.space_before_token = !0),
										this._input.back(),
										this.print_string(this._input.read(v)),
										this.eatWhitespace(!0);
								else if (this._ch === "$") {
									this.preserveSingleSpace(S),
										this.print_string(this._ch);
									var W =
										this._input.peekUntilAfter(
											/[: ,;{}()[\]\/='"]/g,
										);
									W.match(/[ :]$/) &&
										((W = this.eatString(": ").replace(
											/\s+$/,
											"",
										)),
										this.print_string(W),
										(this._output.space_before_token = !0)),
										M === 0 &&
											W.indexOf(":") !== -1 &&
											((p = !0), this.indent());
								} else if (this._ch === "@")
									if (
										(this.preserveSingleSpace(S),
										this._input.peek() === "{")
									)
										this.print_string(
											this._ch + this.eatString("}"),
										);
									else {
										this.print_string(this._ch);
										var U =
											this._input.peekUntilAfter(
												/[: ,;{}()[\]\/='"]/g,
											);
										U.match(/[ :]$/) &&
											((U = this.eatString(": ").replace(
												/\s+$/,
												"",
											)),
											this.print_string(U),
											(this._output.space_before_token =
												!0)),
											M === 0 && U.indexOf(":") !== -1
												? ((p = !0), this.indent())
												: U in this.NESTED_AT_RULE
													? ((this._nestedLevel += 1),
														U in
															this
																.CONDITIONAL_GROUP_RULE &&
															(T = !0))
													: M === 0 && !p && (H = !0);
									}
								else if (
									this._ch === "#" &&
									this._input.peek() === "{"
								)
									this.preserveSingleSpace(S),
										this.print_string(
											this._ch + this.eatString("}"),
										);
								else if (this._ch === "{")
									p && ((p = !1), this.outdent()),
										(H = !1),
										T
											? ((T = !1),
												(b =
													this._indentLevel >=
													this._nestedLevel))
											: (b =
													this._indentLevel >=
													this._nestedLevel - 1),
										this._options.newline_between_rules &&
											b &&
											this._output.previous_line &&
											this._output.previous_line.item(
												-1,
											) !== "{" &&
											this._output.ensure_empty_line_above(
												"/",
												",",
											),
										(this._output.space_before_token = !0),
										this._options.brace_style === "expand"
											? (this._output.add_new_line(),
												this.print_string(this._ch),
												this.indent(),
												this._output.set_indent(
													this._indentLevel,
												))
											: (D === "("
													? (this._output.space_before_token =
															!1)
													: D !== "," &&
														this.indent(),
												this.print_string(this._ch)),
										this.eatWhitespace(!0),
										this._output.add_new_line();
								else if (this._ch === "}")
									this.outdent(),
										this._output.add_new_line(),
										D === "{" && this._output.trim(!0),
										p && (this.outdent(), (p = !1)),
										this.print_string(this._ch),
										(b = !1),
										this._nestedLevel &&
											this._nestedLevel--,
										this.eatWhitespace(!0),
										this._output.add_new_line(),
										this._options.newline_between_rules &&
											!this._output.just_added_blankline() &&
											this._input.peek() !== "}" &&
											this._output.add_new_line(!0),
										this._input.peek() === ")" &&
											(this._output.trim(!0),
											this._options.brace_style ===
												"expand" &&
												this._output.add_new_line(!0));
								else if (this._ch === ":") {
									for (
										var V = 0;
										V <
										this.NON_SEMICOLON_NEWLINE_PROPERTY
											.length;
										V++
									)
										if (
											this._input.lookBack(
												this
													.NON_SEMICOLON_NEWLINE_PROPERTY[
													V
												],
											)
										) {
											A = !0;
											break;
										}
									(b || T) &&
									!(
										this._input.lookBack("&") ||
										this.foundNestedPseudoClass()
									) &&
									!this._input.lookBack("(") &&
									!H &&
									M === 0
										? (this.print_string(":"),
											p ||
												((p = !0),
												(this._output.space_before_token =
													!0),
												this.eatWhitespace(!0),
												this.indent()))
										: (this._input.lookBack(" ") &&
												(this._output.space_before_token =
													!0),
											this._input.peek() === ":"
												? ((this._ch =
														this._input.next()),
													this.print_string("::"))
												: this.print_string(":"));
								} else if (
									this._ch === '"' ||
									this._ch === "'"
								) {
									var J = D === '"' || D === "'";
									this.preserveSingleSpace(J || S),
										this.print_string(
											this._ch + this.eatString(this._ch),
										),
										this.eatWhitespace(!0);
								} else if (this._ch === ";")
									(A = !1),
										M === 0
											? (p && (this.outdent(), (p = !1)),
												(H = !1),
												this.print_string(this._ch),
												this.eatWhitespace(!0),
												this._input.peek() !== "/" &&
													this._output.add_new_line())
											: (this.print_string(this._ch),
												this.eatWhitespace(!0),
												(this._output.space_before_token =
													!0));
								else if (this._ch === "(")
									if (this._input.lookBack("url"))
										this.print_string(this._ch),
											this.eatWhitespace(),
											M++,
											this.indent(),
											(this._ch = this._input.next()),
											this._ch === ")" ||
											this._ch === '"' ||
											this._ch === "'"
												? this._input.back()
												: this._ch &&
													(this.print_string(
														this._ch +
															this.eatString(")"),
													),
													M && (M--, this.outdent()));
									else {
										var se = !1;
										this._input.lookBack("with") &&
											(se = !0),
											this.preserveSingleSpace(S || se),
											this.print_string(this._ch),
											p &&
											D === "$" &&
											this._options
												.selector_separator_newline
												? (this._output.add_new_line(),
													(L = !0))
												: (this.eatWhitespace(),
													M++,
													this.indent());
									}
								else if (this._ch === ")")
									M && (M--, this.outdent()),
										L &&
											this._input.peek() === ";" &&
											this._options
												.selector_separator_newline &&
											((L = !1),
											this.outdent(),
											this._output.add_new_line()),
										this.print_string(this._ch);
								else if (this._ch === ",")
									this.print_string(this._ch),
										this.eatWhitespace(!0),
										this._options
											.selector_separator_newline &&
										(!p || L) &&
										M === 0 &&
										!H
											? this._output.add_new_line()
											: (this._output.space_before_token =
													!0);
								else if (
									(this._ch === ">" ||
										this._ch === "+" ||
										this._ch === "~") &&
									!p &&
									M === 0
								)
									this._options.space_around_combinator
										? ((this._output.space_before_token =
												!0),
											this.print_string(this._ch),
											(this._output.space_before_token =
												!0))
										: (this.print_string(this._ch),
											this.eatWhitespace(),
											this._ch &&
												w.test(this._ch) &&
												(this._ch = ""));
								else if (this._ch === "]")
									this.print_string(this._ch);
								else if (this._ch === "[")
									this.preserveSingleSpace(S),
										this.print_string(this._ch);
								else if (this._ch === "=")
									this.eatWhitespace(),
										this.print_string("="),
										w.test(this._ch) && (this._ch = "");
								else if (
									this._ch === "!" &&
									!this._input.lookBack("\\")
								)
									(this._output.space_before_token = !0),
										this.print_string(this._ch);
								else {
									var Be = D === '"' || D === "'";
									this.preserveSingleSpace(Be || S),
										this.print_string(this._ch),
										!this._output.just_added_newline() &&
											this._input.peek() ===
												`
` &&
											A &&
											this._output.add_new_line();
								}
							var lt = this._output.get_code(R);
							return lt;
						}),
						(r.exports.Beautifier = y);
				},
				function (r, s, o) {
					var l = o(6).Options;
					function a(u) {
						l.call(this, u, "css"),
							(this.selector_separator_newline =
								this._get_boolean(
									"selector_separator_newline",
									!0,
								)),
							(this.newline_between_rules = this._get_boolean(
								"newline_between_rules",
								!0,
							));
						var c = this._get_boolean(
							"space_around_selector_separator",
						);
						this.space_around_combinator =
							this._get_boolean("space_around_combinator") || c;
						var d = this._get_selection_list("brace_style", [
							"collapse",
							"expand",
							"end-expand",
							"none",
							"preserve-inline",
						]);
						this.brace_style = "collapse";
						for (var m = 0; m < d.length; m++)
							d[m] !== "expand"
								? (this.brace_style = "collapse")
								: (this.brace_style = d[m]);
					}
					(a.prototype = new l()), (r.exports.Options = a);
				},
			],
			t = {};
		function n(r) {
			var s = t[r];
			if (s !== void 0) return s.exports;
			var o = (t[r] = { exports: {} });
			return e[r](o, o.exports, n), o.exports;
		}
		var i = n(15);
		ya = i;
	})();
	var Gu = ya,
		xa;
	(function () {
		var e = [
				,
				,
				function (r) {
					function s(a) {
						(this.__parent = a),
							(this.__character_count = 0),
							(this.__indent_count = -1),
							(this.__alignment_count = 0),
							(this.__wrap_point_index = 0),
							(this.__wrap_point_character_count = 0),
							(this.__wrap_point_indent_count = -1),
							(this.__wrap_point_alignment_count = 0),
							(this.__items = []);
					}
					(s.prototype.clone_empty = function () {
						var a = new s(this.__parent);
						return (
							a.set_indent(
								this.__indent_count,
								this.__alignment_count,
							),
							a
						);
					}),
						(s.prototype.item = function (a) {
							return a < 0
								? this.__items[this.__items.length + a]
								: this.__items[a];
						}),
						(s.prototype.has_match = function (a) {
							for (var u = this.__items.length - 1; u >= 0; u--)
								if (this.__items[u].match(a)) return !0;
							return !1;
						}),
						(s.prototype.set_indent = function (a, u) {
							this.is_empty() &&
								((this.__indent_count = a || 0),
								(this.__alignment_count = u || 0),
								(this.__character_count =
									this.__parent.get_indent_size(
										this.__indent_count,
										this.__alignment_count,
									)));
						}),
						(s.prototype._set_wrap_point = function () {
							this.__parent.wrap_line_length &&
								((this.__wrap_point_index =
									this.__items.length),
								(this.__wrap_point_character_count =
									this.__character_count),
								(this.__wrap_point_indent_count =
									this.__parent.next_line.__indent_count),
								(this.__wrap_point_alignment_count =
									this.__parent.next_line.__alignment_count));
						}),
						(s.prototype._should_wrap = function () {
							return (
								this.__wrap_point_index &&
								this.__character_count >
									this.__parent.wrap_line_length &&
								this.__wrap_point_character_count >
									this.__parent.next_line.__character_count
							);
						}),
						(s.prototype._allow_wrap = function () {
							if (this._should_wrap()) {
								this.__parent.add_new_line();
								var a = this.__parent.current_line;
								return (
									a.set_indent(
										this.__wrap_point_indent_count,
										this.__wrap_point_alignment_count,
									),
									(a.__items = this.__items.slice(
										this.__wrap_point_index,
									)),
									(this.__items = this.__items.slice(
										0,
										this.__wrap_point_index,
									)),
									(a.__character_count +=
										this.__character_count -
										this.__wrap_point_character_count),
									(this.__character_count =
										this.__wrap_point_character_count),
									a.__items[0] === " " &&
										(a.__items.splice(0, 1),
										(a.__character_count -= 1)),
									!0
								);
							}
							return !1;
						}),
						(s.prototype.is_empty = function () {
							return this.__items.length === 0;
						}),
						(s.prototype.last = function () {
							return this.is_empty()
								? null
								: this.__items[this.__items.length - 1];
						}),
						(s.prototype.push = function (a) {
							this.__items.push(a);
							var u = a.lastIndexOf(`
`);
							u !== -1
								? (this.__character_count = a.length - u)
								: (this.__character_count += a.length);
						}),
						(s.prototype.pop = function () {
							var a = null;
							return (
								this.is_empty() ||
									((a = this.__items.pop()),
									(this.__character_count -= a.length)),
								a
							);
						}),
						(s.prototype._remove_indent = function () {
							this.__indent_count > 0 &&
								((this.__indent_count -= 1),
								(this.__character_count -=
									this.__parent.indent_size));
						}),
						(s.prototype._remove_wrap_indent = function () {
							this.__wrap_point_indent_count > 0 &&
								(this.__wrap_point_indent_count -= 1);
						}),
						(s.prototype.trim = function () {
							for (; this.last() === " "; )
								this.__items.pop(),
									(this.__character_count -= 1);
						}),
						(s.prototype.toString = function () {
							var a = "";
							return (
								this.is_empty()
									? this.__parent.indent_empty_lines &&
										(a = this.__parent.get_indent_string(
											this.__indent_count,
										))
									: ((a = this.__parent.get_indent_string(
											this.__indent_count,
											this.__alignment_count,
										)),
										(a += this.__items.join(""))),
								a
							);
						});
					function o(a, u) {
						(this.__cache = [""]),
							(this.__indent_size = a.indent_size),
							(this.__indent_string = a.indent_char),
							a.indent_with_tabs ||
								(this.__indent_string = new Array(
									a.indent_size + 1,
								).join(a.indent_char)),
							(u = u || ""),
							a.indent_level > 0 &&
								(u = new Array(a.indent_level + 1).join(
									this.__indent_string,
								)),
							(this.__base_string = u),
							(this.__base_string_length = u.length);
					}
					(o.prototype.get_indent_size = function (a, u) {
						var c = this.__base_string_length;
						return (
							(u = u || 0),
							a < 0 && (c = 0),
							(c += a * this.__indent_size),
							(c += u),
							c
						);
					}),
						(o.prototype.get_indent_string = function (a, u) {
							var c = this.__base_string;
							return (
								(u = u || 0),
								a < 0 && ((a = 0), (c = "")),
								(u += a * this.__indent_size),
								this.__ensure_cache(u),
								(c += this.__cache[u]),
								c
							);
						}),
						(o.prototype.__ensure_cache = function (a) {
							for (; a >= this.__cache.length; )
								this.__add_column();
						}),
						(o.prototype.__add_column = function () {
							var a = this.__cache.length,
								u = 0,
								c = "";
							this.__indent_size &&
								a >= this.__indent_size &&
								((u = Math.floor(a / this.__indent_size)),
								(a -= u * this.__indent_size),
								(c = new Array(u + 1).join(
									this.__indent_string,
								))),
								a && (c += new Array(a + 1).join(" ")),
								this.__cache.push(c);
						});
					function l(a, u) {
						(this.__indent_cache = new o(a, u)),
							(this.raw = !1),
							(this._end_with_newline = a.end_with_newline),
							(this.indent_size = a.indent_size),
							(this.wrap_line_length = a.wrap_line_length),
							(this.indent_empty_lines = a.indent_empty_lines),
							(this.__lines = []),
							(this.previous_line = null),
							(this.current_line = null),
							(this.next_line = new s(this)),
							(this.space_before_token = !1),
							(this.non_breaking_space = !1),
							(this.previous_token_wrapped = !1),
							this.__add_outputline();
					}
					(l.prototype.__add_outputline = function () {
						(this.previous_line = this.current_line),
							(this.current_line = this.next_line.clone_empty()),
							this.__lines.push(this.current_line);
					}),
						(l.prototype.get_line_number = function () {
							return this.__lines.length;
						}),
						(l.prototype.get_indent_string = function (a, u) {
							return this.__indent_cache.get_indent_string(a, u);
						}),
						(l.prototype.get_indent_size = function (a, u) {
							return this.__indent_cache.get_indent_size(a, u);
						}),
						(l.prototype.is_empty = function () {
							return (
								!this.previous_line &&
								this.current_line.is_empty()
							);
						}),
						(l.prototype.add_new_line = function (a) {
							return this.is_empty() ||
								(!a && this.just_added_newline())
								? !1
								: (this.raw || this.__add_outputline(), !0);
						}),
						(l.prototype.get_code = function (a) {
							this.trim(!0);
							var u = this.current_line.pop();
							u &&
								(u[u.length - 1] ===
									`
` && (u = u.replace(/\n+$/g, "")),
								this.current_line.push(u)),
								this._end_with_newline &&
									this.__add_outputline();
							var c = this.__lines.join(`
`);
							return (
								a !==
									`
` && (c = c.replace(/[\n]/g, a)),
								c
							);
						}),
						(l.prototype.set_wrap_point = function () {
							this.current_line._set_wrap_point();
						}),
						(l.prototype.set_indent = function (a, u) {
							return (
								(a = a || 0),
								(u = u || 0),
								this.next_line.set_indent(a, u),
								this.__lines.length > 1
									? (this.current_line.set_indent(a, u), !0)
									: (this.current_line.set_indent(), !1)
							);
						}),
						(l.prototype.add_raw_token = function (a) {
							for (var u = 0; u < a.newlines; u++)
								this.__add_outputline();
							this.current_line.set_indent(-1),
								this.current_line.push(a.whitespace_before),
								this.current_line.push(a.text),
								(this.space_before_token = !1),
								(this.non_breaking_space = !1),
								(this.previous_token_wrapped = !1);
						}),
						(l.prototype.add_token = function (a) {
							this.__add_space_before_token(),
								this.current_line.push(a),
								(this.space_before_token = !1),
								(this.non_breaking_space = !1),
								(this.previous_token_wrapped =
									this.current_line._allow_wrap());
						}),
						(l.prototype.__add_space_before_token = function () {
							this.space_before_token &&
								!this.just_added_newline() &&
								(this.non_breaking_space ||
									this.set_wrap_point(),
								this.current_line.push(" "));
						}),
						(l.prototype.remove_indent = function (a) {
							for (var u = this.__lines.length; a < u; )
								this.__lines[a]._remove_indent(), a++;
							this.current_line._remove_wrap_indent();
						}),
						(l.prototype.trim = function (a) {
							for (
								a = a === void 0 ? !1 : a,
									this.current_line.trim();
								a &&
								this.__lines.length > 1 &&
								this.current_line.is_empty();
							)
								this.__lines.pop(),
									(this.current_line =
										this.__lines[this.__lines.length - 1]),
									this.current_line.trim();
							this.previous_line =
								this.__lines.length > 1
									? this.__lines[this.__lines.length - 2]
									: null;
						}),
						(l.prototype.just_added_newline = function () {
							return this.current_line.is_empty();
						}),
						(l.prototype.just_added_blankline = function () {
							return (
								this.is_empty() ||
								(this.current_line.is_empty() &&
									this.previous_line.is_empty())
							);
						}),
						(l.prototype.ensure_empty_line_above = function (a, u) {
							for (var c = this.__lines.length - 2; c >= 0; ) {
								var d = this.__lines[c];
								if (d.is_empty()) break;
								if (
									d.item(0).indexOf(a) !== 0 &&
									d.item(-1) !== u
								) {
									this.__lines.splice(c + 1, 0, new s(this)),
										(this.previous_line =
											this.__lines[
												this.__lines.length - 2
											]);
									break;
								}
								c--;
							}
						}),
						(r.exports.Output = l);
				},
				function (r) {
					function s(o, l, a, u) {
						(this.type = o),
							(this.text = l),
							(this.comments_before = null),
							(this.newlines = a || 0),
							(this.whitespace_before = u || ""),
							(this.parent = null),
							(this.next = null),
							(this.previous = null),
							(this.opened = null),
							(this.closed = null),
							(this.directives = null);
					}
					r.exports.Token = s;
				},
				,
				,
				function (r) {
					function s(a, u) {
						(this.raw_options = o(a, u)),
							(this.disabled = this._get_boolean("disabled")),
							(this.eol = this._get_characters("eol", "auto")),
							(this.end_with_newline =
								this._get_boolean("end_with_newline")),
							(this.indent_size = this._get_number(
								"indent_size",
								4,
							)),
							(this.indent_char = this._get_characters(
								"indent_char",
								" ",
							)),
							(this.indent_level =
								this._get_number("indent_level")),
							(this.preserve_newlines = this._get_boolean(
								"preserve_newlines",
								!0,
							)),
							(this.max_preserve_newlines = this._get_number(
								"max_preserve_newlines",
								32786,
							)),
							this.preserve_newlines ||
								(this.max_preserve_newlines = 0),
							(this.indent_with_tabs = this._get_boolean(
								"indent_with_tabs",
								this.indent_char === "	",
							)),
							this.indent_with_tabs &&
								((this.indent_char = "	"),
								this.indent_size === 1 &&
									(this.indent_size = 4)),
							(this.wrap_line_length = this._get_number(
								"wrap_line_length",
								this._get_number("max_char"),
							)),
							(this.indent_empty_lines =
								this._get_boolean("indent_empty_lines")),
							(this.templating = this._get_selection_list(
								"templating",
								[
									"auto",
									"none",
									"angular",
									"django",
									"erb",
									"handlebars",
									"php",
									"smarty",
								],
								["auto"],
							));
					}
					(s.prototype._get_array = function (a, u) {
						var c = this.raw_options[a],
							d = u || [];
						return (
							typeof c == "object"
								? c !== null &&
									typeof c.concat == "function" &&
									(d = c.concat())
								: typeof c == "string" &&
									(d = c.split(/[^a-zA-Z0-9_\/\-]+/)),
							d
						);
					}),
						(s.prototype._get_boolean = function (a, u) {
							var c = this.raw_options[a],
								d = c === void 0 ? !!u : !!c;
							return d;
						}),
						(s.prototype._get_characters = function (a, u) {
							var c = this.raw_options[a],
								d = u || "";
							return (
								typeof c == "string" &&
									(d = c
										.replace(/\\r/, "\r")
										.replace(
											/\\n/,
											`
`,
										)
										.replace(/\\t/, "	")),
								d
							);
						}),
						(s.prototype._get_number = function (a, u) {
							var c = this.raw_options[a];
							(u = parseInt(u, 10)), isNaN(u) && (u = 0);
							var d = parseInt(c, 10);
							return isNaN(d) && (d = u), d;
						}),
						(s.prototype._get_selection = function (a, u, c) {
							var d = this._get_selection_list(a, u, c);
							if (d.length !== 1)
								throw new Error(
									"Invalid Option Value: The option '" +
										a +
										`' can only be one of the following values:
` +
										u +
										`
You passed in: '` +
										this.raw_options[a] +
										"'",
								);
							return d[0];
						}),
						(s.prototype._get_selection_list = function (a, u, c) {
							if (!u || u.length === 0)
								throw new Error(
									"Selection list cannot be empty.",
								);
							if (
								((c = c || [u[0]]),
								!this._is_valid_selection(c, u))
							)
								throw new Error("Invalid Default Value!");
							var d = this._get_array(a, c);
							if (!this._is_valid_selection(d, u))
								throw new Error(
									"Invalid Option Value: The option '" +
										a +
										`' can contain only the following values:
` +
										u +
										`
You passed in: '` +
										this.raw_options[a] +
										"'",
								);
							return d;
						}),
						(s.prototype._is_valid_selection = function (a, u) {
							return (
								a.length &&
								u.length &&
								!a.some(function (c) {
									return u.indexOf(c) === -1;
								})
							);
						});
					function o(a, u) {
						var c = {};
						a = l(a);
						var d;
						for (d in a) d !== u && (c[d] = a[d]);
						if (u && a[u]) for (d in a[u]) c[d] = a[u][d];
						return c;
					}
					function l(a) {
						var u = {},
							c;
						for (c in a) {
							var d = c.replace(/-/g, "_");
							u[d] = a[c];
						}
						return u;
					}
					(r.exports.Options = s),
						(r.exports.normalizeOpts = l),
						(r.exports.mergeOpts = o);
				},
				,
				function (r) {
					var s = RegExp.prototype.hasOwnProperty("sticky");
					function o(l) {
						(this.__input = l || ""),
							(this.__input_length = this.__input.length),
							(this.__position = 0);
					}
					(o.prototype.restart = function () {
						this.__position = 0;
					}),
						(o.prototype.back = function () {
							this.__position > 0 && (this.__position -= 1);
						}),
						(o.prototype.hasNext = function () {
							return this.__position < this.__input_length;
						}),
						(o.prototype.next = function () {
							var l = null;
							return (
								this.hasNext() &&
									((l = this.__input.charAt(this.__position)),
									(this.__position += 1)),
								l
							);
						}),
						(o.prototype.peek = function (l) {
							var a = null;
							return (
								(l = l || 0),
								(l += this.__position),
								l >= 0 &&
									l < this.__input_length &&
									(a = this.__input.charAt(l)),
								a
							);
						}),
						(o.prototype.__match = function (l, a) {
							l.lastIndex = a;
							var u = l.exec(this.__input);
							return (
								u &&
									!(s && l.sticky) &&
									u.index !== a &&
									(u = null),
								u
							);
						}),
						(o.prototype.test = function (l, a) {
							return (
								(a = a || 0),
								(a += this.__position),
								a >= 0 && a < this.__input_length
									? !!this.__match(l, a)
									: !1
							);
						}),
						(o.prototype.testChar = function (l, a) {
							var u = this.peek(a);
							return (l.lastIndex = 0), u !== null && l.test(u);
						}),
						(o.prototype.match = function (l) {
							var a = this.__match(l, this.__position);
							return (
								a
									? (this.__position += a[0].length)
									: (a = null),
								a
							);
						}),
						(o.prototype.read = function (l, a, u) {
							var c = "",
								d;
							return (
								l && ((d = this.match(l)), d && (c += d[0])),
								a && (d || !l) && (c += this.readUntil(a, u)),
								c
							);
						}),
						(o.prototype.readUntil = function (l, a) {
							var u = "",
								c = this.__position;
							l.lastIndex = this.__position;
							var d = l.exec(this.__input);
							return (
								d
									? ((c = d.index), a && (c += d[0].length))
									: (c = this.__input_length),
								(u = this.__input.substring(
									this.__position,
									c,
								)),
								(this.__position = c),
								u
							);
						}),
						(o.prototype.readUntilAfter = function (l) {
							return this.readUntil(l, !0);
						}),
						(o.prototype.get_regexp = function (l, a) {
							var u = null,
								c = "g";
							return (
								a && s && (c = "y"),
								typeof l == "string" && l !== ""
									? (u = new RegExp(l, c))
									: l && (u = new RegExp(l.source, c)),
								u
							);
						}),
						(o.prototype.get_literal_regexp = function (l) {
							return RegExp(
								l.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&"),
							);
						}),
						(o.prototype.peekUntilAfter = function (l) {
							var a = this.__position,
								u = this.readUntilAfter(l);
							return (this.__position = a), u;
						}),
						(o.prototype.lookBack = function (l) {
							var a = this.__position - 1;
							return (
								a >= l.length &&
								this.__input
									.substring(a - l.length, a)
									.toLowerCase() === l
							);
						}),
						(r.exports.InputScanner = o);
				},
				function (r, s, o) {
					var l = o(8).InputScanner,
						a = o(3).Token,
						u = o(10).TokenStream,
						c = o(11).WhitespacePattern,
						d = { START: "TK_START", RAW: "TK_RAW", EOF: "TK_EOF" },
						m = function (f, w) {
							(this._input = new l(f)),
								(this._options = w || {}),
								(this.__tokens = null),
								(this._patterns = {}),
								(this._patterns.whitespace = new c(
									this._input,
								));
						};
					(m.prototype.tokenize = function () {
						this._input.restart(),
							(this.__tokens = new u()),
							this._reset();
						for (
							var f,
								w = new a(d.START, ""),
								g = null,
								k = [],
								v = new u();
							w.type !== d.EOF;
						) {
							for (
								f = this._get_next_token(w, g);
								this._is_comment(f);
							)
								v.add(f), (f = this._get_next_token(w, g));
							v.isEmpty() ||
								((f.comments_before = v), (v = new u())),
								(f.parent = g),
								this._is_opening(f)
									? (k.push(g), (g = f))
									: g &&
										this._is_closing(f, g) &&
										((f.opened = g),
										(g.closed = f),
										(g = k.pop()),
										(f.parent = g)),
								(f.previous = w),
								(w.next = f),
								this.__tokens.add(f),
								(w = f);
						}
						return this.__tokens;
					}),
						(m.prototype._is_first_token = function () {
							return this.__tokens.isEmpty();
						}),
						(m.prototype._reset = function () {}),
						(m.prototype._get_next_token = function (f, w) {
							this._readWhitespace();
							var g = this._input.read(/.+/g);
							return g
								? this._create_token(d.RAW, g)
								: this._create_token(d.EOF, "");
						}),
						(m.prototype._is_comment = function (f) {
							return !1;
						}),
						(m.prototype._is_opening = function (f) {
							return !1;
						}),
						(m.prototype._is_closing = function (f, w) {
							return !1;
						}),
						(m.prototype._create_token = function (f, w) {
							var g = new a(
								f,
								w,
								this._patterns.whitespace.newline_count,
								this._patterns.whitespace
									.whitespace_before_token,
							);
							return g;
						}),
						(m.prototype._readWhitespace = function () {
							return this._patterns.whitespace.read();
						}),
						(r.exports.Tokenizer = m),
						(r.exports.TOKEN = d);
				},
				function (r) {
					function s(o) {
						(this.__tokens = []),
							(this.__tokens_length = this.__tokens.length),
							(this.__position = 0),
							(this.__parent_token = o);
					}
					(s.prototype.restart = function () {
						this.__position = 0;
					}),
						(s.prototype.isEmpty = function () {
							return this.__tokens_length === 0;
						}),
						(s.prototype.hasNext = function () {
							return this.__position < this.__tokens_length;
						}),
						(s.prototype.next = function () {
							var o = null;
							return (
								this.hasNext() &&
									((o = this.__tokens[this.__position]),
									(this.__position += 1)),
								o
							);
						}),
						(s.prototype.peek = function (o) {
							var l = null;
							return (
								(o = o || 0),
								(o += this.__position),
								o >= 0 &&
									o < this.__tokens_length &&
									(l = this.__tokens[o]),
								l
							);
						}),
						(s.prototype.add = function (o) {
							this.__parent_token &&
								(o.parent = this.__parent_token),
								this.__tokens.push(o),
								(this.__tokens_length += 1);
						}),
						(r.exports.TokenStream = s);
				},
				function (r, s, o) {
					var l = o(12).Pattern;
					function a(u, c) {
						l.call(this, u, c),
							c
								? (this._line_regexp = this._input.get_regexp(
										c._line_regexp,
									))
								: this.__set_whitespace_patterns("", ""),
							(this.newline_count = 0),
							(this.whitespace_before_token = "");
					}
					(a.prototype = new l()),
						(a.prototype.__set_whitespace_patterns = function (
							u,
							c,
						) {
							(u += "\\t "),
								(c += "\\n\\r"),
								(this._match_pattern = this._input.get_regexp(
									"[" + u + c + "]+",
									!0,
								)),
								(this._newline_regexp = this._input.get_regexp(
									"\\r\\n|[" + c + "]",
								));
						}),
						(a.prototype.read = function () {
							(this.newline_count = 0),
								(this.whitespace_before_token = "");
							var u = this._input.read(this._match_pattern);
							if (u === " ") this.whitespace_before_token = " ";
							else if (u) {
								var c = this.__split(this._newline_regexp, u);
								(this.newline_count = c.length - 1),
									(this.whitespace_before_token =
										c[this.newline_count]);
							}
							return u;
						}),
						(a.prototype.matching = function (u, c) {
							var d = this._create();
							return (
								d.__set_whitespace_patterns(u, c),
								d._update(),
								d
							);
						}),
						(a.prototype._create = function () {
							return new a(this._input, this);
						}),
						(a.prototype.__split = function (u, c) {
							u.lastIndex = 0;
							for (var d = 0, m = [], f = u.exec(c); f; )
								m.push(c.substring(d, f.index)),
									(d = f.index + f[0].length),
									(f = u.exec(c));
							return (
								d < c.length
									? m.push(c.substring(d, c.length))
									: m.push(""),
								m
							);
						}),
						(r.exports.WhitespacePattern = a);
				},
				function (r) {
					function s(o, l) {
						(this._input = o),
							(this._starting_pattern = null),
							(this._match_pattern = null),
							(this._until_pattern = null),
							(this._until_after = !1),
							l &&
								((this._starting_pattern =
									this._input.get_regexp(
										l._starting_pattern,
										!0,
									)),
								(this._match_pattern = this._input.get_regexp(
									l._match_pattern,
									!0,
								)),
								(this._until_pattern = this._input.get_regexp(
									l._until_pattern,
								)),
								(this._until_after = l._until_after));
					}
					(s.prototype.read = function () {
						var o = this._input.read(this._starting_pattern);
						return (
							(!this._starting_pattern || o) &&
								(o += this._input.read(
									this._match_pattern,
									this._until_pattern,
									this._until_after,
								)),
							o
						);
					}),
						(s.prototype.read_match = function () {
							return this._input.match(this._match_pattern);
						}),
						(s.prototype.until_after = function (o) {
							var l = this._create();
							return (
								(l._until_after = !0),
								(l._until_pattern = this._input.get_regexp(o)),
								l._update(),
								l
							);
						}),
						(s.prototype.until = function (o) {
							var l = this._create();
							return (
								(l._until_after = !1),
								(l._until_pattern = this._input.get_regexp(o)),
								l._update(),
								l
							);
						}),
						(s.prototype.starting_with = function (o) {
							var l = this._create();
							return (
								(l._starting_pattern = this._input.get_regexp(
									o,
									!0,
								)),
								l._update(),
								l
							);
						}),
						(s.prototype.matching = function (o) {
							var l = this._create();
							return (
								(l._match_pattern = this._input.get_regexp(
									o,
									!0,
								)),
								l._update(),
								l
							);
						}),
						(s.prototype._create = function () {
							return new s(this._input, this);
						}),
						(s.prototype._update = function () {}),
						(r.exports.Pattern = s);
				},
				function (r) {
					function s(o, l) {
						(o = typeof o == "string" ? o : o.source),
							(l = typeof l == "string" ? l : l.source),
							(this.__directives_block_pattern = new RegExp(
								o + / beautify( \w+[:]\w+)+ /.source + l,
								"g",
							)),
							(this.__directive_pattern = / (\w+)[:](\w+)/g),
							(this.__directives_end_ignore_pattern = new RegExp(
								o + /\sbeautify\signore:end\s/.source + l,
								"g",
							));
					}
					(s.prototype.get_directives = function (o) {
						if (!o.match(this.__directives_block_pattern))
							return null;
						var l = {};
						this.__directive_pattern.lastIndex = 0;
						for (var a = this.__directive_pattern.exec(o); a; )
							(l[a[1]] = a[2]),
								(a = this.__directive_pattern.exec(o));
						return l;
					}),
						(s.prototype.readIgnored = function (o) {
							return o.readUntilAfter(
								this.__directives_end_ignore_pattern,
							);
						}),
						(r.exports.Directives = s);
				},
				function (r, s, o) {
					var l = o(12).Pattern,
						a = {
							django: !1,
							erb: !1,
							handlebars: !1,
							php: !1,
							smarty: !1,
							angular: !1,
						};
					function u(c, d) {
						l.call(this, c, d),
							(this.__template_pattern = null),
							(this._disabled = Object.assign({}, a)),
							(this._excluded = Object.assign({}, a)),
							d &&
								((this.__template_pattern =
									this._input.get_regexp(
										d.__template_pattern,
									)),
								(this._excluded = Object.assign(
									this._excluded,
									d._excluded,
								)),
								(this._disabled = Object.assign(
									this._disabled,
									d._disabled,
								)));
						var m = new l(c);
						this.__patterns = {
							handlebars_comment: m
								.starting_with(/{{!--/)
								.until_after(/--}}/),
							handlebars_unescaped: m
								.starting_with(/{{{/)
								.until_after(/}}}/),
							handlebars: m.starting_with(/{{/).until_after(/}}/),
							php: m
								.starting_with(/<\?(?:[= ]|php)/)
								.until_after(/\?>/),
							erb: m
								.starting_with(/<%[^%]/)
								.until_after(/[^%]%>/),
							django: m.starting_with(/{%/).until_after(/%}/),
							django_value: m
								.starting_with(/{{/)
								.until_after(/}}/),
							django_comment: m
								.starting_with(/{#/)
								.until_after(/#}/),
							smarty: m
								.starting_with(/{(?=[^}{\s\n])/)
								.until_after(/[^\s\n]}/),
							smarty_comment: m
								.starting_with(/{\*/)
								.until_after(/\*}/),
							smarty_literal: m
								.starting_with(/{literal}/)
								.until_after(/{\/literal}/),
						};
					}
					(u.prototype = new l()),
						(u.prototype._create = function () {
							return new u(this._input, this);
						}),
						(u.prototype._update = function () {
							this.__set_templated_pattern();
						}),
						(u.prototype.disable = function (c) {
							var d = this._create();
							return (d._disabled[c] = !0), d._update(), d;
						}),
						(u.prototype.read_options = function (c) {
							var d = this._create();
							for (var m in a)
								d._disabled[m] = c.templating.indexOf(m) === -1;
							return d._update(), d;
						}),
						(u.prototype.exclude = function (c) {
							var d = this._create();
							return (d._excluded[c] = !0), d._update(), d;
						}),
						(u.prototype.read = function () {
							var c = "";
							this._match_pattern
								? (c = this._input.read(this._starting_pattern))
								: (c = this._input.read(
										this._starting_pattern,
										this.__template_pattern,
									));
							for (var d = this._read_template(); d; )
								this._match_pattern
									? (d += this._input.read(
											this._match_pattern,
										))
									: (d += this._input.readUntil(
											this.__template_pattern,
										)),
									(c += d),
									(d = this._read_template());
							return (
								this._until_after &&
									(c += this._input.readUntilAfter(
										this._until_pattern,
									)),
								c
							);
						}),
						(u.prototype.__set_templated_pattern = function () {
							var c = [];
							this._disabled.php ||
								c.push(
									this.__patterns.php._starting_pattern
										.source,
								),
								this._disabled.handlebars ||
									c.push(
										this.__patterns.handlebars
											._starting_pattern.source,
									),
								this._disabled.erb ||
									c.push(
										this.__patterns.erb._starting_pattern
											.source,
									),
								this._disabled.django ||
									(c.push(
										this.__patterns.django._starting_pattern
											.source,
									),
									c.push(
										this.__patterns.django_value
											._starting_pattern.source,
									),
									c.push(
										this.__patterns.django_comment
											._starting_pattern.source,
									)),
								this._disabled.smarty ||
									c.push(
										this.__patterns.smarty._starting_pattern
											.source,
									),
								this._until_pattern &&
									c.push(this._until_pattern.source),
								(this.__template_pattern =
									this._input.get_regexp(
										"(?:" + c.join("|") + ")",
									));
						}),
						(u.prototype._read_template = function () {
							var c = "",
								d = this._input.peek();
							if (d === "<") {
								var m = this._input.peek(1);
								!this._disabled.php &&
									!this._excluded.php &&
									m === "?" &&
									(c = c || this.__patterns.php.read()),
									!this._disabled.erb &&
										!this._excluded.erb &&
										m === "%" &&
										(c = c || this.__patterns.erb.read());
							} else
								d === "{" &&
									(!this._disabled.handlebars &&
										!this._excluded.handlebars &&
										((c =
											c ||
											this.__patterns.handlebars_comment.read()),
										(c =
											c ||
											this.__patterns.handlebars_unescaped.read()),
										(c =
											c ||
											this.__patterns.handlebars.read())),
									this._disabled.django ||
										(!this._excluded.django &&
											!this._excluded.handlebars &&
											(c =
												c ||
												this.__patterns.django_value.read()),
										this._excluded.django ||
											((c =
												c ||
												this.__patterns.django_comment.read()),
											(c =
												c ||
												this.__patterns.django.read()))),
									this._disabled.smarty ||
										(this._disabled.django &&
											this._disabled.handlebars &&
											((c =
												c ||
												this.__patterns.smarty_comment.read()),
											(c =
												c ||
												this.__patterns.smarty_literal.read()),
											(c =
												c ||
												this.__patterns.smarty.read()))));
							return c;
						}),
						(r.exports.TemplatablePattern = u);
				},
				,
				,
				,
				function (r, s, o) {
					var l = o(19).Beautifier,
						a = o(20).Options;
					function u(c, d, m, f) {
						var w = new l(c, d, m, f);
						return w.beautify();
					}
					(r.exports = u),
						(r.exports.defaultOptions = function () {
							return new a();
						});
				},
				function (r, s, o) {
					var l = o(20).Options,
						a = o(2).Output,
						u = o(21).Tokenizer,
						c = o(21).TOKEN,
						d = /\r\n|[\r\n]/,
						m = /\r\n|[\r\n]/g,
						f = function (b, p) {
							(this.indent_level = 0),
								(this.alignment_size = 0),
								(this.max_preserve_newlines =
									b.max_preserve_newlines),
								(this.preserve_newlines = b.preserve_newlines),
								(this._output = new a(b, p));
						};
					(f.prototype.current_line_has_match = function (b) {
						return this._output.current_line.has_match(b);
					}),
						(f.prototype.set_space_before_token = function (b, p) {
							(this._output.space_before_token = b),
								(this._output.non_breaking_space = p);
						}),
						(f.prototype.set_wrap_point = function () {
							this._output.set_indent(
								this.indent_level,
								this.alignment_size,
							),
								this._output.set_wrap_point();
						}),
						(f.prototype.add_raw_token = function (b) {
							this._output.add_raw_token(b);
						}),
						(f.prototype.print_preserved_newlines = function (b) {
							var p = 0;
							b.type !== c.TEXT &&
								b.previous.type !== c.TEXT &&
								(p = b.newlines ? 1 : 0),
								this.preserve_newlines &&
									(p =
										b.newlines <
										this.max_preserve_newlines + 1
											? b.newlines
											: this.max_preserve_newlines + 1);
							for (var T = 0; T < p; T++)
								this.print_newline(T > 0);
							return p !== 0;
						}),
						(f.prototype.traverse_whitespace = function (b) {
							return b.whitespace_before || b.newlines
								? (this.print_preserved_newlines(b) ||
										(this._output.space_before_token = !0),
									!0)
								: !1;
						}),
						(f.prototype.previous_token_wrapped = function () {
							return this._output.previous_token_wrapped;
						}),
						(f.prototype.print_newline = function (b) {
							this._output.add_new_line(b);
						}),
						(f.prototype.print_token = function (b) {
							b.text &&
								(this._output.set_indent(
									this.indent_level,
									this.alignment_size,
								),
								this._output.add_token(b.text));
						}),
						(f.prototype.indent = function () {
							this.indent_level++;
						}),
						(f.prototype.deindent = function () {
							this.indent_level > 0 &&
								(this.indent_level--,
								this._output.set_indent(
									this.indent_level,
									this.alignment_size,
								));
						}),
						(f.prototype.get_full_indent = function (b) {
							return (
								(b = this.indent_level + (b || 0)),
								b < 1 ? "" : this._output.get_indent_string(b)
							);
						});
					var w = function (b) {
							for (
								var p = null, T = b.next;
								T.type !== c.EOF && b.closed !== T;
							) {
								if (
									T.type === c.ATTRIBUTE &&
									T.text === "type"
								) {
									T.next &&
										T.next.type === c.EQUALS &&
										T.next.next &&
										T.next.next.type === c.VALUE &&
										(p = T.next.next.text);
									break;
								}
								T = T.next;
							}
							return p;
						},
						g = function (b, p) {
							var T = null,
								H = null;
							return p.closed
								? (b === "script"
										? (T = "text/javascript")
										: b === "style" && (T = "text/css"),
									(T = w(p) || T),
									T.search("text/css") > -1
										? (H = "css")
										: T.search(
													/module|((text|application|dojo)\/(x-)?(javascript|ecmascript|jscript|livescript|(ld\+)?json|method|aspect))/,
												) > -1
											? (H = "javascript")
											: T.search(
														/(text|application|dojo)\/(x-)?(html)/,
													) > -1
												? (H = "html")
												: T.search(/test\/null/) > -1 &&
													(H = "null"),
									H)
								: null;
						};
					function k(b, p) {
						return p.indexOf(b) !== -1;
					}
					function v(b, p, T) {
						(this.parent = b || null),
							(this.tag = p ? p.tag_name : ""),
							(this.indent_level = T || 0),
							(this.parser_token = p || null);
					}
					function y(b) {
						(this._printer = b), (this._current_frame = null);
					}
					(y.prototype.get_parser_token = function () {
						return this._current_frame
							? this._current_frame.parser_token
							: null;
					}),
						(y.prototype.record_tag = function (b) {
							var p = new v(
								this._current_frame,
								b,
								this._printer.indent_level,
							);
							this._current_frame = p;
						}),
						(y.prototype._try_pop_frame = function (b) {
							var p = null;
							return (
								b &&
									((p = b.parser_token),
									(this._printer.indent_level =
										b.indent_level),
									(this._current_frame = b.parent)),
								p
							);
						}),
						(y.prototype._get_frame = function (b, p) {
							for (
								var T = this._current_frame;
								T && b.indexOf(T.tag) === -1;
							) {
								if (p && p.indexOf(T.tag) !== -1) {
									T = null;
									break;
								}
								T = T.parent;
							}
							return T;
						}),
						(y.prototype.try_pop = function (b, p) {
							var T = this._get_frame([b], p);
							return this._try_pop_frame(T);
						}),
						(y.prototype.indent_to_tag = function (b) {
							var p = this._get_frame(b);
							p && (this._printer.indent_level = p.indent_level);
						});
					function E(b, p, T, H) {
						(this._source_text = b || ""),
							(p = p || {}),
							(this._js_beautify = T),
							(this._css_beautify = H),
							(this._tag_stack = null);
						var L = new l(p, "html");
						(this._options = L),
							(this._is_wrap_attributes_force =
								this._options.wrap_attributes.substr(0, 5) ===
								"force"),
							(this._is_wrap_attributes_force_expand_multiline =
								this._options.wrap_attributes ===
								"force-expand-multiline"),
							(this._is_wrap_attributes_force_aligned =
								this._options.wrap_attributes ===
								"force-aligned"),
							(this._is_wrap_attributes_aligned_multiple =
								this._options.wrap_attributes ===
								"aligned-multiple"),
							(this._is_wrap_attributes_preserve =
								this._options.wrap_attributes.substr(0, 8) ===
								"preserve"),
							(this._is_wrap_attributes_preserve_aligned =
								this._options.wrap_attributes ===
								"preserve-aligned");
					}
					(E.prototype.beautify = function () {
						if (this._options.disabled) return this._source_text;
						var b = this._source_text,
							p = this._options.eol;
						this._options.eol === "auto" &&
							((p = `
`),
							b && d.test(b) && (p = b.match(d)[0])),
							(b = b.replace(
								m,
								`
`,
							));
						var T = b.match(/^[\t ]*/)[0],
							H = { text: "", type: "" },
							L = new R(),
							_ = new f(this._options, T),
							A = new u(b, this._options).tokenize();
						this._tag_stack = new y(_);
						for (var x = null, S = A.next(); S.type !== c.EOF; )
							S.type === c.TAG_OPEN || S.type === c.COMMENT
								? ((x = this._handle_tag_open(_, S, L, H, A)),
									(L = x))
								: S.type === c.ATTRIBUTE ||
										S.type === c.EQUALS ||
										S.type === c.VALUE ||
										(S.type === c.TEXT && !L.tag_complete)
									? (x = this._handle_inside_tag(_, S, L, H))
									: S.type === c.TAG_CLOSE
										? (x = this._handle_tag_close(_, S, L))
										: S.type === c.TEXT
											? (x = this._handle_text(_, S, L))
											: S.type === c.CONTROL_FLOW_OPEN
												? (x =
														this._handle_control_flow_open(
															_,
															S,
														))
												: S.type ===
														c.CONTROL_FLOW_CLOSE
													? (x =
															this._handle_control_flow_close(
																_,
																S,
															))
													: _.add_raw_token(S),
								(H = x),
								(S = A.next());
						var D = _._output.get_code(p);
						return D;
					}),
						(E.prototype._handle_control_flow_open = function (
							b,
							p,
						) {
							var T = { text: p.text, type: p.type };
							return (
								b.set_space_before_token(
									p.newlines || p.whitespace_before !== "",
									!0,
								),
								p.newlines
									? b.print_preserved_newlines(p)
									: b.set_space_before_token(
											p.newlines ||
												p.whitespace_before !== "",
											!0,
										),
								b.print_token(p),
								b.indent(),
								T
							);
						}),
						(E.prototype._handle_control_flow_close = function (
							b,
							p,
						) {
							var T = { text: p.text, type: p.type };
							return (
								b.deindent(),
								p.newlines
									? b.print_preserved_newlines(p)
									: b.set_space_before_token(
											p.newlines ||
												p.whitespace_before !== "",
											!0,
										),
								b.print_token(p),
								T
							);
						}),
						(E.prototype._handle_tag_close = function (b, p, T) {
							var H = { text: p.text, type: p.type };
							return (
								(b.alignment_size = 0),
								(T.tag_complete = !0),
								b.set_space_before_token(
									p.newlines || p.whitespace_before !== "",
									!0,
								),
								T.is_unformatted
									? b.add_raw_token(p)
									: (T.tag_start_char === "<" &&
											(b.set_space_before_token(
												p.text[0] === "/",
												!0,
											),
											this
												._is_wrap_attributes_force_expand_multiline &&
												T.has_wrapped_attrs &&
												b.print_newline(!1)),
										b.print_token(p)),
								T.indent_content &&
									!(
										T.is_unformatted ||
										T.is_content_unformatted
									) &&
									(b.indent(), (T.indent_content = !1)),
								!T.is_inline_element &&
									!(
										T.is_unformatted ||
										T.is_content_unformatted
									) &&
									b.set_wrap_point(),
								H
							);
						}),
						(E.prototype._handle_inside_tag = function (
							b,
							p,
							T,
							H,
						) {
							var L = T.has_wrapped_attrs,
								_ = { text: p.text, type: p.type };
							return (
								b.set_space_before_token(
									p.newlines || p.whitespace_before !== "",
									!0,
								),
								T.is_unformatted
									? b.add_raw_token(p)
									: T.tag_start_char === "{" &&
											p.type === c.TEXT
										? b.print_preserved_newlines(p)
											? ((p.newlines = 0),
												b.add_raw_token(p))
											: b.print_token(p)
										: (p.type === c.ATTRIBUTE
												? b.set_space_before_token(!0)
												: (p.type === c.EQUALS ||
														(p.type === c.VALUE &&
															p.previous.type ===
																c.EQUALS)) &&
													b.set_space_before_token(
														!1,
													),
											p.type === c.ATTRIBUTE &&
												T.tag_start_char === "<" &&
												((this
													._is_wrap_attributes_preserve ||
													this
														._is_wrap_attributes_preserve_aligned) &&
													(b.traverse_whitespace(p),
													(L =
														L || p.newlines !== 0)),
												this
													._is_wrap_attributes_force &&
													T.attr_count >=
														this._options
															.wrap_attributes_min_attrs &&
													(H.type !== c.TAG_OPEN ||
														this
															._is_wrap_attributes_force_expand_multiline) &&
													(b.print_newline(!1),
													(L = !0))),
											b.print_token(p),
											(L =
												L ||
												b.previous_token_wrapped()),
											(T.has_wrapped_attrs = L)),
								_
							);
						}),
						(E.prototype._handle_text = function (b, p, T) {
							var H = { text: p.text, type: "TK_CONTENT" };
							return (
								T.custom_beautifier_name
									? this._print_custom_beatifier_text(b, p, T)
									: T.is_unformatted ||
											T.is_content_unformatted
										? b.add_raw_token(p)
										: (b.traverse_whitespace(p),
											b.print_token(p)),
								H
							);
						}),
						(E.prototype._print_custom_beatifier_text = function (
							b,
							p,
							T,
						) {
							var H = this;
							if (p.text !== "") {
								var L = p.text,
									_,
									A = 1,
									x = "",
									S = "";
								T.custom_beautifier_name === "javascript" &&
								typeof this._js_beautify == "function"
									? (_ = this._js_beautify)
									: T.custom_beautifier_name === "css" &&
											typeof this._css_beautify ==
												"function"
										? (_ = this._css_beautify)
										: T.custom_beautifier_name === "html" &&
											(_ = function (V, J) {
												var se = new E(
													V,
													J,
													H._js_beautify,
													H._css_beautify,
												);
												return se.beautify();
											}),
									this._options.indent_scripts === "keep"
										? (A = 0)
										: this._options.indent_scripts ===
												"separate" &&
											(A = -b.indent_level);
								var D = b.get_full_indent(A);
								if (
									((L = L.replace(/\n[ \t]*$/, "")),
									T.custom_beautifier_name !== "html" &&
										L[0] === "<" &&
										L.match(/^(<!--|<!\[CDATA\[)/))
								) {
									var I =
										/^(<!--[^\n]*|<!\[CDATA\[)(\n?)([ \t\n]*)([\s\S]*)(-->|]]>)$/.exec(
											L,
										);
									if (!I) {
										b.add_raw_token(p);
										return;
									}
									(x =
										D +
										I[1] +
										`
`),
										(L = I[4]),
										I[5] && (S = D + I[5]),
										(L = L.replace(/\n[ \t]*$/, "")),
										(I[2] ||
											I[3].indexOf(`
`) !== -1) &&
											((I = I[3].match(/[ \t]+$/)),
											I && (p.whitespace_before = I[0]));
								}
								if (L)
									if (_) {
										var F = function () {
											this.eol = `
`;
										};
										F.prototype = this._options.raw_options;
										var W = new F();
										L = _(D + L, W);
									} else {
										var U = p.whitespace_before;
										U &&
											(L = L.replace(
												new RegExp(
													`
(` +
														U +
														")?",
													"g",
												),
												`
`,
											)),
											(L =
												D +
												L.replace(
													/\n/g,
													`
` + D,
												));
									}
								x &&
									(L
										? (L =
												x +
												L +
												`
` +
												S)
										: (L = x + S)),
									b.print_newline(!1),
									L &&
										((p.text = L),
										(p.whitespace_before = ""),
										(p.newlines = 0),
										b.add_raw_token(p),
										b.print_newline(!0));
							}
						}),
						(E.prototype._handle_tag_open = function (
							b,
							p,
							T,
							H,
							L,
						) {
							var _ = this._get_tag_open_token(p);
							if (
								((T.is_unformatted ||
									T.is_content_unformatted) &&
								!T.is_empty_element &&
								p.type === c.TAG_OPEN &&
								!_.is_start_tag
									? (b.add_raw_token(p),
										(_.start_tag_token =
											this._tag_stack.try_pop(
												_.tag_name,
											)))
									: (b.traverse_whitespace(p),
										this._set_tag_position(b, p, _, T, H),
										_.is_inline_element ||
											b.set_wrap_point(),
										b.print_token(p)),
								_.is_start_tag &&
									this._is_wrap_attributes_force)
							) {
								var A = 0,
									x;
								do
									(x = L.peek(A)),
										x.type === c.ATTRIBUTE &&
											(_.attr_count += 1),
										(A += 1);
								while (
									x.type !== c.EOF &&
									x.type !== c.TAG_CLOSE
								);
							}
							return (
								(this._is_wrap_attributes_force_aligned ||
									this._is_wrap_attributes_aligned_multiple ||
									this
										._is_wrap_attributes_preserve_aligned) &&
									(_.alignment_size = p.text.length + 1),
								!_.tag_complete &&
									!_.is_unformatted &&
									(b.alignment_size = _.alignment_size),
								_
							);
						});
					var R = function (b, p) {
						if (
							((this.parent = b || null),
							(this.text = ""),
							(this.type = "TK_TAG_OPEN"),
							(this.tag_name = ""),
							(this.is_inline_element = !1),
							(this.is_unformatted = !1),
							(this.is_content_unformatted = !1),
							(this.is_empty_element = !1),
							(this.is_start_tag = !1),
							(this.is_end_tag = !1),
							(this.indent_content = !1),
							(this.multiline_content = !1),
							(this.custom_beautifier_name = null),
							(this.start_tag_token = null),
							(this.attr_count = 0),
							(this.has_wrapped_attrs = !1),
							(this.alignment_size = 0),
							(this.tag_complete = !1),
							(this.tag_start_char = ""),
							(this.tag_check = ""),
							!p)
						)
							this.tag_complete = !0;
						else {
							var T;
							(this.tag_start_char = p.text[0]),
								(this.text = p.text),
								this.tag_start_char === "<"
									? ((T = p.text.match(/^<([^\s>]*)/)),
										(this.tag_check = T ? T[1] : ""))
									: ((T = p.text.match(
											/^{{~?(?:[\^]|#\*?)?([^\s}]+)/,
										)),
										(this.tag_check = T ? T[1] : ""),
										(p.text.startsWith("{{#>") ||
											p.text.startsWith("{{~#>")) &&
											this.tag_check[0] === ">" &&
											(this.tag_check === ">" &&
											p.next !== null
												? (this.tag_check =
														p.next.text.split(
															" ",
														)[0])
												: (this.tag_check =
														p.text.split(">")[1]))),
								(this.tag_check = this.tag_check.toLowerCase()),
								p.type === c.COMMENT &&
									(this.tag_complete = !0),
								(this.is_start_tag =
									this.tag_check.charAt(0) !== "/"),
								(this.tag_name = this.is_start_tag
									? this.tag_check
									: this.tag_check.substr(1)),
								(this.is_end_tag =
									!this.is_start_tag ||
									(p.closed && p.closed.text === "/>"));
							var H = 2;
							this.tag_start_char === "{" &&
								this.text.length >= 3 &&
								this.text.charAt(2) === "~" &&
								(H = 3),
								(this.is_end_tag =
									this.is_end_tag ||
									(this.tag_start_char === "{" &&
										(this.text.length < 3 ||
											/[^#\^]/.test(
												this.text.charAt(H),
											))));
						}
					};
					(E.prototype._get_tag_open_token = function (b) {
						var p = new R(this._tag_stack.get_parser_token(), b);
						return (
							(p.alignment_size =
								this._options.wrap_attributes_indent_size),
							(p.is_end_tag =
								p.is_end_tag ||
								k(p.tag_check, this._options.void_elements)),
							(p.is_empty_element =
								p.tag_complete ||
								(p.is_start_tag && p.is_end_tag)),
							(p.is_unformatted =
								!p.tag_complete &&
								k(p.tag_check, this._options.unformatted)),
							(p.is_content_unformatted =
								!p.is_empty_element &&
								k(
									p.tag_check,
									this._options.content_unformatted,
								)),
							(p.is_inline_element =
								k(p.tag_name, this._options.inline) ||
								(this._options.inline_custom_elements &&
									p.tag_name.includes("-")) ||
								p.tag_start_char === "{"),
							p
						);
					}),
						(E.prototype._set_tag_position = function (
							b,
							p,
							T,
							H,
							L,
						) {
							if (
								(T.is_empty_element ||
									(T.is_end_tag
										? (T.start_tag_token =
												this._tag_stack.try_pop(
													T.tag_name,
												))
										: (this._do_optional_end_element(T) &&
												(T.is_inline_element ||
													b.print_newline(!1)),
											this._tag_stack.record_tag(T),
											(T.tag_name === "script" ||
												T.tag_name === "style") &&
												!(
													T.is_unformatted ||
													T.is_content_unformatted
												) &&
												(T.custom_beautifier_name = g(
													T.tag_check,
													p,
												)))),
								k(T.tag_check, this._options.extra_liners) &&
									(b.print_newline(!1),
									b._output.just_added_blankline() ||
										b.print_newline(!0)),
								T.is_empty_element)
							) {
								if (
									T.tag_start_char === "{" &&
									T.tag_check === "else"
								) {
									this._tag_stack.indent_to_tag([
										"if",
										"unless",
										"each",
									]),
										(T.indent_content = !0);
									var _ = b.current_line_has_match(/{{#if/);
									_ || b.print_newline(!1);
								}
								(T.tag_name === "!--" &&
									L.type === c.TAG_CLOSE &&
									H.is_end_tag &&
									T.text.indexOf(`
`) === -1) ||
									(T.is_inline_element ||
										T.is_unformatted ||
										b.print_newline(!1),
									this._calcluate_parent_multiline(b, T));
							} else if (T.is_end_tag) {
								var A = !1;
								(A =
									T.start_tag_token &&
									T.start_tag_token.multiline_content),
									(A =
										A ||
										(!T.is_inline_element &&
											!(
												H.is_inline_element ||
												H.is_unformatted
											) &&
											!(
												L.type === c.TAG_CLOSE &&
												T.start_tag_token === H
											) &&
											L.type !== "TK_CONTENT")),
									(T.is_content_unformatted ||
										T.is_unformatted) &&
										(A = !1),
									A && b.print_newline(!1);
							} else
								(T.indent_content = !T.custom_beautifier_name),
									T.tag_start_char === "<" &&
										(T.tag_name === "html"
											? (T.indent_content =
													this._options.indent_inner_html)
											: T.tag_name === "head"
												? (T.indent_content =
														this._options.indent_head_inner_html)
												: T.tag_name === "body" &&
													(T.indent_content =
														this._options.indent_body_inner_html)),
									!(
										T.is_inline_element || T.is_unformatted
									) &&
										(L.type !== "TK_CONTENT" ||
											T.is_content_unformatted) &&
										b.print_newline(!1),
									this._calcluate_parent_multiline(b, T);
						}),
						(E.prototype._calcluate_parent_multiline = function (
							b,
							p,
						) {
							p.parent &&
								b._output.just_added_newline() &&
								!(
									(p.is_inline_element || p.is_unformatted) &&
									p.parent.is_inline_element
								) &&
								(p.parent.multiline_content = !0);
						});
					var N = [
							"address",
							"article",
							"aside",
							"blockquote",
							"details",
							"div",
							"dl",
							"fieldset",
							"figcaption",
							"figure",
							"footer",
							"form",
							"h1",
							"h2",
							"h3",
							"h4",
							"h5",
							"h6",
							"header",
							"hr",
							"main",
							"menu",
							"nav",
							"ol",
							"p",
							"pre",
							"section",
							"table",
							"ul",
						],
						M = [
							"a",
							"audio",
							"del",
							"ins",
							"map",
							"noscript",
							"video",
						];
					(E.prototype._do_optional_end_element = function (b) {
						var p = null;
						if (
							!(
								b.is_empty_element ||
								!b.is_start_tag ||
								!b.parent
							)
						) {
							if (b.tag_name === "body")
								p = p || this._tag_stack.try_pop("head");
							else if (b.tag_name === "li")
								p =
									p ||
									this._tag_stack.try_pop("li", [
										"ol",
										"ul",
										"menu",
									]);
							else if (b.tag_name === "dd" || b.tag_name === "dt")
								(p =
									p || this._tag_stack.try_pop("dt", ["dl"])),
									(p =
										p ||
										this._tag_stack.try_pop("dd", ["dl"]));
							else if (
								b.parent.tag_name === "p" &&
								N.indexOf(b.tag_name) !== -1
							) {
								var T = b.parent.parent;
								(!T || M.indexOf(T.tag_name) === -1) &&
									(p = p || this._tag_stack.try_pop("p"));
							} else
								b.tag_name === "rp" || b.tag_name === "rt"
									? ((p =
											p ||
											this._tag_stack.try_pop("rt", [
												"ruby",
												"rtc",
											])),
										(p =
											p ||
											this._tag_stack.try_pop("rp", [
												"ruby",
												"rtc",
											])))
									: b.tag_name === "optgroup"
										? (p =
												p ||
												this._tag_stack.try_pop(
													"optgroup",
													["select"],
												))
										: b.tag_name === "option"
											? (p =
													p ||
													this._tag_stack.try_pop(
														"option",
														[
															"select",
															"datalist",
															"optgroup",
														],
													))
											: b.tag_name === "colgroup"
												? (p =
														p ||
														this._tag_stack.try_pop(
															"caption",
															["table"],
														))
												: b.tag_name === "thead"
													? ((p =
															p ||
															this._tag_stack.try_pop(
																"caption",
																["table"],
															)),
														(p =
															p ||
															this._tag_stack.try_pop(
																"colgroup",
																["table"],
															)))
													: b.tag_name === "tbody" ||
															b.tag_name ===
																"tfoot"
														? ((p =
																p ||
																this._tag_stack.try_pop(
																	"caption",
																	["table"],
																)),
															(p =
																p ||
																this._tag_stack.try_pop(
																	"colgroup",
																	["table"],
																)),
															(p =
																p ||
																this._tag_stack.try_pop(
																	"thead",
																	["table"],
																)),
															(p =
																p ||
																this._tag_stack.try_pop(
																	"tbody",
																	["table"],
																)))
														: b.tag_name === "tr"
															? ((p =
																	p ||
																	this._tag_stack.try_pop(
																		"caption",
																		[
																			"table",
																		],
																	)),
																(p =
																	p ||
																	this._tag_stack.try_pop(
																		"colgroup",
																		[
																			"table",
																		],
																	)),
																(p =
																	p ||
																	this._tag_stack.try_pop(
																		"tr",
																		[
																			"table",
																			"thead",
																			"tbody",
																			"tfoot",
																		],
																	)))
															: (b.tag_name ===
																	"th" ||
																	b.tag_name ===
																		"td") &&
																((p =
																	p ||
																	this._tag_stack.try_pop(
																		"td",
																		[
																			"table",
																			"thead",
																			"tbody",
																			"tfoot",
																			"tr",
																		],
																	)),
																(p =
																	p ||
																	this._tag_stack.try_pop(
																		"th",
																		[
																			"table",
																			"thead",
																			"tbody",
																			"tfoot",
																			"tr",
																		],
																	)));
							return (
								(b.parent = this._tag_stack.get_parser_token()),
								p
							);
						}
					}),
						(r.exports.Beautifier = E);
				},
				function (r, s, o) {
					var l = o(6).Options;
					function a(u) {
						l.call(this, u, "html"),
							this.templating.length === 1 &&
								this.templating[0] === "auto" &&
								(this.templating = [
									"django",
									"erb",
									"handlebars",
									"php",
								]),
							(this.indent_inner_html =
								this._get_boolean("indent_inner_html")),
							(this.indent_body_inner_html = this._get_boolean(
								"indent_body_inner_html",
								!0,
							)),
							(this.indent_head_inner_html = this._get_boolean(
								"indent_head_inner_html",
								!0,
							)),
							(this.indent_handlebars = this._get_boolean(
								"indent_handlebars",
								!0,
							)),
							(this.wrap_attributes = this._get_selection(
								"wrap_attributes",
								[
									"auto",
									"force",
									"force-aligned",
									"force-expand-multiline",
									"aligned-multiple",
									"preserve",
									"preserve-aligned",
								],
							)),
							(this.wrap_attributes_min_attrs = this._get_number(
								"wrap_attributes_min_attrs",
								2,
							)),
							(this.wrap_attributes_indent_size =
								this._get_number(
									"wrap_attributes_indent_size",
									this.indent_size,
								)),
							(this.extra_liners = this._get_array(
								"extra_liners",
								["head", "body", "/html"],
							)),
							(this.inline = this._get_array("inline", [
								"a",
								"abbr",
								"area",
								"audio",
								"b",
								"bdi",
								"bdo",
								"br",
								"button",
								"canvas",
								"cite",
								"code",
								"data",
								"datalist",
								"del",
								"dfn",
								"em",
								"embed",
								"i",
								"iframe",
								"img",
								"input",
								"ins",
								"kbd",
								"keygen",
								"label",
								"map",
								"mark",
								"math",
								"meter",
								"noscript",
								"object",
								"output",
								"progress",
								"q",
								"ruby",
								"s",
								"samp",
								"select",
								"small",
								"span",
								"strong",
								"sub",
								"sup",
								"svg",
								"template",
								"textarea",
								"time",
								"u",
								"var",
								"video",
								"wbr",
								"text",
								"acronym",
								"big",
								"strike",
								"tt",
							])),
							(this.inline_custom_elements = this._get_boolean(
								"inline_custom_elements",
								!0,
							)),
							(this.void_elements = this._get_array(
								"void_elements",
								[
									"area",
									"base",
									"br",
									"col",
									"embed",
									"hr",
									"img",
									"input",
									"keygen",
									"link",
									"menuitem",
									"meta",
									"param",
									"source",
									"track",
									"wbr",
									"!doctype",
									"?xml",
									"basefont",
									"isindex",
								],
							)),
							(this.unformatted = this._get_array(
								"unformatted",
								[],
							)),
							(this.content_unformatted = this._get_array(
								"content_unformatted",
								["pre", "textarea"],
							)),
							(this.unformatted_content_delimiter =
								this._get_characters(
									"unformatted_content_delimiter",
								)),
							(this.indent_scripts = this._get_selection(
								"indent_scripts",
								["normal", "keep", "separate"],
							));
					}
					(a.prototype = new l()), (r.exports.Options = a);
				},
				function (r, s, o) {
					var l = o(9).Tokenizer,
						a = o(9).TOKEN,
						u = o(13).Directives,
						c = o(14).TemplatablePattern,
						d = o(12).Pattern,
						m = {
							TAG_OPEN: "TK_TAG_OPEN",
							TAG_CLOSE: "TK_TAG_CLOSE",
							CONTROL_FLOW_OPEN: "TK_CONTROL_FLOW_OPEN",
							CONTROL_FLOW_CLOSE: "TK_CONTROL_FLOW_CLOSE",
							ATTRIBUTE: "TK_ATTRIBUTE",
							EQUALS: "TK_EQUALS",
							VALUE: "TK_VALUE",
							COMMENT: "TK_COMMENT",
							TEXT: "TK_TEXT",
							UNKNOWN: "TK_UNKNOWN",
							START: a.START,
							RAW: a.RAW,
							EOF: a.EOF,
						},
						f = new u(/<\!--/, /-->/),
						w = function (g, k) {
							l.call(this, g, k), (this._current_tag_name = "");
							var v = new c(this._input).read_options(
									this._options,
								),
								y = new d(this._input);
							if (
								((this.__patterns = {
									word: v.until(/[\n\r\t <]/),
									word_control_flow_close_excluded:
										v.until(/[\n\r\t <}]/),
									single_quote: v.until_after(/'/),
									double_quote: v.until_after(/"/),
									attribute: v.until(/[\n\r\t =>]|\/>/),
									element_name: v.until(/[\n\r\t >\/]/),
									angular_control_flow_start: y.matching(
										/\@[a-zA-Z]+[^({]*[({]/,
									),
									handlebars_comment: y
										.starting_with(/{{!--/)
										.until_after(/--}}/),
									handlebars: y
										.starting_with(/{{/)
										.until_after(/}}/),
									handlebars_open: y.until(/[\n\r\t }]/),
									handlebars_raw_close: y.until(/}}/),
									comment: y
										.starting_with(/<!--/)
										.until_after(/-->/),
									cdata: y
										.starting_with(/<!\[CDATA\[/)
										.until_after(/]]>/),
									conditional_comment: y
										.starting_with(/<!\[/)
										.until_after(/]>/),
									processing: y
										.starting_with(/<\?/)
										.until_after(/\?>/),
								}),
								this._options.indent_handlebars &&
									((this.__patterns.word =
										this.__patterns.word.exclude(
											"handlebars",
										)),
									(this.__patterns.word_control_flow_close_excluded =
										this.__patterns.word_control_flow_close_excluded.exclude(
											"handlebars",
										))),
								(this._unformatted_content_delimiter = null),
								this._options.unformatted_content_delimiter)
							) {
								var E = this._input.get_literal_regexp(
									this._options.unformatted_content_delimiter,
								);
								this.__patterns.unformatted_content_delimiter =
									y.matching(E).until_after(E);
							}
						};
					(w.prototype = new l()),
						(w.prototype._is_comment = function (g) {
							return !1;
						}),
						(w.prototype._is_opening = function (g) {
							return (
								g.type === m.TAG_OPEN ||
								g.type === m.CONTROL_FLOW_OPEN
							);
						}),
						(w.prototype._is_closing = function (g, k) {
							return (
								(g.type === m.TAG_CLOSE &&
									k &&
									(((g.text === ">" || g.text === "/>") &&
										k.text[0] === "<") ||
										(g.text === "}}" &&
											k.text[0] === "{" &&
											k.text[1] === "{"))) ||
								(g.type === m.CONTROL_FLOW_CLOSE &&
									g.text === "}" &&
									k.text.endsWith("{"))
							);
						}),
						(w.prototype._reset = function () {
							this._current_tag_name = "";
						}),
						(w.prototype._get_next_token = function (g, k) {
							var v = null;
							this._readWhitespace();
							var y = this._input.peek();
							return y === null
								? this._create_token(m.EOF, "")
								: ((v = v || this._read_open_handlebars(y, k)),
									(v = v || this._read_attribute(y, g, k)),
									(v = v || this._read_close(y, k)),
									(v = v || this._read_control_flows(y, k)),
									(v = v || this._read_raw_content(y, g, k)),
									(v = v || this._read_content_word(y, k)),
									(v = v || this._read_comment_or_cdata(y)),
									(v = v || this._read_processing(y)),
									(v = v || this._read_open(y, k)),
									(v =
										v ||
										this._create_token(
											m.UNKNOWN,
											this._input.next(),
										)),
									v);
						}),
						(w.prototype._read_comment_or_cdata = function (g) {
							var k = null,
								v = null,
								y = null;
							if (g === "<") {
								var E = this._input.peek(1);
								E === "!" &&
									((v = this.__patterns.comment.read()),
									v
										? ((y = f.get_directives(v)),
											y &&
												y.ignore === "start" &&
												(v += f.readIgnored(
													this._input,
												)))
										: (v = this.__patterns.cdata.read())),
									v &&
										((k = this._create_token(m.COMMENT, v)),
										(k.directives = y));
							}
							return k;
						}),
						(w.prototype._read_processing = function (g) {
							var k = null,
								v = null,
								y = null;
							if (g === "<") {
								var E = this._input.peek(1);
								(E === "!" || E === "?") &&
									((v =
										this.__patterns.conditional_comment.read()),
									(v =
										v ||
										this.__patterns.processing.read())),
									v &&
										((k = this._create_token(m.COMMENT, v)),
										(k.directives = y));
							}
							return k;
						}),
						(w.prototype._read_open = function (g, k) {
							var v = null,
								y = null;
							return (
								(!k || k.type === m.CONTROL_FLOW_OPEN) &&
									g === "<" &&
									((v = this._input.next()),
									this._input.peek() === "/" &&
										(v += this._input.next()),
									(v += this.__patterns.element_name.read()),
									(y = this._create_token(m.TAG_OPEN, v))),
								y
							);
						}),
						(w.prototype._read_open_handlebars = function (g, k) {
							var v = null,
								y = null;
							return (
								(!k || k.type === m.CONTROL_FLOW_OPEN) &&
									this._options.indent_handlebars &&
									g === "{" &&
									this._input.peek(1) === "{" &&
									(this._input.peek(2) === "!"
										? ((v =
												this.__patterns.handlebars_comment.read()),
											(v =
												v ||
												this.__patterns.handlebars.read()),
											(y = this._create_token(
												m.COMMENT,
												v,
											)))
										: ((v =
												this.__patterns.handlebars_open.read()),
											(y = this._create_token(
												m.TAG_OPEN,
												v,
											)))),
								y
							);
						}),
						(w.prototype._read_control_flows = function (g, k) {
							var v = "",
								y = null;
							if (
								!this._options.templating.includes("angular") ||
								!this._options.indent_handlebars
							)
								return y;
							if (g === "@") {
								if (
									((v =
										this.__patterns.angular_control_flow_start.read()),
									v === "")
								)
									return y;
								for (
									var E = v.endsWith("(") ? 1 : 0, R = 0;
									!(v.endsWith("{") && E === R);
								) {
									var N = this._input.next();
									if (N === null) break;
									N === "(" ? E++ : N === ")" && R++,
										(v += N);
								}
								y = this._create_token(m.CONTROL_FLOW_OPEN, v);
							} else
								g === "}" &&
									k &&
									k.type === m.CONTROL_FLOW_OPEN &&
									((v = this._input.next()),
									(y = this._create_token(
										m.CONTROL_FLOW_CLOSE,
										v,
									)));
							return y;
						}),
						(w.prototype._read_close = function (g, k) {
							var v = null,
								y = null;
							return (
								k &&
									k.type === m.TAG_OPEN &&
									(k.text[0] === "<" &&
									(g === ">" ||
										(g === "/" &&
											this._input.peek(1) === ">"))
										? ((v = this._input.next()),
											g === "/" &&
												(v += this._input.next()),
											(y = this._create_token(
												m.TAG_CLOSE,
												v,
											)))
										: k.text[0] === "{" &&
											g === "}" &&
											this._input.peek(1) === "}" &&
											(this._input.next(),
											this._input.next(),
											(y = this._create_token(
												m.TAG_CLOSE,
												"}}",
											)))),
								y
							);
						}),
						(w.prototype._read_attribute = function (g, k, v) {
							var y = null,
								E = "";
							if (v && v.text[0] === "<")
								if (g === "=")
									y = this._create_token(
										m.EQUALS,
										this._input.next(),
									);
								else if (g === '"' || g === "'") {
									var R = this._input.next();
									g === '"'
										? (R +=
												this.__patterns.double_quote.read())
										: (R +=
												this.__patterns.single_quote.read()),
										(y = this._create_token(m.VALUE, R));
								} else
									(E = this.__patterns.attribute.read()),
										E &&
											(k.type === m.EQUALS
												? (y = this._create_token(
														m.VALUE,
														E,
													))
												: (y = this._create_token(
														m.ATTRIBUTE,
														E,
													)));
							return y;
						}),
						(w.prototype._is_content_unformatted = function (g) {
							return (
								this._options.void_elements.indexOf(g) === -1 &&
								(this._options.content_unformatted.indexOf(
									g,
								) !== -1 ||
									this._options.unformatted.indexOf(g) !== -1)
							);
						}),
						(w.prototype._read_raw_content = function (g, k, v) {
							var y = "";
							if (v && v.text[0] === "{")
								y = this.__patterns.handlebars_raw_close.read();
							else if (
								k.type === m.TAG_CLOSE &&
								k.opened.text[0] === "<" &&
								k.text[0] !== "/"
							) {
								var E = k.opened.text.substr(1).toLowerCase();
								if (E === "script" || E === "style") {
									var R = this._read_comment_or_cdata(g);
									if (R) return (R.type = m.TEXT), R;
									y = this._input.readUntil(
										new RegExp(
											"</" + E + "[\\n\\r\\t ]*?>",
											"ig",
										),
									);
								} else
									this._is_content_unformatted(E) &&
										(y = this._input.readUntil(
											new RegExp(
												"</" + E + "[\\n\\r\\t ]*?>",
												"ig",
											),
										));
							}
							return y ? this._create_token(m.TEXT, y) : null;
						}),
						(w.prototype._read_content_word = function (g, k) {
							var v = "";
							if (
								(this._options.unformatted_content_delimiter &&
									g ===
										this._options
											.unformatted_content_delimiter[0] &&
									(v =
										this.__patterns.unformatted_content_delimiter.read()),
								v ||
									(v =
										k && k.type === m.CONTROL_FLOW_OPEN
											? this.__patterns.word_control_flow_close_excluded.read()
											: this.__patterns.word.read()),
								v)
							)
								return this._create_token(m.TEXT, v);
						}),
						(r.exports.Tokenizer = w),
						(r.exports.TOKEN = m);
				},
			],
			t = {};
		function n(r) {
			var s = t[r];
			if (s !== void 0) return s.exports;
			var o = (t[r] = { exports: {} });
			return e[r](o, o.exports, n), o.exports;
		}
		var i = n(18);
		xa = i;
	})();
	function $u(e, t) {
		return xa(e, t, ju, Gu);
	}
	function Xu(e, t, n) {
		let i = e.getText(),
			r = !0,
			s = 0;
		const o = n.tabSize || 4;
		if (t) {
			let u = e.offsetAt(t.start),
				c = u;
			for (; c > 0 && ka(i, c - 1); ) c--;
			c === 0 || Ta(i, c - 1) ? (u = c) : c < u && (u = c + 1);
			let d = e.offsetAt(t.end),
				m = d;
			for (; m < i.length && ka(i, m); ) m++;
			(m === i.length || Ta(i, m)) && (d = m),
				(t = G.create(e.positionAt(u), e.positionAt(d)));
			const f = i.substring(0, u);
			if (new RegExp(/.*[<][^>]*$/).test(f))
				return (i = i.substring(u, d)), [{ range: t, newText: i }];
			if (((r = d === i.length), (i = i.substring(u, d)), u !== 0)) {
				const w = e.offsetAt(re.create(t.start.line, 0));
				s = Qu(e.getText(), w, n);
			}
		} else t = G.create(re.create(0, 0), e.positionAt(i.length));
		const l = {
			indent_size: o,
			indent_char: n.insertSpaces ? " " : "	",
			indent_empty_lines: ge(n, "indentEmptyLines", !1),
			wrap_line_length: ge(n, "wrapLineLength", 120),
			unformatted: ui(n, "unformatted", void 0),
			content_unformatted: ui(n, "contentUnformatted", void 0),
			indent_inner_html: ge(n, "indentInnerHtml", !1),
			preserve_newlines: ge(n, "preserveNewLines", !0),
			max_preserve_newlines: ge(n, "maxPreserveNewLines", 32786),
			indent_handlebars: ge(n, "indentHandlebars", !1),
			end_with_newline: r && ge(n, "endWithNewline", !1),
			extra_liners: ui(n, "extraLiners", void 0),
			wrap_attributes: ge(n, "wrapAttributes", "auto"),
			wrap_attributes_indent_size: ge(
				n,
				"wrapAttributesIndentSize",
				void 0,
			),
			eol: `
`,
			indent_scripts: ge(n, "indentScripts", "normal"),
			templating: Yu(n, "all"),
			unformatted_content_delimiter: ge(
				n,
				"unformattedContentDelimiter",
				"",
			),
		};
		let a = $u(Ju(i), l);
		if (s > 0) {
			const u = n.insertSpaces ? _a(" ", o * s) : _a("	", s);
			(a = a
				.split(`
`)
				.join(
					`
` + u,
				)),
				t.start.character === 0 && (a = u + a);
		}
		return [{ range: t, newText: a }];
	}
	function Ju(e) {
		return e.replace(/^\s+/, "");
	}
	function ge(e, t, n) {
		if (e && e.hasOwnProperty(t)) {
			const i = e[t];
			if (i !== null) return i;
		}
		return n;
	}
	function ui(e, t, n) {
		const i = ge(e, t, null);
		return typeof i == "string"
			? i.length > 0
				? i.split(",").map((r) => r.trim().toLowerCase())
				: []
			: n;
	}
	function Yu(e, t) {
		const n = ge(e, "templating", t);
		return n === !0
			? ["auto"]
			: n === !1 || n === t || Array.isArray(n) === !1
				? ["none"]
				: n;
	}
	function Qu(e, t, n) {
		let i = t,
			r = 0;
		const s = n.tabSize || 4;
		for (; i < e.length; ) {
			const o = e.charAt(i);
			if (o === " ") r++;
			else if (o === "	") r += s;
			else break;
			i++;
		}
		return Math.floor(r / s);
	}
	function Ta(e, t) {
		return (
			`\r
`.indexOf(e.charAt(t)) !== -1
		);
	}
	function ka(e, t) {
		return " 	".indexOf(e.charAt(t)) !== -1;
	}
	var Aa;
	(() => {
		var e = {
				470: (r) => {
					function s(a) {
						if (typeof a != "string")
							throw new TypeError(
								"Path must be a string. Received " +
									JSON.stringify(a),
							);
					}
					function o(a, u) {
						for (
							var c, d = "", m = 0, f = -1, w = 0, g = 0;
							g <= a.length;
							++g
						) {
							if (g < a.length) c = a.charCodeAt(g);
							else {
								if (c === 47) break;
								c = 47;
							}
							if (c === 47) {
								if (!(f === g - 1 || w === 1))
									if (f !== g - 1 && w === 2) {
										if (
											d.length < 2 ||
											m !== 2 ||
											d.charCodeAt(d.length - 1) !== 46 ||
											d.charCodeAt(d.length - 2) !== 46
										) {
											if (d.length > 2) {
												var k = d.lastIndexOf("/");
												if (k !== d.length - 1) {
													k === -1
														? ((d = ""), (m = 0))
														: (m =
																(d = d.slice(
																	0,
																	k,
																)).length -
																1 -
																d.lastIndexOf(
																	"/",
																)),
														(f = g),
														(w = 0);
													continue;
												}
											} else if (
												d.length === 2 ||
												d.length === 1
											) {
												(d = ""),
													(m = 0),
													(f = g),
													(w = 0);
												continue;
											}
										}
										u &&
											(d.length > 0
												? (d += "/..")
												: (d = ".."),
											(m = 2));
									} else
										d.length > 0
											? (d += "/" + a.slice(f + 1, g))
											: (d = a.slice(f + 1, g)),
											(m = g - f - 1);
								(f = g), (w = 0);
							} else c === 46 && w !== -1 ? ++w : (w = -1);
						}
						return d;
					}
					var l = {
						resolve: function () {
							for (
								var a, u = "", c = !1, d = arguments.length - 1;
								d >= -1 && !c;
								d--
							) {
								var m;
								d >= 0
									? (m = arguments[d])
									: (a === void 0 && (a = process.cwd()),
										(m = a)),
									s(m),
									m.length !== 0 &&
										((u = m + "/" + u),
										(c = m.charCodeAt(0) === 47));
							}
							return (
								(u = o(u, !c)),
								c
									? u.length > 0
										? "/" + u
										: "/"
									: u.length > 0
										? u
										: "."
							);
						},
						normalize: function (a) {
							if ((s(a), a.length === 0)) return ".";
							var u = a.charCodeAt(0) === 47,
								c = a.charCodeAt(a.length - 1) === 47;
							return (
								(a = o(a, !u)).length !== 0 || u || (a = "."),
								a.length > 0 && c && (a += "/"),
								u ? "/" + a : a
							);
						},
						isAbsolute: function (a) {
							return s(a), a.length > 0 && a.charCodeAt(0) === 47;
						},
						join: function () {
							if (arguments.length === 0) return ".";
							for (var a, u = 0; u < arguments.length; ++u) {
								var c = arguments[u];
								s(c),
									c.length > 0 &&
										(a === void 0
											? (a = c)
											: (a += "/" + c));
							}
							return a === void 0 ? "." : l.normalize(a);
						},
						relative: function (a, u) {
							if (
								(s(a),
								s(u),
								a === u ||
									(a = l.resolve(a)) === (u = l.resolve(u)))
							)
								return "";
							for (
								var c = 1;
								c < a.length && a.charCodeAt(c) === 47;
								++c
							);
							for (
								var d = a.length, m = d - c, f = 1;
								f < u.length && u.charCodeAt(f) === 47;
								++f
							);
							for (
								var w = u.length - f,
									g = m < w ? m : w,
									k = -1,
									v = 0;
								v <= g;
								++v
							) {
								if (v === g) {
									if (w > g) {
										if (u.charCodeAt(f + v) === 47)
											return u.slice(f + v + 1);
										if (v === 0) return u.slice(f + v);
									} else
										m > g &&
											(a.charCodeAt(c + v) === 47
												? (k = v)
												: v === 0 && (k = 0));
									break;
								}
								var y = a.charCodeAt(c + v);
								if (y !== u.charCodeAt(f + v)) break;
								y === 47 && (k = v);
							}
							var E = "";
							for (v = c + k + 1; v <= d; ++v)
								(v !== d && a.charCodeAt(v) !== 47) ||
									(E.length === 0
										? (E += "..")
										: (E += "/.."));
							return E.length > 0
								? E + u.slice(f + k)
								: ((f += k),
									u.charCodeAt(f) === 47 && ++f,
									u.slice(f));
						},
						_makeLong: function (a) {
							return a;
						},
						dirname: function (a) {
							if ((s(a), a.length === 0)) return ".";
							for (
								var u = a.charCodeAt(0),
									c = u === 47,
									d = -1,
									m = !0,
									f = a.length - 1;
								f >= 1;
								--f
							)
								if ((u = a.charCodeAt(f)) === 47) {
									if (!m) {
										d = f;
										break;
									}
								} else m = !1;
							return d === -1
								? c
									? "/"
									: "."
								: c && d === 1
									? "//"
									: a.slice(0, d);
						},
						basename: function (a, u) {
							if (u !== void 0 && typeof u != "string")
								throw new TypeError(
									'"ext" argument must be a string',
								);
							s(a);
							var c,
								d = 0,
								m = -1,
								f = !0;
							if (
								u !== void 0 &&
								u.length > 0 &&
								u.length <= a.length
							) {
								if (u.length === a.length && u === a) return "";
								var w = u.length - 1,
									g = -1;
								for (c = a.length - 1; c >= 0; --c) {
									var k = a.charCodeAt(c);
									if (k === 47) {
										if (!f) {
											d = c + 1;
											break;
										}
									} else
										g === -1 && ((f = !1), (g = c + 1)),
											w >= 0 &&
												(k === u.charCodeAt(w)
													? --w == -1 && (m = c)
													: ((w = -1), (m = g)));
								}
								return (
									d === m
										? (m = g)
										: m === -1 && (m = a.length),
									a.slice(d, m)
								);
							}
							for (c = a.length - 1; c >= 0; --c)
								if (a.charCodeAt(c) === 47) {
									if (!f) {
										d = c + 1;
										break;
									}
								} else m === -1 && ((f = !1), (m = c + 1));
							return m === -1 ? "" : a.slice(d, m);
						},
						extname: function (a) {
							s(a);
							for (
								var u = -1,
									c = 0,
									d = -1,
									m = !0,
									f = 0,
									w = a.length - 1;
								w >= 0;
								--w
							) {
								var g = a.charCodeAt(w);
								if (g !== 47)
									d === -1 && ((m = !1), (d = w + 1)),
										g === 46
											? u === -1
												? (u = w)
												: f !== 1 && (f = 1)
											: u !== -1 && (f = -1);
								else if (!m) {
									c = w + 1;
									break;
								}
							}
							return u === -1 ||
								d === -1 ||
								f === 0 ||
								(f === 1 && u === d - 1 && u === c + 1)
								? ""
								: a.slice(u, d);
						},
						format: function (a) {
							if (a === null || typeof a != "object")
								throw new TypeError(
									'The "pathObject" argument must be of type Object. Received type ' +
										typeof a,
								);
							return (function (u, c) {
								var d = c.dir || c.root,
									m =
										c.base ||
										(c.name || "") + (c.ext || "");
								return d
									? d === c.root
										? d + m
										: d + "/" + m
									: m;
							})(0, a);
						},
						parse: function (a) {
							s(a);
							var u = {
								root: "",
								dir: "",
								base: "",
								ext: "",
								name: "",
							};
							if (a.length === 0) return u;
							var c,
								d = a.charCodeAt(0),
								m = d === 47;
							m ? ((u.root = "/"), (c = 1)) : (c = 0);
							for (
								var f = -1,
									w = 0,
									g = -1,
									k = !0,
									v = a.length - 1,
									y = 0;
								v >= c;
								--v
							)
								if ((d = a.charCodeAt(v)) !== 47)
									g === -1 && ((k = !1), (g = v + 1)),
										d === 46
											? f === -1
												? (f = v)
												: y !== 1 && (y = 1)
											: f !== -1 && (y = -1);
								else if (!k) {
									w = v + 1;
									break;
								}
							return (
								f === -1 ||
								g === -1 ||
								y === 0 ||
								(y === 1 && f === g - 1 && f === w + 1)
									? g !== -1 &&
										(u.base = u.name =
											w === 0 && m
												? a.slice(1, g)
												: a.slice(w, g))
									: (w === 0 && m
											? ((u.name = a.slice(1, f)),
												(u.base = a.slice(1, g)))
											: ((u.name = a.slice(w, f)),
												(u.base = a.slice(w, g))),
										(u.ext = a.slice(f, g))),
								w > 0
									? (u.dir = a.slice(0, w - 1))
									: m && (u.dir = "/"),
								u
							);
						},
						sep: "/",
						delimiter: ":",
						win32: null,
						posix: null,
					};
					(l.posix = l), (r.exports = l);
				},
			},
			t = {};
		function n(r) {
			var s = t[r];
			if (s !== void 0) return s.exports;
			var o = (t[r] = { exports: {} });
			return e[r](o, o.exports, n), o.exports;
		}
		(n.d = (r, s) => {
			for (var o in s)
				n.o(s, o) &&
					!n.o(r, o) &&
					Object.defineProperty(r, o, { enumerable: !0, get: s[o] });
		}),
			(n.o = (r, s) => Object.prototype.hasOwnProperty.call(r, s)),
			(n.r = (r) => {
				typeof Symbol < "u" &&
					Symbol.toStringTag &&
					Object.defineProperty(r, Symbol.toStringTag, {
						value: "Module",
					}),
					Object.defineProperty(r, "__esModule", { value: !0 });
			});
		var i = {};
		(() => {
			let r;
			n.r(i),
				n.d(i, { URI: () => m, Utils: () => H }),
				typeof process == "object"
					? (r = process.platform === "win32")
					: typeof navigator == "object" &&
						(r = navigator.userAgent.indexOf("Windows") >= 0);
			const s = /^\w[\w\d+.-]*$/,
				o = /^\//,
				l = /^\/\//;
			function a(L, _) {
				if (!L.scheme && _)
					throw new Error(
						`[UriError]: Scheme is missing: {scheme: "", authority: "${L.authority}", path: "${L.path}", query: "${L.query}", fragment: "${L.fragment}"}`,
					);
				if (L.scheme && !s.test(L.scheme))
					throw new Error(
						"[UriError]: Scheme contains illegal characters.",
					);
				if (L.path) {
					if (L.authority) {
						if (!o.test(L.path))
							throw new Error(
								'[UriError]: If a URI contains an authority component, then the path component must either be empty or begin with a slash ("/") character',
							);
					} else if (l.test(L.path))
						throw new Error(
							'[UriError]: If a URI does not contain an authority component, then the path cannot begin with two slash characters ("//")',
						);
				}
			}
			const u = "",
				c = "/",
				d =
					/^(([^:/?#]+?):)?(\/\/([^/?#]*))?([^?#]*)(\?([^#]*))?(#(.*))?/;
			class m {
				static isUri(_) {
					return (
						_ instanceof m ||
						(!!_ &&
							typeof _.authority == "string" &&
							typeof _.fragment == "string" &&
							typeof _.path == "string" &&
							typeof _.query == "string" &&
							typeof _.scheme == "string" &&
							typeof _.fsPath == "string" &&
							typeof _.with == "function" &&
							typeof _.toString == "function")
					);
				}
				scheme;
				authority;
				path;
				query;
				fragment;
				constructor(_, A, x, S, D, I = !1) {
					typeof _ == "object"
						? ((this.scheme = _.scheme || u),
							(this.authority = _.authority || u),
							(this.path = _.path || u),
							(this.query = _.query || u),
							(this.fragment = _.fragment || u))
						: ((this.scheme = (function (F, W) {
								return F || W ? F : "file";
							})(_, I)),
							(this.authority = A || u),
							(this.path = (function (F, W) {
								switch (F) {
									case "https":
									case "http":
									case "file":
										W ? W[0] !== c && (W = c + W) : (W = c);
								}
								return W;
							})(this.scheme, x || u)),
							(this.query = S || u),
							(this.fragment = D || u),
							a(this, I));
				}
				get fsPath() {
					return y(this);
				}
				with(_) {
					if (!_) return this;
					let {
						scheme: A,
						authority: x,
						path: S,
						query: D,
						fragment: I,
					} = _;
					return (
						A === void 0
							? (A = this.scheme)
							: A === null && (A = u),
						x === void 0
							? (x = this.authority)
							: x === null && (x = u),
						S === void 0 ? (S = this.path) : S === null && (S = u),
						D === void 0 ? (D = this.query) : D === null && (D = u),
						I === void 0
							? (I = this.fragment)
							: I === null && (I = u),
						A === this.scheme &&
						x === this.authority &&
						S === this.path &&
						D === this.query &&
						I === this.fragment
							? this
							: new w(A, x, S, D, I)
					);
				}
				static parse(_, A = !1) {
					const x = d.exec(_);
					return x
						? new w(
								x[2] || u,
								M(x[4] || u),
								M(x[5] || u),
								M(x[7] || u),
								M(x[9] || u),
								A,
							)
						: new w(u, u, u, u, u);
				}
				static file(_) {
					let A = u;
					if (
						(r && (_ = _.replace(/\\/g, c)),
						_[0] === c && _[1] === c)
					) {
						const x = _.indexOf(c, 2);
						x === -1
							? ((A = _.substring(2)), (_ = c))
							: ((A = _.substring(2, x)),
								(_ = _.substring(x) || c));
					}
					return new w("file", A, _, u, u);
				}
				static from(_) {
					const A = new w(
						_.scheme,
						_.authority,
						_.path,
						_.query,
						_.fragment,
					);
					return a(A, !0), A;
				}
				toString(_ = !1) {
					return E(this, _);
				}
				toJSON() {
					return this;
				}
				static revive(_) {
					if (_) {
						if (_ instanceof m) return _;
						{
							const A = new w(_);
							return (
								(A._formatted = _.external),
								(A._fsPath = _._sep === f ? _.fsPath : null),
								A
							);
						}
					}
					return _;
				}
			}
			const f = r ? 1 : void 0;
			class w extends m {
				_formatted = null;
				_fsPath = null;
				get fsPath() {
					return (
						this._fsPath || (this._fsPath = y(this)), this._fsPath
					);
				}
				toString(_ = !1) {
					return _
						? E(this, !0)
						: (this._formatted || (this._formatted = E(this, !1)),
							this._formatted);
				}
				toJSON() {
					const _ = { $mid: 1 };
					return (
						this._fsPath &&
							((_.fsPath = this._fsPath), (_._sep = f)),
						this._formatted && (_.external = this._formatted),
						this.path && (_.path = this.path),
						this.scheme && (_.scheme = this.scheme),
						this.authority && (_.authority = this.authority),
						this.query && (_.query = this.query),
						this.fragment && (_.fragment = this.fragment),
						_
					);
				}
			}
			const g = {
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
			function k(L, _, A) {
				let x,
					S = -1;
				for (let D = 0; D < L.length; D++) {
					const I = L.charCodeAt(D);
					if (
						(I >= 97 && I <= 122) ||
						(I >= 65 && I <= 90) ||
						(I >= 48 && I <= 57) ||
						I === 45 ||
						I === 46 ||
						I === 95 ||
						I === 126 ||
						(_ && I === 47) ||
						(A && I === 91) ||
						(A && I === 93) ||
						(A && I === 58)
					)
						S !== -1 &&
							((x += encodeURIComponent(L.substring(S, D))),
							(S = -1)),
							x !== void 0 && (x += L.charAt(D));
					else {
						x === void 0 && (x = L.substr(0, D));
						const F = g[I];
						F !== void 0
							? (S !== -1 &&
									((x += encodeURIComponent(
										L.substring(S, D),
									)),
									(S = -1)),
								(x += F))
							: S === -1 && (S = D);
					}
				}
				return (
					S !== -1 && (x += encodeURIComponent(L.substring(S))),
					x !== void 0 ? x : L
				);
			}
			function v(L) {
				let _;
				for (let A = 0; A < L.length; A++) {
					const x = L.charCodeAt(A);
					x === 35 || x === 63
						? (_ === void 0 && (_ = L.substr(0, A)), (_ += g[x]))
						: _ !== void 0 && (_ += L[A]);
				}
				return _ !== void 0 ? _ : L;
			}
			function y(L, _) {
				let A;
				return (
					(A =
						L.authority && L.path.length > 1 && L.scheme === "file"
							? `//${L.authority}${L.path}`
							: L.path.charCodeAt(0) === 47 &&
									((L.path.charCodeAt(1) >= 65 &&
										L.path.charCodeAt(1) <= 90) ||
										(L.path.charCodeAt(1) >= 97 &&
											L.path.charCodeAt(1) <= 122)) &&
									L.path.charCodeAt(2) === 58
								? L.path[1].toLowerCase() + L.path.substr(2)
								: L.path),
					r && (A = A.replace(/\//g, "\\")),
					A
				);
			}
			function E(L, _) {
				const A = _ ? v : k;
				let x = "",
					{
						scheme: S,
						authority: D,
						path: I,
						query: F,
						fragment: W,
					} = L;
				if (
					(S && ((x += S), (x += ":")),
					(D || S === "file") && ((x += c), (x += c)),
					D)
				) {
					let U = D.indexOf("@");
					if (U !== -1) {
						const V = D.substr(0, U);
						(D = D.substr(U + 1)),
							(U = V.lastIndexOf(":")),
							U === -1
								? (x += A(V, !1, !1))
								: ((x += A(V.substr(0, U), !1, !1)),
									(x += ":"),
									(x += A(V.substr(U + 1), !1, !0))),
							(x += "@");
					}
					(D = D.toLowerCase()),
						(U = D.lastIndexOf(":")),
						U === -1
							? (x += A(D, !1, !0))
							: ((x += A(D.substr(0, U), !1, !0)),
								(x += D.substr(U)));
				}
				if (I) {
					if (
						I.length >= 3 &&
						I.charCodeAt(0) === 47 &&
						I.charCodeAt(2) === 58
					) {
						const U = I.charCodeAt(1);
						U >= 65 &&
							U <= 90 &&
							(I = `/${String.fromCharCode(U + 32)}:${I.substr(3)}`);
					} else if (I.length >= 2 && I.charCodeAt(1) === 58) {
						const U = I.charCodeAt(0);
						U >= 65 &&
							U <= 90 &&
							(I = `${String.fromCharCode(U + 32)}:${I.substr(2)}`);
					}
					x += A(I, !0, !1);
				}
				return (
					F && ((x += "?"), (x += A(F, !1, !1))),
					W && ((x += "#"), (x += _ ? W : k(W, !1, !1))),
					x
				);
			}
			function R(L) {
				try {
					return decodeURIComponent(L);
				} catch {
					return L.length > 3 ? L.substr(0, 3) + R(L.substr(3)) : L;
				}
			}
			const N = /(%[0-9A-Za-z][0-9A-Za-z])+/g;
			function M(L) {
				return L.match(N) ? L.replace(N, (_) => R(_)) : L;
			}
			var b = n(470);
			const p = b.posix || b,
				T = "/";
			var H;
			(function (L) {
				(L.joinPath = function (_, ...A) {
					return _.with({ path: p.join(_.path, ...A) });
				}),
					(L.resolvePath = function (_, ...A) {
						let x = _.path,
							S = !1;
						x[0] !== T && ((x = T + x), (S = !0));
						let D = p.resolve(x, ...A);
						return (
							S &&
								D[0] === T &&
								!_.authority &&
								(D = D.substring(1)),
							_.with({ path: D })
						);
					}),
					(L.dirname = function (_) {
						if (_.path.length === 0 || _.path === T) return _;
						let A = p.dirname(_.path);
						return (
							A.length === 1 &&
								A.charCodeAt(0) === 46 &&
								(A = ""),
							_.with({ path: A })
						);
					}),
					(L.basename = function (_) {
						return p.basename(_.path);
					}),
					(L.extname = function (_) {
						return p.extname(_.path);
					});
			})(H || (H = {}));
		})(),
			(Aa = i);
	})();
	var { URI: Zu, Utils: Sc } = Aa;
	function ci(e) {
		const t = e[0],
			n = e[e.length - 1];
		return (
			t === n &&
				(t === "'" || t === '"') &&
				(e = e.substring(1, e.length - 1)),
			e
		);
	}
	function Ku(e, t) {
		return !e.length || (t === "handlebars" && /{{|}}/.test(e))
			? !1
			: /\b(w[\w\d+.-]*:\/\/)?[^\s()<>]+(?:\([\w\d]+\)|([^[:punct:]\s]|\/?))/.test(
					e,
				);
	}
	function ec(e, t, n, i) {
		if (/^\s*javascript\:/i.test(t) || /[\n\r]/.test(t)) return;
		t = t.replace(/^\s*/g, "");
		const r = t.match(/^(\w[\w\d+.-]*):/);
		if (r) {
			const s = r[1].toLowerCase();
			return s === "http" || s === "https" || s === "file" ? t : void 0;
		}
		return /^\#/i.test(t)
			? e + t
			: /^\/\//i.test(t)
				? (Pe(e, "https://") ? "https" : "http") +
					":" +
					t.replace(/^\s*/g, "")
				: n
					? n.resolveReference(t, i || e)
					: t;
	}
	function tc(e, t, n, i, r, s) {
		const o = ci(n);
		if (!Ku(o, e.languageId)) return;
		o.length < n.length && (i++, r--);
		const l = ec(e.uri, o, t, s);
		if (!l) return;
		const a = ic(l, e);
		return { range: G.create(e.positionAt(i), e.positionAt(r)), target: a };
	}
	var nc = 35;
	function ic(e, t) {
		try {
			let n = Zu.parse(e);
			return (
				n.scheme === "file" &&
					n.query &&
					((n = n.with({ query: null })), (e = n.toString(!0))),
				n.scheme === "file" &&
				n.fragment &&
				!(e.startsWith(t.uri) && e.charCodeAt(t.uri.length) === nc)
					? n.with({ fragment: null }).toString(!0)
					: e
			);
		} catch {
			return;
		}
	}
	var rc = class {
		constructor(e) {
			this.dataManager = e;
		}
		findDocumentLinks(e, t) {
			const n = [],
				i = pe(e.getText(), 0);
			let r = i.scan(),
				s,
				o,
				l = !1,
				a;
			const u = {};
			for (; r !== z.EOS; ) {
				switch (r) {
					case z.StartTag:
						(o = i.getTokenText().toLowerCase()),
							a || (l = o === "base");
						break;
					case z.AttributeName:
						s = i.getTokenText().toLowerCase();
						break;
					case z.AttributeValue:
						if (o && s && this.dataManager.isPathAttribute(o, s)) {
							const c = i.getTokenText();
							if (!l) {
								const d = tc(
									e,
									t,
									c,
									i.getTokenOffset(),
									i.getTokenEnd(),
									a,
								);
								d && n.push(d);
							}
							l &&
								typeof a > "u" &&
								((a = ci(c)),
								a && t && (a = t.resolveReference(a, e.uri))),
								(l = !1),
								(s = void 0);
						} else if (s === "id") {
							const c = ci(i.getTokenText());
							u[c] = i.getTokenOffset();
						}
						break;
				}
				r = i.scan();
			}
			for (const c of n) {
				const d = e.uri + "#";
				if (c.target && Pe(c.target, d)) {
					const m = c.target.substring(d.length),
						f = u[m];
					if (f !== void 0) {
						const w = e.positionAt(f);
						c.target = `${d}${w.line + 1},${w.character + 1}`;
					} else c.target = e.uri;
				}
			}
			return n;
		}
	};
	function sc(e, t, n) {
		const i = e.offsetAt(t),
			r = n.findNodeAt(i);
		if (!r.tag) return [];
		const s = [],
			o = Ca(z.StartTag, e, r.start),
			l =
				typeof r.endTagStart == "number" &&
				Ca(z.EndTag, e, r.endTagStart);
		return (
			((o && La(o, t)) || (l && La(l, t))) &&
				(o && s.push({ kind: Zt.Read, range: o }),
				l && s.push({ kind: Zt.Read, range: l })),
			s
		);
	}
	function Sa(e, t) {
		return (
			e.line < t.line || (e.line === t.line && e.character <= t.character)
		);
	}
	function La(e, t) {
		return Sa(e.start, t) && Sa(t, e.end);
	}
	function Ca(e, t, n) {
		const i = pe(t.getText(), n);
		let r = i.scan();
		for (; r !== z.EOS && r !== e; ) r = i.scan();
		return r !== z.EOS
			? {
					start: t.positionAt(i.getTokenOffset()),
					end: t.positionAt(i.getTokenEnd()),
				}
			: null;
	}
	function ac(e, t) {
		const n = [],
			i = Ea(e, t);
		for (const s of i) r(s, void 0);
		return n;
		function r(s, o) {
			const l = ti.create(s.name, s.kind, s.range, e.uri, o?.name);
			if (
				(l.containerName ?? (l.containerName = ""),
				n.push(l),
				s.children)
			)
				for (const a of s.children) r(a, s);
		}
	}
	function Ea(e, t) {
		const n = [];
		return (
			t.roots.forEach((i) => {
				Ra(e, i, n);
			}),
			n
		);
	}
	function Ra(e, t, n) {
		const i = oc(t),
			r = G.create(e.positionAt(t.start), e.positionAt(t.end)),
			s = ni.create(i, void 0, ei.Field, r, r);
		n.push(s),
			t.children.forEach((o) => {
				s.children ?? (s.children = []), Ra(e, o, s.children);
			});
	}
	function oc(e) {
		let t = e.tag;
		if (e.attributes) {
			const n = e.attributes.id,
				i = e.attributes.class;
			n && (t += `#${n.replace(/[\"\']/g, "")}`),
				i &&
					(t += i
						.replace(/[\"\']/g, "")
						.split(/\s+/)
						.map((r) => `.${r}`)
						.join(""));
		}
		return t || "?";
	}
	function lc(e, t, n, i) {
		const r = e.offsetAt(t),
			s = i.findNodeAt(r);
		if (!s.tag || !uc(s, r, s.tag)) return null;
		const o = [],
			l = {
				start: e.positionAt(s.start + 1),
				end: e.positionAt(s.start + 1 + s.tag.length),
			};
		if ((o.push({ range: l, newText: n }), s.endTagStart)) {
			const u = {
				start: e.positionAt(s.endTagStart + 2),
				end: e.positionAt(s.endTagStart + 2 + s.tag.length),
			};
			o.push({ range: u, newText: n });
		}
		return { changes: { [e.uri.toString()]: o } };
	}
	function uc(e, t, n) {
		return e.endTagStart &&
			e.endTagStart + 2 <= t &&
			t <= e.endTagStart + 2 + n.length
			? !0
			: e.start + 1 <= t && t <= e.start + 1 + n.length;
	}
	function cc(e, t, n) {
		const i = e.offsetAt(t),
			r = n.findNodeAt(i);
		if (!r.tag || !r.endTagStart) return null;
		if (r.start + 1 <= i && i <= r.start + 1 + r.tag.length) {
			const s = i - 1 - r.start + r.endTagStart + 2;
			return e.positionAt(s);
		}
		if (r.endTagStart + 2 <= i && i <= r.endTagStart + 2 + r.tag.length) {
			const s = i - 2 - r.endTagStart + r.start + 1;
			return e.positionAt(s);
		}
		return null;
	}
	function Ma(e, t, n) {
		const i = e.offsetAt(t),
			r = n.findNodeAt(i),
			s = r.tag ? r.tag.length : 0;
		return r.endTagStart &&
			((r.start + 1 <= i && i <= r.start + 1 + s) ||
				(r.endTagStart + 2 <= i && i <= r.endTagStart + 2 + s))
			? [
					G.create(
						e.positionAt(r.start + 1),
						e.positionAt(r.start + 1 + s),
					),
					G.create(
						e.positionAt(r.endTagStart + 2),
						e.positionAt(r.endTagStart + 2 + s),
					),
				]
			: null;
	}
	var hc = class {
			constructor(e) {
				this.dataManager = e;
			}
			limitRanges(e, t) {
				e = e.sort((c, d) => {
					let m = c.startLine - d.startLine;
					return m === 0 && (m = c.endLine - d.endLine), m;
				});
				let n;
				const i = [],
					r = [],
					s = [],
					o = (c, d) => {
						(r[c] = d), d < 30 && (s[d] = (s[d] || 0) + 1);
					};
				for (let c = 0; c < e.length; c++) {
					const d = e[c];
					if (!n) (n = d), o(c, 0);
					else if (d.startLine > n.startLine) {
						if (d.endLine <= n.endLine)
							i.push(n), (n = d), o(c, i.length);
						else if (d.startLine > n.endLine) {
							do n = i.pop();
							while (n && d.startLine > n.endLine);
							n && i.push(n), (n = d), o(c, i.length);
						}
					}
				}
				let l = 0,
					a = 0;
				for (let c = 0; c < s.length; c++) {
					const d = s[c];
					if (d) {
						if (d + l > t) {
							a = c;
							break;
						}
						l += d;
					}
				}
				const u = [];
				for (let c = 0; c < e.length; c++) {
					const d = r[c];
					typeof d == "number" &&
						(d < a || (d === a && l++ < t)) &&
						u.push(e[c]);
				}
				return u;
			}
			getFoldingRanges(e, t) {
				const n = this.dataManager.getVoidElements(e.languageId),
					i = pe(e.getText());
				let r = i.scan();
				const s = [],
					o = [];
				let l = null,
					a = -1;
				function u(d) {
					s.push(d), (a = d.startLine);
				}
				for (; r !== z.EOS; ) {
					switch (r) {
						case z.StartTag: {
							const d = i.getTokenText(),
								m = e.positionAt(i.getTokenOffset()).line;
							o.push({ startLine: m, tagName: d }), (l = d);
							break;
						}
						case z.EndTag: {
							l = i.getTokenText();
							break;
						}
						case z.StartTagClose:
							if (!l || !this.dataManager.isVoidElement(l, n))
								break;
						case z.EndTagClose:
						case z.StartTagSelfClose: {
							let d = o.length - 1;
							for (; d >= 0 && o[d].tagName !== l; ) d--;
							if (d >= 0) {
								const m = o[d];
								o.length = d;
								const f = e.positionAt(i.getTokenOffset()).line,
									w = m.startLine,
									g = f - 1;
								g > w &&
									a !== w &&
									u({ startLine: w, endLine: g });
							}
							break;
						}
						case z.Comment: {
							let d = e.positionAt(i.getTokenOffset()).line;
							const f = i
								.getTokenText()
								.match(/^\s*#(region\b)|(endregion\b)/);
							if (f)
								if (f[1]) o.push({ startLine: d, tagName: "" });
								else {
									let w = o.length - 1;
									for (; w >= 0 && o[w].tagName.length; ) w--;
									if (w >= 0) {
										const g = o[w];
										o.length = w;
										const k = d;
										(d = g.startLine),
											k > d &&
												a !== d &&
												u({
													startLine: d,
													endLine: k,
													kind: Jt.Region,
												});
									}
								}
							else {
								const w = e.positionAt(
									i.getTokenOffset() + i.getTokenLength(),
								).line;
								d < w &&
									u({
										startLine: d,
										endLine: w,
										kind: Jt.Comment,
									});
							}
							break;
						}
					}
					r = i.scan();
				}
				const c = (t && t.rangeLimit) || Number.MAX_VALUE;
				return s.length > c ? this.limitRanges(s, c) : s;
			}
		},
		dc = class {
			constructor(e) {
				this.htmlParser = e;
			}
			getSelectionRanges(e, t) {
				const n = this.htmlParser.parseDocument(e);
				return t.map((i) => this.getSelectionRange(i, e, n));
			}
			getSelectionRange(e, t, n) {
				const i = this.getApplicableRanges(t, e, n);
				let r, s;
				for (let o = i.length - 1; o >= 0; o--) {
					const l = i[o];
					(!r || l[0] !== r[0] || l[1] !== r[1]) &&
						(s = en.create(
							G.create(
								t.positionAt(i[o][0]),
								t.positionAt(i[o][1]),
							),
							s,
						)),
						(r = l);
				}
				return s || (s = en.create(G.create(e, e))), s;
			}
			getApplicableRanges(e, t, n) {
				const i = e.offsetAt(t),
					r = n.findNodeAt(i);
				let s = this.getAllParentTagRanges(r);
				if (r.startTagEnd && !r.endTagStart) {
					if (r.startTagEnd !== r.end) return [[r.start, r.end]];
					const o = G.create(
						e.positionAt(r.startTagEnd - 2),
						e.positionAt(r.startTagEnd),
					);
					return (
						e.getText(o) === "/>"
							? s.unshift([r.start + 1, r.startTagEnd - 2])
							: s.unshift([r.start + 1, r.startTagEnd - 1]),
						(s = this.getAttributeLevelRanges(e, r, i).concat(s)),
						s
					);
				}
				return !r.startTagEnd || !r.endTagStart
					? s
					: (s.unshift([r.start, r.end]),
						r.start < i && i < r.startTagEnd
							? (s.unshift([r.start + 1, r.startTagEnd - 1]),
								(s = this.getAttributeLevelRanges(
									e,
									r,
									i,
								).concat(s)),
								s)
							: r.startTagEnd <= i && i <= r.endTagStart
								? (s.unshift([r.startTagEnd, r.endTagStart]), s)
								: (i >= r.endTagStart + 2 &&
										s.unshift([
											r.endTagStart + 2,
											r.end - 1,
										]),
									s));
			}
			getAllParentTagRanges(e) {
				let t = e;
				const n = [];
				for (; t.parent; )
					(t = t.parent),
						this.getNodeRanges(t).forEach((i) => n.push(i));
				return n;
			}
			getNodeRanges(e) {
				return e.startTagEnd &&
					e.endTagStart &&
					e.startTagEnd < e.endTagStart
					? [
							[e.startTagEnd, e.endTagStart],
							[e.start, e.end],
						]
					: [[e.start, e.end]];
			}
			getAttributeLevelRanges(e, t, n) {
				const i = G.create(e.positionAt(t.start), e.positionAt(t.end)),
					r = e.getText(i),
					s = n - t.start,
					o = pe(r);
				let l = o.scan();
				const a = t.start,
					u = [];
				let c = !1,
					d = -1;
				for (; l !== z.EOS; ) {
					switch (l) {
						case z.AttributeName: {
							if (s < o.getTokenOffset()) {
								c = !1;
								break;
							}
							s <= o.getTokenEnd() &&
								u.unshift([
									o.getTokenOffset(),
									o.getTokenEnd(),
								]),
								(c = !0),
								(d = o.getTokenOffset());
							break;
						}
						case z.AttributeValue: {
							if (!c) break;
							const m = o.getTokenText();
							if (s < o.getTokenOffset()) {
								u.push([d, o.getTokenEnd()]);
								break;
							}
							s >= o.getTokenOffset() &&
								s <= o.getTokenEnd() &&
								(u.unshift([
									o.getTokenOffset(),
									o.getTokenEnd(),
								]),
								((m[0] === '"' && m[m.length - 1] === '"') ||
									(m[0] === "'" &&
										m[m.length - 1] === "'")) &&
									s >= o.getTokenOffset() + 1 &&
									s <= o.getTokenEnd() - 1 &&
									u.unshift([
										o.getTokenOffset() + 1,
										o.getTokenEnd() - 1,
									]),
								u.push([d, o.getTokenEnd()]));
							break;
						}
					}
					l = o.scan();
				}
				return u.map((m) => [m[0] + a, m[1] + a]);
			}
		},
		mc = {
			version: 1.1,
			tags: [
				{
					name: "html",
					description: {
						kind: "markdown",
						value: "The html element represents the root of an HTML document.",
					},
					attributes: [
						{
							name: "manifest",
							description: {
								kind: "markdown",
								value: "Specifies the URI of a resource manifest indicating resources that should be cached locally. See [Using the application cache](https://developer.mozilla.org/en-US/docs/Web/HTML/Using_the_application_cache) for details.",
							},
						},
						{
							name: "version",
							description:
								'Specifies the version of the HTML [Document Type Definition](https://developer.mozilla.org/en-US/docs/Glossary/DTD "Document Type Definition: In HTML, the doctype is the required "<!DOCTYPE html>" preamble found at the top of all documents. Its sole purpose is to prevent a browser from switching into so-called “quirks mode” when rendering a document; that is, the "<!DOCTYPE html>" doctype ensures that the browser makes a best-effort attempt at following the relevant specifications, rather than using a different rendering mode that is incompatible with some specifications.") that governs the current document. This attribute is not needed, because it is redundant with the version information in the document type declaration.',
						},
						{
							name: "xmlns",
							description:
								'Specifies the XML Namespace of the document. Default value is `"http://www.w3.org/1999/xhtml"`. This is required in documents parsed with XML parsers, and optional in text/html documents.',
						},
					],
					references: [
						{
							name: "MDN Reference",
							url: "https://developer.mozilla.org/docs/Web/HTML/Element/html",
						},
					],
				},
				{
					name: "head",
					description: {
						kind: "markdown",
						value: "The head element represents a collection of metadata for the Document.",
					},
					attributes: [
						{
							name: "profile",
							description:
								"The URIs of one or more metadata profiles, separated by white space.",
						},
					],
					references: [
						{
							name: "MDN Reference",
							url: "https://developer.mozilla.org/docs/Web/HTML/Element/head",
						},
					],
				},
				{
					name: "title",
					description: {
						kind: "markdown",
						value: "The title element represents the document's title or name. Authors should use titles that identify their documents even when they are used out of context, for example in a user's history or bookmarks, or in search results. The document's title is often different from its first heading, since the first heading does not have to stand alone when taken out of context.",
					},
					attributes: [],
					references: [
						{
							name: "MDN Reference",
							url: "https://developer.mozilla.org/docs/Web/HTML/Element/title",
						},
					],
				},
				{
					name: "base",
					description: {
						kind: "markdown",
						value: "The base element allows authors to specify the document base URL for the purposes of resolving relative URLs, and the name of the default browsing context for the purposes of following hyperlinks. The element does not represent any content beyond this information.",
					},
					void: !0,
					attributes: [
						{
							name: "href",
							description: {
								kind: "markdown",
								value: "The base URL to be used throughout the document for relative URL addresses. If this attribute is specified, this element must come before any other elements with attributes whose values are URLs. Absolute and relative URLs are allowed.",
							},
						},
						{
							name: "target",
							valueSet: "target",
							description: {
								kind: "markdown",
								value: "A name or keyword indicating the default location to display the result when hyperlinks or forms cause navigation, for elements that do not have an explicit target reference. It is a name of, or keyword for, a _browsing context_ (for example: tab, window, or inline frame). The following keywords have special meanings:\n\n*   `_self`: Load the result into the same browsing context as the current one. This value is the default if the attribute is not specified.\n*   `_blank`: Load the result into a new unnamed browsing context.\n*   `_parent`: Load the result into the parent browsing context of the current one. If there is no parent, this option behaves the same way as `_self`.\n*   `_top`: Load the result into the top-level browsing context (that is, the browsing context that is an ancestor of the current one, and has no parent). If there is no parent, this option behaves the same way as `_self`.\n\nIf this attribute is specified, this element must come before any other elements with attributes whose values are URLs.",
							},
						},
					],
					references: [
						{
							name: "MDN Reference",
							url: "https://developer.mozilla.org/docs/Web/HTML/Element/base",
						},
					],
				},
				{
					name: "link",
					description: {
						kind: "markdown",
						value: "The link element allows authors to link their document to other resources.",
					},
					void: !0,
					attributes: [
						{
							name: "href",
							description: {
								kind: "markdown",
								value: 'This attribute specifies the [URL](https://developer.mozilla.org/en-US/docs/Glossary/URL "URL: Uniform Resource Locator (URL) is a text string specifying where a resource can be found on the Internet.") of the linked resource. A URL can be absolute or relative.',
							},
						},
						{
							name: "crossorigin",
							valueSet: "xo",
							description: {
								kind: "markdown",
								value: 'This enumerated attribute indicates whether [CORS](https://developer.mozilla.org/en-US/docs/Glossary/CORS "CORS: CORS (Cross-Origin Resource Sharing) is a system, consisting of transmitting HTTP headers, that determines whether browsers block frontend JavaScript code from accessing responses for cross-origin requests.") must be used when fetching the resource. [CORS-enabled images](https://developer.mozilla.org/en-US/docs/Web/HTML/CORS_Enabled_Image) can be reused in the [`<canvas>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/canvas "Use the HTML <canvas> element with either the canvas scripting API or the WebGL API to draw graphics and animations.") element without being _tainted_. The allowed values are:\n\n`anonymous`\n\nA cross-origin request (i.e. with an [`Origin`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Origin "The Origin request header indicates where a fetch originates from. It doesn\'t include any path information, but only the server name. It is sent with CORS requests, as well as with POST requests. It is similar to the Referer header, but, unlike this header, it doesn\'t disclose the whole path.") HTTP header) is performed, but no credential is sent (i.e. no cookie, X.509 certificate, or HTTP Basic authentication). If the server does not give credentials to the origin site (by not setting the [`Access-Control-Allow-Origin`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Access-Control-Allow-Origin "The Access-Control-Allow-Origin response header indicates whether the response can be shared with requesting code from the given origin.") HTTP header) the image will be tainted and its usage restricted.\n\n`use-credentials`\n\nA cross-origin request (i.e. with an `Origin` HTTP header) is performed along with a credential sent (i.e. a cookie, certificate, and/or HTTP Basic authentication is performed). If the server does not give credentials to the origin site (through [`Access-Control-Allow-Credentials`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Access-Control-Allow-Credentials "The Access-Control-Allow-Credentials response header tells browsers whether to expose the response to frontend JavaScript code when the request\'s credentials mode (Request.credentials) is "include".") HTTP header), the resource will be _tainted_ and its usage restricted.\n\nIf the attribute is not present, the resource is fetched without a [CORS](https://developer.mozilla.org/en-US/docs/Glossary/CORS "CORS: CORS (Cross-Origin Resource Sharing) is a system, consisting of transmitting HTTP headers, that determines whether browsers block frontend JavaScript code from accessing responses for cross-origin requests.") request (i.e. without sending the `Origin` HTTP header), preventing its non-tainted usage. If invalid, it is handled as if the enumerated keyword **anonymous** was used. See [CORS settings attributes](https://developer.mozilla.org/en-US/docs/Web/HTML/CORS_settings_attributes) for additional information.',
							},
						},
						{
							name: "rel",
							description: {
								kind: "markdown",
								value: "This attribute names a relationship of the linked document to the current document. The attribute must be a space-separated list of the [link types values](https://developer.mozilla.org/en-US/docs/Web/HTML/Link_types).",
							},
						},
						{
							name: "media",
							description: {
								kind: "markdown",
								value: "This attribute specifies the media that the linked resource applies to. Its value must be a media type / [media query](https://developer.mozilla.org/en-US/docs/Web/CSS/Media_queries). This attribute is mainly useful when linking to external stylesheets — it allows the user agent to pick the best adapted one for the device it runs on.\n\n**Notes:**\n\n*   In HTML 4, this can only be a simple white-space-separated list of media description literals, i.e., [media types and groups](https://developer.mozilla.org/en-US/docs/Web/CSS/@media), where defined and allowed as values for this attribute, such as `print`, `screen`, `aural`, `braille`. HTML5 extended this to any kind of [media queries](https://developer.mozilla.org/en-US/docs/Web/CSS/Media_queries), which are a superset of the allowed values of HTML 4.\n*   Browsers not supporting [CSS3 Media Queries](https://developer.mozilla.org/en-US/docs/Web/CSS/Media_queries) won't necessarily recognize the adequate link; do not forget to set fallback links, the restricted set of media queries defined in HTML 4.",
							},
						},
						{
							name: "hreflang",
							description: {
								kind: "markdown",
								value: "This attribute indicates the language of the linked resource. It is purely advisory. Allowed values are determined by [BCP47](https://www.ietf.org/rfc/bcp/bcp47.txt). Use this attribute only if the [`href`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/a#attr-href) attribute is present.",
							},
						},
						{
							name: "type",
							description: {
								kind: "markdown",
								value: 'This attribute is used to define the type of the content linked to. The value of the attribute should be a MIME type such as **text/html**, **text/css**, and so on. The common use of this attribute is to define the type of stylesheet being referenced (such as **text/css**), but given that CSS is the only stylesheet language used on the web, not only is it possible to omit the `type` attribute, but is actually now recommended practice. It is also used on `rel="preload"` link types, to make sure the browser only downloads file types that it supports.',
							},
						},
						{
							name: "sizes",
							description: {
								kind: "markdown",
								value: "This attribute defines the sizes of the icons for visual media contained in the resource. It must be present only if the [`rel`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/link#attr-rel) contains a value of `icon` or a non-standard type such as Apple's `apple-touch-icon`. It may have the following values:\n\n*   `any`, meaning that the icon can be scaled to any size as it is in a vector format, like `image/svg+xml`.\n*   a white-space separated list of sizes, each in the format `_<width in pixels>_x_<height in pixels>_` or `_<width in pixels>_X_<height in pixels>_`. Each of these sizes must be contained in the resource.\n\n**Note:** Most icon formats are only able to store one single icon; therefore most of the time the [`sizes`](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes#attr-sizes) contains only one entry. MS's ICO format does, as well as Apple's ICNS. ICO is more ubiquitous; you should definitely use it.",
							},
						},
						{
							name: "as",
							description:
								'This attribute is only used when `rel="preload"` or `rel="prefetch"` has been set on the `<link>` element. It specifies the type of content being loaded by the `<link>`, which is necessary for content prioritization, request matching, application of correct [content security policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP), and setting of correct [`Accept`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Accept "The Accept request HTTP header advertises which content types, expressed as MIME types, the client is able to understand. Using content negotiation, the server then selects one of the proposals, uses it and informs the client of its choice with the Content-Type response header. Browsers set adequate values for this header depending on the context where the request is done: when fetching a CSS stylesheet a different value is set for the request than when fetching an image, video or a script.") request header.',
						},
						{
							name: "importance",
							description:
								"Indicates the relative importance of the resource. Priority hints are delegated using the values:",
						},
						{
							name: "importance",
							description:
								'**`auto`**: Indicates **no preference**. The browser may use its own heuristics to decide the priority of the resource.\n\n**`high`**: Indicates to the browser that the resource is of **high** priority.\n\n**`low`**: Indicates to the browser that the resource is of **low** priority.\n\n**Note:** The `importance` attribute may only be used for the `<link>` element if `rel="preload"` or `rel="prefetch"` is present.',
						},
						{
							name: "integrity",
							description:
								"Contains inline metadata — a base64-encoded cryptographic hash of the resource (file) you’re telling the browser to fetch. The browser can use this to verify that the fetched resource has been delivered free of unexpected manipulation. See [Subresource Integrity](https://developer.mozilla.org/en-US/docs/Web/Security/Subresource_Integrity).",
						},
						{
							name: "referrerpolicy",
							description:
								'A string indicating which referrer to use when fetching the resource:\n\n*   `no-referrer` means that the [`Referer`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Referer "The Referer request header contains the address of the previous web page from which a link to the currently requested page was followed. The Referer header allows servers to identify where people are visiting them from and may use that data for analytics, logging, or optimized caching, for example.") header will not be sent.\n*   `no-referrer-when-downgrade` means that no [`Referer`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Referer "The Referer request header contains the address of the previous web page from which a link to the currently requested page was followed. The Referer header allows servers to identify where people are visiting them from and may use that data for analytics, logging, or optimized caching, for example.") header will be sent when navigating to an origin without TLS (HTTPS). This is a user agent’s default behavior, if no policy is otherwise specified.\n*   `origin` means that the referrer will be the origin of the page, which is roughly the scheme, the host, and the port.\n*   `origin-when-cross-origin` means that navigating to other origins will be limited to the scheme, the host, and the port, while navigating on the same origin will include the referrer\'s path.\n*   `unsafe-url` means that the referrer will include the origin and the path (but not the fragment, password, or username). This case is unsafe because it can leak origins and paths from TLS-protected resources to insecure origins.',
						},
						{
							name: "title",
							description:
								'The `title` attribute has special semantics on the `<link>` element. When used on a `<link rel="stylesheet">` it defines a [preferred or an alternate stylesheet](https://developer.mozilla.org/en-US/docs/Web/CSS/Alternative_style_sheets). Incorrectly using it may [cause the stylesheet to be ignored](https://developer.mozilla.org/en-US/docs/Correctly_Using_Titles_With_External_Stylesheets).',
						},
					],
					references: [
						{
							name: "MDN Reference",
							url: "https://developer.mozilla.org/docs/Web/HTML/Element/link",
						},
					],
				},
				{
					name: "meta",
					description: {
						kind: "markdown",
						value: "The meta element represents various kinds of metadata that cannot be expressed using the title, base, link, style, and script elements.",
					},
					void: !0,
					attributes: [
						{
							name: "name",
							description: {
								kind: "markdown",
								value: `This attribute defines the name of a piece of document-level metadata. It should not be set if one of the attributes [\`itemprop\`](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes#attr-itemprop), [\`http-equiv\`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/meta#attr-http-equiv) or [\`charset\`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/meta#attr-charset) is also set.

This metadata name is associated with the value contained by the [\`content\`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/meta#attr-content) attribute. The possible values for the name attribute are:

*   \`application-name\` which defines the name of the application running in the web page.
    
    **Note:**
    
    *   Browsers may use this to identify the application. It is different from the [\`<title>\`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/title "The HTML Title element (<title>) defines the document's title that is shown in a browser's title bar or a page's tab.") element, which usually contain the application name, but may also contain information like the document name or a status.
    *   Simple web pages shouldn't define an application-name.
    
*   \`author\` which defines the name of the document's author.
*   \`description\` which contains a short and accurate summary of the content of the page. Several browsers, like Firefox and Opera, use this as the default description of bookmarked pages.
*   \`generator\` which contains the identifier of the software that generated the page.
*   \`keywords\` which contains words relevant to the page's content separated by commas.
*   \`referrer\` which controls the [\`Referer\` HTTP header](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Referer) attached to requests sent from the document:
    
    Values for the \`content\` attribute of \`<meta name="referrer">\`
    
    \`no-referrer\`
    
    Do not send a HTTP \`Referrer\` header.
    
    \`origin\`
    
    Send the [origin](https://developer.mozilla.org/en-US/docs/Glossary/Origin) of the document.
    
    \`no-referrer-when-downgrade\`
    
    Send the [origin](https://developer.mozilla.org/en-US/docs/Glossary/Origin) as a referrer to URLs as secure as the current page, (https→https), but does not send a referrer to less secure URLs (https→http). This is the default behaviour.
    
    \`origin-when-cross-origin\`
    
    Send the full URL (stripped of parameters) for same-origin requests, but only send the [origin](https://developer.mozilla.org/en-US/docs/Glossary/Origin) for other cases.
    
    \`same-origin\`
    
    A referrer will be sent for [same-site origins](https://developer.mozilla.org/en-US/docs/Web/Security/Same-origin_policy), but cross-origin requests will contain no referrer information.
    
    \`strict-origin\`
    
    Only send the origin of the document as the referrer to a-priori as-much-secure destination (HTTPS->HTTPS), but don't send it to a less secure destination (HTTPS->HTTP).
    
    \`strict-origin-when-cross-origin\`
    
    Send a full URL when performing a same-origin request, only send the origin of the document to a-priori as-much-secure destination (HTTPS->HTTPS), and send no header to a less secure destination (HTTPS->HTTP).
    
    \`unsafe-URL\`
    
    Send the full URL (stripped of parameters) for same-origin or cross-origin requests.
    
    **Notes:**
    
    *   Some browsers support the deprecated values of \`always\`, \`default\`, and \`never\` for referrer.
    *   Dynamically inserting \`<meta name="referrer">\` (with [\`document.write\`](https://developer.mozilla.org/en-US/docs/Web/API/Document/write) or [\`appendChild\`](https://developer.mozilla.org/en-US/docs/Web/API/Node/appendChild)) makes the referrer behaviour unpredictable.
    *   When several conflicting policies are defined, the no-referrer policy is applied.
    

This attribute may also have a value taken from the extended list defined on [WHATWG Wiki MetaExtensions page](https://wiki.whatwg.org/wiki/MetaExtensions). Although none have been formally accepted yet, a few commonly used names are:

*   \`creator\` which defines the name of the creator of the document, such as an organization or institution. If there are more than one, several [\`<meta>\`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/meta "The HTML <meta> element represents metadata that cannot be represented by other HTML meta-related elements, like <base>, <link>, <script>, <style> or <title>.") elements should be used.
*   \`googlebot\`, a synonym of \`robots\`, is only followed by Googlebot (the indexing crawler for Google).
*   \`publisher\` which defines the name of the document's publisher.
*   \`robots\` which defines the behaviour that cooperative crawlers, or "robots", should use with the page. It is a comma-separated list of the values below:
    
    Values for the content of \`<meta name="robots">\`
    
    Value
    
    Description
    
    Used by
    
    \`index\`
    
    Allows the robot to index the page (default).
    
    All
    
    \`noindex\`
    
    Requests the robot to not index the page.
    
    All
    
    \`follow\`
    
    Allows the robot to follow the links on the page (default).
    
    All
    
    \`nofollow\`
    
    Requests the robot to not follow the links on the page.
    
    All
    
    \`none\`
    
    Equivalent to \`noindex, nofollow\`
    
    [Google](https://support.google.com/webmasters/answer/79812)
    
    \`noodp\`
    
    Prevents using the [Open Directory Project](https://www.dmoz.org/) description, if any, as the page description in search engine results.
    
    [Google](https://support.google.com/webmasters/answer/35624#nodmoz), [Yahoo](https://help.yahoo.com/kb/search-for-desktop/meta-tags-robotstxt-yahoo-search-sln2213.html#cont5), [Bing](https://www.bing.com/webmaster/help/which-robots-metatags-does-bing-support-5198d240)
    
    \`noarchive\`
    
    Requests the search engine not to cache the page content.
    
    [Google](https://developers.google.com/webmasters/control-crawl-index/docs/robots_meta_tag#valid-indexing--serving-directives), [Yahoo](https://help.yahoo.com/kb/search-for-desktop/SLN2213.html), [Bing](https://www.bing.com/webmaster/help/which-robots-metatags-does-bing-support-5198d240)
    
    \`nosnippet\`
    
    Prevents displaying any description of the page in search engine results.
    
    [Google](https://developers.google.com/webmasters/control-crawl-index/docs/robots_meta_tag#valid-indexing--serving-directives), [Bing](https://www.bing.com/webmaster/help/which-robots-metatags-does-bing-support-5198d240)
    
    \`noimageindex\`
    
    Requests this page not to appear as the referring page of an indexed image.
    
    [Google](https://developers.google.com/webmasters/control-crawl-index/docs/robots_meta_tag#valid-indexing--serving-directives)
    
    \`nocache\`
    
    Synonym of \`noarchive\`.
    
    [Bing](https://www.bing.com/webmaster/help/which-robots-metatags-does-bing-support-5198d240)
    
    **Notes:**
    
    *   Only cooperative robots follow these rules. Do not expect to prevent e-mail harvesters with them.
    *   The robot still needs to access the page in order to read these rules. To prevent bandwidth consumption, use a _[robots.txt](https://developer.mozilla.org/en-US/docs/Glossary/robots.txt "robots.txt: Robots.txt is a file which is usually placed in the root of any website. It decides whether crawlers are permitted or forbidden access to the web site.")_ file.
    *   If you want to remove a page, \`noindex\` will work, but only after the robot visits the page again. Ensure that the \`robots.txt\` file is not preventing revisits.
    *   Some values are mutually exclusive, like \`index\` and \`noindex\`, or \`follow\` and \`nofollow\`. In these cases the robot's behaviour is undefined and may vary between them.
    *   Some crawler robots, like Google, Yahoo and Bing, support the same values for the HTTP header \`X-Robots-Tag\`; this allows non-HTML documents like images to use these rules.
    
*   \`slurp\`, is a synonym of \`robots\`, but only for Slurp - the crawler for Yahoo Search.
*   \`viewport\`, which gives hints about the size of the initial size of the [viewport](https://developer.mozilla.org/en-US/docs/Glossary/viewport "viewport: A viewport represents a polygonal (normally rectangular) area in computer graphics that is currently being viewed. In web browser terms, it refers to the part of the document you're viewing which is currently visible in its window (or the screen, if the document is being viewed in full screen mode). Content outside the viewport is not visible onscreen until scrolled into view."). Used by mobile devices only.
    
    Values for the content of \`<meta name="viewport">\`
    
    Value
    
    Possible subvalues
    
    Description
    
    \`width\`
    
    A positive integer number, or the text \`device-width\`
    
    Defines the pixel width of the viewport that you want the web site to be rendered at.
    
    \`height\`
    
    A positive integer, or the text \`device-height\`
    
    Defines the height of the viewport. Not used by any browser.
    
    \`initial-scale\`
    
    A positive number between \`0.0\` and \`10.0\`
    
    Defines the ratio between the device width (\`device-width\` in portrait mode or \`device-height\` in landscape mode) and the viewport size.
    
    \`maximum-scale\`
    
    A positive number between \`0.0\` and \`10.0\`
    
    Defines the maximum amount to zoom in. It must be greater or equal to the \`minimum-scale\` or the behaviour is undefined. Browser settings can ignore this rule and iOS10+ ignores it by default.
    
    \`minimum-scale\`
    
    A positive number between \`0.0\` and \`10.0\`
    
    Defines the minimum zoom level. It must be smaller or equal to the \`maximum-scale\` or the behaviour is undefined. Browser settings can ignore this rule and iOS10+ ignores it by default.
    
    \`user-scalable\`
    
    \`yes\` or \`no\`
    
    If set to \`no\`, the user is not able to zoom in the webpage. The default is \`yes\`. Browser settings can ignore this rule, and iOS10+ ignores it by default.
    
    Specification
    
    Status
    
    Comment
    
    [CSS Device Adaptation  
    The definition of '<meta name="viewport">' in that specification.](https://drafts.csswg.org/css-device-adapt/#viewport-meta)
    
    Working Draft
    
    Non-normatively describes the Viewport META element
    
    See also: [\`@viewport\`](https://developer.mozilla.org/en-US/docs/Web/CSS/@viewport "The @viewport CSS at-rule lets you configure the viewport through which the document is viewed. It's primarily used for mobile devices, but is also used by desktop browsers that support features like "snap to edge" (such as Microsoft Edge).")
    
    **Notes:**
    
    *   Though unstandardized, this declaration is respected by most mobile browsers due to de-facto dominance.
    *   The default values may vary between devices and browsers.
    *   To learn about this declaration in Firefox for Mobile, see [this article](https://developer.mozilla.org/en-US/docs/Mobile/Viewport_meta_tag "Mobile/Viewport meta tag").`,
							},
						},
						{
							name: "http-equiv",
							description: {
								kind: "markdown",
								value: 'Defines a pragma directive. The attribute is named `**http-equiv**(alent)` because all the allowed values are names of particular HTTP headers:\n\n*   `"content-language"`  \n    Defines the default language of the page. It can be overridden by the [lang](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/lang) attribute on any element.\n    \n    **Warning:** Do not use this value, as it is obsolete. Prefer the `lang` attribute on the [`<html>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/html "The HTML <html> element represents the root (top-level element) of an HTML document, so it is also referred to as the root element. All other elements must be descendants of this element.") element.\n    \n*   `"content-security-policy"`  \n    Allows page authors to define a [content policy](https://developer.mozilla.org/en-US/docs/Web/Security/CSP/CSP_policy_directives) for the current page. Content policies mostly specify allowed server origins and script endpoints which help guard against cross-site scripting attacks.\n*   `"content-type"`  \n    Defines the [MIME type](https://developer.mozilla.org/en-US/docs/Glossary/MIME_type) of the document, followed by its character encoding. It follows the same syntax as the HTTP `content-type` entity-header field, but as it is inside a HTML page, most values other than `text/html` are impossible. Therefore the valid syntax for its `content` is the string \'`text/html`\' followed by a character set with the following syntax: \'`; charset=_IANAcharset_`\', where `IANAcharset` is the _preferred MIME name_ for a character set as [defined by the IANA.](https://www.iana.org/assignments/character-sets)\n    \n    **Warning:** Do not use this value, as it is obsolete. Use the [`charset`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/meta#attr-charset) attribute on the [`<meta>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/meta "The HTML <meta> element represents metadata that cannot be represented by other HTML meta-related elements, like <base>, <link>, <script>, <style> or <title>.") element.\n    \n    **Note:** As [`<meta>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/meta "The HTML <meta> element represents metadata that cannot be represented by other HTML meta-related elements, like <base>, <link>, <script>, <style> or <title>.") can\'t change documents\' types in XHTML or HTML5\'s XHTML serialization, never set the MIME type to an XHTML MIME type with `<meta>`.\n    \n*   `"refresh"`  \n    This instruction specifies:\n    *   The number of seconds until the page should be reloaded - only if the [`content`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/meta#attr-content) attribute contains a positive integer.\n    *   The number of seconds until the page should redirect to another - only if the [`content`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/meta#attr-content) attribute contains a positive integer followed by the string \'`;url=`\', and a valid URL.\n*   `"set-cookie"`  \n    Defines a [cookie](https://developer.mozilla.org/en-US/docs/cookie) for the page. Its content must follow the syntax defined in the [IETF HTTP Cookie Specification](https://tools.ietf.org/html/draft-ietf-httpstate-cookie-14).\n    \n    **Warning:** Do not use this instruction, as it is obsolete. Use the HTTP header [`Set-Cookie`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie) instead.',
							},
						},
						{
							name: "content",
							description: {
								kind: "markdown",
								value: "This attribute contains the value for the [`http-equiv`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/meta#attr-http-equiv) or [`name`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/meta#attr-name) attribute, depending on which is used.",
							},
						},
						{
							name: "charset",
							description: {
								kind: "markdown",
								value: 'This attribute declares the page\'s character encoding. It must contain a [standard IANA MIME name for character encodings](https://www.iana.org/assignments/character-sets). Although the standard doesn\'t request a specific encoding, it suggests:\n\n*   Authors are encouraged to use [`UTF-8`](https://developer.mozilla.org/en-US/docs/Glossary/UTF-8).\n*   Authors should not use ASCII-incompatible encodings to avoid security risk: browsers not supporting them may interpret harmful content as HTML. This happens with the `JIS_C6226-1983`, `JIS_X0212-1990`, `HZ-GB-2312`, `JOHAB`, the ISO-2022 family and the EBCDIC family.\n\n**Note:** ASCII-incompatible encodings are those that don\'t map the 8-bit code points `0x20` to `0x7E` to the `0x0020` to `0x007E` Unicode code points)\n\n*   Authors **must not** use `CESU-8`, `UTF-7`, `BOCU-1` and/or `SCSU` as [cross-site scripting](https://developer.mozilla.org/en-US/docs/Glossary/Cross-site_scripting) attacks with these encodings have been demonstrated.\n*   Authors should not use `UTF-32` because not all HTML5 encoding algorithms can distinguish it from `UTF-16`.\n\n**Notes:**\n\n*   The declared character encoding must match the one the page was saved with to avoid garbled characters and security holes.\n*   The [`<meta>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/meta "The HTML <meta> element represents metadata that cannot be represented by other HTML meta-related elements, like <base>, <link>, <script>, <style> or <title>.") element declaring the encoding must be inside the [`<head>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/head "The HTML <head> element provides general information (metadata) about the document, including its title and links to its scripts and style sheets.") element and **within the first 1024 bytes** of the HTML as some browsers only look at those bytes before choosing an encoding.\n*   This [`<meta>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/meta "The HTML <meta> element represents metadata that cannot be represented by other HTML meta-related elements, like <base>, <link>, <script>, <style> or <title>.") element is only one part of the [algorithm to determine a page\'s character set](https://www.whatwg.org/specs/web-apps/current-work/multipage/parsing.html#encoding-sniffing-algorithm "Algorithm charset page"). The [`Content-Type` header](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Type) and any [Byte-Order Marks](https://developer.mozilla.org/en-US/docs/Glossary/Byte-Order_Mark "The definition of that term (Byte-Order Marks) has not been written yet; please consider contributing it!") override this element.\n*   It is strongly recommended to define the character encoding. If a page\'s encoding is undefined, cross-scripting techniques are possible, such as the [`UTF-7` fallback cross-scripting technique](https://code.google.com/p/doctype-mirror/wiki/ArticleUtf7).\n*   The [`<meta>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/meta "The HTML <meta> element represents metadata that cannot be represented by other HTML meta-related elements, like <base>, <link>, <script>, <style> or <title>.") element with a `charset` attribute is a synonym for the pre-HTML5 `<meta http-equiv="Content-Type" content="text/html; charset=_IANAcharset_">`, where _`IANAcharset`_ contains the value of the equivalent [`charset`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/meta#attr-charset) attribute. This syntax is still allowed, although no longer recommended.',
							},
						},
						{
							name: "scheme",
							description:
								"This attribute defines the scheme in which metadata is described. A scheme is a context leading to the correct interpretations of the [`content`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/meta#attr-content) value, like a format.\n\n**Warning:** Do not use this value, as it is obsolete. There is no replacement as there was no real usage for it.",
						},
					],
					references: [
						{
							name: "MDN Reference",
							url: "https://developer.mozilla.org/docs/Web/HTML/Element/meta",
						},
					],
				},
				{
					name: "style",
					description: {
						kind: "markdown",
						value: "The style element allows authors to embed style information in their documents. The style element is one of several inputs to the styling processing model. The element does not represent content for the user.",
					},
					attributes: [
						{
							name: "media",
							description: {
								kind: "markdown",
								value: "This attribute defines which media the style should be applied to. Its value is a [media query](https://developer.mozilla.org/en-US/docs/Web/Guide/CSS/Media_queries), which defaults to `all` if the attribute is missing.",
							},
						},
						{
							name: "nonce",
							description: {
								kind: "markdown",
								value: "A cryptographic nonce (number used once) used to whitelist inline styles in a [style-src Content-Security-Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/style-src). The server must generate a unique nonce value each time it transmits a policy. It is critical to provide a nonce that cannot be guessed as bypassing a resource’s policy is otherwise trivial.",
							},
						},
						{
							name: "type",
							description: {
								kind: "markdown",
								value: "This attribute defines the styling language as a MIME type (charset should not be specified). This attribute is optional and defaults to `text/css` if it is not specified — there is very little reason to include this in modern web documents.",
							},
						},
						{ name: "scoped", valueSet: "v" },
						{
							name: "title",
							description:
								"This attribute specifies [alternative style sheet](https://developer.mozilla.org/en-US/docs/Web/CSS/Alternative_style_sheets) sets.",
						},
					],
					references: [
						{
							name: "MDN Reference",
							url: "https://developer.mozilla.org/docs/Web/HTML/Element/style",
						},
					],
				},
				{
					name: "body",
					description: {
						kind: "markdown",
						value: "The body element represents the content of the document.",
					},
					attributes: [
						{
							name: "onafterprint",
							description: {
								kind: "markdown",
								value: "Function to call after the user has printed the document.",
							},
						},
						{
							name: "onbeforeprint",
							description: {
								kind: "markdown",
								value: "Function to call when the user requests printing of the document.",
							},
						},
						{
							name: "onbeforeunload",
							description: {
								kind: "markdown",
								value: "Function to call when the document is about to be unloaded.",
							},
						},
						{
							name: "onhashchange",
							description: {
								kind: "markdown",
								value: "Function to call when the fragment identifier part (starting with the hash (`'#'`) character) of the document's current address has changed.",
							},
						},
						{
							name: "onlanguagechange",
							description: {
								kind: "markdown",
								value: "Function to call when the preferred languages changed.",
							},
						},
						{
							name: "onmessage",
							description: {
								kind: "markdown",
								value: "Function to call when the document has received a message.",
							},
						},
						{
							name: "onoffline",
							description: {
								kind: "markdown",
								value: "Function to call when network communication has failed.",
							},
						},
						{
							name: "ononline",
							description: {
								kind: "markdown",
								value: "Function to call when network communication has been restored.",
							},
						},
						{ name: "onpagehide" },
						{ name: "onpageshow" },
						{
							name: "onpopstate",
							description: {
								kind: "markdown",
								value: "Function to call when the user has navigated session history.",
							},
						},
						{
							name: "onstorage",
							description: {
								kind: "markdown",
								value: "Function to call when the storage area has changed.",
							},
						},
						{
							name: "onunload",
							description: {
								kind: "markdown",
								value: "Function to call when the document is going away.",
							},
						},
						{
							name: "alink",
							description:
								'Color of text for hyperlinks when selected. _This method is non-conforming, use CSS [`color`](https://developer.mozilla.org/en-US/docs/Web/CSS/color "The color CSS property sets the foreground color value of an element\'s text and text decorations, and sets the currentcolor value.") property in conjunction with the [`:active`](https://developer.mozilla.org/en-US/docs/Web/CSS/:active "The :active CSS pseudo-class represents an element (such as a button) that is being activated by the user.") pseudo-class instead._',
						},
						{
							name: "background",
							description:
								'URI of a image to use as a background. _This method is non-conforming, use CSS [`background`](https://developer.mozilla.org/en-US/docs/Web/CSS/background "The background shorthand CSS property sets all background style properties at once, such as color, image, origin and size, or repeat method.") property on the element instead._',
						},
						{
							name: "bgcolor",
							description:
								'Background color for the document. _This method is non-conforming, use CSS [`background-color`](https://developer.mozilla.org/en-US/docs/Web/CSS/background-color "The background-color CSS property sets the background color of an element.") property on the element instead._',
						},
						{
							name: "bottommargin",
							description:
								'The margin of the bottom of the body. _This method is non-conforming, use CSS [`margin-bottom`](https://developer.mozilla.org/en-US/docs/Web/CSS/margin-bottom "The margin-bottom CSS property sets the margin area on the bottom of an element. A positive value places it farther from its neighbors, while a negative value places it closer.") property on the element instead._',
						},
						{
							name: "leftmargin",
							description:
								'The margin of the left of the body. _This method is non-conforming, use CSS [`margin-left`](https://developer.mozilla.org/en-US/docs/Web/CSS/margin-left "The margin-left CSS property sets the margin area on the left side of an element. A positive value places it farther from its neighbors, while a negative value places it closer.") property on the element instead._',
						},
						{
							name: "link",
							description:
								'Color of text for unvisited hypertext links. _This method is non-conforming, use CSS [`color`](https://developer.mozilla.org/en-US/docs/Web/CSS/color "The color CSS property sets the foreground color value of an element\'s text and text decorations, and sets the currentcolor value.") property in conjunction with the [`:link`](https://developer.mozilla.org/en-US/docs/Web/CSS/:link "The :link CSS pseudo-class represents an element that has not yet been visited. It matches every unvisited <a>, <area>, or <link> element that has an href attribute.") pseudo-class instead._',
						},
						{
							name: "onblur",
							description:
								"Function to call when the document loses focus.",
						},
						{
							name: "onerror",
							description:
								"Function to call when the document fails to load properly.",
						},
						{
							name: "onfocus",
							description:
								"Function to call when the document receives focus.",
						},
						{
							name: "onload",
							description:
								"Function to call when the document has finished loading.",
						},
						{
							name: "onredo",
							description:
								"Function to call when the user has moved forward in undo transaction history.",
						},
						{
							name: "onresize",
							description:
								"Function to call when the document has been resized.",
						},
						{
							name: "onundo",
							description:
								"Function to call when the user has moved backward in undo transaction history.",
						},
						{
							name: "rightmargin",
							description:
								'The margin of the right of the body. _This method is non-conforming, use CSS [`margin-right`](https://developer.mozilla.org/en-US/docs/Web/CSS/margin-right "The margin-right CSS property sets the margin area on the right side of an element. A positive value places it farther from its neighbors, while a negative value places it closer.") property on the element instead._',
						},
						{
							name: "text",
							description:
								'Foreground color of text. _This method is non-conforming, use CSS [`color`](https://developer.mozilla.org/en-US/docs/Web/CSS/color "The color CSS property sets the foreground color value of an element\'s text and text decorations, and sets the currentcolor value.") property on the element instead._',
						},
						{
							name: "topmargin",
							description:
								'The margin of the top of the body. _This method is non-conforming, use CSS [`margin-top`](https://developer.mozilla.org/en-US/docs/Web/CSS/margin-top "The margin-top CSS property sets the margin area on the top of an element. A positive value places it farther from its neighbors, while a negative value places it closer.") property on the element instead._',
						},
						{
							name: "vlink",
							description:
								'Color of text for visited hypertext links. _This method is non-conforming, use CSS [`color`](https://developer.mozilla.org/en-US/docs/Web/CSS/color "The color CSS property sets the foreground color value of an element\'s text and text decorations, and sets the currentcolor value.") property in conjunction with the [`:visited`](https://developer.mozilla.org/en-US/docs/Web/CSS/:visited "The :visited CSS pseudo-class represents links that the user has already visited. For privacy reasons, the styles that can be modified using this selector are very limited.") pseudo-class instead._',
						},
					],
					references: [
						{
							name: "MDN Reference",
							url: "https://developer.mozilla.org/docs/Web/HTML/Element/body",
						},
					],
				},
				{
					name: "article",
					description: {
						kind: "markdown",
						value: "The article element represents a complete, or self-contained, composition in a document, page, application, or site and that is, in principle, independently distributable or reusable, e.g. in syndication. This could be a forum post, a magazine or newspaper article, a blog entry, a user-submitted comment, an interactive widget or gadget, or any other independent item of content. Each article should be identified, typically by including a heading (h1–h6 element) as a child of the article element.",
					},
					attributes: [],
					references: [
						{
							name: "MDN Reference",
							url: "https://developer.mozilla.org/docs/Web/HTML/Element/article",
						},
					],
				},
				{
					name: "section",
					description: {
						kind: "markdown",
						value: "The section element represents a generic section of a document or application. A section, in this context, is a thematic grouping of content. Each section should be identified, typically by including a heading ( h1- h6 element) as a child of the section element.",
					},
					attributes: [],
					references: [
						{
							name: "MDN Reference",
							url: "https://developer.mozilla.org/docs/Web/HTML/Element/section",
						},
					],
				},
				{
					name: "nav",
					description: {
						kind: "markdown",
						value: "The nav element represents a section of a page that links to other pages or to parts within the page: a section with navigation links.",
					},
					attributes: [],
					references: [
						{
							name: "MDN Reference",
							url: "https://developer.mozilla.org/docs/Web/HTML/Element/nav",
						},
					],
				},
				{
					name: "aside",
					description: {
						kind: "markdown",
						value: "The aside element represents a section of a page that consists of content that is tangentially related to the content around the aside element, and which could be considered separate from that content. Such sections are often represented as sidebars in printed typography.",
					},
					attributes: [],
					references: [
						{
							name: "MDN Reference",
							url: "https://developer.mozilla.org/docs/Web/HTML/Element/aside",
						},
					],
				},
				{
					name: "h1",
					description: {
						kind: "markdown",
						value: "The h1 element represents a section heading.",
					},
					attributes: [],
					references: [
						{
							name: "MDN Reference",
							url: "https://developer.mozilla.org/docs/Web/HTML/Element/Heading_Elements",
						},
					],
				},
				{
					name: "h2",
					description: {
						kind: "markdown",
						value: "The h2 element represents a section heading.",
					},
					attributes: [],
					references: [
						{
							name: "MDN Reference",
							url: "https://developer.mozilla.org/docs/Web/HTML/Element/Heading_Elements",
						},
					],
				},
				{
					name: "h3",
					description: {
						kind: "markdown",
						value: "The h3 element represents a section heading.",
					},
					attributes: [],
					references: [
						{
							name: "MDN Reference",
							url: "https://developer.mozilla.org/docs/Web/HTML/Element/Heading_Elements",
						},
					],
				},
				{
					name: "h4",
					description: {
						kind: "markdown",
						value: "The h4 element represents a section heading.",
					},
					attributes: [],
					references: [
						{
							name: "MDN Reference",
							url: "https://developer.mozilla.org/docs/Web/HTML/Element/Heading_Elements",
						},
					],
				},
				{
					name: "h5",
					description: {
						kind: "markdown",
						value: "The h5 element represents a section heading.",
					},
					attributes: [],
					references: [
						{
							name: "MDN Reference",
							url: "https://developer.mozilla.org/docs/Web/HTML/Element/Heading_Elements",
						},
					],
				},
				{
					name: "h6",
					description: {
						kind: "markdown",
						value: "The h6 element represents a section heading.",
					},
					attributes: [],
					references: [
						{
							name: "MDN Reference",
							url: "https://developer.mozilla.org/docs/Web/HTML/Element/Heading_Elements",
						},
					],
				},
				{
					name: "header",
					description: {
						kind: "markdown",
						value: "The header element represents introductory content for its nearest ancestor sectioning content or sectioning root element. A header typically contains a group of introductory or navigational aids. When the nearest ancestor sectioning content or sectioning root element is the body element, then it applies to the whole page.",
					},
					attributes: [],
					references: [
						{
							name: "MDN Reference",
							url: "https://developer.mozilla.org/docs/Web/HTML/Element/header",
						},
					],
				},
				{
					name: "footer",
					description: {
						kind: "markdown",
						value: "The footer element represents a footer for its nearest ancestor sectioning content or sectioning root element. A footer typically contains information about its section such as who wrote it, links to related documents, copyright data, and the like.",
					},
					attributes: [],
					references: [
						{
							name: "MDN Reference",
							url: "https://developer.mozilla.org/docs/Web/HTML/Element/footer",
						},
					],
				},
				{
					name: "address",
					description: {
						kind: "markdown",
						value: "The address element represents the contact information for its nearest article or body element ancestor. If that is the body element, then the contact information applies to the document as a whole.",
					},
					attributes: [],
					references: [
						{
							name: "MDN Reference",
							url: "https://developer.mozilla.org/docs/Web/HTML/Element/address",
						},
					],
				},
				{
					name: "p",
					description: {
						kind: "markdown",
						value: "The p element represents a paragraph.",
					},
					attributes: [],
					references: [
						{
							name: "MDN Reference",
							url: "https://developer.mozilla.org/docs/Web/HTML/Element/p",
						},
					],
				},
				{
					name: "hr",
					description: {
						kind: "markdown",
						value: "The hr element represents a paragraph-level thematic break, e.g. a scene change in a story, or a transition to another topic within a section of a reference book.",
					},
					void: !0,
					attributes: [
						{
							name: "align",
							description:
								"Sets the alignment of the rule on the page. If no value is specified, the default value is `left`.",
						},
						{
							name: "color",
							description:
								"Sets the color of the rule through color name or hexadecimal value.",
						},
						{
							name: "noshade",
							description: "Sets the rule to have no shading.",
						},
						{
							name: "size",
							description:
								"Sets the height, in pixels, of the rule.",
						},
						{
							name: "width",
							description:
								"Sets the length of the rule on the page through a pixel or percentage value.",
						},
					],
					references: [
						{
							name: "MDN Reference",
							url: "https://developer.mozilla.org/docs/Web/HTML/Element/hr",
						},
					],
				},
				{
					name: "pre",
					description: {
						kind: "markdown",
						value: "The pre element represents a block of preformatted text, in which structure is represented by typographic conventions rather than by elements.",
					},
					attributes: [
						{
							name: "cols",
							description:
								'Contains the _preferred_ count of characters that a line should have. It was a non-standard synonym of [`width`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/pre#attr-width). To achieve such an effect, use CSS [`width`](https://developer.mozilla.org/en-US/docs/Web/CSS/width "The width CSS property sets an element\'s width. By default it sets the width of the content area, but if box-sizing is set to border-box, it sets the width of the border area.") instead.',
						},
						{
							name: "width",
							description:
								'Contains the _preferred_ count of characters that a line should have. Though technically still implemented, this attribute has no visual effect; to achieve such an effect, use CSS [`width`](https://developer.mozilla.org/en-US/docs/Web/CSS/width "The width CSS property sets an element\'s width. By default it sets the width of the content area, but if box-sizing is set to border-box, it sets the width of the border area.") instead.',
						},
						{
							name: "wrap",
							description:
								'Is a _hint_ indicating how the overflow must happen. In modern browser this hint is ignored and no visual effect results in its present; to achieve such an effect, use CSS [`white-space`](https://developer.mozilla.org/en-US/docs/Web/CSS/white-space "The white-space CSS property sets how white space inside an element is handled.") instead.',
						},
					],
					references: [
						{
							name: "MDN Reference",
							url: "https://developer.mozilla.org/docs/Web/HTML/Element/pre",
						},
					],
				},
				{
					name: "blockquote",
					description: {
						kind: "markdown",
						value: "The blockquote element represents content that is quoted from another source, optionally with a citation which must be within a footer or cite element, and optionally with in-line changes such as annotations and abbreviations.",
					},
					attributes: [
						{
							name: "cite",
							description: {
								kind: "markdown",
								value: "A URL that designates a source document or message for the information quoted. This attribute is intended to point to information explaining the context or the reference for the quote.",
							},
						},
					],
					references: [
						{
							name: "MDN Reference",
							url: "https://developer.mozilla.org/docs/Web/HTML/Element/blockquote",
						},
					],
				},
				{
					name: "ol",
					description: {
						kind: "markdown",
						value: "The ol element represents a list of items, where the items have been intentionally ordered, such that changing the order would change the meaning of the document.",
					},
					attributes: [
						{
							name: "reversed",
							valueSet: "v",
							description: {
								kind: "markdown",
								value: "This Boolean attribute specifies that the items of the list are specified in reversed order.",
							},
						},
						{
							name: "start",
							description: {
								kind: "markdown",
								value: 'This integer attribute specifies the start value for numbering the individual list items. Although the ordering type of list elements might be Roman numerals, such as XXXI, or letters, the value of start is always represented as a number. To start numbering elements from the letter "C", use `<ol start="3">`.\n\n**Note**: This attribute was deprecated in HTML4, but reintroduced in HTML5.',
							},
						},
						{
							name: "type",
							valueSet: "lt",
							description: {
								kind: "markdown",
								value: "Indicates the numbering type:\n\n*   `'a'` indicates lowercase letters,\n*   `'A'` indicates uppercase letters,\n*   `'i'` indicates lowercase Roman numerals,\n*   `'I'` indicates uppercase Roman numerals,\n*   and `'1'` indicates numbers (default).\n\nThe type set is used for the entire list unless a different [`type`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/li#attr-type) attribute is used within an enclosed [`<li>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/li \"The HTML <li> element is used to represent an item in a list. It must be contained in a parent element: an ordered list (<ol>), an unordered list (<ul>), or a menu (<menu>). In menus and unordered lists, list items are usually displayed using bullet points. In ordered lists, they are usually displayed with an ascending counter on the left, such as a number or letter.\") element.\n\n**Note:** This attribute was deprecated in HTML4, but reintroduced in HTML5.\n\nUnless the value of the list number matters (e.g. in legal or technical documents where items are to be referenced by their number/letter), the CSS [`list-style-type`](https://developer.mozilla.org/en-US/docs/Web/CSS/list-style-type \"The list-style-type CSS property sets the marker (such as a disc, character, or custom counter style) of a list item element.\") property should be used instead.",
							},
						},
						{
							name: "compact",
							description:
								'This Boolean attribute hints that the list should be rendered in a compact style. The interpretation of this attribute depends on the user agent and it doesn\'t work in all browsers.\n\n**Warning:** Do not use this attribute, as it has been deprecated: the [`<ol>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/ol "The HTML <ol> element represents an ordered list of items, typically rendered as a numbered list.") element should be styled using [CSS](https://developer.mozilla.org/en-US/docs/CSS). To give an effect similar to the `compact` attribute, the [CSS](https://developer.mozilla.org/en-US/docs/CSS) property [`line-height`](https://developer.mozilla.org/en-US/docs/Web/CSS/line-height "The line-height CSS property sets the amount of space used for lines, such as in text. On block-level elements, it specifies the minimum height of line boxes within the element. On non-replaced inline elements, it specifies the height that is used to calculate line box height.") can be used with a value of `80%`.',
						},
					],
					references: [
						{
							name: "MDN Reference",
							url: "https://developer.mozilla.org/docs/Web/HTML/Element/ol",
						},
					],
				},
				{
					name: "ul",
					description: {
						kind: "markdown",
						value: "The ul element represents a list of items, where the order of the items is not important — that is, where changing the order would not materially change the meaning of the document.",
					},
					attributes: [
						{
							name: "compact",
							description:
								'This Boolean attribute hints that the list should be rendered in a compact style. The interpretation of this attribute depends on the user agent and it doesn\'t work in all browsers.\n\n**Usage note: **Do not use this attribute, as it has been deprecated: the [`<ul>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/ul "The HTML <ul> element represents an unordered list of items, typically rendered as a bulleted list.") element should be styled using [CSS](https://developer.mozilla.org/en-US/docs/CSS). To give a similar effect as the `compact` attribute, the [CSS](https://developer.mozilla.org/en-US/docs/CSS) property [line-height](https://developer.mozilla.org/en-US/docs/CSS/line-height) can be used with a value of `80%`.',
						},
					],
					references: [
						{
							name: "MDN Reference",
							url: "https://developer.mozilla.org/docs/Web/HTML/Element/ul",
						},
					],
				},
				{
					name: "li",
					description: {
						kind: "markdown",
						value: "The li element represents a list item. If its parent element is an ol, ul, or menu element, then the element is an item of the parent element's list, as defined for those elements. Otherwise, the list item has no defined list-related relationship to any other li element.",
					},
					attributes: [
						{
							name: "value",
							description: {
								kind: "markdown",
								value: 'This integer attribute indicates the current ordinal value of the list item as defined by the [`<ol>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/ol "The HTML <ol> element represents an ordered list of items, typically rendered as a numbered list.") element. The only allowed value for this attribute is a number, even if the list is displayed with Roman numerals or letters. List items that follow this one continue numbering from the value set. The **value** attribute has no meaning for unordered lists ([`<ul>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/ul "The HTML <ul> element represents an unordered list of items, typically rendered as a bulleted list.")) or for menus ([`<menu>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/menu "The HTML <menu> element represents a group of commands that a user can perform or activate. This includes both list menus, which might appear across the top of a screen, as well as context menus, such as those that might appear underneath a button after it has been clicked.")).\n\n**Note**: This attribute was deprecated in HTML4, but reintroduced in HTML5.\n\n**Note:** Prior to Gecko 9.0, negative values were incorrectly converted to 0. Starting in Gecko 9.0 all integer values are correctly parsed.',
							},
						},
						{
							name: "type",
							description:
								'This character attribute indicates the numbering type:\n\n*   `a`: lowercase letters\n*   `A`: uppercase letters\n*   `i`: lowercase Roman numerals\n*   `I`: uppercase Roman numerals\n*   `1`: numbers\n\nThis type overrides the one used by its parent [`<ol>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/ol "The HTML <ol> element represents an ordered list of items, typically rendered as a numbered list.") element, if any.\n\n**Usage note:** This attribute has been deprecated: use the CSS [`list-style-type`](https://developer.mozilla.org/en-US/docs/Web/CSS/list-style-type "The list-style-type CSS property sets the marker (such as a disc, character, or custom counter style) of a list item element.") property instead.',
						},
					],
					references: [
						{
							name: "MDN Reference",
							url: "https://developer.mozilla.org/docs/Web/HTML/Element/li",
						},
					],
				},
				{
					name: "dl",
					description: {
						kind: "markdown",
						value: "The dl element represents an association list consisting of zero or more name-value groups (a description list). A name-value group consists of one or more names (dt elements) followed by one or more values (dd elements), ignoring any nodes other than dt and dd elements. Within a single dl element, there should not be more than one dt element for each name.",
					},
					attributes: [],
					references: [
						{
							name: "MDN Reference",
							url: "https://developer.mozilla.org/docs/Web/HTML/Element/dl",
						},
					],
				},
				{
					name: "dt",
					description: {
						kind: "markdown",
						value: "The dt element represents the term, or name, part of a term-description group in a description list (dl element).",
					},
					attributes: [],
					references: [
						{
							name: "MDN Reference",
							url: "https://developer.mozilla.org/docs/Web/HTML/Element/dt",
						},
					],
				},
				{
					name: "dd",
					description: {
						kind: "markdown",
						value: "The dd element represents the description, definition, or value, part of a term-description group in a description list (dl element).",
					},
					attributes: [
						{
							name: "nowrap",
							description:
								"If the value of this attribute is set to `yes`, the definition text will not wrap. The default value is `no`.",
						},
					],
					references: [
						{
							name: "MDN Reference",
							url: "https://developer.mozilla.org/docs/Web/HTML/Element/dd",
						},
					],
				},
				{
					name: "figure",
					description: {
						kind: "markdown",
						value: "The figure element represents some flow content, optionally with a caption, that is self-contained (like a complete sentence) and is typically referenced as a single unit from the main flow of the document.",
					},
					attributes: [],
					references: [
						{
							name: "MDN Reference",
							url: "https://developer.mozilla.org/docs/Web/HTML/Element/figure",
						},
					],
				},
				{
					name: "figcaption",
					description: {
						kind: "markdown",
						value: "The figcaption element represents a caption or legend for the rest of the contents of the figcaption element's parent figure element, if any.",
					},
					attributes: [],
					references: [
						{
							name: "MDN Reference",
							url: "https://developer.mozilla.org/docs/Web/HTML/Element/figcaption",
						},
					],
				},
				{
					name: "main",
					description: {
						kind: "markdown",
						value: "The main element represents the main content of the body of a document or application. The main content area consists of content that is directly related to or expands upon the central topic of a document or central functionality of an application.",
					},
					attributes: [],
					references: [
						{
							name: "MDN Reference",
							url: "https://developer.mozilla.org/docs/Web/HTML/Element/main",
						},
					],
				},
				{
					name: "div",
					description: {
						kind: "markdown",
						value: "The div element has no special meaning at all. It represents its children. It can be used with the class, lang, and title attributes to mark up semantics common to a group of consecutive elements.",
					},
					attributes: [],
					references: [
						{
							name: "MDN Reference",
							url: "https://developer.mozilla.org/docs/Web/HTML/Element/div",
						},
					],
				},
				{
					name: "a",
					description: {
						kind: "markdown",
						value: "If the a element has an href attribute, then it represents a hyperlink (a hypertext anchor) labeled by its contents.",
					},
					attributes: [
						{
							name: "href",
							description: {
								kind: "markdown",
								value: 'Contains a URL or a URL fragment that the hyperlink points to.\nA URL fragment is a name preceded by a hash mark (`#`), which specifies an internal target location (an [`id`](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes#attr-id) of an HTML element) within the current document. URLs are not restricted to Web (HTTP)-based documents, but can use any protocol supported by the browser. For example, [`file:`](https://en.wikipedia.org/wiki/File_URI_scheme), `ftp:`, and `mailto:` work in most browsers.\n\n**Note:** You can use `href="#top"` or the empty fragment `href="#"` to link to the top of the current page. [This behavior is specified by HTML5](https://www.w3.org/TR/html5/single-page.html#scroll-to-fragid).',
							},
						},
						{
							name: "target",
							valueSet: "target",
							description: {
								kind: "markdown",
								value: 'Specifies where to display the linked URL. It is a name of, or keyword for, a _browsing context_: a tab, window, or `<iframe>`. The following keywords have special meanings:\n\n*   `_self`: Load the URL into the same browsing context as the current one. This is the default behavior.\n*   `_blank`: Load the URL into a new browsing context. This is usually a tab, but users can configure browsers to use new windows instead.\n*   `_parent`: Load the URL into the parent browsing context of the current one. If there is no parent, this behaves the same way as `_self`.\n*   `_top`: Load the URL into the top-level browsing context (that is, the "highest" browsing context that is an ancestor of the current one, and has no parent). If there is no parent, this behaves the same way as `_self`.\n\n**Note:** When using `target`, consider adding `rel="noreferrer"` to avoid exploitation of the `window.opener` API.\n\n**Note:** Linking to another page using `target="_blank"` will run the new page on the same process as your page. If the new page is executing expensive JS, your page\'s performance may suffer. To avoid this use `rel="noopener"`.',
							},
						},
						{
							name: "download",
							description: {
								kind: "markdown",
								value: "This attribute instructs browsers to download a URL instead of navigating to it, so the user will be prompted to save it as a local file. If the attribute has a value, it is used as the pre-filled file name in the Save prompt (the user can still change the file name if they want). There are no restrictions on allowed values, though `/` and `\\` are converted to underscores. Most file systems limit some punctuation in file names, and browsers will adjust the suggested name accordingly.\n\n**Notes:**\n\n*   This attribute only works for [same-origin URLs](https://developer.mozilla.org/en-US/docs/Web/Security/Same-origin_policy).\n*   Although HTTP(s) URLs need to be in the same-origin, [`blob:` URLs](https://developer.mozilla.org/en-US/docs/Web/API/URL.createObjectURL) and [`data:` URLs](https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/Data_URIs) are allowed so that content generated by JavaScript, such as pictures created in an image-editor Web app, can be downloaded.\n*   If the HTTP header [`Content-Disposition:`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Disposition) gives a different filename than this attribute, the HTTP header takes priority over this attribute.\n*   If `Content-Disposition:` is set to `inline`, Firefox prioritizes `Content-Disposition`, like the filename case, while Chrome prioritizes the `download` attribute.",
							},
						},
						{
							name: "ping",
							description: {
								kind: "markdown",
								value: 'Contains a space-separated list of URLs to which, when the hyperlink is followed, [`POST`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods/POST "The HTTP POST method sends data to the server. The type of the body of the request is indicated by the Content-Type header.") requests with the body `PING` will be sent by the browser (in the background). Typically used for tracking.',
							},
						},
						{
							name: "rel",
							description: {
								kind: "markdown",
								value: "Specifies the relationship of the target object to the link object. The value is a space-separated list of [link types](https://developer.mozilla.org/en-US/docs/Web/HTML/Link_types).",
							},
						},
						{
							name: "hreflang",
							description: {
								kind: "markdown",
								value: 'This attribute indicates the human language of the linked resource. It is purely advisory, with no built-in functionality. Allowed values are determined by [BCP47](https://www.ietf.org/rfc/bcp/bcp47.txt "Tags for Identifying Languages").',
							},
						},
						{
							name: "type",
							description: {
								kind: "markdown",
								value: 'Specifies the media type in the form of a [MIME type](https://developer.mozilla.org/en-US/docs/Glossary/MIME_type "MIME type: A MIME type (now properly called "media type", but also sometimes "content type") is a string sent along with a file indicating the type of the file (describing the content format, for example, a sound file might be labeled audio/ogg, or an image file image/png).") for the linked URL. It is purely advisory, with no built-in functionality.',
							},
						},
						{
							name: "referrerpolicy",
							description:
								"Indicates which [referrer](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Referer) to send when fetching the URL:\n\n*   `'no-referrer'` means the `Referer:` header will not be sent.\n*   `'no-referrer-when-downgrade'` means no `Referer:` header will be sent when navigating to an origin without HTTPS. This is the default behavior.\n*   `'origin'` means the referrer will be the [origin](https://developer.mozilla.org/en-US/docs/Glossary/Origin) of the page, not including information after the domain.\n*   `'origin-when-cross-origin'` meaning that navigations to other origins will be limited to the scheme, the host and the port, while navigations on the same origin will include the referrer's path.\n*   `'strict-origin-when-cross-origin'`\n*   `'unsafe-url'` means the referrer will include the origin and path, but not the fragment, password, or username. This is unsafe because it can leak data from secure URLs to insecure ones.",
						},
					],
					references: [
						{
							name: "MDN Reference",
							url: "https://developer.mozilla.org/docs/Web/HTML/Element/a",
						},
					],
				},
				{
					name: "em",
					description: {
						kind: "markdown",
						value: "The em element represents stress emphasis of its contents.",
					},
					attributes: [],
					references: [
						{
							name: "MDN Reference",
							url: "https://developer.mozilla.org/docs/Web/HTML/Element/em",
						},
					],
				},
				{
					name: "strong",
					description: {
						kind: "markdown",
						value: "The strong element represents strong importance, seriousness, or urgency for its contents.",
					},
					attributes: [],
					references: [
						{
							name: "MDN Reference",
							url: "https://developer.mozilla.org/docs/Web/HTML/Element/strong",
						},
					],
				},
				{
					name: "small",
					description: {
						kind: "markdown",
						value: "The small element represents side comments such as small print.",
					},
					attributes: [],
					references: [
						{
							name: "MDN Reference",
							url: "https://developer.mozilla.org/docs/Web/HTML/Element/small",
						},
					],
				},
				{
					name: "s",
					description: {
						kind: "markdown",
						value: "The s element represents contents that are no longer accurate or no longer relevant.",
					},
					attributes: [],
					references: [
						{
							name: "MDN Reference",
							url: "https://developer.mozilla.org/docs/Web/HTML/Element/s",
						},
					],
				},
				{
					name: "cite",
					description: {
						kind: "markdown",
						value: "The cite element represents a reference to a creative work. It must include the title of the work or the name of the author(person, people or organization) or an URL reference, or a reference in abbreviated form as per the conventions used for the addition of citation metadata.",
					},
					attributes: [],
					references: [
						{
							name: "MDN Reference",
							url: "https://developer.mozilla.org/docs/Web/HTML/Element/cite",
						},
					],
				},
				{
					name: "q",
					description: {
						kind: "markdown",
						value: "The q element represents some phrasing content quoted from another source.",
					},
					attributes: [
						{
							name: "cite",
							description: {
								kind: "markdown",
								value: "The value of this attribute is a URL that designates a source document or message for the information quoted. This attribute is intended to point to information explaining the context or the reference for the quote.",
							},
						},
					],
					references: [
						{
							name: "MDN Reference",
							url: "https://developer.mozilla.org/docs/Web/HTML/Element/q",
						},
					],
				},
				{
					name: "dfn",
					description: {
						kind: "markdown",
						value: "The dfn element represents the defining instance of a term. The paragraph, description list group, or section that is the nearest ancestor of the dfn element must also contain the definition(s) for the term given by the dfn element.",
					},
					attributes: [],
					references: [
						{
							name: "MDN Reference",
							url: "https://developer.mozilla.org/docs/Web/HTML/Element/dfn",
						},
					],
				},
				{
					name: "abbr",
					description: {
						kind: "markdown",
						value: "The abbr element represents an abbreviation or acronym, optionally with its expansion. The title attribute may be used to provide an expansion of the abbreviation. The attribute, if specified, must contain an expansion of the abbreviation, and nothing else.",
					},
					attributes: [],
					references: [
						{
							name: "MDN Reference",
							url: "https://developer.mozilla.org/docs/Web/HTML/Element/abbr",
						},
					],
				},
				{
					name: "ruby",
					description: {
						kind: "markdown",
						value: "The ruby element allows one or more spans of phrasing content to be marked with ruby annotations. Ruby annotations are short runs of text presented alongside base text, primarily used in East Asian typography as a guide for pronunciation or to include other annotations. In Japanese, this form of typography is also known as furigana. Ruby text can appear on either side, and sometimes both sides, of the base text, and it is possible to control its position using CSS. A more complete introduction to ruby can be found in the Use Cases & Exploratory Approaches for Ruby Markup document as well as in CSS Ruby Module Level 1. [RUBY-UC] [CSSRUBY]",
					},
					attributes: [],
					references: [
						{
							name: "MDN Reference",
							url: "https://developer.mozilla.org/docs/Web/HTML/Element/ruby",
						},
					],
				},
				{
					name: "rb",
					description: {
						kind: "markdown",
						value: "The rb element marks the base text component of a ruby annotation. When it is the child of a ruby element, it doesn't represent anything itself, but its parent ruby element uses it as part of determining what it represents.",
					},
					attributes: [],
					references: [
						{
							name: "MDN Reference",
							url: "https://developer.mozilla.org/docs/Web/HTML/Element/rb",
						},
					],
				},
				{
					name: "rt",
					description: {
						kind: "markdown",
						value: "The rt element marks the ruby text component of a ruby annotation. When it is the child of a ruby element or of an rtc element that is itself the child of a ruby element, it doesn't represent anything itself, but its ancestor ruby element uses it as part of determining what it represents.",
					},
					attributes: [],
					references: [
						{
							name: "MDN Reference",
							url: "https://developer.mozilla.org/docs/Web/HTML/Element/rt",
						},
					],
				},
				{
					name: "rp",
					description: {
						kind: "markdown",
						value: "The rp element is used to provide fallback text to be shown by user agents that don't support ruby annotations. One widespread convention is to provide parentheses around the ruby text component of a ruby annotation.",
					},
					attributes: [],
					references: [
						{
							name: "MDN Reference",
							url: "https://developer.mozilla.org/docs/Web/HTML/Element/rp",
						},
					],
				},
				{
					name: "time",
					description: {
						kind: "markdown",
						value: "The time element represents its contents, along with a machine-readable form of those contents in the datetime attribute. The kind of content is limited to various kinds of dates, times, time-zone offsets, and durations, as described below.",
					},
					attributes: [
						{
							name: "datetime",
							description: {
								kind: "markdown",
								value: "This attribute indicates the time and/or date of the element and must be in one of the formats described below.",
							},
						},
					],
					references: [
						{
							name: "MDN Reference",
							url: "https://developer.mozilla.org/docs/Web/HTML/Element/time",
						},
					],
				},
				{
					name: "code",
					description: {
						kind: "markdown",
						value: "The code element represents a fragment of computer code. This could be an XML element name, a file name, a computer program, or any other string that a computer would recognize.",
					},
					attributes: [],
					references: [
						{
							name: "MDN Reference",
							url: "https://developer.mozilla.org/docs/Web/HTML/Element/code",
						},
					],
				},
				{
					name: "var",
					description: {
						kind: "markdown",
						value: "The var element represents a variable. This could be an actual variable in a mathematical expression or programming context, an identifier representing a constant, a symbol identifying a physical quantity, a function parameter, or just be a term used as a placeholder in prose.",
					},
					attributes: [],
					references: [
						{
							name: "MDN Reference",
							url: "https://developer.mozilla.org/docs/Web/HTML/Element/var",
						},
					],
				},
				{
					name: "samp",
					description: {
						kind: "markdown",
						value: "The samp element represents sample or quoted output from another program or computing system.",
					},
					attributes: [],
					references: [
						{
							name: "MDN Reference",
							url: "https://developer.mozilla.org/docs/Web/HTML/Element/samp",
						},
					],
				},
				{
					name: "kbd",
					description: {
						kind: "markdown",
						value: "The kbd element represents user input (typically keyboard input, although it may also be used to represent other input, such as voice commands).",
					},
					attributes: [],
					references: [
						{
							name: "MDN Reference",
							url: "https://developer.mozilla.org/docs/Web/HTML/Element/kbd",
						},
					],
				},
				{
					name: "sub",
					description: {
						kind: "markdown",
						value: "The sub element represents a subscript.",
					},
					attributes: [],
					references: [
						{
							name: "MDN Reference",
							url: "https://developer.mozilla.org/docs/Web/HTML/Element/sub",
						},
					],
				},
				{
					name: "sup",
					description: {
						kind: "markdown",
						value: "The sup element represents a superscript.",
					},
					attributes: [],
					references: [
						{
							name: "MDN Reference",
							url: "https://developer.mozilla.org/docs/Web/HTML/Element/sup",
						},
					],
				},
				{
					name: "i",
					description: {
						kind: "markdown",
						value: "The i element represents a span of text in an alternate voice or mood, or otherwise offset from the normal prose in a manner indicating a different quality of text, such as a taxonomic designation, a technical term, an idiomatic phrase from another language, transliteration, a thought, or a ship name in Western texts.",
					},
					attributes: [],
					references: [
						{
							name: "MDN Reference",
							url: "https://developer.mozilla.org/docs/Web/HTML/Element/i",
						},
					],
				},
				{
					name: "b",
					description: {
						kind: "markdown",
						value: "The b element represents a span of text to which attention is being drawn for utilitarian purposes without conveying any extra importance and with no implication of an alternate voice or mood, such as key words in a document abstract, product names in a review, actionable words in interactive text-driven software, or an article lede.",
					},
					attributes: [],
					references: [
						{
							name: "MDN Reference",
							url: "https://developer.mozilla.org/docs/Web/HTML/Element/b",
						},
					],
				},
				{
					name: "u",
					description: {
						kind: "markdown",
						value: "The u element represents a span of text with an unarticulated, though explicitly rendered, non-textual annotation, such as labeling the text as being a proper name in Chinese text (a Chinese proper name mark), or labeling the text as being misspelt.",
					},
					attributes: [],
					references: [
						{
							name: "MDN Reference",
							url: "https://developer.mozilla.org/docs/Web/HTML/Element/u",
						},
					],
				},
				{
					name: "mark",
					description: {
						kind: "markdown",
						value: "The mark element represents a run of text in one document marked or highlighted for reference purposes, due to its relevance in another context. When used in a quotation or other block of text referred to from the prose, it indicates a highlight that was not originally present but which has been added to bring the reader's attention to a part of the text that might not have been considered important by the original author when the block was originally written, but which is now under previously unexpected scrutiny. When used in the main prose of a document, it indicates a part of the document that has been highlighted due to its likely relevance to the user's current activity.",
					},
					attributes: [],
					references: [
						{
							name: "MDN Reference",
							url: "https://developer.mozilla.org/docs/Web/HTML/Element/mark",
						},
					],
				},
				{
					name: "bdi",
					description: {
						kind: "markdown",
						value: "The bdi element represents a span of text that is to be isolated from its surroundings for the purposes of bidirectional text formatting. [BIDI]",
					},
					attributes: [],
					references: [
						{
							name: "MDN Reference",
							url: "https://developer.mozilla.org/docs/Web/HTML/Element/bdi",
						},
					],
				},
				{
					name: "bdo",
					description: {
						kind: "markdown",
						value: "The bdo element represents explicit text directionality formatting control for its children. It allows authors to override the Unicode bidirectional algorithm by explicitly specifying a direction override. [BIDI]",
					},
					attributes: [
						{
							name: "dir",
							description:
								"The direction in which text should be rendered in this element's contents. Possible values are:\n\n*   `ltr`: Indicates that the text should go in a left-to-right direction.\n*   `rtl`: Indicates that the text should go in a right-to-left direction.",
						},
					],
					references: [
						{
							name: "MDN Reference",
							url: "https://developer.mozilla.org/docs/Web/HTML/Element/bdo",
						},
					],
				},
				{
					name: "span",
					description: {
						kind: "markdown",
						value: "The span element doesn't mean anything on its own, but can be useful when used together with the global attributes, e.g. class, lang, or dir. It represents its children.",
					},
					attributes: [],
					references: [
						{
							name: "MDN Reference",
							url: "https://developer.mozilla.org/docs/Web/HTML/Element/span",
						},
					],
				},
				{
					name: "br",
					description: {
						kind: "markdown",
						value: "The br element represents a line break.",
					},
					void: !0,
					attributes: [
						{
							name: "clear",
							description:
								"Indicates where to begin the next line after the break.",
						},
					],
					references: [
						{
							name: "MDN Reference",
							url: "https://developer.mozilla.org/docs/Web/HTML/Element/br",
						},
					],
				},
				{
					name: "wbr",
					description: {
						kind: "markdown",
						value: "The wbr element represents a line break opportunity.",
					},
					void: !0,
					attributes: [],
					references: [
						{
							name: "MDN Reference",
							url: "https://developer.mozilla.org/docs/Web/HTML/Element/wbr",
						},
					],
				},
				{
					name: "ins",
					description: {
						kind: "markdown",
						value: "The ins element represents an addition to the document.",
					},
					attributes: [
						{
							name: "cite",
							description:
								"This attribute defines the URI of a resource that explains the change, such as a link to meeting minutes or a ticket in a troubleshooting system.",
						},
						{
							name: "datetime",
							description:
								'This attribute indicates the time and date of the change and must be a valid date with an optional time string. If the value cannot be parsed as a date with an optional time string, the element does not have an associated time stamp. For the format of the string without a time, see [Format of a valid date string](https://developer.mozilla.org/en-US/docs/Web/HTML/Date_and_time_formats#Format_of_a_valid_date_string "Certain HTML elements use date and/or time values. The formats of the strings that specify these are described in this article.") in [Date and time formats used in HTML](https://developer.mozilla.org/en-US/docs/Web/HTML/Date_and_time_formats "Certain HTML elements use date and/or time values. The formats of the strings that specify these are described in this article."). The format of the string if it includes both date and time is covered in [Format of a valid local date and time string](https://developer.mozilla.org/en-US/docs/Web/HTML/Date_and_time_formats#Format_of_a_valid_local_date_and_time_string "Certain HTML elements use date and/or time values. The formats of the strings that specify these are described in this article.") in [Date and time formats used in HTML](https://developer.mozilla.org/en-US/docs/Web/HTML/Date_and_time_formats "Certain HTML elements use date and/or time values. The formats of the strings that specify these are described in this article.").',
						},
					],
					references: [
						{
							name: "MDN Reference",
							url: "https://developer.mozilla.org/docs/Web/HTML/Element/ins",
						},
					],
				},
				{
					name: "del",
					description: {
						kind: "markdown",
						value: "The del element represents a removal from the document.",
					},
					attributes: [
						{
							name: "cite",
							description: {
								kind: "markdown",
								value: "A URI for a resource that explains the change (for example, meeting minutes).",
							},
						},
						{
							name: "datetime",
							description: {
								kind: "markdown",
								value: 'This attribute indicates the time and date of the change and must be a valid date string with an optional time. If the value cannot be parsed as a date with an optional time string, the element does not have an associated time stamp. For the format of the string without a time, see [Format of a valid date string](https://developer.mozilla.org/en-US/docs/Web/HTML/Date_and_time_formats#Format_of_a_valid_date_string "Certain HTML elements use date and/or time values. The formats of the strings that specify these are described in this article.") in [Date and time formats used in HTML](https://developer.mozilla.org/en-US/docs/Web/HTML/Date_and_time_formats "Certain HTML elements use date and/or time values. The formats of the strings that specify these are described in this article."). The format of the string if it includes both date and time is covered in [Format of a valid local date and time string](https://developer.mozilla.org/en-US/docs/Web/HTML/Date_and_time_formats#Format_of_a_valid_local_date_and_time_string "Certain HTML elements use date and/or time values. The formats of the strings that specify these are described in this article.") in [Date and time formats used in HTML](https://developer.mozilla.org/en-US/docs/Web/HTML/Date_and_time_formats "Certain HTML elements use date and/or time values. The formats of the strings that specify these are described in this article.").',
							},
						},
					],
					references: [
						{
							name: "MDN Reference",
							url: "https://developer.mozilla.org/docs/Web/HTML/Element/del",
						},
					],
				},
				{
					name: "picture",
					description: {
						kind: "markdown",
						value: "The picture element is a container which provides multiple sources to its contained img element to allow authors to declaratively control or give hints to the user agent about which image resource to use, based on the screen pixel density, viewport size, image format, and other factors. It represents its children.",
					},
					attributes: [],
					references: [
						{
							name: "MDN Reference",
							url: "https://developer.mozilla.org/docs/Web/HTML/Element/picture",
						},
					],
				},
				{
					name: "img",
					description: {
						kind: "markdown",
						value: "An img element represents an image.",
					},
					void: !0,
					attributes: [
						{
							name: "alt",
							description: {
								kind: "markdown",
								value: 'This attribute defines an alternative text description of the image.\n\n**Note:** Browsers do not always display the image referenced by the element. This is the case for non-graphical browsers (including those used by people with visual impairments), if the user chooses not to display images, or if the browser cannot display the image because it is invalid or an [unsupported type](#Supported_image_formats). In these cases, the browser may replace the image with the text defined in this element\'s `alt` attribute. You should, for these reasons and others, provide a useful value for `alt` whenever possible.\n\n**Note:** Omitting this attribute altogether indicates that the image is a key part of the content, and no textual equivalent is available. Setting this attribute to an empty string (`alt=""`) indicates that this image is _not_ a key part of the content (decorative), and that non-visual browsers may omit it from rendering.',
							},
						},
						{
							name: "src",
							description: {
								kind: "markdown",
								value: "The image URL. This attribute is mandatory for the `<img>` element. On browsers supporting `srcset`, `src` is treated like a candidate image with a pixel density descriptor `1x` unless an image with this pixel density descriptor is already defined in `srcset,` or unless `srcset` contains '`w`' descriptors.",
							},
						},
						{
							name: "srcset",
							description: {
								kind: "markdown",
								value: "A list of one or more strings separated by commas indicating a set of possible image sources for the user agent to use. Each string is composed of:\n\n1.  a URL to an image,\n2.  optionally, whitespace followed by one of:\n    *   A width descriptor, or a positive integer directly followed by '`w`'. The width descriptor is divided by the source size given in the `sizes` attribute to calculate the effective pixel density.\n    *   A pixel density descriptor, which is a positive floating point number directly followed by '`x`'.\n\nIf no descriptor is specified, the source is assigned the default descriptor: `1x`.\n\nIt is incorrect to mix width descriptors and pixel density descriptors in the same `srcset` attribute. Duplicate descriptors (for instance, two sources in the same `srcset` which are both described with '`2x`') are also invalid.\n\nThe user agent selects any one of the available sources at its discretion. This provides them with significant leeway to tailor their selection based on things like user preferences or bandwidth conditions. See our [Responsive images](https://developer.mozilla.org/en-US/docs/Learn/HTML/Multimedia_and_embedding/Responsive_images) tutorial for an example.",
							},
						},
						{
							name: "crossorigin",
							valueSet: "xo",
							description: {
								kind: "markdown",
								value: 'This enumerated attribute indicates if the fetching of the related image must be done using CORS or not. [CORS-enabled images](https://developer.mozilla.org/en-US/docs/CORS_Enabled_Image) can be reused in the [`<canvas>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/canvas "Use the HTML <canvas> element with either the canvas scripting API or the WebGL API to draw graphics and animations.") element without being "[tainted](https://developer.mozilla.org/en-US/docs/Web/HTML/CORS_enabled_image#What_is_a_tainted_canvas)." The allowed values are:\n`anonymous`\n\nA cross-origin request (i.e., with `Origin:` HTTP header) is performed, but no credential is sent (i.e., no cookie, X.509 certificate, or HTTP Basic authentication). If the server does not give credentials to the origin site (by not setting the [`Access-Control-Allow-Origin`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Access-Control-Allow-Origin "The Access-Control-Allow-Origin response header indicates whether the response can be shared with requesting code from the given origin.") HTTP header), the image will be tainted and its usage restricted.\n\n`use-credentials`\n\nA cross-origin request (i.e., with the [`Origin`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Origin "The Origin request header indicates where a fetch originates from. It doesn\'t include any path information, but only the server name. It is sent with CORS requests, as well as with POST requests. It is similar to the Referer header, but, unlike this header, it doesn\'t disclose the whole path.") HTTP header) performed along with credentials sent (i.e., a cookie, certificate, or HTTP Basic authentication). If the server does not give credentials to the origin site (through the `Access-Control-Allow-Credentials` HTTP header), the image will be tainted and its usage restricted.\n\nIf the attribute is not present, the resource is fetched without a CORS request (i.e., without sending the `Origin` HTTP header), preventing its non-tainted usage in [`<canvas>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/canvas "Use the HTML <canvas> element with either the canvas scripting API or the WebGL API to draw graphics and animations.") elements. If invalid, it is handled as if the `anonymous` value was used. See [CORS settings attributes](https://developer.mozilla.org/en-US/docs/HTML/CORS_settings_attributes) for additional information.',
							},
						},
						{
							name: "usemap",
							description: {
								kind: "markdown",
								value: 'The partial URL (starting with \'#\') of an [image map](https://developer.mozilla.org/en-US/docs/HTML/Element/map) associated with the element.\n\n**Note:** You cannot use this attribute if the `<img>` element is a descendant of an [`<a>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/a "The HTML <a> element (or anchor element) creates a hyperlink to other web pages, files, locations within the same page, email addresses, or any other URL.") or [`<button>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/button "The HTML <button> element represents a clickable button, which can be used in forms or anywhere in a document that needs simple, standard button functionality.") element.',
							},
						},
						{
							name: "ismap",
							valueSet: "v",
							description: {
								kind: "markdown",
								value: 'This Boolean attribute indicates that the image is part of a server-side map. If so, the precise coordinates of a click are sent to the server.\n\n**Note:** This attribute is allowed only if the `<img>` element is a descendant of an [`<a>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/a "The HTML <a> element (or anchor element) creates a hyperlink to other web pages, files, locations within the same page, email addresses, or any other URL.") element with a valid [`href`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/a#attr-href) attribute.',
							},
						},
						{
							name: "width",
							description: {
								kind: "markdown",
								value: "The intrinsic width of the image in pixels.",
							},
						},
						{
							name: "height",
							description: {
								kind: "markdown",
								value: "The intrinsic height of the image in pixels.",
							},
						},
						{
							name: "decoding",
							valueSet: "decoding",
							description: {
								kind: "markdown",
								value: `Provides an image decoding hint to the browser. The allowed values are:
\`sync\`

Decode the image synchronously for atomic presentation with other content.

\`async\`

Decode the image asynchronously to reduce delay in presenting other content.

\`auto\`

Default mode, which indicates no preference for the decoding mode. The browser decides what is best for the user.`,
							},
						},
						{
							name: "loading",
							valueSet: "loading",
							description: {
								kind: "markdown",
								value: "Indicates how the browser should load the image.",
							},
						},
						{
							name: "referrerpolicy",
							valueSet: "referrerpolicy",
							description: {
								kind: "markdown",
								value: "A string indicating which referrer to use when fetching the resource:\n\n*   `no-referrer:` The [`Referer`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Referer \"The Referer request header contains the address of the previous web page from which a link to the currently requested page was followed. The Referer header allows servers to identify where people are visiting them from and may use that data for analytics, logging, or optimized caching, for example.\") header will not be sent.\n*   `no-referrer-when-downgrade:` No `Referer` header will be sent when navigating to an origin without TLS (HTTPS). This is a user agent’s default behavior if no policy is otherwise specified.\n*   `origin:` The `Referer` header will include the page of origin's scheme, the host, and the port.\n*   `origin-when-cross-origin:` Navigating to other origins will limit the included referral data to the scheme, the host and the port, while navigating from the same origin will include the referrer's full path.\n*   `unsafe-url:` The `Referer` header will include the origin and the path, but not the fragment, password, or username. This case is unsafe because it can leak origins and paths from TLS-protected resources to insecure origins.",
							},
						},
						{
							name: "sizes",
							description: {
								kind: "markdown",
								value: "A list of one or more strings separated by commas indicating a set of source sizes. Each source size consists of:\n\n1.  a media condition. This must be omitted for the last item.\n2.  a source size value.\n\nSource size values specify the intended display size of the image. User agents use the current source size to select one of the sources supplied by the `srcset` attribute, when those sources are described using width ('`w`') descriptors. The selected source size affects the intrinsic size of the image (the image’s display size if no CSS styling is applied). If the `srcset` attribute is absent, or contains no values with a width (`w`) descriptor, then the `sizes` attribute has no effect.",
							},
						},
						{
							name: "importance",
							description:
								"Indicates the relative importance of the resource. Priority hints are delegated using the values:",
						},
						{
							name: "importance",
							description:
								"`auto`: Indicates **no preference**. The browser may use its own heuristics to decide the priority of the image.\n\n`high`: Indicates to the browser that the image is of **high** priority.\n\n`low`: Indicates to the browser that the image is of **low** priority.",
						},
						{
							name: "intrinsicsize",
							description:
								"This attribute tells the browser to ignore the actual intrinsic size of the image and pretend it’s the size specified in the attribute. Specifically, the image would raster at these dimensions and `naturalWidth`/`naturalHeight` on images would return the values specified in this attribute. [Explainer](https://github.com/ojanvafai/intrinsicsize-attribute), [examples](https://googlechrome.github.io/samples/intrinsic-size/index.html)",
						},
					],
					references: [
						{
							name: "MDN Reference",
							url: "https://developer.mozilla.org/docs/Web/HTML/Element/img",
						},
					],
				},
				{
					name: "iframe",
					description: {
						kind: "markdown",
						value: "The iframe element represents a nested browsing context.",
					},
					attributes: [
						{
							name: "src",
							description: {
								kind: "markdown",
								value: 'The URL of the page to embed. Use a value of `about:blank` to embed an empty page that conforms to the [same-origin policy](https://developer.mozilla.org/en-US/docs/Web/Security/Same-origin_policy#Inherited_origins). Also note that programatically removing an `<iframe>`\'s src attribute (e.g. via [`Element.removeAttribute()`](https://developer.mozilla.org/en-US/docs/Web/API/Element/removeAttribute "The Element method removeAttribute() removes the attribute with the specified name from the element.")) causes `about:blank` to be loaded in the frame in Firefox (from version 65), Chromium-based browsers, and Safari/iOS.',
							},
						},
						{
							name: "srcdoc",
							description: {
								kind: "markdown",
								value: "Inline HTML to embed, overriding the `src` attribute. If a browser does not support the `srcdoc` attribute, it will fall back to the URL in the `src` attribute.",
							},
						},
						{
							name: "name",
							description: {
								kind: "markdown",
								value: 'A targetable name for the embedded browsing context. This can be used in the `target` attribute of the [`<a>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/a "The HTML <a> element (or anchor element) creates a hyperlink to other web pages, files, locations within the same page, email addresses, or any other URL."), [`<form>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/form "The HTML <form> element represents a document section that contains interactive controls for submitting information to a web server."), or [`<base>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/base "The HTML <base> element specifies the base URL to use for all relative URLs contained within a document. There can be only one <base> element in a document.") elements; the `formtarget` attribute of the [`<input>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input "The HTML <input> element is used to create interactive controls for web-based forms in order to accept data from the user; a wide variety of types of input data and control widgets are available, depending on the device and user agent.") or [`<button>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/button "The HTML <button> element represents a clickable button, which can be used in forms or anywhere in a document that needs simple, standard button functionality.") elements; or the `windowName` parameter in the [`window.open()`](https://developer.mozilla.org/en-US/docs/Web/API/Window/open "The Window interface\'s open() method loads the specified resource into the browsing context (window, <iframe> or tab) with the specified name. If the name doesn\'t exist, then a new window is opened and the specified resource is loaded into its browsing context.") method.',
							},
						},
						{
							name: "sandbox",
							valueSet: "sb",
							description: {
								kind: "markdown",
								value: 'Applies extra restrictions to the content in the frame. The value of the attribute can either be empty to apply all restrictions, or space-separated tokens to lift particular restrictions:\n\n*   `allow-forms`: Allows the resource to submit forms. If this keyword is not used, form submission is blocked.\n*   `allow-modals`: Lets the resource [open modal windows](https://html.spec.whatwg.org/multipage/origin.html#sandboxed-modals-flag).\n*   `allow-orientation-lock`: Lets the resource [lock the screen orientation](https://developer.mozilla.org/en-US/docs/Web/API/Screen/lockOrientation).\n*   `allow-pointer-lock`: Lets the resource use the [Pointer Lock API](https://developer.mozilla.org/en-US/docs/WebAPI/Pointer_Lock).\n*   `allow-popups`: Allows popups (such as `window.open()`, `target="_blank"`, or `showModalDialog()`). If this keyword is not used, the popup will silently fail to open.\n*   `allow-popups-to-escape-sandbox`: Lets the sandboxed document open new windows without those windows inheriting the sandboxing. For example, this can safely sandbox an advertisement without forcing the same restrictions upon the page the ad links to.\n*   `allow-presentation`: Lets the resource start a [presentation session](https://developer.mozilla.org/en-US/docs/Web/API/PresentationRequest).\n*   `allow-same-origin`: If this token is not used, the resource is treated as being from a special origin that always fails the [same-origin policy](https://developer.mozilla.org/en-US/docs/Glossary/same-origin_policy "same-origin policy: The same-origin policy is a critical security mechanism that restricts how a document or script loaded from one origin can interact with a resource from another origin.").\n*   `allow-scripts`: Lets the resource run scripts (but not create popup windows).\n*   `allow-storage-access-by-user-activation` : Lets the resource request access to the parent\'s storage capabilities with the [Storage Access API](https://developer.mozilla.org/en-US/docs/Web/API/Storage_Access_API).\n*   `allow-top-navigation`: Lets the resource navigate the top-level browsing context (the one named `_top`).\n*   `allow-top-navigation-by-user-activation`: Lets the resource navigate the top-level browsing context, but only if initiated by a user gesture.\n\n**Notes about sandboxing:**\n\n*   When the embedded document has the same origin as the embedding page, it is **strongly discouraged** to use both `allow-scripts` and `allow-same-origin`, as that lets the embedded document remove the `sandbox` attribute — making it no more secure than not using the `sandbox` attribute at all.\n*   Sandboxing is useless if the attacker can display content outside a sandboxed `iframe` — such as if the viewer opens the frame in a new tab. Such content should be also served from a _separate origin_ to limit potential damage.\n*   The `sandbox` attribute is unsupported in Internet Explorer 9 and earlier.',
							},
						},
						{ name: "seamless", valueSet: "v" },
						{
							name: "allowfullscreen",
							valueSet: "v",
							description: {
								kind: "markdown",
								value: 'Set to `true` if the `<iframe>` can activate fullscreen mode by calling the [`requestFullscreen()`](https://developer.mozilla.org/en-US/docs/Web/API/Element/requestFullscreen "The Element.requestFullscreen() method issues an asynchronous request to make the element be displayed in full-screen mode.") method.\nThis attribute is considered a legacy attribute and redefined as `allow="fullscreen"`.',
							},
						},
						{
							name: "width",
							description: {
								kind: "markdown",
								value: "The width of the frame in CSS pixels. Default is `300`.",
							},
						},
						{
							name: "height",
							description: {
								kind: "markdown",
								value: "The height of the frame in CSS pixels. Default is `150`.",
							},
						},
						{
							name: "allow",
							description:
								"Specifies a [feature policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/Feature_Policy) for the `<iframe>`.",
						},
						{
							name: "allowpaymentrequest",
							description:
								"Set to `true` if a cross-origin `<iframe>` should be allowed to invoke the [Payment Request API](https://developer.mozilla.org/en-US/docs/Web/API/Payment_Request_API).",
						},
						{
							name: "allowpaymentrequest",
							description:
								'This attribute is considered a legacy attribute and redefined as `allow="payment"`.',
						},
						{
							name: "csp",
							description:
								'A [Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP) enforced for the embedded resource. See [`HTMLIFrameElement.csp`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLIFrameElement/csp "The csp property of the HTMLIFrameElement interface specifies the Content Security Policy that an embedded document must agree to enforce upon itself.") for details.',
						},
						{
							name: "importance",
							description: `The download priority of the resource in the \`<iframe>\`'s \`src\` attribute. Allowed values:

\`auto\` (default)

No preference. The browser uses its own heuristics to decide the priority of the resource.

\`high\`

The resource should be downloaded before other lower-priority page resources.

\`low\`

The resource should be downloaded after other higher-priority page resources.`,
						},
						{
							name: "referrerpolicy",
							description:
								'Indicates which [referrer](https://developer.mozilla.org/en-US/docs/Web/API/Document/referrer) to send when fetching the frame\'s resource:\n\n*   `no-referrer`: The [`Referer`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Referer "The Referer request header contains the address of the previous web page from which a link to the currently requested page was followed. The Referer header allows servers to identify where people are visiting them from and may use that data for analytics, logging, or optimized caching, for example.") header will not be sent.\n*   `no-referrer-when-downgrade` (default): The [`Referer`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Referer "The Referer request header contains the address of the previous web page from which a link to the currently requested page was followed. The Referer header allows servers to identify where people are visiting them from and may use that data for analytics, logging, or optimized caching, for example.") header will not be sent to [origin](https://developer.mozilla.org/en-US/docs/Glossary/origin "origin: Web content\'s origin is defined by the scheme (protocol), host (domain), and port of the URL used to access it. Two objects have the same origin only when the scheme, host, and port all match.")s without [TLS](https://developer.mozilla.org/en-US/docs/Glossary/TLS "TLS: Transport Layer Security (TLS), previously known as Secure Sockets Layer (SSL), is a protocol used by applications to communicate securely across a network, preventing tampering with and eavesdropping on email, web browsing, messaging, and other protocols.") ([HTTPS](https://developer.mozilla.org/en-US/docs/Glossary/HTTPS "HTTPS: HTTPS (HTTP Secure) is an encrypted version of the HTTP protocol. It usually uses SSL or TLS to encrypt all communication between a client and a server. This secure connection allows clients to safely exchange sensitive data with a server, for example for banking activities or online shopping.")).\n*   `origin`: The sent referrer will be limited to the origin of the referring page: its [scheme](https://developer.mozilla.org/en-US/docs/Archive/Mozilla/URIScheme), [host](https://developer.mozilla.org/en-US/docs/Glossary/host "host: A host is a device connected to the Internet (or a local network). Some hosts called servers offer additional services like serving webpages or storing files and emails."), and [port](https://developer.mozilla.org/en-US/docs/Glossary/port "port: For a computer connected to a network with an IP address, a port is a communication endpoint. Ports are designated by numbers, and below 1024 each port is associated by default with a specific protocol.").\n*   `origin-when-cross-origin`: The referrer sent to other origins will be limited to the scheme, the host, and the port. Navigations on the same origin will still include the path.\n*   `same-origin`: A referrer will be sent for [same origin](https://developer.mozilla.org/en-US/docs/Glossary/Same-origin_policy "same origin: The same-origin policy is a critical security mechanism that restricts how a document or script loaded from one origin can interact with a resource from another origin."), but cross-origin requests will contain no referrer information.\n*   `strict-origin`: Only send the origin of the document as the referrer when the protocol security level stays the same (HTTPS→HTTPS), but don\'t send it to a less secure destination (HTTPS→HTTP).\n*   `strict-origin-when-cross-origin`: Send a full URL when performing a same-origin request, only send the origin when the protocol security level stays the same (HTTPS→HTTPS), and send no header to a less secure destination (HTTPS→HTTP).\n*   `unsafe-url`: The referrer will include the origin _and_ the path (but not the [fragment](https://developer.mozilla.org/en-US/docs/Web/API/HTMLHyperlinkElementUtils/hash), [password](https://developer.mozilla.org/en-US/docs/Web/API/HTMLHyperlinkElementUtils/password), or [username](https://developer.mozilla.org/en-US/docs/Web/API/HTMLHyperlinkElementUtils/username)). **This value is unsafe**, because it leaks origins and paths from TLS-protected resources to insecure origins.',
						},
					],
					references: [
						{
							name: "MDN Reference",
							url: "https://developer.mozilla.org/docs/Web/HTML/Element/iframe",
						},
					],
				},
				{
					name: "embed",
					description: {
						kind: "markdown",
						value: "The embed element provides an integration point for an external (typically non-HTML) application or interactive content.",
					},
					void: !0,
					attributes: [
						{
							name: "src",
							description: {
								kind: "markdown",
								value: "The URL of the resource being embedded.",
							},
						},
						{
							name: "type",
							description: {
								kind: "markdown",
								value: "The MIME type to use to select the plug-in to instantiate.",
							},
						},
						{
							name: "width",
							description: {
								kind: "markdown",
								value: "The displayed width of the resource, in [CSS pixels](https://drafts.csswg.org/css-values/#px). This must be an absolute value; percentages are _not_ allowed.",
							},
						},
						{
							name: "height",
							description: {
								kind: "markdown",
								value: "The displayed height of the resource, in [CSS pixels](https://drafts.csswg.org/css-values/#px). This must be an absolute value; percentages are _not_ allowed.",
							},
						},
					],
					references: [
						{
							name: "MDN Reference",
							url: "https://developer.mozilla.org/docs/Web/HTML/Element/embed",
						},
					],
				},
				{
					name: "object",
					description: {
						kind: "markdown",
						value: "The object element can represent an external resource, which, depending on the type of the resource, will either be treated as an image, as a nested browsing context, or as an external resource to be processed by a plugin.",
					},
					attributes: [
						{
							name: "data",
							description: {
								kind: "markdown",
								value: "The address of the resource as a valid URL. At least one of **data** and **type** must be defined.",
							},
						},
						{
							name: "type",
							description: {
								kind: "markdown",
								value: "The [content type](https://developer.mozilla.org/en-US/docs/Glossary/Content_type) of the resource specified by **data**. At least one of **data** and **type** must be defined.",
							},
						},
						{
							name: "typemustmatch",
							valueSet: "v",
							description: {
								kind: "markdown",
								value: "This Boolean attribute indicates if the **type** attribute and the actual [content type](https://developer.mozilla.org/en-US/docs/Glossary/Content_type) of the resource must match to be used.",
							},
						},
						{
							name: "name",
							description: {
								kind: "markdown",
								value: "The name of valid browsing context (HTML5), or the name of the control (HTML 4).",
							},
						},
						{
							name: "usemap",
							description: {
								kind: "markdown",
								value: "A hash-name reference to a [`<map>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/map \"The HTML <map> element is used with <area> elements to define an image map (a clickable link area).\") element; that is a '#' followed by the value of a [`name`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/map#attr-name) of a map element.",
							},
						},
						{
							name: "form",
							description: {
								kind: "markdown",
								value: 'The form element, if any, that the object element is associated with (its _form owner_). The value of the attribute must be an ID of a [`<form>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/form "The HTML <form> element represents a document section that contains interactive controls for submitting information to a web server.") element in the same document.',
							},
						},
						{
							name: "width",
							description: {
								kind: "markdown",
								value: "The width of the display resource, in [CSS pixels](https://drafts.csswg.org/css-values/#px). -- (Absolute values only. [NO percentages](https://html.spec.whatwg.org/multipage/embedded-content.html#dimension-attributes))",
							},
						},
						{
							name: "height",
							description: {
								kind: "markdown",
								value: "The height of the displayed resource, in [CSS pixels](https://drafts.csswg.org/css-values/#px). -- (Absolute values only. [NO percentages](https://html.spec.whatwg.org/multipage/embedded-content.html#dimension-attributes))",
							},
						},
						{
							name: "archive",
							description:
								"A space-separated list of URIs for archives of resources for the object.",
						},
						{
							name: "border",
							description:
								"The width of a border around the control, in pixels.",
						},
						{
							name: "classid",
							description:
								"The URI of the object's implementation. It can be used together with, or in place of, the **data** attribute.",
						},
						{
							name: "codebase",
							description:
								"The base path used to resolve relative URIs specified by **classid**, **data**, or **archive**. If not specified, the default is the base URI of the current document.",
						},
						{
							name: "codetype",
							description:
								"The content type of the data specified by **classid**.",
						},
						{
							name: "declare",
							description:
								"The presence of this Boolean attribute makes this element a declaration only. The object must be instantiated by a subsequent `<object>` element. In HTML5, repeat the <object> element completely each that that the resource is reused.",
						},
						{
							name: "standby",
							description:
								"A message that the browser can show while loading the object's implementation and data.",
						},
						{
							name: "tabindex",
							description:
								"The position of the element in the tabbing navigation order for the current document.",
						},
					],
					references: [
						{
							name: "MDN Reference",
							url: "https://developer.mozilla.org/docs/Web/HTML/Element/object",
						},
					],
				},
				{
					name: "param",
					description: {
						kind: "markdown",
						value: "The param element defines parameters for plugins invoked by object elements. It does not represent anything on its own.",
					},
					void: !0,
					attributes: [
						{
							name: "name",
							description: {
								kind: "markdown",
								value: "Name of the parameter.",
							},
						},
						{
							name: "value",
							description: {
								kind: "markdown",
								value: "Specifies the value of the parameter.",
							},
						},
						{
							name: "type",
							description:
								'Only used if the `valuetype` is set to "ref". Specifies the MIME type of values found at the URI specified by value.',
						},
						{
							name: "valuetype",
							description: `Specifies the type of the \`value\` attribute. Possible values are:

*   data: Default value. The value is passed to the object's implementation as a string.
*   ref: The value is a URI to a resource where run-time values are stored.
*   object: An ID of another [\`<object>\`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/object "The HTML <object> element represents an external resource, which can be treated as an image, a nested browsing context, or a resource to be handled by a plugin.") in the same document.`,
						},
					],
					references: [
						{
							name: "MDN Reference",
							url: "https://developer.mozilla.org/docs/Web/HTML/Element/param",
						},
					],
				},
				{
					name: "video",
					description: {
						kind: "markdown",
						value: "A video element is used for playing videos or movies, and audio files with captions.",
					},
					attributes: [
						{ name: "src" },
						{ name: "crossorigin", valueSet: "xo" },
						{ name: "poster" },
						{ name: "preload", valueSet: "pl" },
						{
							name: "autoplay",
							valueSet: "v",
							description: {
								kind: "markdown",
								value: 'A Boolean attribute; if specified, the video automatically begins to play back as soon as it can do so without stopping to finish loading the data.\n**Note**: Sites that automatically play audio (or video with an audio track) can be an unpleasant experience for users, so it should be avoided when possible. If you must offer autoplay functionality, you should make it opt-in (requiring a user to specifically enable it). However, this can be useful when creating media elements whose source will be set at a later time, under user control.\n\nTo disable video autoplay, `autoplay="false"` will not work; the video will autoplay if the attribute is there in the `<video>` tag at all. To remove autoplay the attribute needs to be removed altogether.\n\nIn some browsers (e.g. Chrome 70.0) autoplay is not working if no `muted` attribute is present.',
							},
						},
						{ name: "mediagroup" },
						{ name: "loop", valueSet: "v" },
						{ name: "muted", valueSet: "v" },
						{ name: "controls", valueSet: "v" },
						{ name: "width" },
						{ name: "height" },
					],
					references: [
						{
							name: "MDN Reference",
							url: "https://developer.mozilla.org/docs/Web/HTML/Element/video",
						},
					],
				},
				{
					name: "audio",
					description: {
						kind: "markdown",
						value: "An audio element represents a sound or audio stream.",
					},
					attributes: [
						{
							name: "src",
							description: {
								kind: "markdown",
								value: 'The URL of the audio to embed. This is subject to [HTTP access controls](https://developer.mozilla.org/en-US/docs/HTTP_access_control). This is optional; you may instead use the [`<source>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/source "The HTML <source> element specifies multiple media resources for the <picture>, the <audio> element, or the <video> element.") element within the audio block to specify the audio to embed.',
							},
						},
						{
							name: "crossorigin",
							valueSet: "xo",
							description: {
								kind: "markdown",
								value: 'This enumerated attribute indicates whether to use CORS to fetch the related image. [CORS-enabled resources](https://developer.mozilla.org/en-US/docs/CORS_Enabled_Image) can be reused in the [`<canvas>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/canvas "Use the HTML <canvas> element with either the canvas scripting API or the WebGL API to draw graphics and animations.") element without being _tainted_. The allowed values are:\n\nanonymous\n\nSends a cross-origin request without a credential. In other words, it sends the `Origin:` HTTP header without a cookie, X.509 certificate, or performing HTTP Basic authentication. If the server does not give credentials to the origin site (by not setting the `Access-Control-Allow-Origin:` HTTP header), the image will be _tainted_, and its usage restricted.\n\nuse-credentials\n\nSends a cross-origin request with a credential. In other words, it sends the `Origin:` HTTP header with a cookie, a certificate, or performing HTTP Basic authentication. If the server does not give credentials to the origin site (through `Access-Control-Allow-Credentials:` HTTP header), the image will be _tainted_ and its usage restricted.\n\nWhen not present, the resource is fetched without a CORS request (i.e. without sending the `Origin:` HTTP header), preventing its non-tainted used in [`<canvas>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/canvas "Use the HTML <canvas> element with either the canvas scripting API or the WebGL API to draw graphics and animations.") elements. If invalid, it is handled as if the enumerated keyword **anonymous** was used. See [CORS settings attributes](https://developer.mozilla.org/en-US/docs/HTML/CORS_settings_attributes) for additional information.',
							},
						},
						{
							name: "preload",
							valueSet: "pl",
							description: {
								kind: "markdown",
								value: "This enumerated attribute is intended to provide a hint to the browser about what the author thinks will lead to the best user experience. It may have one of the following values:\n\n*   `none`: Indicates that the audio should not be preloaded.\n*   `metadata`: Indicates that only audio metadata (e.g. length) is fetched.\n*   `auto`: Indicates that the whole audio file can be downloaded, even if the user is not expected to use it.\n*   _empty string_: A synonym of the `auto` value.\n\nIf not set, `preload`'s default value is browser-defined (i.e. each browser may have its own default value). The spec advises it to be set to `metadata`.\n\n**Usage notes:**\n\n*   The `autoplay` attribute has precedence over `preload`. If `autoplay` is specified, the browser would obviously need to start downloading the audio for playback.\n*   The browser is not forced by the specification to follow the value of this attribute; it is a mere hint.",
							},
						},
						{
							name: "autoplay",
							valueSet: "v",
							description: {
								kind: "markdown",
								value: `A Boolean attribute: if specified, the audio will automatically begin playback as soon as it can do so, without waiting for the entire audio file to finish downloading.

**Note**: Sites that automatically play audio (or videos with an audio track) can be an unpleasant experience for users, so should be avoided when possible. If you must offer autoplay functionality, you should make it opt-in (requiring a user to specifically enable it). However, this can be useful when creating media elements whose source will be set at a later time, under user control.`,
							},
						},
						{ name: "mediagroup" },
						{
							name: "loop",
							valueSet: "v",
							description: {
								kind: "markdown",
								value: "A Boolean attribute: if specified, the audio player will automatically seek back to the start upon reaching the end of the audio.",
							},
						},
						{
							name: "muted",
							valueSet: "v",
							description: {
								kind: "markdown",
								value: "A Boolean attribute that indicates whether the audio will be initially silenced. Its default value is `false`.",
							},
						},
						{
							name: "controls",
							valueSet: "v",
							description: {
								kind: "markdown",
								value: "If this attribute is present, the browser will offer controls to allow the user to control audio playback, including volume, seeking, and pause/resume playback.",
							},
						},
					],
					references: [
						{
							name: "MDN Reference",
							url: "https://developer.mozilla.org/docs/Web/HTML/Element/audio",
						},
					],
				},
				{
					name: "source",
					description: {
						kind: "markdown",
						value: "The source element allows authors to specify multiple alternative media resources for media elements. It does not represent anything on its own.",
					},
					void: !0,
					attributes: [
						{
							name: "src",
							description: {
								kind: "markdown",
								value: 'Required for [`<audio>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/audio "The HTML <audio> element is used to embed sound content in documents. It may contain one or more audio sources, represented using the src attribute or the <source> element: the browser will choose the most suitable one. It can also be the destination for streamed media, using a MediaStream.") and [`<video>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/video "The HTML Video element (<video>) embeds a media player which supports video playback into the document."), address of the media resource. The value of this attribute is ignored when the `<source>` element is placed inside a [`<picture>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/picture "The HTML <picture> element contains zero or more <source> elements and one <img> element to provide versions of an image for different display/device scenarios.") element.',
							},
						},
						{
							name: "type",
							description: {
								kind: "markdown",
								value: "The MIME-type of the resource, optionally with a `codecs` parameter. See [RFC 4281](https://tools.ietf.org/html/rfc4281) for information about how to specify codecs.",
							},
						},
						{
							name: "sizes",
							description:
								'Is a list of source sizes that describes the final rendered width of the image represented by the source. Each source size consists of a comma-separated list of media condition-length pairs. This information is used by the browser to determine, before laying the page out, which image defined in [`srcset`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/source#attr-srcset) to use.  \nThe `sizes` attribute has an effect only when the [`<source>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/source "The HTML <source> element specifies multiple media resources for the <picture>, the <audio> element, or the <video> element.") element is the direct child of a [`<picture>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/picture "The HTML <picture> element contains zero or more <source> elements and one <img> element to provide versions of an image for different display/device scenarios.") element.',
						},
						{
							name: "srcset",
							description:
								"A list of one or more strings separated by commas indicating a set of possible images represented by the source for the browser to use. Each string is composed of:\n\n1.  one URL to an image,\n2.  a width descriptor, that is a positive integer directly followed by `'w'`. The default value, if missing, is the infinity.\n3.  a pixel density descriptor, that is a positive floating number directly followed by `'x'`. The default value, if missing, is `1x`.\n\nEach string in the list must have at least a width descriptor or a pixel density descriptor to be valid. Among the list, there must be only one string containing the same tuple of width descriptor and pixel density descriptor.  \nThe browser chooses the most adequate image to display at a given point of time.  \nThe `srcset` attribute has an effect only when the [`<source>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/source \"The HTML <source> element specifies multiple media resources for the <picture>, the <audio> element, or the <video> element.\") element is the direct child of a [`<picture>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/picture \"The HTML <picture> element contains zero or more <source> elements and one <img> element to provide versions of an image for different display/device scenarios.\") element.",
						},
						{
							name: "media",
							description:
								'[Media query](https://developer.mozilla.org/en-US/docs/CSS/Media_queries) of the resource\'s intended media; this should be used only in a [`<picture>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/picture "The HTML <picture> element contains zero or more <source> elements and one <img> element to provide versions of an image for different display/device scenarios.") element.',
						},
					],
					references: [
						{
							name: "MDN Reference",
							url: "https://developer.mozilla.org/docs/Web/HTML/Element/source",
						},
					],
				},
				{
					name: "track",
					description: {
						kind: "markdown",
						value: "The track element allows authors to specify explicit external timed text tracks for media elements. It does not represent anything on its own.",
					},
					void: !0,
					attributes: [
						{
							name: "default",
							valueSet: "v",
							description: {
								kind: "markdown",
								value: "This attribute indicates that the track should be enabled unless the user's preferences indicate that another track is more appropriate. This may only be used on one `track` element per media element.",
							},
						},
						{
							name: "kind",
							valueSet: "tk",
							description: {
								kind: "markdown",
								value: "How the text track is meant to be used. If omitted the default kind is `subtitles`. If the attribute is not present, it will use the `subtitles`. If the attribute contains an invalid value, it will use `metadata`. (Versions of Chrome earlier than 52 treated an invalid value as `subtitles`.) The following keywords are allowed:\n\n*   `subtitles`\n    *   Subtitles provide translation of content that cannot be understood by the viewer. For example dialogue or text that is not English in an English language film.\n    *   Subtitles may contain additional content, usually extra background information. For example the text at the beginning of the Star Wars films, or the date, time, and location of a scene.\n*   `captions`\n    *   Closed captions provide a transcription and possibly a translation of audio.\n    *   It may include important non-verbal information such as music cues or sound effects. It may indicate the cue's source (e.g. music, text, character).\n    *   Suitable for users who are deaf or when the sound is muted.\n*   `descriptions`\n    *   Textual description of the video content.\n    *   Suitable for users who are blind or where the video cannot be seen.\n*   `chapters`\n    *   Chapter titles are intended to be used when the user is navigating the media resource.\n*   `metadata`\n    *   Tracks used by scripts. Not visible to the user.",
							},
						},
						{
							name: "label",
							description: {
								kind: "markdown",
								value: "A user-readable title of the text track which is used by the browser when listing available text tracks.",
							},
						},
						{
							name: "src",
							description: {
								kind: "markdown",
								value: 'Address of the track (`.vtt` file). Must be a valid URL. This attribute must be specified and its URL value must have the same origin as the document — unless the [`<audio>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/audio "The HTML <audio> element is used to embed sound content in documents. It may contain one or more audio sources, represented using the src attribute or the <source> element: the browser will choose the most suitable one. It can also be the destination for streamed media, using a MediaStream.") or [`<video>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/video "The HTML Video element (<video>) embeds a media player which supports video playback into the document.") parent element of the `track` element has a [`crossorigin`](https://developer.mozilla.org/en-US/docs/Web/HTML/CORS_settings_attributes) attribute.',
							},
						},
						{
							name: "srclang",
							description: {
								kind: "markdown",
								value: "Language of the track text data. It must be a valid [BCP 47](https://r12a.github.io/app-subtags/) language tag. If the `kind` attribute is set to `subtitles,` then `srclang` must be defined.",
							},
						},
					],
					references: [
						{
							name: "MDN Reference",
							url: "https://developer.mozilla.org/docs/Web/HTML/Element/track",
						},
					],
				},
				{
					name: "map",
					description: {
						kind: "markdown",
						value: "The map element, in conjunction with an img element and any area element descendants, defines an image map. The element represents its children.",
					},
					attributes: [
						{
							name: "name",
							description: {
								kind: "markdown",
								value: "The name attribute gives the map a name so that it can be referenced. The attribute must be present and must have a non-empty value with no space characters. The value of the name attribute must not be a compatibility-caseless match for the value of the name attribute of another map element in the same document. If the id attribute is also specified, both attributes must have the same value.",
							},
						},
					],
					references: [
						{
							name: "MDN Reference",
							url: "https://developer.mozilla.org/docs/Web/HTML/Element/map",
						},
					],
				},
				{
					name: "area",
					description: {
						kind: "markdown",
						value: "The area element represents either a hyperlink with some text and a corresponding area on an image map, or a dead area on an image map.",
					},
					void: !0,
					attributes: [
						{ name: "alt" },
						{ name: "coords" },
						{ name: "shape", valueSet: "sh" },
						{ name: "href" },
						{ name: "target", valueSet: "target" },
						{ name: "download" },
						{ name: "ping" },
						{ name: "rel" },
						{ name: "hreflang" },
						{ name: "type" },
						{
							name: "accesskey",
							description:
								"Specifies a keyboard navigation accelerator for the element. Pressing ALT or a similar key in association with the specified character selects the form control correlated with that key sequence. Page designers are forewarned to avoid key sequences already bound to browsers. This attribute is global since HTML5.",
						},
					],
					references: [
						{
							name: "MDN Reference",
							url: "https://developer.mozilla.org/docs/Web/HTML/Element/area",
						},
					],
				},
				{
					name: "table",
					description: {
						kind: "markdown",
						value: "The table element represents data with more than one dimension, in the form of a table.",
					},
					attributes: [
						{ name: "border" },
						{
							name: "align",
							description:
								'This enumerated attribute indicates how the table must be aligned inside the containing document. It may have the following values:\n\n*   left: the table is displayed on the left side of the document;\n*   center: the table is displayed in the center of the document;\n*   right: the table is displayed on the right side of the document.\n\n**Usage Note**\n\n*   **Do not use this attribute**, as it has been deprecated. The [`<table>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/table "The HTML <table> element represents tabular data — that is, information presented in a two-dimensional table comprised of rows and columns of cells containing data.") element should be styled using [CSS](https://developer.mozilla.org/en-US/docs/CSS). Set [`margin-left`](https://developer.mozilla.org/en-US/docs/Web/CSS/margin-left "The margin-left CSS property sets the margin area on the left side of an element. A positive value places it farther from its neighbors, while a negative value places it closer.") and [`margin-right`](https://developer.mozilla.org/en-US/docs/Web/CSS/margin-right "The margin-right CSS property sets the margin area on the right side of an element. A positive value places it farther from its neighbors, while a negative value places it closer.") to `auto` or [`margin`](https://developer.mozilla.org/en-US/docs/Web/CSS/margin "The margin CSS property sets the margin area on all four sides of an element. It is a shorthand for margin-top, margin-right, margin-bottom, and margin-left.") to `0 auto` to achieve an effect that is similar to the align attribute.\n*   Prior to Firefox 4, Firefox also supported the `middle`, `absmiddle`, and `abscenter` values as synonyms of `center`, in quirks mode only.',
						},
					],
					references: [
						{
							name: "MDN Reference",
							url: "https://developer.mozilla.org/docs/Web/HTML/Element/table",
						},
					],
				},
				{
					name: "caption",
					description: {
						kind: "markdown",
						value: "The caption element represents the title of the table that is its parent, if it has a parent and that is a table element.",
					},
					attributes: [
						{
							name: "align",
							description: `This enumerated attribute indicates how the caption must be aligned with respect to the table. It may have one of the following values:

\`left\`

The caption is displayed to the left of the table.

\`top\`

The caption is displayed above the table.

\`right\`

The caption is displayed to the right of the table.

\`bottom\`

The caption is displayed below the table.

**Usage note:** Do not use this attribute, as it has been deprecated. The [\`<caption>\`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/caption "The HTML Table Caption element (<caption>) specifies the caption (or title) of a table, and if used is always the first child of a <table>.") element should be styled using the [CSS](https://developer.mozilla.org/en-US/docs/CSS) properties [\`caption-side\`](https://developer.mozilla.org/en-US/docs/Web/CSS/caption-side "The caption-side CSS property puts the content of a table's <caption> on the specified side. The values are relative to the writing-mode of the table.") and [\`text-align\`](https://developer.mozilla.org/en-US/docs/Web/CSS/text-align "The text-align CSS property sets the horizontal alignment of an inline or table-cell box. This means it works like vertical-align but in the horizontal direction.").`,
						},
					],
					references: [
						{
							name: "MDN Reference",
							url: "https://developer.mozilla.org/docs/Web/HTML/Element/caption",
						},
					],
				},
				{
					name: "colgroup",
					description: {
						kind: "markdown",
						value: "The colgroup element represents a group of one or more columns in the table that is its parent, if it has a parent and that is a table element.",
					},
					attributes: [
						{ name: "span" },
						{
							name: "align",
							description:
								'This enumerated attribute specifies how horizontal alignment of each column cell content will be handled. Possible values are:\n\n*   `left`, aligning the content to the left of the cell\n*   `center`, centering the content in the cell\n*   `right`, aligning the content to the right of the cell\n*   `justify`, inserting spaces into the textual content so that the content is justified in the cell\n*   `char`, aligning the textual content on a special character with a minimal offset, defined by the [`char`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/col#attr-char) and [`charoff`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/col#attr-charoff) attributes Unimplemented (see [bug 2212](https://bugzilla.mozilla.org/show_bug.cgi?id=2212 "character alignment not implemented (align=char, charoff=, text-align:<string>)")).\n\nIf this attribute is not set, the `left` value is assumed. The descendant [`<col>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/col "The HTML <col> element defines a column within a table and is used for defining common semantics on all common cells. It is generally found within a <colgroup> element.") elements may override this value using their own [`align`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/col#attr-align) attribute.\n\n**Note:** Do not use this attribute as it is obsolete (not supported) in the latest standard.\n\n*   To achieve the same effect as the `left`, `center`, `right` or `justify` values:\n    *   Do not try to set the [`text-align`](https://developer.mozilla.org/en-US/docs/Web/CSS/text-align "The text-align CSS property sets the horizontal alignment of an inline or table-cell box. This means it works like vertical-align but in the horizontal direction.") property on a selector giving a [`<colgroup>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/colgroup "The HTML <colgroup> element defines a group of columns within a table.") element. Because [`<td>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/td "The HTML <td> element defines a cell of a table that contains data. It participates in the table model.") elements are not descendant of the [`<colgroup>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/colgroup "The HTML <colgroup> element defines a group of columns within a table.") element, they won\'t inherit it.\n    *   If the table doesn\'t use a [`colspan`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/td#attr-colspan) attribute, use one `td:nth-child(an+b)` CSS selector per column, where a is the total number of the columns in the table and b is the ordinal position of this column in the table. Only after this selector the [`text-align`](https://developer.mozilla.org/en-US/docs/Web/CSS/text-align "The text-align CSS property sets the horizontal alignment of an inline or table-cell box. This means it works like vertical-align but in the horizontal direction.") property can be used.\n    *   If the table does use a [`colspan`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/td#attr-colspan) attribute, the effect can be achieved by combining adequate CSS attribute selectors like `[colspan=n]`, though this is not trivial.\n*   To achieve the same effect as the `char` value, in CSS3, you can use the value of the [`char`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/colgroup#attr-char) as the value of the [`text-align`](https://developer.mozilla.org/en-US/docs/Web/CSS/text-align "The text-align CSS property sets the horizontal alignment of an inline or table-cell box. This means it works like vertical-align but in the horizontal direction.") property Unimplemented.',
						},
					],
					references: [
						{
							name: "MDN Reference",
							url: "https://developer.mozilla.org/docs/Web/HTML/Element/colgroup",
						},
					],
				},
				{
					name: "col",
					description: {
						kind: "markdown",
						value: "If a col element has a parent and that is a colgroup element that itself has a parent that is a table element, then the col element represents one or more columns in the column group represented by that colgroup.",
					},
					void: !0,
					attributes: [
						{ name: "span" },
						{
							name: "align",
							description:
								'This enumerated attribute specifies how horizontal alignment of each column cell content will be handled. Possible values are:\n\n*   `left`, aligning the content to the left of the cell\n*   `center`, centering the content in the cell\n*   `right`, aligning the content to the right of the cell\n*   `justify`, inserting spaces into the textual content so that the content is justified in the cell\n*   `char`, aligning the textual content on a special character with a minimal offset, defined by the [`char`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/col#attr-char) and [`charoff`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/col#attr-charoff) attributes Unimplemented (see [bug 2212](https://bugzilla.mozilla.org/show_bug.cgi?id=2212 "character alignment not implemented (align=char, charoff=, text-align:<string>)")).\n\nIf this attribute is not set, its value is inherited from the [`align`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/colgroup#attr-align) of the [`<colgroup>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/colgroup "The HTML <colgroup> element defines a group of columns within a table.") element this `<col>` element belongs too. If there are none, the `left` value is assumed.\n\n**Note:** Do not use this attribute as it is obsolete (not supported) in the latest standard.\n\n*   To achieve the same effect as the `left`, `center`, `right` or `justify` values:\n    *   Do not try to set the [`text-align`](https://developer.mozilla.org/en-US/docs/Web/CSS/text-align "The text-align CSS property sets the horizontal alignment of an inline or table-cell box. This means it works like vertical-align but in the horizontal direction.") property on a selector giving a [`<col>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/col "The HTML <col> element defines a column within a table and is used for defining common semantics on all common cells. It is generally found within a <colgroup> element.") element. Because [`<td>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/td "The HTML <td> element defines a cell of a table that contains data. It participates in the table model.") elements are not descendant of the [`<col>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/col "The HTML <col> element defines a column within a table and is used for defining common semantics on all common cells. It is generally found within a <colgroup> element.") element, they won\'t inherit it.\n    *   If the table doesn\'t use a [`colspan`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/td#attr-colspan) attribute, use the `td:nth-child(an+b)` CSS selector. Set `a` to zero and `b` to the position of the column in the table, e.g. `td:nth-child(2) { text-align: right; }` to right-align the second column.\n    *   If the table does use a [`colspan`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/td#attr-colspan) attribute, the effect can be achieved by combining adequate CSS attribute selectors like `[colspan=n]`, though this is not trivial.\n*   To achieve the same effect as the `char` value, in CSS3, you can use the value of the [`char`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/col#attr-char) as the value of the [`text-align`](https://developer.mozilla.org/en-US/docs/Web/CSS/text-align "The text-align CSS property sets the horizontal alignment of an inline or table-cell box. This means it works like vertical-align but in the horizontal direction.") property Unimplemented.',
						},
					],
					references: [
						{
							name: "MDN Reference",
							url: "https://developer.mozilla.org/docs/Web/HTML/Element/col",
						},
					],
				},
				{
					name: "tbody",
					description: {
						kind: "markdown",
						value: "The tbody element represents a block of rows that consist of a body of data for the parent table element, if the tbody element has a parent and it is a table.",
					},
					attributes: [
						{
							name: "align",
							description:
								'This enumerated attribute specifies how horizontal alignment of each cell content will be handled. Possible values are:\n\n*   `left`, aligning the content to the left of the cell\n*   `center`, centering the content in the cell\n*   `right`, aligning the content to the right of the cell\n*   `justify`, inserting spaces into the textual content so that the content is justified in the cell\n*   `char`, aligning the textual content on a special character with a minimal offset, defined by the [`char`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/tbody#attr-char) and [`charoff`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/tbody#attr-charoff) attributes.\n\nIf this attribute is not set, the `left` value is assumed.\n\n**Note:** Do not use this attribute as it is obsolete (not supported) in the latest standard.\n\n*   To achieve the same effect as the `left`, `center`, `right` or `justify` values, use the CSS [`text-align`](https://developer.mozilla.org/en-US/docs/Web/CSS/text-align "The text-align CSS property sets the horizontal alignment of an inline or table-cell box. This means it works like vertical-align but in the horizontal direction.") property on it.\n*   To achieve the same effect as the `char` value, in CSS3, you can use the value of the [`char`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/tbody#attr-char) as the value of the [`text-align`](https://developer.mozilla.org/en-US/docs/Web/CSS/text-align "The text-align CSS property sets the horizontal alignment of an inline or table-cell box. This means it works like vertical-align but in the horizontal direction.") property Unimplemented.',
						},
					],
					references: [
						{
							name: "MDN Reference",
							url: "https://developer.mozilla.org/docs/Web/HTML/Element/tbody",
						},
					],
				},
				{
					name: "thead",
					description: {
						kind: "markdown",
						value: "The thead element represents the block of rows that consist of the column labels (headers) for the parent table element, if the thead element has a parent and it is a table.",
					},
					attributes: [
						{
							name: "align",
							description:
								'This enumerated attribute specifies how horizontal alignment of each cell content will be handled. Possible values are:\n\n*   `left`, aligning the content to the left of the cell\n*   `center`, centering the content in the cell\n*   `right`, aligning the content to the right of the cell\n*   `justify`, inserting spaces into the textual content so that the content is justified in the cell\n*   `char`, aligning the textual content on a special character with a minimal offset, defined by the [`char`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/thead#attr-char) and [`charoff`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/thead#attr-charoff) attributes Unimplemented (see [bug 2212](https://bugzilla.mozilla.org/show_bug.cgi?id=2212 "character alignment not implemented (align=char, charoff=, text-align:<string>)")).\n\nIf this attribute is not set, the `left` value is assumed.\n\n**Note:** Do not use this attribute as it is obsolete (not supported) in the latest standard.\n\n*   To achieve the same effect as the `left`, `center`, `right` or `justify` values, use the CSS [`text-align`](https://developer.mozilla.org/en-US/docs/Web/CSS/text-align "The text-align CSS property sets the horizontal alignment of an inline or table-cell box. This means it works like vertical-align but in the horizontal direction.") property on it.\n*   To achieve the same effect as the `char` value, in CSS3, you can use the value of the [`char`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/thead#attr-char) as the value of the [`text-align`](https://developer.mozilla.org/en-US/docs/Web/CSS/text-align "The text-align CSS property sets the horizontal alignment of an inline or table-cell box. This means it works like vertical-align but in the horizontal direction.") property Unimplemented.',
						},
					],
					references: [
						{
							name: "MDN Reference",
							url: "https://developer.mozilla.org/docs/Web/HTML/Element/thead",
						},
					],
				},
				{
					name: "tfoot",
					description: {
						kind: "markdown",
						value: "The tfoot element represents the block of rows that consist of the column summaries (footers) for the parent table element, if the tfoot element has a parent and it is a table.",
					},
					attributes: [
						{
							name: "align",
							description:
								'This enumerated attribute specifies how horizontal alignment of each cell content will be handled. Possible values are:\n\n*   `left`, aligning the content to the left of the cell\n*   `center`, centering the content in the cell\n*   `right`, aligning the content to the right of the cell\n*   `justify`, inserting spaces into the textual content so that the content is justified in the cell\n*   `char`, aligning the textual content on a special character with a minimal offset, defined by the [`char`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/tbody#attr-char) and [`charoff`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/tbody#attr-charoff) attributes Unimplemented (see [bug 2212](https://bugzilla.mozilla.org/show_bug.cgi?id=2212 "character alignment not implemented (align=char, charoff=, text-align:<string>)")).\n\nIf this attribute is not set, the `left` value is assumed.\n\n**Note:** Do not use this attribute as it is obsolete (not supported) in the latest standard.\n\n*   To achieve the same effect as the `left`, `center`, `right` or `justify` values, use the CSS [`text-align`](https://developer.mozilla.org/en-US/docs/Web/CSS/text-align "The text-align CSS property sets the horizontal alignment of an inline or table-cell box. This means it works like vertical-align but in the horizontal direction.") property on it.\n*   To achieve the same effect as the `char` value, in CSS3, you can use the value of the [`char`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/tfoot#attr-char) as the value of the [`text-align`](https://developer.mozilla.org/en-US/docs/Web/CSS/text-align "The text-align CSS property sets the horizontal alignment of an inline or table-cell box. This means it works like vertical-align but in the horizontal direction.") property Unimplemented.',
						},
					],
					references: [
						{
							name: "MDN Reference",
							url: "https://developer.mozilla.org/docs/Web/HTML/Element/tfoot",
						},
					],
				},
				{
					name: "tr",
					description: {
						kind: "markdown",
						value: "The tr element represents a row of cells in a table.",
					},
					attributes: [
						{
							name: "align",
							description:
								'A [`DOMString`](https://developer.mozilla.org/en-US/docs/Web/API/DOMString "DOMString is a UTF-16 String. As JavaScript already uses such strings, DOMString is mapped directly to a String.") which specifies how the cell\'s context should be aligned horizontally within the cells in the row; this is shorthand for using `align` on every cell in the row individually. Possible values are:\n\n`left`\n\nAlign the content of each cell at its left edge.\n\n`center`\n\nCenter the contents of each cell between their left and right edges.\n\n`right`\n\nAlign the content of each cell at its right edge.\n\n`justify`\n\nWiden whitespaces within the text of each cell so that the text fills the full width of each cell (full justification).\n\n`char`\n\nAlign each cell in the row on a specific character (such that each row in the column that is configured this way will horizontally align its cells on that character). This uses the [`char`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/tr#attr-char) and [`charoff`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/tr#attr-charoff) to establish the alignment character (typically "." or "," when aligning numerical data) and the number of characters that should follow the alignment character. This alignment type was never widely supported.\n\nIf no value is expressly set for `align`, the parent node\'s value is inherited.\n\nInstead of using the obsolete `align` attribute, you should instead use the CSS [`text-align`](https://developer.mozilla.org/en-US/docs/Web/CSS/text-align "The text-align CSS property sets the horizontal alignment of an inline or table-cell box. This means it works like vertical-align but in the horizontal direction.") property to establish `left`, `center`, `right`, or `justify` alignment for the row\'s cells. To apply character-based alignment, set the CSS [`text-align`](https://developer.mozilla.org/en-US/docs/Web/CSS/text-align "The text-align CSS property sets the horizontal alignment of an inline or table-cell box. This means it works like vertical-align but in the horizontal direction.") property to the alignment character (such as `"."` or `","`).',
						},
					],
					references: [
						{
							name: "MDN Reference",
							url: "https://developer.mozilla.org/docs/Web/HTML/Element/tr",
						},
					],
				},
				{
					name: "td",
					description: {
						kind: "markdown",
						value: "The td element represents a data cell in a table.",
					},
					attributes: [
						{ name: "colspan" },
						{ name: "rowspan" },
						{ name: "headers" },
						{
							name: "abbr",
							description: `This attribute contains a short abbreviated description of the cell's content. Some user-agents, such as speech readers, may present this description before the content itself.

**Note:** Do not use this attribute as it is obsolete in the latest standard. Alternatively, you can put the abbreviated description inside the cell and place the long content in the **title** attribute.`,
						},
						{
							name: "align",
							description:
								'This enumerated attribute specifies how the cell content\'s horizontal alignment will be handled. Possible values are:\n\n*   `left`: The content is aligned to the left of the cell.\n*   `center`: The content is centered in the cell.\n*   `right`: The content is aligned to the right of the cell.\n*   `justify` (with text only): The content is stretched out inside the cell so that it covers its entire width.\n*   `char` (with text only): The content is aligned to a character inside the `<th>` element with minimal offset. This character is defined by the [`char`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/td#attr-char) and [`charoff`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/td#attr-charoff) attributes Unimplemented (see [bug 2212](https://bugzilla.mozilla.org/show_bug.cgi?id=2212 "character alignment not implemented (align=char, charoff=, text-align:<string>)")).\n\nThe default value when this attribute is not specified is `left`.\n\n**Note:** Do not use this attribute as it is obsolete in the latest standard.\n\n*   To achieve the same effect as the `left`, `center`, `right` or `justify` values, apply the CSS [`text-align`](https://developer.mozilla.org/en-US/docs/Web/CSS/text-align "The text-align CSS property sets the horizontal alignment of an inline or table-cell box. This means it works like vertical-align but in the horizontal direction.") property to the element.\n*   To achieve the same effect as the `char` value, give the [`text-align`](https://developer.mozilla.org/en-US/docs/Web/CSS/text-align "The text-align CSS property sets the horizontal alignment of an inline or table-cell box. This means it works like vertical-align but in the horizontal direction.") property the same value you would use for the [`char`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/td#attr-char). Unimplemented in CSS3.',
						},
						{
							name: "axis",
							description:
								"This attribute contains a list of space-separated strings. Each string is the `id` of a group of cells that this header applies to.\n\n**Note:** Do not use this attribute as it is obsolete in the latest standard.",
						},
						{
							name: "bgcolor",
							description: `This attribute defines the background color of each cell in a column. It consists of a 6-digit hexadecimal code as defined in [sRGB](https://www.w3.org/Graphics/Color/sRGB) and is prefixed by '#'. This attribute may be used with one of sixteen predefined color strings:

 

\`black\` = "#000000"

 

\`green\` = "#008000"

 

\`silver\` = "#C0C0C0"

 

\`lime\` = "#00FF00"

 

\`gray\` = "#808080"

 

\`olive\` = "#808000"

 

\`white\` = "#FFFFFF"

 

\`yellow\` = "#FFFF00"

 

\`maroon\` = "#800000"

 

\`navy\` = "#000080"

 

\`red\` = "#FF0000"

 

\`blue\` = "#0000FF"

 

\`purple\` = "#800080"

 

\`teal\` = "#008080"

 

\`fuchsia\` = "#FF00FF"

 

\`aqua\` = "#00FFFF"

**Note:** Do not use this attribute, as it is non-standard and only implemented in some versions of Microsoft Internet Explorer: The [\`<td>\`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/td "The HTML <td> element defines a cell of a table that contains data. It participates in the table model.") element should be styled using [CSS](https://developer.mozilla.org/en-US/docs/CSS). To create a similar effect use the [\`background-color\`](https://developer.mozilla.org/en-US/docs/Web/CSS/background-color "The background-color CSS property sets the background color of an element.") property in [CSS](https://developer.mozilla.org/en-US/docs/CSS) instead.`,
						},
					],
					references: [
						{
							name: "MDN Reference",
							url: "https://developer.mozilla.org/docs/Web/HTML/Element/td",
						},
					],
				},
				{
					name: "th",
					description: {
						kind: "markdown",
						value: "The th element represents a header cell in a table.",
					},
					attributes: [
						{ name: "colspan" },
						{ name: "rowspan" },
						{ name: "headers" },
						{ name: "scope", valueSet: "s" },
						{ name: "sorted" },
						{
							name: "abbr",
							description: {
								kind: "markdown",
								value: "This attribute contains a short abbreviated description of the cell's content. Some user-agents, such as speech readers, may present this description before the content itself.",
							},
						},
						{
							name: "align",
							description:
								'This enumerated attribute specifies how the cell content\'s horizontal alignment will be handled. Possible values are:\n\n*   `left`: The content is aligned to the left of the cell.\n*   `center`: The content is centered in the cell.\n*   `right`: The content is aligned to the right of the cell.\n*   `justify` (with text only): The content is stretched out inside the cell so that it covers its entire width.\n*   `char` (with text only): The content is aligned to a character inside the `<th>` element with minimal offset. This character is defined by the [`char`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/th#attr-char) and [`charoff`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/th#attr-charoff) attributes.\n\nThe default value when this attribute is not specified is `left`.\n\n**Note:** Do not use this attribute as it is obsolete in the latest standard.\n\n*   To achieve the same effect as the `left`, `center`, `right` or `justify` values, apply the CSS [`text-align`](https://developer.mozilla.org/en-US/docs/Web/CSS/text-align "The text-align CSS property sets the horizontal alignment of an inline or table-cell box. This means it works like vertical-align but in the horizontal direction.") property to the element.\n*   To achieve the same effect as the `char` value, give the [`text-align`](https://developer.mozilla.org/en-US/docs/Web/CSS/text-align "The text-align CSS property sets the horizontal alignment of an inline or table-cell box. This means it works like vertical-align but in the horizontal direction.") property the same value you would use for the [`char`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/th#attr-char). Unimplemented in CSS3.',
						},
						{
							name: "axis",
							description:
								"This attribute contains a list of space-separated strings. Each string is the `id` of a group of cells that this header applies to.\n\n**Note:** Do not use this attribute as it is obsolete in the latest standard: use the [`scope`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/th#attr-scope) attribute instead.",
						},
						{
							name: "bgcolor",
							description: `This attribute defines the background color of each cell in a column. It consists of a 6-digit hexadecimal code as defined in [sRGB](https://www.w3.org/Graphics/Color/sRGB) and is prefixed by '#'. This attribute may be used with one of sixteen predefined color strings:

 

\`black\` = "#000000"

 

\`green\` = "#008000"

 

\`silver\` = "#C0C0C0"

 

\`lime\` = "#00FF00"

 

\`gray\` = "#808080"

 

\`olive\` = "#808000"

 

\`white\` = "#FFFFFF"

 

\`yellow\` = "#FFFF00"

 

\`maroon\` = "#800000"

 

\`navy\` = "#000080"

 

\`red\` = "#FF0000"

 

\`blue\` = "#0000FF"

 

\`purple\` = "#800080"

 

\`teal\` = "#008080"

 

\`fuchsia\` = "#FF00FF"

 

\`aqua\` = "#00FFFF"

**Note:** Do not use this attribute, as it is non-standard and only implemented in some versions of Microsoft Internet Explorer: The [\`<th>\`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/th "The HTML <th> element defines a cell as header of a group of table cells. The exact nature of this group is defined by the scope and headers attributes.") element should be styled using [CSS](https://developer.mozilla.org/en-US/docs/Web/CSS). To create a similar effect use the [\`background-color\`](https://developer.mozilla.org/en-US/docs/Web/CSS/background-color "The background-color CSS property sets the background color of an element.") property in [CSS](https://developer.mozilla.org/en-US/docs/Web/CSS) instead.`,
						},
					],
					references: [
						{
							name: "MDN Reference",
							url: "https://developer.mozilla.org/docs/Web/HTML/Element/th",
						},
					],
				},
				{
					name: "form",
					description: {
						kind: "markdown",
						value: "The form element represents a collection of form-associated elements, some of which can represent editable values that can be submitted to a server for processing.",
					},
					attributes: [
						{
							name: "accept-charset",
							description: {
								kind: "markdown",
								value: 'A space- or comma-delimited list of character encodings that the server accepts. The browser uses them in the order in which they are listed. The default value, the reserved string `"UNKNOWN"`, indicates the same encoding as that of the document containing the form element.  \nIn previous versions of HTML, the different character encodings could be delimited by spaces or commas. In HTML5, only spaces are allowed as delimiters.',
							},
						},
						{
							name: "action",
							description: {
								kind: "markdown",
								value: 'The URI of a program that processes the form information. This value can be overridden by a [`formaction`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/button#attr-formaction) attribute on a [`<button>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/button "The HTML <button> element represents a clickable button, which can be used in forms or anywhere in a document that needs simple, standard button functionality.") or [`<input>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input "The HTML <input> element is used to create interactive controls for web-based forms in order to accept data from the user; a wide variety of types of input data and control widgets are available, depending on the device and user agent.") element.',
							},
						},
						{
							name: "autocomplete",
							valueSet: "o",
							description: {
								kind: "markdown",
								value: "Indicates whether input elements can by default have their values automatically completed by the browser. This setting can be overridden by an `autocomplete` attribute on an element belonging to the form. Possible values are:\n\n*   `off`: The user must explicitly enter a value into each field for every use, or the document provides its own auto-completion method; the browser does not automatically complete entries.\n*   `on`: The browser can automatically complete values based on values that the user has previously entered in the form.\n\nFor most modern browsers (including Firefox 38+, Google Chrome 34+, IE 11+) setting the autocomplete attribute will not prevent a browser's password manager from asking the user if they want to store login fields (username and password), if the user permits the storage the browser will autofill the login the next time the user visits the page. See [The autocomplete attribute and login fields](https://developer.mozilla.org/en-US/docs/Web/Security/Securing_your_site/Turning_off_form_autocompletion#The_autocomplete_attribute_and_login_fields).\n**Note:** If you set `autocomplete` to `off` in a form because the document provides its own auto-completion, then you should also set `autocomplete` to `off` for each of the form's `input` elements that the document can auto-complete. For details, see the note regarding Google Chrome in the [Browser Compatibility chart](#compatChart).",
							},
						},
						{
							name: "enctype",
							valueSet: "et",
							description: {
								kind: "markdown",
								value: 'When the value of the `method` attribute is `post`, enctype is the [MIME type](https://en.wikipedia.org/wiki/Mime_type) of content that is used to submit the form to the server. Possible values are:\n\n*   `application/x-www-form-urlencoded`: The default value if the attribute is not specified.\n*   `multipart/form-data`: The value used for an [`<input>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input "The HTML <input> element is used to create interactive controls for web-based forms in order to accept data from the user; a wide variety of types of input data and control widgets are available, depending on the device and user agent.") element with the `type` attribute set to "file".\n*   `text/plain`: (HTML5)\n\nThis value can be overridden by a [`formenctype`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/button#attr-formenctype) attribute on a [`<button>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/button "The HTML <button> element represents a clickable button, which can be used in forms or anywhere in a document that needs simple, standard button functionality.") or [`<input>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input "The HTML <input> element is used to create interactive controls for web-based forms in order to accept data from the user; a wide variety of types of input data and control widgets are available, depending on the device and user agent.") element.',
							},
						},
						{
							name: "method",
							valueSet: "m",
							description: {
								kind: "markdown",
								value: 'The [HTTP](https://developer.mozilla.org/en-US/docs/Web/HTTP) method that the browser uses to submit the form. Possible values are:\n\n*   `post`: Corresponds to the HTTP [POST method](https://www.w3.org/Protocols/rfc2616/rfc2616-sec9.html#sec9.5) ; form data are included in the body of the form and sent to the server.\n*   `get`: Corresponds to the HTTP [GET method](https://www.w3.org/Protocols/rfc2616/rfc2616-sec9.html#sec9.3); form data are appended to the `action` attribute URI with a \'?\' as separator, and the resulting URI is sent to the server. Use this method when the form has no side-effects and contains only ASCII characters.\n*   `dialog`: Use when the form is inside a [`<dialog>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/dialog "The HTML <dialog> element represents a dialog box or other interactive component, such as an inspector or window.") element to close the dialog when submitted.\n\nThis value can be overridden by a [`formmethod`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/button#attr-formmethod) attribute on a [`<button>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/button "The HTML <button> element represents a clickable button, which can be used in forms or anywhere in a document that needs simple, standard button functionality.") or [`<input>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input "The HTML <input> element is used to create interactive controls for web-based forms in order to accept data from the user; a wide variety of types of input data and control widgets are available, depending on the device and user agent.") element.',
							},
						},
						{
							name: "name",
							description: {
								kind: "markdown",
								value: "The name of the form. In HTML 4, its use is deprecated (`id` should be used instead). It must be unique among the forms in a document and not just an empty string in HTML 5.",
							},
						},
						{
							name: "novalidate",
							valueSet: "v",
							description: {
								kind: "markdown",
								value: 'This Boolean attribute indicates that the form is not to be validated when submitted. If this attribute is not specified (and therefore the form is validated), this default setting can be overridden by a [`formnovalidate`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/button#attr-formnovalidate) attribute on a [`<button>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/button "The HTML <button> element represents a clickable button, which can be used in forms or anywhere in a document that needs simple, standard button functionality.") or [`<input>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input "The HTML <input> element is used to create interactive controls for web-based forms in order to accept data from the user; a wide variety of types of input data and control widgets are available, depending on the device and user agent.") element belonging to the form.',
							},
						},
						{
							name: "target",
							valueSet: "target",
							description: {
								kind: "markdown",
								value: 'A name or keyword indicating where to display the response that is received after submitting the form. In HTML 4, this is the name/keyword for a frame. In HTML5, it is a name/keyword for a _browsing context_ (for example, tab, window, or inline frame). The following keywords have special meanings:\n\n*   `_self`: Load the response into the same HTML 4 frame (or HTML5 browsing context) as the current one. This value is the default if the attribute is not specified.\n*   `_blank`: Load the response into a new unnamed HTML 4 window or HTML5 browsing context.\n*   `_parent`: Load the response into the HTML 4 frameset parent of the current frame, or HTML5 parent browsing context of the current one. If there is no parent, this option behaves the same way as `_self`.\n*   `_top`: HTML 4: Load the response into the full original window, and cancel all other frames. HTML5: Load the response into the top-level browsing context (i.e., the browsing context that is an ancestor of the current one, and has no parent). If there is no parent, this option behaves the same way as `_self`.\n*   _iframename_: The response is displayed in a named [`<iframe>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/iframe "The HTML Inline Frame element (<iframe>) represents a nested browsing context, embedding another HTML page into the current one.").\n\nHTML5: This value can be overridden by a [`formtarget`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/button#attr-formtarget) attribute on a [`<button>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/button "The HTML <button> element represents a clickable button, which can be used in forms or anywhere in a document that needs simple, standard button functionality.") or [`<input>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input "The HTML <input> element is used to create interactive controls for web-based forms in order to accept data from the user; a wide variety of types of input data and control widgets are available, depending on the device and user agent.") element.',
							},
						},
						{
							name: "accept",
							description:
								'A comma-separated list of content types that the server accepts.\n\n**Usage note:** This attribute has been removed in HTML5 and should no longer be used. Instead, use the [`accept`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#attr-accept) attribute of the specific [`<input>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input "The HTML <input> element is used to create interactive controls for web-based forms in order to accept data from the user; a wide variety of types of input data and control widgets are available, depending on the device and user agent.") element.',
						},
						{
							name: "autocapitalize",
							description:
								"This is a nonstandard attribute used by iOS Safari Mobile which controls whether and how the text value for textual form control descendants should be automatically capitalized as it is entered/edited by the user. If the `autocapitalize` attribute is specified on an individual form control descendant, it trumps the form-wide `autocapitalize` setting. The non-deprecated values are available in iOS 5 and later. The default value is `sentences`. Possible values are:\n\n*   `none`: Completely disables automatic capitalization\n*   `sentences`: Automatically capitalize the first letter of sentences.\n*   `words`: Automatically capitalize the first letter of words.\n*   `characters`: Automatically capitalize all characters.\n*   `on`: Deprecated since iOS 5.\n*   `off`: Deprecated since iOS 5.",
						},
					],
					references: [
						{
							name: "MDN Reference",
							url: "https://developer.mozilla.org/docs/Web/HTML/Element/form",
						},
					],
				},
				{
					name: "label",
					description: {
						kind: "markdown",
						value: "The label element represents a caption in a user interface. The caption can be associated with a specific form control, known as the label element's labeled control, either using the for attribute, or by putting the form control inside the label element itself.",
					},
					attributes: [
						{
							name: "form",
							description: {
								kind: "markdown",
								value: 'The [`<form>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/form "The HTML <form> element represents a document section that contains interactive controls for submitting information to a web server.") element with which the label is associated (its _form owner_). If specified, the value of the attribute is the `id` of a [`<form>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/form "The HTML <form> element represents a document section that contains interactive controls for submitting information to a web server.") element in the same document. This lets you place label elements anywhere within a document, not just as descendants of their form elements.',
							},
						},
						{
							name: "for",
							description: {
								kind: "markdown",
								value: "The [`id`](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes#attr-id) of a [labelable](https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/Content_categories#Form_labelable) form-related element in the same document as the `<label>` element. The first element in the document with an `id` matching the value of the `for` attribute is the _labeled control_ for this label element, if it is a labelable element. If it is not labelable then the `for` attribute has no effect. If there are other elements which also match the `id` value, later in the document, they are not considered.\n\n**Note**: A `<label>` element can have both a `for` attribute and a contained control element, as long as the `for` attribute points to the contained control element.",
							},
						},
					],
					references: [
						{
							name: "MDN Reference",
							url: "https://developer.mozilla.org/docs/Web/HTML/Element/label",
						},
					],
				},
				{
					name: "input",
					description: {
						kind: "markdown",
						value: "The input element represents a typed data field, usually with a form control to allow the user to edit the data.",
					},
					void: !0,
					attributes: [
						{ name: "accept" },
						{ name: "alt" },
						{ name: "autocomplete", valueSet: "inputautocomplete" },
						{ name: "autofocus", valueSet: "v" },
						{ name: "checked", valueSet: "v" },
						{ name: "dirname" },
						{ name: "disabled", valueSet: "v" },
						{ name: "form" },
						{ name: "formaction" },
						{ name: "formenctype", valueSet: "et" },
						{ name: "formmethod", valueSet: "fm" },
						{ name: "formnovalidate", valueSet: "v" },
						{ name: "formtarget" },
						{ name: "height" },
						{ name: "inputmode", valueSet: "im" },
						{ name: "list" },
						{ name: "max" },
						{ name: "maxlength" },
						{ name: "min" },
						{ name: "minlength" },
						{ name: "multiple", valueSet: "v" },
						{ name: "name" },
						{ name: "pattern" },
						{ name: "placeholder" },
						{ name: "readonly", valueSet: "v" },
						{ name: "required", valueSet: "v" },
						{ name: "size" },
						{ name: "src" },
						{ name: "step" },
						{ name: "type", valueSet: "t" },
						{ name: "value" },
						{ name: "width" },
					],
					references: [
						{
							name: "MDN Reference",
							url: "https://developer.mozilla.org/docs/Web/HTML/Element/input",
						},
					],
				},
				{
					name: "button",
					description: {
						kind: "markdown",
						value: "The button element represents a button labeled by its contents.",
					},
					attributes: [
						{
							name: "autofocus",
							valueSet: "v",
							description: {
								kind: "markdown",
								value: "This Boolean attribute lets you specify that the button should have input focus when the page loads, unless the user overrides it, for example by typing in a different control. Only one form-associated element in a document can have this attribute specified.",
							},
						},
						{
							name: "disabled",
							valueSet: "v",
							description: {
								kind: "markdown",
								value: 'This Boolean attribute indicates that the user cannot interact with the button. If this attribute is not specified, the button inherits its setting from the containing element, for example [`<fieldset>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/fieldset "The HTML <fieldset> element is used to group several controls as well as labels (<label>) within a web form."); if there is no containing element with the **disabled** attribute set, then the button is enabled.\n\nFirefox will, unlike other browsers, by default, [persist the dynamic disabled state](https://stackoverflow.com/questions/5985839/bug-with-firefox-disabled-attribute-of-input-not-resetting-when-refreshing) of a [`<button>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/button "The HTML <button> element represents a clickable button, which can be used in forms or anywhere in a document that needs simple, standard button functionality.") across page loads. Use the [`autocomplete`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/button#attr-autocomplete) attribute to control this feature.',
							},
						},
						{
							name: "form",
							description: {
								kind: "markdown",
								value: 'The form element that the button is associated with (its _form owner_). The value of the attribute must be the **id** attribute of a [`<form>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/form "The HTML <form> element represents a document section that contains interactive controls for submitting information to a web server.") element in the same document. If this attribute is not specified, the `<button>` element will be associated to an ancestor [`<form>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/form "The HTML <form> element represents a document section that contains interactive controls for submitting information to a web server.") element, if one exists. This attribute enables you to associate `<button>` elements to [`<form>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/form "The HTML <form> element represents a document section that contains interactive controls for submitting information to a web server.") elements anywhere within a document, not just as descendants of [`<form>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/form "The HTML <form> element represents a document section that contains interactive controls for submitting information to a web server.") elements.',
							},
						},
						{
							name: "formaction",
							description: {
								kind: "markdown",
								value: "The URI of a program that processes the information submitted by the button. If specified, it overrides the [`action`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/form#attr-action) attribute of the button's form owner.",
							},
						},
						{
							name: "formenctype",
							valueSet: "et",
							description: {
								kind: "markdown",
								value: 'If the button is a submit button, this attribute specifies the type of content that is used to submit the form to the server. Possible values are:\n\n*   `application/x-www-form-urlencoded`: The default value if the attribute is not specified.\n*   `multipart/form-data`: Use this value if you are using an [`<input>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input "The HTML <input> element is used to create interactive controls for web-based forms in order to accept data from the user; a wide variety of types of input data and control widgets are available, depending on the device and user agent.") element with the [`type`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#attr-type) attribute set to `file`.\n*   `text/plain`\n\nIf this attribute is specified, it overrides the [`enctype`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/form#attr-enctype) attribute of the button\'s form owner.',
							},
						},
						{
							name: "formmethod",
							valueSet: "fm",
							description: {
								kind: "markdown",
								value: "If the button is a submit button, this attribute specifies the HTTP method that the browser uses to submit the form. Possible values are:\n\n*   `post`: The data from the form are included in the body of the form and sent to the server.\n*   `get`: The data from the form are appended to the **form** attribute URI, with a '?' as a separator, and the resulting URI is sent to the server. Use this method when the form has no side-effects and contains only ASCII characters.\n\nIf specified, this attribute overrides the [`method`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/form#attr-method) attribute of the button's form owner.",
							},
						},
						{
							name: "formnovalidate",
							valueSet: "v",
							description: {
								kind: "markdown",
								value: "If the button is a submit button, this Boolean attribute specifies that the form is not to be validated when it is submitted. If this attribute is specified, it overrides the [`novalidate`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/form#attr-novalidate) attribute of the button's form owner.",
							},
						},
						{
							name: "formtarget",
							description: {
								kind: "markdown",
								value: "If the button is a submit button, this attribute is a name or keyword indicating where to display the response that is received after submitting the form. This is a name of, or keyword for, a _browsing context_ (for example, tab, window, or inline frame). If this attribute is specified, it overrides the [`target`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/form#attr-target) attribute of the button's form owner. The following keywords have special meanings:\n\n*   `_self`: Load the response into the same browsing context as the current one. This value is the default if the attribute is not specified.\n*   `_blank`: Load the response into a new unnamed browsing context.\n*   `_parent`: Load the response into the parent browsing context of the current one. If there is no parent, this option behaves the same way as `_self`.\n*   `_top`: Load the response into the top-level browsing context (that is, the browsing context that is an ancestor of the current one, and has no parent). If there is no parent, this option behaves the same way as `_self`.",
							},
						},
						{
							name: "name",
							description: {
								kind: "markdown",
								value: "The name of the button, which is submitted with the form data.",
							},
						},
						{
							name: "type",
							valueSet: "bt",
							description: {
								kind: "markdown",
								value: "The type of the button. Possible values are:\n\n*   `submit`: The button submits the form data to the server. This is the default if the attribute is not specified, or if the attribute is dynamically changed to an empty or invalid value.\n*   `reset`: The button resets all the controls to their initial values.\n*   `button`: The button has no default behavior. It can have client-side scripts associated with the element's events, which are triggered when the events occur.",
							},
						},
						{
							name: "value",
							description: {
								kind: "markdown",
								value: "The initial value of the button. It defines the value associated with the button which is submitted with the form data. This value is passed to the server in params when the form is submitted.",
							},
						},
						{
							name: "autocomplete",
							description:
								'The use of this attribute on a [`<button>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/button "The HTML <button> element represents a clickable button, which can be used in forms or anywhere in a document that needs simple, standard button functionality.") is nonstandard and Firefox-specific. By default, unlike other browsers, [Firefox persists the dynamic disabled state](https://stackoverflow.com/questions/5985839/bug-with-firefox-disabled-attribute-of-input-not-resetting-when-refreshing) of a [`<button>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/button "The HTML <button> element represents a clickable button, which can be used in forms or anywhere in a document that needs simple, standard button functionality.") across page loads. Setting the value of this attribute to `off` (i.e. `autocomplete="off"`) disables this feature. See [bug 654072](https://bugzilla.mozilla.org/show_bug.cgi?id=654072 "if disabled state is changed with javascript, the normal state doesn\'t return after refreshing the page").',
						},
					],
					references: [
						{
							name: "MDN Reference",
							url: "https://developer.mozilla.org/docs/Web/HTML/Element/button",
						},
					],
				},
				{
					name: "select",
					description: {
						kind: "markdown",
						value: "The select element represents a control for selecting amongst a set of options.",
					},
					attributes: [
						{
							name: "autocomplete",
							valueSet: "inputautocomplete",
							description: {
								kind: "markdown",
								value: 'A [`DOMString`](https://developer.mozilla.org/en-US/docs/Web/API/DOMString "DOMString is a UTF-16 String. As JavaScript already uses such strings, DOMString is mapped directly to a String.") providing a hint for a [user agent\'s](https://developer.mozilla.org/en-US/docs/Glossary/user_agent "user agent\'s: A user agent is a computer program representing a person, for example, a browser in a Web context.") autocomplete feature. See [The HTML autocomplete attribute](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/autocomplete) for a complete list of values and details on how to use autocomplete.',
							},
						},
						{
							name: "autofocus",
							valueSet: "v",
							description: {
								kind: "markdown",
								value: "This Boolean attribute lets you specify that a form control should have input focus when the page loads. Only one form element in a document can have the `autofocus` attribute.",
							},
						},
						{
							name: "disabled",
							valueSet: "v",
							description: {
								kind: "markdown",
								value: "This Boolean attribute indicates that the user cannot interact with the control. If this attribute is not specified, the control inherits its setting from the containing element, for example `fieldset`; if there is no containing element with the `disabled` attribute set, then the control is enabled.",
							},
						},
						{
							name: "form",
							description: {
								kind: "markdown",
								value: 'This attribute lets you specify the form element to which the select element is associated (that is, its "form owner"). If this attribute is specified, its value must be the same as the `id` of a form element in the same document. This enables you to place select elements anywhere within a document, not just as descendants of their form elements.',
							},
						},
						{
							name: "multiple",
							valueSet: "v",
							description: {
								kind: "markdown",
								value: "This Boolean attribute indicates that multiple options can be selected in the list. If it is not specified, then only one option can be selected at a time. When `multiple` is specified, most browsers will show a scrolling list box instead of a single line dropdown.",
							},
						},
						{
							name: "name",
							description: {
								kind: "markdown",
								value: "This attribute is used to specify the name of the control.",
							},
						},
						{
							name: "required",
							valueSet: "v",
							description: {
								kind: "markdown",
								value: "A Boolean attribute indicating that an option with a non-empty string value must be selected.",
							},
						},
						{
							name: "size",
							description: {
								kind: "markdown",
								value: "If the control is presented as a scrolling list box (e.g. when `multiple` is specified), this attribute represents the number of rows in the list that should be visible at one time. Browsers are not required to present a select element as a scrolled list box. The default value is 0.\n\n**Note:** According to the HTML5 specification, the default value for size should be 1; however, in practice, this has been found to break some web sites, and no other browser currently does that, so Mozilla has opted to continue to return 0 for the time being with Firefox.",
							},
						},
					],
					references: [
						{
							name: "MDN Reference",
							url: "https://developer.mozilla.org/docs/Web/HTML/Element/select",
						},
					],
				},
				{
					name: "datalist",
					description: {
						kind: "markdown",
						value: "The datalist element represents a set of option elements that represent predefined options for other controls. In the rendering, the datalist element represents nothing and it, along with its children, should be hidden.",
					},
					attributes: [],
					references: [
						{
							name: "MDN Reference",
							url: "https://developer.mozilla.org/docs/Web/HTML/Element/datalist",
						},
					],
				},
				{
					name: "optgroup",
					description: {
						kind: "markdown",
						value: "The optgroup element represents a group of option elements with a common label.",
					},
					attributes: [
						{
							name: "disabled",
							valueSet: "v",
							description: {
								kind: "markdown",
								value: "If this Boolean attribute is set, none of the items in this option group is selectable. Often browsers grey out such control and it won't receive any browsing events, like mouse clicks or focus-related ones.",
							},
						},
						{
							name: "label",
							description: {
								kind: "markdown",
								value: "The name of the group of options, which the browser can use when labeling the options in the user interface. This attribute is mandatory if this element is used.",
							},
						},
					],
					references: [
						{
							name: "MDN Reference",
							url: "https://developer.mozilla.org/docs/Web/HTML/Element/optgroup",
						},
					],
				},
				{
					name: "option",
					description: {
						kind: "markdown",
						value: "The option element represents an option in a select element or as part of a list of suggestions in a datalist element.",
					},
					attributes: [
						{
							name: "disabled",
							valueSet: "v",
							description: {
								kind: "markdown",
								value: 'If this Boolean attribute is set, this option is not checkable. Often browsers grey out such control and it won\'t receive any browsing event, like mouse clicks or focus-related ones. If this attribute is not set, the element can still be disabled if one of its ancestors is a disabled [`<optgroup>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/optgroup "The HTML <optgroup> element creates a grouping of options within a <select> element.") element.',
							},
						},
						{
							name: "label",
							description: {
								kind: "markdown",
								value: "This attribute is text for the label indicating the meaning of the option. If the `label` attribute isn't defined, its value is that of the element text content.",
							},
						},
						{
							name: "selected",
							valueSet: "v",
							description: {
								kind: "markdown",
								value: 'If present, this Boolean attribute indicates that the option is initially selected. If the `<option>` element is the descendant of a [`<select>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/select "The HTML <select> element represents a control that provides a menu of options") element whose [`multiple`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/select#attr-multiple) attribute is not set, only one single `<option>` of this [`<select>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/select "The HTML <select> element represents a control that provides a menu of options") element may have the `selected` attribute.',
							},
						},
						{
							name: "value",
							description: {
								kind: "markdown",
								value: "The content of this attribute represents the value to be submitted with the form, should this option be selected. If this attribute is omitted, the value is taken from the text content of the option element.",
							},
						},
					],
					references: [
						{
							name: "MDN Reference",
							url: "https://developer.mozilla.org/docs/Web/HTML/Element/option",
						},
					],
				},
				{
					name: "textarea",
					description: {
						kind: "markdown",
						value: "The textarea element represents a multiline plain text edit control for the element's raw value. The contents of the control represent the control's default value.",
					},
					attributes: [
						{
							name: "autocomplete",
							valueSet: "inputautocomplete",
							description: {
								kind: "markdown",
								value: 'This attribute indicates whether the value of the control can be automatically completed by the browser. Possible values are:\n\n*   `off`: The user must explicitly enter a value into this field for every use, or the document provides its own auto-completion method; the browser does not automatically complete the entry.\n*   `on`: The browser can automatically complete the value based on values that the user has entered during previous uses.\n\nIf the `autocomplete` attribute is not specified on a `<textarea>` element, then the browser uses the `autocomplete` attribute value of the `<textarea>` element\'s form owner. The form owner is either the [`<form>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/form "The HTML <form> element represents a document section that contains interactive controls for submitting information to a web server.") element that this `<textarea>` element is a descendant of or the form element whose `id` is specified by the `form` attribute of the input element. For more information, see the [`autocomplete`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/form#attr-autocomplete) attribute in [`<form>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/form "The HTML <form> element represents a document section that contains interactive controls for submitting information to a web server.").',
							},
						},
						{
							name: "autofocus",
							valueSet: "v",
							description: {
								kind: "markdown",
								value: "This Boolean attribute lets you specify that a form control should have input focus when the page loads. Only one form-associated element in a document can have this attribute specified.",
							},
						},
						{
							name: "cols",
							description: {
								kind: "markdown",
								value: "The visible width of the text control, in average character widths. If it is specified, it must be a positive integer. If it is not specified, the default value is `20`.",
							},
						},
						{ name: "dirname" },
						{
							name: "disabled",
							valueSet: "v",
							description: {
								kind: "markdown",
								value: 'This Boolean attribute indicates that the user cannot interact with the control. If this attribute is not specified, the control inherits its setting from the containing element, for example [`<fieldset>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/fieldset "The HTML <fieldset> element is used to group several controls as well as labels (<label>) within a web form."); if there is no containing element when the `disabled` attribute is set, the control is enabled.',
							},
						},
						{
							name: "form",
							description: {
								kind: "markdown",
								value: 'The form element that the `<textarea>` element is associated with (its "form owner"). The value of the attribute must be the `id` of a form element in the same document. If this attribute is not specified, the `<textarea>` element must be a descendant of a form element. This attribute enables you to place `<textarea>` elements anywhere within a document, not just as descendants of form elements.',
							},
						},
						{ name: "inputmode", valueSet: "im" },
						{
							name: "maxlength",
							description: {
								kind: "markdown",
								value: "The maximum number of characters (unicode code points) that the user can enter. If this value isn't specified, the user can enter an unlimited number of characters.",
							},
						},
						{
							name: "minlength",
							description: {
								kind: "markdown",
								value: "The minimum number of characters (unicode code points) required that the user should enter.",
							},
						},
						{
							name: "name",
							description: {
								kind: "markdown",
								value: "The name of the control.",
							},
						},
						{
							name: "placeholder",
							description: {
								kind: "markdown",
								value: 'A hint to the user of what can be entered in the control. Carriage returns or line-feeds within the placeholder text must be treated as line breaks when rendering the hint.\n\n**Note:** Placeholders should only be used to show an example of the type of data that should be entered into a form; they are _not_ a substitute for a proper [`<label>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/label "The HTML <label> element represents a caption for an item in a user interface.") element tied to the input. See [Labels and placeholders](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#Labels_and_placeholders "The HTML <input> element is used to create interactive controls for web-based forms in order to accept data from the user; a wide variety of types of input data and control widgets are available, depending on the device and user agent.") in [<input>: The Input (Form Input) element](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input "The HTML <input> element is used to create interactive controls for web-based forms in order to accept data from the user; a wide variety of types of input data and control widgets are available, depending on the device and user agent.") for a full explanation.',
							},
						},
						{
							name: "readonly",
							valueSet: "v",
							description: {
								kind: "markdown",
								value: "This Boolean attribute indicates that the user cannot modify the value of the control. Unlike the `disabled` attribute, the `readonly` attribute does not prevent the user from clicking or selecting in the control. The value of a read-only control is still submitted with the form.",
							},
						},
						{
							name: "required",
							valueSet: "v",
							description: {
								kind: "markdown",
								value: "This attribute specifies that the user must fill in a value before submitting a form.",
							},
						},
						{
							name: "rows",
							description: {
								kind: "markdown",
								value: "The number of visible text lines for the control.",
							},
						},
						{
							name: "wrap",
							valueSet: "w",
							description: {
								kind: "markdown",
								value: "Indicates how the control wraps text. Possible values are:\n\n*   `hard`: The browser automatically inserts line breaks (CR+LF) so that each line has no more than the width of the control; the `cols` attribute must also be specified for this to take effect.\n*   `soft`: The browser ensures that all line breaks in the value consist of a CR+LF pair, but does not insert any additional line breaks.\n*   `off` : Like `soft` but changes appearance to `white-space: pre` so line segments exceeding `cols` are not wrapped and the `<textarea>` becomes horizontally scrollable.\n\nIf this attribute is not specified, `soft` is its default value.",
							},
						},
						{
							name: "autocapitalize",
							description:
								"This is a non-standard attribute supported by WebKit on iOS (therefore nearly all browsers running on iOS, including Safari, Firefox, and Chrome), which controls whether and how the text value should be automatically capitalized as it is entered/edited by the user. The non-deprecated values are available in iOS 5 and later. Possible values are:\n\n*   `none`: Completely disables automatic capitalization.\n*   `sentences`: Automatically capitalize the first letter of sentences.\n*   `words`: Automatically capitalize the first letter of words.\n*   `characters`: Automatically capitalize all characters.\n*   `on`: Deprecated since iOS 5.\n*   `off`: Deprecated since iOS 5.",
						},
						{
							name: "spellcheck",
							description:
								"Specifies whether the `<textarea>` is subject to spell checking by the underlying browser/OS. the value can be:\n\n*   `true`: Indicates that the element needs to have its spelling and grammar checked.\n*   `default` : Indicates that the element is to act according to a default behavior, possibly based on the parent element's own `spellcheck` value.\n*   `false` : Indicates that the element should not be spell checked.",
						},
					],
					references: [
						{
							name: "MDN Reference",
							url: "https://developer.mozilla.org/docs/Web/HTML/Element/textarea",
						},
					],
				},
				{
					name: "output",
					description: {
						kind: "markdown",
						value: "The output element represents the result of a calculation performed by the application, or the result of a user action.",
					},
					attributes: [
						{
							name: "for",
							description: {
								kind: "markdown",
								value: "A space-separated list of other elements’ [`id`](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/id)s, indicating that those elements contributed input values to (or otherwise affected) the calculation.",
							},
						},
						{
							name: "form",
							description: {
								kind: "markdown",
								value: 'The [form element](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/form) that this element is associated with (its "form owner"). The value of the attribute must be an `id` of a form element in the same document. If this attribute is not specified, the output element must be a descendant of a form element. This attribute enables you to place output elements anywhere within a document, not just as descendants of their form elements.',
							},
						},
						{
							name: "name",
							description: {
								kind: "markdown",
								value: 'The name of the element, exposed in the [`HTMLFormElement`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLFormElement "The HTMLFormElement interface represents a <form> element in the DOM; it allows access to and in some cases modification of aspects of the form, as well as access to its component elements.") API.',
							},
						},
					],
					references: [
						{
							name: "MDN Reference",
							url: "https://developer.mozilla.org/docs/Web/HTML/Element/output",
						},
					],
				},
				{
					name: "progress",
					description: {
						kind: "markdown",
						value: "The progress element represents the completion progress of a task. The progress is either indeterminate, indicating that progress is being made but that it is not clear how much more work remains to be done before the task is complete (e.g. because the task is waiting for a remote host to respond), or the progress is a number in the range zero to a maximum, giving the fraction of work that has so far been completed.",
					},
					attributes: [
						{
							name: "value",
							description: {
								kind: "markdown",
								value: "This attribute specifies how much of the task that has been completed. It must be a valid floating point number between 0 and `max`, or between 0 and 1 if `max` is omitted. If there is no `value` attribute, the progress bar is indeterminate; this indicates that an activity is ongoing with no indication of how long it is expected to take.",
							},
						},
						{
							name: "max",
							description: {
								kind: "markdown",
								value: "This attribute describes how much work the task indicated by the `progress` element requires. The `max` attribute, if present, must have a value greater than zero and be a valid floating point number. The default value is 1.",
							},
						},
					],
					references: [
						{
							name: "MDN Reference",
							url: "https://developer.mozilla.org/docs/Web/HTML/Element/progress",
						},
					],
				},
				{
					name: "meter",
					description: {
						kind: "markdown",
						value: "The meter element represents a scalar measurement within a known range, or a fractional value; for example disk usage, the relevance of a query result, or the fraction of a voting population to have selected a particular candidate.",
					},
					attributes: [
						{
							name: "value",
							description: {
								kind: "markdown",
								value: "The current numeric value. This must be between the minimum and maximum values (`min` attribute and `max` attribute) if they are specified. If unspecified or malformed, the value is 0. If specified, but not within the range given by the `min` attribute and `max` attribute, the value is equal to the nearest end of the range.\n\n**Usage note:** Unless the `value` attribute is between `0` and `1` (inclusive), the `min` and `max` attributes should define the range so that the `value` attribute's value is within it.",
							},
						},
						{
							name: "min",
							description: {
								kind: "markdown",
								value: "The lower numeric bound of the measured range. This must be less than the maximum value (`max` attribute), if specified. If unspecified, the minimum value is 0.",
							},
						},
						{
							name: "max",
							description: {
								kind: "markdown",
								value: "The upper numeric bound of the measured range. This must be greater than the minimum value (`min` attribute), if specified. If unspecified, the maximum value is 1.",
							},
						},
						{
							name: "low",
							description: {
								kind: "markdown",
								value: "The upper numeric bound of the low end of the measured range. This must be greater than the minimum value (`min` attribute), and it also must be less than the high value and maximum value (`high` attribute and `max` attribute, respectively), if any are specified. If unspecified, or if less than the minimum value, the `low` value is equal to the minimum value.",
							},
						},
						{
							name: "high",
							description: {
								kind: "markdown",
								value: "The lower numeric bound of the high end of the measured range. This must be less than the maximum value (`max` attribute), and it also must be greater than the low value and minimum value (`low` attribute and **min** attribute, respectively), if any are specified. If unspecified, or if greater than the maximum value, the `high` value is equal to the maximum value.",
							},
						},
						{
							name: "optimum",
							description: {
								kind: "markdown",
								value: "This attribute indicates the optimal numeric value. It must be within the range (as defined by the `min` attribute and `max` attribute). When used with the `low` attribute and `high` attribute, it gives an indication where along the range is considered preferable. For example, if it is between the `min` attribute and the `low` attribute, then the lower range is considered preferred.",
							},
						},
						{
							name: "form",
							description:
								"This attribute associates the element with a `form` element that has ownership of the `meter` element. For example, a `meter` might be displaying a range corresponding to an `input` element of `type` _number_. This attribute is only used if the `meter` element is being used as a form-associated element; even then, it may be omitted if the element appears as a descendant of a `form` element.",
						},
					],
					references: [
						{
							name: "MDN Reference",
							url: "https://developer.mozilla.org/docs/Web/HTML/Element/meter",
						},
					],
				},
				{
					name: "fieldset",
					description: {
						kind: "markdown",
						value: "The fieldset element represents a set of form controls optionally grouped under a common name.",
					},
					attributes: [
						{
							name: "disabled",
							valueSet: "v",
							description: {
								kind: "markdown",
								value: "If this Boolean attribute is set, all form controls that are descendants of the `<fieldset>`, are disabled, meaning they are not editable and won't be submitted along with the `<form>`. They won't receive any browsing events, like mouse clicks or focus-related events. By default browsers display such controls grayed out. Note that form elements inside the [`<legend>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/legend \"The HTML <legend> element represents a caption for the content of its parent <fieldset>.\") element won't be disabled.",
							},
						},
						{
							name: "form",
							description: {
								kind: "markdown",
								value: 'This attribute takes the value of the `id` attribute of a [`<form>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/form "The HTML <form> element represents a document section that contains interactive controls for submitting information to a web server.") element you want the `<fieldset>` to be part of, even if it is not inside the form.',
							},
						},
						{
							name: "name",
							description: {
								kind: "markdown",
								value: 'The name associated with the group.\n\n**Note**: The caption for the fieldset is given by the first [`<legend>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/legend "The HTML <legend> element represents a caption for the content of its parent <fieldset>.") element nested inside it.',
							},
						},
					],
					references: [
						{
							name: "MDN Reference",
							url: "https://developer.mozilla.org/docs/Web/HTML/Element/fieldset",
						},
					],
				},
				{
					name: "legend",
					description: {
						kind: "markdown",
						value: "The legend element represents a caption for the rest of the contents of the legend element's parent fieldset element, if any.",
					},
					attributes: [],
					references: [
						{
							name: "MDN Reference",
							url: "https://developer.mozilla.org/docs/Web/HTML/Element/legend",
						},
					],
				},
				{
					name: "details",
					description: {
						kind: "markdown",
						value: "The details element represents a disclosure widget from which the user can obtain additional information or controls.",
					},
					attributes: [
						{
							name: "open",
							valueSet: "v",
							description: {
								kind: "markdown",
								value: "This Boolean attribute indicates whether or not the details — that is, the contents of the `<details>` element — are currently visible. The default, `false`, means the details are not visible.",
							},
						},
					],
					references: [
						{
							name: "MDN Reference",
							url: "https://developer.mozilla.org/docs/Web/HTML/Element/details",
						},
					],
				},
				{
					name: "summary",
					description: {
						kind: "markdown",
						value: "The summary element represents a summary, caption, or legend for the rest of the contents of the summary element's parent details element, if any.",
					},
					attributes: [],
					references: [
						{
							name: "MDN Reference",
							url: "https://developer.mozilla.org/docs/Web/HTML/Element/summary",
						},
					],
				},
				{
					name: "dialog",
					description: {
						kind: "markdown",
						value: "The dialog element represents a part of an application that a user interacts with to perform a task, for example a dialog box, inspector, or window.",
					},
					attributes: [
						{
							name: "open",
							description:
								"Indicates that the dialog is active and available for interaction. When the `open` attribute is not set, the dialog shouldn't be shown to the user.",
						},
					],
					references: [
						{
							name: "MDN Reference",
							url: "https://developer.mozilla.org/docs/Web/HTML/Element/dialog",
						},
					],
				},
				{
					name: "script",
					description: {
						kind: "markdown",
						value: "The script element allows authors to include dynamic script and data blocks in their documents. The element does not represent content for the user.",
					},
					attributes: [
						{
							name: "src",
							description: {
								kind: "markdown",
								value: "This attribute specifies the URI of an external script; this can be used as an alternative to embedding a script directly within a document.\n\nIf a `script` element has a `src` attribute specified, it should not have a script embedded inside its tags.",
							},
						},
						{
							name: "type",
							description: {
								kind: "markdown",
								value: 'This attribute indicates the type of script represented. The value of this attribute will be in one of the following categories:\n\n*   **Omitted or a JavaScript MIME type:** For HTML5-compliant browsers this indicates the script is JavaScript. HTML5 specification urges authors to omit the attribute rather than provide a redundant MIME type. In earlier browsers, this identified the scripting language of the embedded or imported (via the `src` attribute) code. JavaScript MIME types are [listed in the specification](https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types#JavaScript_types).\n*   **`module`:** For HTML5-compliant browsers the code is treated as a JavaScript module. The processing of the script contents is not affected by the `charset` and `defer` attributes. For information on using `module`, see [ES6 in Depth: Modules](https://hacks.mozilla.org/2015/08/es6-in-depth-modules/). Code may behave differently when the `module` keyword is used.\n*   **Any other value:** The embedded content is treated as a data block which won\'t be processed by the browser. Developers must use a valid MIME type that is not a JavaScript MIME type to denote data blocks. The `src` attribute will be ignored.\n\n**Note:** in Firefox you could specify the version of JavaScript contained in a `<script>` element by including a non-standard `version` parameter inside the `type` attribute — for example `type="text/javascript;version=1.8"`. This has been removed in Firefox 59 (see [bug 1428745](https://bugzilla.mozilla.org/show_bug.cgi?id=1428745 "FIXED: Remove support for version parameter from script loader")).',
							},
						},
						{ name: "charset" },
						{
							name: "async",
							valueSet: "v",
							description: {
								kind: "markdown",
								value: `This is a Boolean attribute indicating that the browser should, if possible, load the script asynchronously.

This attribute must not be used if the \`src\` attribute is absent (i.e. for inline scripts). If it is included in this case it will have no effect.

Browsers usually assume the worst case scenario and load scripts synchronously, (i.e. \`async="false"\`) during HTML parsing.

Dynamically inserted scripts (using [\`document.createElement()\`](https://developer.mozilla.org/en-US/docs/Web/API/Document/createElement "In an HTML document, the document.createElement() method creates the HTML element specified by tagName, or an HTMLUnknownElement if tagName isn't recognized.")) load asynchronously by default, so to turn on synchronous loading (i.e. scripts load in the order they were inserted) set \`async="false"\`.

See [Browser compatibility](#Browser_compatibility) for notes on browser support. See also [Async scripts for asm.js](https://developer.mozilla.org/en-US/docs/Games/Techniques/Async_scripts).`,
							},
						},
						{
							name: "defer",
							valueSet: "v",
							description: {
								kind: "markdown",
								value: 'This Boolean attribute is set to indicate to a browser that the script is meant to be executed after the document has been parsed, but before firing [`DOMContentLoaded`](https://developer.mozilla.org/en-US/docs/Web/Events/DOMContentLoaded "/en-US/docs/Web/Events/DOMContentLoaded").\n\nScripts with the `defer` attribute will prevent the `DOMContentLoaded` event from firing until the script has loaded and finished evaluating.\n\nThis attribute must not be used if the `src` attribute is absent (i.e. for inline scripts), in this case it would have no effect.\n\nTo achieve a similar effect for dynamically inserted scripts use `async="false"` instead. Scripts with the `defer` attribute will execute in the order in which they appear in the document.',
							},
						},
						{
							name: "crossorigin",
							valueSet: "xo",
							description: {
								kind: "markdown",
								value: 'Normal `script` elements pass minimal information to the [`window.onerror`](https://developer.mozilla.org/en-US/docs/Web/API/GlobalEventHandlers/onerror "The onerror property of the GlobalEventHandlers mixin is an EventHandler that processes error events.") for scripts which do not pass the standard [CORS](https://developer.mozilla.org/en-US/docs/Glossary/CORS "CORS: CORS (Cross-Origin Resource Sharing) is a system, consisting of transmitting HTTP headers, that determines whether browsers block frontend JavaScript code from accessing responses for cross-origin requests.") checks. To allow error logging for sites which use a separate domain for static media, use this attribute. See [CORS settings attributes](https://developer.mozilla.org/en-US/docs/Web/HTML/CORS_settings_attributes) for a more descriptive explanation of its valid arguments.',
							},
						},
						{
							name: "nonce",
							description: {
								kind: "markdown",
								value: "A cryptographic nonce (number used once) to list the allowed inline scripts in a [script-src Content-Security-Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/script-src). The server must generate a unique nonce value each time it transmits a policy. It is critical to provide a nonce that cannot be guessed as bypassing a resource's policy is otherwise trivial.",
							},
						},
						{
							name: "integrity",
							description:
								"This attribute contains inline metadata that a user agent can use to verify that a fetched resource has been delivered free of unexpected manipulation. See [Subresource Integrity](https://developer.mozilla.org/en-US/docs/Web/Security/Subresource_Integrity).",
						},
						{
							name: "nomodule",
							description:
								"This Boolean attribute is set to indicate that the script should not be executed in browsers that support [ES2015 modules](https://hacks.mozilla.org/2015/08/es6-in-depth-modules/) — in effect, this can be used to serve fallback scripts to older browsers that do not support modular JavaScript code.",
						},
						{
							name: "referrerpolicy",
							description:
								'Indicates which [referrer](https://developer.mozilla.org/en-US/docs/Web/API/Document/referrer) to send when fetching the script, or resources fetched by the script:\n\n*   `no-referrer`: The [`Referer`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Referer "The Referer request header contains the address of the previous web page from which a link to the currently requested page was followed. The Referer header allows servers to identify where people are visiting them from and may use that data for analytics, logging, or optimized caching, for example.") header will not be sent.\n*   `no-referrer-when-downgrade` (default): The [`Referer`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Referer "The Referer request header contains the address of the previous web page from which a link to the currently requested page was followed. The Referer header allows servers to identify where people are visiting them from and may use that data for analytics, logging, or optimized caching, for example.") header will not be sent to [origin](https://developer.mozilla.org/en-US/docs/Glossary/origin "origin: Web content\'s origin is defined by the scheme (protocol), host (domain), and port of the URL used to access it. Two objects have the same origin only when the scheme, host, and port all match.")s without [TLS](https://developer.mozilla.org/en-US/docs/Glossary/TLS "TLS: Transport Layer Security (TLS), previously known as Secure Sockets Layer (SSL), is a protocol used by applications to communicate securely across a network, preventing tampering with and eavesdropping on email, web browsing, messaging, and other protocols.") ([HTTPS](https://developer.mozilla.org/en-US/docs/Glossary/HTTPS "HTTPS: HTTPS (HTTP Secure) is an encrypted version of the HTTP protocol. It usually uses SSL or TLS to encrypt all communication between a client and a server. This secure connection allows clients to safely exchange sensitive data with a server, for example for banking activities or online shopping.")).\n*   `origin`: The sent referrer will be limited to the origin of the referring page: its [scheme](https://developer.mozilla.org/en-US/docs/Archive/Mozilla/URIScheme), [host](https://developer.mozilla.org/en-US/docs/Glossary/host "host: A host is a device connected to the Internet (or a local network). Some hosts called servers offer additional services like serving webpages or storing files and emails."), and [port](https://developer.mozilla.org/en-US/docs/Glossary/port "port: For a computer connected to a network with an IP address, a port is a communication endpoint. Ports are designated by numbers, and below 1024 each port is associated by default with a specific protocol.").\n*   `origin-when-cross-origin`: The referrer sent to other origins will be limited to the scheme, the host, and the port. Navigations on the same origin will still include the path.\n*   `same-origin`: A referrer will be sent for [same origin](https://developer.mozilla.org/en-US/docs/Glossary/Same-origin_policy "same origin: The same-origin policy is a critical security mechanism that restricts how a document or script loaded from one origin can interact with a resource from another origin."), but cross-origin requests will contain no referrer information.\n*   `strict-origin`: Only send the origin of the document as the referrer when the protocol security level stays the same (e.g. HTTPS→HTTPS), but don\'t send it to a less secure destination (e.g. HTTPS→HTTP).\n*   `strict-origin-when-cross-origin`: Send a full URL when performing a same-origin request, but only send the origin when the protocol security level stays the same (e.g.HTTPS→HTTPS), and send no header to a less secure destination (e.g. HTTPS→HTTP).\n*   `unsafe-url`: The referrer will include the origin _and_ the path (but not the [fragment](https://developer.mozilla.org/en-US/docs/Web/API/HTMLHyperlinkElementUtils/hash), [password](https://developer.mozilla.org/en-US/docs/Web/API/HTMLHyperlinkElementUtils/password), or [username](https://developer.mozilla.org/en-US/docs/Web/API/HTMLHyperlinkElementUtils/username)). **This value is unsafe**, because it leaks origins and paths from TLS-protected resources to insecure origins.\n\n**Note**: An empty string value (`""`) is both the default value, and a fallback value if `referrerpolicy` is not supported. If `referrerpolicy` is not explicitly specified on the `<script>` element, it will adopt a higher-level referrer policy, i.e. one set on the whole document or domain. If a higher-level policy is not available, the empty string is treated as being equivalent to `no-referrer-when-downgrade`.',
						},
						{
							name: "text",
							description:
								"Like the `textContent` attribute, this attribute sets the text content of the element. Unlike the `textContent` attribute, however, this attribute is evaluated as executable code after the node is inserted into the DOM.",
						},
					],
					references: [
						{
							name: "MDN Reference",
							url: "https://developer.mozilla.org/docs/Web/HTML/Element/script",
						},
					],
				},
				{
					name: "noscript",
					description: {
						kind: "markdown",
						value: "The noscript element represents nothing if scripting is enabled, and represents its children if scripting is disabled. It is used to present different markup to user agents that support scripting and those that don't support scripting, by affecting how the document is parsed.",
					},
					attributes: [],
					references: [
						{
							name: "MDN Reference",
							url: "https://developer.mozilla.org/docs/Web/HTML/Element/noscript",
						},
					],
				},
				{
					name: "template",
					description: {
						kind: "markdown",
						value: "The template element is used to declare fragments of HTML that can be cloned and inserted in the document by script.",
					},
					attributes: [],
					references: [
						{
							name: "MDN Reference",
							url: "https://developer.mozilla.org/docs/Web/HTML/Element/template",
						},
					],
				},
				{
					name: "canvas",
					description: {
						kind: "markdown",
						value: "The canvas element provides scripts with a resolution-dependent bitmap canvas, which can be used for rendering graphs, game graphics, art, or other visual images on the fly.",
					},
					attributes: [
						{
							name: "width",
							description: {
								kind: "markdown",
								value: "The width of the coordinate space in CSS pixels. Defaults to 300.",
							},
						},
						{
							name: "height",
							description: {
								kind: "markdown",
								value: "The height of the coordinate space in CSS pixels. Defaults to 150.",
							},
						},
						{
							name: "moz-opaque",
							description:
								"Lets the canvas know whether or not translucency will be a factor. If the canvas knows there's no translucency, painting performance can be optimized. This is only supported by Mozilla-based browsers; use the standardized [`canvas.getContext('2d', { alpha: false })`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/getContext \"The HTMLCanvasElement.getContext() method returns a drawing context on the canvas, or null if the context identifier is not supported.\") instead.",
						},
					],
					references: [
						{
							name: "MDN Reference",
							url: "https://developer.mozilla.org/docs/Web/HTML/Element/canvas",
						},
					],
				},
				{
					name: "slot",
					description: {
						kind: "markdown",
						value: "The slot element is a placeholder inside a web component that you can fill with your own markup, which lets you create separate DOM trees and present them together.",
					},
					attributes: [
						{
							name: "name",
							description: {
								kind: "markdown",
								value: "The slot's name.\nA **named slot** is a `<slot>` element with a `name` attribute.",
							},
						},
					],
					references: [
						{
							name: "MDN Reference",
							url: "https://developer.mozilla.org/docs/Web/HTML/Element/slot",
						},
					],
				},
				{
					name: "data",
					description: {
						kind: "markdown",
						value: "The data element links a given piece of content with a machine-readable translation.",
					},
					attributes: [
						{
							name: "value",
							description: {
								kind: "markdown",
								value: "This attribute specifies the machine-readable translation of the content of the element.",
							},
						},
					],
					references: [
						{
							name: "MDN Reference",
							url: "https://developer.mozilla.org/docs/Web/HTML/Element/data",
						},
					],
				},
				{
					name: "hgroup",
					description: {
						kind: "markdown",
						value: "The hgroup element represents a heading and related content. It groups a single h1–h6 element with one or more p.",
					},
					attributes: [],
					references: [
						{
							name: "MDN Reference",
							url: "https://developer.mozilla.org/docs/Web/HTML/Element/hgroup",
						},
					],
				},
				{
					name: "menu",
					description: {
						kind: "markdown",
						value: "The menu element represents an unordered list of interactive items.",
					},
					attributes: [],
					references: [
						{
							name: "MDN Reference",
							url: "https://developer.mozilla.org/docs/Web/HTML/Element/menu",
						},
					],
				},
			],
			globalAttributes: [
				{
					name: "accesskey",
					description: {
						kind: "markdown",
						value: "Provides a hint for generating a keyboard shortcut for the current element. This attribute consists of a space-separated list of characters. The browser should use the first one that exists on the computer keyboard layout.",
					},
					references: [
						{
							name: "MDN Reference",
							url: "https://developer.mozilla.org/docs/Web/HTML/Global_attributes/accesskey",
						},
					],
				},
				{
					name: "autocapitalize",
					description: {
						kind: "markdown",
						value: "Controls whether and how text input is automatically capitalized as it is entered/edited by the user. It can have the following values:\n\n*   `off` or `none`, no autocapitalization is applied (all letters default to lowercase)\n*   `on` or `sentences`, the first letter of each sentence defaults to a capital letter; all other letters default to lowercase\n*   `words`, the first letter of each word defaults to a capital letter; all other letters default to lowercase\n*   `characters`, all letters should default to uppercase",
					},
					references: [
						{
							name: "MDN Reference",
							url: "https://developer.mozilla.org/docs/Web/HTML/Global_attributes/autocapitalize",
						},
					],
				},
				{
					name: "class",
					description: {
						kind: "markdown",
						value: 'A space-separated list of the classes of the element. Classes allows CSS and JavaScript to select and access specific elements via the [class selectors](https://developer.mozilla.org/docs/Web/CSS/Class_selectors) or functions like the method [`Document.getElementsByClassName()`](https://developer.mozilla.org/docs/Web/API/Document/getElementsByClassName "returns an array-like object of all child elements which have all of the given class names.").',
					},
					references: [
						{
							name: "MDN Reference",
							url: "https://developer.mozilla.org/docs/Web/HTML/Global_attributes/class",
						},
					],
				},
				{
					name: "contenteditable",
					description: {
						kind: "markdown",
						value: "An enumerated attribute indicating if the element should be editable by the user. If so, the browser modifies its widget to allow editing. The attribute must take one of the following values:\n\n*   `true` or the _empty string_, which indicates that the element must be editable;\n*   `false`, which indicates that the element must not be editable.",
					},
					references: [
						{
							name: "MDN Reference",
							url: "https://developer.mozilla.org/docs/Web/HTML/Global_attributes/contenteditable",
						},
					],
				},
				{
					name: "contextmenu",
					description: {
						kind: "markdown",
						value: 'The `[**id**](#attr-id)` of a [`<menu>`](https://developer.mozilla.org/docs/Web/HTML/Element/menu "The HTML <menu> element represents a group of commands that a user can perform or activate. This includes both list menus, which might appear across the top of a screen, as well as context menus, such as those that might appear underneath a button after it has been clicked.") to use as the contextual menu for this element.',
					},
					references: [
						{
							name: "MDN Reference",
							url: "https://developer.mozilla.org/docs/Web/HTML/Global_attributes/contextmenu",
						},
					],
				},
				{
					name: "dir",
					description: {
						kind: "markdown",
						value: "An enumerated attribute indicating the directionality of the element's text. It can have the following values:\n\n*   `ltr`, which means _left to right_ and is to be used for languages that are written from the left to the right (like English);\n*   `rtl`, which means _right to left_ and is to be used for languages that are written from the right to the left (like Arabic);\n*   `auto`, which lets the user agent decide. It uses a basic algorithm as it parses the characters inside the element until it finds a character with a strong directionality, then it applies that directionality to the whole element.",
					},
					valueSet: "d",
					references: [
						{
							name: "MDN Reference",
							url: "https://developer.mozilla.org/docs/Web/HTML/Global_attributes/dir",
						},
					],
				},
				{
					name: "draggable",
					description: {
						kind: "markdown",
						value: "An enumerated attribute indicating whether the element can be dragged, using the [Drag and Drop API](https://developer.mozilla.org/docs/DragDrop/Drag_and_Drop). It can have the following values:\n\n*   `true`, which indicates that the element may be dragged\n*   `false`, which indicates that the element may not be dragged.",
					},
					valueSet: "b",
					references: [
						{
							name: "MDN Reference",
							url: "https://developer.mozilla.org/docs/Web/HTML/Global_attributes/draggable",
						},
					],
				},
				{
					name: "dropzone",
					description: {
						kind: "markdown",
						value: "An enumerated attribute indicating what types of content can be dropped on an element, using the [Drag and Drop API](https://developer.mozilla.org/docs/DragDrop/Drag_and_Drop). It can have the following values:\n\n*   `copy`, which indicates that dropping will create a copy of the element that was dragged\n*   `move`, which indicates that the element that was dragged will be moved to this new location.\n*   `link`, will create a link to the dragged data.",
					},
				},
				{
					name: "exportparts",
					description: {
						kind: "markdown",
						value: "Used to transitively export shadow parts from a nested shadow tree into a containing light tree.",
					},
					references: [
						{
							name: "MDN Reference",
							url: "https://developer.mozilla.org/docs/Web/HTML/Global_attributes/exportparts",
						},
					],
				},
				{
					name: "hidden",
					description: {
						kind: "markdown",
						value: "A Boolean attribute indicates that the element is not yet, or is no longer, _relevant_. For example, it can be used to hide elements of the page that can't be used until the login process has been completed. The browser won't render such elements. This attribute must not be used to hide content that could legitimately be shown.",
					},
					valueSet: "v",
					references: [
						{
							name: "MDN Reference",
							url: "https://developer.mozilla.org/docs/Web/HTML/Global_attributes/hidden",
						},
					],
				},
				{
					name: "id",
					description: {
						kind: "markdown",
						value: "Defines a unique identifier (ID) which must be unique in the whole document. Its purpose is to identify the element when linking (using a fragment identifier), scripting, or styling (with CSS).",
					},
					references: [
						{
							name: "MDN Reference",
							url: "https://developer.mozilla.org/docs/Web/HTML/Global_attributes/id",
						},
					],
				},
				{
					name: "inputmode",
					description: {
						kind: "markdown",
						value: 'Provides a hint to browsers as to the type of virtual keyboard configuration to use when editing this element or its contents. Used primarily on [`<input>`](https://developer.mozilla.org/docs/Web/HTML/Element/input "The HTML <input> element is used to create interactive controls for web-based forms in order to accept data from the user; a wide variety of types of input data and control widgets are available, depending on the device and user agent.") elements, but is usable on any element while in `[contenteditable](https://developer.mozilla.org/docs/Web/HTML/Global_attributes#attr-contenteditable)` mode.',
					},
					references: [
						{
							name: "MDN Reference",
							url: "https://developer.mozilla.org/docs/Web/HTML/Global_attributes/inputmode",
						},
					],
				},
				{
					name: "is",
					description: {
						kind: "markdown",
						value: "Allows you to specify that a standard HTML element should behave like a registered custom built-in element (see [Using custom elements](https://developer.mozilla.org/docs/Web/Web_Components/Using_custom_elements) for more details).",
					},
					references: [
						{
							name: "MDN Reference",
							url: "https://developer.mozilla.org/docs/Web/HTML/Global_attributes/is",
						},
					],
				},
				{
					name: "itemid",
					description: {
						kind: "markdown",
						value: "The unique, global identifier of an item.",
					},
					references: [
						{
							name: "MDN Reference",
							url: "https://developer.mozilla.org/docs/Web/HTML/Global_attributes/itemid",
						},
					],
				},
				{
					name: "itemprop",
					description: {
						kind: "markdown",
						value: "Used to add properties to an item. Every HTML element may have an `itemprop` attribute specified, where an `itemprop` consists of a name and value pair.",
					},
					references: [
						{
							name: "MDN Reference",
							url: "https://developer.mozilla.org/docs/Web/HTML/Global_attributes/itemprop",
						},
					],
				},
				{
					name: "itemref",
					description: {
						kind: "markdown",
						value: "Properties that are not descendants of an element with the `itemscope` attribute can be associated with the item using an `itemref`. It provides a list of element ids (not `itemid`s) with additional properties elsewhere in the document.",
					},
					references: [
						{
							name: "MDN Reference",
							url: "https://developer.mozilla.org/docs/Web/HTML/Global_attributes/itemref",
						},
					],
				},
				{
					name: "itemscope",
					description: {
						kind: "markdown",
						value: "`itemscope` (usually) works along with `[itemtype](https://developer.mozilla.org/docs/Web/HTML/Global_attributes#attr-itemtype)` to specify that the HTML contained in a block is about a particular item. `itemscope` creates the Item and defines the scope of the `itemtype` associated with it. `itemtype` is a valid URL of a vocabulary (such as [schema.org](https://schema.org/)) that describes the item and its properties context.",
					},
					valueSet: "v",
					references: [
						{
							name: "MDN Reference",
							url: "https://developer.mozilla.org/docs/Web/HTML/Global_attributes/itemscope",
						},
					],
				},
				{
					name: "itemtype",
					description: {
						kind: "markdown",
						value: "Specifies the URL of the vocabulary that will be used to define `itemprop`s (item properties) in the data structure. `[itemscope](https://developer.mozilla.org/docs/Web/HTML/Global_attributes#attr-itemscope)` is used to set the scope of where in the data structure the vocabulary set by `itemtype` will be active.",
					},
					references: [
						{
							name: "MDN Reference",
							url: "https://developer.mozilla.org/docs/Web/HTML/Global_attributes/itemtype",
						},
					],
				},
				{
					name: "lang",
					description: {
						kind: "markdown",
						value: "Helps define the language of an element: the language that non-editable elements are in, or the language that editable elements should be written in by the user. The attribute contains one “language tag” (made of hyphen-separated “language subtags”) in the format defined in [_Tags for Identifying Languages (BCP47)_](https://www.ietf.org/rfc/bcp/bcp47.txt). [**xml:lang**](#attr-xml:lang) has priority over it.",
					},
					references: [
						{
							name: "MDN Reference",
							url: "https://developer.mozilla.org/docs/Web/HTML/Global_attributes/lang",
						},
					],
				},
				{
					name: "part",
					description: {
						kind: "markdown",
						value: 'A space-separated list of the part names of the element. Part names allows CSS to select and style specific elements in a shadow tree via the [`::part`](https://developer.mozilla.org/docs/Web/CSS/::part "The ::part CSS pseudo-element represents any element within a shadow tree that has a matching part attribute.") pseudo-element.',
					},
					references: [
						{
							name: "MDN Reference",
							url: "https://developer.mozilla.org/docs/Web/HTML/Global_attributes/part",
						},
					],
				},
				{ name: "role", valueSet: "roles" },
				{
					name: "slot",
					description: {
						kind: "markdown",
						value: "Assigns a slot in a [shadow DOM](https://developer.mozilla.org/docs/Web/Web_Components/Shadow_DOM) shadow tree to an element: An element with a `slot` attribute is assigned to the slot created by the [`<slot>`](https://developer.mozilla.org/docs/Web/HTML/Element/slot \"The HTML <slot> element—part of the Web Components technology suite—is a placeholder inside a web component that you can fill with your own markup, which lets you create separate DOM trees and present them together.\") element whose `[name](https://developer.mozilla.org/docs/Web/HTML/Element/slot#attr-name)` attribute's value matches that `slot` attribute's value.",
					},
					references: [
						{
							name: "MDN Reference",
							url: "https://developer.mozilla.org/docs/Web/HTML/Global_attributes/slot",
						},
					],
				},
				{
					name: "spellcheck",
					description: {
						kind: "markdown",
						value: "An enumerated attribute defines whether the element may be checked for spelling errors. It may have the following values:\n\n*   `true`, which indicates that the element should be, if possible, checked for spelling errors;\n*   `false`, which indicates that the element should not be checked for spelling errors.",
					},
					valueSet: "b",
					references: [
						{
							name: "MDN Reference",
							url: "https://developer.mozilla.org/docs/Web/HTML/Global_attributes/spellcheck",
						},
					],
				},
				{
					name: "style",
					description: {
						kind: "markdown",
						value: 'Contains [CSS](https://developer.mozilla.org/docs/Web/CSS) styling declarations to be applied to the element. Note that it is recommended for styles to be defined in a separate file or files. This attribute and the [`<style>`](https://developer.mozilla.org/docs/Web/HTML/Element/style "The HTML <style> element contains style information for a document, or part of a document.") element have mainly the purpose of allowing for quick styling, for example for testing purposes.',
					},
					references: [
						{
							name: "MDN Reference",
							url: "https://developer.mozilla.org/docs/Web/HTML/Global_attributes/style",
						},
					],
				},
				{
					name: "tabindex",
					description: {
						kind: "markdown",
						value: `An integer attribute indicating if the element can take input focus (is _focusable_), if it should participate to sequential keyboard navigation, and if so, at what position. It can take several values:

*   a _negative value_ means that the element should be focusable, but should not be reachable via sequential keyboard navigation;
*   \`0\` means that the element should be focusable and reachable via sequential keyboard navigation, but its relative order is defined by the platform convention;
*   a _positive value_ means that the element should be focusable and reachable via sequential keyboard navigation; the order in which the elements are focused is the increasing value of the [**tabindex**](#attr-tabindex). If several elements share the same tabindex, their relative order follows their relative positions in the document.`,
					},
					references: [
						{
							name: "MDN Reference",
							url: "https://developer.mozilla.org/docs/Web/HTML/Global_attributes/tabindex",
						},
					],
				},
				{
					name: "title",
					description: {
						kind: "markdown",
						value: "Contains a text representing advisory information related to the element it belongs to. Such information can typically, but not necessarily, be presented to the user as a tooltip.",
					},
					references: [
						{
							name: "MDN Reference",
							url: "https://developer.mozilla.org/docs/Web/HTML/Global_attributes/title",
						},
					],
				},
				{
					name: "translate",
					description: {
						kind: "markdown",
						value: "An enumerated attribute that is used to specify whether an element's attribute values and the values of its [`Text`](https://developer.mozilla.org/docs/Web/API/Text \"The Text interface represents the textual content of Element or Attr. If an element has no markup within its content, it has a single child implementing Text that contains the element's text. However, if the element contains markup, it is parsed into information items and Text nodes that form its children.\") node children are to be translated when the page is localized, or whether to leave them unchanged. It can have the following values:\n\n*   empty string and `yes`, which indicates that the element will be translated.\n*   `no`, which indicates that the element will not be translated.",
					},
					valueSet: "y",
					references: [
						{
							name: "MDN Reference",
							url: "https://developer.mozilla.org/docs/Web/HTML/Global_attributes/translate",
						},
					],
				},
				{
					name: "onabort",
					description: {
						kind: "markdown",
						value: "The loading of a resource has been aborted.",
					},
				},
				{
					name: "onblur",
					description: {
						kind: "markdown",
						value: "An element has lost focus (does not bubble).",
					},
				},
				{
					name: "oncanplay",
					description: {
						kind: "markdown",
						value: "The user agent can play the media, but estimates that not enough data has been loaded to play the media up to its end without having to stop for further buffering of content.",
					},
				},
				{
					name: "oncanplaythrough",
					description: {
						kind: "markdown",
						value: "The user agent can play the media up to its end without having to stop for further buffering of content.",
					},
				},
				{
					name: "onchange",
					description: {
						kind: "markdown",
						value: "The change event is fired for <input>, <select>, and <textarea> elements when a change to the element's value is committed by the user.",
					},
				},
				{
					name: "onclick",
					description: {
						kind: "markdown",
						value: "A pointing device button has been pressed and released on an element.",
					},
				},
				{
					name: "oncontextmenu",
					description: {
						kind: "markdown",
						value: "The right button of the mouse is clicked (before the context menu is displayed).",
					},
				},
				{
					name: "ondblclick",
					description: {
						kind: "markdown",
						value: "A pointing device button is clicked twice on an element.",
					},
				},
				{
					name: "ondrag",
					description: {
						kind: "markdown",
						value: "An element or text selection is being dragged (every 350ms).",
					},
				},
				{
					name: "ondragend",
					description: {
						kind: "markdown",
						value: "A drag operation is being ended (by releasing a mouse button or hitting the escape key).",
					},
				},
				{
					name: "ondragenter",
					description: {
						kind: "markdown",
						value: "A dragged element or text selection enters a valid drop target.",
					},
				},
				{
					name: "ondragleave",
					description: {
						kind: "markdown",
						value: "A dragged element or text selection leaves a valid drop target.",
					},
				},
				{
					name: "ondragover",
					description: {
						kind: "markdown",
						value: "An element or text selection is being dragged over a valid drop target (every 350ms).",
					},
				},
				{
					name: "ondragstart",
					description: {
						kind: "markdown",
						value: "The user starts dragging an element or text selection.",
					},
				},
				{
					name: "ondrop",
					description: {
						kind: "markdown",
						value: "An element is dropped on a valid drop target.",
					},
				},
				{
					name: "ondurationchange",
					description: {
						kind: "markdown",
						value: "The duration attribute has been updated.",
					},
				},
				{
					name: "onemptied",
					description: {
						kind: "markdown",
						value: "The media has become empty; for example, this event is sent if the media has already been loaded (or partially loaded), and the load() method is called to reload it.",
					},
				},
				{
					name: "onended",
					description: {
						kind: "markdown",
						value: "Playback has stopped because the end of the media was reached.",
					},
				},
				{
					name: "onerror",
					description: {
						kind: "markdown",
						value: "A resource failed to load.",
					},
				},
				{
					name: "onfocus",
					description: {
						kind: "markdown",
						value: "An element has received focus (does not bubble).",
					},
				},
				{ name: "onformchange" },
				{ name: "onforminput" },
				{
					name: "oninput",
					description: {
						kind: "markdown",
						value: "The value of an element changes or the content of an element with the attribute contenteditable is modified.",
					},
				},
				{
					name: "oninvalid",
					description: {
						kind: "markdown",
						value: "A submittable element has been checked and doesn't satisfy its constraints.",
					},
				},
				{
					name: "onkeydown",
					description: {
						kind: "markdown",
						value: "A key is pressed down.",
					},
				},
				{
					name: "onkeypress",
					description: {
						kind: "markdown",
						value: "A key is pressed down and that key normally produces a character value (use input instead).",
					},
				},
				{
					name: "onkeyup",
					description: {
						kind: "markdown",
						value: "A key is released.",
					},
				},
				{
					name: "onload",
					description: {
						kind: "markdown",
						value: "A resource and its dependent resources have finished loading.",
					},
				},
				{
					name: "onloadeddata",
					description: {
						kind: "markdown",
						value: "The first frame of the media has finished loading.",
					},
				},
				{
					name: "onloadedmetadata",
					description: {
						kind: "markdown",
						value: "The metadata has been loaded.",
					},
				},
				{
					name: "onloadstart",
					description: {
						kind: "markdown",
						value: "Progress has begun.",
					},
				},
				{
					name: "onmousedown",
					description: {
						kind: "markdown",
						value: "A pointing device button (usually a mouse) is pressed on an element.",
					},
				},
				{
					name: "onmousemove",
					description: {
						kind: "markdown",
						value: "A pointing device is moved over an element.",
					},
				},
				{
					name: "onmouseout",
					description: {
						kind: "markdown",
						value: "A pointing device is moved off the element that has the listener attached or off one of its children.",
					},
				},
				{
					name: "onmouseover",
					description: {
						kind: "markdown",
						value: "A pointing device is moved onto the element that has the listener attached or onto one of its children.",
					},
				},
				{
					name: "onmouseup",
					description: {
						kind: "markdown",
						value: "A pointing device button is released over an element.",
					},
				},
				{ name: "onmousewheel" },
				{
					name: "onmouseenter",
					description: {
						kind: "markdown",
						value: "A pointing device is moved onto the element that has the listener attached.",
					},
				},
				{
					name: "onmouseleave",
					description: {
						kind: "markdown",
						value: "A pointing device is moved off the element that has the listener attached.",
					},
				},
				{
					name: "onpause",
					description: {
						kind: "markdown",
						value: "Playback has been paused.",
					},
				},
				{
					name: "onplay",
					description: {
						kind: "markdown",
						value: "Playback has begun.",
					},
				},
				{
					name: "onplaying",
					description: {
						kind: "markdown",
						value: "Playback is ready to start after having been paused or delayed due to lack of data.",
					},
				},
				{
					name: "onprogress",
					description: { kind: "markdown", value: "In progress." },
				},
				{
					name: "onratechange",
					description: {
						kind: "markdown",
						value: "The playback rate has changed.",
					},
				},
				{
					name: "onreset",
					description: {
						kind: "markdown",
						value: "A form is reset.",
					},
				},
				{
					name: "onresize",
					description: {
						kind: "markdown",
						value: "The document view has been resized.",
					},
				},
				{
					name: "onreadystatechange",
					description: {
						kind: "markdown",
						value: "The readyState attribute of a document has changed.",
					},
				},
				{
					name: "onscroll",
					description: {
						kind: "markdown",
						value: "The document view or an element has been scrolled.",
					},
				},
				{
					name: "onseeked",
					description: {
						kind: "markdown",
						value: "A seek operation completed.",
					},
				},
				{
					name: "onseeking",
					description: {
						kind: "markdown",
						value: "A seek operation began.",
					},
				},
				{
					name: "onselect",
					description: {
						kind: "markdown",
						value: "Some text is being selected.",
					},
				},
				{
					name: "onshow",
					description: {
						kind: "markdown",
						value: "A contextmenu event was fired on/bubbled to an element that has a contextmenu attribute",
					},
				},
				{
					name: "onstalled",
					description: {
						kind: "markdown",
						value: "The user agent is trying to fetch media data, but data is unexpectedly not forthcoming.",
					},
				},
				{
					name: "onsubmit",
					description: {
						kind: "markdown",
						value: "A form is submitted.",
					},
				},
				{
					name: "onsuspend",
					description: {
						kind: "markdown",
						value: "Media data loading has been suspended.",
					},
				},
				{
					name: "ontimeupdate",
					description: {
						kind: "markdown",
						value: "The time indicated by the currentTime attribute has been updated.",
					},
				},
				{
					name: "onvolumechange",
					description: {
						kind: "markdown",
						value: "The volume has changed.",
					},
				},
				{
					name: "onwaiting",
					description: {
						kind: "markdown",
						value: "Playback has stopped because of a temporary lack of data.",
					},
				},
				{
					name: "onpointercancel",
					description: {
						kind: "markdown",
						value: "The pointer is unlikely to produce any more events.",
					},
				},
				{
					name: "onpointerdown",
					description: {
						kind: "markdown",
						value: "The pointer enters the active buttons state.",
					},
				},
				{
					name: "onpointerenter",
					description: {
						kind: "markdown",
						value: "Pointing device is moved inside the hit-testing boundary.",
					},
				},
				{
					name: "onpointerleave",
					description: {
						kind: "markdown",
						value: "Pointing device is moved out of the hit-testing boundary.",
					},
				},
				{
					name: "onpointerlockchange",
					description: {
						kind: "markdown",
						value: "The pointer was locked or released.",
					},
				},
				{
					name: "onpointerlockerror",
					description: {
						kind: "markdown",
						value: "It was impossible to lock the pointer for technical reasons or because the permission was denied.",
					},
				},
				{
					name: "onpointermove",
					description: {
						kind: "markdown",
						value: "The pointer changed coordinates.",
					},
				},
				{
					name: "onpointerout",
					description: {
						kind: "markdown",
						value: "The pointing device moved out of hit-testing boundary or leaves detectable hover range.",
					},
				},
				{
					name: "onpointerover",
					description: {
						kind: "markdown",
						value: "The pointing device is moved into the hit-testing boundary.",
					},
				},
				{
					name: "onpointerup",
					description: {
						kind: "markdown",
						value: "The pointer leaves the active buttons state.",
					},
				},
				{
					name: "aria-activedescendant",
					references: [
						{
							name: "WAI-ARIA Reference",
							url: "https://www.w3.org/TR/wai-aria-1.1/#aria-activedescendant",
						},
					],
					description: {
						kind: "markdown",
						value: "Identifies the currently active element when DOM focus is on a [`composite`](https://www.w3.org/TR/wai-aria-1.1/#composite) widget, [`textbox`](https://www.w3.org/TR/wai-aria-1.1/#textbox), [`group`](https://www.w3.org/TR/wai-aria-1.1/#group), or [`application`](https://www.w3.org/TR/wai-aria-1.1/#application).",
					},
				},
				{
					name: "aria-atomic",
					valueSet: "b",
					references: [
						{
							name: "WAI-ARIA Reference",
							url: "https://www.w3.org/TR/wai-aria-1.1/#aria-atomic",
						},
					],
					description: {
						kind: "markdown",
						value: "Indicates whether [assistive technologies](https://www.w3.org/TR/wai-aria-1.1/#dfn-assistive-technology) will present all, or only parts of, the changed region based on the change notifications defined by the [`aria-relevant`](https://www.w3.org/TR/wai-aria-1.1/#aria-relevant) attribute.",
					},
				},
				{
					name: "aria-autocomplete",
					valueSet: "autocomplete",
					references: [
						{
							name: "WAI-ARIA Reference",
							url: "https://www.w3.org/TR/wai-aria-1.1/#aria-autocomplete",
						},
					],
					description: {
						kind: "markdown",
						value: "Indicates whether inputting text could trigger display of one or more predictions of the user's intended value for an input and specifies how predictions would be presented if they are made.",
					},
				},
				{
					name: "aria-busy",
					valueSet: "b",
					references: [
						{
							name: "WAI-ARIA Reference",
							url: "https://www.w3.org/TR/wai-aria-1.1/#aria-busy",
						},
					],
					description: {
						kind: "markdown",
						value: "Indicates an element is being modified and that assistive technologies _MAY_ want to wait until the modifications are complete before exposing them to the user.",
					},
				},
				{
					name: "aria-checked",
					valueSet: "tristate",
					references: [
						{
							name: "WAI-ARIA Reference",
							url: "https://www.w3.org/TR/wai-aria-1.1/#aria-checked",
						},
					],
					description: {
						kind: "markdown",
						value: 'Indicates the current "checked" [state](https://www.w3.org/TR/wai-aria-1.1/#dfn-state) of checkboxes, radio buttons, and other [widgets](https://www.w3.org/TR/wai-aria-1.1/#dfn-widget). See related [`aria-pressed`](https://www.w3.org/TR/wai-aria-1.1/#aria-pressed) and [`aria-selected`](https://www.w3.org/TR/wai-aria-1.1/#aria-selected).',
					},
				},
				{
					name: "aria-colcount",
					references: [
						{
							name: "WAI-ARIA Reference",
							url: "https://www.w3.org/TR/wai-aria-1.1/#aria-colcount",
						},
					],
					description: {
						kind: "markdown",
						value: "Defines the total number of columns in a [`table`](https://www.w3.org/TR/wai-aria-1.1/#table), [`grid`](https://www.w3.org/TR/wai-aria-1.1/#grid), or [`treegrid`](https://www.w3.org/TR/wai-aria-1.1/#treegrid). See related [`aria-colindex`](https://www.w3.org/TR/wai-aria-1.1/#aria-colindex).",
					},
				},
				{
					name: "aria-colindex",
					references: [
						{
							name: "WAI-ARIA Reference",
							url: "https://www.w3.org/TR/wai-aria-1.1/#aria-colindex",
						},
					],
					description: {
						kind: "markdown",
						value: "Defines an [element's](https://www.w3.org/TR/wai-aria-1.1/#dfn-element) column index or position with respect to the total number of columns within a [`table`](https://www.w3.org/TR/wai-aria-1.1/#table), [`grid`](https://www.w3.org/TR/wai-aria-1.1/#grid), or [`treegrid`](https://www.w3.org/TR/wai-aria-1.1/#treegrid). See related [`aria-colcount`](https://www.w3.org/TR/wai-aria-1.1/#aria-colcount) and [`aria-colspan`](https://www.w3.org/TR/wai-aria-1.1/#aria-colspan).",
					},
				},
				{
					name: "aria-colspan",
					references: [
						{
							name: "WAI-ARIA Reference",
							url: "https://www.w3.org/TR/wai-aria-1.1/#aria-colspan",
						},
					],
					description: {
						kind: "markdown",
						value: "Defines the number of columns spanned by a cell or gridcell within a [`table`](https://www.w3.org/TR/wai-aria-1.1/#table), [`grid`](https://www.w3.org/TR/wai-aria-1.1/#grid), or [`treegrid`](https://www.w3.org/TR/wai-aria-1.1/#treegrid). See related [`aria-colindex`](https://www.w3.org/TR/wai-aria-1.1/#aria-colindex) and [`aria-rowspan`](https://www.w3.org/TR/wai-aria-1.1/#aria-rowspan).",
					},
				},
				{
					name: "aria-controls",
					references: [
						{
							name: "WAI-ARIA Reference",
							url: "https://www.w3.org/TR/wai-aria-1.1/#aria-controls",
						},
					],
					description: {
						kind: "markdown",
						value: "Identifies the [element](https://www.w3.org/TR/wai-aria-1.1/#dfn-element) (or elements) whose contents or presence are controlled by the current element. See related [`aria-owns`](https://www.w3.org/TR/wai-aria-1.1/#aria-owns).",
					},
				},
				{
					name: "aria-current",
					valueSet: "current",
					references: [
						{
							name: "WAI-ARIA Reference",
							url: "https://www.w3.org/TR/wai-aria-1.1/#aria-current",
						},
					],
					description: {
						kind: "markdown",
						value: "Indicates the [element](https://www.w3.org/TR/wai-aria-1.1/#dfn-element) that represents the current item within a container or set of related elements.",
					},
				},
				{
					name: "aria-describedby",
					references: [
						{
							name: "WAI-ARIA Reference",
							url: "https://www.w3.org/TR/wai-aria-1.1/#aria-describedby",
						},
					],
					description: {
						kind: "markdown",
						value: "Identifies the [element](https://www.w3.org/TR/wai-aria-1.1/#dfn-element) (or elements) that describes the [object](https://www.w3.org/TR/wai-aria-1.1/#dfn-object). See related [`aria-labelledby`](https://www.w3.org/TR/wai-aria-1.1/#aria-labelledby).",
					},
				},
				{
					name: "aria-disabled",
					valueSet: "b",
					references: [
						{
							name: "WAI-ARIA Reference",
							url: "https://www.w3.org/TR/wai-aria-1.1/#aria-disabled",
						},
					],
					description: {
						kind: "markdown",
						value: "Indicates that the [element](https://www.w3.org/TR/wai-aria-1.1/#dfn-element) is [perceivable](https://www.w3.org/TR/wai-aria-1.1/#dfn-perceivable) but disabled, so it is not editable or otherwise [operable](https://www.w3.org/TR/wai-aria-1.1/#dfn-operable). See related [`aria-hidden`](https://www.w3.org/TR/wai-aria-1.1/#aria-hidden) and [`aria-readonly`](https://www.w3.org/TR/wai-aria-1.1/#aria-readonly).",
					},
				},
				{
					name: "aria-dropeffect",
					valueSet: "dropeffect",
					references: [
						{
							name: "WAI-ARIA Reference",
							url: "https://www.w3.org/TR/wai-aria-1.1/#aria-dropeffect",
						},
					],
					description: {
						kind: "markdown",
						value: "\\[Deprecated in ARIA 1.1\\] Indicates what functions can be performed when a dragged object is released on the drop target.",
					},
				},
				{
					name: "aria-errormessage",
					references: [
						{
							name: "WAI-ARIA Reference",
							url: "https://www.w3.org/TR/wai-aria-1.1/#aria-errormessage",
						},
					],
					description: {
						kind: "markdown",
						value: "Identifies the [element](https://www.w3.org/TR/wai-aria-1.1/#dfn-element) that provides an error message for the [object](https://www.w3.org/TR/wai-aria-1.1/#dfn-object). See related [`aria-invalid`](https://www.w3.org/TR/wai-aria-1.1/#aria-invalid) and [`aria-describedby`](https://www.w3.org/TR/wai-aria-1.1/#aria-describedby).",
					},
				},
				{
					name: "aria-expanded",
					valueSet: "u",
					references: [
						{
							name: "WAI-ARIA Reference",
							url: "https://www.w3.org/TR/wai-aria-1.1/#aria-expanded",
						},
					],
					description: {
						kind: "markdown",
						value: "Indicates whether the element, or another grouping element it controls, is currently expanded or collapsed.",
					},
				},
				{
					name: "aria-flowto",
					references: [
						{
							name: "WAI-ARIA Reference",
							url: "https://www.w3.org/TR/wai-aria-1.1/#aria-flowto",
						},
					],
					description: {
						kind: "markdown",
						value: "Identifies the next [element](https://www.w3.org/TR/wai-aria-1.1/#dfn-element) (or elements) in an alternate reading order of content which, at the user's discretion, allows assistive technology to override the general default of reading in document source order.",
					},
				},
				{
					name: "aria-grabbed",
					valueSet: "u",
					references: [
						{
							name: "WAI-ARIA Reference",
							url: "https://www.w3.org/TR/wai-aria-1.1/#aria-grabbed",
						},
					],
					description: {
						kind: "markdown",
						value: `\\[Deprecated in ARIA 1.1\\] Indicates an element's "grabbed" [state](https://www.w3.org/TR/wai-aria-1.1/#dfn-state) in a drag-and-drop operation.`,
					},
				},
				{
					name: "aria-haspopup",
					valueSet: "haspopup",
					references: [
						{
							name: "WAI-ARIA Reference",
							url: "https://www.w3.org/TR/wai-aria-1.1/#aria-haspopup",
						},
					],
					description: {
						kind: "markdown",
						value: "Indicates the availability and type of interactive popup element, such as menu or dialog, that can be triggered by an [element](https://www.w3.org/TR/wai-aria-1.1/#dfn-element).",
					},
				},
				{
					name: "aria-hidden",
					valueSet: "b",
					references: [
						{
							name: "WAI-ARIA Reference",
							url: "https://www.w3.org/TR/wai-aria-1.1/#aria-hidden",
						},
					],
					description: {
						kind: "markdown",
						value: "Indicates whether the [element](https://www.w3.org/TR/wai-aria-1.1/#dfn-element) is exposed to an accessibility API. See related [`aria-disabled`](https://www.w3.org/TR/wai-aria-1.1/#aria-disabled).",
					},
				},
				{
					name: "aria-invalid",
					valueSet: "invalid",
					references: [
						{
							name: "WAI-ARIA Reference",
							url: "https://www.w3.org/TR/wai-aria-1.1/#aria-invalid",
						},
					],
					description: {
						kind: "markdown",
						value: "Indicates the entered value does not conform to the format expected by the application. See related [`aria-errormessage`](https://www.w3.org/TR/wai-aria-1.1/#aria-errormessage).",
					},
				},
				{
					name: "aria-label",
					references: [
						{
							name: "WAI-ARIA Reference",
							url: "https://www.w3.org/TR/wai-aria-1.1/#aria-label",
						},
					],
					description: {
						kind: "markdown",
						value: "Defines a string value that labels the current element. See related [`aria-labelledby`](https://www.w3.org/TR/wai-aria-1.1/#aria-labelledby).",
					},
				},
				{
					name: "aria-labelledby",
					references: [
						{
							name: "WAI-ARIA Reference",
							url: "https://www.w3.org/TR/wai-aria-1.1/#aria-labelledby",
						},
					],
					description: {
						kind: "markdown",
						value: "Identifies the [element](https://www.w3.org/TR/wai-aria-1.1/#dfn-element) (or elements) that labels the current element. See related [`aria-describedby`](https://www.w3.org/TR/wai-aria-1.1/#aria-describedby).",
					},
				},
				{
					name: "aria-level",
					references: [
						{
							name: "WAI-ARIA Reference",
							url: "https://www.w3.org/TR/wai-aria-1.1/#aria-level",
						},
					],
					description: {
						kind: "markdown",
						value: "Defines the hierarchical level of an [element](https://www.w3.org/TR/wai-aria-1.1/#dfn-element) within a structure.",
					},
				},
				{
					name: "aria-live",
					valueSet: "live",
					references: [
						{
							name: "WAI-ARIA Reference",
							url: "https://www.w3.org/TR/wai-aria-1.1/#aria-live",
						},
					],
					description: {
						kind: "markdown",
						value: "Indicates that an [element](https://www.w3.org/TR/wai-aria-1.1/#dfn-element) will be updated, and describes the types of updates the [user agents](https://www.w3.org/TR/wai-aria-1.1/#dfn-user-agent), [assistive technologies](https://www.w3.org/TR/wai-aria-1.1/#dfn-assistive-technology), and user can expect from the [live region](https://www.w3.org/TR/wai-aria-1.1/#dfn-live-region).",
					},
				},
				{
					name: "aria-modal",
					valueSet: "b",
					references: [
						{
							name: "WAI-ARIA Reference",
							url: "https://www.w3.org/TR/wai-aria-1.1/#aria-modal",
						},
					],
					description: {
						kind: "markdown",
						value: "Indicates whether an [element](https://www.w3.org/TR/wai-aria-1.1/#dfn-element) is modal when displayed.",
					},
				},
				{
					name: "aria-multiline",
					valueSet: "b",
					references: [
						{
							name: "WAI-ARIA Reference",
							url: "https://www.w3.org/TR/wai-aria-1.1/#aria-multiline",
						},
					],
					description: {
						kind: "markdown",
						value: "Indicates whether a text box accepts multiple lines of input or only a single line.",
					},
				},
				{
					name: "aria-multiselectable",
					valueSet: "b",
					references: [
						{
							name: "WAI-ARIA Reference",
							url: "https://www.w3.org/TR/wai-aria-1.1/#aria-multiselectable",
						},
					],
					description: {
						kind: "markdown",
						value: "Indicates that the user may select more than one item from the current selectable descendants.",
					},
				},
				{
					name: "aria-orientation",
					valueSet: "orientation",
					references: [
						{
							name: "WAI-ARIA Reference",
							url: "https://www.w3.org/TR/wai-aria-1.1/#aria-orientation",
						},
					],
					description: {
						kind: "markdown",
						value: "Indicates whether the element's orientation is horizontal, vertical, or unknown/ambiguous.",
					},
				},
				{
					name: "aria-owns",
					references: [
						{
							name: "WAI-ARIA Reference",
							url: "https://www.w3.org/TR/wai-aria-1.1/#aria-owns",
						},
					],
					description: {
						kind: "markdown",
						value: "Identifies an [element](https://www.w3.org/TR/wai-aria-1.1/#dfn-element) (or elements) in order to define a visual, functional, or contextual parent/child [relationship](https://www.w3.org/TR/wai-aria-1.1/#dfn-relationship) between DOM elements where the DOM hierarchy cannot be used to represent the relationship. See related [`aria-controls`](https://www.w3.org/TR/wai-aria-1.1/#aria-controls).",
					},
				},
				{
					name: "aria-placeholder",
					references: [
						{
							name: "WAI-ARIA Reference",
							url: "https://www.w3.org/TR/wai-aria-1.1/#aria-placeholder",
						},
					],
					description: {
						kind: "markdown",
						value: "Defines a short hint (a word or short phrase) intended to aid the user with data entry when the control has no value. A hint could be a sample value or a brief description of the expected format.",
					},
				},
				{
					name: "aria-posinset",
					references: [
						{
							name: "WAI-ARIA Reference",
							url: "https://www.w3.org/TR/wai-aria-1.1/#aria-posinset",
						},
					],
					description: {
						kind: "markdown",
						value: "Defines an [element](https://www.w3.org/TR/wai-aria-1.1/#dfn-element)'s number or position in the current set of listitems or treeitems. Not required if all elements in the set are present in the DOM. See related [`aria-setsize`](https://www.w3.org/TR/wai-aria-1.1/#aria-setsize).",
					},
				},
				{
					name: "aria-pressed",
					valueSet: "tristate",
					references: [
						{
							name: "WAI-ARIA Reference",
							url: "https://www.w3.org/TR/wai-aria-1.1/#aria-pressed",
						},
					],
					description: {
						kind: "markdown",
						value: 'Indicates the current "pressed" [state](https://www.w3.org/TR/wai-aria-1.1/#dfn-state) of toggle buttons. See related [`aria-checked`](https://www.w3.org/TR/wai-aria-1.1/#aria-checked) and [`aria-selected`](https://www.w3.org/TR/wai-aria-1.1/#aria-selected).',
					},
				},
				{
					name: "aria-readonly",
					valueSet: "b",
					references: [
						{
							name: "WAI-ARIA Reference",
							url: "https://www.w3.org/TR/wai-aria-1.1/#aria-readonly",
						},
					],
					description: {
						kind: "markdown",
						value: "Indicates that the [element](https://www.w3.org/TR/wai-aria-1.1/#dfn-element) is not editable, but is otherwise [operable](https://www.w3.org/TR/wai-aria-1.1/#dfn-operable). See related [`aria-disabled`](https://www.w3.org/TR/wai-aria-1.1/#aria-disabled).",
					},
				},
				{
					name: "aria-relevant",
					valueSet: "relevant",
					references: [
						{
							name: "WAI-ARIA Reference",
							url: "https://www.w3.org/TR/wai-aria-1.1/#aria-relevant",
						},
					],
					description: {
						kind: "markdown",
						value: "Indicates what notifications the user agent will trigger when the accessibility tree within a live region is modified. See related [`aria-atomic`](https://www.w3.org/TR/wai-aria-1.1/#aria-atomic).",
					},
				},
				{
					name: "aria-required",
					valueSet: "b",
					references: [
						{
							name: "WAI-ARIA Reference",
							url: "https://www.w3.org/TR/wai-aria-1.1/#aria-required",
						},
					],
					description: {
						kind: "markdown",
						value: "Indicates that user input is required on the [element](https://www.w3.org/TR/wai-aria-1.1/#dfn-element) before a form may be submitted.",
					},
				},
				{
					name: "aria-roledescription",
					references: [
						{
							name: "WAI-ARIA Reference",
							url: "https://www.w3.org/TR/wai-aria-1.1/#aria-roledescription",
						},
					],
					description: {
						kind: "markdown",
						value: "Defines a human-readable, author-localized description for the [role](https://www.w3.org/TR/wai-aria-1.1/#dfn-role) of an [element](https://www.w3.org/TR/wai-aria-1.1/#dfn-element).",
					},
				},
				{
					name: "aria-rowcount",
					references: [
						{
							name: "WAI-ARIA Reference",
							url: "https://www.w3.org/TR/wai-aria-1.1/#aria-rowcount",
						},
					],
					description: {
						kind: "markdown",
						value: "Defines the total number of rows in a [`table`](https://www.w3.org/TR/wai-aria-1.1/#table), [`grid`](https://www.w3.org/TR/wai-aria-1.1/#grid), or [`treegrid`](https://www.w3.org/TR/wai-aria-1.1/#treegrid). See related [`aria-rowindex`](https://www.w3.org/TR/wai-aria-1.1/#aria-rowindex).",
					},
				},
				{
					name: "aria-rowindex",
					references: [
						{
							name: "WAI-ARIA Reference",
							url: "https://www.w3.org/TR/wai-aria-1.1/#aria-rowindex",
						},
					],
					description: {
						kind: "markdown",
						value: "Defines an [element's](https://www.w3.org/TR/wai-aria-1.1/#dfn-element) row index or position with respect to the total number of rows within a [`table`](https://www.w3.org/TR/wai-aria-1.1/#table), [`grid`](https://www.w3.org/TR/wai-aria-1.1/#grid), or [`treegrid`](https://www.w3.org/TR/wai-aria-1.1/#treegrid). See related [`aria-rowcount`](https://www.w3.org/TR/wai-aria-1.1/#aria-rowcount) and [`aria-rowspan`](https://www.w3.org/TR/wai-aria-1.1/#aria-rowspan).",
					},
				},
				{
					name: "aria-rowspan",
					references: [
						{
							name: "WAI-ARIA Reference",
							url: "https://www.w3.org/TR/wai-aria-1.1/#aria-rowspan",
						},
					],
					description: {
						kind: "markdown",
						value: "Defines the number of rows spanned by a cell or gridcell within a [`table`](https://www.w3.org/TR/wai-aria-1.1/#table), [`grid`](https://www.w3.org/TR/wai-aria-1.1/#grid), or [`treegrid`](https://www.w3.org/TR/wai-aria-1.1/#treegrid). See related [`aria-rowindex`](https://www.w3.org/TR/wai-aria-1.1/#aria-rowindex) and [`aria-colspan`](https://www.w3.org/TR/wai-aria-1.1/#aria-colspan).",
					},
				},
				{
					name: "aria-selected",
					valueSet: "u",
					references: [
						{
							name: "WAI-ARIA Reference",
							url: "https://www.w3.org/TR/wai-aria-1.1/#aria-selected",
						},
					],
					description: {
						kind: "markdown",
						value: 'Indicates the current "selected" [state](https://www.w3.org/TR/wai-aria-1.1/#dfn-state) of various [widgets](https://www.w3.org/TR/wai-aria-1.1/#dfn-widget). See related [`aria-checked`](https://www.w3.org/TR/wai-aria-1.1/#aria-checked) and [`aria-pressed`](https://www.w3.org/TR/wai-aria-1.1/#aria-pressed).',
					},
				},
				{
					name: "aria-setsize",
					references: [
						{
							name: "WAI-ARIA Reference",
							url: "https://www.w3.org/TR/wai-aria-1.1/#aria-setsize",
						},
					],
					description: {
						kind: "markdown",
						value: "Defines the number of items in the current set of listitems or treeitems. Not required if all elements in the set are present in the DOM. See related [`aria-posinset`](https://www.w3.org/TR/wai-aria-1.1/#aria-posinset).",
					},
				},
				{
					name: "aria-sort",
					valueSet: "sort",
					references: [
						{
							name: "WAI-ARIA Reference",
							url: "https://www.w3.org/TR/wai-aria-1.1/#aria-sort",
						},
					],
					description: {
						kind: "markdown",
						value: "Indicates if items in a table or grid are sorted in ascending or descending order.",
					},
				},
				{
					name: "aria-valuemax",
					references: [
						{
							name: "WAI-ARIA Reference",
							url: "https://www.w3.org/TR/wai-aria-1.1/#aria-valuemax",
						},
					],
					description: {
						kind: "markdown",
						value: "Defines the maximum allowed value for a range [widget](https://www.w3.org/TR/wai-aria-1.1/#dfn-widget).",
					},
				},
				{
					name: "aria-valuemin",
					references: [
						{
							name: "WAI-ARIA Reference",
							url: "https://www.w3.org/TR/wai-aria-1.1/#aria-valuemin",
						},
					],
					description: {
						kind: "markdown",
						value: "Defines the minimum allowed value for a range [widget](https://www.w3.org/TR/wai-aria-1.1/#dfn-widget).",
					},
				},
				{
					name: "aria-valuenow",
					references: [
						{
							name: "WAI-ARIA Reference",
							url: "https://www.w3.org/TR/wai-aria-1.1/#aria-valuenow",
						},
					],
					description: {
						kind: "markdown",
						value: "Defines the current value for a range [widget](https://www.w3.org/TR/wai-aria-1.1/#dfn-widget). See related [`aria-valuetext`](https://www.w3.org/TR/wai-aria-1.1/#aria-valuetext).",
					},
				},
				{
					name: "aria-valuetext",
					references: [
						{
							name: "WAI-ARIA Reference",
							url: "https://www.w3.org/TR/wai-aria-1.1/#aria-valuetext",
						},
					],
					description: {
						kind: "markdown",
						value: "Defines the human readable text alternative of [`aria-valuenow`](https://www.w3.org/TR/wai-aria-1.1/#aria-valuenow) for a range [widget](https://www.w3.org/TR/wai-aria-1.1/#dfn-widget).",
					},
				},
				{
					name: "aria-details",
					description: {
						kind: "markdown",
						value: "Identifies the [element](https://www.w3.org/TR/wai-aria-1.1/#dfn-element) that provides a detailed, extended description for the [object](https://www.w3.org/TR/wai-aria-1.1/#dfn-object). See related [`aria-describedby`](https://www.w3.org/TR/wai-aria-1.1/#aria-describedby).",
					},
				},
				{
					name: "aria-keyshortcuts",
					description: {
						kind: "markdown",
						value: "Indicates keyboard shortcuts that an author has implemented to activate or give focus to an element.",
					},
				},
			],
			valueSets: [
				{ name: "b", values: [{ name: "true" }, { name: "false" }] },
				{
					name: "u",
					values: [
						{ name: "true" },
						{ name: "false" },
						{ name: "undefined" },
					],
				},
				{ name: "o", values: [{ name: "on" }, { name: "off" }] },
				{ name: "y", values: [{ name: "yes" }, { name: "no" }] },
				{ name: "w", values: [{ name: "soft" }, { name: "hard" }] },
				{
					name: "d",
					values: [
						{ name: "ltr" },
						{ name: "rtl" },
						{ name: "auto" },
					],
				},
				{
					name: "m",
					values: [
						{
							name: "get",
							description: {
								kind: "markdown",
								value: "Corresponds to the HTTP [GET method](https://www.w3.org/Protocols/rfc2616/rfc2616-sec9.html#sec9.3); form data are appended to the `action` attribute URI with a '?' as separator, and the resulting URI is sent to the server. Use this method when the form has no side-effects and contains only ASCII characters.",
							},
						},
						{
							name: "post",
							description: {
								kind: "markdown",
								value: "Corresponds to the HTTP [POST method](https://www.w3.org/Protocols/rfc2616/rfc2616-sec9.html#sec9.5); form data are included in the body of the form and sent to the server.",
							},
						},
						{
							name: "dialog",
							description: {
								kind: "markdown",
								value: "Use when the form is inside a [`<dialog>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/dialog) element to close the dialog when submitted.",
							},
						},
					],
				},
				{ name: "fm", values: [{ name: "get" }, { name: "post" }] },
				{
					name: "s",
					values: [
						{ name: "row" },
						{ name: "col" },
						{ name: "rowgroup" },
						{ name: "colgroup" },
					],
				},
				{
					name: "t",
					values: [
						{ name: "hidden" },
						{ name: "text" },
						{ name: "search" },
						{ name: "tel" },
						{ name: "url" },
						{ name: "email" },
						{ name: "password" },
						{ name: "datetime" },
						{ name: "date" },
						{ name: "month" },
						{ name: "week" },
						{ name: "time" },
						{ name: "datetime-local" },
						{ name: "number" },
						{ name: "range" },
						{ name: "color" },
						{ name: "checkbox" },
						{ name: "radio" },
						{ name: "file" },
						{ name: "submit" },
						{ name: "image" },
						{ name: "reset" },
						{ name: "button" },
					],
				},
				{
					name: "im",
					values: [
						{ name: "verbatim" },
						{ name: "latin" },
						{ name: "latin-name" },
						{ name: "latin-prose" },
						{ name: "full-width-latin" },
						{ name: "kana" },
						{ name: "kana-name" },
						{ name: "katakana" },
						{ name: "numeric" },
						{ name: "tel" },
						{ name: "email" },
						{ name: "url" },
					],
				},
				{
					name: "bt",
					values: [
						{ name: "button" },
						{ name: "submit" },
						{ name: "reset" },
						{ name: "menu" },
					],
				},
				{
					name: "lt",
					values: [
						{ name: "1" },
						{ name: "a" },
						{ name: "A" },
						{ name: "i" },
						{ name: "I" },
					],
				},
				{
					name: "mt",
					values: [{ name: "context" }, { name: "toolbar" }],
				},
				{
					name: "mit",
					values: [
						{ name: "command" },
						{ name: "checkbox" },
						{ name: "radio" },
					],
				},
				{
					name: "et",
					values: [
						{ name: "application/x-www-form-urlencoded" },
						{ name: "multipart/form-data" },
						{ name: "text/plain" },
					],
				},
				{
					name: "tk",
					values: [
						{ name: "subtitles" },
						{ name: "captions" },
						{ name: "descriptions" },
						{ name: "chapters" },
						{ name: "metadata" },
					],
				},
				{
					name: "pl",
					values: [
						{ name: "none" },
						{ name: "metadata" },
						{ name: "auto" },
					],
				},
				{
					name: "sh",
					values: [
						{ name: "circle" },
						{ name: "default" },
						{ name: "poly" },
						{ name: "rect" },
					],
				},
				{
					name: "xo",
					values: [
						{ name: "anonymous" },
						{ name: "use-credentials" },
					],
				},
				{
					name: "target",
					values: [
						{ name: "_self" },
						{ name: "_blank" },
						{ name: "_parent" },
						{ name: "_top" },
					],
				},
				{
					name: "sb",
					values: [
						{ name: "allow-forms" },
						{ name: "allow-modals" },
						{ name: "allow-pointer-lock" },
						{ name: "allow-popups" },
						{ name: "allow-popups-to-escape-sandbox" },
						{ name: "allow-same-origin" },
						{ name: "allow-scripts" },
						{ name: "allow-top-navigation" },
					],
				},
				{
					name: "tristate",
					values: [
						{ name: "true" },
						{ name: "false" },
						{ name: "mixed" },
						{ name: "undefined" },
					],
				},
				{
					name: "inputautocomplete",
					values: [
						{ name: "additional-name" },
						{ name: "address-level1" },
						{ name: "address-level2" },
						{ name: "address-level3" },
						{ name: "address-level4" },
						{ name: "address-line1" },
						{ name: "address-line2" },
						{ name: "address-line3" },
						{ name: "bday" },
						{ name: "bday-year" },
						{ name: "bday-day" },
						{ name: "bday-month" },
						{ name: "billing" },
						{ name: "cc-additional-name" },
						{ name: "cc-csc" },
						{ name: "cc-exp" },
						{ name: "cc-exp-month" },
						{ name: "cc-exp-year" },
						{ name: "cc-family-name" },
						{ name: "cc-given-name" },
						{ name: "cc-name" },
						{ name: "cc-number" },
						{ name: "cc-type" },
						{ name: "country" },
						{ name: "country-name" },
						{ name: "current-password" },
						{ name: "email" },
						{ name: "family-name" },
						{ name: "fax" },
						{ name: "given-name" },
						{ name: "home" },
						{ name: "honorific-prefix" },
						{ name: "honorific-suffix" },
						{ name: "impp" },
						{ name: "language" },
						{ name: "mobile" },
						{ name: "name" },
						{ name: "new-password" },
						{ name: "nickname" },
						{ name: "off" },
						{ name: "on" },
						{ name: "organization" },
						{ name: "organization-title" },
						{ name: "pager" },
						{ name: "photo" },
						{ name: "postal-code" },
						{ name: "sex" },
						{ name: "shipping" },
						{ name: "street-address" },
						{ name: "tel-area-code" },
						{ name: "tel" },
						{ name: "tel-country-code" },
						{ name: "tel-extension" },
						{ name: "tel-local" },
						{ name: "tel-local-prefix" },
						{ name: "tel-local-suffix" },
						{ name: "tel-national" },
						{ name: "transaction-amount" },
						{ name: "transaction-currency" },
						{ name: "url" },
						{ name: "username" },
						{ name: "work" },
					],
				},
				{
					name: "autocomplete",
					values: [
						{ name: "inline" },
						{ name: "list" },
						{ name: "both" },
						{ name: "none" },
					],
				},
				{
					name: "current",
					values: [
						{ name: "page" },
						{ name: "step" },
						{ name: "location" },
						{ name: "date" },
						{ name: "time" },
						{ name: "true" },
						{ name: "false" },
					],
				},
				{
					name: "dropeffect",
					values: [
						{ name: "copy" },
						{ name: "move" },
						{ name: "link" },
						{ name: "execute" },
						{ name: "popup" },
						{ name: "none" },
					],
				},
				{
					name: "invalid",
					values: [
						{ name: "grammar" },
						{ name: "false" },
						{ name: "spelling" },
						{ name: "true" },
					],
				},
				{
					name: "live",
					values: [
						{ name: "off" },
						{ name: "polite" },
						{ name: "assertive" },
					],
				},
				{
					name: "orientation",
					values: [
						{ name: "vertical" },
						{ name: "horizontal" },
						{ name: "undefined" },
					],
				},
				{
					name: "relevant",
					values: [
						{ name: "additions" },
						{ name: "removals" },
						{ name: "text" },
						{ name: "all" },
						{ name: "additions text" },
					],
				},
				{
					name: "sort",
					values: [
						{ name: "ascending" },
						{ name: "descending" },
						{ name: "none" },
						{ name: "other" },
					],
				},
				{
					name: "roles",
					values: [
						{ name: "alert" },
						{ name: "alertdialog" },
						{ name: "button" },
						{ name: "checkbox" },
						{ name: "dialog" },
						{ name: "gridcell" },
						{ name: "link" },
						{ name: "log" },
						{ name: "marquee" },
						{ name: "menuitem" },
						{ name: "menuitemcheckbox" },
						{ name: "menuitemradio" },
						{ name: "option" },
						{ name: "progressbar" },
						{ name: "radio" },
						{ name: "scrollbar" },
						{ name: "searchbox" },
						{ name: "slider" },
						{ name: "spinbutton" },
						{ name: "status" },
						{ name: "switch" },
						{ name: "tab" },
						{ name: "tabpanel" },
						{ name: "textbox" },
						{ name: "timer" },
						{ name: "tooltip" },
						{ name: "treeitem" },
						{ name: "combobox" },
						{ name: "grid" },
						{ name: "listbox" },
						{ name: "menu" },
						{ name: "menubar" },
						{ name: "radiogroup" },
						{ name: "tablist" },
						{ name: "tree" },
						{ name: "treegrid" },
						{ name: "application" },
						{ name: "article" },
						{ name: "cell" },
						{ name: "columnheader" },
						{ name: "definition" },
						{ name: "directory" },
						{ name: "document" },
						{ name: "feed" },
						{ name: "figure" },
						{ name: "group" },
						{ name: "heading" },
						{ name: "img" },
						{ name: "list" },
						{ name: "listitem" },
						{ name: "math" },
						{ name: "none" },
						{ name: "note" },
						{ name: "presentation" },
						{ name: "region" },
						{ name: "row" },
						{ name: "rowgroup" },
						{ name: "rowheader" },
						{ name: "separator" },
						{ name: "table" },
						{ name: "term" },
						{ name: "text" },
						{ name: "toolbar" },
						{ name: "banner" },
						{ name: "complementary" },
						{ name: "contentinfo" },
						{ name: "form" },
						{ name: "main" },
						{ name: "navigation" },
						{ name: "region" },
						{ name: "search" },
						{ name: "doc-abstract" },
						{ name: "doc-acknowledgments" },
						{ name: "doc-afterword" },
						{ name: "doc-appendix" },
						{ name: "doc-backlink" },
						{ name: "doc-biblioentry" },
						{ name: "doc-bibliography" },
						{ name: "doc-biblioref" },
						{ name: "doc-chapter" },
						{ name: "doc-colophon" },
						{ name: "doc-conclusion" },
						{ name: "doc-cover" },
						{ name: "doc-credit" },
						{ name: "doc-credits" },
						{ name: "doc-dedication" },
						{ name: "doc-endnote" },
						{ name: "doc-endnotes" },
						{ name: "doc-epigraph" },
						{ name: "doc-epilogue" },
						{ name: "doc-errata" },
						{ name: "doc-example" },
						{ name: "doc-footnote" },
						{ name: "doc-foreword" },
						{ name: "doc-glossary" },
						{ name: "doc-glossref" },
						{ name: "doc-index" },
						{ name: "doc-introduction" },
						{ name: "doc-noteref" },
						{ name: "doc-notice" },
						{ name: "doc-pagebreak" },
						{ name: "doc-pagelist" },
						{ name: "doc-part" },
						{ name: "doc-preface" },
						{ name: "doc-prologue" },
						{ name: "doc-pullquote" },
						{ name: "doc-qna" },
						{ name: "doc-subtitle" },
						{ name: "doc-tip" },
						{ name: "doc-toc" },
					],
				},
				{
					name: "metanames",
					values: [
						{ name: "application-name" },
						{ name: "author" },
						{ name: "description" },
						{ name: "format-detection" },
						{ name: "generator" },
						{ name: "keywords" },
						{ name: "publisher" },
						{ name: "referrer" },
						{ name: "robots" },
						{ name: "theme-color" },
						{ name: "viewport" },
					],
				},
				{
					name: "haspopup",
					values: [
						{
							name: "false",
							description: {
								kind: "markdown",
								value: "(default) Indicates the element does not have a popup.",
							},
						},
						{
							name: "true",
							description: {
								kind: "markdown",
								value: "Indicates the popup is a menu.",
							},
						},
						{
							name: "menu",
							description: {
								kind: "markdown",
								value: "Indicates the popup is a menu.",
							},
						},
						{
							name: "listbox",
							description: {
								kind: "markdown",
								value: "Indicates the popup is a listbox.",
							},
						},
						{
							name: "tree",
							description: {
								kind: "markdown",
								value: "Indicates the popup is a tree.",
							},
						},
						{
							name: "grid",
							description: {
								kind: "markdown",
								value: "Indicates the popup is a grid.",
							},
						},
						{
							name: "dialog",
							description: {
								kind: "markdown",
								value: "Indicates the popup is a dialog.",
							},
						},
					],
				},
				{
					name: "decoding",
					values: [
						{ name: "sync" },
						{ name: "async" },
						{ name: "auto" },
					],
				},
				{
					name: "loading",
					values: [
						{
							name: "eager",
							description: {
								kind: "markdown",
								value: "Loads the image immediately, regardless of whether or not the image is currently within the visible viewport (this is the default value).",
							},
						},
						{
							name: "lazy",
							description: {
								kind: "markdown",
								value: "Defers loading the image until it reaches a calculated distance from the viewport, as defined by the browser. The intent is to avoid the network and storage bandwidth needed to handle the image until it's reasonably certain that it will be needed. This generally improves the performance of the content in most typical use cases.",
							},
						},
					],
				},
				{
					name: "referrerpolicy",
					values: [
						{ name: "no-referrer" },
						{ name: "no-referrer-when-downgrade" },
						{ name: "origin" },
						{ name: "origin-when-cross-origin" },
						{ name: "same-origin" },
						{ name: "strict-origin" },
						{ name: "strict-origin-when-cross-origin" },
						{ name: "unsafe-url" },
					],
				},
			],
		},
		fc = class {
			constructor(e) {
				(this.dataProviders = []),
					this.setDataProviders(
						e.useDefaultDataProvider !== !1,
						e.customDataProviders || [],
					);
			}
			setDataProviders(e, t) {
				(this.dataProviders = []),
					e && this.dataProviders.push(new wa("html5", mc)),
					this.dataProviders.push(...t);
			}
			getDataProviders() {
				return this.dataProviders;
			}
			isVoidElement(e, t) {
				return (
					!!e &&
					xu(t, e.toLowerCase(), (n, i) => n.localeCompare(i)) >= 0
				);
			}
			getVoidElements(e) {
				const t = Array.isArray(e)
						? e
						: this.getDataProviders().filter((i) =>
								i.isApplicable(e),
							),
					n = [];
				return (
					t.forEach((i) => {
						i.provideTags()
							.filter((r) => r.void)
							.forEach((r) => n.push(r.name));
					}),
					n.sort()
				);
			}
			isPathAttribute(e, t) {
				if (t === "src" || t === "href") return !0;
				const n = pc[e];
				return n
					? typeof n == "string"
						? n === t
						: n.indexOf(t) !== -1
					: !1;
			}
		},
		pc = {
			a: "href",
			area: "href",
			body: "background",
			blockquote: "cite",
			del: "cite",
			form: "action",
			frame: ["src", "longdesc"],
			img: ["src", "longdesc"],
			ins: "cite",
			link: "href",
			object: "data",
			q: "cite",
			script: "src",
			audio: "src",
			button: "formaction",
			command: "icon",
			embed: "src",
			html: "manifest",
			input: ["src", "formaction"],
			source: "src",
			track: "src",
			video: ["src", "poster"],
		},
		gc = {};
	function bc(e = gc) {
		const t = new fc(e),
			n = new Ou(e, t),
			i = new Fu(e, t),
			r = new Tu(t),
			s = new dc(r),
			o = new hc(t),
			l = new rc(t);
		return {
			setDataProviders: t.setDataProviders.bind(t),
			createScanner: pe,
			parseHTMLDocument: r.parseDocument.bind(r),
			doComplete: i.doComplete.bind(i),
			doComplete2: i.doComplete2.bind(i),
			setCompletionParticipants: i.setCompletionParticipants.bind(i),
			doHover: n.doHover.bind(n),
			format: Xu,
			findDocumentHighlights: sc,
			findDocumentLinks: l.findDocumentLinks.bind(l),
			findDocumentSymbols: ac,
			findDocumentSymbols2: Ea,
			getFoldingRanges: o.getFoldingRanges.bind(o),
			getSelectionRanges: s.getSelectionRanges.bind(s),
			doQuoteComplete: i.doQuoteComplete.bind(i),
			doTagComplete: i.doTagComplete.bind(i),
			doRename: lc,
			findMatchingTagPosition: cc,
			findOnTypeRenameRanges: Ma,
			findLinkedEditingRanges: Ma,
		};
	}
	function _c(e, t) {
		return new wa(e, t);
	}
	var wc = class {
		constructor(e, t) {
			(this._ctx = e),
				(this._languageSettings = t.languageSettings),
				(this._languageId = t.languageId);
			const n = this._languageSettings.data,
				i = n?.useDefaultDataProvider,
				r = [];
			if (n?.dataProviders)
				for (const s in n.dataProviders)
					r.push(_c(s, n.dataProviders[s]));
			this._languageService = bc({
				useDefaultDataProvider: i,
				customDataProviders: r,
			});
		}
		async doComplete(e, t) {
			let n = this._getTextDocument(e);
			if (!n) return null;
			let i = this._languageService.parseHTMLDocument(n);
			return Promise.resolve(
				this._languageService.doComplete(
					n,
					t,
					i,
					this._languageSettings && this._languageSettings.suggest,
				),
			);
		}
		async format(e, t, n) {
			let i = this._getTextDocument(e);
			if (!i) return [];
			let r = { ...this._languageSettings.format, ...n },
				s = this._languageService.format(i, t, r);
			return Promise.resolve(s);
		}
		async doHover(e, t) {
			let n = this._getTextDocument(e);
			if (!n) return null;
			let i = this._languageService.parseHTMLDocument(n),
				r = this._languageService.doHover(n, t, i);
			return Promise.resolve(r);
		}
		async findDocumentHighlights(e, t) {
			let n = this._getTextDocument(e);
			if (!n) return [];
			let i = this._languageService.parseHTMLDocument(n),
				r = this._languageService.findDocumentHighlights(n, t, i);
			return Promise.resolve(r);
		}
		async findDocumentLinks(e) {
			let t = this._getTextDocument(e);
			if (!t) return [];
			let n = this._languageService.findDocumentLinks(t, null);
			return Promise.resolve(n);
		}
		async findDocumentSymbols(e) {
			let t = this._getTextDocument(e);
			if (!t) return [];
			let n = this._languageService.parseHTMLDocument(t),
				i = this._languageService.findDocumentSymbols(t, n);
			return Promise.resolve(i);
		}
		async getFoldingRanges(e, t) {
			let n = this._getTextDocument(e);
			if (!n) return [];
			let i = this._languageService.getFoldingRanges(n, t);
			return Promise.resolve(i);
		}
		async getSelectionRanges(e, t) {
			let n = this._getTextDocument(e);
			if (!n) return [];
			let i = this._languageService.getSelectionRanges(n, t);
			return Promise.resolve(i);
		}
		async doRename(e, t, n) {
			let i = this._getTextDocument(e);
			if (!i) return null;
			let r = this._languageService.parseHTMLDocument(i),
				s = this._languageService.doRename(i, t, n, r);
			return Promise.resolve(s);
		}
		_getTextDocument(e) {
			let t = this._ctx.getMirrorModels();
			for (let n of t)
				if (n.uri.toString() === e)
					return si.create(
						e,
						this._languageId,
						n.version,
						n.getValue(),
					);
			return null;
		}
	};
	self.onmessage = () => {
		bs((e, t) => new wc(e, t));
	};
})();
//# sourceMappingURL=html.worker-Yqrg21lv.js.map