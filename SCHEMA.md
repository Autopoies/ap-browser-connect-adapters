# Adapter YAML Schema Reference

This document defines the schema for `ap-browser` site adapters. Adapters are written in YAML and define the arguments, inputs, outputs, and browser automation steps required to execute a command.

## Top-level fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `site` | String | Yes | The site identifier. Must exactly match the parent folder name. |
| `name` | String | Yes | The command name. Must exactly match the filename (without `.yaml`). |
| `description` | String | No | A brief description of what the adapter does. |
| `domain` | String | No | The primary domain for the site (e.g., `news.ycombinator.com`). |
| `args` | Map | No | Definitions for CLI arguments accepted by this adapter. |
| `input` | Object | No | Configuration for reading piped NDJSON input. |
| `output` | Object | No | Configuration for the output format. |
| `columns` | List[String] | No | Preferred column order for tabular output formats. |
| `steps` | List[Map] | Yes | The sequence of browser automation steps to execute. |

### `args` Definition

Each key in the `args` map is the argument name (passed via `--name`).

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `type` | String | Yes | The argument type. Allowed values: `string`, `int`, `bool`. |
| `required` | Boolean | No | Whether the argument is required. Default is `false`. |
| `default` | Any | No | The default value if not provided. |
| `desc` | String | No | A description of the argument for help text. |

### `input` Definition

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `field` | String | No | The field name in the incoming NDJSON object to map to an argument. If omitted, the entire object is mapped to `_input`. |

### `output` Definition

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `type` | String | No | The output type. Default is `object`. |
| `fields` | List[String] | No | The fields to include in the output. |

## Step primitives

The `steps` array contains a list of single-key maps, where the key is the method name and the value is either a string (shorthand) or an object with parameters.

| Method | Parameters | Description |
|--------|------------|-------------|
| `goto` | `url` (String) | Navigates the browser to the specified URL. |
| `wait` | `selector` (String)<br>`timeout_ms` (Int, default 5000) | Waits for the specified CSS selector to appear in the DOM. |
| `eval` | `expression` (String) | Evaluates JavaScript in the page context. If the string ends with `.js` and has no newlines, it loads the script from the site folder. |
| `text` | `selector` (String, default `body`) | Extracts the text content of the specified selector. |
| `click` | `selector` (String) | Clicks the element matching the specified selector. |
| `fill` | `selector` (String)<br>`value` (String) | Fills the input element matching the selector with the specified value. |
| `press` | `keys` (String) | Presses the specified keyboard keys (e.g., `Enter`). |
| `scroll` | `count` (Int, default 1)<br>`pause_ms` (Int, default 800)<br>`selector` (String, optional) | Scrolls the page or a specific element down `count` times, pausing for `pause_ms` between scrolls. |

## Template syntax

You can inject argument values into step parameters using the `{{args.NAME}}` syntax.

- **Standard interpolation**: `{{args.query}}`
- **Arithmetic evaluation**: `{{eval args.page + 1}}` (Supports `+`, `-`, `*`, `/`. The referenced argument must be of type `int`).

### Context-aware encoding

The template engine automatically encodes values based on the step context:
- **URL context (`goto`)**: Values are automatically percent-encoded (equivalent to `encodeURIComponent`).
- **JavaScript context (`eval`)**: Values are automatically JSON-stringified to prevent injection and syntax errors.

## Pipe composition

Adapters can be composed using standard Unix pipes. The CLI communicates using NDJSON (Newline Delimited JSON).

When an adapter receives piped input (or is run with `--read-stdin`), it executes its steps once for each line of NDJSON received.

If the adapter defines `input.field: "url"`, and the incoming NDJSON is `{"url": "https://example.com", "title": "Example"}`, the `url` argument will be automatically populated with `"https://example.com"`.

## Example adapter

Here is a complete, working example of an adapter (`hackernews/top.yaml`):

```yaml
site: hackernews
name: top
description: Fetch top stories from Hacker News
domain: news.ycombinator.com
args:
  limit:
    type: int
    default: 10
    desc: Maximum number of stories to fetch
steps:
  - goto: "https://news.ycombinator.com/"
  - wait: ".athing"
  - eval: |
      (() => {
        const limit = {{args.limit}};
        const rows = Array.from(document.querySelectorAll('.athing')).slice(0, limit);
        return rows.map(row => {
          const titleEl = row.querySelector('.titleline a');
          const subtext = row.nextElementSibling;
          const scoreEl = subtext ? subtext.querySelector('.score') : null;
          return {
            title: titleEl ? titleEl.innerText : '',
            url: titleEl ? titleEl.href : '',
            score: scoreEl ? parseInt(scoreEl.innerText) : 0
          };
        });
      })()
```

## Linting

You can verify your adapter against the schema using the built-in linter:

```bash
ap-browser sites lint hackernews
```

The linter performs two phases:
1. **Static lint**: Checks schema compliance, argument types, required fields, and template variable resolution.
2. **Live verify**: Performs a dry-run expansion of templates and executes the steps step-by-step in a real browser to verify selectors and JavaScript execution. If a selector fails, it will attempt to suggest similar valid selectors from the live page.
