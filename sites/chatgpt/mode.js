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
  const targetMode = "{{args.mode}}".toLowerCase().trim();

  const plusBtn = document.querySelector(
    'button[data-testid="composer-plus-btn"], #composer-plus-btn, button[aria-label*="Add files"], button[aria-label*="添加文件"]',
  );
  if (!plusBtn) {
    return {
      modeIndex: targetIndex,
      modeName: targetMode,
      selected: false,
      error: "plus button not found",
    };
  }

  triggerPointer(plusBtn);
  await new Promise((r) => setTimeout(r, 120));

  const popovers = Array.from(
    document.querySelectorAll(
      '.popover, [data-radix-popper-content-wrapper], [role="menu"], [role="listbox"]',
    ),
  ).filter((p) => !p.closest("nav, aside, #stage-sidebar-tiny-bar"));
  if (popovers.length === 0) {
    return {
      modeIndex: targetIndex,
      modeName: targetMode,
      selected: false,
      error: "mode menu not opened",
    };
  }
  const container = popovers[0];

  const rawItems = Array.from(
    container.querySelectorAll(
      '.__menu-item, [role="menuitem"], [role="option"], button',
    ),
  );
  const menuItems = rawItems.filter((el) => {
    const text = (el.textContent || "").trim();
    return text.length > 0 && text.length < 100;
  });

  let targetItem = null;
  if (targetIndex >= 0 && targetIndex < menuItems.length) {
    targetItem = menuItems[targetIndex];
  } else if (targetMode && targetMode.length > 0) {
    // Pure dynamic substring matching against any tool/plugin/skill name or description
    targetItem = menuItems.find((el) =>
      (el.textContent || "").toLowerCase().includes(targetMode),
    );
  }

  if (targetItem) {
    triggerPointer(targetItem);
    await new Promise((r) => setTimeout(r, 80));
    dismiss();
    return {
      modeIndex: targetIndex,
      modeName: targetMode,
      selected: true,
      text: (targetItem.textContent || "").split("\n")[0].trim(),
    };
  }

  dismiss();
  return {
    modeIndex: targetIndex,
    modeName: targetMode,
    selected: false,
    error: "mode item not found",
    available: menuItems.map((el) =>
      (el.textContent || "").split("\n")[0].trim(),
    ),
  };
})();
