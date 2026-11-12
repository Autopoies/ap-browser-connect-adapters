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
	window.__apbGdocsRun = { cmd: 'mode', mode: pickMode("{{args.set}}", ['suggest', 'edit', 'view']) };
	return { cmd: window.__apbGdocsRun.cmd };
})()
