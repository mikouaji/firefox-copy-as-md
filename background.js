const api = globalThis.browser ?? globalThis.chrome;

api.runtime.onMessage.addListener(async (msg) => {
  if (msg?.type !== "copy-as-md:save") return;
  const blob = new Blob([msg.text], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const id = await api.downloads.download({
    url,
    filename: msg.filename,
    saveAs: true,
  });
  const cleanup = (delta) => {
    if (delta.id !== id || !delta.state || delta.state.current === "in_progress") return;
    URL.revokeObjectURL(url);
    api.downloads.onChanged.removeListener(cleanup);
  };
  api.downloads.onChanged.addListener(cleanup);
});

api.action.onClicked.addListener(async (tab) => {
  if (!tab?.id) return;
  await api.scripting.insertCSS({
    target: { tabId: tab.id },
    files: ["content/picker.css"],
  });
  await api.scripting.executeScript({
    target: { tabId: tab.id },
    files: [
      "vendor/turndown.js",
      "vendor/turndown-plugin-gfm.js",
      "content/picker.js",
    ],
  });
});
