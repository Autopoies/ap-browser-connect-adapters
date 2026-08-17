(() => {
  // On the plain-text BibTeX page: merge the entry with the formats/links
  // stashed in window.name by cite-extract.js, and return the full export.
  let ctx = { citrs: [], links: {} };
  try {
    ctx = JSON.parse(window.name || "{}");
  } catch {
    /* window.name cleared or never set */
  }
  window.name = "";
  const bibtex = document.body?.textContent?.trim() || "";
  if (!bibtex.startsWith("@")) {
    throw new Error(
      "BibTeX page did not return an entry — the signed link may have " +
        "expired; retry the command",
    );
  }
  return {
    query: ctx.query || "",
    title: ctx.title || "",
    formats: ctx.citrs || [],
    bibtex,
    bibtex_url: ctx.links?.bibtex || "",
    endnote_url: ctx.links?.endnote || "",
    refman_url: ctx.links?.refman || "",
    refworks_url: ctx.links?.refworks || "",
  };
})();
