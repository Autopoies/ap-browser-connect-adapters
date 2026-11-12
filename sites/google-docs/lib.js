(async () => {
	// Shared helpers + the document-type lock. Every google-docs command runs
	// this first; it throws (stopping the batch) unless the target is a Google
	// Docs *document* — never a spreadsheet, presentation, form or drawing.
	const fail = (code, message) => {
		throw new Error(`google-docs [${code}]: ${message}`);
	};
	const KINDS = {
		document: 'document',
		spreadsheets: 'spreadsheet',
		presentation: 'presentation',
		forms: 'form',
		drawings: 'drawing',
	};
	const wantType = ("{{args.type}}".trim() || 'document').toLowerCase();
	if (wantType !== 'document') {
		fail('UNSUPPORTED_TYPE', `--type ${wantType} is not supported; this adapter is locked to "document" (Google Docs). Sheets and Slides need their own adapters.`);
	}
	if (location.hostname !== 'docs.google.com') {
		fail('WRONG_SITE', `tab is on ${location.hostname}, not docs.google.com`);
	}
	const PATH = /^\/([a-z]+)\/(?:u\/\d+\/)?d\/([\w-]+)/;
	const describe = (kind) => KINDS[kind] || kind || 'unknown';
	const parse = (value) => {
		if (!value) return null;
		if (/^https?:\/\//i.test(value)) {
			let url;
			try {
				url = new URL(value);
			} catch (_) {
				fail('BAD_DOC', '--doc is not a valid URL');
			}
			if (url.hostname !== 'docs.google.com') fail('BAD_DOC', `--doc host ${url.hostname} is not docs.google.com`);
			const m = url.pathname.match(PATH);
			if (!m) fail('BAD_DOC', '--doc URL has no /<type>/d/<id> path');
			return { kind: m[1], id: m[2], tab: url.searchParams.get('tab') || '' };
		}
		if (/^[\w-]{20,}$/.test(value)) return { kind: 'document', id: value, tab: '' };
		fail('BAD_DOC', '--doc must be a Google Docs URL or a document ID');
	};
	const pm = location.pathname.match(PATH);
	const page = pm
		? { kind: pm[1], id: pm[2], tab: new URLSearchParams(location.search).get('tab') || '' }
		: { kind: location.pathname.split('/')[1] || '', id: '', tab: '' };
	const target = parse("{{args.doc}}".trim());
	if (target && target.kind !== 'document') {
		fail('TYPE_MISMATCH', `--doc points at a Google ${describe(target.kind)}, but this adapter only operates on type "document"`);
	}
	if (!target) {
		if (page.id && page.kind !== 'document') {
			fail('TYPE_MISMATCH', `the operated tab is a Google ${describe(page.kind)}, but this adapter only operates on type "document"`);
		}
		if (!page.id) fail('NO_DOC', 'the operated tab is not a Google Docs document; pass --doc <url|id> or --tab <id>');
	}
	const docId = target ? target.id : page.id;
	const onPage = page.kind === 'document' && page.id === docId;

	const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
	// Polling only: hidden (silent) tabs throttle timers and never run rAF.
	const waitFor = async (predicate, timeoutMs = 6000, intervalMs = 120) => {
		const deadline = Date.now() + timeoutMs;
		for (;;) {
			const value = predicate();
			if (value) return value;
			if (Date.now() >= deadline) return null;
			await sleep(intervalMs);
		}
	};
	const shown = (el) => {
		if (!el?.isConnected) return false;
		const style = getComputedStyle(el);
		if (style.display === 'none' || style.visibility === 'hidden') return false;
		const rect = el.getBoundingClientRect();
		return rect.width > 0 && rect.height > 0;
	};

	// ---- export (read path) -------------------------------------------------
	// Same-origin HTML export. `format=md|txt` redirect cross-origin and cannot
	// be fetched; the page enforces Trusted Types, so DOMParser is unavailable
	// and XHR's document response type does the parsing.
	const fetchExportOnce = (tab) => new Promise((resolve, reject) => {
		const xhr = new XMLHttpRequest();
		const query = `format=html${tab ? `&tab=${encodeURIComponent(tab)}` : ''}&_=${Date.now()}`;
		xhr.open('GET', `/document/d/${docId}/export?${query}`);
		xhr.setRequestHeader?.('Cache-Control', 'no-cache');
		xhr.responseType = 'document';
		xhr.onload = () => {
			const finalUrl = xhr.responseURL || '';
			if (xhr.status === 200 && xhr.response?.body && finalUrl.includes(`/document/d/${docId}/export`)) {
				resolve(xhr.response);
				return;
			}
			const why = xhr.status === 404
				? 'not found — the ID is not a Google Docs document (Sheets/Slides IDs are rejected) or it was deleted'
				: xhr.status === 429
					? 'RATE_LIMITED — Google is throttling exports for this document; wait a minute before reading again'
				: xhr.status === 401 || xhr.status === 403 || /accounts\.google\.com/.test(finalUrl)
					? 'no access with this Chrome profile'
					: `export failed (HTTP ${xhr.status})`;
			reject(new Error(`google-docs [EXPORT_FAILED]: ${why}`));
		};
		xhr.onerror = () => reject(new Error('google-docs [EXPORT_FAILED]: network error fetching the document export'));
		xhr.send();
	});

	// Exports are rate limited per document (HTTP 429): back off, and keep
	// verification loops from polling the endpoint tightly.
	const fetchExport = async (tab, retries = 2) => {
		for (let attempt = 0; ; attempt += 1) {
			try {
				return await fetchExportOnce(tab);
			} catch (error) {
				if (!/RATE_LIMITED/.test(error.message) || attempt >= retries) throw error;
				await sleep(2500 * (attempt + 1));
			}
		}
	};
	const tryExport = async (tab) => {
		try {
			return await fetchExportOnce(tab);
		} catch (error) {
			if (/RATE_LIMITED/.test(error.message)) window.__apbGdocs.throttled = true;
			return null;
		}
	};

	const clean = (s) => String(s ?? '').replace(/\u00a0/g, ' ').replace(/[\u200b-\u200d\ufeff]/g, '');
	const squash = (s) => clean(s).replace(/\s+/g, ' ').trim();
	const isCommentRef = (el) => el.tagName === 'SUP' && !!el.querySelector('a[id^="cmnt_ref"]');
	const isCommentFooter = (el) => el.tagName === 'DIV' && !!el.querySelector(':scope > p > a[id^="cmnt"]');
	const unwrapLink = (href) => {
		try {
			const url = new URL(href, location.href);
			if (url.hostname === 'www.google.com' && url.pathname === '/url') return url.searchParams.get('q') || href;
			return url.href;
		} catch (_) {
			return href;
		}
	};
	// Export HTML carries inline formatting as generated classes (c1, c2…).
	const styleMap = (doc) => {
		const map = {};
		const css = [...doc.querySelectorAll('style')].map((s) => s.textContent).join('\n');
		for (const m of css.matchAll(/\.(c\d+)\{([^}]*)\}/g)) {
			map[m[1]] = {
				bold: /font-weight:\s*(700|800|900|bold)/.test(m[2]),
				italic: /font-style:\s*italic/.test(m[2]),
				strike: /text-decoration:[^;]*line-through/.test(m[2]),
			};
		}
		return map;
	};
	const inline = (node, styles, md, raw = false) => {
		let out = '';
		for (const child of node.childNodes) {
			if (child.nodeType === 3) {
				out += raw ? String(child.textContent ?? '') : clean(child.textContent);
				continue;
			}
			if (child.nodeType !== 1 || isCommentRef(child)) continue;
			const tag = child.tagName;
			if (tag === 'BR') {
				out += '\n';
				continue;
			}
			if (tag === 'IMG') {
				if (md) out += `![${squash(child.getAttribute('alt') || child.getAttribute('title') || 'image')}](${child.getAttribute('src') || ''})`;
				continue;
			}
			let text = inline(child, styles, md, raw);
			if (!md || !text.trim()) {
				out += text;
				continue;
			}
			if (tag === 'A' && child.getAttribute('href') && !child.getAttribute('href').startsWith('#')) {
				text = `[${text.trim()}](${unwrapLink(child.getAttribute('href'))})`;
			} else if (tag === 'SPAN') {
				const flags = { bold: false, italic: false, strike: false };
				for (const cls of child.classList) {
					const s = styles[cls];
					if (s) for (const k of Object.keys(flags)) flags[k] = flags[k] || s[k];
				}
				const wrap = (flags.bold ? '**' : '') + (flags.italic ? '*' : '') + (flags.strike ? '~~' : '');
				if (wrap) {
					const lead = text.match(/^\s*/)[0];
					const trail = text.match(/\s*$/)[0];
					text = lead + wrap + text.trim() + [...wrap.matchAll(/\*\*|\*|~~/g)].map((x) => x[0]).reverse().join('') + trail;
				}
			}
			out += text;
		}
		return out;
	};
	// Flatten the export into ordered blocks. Layout tables (cells holding
	// headings, lists or several paragraphs) are flattened in reading order;
	// simple data tables stay tables.
	const blocks = (doc, { md = true, preserveWs = false, includeEmpty = false } = {}) => {
		const styles = md ? styleMap(doc) : {};
		const out = [];
		const listLevel = (list) => Number([...list.classList].join(' ').match(/lst-kix_\w+-(\d+)/)?.[1] || 0);
		const walk = (parent, inHeadingShift) => {
			for (const el of parent.children) {
				const tag = el.tagName;
				if (isCommentFooter(el) || tag === 'STYLE' || tag === 'SCRIPT') continue;
				if (/^H[1-6]$/.test(tag) || (tag === 'P' && (el.classList.contains('title') || el.classList.contains('subtitle')))) {
					const rawText = inline(el, styles, false, true);
					const plain = preserveWs ? rawText : squash(inline(el, styles, false));
					if (!plain.trim()) continue;
					const level = tag === 'P' ? (el.classList.contains('title') ? 1 : 2) : Number(tag[1]);
					const heading = { type: 'heading', level, title: tag === 'P', text: plain, id: el.id || '' };
					if (includeEmpty || preserveWs) heading.raw = rawText;
					out.push(heading);
				} else if (tag === 'P') {
					const rawText = inline(el, styles, false, true).replace(/[ \t]+\n/g, '\n');
					const text = preserveWs
						? inline(el, styles, md, true).replace(/[ \t]+\n/g, '\n')
						: inline(el, styles, md).replace(/[ \t]+\n/g, '\n').trim();
					const plain = preserveWs ? rawText : squash(inline(el, styles, false));
					const isEmpty = rawText.replace(/[\r\n]/g, '').length === 0;
					if (includeEmpty || preserveWs) {
						if (!isEmpty || includeEmpty) {
							out.push({
								type: 'para',
								text,
								plain,
								raw: rawText,
								empty: isEmpty,
								has_nbsp: /\u00a0/.test(rawText),
							});
						}
					} else if (text) {
						out.push({ type: 'para', text, plain });
					}
				} else if (tag === 'UL' || tag === 'OL') {
					const level = listLevel(el);
					let n = Number(el.getAttribute('start') || 1);
					for (const li of el.children) {
						if (li.tagName !== 'LI') continue;
						const rawText = inline(li, styles, false, true);
						const text = preserveWs
							? inline(li, styles, md, true)
							: inline(li, styles, md).replace(/\s*\n\s*/g, ' ').trim();
						const plain = preserveWs ? rawText : squash(inline(li, styles, false));
						if (text.trim() || (includeEmpty && rawText.length)) {
							const item = { type: 'item', ordered: tag === 'OL', index: n, level, text, plain };
							if (includeEmpty || preserveWs) {
								item.raw = rawText;
								item.has_nbsp = /\u00a0/.test(rawText);
							}
							out.push(item);
						}
						n += 1;
					}
				} else if (tag === 'TABLE') {
					const rows = [...el.querySelectorAll(':scope > tbody > tr, :scope > tr')].map((tr) => [...tr.children].filter((c) => /^T[DH]$/.test(c.tagName)));
					const simple = rows.length > 0 && rows.every((cells) => cells.every((cell) =>
						!cell.querySelector('h1,h2,h3,h4,h5,h6,ul,ol,table,.title,.subtitle') &&
						[...cell.children].filter((p) => squash(p.textContent)).length <= 1));
					if (simple) {
						out.push({ type: 'table', rows: rows.map((cells) => cells.map((cell) => inline(cell, styles, md).replace(/\s*\n\s*/g, ' ').replace(/\|/g, '\\|').trim())) });
					} else {
						for (const cells of rows) for (const cell of cells) walk(cell, inHeadingShift);
					}
				} else if (tag === 'HR') {
					out.push({ type: 'rule' });
				} else {
					walk(el, inHeadingShift);
				}
			}
		};
		walk(doc.body, 0);
		return out;
	};
	const render = (list, format, { preserveWs = false } = {}) => {
		const md = format !== 'text';
		const lines = [];
		let prev = '';
		for (const b of list) {
			const gap = () => {
				if (!preserveWs && lines.length && !(b.type === 'item' && prev === 'item')) lines.push('');
			};
			if (b.type === 'heading') {
				gap();
				lines.push(md ? `${'#'.repeat(b.level)} ${b.text}` : b.text);
			} else if (b.type === 'para') {
				if (preserveWs && b.empty) {
					lines.push('');
				} else {
					gap();
					lines.push(md ? b.text : b.plain);
				}
			} else if (b.type === 'item') {
				gap();
				lines.push(`${'  '.repeat(b.level)}${b.ordered ? `${b.index}.` : '-'} ${md ? b.text : b.plain}`);
			} else if (b.type === 'table') {
				gap();
				b.rows.forEach((cells, i) => {
					lines.push(md ? `| ${cells.join(' | ')} |` : cells.join('\t'));
					if (md && i === 0) lines.push(`| ${cells.map(() => '---').join(' | ')} |`);
				});
			} else if (b.type === 'rule') {
				gap();
				lines.push(md ? '---' : '');
			}
			prev = b.type;
		}
		return lines.join('\n');
	};

	// ---- live editor (write path) -------------------------------------------
	const MODES = { edit: 'edit', suggest: 'suggest', view: 'view' };
	const mode = () => {
		const cls = document.querySelector('#docs-toolbar-mode-switcher')?.className || '';
		return MODES[cls.match(/(?:^|\s)(edit|suggest|view)-mode(?:\s|$)/)?.[1]] || 'unknown';
	};
	const TAG = 'data-apb-gdocs-click';
	const tag = (el, attr = TAG) => {
		for (const old of document.querySelectorAll(`[${attr}]`)) old.removeAttribute(attr);
		el.setAttribute(attr, '');
	};
	// The native click re-checks geometry before pressing; wait until the
	// target stops moving (toolbars reflow when the selection enters a table,
	// and hidden tabs lay out lazily).
	const steady = async (el, timeoutMs = 2500) => {
		const deadline = Date.now() + timeoutMs;
		const box = () => {
			const r = el.getBoundingClientRect();
			return `${Math.round(r.x)},${Math.round(r.y)},${Math.round(r.width)},${Math.round(r.height)}`;
		};
		let last = box();
		while (Date.now() < deadline) {
			await sleep(160);
			const now = box();
			if (now === last) return true;
			last = now;
		}
		return false;
	};
	const openMenuItems = () => [...document.querySelectorAll('.goog-menu')]
		.filter((menu) => getComputedStyle(menu).display !== 'none')
		.flatMap((menu) => [...menu.querySelectorAll('.goog-menuitem')]);
	const accel = (item) => (item.querySelector('.goog-menuitem-accel')?.textContent || '').trim();
	const disabled = (item) => item.classList.contains('goog-menuitem-disabled');
	const dialog = () => {
		const root = document.querySelector('.appsDocsUiWizFindandreplacedialogContainer');
		if (!root || getComputedStyle(root).visibility !== 'visible') return null;
		const inputs = root.querySelectorAll('.appsDocsUiWizFindandreplacedialogInputsContainer input[type="text"]');
		const buttons = root.querySelectorAll('.appsDocsUiWizFindandreplacedialogButtonsContainer button');
		const checks = root.querySelectorAll('.appsDocsUiWizFindandreplacedialogCheckboxesContainer input[type="checkbox"]');
		if (inputs.length !== 2 || buttons.length !== 4 || checks.length < 1) {
			fail('UI_CHANGED', 'Find and replace dialog layout is not the expected 2 inputs / 4 buttons');
		}
		const matchRegex = [...checks].find((cb) => {
			const row = cb.closest('label, .appsDocsUiWizFindandreplacedialogCheckboxContainer, div, tr');
			const label = `${cb.getAttribute('aria-label') || ''} ${row?.textContent || ''}`;
			return /regular\s*expression|regex|正则/i.test(label);
		}) || checks[1] || null;
		return {
			root,
			find: inputs[0],
			replace: inputs[1],
			matchCase: checks[0],
			matchRegex,
			// Order contract: Replace, Replace all, Previous, Next.
			replaceOne: buttons[0],
			replaceAll: buttons[1],
			counter: root.querySelector('.appsDocsUiWizFindandreplacedialogFindInputCounter'),
			close: root.querySelector('.appsDocsUiWizFindandreplacedialogCloseButtonContainer button'),
		};
	};
	// Counter text is localized ("1 of 11"); the last number is the total.
	const matchCount = () => {
		const text = (dialog()?.counter?.textContent || '').trim();
		const nums = text.match(/\d+/g);
		return nums ? Number(nums[nums.length - 1]) : null;
	};
	// Wait for the counter to appear and stop changing.
	const settledCount = async (timeoutMs = 6000) => {
		const deadline = Date.now() + timeoutMs;
		let last = null;
		let since = Date.now();
		for (;;) {
			const now = matchCount();
			if (now !== last) {
				last = now;
				since = Date.now();
			} else if (now !== null && Date.now() - since >= (now === 0 ? 1500 : 450)) {
				// "0 of 0" also shows briefly while a search is still running.
				return now;
			}
			if (Date.now() >= deadline) return last;
			await sleep(120);
		}
	};
	const editorTarget = () => document.querySelector('iframe.docs-texteventtarget-iframe')?.contentDocument?.querySelector('[contenteditable="true"]') || null;
	const editorFocused = () => document.activeElement?.classList?.contains('docs-texteventtarget-iframe') === true;
	const cards = () => [...document.querySelectorAll('.docos-anchoreddocoview')]
		.filter((card) => !card.querySelector('.docos-draftdiscussionview-input-pane'))
		.map((card) => {
			const replies = [...card.querySelectorAll('.docos-replyview')].map((reply) => ({
				author: squash(reply.querySelector('.docos-author')?.textContent),
				time: squash([...(reply.querySelector('.docos-replyview-timestamp')?.childNodes || [])].filter((n) => n.nodeType === 3).map((n) => n.textContent).join(' ')) || squash(reply.querySelector('.docos-replyview-timestamp')?.textContent),
				text: clean(reply.querySelector('.docos-replyview-body')?.innerText || '').trim(),
			})).filter((reply) => reply.text || reply.author);
			return {
				kind: card.querySelector('.docos-accept-suggestion') ? 'suggestion' : 'comment',
				author: replies[0]?.author || '',
				time: replies[0]?.time || '',
				text: replies[0]?.text || '',
				replies: replies.slice(1),
			};
		});
	const saved = () => !!document.querySelector('#docs-save-indicator-container .docs-icon-cloud-check-20, .docs-save-indicator-container .docs-icon-cloud-check-20');
	// Fallback change evidence when the export is throttled: Docs flips the
	// save indicator away from "saved" whenever the document is mutated.
	const watchSave = () => {
		const state = { dirtied: false };
		const host = document.querySelector('#docs-save-indicator-container, .docs-save-indicator-container');
		if (!host) return state;
		const observer = new MutationObserver(() => {
			if (!saved()) state.dirtied = true;
		});
		observer.observe(host, { childList: true, subtree: true, attributes: true });
		setTimeout(() => observer.disconnect(), 60000);
		return state;
	};
	const requireEditor = () => {
		if (!onPage) fail('NOT_OPEN', 'the document is not open in the operated tab');
		if (!document.querySelector('#docs-toolbar-mode-switcher') || !editorTarget()) {
			fail('READ_ONLY', 'no editing surface — the document is view-only for this account or still loading');
		}
	};
	const base = () => ({
		doc_type: 'document',
		doc_id: docId,
		title: onPage ? (document.querySelector('.docs-title-input')?.value || document.title.replace(/ - Google (Docs|文档|文件)$/, '')) : '',
		url: `https://docs.google.com/document/d/${docId}/edit`,
	});

	window.__apbGdocs = {
		fail, docId, onPage, page, target, sleep, waitFor, shown, squash, clean,
		fetchExport, tryExport, blocks, render, isCommentFooter,
		mode, tag, steady, TAG, openMenuItems, accel, disabled, dialog, matchCount, settledCount,
		editorTarget, editorFocused, cards, saved, watchSave, requireEditor, base,
	};
	return { doc_type: 'document', doc_id: docId, on_page: onPage };
})()
