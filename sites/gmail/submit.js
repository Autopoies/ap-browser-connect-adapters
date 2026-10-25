(async () => {
	const safety = window.__apbGmail;
	const state = safety?.pending;
	if (!state) return { sent: false, status: 'validation_failed', error: 'No prepared Gmail compose' };
	// Consume once, including on failure. Re-evaluating submit.js must never
	// click Send twice after an uncertain response.
	safety.pending = null;
	const { scope, editor, expected, result, attachmentReady } = state;
	const finish = (details) => ({ ...result, ...details });
	try {
		// Native Enter can commit PeopleKit chips asynchronously. Wait for exact
		// header equality, then read every field again immediately before Send.
		await safety.waitFor(() => {
			const headers = safety.recipients(scope);
			return !headers.pending.length && !headers.unclassified.length &&
				['to', 'cc', 'bcc'].every(kind => JSON.stringify(headers[kind]) === JSON.stringify(expected[kind]));
		}, 4000);
		const actual = safety.recipients(scope);
		const subject = scope.querySelector('input[name="subjectbox"]')?.value ??
			safety.threadHeader()?.textContent?.trim();
		const mismatches = ['to', 'cc', 'bcc'].filter(kind =>
			JSON.stringify(actual[kind]) !== JSON.stringify(expected[kind]));
		if (actual.pending.length || actual.unclassified.length) mismatches.push('uncommitted/unclassified recipients');
		if (subject !== expected.subject) mismatches.push('subject');
		if (expected.threadSubject !== undefined && safety.threadHeader()?.textContent?.trim() !== expected.threadSubject) mismatches.push('thread subject');
		if (expected.threadHash !== undefined && window.location.hash !== expected.threadHash) mismatches.push('thread route');
		if (safety.bodyText(editor) !== expected.body.replace(/\r\n?/g, '\n')) mismatches.push('body');
		if (!safety.visible(editor) || !scope.isConnected) mismatches.push('compose visibility');
		if (!attachmentReady()) mismatches.push('attachment upload');
		if (mismatches.length) return finish({
			sent: false, status: 'validation_failed',
			error: `Gmail preflight mismatch: ${mismatches.join(', ')}. Send was not clicked.`,
		});

		const send = scope.querySelector('div.aoO.v7, div.T-I.J-J5-Ji.aoO, div[role="button"][data-tooltip^="Send"]');
		if (!safety.visible(send) || send.getAttribute('aria-disabled') === 'true') {
			return finish({ sent: false, status: 'validation_failed', error: 'Scoped Send button is unavailable' });
		}
		// Only Gmail's notification surface counts. Never accept a message
		// body saying "Message sent", nor an unchanged toast from an older send.
		const notifications = () => [...document.querySelectorAll('.bAq .vh, [role="alert"], [role="status"]')]
			.filter(el => {
				if (!safety.visible(el) || el.closest('.a3s, [contenteditable="true"]') || scope.contains(el)) return false;
				// Gmail's offscreen aria-live mirror retains old toast text. It
				// is not a visible post-undo confirmation.
				const rect = el.getBoundingClientRect();
				return rect.width > 0 && rect.height > 0 && rect.bottom > 0 && rect.top < window.innerHeight;
			});
		const before = new Map(notifications().map(el => [el, el.innerHTML]));
		const submittedAt = Date.now();
		let freshToast = null;
		let sawUndo = false;
		const sentText = /(?:^|\s)Message sent(?:[.\s]|$)|邮件已发送|邮件已寄出/u;
		const undoText = /\bUndo\b|撤消|撤销/u;
		send.click();
		const evidence = await safety.waitFor(() => {
			if (safety.visible(editor)) return false;
			for (const el of notifications()) {
				const text = (el.innerText ?? el.textContent ?? '').trim();
				if (!sentText.test(text)) continue;
				if (!freshToast && before.get(el) === el.innerHTML) continue;
				if (freshToast && freshToast !== el) continue;
				freshToast = el;
				const undo = undoText.test(text);
				if (undo) sawUndo = true;
				// Observing Undo disappear while Message sent remains proves the
				// configured undo window ended. If Undo was never observable,
				// require a current confirmation beyond Gmail's maximum 30s.
				if (!undo && ((sawUndo && Date.now() - submittedAt >= 5000) || Date.now() - submittedAt >= 35000)) {
					return { type: 'gmail_message_sent_after_undo', waitedMs: Date.now() - submittedAt };
				}
			}
			return false;
		}, 45000);
		if (!evidence) return finish({
			sent: false, status: 'send_unconfirmed', retrySafe: false,
			error: 'Send was clicked, but no fresh post-undo Gmail confirmation was observed.',
			hint: 'Keep this tab open and inspect Sent or the received message. Do not automatically resend.',
		});
		return finish({ sent: true, status: 'sent', confirmation: evidence, verified: ['to', 'cc', 'bcc', 'subject', 'body'] });
	} finally {
		safety.clearTargets();
	}
})();
