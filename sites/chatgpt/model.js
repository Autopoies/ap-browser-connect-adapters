(() => {
  const rawIdx = '{{args.index}}';
  const targetIndex = (rawIdx !== '' && rawIdx !== 'null' && rawIdx !== 'undefined') ? parseInt(rawIdx, 10) : -1;
  const targetName = '{{args.name}}'.toLowerCase();

  const switcherBtn = document.querySelector('button[aria-haspopup]') ||
                      document.querySelector('button[aria-expanded]') ||
                      document.querySelector('button[data-testid*="model"]') ||
                      document.querySelector('button.__composer-pill');

  if (!switcherBtn) {
    return { modelIndex: targetIndex, modelName: targetName, selected: false, error: 'switcher button not found' };
  }

  switcherBtn.click();

  const popover = document.querySelector('[role="menu"], [role="listbox"], [data-state="open"]') || document.body;
  const items = Array.from(popover.querySelectorAll('[role="menuitem"], [role="menuitemradio"], [role="option"], button, div')).filter(el => {
    const text = (el.innerText || '').trim();
    return text.length > 0 && text.length < 50 && !el.children.length;
  });

  let targetItem = null;
  if (targetIndex >= 0 && targetIndex < items.length) {
    targetItem = items[targetIndex];
  } else if (targetName && targetName.length > 0) {
    targetItem = items.find(el => (el.innerText || '').toLowerCase().includes(targetName));
  }

  if (targetItem) {
    targetItem.click();
    return { modelIndex: targetIndex, modelName: targetName, selected: true, text: targetItem.innerText.trim() };
  }

  return { modelIndex: targetIndex, modelName: targetName, selected: false, error: 'target item not found in dynamic model list' };
})()
