const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { parseHTML } = require('linkedom');
const YAML = require('yaml');

const site = path.join(__dirname, '../sites/gmail');
const self = 'sender@example.com';

// Run the actual YAML pipeline + templated scripts. Only the browser boundary
// (native fill, Gmail's controller, and clock) is simulated; no live mail here.
async function runAdapter(command, overrides = {}, options = {}) {
  const adapter = YAML.parse(fs.readFileSync(path.join(site, `${command}.yaml`), 'utf8'));
  const args = Object.fromEntries(Object.entries(adapter.args).map(([key, def]) => [key, def.default ?? '']));
  Object.assign(args, { to: self, subject: 'Regression subject', body: 'line one\n\nline three' }, overrides);
  const { window, document } = parseHTML(`<html><head><title>Inbox - ${self} - Gmail</title></head><body>
    <h2 class="hP">Regression subject</h2>
    <div class="adn"><span class="gD" email="${self}">Sender</span><span class="g2" email="${self}"></span></div>
    <span class="ams bkH">Reply</span><span class="ams bkI">Reply all</span>
    <div class="AD ip" role="dialog"><div class="M9">
      <div name="to"><div role="listbox"><input class="agP" role="combobox" aria-label="To recipients"></div></div>
      <span class="pE">Cc</span><div name="cc"><div role="listbox"><input class="agP" role="combobox" aria-label="Cc recipients"></div></div>
      <span class="pB">Bcc</span><div name="bcc"><div role="listbox"><input class="agP" role="combobox" aria-label="Bcc recipients"></div></div>
      <input name="subjectbox"><input type="hidden" name="subject"><input type="hidden" name="body">
      <div class="Am Al editable" role="textbox" g_editable="true" contenteditable="true" aria-label="Message Body"></div>
      <div class="aoO v7" role="button" data-tooltip="Send (Ctrl-Enter)">Send</div>
    </div></div><div id="notification" role="status"></div>
    </body></html>`);
  const dialog = document.querySelector('.AD');
  const editor = dialog.querySelector('[contenteditable]');
  const subject = dialog.querySelector('[name=subjectbox]');
  if (command === 'reply') {
    subject.value = options.replySubjectBox ? 'Re: Regression subject' : 'Regression subject';
    if (!options.replySubjectBox) subject.remove();
    dialog.removeAttribute('role');
    dialog.classList.remove('AD');
  }
  if (options.hiddenCachedView) {
    const cached = document.createElement('div');
    cached.style.display = 'none';
    cached.innerHTML = '<h2 class="hP">Stale cached thread</h2><span class="ams bkH">Reply</span><table><tr class="zA"><td>Cached row</td></tr></table>';
    document.body.prepend(cached);
  }
  if (options.noReplyAll) document.querySelector('.bkI').remove();
  if (options.incompleteAttachment) {
    const attachment = document.createElement('div');
    attachment.className = 'dL';
    attachment.innerHTML = 'pending.txt<div role="progressbar" aria-valuenow="30"></div>';
    dialog.append(attachment);
  }
  if (options.recipientSummary) {
    const summary = document.createElement('div');
    summary.className = 'oL aDm az9';
    summary.innerHTML = `<span email="${self}" data-hovercard-id="${self}">Sender</span>`;
    dialog.append(summary);
  }
  const sent = [];
  const fills = [];
  let savedBody = '';
  let now = 0;
  let serial = 0;
  const timers = new Map();
  const timer = (fn, delay = 0, repeat = false) => {
    const id = ++serial;
    timers.set(id, { fn, at: now + Math.max(1, delay), delay, repeat });
    return id;
  };
  const chip = (kind, email) => {
    const el = document.createElement('span');
    el.setAttribute('data-hovercard-id', email);
    el.setAttribute('role', 'option');
    el.textContent = email;
    dialog.querySelector(`div[name=${kind}] [role=listbox]`).prepend(el);
  };
  for (const kind of ['to', 'cc', 'bcc']) {
    const input = dialog.querySelector(`div[name=${kind}] input`);
    input.value = '';
    input.addEventListener('keydown', event => {
      if (event.key === 'Enter' && input.value) {
        for (const email of input.value.split(/[,;\n]+/)) chip(kind, email.trim());
        input.value = '';
      }
    });
  }
  if (command === 'reply') chip('to', self);
  for (const [kind, emails] of Object.entries(options.extraRecipients || {})) {
    for (const email of emails) chip(kind, email);
  }
  editor.addEventListener('input', event => {
    // Gmail no longer serializes a textContent assignment + generic Event.
    if (event.inputType === 'insertText') savedBody = event.data;
  });
  if (options.hiddenAncestor) dialog.style.visibility = 'hidden';
  window.innerHeight = 800;
  window.HTMLElement.prototype.getBoundingClientRect = function () {
    const offscreen = options.offscreenToast && this.id === 'notification';
    return { width: 200, height: 30, top: offscreen ? -10000 : 10, bottom: offscreen ? -9970 : 40 };
  };
  window.getComputedStyle = el => ({ display: el.style.display || 'block', visibility: el.style.visibility || 'visible', opacity: '1' });
  window.location = { hash: command === 'reply' ? '#inbox/thread123' : '#inbox' };
  window.GLOBALS = [self];
  window.HTMLElement.prototype.scrollIntoView = function () {};
  window.HTMLElement.prototype.focus = function () {};
  window.HTMLElement.prototype.blur = function () {};
  dialog.querySelector('.aoO').addEventListener('click', () => {
    sent.push({ body: savedBody, subject: subject.value, at: now });
    if (options.dismiss !== false) dialog.style.display = 'none';
    const status = document.querySelector('#notification');
    if (options.confirm !== false) {
      status.innerHTML = 'Message sent <span role="link">Undo</span>';
      timer(() => { status.innerHTML = 'Message sent <span role="link">View message</span>'; }, 30000);
    }
  });
  if (options.staleToast) document.querySelector('#notification').textContent = 'Message sent';
  class ClockDate extends Date { static now() { return now; } }
  const context = vm.createContext({
    window, document, Date: ClockDate, MutationObserver: window.MutationObserver,
    Event: window.Event, KeyboardEvent: class extends window.Event {
      constructor(type, init) { super(type, init); Object.assign(this, init); }
    }, MouseEvent: window.Event, HTMLInputElement: window.HTMLInputElement,
    setTimeout: (fn, ms) => timer(fn, ms), clearTimeout: id => timers.delete(id),
    setInterval: (fn, ms) => timer(fn, ms, true), clearInterval: id => timers.delete(id),
    console, Blob, File, atob,
  });
  const expand = (text, js = false) => text.replace(/\{\{args\.(\w+)\}\}/g, (_, key) => {
    const value = String(args[key] ?? '');
    return js ? JSON.stringify(value).slice(1, -1) : value;
  });
  async function settle(promise) {
    let complete = false;
    let value, failure;
    Promise.resolve(promise).then(result => { value = result; complete = true; }, error => { failure = error; complete = true; });
    for (let i = 0; !complete && i < 5000; i++) {
      await new Promise(resolve => setImmediate(resolve));
      if (complete) break;
      const next = [...timers].sort((a, b) => a[1].at - b[1].at)[0];
      assert.ok(next, 'Adapter stalled without a timer');
      const [id, task] = next;
      now = task.at;
      if (task.repeat) task.at += Math.max(1, task.delay);
      else timers.delete(id);
      task.fn();
    }
    assert.ok(complete, 'Adapter did not settle');
    if (failure) throw failure;
    return value;
  }
  let result, error, activeInput;
  try {
    for (const step of adapter.steps) {
      if (step.eval) {
        const script = fs.readFileSync(path.join(site, step.eval), 'utf8');
        result = await settle(vm.runInContext(expand(script, true), context));
      } else if (step.fill) {
        const el = document.querySelector(step.fill.selector);
        assert.ok(el, `Native fill target missing: ${step.fill.selector}`);
        activeInput = el;
        const value = expand(step.fill.value);
        if (el.tagName === 'INPUT') el.value = value;
        else {
          // Actual Chromium native-input shape, including empty DIV/BR lines.
          const lines = value.replace(/\r\n?/g, '\n').split('\n');
          el.textContent = lines[0];
          if (!lines[0] && lines.length > 1) el.append(document.createElement('br'));
          for (const line of lines.slice(1)) {
            const div = document.createElement('div');
            if (line) div.textContent = line;
            else div.append(document.createElement('br'));
            el.append(div);
          }
          if (options.nativeBodyHTML !== undefined) el.innerHTML = options.nativeBodyHTML;
        }
        const event = new window.Event('input', { bubbles: true });
        event.inputType = 'insertText';
        event.data = value;
        el.dispatchEvent(event);
        fills.push({ selector: step.fill.selector, value });
        options.afterFill?.({ document, dialog, editor, subject });
      } else if (step.click) {
        const el = document.querySelector(step.click);
        assert.ok(el, `Native click target missing: ${step.click}`);
        activeInput = el;
        el.click();
      } else if (step.press === 'Enter') {
        const event = new window.Event('keydown', { bubbles: true });
        event.key = 'Enter';
        activeInput.dispatchEvent(event);
      } else throw new Error(`Unimplemented fixture step: ${JSON.stringify(step)}`);
    }
  } catch (caught) { error = caught; }
  return { result, error, sent, fills, document, now, adapter };
}

test('send delivers the supplied multi-line body via native input', async () => {
  const run = await runAdapter('send');
  assert.ifError(run.error);
  assert.equal(run.sent.length, 1, JSON.stringify(run.result));
  assert.equal(run.sent[0].body, 'line one\n\nline three');
});

test('reply delivers the supplied body via native input', async () => {
  const run = await runAdapter('reply');
  assert.ifError(run.error);
  assert.equal(run.sent.length, 1, JSON.stringify(run.result));
  assert.equal(run.sent[0].body, 'line one\n\nline three');
});

for (const command of ['send', 'reply']) {
  test(`${command}: editor dismissal alone is not evidence of sending`, async () => {
    const run = await runAdapter(command, {}, { confirm: false });
    assert.ifError(run.error);
    assert.equal(run.result.sent, false);
    assert.equal(run.result.status, 'send_unconfirmed');
    assert.equal(run.result.retrySafe, false);
  });
  test(`${command}: auto-created tabs are retained`, async () => {
    const adapter = YAML.parse(fs.readFileSync(path.join(site, `${command}.yaml`), 'utf8'));
    assert.equal(adapter.keep_tab, true);
    assert.ok(adapter.timeout >= 120);
  });
  test(`${command}: sent requires a fresh confirmation after Undo ends`, async () => {
    const run = await runAdapter(command);
    assert.ifError(run.error);
    assert.equal(run.result.sent, true, JSON.stringify(run.result));
    assert.equal(run.result.confirmation.type, 'gmail_message_sent_after_undo');
    assert.ok(run.result.confirmation.waitedMs >= 30000);
  });
  test(`${command}: unchanged stale toast cannot confirm a send`, async () => {
    const run = await runAdapter(command, {}, { confirm: false, staleToast: true });
    assert.ifError(run.error);
    assert.equal(run.result.sent, false);
    assert.equal(run.result.status, 'send_unconfirmed');
  });
  test(`${command}: an unrelated toast with the editor still open is not success`, async () => {
    const run = await runAdapter(command, {}, { dismiss: false });
    assert.ifError(run.error);
    assert.equal(run.result.sent, false);
  });
  for (const field of ['to', 'cc', 'bcc', 'subject', 'body']) {
    test(`${command}: ${field} mismatch aborts before clicking Send`, async () => {
      const run = await runAdapter(command, {}, { afterFill({ document, dialog, editor, subject }) {
        if (field === 'body') editor.textContent = 'corrupted body';
        else if (field === 'subject') {
          if (command === 'send') subject.value = 'different subject';
          else document.querySelector('h2.hP').textContent = 'different subject';
        } else {
          const el = document.createElement('span');
          el.setAttribute('data-hovercard-id', 'unexpected@example.com');
          dialog.querySelector(`div[name=${field}]`).append(el);
        }
      } });
      assert.ifError(run.error);
      assert.equal(run.sent.length, 0);
      assert.equal(run.result.status, 'validation_failed');
      assert.match(run.result.error, new RegExp(field));
    });
  }
  test(`${command}: collapsed summary duplicates are not extra recipients`, async () => {
    const run = await runAdapter(command, {}, { recipientSummary: true });
    assert.ifError(run.error);
    assert.equal(run.result.sent, true, JSON.stringify(run.result));
  });
  test(`${command}: offscreen aria-live text cannot confirm a send`, async () => {
    const run = await runAdapter(command, {}, { offscreenToast: true });
    assert.ifError(run.error);
    assert.equal(run.result.sent, false);
  });
  test(`${command}: visible descendants can override ancestor visibility`, async () => {
    const run = await runAdapter(command, {}, { hiddenAncestor: true });
    assert.ifError(run.error);
    assert.equal(run.result.sent, true, JSON.stringify(run.result));
  });
  test(`${command}: incomplete existing attachment never sends`, async () => {
    const run = await runAdapter(command, {}, { incompleteAttachment: true });
    assert.ok(run.error, JSON.stringify(run.result));
    assert.match(run.error.message, /attachment upload did not complete/);
    assert.equal(run.sent.length, 0);
  });
  test(`${command}: CRLF and blank lines survive native input`, async () => {
    const run = await runAdapter(command, { body: 'first\r\n\r\nlast\n' });
    assert.ifError(run.error);
    assert.equal(run.sent[0].body, 'first\r\n\r\nlast\n');
  });
  for (const [body, nativeBodyHTML] of [
    ['\n', '<div><br></div><div><br></div>'],
    ['', '<div><br></div>'],
    ['\nfirst\n\n', '<br><div>first</div><div><br></div><div><br></div>'],
  ]) {
    test(`${command}: observed Chromium markup preserves ${JSON.stringify(body)}`, async () => {
      const run = await runAdapter(command, { body }, { nativeBodyHTML });
      assert.ifError(run.error);
      assert.equal(run.result.sent, true, JSON.stringify(run.result));
    });
  }
  for (const body of ['', '\n', '\nfirst\n\n', 'one\n\n\nfour', '中文 ✓\nnext']) {
    test(`${command}: native DIV/BR serialization preserves ${JSON.stringify(body)}`, async () => {
      const run = await runAdapter(command, { body });
      assert.ifError(run.error);
      assert.equal(run.result.sent, true, JSON.stringify(run.result));
      assert.equal(run.sent[0].body, body);
    });
  }
}

test('send: Bcc-only optional header does not fall into the Cc input slot', async () => {
  const run = await runAdapter('send', { bcc: 'copy@example.com' });
  assert.ifError(run.error);
  assert.equal(run.result.sent, true, JSON.stringify(run.result));
});

test('send: all supplied recipient groups are read back', async () => {
  const run = await runAdapter('send', { to: `${self}; second@example.com`, cc: 'copy@example.com', bcc: 'blind@example.com' });
  assert.ifError(run.error);
  assert.equal(run.result.sent, true, JSON.stringify(run.result));
});

test('send: pre-existing recipients are not silently reused or appended to', async () => {
  const run = await runAdapter('send', {}, { extraRecipients: { bcc: ['unexpected@example.com'] } });
  assert.ok(run.error);
  assert.equal(run.sent.length, 0);
});

test('reply: invalid row ID never falls back to replying to the current thread', async () => {
  const run = await runAdapter('reply', { id: '999' });
  assert.ok(run.error);
  assert.equal(run.sent.length, 0);
});

test('reply: a stale view after hash navigation never sends', async () => {
  const run = await runAdapter('reply', { id: 'different-thread' });
  assert.ok(run.error);
  assert.equal(run.sent.length, 0);
});

test('reply: hidden cached thread headings and triggers are ignored', async () => {
  const run = await runAdapter('reply', {}, { hiddenCachedView: true });
  assert.ifError(run.error);
  assert.equal(run.result.sent, true, JSON.stringify(run.result));
  assert.equal(run.result.subject, 'Regression subject');
});

test('reply: a numeric ID cannot select a hidden cached mailbox row', async () => {
  const run = await runAdapter('reply', { id: '1' }, { hiddenCachedView: true });
  assert.ok(run.error);
  assert.match(run.error.message, /requested reply row not found/);
  assert.equal(run.sent.length, 0);
});

test('reply: the effective Re: subject is verified, not confused with the thread heading', async () => {
  const run = await runAdapter('reply', {}, { replySubjectBox: true });
  assert.ifError(run.error);
  assert.equal(run.result.sent, true, JSON.stringify(run.result));
  assert.equal(run.result.subject, 'Re: Regression subject');
});

test('reply: missing Reply all never silently falls back to Reply', async () => {
  const run = await runAdapter('reply', { reply_all: true }, { noReplyAll: true });
  assert.ok(run.error);
  assert.equal(run.sent.length, 0);
});
