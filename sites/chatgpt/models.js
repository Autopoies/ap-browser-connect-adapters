(async () => {
  function triggerPointer(el) {
    if (!el) return;
    el.dispatchEvent(
      new PointerEvent("pointerdown", {
        bubbles: true,
        cancelable: true,
        pointerType: "mouse",
        pointerId: 1,
        button: 0,
        buttons: 1,
      }),
    );
    el.dispatchEvent(
      new MouseEvent("mousedown", {
        bubbles: true,
        cancelable: true,
        button: 0,
        buttons: 1,
      }),
    );
    el.dispatchEvent(
      new PointerEvent("pointerup", {
        bubbles: true,
        cancelable: true,
        pointerType: "mouse",
        pointerId: 1,
        button: 0,
        buttons: 0,
      }),
    );
    el.dispatchEvent(
      new MouseEvent("mouseup", {
        bubbles: true,
        cancelable: true,
        button: 0,
        buttons: 0,
      }),
    );
    el.dispatchEvent(
      new MouseEvent("click", { bubbles: true, cancelable: true, button: 0 }),
    );
  }

  async function dismiss() {
    for (let i = 0; i < 3; i++) {
      document.dispatchEvent(
        new KeyboardEvent("keydown", {
          key: "Escape",
          code: "Escape",
          keyCode: 27,
          which: 27,
          bubbles: true,
        }),
      );
    }
    for (let i = 0; i < 10; i++) {
      const openMenus = Array.from(
        document.querySelectorAll('[role="menu"]'),
      ).filter((m) => !m.closest("nav, aside, #stage-sidebar-tiny-bar"));
      if (openMenus.length === 0) break;
      await new Promise((r) => setTimeout(r, 30));
    }
  }

  const pillBtn =
    document.querySelector("button.__composer-pill") ||
    document.querySelector('button[data-testid="model-switcher-dropdown"]') ||
    document.querySelector('button[data-testid="model-selector-button"]') ||
    document.querySelector('button[data-testid*="model"]') ||
    document.querySelector(
      'button[aria-label*="Thinking"], button[aria-label*="Effort"], button[aria-label*="思考"], button[aria-label*="推理"]',
    );

  let currentModel = "";
  let currentEffort = "";
  let modelsList = [];
  let effortsList = [];
  let presetsList = [];

  if (pillBtn) {
    triggerPointer(pillBtn);
    await new Promise((r) => setTimeout(r, 120));

    const getMenus = () =>
      Array.from(document.querySelectorAll('[role="menu"]')).filter(
        (m) => !m.closest("nav, aside, #stage-sidebar-tiny-bar"),
      );
    let menus = getMenus();
    const rootMenu = menus[0];

    if (rootMenu) {
      const rootItems = Array.from(
        rootMenu.querySelectorAll(
          '[role="menuitem"], [role="menuitemradio"], [role="option"]',
        ),
      );

      const modelSubItem = rootItems.find((el) => {
        const t = (el.textContent || "").toLowerCase();
        return t.includes("model") || t.includes("模型");
      });
      const effortSubItem = rootItems.find((el) => {
        const t = (el.textContent || "").toLowerCase();
        return t.includes("effort") || t.includes("思考") || t.includes("推理");
      });

      if (modelSubItem) {
        const textParts = (modelSubItem.textContent || "")
          .split("\n")
          .map((s) => s.trim())
          .filter(Boolean);
        if (textParts.length > 1) currentModel = textParts[1];

        triggerPointer(modelSubItem);
        await new Promise((r) => setTimeout(r, 120));

        menus = getMenus();
        const subMenu = menus.at(-1);
        if (subMenu && subMenu !== rootMenu) {
          const mItems = Array.from(
            subMenu.querySelectorAll(
              '[role="menuitem"], [role="menuitemradio"], [role="option"]',
            ),
          );
          modelsList = mItems
            .map((el, idx) => {
              const raw = (el.textContent || "").split("\n")[0].trim();
              const isSel =
                el.getAttribute("aria-checked") === "true" ||
                raw === currentModel;
              return { index: idx, name: raw, selected: isSel };
            })
            .filter(
              (m) =>
                m.name.length > 0 && !m.name.toLowerCase().includes("leaving"),
            );
        }
      }

      if (effortSubItem) {
        const textParts = (effortSubItem.textContent || "")
          .split("\n")
          .map((s) => s.trim())
          .filter(Boolean);
        if (textParts.length > 1) currentEffort = textParts[1];

        triggerPointer(effortSubItem);
        await new Promise((r) => setTimeout(r, 120));

        menus = getMenus();
        const subMenu = menus.at(-1);
        if (subMenu && subMenu !== rootMenu) {
          const eItems = Array.from(
            subMenu.querySelectorAll(
              '[role="menuitem"], [role="menuitemradio"], [role="option"]',
            ),
          );
          effortsList = eItems
            .map((el, idx) => {
              const raw = (el.textContent || "").split("\n")[0].trim();
              const isSel =
                el.getAttribute("aria-checked") === "true" ||
                raw === currentEffort;
              return { index: idx, name: raw, selected: isSel };
            })
            .filter((e) => e.name.length > 0);
        }
      }

      if (!modelSubItem && !effortSubItem) {
        // Flat model picker menu
        modelsList = rootItems
          .map((el, idx) => {
            const raw = (el.textContent || "").split("\n")[0].trim();
            const isSel =
              el.getAttribute("aria-checked") === "true" ||
              el.getAttribute("data-state") === "checked";
            return { index: idx, name: raw, selected: isSel };
          })
          .filter((m) => m.name.length > 0);
      }

      presetsList = rootItems
        .filter((el) => el !== modelSubItem && el !== effortSubItem)
        .map((el, idx) => ({
          index: idx,
          name: (el.textContent || "").trim().split("\n")[0],
        }))
        .filter((p) => p.name.length > 0);
    }
  }

  await dismiss();
  await new Promise((r) => setTimeout(r, 80));

  // Plus menu (tools / modes / plugins)
  const plusBtn = document.querySelector(
    'button[data-testid="composer-plus-btn"], #composer-plus-btn, button[aria-label*="Add files"], button[aria-label*="添加文件"]',
  );
  let modesList = [];
  if (plusBtn) {
    triggerPointer(plusBtn);
    await new Promise((r) => setTimeout(r, 120));

    const popovers = Array.from(
      document.querySelectorAll(
        '.popover, [data-radix-popper-content-wrapper], [role="menu"], [role="listbox"]',
      ),
    ).filter((p) => !p.closest("nav, aside, #stage-sidebar-tiny-bar"));

    if (popovers.length > 0) {
      const container = popovers[0];
      const rawItems = Array.from(
        container.querySelectorAll(
          '.__menu-item, [role="menuitem"], [role="option"], button',
        ),
      );
      modesList = rawItems
        .map((el, idx) => {
          const titleEl = el.querySelector(".truncate, span, div") || el;
          const title = (titleEl.textContent || "").trim();
          const fullText = (el.textContent || "").trim();
          const desc = fullText.startsWith(title)
            ? fullText.slice(title.length).trim()
            : "";
          const isSel =
            el.getAttribute("aria-checked") === "true" ||
            el.getAttribute("data-state") === "checked" ||
            el.classList.contains("active");
          return {
            index: idx,
            name: title || fullText,
            description: desc,
            selected: isSel,
          };
        })
        .filter((m) => m.name.length > 0 && m.name.length < 60);
    }
  }

  await dismiss();

  if (!currentModel && modelsList.length > 0) {
    currentModel =
      modelsList.find((m) => m.selected)?.name || modelsList[0].name;
  }
  if (!currentModel && pillBtn) {
    currentModel = pillBtn.textContent.trim();
  }
  if (!currentEffort && pillBtn) {
    currentEffort = pillBtn.textContent.trim();
  }

  return {
    currentModel: currentModel || "default",
    currentEffort: currentEffort || "default",
    models: modelsList,
    efforts: effortsList,
    presets: presetsList,
    modes: modesList,
  };
})();
