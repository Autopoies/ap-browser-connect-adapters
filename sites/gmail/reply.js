(async () => {
	const targetId = "{{args.id}}".trim();
	const bodyParam = "{{args.body}}";
	const replyAll = "{{args.reply_all}}" === "true";
	const attachName = "{{args.attachment_name}}".trim();
	const attachContent = "{{args.attachment_content}}";
	const attachType = "{{args.attachment_type}}".trim() || "text/plain";

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

	// 2. Find reply trigger
	let replyTrigger = null;
	if (replyAll) {
		replyTrigger = document.querySelector(
			'span.ams.bkI, [aria-label*="Reply all"], [data-tooltip*="Reply all"], [aria-label*="全部回复"]',
		);
	}
	if (!replyTrigger) {
		replyTrigger = document.querySelector(
			'span.ams.bkH, span.ams, div.m9, div.ip.iU, button[aria-label*="Reply"], button[aria-label*="回复"]',
		);
	}

	if (replyTrigger) {
		replyTrigger.scrollIntoView({ behavior: "smooth", block: "center" });
		replyTrigger.click();
	}

	// 3. Wait for editor
	let editor = null;
	for (let i = 0; i < 40; i++) {
		editor = document.querySelector(
			'div.Am.Al.editable, div[role="textbox"][g_editable="true"], div[g_editable="true"]',
		);
		if (editor) break;
		await new Promise((r) => setTimeout(r, 100));
	}

	if (!editor) {
		return {
			account: getAccount(),
			sent: false,
			error: "Reply editor could not be opened",
		};
	}

	// 4. Fill body
	editor.focus();
	editor.textContent = bodyParam;
	editor.dispatchEvent(new Event("input", { bubbles: true }));
	editor.dispatchEvent(new Event("change", { bubbles: true }));

	// 5. Handle attachment if provided
	let attached = false;
	if (attachName && attachContent) {
		const fileInput =
			document.querySelector('input[type="file"][name="Filedata"]') ||
			document.querySelector('input[type="file"]');
		if (fileInput) {
			let fileBlob;
			try {
				if (
					/^[A-Za-z0-9+/=]+$/.test(attachContent.trim()) &&
					attachContent.length % 4 === 0 &&
					attachContent.length > 30
				) {
					const binStr = atob(attachContent.trim());
					const len = binStr.length;
					const bytes = new Uint8Array(len);
					for (let i = 0; i < len; i++) {
						bytes[i] = binStr.charCodeAt(i);
					}
					fileBlob = new Blob([bytes], { type: attachType });
				} else {
					fileBlob = new Blob([attachContent], { type: attachType });
				}
			} catch {
				fileBlob = new Blob([attachContent], { type: attachType });
			}

			const file = new File([fileBlob], attachName, { type: attachType });
			const dt = new DataTransfer();
			dt.items.add(file);
			fileInput.files = dt.files;
			fileInput.dispatchEvent(new Event("change", { bubbles: true }));
			attached = true;

			await new Promise((r) => setTimeout(r, 1200));
		}
	}

	// 6. Click send
	const sendBtn = document.querySelector(
		'div.aoO.v7, div.T-I.J-J5-Ji.aoO, div[role="button"][data-tooltip*="Enter"]',
	);
	if (!sendBtn) {
		return {
			account: getAccount(),
			sent: false,
			error: "Send button not found",
		};
	}

	sendBtn.click();

	// Wait a moment for send to complete
	await new Promise((r) => setTimeout(r, 1000));

	const subject = document.querySelector("h2.hP")?.textContent?.trim() || "";
	const threadHash = window.location.hash.replace(/^#/, "");

	return {
		account: getAccount(),
		sent: true,
		threadId: threadHash,
		subject,
		replyAll,
		hasAttachment: attached,
		status: "sent",
	};
})();
