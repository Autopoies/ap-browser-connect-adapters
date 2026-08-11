(() => {
	const limit = Number("{{args.limit}}") || 20;
	const out = [];
	const seen = new Set();
	document.querySelectorAll('a[href*="/read/"]').forEach((link) => {
		if (out.length >= limit) return;
		const title = link.textContent?.trim() || "";
		if (!title) return;
		const url = link.href || "";
		if (!url || seen.has(url)) return;
		seen.add(url);
		const card = link.closest("article, div") || link.parentElement;
		const timeEl = card?.querySelector("time");
		const sourceEl = card?.querySelector('[data-n-tid], [class*="source"]');
		const text = card?.innerText?.trim() || "";
		const lines = text
			.split("\n")
			.map((s) => s.trim())
			.filter(Boolean);
		const time =
			timeEl?.textContent?.trim() ||
			timeEl?.getAttribute("datetime") ||
			lines.find((s) => s !== title && /\d/.test(s)) ||
			"";
		const source =
			sourceEl?.textContent?.trim() ||
			lines.find((s) => s !== title && s !== time) ||
			"";
		out.push({ title, url, source, time });
	});
	return out;
})();
