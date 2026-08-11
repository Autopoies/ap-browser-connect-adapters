(() => {
	const clean = (s) => (s || "").replace(/\s+/g, " ").trim();
	const limit = Number("{{args.limit}}") || 20;
	const items = [];
	const seen = new Set();

	const nodes = document.querySelectorAll(
		'a[href*="notif"], [role="listitem"] a, [role="article"]',
	);
	nodes.forEach((node) => {
		if (items.length >= limit) return;
		const url = node.getAttribute("href")
			? node.href
			: node.querySelector("a")?.href || "";
		const text = clean(node.innerText || node.textContent);
		if (!text || text.length < 5 || seen.has(url || text)) return;
		seen.add(url || text);

		const time = clean(
			node.querySelector("time")?.textContent ||
				node.querySelector("abbr")?.textContent ||
				"",
		);
		items.push({ text, url, time });
	});

	if (items.length === 0) {
		const lines = (document.body.innerText || "")
			.split("\n")
			.map(clean)
			.filter(Boolean);
		for (let i = 0; i < lines.length && items.length < limit; i++) {
			const line = lines[i];
			if (line.length > 5 && i + 1 < lines.length) {
				const isTime = /^[\d\s\w:•·-]{1,15}$/.test(lines[i + 1]);
				if (isTime) {
					items.push({ text: line, url: "", time: lines[i + 1] });
				}
			}
		}
	}
	return items;
})();
