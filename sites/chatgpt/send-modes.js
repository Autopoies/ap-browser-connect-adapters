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

  const modelOpt = "{{args.model}}".toLowerCase().trim();
  const modeOpt = "{{args.mode}}".toLowerCase().trim();
  const effortOpt = "{{args.effort}}".toLowerCase().trim();

  const getMenus = () =>
    Array.from(document.querySelectorAll('[role="menu"]')).filter(
      (m) => !m.closest("nav, aside, #stage-sidebar-tiny-bar"),
    );

  // 1. Model pre-selection (dynamic)
  if (modelOpt) {
    const switcherBtn =
      document.querySelector("button.__composer-pill") ||
      document.querySelector('button[data-testid="model-switcher-dropdown"]') ||
      document.querySelector('button[data-testid="model-selector-button"]') ||
      document.querySelector('button[data-testid*="model"]');
    if (switcherBtn) {
      triggerPointer(switcherBtn);
      await new Promise((r) => setTimeout(r, 120));

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

        let targetList = rootItems;
        if (modelSubItem) {
          triggerPointer(modelSubItem);
          await new Promise((r) => setTimeout(r, 120));
          menus = getMenus();
          const subMenu = menus.at(-1);
          if (subMenu && subMenu !== rootMenu) {
            targetList = Array.from(
              subMenu.querySelectorAll(
                '[role="menuitem"], [role="menuitemradio"], [role="option"]',
              ),
            );
          }
        }

        const match = targetList.find((el) =>
          (el.textContent || "").toLowerCase().includes(modelOpt),
        );
        if (match) {
          triggerPointer(match);
          await new Promise((r) => setTimeout(r, 80));
        }
      }
      dismiss();
      await new Promise((r) => setTimeout(r, 80));
    }
  }

  // 2. Mode pre-selection (dynamic: matches any tool/plugin/skill in Plus menu)
  if (modeOpt) {
    const plusBtn = document.querySelector(
      'button[data-testid="composer-plus-btn"], #composer-plus-btn, button[aria-label*="Add files"], button[aria-label*="添加文件"]',
    );
    if (plusBtn) {
      triggerPointer(plusBtn);
      await new Promise((r) => setTimeout(r, 120));

      const popovers = Array.from(
        document.querySelectorAll(
          '.popover, [data-radix-popper-content-wrapper], [role="menu"], [role="listbox"]',
        ),
      ).filter((p) => !p.closest("nav, aside, #stage-sidebar-tiny-bar"));

      if (popovers.length > 0) {
        const menuItems = Array.from(
          popovers[0].querySelectorAll(
            '.__menu-item, [role="menuitem"], [role="option"], button',
          ),
        );
        const targetItem = menuItems.find((el) =>
          (el.textContent || "").toLowerCase().includes(modeOpt),
        );
        if (targetItem) {
          triggerPointer(targetItem);
          await new Promise((r) => setTimeout(r, 80));
        }
      }
      dismiss();
      await new Promise((r) => setTimeout(r, 80));
    }
  }

  // 3. Effort pre-selection (dynamic: matches any effort level)
  if (effortOpt) {
    const pillBtn =
      document.querySelector("button.__composer-pill") ||
      document.querySelector('button[data-testid="reasoning-effort-button"]') ||
      document.querySelector('button[data-testid="composer-thinking-pill"]') ||
      document.querySelector(
        'button[aria-label*="Thinking"], button[aria-label*="Effort"], button[aria-label*="思考"], button[aria-label*="推理"]',
      );
    if (pillBtn) {
      triggerPointer(pillBtn);
      await new Promise((r) => setTimeout(r, 120));

      let menus = getMenus();
      const rootMenu = menus[0];
      if (rootMenu) {
        const rootItems = Array.from(
          rootMenu.querySelectorAll(
            '[role="menuitem"], [role="menuitemradio"], [role="option"]',
          ),
        );
        const effortSubItem = rootItems.find((el) => {
          const t = (el.textContent || "").toLowerCase();
          return (
            t.includes("effort") || t.includes("思考") || t.includes("推理")
          );
        });

        let targetList = rootItems;
        if (effortSubItem) {
          triggerPointer(effortSubItem);
          await new Promise((r) => setTimeout(r, 120));
          menus = getMenus();
          const subMenu = menus.at(-1);
          if (subMenu && subMenu !== rootMenu) {
            targetList = Array.from(
              subMenu.querySelectorAll(
                '[role="menuitem"], [role="menuitemradio"], [role="option"]',
              ),
            );
          }
        }

        const match = targetList.find((el) =>
          (el.textContent || "").toLowerCase().includes(effortOpt),
        );
        if (match) {
          triggerPointer(match);
          await new Promise((r) => setTimeout(r, 80));
        }
      }
      dismiss();
    }
  }

  return {
    prepared: true,
    model: modelOpt || "default",
    mode: modeOpt || "default",
    effort: effortOpt || "default",
  };
})();
