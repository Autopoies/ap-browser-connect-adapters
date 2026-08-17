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
  const name = document.querySelector("#gsc_prf_in")?.textContent?.trim() || "";
  if (!name) {
    throw new Error("profile not found — check the user id");
  }
  // Affiliation + email line(s); first .gsc_prf_il is affiliation.
  const affil =
    document
      .querySelector(".gsc_prf_il")
      ?.textContent?.replace(/\s+/g, " ")
      ?.trim() || "";
  const interests = [...document.querySelectorAll(".gsc_prf_inta")].map((a) =>
    a.textContent.trim(),
  );
  // Stats table rows: label | all | recent (recent may be missing).
  const stats = {};
  document.querySelectorAll("#gsc_rsb_st tr").forEach((tr) => {
    const label = tr.querySelector(".gsc_rsb_sc1")?.textContent?.trim();
    if (!label) return;
    const tds = tr.querySelectorAll("td");
    const num = (t) =>
      Number((t?.textContent || "").replace(/[^0-9]/g, "")) || 0;
    stats[label] = { all: num(tds[1]), since5y: num(tds[2]) };
  });
  const publications = [...document.querySelectorAll(".gsc_a_tr")].map(
    (tr) => ({
      title: tr.querySelector(".gsc_a_at")?.textContent?.trim() || "",
      url: tr.querySelector(".gsc_a_at")?.href || "",
      authors:
        tr
          .querySelector(".gs_gray")
          ?.textContent?.replace(/\s+/g, " ")
          ?.trim() || "",
      // trailing * marks "includes citations to merged profiles"
      cited_by:
        Number(
          (tr.querySelector(".gsc_a_c")?.textContent || "").replace(
            /[^0-9]/g,
            "",
          ),
        ) || 0,
      year: tr.querySelector(".gsc_a_y")?.textContent?.trim() || "",
    }),
  );
  return {
    user: new URLSearchParams(location.search).get("user") || "",
    name,
    affiliation: affil,
    interests,
    stats,
    publications,
  };
})();
