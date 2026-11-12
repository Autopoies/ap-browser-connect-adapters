import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';
import { parseHTML } from 'linkedom';

const site = new URL('../sites/google-docs/', import.meta.url);
const source = (name) => readFileSync(new URL(name, site), 'utf8');
const DOC = '1c51nS_Y87tcR-FUesgkm3A4GTvwv0hIcj-JexZC_v3A';
const SHEET = '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms';

// Match the CLI's escape_js_string_fragment, not raw template replacement.
function expand(text, args) {
  const escapes = { '\\': '\\\\', "'": "\\'", '"': '\\"', '\n': '\\n', '\r': '\\r', '\t': '\\t', '`': '\\`' };
  return text.replace(/\{\{args\.(\w+)\}\}/g, (_, key) => String(args[key] ?? '').replace(/[\\'"\n\r\t`]/g, (ch) => escapes[ch]));
}

const EXPORT = `<html><head><title>Fixture</title><style>.c1{font-weight:700}.c2{font-style:italic}.c3{color:#000}</style></head><body>
<p class="title" id="h.t"><span>Doc Title</span></p>
<h1 id="h.a"><span>Alpha</span></h1>
<p><span>Plain </span><span class="c1">bold</span><span> and </span><span class="c2 c3">italic</span><sup><a href="#cmnt1" id="cmnt_ref1">[a]</a></sup></p>
<ul class="lst-kix_x-0"><li><span>one</span></li></ul><ul class="lst-kix_x-1"><li><span>nested</span></li></ul>
<p><span><a href="https://www.google.com/url?q=https://example.com/a&amp;sa=D">link</a></span></p>
<table><tr><td><p><span class="c1">H1</span></p></td><td><p><span>H2</span></p></td></tr><tr><td><p><span>a|b</span></p></td><td><p><span>c</span></p></td></tr></table>
<table><tr><td><h2 id="h.b"><span>Beta</span></h2><p><span>layout cell</span></p></td></tr></table>
<h1 id="h.c"><span>Gamma</span></h1><p><span>tail</span></p>
<div><p><a href="#cmnt_ref1" id="cmnt1">[a]</a><span>a comment</span></p></div>
</body></html>`;

function page(href, { status = 200 } = {}) {
  const { document, window } = parseHTML('<html><body><input class="docs-title-input" value="Live Title"></body></html>');
  const exportDoc = parseHTML(EXPORT).document;
  const location = new URL(href);
  class XMLHttpRequest {
    open(_method, url) { this.url = url; }
    send() {
      this.status = status;
      this.responseURL = `https://docs.google.com${this.url}`;
      this.response = status === 200 ? exportDoc : null;
      queueMicrotask(() => this.onload());
    }
  }
  const context = vm.createContext({
    document, location, URL, URLSearchParams, XMLHttpRequest, setTimeout, queueMicrotask,
    getComputedStyle: () => ({ display: 'block', visibility: 'visible' }),
  });
  context.window = context;
  return context;
}
const run = (file, context, args = {}) => vm.runInContext(expand(source(file), { doc: '', type: 'document', doc_tab: '', as: 'markdown', preserve_ws: false, section: '', max_chars: 100000, regex: false, all: false, delete: false, with: '', html: false, no_leading_newline: false, mode: 'suggest', ...args }), context);
const docUrl = `https://docs.google.com/document/d/${DOC}/edit?tab=t.0`;

test('type lock accepts a document tab and reports doc_type', async () => {
  const result = await run('lib.js', page(docUrl));
  assert.deepEqual(JSON.parse(JSON.stringify(result)), { doc_type: 'document', doc_id: DOC, on_page: true });
});

test('type lock rejects Sheets and Slides tabs, URLs and --type values', async () => {
  await assert.rejects(run('lib.js', page(`https://docs.google.com/spreadsheets/d/${SHEET}/edit`)), /TYPE_MISMATCH.*spreadsheet/);
  await assert.rejects(run('lib.js', page(`https://docs.google.com/presentation/d/${SHEET}/edit`)), /TYPE_MISMATCH.*presentation/);
  await assert.rejects(run('lib.js', page(docUrl), { doc: `https://docs.google.com/spreadsheets/d/${SHEET}/edit` }), /TYPE_MISMATCH.*spreadsheet/);
  await assert.rejects(run('lib.js', page(docUrl), { type: 'spreadsheet' }), /UNSUPPORTED_TYPE/);
  await assert.rejects(run('lib.js', page('https://docs.google.com/document/u/0/')), /NO_DOC/);
  await assert.rejects(run('lib.js', page('https://mail.google.com/mail/u/0/')), /WRONG_SITE/);
  await assert.rejects(run('lib.js', page(docUrl), { doc: 'https://evil.example/document/d/x' }), /BAD_DOC/);
});

test('--doc may name another document by ID or URL (account-scoped paths too)', async () => {
  const other = 'A'.repeat(44);
  assert.equal((await run('lib.js', page(docUrl), { doc: other })).on_page, false);
  assert.equal((await run('lib.js', page(`https://docs.google.com/document/u/1/d/${DOC}/edit`))).doc_id, DOC);
});

test('a non-document ID fails closed on export', async () => {
  const context = page(docUrl, { status: 404 });
  await run('lib.js', context, { doc: SHEET });
  await assert.rejects(run('read.js', context), /EXPORT_FAILED.*not a Google Docs document/);
});

test('read renders Markdown: inline styles, lists, links, tables, no comment residue', async () => {
  const context = page(docUrl);
  await run('lib.js', context);
  const result = await run('read.js', context);
  assert.equal(result.doc_type, 'document');
  assert.equal(result.title, 'Live Title');
  const md = result.content;
  assert.match(md, /^# Doc Title\n\n# Alpha\n\nPlain \*\*bold\*\* and \*italic\*\n/);
  assert.match(md, /- one\n  - nested/);
  assert.match(md, /\[link\]\(https:\/\/example\.com\/a\)/);
  assert.match(md, /\| \*\*H1\*\* \| H2 \|\n\| --- \| --- \|\n\| a\\\|b \| c \|/);
  assert.match(md, /## Beta\n\nlayout cell/);
  assert.doesNotMatch(md, /\[a\]|a comment/);
});

test('read --section returns one heading section; text format drops markup', async () => {
  const context = page(docUrl);
  await run('lib.js', context);
  const section = await run('read.js', context, { section: 'alpha', as: 'text' });
  assert.equal(section.section, 'Alpha');
  assert.match(section.content, /^Alpha\n\nPlain bold and italic/);
  assert.doesNotMatch(section.content, /Gamma|\*\*/);
  const missing = await run('read.js', context, { section: 'nope' });
  assert.equal(missing.status, 'section_not_found');
});

test('outline and comments come from the export', async () => {
  const context = page(docUrl);
  await run('lib.js', context);
  const outline = await run('outline.js', context);
  assert.deepEqual(JSON.parse(JSON.stringify(outline.headings.map((h) => [h.level, h.text, h.anchor]))), [[1, 'Doc Title', 'h.t'], [1, 'Alpha', 'h.a'], [2, 'Beta', 'h.b'], [1, 'Gamma', 'h.c']]);
  assert.match(outline.headings[1].url, /\?tab=t\.0#heading=h\.a$/);
  const comments = await run('comments.js', context);
  assert.equal(comments.count, 1);
  assert.equal(comments.comments[0].text, 'a comment');
  assert.match(comments.comments[0].context, /italic\[a\]/);
});

test('export requests append a cache-buster timestamp and leave no-cache header optional', async () => {
  const seen = [];
  const base = page(docUrl);
  const { document } = parseHTML('<html><body></body></html>');
  const exportDoc = parseHTML(EXPORT).document;
  class TrackingXHR {
    open(_m, url) { this.url = url; this.headers = {}; }
    setRequestHeader(k, v) { this.headers[k] = v; }
    send() {
      seen.push({ url: this.url, headers: this.headers });
      this.status = 200;
      this.responseURL = `https://docs.google.com${this.url}`;
      this.response = exportDoc;
      queueMicrotask(() => this.onload());
    }
  }
  base.XMLHttpRequest = TrackingXHR;
  base.document = document;
  await run('lib.js', base);
  await run('read.js', base);
  assert.equal(seen.length, 1);
  assert.match(seen[0].url, /[?&]_=\d+/);
  assert.equal(seen[0].headers['Cache-Control'], 'no-cache');
});

test('read --as blocks and --preserve_ws keep empty paragraphs, NBSP, and leading whitespace', async () => {
  const rawHtml = `<html><head><title>WS</title></head><body>
    <h1 id="h.1"><span>Description</span></h1>
    <p></p>
    <p><span>\u00a0 while still</span></p>
    <p><span>seeing details</span></p>
  </body></html>`;
  const context = page(docUrl);
  const rawDoc = parseHTML(rawHtml).document;
  context.XMLHttpRequest = class {
    open(_m, url) { this.url = url; }
    send() {
      this.status = 200;
      this.responseURL = `https://docs.google.com${this.url}`;
      this.response = rawDoc;
      queueMicrotask(() => this.onload());
    }
  };
  await run('lib.js', context);

  const blocksRes = await run('read.js', context, { as: 'blocks' });
  const parsed = JSON.parse(blocksRes.content);
  assert.equal(parsed[1].empty, true);
  assert.equal(parsed[2].raw, '\u00a0 while still');
  assert.equal(parsed[2].has_nbsp, true);
  assert.equal(parsed[3].raw, 'seeing details');

  const wsText = await run('read.js', context, { as: 'text', preserve_ws: true });
  assert.equal(wsText.content, 'Description\n\n\u00a0 while still\nseeing details');
});

test('find/replace --regex allows cross-paragraph escapes and whitespace and resets toggle', async () => {
  const makeDialogContext = ({ regexCheckedInitially = false } = {}) => {
    const context = page(docUrl);
    const { document } = parseHTML(`<html><body>
      <div id="docs-toolbar-mode-switcher" class="suggest-mode"></div>
      <div class="appsDocsUiWizFindandreplacedialogContainer">
        <div class="appsDocsUiWizFindandreplacedialogInputsContainer">
          <input type="text" value="" />
          <input type="text" value="" />
        </div>
        <div class="appsDocsUiWizFindandreplacedialogCheckboxesContainer">
          <label><input type="checkbox" id="mc" />Match case</label>
          <label><input type="checkbox" id="mr" ${regexCheckedInitially ? 'checked' : ''} />Match using regular expressions</label>
        </div>
        <div class="appsDocsUiWizFindandreplacedialogButtonsContainer">
          <button>Replace</button><button>Replace all</button><button>Prev</button><button>Next</button>
        </div>
        <div class="appsDocsUiWizFindandreplacedialogFindInputCounter">1 of 1</div>
        <div class="appsDocsUiWizFindandreplacedialogCloseButtonContainer"><button>X</button></div>
      </div>
    </body></html>`);
    context.document = document;
    for (const cb of document.querySelectorAll('input[type="checkbox"]')) {
      cb.click = function click() { this.checked = !this.checked; };
    }
    return { context, document };
  };

  const { context, document } = makeDialogContext({ regexCheckedInitially: false });
  await run('lib.js', context);
  await run('replace-init.js', context, {
    find: 'while still\\n\\u00a0 seeing',
    with: 'while still seeing',
    regex: true,
    all: false,
  });
  await run('find-prepare.js', context);
  assert.equal(document.querySelector('#mr').checked, true);

  document.querySelector('[data-apb-gdocs-find]').value = 'while still\\n\\u00a0 seeing';
  document.querySelector('[data-apb-gdocs-replace]').value = 'while still seeing';
  context.__apbGdocsRun = context.window.__apbGdocsRun;
  context.window.__apbGdocsRun.count = 1;
  await run('replace-pick.js', context);

  // Verify selfMatching handles regex correctly (non-self-matching regex drops to 0).
  document.querySelector('.appsDocsUiWizFindandreplacedialogFindInputCounter').textContent = '0 of 0';
  const verified = await run('replace-verify.js', context);
  assert.equal(verified.status, 'replaced');
  assert.equal(verified.verified, true);

  // Subsequent non-regex search must turn the regex checkbox back OFF.
  await run('find-init.js', context, { text: 'Description ' });
  await run('find-prepare.js', context);
  assert.equal(document.querySelector('#mr').checked, false);
});

test('append-init honors --no_leading_newline in plain and html modes', async () => {
  const ctx1 = page(docUrl);
  await run('lib.js', ctx1);
  await run('append-init.js', ctx1, { text: 'Paragraph text', no_leading_newline: true });
  assert.equal(ctx1.window.__apbGdocsRun.text, 'Paragraph text');
  assert.equal(ctx1.window.__apbGdocsRun.newParagraph, false);

  const ctx2 = page(docUrl);
  await run('lib.js', ctx2);
  await run('append-init.js', ctx2, { text: '<p>Hi</p>', html: true, no_leading_newline: true });
  assert.equal(ctx2.window.__apbGdocsRun.text, '<p>Hi</p>');
  assert.equal(ctx2.window.__apbGdocsRun.newParagraph, false);
});
