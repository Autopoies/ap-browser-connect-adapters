(async () => {
	const safety = window.__apbGmail;
	const dialogs = () => [...document.querySelectorAll('div[role="dialog"]')]
		.filter(el => el.querySelector('input[name="subjectbox"]'));
	if (!dialogs().length) window.location.hash = '#inbox?compose=new';
	const found = await safety.waitFor(() => dialogs().length && dialogs(), 10000);
	if (!found || found.length !== 1) throw new Error('Gmail preflight: expected exactly one compose dialog');
	const dialog = found[0];
	const editor = dialog.querySelector('[contenteditable="true"]');
	const expand = safety.visible(editor) ? dialog.querySelector('input[name="subjectbox"]') : dialog.querySelector('.aYF');
	if (!expand) throw new Error('Gmail preflight: compose expansion target unavailable');
	expand.setAttribute('data-apb-gmail-expand', '');
	for (const kind of ['cc', 'bcc']) {
		const input = safety.recipientInput(dialog, kind);
		const target = safety.visible(input) ? input : dialog.querySelector(kind === 'cc' ? '.pE' : '.pB');
		if (!target) throw new Error(`Gmail preflight: ${kind} expansion target unavailable`);
		target.setAttribute(`data-apb-gmail-${kind}-toggle`, '');
	}
	safety.compose = dialog;
	return { sent: false, status: 'opening_compose' };
})();
