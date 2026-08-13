(async () => {
	const toParam = "{{args.to}}".trim();
	const subjectParam = "{{args.subject}}";
	const bodyParam = "{{args.body}}";
	const ccParam = "{{args.cc}}".trim();
	const bccParam = "{{args.bcc}}".trim();
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

	// 1. Open compose dialog if not already open
	let dialog = document.querySelector('div.AD, div[role="dialog"]');
	if (!dialog) {
		const composeBtn = document.querySelector(
			'div[gh="cm"], div[role="button"][jscontroller*="eIuAF"], .T-I.T-I-KE.L3',
		);
		if (composeBtn) {
			composeBtn.click();
		} else {
			// Fallback navigation
			window.location.hash = "#inbox?compose=new";
		}

		for (let i = 0; i < 40; i++) {
			dialog = document.querySelector('div.AD, div[role="dialog"]');
			if (dialog) break;
			await new Promise((r) => setTimeout(r, 100));
		}
	}

	if (!dialog) {
		return {
			account: getAccount(),
			sent: false,
			error: "Compose dialog could not be opened",
		};
	}

	// 2. Open CC / BCC fields if requested
	if (ccParam) {
		const ccTrigger = dialog.querySelector(
			'span.pE, [data-tooltip*="Cc"], [aria-label*="Cc"], [aria-label*="抄送"]',
		);
		if (ccTrigger) {
			ccTrigger.click();
			await new Promise((r) => setTimeout(r, 100));
		}
	}

	if (bccParam) {
		const bccTrigger = dialog.querySelector(
			'span.pB, [data-tooltip*="Bcc"], [aria-label*="Bcc"], [aria-label*="密送"]',
		);
		if (bccTrigger) {
			bccTrigger.click();
			await new Promise((r) => setTimeout(r, 100));
		}
	}

	// Helper to fill recipient input
	function addRecipients(inputEl, emailsStr) {
		if (!inputEl || !emailsStr) return;
		const emails = emailsStr
			.split(/[,;\n]+/)
			.map((s) => s.trim())
			.filter(Boolean);
		for (const email of emails) {
			inputEl.focus();
			inputEl.value = email;
			inputEl.dispatchEvent(new Event("input", { bubbles: true }));
			inputEl.dispatchEvent(
				new KeyboardEvent("keydown", {
					key: "Enter",
					code: "Enter",
					keyCode: 13,
					which: 13,
					bubbles: true,
				}),
			);
			inputEl.dispatchEvent(
				new KeyboardEvent("keyup", {
					key: "Enter",
					code: "Enter",
					keyCode: 13,
					which: 13,
					bubbles: true,
				}),
			);
			inputEl.dispatchEvent(new Event("change", { bubbles: true }));
			inputEl.blur();
		}
	}

	// 3. Fill To recipients
	const recipientInputs = Array.from(
		dialog.querySelectorAll('input.agP, input[role="combobox"]'),
	);
	if (recipientInputs.length > 0 && toParam) {
		addRecipients(recipientInputs[0], toParam);
	}

	// Fill CC / BCC if inputs are present
	if (recipientInputs.length > 1 && ccParam) {
		addRecipients(recipientInputs[1], ccParam);
	}
	if (recipientInputs.length > 2 && bccParam) {
		addRecipients(recipientInputs[2], bccParam);
	}

	// 4. Fill Subject
	const subjectInput = dialog.querySelector('input[name="subjectbox"]');
	if (subjectInput && subjectParam) {
		subjectInput.focus();
		subjectInput.value = subjectParam;
		subjectInput.dispatchEvent(new Event("input", { bubbles: true }));
		subjectInput.dispatchEvent(new Event("change", { bubbles: true }));
	}

	// 5. Fill Body
	const bodyEditor = dialog.querySelector(
		'div.Am.Al.editable, div[role="textbox"][g_editable="true"], div[g_editable="true"]',
	);
	if (bodyEditor && bodyParam) {
		bodyEditor.focus();
		bodyEditor.textContent = bodyParam;
		bodyEditor.dispatchEvent(new Event("input", { bubbles: true }));
		bodyEditor.dispatchEvent(new Event("change", { bubbles: true }));
	}

	// 6. Handle attachment if provided
	let attached = false;
	if (attachName && attachContent) {
		const fileInput =
			dialog.querySelector('input[type="file"][name="Filedata"]') ||
			document.querySelector('input[type="file"][name="Filedata"]');
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

			// Wait a moment for file upload to process
			await new Promise((r) => setTimeout(r, 1200));
		}
	}

	// 7. Click Send
	const sendBtn = dialog.querySelector(
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

	// Wait for compose dialog to dismiss or toast to appear
	for (let i = 0; i < 40; i++) {
		if (!document.querySelector("div.AD")) break;
		await new Promise((r) => setTimeout(r, 100));
	}

	return {
		account: getAccount(),
		sent: true,
		to: toParam,
		subject: subjectParam,
		hasAttachment: attached,
		status: "sent",
	};
})();
