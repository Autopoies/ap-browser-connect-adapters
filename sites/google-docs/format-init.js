(async () => {
	const G = window.__apbGdocs;
	const on = "{{args.on}}";
	if (!on || /[\r\n]/.test(on) || on !== on.trim()) G.fail('BAD_ARG', '--on must be a non-empty single line without surrounding whitespace');
	const mode = ("{{args.mode}}".trim() || 'suggest').toLowerCase();
	if (!['suggest', 'edit'].includes(mode)) G.fail('BAD_ARG', 'mode must be one of: suggest, edit');
	const queue = [];
	if ("{{args.clear}}" === 'true') queue.push({ prop: 'clear', button: '#clearFormattingButton' });
	// Order matters: a paragraph style resets font and size, so it goes first.
	const style = "{{args.style}}".trim().toLowerCase();
	const STYLES = ['normal', 'title', 'subtitle', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
	if (style) {
		if (!STYLES.includes(style)) G.fail('BAD_ARG', `--style must be one of: ${STYLES.join(', ')}`);
		queue.push({ prop: 'style', button: '#headingStyleSelect', menu: 'style', index: STYLES.indexOf(style), value: style });
	}
	const font = "{{args.font}}".trim();
	if (font) queue.push({ prop: 'font', button: '#docs-font-family', menu: 'font', value: font });
	const size = "{{args.size}}".trim();
	if (size) {
		if (!/^\d{1,2}$/.test(size)) G.fail('BAD_ARG', '--size must be a whole number from the size menu (8 9 10 11 12 14 18 24 30 36 48 60 72 96)');
		queue.push({ prop: 'size', button: '#fontSizeSelect', menu: 'size', value: size });
	}
	const toggle = (prop, button, raw) => {
		const value = raw.trim().toLowerCase();
		if (!value) return;
		if (!['true', 'false'].includes(value)) G.fail('BAD_ARG', `--${prop} must be true or false`);
		queue.push({ prop, button, toggle: true, want: value === 'true' });
	};
	toggle('bold', '#boldButton', "{{args.bold}}");
	toggle('italic', '#italicButton', "{{args.italic}}");
	toggle('underline', '#underlineButton', "{{args.underline}}");
	const color = (prop, button, raw) => {
		const value = raw.trim().toLowerCase();
		if (!value) return;
		if (value !== 'none' && !/^#?[0-9a-f]{6}$/.test(value)) G.fail('BAD_ARG', `--${prop} must be a 6-digit hex color such as #fff2cc, or none`);
		queue.push({ prop, button, color: value === 'none' ? 'none' : value.replace('#', '') });
	};
	color('text_color', '#textColorButton', "{{args.text_color}}");
	color('highlight', '#bgColorButton', "{{args.highlight}}");
	color('cell_color', '#cellColorMenuButton', "{{args.cell_color}}");
	if (!queue.length) G.fail('BAD_ARG', 'nothing to format: pass at least one of --style --font --size --bold --italic --underline --text_color --highlight --cell_color --clear');
	window.__apbGdocsRun = { cmd: 'format', find: on, mode, queue, done: [], requireMatch: true, requireUnique: true };
	return { cmd: 'format', actions: queue.length };
})()
