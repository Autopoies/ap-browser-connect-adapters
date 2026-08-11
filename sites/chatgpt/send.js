(() => {
  const promptText = `{{args.prompt}}`;
  const modeOpt = '{{args.mode}}'.toLowerCase();
  const effortOpt = '{{args.effort}}'.toLowerCase();

  // 1. If mode is specified, select mode first
  if (modeOpt) {
    const plusBtn = document.querySelector('button[data-testid="composer-plus-btn"]');
    if (plusBtn) {
      plusBtn.click();
      const menuItems = Array.from(document.querySelectorAll('[role="menuitem"], [role="option"], button, div'));
      let targetItem = null;
      if (modeOpt.includes('deep') || modeOpt.includes('深度')) {
        targetItem = menuItems.find(el => (el.innerText || '').includes('深度研究') || (el.innerText || '').includes('Deep Research'));
      } else if (modeOpt.includes('web') || modeOpt.includes('search') || modeOpt.includes('搜索')) {
        targetItem = menuItems.find(el => (el.innerText || '').includes('网页搜索') || (el.innerText || '').includes('Web Search'));
      } else if (modeOpt.includes('image') || modeOpt.includes('dall') || modeOpt.includes('图片')) {
        targetItem = menuItems.find(el => (el.innerText || '').includes('创建图片') || (el.innerText || '').includes('Create Image'));
      }
      if (targetItem) targetItem.click();
    }
  }

  // 2. If effort is specified, select effort
  if (effortOpt) {
    const pillBtn = document.querySelector('button.__composer-pill') || document.querySelector('button[aria-label*="Effort"]') || document.querySelector('button[aria-label*="Thinking"]');
    if (pillBtn) {
      pillBtn.click();
      const options = Array.from(document.querySelectorAll('[role="menuitem"], [role="option"], [role="menuitemradio"], button, div'));
      let targetOpt = null;
      if (effortOpt.includes('high') || effortOpt.includes('高')) {
        targetOpt = options.find(el => (el.innerText || '').trim() === '高' || (el.innerText || '').includes('High'));
      } else if (effortOpt.includes('med') || effortOpt.includes('中')) {
        targetOpt = options.find(el => (el.innerText || '').trim() === '中' || (el.innerText || '').includes('Medium'));
      } else if (effortOpt.includes('low') || effortOpt.includes('低')) {
        targetOpt = options.find(el => (el.innerText || '').trim() === '低' || (el.innerText || '').includes('Low'));
      }
      if (targetOpt) targetOpt.click();
    }
  }

  // 3. Focus and type prompt into input
  const textarea = document.querySelector('#prompt-textarea') || document.querySelector('textarea') || document.querySelector('div[contenteditable="true"]');
  if (!textarea) return { sent: false, error: 'textarea not found' };

  if (textarea.tagName === 'DIV') {
    textarea.focus();
    textarea.innerText = promptText;
    textarea.dispatchEvent(new Event('input', { bubbles: true }));
  } else {
    textarea.focus();
    textarea.value = promptText;
    textarea.dispatchEvent(new Event('input', { bubbles: true }));
  }

  // 4. Click send button
  setTimeout(() => {
    const sendBtn = document.querySelector('button[data-testid="send-button"]') || document.querySelector('button[aria-label="Send prompt"]') || document.querySelector('button.composer-submit-btn');
    if (sendBtn) {
      sendBtn.click();
    }
  }, 200);

  return { sent: true, promptLength: promptText.length, mode: modeOpt || 'default', effort: effortOpt || 'default' };
})()
