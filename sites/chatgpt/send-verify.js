(async () => {
	// Runs after the CDP fill. Submission is self-healing here: an Enter
	// fired too early (before ProseMirror flushes the insertText into
	// state) clears the composer without submitting — an empty composer
	// proves NOTHING. Only accept when generation started or a response
	// already rendered; otherwise keep clicking the send button.
	const composerText = () => {
		const el =
			document.querySelector("#prompt-textarea") ||
			document.querySelector("textarea") ||
			document.querySelector('div[contenteditable="true"]');
		if (!el) return "";
		return el.tagName === "TEXTAREA"
			? el.value || ""
			: el.innerText || el.textContent || "";
	};
	const generating = () =>
		!!document.querySelector(
			'button[data-testid="stop-button"], [data-is-streaming="true"], .result-streaming',
		);
	// A response that finished before our first poll (very short answers).
	const responded = () => {
		const md = document.querySelectorAll(".markdown, div.markdown, .prose");
		const last = md.length > 0 ? md[md.length - 1] : null;
		return last ? (last.innerText || "").trim().length > 0 : false;
	};

	for (let i = 0; i < 8; i++) {
		if (generating() || responded()) return { sent: true, submitted: true };
		if (composerText().trim().length > 0) {
			const btn = document.querySelector(
				'button[data-testid="send-button"], #composer-submit-button, button[aria-label*="Send"], button[aria-label*="发送"], button.composer-submit-btn',
			);
			if (btn && !btn.disabled) btn.click();
		}
		await new Promise((r) => setTimeout(r, 700));
	}
	if (generating() || responded()) return { sent: true, submitted: true };
	throw Object.assign(
		new Error(
			"submission never triggered (no generation, no response after retries)",
		),
		{ code: "SEND_NOT_SUBMITTED" },
	);
})();
