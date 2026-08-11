(() => {
	const limit = Number("{{args.limit}}") || 20;
	const links = [
		...document.querySelectorAll(
			'#mw-pages .mw-category a[href*="/wiki/"], #mw-pages .mw-content-ltr a[href*="/wiki/"]',
		),
	].filter((a) => a.textContent.trim() && !a.pathname.includes(":"));
	const out = [];
	const seen = new Set();
	links.forEach((a) => {
		if (out.length >= limit) return;
		if (seen.has(a.href)) return;
		seen.add(a.href);
		out.push({ title: a.textContent.trim(), url: a.href });
	});
	return out;
})();
