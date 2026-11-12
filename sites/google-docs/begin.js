(async () => {
	// Shared write preflight, run after the command's init step.
	const G = window.__apbGdocs;
	const R = window.__apbGdocsRun;
	if (!R) G.fail('INTERNAL', 'run state missing');
	// A freshly loaded editor reports ready before its menus are wired up.
	if (sessionStorage.getItem('__apbGdocsFresh')) {
		sessionStorage.removeItem('__apbGdocsFresh');
		await G.sleep(2500);
	}
	G.requireEditor();
	if (G.openMenuItems().length) G.fail('BUSY_UI', 'a menu is open in the document tab; close it and retry');
	const draft = document.querySelector('.docos-draftdiscussionview-input-pane .docos-input-textarea');
	if (draft && G.shown(draft)) G.fail('BUSY_UI', 'an unsent comment draft is open in the document tab; post or cancel it and retry');
	R.previous_mode = G.mode();
	return { ready: true, mode: R.previous_mode };
})()
