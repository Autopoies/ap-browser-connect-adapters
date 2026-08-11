(() => {
	const seen = new Set();
	const out = [];
	const limit = Number("{{args.limit}}") || 20;
	[...document.querySelectorAll('a[href*="?i="]')].forEach((a) => {
		if (out.length >= limit) return;
		const url = a.href || "";
		if (seen.has(url)) return;
		const timeEl =
			a.querySelector("time") || a.closest("div, li")?.querySelector("time");
		const titleEl =
			a.querySelector('[class*="title"], [data-testid*="title"], h2, h3') || a;
		const durationEl = a.querySelector(
			'[class*="duration"], [data-testid*="duration"]',
		);

		const rawLines = (a.textContent || "")
			.split("\n")
			.map((s) => s.trim())
			.filter(Boolean);
		const title =
			titleEl?.textContent?.trim() ||
			a.getAttribute("aria-label")?.trim() ||
			rawLines[0] ||
			"";
		if (!title) return;
		seen.add(url);

		const date =
			timeEl?.textContent?.trim() || timeEl?.getAttribute("datetime") || "";
		const duration =
			durationEl?.textContent?.trim() ||
			rawLines.find(
				(s) => /\d+[:\s\w]+/.test(s) && s !== title && s !== date,
			) ||
			"";

		out.push({
			title,
			date,
			duration,
			url,
		});
	});
	return out;
})();
