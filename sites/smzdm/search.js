(() => {
	const limit = Number("{{args.limit}}") || 20;
	const out = [];
	const seen = new Set();
	const cards = document.querySelectorAll(
		"article, .feed-row-wide, .feed-row, .z-feed-content, li, div",
	);
	cards.forEach((row) => {
		if (out.length >= limit) return;
		const a = row.querySelector(
			'a[href*="smzdm.com/p/"], a[href*="post.smzdm.com"], a[href^="http"]',
		);
		const title = a?.textContent?.replace(/\s+/g, " ").trim() || "";
		if (title.length < 8) return;
		const url = a.href || "";
		if (!url || seen.has(url)) return;
		seen.add(url);
		const priceEl = row.querySelector(
			'[class*="price"], .z-highlight, .feed-block-title-s',
		);
		const text = row.textContent?.replace(/\s+/g, " ").trim() || "";
		const price =
			priceEl?.textContent?.trim() ||
			text.match(/[¥$]?\d+(?:\.\d+)?/)?.[0] ||
			"";
		out.push({ title, price, url, meta: text.slice(0, 180) });
	});
	return out;
})();
