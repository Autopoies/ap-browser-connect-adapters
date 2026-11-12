(() => {
	const id = sessionStorage.getItem('__apbGdocsTarget');
	return !!id && location.pathname.includes(`/d/${id}/`) &&
		document.readyState === 'complete' &&
		!!document.querySelector('.kix-appview-editor canvas') &&
		!!document.querySelector('#docs-edit-menu') &&
		!!document.querySelector('.docs-title-input') &&
		!!document.querySelector('iframe.docs-texteventtarget-iframe') &&
		/(?:^|\s)(edit|suggest|view)-mode(?:\s|$)/.test(document.querySelector('#docs-toolbar-mode-switcher')?.className || 'view-mode');
})()
