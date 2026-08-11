# ap-browser-connect-adapters

Official site-adapter library for Autopoies Browser Connect. 43 sites, 200+ named commands. Drop into `~/.ap-browser/` and `ap-browser hackernews top` just works.

## Install

```bash
git clone https://github.com/autopoies/ap-browser-connect-adapters.git /tmp/abc-adapters
mkdir -p ~/.ap-browser && cp -R /tmp/abc-adapters/sites ~/.ap-browser/
cp /tmp/abc-adapters/download-config.yml ~/.ap-browser/
```

*(Note: Installing the product skill with `npx skills add autopoies/ap-browser-connect/skill` automates this. Manual clone is for users who want a specific subset of sites or prefer to manage updates themselves.)*

## Available sites

| Site | Description |
|---|---|
| `apple-podcasts` | Apple Podcasts search, charts, and episodes |
| `arxiv` | arXiv — open-access archive for scholarly articles in physics, math, CS, etc. |
| `barchart` | Barchart market quotes, options chains, and unusual options activity |
| `bbc` | BBC News — British public broadcaster |
| `bilibili` | Bilibili — Chinese video sharing platform |
| `bloomberg` | Bloomberg section headlines |
| `chaoxing` | 超星学习通 lists; requires login |
| `chatgpt` | ChatGPT web — send, read, status, model/mode/effort, upload; requires login |
| `crates-io` | crates.io — Rust package registry |
| `devto` | DEV Community — platform for developers to write and share articles |
| `douban` | 豆瓣电影 — 中文影评社区 |
| `facebook` | Facebook — social networking platform |
| `gist` | GitHub Gists — code snippet hosting |
| `github` | GitHub — code hosting platform |
| `google` | Google web and news search |
| `hackernews` | Hacker News — social news for tech |
| `hf` | Hugging Face — model / dataset / space hub |
| `instagram` | Instagram — photo and video sharing platform |
| `jike` | 即刻 search; public web often requires login |
| `linkedin` | LinkedIn — professional network |
| `linux-do` | LINUX DO — 中文技术社区 (Discourse) |
| `lobsters` | Lobsters — computing-focused community centered around link aggregation and discussion |
| `medium` | Medium articles and publication feeds |
| `npm` | npm — JavaScript package registry |
| `pypi` | PyPI — Python package registry |
| `reddit` | Reddit — community-driven link aggregation |
| `reuters` | Reuters news search |
| `sinablog` | Sina Blog hot index and search |
| `sinafinance` | 新浪财经 public finance headlines |
| `smzdm` | 什么值得买 deals and articles |
| `stackoverflow` | Stack Overflow — Q&A for programmers |
| `steam` | Steam — PC game store |
| `substack` | Substack post search and discovery |
| `tiktok` | TikTok — short-form video platform |
| `twitter` | X (formerly Twitter) — social media platform |
| `v2ex` | V2EX — creative worker community |
| `weread` | 微信读书 public web rankings and search |
| `wikipedia` | English Wikipedia — collaborative encyclopedia |
| `xiaoyuzhou` | 小宇宙播客 public web pages |
| `xueqiu` | 雪球 public stock pages; some endpoints may require login |
| `yahoo-finance` | Yahoo Finance stock quotes |
| `youtube` | YouTube — video sharing platform |
| `zhihu` | 知乎 — 中文问答社区。热榜与搜索需登录态。 |

## Anatomy of an adapter

Each command is a YAML file plus a sibling `.js` file in the same site folder. YAML defines args and steps; JS does DOM extraction. Reference the script with `eval: <file>.js`.

`sites/hackernews/top.yaml`:
```yaml
site: hackernews
name: top
description: Fetch top stories from the front page

args:
  limit:
    type: int
    default: 30
    desc: max number of stories per page
  page:
    type: int
    default: 1
    desc: page number (30 stories per page)

output:
  type: array
  fields: [rank, title, url, points, comments]

steps:
  - goto: "https://news.ycombinator.com/news?p={{args.page}}"
  - wait: ".athing"
  - eval: top.js
```

`sites/hackernews/top.js`:
```js
(() => {
  const limit = Number("{{args.limit}}") || 20;
  const rows = document.querySelectorAll(".athing");
  // ... extract rank, title, url, points, comments ...
  return out;
})();
```

See [SCHEMA.md](SCHEMA.md) for the full reference.

## Updating

If you cloned the repository directly into `~/.ap-browser/sites`:
```bash
cd ~/.ap-browser/sites && git pull
```
Otherwise, re-run the install copy commands to overwrite your local adapters with the latest versions.

## Contributing

To create a new site adapter, follow the [Adapter Authoring Guide](https://github.com/autopoies/ap-browser-connect/blob/main/skill/references/create-site.md).

Before submitting a PR, ensure your adapters pass the CI linter:
```bash
python scripts/lint_adapters.py sites/
```

## Relationship to ap-browser-connect

This repository provides the runtime data for the `ap-browser` CLI. The CLI loads these adapters dynamically from `~/.ap-browser/sites/` at runtime, meaning there is zero build-time coupling between the CLI and the adapters. The source of truth for the adapter schema is maintained here in `scripts/adapter-schema.json`.

## License

Apache-2.0
