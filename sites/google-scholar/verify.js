(() => {
  // Guard against the autocomplete dropdown hijacking submission: the landed
  // query must match what we asked for, or the results are for the wrong term.
  const want = "{{args.query}}".trim().replace(/\s+/g, " ");
  const got = (new URLSearchParams(location.search).get("q") || "")
    .trim()
    .replace(/\s+/g, " ");
  if (got !== want) {
    throw new Error(
      `query mismatch: wanted "${want}" but Scholar served "${got}" — retry`,
    );
  }
  return { q: got };
})();
