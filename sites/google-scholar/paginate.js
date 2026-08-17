(() => {
  const page = Number("{{args.page}}") || 1;
  if (page < 2) return { page: 1, clicked: false };
  // ponytail: single nav-link click supports pages 2-10; page > 10 needs
  // repeated "Next" navigations — add a loop only if anyone asks.
  if (page > 10) {
    throw new Error("pagination supports pages 1-10");
  }
  const link = [...document.querySelectorAll('a[href*="start="]')].find(
    (a) => a.textContent.trim() === String(page),
  );
  if (!link) {
    throw new Error(`page ${page} link not found on this results page`);
  }
  // Marker lives only in this document; `wait gone body[data-apb-nav]`
  // resolves once the navigation has replaced the DOM.
  document.body.dataset.apbNav = "1";
  link.click();
  return { page, clicked: true };
})();
