(() => {
  // Fail loudly when Google rate-limits us with the /sorry/ captcha page,
  // instead of silently returning [] on an empty result DOM.
  if (
    document.querySelector("#captcha-form, #recaptcha") ||
    location.pathname.startsWith("/sorry/")
  ) {
    throw new Error(
      "Google Scholar captcha (sorry page): open this tab in Chrome, " +
        "solve the captcha once, then retry the command",
    );
  }

  const limit = Number("{{args.limit}}") || 10;
  const rows = document.querySelectorAll(".gs_r.gs_or.gs_scl, .gs_r");
  const out = [];
  rows.forEach((row) => {
    if (out.length >= limit) return;
    const titleEl = row.querySelector(".gs_rt");
    if (!titleEl) return;
    const linkEl = titleEl.querySelector("a");
    const url = linkEl ? linkEl.href : "";
    const title = linkEl
      ? linkEl.textContent.trim()
      : titleEl.textContent.replace(/^\[.*?\]\s*/g, "").trim();
    if (!title) return;

    const authors =
      row.querySelector(".gs_a")?.textContent?.replace(/\s+/g, " ")?.trim() ||
      "";
    const snippet =
      row.querySelector(".gs_rs")?.textContent?.replace(/\s+/g, " ")?.trim() ||
      "";

    const citedByEl = row.querySelector('.gs_fl a[href*="cites="]');
    const citedByUrl = citedByEl?.href || "";
    const citedMatch = citedByEl?.textContent?.match(/\d[\d,.]*/);
    const citedByCount = citedMatch
      ? parseInt(citedMatch[0].replace(/,/g, ""), 10)
      : 0;

    const pdfEl = row.querySelector(".gs_ggs a, .gs_or_ggsm a");
    const pdfUrl = pdfEl?.href || "";

    out.push({
      title,
      url,
      authors,
      snippet,
      cited_by_count: citedByCount,
      cited_by_url: citedByUrl,
      pdf_url: pdfUrl,
    });
  });
  return out;
})();
