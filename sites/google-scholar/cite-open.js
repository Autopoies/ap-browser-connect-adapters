(() => {
  // From the search results page, navigate to the standalone cite page for
  // the first (best-match) result, constructed from its data-cid.
  const row = document.querySelector(".gs_r.gs_or.gs_scl, .gs_r");
  const cid = row?.getAttribute("data-cid") || "";
  // data-cid comes from page DOM (untrusted). Strict allowlist: Google's
  // cluster IDs are plain base64url-ish tokens; anything else fails closed.
  if (!/^[A-Za-z0-9_-]{6,64}$/.test(cid)) {
    throw new Error("no valid result row data-cid — search returned nothing?");
  }
  const title = row
    .querySelector(".gs_rt a")
    ?.textContent?.trim()
    ?.slice(0, 120);
  // Stash context for the next steps via window.name (survives navigation).
  window.name = JSON.stringify({ query: "{{args.query}}", cid, title });
  document.body.dataset.apbCite = "1";
  // Anchor click (repo convention) instead of location.href assignment.
  const a = document.createElement("a");
  a.href =
    "/scholar?q=info:" + cid + ":scholar.google.com/&output=cite&scirp=0&hl=en";
  a.click();
  return { cid, title };
})();
