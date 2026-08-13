(() => {
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

	const navLinks = Array.from(
		document.querySelectorAll(
			'div[role="navigation"] a[href*="#"], div.ajl a[href*="#"], div.TN a[href*="#"], div.nM a[href*="#"]',
		),
	);
	const seenPaths = new Set();
	const labels = [];

	for (const a of navLinks) {
		const href = a.getAttribute("href") || "";
		const hashIndex = href.indexOf("#");
		if (hashIndex === -1) continue;
		const path = href.slice(hashIndex + 1);
		if (!path || seenPaths.has(path)) continue;
		seenPaths.add(path);

		const fullText = (a.textContent || "").replace(/\s+/g, " ").trim();
		const ariaLabel = a.getAttribute("aria-label") || "";

		// Extract unread count from text or aria-label
		let unreadCount = 0;
		const countMatch =
			(ariaLabel + " " + fullText).match(/(\d+)\s*(?:封未读|unread)/i) ||
			fullText.match(/\b(\d+)\b/);
		if (countMatch) {
			unreadCount = parseInt(countMatch[1], 10) || 0;
		}

		// Clean name
		let name = fullText.replace(/\s*\d+\s*$/, "").trim();
		if (!name && ariaLabel) {
			name = ariaLabel.replace(/“|”/g, "").split("中有")[0].trim();
		}

		labels.push({
			name: name || path,
			path,
			href,
			unreadCount,
		});
	}

	return {
		account: getAccount(),
		total: labels.length,
		labels,
	};
})();
