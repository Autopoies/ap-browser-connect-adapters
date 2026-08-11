(() => {
	const limit = Number("{{args.limit}}") || 20;
	const clean = (s) => (s || "").replace(/\s+/g, " ").trim();
	const pick = (...selectors) =>
		selectors
			.map((s) => clean(document.querySelector(s)?.textContent))
			.find(Boolean) || "";
	const videos = [];
	const seen = new Set();
	for (const link of document.querySelectorAll('a[href*="/video/"]')) {
		if (videos.length >= limit) break;
		if (!link.href || seen.has(link.href)) continue;
		seen.add(link.href);
		const card =
			link.closest('div[class*="DivVideo"]') ||
			link.parentElement?.parentElement ||
			link;
		videos.push({
			description: (
				clean(card.querySelector('[data-e2e*="desc"]')?.textContent) ||
				clean(link.textContent)
			).slice(0, 200),
			url: link.href,
			likes: clean(
				card.querySelector('[data-e2e*="like"], [data-e2e*="digg"]')
					?.textContent,
			),
			comments: clean(card.querySelector('[data-e2e*="comment"]')?.textContent),
		});
	}
	return {
		name: pick('[data-e2e*="user-title"]', '[data-e2e*="user-subtitle"]', "h1"),
		bio: pick('[data-e2e*="user-bio"]', '[data-e2e*="bio"]'),
		followers: pick(
			'[data-e2e*="followers-count"]',
			'[data-e2e*="followers"]',
			'[data-e2e*="follower"]',
		),
		likes: pick(
			'[data-e2e*="likes-count"]',
			'[data-e2e*="likes"]',
			'[data-e2e*="like"]',
		),
		videos,
	};
})();
