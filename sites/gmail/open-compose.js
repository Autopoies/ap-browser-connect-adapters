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
	let editor = dialog.querySelector('[contenteditable="true"]');
	const editorReady = () => {
		editor = dialog.querySelector('[contenteditable="true"]');
		return safety.visible(editor);
	};

	// Gmail currently emits no click from ap-browser's native mouse sequence.
	// Use Gmail-specific synthetic activation instead. Keep native fill for
	// values, but do not route Gmail controls through the generic click path.
	// During cold startup the first activation can be ignored. Retry only the
	// still-minimized compose/header, never Send, with a bounded 10s budget.
	const expandDeadline = Date.now() + 10000;
	while (!editorReady() && Date.now() < expandDeadline) {
		// The title can remain inert during startup; the real Maximize button
		// accepts a scoped click once focused.
		const expand = dialog.querySelector('button[aria-label="Maximize"]') || dialog.querySelector('.aYF');
		if (!expand) throw new Error('Gmail preflight: compose expansion target unavailable');
		expand.focus();
		expand.click();
		await safety.waitFor(editorReady, 1000);
	}
	if (!editorReady()) throw new Error('Gmail preflight: compose fields are not visible');

	for (const kind of ['cc', 'bcc']) {
		let input = safety.recipientInput(dialog, kind);
		const inputReady = () => {
			input = safety.recipientInput(dialog, kind);
			return safety.visible(input);
		};
		const headerDeadline = Date.now() + 10000;
		while (!inputReady() && Date.now() < headerDeadline) {
			const target = dialog.querySelector(kind === 'cc' ? '.pE' : '.pB');
			if (!target) throw new Error(`Gmail preflight: ${kind} expansion target unavailable`);
			// These role=link controls ignore element.click() but honor Enter.
			target.focus();
			for (const type of ['keydown', 'keypress', 'keyup']) {
				target.dispatchEvent(new KeyboardEvent(type, {
					key: 'Enter', code: 'Enter', keyCode: 13, which: 13,
					bubbles: true, cancelable: true,
				}));
			}
			await safety.waitFor(inputReady, 1000);
		}
		if (!inputReady()) throw new Error(`Gmail preflight: ${kind} input is not visible`);
	}
	safety.compose = dialog;
	return { sent: false, status: 'opening_compose' };
})();
