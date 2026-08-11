(() => {
  // 1. Locate composer effort pill
  const pillBtn = document.querySelector('button.__composer-pill') || document.querySelector('button[aria-label*="Effort"]') || document.querySelector('button[aria-label*="Thinking"]');
  const currentEffortText = pillBtn ? pillBtn.innerText.trim() : 'default';

  let effortsList = [];
  let modelsList = [];

  if (pillBtn) {
    pillBtn.click();

    const popover = Array.from(document.querySelectorAll('[id^="radix-"], [role="menu"], [role="listbox"], [data-state="open"]'))
      .find(p => p.innerText && (p.innerText.includes('高') || p.innerText.includes('中') || p.innerText.includes('GPT') || p.innerText.includes('Sol')));

    const targetEl = popover || document.body;
    const rawItems = Array.from(targetEl.querySelectorAll('*')).length > 0 ? Array.from(targetEl.querySelectorAll('*')) : [targetEl];

    const seen = new Set();
    for (const el of rawItems) {
      const text = (el.innerText || '').trim();
      if (text && text.length > 0 && text.length < 40 && !seen.has(text) && !text.includes('\n')) {
        seen.add(text);
        const isSel = el.getAttribute('aria-checked') === 'true' || el.innerText.includes('✓') || text === currentEffortText;
        if (text.includes('GPT') || text.includes('Sol') || text.includes('o3') || text.includes('4o')) {
          modelsList.push({ index: modelsList.length, name: text, selected: isSel });
        } else {
          effortsList.push({ index: effortsList.length, name: text, selected: isSel });
        }
      }
    }
  }

  // 2. Query Plus menu (modes)
  const plusBtn = document.querySelector('button[data-testid="composer-plus-btn"]');
  let modesList = [];
  if (plusBtn) {
    plusBtn.click();

    const plusPopover = Array.from(document.querySelectorAll('[id^="radix-"], [role="menu"], [role="listbox"], [data-state="open"]')).pop() || document.body;
    const rawPlus = Array.from(plusPopover.querySelectorAll('*'));

    const seenPlus = new Set();
    for (const el of rawPlus) {
      const text = (el.innerText || '').trim();
      if (text && text.length > 0 && text.length < 50 && !seenPlus.has(text) && !text.includes('\n')) {
        seenPlus.add(text);
        modesList.push({ index: modesList.length, name: text, selected: el.getAttribute('aria-checked') === 'true' });
      }
    }
  }

  // Dismiss open popovers
  document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));

  return {
    currentModel: modelsList.find(m => m.selected)?.name || (modelsList[0] ? modelsList[0].name : 'GPT-5.6 Sol'),
    currentEffort: currentEffortText,
    models: modelsList,
    efforts: effortsList,
    modes: modesList
  };
})()
