(() => {
	const limit = Number("{{args.limit}}") || 20;
	return [...document.querySelectorAll('[data-testid="trend"]')]
		.map((trend) => {
			const lines = trend.innerText
				.split("\n")
				.map((s) => s.trim())
				.filter(Boolean);
			const ranked = /^\d+$/.test(lines[0] || "");
			const category = ranked ? lines[2] || "" : lines[0] || "";
			const topic = ranked ? lines[3] || "" : lines[1] || "";
			const posts =
				lines.find((s) => s !== topic && s !== category && /\d/.test(s)) || "";
			return {
				topic,
				category,
				posts,
				url: trend.querySelector("a[href]")?.href || "",
			};
		})
		.filter((t) => t.topic)
		.slice(0, limit);
})();
