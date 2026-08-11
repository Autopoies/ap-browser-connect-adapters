(() => {
	const limit = Number("{{args.limit}}") || 20;
	const rows = document.querySelectorAll(".athing");
	const out = [];
	rows.forEach((row, i) => {
		if (i >= limit) return;
		const titleEl = row.querySelector(".titleline a");
		const subtext = row.nextElementSibling?.querySelector(".subtext");
		const commentLink = subtext
			? [...subtext.querySelectorAll('a[href*="item?id="]')].pop()
			: null;
		out.push({
			rank: i + 1,
			title: titleEl?.textContent?.trim() || "",
			url: titleEl?.href || "",
			points: subtext?.querySelector(".score")?.textContent?.trim() || "",
			comments: commentLink?.textContent?.trim() || "",
		});
	});
	return out;
})();
