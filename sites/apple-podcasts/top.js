(() => {
	const seen = new Set();
	const out = [];
	const limit = Number("{{args.limit}}") || 20;
	[...document.querySelectorAll('a[href*="/podcast/"]')].forEach((a) => {
		if (out.length >= limit) return;
		const url = a.href || "";
		if (url.includes("?i=") || seen.has(url)) return;
		const title =
			a
				.querySelector('[data-testid*="title"], .product-lockup-title, h2, h3')
				?.textContent?.trim() ||
			a.textContent?.trim() ||
			a
				.getAttribute("aria-label")
				?.replace(/^[^,]+,\s*/, "")
				.trim() ||
			"";
		if (!title) return;
		seen.add(url);
		out.push({
			rank: String(out.length + 1),
			title,
			url,
			podcast_id: (url.match(/id(\d+)/) || [])[1] || "",
		});
	});
	return out;
})();
