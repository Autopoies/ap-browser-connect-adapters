(() => {
  const rawIdx = '{{args.index}}';
  const targetIndex = (rawIdx !== '' && rawIdx !== 'null' && rawIdx !== 'undefined') ? parseInt(rawIdx, 10) : -1;
  const targetMode = '{{args.mode}}'.toLowerCase();

  const plusBtn = document.querySelector('button[data-testid="composer-plus-btn"]');
  if (plusBtn) plusBtn.click();

  const popover = document.querySelector('[role="menu"], [role="listbox"], [data-state="open"]') || document.body;
  const menuItems = Array.from(popover.querySelectorAll('[role="menuitem"], [role="option"], button, div')).filter(el => {
    const text = (el.innerText || '').trim();
    return text.length > 0 && text.length < 50 && !el.children.length;
  });

  let targetItem = null;
  if (targetIndex >= 0 && targetIndex < menuItems.length) {
    targetItem = menuItems[targetIndex];
  } else if (targetMode && targetMode.length > 0) {
    targetItem = menuItems.find(el => (el.innerText || '').toLowerCase().includes(targetMode));
  }

  if (targetItem) {
    targetItem.click();
    return { modeIndex: targetIndex, modeName: targetMode, selected: true, text: targetItem.innerText.trim() };
  }

  return { modeIndex: targetIndex, modeName: targetMode, selected: false, error: 'mode item not found' };
})()
