(() => {
	const limit = Number("{{args.limit}}") || 20;
	const out = [];
	const seen = new Set();
	document
		.querySelectorAll('a[href*="k.sina.com.cn"], a[href*="blog.sina.com.cn"]')
		.forEach((link) => {
			if (out.length >= limit) return;
			const title = link.textContent?.trim() || "";
			if (!title) return;
			const url = link.href || "";
			if (
				!url ||
				seen.has(url) ||
				/sina\.com\.cn\/$|contactus|copyright|beian|signup|help/.test(url)
			)
				return;
			seen.add(url);
			const parent = link.parentElement;
			const timeEl = parent?.querySelector(
				'time, [class*="time"], [class*="date"]',
			);
			const text = parent?.innerText?.trim() || "";
			const lines = text
				.split("\n")
				.map((s) => s.trim())
				.filter(Boolean);
			const source = lines.find((s) => s !== title && !/^\d/.test(s)) || "";
			const time =
				timeEl?.textContent?.trim() ||
				lines.find((s) => s !== title && s !== source && /\d/.test(s)) ||
				"";
			out.push({ title, url, source, time });
		});
	return out;
})();
