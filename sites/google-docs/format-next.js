(async () => {
	// One formatting stage per call; the following native click presses
	// whatever this tags. Stages: a toggle/clear button, a color button
	// (opens its palette), then the palette swatch. When the queue is empty an
	// inert toolbar separator is tagged so the fixed click steps are no-ops.
	const G = window.__apbGdocs;
	const R = window.__apbGdocsRun;
	const settle = async () => {
		const last = R.done[R.done.length - 1];
		if (last?.toggle && last.verified === undefined) {
			last.verified = !!(await G.waitFor(() => (document.querySelector(last.button)?.getAttribute('aria-pressed') === 'true') === last.want, 3000));
		}
		if (last?.menu && last.verified === undefined) {
			// The toolbar control shows the selection's current value.
			const shown = () => last.menu === 'size'
				? document.querySelector('#fontSizeSelect input')?.value
				: G.squash(document.querySelector(last.button)?.textContent);
			last.verified = !!(await G.waitFor(() => shown() === last.applied, 3000));
		}
	};
	R.settle = settle;
	const strip = ({ prop, want, value, color, applied, changed, verified }) => ({ prop, ...(want !== undefined && { value: want }), ...(value !== undefined && { requested: value }), ...(color && { requested: color === 'none' ? 'none' : `#${color}` }), ...(applied && { applied }), ...(changed !== undefined && { changed }), ...(verified !== undefined && { verified }) });
	if (!R.baseline) {
		const before = R.mode === 'edit' ? await G.tryExport(G.page.tab) : null;
		R.save = G.watchSave();
		R.baseline = {
			cards: JSON.stringify(G.cards().map((c) => c.text)),
			html: before ? before.documentElement.outerHTML : null,
		};
	}
	if (R.current?.menu) {
		// A font / size / style menu is open: tag the matching option.
		const action = R.current;
		R.current = null;
		const label = (item) => G.squash((item.querySelector('.goog-menuitem-content span') || item.querySelector('.goog-menuitem-content') || item).textContent.replace('►', ''));
		const options = await G.waitFor(() => {
			const list = G.openMenuItems().filter((item) => action.menu === 'size' ? /^\d+$/.test(label(item)) : item.classList.contains('goog-option'));
			return list.length ? list : null;
		}, 4000);
		if (!options) G.fail('UI_CHANGED', `${action.prop} menu did not open`);
		const target = action.menu === 'style'
			? (options.length >= 9 ? options[action.index] : null)
			: options.find((item) => label(item).toLowerCase() === action.value.toLowerCase());
		if (!target || G.disabled(target)) {
			// Close the menu again so the tab is not left busy.
			const button = document.querySelector(action.button);
			for (const type of ['mousedown', 'mouseup']) button?.dispatchEvent(new MouseEvent(type, { bubbles: true, cancelable: true, view: window, button: 0 }));
			// Hand focus back to the editor: a toolbar button left focused
			// reopens its menu on the next arrow key.
			G.editorTarget()?.focus();
			G.fail('FORMAT_UNAVAILABLE', `${action.prop} "${action.value}" is not in this document's ${action.prop} menu. Available: ${options.map(label).join(', ')}. Earlier formatting in this call was applied: ${JSON.stringify(R.done.map(strip))}`);
		}
		action.applied = label(target);
		await G.steady(target);
		G.tag(target);
		R.done.push(action);
		return { stage: 'option', ...strip(action) };
	}
	if (R.current) {
		// A palette is open: tag the nearest standard swatch (or "no color").
		const action = R.current;
		R.current = null;
		const swatches = await G.waitFor(() => {
			const list = [...document.querySelectorAll('.docs-material-colorpalette-colorswatch')].filter(G.shown);
			return list.length ? list : null;
		}, 4000);
		if (!swatches) G.fail('UI_CHANGED', `color palette for ${action.prop} did not open`);
		const rgb = (text) => (text.match(/\d+/g) || []).slice(0, 3).map(Number);
		let target;
		if (action.color === 'none') {
			target = [...document.querySelectorAll('.colormenuitems-no-color')].find(G.shown);
			if (!target) G.fail('UI_CHANGED', `palette for ${action.prop} has no "none" entry`);
			action.applied = 'none';
		} else {
			const want = [0, 2, 4].map((i) => parseInt(action.color.slice(i, i + 2), 16));
			let best = Infinity;
			for (const swatch of swatches) {
				const c = rgb(swatch.style.backgroundColor);
				if (c.length !== 3) continue;
				const d = c.reduce((sum, v, i) => sum + (v - want[i]) ** 2, 0);
				if (d < best) {
					best = d;
					target = swatch;
				}
			}
			if (!target) G.fail('UI_CHANGED', 'palette swatches expose no colors');
			action.applied = `#${rgb(target.style.backgroundColor).map((v) => v.toString(16).padStart(2, '0')).join('')}`;
			action.exact = best === 0;
		}
		await G.steady(target);
		G.tag(target);
		R.done.push(action);
		return { stage: 'swatch', ...strip(action) };
	}
	await settle();
	const idle = () => {
		// Rest on a separator: clicking it changes nothing.
		const inert = [...document.querySelectorAll('#docs-toolbar .goog-toolbar-separator')].find(G.shown);
		if (!inert) G.fail('UI_CHANGED', 'toolbar has no separator to rest on');
		G.tag(inert);
	};
	await G.steady(document.querySelector('#docs-toolbar'));
	const action = R.queue.shift();
	if (!action) {
		idle();
		return { stage: 'idle' };
	}
	const button = document.querySelector(action.button);
	if (!G.shown(button) || button.classList.contains('goog-toolbar-button-disabled') || button.classList.contains('goog-toolbar-menu-button-disabled')) {
		G.fail('FORMAT_UNAVAILABLE', `${action.prop} is not available here${action.prop === 'cell_color' ? ' (the anchor is not inside a table cell)' : ''}; if the toolbar is collapsed, widen the window. Earlier formatting in this call was applied: ${JSON.stringify(R.done.map(strip))}`);
	}
	if (action.toggle) {
		const pressed = button.getAttribute('aria-pressed') === 'true';
		if (pressed === action.want) {
			R.done.push({ ...action, changed: false, verified: true });
			idle();
			return { stage: 'noop', prop: action.prop };
		}
		action.changed = true;
		R.done.push(action);
	} else if (action.color || action.menu) {
		R.current = action;
	} else {
		R.done.push(action);
	}
	await G.steady(button);
	G.tag(button);
	R.strip = strip;
	return { stage: 'button', prop: action.prop };
})()
