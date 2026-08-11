(() => {
	const limit = Number("{{args.limit}}") || 20;
	const links = [...document.querySelectorAll('a[href*="/issues/"]')].filter(
		(a) => /\d+$/.test(a.pathname) && a.textContent.trim(),
	);
	const seen = new Set();
	const out = [];
	links.forEach((link) => {
		const match = link.pathname.match(/^(\/[^/]+\/[^/]+)\/issues\/(\d+)$/);
		if (!match) return;
		const url = link.href;
		if (seen.has(url)) return;
		seen.add(url);
		if (out.length >= limit) return;
		let row = link;
		for (let i = 0; i < 8 && row?.parentElement; i++) {
			row = row.parentElement;
			const siblings = [...(row.parentElement?.children || [])];
			if (
				siblings.filter((s) => s.querySelector('a[href*="/issues/"]')).length >
				1
			)
				break;
		}
		const repo = match[1].slice(1);

		const isClosed = Boolean(
			row.querySelector(".octicon-issue-closed, .octicon-check"),
		);
		const isOpen = Boolean(
			row.querySelector(".octicon-issue-opened, .octicon-issue-draft"),
		);
		const status = isClosed ? "closed" : isOpen ? "open" : "";

		const authorLink = row.querySelector(
			'a[data-hovercard-type="user"], a.author, a[href^="/"]',
		);
		const author = authorLink?.textContent?.trim() || "";

		const commentLink = row.querySelector(
			'a[href*="#issue-"], a[href*="#issuecomment"], .octicon-comment, .octicon-comment-discussion',
		);
		const comments =
			commentLink?.parentElement?.textContent?.replace(/\D+/g, "") || "";

		out.push({
			title: link.textContent.trim(),
			url,
			repo,
			number: match[2],
			status,
			author,
			comments,
		});
	});
	return out;
})();
