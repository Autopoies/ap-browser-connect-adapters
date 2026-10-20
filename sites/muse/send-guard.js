(async () => {
  // Refuses to send into a read-only channel (e.g. WhatsApp, "只能查看" notice).
  // Runs before anything is typed. Structural hook: the read-only notice testid.
  if (document.querySelector('[data-testid="hatch-channel-read-only-notice"]')) {
    throw Object.assign(
      new Error("current thread is a read-only channel (synced from WhatsApp); open a main or side chat with 'muse open' first"),
      { code: "THREAD_READ_ONLY" },
    );
  }
  return { readOnly: false };
})();
