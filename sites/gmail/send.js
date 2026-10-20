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

	const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

	function isElementVisible(el) {
		if (!el || !el.isConnected) return false;
		let cur = el;
		while (cur && cur.nodeType === 1) {
			if (cur.hidden || cur.getAttribute("aria-hidden") === "true") {
				return false;
			}
			const style = window.getComputedStyle(cur);
			if (
				style.display === "none" ||
				style.visibility === "hidden" ||
				style.opacity === "0"
			) {
				return false;
			}
			cur = cur.parentElement;
		}
		return true;
	}

	// MutationObserver-backed wait so hidden tabs (active: false) are not
	// stalled by Chrome's chained-setTimeout throttling.
	function waitFor(predicate, timeoutMs = 10000, intervalMs = 150) {
		return new Promise((resolve) => {
			try {
				const initial = predicate();
				if (initial) return resolve(initial);
			} catch {}
			let settled = false;
			let mo = null;
			let iv = null;
			let timer = null;
			const done = (val) => {
				if (settled) return;
				settled = true;
				if (mo) mo.disconnect();
				if (iv) clearInterval(iv);
				if (timer) clearTimeout(timer);
				resolve(val);
			};
			const check = () => {
				try {
					const res = predicate();
					if (res) done(res);
				} catch {}
			};
			if (typeof MutationObserver !== "undefined" && document.body) {
				mo = new MutationObserver(check);
				mo.observe(document.body, {
					childList: true,
					subtree: true,
					attributes: true,
					characterData: true,
				});
			}
			iv = setInterval(check, intervalMs);
			timer = setTimeout(() => done(null), timeoutMs);
		});
	}

	function findComposeDialog() {
		const candidates = Array.from(
			document.querySelectorAll('div.AD, div.M9, div[role="dialog"]'),
		);
		for (let i = candidates.length - 1; i >= 0; i--) {
			const el = candidates[i];
			if (
				el.querySelector(
					'input[name="subjectbox"], div.Am.Al.editable, div[role="textbox"][g_editable="true"], div[g_editable="true"]',
				)
			) {
				return el;
			}
		}
		return document.querySelector("div.AD");
	}

	// 1. Open compose dialog if not already open
	let dialog = findComposeDialog();
	if (!dialog) {
		const composeBtn =
			document.querySelector(
				'div[gh="cm"], div[role="button"][jscontroller*="eIuAF"], .T-I.T-I-KE.L3',
			) ||
			(await waitFor(
				() =>
					document.querySelector(
						'div[gh="cm"], div[role="button"][jscontroller*="eIuAF"], .T-I.T-I-KE.L3',
					),
				4000,
			));
		if (composeBtn) {
			composeBtn.click();
		} else {
			// Fallback navigation
			window.location.hash = "#inbox?compose=new";
		}

		dialog = await waitFor(() => findComposeDialog(), 6000);
	}

	if (!dialog) {
		return {
			account: getAccount(),
			sent: false,
			error: "Compose dialog could not be opened",
		};
	}

	// Ensure inner compose fields (editor + send button) have finished mounting
	await waitFor(
		() =>
			dialog.querySelector(
				'div.Am.Al.editable, div[role="textbox"][g_editable="true"], div[g_editable="true"]',
			) &&
			dialog.querySelector(
				'div.aoO.v7, div.T-I.J-J5-Ji.aoO, div[role="button"][data-tooltip*="Enter"]',
			),
		4000,
	);

	// 2. Open CC / BCC fields if requested
	if (ccParam) {
		const ccTrigger = dialog.querySelector(
			'span.pE, [data-tooltip*="Cc"], [aria-label*="Cc"], [aria-label*="抄送"]',
		);
		if (ccTrigger) {
			ccTrigger.click();
			await sleep(100);
		}
	}

	if (bccParam) {
		const bccTrigger = dialog.querySelector(
			'span.pB, [data-tooltip*="Bcc"], [aria-label*="Bcc"], [aria-label*="密送"]',
		);
		if (bccTrigger) {
			bccTrigger.click();
			await sleep(100);
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
		dialog.querySelectorAll(
			'input.agP, input[role="combobox"], div[name="to"] input, input[peoplekit-id]',
		),
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

	// Helpers to inspect attachment upload state in the compose dialog
	function getAttachmentSnapshot(scope, expectedName = "") {
		const root = scope || document;
		const attachInputs = Array.from(
			root.querySelectorAll('input[name="attach"]'),
		).filter((el) => (el.value || "").trim().length > 0);

		const chips = Array.from(
			root.querySelectorAll(
				'.dL, .aZo, [aria-label*="Attachment" i], [aria-label*="附件"]',
			),
		);

		const rawProgress = Array.from(
			root.querySelectorAll(
				'.dL [role="progressbar"], .dL .dQ, .GM [role="progressbar"], .GM .dQ, .fX [role="progressbar"], .fX .dQ, [role="progressbar"]',
			),
		);
		const activeProgress = rawProgress.filter((el) => {
			if (!isElementVisible(el)) return false;
			const now = el.getAttribute("aria-valuenow");
			if (now !== null && now !== "" && Number(now) >= 100) {
				const parentChip = el.closest(".dL");
				if (
					parentChip &&
					!parentChip.querySelector(
						'a.vI[href], a[href], input[name="attach"]:not([value=""])',
					)
				) {
					return true;
				}
				return false;
			}
			return true;
		});

		const normName = expectedName.trim().toLowerCase();
		const matchingChip = normName
			? chips.find((c) =>
					(
						(c.textContent || "") +
						" " +
						(c.getAttribute("aria-label") || "")
					)
						.toLowerCase()
						.includes(normName),
				)
			: chips[chips.length - 1] || null;

		const isChipComplete = (chip) => {
			if (!chip) return false;
			const chipProg = Array.from(
				chip.querySelectorAll('[role="progressbar"], .dQ, .oa'),
			).filter(isElementVisible);
			if (chipProg.length > 0) return false;
			const hasLink = !!chip.querySelector("a.vI[href], a[href]");
			const hasAttachInput = Array.from(
				chip.querySelectorAll('input[name="attach"]'),
			).some((i) => (i.value || "").trim().length > 0);
			return hasLink || hasAttachInput;
		};

		return {
			attachInputs,
			chips,
			activeProgress,
			matchingChip,
			matchingChipComplete: isChipComplete(matchingChip),
			allChipsComplete:
				chips.length > 0 && chips.every((c) => isChipComplete(c)),
		};
	}

	function findFileInput(scope) {
		const local = scope.querySelectorAll(
			'input[type="file"][name="Filedata"], input[type="file"]',
		);
		if (local.length > 0) return local[local.length - 1];
		const global = document.querySelectorAll(
			'input[type="file"][name="Filedata"], input[type="file"]',
		);
		if (global.length > 0) return global[global.length - 1];
		return null;
	}

	function triggerAttachButton(scope) {
		const btn =
			scope.querySelector(
				'div[command="Files"], .a1.aaA.aMZ, [aria-label*="Attach" i], [data-tooltip*="Attach" i], [aria-label*="附件"], [data-tooltip*="附件"]',
			) ||
			document.querySelector(
				'div[command="Files"], .a1.aaA.aMZ, [aria-label*="Attach" i], [data-tooltip*="Attach" i], [aria-label*="附件"], [data-tooltip*="附件"]',
			);
		if (!btn) return null;
		let captured = null;
		const origClick = HTMLInputElement.prototype.click;
		HTMLInputElement.prototype.click = function () {
			if (this && this.type === "file") {
				captured = this;
				return;
			}
			return origClick.apply(this, arguments);
		};
		try {
			btn.dispatchEvent(new MouseEvent("mouseover", { bubbles: true }));
			btn.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
			btn.dispatchEvent(new MouseEvent("mouseup", { bubbles: true }));
			btn.click();
		} finally {
			HTMLInputElement.prototype.click = origClick;
		}
		return captured;
	}

	function buildAttachmentBlob(content, mimeType) {
		try {
			const trimmed = content.trim();
			const b64Payload = trimmed.replace(/^data:[^;]*;base64,/i, "");
			const compact = b64Payload.replace(/\s+/g, "");
			const looksBase64 =
				compact.length > 0 &&
				compact.length % 4 === 0 &&
				/^[A-Za-z0-9+/]+={0,2}$/.test(compact) &&
				(/^data:[^;]*;base64,/i.test(trimmed) ||
					compact.length > 20 ||
					!/^text\//i.test(mimeType));
			if (looksBase64) {
				const binStr = atob(compact);
				const len = binStr.length;
				const bytes = new Uint8Array(len);
				for (let i = 0; i < len; i++) {
					bytes[i] = binStr.charCodeAt(i);
				}
				return new Blob([bytes], { type: mimeType });
			}
		} catch {}
		return new Blob([content], { type: mimeType });
	}

	function dispatchFileToInput(fileInput, file) {
		const dt = new DataTransfer();
		dt.items.add(file);
		fileInput.files = dt.files;
		fileInput.dispatchEvent(new Event("input", { bubbles: true }));
		fileInput.dispatchEvent(new Event("change", { bubbles: true }));
	}

	function dispatchFileDropFallback(editorEl, file) {
		if (!editorEl) return;
		try {
			const dt = new DataTransfer();
			dt.items.add(file);
			for (const type of ["dragenter", "dragover", "drop"]) {
				editorEl.dispatchEvent(
					new DragEvent(type, {
						bubbles: true,
						cancelable: true,
						dataTransfer: dt,
					}),
				);
			}
		} catch {}
	}

	// 6. Handle attachment if provided
	let attached = false;
	if (attachName && attachContent) {
		const baseline = getAttachmentSnapshot(dialog, attachName);
		const baseInputCount = baseline.attachInputs.length;
		const baseChipCount = baseline.chips.length;

		const fileBlob = buildAttachmentBlob(attachContent, attachType);
		const file = new File([fileBlob], attachName, { type: attachType });

		let fileInput = findFileInput(dialog) || triggerAttachButton(dialog);
		if (!fileInput) {
			fileInput = await waitFor(() => findFileInput(dialog), 2000);
		}
		if (fileInput) {
			dispatchFileToInput(fileInput, file);
		} else {
			dispatchFileDropFallback(bodyEditor, file);
		}

		const hasUploadStarted = () => {
			const snap = getAttachmentSnapshot(dialog, attachName);
			return (
				snap.activeProgress.length > 0 ||
				snap.attachInputs.length > baseInputCount ||
				snap.chips.length > baseChipCount ||
				snap.matchingChip != null
			);
		};

		// Wait for Gmail to register the attachment and start uploading;
		// if the initial input did not trigger, activate the attach button or drop on the editor.
		let started = !!(await waitFor(hasUploadStarted, 2000));
		if (!started) {
			const freshInput = triggerAttachButton(dialog) || findFileInput(dialog);
			if (freshInput) {
				dispatchFileToInput(freshInput, file);
			}
			started = !!(await waitFor(hasUploadStarted, 1500));
		}
		if (!started) {
			dispatchFileDropFallback(bodyEditor, file);
			started = !!(await waitFor(hasUploadStarted, 2500));
		}

		// Wait until the attachment finishes uploading and is bound to the draft
		let sawProgress = false;
		let chipStableSince = 0;
		const uploadCompleted = await waitFor(() => {
			const snap = getAttachmentSnapshot(dialog, attachName);
			if (snap.activeProgress.length > 0) {
				sawProgress = true;
				chipStableSince = 0;
				return false;
			}
			const hasNewInput = snap.attachInputs.length > baseInputCount;
			const hasNewChip =
				snap.chips.length > baseChipCount || snap.matchingChip != null;
			if (!hasNewInput && !hasNewChip) {
				return false;
			}
			if (
				hasNewInput ||
				snap.matchingChipComplete ||
				snap.allChipsComplete ||
				(sawProgress && hasNewChip)
			) {
				return true;
			}
			if (!chipStableSince) {
				chipStableSince = Date.now();
			}
			return Date.now() - chipStableSince >= 1500;
		}, 30000);

		if (!uploadCompleted) {
			return {
				account: getAccount(),
				sent: false,
				to: toParam,
				subject: subjectParam,
				hasAttachment: false,
				error: started
					? "Attachment upload did not complete before timeout"
					: "Attachment could not be added to compose dialog",
			};
		}

		// Allow Gmail's compose controller to commit the uploaded attachment ID to the draft
		await sleep(1200);
		await waitFor(
			() => getAttachmentSnapshot(dialog, attachName).activeProgress.length === 0,
			5000,
		);
		attached = true;
	} else {
		// Even if attachment args were not passed (e.g. attached earlier via `ap-browser upload`),
		// wait for any in-flight attachment upload in the compose dialog before clicking Send.
		const preSnap = getAttachmentSnapshot(dialog);
		if (
			preSnap.activeProgress.length > 0 ||
			(preSnap.chips.length > 0 && !preSnap.allChipsComplete)
		) {
			let chipStableSince = 0;
			await waitFor(() => {
				const snap = getAttachmentSnapshot(dialog);
				if (snap.activeProgress.length > 0) {
					chipStableSince = 0;
					return false;
				}
				if (snap.allChipsComplete || snap.attachInputs.length > 0) {
					return true;
				}
				if (!chipStableSince) chipStableSince = Date.now();
				return Date.now() - chipStableSince >= 1500;
			}, 30000);
			await sleep(1200);
		}
		const finalSnap = getAttachmentSnapshot(dialog);
		if (finalSnap.attachInputs.length > 0 || finalSnap.chips.length > 0) {
			attached = true;
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

	// Wait for compose dialog to dismiss or sent toast to appear
	await waitFor(
		() => !dialog.isConnected || !isElementVisible(dialog),
		10000,
	);
	await sleep(500);

	return {
		account: getAccount(),
		sent: true,
		to: toParam,
		subject: subjectParam,
		hasAttachment: attached,
		status: "sent",
	};
})();
