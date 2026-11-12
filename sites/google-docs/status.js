(async () => {
	const G = window.__apbGdocs;
	if (!G.onPage) {
		return { ...G.base(), open: false, note: 'Document is not open in the operated tab; read/outline/comments still work by ID, writes need the tab.' };
	}
	const live = G.cards();
	const tabs = [...document.querySelectorAll('.chapter-item-label-and-buttons-container')].map((el) => ({
		name: G.squash(el.querySelector('.chapter-item-label')?.textContent),
		selected: el.classList.contains('chapter-item-label-and-buttons-container-selected'),
	})).filter((tab) => tab.name);
	return {
		...G.base(),
		open: true,
		mode: G.mode(),
		editable: !!document.querySelector('#docs-toolbar-mode-switcher') && !!G.editorTarget(),
		saved: G.saved(),
		tab: G.page.tab,
		tabs,
		comment_threads: live.filter((card) => card.kind === 'comment').length,
		pending_suggestions: live.filter((card) => card.kind === 'suggestion').length,
		visible: !document.hidden,
	};
})()
