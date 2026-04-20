(() => {
  if (window.__copyAsMdActive) {
    window.__copyAsMdCancel?.();
    return;
  }
  if (typeof TurndownService === "undefined") return;
  window.__copyAsMdActive = true;

  const td = new TurndownService({
    headingStyle: "atx",
    codeBlockStyle: "fenced",
    bulletListMarker: "-",
    emDelimiter: "_",
  });
  const gfm = window.turndownPluginGfm ?? window.TurndownPluginGfm;
  if (gfm?.gfm) td.use(gfm.gfm);

  let hovered = null;

  const clearHover = () => {
    if (hovered) hovered.classList.remove("__copy-as-md-hover");
    hovered = null;
  };

  const onMove = (e) => {
    const el = document.elementFromPoint(e.clientX, e.clientY);
    if (!el || el === hovered) return;
    if (el.closest(".__copy-as-md-toast")) return;
    clearHover();
    hovered = el;
    hovered.classList.add("__copy-as-md-hover");
  };

  const onClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const target = hovered ?? e.target;
    const at = { x: e.clientX, y: e.clientY };
    clearHover();
    cleanup();
    if (!target) return;
    try {
      const md = td.turndown(target.outerHTML).trim();
      if (!md) {
        flash("Nothing was copied", { variant: "error", at });
        return;
      }
      const ok = await copyToClipboard(md);
      if (!ok) {
        flash("Nothing was copied", { variant: "error", at });
        return;
      }
      const filename = buildFilename(target);
      flash("Copied as Markdown", {
        variant: "info",
        at,
        duration: 2000,
        action: {
          label: "Save",
          onClick: () => {
            const api = globalThis.browser ?? globalThis.chrome;
            api.runtime.sendMessage({ type: "copy-as-md:save", filename, text: md });
          },
        },
      });
    } catch {
      flash("Nothing was copied", { variant: "error", at });
    }
  };

  const buildFilename = (el) => {
    const parts = [location.hostname, el.tagName.toLowerCase()];
    if (el.id) parts.push(el.id);
    else if (el.classList.length) parts.push(el.classList[0]);
    const slug = parts
      .join("-")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80) || "element";
    return `${slug}.md`;
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {}
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.cssText = "position:fixed;top:0;left:0;opacity:0;pointer-events:none;";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      ta.remove();
      return ok;
    } catch {
      return false;
    }
  };

  const onKey = (e) => {
    if (e.key === "Escape") {
      e.preventDefault();
      cleanup();
      flash("Cancelled");
    }
  };

  const cleanup = () => {
    document.removeEventListener("mousemove", onMove, true);
    document.removeEventListener("click", onClick, true);
    document.removeEventListener("keydown", onKey, true);
    clearHover();
    document.documentElement.classList.remove("__copy-as-md-picking");
    window.__copyAsMdActive = false;
    window.__copyAsMdCancel = null;
  };

  const flash = (msg, opts = {}) => {
    const { variant = "info", at = null, duration = 1500, action = null } =
      typeof opts === "string" ? { variant: opts } : opts;
    const n = document.createElement("div");
    n.className = `__copy-as-md-toast __copy-as-md-toast--${variant}`;
    const label = document.createElement("span");
    label.textContent = msg;
    n.appendChild(label);
    if (action) {
      const btn = document.createElement("button");
      btn.className = "__copy-as-md-toast-btn";
      btn.type = "button";
      btn.textContent = action.label;
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        action.onClick();
        n.remove();
      });
      n.appendChild(btn);
      n.style.setProperty("pointer-events", "auto", "important");
    }
    if (at) {
      const pad = 12;
      const maxX = window.innerWidth - 240;
      const maxY = window.innerHeight - 40;
      const x = Math.max(pad, Math.min(at.x + 12, maxX));
      const y = Math.max(pad, Math.min(at.y + 12, maxY));
      n.style.setProperty("left", `${x}px`, "important");
      n.style.setProperty("top", `${y}px`, "important");
      n.style.setProperty("right", "auto", "important");
    }
    document.body.appendChild(n);
    setTimeout(() => n.remove(), duration);
  };

  window.__copyAsMdCancel = cleanup;
  document.documentElement.classList.add("__copy-as-md-picking");
  document.addEventListener("mousemove", onMove, true);
  document.addEventListener("click", onClick, true);
  document.addEventListener("keydown", onKey, true);
  flash("Pick mode — click an element to copy (Esc to cancel)");
})();
