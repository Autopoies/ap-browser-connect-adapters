(() => {
  const ta = document.querySelector("textarea");
  return { hasText: !!ta && (ta.value || "").trim().length > 0 };
})();
