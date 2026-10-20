(async () => {
  // Aborts the send before anything is typed if a requested model was not selected.
  const st = window.__apGeminiSend || {};
  if (st.wantsModel && st.modelSelected !== true) {
    throw Object.assign(
      new Error("model not selected: " + (st.modelError || "menu did not open")),
      { code: "MODEL_NOT_SELECTED", available: st.available || [] },
    );
  }
  return { modelSelected: st.wantsModel ? true : null, model: st.modelName || st.model || "default" };
})();
