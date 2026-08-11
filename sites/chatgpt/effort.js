(() => {
  const rawIdx = '{{args.index}}';
  const targetIndex = (rawIdx !== '' && rawIdx !== 'null' && rawIdx !== 'undefined') ? parseInt(rawIdx, 10) : -1;
  const targetLevel = '{{args.level}}'.toLowerCase();

  const pillBtn = document.querySelector('button.__composer-pill') || document.querySelector('button[aria-label*="Effort"]') || document.querySelector('button[aria-label*="Thinking"]');
  if (!pillBtn) {
    return { effortIndex: targetIndex, effortLevel: targetLevel, selected: false, error: 'pill button not found' };
  }

  pillBtn.click();

  const popover = document.querySelector('[role="menu"], [role="listbox"], [data-state="open"]') || document.body;
  const options = Array.from(popover.querySelectorAll('[role="menuitem"], [role="menuitemradio"], [role="option"], button, div')).filter(el => {
    const text = (el.innerText || '').trim();
    return text.length > 0 && text.length < 30 && !el.children.length;
  });

  let targetOpt = null;
  if (targetIndex >= 0 && targetIndex < options.length) {
    targetOpt = options[targetIndex];
  } else if (targetLevel && targetLevel.length > 0) {
    targetOpt = options.find(el => (el.innerText || '').toLowerCase().includes(targetLevel));
  }

  if (targetOpt) {
    targetOpt.click();
    return { effortIndex: targetIndex, effortLevel: targetLevel, selected: true, text: targetOpt.innerText.trim() };
  }

  return { effortIndex: targetIndex, effortLevel: targetLevel, selected: false, currentPill: pillBtn.innerText.trim() };
})()
