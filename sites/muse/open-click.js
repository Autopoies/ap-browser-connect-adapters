(async () => {
  // Opens a thread row (main chat, side chat or channel) by index or name.
  // Index uses the same numbering as 'muse chats'. Name: exact match wins,
  // otherwise the shortest title containing the substring. Clicks only when the
  // row is not already the active one (idempotent).
  const idxRaw = "{{args.index}}";
  const index = idxRaw !== "" && idxRaw !== "null" && idxRaw !== "undefined" ? parseInt(idxRaw, 10) : -1;
  const name = "{{args.name}}".trim().toLowerCase();
  const threads = Array.from(document.querySelectorAll('[data-testid="hatch-thread-row"]'))
    .map((el) => ({ el, title: ((el.innerText || "").trim().split("\n")[0] || "").trim() }))
    .filter((t) => t.title.length > 0);

  let target = null;
  if (index >= 0 && index < threads.length) {
    target = threads[index];
  } else if (name) {
    const exact = threads.find((t) => t.title.toLowerCase() === name);
    const partial = threads
      .filter((t) => t.title.toLowerCase().includes(name))
      .sort((a, b) => a.title.length - b.title.length);
    target = exact || partial[0] || null;
  }
  if (!target) {
    throw Object.assign(
      new Error("thread not found (index " + index + ', name "' + name + '"); available: ' + threads.map((t) => t.title).join(" | ")),
      { code: "THREAD_NOT_FOUND" },
    );
  }

  const alreadyActive = target.el.getAttribute("aria-current") === "page";
  window.__apOpen = { title: target.title, index: threads.indexOf(target) };
  if (!alreadyActive) {
    for (const type of ["pointerdown", "mousedown", "pointerup", "mouseup", "click"]) {
      const Ctor = type.startsWith("pointer") ? PointerEvent : MouseEvent;
      target.el.dispatchEvent(new Ctor(type, { bubbles: true, cancelable: true, button: 0, buttons: 1 }));
    }
  }
  return { requested: target.title, index: window.__apOpen.index, alreadyActive };
})();
