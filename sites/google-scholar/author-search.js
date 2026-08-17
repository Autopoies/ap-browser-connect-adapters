(() => {
  if (
    document.querySelector("#captcha-form") ||
    location.pathname.startsWith("/sorry/")
  ) {
    throw new Error(
      "Google Scholar captcha (sorry page): open this tab in Chrome, " +
        "solve the captcha once, then retry the command",
    );
  }
  const limit = Number("{{args.limit}}") || 10;
  const rows = document.querySelectorAll(".gsc_1usr");
  if (!rows.length) {
    // Zero results page still renders the authors container — return [].
    return [];
  }
  const out = [];
  rows.forEach((row) => {
    if (out.length >= limit) return;
    const link = row.querySelector(".gs_ai_name a, h3 a");
    const href = link?.getAttribute("href") || "";
    const user = href.match(/user=([A-Za-z0-9_-]+)/)?.[1] || "";
    if (!user) return;
    out.push({
      user_id: user,
      name: link?.textContent?.trim() || "",
      affiliation:
        row
          .querySelector(".gs_ai_aff")
          ?.textContent?.replace(/\s+/g, " ")
          ?.trim() || "",
      email_domain:
        row
          .querySelector(".gs_ai_eml")
          ?.textContent?.replace(/\s+/g, " ")
          ?.trim() || "",
      url: link ? new URL(href, location.origin).href : "",
    });
  });
  return out;
})();
