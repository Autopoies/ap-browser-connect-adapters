(async () => {
	const G = window.__apbGdocs;
	const single = (name, value) => {
		if (!value) G.fail('BAD_ARG', `--${name} must not be empty`);
		if (/[\r\n]/.test(value)) G.fail('BAD_ARG', `--${name} must be a single line (matching cannot span paragraphs)`);
		if (value !== value.trim()) G.fail('BAD_ARG', `--${name} must not start or end with whitespace`);
		return value;
	};
	const pickMode = (value, allowed) => {
		const mode = (value.trim() || 'suggest').toLowerCase();
		if (!allowed.includes(mode)) G.fail('BAD_ARG', `mode must be one of: ${allowed.join(', ')}`);
		return mode;
	};
	const text = "{{args.text}}".replace(/\r\n?/g, '\n');
	if (!text.trim()) G.fail('BAD_ARG', '--text must not be blank');
	window.__apbGdocsRun = {
		cmd: 'insert',
		find: single('after', "{{args.after}}"),
		text,
		html: "{{args.html}}" === 'true',
		mode: pickMode("{{args.mode}}", ['suggest', 'edit']),
		requireMatch: true,
		requireUnique: true,
	};
	return { cmd: window.__apbGdocsRun.cmd };
})()
