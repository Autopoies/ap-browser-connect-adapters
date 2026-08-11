(() => {
	const seen = new Set();
	const out = [];
	const limit = Number("{{args.limit}}") || 20;
	const links = [
		...document.querySelectorAll(
			'[data-testid="product-lockup-link"], a[href*="/podcast/"]',
		),
	];
	links.forEach((a) => {
		if (out.length >= limit) return;
		const title =
			a
				.querySelector('[data-testid*="title"], .product-lockup-title, h2, h3')
				?.textContent?.trim() ||
			a.textContent?.trim().split("\n")[0] ||
			a
				.getAttribute("aria-label")
				?.replace(/^[^,]+,\s*/, "")
				.trim() ||
			"";
		const url = a.href || "";
		if (!title || seen.has(url)) return;
		seen.add(url);
		out.push({
			title,
			kind: url.includes("?i=") ? "episode" : "show",
			url,
			podcast_id: (url.match(/id(\d+)/) || [])[1] || "",
		});
	});
	return out;
})();
