# Copy as Markdown

A Firefox extension that lets you click any element on a webpage and copy it as Markdown.

Click the toolbar icon, hover any element (it gets outlined), click to copy. A toast confirms the copy and offers a **Save** button to download the Markdown as a `.md` file. Press `Esc` to cancel.

## Setup

<video src="docs/setup.mp4" controls width="720"></video>

Install the extension from the [Firefox Add-ons store](https://addons.mozilla.org/) and pin it to the toolbar.

## Usage

<video src="docs/usage.mp4" controls width="720"></video>

1. Click the toolbar icon to enter pick mode.
2. Hover — the element under your cursor gets a yellow outline.
3. Click — the element's contents are converted to Markdown and copied to your clipboard.
4. The confirmation toast has a **Save** button if you want to save it as `<hostname>-<tag>-<id-or-class>.md` instead of (or in addition to) copying.
5. `Esc` cancels pick mode.

## Development

Requires Node 20+ and `web-ext` installed globally (`npm install -g web-ext`).

```bash
npm install
npm run vendor    # copies and minifies turndown + gfm plugin into vendor/
npm start         # launches Firefox with the extension loaded (web-ext run)
npm run build     # produces web-ext-artifacts/*.zip for AMO upload
npm run lint      # sanity-checks the manifest
```

## AI notice

Implementation of this extension was heavily assisted by Anthropic's Claude Opus 4.7 via Claude Code on medium reasoning.

## License

[MIT](./LICENSE)
