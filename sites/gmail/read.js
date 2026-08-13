(async () => {
	const targetId = "{{args.id}}".trim();
	const shouldExpand = "{{args.expand}}" !== "false";

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

	// 1. If targetId is specified, navigate to it
	if (targetId) {
		if (/^\d+$/.test(targetId)) {
			const index = parseInt(targetId, 10) - 1;
			const rows = document.querySelectorAll("tr.zA");
			if (rows[index]) {
				rows[index].click();
			}
		} else {
			const cleanId = targetId.replace(/^#/, "");
			if (cleanId.includes("/")) {
				window.location.hash = "#" + cleanId;
			} else {
				window.location.hash = "#all/" + cleanId;
			}
		}

		// Wait for email view to load
		for (let i = 0; i < 40; i++) {
			if (document.querySelector("h2.hP, div.gs, div.adn")) break;
			await new Promise((r) => setTimeout(r, 100));
		}
	}

	// 2. Expand collapsed messages if requested
	if (shouldExpand) {
		const expandBtn = document.querySelector(
			'[aria-label*="Expand all"], [aria-label*="全部展开"], [data-tooltip*="Expand all"], [data-tooltip*="全部展开"], div.gx, img.ajz',
		);
		if (expandBtn) {
			expandBtn.click();
			await new Promise((r) => setTimeout(r, 300));
		}
		const collapsedNodes = document.querySelectorAll("div.kQ, div.kv");
		collapsedNodes.forEach((node) => node.click());
		if (collapsedNodes.length > 0) {
			await new Promise((r) => setTimeout(r, 300));
		}
	}

	// 3. Extract thread data
	const subject = document.querySelector("h2.hP")?.textContent?.trim() || "";
	const threadHash = window.location.hash.replace(/^#/, "");
	const labels = Array.from(
		document.querySelectorAll("div.ha .av, div.ha .at, div.hP ~ div .av"),
	)
		.map((el) => el.textContent?.trim() || "")
		.filter(Boolean);

	const messageBlocks = document.querySelectorAll("div.gs, div.adn");
	const messages = Array.from(messageBlocks).map((block, idx) => {
		const senderEl =
			block.querySelector(".gD") ||
			block.querySelector(".qu span") ||
			block.querySelector(".gE");
		const senderName = senderEl?.textContent?.trim() || "";
		const senderEmail =
			senderEl?.getAttribute("email") ||
			block.querySelector(".gD")?.getAttribute("email") ||
			"";
		const recipients = Array.from(
			block.querySelectorAll(".hb span, .g2, span[email]"),
		)
			.map((el) => el.getAttribute("email") || el.textContent?.trim() || "")
			.filter(Boolean);
		const dateEl = block.querySelector(".g3, .mI");
		const date =
			dateEl?.getAttribute("title") || dateEl?.textContent?.trim() || "";
		const bodyEl = block.querySelector(".a3s, .ii.gt");
		const body = bodyEl?.textContent?.trim() || "";
		const attachEls = block.querySelectorAll(".aZo, .aQA, .hq, .aQH, .aQO");
		const attachments = Array.from(attachEls)
			.map((el) => el.textContent?.trim() || "")
			.filter(Boolean);

		return {
			index: idx,
			senderName,
			senderEmail,
			recipients,
			date,
			body,
			attachments,
		};
	});

	return {
		account: getAccount(),
		threadId: threadHash,
		subject,
		messageCount: messages.length,
		labels,
		messages,
	};
})();
