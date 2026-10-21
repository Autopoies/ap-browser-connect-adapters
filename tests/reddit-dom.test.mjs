// Deterministic DOM fixtures model the live Shreddit structures observed on 2026-10-20.
// These tests execute the real adapter JS/YAML, but do not claim live site/network coverage.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';
import { parseHTML } from 'linkedom';
import { parse } from 'yaml';

const site = new URL('../sites/reddit/', import.meta.url);
const adapter = name => parse(readFileSync(new URL(`${name}.yaml`, site), 'utf8'));
const source = name => readFileSync(new URL(name, site), 'utf8');
function run(name, html, args = {}, path = '/r/test/comments/abc123/title/') {
  const definition = adapter(name);
  const values = Object.fromEntries(Object.entries(definition.args).map(([key, value]) => [key, value.default]));
  Object.assign(values, args);
  const { document } = parseHTML(`<html><head></head><body>${html}</body></html>`);
  const step = definition.steps.filter(step => step.eval).at(-1).eval;
  const script = source(step).replace(/\{\{args\.(\w+)\}\}/g, (_, key) => String(values[key] ?? ''));
  const result = vm.runInNewContext(script, {
    document, URL, location: new URL(path, 'https://www.reddit.com'),
    fetch() { throw new Error('DOM adapters must not request a JSON endpoint'); },
  }, { timeout: 1000 });
  return JSON.parse(JSON.stringify(result));
}
const post = (id, extras = '') => `<shreddit-post post-title="Post ${id}" permalink="/r/test/comments/${id}/title/" content-href="https://example.org/${id}" author="writer" score="0" comment-count="12" subreddit-prefixed-name="r/test" created-timestamp="2026-10-20T12:00:00.000+0000" ${extras}><div slot="text-body"><div class="md">Post body</div></div></shreddit-post>`;
const profileComment = (id, body = 'Actual comment body') => `<shreddit-profile-comment href="/r/test/comments/abc123/title/${id}/?context=3"><a href="/r/test/comments/abc123/title/"><h2>Parent post</h2></a><div class="md">${body}</div><shreddit-comment-action-row score="0"></shreddit-comment-action-row><time datetime="2026-10-20T12:00:00.000Z"></time><a href="/r/test/comments/abc123/title/${id}/?context=3">Reply</a></shreddit-profile-comment>`;

for (const name of ['hot', 'new', 'top', 'search']) {
  test(`${name} requests a normal page and loads enough opportunities for default limit 25`, () => {
    const definition = adapter(name);
    assert.ok(!definition.steps[0].goto.includes('.json'));
    assert.ok(!definition.steps.some(step => step.wait === 'pre'));
    const scrollIndex = definition.steps.findIndex(step => step.scroll);
    assert.ok(scrollIndex > 0, 'lazy feeds must be scrolled before extraction');
    assert.ok(scrollIndex < definition.steps.findIndex(step => step.eval));
    const count = definition.steps[scrollIndex].scroll.count;
    assert.match(String(count), /args\.limit/, 'scroll effort must scale with the requested limit');
    assert.ok(definition.steps[scrollIndex].scroll.pause_ms >= 800);
  });
}
for (const name of ['hot', 'new', 'top']) {
  test(`${name} reads real post attributes, skips skeletons/ads and deduplicates before limit`, () => {
    const rows = run(name, `<shreddit-post permalink="/r/test/comments/skeleton/title/"></shreddit-post>${post('ad', 'is-promoted')}${post('first')}${post('first')}${post('second')}`, { limit: 2 });
    assert.equal(rows.length, 2);
    assert.deepEqual(rows.map(row => row.title), ['Post first', 'Post second']);
    assert.equal(rows[0].score, '0');
    assert.equal(rows[0].num_comments, '12');
    assert.equal(rows[0].url, 'https://example.org/first');
    assert.equal(rows[0].permalink, 'https://www.reddit.com/r/test/comments/first/title/');
    assert.equal(rows[0].subreddit, 'test');
  });
}
test('search uses title links only, deduplicates absolute/relative links and reads exact counters', () => {
  const html = `<div data-testid="search-post-with-content-preview"><a href="/r/test/comments/abc123/title/"><img></a><h2><a data-testid="post-title" href="/r/test/comments/abc123/title/?context=1">Real title</a></h2><a data-testid="post-title-text" href="https://www.reddit.com/r/test/comments/abc123/title/">Real title</a><div data-testid="search-counter-row"><faceplate-number number="3513">3.5K</faceplate-number><faceplate-number number="184">184</faceplate-number></div><a href="/r/test/comments/abc123/title/reply/">Reply</a></div>`;
  const rows = run('search', html);
  assert.equal(rows.length, 1);
  assert.equal(rows[0].title, 'Real title');
  assert.equal(rows[0].permalink, 'https://www.reddit.com/r/test/comments/abc123/title/');
  assert.equal(rows[0].score, '3513');
  assert.equal(rows[0].num_comments, '184');
});
test('search does not interpret an isolated unlabeled counter as a score', () => {
  const rows = run('search', `<div data-testid="search-post-with-content-preview"><a data-testid="post-title" href="/r/test/comments/abc123/title/">Title</a><div data-testid="search-counter-row"><faceplate-number number="12">12</faceplate-number></div></div>`);
  assert.equal(rows[0].score, '');
  assert.equal(rows[0].num_comments, '');
});
test('user extracts comments as comments, never as empty Reply posts', () => {
  const rows = run('user', profileComment('reply1'));
  assert.equal(rows.length, 1);
  assert.equal(rows[0].kind, 'comment');
  assert.equal(rows[0].title, 'Parent post');
  assert.equal(rows[0].body, 'Actual comment body');
  assert.equal(rows[0].score, '0');
  assert.equal(rows[0].permalink, 'https://www.reddit.com/r/test/comments/abc123/title/reply1/');
  assert.equal(rows[0].created_utc, '2026-10-20T12:00:00.000Z');
});
test('user preserves mixed DOM order, link kind, post body and ISO timestamps', () => {
  const rows = run('user', profileComment('reply1') + post('ownpost') + profileComment('reply2'), { limit: 2 });
  assert.deepEqual(rows.map(row => row.kind), ['comment', 'link']);
  assert.equal(rows[1].body, 'Post body');
  assert.equal(rows[1].created_utc, '2026-10-20T12:00:00.000Z');
});
test('empty/hidden profiles never turn navigation or Reply links into entries', () => {
  assert.deepEqual(run('user', '<main><a href="/user/hidden/comments/">Comments</a><a href="/r/test/comments/abc123/title/reply/">Reply</a></main>'), []);
});
test('user limits comment body to the existing 500-character contract', () => {
  assert.equal(run('user', profileComment('reply1', 'x'.repeat(800)))[0].body.length, 500);
});
test('post keeps only owned top-level comment bodies, including AutoModerator, with ISO timestamps', () => {
  const html = post('abc123') + `<shreddit-comment author="AutoModerator" score="0" created="2026-10-20T12:00:00.000+0000"><div slot="comment"><div class="md">Pinned rule</div></div><shreddit-comment author="nested"><div class="md">Nested reply</div></shreddit-comment></shreddit-comment><shreddit-comment author="deleted"><shreddit-comment author="child"><div class="md">Not the deleted parent's body</div></shreddit-comment></shreddit-comment><shreddit-comment author="second" score="2"><div class="md">Second top-level</div></shreddit-comment>`;
  const result = run('post', html);
  assert.equal(result.title, 'Post abc123');
  assert.deepEqual(result.comments.map(comment => comment.author), ['AutoModerator', 'second']);
  assert.equal(result.comments[0].body, 'Pinned rule');
  assert.equal(result.comments[0].score, '0');
  assert.equal(result.comments[0].created_utc, '2026-10-20T12:00:00.000Z');
});
test('post does not treat a related post as the requested post', () => {
  const result = run('post', post('other') + post('abc123'));
  assert.equal(result.title, 'Post abc123');
});
test('post preserves body/comment size bounds', () => {
  const html = post('abc123').replace('Post body', 'x'.repeat(3000)) + `<shreddit-comment author="long"><div class="md">${'x'.repeat(1500)}</div></shreddit-comment>`;
  const result = run('post', html, { limit: 1 });
  assert.equal(result.body.length, 2000);
  assert.equal(result.comments[0].body.length, 1000);
});
test('rendered pages with HTML, not JSON, are valid data sources for all extractors', () => {
  for (const name of ['hot', 'new', 'top', 'search', 'user', 'post']) {
    assert.doesNotThrow(() => run(name, post('abc123') + profileComment('reply1')));
  }
});
test('zero limits return zero rows/comments', () => {
  for (const name of ['hot', 'new', 'top', 'search', 'user']) {
    assert.deepEqual(run(name, post('abc123') + profileComment('reply1'), { limit: 0 }), []);
  }
  assert.deepEqual(run('post', post('abc123'), { limit: 0 }).comments, []);
});
