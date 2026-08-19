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

  function dismiss() {
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
  }

  const rawIdx = "{{args.index}}";
  const targetIndex =
    rawIdx !== "" && rawIdx !== "null" && rawIdx !== "undefined"
      ? parseInt(rawIdx, 10)
      : -1;
  const targetName = "{{args.name}}".toLowerCase();

  const switcherBtn =
    document.querySelector("button.__composer-pill") ||
    document.querySelector('button[data-testid="model-switcher-dropdown"]') ||
    document.querySelector('button[data-testid="model-selector-button"]') ||
    document.querySelector('button[data-testid*="model"]') ||
    document.querySelector(
      'button[aria-label*="Thinking"], button[aria-label*="Effort"]',
    );

  if (!switcherBtn) {
    return {
      modelIndex: targetIndex,
      modelName: targetName,
      selected: false,
      error: "switcher button not found",
    };
  }

  triggerPointer(switcherBtn);
  await new Promise((r) => setTimeout(r, 120));

  const getMenus = () =>
    Array.from(document.querySelectorAll('[role="menu"]')).filter(
      (m) => !m.closest("nav, aside, #stage-sidebar-tiny-bar"),
    );
  let menus = getMenus();
  const rootMenu = menus[0];

  if (!rootMenu) {
    return {
      modelIndex: targetIndex,
      modelName: targetName,
      selected: false,
      error: "menu not opened",
    };
  }

  let items = [];
  const rootItems = Array.from(
    rootMenu.querySelectorAll(
      '[role="menuitem"], [role="menuitemradio"], [role="option"]',
    ),
  );
  const modelSubItem = rootItems.find((el) => {
    const t = (el.textContent || "").toLowerCase();
    return t.includes("model") || t.includes("模型");
  });

  if (modelSubItem) {
    triggerPointer(modelSubItem);
    await new Promise((r) => setTimeout(r, 120));
    menus = getMenus();
    const subMenu = menus.at(-1);
    if (subMenu && subMenu !== rootMenu) {
      items = Array.from(
        subMenu.querySelectorAll(
          '[role="menuitem"], [role="menuitemradio"], [role="option"]',
        ),
      );
    }
  } else {
    items = rootItems;
  }

  items = items.filter((el) => {
    const text = (el.textContent || "").trim();
    return text.length > 0 && !text.toLowerCase().includes("leaving");
  });

  let targetItem = null;
  if (targetIndex >= 0 && targetIndex < items.length) {
    targetItem = items[targetIndex];
  } else if (targetName && targetName.length > 0) {
    targetItem = items.find((el) =>
      (el.textContent || "").toLowerCase().includes(targetName),
    );
  }

  if (targetItem) {
    triggerPointer(targetItem);
    await new Promise((r) => setTimeout(r, 80));
    dismiss();
    return {
      modelIndex: targetIndex,
      modelName: targetName,
      selected: true,
      text: (targetItem.textContent || "").split("\n")[0].trim(),
    };
  }

  dismiss();
  return {
    modelIndex: targetIndex,
    modelName: targetName,
    selected: false,
    error: "target item not found in model list",
    available: items.map((el) => (el.textContent || "").split("\n")[0].trim()),
  };
})();
