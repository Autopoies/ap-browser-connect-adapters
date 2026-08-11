(() => {
	const limit = Number("{{args.limit}}") || 20;
	const isLoginPage = Boolean(
		document.querySelector('input[type="password"], form[action*="login"]'),
	);
	if (isLoginPage && !document.querySelector('a[href*="/originalPosts/"]'))
		return [];
	const out = [];
	document
		.querySelectorAll('a[href], article, [role="article"]')
		.forEach((row) => {
			if (out.length >= limit) return;
			const a = row.matches?.("a[href]") ? row : row.querySelector?.("a[href]");
			const text = row.textContent?.replace(/\s+/g, " ").trim() || "";
			const title = text.slice(0, 80);
			if (title.length < 6) return;
			out.push({
				title,
				url: a?.href || location.href,
				text: text.slice(0, 240),
			});
		});
	return out;
})();
