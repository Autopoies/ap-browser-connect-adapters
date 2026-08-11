(() => {
	const limit = Number("{{args.limit}}") || 20;
	const isLoginPage = Boolean(
		document.querySelector('input[type="password"]') ||
			document.querySelector('form[action*="login"]'),
	);
	if (isLoginPage && (document.body?.innerText || "").length < 1000) return [];
	const out = [];
	document
		.querySelectorAll(
			'a[href*="exam"], a[href*="test"], a[href*="quiz"], li, tr',
		)
		.forEach((row) => {
			if (out.length >= limit) return;
			const a = row.matches?.("a[href]") ? row : row.querySelector?.("a[href]");
			if (!a) return;
			const text = row.textContent?.replace(/\s+/g, " ").trim() || "";
			const title = text.slice(0, 100);
			if (!title) return;
			const isDone = Boolean(
				row.querySelector(
					'[class*="done"], [class*="finish"], [class*="complete"], [class*="success"]',
				),
			);
			out.push({ title, url: a.href, status: isDone ? "done" : "pending" });
		});
	return out;
})();
