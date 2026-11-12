(async () => {
	const G = window.__apbGdocs;
	const regex = "{{args.regex}}" === 'true';
	const single = (name, value) => {
		if (!value) G.fail('BAD_ARG', `--${name} must not be empty`);
		if (/[\r\n]/.test(value)) {
			G.fail('BAD_ARG', `--${name} must not contain raw newlines (pass --regex true with \\n escape to match across paragraphs)`);
		}
		if (!regex && !value.trim()) {
			G.fail('BAD_ARG', `--${name} must not be blank (pass --regex true to match whitespace)`);
		}
		return value;
	};
	window.__apbGdocsRun = { cmd: 'find', regex, find: single('text', "{{args.text}}") };
	return { cmd: window.__apbGdocsRun.cmd };
})()
