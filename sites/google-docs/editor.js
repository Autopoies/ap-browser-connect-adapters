(async () => {
	// Write preamble. Writes need the live editor, so the document must be the
	// page in the operated tab. A tab showing a *different* document is never
	// navigated away (it may be the user's); only a non-document page (the
	// Docs home an auto-opened tab lands on) is sent to the target.
	const G = window.__apbGdocs;
	window.__apbGdocsRun = null;
	sessionStorage.setItem('__apbGdocsTarget', G.docId);
	sessionStorage.removeItem('__apbGdocsFresh');
	if (G.onPage) return { navigating: false };
	if (G.page.kind === 'document' && G.page.id) {
		G.fail('DOC_MISMATCH', `the operated tab shows document ${G.page.id}, not ${G.docId}; open the target in its own tab and pass --tab <id>`);
	}
	sessionStorage.setItem('__apbGdocsFresh', '1');
	location.assign(`https://docs.google.com/document/d/${G.docId}/edit${G.target?.tab ? `?tab=${encodeURIComponent(G.target.tab)}` : ''}`);
	return { navigating: true };
})()
