(() => {
	const limit = Number("{{args.limit}}") || 20;
	const links = [...document.querySelectorAll('a[href*="/pull/"]')].filter(
		(a) => /\d+$/.test(a.pathname) && a.textContent.trim(),
	);
	const seen = new Set();
	const out = [];
	links.forEach((link) => {
		const match = link.pathname.match(/^(\/[^/]+\/[^/]+)\/pull\/(\d+)$/);
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
				siblings.filter((s) => s.querySelector('a[href*="/pull/"]')).length > 1
			)
				break;
		}

		const isMerged = Boolean(
			row.querySelector(".octicon-git-merge, .octicon-git-pull-request-closed"),
		);
		const isClosed = Boolean(
			row.querySelector(".octicon-git-pull-request-draft, .octicon-closed"),
		);
		const isOpen = Boolean(row.querySelector(".octicon-git-pull-request"));
		const status = isMerged
			? "merged"
			: isClosed
				? "closed"
				: isOpen
					? "open"
					: "";

		const commentLink = row.querySelector(
			'a[href*="#issue-"], a[href*="#issuecomment"], .octicon-comment, .octicon-comment-discussion',
		);
		const comments =
			commentLink?.parentElement?.textContent?.replace(/\D+/g, "") || "";

		out.push({
			title: link.textContent.trim(),
			url,
			repo: match[1].slice(1),
			number: match[2],
			status,
			comments,
		});
	});
	return out;
})();
