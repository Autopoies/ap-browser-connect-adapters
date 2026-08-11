(() => {
	const limit = Number("{{args.limit}}") || 20;
	const out = [];
	document.querySelectorAll('a[href*="/podcast/"]').forEach((a) => {
		if (out.length >= limit) return;
		const title =
			a.querySelector(".title")?.textContent?.trim() ||
			a.textContent?.trim().split("\n")[0] ||
			"";
		if (!title) return;
		out.push({
			title,
			url: a.href,
			description: a.querySelector(".description")?.textContent?.trim() || "",
		});
	});
	return out;
})();
