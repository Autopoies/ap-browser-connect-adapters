(async () => {
	const page = Math.max(1, Number("{{args.page}}") || 1);
	const limit = Math.max(1, Number("{{args.limit}}") || 25);

	function getAccount() {
		const globals = window["GLOBALS"];
		if (typeof globals !== "undefined" && Array.isArray(globals)) {
			const candidate = globals.find(
				(item) =>
					typeof item === "string" &&
					/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(item),
			);
			if (candidate) return candidate;
		}
		const titleMatch = document.title.match(
			/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/,
		);
		if (titleMatch) return titleMatch[1];
		const el = document.querySelector(
			'a[aria-label*="@"], a[href*="SignOutOptions"], [data-identifier], div[aria-label*="@"]',
		);
		if (el) {
			const text =
				(el.getAttribute("aria-label") || "") +
				" " +
				(el.getAttribute("data-identifier") || "") +
				" " +
				(el.textContent || "");
			const match = text.match(
				/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/,
			);
			if (match) return match[1];
		}
		return "";
	}

	const expectedHash = page > 1 ? `#drafts/p${page}` : "#drafts";
	if (
		!window.location.hash.startsWith("#drafts") ||
		(page > 1 && window.location.hash !== expectedHash)
	) {
		window.location.hash = expectedHash;
	}

	if (page > 1) {
		for (let p = 1; p < page; p++) {
			const nextBtn = document.querySelector(
				'div.amD.T-I-Js-Gs:not([aria-disabled="true"]), div[aria-label*="较旧"]:not([aria-disabled="true"]), div[aria-label*="Older"]:not([aria-disabled="true"])',
			);
			if (nextBtn) {
				nextBtn.click();
				await new Promise((r) => setTimeout(r, 400));
			}
		}
	}

	for (let i = 0; i < 30; i++) {
		if (document.querySelector('tr.zA, div[role="main"]')) break;
		await new Promise((r) => setTimeout(r, 100));
	}

	const allRows = Array.from(document.querySelectorAll("tr.zA"));
	const startIndex =
		page > 1 && window.location.hash === "#drafts" ? (page - 1) * limit : 0;
	const targetSlice = allRows.slice(startIndex, startIndex + limit);

	const drafts = [];
	for (const r of targetSlice) {
		const threadId =
			r
				.querySelector("[data-legacy-thread-id]")
				?.getAttribute("data-legacy-thread-id") ||
			r
				.querySelector("[data-thread-id]")
				?.getAttribute("data-thread-id")
				?.replace(/^#thread-[a-z]:/, "") ||
			r.id;

		const to =
			r.querySelector("div.yW")?.textContent?.trim() ||
			r.querySelector(".yX")?.textContent?.trim() ||
			"";
		const subject =
			r.querySelector(".bog span, .bog, .y6 span, .y6")?.textContent?.trim() ||
			"";
		const snippet =
			r
				.querySelector(".y2")
				?.textContent?.replace(/^[\s\u00a0-]+/, "")
				?.trim() || "";
		const dateEl = r.querySelector("td.xW span, td.xW, span.bq9");
		const date =
			dateEl?.getAttribute("title") ||
			dateEl?.getAttribute("aria-label") ||
			dateEl?.textContent?.trim() ||
			"";

		drafts.push({
			id: threadId,
			threadId,
			to: to.replace(/\s+/g, " "),
			subject,
			snippet,
			date,
		});
	}

	return {
		account: getAccount(),
		folder: "drafts",
		page,
		total: drafts.length,
		drafts,
	};
})();
