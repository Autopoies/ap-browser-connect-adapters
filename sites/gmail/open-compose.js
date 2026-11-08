(async () => {
	const safety = window.__apbGmail;
	if (document.hidden) {
		throw new Error('Gmail preflight: send requires a foreground tab; open Gmail without --silent and retry with --tab');
	}
	const dialogs = () => [...document.querySelectorAll('div[role="dialog"]')]
		.filter(el => el.querySelector('input[name="subjectbox"]'));
	if (!dialogs().length) window.location.hash = '#inbox?compose=new';
	const found = await safety.waitFor(() => dialogs().length && dialogs(), 10000);
	if (!found || found.length !== 1) throw new Error('Gmail preflight: expected exactly one compose dialog');
	const dialog = found[0];
	const editor = dialog.querySelector('[contenteditable="true"]');

	// Gmail currently emits no click from ap-browser's native mouse sequence.
	// Use Gmail-specific synthetic activation instead. Keep native fill for
	// values, but do not route Gmail controls through the generic click path.
	if (!safety.visible(editor)) {
		const expand = dialog.querySelector('.aYF, [aria-label="Maximize"]');
		if (!expand) throw new Error('Gmail preflight: compose expansion target unavailable');
		expand.click();
		if (!await safety.waitFor(() => safety.visible(editor), 5000)) {
			throw new Error('Gmail preflight: compose fields are not visible');
		}
	}
	for (const kind of ['cc', 'bcc']) {
		let input = safety.recipientInput(dialog, kind);
		if (!safety.visible(input)) {
			const target = dialog.querySelector(kind === 'cc' ? '.pE' : '.pB');
			if (!target) throw new Error(`Gmail preflight: ${kind} expansion target unavailable`);
			// These role=link controls ignore element.click() but honor Enter.
			for (const type of ['keydown', 'keypress', 'keyup']) {
				target.dispatchEvent(new KeyboardEvent(type, {
					key: 'Enter', code: 'Enter', keyCode: 13, which: 13,
					bubbles: true, cancelable: true,
				}));
			}
			if (!await safety.waitFor(() => {
				input = safety.recipientInput(dialog, kind);
				return safety.visible(input);
			}, 5000)) throw new Error(`Gmail preflight: ${kind} input is not visible`);
		}
	}
	safety.compose = dialog;
	return { sent: false, status: 'opening_compose' };
})();
