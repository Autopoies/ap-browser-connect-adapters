# Google Docs adapter (`google-docs`)

Reads and edits Google Docs **documents** in the user's logged-in Chrome.
Type-locked: every command starts with `lib.js`, which throws unless the target
is `docs.google.com/document/d/<id>`. Sheets, Slides, Forms and Drawings URLs,
tabs and IDs are rejected (`TYPE_MISMATCH` / `EXPORT_FAILED`); `--type` accepts
only `document` (`UNSUPPORTED_TYPE` otherwise). Every result carries
`doc_type: "document"`.

## Commands

| Command | Kind | What it does |
| --- | --- | --- |
| `status` | read | title, mode, save state, tabs, pending suggestion/comment counts |
| `read` | read | Markdown (default), `--as text`, or `--as blocks` (raw JSON blocks incl. empty `<p>` / `\u00a0`); `--preserve_ws true`, `--section <heading>` |
| `outline` | read | headings with levels and `#heading=` deep links |
| `comments` | read | open comments with anchored context; live threads + pending suggestions when the doc is open |
| `find <text>` | read (live) | exact, case-sensitive match count in the live document (`--regex true` for Docs regex / `\n` / whitespace) |
| `replace <find> --with <text>` | write | replace a unique match; `--all true` for every match; `--delete true` to remove; `--regex true` for Docs regex (`\n`, `\s+`, NBSP) |
| `insert <text> --after <anchor>` | write | insert right after a unique anchor; `--html true` for rich content |
| `append <text>` | write | new paragraph(s) at the end; `--html true` for rich content; `--no_leading_newline true` if the doc already ends in an empty paragraph |
| `format <anchor> ...` | write | `--style`, `--font`, `--size`, `--bold/--italic/--underline true|false`, `--text_color`, `--highlight`, `--cell_color`, `--clear true` |
| `comment <text> --on <anchor>` | write | comment anchored on a unique text |
| `mode <suggest|edit|view>` | write | switch the editor mode |

`read`/`outline`/`comments` take `--doc_tab <t.N>` for multi-tab documents
(not `--tab`, which is the CLI's browser-tab flag; `--format` is likewise the
CLI's — `read` uses `--as`). All take `--doc <url|id>` (default: the operated tab's document) and
`--type document`.

**Use flags for everything except the first argument.** Each command declares
exactly one `required` arg because the CLI maps positionals onto required args
in no fixed order; a second positional could swap with the first.

## Write contract

- **Default mode is `suggest`**: changes become suggestions a human accepts or
  rejects. `--mode edit` changes the document directly. The editor is left in
  the mode the command used; `previous_mode` is reported.
- **Anchors are exact text**: case-sensitive, single line, cannot span
  paragraphs, and must match exactly once (`AMBIGUOUS` reports the count,
  `NOT_FOUND` otherwise). Text struck out by a pending suggestion no longer
  matches; text added by one does, but an anchor that straddles the edge of a
  pending suggestion may not — anchor on one side of it.
- A command that fails after its mode step (e.g. `AMBIGUOUS`) leaves the
  editor in the requested mode; nothing else is changed.
- **Verified, fail-closed**: fields, mode and match count are re-read before
  the destructive click. Results report `status` and `verified`. On
  `unverified`, check with `find`/`read` before retrying — a blind retry can
  duplicate text.
- **Writes need the document open in the operated tab.** A tab showing a
  *different* document is never navigated (`DOC_MISMATCH`); a non-document Docs
  page (what an auto-opened tab lands on) is sent to `--doc`. Prefer opening the
  document once and passing `--tab <id>`; writes set `keep_tab: true` so a
  pending save is not cut off.
- Works in background (`--silent`) tabs.
- A human typing in the same tab at the same moment can race the adapter; the
  pre-click re-checks catch most of it, `verified` reports the rest.

### Rich content and tables

- `insert`/`append --html true` paste an HTML fragment: `<b>`, `<i>`, inline
  `style="color:…"`, links, lists, headings and whole `<table>`s with
  `background-color` cells arrive formatted.
- Table layout defaults (Docs supplies none for pasted HTML): a `<table>`
  without a width gets `width:100%` — otherwise columns collapse to ~33pt and
  text wraps one character per line; a fragment that never mentions `border`
  gets `border="1"` — otherwise the grid is invisible. Set
  `<td style="width:160pt">`, `<col width>` or `style="border:…"` to override.
- With `insert --html`, the fragment's first block joins the anchor's
  paragraph (no space is added); `append --html` starts a new paragraph.
- `verified` proves the content landed, not how it looks. After layout-heavy
  writes (tables, cell colors) check the rendering:
  `ap-browser screenshot --tab <id> --out <file>`.
- Text inside existing table cells is edited with `replace`/`insert` like any
  other text. `format --cell_color` colors the cell containing the anchor (one
  cell per call). Colors snap to the nearest of the 80 standard palette
  swatches; `applied` reports the color actually used.
- `format --font` takes a family listed in the document's own font menu (the
  "More fonts" picker is not driven); `--size` takes a size-menu preset;
  `--style` (normal, title, subtitle, h1–h6) applies to the anchor's whole
  paragraph and is matched by menu position, not label. Each reports
  `applied` and is verified against the toolbar readout.
- Not supported: adding/removing rows or columns, merging cells, borders,
  column widths, alignment, images, fonts outside the menu, arbitrary sizes.

## How it works (selectors and pitfalls)

**Read path** — same-origin `GET /document/d/<id>/export?format=html[&tab=t.0]`.
- `format=md|txt` redirect cross-origin and fail from the page; Markdown is
  built from the HTML.
- The page enforces Trusted Types: `DOMParser` throws. Use
  `XMLHttpRequest` with `responseType = "document"`.
- Inline formatting is in generated classes (`.c7{font-weight:700}`), resolved
  from the export's `<style>`.
- Comments: `sup > a#cmnt_refN` marks the anchor end, footer
  `div > p > a#cmntN` holds the body. No authors — those come from the live
  sidebar (`.docos-anchoreddocoview`; suggestions have `.docos-accept-suggestion`).
- Pending suggestions are **not** in the export (it shows the unaccepted text).
- The export is rate limited per document (HTTP 429 after roughly ten calls in
  a minute); verification samples it at most every 2.5 s. When it is throttled,
  direct edits are confirmed by the save indicator leaving and re-entering
  "saved" (`verified_by: save_indicator` — proves a change was saved, not which).

**Write path** — the page body is a canvas; nothing is done by DOM mutation.
- Synthetic `KeyboardEvent`s and synthetic menu-item clicks are ignored by
  Docs. Menus are opened and items chosen with native `click` steps; an eval
  step in between tags the item (`data-apb-gdocs-click`).
- Items are identified without localized labels: accelerator text
  (`…+H` Find and replace, `⌘A`/`Ctrl+A` Select all, `…+Option/Alt+M` Comment),
  mode icons (`.docs-icon-edit-20`, `.docs-icon-rate-review-20`,
  `.docs-icon-editors-ia-view-show`), toolbar ids (`#boldButton`,
  `#textColorButton`, `#bgColorButton`, `#cellColorMenuButton`,
  `#docs-font-family`, `#fontSizeSelect`, `#headingStyleSelect`).
- Current mode: `#docs-toolbar-mode-switcher` class `edit-mode|suggest-mode|view-mode`.
- Find and replace dialog: `.appsDocsUiWizFindandreplacedialogContainer`
  (stays in the DOM with `visibility:hidden` when closed). Two text inputs
  (find, replace), buttons in order Replace / Replace all / Previous / Next,
  first checkbox = Match case, counter
  `.appsDocsUiWizFindandreplacedialogFindInputCounter` ("1 of 11" — the last
  number is the total; "0 of 0" also flashes while a search is running).
- Closing the dialog with Escape leaves the current match selected with focus
  in the editor: that is the selection primitive for insert/format/comment.
- Text enters through a `paste` ClipboardEvent on the
  `iframe.docs-texteventtarget-iframe` contenteditable (`text/plain`, or
  `text/html` for rich content). Newlines become paragraph breaks.
- Saved state: `.docs-icon-cloud-check-20` inside the save indicator.
- Sync `throw` in an eval surfaces as a bare "Uncaught"; scripts are `async`
  so the error message reaches the caller.

Verified on macOS Chrome, English UI. Windows/Linux accelerators (`Ctrl+…`)
are matched by the same patterns but untested.
