(async () => {
	const targetId = "{{args.id}}".trim();
	const bodyParam = "{{args.body}}";
	const replyAll = "{{args.reply_all}}" === "true";
	const attachName = "{{args.attachment_name}}".trim();
	const attachContent = "{{args.attachment_content}}";
	const attachType = "{{args.attachment_type}}".trim() || "text/plain";
	const safety = window.__apbGmail;
	if (!!attachName !== !!attachContent) throw new Error("Gmail preflight: attachment name and content must both be supplied");

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

	function isElementVisible(el) {
		if (!el || !el.isConnected || window.getComputedStyle(el).visibility === "hidden") return false;
		let cur = el;
		while (cur && cur.nodeType === 1) {
			if (cur.hidden || cur.getAttribute("aria-hidden") === "true") {
				return false;
			}
			const style = window.getComputedStyle(cur);
			if (
				style.display === "none" ||
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

	// 1. If targetId is specified, navigate to it
	if (targetId) {
		const previousHash = window.location.hash;
		const previousHeader = safety.threadHeader();
		const previousText = previousHeader?.textContent;
		let requestedHash = '';
		if (/^\d+$/.test(targetId)) {
			const row = [...document.querySelectorAll('tr.zA')].filter(safety.visible)[Number(targetId) - 1];
			if (!row) throw new Error("Gmail preflight: requested reply row not found");
			row.click();
		} else {
			const cleanId = targetId.replace(/^#/, '');
			requestedHash = '#' + (cleanId.includes('/') ? cleanId : 'all/' + cleanId);
			window.location.hash = requestedHash;
		}
		const loaded = await waitFor(() => {
			const header = safety.threadHeader();
			const routeMatches = requestedHash ? window.location.hash === requestedHash : window.location.hash !== previousHash;
			const viewChanged = header && (header !== previousHeader || header.textContent !== previousText);
			return routeMatches && header && (requestedHash === previousHash || viewChanged);
		}, 10000);
		if (!loaded) throw new Error("Gmail preflight: requested reply thread did not finish loading");
	}

	// 2. Find reply trigger
	let replyTrigger = null;
	if (replyAll) {
		replyTrigger = [...document.querySelectorAll(
			'span.ams.bkI, [aria-label*="Reply all"], [data-tooltip*="Reply all"], [aria-label*="全部回复"]',
		)].filter(safety.visible).pop();
	}
	if (replyAll && !replyTrigger) throw new Error("Gmail preflight: Reply all is unavailable");
	if (!replyTrigger) {
		replyTrigger = [...document.querySelectorAll(
			'span.ams.bkH, [aria-label="Reply"], [data-tooltip="Reply"], [aria-label="回复"]',
		)].filter(safety.visible).pop();
	}

	if (replyTrigger) {
		replyTrigger.scrollIntoView({ behavior: "smooth", block: "center" });
		replyTrigger.click();
	}

	// 3. Wait for editor
	const editor = await waitFor(
		() => Array.from(document.querySelectorAll('[contenteditable="true"][g_editable="true"]'))
			.filter(el => !el.closest('div[role="dialog"]') && safety.visible(el)).pop(),
		6000,
	);

	if (!editor) throw new Error("Gmail preflight: reply editor could not be opened");

	const replyScope = editor.closest('div.ip, div.AD, div[role="dialog"]') ||
		editor.closest('div.M9, table.aoP');
	if (!replyScope) throw new Error("Gmail preflight: reply container not found");
	// Expand Gmail's collapsed recipient summary so the actual To/Cc/Bcc
	// chips, not display names, can be snapshotted before attachment upload.
	if (!safety.recipients(replyScope).to.length) {
		replyScope.querySelector('.aoD, .az6')?.click();
		await waitFor(() => safety.recipients(replyScope).to.length, 3000);
	}
	const originalRecipients = safety.recipients(replyScope);
	if (!originalRecipients.to.length || originalRecipients.pending.length || originalRecipients.unclassified.length) {
		throw new Error("Gmail preflight: reply recipients could not be verified");
	}
	const expected = {
		to: originalRecipients.to, cc: originalRecipients.cc, bcc: originalRecipients.bcc,
		subject: replyScope.querySelector('input[name="subjectbox"]')?.value ??
			(safety.threadHeader()?.textContent?.trim() || ''),
		threadSubject: safety.threadHeader()?.textContent?.trim() || '',
		threadHash: window.location.hash, body: bodyParam,
	};
	if (!safety.threadHeader()) throw new Error("Gmail preflight: reply subject not found or ambiguous");
	// reply.yaml enters the body through the same native fill path as the CLI.

	// Helpers to inspect attachment upload state in the reply container
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

	// 5. Handle attachment if provided
	let attached = false;
	if (attachName && attachContent) {
		const baseline = getAttachmentSnapshot(replyScope, attachName);
		const baseInputCount = baseline.attachInputs.length;
		const baseChipCount = baseline.chips.length;

		const fileBlob = buildAttachmentBlob(attachContent, attachType);
		const file = new File([fileBlob], attachName, { type: attachType });

		let fileInput =
			findFileInput(replyScope) || triggerAttachButton(replyScope);
		if (!fileInput) {
			fileInput = await waitFor(() => findFileInput(replyScope), 2000);
		}
		if (fileInput) {
			dispatchFileToInput(fileInput, file);
		} else {
			dispatchFileDropFallback(editor, file);
		}

		const hasUploadStarted = () => {
			const snap = getAttachmentSnapshot(replyScope, attachName);
			return (
				snap.activeProgress.length > 0 ||
				snap.attachInputs.length > baseInputCount ||
				snap.chips.length > baseChipCount ||
				snap.matchingChip != null
			);
		};

		let started = !!(await waitFor(hasUploadStarted, 2000));
		if (!started) {
			const freshInput =
				triggerAttachButton(replyScope) || findFileInput(replyScope);
			if (freshInput) {
				dispatchFileToInput(freshInput, file);
			}
			started = !!(await waitFor(hasUploadStarted, 1500));
		}
		if (!started) {
			dispatchFileDropFallback(editor, file);
			started = !!(await waitFor(hasUploadStarted, 2500));
		}

		const uploadCompleted = await waitFor(() => {
			const snap = getAttachmentSnapshot(replyScope, attachName);
			return snap.activeProgress.length === 0 && snap.matchingChipComplete;
		}, 30000);

		if (!uploadCompleted) {
			throw new Error(started
				? "Gmail preflight: attachment upload did not complete before timeout"
				: "Gmail preflight: attachment could not be added to reply editor");
		}

		attached = true;
	} else {
		const preSnap = getAttachmentSnapshot(replyScope);
		if (
			preSnap.activeProgress.length > 0 ||
			(preSnap.chips.length > 0 && !preSnap.allChipsComplete)
		) {
			const ready = await waitFor(() => {
				const snap = getAttachmentSnapshot(replyScope);
				return snap.activeProgress.length === 0 && snap.allChipsComplete;
			}, 30000);
			if (!ready) throw new Error("Gmail preflight: existing attachment upload did not complete");
		}
		const finalSnap = getAttachmentSnapshot(replyScope);
		if (finalSnap.attachInputs.length > 0 || finalSnap.chips.length > 0) {
			attached = true;
		}
	}

	safety.stage(replyScope, editor, expected, {
		account: getAccount(), threadId: window.location.hash.replace(/^#/, ''),
		subject: expected.subject, replyAll, hasAttachment: attached,
	}, () => {
		const snap = getAttachmentSnapshot(replyScope, attachName);
		return snap.activeProgress.length === 0 &&
			(!attached || (attachName ? snap.matchingChipComplete : snap.allChipsComplete));
	});
	return { sent: false, status: "prepared" };
})();
