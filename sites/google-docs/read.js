(async () => {
	const G = window.__apbGdocs;
	const format = ("{{args.as}}".trim() || 'markdown').toLowerCase();
	if (!['markdown', 'text', 'blocks'].includes(format)) G.fail('BAD_ARG', '--as must be markdown, text, or blocks');
	const preserveWs = "{{args.preserve_ws}}" === 'true';
	const maxChars = Math.min(Math.max(Number("{{args.max_chars}}") || 0, 0), 500000) || 100000;
	const section = "{{args.section}}".trim().toLowerCase();
	const tab = "{{args.doc_tab}}".trim() || G.target?.tab || (G.onPage ? G.page.tab : '');
	const doc = await G.fetchExport(tab);
	let list = G.blocks(doc, {
		md: format === 'markdown',
		preserveWs: preserveWs || format === 'blocks',
		includeEmpty: preserveWs || format === 'blocks',
	});
	let matched = '';
	if (section) {
		const start = list.findIndex((b) => b.type === 'heading' && b.text.toLowerCase().includes(section));
		if (start < 0) {
			return { ...G.base(), title: G.base().title || doc.title, tab, status: 'section_not_found', section: "{{args.section}}", headings: list.filter((b) => b.type === 'heading').map((b) => b.text) };
		}
		const level = list[start].level;
		let end = list.findIndex((b, i) => i > start && b.type === 'heading' && b.level <= level);
		if (end < 0) end = list.length;
		matched = list[start].text;
		list = list.slice(start, end);
	}
	const full = format === 'blocks'
		? JSON.stringify(list, null, 2)
		: G.render(list, format, { preserveWs });
	return {
		...G.base(),
		title: G.base().title || doc.title || '',
		tab,
		format,
		section: matched,
		chars: full.length,
		truncated: full.length > maxChars,
		content: full.slice(0, maxChars),
	};
})()
