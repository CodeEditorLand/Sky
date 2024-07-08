import type { Type as Environment } from "@Library/Environment";

import { Suspense, lazy } from "solid-js";

const Action = lazy(() => import("@Context/Action.js"));
const Connection = lazy(() => import("@Context/Connection.js"));
const Edit = lazy(() => import("@Element/Editor.js"));
const _Environment = lazy(() => import("@Context/Environment.js"));
const Session = lazy(() => import("@Context/Session.js"));
const Store = lazy(() => import("@Context/Store.js"));

export default (Data: Environment) => (
	<Suspense>
		<_Environment Data={Data}>
			<Suspense>
				<Store
					Data={
						new Map([
							["Identifier", "Identifier"],
							["Key", "Key"],
						])
					}>
					<Suspense>
						<Connection>
							<Suspense>
								<Session>
									<div class="flex flex-col">
										<main class="flex grow justify-center">
											<div class="flex grow self-center">
												<div class="container">
													<div class="grid min-h-screen content-start gap-7 py-9">
														<div class="mb-28 grid w-full grow grid-flow-row gap-12 lg:grid-flow-col lg:grid-cols-2 lg:gap-10">
															<div class="order-last lg:order-first">
																<Suspense>
																	<Action>
																		<Suspense>
																			<Edit Type="HTML" />
																		</Suspense>
																		<Suspense>
																			<Edit Type="CSS" />
																		</Suspense>
																		<Suspense>
																			<Edit Type="TypeScript" />
																		</Suspense>
																	</Action>
																</Suspense>
															</div>
														</div>
													</div>
												</div>
											</div>
										</main>
									</div>
								</Session>
							</Suspense>
						</Connection>
					</Suspense>
				</Store>
			</Suspense>
		</_Environment>
	</Suspense>
);
