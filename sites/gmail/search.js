(async () => {
	const query = "{{args.query}}".trim();
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

	const targetPrefix = "#search/" + encodeURIComponent(query);
	const expectedHash = page > 1 ? `${targetPrefix}/p${page}` : targetPrefix;
	if (
		!window.location.hash.startsWith(targetPrefix) ||
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
		page > 1 && window.location.hash === targetPrefix ? (page - 1) * limit : 0;
	const targetSlice = allRows.slice(startIndex, startIndex + limit);

	const emails = [];
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

		const sender =
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
		const unread = r.classList.contains("zE");
		const starred =
			r.querySelector(".T-KT-Jp") !== null ||
			r.querySelector('.T-KT[aria-checked="true"]') !== null;
		const hasAttachment =
			r.querySelector("td.yf") !== null &&
			r.querySelector("td.yf")?.innerHTML.trim() !== "";
		const labels = Array.from(r.querySelectorAll(".ar .av, .at, .av"))
			.map((el) => el.textContent?.trim() || "")
			.filter(Boolean);

		emails.push({
			id: threadId,
			threadId,
			sender: sender.replace(/\s+/g, " "),
			subject,
			snippet,
			date,
			unread,
			starred,
			hasAttachment,
			labels,
		});
	}

	return {
		account: getAccount(),
		query,
		page,
		total: emails.length,
		emails,
	};
})();
