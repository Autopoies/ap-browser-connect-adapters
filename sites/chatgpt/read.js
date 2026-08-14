(async () => {
	const roleAttr = "{{args.role}}";
	const index = parseInt("{{args.index}}", 10);
	const maxWaitMs = (parseInt("{{args.wait}}", 10) || 0) * 1000;
	const startTime = Date.now();

	function getState() {
		const stopBtn = document.querySelector(
			'button[data-testid="stop-button"], button[aria-label*="Stop"], button[aria-label*="停止"]',
		);
		const stopBtnFound = !!stopBtn;

		const streamingEl = document.querySelector(
			'[data-is-streaming="true"], .result-streaming, .streaming',
		);
		const isStreaming = !!streamingEl;

		const hasActiveSpinner = !!document.querySelector(
			".animate-spin, .animate-pulse",
		);

		const isGenerating =
			stopBtnFound ||
			isStreaming ||
			(hasActiveSpinner &&
				!document.querySelector('button[data-testid="send-button"]'));

		let isSearching = false;
		let isThinking = false;
		if (isGenerating) {
			const searchingEl = document.querySelector(
				'[data-testid*="search"], [data-testid*="web-search"]',
			);
			if (searchingEl && hasActiveSpinner) {
				isSearching = true;
			}
			const thinkingEl = document.querySelector(
				'[data-testid*="thinking"], [data-testid*="reasoning"], [data-testid*="thought"], [data-testid*="writing-block"]',
			);
			if (thinkingEl || (stopBtnFound && !isStreaming && hasActiveSpinner)) {
				isThinking = true;
			}
		}

		let currentActivity = null;
		if (isSearching) {
			currentActivity = "searching";
		} else if (isThinking) {
			currentActivity = "thinking";
		} else if (isGenerating) {
			currentActivity = "generating";
		}

		return {
			isGenerating,
			isSearching,
			isThinking,
			stopBtnFound,
			workedFor: null,
			currentActivity,
		};
	}

	let state = getState();
	while (
		maxWaitMs > 0 &&
		state.isGenerating &&
		Date.now() - startTime < maxWaitMs
	) {
		await new Promise((r) => setTimeout(r, 1000));
		state = getState();
	}

	let items = [];
	if (roleAttr === "assistant") {
		items = Array.from(
			document.querySelectorAll('div[data-message-author-role="assistant"]'),
		);
		if (items.length === 0) {
			items = Array.from(
				document.querySelectorAll(".markdown, div.markdown, .prose"),
			);
		}
	} else if (roleAttr === "user") {
		items = Array.from(
			document.querySelectorAll('div[data-message-author-role="user"]'),
		);
	} else {
		items = Array.from(
			document.querySelectorAll(
				"div[data-message-author-role], .markdown, div.markdown, .prose",
			),
		);
	}

	if (items.length === 0) {
		return {
			turnIndex: -1,
			role: roleAttr,
			length: 0,
			content: "",
			status: state,
		};
	}

	let targetIdx = index < 0 ? items.length + index : index;
	if (targetIdx < 0) targetIdx = 0;
	if (targetIdx >= items.length) targetIdx = items.length - 1;

	const targetEl = items[targetIdx];
	const text = targetEl ? (targetEl.innerText || "").trim() : "";

	return {
		turnIndex: targetIdx,
		role: roleAttr,
		length: text.length,
		content: text,
		status: state,
	};
})();
