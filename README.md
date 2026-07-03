# Autopoies Browser Connect Adapters

Official site-adapter library for Autopoies Browser Connect. Drop-in YAML commands for popular websites.

This repository contains the official collection of site adapters for `ap-browser`. By cloning this repository into your local configuration directory, you instantly gain named, site-specific commands that interact with websites using stable, tested selectors.

## What it gives you

Instead of writing raw CDP scripts or complex Playwright code, you get simple, semantic commands:

```bash
# Fetch the top stories from Hacker News
ap-browser hackernews top

# Search GitHub repositories
ap-browser github search "rust web framework"

# Get trending crates from crates.io
ap-browser crates-io trending
```

## Install

To install the adapters, clone this repository directly into the `ap-browser` sites directory:

```bash
mkdir -p ~/.ap-browser
git clone https://github.com/autopoies/ap-browser-connect-adapters ~/.ap-browser/sites
ap-browser sites list
```

## Available sites

The library currently includes knowledge and adapters for the following sites:

| Site | Description |
|------|-------------|
| `arxiv` | Search and extract papers from arXiv.org |
| `bbc` | Read news articles from BBC |
| `bilibili` | Search and interact with Bilibili videos |
| `crates-io` | Search Rust packages on crates.io |
| `douban` | Search movies, books, and music on Douban |
| `github` | Search repositories and view trending projects on GitHub |
| `hackernews` | Read top stories and comments on Hacker News |
| `hf` | Search models and datasets on Hugging Face |
| `linux-do` | Interact with the LINUX DO community |
| `lobsters` | Read stories from Lobsters |
| `npm` | Search JavaScript packages on npmjs.com |
| `reddit` | Read posts and comments from Reddit |
| `stackoverflow` | Search questions and answers on Stack Overflow |
| `steam` | Search games and view store pages on Steam |
| `v2ex` | Read topics from V2EX |
| `wikipedia` | Search and read Wikipedia articles |
| `youtube` | Search and interact with YouTube videos |
| `zhihu` | Search and read questions/answers on Zhihu |

## Anatomy of an adapter

An adapter is a simple YAML file that defines arguments and a sequence of browser automation steps (like `goto`, `wait`, `click`, `eval`). 

For example, a `hackernews top` adapter lives at `hackernews/top.yaml` and defines how to navigate to `news.ycombinator.com`, wait for the `.athing` selector, and evaluate JavaScript to extract the stories.

For the complete schema reference, see [SCHEMA.md](SCHEMA.md).

## Contributing

We welcome contributions for new sites and new commands for existing sites!

1. **How to add a new site**: Read [create-site.md](create-site.md) for the agent workflow guide. It explains how to probe for stable selectors and document site knowledge before writing the YAML.
2. **YAML lint CI requirement**: All PRs must pass the strict YAML schema linter. You can run this locally with `ap-browser sites lint <site>`.
3. **PR template expectations**: Ensure your PR includes a description of the site, the commands added, and confirmation that you have tested the adapter locally.

## Relationship to ap-browser-connect

These adapters are runtime-loaded by the `ap-browser` CLI directly from `~/.ap-browser/sites/`. There is no build-time coupling between the CLI and this repository. The schema source of truth lives here in `scripts/` (coming soon), ensuring the adapters remain independent of the core CLI release cycle.

## License

Apache-2.0
