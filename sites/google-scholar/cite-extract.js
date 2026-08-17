(() => {
  // On the standalone cite page: collect the formatted citation strings and
  // the export links, stash them in window.name, then follow the BibTeX link.
  if (
    document.querySelector("#captcha-form") ||
    location.pathname.startsWith("/sorry/")
  ) {
    throw new Error(
      "Google Scholar captcha (sorry page): open this tab in Chrome, " +
        "solve the captcha once, then retry the command",
    );
  }
  const citrs = [...document.querySelectorAll(".gs_citr")].map((d) =>
    d.textContent.trim().replace(/\s+/g, " "),
  );
  if (!citrs.length) {
    throw new Error("cite page rendered no citation formats");
  }
  const links = {};
  document.querySelectorAll("a.gs_citi").forEach((a) => {
    const h = a.href;
    if (h.includes("scholar.bib")) links.bibtex = h;
    else if (h.includes("scholar.enw")) links.endnote = h;
    else if (h.includes("scholar.ris")) links.refman = h;
    else if (h.includes("scholar.rfw")) links.refworks = h;
  });
  if (!links.bibtex) {
    throw new Error("no BibTeX export link on cite page");
  }
  let ctx = {};
  try {
    ctx = JSON.parse(window.name || "{}");
  } catch {
    /* fresh window.name — cite-open.js context lost */
  }
  window.name = JSON.stringify({ ...ctx, citrs, links });
  document.body.dataset.apbCite = "1";
  // Anchor click (repo convention) instead of location.href assignment.
  const a = document.createElement("a");
  a.href = links.bibtex;
  a.click();
  return { formats: citrs.length, hasBibtex: true };
})();
