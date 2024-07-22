export default new (await import("swup")).default({
<<<<<<< HEAD
	containers: ["#swup"],
=======
	containers: ["#footer", "#main", "#header"],
>>>>>>> Fork/Current
	plugins: [
		new (
			await import(
				// @ts-expect-error
				"@swup/overlay-theme"
			)
		).default(),
		new (await import("@swup/head-plugin")).default(),
		new (await import("@swup/preload-plugin")).default(),
		new (await import("@swup/scroll-plugin")).default(),
		new (await import("@swup/body-class-plugin")).default(),
	],
});
