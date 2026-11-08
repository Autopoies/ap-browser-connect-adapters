# Gmail sending contract

`send` and `reply` use the CLI's native `fill` step (`Input.insertText`) for
message bodies. `send` also uses native input for recipients and subject.
Bodies are plain text; line breaks are preserved (CRLF is compared as LF).

Before Send, the adapters compare the committed To/Cc/Bcc addresses, subject,
and body with the expected values. For replies, Gmail chooses recipients from
the selected thread and reply mode; the adapter snapshots those chips before
uploading and requires the same recipients at submission. Unknown recipient
markup or uncommitted addresses fail closed. Use a fresh compose window for
`send`; it refuses to append to existing recipients.

Attachments must have a completed matching chip/link or bound attachment ID,
with no active upload progress. Merely waiting a fixed number of seconds is
not proof of upload completion.

## Foreground compose and Gmail clicks

`send` requires a foreground, visible Gmail tab. It refuses immediately when
`document.hidden` is true: silent/background windows leave inline compose
minimized on current Gmail. Open the tab without `--silent`, then pass its ID
explicitly:

```sh
TAB=$(ap-browser tabs new 'https://mail.google.com/mail/u/0/#inbox' --profile PROFILE | jq -r '.data.id')
ap-browser gmail send recipient@example.com --subject 'Subject' --body 'Body' \
  --attachment_name report.pdf --attachment_type application/pdf \
  --attachment_content "$(base64 < report.pdf | tr -d '\n')" \
  --profile PROFILE --tab "$TAB"
```

Use a non-empty subject: exact-subject Sent verification is part of success.
Gmail's compose expansion and Send use scoped synthetic `element.click()`;
Cc/Bcc links use synthetic Enter. The generic native mouse path currently
delivers trusted down/up events to Gmail without synthesizing `click`.
Recipient, subject and body values still use native `fill` plus read-back.

## Results and tab ownership

- `sent: true`, `status: sent`: a **fresh, visible** Gmail Message sent
  notification was observed after Undo disappeared, and a newly rendered row
  with the exact non-empty subject was found by an `in:sent` search. The
  `sent_search` field contains the query, matching subjects and thread IDs.
  If Undo was never seen, the notification must still be visible at least 35
  seconds after Send (beyond Gmail's maximum 30-second Undo Send setting).
- `sent: false`, `status: validation_failed`: Send was **not** clicked. The
  result names the mismatched fields.
- `sent: false`, `status: send_unconfirmed`, `retrySafe: false`: Send was
  clicked but delivery is uncertain. **Do not automatically resend.** Keep
  the tab open and inspect Sent or open the received message.
- Preparation/native-input errors stop the batch without clicking Send.

Closing an editor is not send evidence. Neither is an unchanged old toast,
message-body text, Gmail's offscreen accessibility announcement mirror, or a
stale row left over from the previous list. Unrecognized/localized
confirmation UI, an empty subject, or a missing fresh `in:sent` row returns
`send_unconfirmed`, never a fabricated success. The selected tab remains on
the Sent search after verification.

Both adapters declare `keep_tab: true` and a 150-second request budget. An
auto-created tab remains open on success, uncertainty, or error; its ID is in
response `meta.tab_id` with `meta.session_persisted`. Explicit `--tab` tabs are
also left open. After verifying delivery, the caller can close **its own** tab.
Do not override this with `--no-keep-tab` while sending.

## Regression tests (no live mail)

With Node.js 20.19+ and Python's `pyyaml`/`jsonschema` installed, from the repository root:

```sh
npm ci --ignore-scripts
npm test
python3 scripts/lint_adapters.py sites/
python3 -m unittest discover -s tests
```

The Node tests execute the real YAML pipelines and JavaScript in a simulated
Gmail DOM/controller with a deterministic clock. Native input and Gmail's
service are boundary doubles; live verification is still required for selector
changes. Tests never contact Gmail or send mail.
