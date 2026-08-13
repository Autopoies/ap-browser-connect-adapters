(async () => {
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

	if (
		window.location.hash !== "#inbox" &&
		!window.location.hash.startsWith("#inbox/")
	) {
		window.location.hash = "#inbox";
	}

	for (let i = 0; i < 30; i++) {
		if (document.querySelector('tr.zA, div[role="main"]')) break;
		await new Promise((r) => setTimeout(r, 100));
	}

	const unreadRows = document.querySelectorAll("tr.zA.zE").length;
	const totalRows = document.querySelectorAll("tr.zA").length;

	return {
		account: getAccount(),
		url: window.location.href,
		title: document.title,
		unreadInbox: unreadRows,
		visibleRows: totalRows,
	};
})();
