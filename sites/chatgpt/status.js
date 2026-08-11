(() => {
  // Language-agnostic structural DOM detection (data-testid, attributes, elements)
  const stopBtn = document.querySelector('button[data-testid="stop-button"], button[aria-label*="Stop"]');
  const stopBtnFound = !!stopBtn;

  const streamingEl = document.querySelector('[data-is-streaming="true"], .result-streaming, .streaming');
  const isStreaming = !!streamingEl;

  const searchingEl = document.querySelector('[data-testid*="search"], [data-testid*="web-search"], [data-testid*="citation"], [data-testid*="source"]');
  const isSearching = !!searchingEl;

  const thinkingEl = document.querySelector('[data-testid*="thinking"], [data-testid*="reasoning"], [data-testid*="thought"], [data-testid*="writing-block"]');
  const hasActiveSpinner = !!document.querySelector('.animate-spin, .animate-pulse');
  const isThinking = !!thinkingEl || (stopBtnFound && !isStreaming && hasActiveSpinner);

  const isGenerating = stopBtnFound || isStreaming || isSearching || isThinking;

  let currentActivity = null;
  if (isSearching) {
    currentActivity = 'searching';
  } else if (isThinking) {
    currentActivity = 'thinking';
  } else if (isGenerating) {
    currentActivity = 'generating';
  }

  const markdowns = Array.from(document.querySelectorAll('.markdown, div.markdown, .prose'));
  const lastMarkdown = markdowns.length > 0 ? markdowns[markdowns.length - 1] : null;

  return {
    isGenerating,
    isSearching,
    isThinking,
    stopBtnFound,
    workedFor: null,
    currentActivity,
    lastResponseLength: lastMarkdown ? lastMarkdown.innerText.length : 0,
    markdownCount: markdowns.length
  };
})()
