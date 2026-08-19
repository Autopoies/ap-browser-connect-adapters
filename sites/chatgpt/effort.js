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
  const targetLevel = "{{args.level}}".toLowerCase().trim();

  const pillBtn =
    document.querySelector("button.__composer-pill") ||
    document.querySelector('button[data-testid="reasoning-effort-button"]') ||
    document.querySelector('button[data-testid="composer-thinking-pill"]') ||
    document.querySelector(
      'button[aria-label*="Thinking"], button[aria-label*="Effort"], button[aria-label*="思考"], button[aria-label*="推理"]',
    );

  if (!pillBtn) {
    return {
      effortIndex: targetIndex,
      effortLevel: targetLevel,
      selected: false,
      error: "pill button not found",
    };
  }

  triggerPointer(pillBtn);
  await new Promise((r) => setTimeout(r, 120));

  const getMenus = () =>
    Array.from(document.querySelectorAll('[role="menu"]')).filter(
      (m) => !m.closest("nav, aside, #stage-sidebar-tiny-bar"),
    );
  let menus = getMenus();
  const rootMenu = menus[0];

  if (!rootMenu) {
    return {
      effortIndex: targetIndex,
      effortLevel: targetLevel,
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
  const effortSubItem = rootItems.find((el) => {
    const t = (el.textContent || "").toLowerCase();
    return t.includes("effort") || t.includes("思考") || t.includes("推理");
  });

  if (effortSubItem) {
    triggerPointer(effortSubItem);
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
    return text.length > 0;
  });

  let targetOpt = null;
  if (targetIndex >= 0 && targetIndex < items.length) {
    targetOpt = items[targetIndex];
  } else if (targetLevel && targetLevel.length > 0) {
    // Pure dynamic matching against any effort level name or substring
    targetOpt = items.find((el) =>
      (el.textContent || "").toLowerCase().includes(targetLevel),
    );
  }

  if (targetOpt) {
    triggerPointer(targetOpt);
    await new Promise((r) => setTimeout(r, 80));
    dismiss();
    return {
      effortIndex: targetIndex,
      effortLevel: targetLevel,
      selected: true,
      text: (targetOpt.textContent || "").split("\n")[0].trim(),
    };
  }

  dismiss();
  return {
    effortIndex: targetIndex,
    effortLevel: targetLevel,
    selected: false,
    error: "target option not found in effort list",
    available: items.map((el) => (el.textContent || "").split("\n")[0].trim()),
  };
})();
