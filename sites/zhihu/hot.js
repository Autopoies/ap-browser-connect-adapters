(() => {
	const limit = Number("{{args.limit}}") || 20;
	const items = document.querySelectorAll(".HotItem");
	const out = [];
	items.forEach((item, i) => {
		if (i >= limit) return;
		const title =
			item.querySelector(".HotItem-title")?.textContent?.trim() || "";
		if (!title) return;
		const metrics = item.querySelector(".HotItem-metrics");
		const metricClone = metrics ? metrics.cloneNode(true) : null;
		metricClone?.querySelectorAll("button, svg").forEach((el) => el.remove());
		const heat =
			metricClone?.textContent?.trim() || metrics?.textContent?.trim() || "";
		const link = item.querySelector(
			'.HotItem-content a[href*="/question/"], a[href*="/question/"]',
		);
		out.push({
			rank: parseInt(
				item.querySelector(".HotItem-rank")?.textContent?.trim() || i + 1,
				10,
			),
			title,
			url: link?.href || "",
			heat,
			excerpt:
				item.querySelector(".HotItem-excerpt")?.textContent?.trim() || "",
			tag: item.querySelector(".HotItem-label")?.textContent?.trim() || "",
		});
	});
	return out;
})();
