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
	const pickMode = (value, allowed) => {
		const mode = (value.trim() || 'suggest').toLowerCase();
		if (!allowed.includes(mode)) G.fail('BAD_ARG', `mode must be one of: ${allowed.join(', ')}`);
		return mode;
	};
	const replacement = "{{args.with}}";
	const remove = "{{args.delete}}" === 'true';
	if (remove && replacement) G.fail('BAD_ARG', 'pass either --with or --delete, not both');
	if (!remove && !replacement) G.fail('BAD_ARG', '--with is required (use --delete to remove the match)');
	if (/[\r\n]/.test(replacement)) {
		G.fail('BAD_ARG', regex ? '--with must not contain raw newlines (use \\n escape in --regex mode)' : '--with must be a single line; use insert for multi-paragraph text or pass --regex true with \\n');
	}
	window.__apbGdocsRun = {
		cmd: 'replace',
		regex,
		find: single('find', "{{args.find}}"),
		with: replacement,
		all: "{{args.all}}" === 'true',
		mode: pickMode("{{args.mode}}", ['suggest', 'edit']),
		requireMatch: true,
		requireUnique: "{{args.all}}" !== 'true',
	};
	return { cmd: window.__apbGdocsRun.cmd };
})()
